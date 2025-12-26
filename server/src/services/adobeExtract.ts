import {
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    ExtractPDFParams,
    ExtractElementType,
    ExtractPDFJob,
    ExtractPDFResult
} from '@adobe/pdfservices-node-sdk';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export async function adobeExtractFromFile(pdfPath: string): Promise<{ structuredData: any, zipPath: string }> {
    // 1. Check Credentials
    const clientId = process.env.PDF_SERVICES_CLIENT_ID;
    const clientSecret = process.env.PDF_SERVICES_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing PDF_SERVICES_CLIENT_ID or PDF_SERVICES_CLIENT_SECRET');
    }

    try {
        // 2. Auth & Setup
        const credentials = new ServicePrincipalCredentials({
            clientId,
            clientSecret
        });

        const pdfServices = new PDFServices({ credentials });

        // 3. Create Upload Stream
        const readStream = fs.createReadStream(pdfPath);
        const uploadResult = await pdfServices.upload({
            readStream,
            mimeType: MimeType.PDF
        });

        // 4. Configure Extract Job
        const params = new ExtractPDFParams({
            elementsToExtract: [ExtractElementType.TEXT, ExtractElementType.TABLES]
        });

        const job = new ExtractPDFJob({
            inputAsset: uploadResult,
            params
        });

        // 5. Submit & Poll
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: ExtractPDFResult
        });

        // 6. Handle Completion
        if (pdfServicesResponse.result) {
            const resultAsset = pdfServicesResponse.result.resource;
            const streamAsset = await pdfServices.getContent({ asset: resultAsset });

            // 7. Save ZIP to TMP
            const tmpDir = path.join(process.cwd(), 'tmp', 'adobe-extract');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const zipPath = path.join(tmpDir, `extract-${timestamp}.zip`);
            const writeStream = fs.createWriteStream(zipPath);
            streamAsset.readStream.pipe(writeStream);

            // Wait for write to finish before reading
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            // 8. Read JSON from ZIP
            const zip = new AdmZip(zipPath);
            const zipEntries = zip.getEntries();
            let structuredData = null;

            for (const entry of zipEntries) {
                if (entry.entryName === 'structuredData.json') {
                    const jsonText = entry.getData().toString('utf8');
                    structuredData = JSON.parse(jsonText);
                    break;
                }
            }

            if (!structuredData) {
                throw new Error('structuredData.json not found in result ZIP');
            }

            return { structuredData, zipPath };

        } else {
            const errorDetails = (pdfServicesResponse as any).error; // Cast to any to access error if type definition is missing
            throw new Error(`Extraction failed: ${pdfServicesResponse.status} - ${JSON.stringify(errorDetails)}`);
        }

    } catch (err) {
        console.error('Adobe Extract Error:', err);
        throw err;
    }
}
