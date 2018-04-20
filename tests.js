const path = require('path');

const JsonDB = require('./src/app');

const db = new JsonDB(path.resolve('database'));

db.wait.then(() => {
    
});