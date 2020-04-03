var config = {};

// Personal details
config.fullname = ''; // full name
config.shortname = config.fullname.replace(/ .+ /, ' '); //e-mail signature (default: first and last name)

// Segurança Social credentials
config.ssLoginUsr = ''; // NISS
config.ssLoginPwd = ''; // password

// Caixa Geral de Depósitos credentials
config.cgdLoginUsr = ''; // contract number
config.cgdLoginPwd = '';  // password

// E-mail credentials
config.mailLoginUsr = 'ist1xxxxx'; // ist username
config.mailLoginPwd = ''; // ist password
config.mailFrom = 'xxxxx@tecnico.ulisboa.pt'; // ist e-mail
config.mailBcc = ''; // send a carbon copy and alerts to this address

module.exports = config;