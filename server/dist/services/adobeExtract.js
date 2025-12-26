"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adobeExtractFromFile = adobeExtractFromFile;
const pdfservices_node_sdk_1 = require("@adobe/pdfservices-node-sdk");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const adm_zip_1 = __importDefault(require("adm-zip"));
async function adobeExtractFromFile(pdfPath) {
    // 1. Check Credentials
    const clientId = process.env.PDF_SERVICES_CLIENT_ID;
    const clientSecret = process.env.PDF_SERVICES_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error('Missing PDF_SERVICES_CLIENT_ID or PDF_SERVICES_CLIENT_SECRET');
    }
    try {
        // 2. Auth & Setup
        const credentials = new pdfservices_node_sdk_1.ServicePrincipalCredentials({
            clientId,
            clientSecret
        });
        const pdfServices = new pdfservices_node_sdk_1.PDFServices({ credentials });
        // 3. Create Upload Stream
        const readStream = fs_1.default.createReadStream(pdfPath);
        const uploadResult = await pdfServices.upload({
            readStream,
            mimeType: pdfservices_node_sdk_1.MimeType.PDF
        });
        // 4. Configure Extract Job
        const params = new pdfservices_node_sdk_1.ExtractPDFParams({
            elementsToExtract: [pdfservices_node_sdk_1.ExtractElementType.TEXT, pdfservices_node_sdk_1.ExtractElementType.TABLES]
        });
        const job = new pdfservices_node_sdk_1.ExtractPDFJob({
            inputAsset: uploadResult,
            params
        });
        // 5. Submit & Poll
        const pollingURL = await pdfServices.submit({ job });
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL,
            resultType: pdfservices_node_sdk_1.ExtractPDFResult
        });
        // 6. Handle Completion
        if (pdfServicesResponse.result) {
            const resultAsset = pdfServicesResponse.result.resource;
            const streamAsset = await pdfServices.getContent({ asset: resultAsset });
            // 7. Save ZIP to TMP
            const tmpDir = path_1.default.join(process.cwd(), 'tmp', 'adobe-extract');
            if (!fs_1.default.existsSync(tmpDir)) {
                fs_1.default.mkdirSync(tmpDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const zipPath = path_1.default.join(tmpDir, `extract-${timestamp}.zip`);
            const writeStream = fs_1.default.createWriteStream(zipPath);
            streamAsset.readStream.pipe(writeStream);
            // Wait for write to finish before reading
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            // 8. Read JSON from ZIP
            const zip = new adm_zip_1.default(zipPath);
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
        }
        else {
            throw new Error(`Extraction failed: ${pdfServicesResponse.status} - ${JSON.stringify(pdfServicesResponse.error)}`);
        }
    }
    catch (err) {
        console.error('Adobe Extract Error:', err);
        throw err;
    }
}
