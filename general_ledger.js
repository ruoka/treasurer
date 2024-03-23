const one = selectors => document.querySelector(selectors);
const all = selectors => document.querySelectorAll(selectors);

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
    let populate = (table,category,name) => {
        let group = document.createElement("optgroup");
        group.label = name;
        category.forEach(account => {
            let option = document.createElement("option");
            option.value = account.name;
            option.textContent = account.name;
            group.appendChild(option);
            const tr = document.createElement("tr");
            tr.appendChild(document.createElement("td")).textContent = account.name;
            if(balances !== undefined && balances.has(account.name))
                tr.appendChild(document.createElement("td")).textContent = balances.get(account.name);
            else
                tr.appendChild(document.createElement("td")).textContent = 0.00;
            table.append(tr);
        });
        let selects = all("#account, .accounts");
        selects.innerHTML = "";    
        selects.forEach(select => select.appendChild(group.cloneNode(true)));
    }
    const tbody1 = one("table#balance tbody");
    tbody1.innerHTML = "";
    populate(tbody1,general_ledger.assets,"assets");
    populate(tbody1,general_ledger.net_assets,"net assets");
    populate(tbody1,general_ledger.liabilities,"liabilities");
    const tbody2 = one("table#PnL tbody");
    tbody2.innerHTML = "";
    populate(tbody2,general_ledger.revenues,"revenues");
    populate(tbody2,general_ledger.expenses,"expenses");
}

};
