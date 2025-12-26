import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Activity, FileText, ArrowRight, Clock, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { clsx } from 'clsx';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="border border-border rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 bg-card cursor-pointer shadow-sm hover:shadow-md"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-lg text-foreground">{question}</h3>
                <div className="text-muted-foreground transition-transform duration-300">
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
            <div className={clsx(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
            )}>
                <p className="text-muted-foreground leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

export const LandingPage = () => {
    const { toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed w-full bg-background/70 backdrop-blur-xl border-b border-border/50 z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" onClick={() => window.location.reload()} className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight cursor-pointer group">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Nirogi AI</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                        <Link to="/product" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Product</Link>
                        <a href="#integrations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Integrations</a>
                        <Link to="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Docs</Link>
                        <div className="h-4 w-px bg-border mx-2"></div>
                        <div className="flex items-center gap-4">
                            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors relative group">
                                <span className="sr-only">Toggle Theme</span>
                                <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-current"></div>
                                </div>
                                <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                            </button>
                            <Link to="/signin" className="text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">Sign in</Link>
                            <Link to="/signup">
                                <Button size="sm" className="shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-24 px-4 relative overflow-hidden">
                {/* Abstract Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
                <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> SOC2 Ready & HIPAA Compliant
                    </div>

                    <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Unified Patient Context <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">in Seconds.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Stop the data loss between rural clinics and urban hospitals.
                        Nirogi AI converts fragmented documents into structured, EHR-ready profiles instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <Link to="/signup">
                            <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-blue-200/50 dark:shadow-none bg-blue-600 hover:bg-blue-700 text-white border-0">
                                Start Free Trial <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                        <Link to="/product">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg bg-card/50 backdrop-blur-sm border-border text-foreground">
                                How It Works
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 border-y border-border bg-muted/50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Powering Validated Care Transitions At</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale dark:invert hover:grayscale-0 transition-all duration-500">
                        {/* Text Logos for sleekness */}
                        <div className="flex items-center justify-center font-bold text-xl font-serif">Apex Clinics</div>
                        <div className="flex items-center justify-center font-bold text-xl font-mono">MediCare+</div>
                        <div className="flex items-center justify-center font-bold text-xl tracking-tighter">URBAN HEALTH</div>
                        <div className="flex items-center justify-center font-bold text-xl italic">RapidDx</div>
                    </div>
                </div>
            </section>

            {/* Problem Section Rewrite */}
            <section className="py-32 bg-secondary/20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-foreground mb-6">The "Transfer Gap" is Dangerous.</h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                The core problem isn't just fragmentation—it's the critical delay created when transferring data from ABDM platforms to urban hospital EHRs.
                                This manual transfer leads to loss of important history and costs precious hours during emergency admissions.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Time is Tissue</h4>
                                        <p className="text-slate-600 dark:text-slate-400">Manual data entry delays treatment start by an average of 4 hours during transfers.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Data Leaks</h4>
                                        <p className="text-slate-600 dark:text-slate-400">Critical allergies and medication history are often lost in paper shuttles.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Abstract graphic representing broken connection fixed */}
                            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                            <div className="relative bg-card p-8 rounded-2xl shadow-2xl border border-border">
                                <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Input: Rural Clinic Scan</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Output: Urban EHR</div>
                                </div>
                                <div className="flex gap-4 items-center mb-4">
                                    <FileText className="text-slate-400" />
                                    <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 w-1/2 bg-red-500/50" /> {/* Broken line */}
                                    </div>
                                    <Activity className="text-slate-400" />
                                </div>
                                <div className="text-center text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded mb-6">
                                    Before: 4 Hour Delay • Missing History
                                </div>

                                <div className="flex gap-4 items-center">
                                    <FileText className="text-blue-600 dark:text-blue-400" />
                                    <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
                                        <div className="absolute inset-y-0 left-0 w-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
                                    </div>
                                    <Activity className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-center text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mt-2">
                                    With Nirogi: Instant Sync • Full Context
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Research & Validation - New Section */}
            <section className="py-24 bg-background border-y border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-2xl rounded-xl"></div>
                            <div className="relative bg-card p-8 rounded-xl shadow-2xl border border-border/50 backdrop-blur-md overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -z-10"></div>
                                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                        <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">Validation Study 2024</h4>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Journal of Medical Informatics</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-muted-foreground">Extraction Accuracy</span>
                                        <span className="font-bold text-green-600">99.2%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.2%' }}></div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-medium text-muted-foreground">Time Saved / Patient</span>
                                        <span className="font-bold text-blue-600">4.5 Hours</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-border">
                                    <p className="italic text-muted-foreground text-sm">"Nirogi AI demonstrated superior performance in handwriting recognition compared to standard OCR tools."</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Activity size={14} /> Clinical Validation
                            </div>
                            <h2 className="text-4xl font-bold text-foreground mb-6">Backed by Research. <br />Built for Safety.</h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                We don't just "guess" at medical data. Our pipeline is validated against double-blind datasets to ensure medication dosages and allergy flags are captured with near-perfect accuracy.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-foreground">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">✓</div>
                                    <span>Lower readmission rates due to complete history.</span>
                                </li>
                                <li className="flex items-center gap-3 text-foreground">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">✓</div>
                                    <span>Zero hallucinations on dosage values.</span>
                                </li>
                                <li className="flex items-center gap-3 text-foreground">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">✓</div>
                                    <span>SOC2 Type II Certified Infrastructure.</span>
                                </li>
                            </ul>
                            <Button variant="outline">Read the Whitepaper</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews / Testimonials */}
            <section className="py-24 bg-secondary/20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-16">Trusted by Clinical Directors</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                            <div className="flex text-yellow-500 mb-4 drop-shadow-sm">★★★★★</div>
                            <p className="text-foreground/90 mb-6 leading-relaxed italic">"The fragmentation problem in India is real. Nirogi AI solved our intake bottleneck in 2 weeks. We process 500+ scanned reports daily now."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-background">RK</div>
                                <div>
                                    <h5 className="font-bold text-foreground">Dr. Rajesh Kumar</h5>
                                    <p className="text-xs text-muted-foreground">Director, City Hospital</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">Case Study</div>
                            <div className="flex text-yellow-500 mb-4 drop-shadow-sm">★★★★★</div>
                            <p className="text-foreground/90 mb-6 leading-relaxed italic">"We used to spend 20 minutes per patient just typing in old history. Now it's instant. The API integration with our EHR was flawless."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-background">SJ</div>
                                <div>
                                    <h5 className="font-bold text-foreground">Sarah Jenkins</h5>
                                    <p className="text-xs text-muted-foreground">CTO, MediFlow Systems</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                            <div className="flex text-yellow-500 mb-4 drop-shadow-sm">★★★★★</div>
                            <p className="text-foreground/90 mb-6 leading-relaxed italic">"Finally, an interoperability tool that actually handles messy, handwritten referral notes correctly. It's a game changer for rural referrals."</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-background">AS</div>
                                <div>
                                    <h5 className="font-bold text-foreground">Dr. Ananya Singh</h5>
                                    <p className="text-xs text-muted-foreground">Head of Emergency, Metro Care</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-background relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full -z-10"></div>
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground">Everything you need to know about the Nirogi pipeline.</p>
                    </div>
                    <div className="space-y-4">
                        <FAQItem
                            question="Is patient data stored securely?"
                            answer="Yes. We are SOC2 Ready and HIPAA compliant. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). We sign BAAs with all enterprise customers."
                        />
                        <FAQItem
                            question="Can it handle handwritten notes?"
                            answer="Absolutely. Our Reducto-powered OCR engine is specifically fine-tuned on doctor handwriting and complex medical forms."
                        />
                        <FAQItem
                            question="Do you integrate with Epic/Cerner?"
                            answer="We output standard FHIR R4 resources which are compatible with all major EHRs. Native 'App Store' integrations are coming in Q3."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 dark:bg-black border-t border-slate-800 py-12 text-slate-400">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight mb-4">
                            <Activity size={24} />
                            <span>Nirogi AI</span>
                        </div>
                        <p className="text-sm max-w-sm">Building the interoperability layer for modern healthcare. Secure, fast, and accurate.</p>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-4">Product</h5>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/product" className="hover:text-white">Features</Link></li>
                            <li><a href="#" className="hover:text-white">Integrations</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                            <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-foreground font-bold mb-4">Company</h5>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-primary">About</a></li>
                            <li><a href="#" className="hover:text-primary">Contact</a></li>
                            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800 text-xs flex justify-between items-center">
                    <span>© 2024 Nirogi AI Inc. All rights reserved.</span>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-white">Twitter</a>
                        <a href="#" className="hover:text-white">LinkedIn</a>
                        <a href="#" className="hover:text-white">GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
