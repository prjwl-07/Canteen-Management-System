import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(password);
        if (success) {
            navigate('/admin');
        } else {
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-100/50 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white relative z-10 transition-all duration-300 hover:shadow-primary-100">
                <div className="text-center mb-10">
                    <div className="bg-primary-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm transform hover:rotate-6 transition-transform">
                        <ChefHat size={40} className="text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-black text-secondary-900 tracking-tight mb-2">Admin Access</h1>
                    <p className="text-secondary-400 font-bold uppercase tracking-widest text-xs">Secure Restricted Area</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <Lock size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-secondary-400 group-focus-within:text-primary-500'}`} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Passcode (canteengo)"
                            className={`w-full bg-secondary-50 border-2 font-bold text-lg text-secondary-900 placeholder:text-secondary-300 placeholder:font-medium py-4 pl-12 pr-4 rounded-2xl outline-none transition-all
                                ${error
                                    ? 'border-red-400 bg-red-50 animate-shake'
                                    : 'border-transparent focus:border-primary-500 focus:bg-white focus:shadow-lg focus:shadow-primary-100'
                                }`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!password}
                        className="w-full bg-secondary-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        Authenticate <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-xs font-bold text-secondary-300 uppercase tracking-widest mt-4">
                        Smart Canteen System
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
