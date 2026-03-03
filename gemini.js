/**
 * Treasurer (Rahuri) - Google Gemini API integration for account mapping suggestions
 *
 * Copyright (c) 2025 Kaius Ruokonen
 * Licensed under dual license: GPL-3.0 for non-profits, commercial license for others.
 * See LICENSE file for details.
 */

const STORAGE_KEY = 'rahuri_gemini_api_key';
// gemini-2.5-flash: stable, production-grade, good for structured JSON output
const MODEL = 'gemini-2.5-flash';
const API_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const getApiKey = () => localStorage.getItem(STORAGE_KEY) || '';

export const setApiKey = (key) => {
  if (key) localStorage.setItem(STORAGE_KEY, key);
  else localStorage.removeItem(STORAGE_KEY);
};

/**
 * Suggest account mapping for a bank transaction using Gemini.
 * @param {string} note - Transaction description
 * @param {number} amount - Amount in EUR (positive = inflow, negative = outflow)
 * @param {string} date - Date string
 * @returns {Promise<{account: string, label: string}>}
 */
export const suggestAccount = async (note, amount, date) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Gemini API-avain puuttuu. Lisää se Asetukset-valikosta.');

  const direction = amount >= 0 ? 'inflow (panot)' : 'outflow (otot)';
  const prompt = `You are a Finnish accounting assistant for non-profit organizations (aatteelliset yhteisöt).
Given this bank transaction:
- Description: "${(note || '').slice(0, 500)}"
- Amount: ${amount.toFixed(2)} € (${direction})
- Date: ${date}

Suggest the appropriate Finnish accounting account code (4 digits) for the contra-entry (the non-bank side).
Use the Finnish non-profit chart of accounts:
- 1xxx: Assets (Vastaavaa)
- 2xxx: Liabilities, Equity (Vastattavaa)
- 3xxx: Income (Tuotot) - e.g. 3100, 3200, 4100, 4200
- 5xxx: Expenses (Kulut) - e.g. 5100, 5200

Common accounts: 3100 (tuotot), 3200 (tuotot), 4100 (lahjoitukset), 4200 (jäsenmaksut), 5100 (kulut), 5200 (kulut), 5200 (palvelumaksut).

CRITICAL: Your response must be ONLY this exact JSON format, nothing else - no preamble, no "Here is", no explanation:
{"account":"XXXX","label":"Finnish label"}

Example: {"account":"5200","label":"Kulut, sijoitus- ja rahoitustoiminta"}`;

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
