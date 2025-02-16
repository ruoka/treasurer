import { general_ledger } from "./general_ledger.js";

// Re-export the imported object
export { general_ledger };

export const journal = [];

export const ledger = [];

export const balances = new Map();

export const account = () => {

    const sum = (account) => {
        return ledger.filter(entry => entry.account.startsWith(account))
            .reduce((amount, entry) => {
                let multiplier = 1; // Default to addition
                if (account.startsWith("1")) {
                    // If account starts with "1", subtract for credit, add for debit
                    multiplier = "credit".localeCompare(entry.entry) ? 1 : -1;
                } else {
                    // If account does not start with "1", add for credit, subtract for debit
                    multiplier = "credit".localeCompare(entry.entry) ? -1 : 1;
                }
                return amount + (multiplier * entry.amount);
            }, 0);
    };

    ledger.length = 0;
    journal.forEach(transaction => ledger.push(...transaction.entries));
    ledger.sort((lhs, rhs) => lhs.account.localeCompare(rhs.account) ? lhs.account.localeCompare(rhs.account) : (lhs.number > rhs.number));
    // Calculate sub balances

    general_ledger.balance_sheet.forEach(ledger => balances.set(ledger.account, sum(ledger.account.replace(/\.?0+$/, ''))));
    general_ledger.income_statement.forEach(ledger => balances.set(ledger.account, sum(ledger.account.replace(/\.?0+$/, ''))));
    // Calculate summary balances
    balances.set('2000', sum('2') + sum('3') + sum('4') + sum('5') + sum('9'));
    balances.set('2130', sum('3') + sum('4') + sum('5') + sum('9999'));
    balances.set('3300', balances.get('3100') + balances.get('3200'));
    balances.set('4300', balances.get('4100') + balances.get('4200'));
    balances.set('5300', balances.get('5100') + balances.get('5200'));
    balances.set('6000', balances.get('3300') + balances.get('4300') + balances.get('5300'));
    balances.set('8000', balances.get('6000') + balances.get('9999'));
}
