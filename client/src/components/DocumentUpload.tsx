import React, { useState } from 'react';
import { Upload, File, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { api } from '../lib/api';
import { Card } from './ui/Card';

interface DocumentUploadProps {
    patientId: string;
    onUploadSuccess: () => void;
}
export const DocumentUpload = ({ patientId, onUploadSuccess }: { patientId: string; onUploadSuccess: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setError(null);
        try {
            await api.post(`/patients/${patientId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFile(null);
            onUploadSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="p-4 border-dashed border-2 border-gray-200">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Upload size={24} />
                </div>
                <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-900">Upload Patient Documents</h3>
                    <p className="text-xs text-gray-500 mt-1">PDFs, Images up to 10MB</p>
                </div>

                <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    {!file ? (
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                            Select File
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md w-full">
                            <File size={16} className="text-gray-400" />
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">×</button>
                        </div>
                    )}

                    {file && (
                        <Button onClick={handleUpload} disabled={uploading} className="w-full">
                            {uploading ? <><Loader2 className="animate-spin mr-2" size={16} /> Uploading...</> : 'Upload Document'}
                        </Button>
                    )}

                    {error && <div className="text-red-600 text-xs flex items-center gap-1"><AlertCircle size={12} /> {error}</div>}
                </div>
            </div>
        </Card>
    );
};
