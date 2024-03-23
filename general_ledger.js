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
    revenue: [
        {id:5, name:"maksut"},
    ],
    expenses: [
        {id:6, name:"ostot"},
    ],

render: () => {
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
            tr.appendChild(document.createElement("td")).textContent = 0.00;
            table.append(tr);
        });
        let selects = all("#account, .accounts");
        selects.innerHTML = "";    
        selects.forEach(select => select.appendChild(group.cloneNode(true)));
    }
    let balance = one("table#balance tbody");
    balance.innerHTML = "";
    populate(balance,general_ledger.assets,"assets");
    populate(balance,general_ledger.net_assets,"net assets");
    populate(balance,general_ledger.liabilities,"liabilities");
    let pnl = one("table#PnL tbody");
    pnl.innerHTML = "";
    populate(pnl,general_ledger.revenue,"revenue");
    populate(pnl,general_ledger.expenses,"expenses");
}

};
