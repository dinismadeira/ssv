(async () => {
    console.log(`-`);
    console.log(`SSV Script started on ${new Date()}...`);
    const init = Date.now();
	
	const pp = require('./modules/pp'); // puppeteer utils
	const ssv = require('./modules/ssv');
	const log = require('./modules/log');

    await log.init(); // log must be initialized before being used in ssv module
    
    console.log("Current month:   " + ssv.getCurrentDate());
    console.log("Previous month:  " + ssv.getPreviousMonth());
    console.log("Last paid month: " + ssv.getLastPaidDate());
	
    try {
        await ssv.autoRetrieveDocument();
        await ssv.autoRetrieveStatement();
        await ssv.autoSendMail();
    }
    catch (e) { console.error(e); }
    
    console.log("Checking if documents were downloaded...");
    await ssv.checkDocument(); // IMPORTANT: send confirmation and alert e-mails for payment document
    await ssv.checkStatement(); // IMPORTANT: send alert e-mails for statement document

	await pp.close();
    
    console.log(`Script finished in ${(Date.now() - init) / 1000} seconds.`);
    console.log(`-`);
})();
