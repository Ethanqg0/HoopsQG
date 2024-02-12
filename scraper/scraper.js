// Necessary packages
const puppeteer = require('puppeteer');
const fs = require('fs');
const cron = require('node-cron');

// Scrapes NBA data and saves it to a file
async function scrapeNBAData(year, month, day) {
    const url = `https://nba.com/games?date=${year}-${month}-${day}`;

    try {
        const browser = await puppeteer.launch({
            headless: true // Set to true for production use
        });
        const page = await browser.newPage();
        await page.goto(url);

        const games = await page.evaluate(() => {
            const gameElements = document.querySelectorAll('.GameCardLeaders_gclRow__VMSee');
            const gameData = Array.from(gameElements).map(game => {
                const lines = game.innerText.split('\n').filter(line => line.trim() !== '');
                const playerName = lines[0];
                const stats = lines[2];
                return {
                    player: playerName,
                    stats: stats
                };
            });
            return gameData;
        });

        fs.writeFileSync('data.json', JSON.stringify(games, null, 2));

        await browser.close();
    } catch (error) {
        console.log('Error:', error);
    }
}

/* HARD CODED TEST DATE
scrapeNBAData('2024', '02', '11');
*/

/* CRON JOB AUTOMATION
cron.schedule('0 23 * * *', () => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // January is 0
    const day = now.getDate().toString().padStart(2, '0');
    
    scrapeNBAData(year, month, day);
}, {
    timezone: "AMERICA/Los_Angeles" // Provide your timezone, e.g., 'America/New_York'
});
*/