// Register ts-node to handle imports if needed, though we'll use standard requires
require('ts-node').register({ transpileOnly: true });
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';
const TEST_EMAIL = `test_${Date.now()}@nirogi.ai`;
const TEST_PASSWORD = 'password123';

async function runE2E() {
    console.log('--- Starting Automated E2E Verification ---');

    try {
        // 1. Signup
        console.log(`1. Signing up user: ${TEST_EMAIL}`);
        const signupRes = await axios.post(`${API_URL}/api/v1/auth/signup`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            name: 'Test User'
        });
        const token = signupRes.data.token;
        console.log('   -> Signup Successful. Token received.');

        const authHeaders = { Authorization: `Bearer ${token}` };

        // 2. Create Patient
        console.log('2. Creating Patient...');
        const patientRes = await axios.post(`${API_URL}/api/v1/patients`, {
            displayName: 'Integrity Check Patient',
            dob: '1990-01-01',
            sex: 'M'
        }, { headers: authHeaders });
        const patientId = patientRes.data.id;
        console.log(`   -> Patient Created: ${patientId}`);

        // 3. Upload Document
        console.log('3. Uploading sample.pdf...');
        const formData = new FormData();
        const pdfPath = path.join(__dirname, '../sample.pdf');
        formData.append('file', fs.createReadStream(pdfPath));

        const uploadRes = await axios.post(`${API_URL}/api/v1/documents/patients/${patientId}/documents`, formData, {
            headers: {
                ...authHeaders,
                ...formData.getHeaders()
            }
        });
        const docId = uploadRes.data.id;
        console.log(`   -> Upload Successful. Document ID: ${docId}`);

        // 4. Trigger Parse
        console.log('4. Triggering Parse Job...');
        const parseTriggerRes = await axios.post(`${API_URL}/api/v1/documents/documents/${docId}/parse`, {}, { headers: authHeaders });
        console.log(`   -> Parse Triggered: ${parseTriggerRes.data.message}`);

        // 5. Poll for Completion
        console.log('5. Polling for completion...');
        let attempts = 0;
        let jobStatus = 'PENDING';

        while (attempts < 30) {
            attempts++;
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s

            const statusRes = await axios.get(`${API_URL}/api/v1/documents/documents/${docId}/parse-status`, { headers: authHeaders });
            const parseJob = statusRes.data.parseJob;

            if (parseJob) {
                jobStatus = parseJob.status;
                process.stdout.write(`.`);
                if (jobStatus === 'COMPLETED' || jobStatus === 'FAILED' || jobStatus === 'SUCCESS') {
                    console.log(`\n   -> Job Finished with status: ${jobStatus}`);
                    if (jobStatus === 'FAILED') {
                        console.error('Job Reason:', parseJob.reason);
                        process.exit(1);
                    }
                    break;
                }
            }
        }

        if (jobStatus !== 'COMPLETED' && jobStatus !== 'SUCCESS') {
            throw new Error('Timeout waiting for parse job');
        }

        // 6. Verify Parsed Content
        console.log('6. Verifying Parsed Content...');
        const parsedRes = await axios.get(`${API_URL}/api/v1/documents/documents/${docId}/parsed`, { headers: authHeaders });
        const chunks = parsedRes.data.chunks;

        if (chunks && chunks.length > 0) {
            console.log(`   -> Success! Found ${chunks.length} chunks.`);
            console.log(`   -> Sample Content: ${chunks[0].content.substring(0, 50)}...`);
            console.log('--- E2E Verification PASSED ---');
        } else {
            throw new Error('Job completed but no chunks found.');
        }

    } catch (err) {
        console.error('\n--- E2E Verification FAILED ---');
        if (err.code === 'ECONNREFUSED') {
            console.error('Connection refused! Is the server running?');
        } else if (err.response) {
            console.error(`API Error: ${err.response.status} ${err.response.statusText}`);
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message, err.stack);
        }
        process.exit(1);
    }
}

runE2E();
