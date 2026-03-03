/**
 * Treasurer (Rahuri) - Google Gemini API integration for account mapping suggestions
 *
 * Copyright (c) 2025 Kaius Ruokonen
 * Licensed under dual license: GPL-3.0 for non-profits, commercial license for others.
 * See LICENSE file for details.
 */

const STORAGE_KEY = 'rahuri_gemini_api_key';
const PROMPT_STORAGE_KEY = 'rahuri_gemini_prompt';
// gemini-2.5-flash: stable, production-grade, good for structured JSON output
const MODEL = 'gemini-2.5-flash';
const API_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const getApiKey = () => localStorage.getItem(STORAGE_KEY) || '';

export const setApiKey = (key) => {
  if (key) localStorage.setItem(STORAGE_KEY, key);
  else localStorage.removeItem(STORAGE_KEY);
};

export const getPrompt = () => localStorage.getItem(PROMPT_STORAGE_KEY) || '';

export const setPrompt = (text) => {
  if (text && text.trim()) localStorage.setItem(PROMPT_STORAGE_KEY, text.trim());
  else localStorage.removeItem(PROMPT_STORAGE_KEY);
};

const DEFAULT_PROMPT_TEMPLATE = `You are a Finnish accounting assistant for non-profit organizations (aatteelliset yhteisöt).
Map bank transactions to the contra-entry account (the non-bank side). Bank account is always 1240.
{{CONTEXT}}

Finnish non-profit chart of accounts (4-digit codes):
- 1xxx Assets: 1120 Sijoitukset, 1211 Valmiit tuotteet, 1212 Muu vaihto-omaisuus, 1231 Lyhytaikaiset saamiset, 1240 Rahat ja pankkisaamiset
- 2xxx Liabilities/Equity: 2111 Sijoitetun vapaan oman pääoman rahasto, 2112 Yhtiöjärjestyksen rahastot, 2120 Edellisten tilikausien ylijäämä, 2212 Lyhytaikaiset saadut ennakot
- 3xxx/4xxx Income: 3100 Tuotot varsinainen toiminta, 3210 Lahjoitukset, 4110 Jäsenmaksut, 4120 Astemaksut, 4130 Ropo-keräys, 4140 Juhla-keräys, 5100 Tuotot sijoitus- ja rahoitustoiminta
- 3xxx/4xxx/5xxx Expenses: 3200 Kulut varsinainen toiminta, 4200 Kulut varainhankinta, 5200 Kulut sijoitus- ja rahoitustoiminta

Nordea transaction types: 1705/1710 Viitemaksu (reference payment), 1710 Mobiilimaksu (MobilePay), 1710 Pano (deposit), 2720 Itsepalvelu/Oma siirto (self-service), 2730 Palvelumaksu (bank fee).

MobilePay (Mobiilimaksu, VIPPS MOBILEPAY AS): When the reference contains a leskenropo/ropo-keräys collection code (e.g. starts with 2000490990010...), book as 4130 Ropo-keräys (leskenropo). For 1710 Pano with message "Ropo" or "Ropo [kuukausi]", use 4130. Otherwise use 3100 or 4110 based on the message.

Separating Tuotot (3100) vs Jäsenmaksut (4110):
- 4110 Jäsenmaksut: when amount is 210 € or 220 € (membership fee), or when the message clearly indicates membership (e.g. "jäsenmaksu", "asteenmaksu", "2025 jasenmaksu").
- 3100 Tuotot varsinainen toiminta: general operating income, sales, services, event fees, donations; use when amount is not 210/220 € and no membership context.

Transaction to map:
- Description: "{{DESCRIPTION}}"
- Amount: {{AMOUNT}} € ({{DIRECTION}})
- Date: {{DATE}}

Return ONLY valid JSON, no other text:
{"account":"XXXX","label":"Finnish label"}

Example: {"account":"5200","label":"Kulut, sijoitus- ja rahoitustoiminta"}`;

export const getDefaultPrompt = () => DEFAULT_PROMPT_TEMPLATE;

/**
 * Suggest account mapping for a bank transaction using Gemini.
 * @param {string} note - Transaction description
 * @param {number} amount - Amount in EUR (positive = inflow, negative = outflow)
 * @param {string} date - Date string
 * @param {{ usedAccounts?: Array<{account:string,label:string}>, exampleMappings?: Array<{notePrefix:string,account:string,label:string}> }} [context] - Optional: accounts in use and example mappings from this org's journal
 * @returns {Promise<{account: string, label: string}>}
 */
export const suggestAccount = async (note, amount, date, context = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Gemini API-avain puuttuu. Lisää se Asetukset-valikosta.');

  const direction = amount >= 0 ? 'inflow (panot)' : 'outflow (otot)';
  const usedAccounts = context.usedAccounts || [];
  const exampleMappings = context.exampleMappings || [];

  let contextBlock = '';
  if (usedAccounts.length > 0) {
    contextBlock += `\nAccounts this organization uses (from opening entry and journal):\n${usedAccounts.map(a => `- ${a.account}: ${a.label}`).join('\n')}`;
  }
  if (exampleMappings.length > 0) {
    contextBlock += `\n\nExample mappings from this organization's completed transactions:\n${exampleMappings.map(e => `- "${e.notePrefix}" → ${e.account} (${e.label})`).join('\n')}`;
    contextBlock += '\n\nPrefer these accounts and patterns when the transaction type matches.';
  }

  const template = getPrompt() || DEFAULT_PROMPT_TEMPLATE;
  const prompt = template
    .replace(/\{\{CONTEXT\}\}/g, contextBlock)
    .replace(/\{\{DESCRIPTION\}\}/g, (note || '').slice(0, 500).replace(/"/g, '\\"'))
    .replace(/\{\{AMOUNT\}\}/g, amount.toFixed(2))
    .replace(/\{\{DIRECTION\}\}/g, direction)
    .replace(/\{\{DATE\}\}/g, date);

  const response = await fetch(`${API_BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const text = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim();
  if (!text) throw new Error('Tyhjä vastaus API:lta');

  // Strip markdown code blocks and surrounding backticks
  let raw = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/g, '').trim();

  // Find JSON object: from first { to matching }
  let jsonStr = '';
  const firstBrace = raw.indexOf('{');
  if (firstBrace >= 0) {
    let depth = 0, inString = false, escape = false, end = -1;
    for (let i = firstBrace; i < raw.length; i++) {
      const c = raw[i];
      if (escape) { escape = false; continue; }
      if (c === '\\' && inString) { escape = true; continue; }
      if (inString) {
        if (c === '"') inString = false;
        continue;
      }
      if (c === '"') { inString = true; continue; }
      if (c === '{') depth++;
      if (c === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    jsonStr = end >= 0 ? raw.slice(firstBrace, end + 1) : raw.slice(firstBrace);
  } else {
    jsonStr = raw;
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    // Fallback: regex extraction for preamble or truncated JSON (e.g. {"account":"42...)
    const accountMatch = raw.match(/"account"\s*:\s*"(\d{3,5})"/)
      || raw.match(/"account"\s*:\s*"(\d{2,4})/);  // truncated: no closing quote
    const labelMatch = raw.match(/"label"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (accountMatch) {
      parsed = { account: accountMatch[1], label: (labelMatch?.[1] || 'Kirjaamattomat').replace(/\\"/g, '"') };
    } else {
      throw new Error('Virheellinen vastaus. API vastasi: ' + text);
    }
  }

  const account = String(parsed.account || '9999').padStart(4, '0').slice(0, 4);
  const label = String(parsed.label || 'Kirjaamattomat').slice(0, 100);
  return { account, label };
};
