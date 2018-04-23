const path = require('path');

const JsonDB = require('./src/app');

const db = new JsonDB();
db.init(path.resolve('database')).then(() => {
    db.insert("user", {
        "id": 1,
        "username": "Demo",
        // "email": "test@demo.fr",
        "password": "demodemo"
    }).catch(err => {
        console.log(err);
    });
});