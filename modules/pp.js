const BROWSER_HEADLESS = false;
const WINDOW_WIDTH = 1024;
const WINDOW_HEIGHT = 768;

let puppeteer, browser;

const pp = module.exports = {
    // get a page instance, initializing puppeteer and launching the browser if needed 
	getPage: async () => {
		const setupPage = page => {
            page.setViewport({width: WINDOW_WIDTH, height: WINDOW_HEIGHT});
			page.on('console', msg => {
			for (let i = 0; i < msg.args.length; ++i)
				console.log(`${i}: ${msg.args[i]}`);
			});
		};
		if (!puppeteer) {
			puppeteer = require('puppeteer');
			console.log("Launch browser...");
			browser = await puppeteer.launch({
				headless: BROWSER_HEADLESS,
				args: [`--window-size=${WINDOW_WIDTH},${WINDOW_HEIGHT}`]
			});
			const pages = await browser.pages();
			const page = pages[0];
			setupPage(page);
			console.log("OK");
			return page;
		}
		else {
			const page = await browser.newPage();
			setupPage(page);
			return page;
		}
	},
    // close a popup using the provided selector for the close button
	closePopup: async (page, selector) => {
		console.log("Close popup...");
		try {
			await page.waitForSelector(selector, {timeout: 10000});
			await page.click(selector);
		}
		catch (e) { console.log("Popup close button not found."); }
	},
    // click a button and wait for navigation
	submit: (page, selector) => Promise.all([
		pp.waitLoad(page),
        pp.clickVisible(page, selector)
	]),
    load: async (page, url) => {
        await page.goto(url, {waitUntil: 'networkidle0', timeout: 60000});
        console.log('Navigated to:', page.url());
    },
    waitLoad: async page => {
        await page.waitForNavigation({waitUntil: 'networkidle0', timeout: 60000});
        console.log('Navigated to:', page.url());
    },
    // click a button when it becomes visible
    clickVisible: async (page, selector) => {
        await page.waitForSelector(selector, {timeout: 10000, visible: true});
		return page.click(selector)
	},
    // wait a delay in miliseconds
	sleep: delay => new Promise(resolve => setTimeout(resolve, delay)),
    close: () => BROWSER_HEADLESS && browser && browser.close()
};
