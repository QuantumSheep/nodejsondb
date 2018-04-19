const fs = require('fs');

const tree = require('./tree');

module.exports = class JsonDb {
    /**
     * Initialize a new JSON database
     * 
     * @param {string} location The folder's path containing the database
     */
    constructor(location) {
        this.wait = new Promise((resolve, reject) => {
            this.location = location;

            this.generateDatabase().then(() => {
                fs.readFile(`${this.location}/tables-definitions.json`, (err, data) => {
                    if (err) console.log(err);

                    /**
                     * @type {{name: string, properties: {name: string, type: string}}[]}
                     */
                    this.definitions = JSON.parse(data);

                    resolve();
                });
            });
        });
    }

    /**
     * Create a new table
     * 
     * @param {string} name 
     * @param {{name: string, type: string}[]} properties 
     */
    createTable(name, properties) {
        this.tableExists(name, res => {
            if (!res) {
                this.definitions.push({
                    name,
                    properties
                });

                this.pushTablesDefinitions();
            } else {
                console.log(`Table ${name} already exists.`);

                return false;
            }
        });
    }

    pushTablesDefinitions() {
        fs.writeFile(`${this.location}/tables-definitions.json`, JSON.stringify(this.definitions), (err) => {
            if (err) console.log(err);
        });
    }

    /**
     * Check if a table exists
     * 
     * @param {string} name 
     * @param {(res: boolean) => void} callback 
     */
    tableExists(name, callback) {
        if(this.definitions.length == 0) return callback(false);

        this.definitions.forEach((table, i) => {
            if (table.name == name) return callback(true);

            if (i + 1 == this.definitions.length) return callback(false);
        });
    }

    /**
     * Generate the database's files
     */
    async generateDatabase() {
        const directories = new Promise(resolve => {
            tree.directories.forEach((directory, i) => {
                if (!fs.existsSync(`${this.location}${directory}`)) {
                    fs.mkdirSync(`${this.location}${directory}`);
                }

                if (i + 1 == tree.directories.length) resolve(true);
            });
        });

        const files = new Promise(resolve => {
            const files_count = Object.keys(tree.files).length;
            let iterations = 0;

            for (let i in tree.files) {
                if (!fs.existsSync(`${this.location}${i}`)) {
                    fs.writeFileSync(`${this.location}${i}`, tree.files[i]);
                }

                if (iterations++ + 1 == files_count) resolve(true);
            }
        });

        return Promise.all([directories, files]);
    }
}