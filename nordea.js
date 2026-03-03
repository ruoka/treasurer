/**
 * Treasurer (Rahuri) - Nordea Bank Statement Parser
 * 
 * Copyright (c) 2025 Kaius Ruokonen
 * Licensed under dual license: GPL-3.0 for non-profits, commercial license for others.
 * See LICENSE file for details.
 */

import { journal } from "./treasurer.js";

export const parseCashAccountStatement = (text) => {
    let lines = text.split('\n');
    let results = []; // Array to store multiple results
    let activeAccount = null;

    // Helper function to convert date string to JavaScript Date in EET
    const parseDate = (dateString) => {
        const year = parseInt(dateString.slice(0, 2), 10) + 2000; // Adjust year to be 4 dAigits
        const month = parseInt(dateString.slice(2, 4), 10) - 1; // Month is 0-indexed
        const day = parseInt(dateString.slice(4, 6), 10);
        let date = new Date(year, month, day);
        // Convert to EET (UTC+2) which is always 2 hours ahead of UTC, no DST
        date.setHours(date.getHours() + 2);
        return date;
    };

    // Custom toISOString method to format in EET
    Date.prototype.toEETString = function () {
        let utc = this.toISOString().slice(0, -1);
        return utc.slice(0, 10) + 'T' + utc.slice(11, 19) + '+02:00';
    };

    let currentResult = {}; // Temporary object to hold current transaction data

    for (let line of lines) {

        // If we've processed a complete transaction, add it to results and reset
        if (Object.keys(currentResult).length > 0 &&
            (line.startsWith('T1018800') || (!line.startsWith('T1104300') && !line.startsWith('T1132311')))) {

            // Convert Date objects to EET string representation
            for (let key in currentResult) {
                if (currentResult[key] instanceof Date) {
                    currentResult[key] = currentResult[key].toEETString();
                }
            }

            results.push({ ...currentResult }); // Add a copy of currentResult to results
            currentResult = {}; // Reset for next transaction
        }

        if (line.startsWith('T1018800')) {
            // Skip junction breakdown (J) lines: Palvelumaksu fees have one JE (total) line
            // and multiple J (breakdown) lines. J lines have payment date 000000.
            // Including them would double-count fees (e.g. -21.58 total + -3.94 breakdown = -25.52).
            const paymentDate = line.slice(36, 42);
            if (paymentDate === '000000') continue;

            currentResult = {
                accountNumber: activeAccount,
                bankReference: line.slice(12, 30),
                entryDate: parseDate(line.slice(30, 36)),
                paymentDate: parseDate(line.slice(36, 42)),
                valueDate: parseDate(line.slice(42, 48)),
                transaction: line.slice(48, 52).trim() + ' ' + line.slice(52, 87).trim().replace(/{/g, 'ä').replace(/\[/g, 'Ä').replace(/\\/g, 'Ö'),
                amount: parseFloat(line.slice(87, 106)) / 100, // Assuming the value is stored with two implicit decimal places
                name: line.slice(108, 143).trim().replace(/{/g, 'ä').replace(/\[/g, 'Ä').replace(/\\/g, 'Ö'),
                reference: parseFloat(line.slice(160, 180)),
                message: null,
                payerReference: null
            };
        } else if (line.startsWith('T1104300') && Object.keys(currentResult).length > 0) {
            currentResult.message = line.slice(8).trim().replace(/{/g, 'ä').replace(/\[/g, 'Ä').replace(/\\/g, 'Ö');
        } else if (line.startsWith('T1132311') && Object.keys(currentResult).length > 0) {
            currentResult.payerReference = line.slice(8).trim();
        } else if (line.startsWith('T0032210')) {
            // Extract the IBAN account number from the line
            activeAccount = line.slice(-18); // Assuming the IBAN is always the last 18 characters
        }
    }

    results.sort((lhs, rhs) => {
        // Assuming entryDate is either a Date object or a string in a sortable format like ISO 8601
        const dateL = new Date(lhs.entryDate);
        const dateR = new Date(rhs.entryDate);        
        // Compare timestamps for Date objects
        return dateL.getTime() - dateR.getTime();
    });

    return results;
}

export const mapToJornal = (old) => {
    const number = journal.length + 1; // New integer from jornal
    const date = old.entryDate.split('T')[0]; // Extract date from ISO string
    const newDescription = `${old.transaction}, ${old.name}, ${old.message}, ${old.reference}`;

    return {
        "header": {
            "number": number,
            "created": new Date().toISOString().split('T')[0],
            "reference": old.bankReference,
            "note": newDescription
        },
        "mappingStatus": "unmapped",
        "entries": [
            {
                "entry": old.amount >= 0 ? 'debit' : 'credit',
                "date": date, // Using the same date for both entries; adjust if needed
                "account": "1240", // These are placeholders, adjust as necessary
                "label": "Rahat ja pankkisaamiset", // Placeholder label
                "amount": Math.abs(old.amount),
                "number": number,
                "reference": old.reference,
                "note": newDescription
            },
            {
                "entry": old.amount >= 0 ? 'credit' : 'debit',
                "date": date,
                "account": "9999", // Placeholder for credit account
                "label": "Kirjaamattomat", // Placeholder label
                "amount": Math.abs(old.amount), // Assuming same amount for both entries for simplicity
                "number": number,
                "reference": old.reference,
                "note": newDescription
            }
        ]
    };
}