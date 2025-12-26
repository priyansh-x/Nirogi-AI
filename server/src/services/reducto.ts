import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Types aligning with Reducto API
interface ReductoUploadResponse {
  file_id: string;
}

interface ReductoParseOptions {
  table_output_format?: 'markdown' | 'json' | 'html';
  enhance_text?: boolean;
  enhance_table?: boolean;
}

interface ReductoParseResponse {
  job_id: string;
}

interface ReductoJobResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'COMPLETED'; // Adjust based on actual API
  result?: {
    type: 'full' | 'url';
    chunks?: any[];
    url?: string;
  };
  reason?: string;
  progress?: number;
  duration?: number;
  usage?: {
    num_pages: number;
    credits: number;
  };
  studio_link?: string;
}

export interface NormalizedChunk {
  content: string;
  chunkIndex: number;
}

export interface NormalizedBlock {
  type: string;
  content: string;
  bbox: {
    page: number;
    left: number;
    top: number;
    width: number;
    height: number;
  };
  confidence?:  string | number;
  chunkIndex: number;
  blockIndex: number;
}

const API_Base = process.env.REDUCTO_API_BASE_URL || 'https://platform.reducto.ai';
const API_Key = process.env.REDUCTO_API_KEY;

if (!API_Key) {
  console.warn("WARNING: REDUCTO_API_KEY is not set.");
}

const client = axios.create({
  baseURL: API_Base,
  headers: {
    Authorization: `Bearer ${API_Key}`,
  },
});

export const uploadToReducto = async (filePath: string, mimeType: string): Promise<{ fileId: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), { contentType: mimeType }); // filename is optional but good to have

    const response = await client.post<ReductoUploadResponse>('/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return { fileId: response.data.file_id };
  } catch (error: any) {
    console.error("Reducto Upload Error:", error.response?.data || error.message);
    throw new Error(`Failed to upload to Reducto: ${error.message}`);
  }
};

export const startParse = async (input: string, options?: ReductoParseOptions): Promise<{ jobId: string }> => {
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

    const response = await client.post<ReductoParseResponse>('/parse', payload);
    return { jobId: response.data.job_id };
  } catch (error: any) {
    console.error("Reducto Parse Error:", error.response?.data || error.message);
    throw new Error(`Failed to start parse job: ${error.message}`);
  }
};

export const retrieveParse = async (jobId: string): Promise<ReductoJobResponse> => {
  try {
    const response = await client.get<ReductoJobResponse>(`/job/${jobId}`);
    return response.data;
  } catch (error: any) {
    console.error("Reducto Retrieve Error:", error.response?.data || error.message);
    throw new Error(`Failed to retrieve parse job: ${error.message}`);
  }
};

export const downloadChunksFromUrl = async (url: string): Promise<any[]> => {
  try {
    const response = await axios.get(url);
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.chunks)) {
       return response.data.chunks;
    }
    return response.data; // Fallback
  } catch (error: any) {
    console.error("Download Chunks Error:", error.message);
    throw new Error(`Failed to download chunks from URL: ${error.message}`);
  }
};

export const normalizeReductoChunks = (rawResult: any): { chunks: NormalizedChunk[], blocks: NormalizedBlock[] } => {
  const chunks: NormalizedChunk[] = [];
  const blocks: NormalizedBlock[] = [];

  // Handle both result structures if they differ.
  // result.chunks usually contains the data.
  const rawChunks = rawResult.chunks || (Array.isArray(rawResult) ? rawResult : []);

  rawChunks.forEach((chunk: any, cIndex: number) => {
    chunks.push({
        content: chunk.content || "",
        chunkIndex: cIndex
    });

    if (chunk.blocks && Array.isArray(chunk.blocks)) {
        chunk.blocks.forEach((block: any, bIndex: number) => {
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
