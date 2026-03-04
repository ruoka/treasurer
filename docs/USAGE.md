# Rahuri Usage Guide

This guide explains the daily workflow in Rahuri and the main advanced features.

## 0) Browser and Launch Requirements

For local-file use (`ux.html` via `file://`), use **Google Chrome** and start it with:

`--allow-file-access-from-files`

Examples:

- macOS: `./start.sh`
- Windows PowerShell: `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files "C:\path\to\ux.html"`
- Linux: `google-chrome --allow-file-access-from-files "/path/to/ux.html"`

## 1) Typical Workflow

1. Open existing data (`Avaa`) or import Nordea statement (`Lataa Nordean tiliote`).
2. Review unmapped entries (`9999 Kirjaamattomat`) in `Päiväkirja`.
3. Use `Ehdota tilejä (AI)` to propose contra accounts.
4. Confirm proposals (`Vahvista`) or edit manually.
5. Ensure account `9999` is empty.
6. Generate reports (`TASE & Tuloslaskelma` tab or `Tilinpäätös (popup)`).
7. Save (`Tallenna`) to JSON.

## 2) Data File Format

Rahuri supports two JSON formats when opening files:

- Legacy: array of journal transactions
- Current: object with
  - `journal`: transaction array
  - `comparisonSnapshot`: previous-year balances for financial statement comparison

When saving, Rahuri writes the current format (`journal` + `comparisonSnapshot`).

## 3) AI Account Mapping

### API key and prompt

- Open `Asetukset` to set your Gemini API key (stored in browser localStorage).
- Open `AI-ohje` to edit the mapping prompt template.
- Prompt placeholders:
  - `{{CONTEXT}}`
  - `{{DESCRIPTION}}`
  - `{{AMOUNT}}`
  - `{{DIRECTION}}`
  - `{{DATE}}`

### Mapping status

- `Kirjaamatta` = still contains `9999`
- `Ehdotettu` = AI proposed account
- `Vahvistettu` = confirmed mapping

### Notes

- Progress dialog is non-blocking and can be stopped with `Lopeta`.
- Prompt text persists in localStorage; refresh does not reset it.

## 4) Opening Year (`Uusi vuosi - Avauskirjaus`)

This action:

- Rebuilds opening entry from current balance sheet balances
- Replaces journal with the opening entry transaction
- Stores previous-year balance snapshot automatically for later comparison in the financial statement popup

## 5) Financial Statement Popup (`Tilinpäätös (popup)`)

The popup creates a printable HTML statement with:

- Income statement (`Tuloslaskelma`)
- Balance sheet (`Tase`)
- Columns for current year and previous year (from `comparisonSnapshot`)

### Validation rule

The popup is blocked unless control account `9999 Kirjaamattomat` is empty:

- `9999` balance must be zero
- no transactions may contain account `9999`

## 6) Screenshots

- Main UI: `docs/rahuri-screenshot.png`
- Tase-focused screenshot: `docs/rahuri-tase-screenshot.png`

