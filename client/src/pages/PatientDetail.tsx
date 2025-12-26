import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { DocumentUpload } from '../components/DocumentUpload';
import { ParsedDebugView } from '../components/ParsedDebugView';
import { FileText, Play, AlertTriangle, Loader2, Activity, AlertOctagon } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

// Hook for Polling
function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = React.useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export const PatientDetail = () => {
    const { id } = useParams();
    const { toast } = useToast();

    // State
    const [patient, setPatient] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [parsedData, setParsedData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('documents');
    const [activeDocId, setActiveDocId] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        const init = async () => {
            try {
                const pRes = await axios.get(`http://localhost:3000/api/v1/patients/${id}`);
                setPatient(pRes.data);
                await fetchDocuments();
            } catch (err) {
                console.error(err);
                toast('Failed to load patient data', 'error');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    const fetchDocuments = async () => {
        try {
            const dRes = await axios.get(`http://localhost:3000/api/v1/patients/${id}/documents`);
            setDocuments(dRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Polling for status
    const parsingDocs = documents.filter(d => ['PARSING', 'UPLOADED'].includes(d.status));
    useInterval(() => {
        fetchDocuments();
    }, parsingDocs.length > 0 ? 3000 : null);

    // Actions
    const handleParse = async (docId: string) => {
        try {
            await axios.post(`http://localhost:3000/api/v1/documents/${docId}/parse`);
            toast('Analysis started with Reducto', 'info');
            fetchDocuments();
        } catch (err) {
            toast('Failed to start parsing', 'error');
        }
    };

    const handleViewParsed = async (docId: string) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/v1/documents/${docId}/parsed`);
            setParsedData(res.data);
            setActiveDocId(docId);
            setActiveTab('debug');
            toast('Debug view loaded', 'success');
        } catch (err) {
            toast('Failed to load parsed data', 'error');
        }
    };

    const handleUploadComplete = () => {
        toast('Document uploaded', 'success');
        fetchDocuments();
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-4" size={32} />
            <p className="text-muted-foreground font-medium">Loading workspace...</p>
        </div>
    );

    if (!patient) return <div className="p-8">Patient not found</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Breadcrumbs items={[{ label: 'Patients', to: '/app/patients' }, { label: patient.displayName }]} />

            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                            {patient.displayName.charAt(0)}
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">{patient.displayName}</h1>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground ml-1">
                        <span>ID: {patient.id}</span>
                        <span>•</span>
                        <span>{patient.sex}</span>
                        <span>•</span>
                        <span>{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB N/A'}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">Edit Demo Data</Button>
                    <Button>Generate Report</Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-8">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="profile">Profile (Structured)</TabsTrigger>
                    <TabsTrigger value="debug">Parsed (Debug)</TabsTrigger>
                    <TabsTrigger value="flags">Flags</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                </TabsList>

                <TabsContent value="documents" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="font-bold text-lg text-foreground">Patient Documents</h3>
                            {documents.length === 0 ? (
                                <div className="p-8 bg-muted rounded-xl text-center text-muted-foreground border border-dashed border-border">
                                    No documents uploaded yet. Use the panel to the right.
                                </div>
                            ) : (
                                documents.map(doc => (
                                    <Card key={doc.id} className="group">
                                        <CardBody className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-secondary rounded text-muted-foreground">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{doc.filename}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">{doc.fileType || 'PDF'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Badge variant={
                                                    doc.status === 'PARSED' ? 'success' :
                                                        doc.status === 'ERROR' ? 'error' :
                                                            doc.status === 'PARSING' ? 'warning' : 'neutral'
                                                }>
                                                    {doc.status}
                                                </Badge>

                                                {doc.status === 'UPLOADED' && (
                                                    <Button size="sm" onClick={() => handleParse(doc.id)}>
                                                        <Play size={14} className="mr-1" /> Parse
                                                    </Button>
                                                )}
                                                {doc.status === 'PARSED' && (
                                                    <Button size="sm" variant="outline" onClick={() => handleViewParsed(doc.id)}>
                                                        View Debug
                                                    </Button>
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))
                            )}
                        </div>
                        <div className="lg:col-span-1">
                            <DocumentUpload patientId={id!} onUploadSuccess={handleUploadComplete} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="profile">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Dynamic Profile Data */}
                        <div className="space-y-6">
                            <Card className="overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -z-10"></div>
                                <CardBody className="p-6">
                                    <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
                                        <Activity size={20} className="text-primary" /> Vitals & Measurements
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {patient.structuredFacts?.filter((f: any) => f.factType === 'VITALS').length > 0 ? (
                                            patient.structuredFacts.filter((f: any) => f.factType === 'VITALS').map((fact: any) => {
                                                const data = JSON.parse(fact.dataJson);
                                                return (
                                                    <div key={fact.id} className="p-3 bg-muted rounded-lg border border-border/50">
                                                        <div className="text-xs text-muted-foreground uppercase font-semibold">{data.description || fact.factType}</div>
                                                        <div className="text-lg font-bold text-foreground">{data.value}</div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 text-sm text-muted-foreground italic">No vitals extracted yet.</div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>

                            <Card className="overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -z-10"></div>
                                <CardBody className="p-6">
                                    <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
                                        <AlertOctagon size={20} className="text-red-500" /> Allergies
                                    </h3>
                                    <div className="space-y-2">
                                        {patient.structuredFacts?.filter((f: any) => f.factType === 'ALLERGY').length > 0 ? (
                                            patient.structuredFacts.filter((f: any) => f.factType === 'ALLERGY').map((fact: any) => {
                                                const data = JSON.parse(fact.dataJson);
                                                return (
                                                    <div key={fact.id} className="flex justify-between items-center p-2 bg-red-500/10 rounded border border-red-500/20">
                                                        <span className="font-medium text-red-600 dark:text-red-400">{data.value}</span>
                                                        <Badge variant="error" className="text-xs">Extracted</Badge>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic">No allergies extracted yet.</div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -z-10"></div>
                                <CardBody className="p-6">
                                    <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
                                        <div className="w-5 h-5 rounded bg-green-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">Rx</div>
                                        Active Medications
                                    </h3>
                                    <div className="space-y-3">
                                        {patient.structuredFacts?.filter((f: any) => f.factType === 'MEDICATION').length > 0 ? (
                                            patient.structuredFacts.filter((f: any) => f.factType === 'MEDICATION').map((fact: any) => {
                                                const data = JSON.parse(fact.dataJson);
                                                return (
                                                    <div key={fact.id} className="p-3 border border-border rounded-lg bg-muted/30">
                                                        <div className="font-bold text-foreground">{data.value}</div>
                                                        <div className="text-xs text-muted-foreground">Extracted from document</div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic">No medications extracted yet.</div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="debug">
                    {parsedData ? (
                        <ParsedDebugView
                            chunks={parsedData.chunks}
                            blocks={parsedData.blocks}
                            facts={patient.structuredFacts?.filter((f: any) => f.documentId === activeDocId) || []}
                        />
                    ) : (
                        <div className="p-12 bg-muted/50 rounded-xl text-center border border-dashed border-border">
                            <p className="text-muted-foreground mb-2">No document selected.</p>
                            <p className="text-sm text-muted-foreground/60">Go to Documents tab and click "View Debug" on a parsed file.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="flags">
                    <div className="p-12 bg-muted/50 rounded-xl text-center border border-dashed border-border">
                        <AlertTriangle size={32} className="mx-auto text-amber-500 mb-4" />
                        <p className="text-muted-foreground font-medium">Flagging Engine Inactive</p>
                    </div>
                </TabsContent>

                <TabsContent value="audit">
                    <div className="p-12 bg-muted/50 rounded-xl text-center border border-dashed border-border">
                        <p className="text-muted-foreground font-medium">No audit logs available for this session.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
