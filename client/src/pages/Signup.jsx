import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, GraduationCap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
    const navigate = useNavigate();
    const { userSignup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await userSignup(formData);
        setLoading(false);
        if (success) {
            navigate('/'); // Redirect to menu or dashboard
        }
    };

    return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px] -ml-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary-100/50 rounded-full blur-[80px] -mr-20 -mb-20 pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-secondary-900 tracking-tight mb-2">Create Account</h1>
                    <p className="text-secondary-400 font-bold uppercase tracking-widest text-xs">Join Canteen Connect</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="relative group">
                        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-secondary-50 border-2 border-transparent focus:border-primary-500 focus:bg-white focus:shadow-lg focus:shadow-primary-100 font-bold text-secondary-900 placeholder:text-secondary-300 py-3 pl-12 pr-4 rounded-xl outline-none transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative group">
                        <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
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

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'student' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-secondary-100 text-secondary-400 hover:border-secondary-200'}`}>
                            <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={handleChange} className="hidden" />
                            <GraduationCap size={24} />
                            <span className="font-bold text-xs uppercase tracking-wider">Student</span>
                        </label>
                        <label className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'teacher' ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-secondary-100 text-secondary-400 hover:border-secondary-200'}`}>
                            <input type="radio" name="role" value="teacher" checked={formData.role === 'teacher'} onChange={handleChange} className="hidden" />
                            <BookOpen size={24} />
                            <span className="font-bold text-xs uppercase tracking-wider">Teacher</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
                    >
                        {loading ? 'Creating...' : 'Sign Up'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-secondary-400 text-sm font-bold">
                            Already have an account? <Link to="/user-login" className="text-primary-600 hover:text-primary-700 underline">Login</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
