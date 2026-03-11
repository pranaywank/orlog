import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    console.log("Navigating to /admin...");
    await page.goto('http://127.0.0.1:3000/admin', { waitUntil: 'networkidle0' });

    console.log("Typing password...");
    await page.type('input[type="password"]', 'orlog_admin_2024');

    console.log("Clicking Sign In...");
    await page.click('button[type="submit"]');

    try {
        await page.waitForSelector('table', { timeout: 10000 });
        console.log("Table appeared");
    } catch (e) {
        console.log("Table did not appear. Looking for error message...");
        const html = await page.content();
        if (html.includes("Failed to load sessions")) {
            console.log("Found error message: Failed to load sessions");
        } else {
            console.log("No table and no error. Here is the page text:");
            console.log(await page.$eval('body', el => el.innerText));
        }
    }

    await new Promise(r => setTimeout(r, 1000));

    const html = await page.content();
    if (html.includes("No sessions recorded yet.")) {
        console.log("RESULT: Found 'No sessions recorded yet.'");
    } else {
        const trs = await page.$$eval('tbody tr', rows => rows.length).catch(() => 0);
        console.log(`RESULT: Found ${trs} session rows in the table.`);
    }

    await browser.close();
    process.exit(0);
})();
