import React, { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaUsers, FaIndustry } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { fetchData, updateProfile } from '../services/api';
import Preloader from './Preloader';

const RecruiterProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        companyName: '',
        companyDescription: '',
        industry: '',
        companySize: '',
        website: '',
        contactEmail: '',
        contactPhone: '',
        location: '',
        logoUrl: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoading(true);
                const result = await fetchData();
                if (result.success && result.data) {
                    const profileData = result.data;
                    setFormData({
                        companyName: profileData.recruiterInfo?.companyName || '',
                        companyDescription: profileData.recruiterInfo?.companyDescription || '',
                        industry: profileData.recruiterInfo?.industry || '',
                        companySize: profileData.recruiterInfo?.companySize || '',
                        website: profileData.recruiterInfo?.website || '',
                        contactEmail: profileData.recruiterInfo?.contactEmail || '',
                        contactPhone: profileData.recruiterInfo?.contactPhone || '',
                        location: profileData.basicInfo?.location || '',
                        logoUrl: profileData.recruiterInfo?.logoUrl || ''
                    });
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Email is invalid';
        if (!formData.location.trim()) newErrors.location = 'Location is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const payload = {
                    basicInfo: {
                        location: formData.location
                    },
                    recruiterInfo: {
                        companyName: formData.companyName,
                        companyDescription: formData.companyDescription,
                        industry: formData.industry,
                        companySize: formData.companySize,
                        website: formData.website,
                        contactEmail: formData.contactEmail,
                        contactPhone: formData.contactPhone,
                        logoUrl: formData.logoUrl
                    }
                };
                const result = await updateProfile(payload);
                if (result.success) {
                    toast.success('Profile saved successfully!');
                    setIsEditing(false);
                } else {
                    toast.error(result.error || 'Failed to save profile');
                }
            } catch (error) {
                toast.error('Error saving profile');
            }
        }
    };

    const handleCancel = async () => {
        const result = await fetchData();
        if (result.success && result.data) {
            const profileData = result.data;
            setFormData({
                companyName: profileData.recruiterInfo?.companyName || '',
                companyDescription: profileData.recruiterInfo?.companyDescription || '',
                industry: profileData.recruiterInfo?.industry || '',
                companySize: profileData.recruiterInfo?.companySize || '',
                website: profileData.recruiterInfo?.website || '',
                contactEmail: profileData.recruiterInfo?.contactEmail || '',
                contactPhone: profileData.recruiterInfo?.contactPhone || '',
                location: profileData.basicInfo?.location || '',
                logoUrl: profileData.recruiterInfo?.logoUrl || ''
            });
            setIsEditing(false);
        }
        setErrors({});
    };

    if (isLoading) return <Preloader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Recruiter Profile</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <FaEdit /> Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaBuilding className="inline mr-2" />
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g. Tech Corp Inc."
                                />
                                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaIndustry className="inline mr-2" />
                                    Industry
                                </label>
                                <select
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaUsers className="inline mr-2" />
                                    Company Size
                                </label>
                                <select
                                    name="companySize"
                                    value={formData.companySize}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="501-1000">501-1000 employees</option>
                                    <option value="1000+">1000+ employees</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaGlobe className="inline mr-2" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaEnvelope className="inline mr-2" />
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="contact@company.com"
                                />
                                {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaPhone className="inline mr-2" />
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaMapMarkerAlt className="inline mr-2" />
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g. New York, NY"
                                />
                                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Logo URL
                                </label>
                                <input
                                    type="url"
                                    name="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Description
                            </label>
                            <textarea
                                name="companyDescription"
                                value={formData.companyDescription}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe your company, mission, and values..."
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <FaSave /> Save Profile
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.logoUrl && (
                                <div className="md:col-span-2 flex justify-center">
                                    <img src={formData.logoUrl} alt="Company Logo" className="h-24 object-contain" />
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <FaBuilding /> Company Name
                                </p>
                                <p className="text-lg font-semibold text-gray-800">{formData.companyName || 'Not set'}</p>
                            </div>

                            {formData.industry && (
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <FaIndustry /> Industry
                                    </p>
                                    <p className="text-lg font-semibold text-gray-800">{formData.industry}</p>
                                </div>
                            )}

                            {formData.companySize && (
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <FaUsers /> Company Size
                                    </p>
                                    <p className="text-lg font-semibold text-gray-800">{formData.companySize}</p>
                                </div>
                            )}

                            {formData.website && (
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <FaGlobe /> Website
                                    </p>
                                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">
                                        {formData.website}
                                    </a>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <FaEnvelope /> Email
                                </p>
                                <p className="text-lg font-semibold text-gray-800">{formData.contactEmail || 'Not set'}</p>
                            </div>

                            {formData.contactPhone && (
                                <div>
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <FaPhone /> Phone
                                    </p>
                                    <p className="text-lg font-semibold text-gray-800">{formData.contactPhone}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <FaMapMarkerAlt /> Location
                                </p>
                                <p className="text-lg font-semibold text-gray-800">{formData.location || 'Not set'}</p>
                            </div>
                        </div>

                        {formData.companyDescription && (
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">Company Description</p>
                                <p className="text-gray-700">{formData.companyDescription}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterProfile;
