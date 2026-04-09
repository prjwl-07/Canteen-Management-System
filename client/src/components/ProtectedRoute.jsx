import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
