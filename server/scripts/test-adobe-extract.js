// Register ts-node first to handle TypeScript imports
require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: "commonjs"
    }
});

const { adobeExtractFromFile } = require('../src/services/adobeExtract');
const path = require('path');

// Mock process.env if running directly without dotenv preload in dev
if (!process.env.PDF_SERVICES_CLIENT_ID) {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

async function runTest() {
    const pdfPath = process.argv[2];

    if (!pdfPath) {
        console.error('Usage: node scripts/test-adobe-extract.js <path-to-pdf>');
        process.exit(1);
    }

    console.log(`Testing Adobe Extract with file: ${pdfPath}`);
    console.log(`Using Client ID: ${process.env.PDF_SERVICES_CLIENT_ID ? '***' + process.env.PDF_SERVICES_CLIENT_ID.slice(-4) : 'MISSING'}`);

    try {
        const { structuredData, zipPath } = await adobeExtractFromFile(pdfPath);

        console.log('\n--- Extraction Success ---');
        console.log(`Output ZIP: ${zipPath}`);

        if (structuredData && structuredData.elements) {
            const elements = structuredData.elements;
            console.log(`Total Elements: ${elements.length}`);

            // Find first few headings
            const headings = elements.filter(el => el.Path && el.Path.endsWith('/H1')).slice(0, 3);

            if (headings.length > 0) {
                console.log('\n--- H1 Headings Found ---');
                headings.forEach(h => console.log(`- ${h.Text}`));
            } else {
                console.log('\nNo H1 headings found.');
            }
        } else {
            console.log('No structured elements found in JSON.');
        }

    } catch (err) {
        console.error('\n--- Extraction Failed ---');
        console.error(err);
        process.exit(1);
    }
}


runTest();
