const fs = require('fs');
const SsvDate = require('./SsvDate');
const paths = require('./paths');
const ss = require('./ss');
const cgd = require('./cgd');
const log = require('./log');
const mail = require('./mail');

const DOCUMENT_WARNING_DATE = 7; // date limit to retrieve document before sending a warning e-mail
const STATEMENT_WARNING_DATE = 7; // date limit to retrieve statement before sending a warning e-mail

const currentDate = SsvDate.getCurrent();
//const currentDate = new SsvDate(2019, 12, 21);
const previousMonth = currentDate.cloneAndDecrement();

// after the 20th the previous month should be paid, otherwise, only the month before the previous should be paid
// this is the date of the month that was paid, not the date of the payment
const lastPaidDate = currentDate.getDay() > 19 ? previousMonth : previousMonth.cloneAndDecrement();

const ssv = module.exports = {
    getCurrentDate: () => currentDate,
    getPreviousMonth: () => previousMonth,
    getLastPaidDate: () => lastPaidDate,
    
    // retrieve payment document from SS
	retrieveDocument: () => ss(ssv),
	
    // retrieve last payment statement from CGD
	retrieveStatement: cgd,
    
    // send an alert email if the document was not retrieved before the warning date
    checkDocument: async () => {
        // check if the payment document for the previous month was downloaded
        const date = previousMonth;
        const documentPath = paths.document(date);
        if (fs.existsSync(documentPath)) {
            console.log(`  OK: The document for ${date} was already downloaded.`);
            const name = `${date}-document-confirm-mail`;
            // send a confirmation e-mail
            if (!log.get(name)) {
                console.log("    Send payment document downloaded confirmation e-mail...");
                await log.mail(name, () => mail.sendAlert(`SSV ${date}`, `Foi transferido o documento de pagamento para ${date}.`, [documentPath]));
                console.log("    A confirmation e-mail was sent.");
            }
        }
        else if (currentDate.getDay() > DOCUMENT_WARNING_DATE) {
            console.log("  Warning: payment document was not yet retrieved.");
            const name = `${date}-document-alert-mail`;
            if (log.get(name)) console.log("A warning e-mail was already sent.");
            else {
                console.log("    Send warning e-mail...");
                await log.mail(name, () => mail.sendAlert(`AVISO - SSV ${date}`, `Não foi possível transferir automaticamente o documento de pagamento para ${date}.`))
                console.log("    A warning e-mail was sent.");
            }            
        }
        else console.log("    A warning e-mail will be sent if the document is not downloaded before the " + DOCUMENT_WARNING_DATE + "th");
    },
    
    // send an alert email if the statement was not retrieved before the warning date
    checkStatement: async () => {
        // check if the payment document for the last paid month was downloaded
        const date = lastPaidDate;
        const statementPath = paths.statement(date);
        if (!fs.existsSync(statementPath)) {
            if (currentDate.getDay() < 20 && currentDate.getDay() > STATEMENT_WARNING_DATE) {
                console.log("  Warning: statement was not yet retrieved.");
                const name = `${date}-statement-alert-mail`;
                if (log.get(name)) console.log("    A warning e-mail was already sent.");
                else {
                    console.log("    Send warning e-mail...");
                    await log.mail(name, () => mail.sendAlert(`AVISO - SSV ${date}`, `Não foi possível transferir automaticamente o comprovativo de pagamento para ${date}.`))
                    console.log("    A warning e-mail was sent.");
                }            
            }
            else console.log("    A warning e-mail will be sent if the statement is not downloaded before the " + STATEMENT_WARNING_DATE + "th");
        }
        else console.log(`  OK: The statement for ${date} was already downloaded.`);
    },
    
	// automatically retrieve statement if not present in the download folder
	autoRetrieveStatement: async () => {
		console.log("Run automatic payment statement retrieval script...");
		
        const date = lastPaidDate;
		const statementPath = paths.statement(date);
		if (fs.existsSync(statementPath)) console.log(`  Payment statement for ${date} already downloaded.`);
		else {
			console.log(`Retrieve payment statement for ${date}...`);
			return ssv.retrieveStatement();
		}
	},
    
    // automatically retrieve payment document if not present in the download folder
    autoRetrieveDocument: async () => {
		console.log("Run automatic payment document retrieval script...");
		//if (currentDate.getDay() > 20) console.log("Cannot retrieve payment documents after the 20th.");
        const date = previousMonth;
        const documentPath = paths.document(date);
        if (fs.existsSync(documentPath)) console.log(`  Payment document for ${date} already downloaded.`);
        else {
            console.log(`Retrieve payment document for ${date}...`);
            return ssv.retrieveDocument();
        }
	},
    
    // automatically send the SSV e-mail if the documents are present in the document folder
    autoSendMail: async () => {
		console.log("Run automatic SSV e-mail sending script...");
		
        const date = lastPaidDate;
        const name = `${date}-ssv-mail`;
		const emailName = `SSV e-mail for ${date}`;
        if (log.get(name)) console.log(`The ${emailName} was already sent`);
		else {
			const documentPath = paths.document(date);
			if (!fs.existsSync(documentPath)) {
				return console.warn(`Cannot send ${emailName}: no payment document`);
			}
			const statementPath = paths.statement(date);
			if (!fs.existsSync(statementPath)) {
				return console.warn(`Cannot send ${emailName}: no payment statement`);
			}
			
            // send ssv e-mail
            console.log(`Send ${emailName}...`);
            await log.mail(name, () => mail.sendSsv(date, [documentPath, statementPath]));
         	console.log(`The ${emailName} was sent.`);
		}
	}
};
