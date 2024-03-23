import {one,all} from "./query.js";

export let general_ledger  = {

    assets: [
        {id:1, name:"saatavat"},
        {id:2, name:"pankkisaamiset"},
    ],
    net_assets: [
        {id:3, name:"rahastot"},
    ],
    liabilities: [
        {id:4, name:"velat"},
    ],
    revenues: [
        {id:5, name:"maksut"},
    ],
    expenses: [
        {id:6, name:"ostot"},
    ],

render: (balances) => {
    let populate = (table,name,category) => {

        const group = document.createElement("optgroup");
        group.label = name;

        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.setAttribute("colspan","2");
        th.textContent = name;
        tr.appendChild(th);
        tr.appendChild(document.createElement("th"));
        table.append(tr);

        category.forEach(account => {

            let option = document.createElement("option");
            option.value = account.name;
            option.textContent = account.name;
            group.appendChild(option);

            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td"));
            tr.appendChild(document.createElement("td")).textContent = account.name;
            if(balances !== undefined && balances.has(account.name))
                tr.appendChild(document.createElement("td")).textContent = balances.get(account.name);
            else
                tr.appendChild(document.createElement("td")).textContent = 0.00;
            table.append(tr);

        });
        all("#account, .accounts").forEach(select => select.appendChild(group.cloneNode(true)));
    };

    all("#account, .accounts").forEach(select => select.innerHTML = "");

    const tbody1 = one("table#balance tbody");
    tbody1.innerHTML = "";
    populate(tbody1,"assets",general_ledger.assets);
    populate(tbody1,"net assets",general_ledger.net_assets);
    populate(tbody1,"liabilities",general_ledger.liabilities);

    const tbody2 = one("table#PnL tbody");
    tbody2.innerHTML = "";
    populate(tbody2,"revenues",general_ledger.revenues);
    populate(tbody2,"expenses",general_ledger.expenses);
}

};
