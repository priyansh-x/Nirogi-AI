import React from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Activity, Database, FileJson, Server, ShieldCheck, Copy } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';

const IntegrationCard = ({ icon: Icon, name, status, types, output }: any) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardBody className="p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Icon size={28} className="text-slate-700" />
                </div>
                <Badge variant={status === 'Active' ? 'success' : 'neutral'}>
                    {status}
                </Badge>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{name}</h3>

            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ingests</p>
                    <p className="text-sm text-slate-700">{types}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Outputs</p>
                    <p className="text-sm text-slate-700">{output}</p>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                <Button variant="outline" size="sm" className="w-full" disabled={status !== 'Active'}>
                    Configure
                </Button>
            </div>
        </CardBody>
    </Card>
);

export const Integrations = () => {
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Breadcrumbs items={[{ label: 'Integrations' }]} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">EHR Integrations</h1>
                    <p className="text-slate-500 text-lg">Connect Nirogi AI with your existing hospital systems.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">View API Docs</Button>
                    <Button>Request Connector</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <IntegrationCard
                    icon={Activity}
                    name="FHIR API (R4)"
                    status="Coming Soon"
                    types="Patient Resources, Observation, MedicationStatement"
                    output="Standard FHIR Bundles"
                />
                <IntegrationCard
                    icon={Server}
                    name="HL7 v2 over MLLP"
                    status="Planned"
                    types="ADT, ORU^R01 messages"
                    output="Parsed JSON / Embedded PDF"
                />
                <IntegrationCard
                    icon={Database}
                    name="CSV / SFTP"
                    status="Active"
                    types="Batch Patient Lists, Document Manifests"
                    output="Structured CSV Exports"
                />
                <IntegrationCard
                    icon={FileJson}
                    name="Custom REST Webhooks"
                    status="Active"
                    types="Document Upload Events"
                    output="Real-time JSON Payloads"
                />
                <IntegrationCard
                    icon={ShieldCheck}
                    name="ABDM Connector"
                    status="Planned"
                    types="Health ID Linking, Consent Artifacts"
                    output="HIPAA/GDPR Compliant Logs"
                />
            </div>

            <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">Developer API</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-md">
                            Build custom workflows using our robust REST API. Authenticate using Bearer tokens.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">API Endpoint</label>
                                <div className="mt-1 flex items-center gap-2 bg-slate-800 p-3 rounded-lg border border-slate-700 font-mono text-sm text-blue-400">
                                    https://api.nirogi.ai/v1
                                    <Copy size={14} className="ml-auto text-slate-500 cursor-pointer hover:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your API Key</label>
                                <div className="mt-1 flex justify-between items-center gap-4">
                                    <div className="flex-1 bg-slate-800 p-3 rounded-lg border border-slate-700 font-mono text-sm text-slate-500">
                                        nirogi_live_************************
                                    </div>
                                    <Button size="sm" disabled>Generate New</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 lg:pl-8 lg:border-l border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-300">Export Preview (JSON)</h4>
                            <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded">Valid</span>
                        </div>
                        <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800 leading-relaxed">
                            {`{
  "resourceType": "Patient",
  "id": "pat_12345",
  "name": [
    {
      "use": "official",
      "family": "Doe",
      "given": ["John"]
    }
  ],
  "gender": "male",
  "birthDate": "1980-05-15",
  "extension": [
    {
      "url": "http://nirogi.ai/risk-flags",
      "valueString": "High Risk - Hypertension"
    }
  ]
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
