const PDFDocument = require('pdfkit');
const fs = require('fs');

async function createSamples() {
    // 1. Text PDF
    const docText = new PDFDocument();
    docText.pipe(fs.createWriteStream('sample_medical_text.pdf'));

    docText.fontSize(20).text('Medical Report', { align: 'center' });
    docText.moveDown();

    docText.fontSize(12).text('Patient: John Doe');
    docText.text('Date: 2023-10-27');
    docText.moveDown();

    docText.fontSize(16).text('Vitals');
    docText.fontSize(12).text('BP: 120/80');
    docText.text('HR: 72 bpm');
    docText.text('Weight: 75 kg');
    docText.moveDown();

    docText.fontSize(16).text('Allergies:');
    docText.fontSize(12).text('Penicillin, Peanuts');
    docText.moveDown();

    docText.fontSize(16).text('Medications:');
    docText.fontSize(12).text('Lisinopril 10mg, Atorvastatin 20mg');
    docText.moveDown();

    docText.end();
    console.log('Created sample_medical_text.pdf');

    // 2. Image PDF
    const imagePath = '/Users/priyanshjoshi/.gemini/antigravity/brain/d35e18a4-2bc9-49be-af22-c4b552a5749b/medical_report_scan_1766764690597.png';
    if (fs.existsSync(imagePath)) {
        const docImage = new PDFDocument();
        docImage.pipe(fs.createWriteStream('sample_medical_image.pdf'));

        docImage.image(imagePath, {
            fit: [500, 700],
            align: 'center',
            valign: 'center'
        });

        docImage.end();
        console.log('Created sample_medical_image.pdf');
    } else {
        console.error('Image file not found for sample_medical_image.pdf');
    }
}

createSamples();

