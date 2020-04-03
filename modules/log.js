const dat = require('./dat.js'); // read and write data files

const LOG_FILE = "log.dat"; // keeps track of sent e-mails to prevent sending repeated e-mails

const log = module.exports = {
    log: null,
    // add log before and after executing a send e-mail callback
    mail: async (name, sendMailCallback) => {
        await log.add(name, `[${new Date()}] Sending...`);
        await log.add(name, JSON.stringify(await sendMailCallback()));
    },
    add: (name, value) => dat.addItem(LOG_FILE, name, value),
    init: async () => log.log = await dat.readFile(LOG_FILE),
    get: name => log.log[name]
};
