import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Building, Shield, Activity, FileText } from 'lucide-react';

export const Profile = () => {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State (initialized from user)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    // Detailed Profile Data
    const [patientData, setPatientData] = useState<any>(null);
    const [patientDocs, setPatientDocs] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // If patient, fetch their patient record stats
                if (user?.role === 'PATIENT') {
                    // Find patient record linked to this user
                    const listRes = await api.get('/patients');
                    // Find by matching user ID assuming link
                    const found = listRes.data.find((p: any) => p.userId === user.id);

                    if (found) {
                        const fullRes = await api.get(`/patients/${found.id}`);
                        setPatientData(fullRes.data);

                        const docRes = await api.get(`/patients/${found.id}/documents`);
                        setPatientDocs(docRes.data);
                    }
                }
            } catch (err) {
                console.error(err);
                toast('Failed to load profile details', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch('/users/me', formData);
            toast('Profile updated successfully', 'success');
        } catch (error) {
            toast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    // PATIENT VIEW ---------------------------------------------------------
    if (user?.role === 'PATIENT') {
        return (
            <div className="p-8 max-w-6xl mx-auto">
                <Breadcrumbs items={[{ label: 'My Health Profile' }]} />

                <div className="flex items-center gap-6 mb-10">
                    <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                <Shield size={12} /> Patient
                            </span>
                            <span className="text-slate-500 text-sm">{user?.email}</span>
                        </div>
                    </div>
                </div>

                {/* Vitals & Health Data */}
                {patientData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <Card className="overflow-hidden relative">
                            <CardBody className="p-6">
                                <h3 className="flex items-center gap-2 font-bold text-foreground mb-4">
                                    <Activity size={20} className="text-primary" /> Vitals & Measurements
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {patientData.structuredFacts?.filter((f: any) => f.factType === 'VITALS').length > 0 ? (
                                        patientData.structuredFacts.filter((f: any) => f.factType === 'VITALS').map((fact: any) => {
                                            const data = JSON.parse(fact.dataJson);
                                            return (
                                                <div key={fact.id} className="p-3 bg-muted rounded-lg border border-border/50">
                                                    <div className="text-xs text-muted-foreground uppercase font-semibold">{data.description || fact.factType}</div>
                                                    <div className="text-lg font-bold text-foreground">{data.value}</div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="col-span-2 text-sm text-muted-foreground italic">No vitals available. Upload a checkup report.</div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        <div className="space-y-6">
                            {/* Allergies & Meds could go here, simplified for brevity */}
                            <Card>
                                <CardHeader><h2 className="text-lg font-bold">Health Summary</h2></CardHeader>
                                <CardBody>
                                    <p className="text-sm text-muted-foreground">Upload your medical documents to automatically populate your health profile.</p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Documents List (ReadOnly for now or basic list) */}
                <h3 className="font-bold text-lg text-foreground mb-4">My Documents</h3>
                <div className="grid grid-cols-1 gap-4">
                    {patientDocs.length === 0 ? (
                        <div className="p-8 bg-muted rounded-xl text-center text-muted-foreground border border-dashed border-border">
                            No documents found.
                        </div>
                    ) : (
                        patientDocs.map(doc => (
                            <Card key={doc.id}>
                                <CardBody className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-secondary rounded text-muted-foreground"><FileText size={24} /></div>
                                        <div>
                                            <p className="font-semibold">{doc.filename}</p>
                                            <Badge variant={doc.status === 'PARSED' ? 'success' : 'neutral'}>{doc.status}</Badge>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))
                    )}
                </div>

            </div>
        );
    }

    // NORMAL USER / ADMIN VIEW (Account Settings) --------------------------
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Breadcrumbs items={[{ label: 'Profile' }]} />

            <div className="flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            <Shield size={12} />
                            {user?.role || 'Admin'}
                        </span>
                        <span className="text-slate-500 text-sm">{user?.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-bold">Personal Information</h2>
                        </CardHeader>
                        <CardBody>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="Role"
                                    disabled
                                    value={user?.role || ''}
                                    className="bg-slate-50"
                                />
                                <div className="pt-2 flex justify-end">
                                    <Button type="submit" loading={saving}>Save Changes</Button>
                                </div>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-bold">Preferences</h2>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-slate-900">Email Notifications</p>
                                    <p className="text-sm text-slate-500">Receive weekly summaries of patient activity.</p>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                            <div className="border-t border-slate-100 my-2"></div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-slate-900">Compact Mode</p>
                                    <p className="text-sm text-slate-500">Show more density in patient lists.</p>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Organization</h2></CardHeader>
                        <CardBody className="py-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Building size={20} className="text-slate-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Good Health Clinic</p>
                                    <p className="text-xs text-slate-500">San Francisco, CA</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">Manage Team</Button>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
};
