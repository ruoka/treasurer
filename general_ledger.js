// https://www.finlex.fi/fi/laki/alkup/2015/20151753
// https://koodistot.suomi.fi/codescheme;registryCode=sbr-fi-code-lists;schemeCode=MC-2023-1
// https://koodistot.suomi.fi/extension;registryCode=sbr-fi-code-lists;schemeCode=MC-2023-1;extensionCode=MC67

export let general_ledger  = {

    test: ["x360", // vastaavaa
            ["x513",
                ["x551","x816","x583"]]],

//    vastaavaa: [
    assets: [
        {code:"x360", name:"Vastaavaa"},
        {code:"x513", name:"Pysyvät vastaavat"},
        {code:"x551", name:"Aineettomat hyödykkeet"},
        {code:"x816", name:"Aineelliset hyödykkeet"},
        {code:"x583", name:"Sijoitukset"},

        {code:"x435", name:"Vaihtuvat vastaavat"},
        {code:"x807", name:"Vaihto-omaisuus"},
        {code:"x438", name:"Saamiset"},
        {code:"x578", name:"Rahoitusarvopaperit"},
        {code:"x399", name:"Rahat ja pankkisaamiset"},
    ],

//    vastattavaa: [
    net_assets: [
        {code:"x481", name:"Vastattavaa"},
        {code:"x376", name:"Oma pääoma"},
        {code:"x928", name:"Muut rahastot"},
        {code:"x1789", name:"Edellisten tilikausien ylijäämä (alijäämä)"},
        {code:"x1790", name:"Tilikauden ylijäämä (alijäämä), oma pääoma"},
        {code:"x432", name:"Tilinpäätössiirtojen kertymä"},
        {code:"x746", name:"Pakolliset varaukset"},
    ],

    liabilities: [
        {code:"x424", name:"Vieras pääoma"},
        {code:"x1818", name:"Lyhytaikaiset saadut ennakot"},
        {code:"x399", name:"Lyhytaikaiset ostovelat"},
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
