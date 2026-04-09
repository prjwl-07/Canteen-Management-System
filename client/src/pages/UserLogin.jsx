import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const UserLogin = () => {
    const navigate = useNavigate();
    const { userLogin } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await userLogin(formData.email, formData.password);
        setLoading(false);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary-100/50 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white relative z-10">
                <div className="text-center mb-8">
                    <div className="bg-primary-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-secondary-900 tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-secondary-400 font-bold uppercase tracking-widest text-xs">Login to Continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="relative group">
                        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-secondary-50 border-2 border-transparent focus:border-primary-500 focus:bg-white focus:shadow-lg focus:shadow-primary-100 font-bold text-secondary-900 placeholder:text-secondary-300 py-3 pl-12 pr-4 rounded-xl outline-none transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-secondary-50 border-2 border-transparent focus:border-primary-500 focus:bg-white focus:shadow-lg focus:shadow-primary-100 font-bold text-secondary-900 placeholder:text-secondary-300 py-3 pl-12 pr-4 rounded-xl outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-secondary-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
                    >
                        {loading ? 'Logging In...' : 'Login'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-secondary-400 text-sm font-bold">
                            Don't have an account? <Link to="/signup" className="text-primary-600 hover:text-primary-700 underline">Sign Up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserLogin;
