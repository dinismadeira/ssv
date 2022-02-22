const fs = require('fs');
const config = require('../config');
const pp = require('./pp.js'); // puppeteer utils
const paths = require('./paths');
const SsvDate = require('./SsvDate');

const CGD_LOGIN_USR = config.cgdLoginUsr;
const CGD_LOGIN_PWD = config.cgdLoginPwd;
const CGD_LOGIN_URL = 'https://www.cgd.pt/Particulares/Pages/Particulares_v2.aspx';
const CGD_TRANS_URL = 'https://caixadirectaonline.cgd.pt/cdo/private/contasaordem/consultaSaldosMovimentos.seam';
const CGD_STATEMENT_NAME = 'comprovativo.pdf'; // the name of the file that is downloaded from CGD

// delete file without throwing errors if it doesn't exist
const deleteFile = file => new Promise(resolve => fs.unlink(file, resolve));

// wait for a file to be created
const waitFile = file => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject('Wait file time out'), 30000);
    const checkExists = () => {
        if (fs.existsSync(file)) {
            clearTimeout(timeout);
            resolve();
        }
        else setTimeout(checkExists, 1000);
    };
    checkExists();
});

module.exports = async () => {
    const page = await pp.getPage();
    console.log("Go to CGD...");
    await pp.load(page, CGD_LOGIN_URL);
	
	await pp.closePopup(page, '#onetrust-accept-btn-handler');
    await pp.sleep(1000);
    
	await page.click(`.direct-link.mobile`);
    await pp.sleep(1000);
    
    // go to login page
    await page.type('#input_cx1', CGD_LOGIN_USR);
    console.log("Go to login page...");
    await pp.submit(page, '#login_btn_1');

    await pp.closePopup(page, '#zeroHPModalPanel input, a[href*="fechar"]');
    
    // type password
    await page.type('#passwordInput', CGD_LOGIN_PWD);
    
    // submit
    console.log("Login...");
    await pp.submit(page, '#loginForm\\:submit');
    
    // go to transactions
    console.log("Go to transaction list...");
    await pp.load(page, CGD_TRANS_URL);
    
    // prepare download
    await deleteFile(CGD_STATEMENT_NAME);
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: process.cwd()});
    
    console.log("Search statement...");
    const lastStatementDateString = await page.evaluate(() => {
        const statementSpans = Array.from(document.querySelectorAll('span[title^="INST"]')).filter(e => /^INST.*GEST.*F/.test(e.title));
        const lastStatementSpan = statementSpans && statementSpans[0];
        if (lastStatementSpan) {
            const lastStatementRow = lastStatementSpan.parentNode.parentNode;
            const lastStatementLink = lastStatementRow.querySelector('a[title="Ver comprovativo"]');
            const lastStatementDateSpan = lastStatementRow.querySelector('td');
            if (!lastStatementDateSpan) throw new Error("Cannot parse date.");
            const lastStatementDateString = lastStatementDateSpan.innerText;
            lastStatementLink.click();
            return lastStatementDateString;
        }
        else throw new Error("No statement found.");
    });
    if (lastStatementDateString) {
        console.log("Statement found.");
        console.log("Download statement...");
        await waitFile(CGD_STATEMENT_NAME);
        
        const [lastStatementDay, lastStatementMonth, lastStatementYear] = lastStatementDateString.split('-');
        const lastStatementDate = new SsvDate(lastStatementYear, lastStatementMonth, lastStatementDay).cloneAndDecrement();
        fs.renameSync(CGD_STATEMENT_NAME, paths.statement(lastStatementDate));
        console.log("OK");
    }
    else console.error("No statement found!");
};
