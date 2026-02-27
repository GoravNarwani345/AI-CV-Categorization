import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import { resendVerificationEmail } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const VerificationPending = () => {
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();
    const userEmail = localStorage.getItem('userEmail') || '';

    const handleResendEmail = async () => {
        setLoading(true);
        const email = localStorage.getItem('userEmail');
        if (!email) {
            toast.error('No email found. Please register again.');
            setLoading(false);
            return;
        }
        const result = await resendVerificationEmail(email);
        if (result.success) {
            toast.success(result.message || 'Verification email sent!');
        } else {
            toast.error(result.error || 'Failed to resend verification email');
        }
        setLoading(false);
    };

    const handleCheckVerification = async () => {
        setChecking(true);
        // Backend email verification check not implemented; prompt user to check email.
        toast.info('Please check your email and click the verification link.');
        setChecking(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/getstarted');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center">
                    {/* Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <FaEnvelope className="text-blue-600 text-6xl" />
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                                <span className="text-xs">!</span>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Verify Your Email Address
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">
                        We've sent a verification link to
                    </p>
                    <p className="text-blue-600 font-semibold mb-6">
                        {userEmail}
                    </p>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                        <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                            <FaCheckCircle /> Next Steps:
                        </h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                            <li>Check your email inbox (and spam folder)</li>
                            <li>Click the verification link in the email</li>
                            <li>Return here and click "I've Verified My Email"</li>
                            <li>Log in with your credentials</li>
                        </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleCheckVerification}
                            disabled={checking}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
                        >
                            {checking ? 'Checking...' : "I've Verified My Email"}
                        </button>

                        <button
                            onClick={handleResendEmail}
                            disabled={loading}
                            className="w-full bg-white border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Resend Verification Email'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>

                    {/* Help Text */}
                    <p className="text-sm text-gray-500 mt-6">
                        Didn't receive the email? Check your spam folder or click resend.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerificationPending;
