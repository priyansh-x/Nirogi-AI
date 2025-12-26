import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Activity, Upload, Brain, Network } from 'lucide-react';
import { clsx } from 'clsx';

export const Product = () => {
    const [activeTab, setActiveTab] = useState<'ingest' | 'process' | 'output'>('ingest');

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
                        <Activity size={24} />
                        <span>Nirogi AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link to="/product" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Product</Link>
                        <a href="#integrations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</a>
                        <Link to="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Docs</Link>
                        <div className="flex items-center gap-4 ml-4">
                            <Link to="/signin" className="text-foreground hover:text-blue-600 transition-colors">Sign in</Link>
                            <Link to="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header */}
            <header className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full -z-10"></div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                    The Engine for <span className="text-blue-600 dark:text-blue-400">Interoperability</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    A deep dive into how Nirogi AI transforms chaotic document streams into pristine FHIR resources.
                </p>
            </header>

            {/* Interactive Demo Section */}
            <section className="py-12 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex p-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            {(['ingest', 'process', 'output'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-sm",
                                        activeTab === tab ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center min-h-[400px]">
                        <div className="space-y-6">
                            {activeTab === 'ingest' && (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                                        <Upload size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Multi-Format Ingestion</h3>
                                    <p className="text-lg text-slate-600 dark:text-slate-300">
                                        Drag and drop any clinical document. We support:
                                    </p>
                                    <ul className="space-y-3 mt-4 text-muted-foreground">
                                        <li className="flex items-center gap-2"><CheckCircle /> PDF Medical Records</li>
                                        <li className="flex items-center gap-2"><CheckCircle /> Scanned Referral Letters (Handwritten)</li>
                                        <li className="flex items-center gap-2"><CheckCircle /> Lab Reports (JPG/PNG)</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 'process' && (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                                        <Brain size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">AI Extraction Pipeline</h3>
                                    <p className="text-lg text-muted-foreground">
                                        Our proprietary model, powered by Reducto, understands clinical layout.
                                    </p>
                                    <ul className="space-y-3 mt-4 text-muted-foreground">
                                        <li className="flex items-center gap-2"><CheckCircle /> Optical Character Recognition (OCR)</li>
                                        <li className="flex items-center gap-2"><CheckCircle /> Table Structure Recognition</li>
                                        <li className="flex items-center gap-2"><CheckCircle /> Handwriting Deciphering</li>
                                    </ul>
                                </div>
                            )}
                            {activeTab === 'output' && (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                                        <Network size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground">Structured Interoperability</h3>
                                    <p className="text-lg text-muted-foreground">
                                        Data is normalized to standard terminology (SNOMED-CT, RxNorm) and ready for export.
                                    </p>
                                    <ul className="space-y-3 mt-4 text-muted-foreground">
                                        <li className="flex items-center gap-2"><CheckCircle /> JSON / FHIR R4 Bundles</li>
                                        <li className="flex items-center gap-2"><CheckCircle /> Webhook Notifications</li>
                                        <li className="flex items-center gap-2"><CheckCircle /> Audit Logs & Provenance</li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-950 rounded-2xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden h-[400px]">
                            {/* High-Fidelity Visuals */}
                            {activeTab === 'ingest' && (
                                <div className="absolute inset-x-8 inset-y-8 flex flex-col items-center justify-center p-6 bg-slate-900/50 rounded-xl border border-slate-800/50 backdrop-blur-sm">
                                    <div className="relative w-full max-w-xs aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden transform rotate-[-2deg] transition-transform hover:rotate-0">
                                        {/* Mock Scanned Doc */}
                                        <div className="h-full w-full bg-[#f8f9fa] p-4 text-[4px] text-slate-400 space-y-2 select-none">
                                            <div className="w-1/3 h-2 bg-slate-800 rounded mb-4" />
                                            <div className="w-full h-1 bg-slate-300 rounded" />
                                            <div className="w-5/6 h-1 bg-slate-300 rounded" />
                                            <div className="w-full h-1 bg-slate-300 rounded" />
                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <div className="h-8 bg-blue-50/50 rounded border border-blue-100" />
                                                <div className="h-8 bg-blue-50/50 rounded border border-blue-100" />
                                            </div>
                                            <div className="flex justify-end mt-8">
                                                <div className="w-12 h-6 border-b-2 border-slate-400 transform -rotate-12 translate-y-2 opacity-50" /> {/* Signature */}
                                            </div>
                                            {/* Smeared Text effect */}
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent to-slate-900/5 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-12 flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full shadow-xl border border-slate-700 animate-bounce">
                                        <Upload size={14} className="text-blue-400" />
                                        <span className="text-xs font-bold text-white">Uploading Scan...</span>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'process' && (
                                <div className="w-full h-full flex items-center justify-center p-8">
                                    <div className="relative w-full max-w-sm">
                                        {/* Abstract Process Node */}
                                        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />

                                        <div className="relative bg-slate-900 rounded-xl border border-slate-700 p-6 shadow-2xl">
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <Brain size={16} className="text-purple-400" />
                                                    <span className="text-xs font-bold text-slate-300">NEURAL_EXTRACT_V2</span>
                                                </div>
                                                <span className="text-[10px] text-green-400 font-mono">ACTIVE</span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-400">Entity: Medication</span>
                                                    <span className="text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">Amoxicillin</span>
                                                </div>
                                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-purple-500 w-[98%] h-full rounded-full" />
                                                </div>

                                                <div className="flex items-center justify-between text-xs mt-2">
                                                    <span className="text-slate-400">Entity: Dosage</span>
                                                    <span className="text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">500mg</span>
                                                </div>
                                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-purple-500 w-[95%] h-full rounded-full" />
                                                </div>

                                                <div className="flex items-center justify-between text-xs mt-2">
                                                    <span className="text-slate-400">Normalization</span>
                                                    <span className="text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">RxNorm: 70618</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex justify-center">
                                                <div className="flex gap-1">
                                                    <div className="w-1 h-4 bg-purple-500 animate-[bounce_1s_infinite_0ms]" />
                                                    <div className="w-1 h-4 bg-purple-500 animate-[bounce_1s_infinite_200ms]" />
                                                    <div className="w-1 h-4 bg-purple-500 animate-[bounce_1s_infinite_400ms]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'output' && (
                                <div className="w-full h-full p-8 flex flex-col justify-center">
                                    <div className="bg-[#1e1e1e] rounded-lg shadow-2xl border border-slate-700 overflow-hidden font-mono text-xs">
                                        <div className="flex items-center px-4 py-2 bg-[#252526] border-b border-[#333]">
                                            <div className="flex gap-1.5 mr-4">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                            </div>
                                            <span className="text-slate-400">fhir_bundle.json</span>
                                        </div>
                                        <div className="p-4 text-[#d4d4d4] overflow-x-auto">
                                            <div><span className="text-[#569cd6]">"resourceType"</span>: <span className="text-[#ce9178]">"Bundle"</span>,</div>
                                            <div><span className="text-[#569cd6]">"type"</span>: <span className="text-[#ce9178]">"transaction"</span>,</div>
                                            <div><span className="text-[#569cd6]">"entry"</span>: [</div>
                                            <div className="pl-4">{`{`}</div>
                                            <div className="pl-8"><span className="text-[#569cd6]">"resource"</span>: {`{`}</div>
                                            <div className="pl-12"><span className="text-[#569cd6]">"resourceType"</span>: <span className="text-[#ce9178]">"Patient"</span>,</div>
                                            <div className="pl-12"><span className="text-[#569cd6]">"active"</span>: <span className="text-[#569cd6]">true</span>,</div>
                                            <div className="pl-12 border-l-2 border-green-500/50 bg-green-500/10"><span className="text-[#569cd6]">"name"</span>: [<span className="text-[#ce9178]">"Jane Doe"</span>]</div>
                                            <div className="pl-8">{`}`}</div>
                                            <div className="pl-4">{`}`}</div>
                                            <div>]</div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30">
                                            <CheckCircle />
                                            <span className="font-bold">Sync to Epic complete</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 bg-background text-center relative overflow-hidden">
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Ready to streamline your intake?</h2>
                <Link to="/signup">
                    <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-blue-500/20">Get Started for Free</Button>
                </Link>
            </section>
        </div>
    );
};

const CheckCircle = () => (
    <div className="text-blue-500 dark:text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
);
