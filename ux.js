/**
 * Treasurer (Rahuri) - User Interface
 * 
 * Copyright (c) 2025 Kaius Ruokonen
 * Licensed under dual license: GPL-3.0 for non-profits, commercial license for others.
 * See LICENSE file for details.
 */

import { one, all } from "./query.js";
import * as Treasurer from "./treasurer.js";
import * as Nordea from "./nordea.js";

window.onload = () => {

    const tabs = all('.tab-link');
    const tabContents = all('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + '-tab').classList.add('active');

            // Check if the ledger tab is activated
            if (tab.dataset.tab === 'ledger') {
                applyLedgerFilters();
            }
        });
    });

    // Set default active tab if needed (optional, assuming you want 'balance-income' as default)
    one('.tab-link[data-tab="balance-income"]').click();
    const ledgerTableBody = one('#ledger tbody');
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    const filterAccount = document.getElementById('filterAccount');
    const applyFilterBtn = document.getElementById('applyFilter');
    const messageFilter = one('#messageFilter');

    // Populate accounts in the filter dropdown from general ledger
    const populateAccountFilter = () => {
        filterAccount.innerHTML = '<option value="">Kaikki</option>';
        const accountSet = new Set();
        
        // Collect all open accounts from balance sheet and income statement
        Treasurer.general_ledger.balance_sheet.forEach(account => {
            if (account.open) accountSet.add(account.account);
        });
        Treasurer.general_ledger.income_statement.forEach(account => {
            if (account.open) accountSet.add(account.account);
        });
        
        // Add accounts from existing journal entries (for accounts that might not be in general_ledger)
        Treasurer.journal.forEach(transaction => {
            transaction.entries.forEach(entry => {
                if (entry.account) accountSet.add(entry.account);
            });
        });
        
        // Sort and add to dropdown
        Array.from(accountSet).sort().forEach(account => {
            const option = document.createElement('option');
            option.value = account;
            option.textContent = account;
            filterAccount.appendChild(option);
        });
    };

    // Apply filters when the apply button is clicked
    applyFilterBtn.addEventListener('click', applyLedgerFilters);

    // Apply message filter on input
    messageFilter.addEventListener('input', applyLedgerFilters);

    function applyLedgerFilters() {
        const from = fromDate.value ? new Date(fromDate.value) : null;
        const to = toDate.value ? new Date(toDate.value) : null;
        const account = filterAccount.value || null;
        const message = messageFilter.value.toLowerCase();

        const rows = Array.from(ledgerTableBody.querySelectorAll('tr'));

        rows.forEach(row => {
            const rowDate = new Date(row.querySelector('td:nth-child(2)').textContent); // Assuming date is in the second column
            const rowAccount = row.querySelector('td:nth-child(3)').textContent; // Assuming account is in the third column
            const messageCell = row.querySelector('td:nth-child(9)'); // Assuming 'Viesti' is the 9th child

            const dateMatch = (!from || rowDate >= from) && (!to || rowDate <= to);
            const accountMatch = !account || rowAccount.includes(account);
            const messageMatch = !message || (messageCell && messageCell.textContent.toLowerCase().includes(message));

            if (dateMatch && accountMatch && messageMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    const updateTables = () => {

        Treasurer.account();

        one("#reset").click();

        const tbody1 = one("table#journal tbody");
        tbody1.innerHTML = "";

        Treasurer.journal.forEach(transaction => transaction.entries.forEach(entry => {
            entry.number = transaction.header.number;
            entry.reference = transaction.header.reference;
            entry.note = transaction.header.note;
            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td")).textContent = entry.number;
            tr.lastChild.classList.add('number');
            tr.appendChild(document.createElement("td")).textContent = entry.date;
            tr.appendChild(document.createElement("td")).textContent = entry.account;
            tr.appendChild(document.createElement("td")).textContent = entry.label;
            tr.appendChild(document.createElement("td")).textContent = entry.entry;
            // Ensure amount is a number
            const amount = typeof entry.amount === 'number' ? entry.amount : parseFloat(entry.amount) || 0;
            tr.appendChild(document.createElement("td")).textContent = amount.toFixed(2).replace('.',',');
            tr.appendChild(document.createElement("td")); // intentionally empty
            tr.appendChild(document.createElement("td")).textContent = entry.reference;
            tr.appendChild(document.createElement("td")).textContent = entry.note;
            tbody1.prepend(tr);
        }));

        let account = "";
        let subtotal = 0.00;
        const tbody2 = one("table#ledger tbody");
        tbody2.innerHTML = "";

        Treasurer.ledger.forEach(entry => {

            if (account.localeCompare(entry.account)) { // is same returns 0 == false
                account = entry.account;
                subtotal = 0.00;
            }
            // Ensure amount is a number
            const amount = typeof entry.amount === 'number' ? entry.amount : parseFloat(entry.amount) || 0;
            subtotal += ("credit".localeCompare(entry.entry) ? -1 : 1) * amount;

            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td")).textContent = entry.number;
            tr.lastChild.classList.add('number');
            tr.appendChild(document.createElement("td")).textContent = entry.date;
            tr.appendChild(document.createElement("td")).textContent = entry.account;
            tr.appendChild(document.createElement("td")).textContent = entry.label;
            tr.appendChild(document.createElement("td")).textContent = entry.entry;
            tr.appendChild(document.createElement("td")).textContent = amount.toFixed(2).replace('.',',');
            tr.appendChild(document.createElement("td")).textContent = subtotal.toFixed(2).replace('.',',');
            tr.appendChild(document.createElement("td")).textContent = entry.reference;
            tr.appendChild(document.createElement("td")).textContent = entry.note;
            tbody2.append(tr);
        });

        const populate = (tbody, name, category) => {

            const group = document.createElement("optgroup");
            group.name = name;

            category.forEach(account => {

                if (account.open) {
                    const option = document.createElement("option");
                    option.value = account.account;
                    option.textContent = account.account + ' - ' + account.code_prelabel_fi;
                    group.appendChild(option);
                }

                const tr = document.createElement("tr");
                tr.appendChild(document.createElement("td")).textContent = account.account;
                tr.appendChild(document.createElement("td")).textContent = account.code_prelabel_fi;

                if (Treasurer.balances.has(account.account))
                    tr.appendChild(document.createElement("td")).textContent = Treasurer.balances.get(account.account).toFixed(2).replace('.',',');
                else
                    tr.appendChild(document.createElement("td")).textContent = new Number(0.00).toFixed(2).replace('.',',');

                tbody.append(tr);
            });

            all("#account, .accounts").forEach(select => select.appendChild(group.cloneNode(true)));
        };

        all("#account, .accounts").forEach(select => select.innerHTML = "");

        const tbody3 = one("table#balance tbody");
        tbody3.innerHTML = "";
        populate(tbody3, "tase", Treasurer.general_ledger.balance_sheet);

        const tbody4 = one("table#income tbody");
        tbody4.innerHTML = "";
        populate(tbody4, "tulos laskelma", Treasurer.general_ledger.income_statement);

        one("#entry_set option[value='1240']").setAttribute("selected", "");

        one("#contra_entry_set option[value='3100']").setAttribute("selected", "");

        all("table#ledger tbody tr, table#journal tbody tr").forEach(row => row.onclick = () => {
            let number = row.querySelector(".number").textContent;

            const transaction = Treasurer.journal.find(t => t.header.number == number);
            one("#number").value = transaction.header.number;
            one("#created").value = transaction.header.created;
            one("#reference").value = transaction.header.reference;
            one("#note").value = transaction.header.note;

            const divs = all("fieldset#entries div");
            let index = 0;

            for (let div of divs) {
                const entry = transaction.entries[index];
                const amount = typeof entry.amount === 'number' ? entry.amount : parseFloat(entry.amount) || 0;
                div.children[0].value = entry.entry;
                div.children[1].value = entry.date;
                div.children[2].value = entry.account;
                div.children[3].value = amount.toFixed(2).replace('.',',');
                ++index;
            };

            while (index < transaction.entries.length) {
                const div = one("#entries").appendChild(one("#contra_entry_set").cloneNode(true));
                div.removeAttribute("id");
                const button = div.appendChild(document.createElement("button"));
                button.textContent = "Remove";
                button.setAttribute("type", "button");
                button.setAttribute("onclick", "this.parentElement.remove();");

                const entry = transaction.entries[index];
                const amount = typeof entry.amount === 'number' ? entry.amount : parseFloat(entry.amount) || 0;
                div.children[0].value = entry.entry;
                div.children[1].value = entry.date;
                div.children[2].value = entry.account;
                div.children[3].value = amount.toFixed(2).replace('.',',');
                ++index;
            }
            one("#created").focus();
        });

        applyLedgerFilters();
        populateAccountFilter(); // Update account filter when tables are updated
    };

    one("#created").onchange = () => all("#date, [name=date]").forEach(element => element.value = one("#created").value);

    one("#add").onclick = () => {
        const div = one("#entries").appendChild(one("#contra_entry_set").cloneNode(true));
        div.removeAttribute("id");
        const button = div.appendChild(document.createElement("button"));
        button.textContent = "Poista"; // Remove button (Finnish)
        button.setAttribute("type", "button");
        button.setAttribute("onclick", "this.parentElement.remove();");
    };

    one("#entry").onchange = async () => all("[name=entry]").forEach(element => element.value = one("#entry").value.localeCompare("credit") ? "credit" : "debit");

    one("#date").onchange = async () => all("[name=date]").forEach(element => element.value = one("#date").value);

    one("#amount").onchange = async () => all("[name=amount]").forEach(element => element.value = one("#amount").value);

    one("#transaction").onsubmit = async event => {

        event.preventDefault();

        const transaction = {
            header: {
                number: one("#number").value,
                created: one("#created").value,
                reference: one("#reference").value,
                note: one("#note").value,
            },
            entries: []
        };

        if (transaction.header.number == 0) {
            const currentMax = Treasurer.journal.map(t => parseInt(t.header.number, 10) || 0).reduce((n1, n2) => Math.max(n1, n2), 0);
            transaction.header.number = currentMax + 1;
        }

        let credits = 0.00;
        let debits = 0.00;
        const divs = all("fieldset#entries div");
        
        // Validate that we have at least 2 entries (double-entry bookkeeping requirement)
        if (divs.length < 2) {
            alert('Error: At least 2 entries are required for double-entry bookkeeping');
            return;
        }
        
        for (let div of divs) {
            const entryType = div.children[0].value;
            const date = div.children[1].value;
            const account = div.children[2].value;
            const amountStr = div.children[3].value;
            
            // Validate required fields
            if (!date) {
                alert('Error: All entries must have a date');
                return;
            }
            if (!account) {
                alert('Error: All entries must have an account selected');
                return;
            }
            if (!amountStr || parseFloat(amountStr) <= 0) {
                alert('Error: All entries must have a positive amount');
                return;
            }
            
            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                alert(`Error: Invalid amount: ${amountStr}`);
                return;
            }
            
            const entry = {
                entry: entryType,
                date: date,
                account: account,
                label: div.children[2].options[div.children[2].selectedIndex].text.substring(7),
                amount: amount
            };
            credits += entry.entry.localeCompare("credit") ? 0 : entry.amount;
            debits += entry.entry.localeCompare("debit") ? 0 : entry.amount;
            transaction.entries.push(entry);
        }

        const update = one("#update").checked;

        if (update == false && Treasurer.journal.some(existing => existing.header.number == transaction.header.number)) {
            alert(`Error: Transaction with number ${transaction.header.number} already exists`);
        }
        else if (credits.toFixed(2) !== debits.toFixed(2)) {
            alert(`Error: The ${divs.length} entries for transaction ${transaction.header.reference} are not matching. Difference is ${credits - debits} €`);
        } else {
            alert(`Success: The ${divs.length} entries for transaction ${transaction.header.reference} are matching. Total credits/debits are ${credits} €`);
            if (update) {
                const index = Treasurer.journal.findIndex(existing => existing.header.number == transaction.header.number);
                Treasurer.journal[index] = transaction;
                one("#update").checked = false;
            } else {
                Treasurer.journal.push(transaction);
            }
            updateTables();
        }
    };

    one("#transaction").onreset = async event => {
        event.preventDefault();
        all("form fieldset fieldset input, form fieldset fieldset textarea").forEach(input => input.value = "");
        const divs = all("fieldset#entries :nth-child(1n+5)");
        for (let div of divs) {
            div.remove();
        }
        one("#number").value = 0;
        one("#created").value = new Date().toISOString().split("T")[0];
        all("#date, [name=date]").forEach(element => element.value = one("#created").value);

        updateTables();
    };

    one("#open").onclick = async () => {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: {
                        'application/json': ['.json'],
                    },
                }],
            });
            const file = await fileHandle.getFile();
            const content = await file.text();
            const parsedData = JSON.parse(content);
            
            // Validate that it's an array
            if (!Array.isArray(parsedData)) {
                throw new Error('Invalid file format: expected an array of transactions');
            }
            
            // Normalize amounts to numbers (handle both string and number formats)
            const normalizedData = parsedData.map(transaction => ({
                ...transaction,
                entries: transaction.entries.map(entry => ({
                    ...entry,
                    amount: typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount
                }))
            }));
            
            Treasurer.journal.push(...normalizedData);
            updateTables();
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled file picker - silently ignore
                return;
            }
            alert(`Error loading file: ${error.message}`);
            console.error('Error loading journal file:', error);
        }
    };

    one("#save").onclick = async () => {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'journal.json',
                types: [{
                    description: 'JSON Files',
                    accept: {
                        'application/json': ['.json'],
                    }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(Treasurer.journal, null, 2));
            await writable.close();
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled file picker - silently ignore
                return;
            }
            alert(`Error saving file: ${error.message}`);
            console.error('Error saving journal file:', error);
        }
    };

    one("#statement").onclick = async () => {
        try {
            // Open file picker for Nordea bank statement
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Nordea Bank Statement Files',
                    accept: {
                        'text/plain': ['.nda'],
                    },
                }],
            });
            const file = await fileHandle.getFile();
            const content = await file.text();
            
            if (!content || content.trim().length === 0) {
                throw new Error('File is empty');
            }
            
            const results = Nordea.parseCashAccountStatement(content);
            if (!results || results.length === 0) {
                alert('No transactions found in the bank statement file.');
                return;
            }
            
            results.forEach(result => Treasurer.journal.push(Nordea.mapToJornal(result)));
            updateTables();
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled file picker - silently ignore
                return;
            }
            alert(`Error loading bank statement: ${error.message}`);
            console.error('Error parsing bank statement:', error);
        }
    };

    one("#newYear").onclick = async () => {
        try {
            // Prompt for the new year date (default to January 1st of current year + 1)
            const nextYear = new Date().getFullYear() + 1;
            const defaultDate = `${nextYear}-01-01`;
            
            const dateInput = prompt(
                `Syötä uuden vuoden päivämäärä avauskirjaukselle:\n(Muoto: YYYY-MM-DD, esim. ${defaultDate})`,
                defaultDate
            );
            
            if (!dateInput) {
                return; // User cancelled
            }
            
            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(dateInput)) {
                alert('Virheellinen päivämäärämuoto. Käytä muotoa YYYY-MM-DD (esim. 2025-01-01)');
                return;
            }
            
            // Validate it's a valid date
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) {
                alert('Virheellinen päivämäärä');
                return;
            }
            
            // Confirm before creating opening entries
            const year = dateInput.substring(0, 4);
            const confirmMessage = `Luodaanko avauskirjaus vuodelle ${year}?\n\nTämä luo uuden kirjauksen nykyisten tase-saldojen perusteella.`;
            
            if (!confirm(confirmMessage)) {
                return;
            }
            
            // Create opening entries
            const transaction = Treasurer.createOpeningEntries(dateInput);
            
            if (transaction.entries.length === 0) {
                alert('Ei saldoja avauskirjaukseen. Tarkista että tase-saldoja on olemassa.');
                return;
            }
            
            // Verify the transaction balances
            let debits = 0;
            let credits = 0;
            transaction.entries.forEach(entry => {
                if (entry.entry === 'debit') {
                    debits += entry.amount;
                } else {
                    credits += entry.amount;
                }
            });
            
            if (Math.abs(debits - credits) > 0.01) {
                alert(`Varoitus: Avauskirjauksen debetit ja kreditit eivät täsmää. Ero: ${Math.abs(debits - credits).toFixed(2)} €`);
            } else {
                alert(`Avauskirjaus luotu onnistuneesti!\n\nVuosi: ${year}\nKirjauksia: ${transaction.entries.length}\nDebetit: ${debits.toFixed(2)} €\nKreditit: ${credits.toFixed(2)} €`);
            }
            
            updateTables();
        } catch (error) {
            alert(`Virhe avauskirjauksen luomisessa: ${error.message}`);
            console.error('Error creating opening entries:', error);
        }
    };

    updateTables();
    populateAccountFilter(); // Initialize account filter on page load
};
