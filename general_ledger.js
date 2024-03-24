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

    isPnL: (account) => {
       return general_ledger.revenues.find(a => a.name == account) ||
               general_ledger.expenses.find(a => a.name == account);
    }
};
