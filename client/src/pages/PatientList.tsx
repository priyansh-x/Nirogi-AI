import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { Plus, Search, User, FileText, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Patient {
    id: string;
    displayName: string;
    dob: string;
    sex: string;
    createdAt: string;
    _count?: { documents: number };
}

export const PatientList = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientDOB, setNewPatientDOB] = useState('');
    const [newPatientSex, setNewPatientSex] = useState('Male');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/v1/patients');
            setPatients(res.data);
        } catch (error) {
            console.error(error);
            toast('Failed to load patients', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPatientName) return;

        setCreating(true);
        try {
            const res = await axios.post('http://localhost:3000/api/v1/patients', {
                displayName: newPatientName,
                dob: newPatientDOB || null,
                sex: newPatientSex
            });

            toast('Patient created successfully', 'success');
            setIsCreateModalOpen(false);

            // Reset form
            setNewPatientName('');
            setNewPatientDOB('');
            setNewPatientSex('Male');

            // Navigate to new patient
            navigate(`/patients/${res.data.id}`);

        } catch (error) {
            console.error(error);
            toast('Failed to create patient', 'error');
        } finally {
            setCreating(false);
        }
    };

    const filteredPatients = useMemo(() => {
        return patients.filter(p =>
            p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [patients, searchQuery]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients</h1>
                    <p className="text-muted-foreground text-lg mt-1">Manage intake and parsed medical records.</p>
                </div>
                <Button size="lg" onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-primary/20">
                    <Plus size={18} className="mr-2" />
                    New Patient
                </Button>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                    type="text"
                    placeholder="Search by patient name..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                    <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                        <User size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">No patients found</h3>
                    <p className="text-muted-foreground mt-1 mb-6">Get started by adding a new patient to the workspace.</p>
                    {searchQuery ? (
                        <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                    ) : (
                        <Button onClick={() => setIsCreateModalOpen(true)}>Create Patient</Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPatients.map((patient) => (
                        <Link to={`/app/patients/${patient.id}`} key={patient.id} className="group">
                            <Card className="h-full hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 transition-all duration-300 group-hover:bg-secondary/10">
                                <CardBody className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-primary/10 text-primary rounded-full font-bold text-lg">
                                            {patient.displayName.charAt(0)}
                                        </div>
                                        <Badge variant="neutral">
                                            ID: {patient.id.substring(0, 8)}...
                                        </Badge>
                                    </div>

                                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                        {patient.displayName}
                                    </h3>

                                    <div className="space-y-1 text-sm text-muted-foreground mb-6">
                                        <p>{patient.sex} • {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB Unknown'}</p>
                                        <p className="text-xs text-muted-foreground/60">Created {new Date(patient.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <FileText size={14} />
                                            {patient._count?.documents || 0} Documents
                                        </span>
                                        <span className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all font-medium transform translate-x-2 group-hover:translate-x-0">
                                            Open <ChevronRight size={16} />
                                        </span>
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Patient"
            >
                <form onSubmit={handleCreatePatient} className="space-y-5">
                    <Input
                        label="Full Name"
                        placeholder="e.g. Alice Wonderland"
                        required
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={newPatientDOB}
                            onChange={(e) => setNewPatientDOB(e.target.value)}
                        />
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground block">Sex</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                value={newPatientSex}
                                onChange={(e) => setNewPatientSex(e.target.value)}
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-muted p-3 rounded-lg text-xs list-disc border border-border text-muted-foreground">
                        Workspace permissions will default to your organization (Good Health Clinic).
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="button" variant="ghost" className="mr-2" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={creating}>
                            Create Patient
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
