import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaBriefcase, FaGraduationCap, FaTools } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { updateProfile } from "../services/api";

const ModernProfile = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        skills: [],
        experience: [],
        education: [],
        preferences: {},
        Age: ""
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                phone: user.basicInfo?.phone || "",
                location: user.basicInfo?.location || "",
                bio: user.basicInfo?.bio || "",
                skills: user.skills || [],
                experience: user.experience || [],
                education: user.education || [],
                preferences: user.preferences || {},
                Age: user.Age || ""
            });
        }
    }, [user]);

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayChange = (category, index, field, value) => {
        setProfileData(prev => {
            const updatedArray = [...prev[category]];
            updatedArray[index] = { ...updatedArray[index], [field]: value };
            return { ...prev, [category]: updatedArray };
        });
    };

    const addItem = (category, template) => {
        setProfileData(prev => ({
            ...prev,
            [category]: [...prev[category], template]
        }));
    };

    const removeItem = (category, index) => {
        setProfileData(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                uid: user.uid,
                name: profileData.name,
                basicInfo: {
                    phone: profileData.phone,
                    location: profileData.location,
                    bio: profileData.bio
                },
                skills: profileData.skills,
                education: profileData.education,
                experience: profileData.experience,
                preferences: profileData.preferences,
                Age: profileData.Age
            };

            const res = await updateProfile(user.uid, payload);
            if (res.success) {
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                throw new Error(res.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setProfileData({
                name: user.name || "",
                email: user.email || "",
                phone: user.basicInfo?.phone || "",
                location: user.basicInfo?.location || "",
                bio: user.basicInfo?.bio || "",
                skills: user.skills || [],
                experience: user.experience || [],
                education: user.education || [],
                preferences: user.preferences || {},
                Age: user.Age || ""
            });
        }
        setIsEditing(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
                {/* Header/Cover Area */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="w-32 h-32 bg-white rounded-3xl shadow-lg p-2">
                            <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <FaUser size={64} />
                            </div>
                        </div>
                        <div className="mb-4">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="text-3xl font-bold text-white bg-white/20 border-b-2 border-white focus:outline-none px-2 rounded-t-lg"
                                    placeholder="Your Name"
                                />
                            ) : (
                                <h2 className="text-3xl font-bold text-white drop-shadow-sm">{profileData.name || "Set your name"}</h2>
                            )}
                            <p className="text-blue-100 font-medium capitalize mt-1">{user?.role || "Member"}</p>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-8 flex gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-md active:scale-95"
                            >
                                <FaEdit /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-green-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader size="small" /> : <FaSave />} Save Changes
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-2.5 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Contact & About */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <FaEnvelope />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email</p>
                                        <p className="text-gray-700 font-medium">{profileData.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <FaPhone />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Phone</p>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 font-medium">{profileData.phone || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Location</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 font-medium">{profileData.location || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm text-xs font-bold">
                                        AG
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Age</p>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={profileData.Age}
                                                onChange={(e) => handleInputChange('Age', e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        ) : (
                                            <p className="text-gray-700 font-medium">{profileData.Age || "Not set"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">About Me</h3>
                            {isEditing ? (
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    rows={6}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Tell us about yourself..."
                                />
                            ) : (
                                <p className="text-gray-600 leading-relaxed italic">
                                    "{profileData.bio || "No bio yet. Add one to stand out!"}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Skills, Experience, Education */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Skills Section */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden min-h-[150px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaTools className="text-blue-500" /> Skills & Expertise
                                </h3>
                                {isEditing && profileData.skills.length > 0 && (
                                    <button
                                        onClick={() => addItem('skills', { name: '', level: 'Beginner' })}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                                    >
                                        <FaPlus /> Add Skill
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {isEditing ? (
                                    profileData.skills.length > 0 ? (
                                        <div className="w-full space-y-3">
                                            {profileData.skills.map((skill, index) => (
                                                <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100 animate-in slide-in-from-right-2 duration-200">
                                                    <input
                                                        type="text"
                                                        value={skill.name}
                                                        onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                                                        placeholder="Skill name"
                                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                    <select
                                                        value={skill.level}
                                                        onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                                                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    >
                                                        <option>Beginner</option>
                                                        <option>Intermediate</option>
                                                        <option>Advanced</option>
                                                        <option>Expert</option>
                                                    </select>
                                                    <button
                                                        onClick={() => removeItem('skills', index)}
                                                        className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addItem('skills', { name: '', level: 'Beginner' })}
                                            className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-8 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-3 group"
                                        >
                                            <FaPlus size={24} className="group-hover:scale-110 transition-transform" />
                                            <span className="font-bold">Add your first skill</span>
                                        </button>
                                    )
                                ) : (
                                    profileData.skills.length > 0 ? (
                                        profileData.skills.map((skill, index) => (
                                            <div key={index} className="group relative">
                                                <span className="bg-white border border-blue-100 text-blue-700 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-2">
                                                    {skill.name}
                                                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-lg opacity-80 uppercase tracking-tighter">
                                                        {skill.level}
                                                    </span>
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 italic">No skills listed yet.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden relative min-h-[150px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaBriefcase className="text-indigo-500" /> Work Experience
                                </h3>
                                {isEditing && profileData.experience.length > 0 && (
                                    <button
                                        onClick={() => addItem('experience', { title: '', company: '', duration: '', description: '' })}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                                    >
                                        <FaPlus /> Add Experience
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isEditing ? (
                                    profileData.experience.length > 0 ? (
                                        <div className="space-y-4">
                                            {profileData.experience.map((exp, index) => (
                                                <div key={index} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4 relative group">
                                                    <button
                                                        onClick={() => removeItem('experience', index)}
                                                        className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm bg-white border border-gray-100"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Job Title</label>
                                                            <input
                                                                type="text"
                                                                value={exp.title}
                                                                onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                                                                placeholder="Frontend Developer"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Company</label>
                                                            <input
                                                                type="text"
                                                                value={exp.company}
                                                                onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                                                                placeholder="Google"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1 md:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Duration</label>
                                                            <input
                                                                type="text"
                                                                value={exp.duration}
                                                                onChange={(e) => handleArrayChange('experience', index, 'duration', e.target.value)}
                                                                placeholder="Jan 2022 - Present"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1 md:col-span-2">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Description</label>
                                                            <textarea
                                                                value={exp.description}
                                                                onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                                                                placeholder="What did you achieve?"
                                                                rows={3}
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addItem('experience', { title: '', company: '', duration: '', description: '' })}
                                            className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-8 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-3 group"
                                        >
                                            <FaPlus size={24} className="group-hover:scale-110 transition-transform" />
                                            <span className="font-bold">Add your first work experience</span>
                                        </button>
                                    )
                                ) : (
                                    profileData.experience.length > 0 ? (
                                        profileData.experience.map((exp, index) => (
                                            <div key={index} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-blue-100 shadow-sm"></div>
                                                    {index < profileData.experience.length - 1 && <div className="w-0.5 flex-1 bg-blue-50 my-1 group-hover:bg-blue-100 transition-colors"></div>}
                                                </div>
                                                <div className="pb-8 flex-1 text-left">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-lg font-bold text-gray-800">{exp.title}</h4>
                                                        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">{exp.duration}</span>
                                                    </div>
                                                    <p className="text-blue-600 font-bold mb-3">{exp.company}</p>
                                                    <p className="text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-50">{exp.description}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 italic">No experience added yet.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden min-h-[150px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10 opacity-50"></div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FaGraduationCap className="text-purple-500" /> Education
                                </h3>
                                {isEditing && profileData.education.length > 0 && (
                                    <button
                                        onClick={() => addItem('education', { degree: '', institution: '', year: '', grade: '' })}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold"
                                    >
                                        <FaPlus /> Add Education
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {isEditing ? (
                                    profileData.education.length > 0 ? (
                                        <div className="space-y-4">
                                            {profileData.education.map((edu, index) => (
                                                <div key={index} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4 relative group">
                                                    <button
                                                        onClick={() => removeItem('education', index)}
                                                        className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm bg-white border border-gray-100"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Degree</label>
                                                            <input
                                                                type="text"
                                                                value={edu.degree}
                                                                onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                                                                placeholder="BS CS"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Institution</label>
                                                            <input
                                                                type="text"
                                                                value={edu.institution}
                                                                onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                                                                placeholder="NUST"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Year</label>
                                                            <input
                                                                type="text"
                                                                value={edu.year}
                                                                onChange={(e) => handleArrayChange('education', index, 'year', e.target.value)}
                                                                placeholder="2023"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Grade</label>
                                                            <input
                                                                type="text"
                                                                value={edu.grade}
                                                                onChange={(e) => handleArrayChange('education', index, 'grade', e.target.value)}
                                                                placeholder="3.8 CGPA"
                                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addItem('education', { degree: '', institution: '', year: '', grade: '' })}
                                            className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-8 text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-3 group"
                                        >
                                            <FaPlus size={24} className="group-hover:scale-110 transition-transform" />
                                            <span className="font-bold">Add your first education</span>
                                        </button>
                                    )
                                ) : (
                                    profileData.education.length > 0 ? (
                                        profileData.education.map((edu, index) => (
                                            <div key={index} className="flex gap-4 group">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                        <span className="font-bold text-xs">{edu.year?.slice(-2) || "??"}</span>
                                                    </div>
                                                    {index < profileData.education.length - 1 && <div className="w-0.5 flex-1 bg-purple-50 my-1"></div>}
                                                </div>
                                                <div className="pb-8 flex-1 pt-1 text-left">
                                                    <h4 className="text-lg font-bold text-gray-800">{edu.degree}</h4>
                                                    <p className="text-purple-600 font-bold mb-1">{edu.institution}, {edu.year}</p>
                                                    {edu.grade && <p className="text-xs text-gray-500 font-bold">Grade: <span className="text-gray-700">{edu.grade}</span></p>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full py-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-gray-400 italic">No education added yet.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernProfile;
