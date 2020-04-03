const fs = require('fs');

module.exports = {
    readFile: filePath => new Promise((resolve, reject) => {
        const result = {};
        fs.readFile(filePath, "utf8", (e, data) => {
            if (e) console.warn("Cannot read data file:", e.message);
            else {
                const lines = data.split("\n");
                for (let i = 0; i < lines.length; i++) {
                    const matches = lines[i].trim().match(/^([^=]+)(?:=(.*))?/);
                    if (matches) result[matches[1]] = matches[2] || "";
                }
            }
            resolve(result);
        });
    }),
    addItem: (filePath, name, value) => new Promise((resolve, reject) => {
        fs.appendFile(filePath, `${name}=${value}\n`, e => {
            if (e) reject(e);
            else resolve();
        });
    })/*,
    writeFile: (filePath, data) => new Promise((resolve, reject) => {
        fs.writeFile(filePath, Object.keys(data).map(i => `${i}=${data[i]}`).join("\n"), e => {
            if (e) reject(e);
            else resolve();
        });
    })*/
};
