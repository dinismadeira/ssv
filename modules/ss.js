const fs = require('fs');
const config = require('../config');
const pp = require('./pp.js'); // puppeteer utils
const paths = require('./paths');

const SS_LOGIN_USR = config.ssLoginUsr;
const SS_LOGIN_PWD = config.ssLoginPwd;
const SS_LOGIN_URL = 'https://app.seg-social.pt/sso/login?service=https%3A%2F%2Fapp.seg-social.pt%2Fptss%2Fcaslogin';
const SS_SEARCH_DOC_URL = 'https://app.seg-social.pt/ptss/ci/documento-pagamento/pesquisar-doc-pagamento';

let previousMonth;

const login = async page => {
    // open main page
    console.log("Go to SS...");
    await pp.load(page, SS_LOGIN_URL);
    
    // login
    await page.type('#username', SS_LOGIN_USR);
    await page.type('#password', SS_LOGIN_PWD);
    console.log("Login...");
    await pp.submit(page, `input[name="submitBtn"]`);
};

const searchDocument = async (page, issued) => {

    // go to document search page
    console.log("Go to document search page...");
    await pp.load(page, SS_SEARCH_DOC_URL);
    await pp.sleep(1000); // some actions are not available right away
    
    const SS_ISSUE_DOCUMENT_SELECTOR = "#form\\:sim";
    if (await page.$(SS_ISSUE_DOCUMENT_SELECTOR) === null) {
        console.log("There are no pending payments.");
        const SS_BTN_ACTION = "#form\\:DPDataTable\\:0\\:acoes_button";
        
        if (await page.$(SS_BTN_ACTION) === null) {
            console.log("There are no issued payment documents.");
        }
        else {
            console.log("There is a payment document already issued.");
            await page.click(SS_BTN_ACTION);
            console.log("View payment document...");
            await pp.submit(page, "#form\\:DPDataTable\\:0\\:acoes_menu > * > *:nth-child(4)");
            await saveDocument(page);
        }
    }
    else if (issued) {
        console.warn("Warning: cannot find the issued document. Something must have gone wrong.");
    }
    else {
        console.log("Issue document...");
        await pp.submit(page, SS_ISSUE_DOCUMENT_SELECTOR);
        await page.click("#ciEmissaoDocumentoPagamentoWizardForm\\:escolherTipoDocumentoRadio_0");
        await pp.sleep(1000);
        const SS_BTN_NEXT = "#ciEmissaoDocumentoPagamentoWizardForm\\:ciEmissaoDocumentoPagamentoWizardNextBtn";
        console.log("Select type...");
        await page.click(SS_BTN_NEXT);
        await page.waitForSelector("#ciEmissaoDocumentoPagamentoWizardForm\\:ciEmissaoDocumentoPagamentoWizardStepSelecaoValoresPorPagar");
        console.log("OK");
        await pp.sleep(1000);
        console.log("Summary...");
        await page.click(SS_BTN_NEXT);
        await page.waitForSelector("#ciEmissaoDocumentoPagamentoWizardForm\\:ciEmissaoDocumentoPagamentoWizardStepSelecaoConfirmacao");
        console.log("OK");
        await pp.sleep(1000);
        console.log("Issue...");
        await pp.submit(page, "#ciEmissaoDocumentoPagamentoWizardForm\\:ciEmissaoDocumentoPagamentoWizardFinish");
        console.log("OK");
        await searchDocument(page, true);
    }
};

const saveDocument = async page => {
    console.log("Retrieve PDF data...");
    const hexData = await page.evaluate(async () => {
        const url = document.querySelector(`[type="application/pdf"]`).getAttribute("data");
        const response = await fetch(url);
        const data = await response.arrayBuffer();
        return Array.prototype.map.call(new Uint8Array(data), n => n.toString(16).padStart(2, "0")).join(""); // hex
    });
    console.log("Save PDF file...");
    const data = new Uint8Array(hexData.match(/.{1,2}/g).map(s => parseInt(s, 16)));
    fs.writeFileSync(paths.document(previousMonth), data);
    console.log("OK");
};

module.exports = async ssv => {
    previousMonth = ssv.getPreviousMonth();
    const page = await pp.getPage();
    await login(page);
    await searchDocument(page);
};
