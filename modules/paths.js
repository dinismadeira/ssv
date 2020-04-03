const path = require('path');

const DOC_FOLDER = 'comprovativos'; // the name of the document folder
const STATEMENT_NAME = 'comprovativo.pdf'; // the name of statements in the document folder
const DOCUMENT_NAME = 'documento.pdf'; // the name of payment documents in the document folder

const getBasePath = date => DOC_FOLDER + path.sep + date;
const getFilePath = (date, file) => getBasePath(date) + "-" + file;
const getStatementPath = date => getFilePath(date, STATEMENT_NAME);
const getDocumentPath = date => getFilePath(date, DOCUMENT_NAME);

// make sure documents folder exists
(() => {
    const fs = require('fs');
    if (!fs.existsSync(DOC_FOLDER)) fs.mkdirSync(DOC_FOLDER);
});

module.exports = {
    statement: getStatementPath,
    document: getDocumentPath
};
