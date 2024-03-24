import {one,all} from "./query.js";
import {general_ledger} from "./general_ledger.js";
import {journal} from "./journal.js";

window.onload = () => {

    const accout = () => {

        one("#reset").click();

        let tbody = one("table#journal tbody");
        tbody.innerHTML = "";

        journal.forEach(transaction => transaction.entries.forEach(entry => {
            entry.number = transaction.header.number;
            entry.reference = transaction.header.reference;
            entry.note = transaction.header.note;
            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td")).textContent = entry.number;
            tr.lastChild.classList.add('number');
            tr.appendChild(document.createElement("td")).textContent = entry.date;
            tr.appendChild(document.createElement("td")).textContent = entry.account;
            tr.appendChild(document.createElement("td")).textContent = entry.entry;
            tr.appendChild(document.createElement("td")).textContent = entry.amount.toFixed(2);
            tr.appendChild(document.createElement("td")); // intentionally empty
            tr.appendChild(document.createElement("td")).textContent = entry.reference;
            tr.appendChild(document.createElement("td")).textContent = entry.note;
            tbody.prepend(tr);
        }));

        const ledger = [];
        journal.forEach(transaction => ledger.push(...transaction.entries));
        ledger.sort((lhs, rhs) => rhs.account.localeCompare(lhs.account) ? rhs.account.localeCompare(lhs.account) : lhs.date.localeCompare(rhs.date));

        const balances = new Map();
        let account = "";
        let subtotal = 0.00;

        tbody = one("table#ledger tbody");
        tbody.innerHTML = "";

        ledger.forEach(entry => {
            if (account.localeCompare(entry.account)) { // is same returns 0 == false
                account = entry.account;
                subtotal = 0.00;
            }
            subtotal += ("credit".localeCompare(entry.entry) ? -1 : 1) * entry.amount;
            balances.set(entry.account, subtotal);

            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td")).textContent = entry.number;
            tr.lastChild.classList.add('number');
            tr.appendChild(document.createElement("td")).textContent = entry.date;
            tr.appendChild(document.createElement("td")).textContent = entry.account;
            tr.appendChild(document.createElement("td")).textContent = entry.entry;
            tr.appendChild(document.createElement("td")).textContent = entry.amount.toFixed(2);
            tr.appendChild(document.createElement("td")).textContent = subtotal.toFixed(2);
            tr.appendChild(document.createElement("td")).textContent = entry.reference;
            tr.appendChild(document.createElement("td")).textContent = entry.note;
            tbody.append(tr);
        });

        const populate = (tbody, name, category) => {

            const group = document.createElement("optgroup");
            group.label = name;

            const tr = document.createElement("tr");
            const th = document.createElement("th");
            th.setAttribute("colspan", "2");
            th.textContent = name;
            tr.appendChild(th);
            tr.appendChild(document.createElement("th"));
            tbody.append(tr);

            category.forEach(account => {

                const option = document.createElement("option");
                option.value = account.name;
                option.textContent = account.name;
                group.appendChild(option);

                const tr = document.createElement("tr");
                tr.appendChild(document.createElement("td")); // Deliberately empty
                tr.appendChild(document.createElement("td")).textContent = account.name;

                if (balances.has(account.name))
                    tr.appendChild(document.createElement("td")).textContent = balances.get(account.name).toFixed(2);
                else
                    tr.appendChild(document.createElement("td")).textContent = new Number(0.00).toFixed(2);

                tbody.append(tr);
            });

            all("#account, .accounts").forEach(select => select.appendChild(group.cloneNode(true)));
        };

        all("#account, .accounts").forEach(select => select.innerHTML = "");

        const tbody1 = one("table#balance tbody");
        tbody1.innerHTML = "";
        populate(tbody1, "assets", general_ledger.assets);
        populate(tbody1, "net assets", general_ledger.net_assets);

        const PnL = [...balances].filter(([k, v]) => general_ledger.isPnL(k)).reduce((a, [k, v]) => a + v, 0);

        const tr = document.createElement("tr");
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td")).textContent = "PnL";
        tr.appendChild(document.createElement("td")).textContent = new Number(PnL).toFixed(2);
        tbody1.append(tr);

        populate(tbody1, "liabilities", general_ledger.liabilities);
        const tbody2 = one("table#PnL tbody");
        tbody2.innerHTML = "";
        populate(tbody2, "revenues", general_ledger.revenues);
        populate(tbody2, "expenses", general_ledger.expenses);

        one("#entry_set option[value='pankkisaamiset']").setAttribute("selected", "");

        one("#contra_entry_set option[value='maksut']").setAttribute("selected", "");

        all("table#ledger tbody tr, table#journal tbody tr").forEach(row => row.onclick = () => {
            let number = row.querySelector(".number").textContent;
            alert(`${number}`);
    
            const transaction = journal.find(t => t.header.number == number);
            one("#number").value = transaction.header.number;
            one("#created").value = transaction.header.created;
            one("#reference").value = transaction.header.reference;
            one("#note").value = transaction.header.note;
            one("#file").value = transaction.header.file;
    
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
        });    
    };

    one("#created").onchange = () => all("#date, [name=date]").forEach(element => element.value = one("#created").value);

    one("#add").onclick = () => {
        const div = one("#entries").appendChild(one("#contra_entry_set").cloneNode(true));
        const button = div.appendChild(document.createElement("button"));
        button.textContent = "Remove";
        button.setAttribute("type", "button");
        button.setAttribute("onclick", "this.parentElement.remove();");
    };

    one("#entry").onchange = () => all("[name=entry]").forEach(element => element.value = one("#entry").value.localeCompare("credit") ? "credit" : "debit");

    one("#date").onchange = () => all("[name=date]").forEach(element => element.value = one("#date").value);

    one("#amount").onchange = () => all("[name=amount]").forEach(element => element.value = one("#amount").value);

    one("#transaction").onsubmit = event => {

        event.preventDefault();

        const transaction = {
            header: {
                number: one("#number").value,
                created: one("#created").value,
                reference: one("#reference").value,
                note: one("#note").value,
                file: one("#file").value
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
        else if (credits !== debits) {
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

    one("#transaction").onreset = event => {
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

    one("#save").onclick = () => {
        const a = document.createElement('a');
        const content = "let journal = " + JSON.stringify(journal) + ";";
        const file = new Blob([content], { type: "application/javascript" });
        a.href = URL.createObjectURL(file);
        a.download = "test.js";
        a.target = "_blank"
        a.click();
        URL.revokeObjectURL(a.href);
    };

    accout();
};
