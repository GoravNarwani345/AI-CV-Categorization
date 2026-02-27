import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchApplications } from '../services/api';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getApplications = async () => {
            try {
                setLoading(true);
                const result = await fetchApplications();
                if (result.success) {
                    setApplications(result.data);
                } else {
                    toast.error(result.error || "Failed to load applications");
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
                toast.error("An error occurred while loading applications");
            } finally {
                setLoading(false);
            }
        };

        getApplications();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'bg-blue-100 text-blue-800';
            case 'Shortlisted': return 'bg-green-100 text-green-800';
            case 'Interview': return 'bg-purple-100 text-purple-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Applied': return <FaHourglassHalf />;
            case 'Shortlisted': return <FaCheckCircle />;
            case 'Interview': return <FaBriefcase />;
            case 'Rejected': return <FaTimesCircle />;
            default: return <FaClock />;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your applications...</div>;

    return (
        <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaBriefcase className="text-blue-600" />
                My Applications
            </h2>

            {applications.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-4 font-semibold text-gray-700">Job Title</th>
                                <th className="py-4 font-semibold text-gray-700">Company</th>
                                <th className="py-4 font-semibold text-gray-700">Date Applied</th>
                                <th className="py-4 font-semibold text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-4">
                                        <div className="font-medium text-gray-800">{app.job?.title || 'Unknown Position'}</div>
                                        <div className="text-xs text-gray-500">{app.job?.type}</div>
                                    </td>
                                    <td className="py-4 text-gray-600">{app.job?.company}</td>
                                    <td className="py-4 text-gray-600 text-sm">
                                        {new Date(app.appliedDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            {app.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't applied for any jobs yet.</p>
                    <button className="text-blue-600 font-semibold hover:underline">Explore recommended jobs</button>
                </div>
            )}
        </div>
    );
};

export default MyApplications;
