import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const hasRun = React.useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (hasRun.current) return;
            hasRun.current = true;

            try {
                console.log("📨 Sending verification request...");
                const response = await fetch(`${API_URL}/auth/verify-email/${token}`);
                const result = await response.json();

                if (result.success) {
                    setStatus('success');
                    toast.success("Email verified!");
                } else {
                    setStatus('error');
                    toast.error(result.error || "Verification failed");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus('error');
                toast.error("Network error during verification");
            }
        };

        if (token && status === 'verifying') {
            verify();
        }
    }, [token, API_URL, status]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
                        <h1 className="text-2xl font-bold text-gray-800">Verifying Email...</h1>
                        <p className="text-gray-500">Wait a moment while we confirm your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-4xl">
                            ✅
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Verified!</h1>
                        <p className="text-gray-600">Your email has been successfully verified. You can now access all features.</p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 text-4xl">
                            ❌
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Verification Failed</h1>
                        <p className="text-gray-600">The link may be expired or invalid. Please try resending the verification email.</p>
                        <Link
                            to="/login"
                            className="inline-block w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-all shadow-lg"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
