// Necessary packages
const puppeteer = require('puppeteer');
const fs = require('fs');
const cron = require('node-cron');
const pug = require('pug');
const { parse } = require('path');

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


// Read data from JSON file
const data = fs.readFileSync('data.json');
const parsed = JSON.parse(data);

// Initialize an array to store HTML outputs for each game
const htmlOutputs = [];

// Iterate through each game
parsed.forEach(game => {
    const name = game.player;
    const statline = game.stats;
    const stats = statline.split('\t');

    // Parse stats for each game
    const points = parseInt(stats[0]);
    const rebounds = parseInt(stats[1]);
    const assists = parseInt(stats[2]);

    // Compile Pug template for each game
    const compiledFunction = pug.compileFile('index.pug', { pretty: true });
    const htmlOutput = compiledFunction({ name, points, rebounds, assists });

    // Store HTML output for each game
    htmlOutputs.push(htmlOutput);
});

// Write HTML outputs to separate files for each game
htmlOutputs.forEach((htmlOutput, index) => {
    const fileName = `../outputs/output_${index}.html`;
    fs.writeFile(fileName, htmlOutput, (err) => {
        if (err) throw err;
        console.log(`${fileName} has been saved!`);
    });
});


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