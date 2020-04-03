const pp = require('./pp.js');

const ppscript = module.exports = {
	runCommand: (command, context = {}) => {
		command = command.trim();
		if (!command || /^\/\//.test(command)) return;
		let matches;
		const page = context.page;
		const arg = i => matches[i].trim().replace(/\$([^ ]+)/, (m, m1) => context[m1]);
		if (matches = command.match(/set (.+) (.+)/i)) return context[arg(1)] = arg(2);
		if (matches = command.match(/echo (.+)/i)) return console.log(arg(1));
		console.log(">", command);
		if (matches = command.match(/click (.+)/i)) return page.click(arg(1));
		if (matches = command.match(/clickvisible (.+)/i)) return pp.clickVisible(page, arg(1));
		if (matches = command.match(/closepopup (.+)/i)) return pp.closePopup(page, arg(1));
		if (matches = command.match(/load (.+)/i)) return pp.load(page, arg(1));
		if (matches = command.match(/sleep (.+)/i)) return pp.sleep(arg(1));
		if (matches = command.match(/submit (.+)/i)) return pp.submit(page, arg(1));
		if (matches = command.match(/type (.+), (.+)/i)) return page.type(arg(1), arg(2));
	},
	runCommands: async (commands, context = {}) => {
		if (!context.page) context.page = await pp.getPage();
		for (const command of commands) {
			try {
				await ppscript.runCommand(command, context);
			} catch (e) {
				return console.error(`Error running command:`, command.trim(), e);
			}
		}
		return context;
	},
	runScript: (script, context = {}) => ppscript.runCommands(ppscript.parseScript(script), context),
	parseScript: script => script.split("\n")
};
