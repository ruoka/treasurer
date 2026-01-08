# Treasurer (Rahuri)

A web-based double-entry bookkeeping application for managing financial transactions and generating accounting reports. The application provides a complete accounting system with journal entries, general ledger, balance sheet, and income statement reporting.

## Purpose

Treasurer is designed for **non-profit general-purpose organizations** (aatteelliset yhteisöt) in Finland, such as registered associations (rekisteröity yhdistys) and foundations (säätiö). The application helps these organizations manage their financial records using standard double-entry bookkeeping principles. It supports:

- **Journal Entry Management**: Create, edit, and manage financial transactions with proper credit/debit balancing
- **General Ledger**: Track all account transactions with running balances
- **Financial Reporting**: Generate balance sheets (TASE) and income statements (Tuloslaskelma) based on Finnish accounting standards
- **Bank Statement Import**: Import transactions from Nordea bank statements (.nda format) to automatically create journal entries
- **Data Persistence**: Save and load journal data in JSON format

The application follows Finnish accounting standards and uses the official Finnish chart of accounts structure for proper financial reporting.

## Features

- Double-entry bookkeeping with automatic balance validation
- Multiple account categories (Assets, Liabilities, Equity, Income, Expenses)
- Transaction filtering and search capabilities
- Bank statement import from Nordea
- Real-time balance calculations
- Export/import functionality for data backup

## Running the Application

### Quick Start

The easiest way to start the application is using the provided script:

```bash
./start.sh
```

This script automatically opens Google Chrome with the required file access permissions and loads `ux.html`.

### Manual Start

Alternatively, you can manually open the application:

```bash
open -a Google\ Chrome --args  --allow-file-access-from-files
```

Then open `ux.html` in the browser to start using the application.

## License

This software is available under a dual licensing model:

- **GPL-3.0 for Non-Profit Organizations**: Non-profit organizations (registered associations, foundations, and other recognized non-profit entities) may use, modify, and distribute this software under the terms of the GNU General Public License version 3.

- **Commercial License**: For-profit organizations and commercial entities must obtain a commercial license. For commercial licensing inquiries, please contact via [GitHub issues](https://github.com/ruoka/treasurer/issues).

See the [LICENSE](LICENSE) file for full details.

## Appendix: Accounting Standards and References

The application uses the official Finnish accounting standards and code lists. The account structure and naming conventions are based on the following official sources:

### Legal Framework
- **[Finnish Accounting Act (2015/1753)](https://www.finlex.fi/fi/laki/alkup/2015/20151753)**: The legal basis for Finnish accounting standards. This regulation includes specific provisions for small and micro enterprises, including the income statement format for ideological associations and foundations (aatteellinen yhteisö ja säätiö) as specified in Liite IV.
  - **[PDF Download (20151753.pdf)](https://www.finlex.fi/fi/laki/alkup/2015/20151753.pdf)**: Direct link to the PDF version of the regulation

### Code Lists (Koodistot)
The account names, codes, and structure are defined in the official Finnish code lists maintained by the Finnish Tax Administration. These code schemes are specifically designed for non-profit organizations:

- **[MC-2024-1 Code Scheme](https://koodistot.suomi.fi/codescheme;registryCode=sbr-fi-code-lists;schemeCode=MC-2024-1)**: Main code scheme for accounting classification
- **[MC67 Extension](https://koodistot.suomi.fi/extension;registryCode=sbr-fi-code-lists;schemeCode=MC-2024-1;extensionCode=MC67)**: Extension for balance sheet accounts (TASE) for non-profit organizations
- **[MC66 Extension](https://koodistot.suomi.fi/extension;registryCode=sbr-fi-code-lists;schemeCode=MC-2024-1;extensionCode=MC66)**: Extension for income statement accounts (Tuloslaskelma) for non-profit organizations, following the format specified in the Finnish Accounting Act (2015/1753) Liite IV for ideological associations and foundations

### Usage
These code lists define:
- Account numbers (e.g., 1000, 2000, 3100)
- Account names in Finnish (e.g., "Vastaavaa", "Vastattavaa", "Tuotot")
- Account hierarchy and relationships
- Proper classification for financial reporting

The `general_ledger.js` file contains the account structure based on these official standards, ensuring compliance with Finnish accounting regulations for balance sheets and income statements.
