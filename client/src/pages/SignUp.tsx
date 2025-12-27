import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ArrowLeft } from 'lucide-react';

export const SignUp = () => {
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('PATIENT');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:3000/api/v1/auth/signup', {
                name,
                email,
                password,
                role
            });

            const { token, user } = res.data;
            login(token, user);
            toast(`Welcome, ${user.name}!`, 'success');

            // Redirect based on role
            if (user.role === 'PATIENT') {
                navigate('/app/profile');
            } else {
                navigate('/app/patients');
            }

        } catch (err: any) {
            toast(err.response?.data?.error || 'Signup failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-slate-400 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <div className="flex justify-center items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight mb-2">
                    <Activity size={32} />
                    <span>Nirogi AI</span>
                </div>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Start normalizing your patient data today.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Dr. Jane Doe"
                        />
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jane@clinic.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 bg-white"
                            >
                                <option value="PATIENT">Patient</option>
                                <option value="DOCTOR">Doctor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <Button type="submit" className="w-full" loading={loading} size="lg">
                            Sign up
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-slate-500">Already have an account?</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
