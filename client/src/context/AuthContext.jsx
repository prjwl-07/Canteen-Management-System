import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null); // { name, email, role, token }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Check Admin Token
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                try {
                    const res = await axios.get('/api/admin/verify', {
                        headers: { Authorization: `Bearer ${adminToken}` }
                    });
                    if (res.data.success) setIsAdmin(true);
                } catch (err) {
                    console.error("Admin Auth verification failed:", err);
                    localStorage.removeItem('adminToken');
                    setIsAdmin(false);
                }
            }

            // Check User Token
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
                try {
                    const res = await axios.get('/api/auth/me', {
                        headers: { Authorization: `Bearer ${userToken}` }
                    });
                    // res.data contains the user object (without password)
                    setUser({ ...res.data, token: userToken });
                } catch (err) {
                    console.error("User Auth verification failed:", err);
                    localStorage.removeItem('userToken');
                    setUser(null);
                }
            }

            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (password) => {
        try {
            const res = await axios.post('/api/admin/login', { password });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                setIsAdmin(true);
                toast.success("Welcome back, Admin!");
                return true;
            }
        } catch (err) {
            console.error(err);
            toast.error("Invalid Credentials");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
        toast.success("Admin Logged Out");
    };

    // User Auth Functions
    const userSignup = async (userData) => {
        try {
            const res = await axios.post('/api/auth/register', userData);
            if (res.data) {
                localStorage.setItem('userToken', res.data.token);
                setUser(res.data);
                toast.success("Account Created Successfully!");
                return true;
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Signup Failed");
            return false;
        }
    };

    const userLogin = async (email, password) => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res.data) {
                localStorage.setItem('userToken', res.data.token);
                setUser(res.data);
                toast.success(`Welcome back, ${res.data.name}!`);
                return true;
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Login Failed");
            return false;
        }
    };

    const userLogout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
        toast.success("Logged Out");
    };

    return (
        <AuthContext.Provider value={{ isAdmin, user, loading, login, logout, userSignup, userLogin, userLogout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
