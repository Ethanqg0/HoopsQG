const fs = require('fs');
const pug = require('pug');

function generateHTMLFromJSON(jsonFileName, pugFileName) {
    // Read data from JSON file
    const data = fs.readFileSync(jsonFileName);
    const parsed = JSON.parse(data);

    // Initialize an array to store HTML outputs for each game
    const htmlOutputs = [];

    // Iterate through each game
    parsed.forEach((game, index) => {
        const { player, stats } = game;
        const [points, rebounds, assists] = stats.split('\t').map(Number);

        // Compile Pug template for each game
        const compiledFunction = pug.compileFile(pugFileName, { pretty: true });
        const htmlOutput = compiledFunction({ name: player, points, rebounds, assists });

        // Store HTML output for each game
        htmlOutputs.push(htmlOutput);

        // Write HTML output to a separate file for each game
        const outputFileName = `output_${index}.html`;
        fs.writeFile(outputFileName, htmlOutput, (err) => {
            if (err) throw err;
            console.log(`${outputFileName} has been saved!`);
        });
    });
}

// Example usage:
// generateHTMLFromJSON('data.json', 'index.pug');

module.exports = { generateHTMLFromJSON };