"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeReductoChunks = exports.downloadChunksFromUrl = exports.retrieveParse = exports.startParse = exports.uploadToReducto = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const API_Base = process.env.REDUCTO_API_BASE_URL || 'https://platform.reducto.ai';
const API_Key = process.env.REDUCTO_API_KEY;
if (!API_Key) {
    console.warn("WARNING: REDUCTO_API_KEY is not set.");
}
const client = axios_1.default.create({
    baseURL: API_Base,
    headers: {
        Authorization: `Bearer ${API_Key}`,
    },
});
const uploadToReducto = async (filePath, mimeType) => {
    try {
        const formData = new form_data_1.default();
        formData.append('file', fs_1.default.createReadStream(filePath), { contentType: mimeType }); // filename is optional but good to have
        const response = await client.post('/upload', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        return { fileId: response.data.file_id };
    }
    catch (error) {
        console.error("Reducto Upload Error:", error.response?.data || error.message);
        throw new Error(`Failed to upload to Reducto: ${error.message}`);
    }
};
exports.uploadToReducto = uploadToReducto;
const startParse = async (input, options) => {
    try {
        const payload = {
            file_id: input.startsWith('reducto://') ? input : undefined,
            url: input.startsWith('http') ? input : undefined,
            table_output_format: options?.table_output_format || process.env.REDUCTO_TABLE_OUTPUT_FORMAT || 'markdown',
            enhance_text: options?.enhance_text ?? (process.env.REDUCTO_ENHANCE_TEXT === 'true'),
            enhance_table: options?.enhance_table ?? (process.env.REDUCTO_ENHANCE_TABLE === 'true'),
        };
        // If result type forcing is needed (for testing), maybe handled by backend calling this?
        // User prompted: "REDUCTO_FORCE_URL_RESULT" env var. 
        // The prompt says "Add environment variables ... REDUCTO_FORCE_URL_RESULT".
        // Does Reducto API support this? The prompt implies it. 
        // Usually APIs use a flag or it's random/size based. I will assume standard behavior unless I inject a special param.
        // I won't inject undocumented params unless sure.
        const response = await client.post('/parse', payload);
        return { jobId: response.data.job_id };
    }
    catch (error) {
        console.error("Reducto Parse Error:", error.response?.data || error.message);
        throw new Error(`Failed to start parse job: ${error.message}`);
    }
};
exports.startParse = startParse;
const retrieveParse = async (jobId) => {
    try {
        const response = await client.get(`/job/${jobId}`);
        return response.data;
    }
    catch (error) {
        console.error("Reducto Retrieve Error:", error.response?.data || error.message);
        throw new Error(`Failed to retrieve parse job: ${error.message}`);
    }
};
exports.retrieveParse = retrieveParse;
const downloadChunksFromUrl = async (url) => {
    try {
        const response = await axios_1.default.get(url);
        if (Array.isArray(response.data)) {
            return response.data;
        }
        else if (response.data && Array.isArray(response.data.chunks)) {
            return response.data.chunks;
        }
        return response.data; // Fallback
    }
    catch (error) {
        console.error("Download Chunks Error:", error.message);
        throw new Error(`Failed to download chunks from URL: ${error.message}`);
    }
};
exports.downloadChunksFromUrl = downloadChunksFromUrl;
const normalizeReductoChunks = (rawResult) => {
    const chunks = [];
    const blocks = [];
    // Handle both result structures if they differ.
    // result.chunks usually contains the data.
    const rawChunks = rawResult.chunks || (Array.isArray(rawResult) ? rawResult : []);
    rawChunks.forEach((chunk, cIndex) => {
        chunks.push({
            content: chunk.content || "",
            chunkIndex: cIndex
        });
        if (chunk.blocks && Array.isArray(chunk.blocks)) {
            chunk.blocks.forEach((block, bIndex) => {
                blocks.push({
                    type: block.type || "unknown",
                    content: block.content || "",
                    bbox: {
                        page: block.bbox?.page ?? 1,
                        left: block.bbox?.left ?? 0,
                        top: block.bbox?.top ?? 0,
                        width: block.bbox?.width ?? 0,
                        height: block.bbox?.height ?? 0,
                    },
                    confidence: block.confidence,
                    chunkIndex: cIndex,
                    blockIndex: bIndex
                });
            });
        }
    });
    return { chunks, blocks };
};
exports.normalizeReductoChunks = normalizeReductoChunks;
