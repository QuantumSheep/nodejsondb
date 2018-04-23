const fs = require('fs');

const tree = require('./tree');

module.exports = class JsonDb {
    /**
     * Initialize a new JSON database
     * 
     * @param {string} location The folder's path containing the database
     */
    init(location) {
        return new Promise(resolve => {
            this.location = location;

            this.generateDatabase().then(() => {
                fs.readFile(`${this.location}/tables-definitions.json`, (err, data) => {
                    if (err) console.log(err);

                    /**
                     * @type {{[key: string]: {properties: {[key: string]: any}}}
                     */
                    this.definitions = JSON.parse(data);

                    resolve();
                });
            });
        });
    }

    /**
     * Check the data and insert the new row
     * 
     * @param {string} table 
     * @param {{[key: string]: any}} data 
     */
    insert(table, data) {
        return new Promise((resolve, reject) => {
            this.tableExists(table, res => {
                if (res) {
                    const row = this.definitions[table].properties;

                    for(let i in row) {
                        row[i] = null;
                    }

                    for (let i in data) {
                        if (!(i in row)) {
                            return reject(`Unknown column '${i}' for table '${table}'.`);
                        }

                        row[i] = data[i];
                    }

                    this.push(table, row).then(() => {
                        resolve(true);
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    return reject(`Table '${table}' doesn't exists!`);
                }
            });
        });
    }

    /**
     * Insert the new row without checking
     * 
     * /!\ Use .insert() instead /!\
     * 
     * @param {string} table 
     * @param {{[key: string]: any}} data 
     */
    push(table, row) {
        return new Promise((resolve, reject) => {
            fs.exists(`${this.location}/tables/${table}.json`, exists => {
                if (exists) {
                    fs.readFile(`${this.location}/tables/${table}.json`, (err, data) => {
                        if (err) return reject(err);

                        /**
                         * @type {{[key: string]: any}[]}
                         */
                        const rows = JSON.parse(data);

                        rows.push(row)

                        fs.writeFile(`${this.location}/tables/${table}.json`, JSON.stringify(rows), err => {
                            if (err) return reject(err);

                            return resolve(true);
                        });
                    });
                } else {
                    fs.writeFile(`${this.location}/tables/${table}.json`, JSON.stringify([row]), err => {
                        if (err) return reject(err);

                        return resolve(true);
                    });
                }
            });
        });
    }

    /**
     * Check if a table exists
     * 
     * @param {string} name 
     * @param {(res: boolean) => void} callback 
     */
    tableExists(name, callback) {
        const deflength = Object.keys(this.definitions).length;

        if (deflength == 0) return callback(false);
        let j = 0;

        for (let i in this.definitions) {
            if (i == name) return callback(true);
            if (++j == deflength) return callback(false);
        }
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