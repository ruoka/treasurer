import {one,all} from "./query.js";
import {general_ledger} from "./general_ledger.js";
import {journal} from "./journal.js";

window.onload = () => {

    const accout = () => {

        one("#reset").click();

        const tbody1 = one("table#journal tbody");
        tbody1.innerHTML = "";

        journal.forEach(transaction => transaction.entries.forEach(entry => {
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
            tr.appendChild(document.createElement("td")).textContent = entry.amount.toFixed(2);
            tr.appendChild(document.createElement("td")); // intentionally empty
            tr.appendChild(document.createElement("td")).textContent = entry.reference;
            tr.appendChild(document.createElement("td")).textContent = entry.note;
            tbody1.prepend(tr);
        }));

        const ledger = [];
        journal.forEach(transaction => ledger.push(...transaction.entries));
        ledger.sort((lhs, rhs) => rhs.account.localeCompare(lhs.account) ? rhs.account.localeCompare(lhs.account) : lhs.date.localeCompare(rhs.date));

        const balances = new Map();
        let assets = 0.00;
        let liabilities = 0.00;
        let income = 0.00;
        let account = "";
        let subtotal = 0.00;

        const tbody2 = one("table#ledger tbody");
        tbody2.innerHTML = "";

        ledger.forEach(entry => {

            const amount = ("credit".localeCompare(entry.entry) ? -1 : 1) * entry.amount;

            if(entry.account.startsWith('1')) {
                assets += amount;
                balances.set('1000', assets);
            } else {
                liabilities += amount;
                balances.set('2000', liabilities);
            }
 
            if(!(entry.account.startsWith('1') || entry.account.startsWith('2'))) {
                income += amount;
                balances.set('2130', income);
            }

            if (account.localeCompare(entry.account)) { // is same returns 0 == false
                account = entry.account;
                subtotal = 0.00;
            }

            subtotal += amount;
            balances.set(entry.account, subtotal);

            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td")).textContent = entry.number;
            tr.lastChild.classList.add('number');
            tr.appendChild(document.createElement("td")).textContent = entry.date;
            tr.appendChild(document.createElement("td")).textContent = entry.account;
            tr.appendChild(document.createElement("td")).textContent = entry.label;
            tr.appendChild(document.createElement("td")).textContent = entry.entry;
            tr.appendChild(document.createElement("td")).textContent = entry.amount.toFixed(2);
            tr.appendChild(document.createElement("td")).textContent = subtotal.toFixed(2);
            tr.appendChild(document.createElement("td")).textContent = entry.reference;
            tr.appendChild(document.createElement("td")).textContent = entry.note;
            tbody2.append(tr);
        });

        const populate = (tbody, name, category) => {

            const group = document.createElement("optgroup");
            group.name = name;

            category.forEach(account => {

                if(account.open) {
                    const option = document.createElement("option");
                    option.value = account.account;
                    option.textContent = account.account + ' - ' + account.code_prelabel_fi;
                    group.appendChild(option);
                }

                const tr = document.createElement("tr");
                tr.appendChild(document.createElement("td")).textContent = account.account;
                tr.appendChild(document.createElement("td")).textContent = account.code_prelabel_fi;

                if (balances.has(account.account))
                    tr.appendChild(document.createElement("td")).textContent = balances.get(account.account).toFixed(2);
                else
                    tr.appendChild(document.createElement("td")).textContent = new Number(0.00).toFixed(2);

                tbody.append(tr);
            });

            all("#account, .accounts").forEach(select => select.appendChild(group.cloneNode(true)));
        };

        all("#account, .accounts").forEach(select => select.innerHTML = "");

        const tbody3 = one("table#balance tbody");
        tbody3.innerHTML = "";
        populate(tbody3, "tase", general_ledger.balance_sheet);

        const tbody4 = one("table#income tbody");
        tbody4.innerHTML = "";
        populate(tbody4, "tulos laskelma", general_ledger.income_statement);

        one("#entry_set option[value='1240']").setAttribute("selected", "");

        one("#contra_entry_set option[value='3100']").setAttribute("selected", "");

        all("table#ledger tbody tr, table#journal tbody tr").forEach(row => row.onclick = () => {
            let number = row.querySelector(".number").textContent;
            alert(`${number}`);
    
            const transaction = journal.find(t => t.header.number == number);
            one("#number").value = transaction.header.number;
            one("#created").value = transaction.header.created;
            one("#reference").value = transaction.header.reference;
            one("#note").value = transaction.header.note;
    
            const divs = all("fieldset#entries div");
            let index = 0;

            for (let div of divs) {
                div.children[0].value = transaction.entries[index].entry;
                div.children[1].value = transaction.entries[index].date;
                div.children[2].value = transaction.entries[index].account;
                div.children[3].value = transaction.entries[index].amount.toFixed(2);
                ++index;
            };
        
            while (index < transaction.entries.length) {
                const div = one("#entries").appendChild(one("#contra_entry_set").cloneNode(true));
                const button = div.appendChild(document.createElement("button"));
                button.textContent = "Remove";
                button.setAttribute("type", "button");
                button.setAttribute("onclick", "this.parentElement.remove();");
    
                div.children[0].value = transaction.entries[index].entry;
                div.children[1].value = transaction.entries[index].date;
                div.children[2].value = transaction.entries[index].account;
                div.children[3].value = transaction.entries[index].amount.toFixed(2);;
                ++index;
            }
            one("#created").focus();
        });
    };

    one("#created").onchange = () => all("#date, [name=date]").forEach(element => element.value = one("#created").value);

    one("#add").onclick = () => {
        const div = one("#entries").appendChild(one("#contra_entry_set").cloneNode(true));
        const button = div.appendChild(document.createElement("button"));
        button.textContent = "Poista"; // FIXME
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

        if (transaction.header.number == 0)
            transaction.header.number = journal.map(t => t.header.number).reduce((n1, n2) => n1 > n2 ? n1 : n2, 0) + 1;

        let credits = 0.00;
        let debits = 0.00;
        const divs = all("fieldset#entries div");
        for (let div of divs) {
            const entry = {
                entry: div.children[0].value,
                date: div.children[1].value,
                account: div.children[2].value,
                label: div.children[2].options[div.children[2].selectedIndex].text.substring(7),
                amount: parseFloat(div.children[3].value)
            };
            credits += entry.entry.localeCompare("credit") ? 0 : entry.amount;
            debits += entry.entry.localeCompare("debit") ? 0 : entry.amount;
            transaction.entries.push(entry);
        }

        const update = one("#update").checked;

        if (update == false && journal.some(existing => existing.header.number == transaction.header.number)) {
            alert(`Error: Transaction with number ${transaction.header.number} already exists`);
        }
        else if (credits.toFixed(2) !== debits.toFixed(2)) {
            alert(`Error: The ${divs.length} entries for transaction ${transaction.header.reference} are not matching. Difference is ${credits - debits} €`);
        } else {
            alert(`Success: The ${divs.length} entries for transaction ${transaction.header.reference} are matching. Total credits/debits are ${credits} €`);
            if (update) {
                const index = journal.findIndex(existing => existing.header.number == transaction.header.number);
                journal[index] = transaction;
            } else {
                journal.push(transaction);
            }
            accout();
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
    };

    one("#open").onclick = async () => {
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
        journal.push(...JSON.parse(content));
        accout();
    };

    one("#save").onclick = async () => {
        const handle = await window.showSaveFilePicker({
            suggestedName: 'example.json',
            types: [{
                description: 'JSON Files',
                accept: {
                    'application/json': ['.json'],
                }
            }]
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(journal,null,2));
        await writable.close();
    };

    accout();
};
