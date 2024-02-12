const cron = require('node-cron');
const { scrapeNBAData } = require('./scraper.js');
const { generateHTMLFromJSON } = require('./htmlGenerator.js');

cron.schedule('59 10 * * *', () => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // January is 0
    const day = now.getDate().toString().padStart(2, '0');
    
    scrapeNBAData(year, month, day); }, {
    timezone: "AMERICA/Los_Angeles" // Provide your timezone, e.g., 'America/New_York'
    },

    generateHTMLFromJSON('data.json', 'index.pug')
);