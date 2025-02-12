// https://www.finlex.fi/fi/laki/alkup/2015/20151753
// https://koodistot.suomi.fi/codescheme;registryCode=sbr-fi-code-lists;schemeCode=MC-2024-1
// https://koodistot.suomi.fi/extension;registryCode=sbr-fi-code-lists;schemeCode=MC-2024-1;extensionCode=MC67
// https://koodistot.suomi.fi/extension;registryCode=sbr-fi-code-lists;schemeCode=MC-2024-1;extensionCode=MC66

export let general_ledger = {

    balance_sheet: [
        {
            "account": "1000",
            "member_id": 1,
            "code": "x360",
            "code_prelabel_en": "Assets",
            "code_prelabel_fi": "Vastaavaa",
            "relation": null,
            "order": 1,
            "open": false
        },
        {
            "account": "1100",
            "member_id": 10,
            "code": "x513",
            "code_prelabel_en": "Non-current assets",
            "code_prelabel_fi": "Pysyvät vastaavat",
            "relation": 1,
            "order": 2,
            "open": false
        },
        {
            "account": "1120",
            "member_id": 13,
            "code": "x583",
            "code_prelabel_en": "Investments",
            "code_prelabel_fi": "Sijoitukset",
            "relation": 10,
            "order": 22,
            "open": true
        },
        {
            "account": "1200",
            "member_id": 7,
            "code": "x435",
            "code_prelabel_en": "Current assets",
            "code_prelabel_fi": "Vaihtuvat vastaavat",
            "relation": 1,
            "order": 33,
            "open": false
        },
        {
            "account": "1210",
            "member_id": 16,
            "code": "x807",
            "code_prelabel_en": "Stocks",
            "code_prelabel_fi": "Vaihto-omaisuus",
            "relation": 7,
            "order": 34,
            "open": false
        },
        {
            "account": "1211",
            "member_id": 37,
            "code": "x1759",
            "code_prelabel_en": "Finished products",
            "code_prelabel_fi": "Valmiit tuotteet",
            "relation": 16,
            "order": 37,
            "open": true
        },
        {
            "account": "1212",
            "member_id": 35,
            "code": "x1760",
            "code_prelabel_en": "Other stocks",
            "code_prelabel_fi": "Muu vaihto-omaisuus",
            "relation": 16,
            "order": 38,
            "open": true
        },
        {
            "account": "1230",
            "member_id": 8,
            "code": "x438",
            "code_prelabel_en": "Receivables",
            "code_prelabel_fi": "Saamiset",
            "relation": 7,
            "order": false,
            "open": false
        },
        {
            "account": "1231",
            "member_id": 44,
            "code": "x1768",
            "code_prelabel_en": "Current receivables",
            "code_prelabel_fi": "Lyhytaikaiset saamiset",
            "relation": 8,
            "order": 50,
            "open": true
        },
        {
            "account": "1232",
            "member_id": 45,
            "code": "x1769",
            "code_prelabel_en": "Current trade receivables",
            "code_prelabel_fi": "Lyhytaikaiset myyntisaamiset",
            "relation": 44,
            "order": 51,
            "open": true
        },
        {
            "account": "1240",
            "member_id": 3,
            "code": "x399",
            "code_prelabel_en": "Cash and bank receivables",
            "code_prelabel_fi": "Rahat ja pankkisaamiset",
            "relation": 7,
            "order": 63,
            "open": true
        },
        {
            "account": "2000",
            "member_id": 9,
            "code": "x481",
            "code_prelabel_en": "Liabilities",
            "code_prelabel_fi": "Vastattavaa",
            "relation": null,
            "order": 64,
            "open": false
        },
        {
            "account": "2100",
            "member_id": 2,
            "code": "x376",
            "code_prelabel_en": "Equity",
            "code_prelabel_fi": "Oma pääoma",
            "relation": 9,
            "order": 65,
            "open": false
        },
        {
            "account": "2110",
            "member_id": 22,
            "code": "x928",
            "code_prelabel_en": "Other funds",
            "code_prelabel_fi": "Muut rahastot",
            "relation": 2,
            "order": 72,
            "open": false
        },
        {
            "account": "2111",
            "member_id": 20,
            "code": "x924",
            "code_prelabel_en": "Invested unrestricted equity fund",
            "code_prelabel_fi": "Sijoitetun vapaan oman pääoman rahasto",
            "relation": 22,
            "order": 73,
            "open": true
        },
        {
            "account": "2112",
            "member_id": 105,
            "code": "x4117",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Yhtiöjärjestyksen tai sääntöjen mukaiset rahastot",
            "relation": 22,
            "order": 75,
            "open": true
        },
        {
            "account": "2120",
            "member_id": 51,
            "code": "x1789",
            "code_prelabel_en": "Surplus for previous financial years (deficit)",
            "code_prelabel_fi": "Edellisten tilikausien ylijäämä (alijäämä)",
            "relation": 2,
            "order": 78,
            "open": true
        },
        {
            "account": "2130",
            "member_id": 52,
            "code": "x1790",
            "code_prelabel_en": "Surplus (deficit) for the financial year, equity",
            "code_prelabel_fi": "Tilikauden ylijäämä (alijäämä), oma pääoma",
            "relation": 2,
            "order": 79,
            "open": false
        },
        {
            "account": "2200",
            "member_id": 5,
            "code": "x424",
            "code_prelabel_en": "Creditors",
            "code_prelabel_fi": "Vieras pääoma",
            "relation": 9,
            "order": 89,
            "open": false
        },
        {
            "account": "2210",
            "member_id": 59,
            "code": "x1811",
            "code_prelabel_en": "Short-term creditors",
            "code_prelabel_fi": "Lyhytaikainen vieras pääoma",
            "relation": 5,
            "order": 103,
            "open": false
        },
        {
            "account": "2211",
            "member_id": 64,
            "code": "x1826",
            "code_prelabel_en": "Short-term accrued liabilities",
            "code_prelabel_fi": "Lyhytaikaiset siirtovelat",
            "relation": 59,
            "order": 104,
            "open": true
        },
        {
            "account": "2212",
            "member_id": 61,
            "code": "x1818",
            "code_prelabel_en": "Short-term advances received",
            "code_prelabel_fi": "Lyhytaikaiset saadut ennakot",
            "relation": 59,
            "order": 109,
            "open": true
        },
        {
            "account": "2213",
            "member_id": 62,
            "code": "x1819",
            "code_prelabel_en": "Short-term trade payables",
            "code_prelabel_fi": "Lyhytaikaiset ostovelat",
            "relation": 59,
            "order": 110,
            "open": true
        }
    ],

    income_statement: [
        {
            "account": "3100",
            "member_id": 7,
            "code": "x4221",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Tuotot, varsinainen toiminta",
            "relation": null,
            "order": 1,
            "open": true
        },
        {
            "account": "3200",
            "member_id": 8,
            "code": "x4222",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Kulut, varsinainen toiminta",
            "relation": null,
            "order": 2,
            "open": true
        },
        {
            "account": "4100",
            "member_id": 12,
            "code": "x4227",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Tuotot, varainhankinta",
            "relation": null,
            "order": 4,
            "open": true
        },
        {
            "account": "4200",
            "member_id": 13,
            "code": "x4228",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Kulut, varainhankinta",
            "relation": null,
            "order": 5,
            "open": true
        },
        {
            "account": "5100",
            "member_id": 15,
            "code": "x4230",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Tuotot, sijoitus- ja rahoitustoiminta",
            "relation": null,
            "order": 8,
            "open": true
        },
        {
            "account": "5200",
            "member_id": 16,
            "code": "x4231",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Kulut, sijoitus- ja rahoitustoiminta",
            "relation": null,
            "order": 10,
            "open": true
        },
        {
            "account": "3300",
            "member_id": 19,
            "code": "x4226",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Tuotto(kulu)-jäämä, varsinainen toiminta",
            "relation": null,
            "order": 9,
            "open": false
        },
        {
            "account": "4300",
            "member_id": 14,
            "code": "x4229",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Tuotto(kulu)-jäämä, varainhankinta",
            "relation": null,
            "order": 12,
            "open": false
        },
        {
            "account": "5300",
            "member_id": 17,
            "code": "x4232",
            "code_prelabel_en": null,
            "code_prelabel_fi": "Tuotto(kulu)-jäämä, sijoitus- ja rahoitustoiminta",
            "relation": null,
            "order": 13,
            "open": false
        },
        {
            "account": "6000",
            "member_id": 1,
            "code": "x75",
            "code_prelabel_en": "Results for the financial year",
            "code_prelabel_fi": "Tilikauden tulos",
            "relation": null,
            "order": 14,
            "open": false
        },
        {
            "account": "7000",
            "member_id": 3,
            "code": "x350",
            "code_prelabel_en": "Financial statement transfers + (-)",
            "code_prelabel_fi": "Tilinpäätössiirrot + (-)",
            "relation": null,
            "order": 15,
            "open": false
        },
        {
            "account": "8000",
            "member_id": 2,
            "code": "x77",
            "code_prelabel_en": "Surplus for the financial year (deficit)",
            "code_prelabel_fi": "Tilikauden ylijäämä (alijäämä)",
            "relation": null,
            "order": 19,
            "open": false
        }
    ],
};
