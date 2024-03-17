export let journal = [{"header":{"reference":"A1","note":null,"file":null},"entries":[{"entry":"debit","date":"2023-12-10","account":"bank deposits","amount":11.11},{"entry":"credit","date":"2023-12-10","account":"fees","amount":11.11}]},{"header":{"reference":"A2","note":null,"file":null},"entries":[{"entry":"credit","date":"2023-12-10","account":"bank deposits","amount":22.22},{"entry":"debit","date":"2023-12-10","account":"fees","amount":11.11},{"entry":"debit","date":"2023-12-10","account":"taxes","amount":11.11}]},{"header":{"created":"2023-12-10","reference":"xxxx","note":"","file":""},"entries":[{"entry":"debit","date":"2023-12-10","account":"bank deposits","amount":4.00},{"entry":"credit","date":"2023-12-10","account":"dues","amount":2.00},{"entry":"credit","date":"2023-12-10","account":"fees","amount":1.00},{"entry":"credit","date":"2023-12-10","account":"costs","amount":1.00}]}];

/*
const journal = [
    {
        header: {created: Date.now, reference: "A1", note: null, file: null},
        entries: [
            {entry: "debit", date: new Date().toJSON().split("T")[0], account: "bank deposits", amount: 11.11},
            {entry: "credit", date: new Date().toJSON().split("T")[0], account: "fees", amount: 11.11}
        ]
    },
    {
        header: {created: Date.now, reference: "A2", note: null, file: null},
        entries: [
            {entry: "credit", date: new Date().toJSON().split("T")[0], account: "bank deposits", amount: 22.22},
            {entry: "debit", date: new Date().toJSON().split("T")[0], account: "fees", amount: 11.11},
            {entry: "debit", date: new Date().toJSON().split("T")[0], account: "taxes", amount: 11.11}
        ]
    }
];
*/
