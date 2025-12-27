import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { api } from '../lib/api';

export const SignIn = () => {
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get('next') || '/app/patients';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/signin', {
                email,
                password
            });

            const { token, user } = res.data;
            login(token, user);
            toast(`Welcome back, ${user.name}!`, 'success');
            navigate(next);

        } catch (err: any) {
            toast(err.response?.data?.error || 'Login failed', 'error');
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
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Access your secure patient workspace.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="demo@nirogi.ai"
                        />
                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" loading={loading} size="lg">
                            Sign in
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-slate-500">Don't have an account?</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign up for free
                            </Link>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 p-4 rounded-lg text-xs text-blue-800">
                        <p className="font-bold mb-1">Demo Credentials:</p>
                        <p>Email: <b>demo@nirogi.ai</b></p>
                        <p>Password: <b>demo123</b></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
