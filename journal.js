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