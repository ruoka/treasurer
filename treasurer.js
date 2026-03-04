/**
 * Treasurer (Rahuri) - Double-entry bookkeeping application
 * 
 * Copyright (c) 2025 Kaius Ruokonen
 * Licensed under dual license: GPL-3.0 for non-profits, commercial license for others.
 * See LICENSE file for details.
 */

import { general_ledger } from "./general_ledger.js";

// Re-export the imported object
export { general_ledger };

export const journal = [];

export const ledger = [];

export const balances = new Map();
export let comparisonSnapshot = null;

export const setComparisonSnapshot = (snapshot) => {
    comparisonSnapshot = snapshot || null;
};

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
    // Sort by account number (9999 first for easier allocation), then by transaction number
    ledger.sort((lhs, rhs) => {
        if (lhs.account === '9999' && rhs.account !== '9999') return -1;
        if (lhs.account !== '9999' && rhs.account === '9999') return 1;
        return lhs.account.localeCompare(rhs.account) ? lhs.account.localeCompare(rhs.account) : (lhs.number > rhs.number);
    });
    
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

/**
 * Create opening entries (avauskirjaus) for a new year based on current balance sheet balances.
 * This function creates journal entries that transfer ending balances from the previous year
 * to opening balances for the new year.
 * 
 * @param {string} newYearDate - The date for the new year (format: YYYY-MM-DD, typically YYYY-01-01)
 * @param {string} reference - Reference for the opening entry transaction (e.g., "Avaus 2025")
 * @returns {Object} The created opening entry transaction
 */
export const createOpeningEntries = (newYearDate, reference = null) => {
    // First, ensure balances are up to date
    account();
    
    // Get the next transaction number
    const currentMax = journal.map(t => parseInt(t.header.number, 10) || 0).reduce((n1, n2) => Math.max(n1, n2), 0);
    const transactionNumber = currentMax + 1;
    
    // Generate reference if not provided
    const year = newYearDate.substring(0, 4);
    const entryReference = reference || `Avaus ${year}`;
    const previousYear = String((parseInt(year, 10) || new Date().getFullYear()) - 1);
    comparisonSnapshot = {
        year: previousYear,
        balances: Object.fromEntries(balances)
    };
    
    const entries = [];
    let totalDebits = 0;
    let totalCredits = 0;
    
    // Get all balance sheet accounts with non-zero balances
    general_ledger.balance_sheet.forEach(accountDef => {
        const accountNumber = accountDef.account;
        const balance = balances.get(accountNumber) || 0;
        
        // Skip accounts with zero balance or non-open accounts (summary accounts)
        if (Math.abs(balance) < 0.01 || !accountDef.open) {
            return;
        }
        
        // Get account label
        const accountLabel = accountDef.code_prelabel_fi || accountNumber;
        
        if (accountNumber.startsWith("1")) {
            // Asset accounts: positive balance = debit, negative balance = credit
            if (balance > 0) {
                entries.push({
                    entry: "debit",
                    date: newYearDate,
                    account: accountNumber,
                    label: accountLabel,
                    amount: balance,
                    number: transactionNumber,
                    reference: entryReference,
                    note: `Avauskirjaus vuodelle ${year}`
                });
                totalDebits += balance;
            } else if (balance < 0) {
                entries.push({
                    entry: "credit",
                    date: newYearDate,
                    account: accountNumber,
                    label: accountLabel,
                    amount: Math.abs(balance),
                    number: transactionNumber,
                    reference: entryReference,
                    note: `Avauskirjaus vuodelle ${year}`
                });
                totalCredits += Math.abs(balance);
            }
        } else {
            // Liability/Equity accounts (2xxx): positive balance = credit, negative balance = debit
            if (balance > 0) {
                entries.push({
                    entry: "credit",
                    date: newYearDate,
                    account: accountNumber,
                    label: accountLabel,
                    amount: balance,
                    number: transactionNumber,
                    reference: entryReference,
                    note: `Avauskirjaus vuodelle ${year}`
                });
                totalCredits += balance;
            } else if (balance < 0) {
                entries.push({
                    entry: "debit",
                    date: newYearDate,
                    account: accountNumber,
                    label: accountLabel,
                    amount: Math.abs(balance),
                    number: transactionNumber,
                    reference: entryReference,
                    note: `Avauskirjaus vuodelle ${year}`
                });
                totalDebits += Math.abs(balance);
            }
        }
    });
    
    // Calculate the difference (should go to retained earnings/opening balance account)
    const difference = totalDebits - totalCredits;
    
    if (Math.abs(difference) > 0.01) {
        // Use account 2120 (Edellisten tilikausien ylijäämä/alijäämä) for the balancing entry
        const balancingAccount = "2120";
        const balancingLabel = "Edellisten tilikausien ylijäämä (alijäämä)";
        
        if (difference > 0) {
            // Debits exceed credits, so credit the balancing account
            entries.push({
                entry: "credit",
                date: newYearDate,
                account: balancingAccount,
                label: balancingLabel,
                amount: difference,
                number: transactionNumber,
                reference: entryReference,
                note: `Avauskirjaus vuodelle ${year} - tasaus`
            });
            totalCredits += difference;
        } else {
            // Credits exceed debits, so debit the balancing account
            entries.push({
                entry: "debit",
                date: newYearDate,
                account: balancingAccount,
                label: balancingLabel,
                amount: Math.abs(difference),
                number: transactionNumber,
                reference: entryReference,
                note: `Avauskirjaus vuodelle ${year} - tasaus`
            });
            totalDebits += Math.abs(difference);
        }
    }
    
    // Create the transaction
    const transaction = {
        header: {
            number: 1, // Start from 1 for the new year
            created: newYearDate,
            reference: entryReference,
            note: `Avauskirjaus vuodelle ${year}`
        },
        entries: entries
    };
    
    // Clear existing journal and add only the opening entry
    journal.length = 0;
    journal.push(transaction);
    
    return transaction;
}
