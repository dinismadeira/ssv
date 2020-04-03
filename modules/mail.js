const nodemailer = require('nodemailer');
const config = require('../config');

// personal details
const FULLNAME = config.fullname;
const SHORTNAME = config.shortname;

// mail settings
const MAIL_LOGIN_USR = config.mailLoginUsr; 
const MAIL_LOGIN_PWD = config.mailLoginPwd;
const MAIL_FROM = config.mailFrom;
const MAIL_BCC = config.mailBcc; // send a carbon copy and alerts to this address
const MAIL_BODY = args => `Bom dia,

Envio anexo o comprovativo de pagamento do Seguro Social Voluntário referente a ${args.month} de ${args.year}.

Cumprimentos,
${args.name}`;

//const MAIL_SSV = '';
const MAIL_SSV = 'ssv@cern.tecnico.ulisboa.pt'; // address to send the payment statement and document

const MAIL_HOST = 'mail.tecnico.ulisboa.pt';
const MAIL_PORT = 465;
const MAIL_SECURE = true;

const mail = module.exports = {
    // send the SSV e-mail
	sendSsv: (date, attachments) => {
        const month = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][date.getMonth() - 1];
        const subject = `CERN - SSV - ${month}/${date.getYear()} - ${FULLNAME}`;
		return mail.send({
			from: MAIL_FROM,
			to: MAIL_SSV,
			bcc: MAIL_BCC,
			subject: subject,
			text: MAIL_BODY({year: date.getYear(), month: month, name: SHORTNAME}),
			attachments: attachments.map(attachment => ({path: attachment}))
		});
	},
    sendAlert: (subject, text, attachments = []) => mail.send({
        from: MAIL_FROM,
        to: MAIL_BCC,
        subject: subject,
        text: text,
        attachments: attachments.map(attachment => ({path: attachment}))
    }),
	// send an e-mail
	send: async message => {
		const transport = nodemailer.createTransport({
			host: MAIL_HOST,
			port: MAIL_PORT,
			secure: MAIL_SECURE,
			auth: {
			   user: MAIL_LOGIN_USR,
			   pass: MAIL_LOGIN_PWD
			}
		});
		const send = message => new Promise((resolve, reject) => {
			transport.sendMail(message, (e, result) => {
				if (e) reject(e);
				else resolve(result);
			});
		});
		//const result = message;
		const result = await send(message);
        console.log("Mail sent:", result);
		return result;
	}
};