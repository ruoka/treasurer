import {accounts} from "./accounts.js";
import {journal} from "./journal.js";

const one = selectors => document.querySelector(selectors);

const all = selectors => document.querySelectorAll(selectors);

window.onload = () => {

    one("#created").onchange = () => all("#date, [name=date]").forEach(element => element.value = one("#created").value);

    one("#add").onclick = () => {
        const div = one("#entries").appendChild(one("#contra_entry_set").cloneNode(true));
        const button = div.appendChild(document.createElement("button"));
        button.textContent = "Remove";
        button.setAttribute("type", "button");
        button.setAttribute("onclick", "this.parentElement.remove();");
    }

    one("#entry").onchange = () => all("[name=entry]").forEach(element => element.value = one("#entry").value.localeCompare("credit") ? "credit" : "debit");

    one("#date").onchange = () => all("[name=date]").forEach(element => element.value = one("#date").value);

    one("#amount").onchange = () => all("[name=amount]").forEach(element => element.value = one("#amount").value);

    one("#transaction").onsubmit = event => {

        event.preventDefault();
    
        const transaction = {
            header: {
                created: one("#created").value,
                reference: one("#reference").value,
                note: one("#note").value,
                file: one("#file").value
            },
            entries: []
        };
    
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
            credits += (entry.entry.localeCompare("credit") == 0 ? entry.amount : 0);
            debits += (entry.entry.localeCompare("debit") == 0 ? entry.amount : 0);
            transaction.entries.push(entry);
        }
    
        if(journal.some(existing => transaction.header.reference.localeCompare(existing.header.reference) === 0)) {
            alert(`Error: Transaction with reference ${transaction.header.reference} already exists`);
        }
        else if(credits !== debits) {
            alert(`Error: The ${divs.length} entries for transaction ${transaction.header.reference} are not matching. Difference is ${credits - debits} €`);
        } else {
            journal.push(transaction);
            alert(`Success: The ${divs.length} entries for transaction ${transaction.header.reference} are matching. Total credits/debits are ${credits} €`);
            update();
        }
    }

    one("#save").onclick = () => {
        const a = document.createElement('a');
        const content = "let journal = " + JSON.stringify(journal) + ";";
        const file = new Blob([content], { type: "application/javascript" });
        a.href = URL.createObjectURL(file);
        a.download = "test.js";
        a.target="_blank"
        a.click();
        URL.revokeObjectURL(a.href);
    };

    update();
}

const update = () => {

    one("#reset").click();
    one("#created").value = new Date().toISOString().split("T")[0];
    one("#date").value = new Date().toISOString().split("T")[0];
    all("[name=date]").forEach(element => element.value = new Date().toISOString().split("T")[0]);

    const ledger = [];

    let tbody = one("table#journal tbody");
    tbody.innerHTML = "";

    journal.forEach(transaction => transaction.entries.forEach(entry => {
        entry.reference = transaction.header.reference;
        ledger.push(entry);

        const tr = document.createElement("tr");
        tr.appendChild(document.createElement("td")).textContent = entry.date;
        tr.appendChild(document.createElement("td")).textContent = entry.account;
        tr.appendChild(document.createElement("td")).textContent = transaction.header.reference;
        tr.appendChild(document.createElement("td")).textContent = entry.entry;
        tr.appendChild(document.createElement("td")).textContent = entry.amount;
        tbody.prepend(tr);
    }));

    ledger.sort((lhs,rhs) => rhs.account.localeCompare(lhs.account) !== 0 ? rhs.account.localeCompare(lhs.account) : lhs.date.localeCompare(rhs.date));

    const balance = new Map();
    let account = "";
    let subtotal = 0.00;

    tbody = one("table#ledger tbody");
    tbody.innerHTML = "";

    ledger.forEach(entry => {
        if(account.localeCompare(entry.account)) {
            account = entry.account;
            subtotal = 0.00;
        }
        subtotal += (entry.entry.localeCompare("credit") == 0 ? 1 : -1) * entry.amount;
        balance.set(entry.account,subtotal);

        const tr = document.createElement("tr");
        tr.appendChild(document.createElement("td")).textContent = entry.account;
        tr.appendChild(document.createElement("td")).textContent = entry.date;
        tr.appendChild(document.createElement("td")).textContent = entry.reference;
        tr.appendChild(document.createElement("td")).textContent = entry.entry;
        tr.appendChild(document.createElement("td")).textContent = entry.amount.toFixed(2);
        tr.appendChild(document.createElement("td")).textContent = subtotal.toFixed(2);
        tbody.append(tr);
    });

    tbody = one("table#balance tbody");
    tbody.innerHTML = "";

    balance.forEach((total,account) => {
        const tr = document.createElement("tr");
        tr.appendChild(document.createElement("td")).textContent = account;
        tr.appendChild(document.createElement("td")).textContent = total.toFixed(2);
        tbody.prepend(tr);
    });
}
