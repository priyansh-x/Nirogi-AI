import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import axios from 'axios';
import { User, Mail, Building, Shield } from 'lucide-react';

export const Profile = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/v1/users/me');
            setUser(res.data);
        } catch (error) {
            console.error(error);
            toast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.patch('http://localhost:3000/api/v1/users/me', {
                name: user.name,
                email: user.email
            });
            setUser(res.data);
            toast('Profile updated successfully', 'success');
        } catch (error) {
            toast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

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
                                        value={user?.name || ''}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={user?.email || ''}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
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
