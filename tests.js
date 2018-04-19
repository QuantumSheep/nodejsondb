const path = require('path');

const JsonDB = require('./src/app');

const db = new JsonDB(path.resolve('database'));

db.wait.then(() => {
    db.createTable("users", {
        "id": "int",
        "email": "string",
        "username": "string",
        "password": "string",
        "created": "data"
    });
    
    db.createTable("users2", {
        "id": "int",
        "email": "string",
        "username": "string",
        "password": "string",
        "created": "data"
    });
    db.createTable("users2", {
        "id": "int",
        "email": "string",
        "username": "string",
        "password": "string",
        "created": "data"
    });
    db.createTable("users3", {
        "id": "int",
        "email": "string",
        "username": "string",
        "password": "string",
        "created": "data"
    });
    db.createTable("users4", {
        "id": "int",
        "email": "string",
        "username": "string",
        "password": "string",
        "created": "data"
    });
});