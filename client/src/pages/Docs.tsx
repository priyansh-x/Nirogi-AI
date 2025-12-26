import React from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { BookOpen, FileText, Upload, Save, AlertCircle, Layers, Cpu, Database, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            {number}
        </div>
        <div className="pb-8 border-l border-slate-200 pl-8 ml-[-20px] last:border-0 last:pb-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
            <div className="text-slate-600 dark:text-slate-400 text-sm space-y-2 leading-relaxed">{children}</div>
        </div>
    </div>
);

export const Docs = () => {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Breadcrumbs items={[{ label: 'Documentation' }]} />

            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Documentation</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Learn how to maximize Nirogi AI's patient intake pipeline.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* The Solution Section */}
                    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="text-blue-600" />
                            The Nirogi Pipeline Solution
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Nirogi AI creates a standardized interoperability layer between unstructured data sources and your EHR. Our pipeline consists of 4 key stages:
                        </p>

                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-blue-600 mb-3"><Upload size={24} /></div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. Ingest</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Universal adapter accepts PDFs, Images, DICOM wrappers, and loose scanned pages from any clinic or lab.</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-purple-600 mb-3"><Cpu size={24} /></div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. Extract</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Reducto OCR & Layout models identify tables, key-value pairs, and continuous text blocks with 99% accuracy.</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-amber-600 mb-3"><Database size={24} /></div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. Normalize</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">LLM agents map entities to SNOMED-CT, RxNorm, and LOINC codes to ensure semantic interoperability.</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="text-green-600 mb-3"><Share2 size={24} /></div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">4. Integrate</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Final data is packaged as FHIR R4 Bundles and pushed via API to Epic, Cerner, or your data warehouse.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                            <BookOpen className="text-blue-600" size={24} />
                            Getting Started Guide
                        </h2>

                        <div className="space-y-2">
                            <Step number={1} title="Create a Patient">
                                <p>Navigate to the <Link to="/app/patients" className="text-blue-600 hover:underline">Patients</Link> tab and click <b>New Patient</b>. Enter the patient's basic demographic information to create their workspace.</p>
                            </Step>
                            <Step number={2} title="Upload Documents">
                                <p>Inside the Patient Detail view, go to the <b>Documents</b> tab. Upload PDF medical records, lab reports, or referral letters (max 10MB).</p>
                            </Step>
                            <Step number={3} title="Parse & Digitize">
                                <p>Click the <b>Parse</b> button on any uploaded document. Nirogi AI uses Reducto's advanced OCR to extract text, tables, and layout structure intact.</p>
                            </Step>
                            <Step number={4} title="Review & Profile">
                                <p>Extracted data is automatically structured into the <b>Profile</b> tab. Review medications, allergies, and history, then verify any flagged items.</p>
                            </Step>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Troubleshooting</h2>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <span>Analysis stuck on "Parsing..."?</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 px-4">
                                    Check if your `REDUCTO_API_KEY` is correctly set in the server environment variables. If the document is very large (&gt;50 pages), it may take up to 2 minutes.
                                </div>
                            </details>
                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800 p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <span>Upload failed?</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 px-4">
                                    Ensure the file is a valid PDF or Image and under 10MB. Check your network connection.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <AlertCircle size={20} />
                            Beta Notice
                        </h3>
                        <p className="text-blue-100 text-sm leading-relaxed opacity-90">
                            You are using the Nirogi AI MVP. Some features like exporting to FHIR or bidirectional syncing with Epic/Cerner are currently in development.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Resources</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                                    <FileText size={16} /> API Reference
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                                    <Upload size={16} /> Bulk Import Guide
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                                    <Save size={16} /> Data Security Policy
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
