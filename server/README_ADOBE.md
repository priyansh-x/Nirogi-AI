# Nirogi AI - Developer Runbook

## Adobe PDF Extract API Integration

This project uses Adobe Acrobat Services PDF Extract API as an alternative to Reducto for parsing PDF documents.

### 1. Prerequisites
- **Node.js 18+**
- Active **Adobe PDF Services API Credentials**. You can get a free trial from [Adobe Acrobat Services](https://developer.adobe.com/document-services/apis/pdf-extract/).

### 2. Local Setup
Install the required dependencies in the `server` directory:

```bash
cd server
npm install --save @adobe/pdfservices-node-sdk adm-zip
```

### 3. Environment Configuration
You need to add your Adobe credentials to the `server/.env` file. 

Add the following variables:
```bash
PDF_SERVICES_CLIENT_ID="<your_client_id>"
PDF_SERVICES_CLIENT_SECRET="<your_client_secret>"
PARSER_PROVIDER="adobe" # Set to 'mock' to use default behavior or 'adobe' to use Adobe Extract
```
*Note: These values are typically found in `pdfservices-api-credentials.json` provided by Adobe. Do NOT commit your credentials.*

### 4. How to Test
A standalone test script is available to verify the integration without running the full backend.

**Run the test script:**
```bash
# From server directory
node scripts/test-adobe-extract.js ./path/to/sample.pdf
```

**Expected Output:**
- Counts of extracted elements.
- First 3 H1 headings found in the document.
- Path to the raw ZIP output saved in `tmp/adobe-extract/`.

```text
Testing Adobe Extract with file: ./sample.pdf
Using Client ID: ***1234

--- Extraction Success ---
Output ZIP: .../server/tmp/adobe-extract/extract-2023-10-27T10-00-00.zip
Total Elements: 154

--- H1 Headings Found ---
- Medical Report
- Patient History
```

### 5. Troubleshooting
- **Missing Credentials**: Ensure `PDF_SERVICES_CLIENT_ID` and `PDF_SERVICES_CLIENT_SECRET` are set in `.env`.
- **Extraction Failed**: Check the console logs for specific error codes (e.g., 401 Unauthorized, 429 Too Many Requests).
- **Output**: Detailed logs are printed to the console during execution.
