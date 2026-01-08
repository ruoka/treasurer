import { general_ledger } from "./general_ledger.js";

// Re-export the imported object
export { general_ledger };

export const journal = [];

export const ledger = [];

export const balances = new Map();

/**
 * Calculate account balances and update the ledger.
 * This function processes all journal entries and calculates balances for each account
 * according to Finnish accounting standards:
 * - Accounts starting with "1" (Assets): Debit increases, Credit decreases
 * - Other accounts (Liabilities, Equity, Income, Expenses): Credit increases, Debit decreases
 */
export const account = () => {

    /**
     * Calculate the sum for an account or account group.
     * @param {string} account - Account number or prefix (e.g., "1240" or "1" for all asset accounts)
     * @returns {number} The calculated balance for the account
     */
    const sum = (account) => {
        return ledger.filter(entry => entry.account.startsWith(account))
            .reduce((amount, entry) => {
                let multiplier = 1; // Default to addition
                if (account.startsWith("1")) {
                    // Asset accounts (1xxx): Debit increases (+), Credit decreases (-)
                    multiplier = "credit".localeCompare(entry.entry) ? 1 : -1;
                } else {
                    // Liability, Equity, Income, Expense accounts: Credit increases (+), Debit decreases (-)
                    multiplier = "credit".localeCompare(entry.entry) ? -1 : 1;
                }
                return amount + (multiplier * entry.amount);
            }, 0);
    };

    // Rebuild ledger from journal entries
    ledger.length = 0;
    journal.forEach(transaction => ledger.push(...transaction.entries));
    // Sort by account number, then by transaction number
    ledger.sort((lhs, rhs) => lhs.account.localeCompare(rhs.account) ? lhs.account.localeCompare(rhs.account) : (lhs.number > rhs.number));
    
    // Calculate balances for individual accounts in balance sheet and income statement
    general_ledger.balance_sheet.forEach(ledger => balances.set(ledger.account, sum(ledger.account.replace(/\.?0+$/, ''))));
    general_ledger.income_statement.forEach(ledger => balances.set(ledger.account, sum(ledger.account.replace(/\.?0+$/, ''))));
    
    // Calculate summary balances (aggregated accounts)
    balances.set('2000', sum('2') + sum('3') + sum('4') + sum('5') + sum('9')); // Total Liabilities
    balances.set('2130', sum('3') + sum('4') + sum('5') + sum('9999')); // Surplus/Deficit for financial year
    balances.set('3300', balances.get('3100') + balances.get('3200')); // Operating result
    balances.set('4300', balances.get('4100') + balances.get('4200')); // Fundraising result
    balances.set('5300', balances.get('5100') + balances.get('5200')); // Investment and financing result
    balances.set('6000', balances.get('3300') + balances.get('4300') + balances.get('5300')); // Results for financial year
    balances.set('8000', balances.get('6000') + balances.get('9999')); // Surplus/Deficit for financial year (final)
}
