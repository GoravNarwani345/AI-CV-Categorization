import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaSave, FaCheckCircle, FaTrash, FaPlus, FaGraduationCap, FaBriefcase, FaCode, FaDownload, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useReactToPrint } from "react-to-print";
import PrintableCV from "./PrintableCV";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CVCustomizer = () => {
    const { user, setUser } = useAuth();
    const [profileData, setProfileData] = useState({
        basicInfo: { bio: "", location: "", phone: "" },
        experience: [],
        education: [],
        skills: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [rephrasingField, setRephrasingField] = useState(null); // stores field path string
    const [customPrompts, setCustomPrompts] = useState({}); // Stores user's custom instructions per field
    const printRef = useRef();

    const [targetJob, setTargetJob] = useState("");
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [aiQuestions, setAiQuestions] = useState([]);
    const [aiAnswers, setAiAnswers] = useState({});
    const [conversation, setConversation] = useState([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handleSmartCustomize = async (isResponding = false) => {
        setIsCustomizing(true);
        try {
            const token = localStorage.getItem("token");

            // If it's a response to questions, add them to conversation
            let updatedConversation = [...conversation];
            if (isResponding) {
                const answerText = Object.entries(aiAnswers).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n');
                updatedConversation.push({ role: 'user', text: answerText });
                setConversation(updatedConversation);
                setAiQuestions([]);
                setAiAnswers({});
            }

            const res = await fetch(`${API_URL}/cv/customize`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    jobInfo: targetJob,
                    conversation: updatedConversation
                })
            });
            const result = await res.json();

            if (result.success) {
                const { status, questions, customizedData } = result.data;

                if (status === "needs_info") {
                    setAiQuestions(questions);
                    toast.info("AI needs a bit more info to tailor your CV perfectly.");
                } else if (status === "completed") {
                    // Update profile data with customized content
                    const newData = { ...profileData };
                    if (customizedData.bio) newData.basicInfo.bio = customizedData.bio;
                    if (customizedData.skills) {
                        // Merge or replace skills? Let's replace for high targeting
                        newData.skills = customizedData.skills.map(s => typeof s === 'string' ? { name: s, level: 'Advanced' } : s);
                    }
                    if (customizedData.experience) {
                        customizedData.experience.forEach(exp => {
                            if (newData.experience[exp.index]) {
                                newData.experience[exp.index].description = exp.description;
                            }
                        });
                    }
                    setProfileData(newData);
                    setConversation([]);
                    toast.success("CV highly customized for the target job!");
                }
            } else {
                toast.error(result.error || "Customization failed");
            }
        } catch (e) {
            toast.error("Error contacting AI");
        } finally {
            setIsCustomizing(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${user?.name || 'My'}_CV_Customized`,
    });

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/profiles/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setHistory(result.data.history || []);
            }
        } catch (e) {
            toast.error("Failed to load history");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleRestore = (version) => {
        setProfileData({
            basicInfo: version.basicInfo,
            education: version.education,
            experience: version.experience,
            skills: version.skills,
            cvUrl: version.cvUrl,
            cvFileName: version.cvFileName
        });
        setIsHistoryOpen(false);
        toast.success("Version restored! Don't forget to save if you want to keep it.");
    };

    useEffect(() => {
        if (user) {
            setProfileData({
                basicInfo: user.basicInfo || { bio: "", location: "", phone: "" },
                experience: user.experience || [],
                education: user.education || [],
                skills: user.skills || []
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/profiles/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Profile saved successfully!");
                setUser(prev => ({ ...prev, ...profileData })); // Update central state
            } else {
                toast.error("Failed to save profile");
            }
        } catch (e) {
            toast.error("Error saving profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRephrase = async (text, context, updateCallback, fieldPath) => {
        if (!text || text.trim() === "") return;
        setRephrasingField(fieldPath);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/cv/rephrase`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text, context })
            });
            const result = await res.json();
            if (result.success) {
                updateCallback(result.data);
                toast.success("AI significantly improved your text!");
            } else {
                toast.error(result.error || "Failed to rephrase");
            }
        } catch (e) {
            toast.error("Error contacting AI");
        } finally {
            setRephrasingField(null);
        }
    };

    const updateArrayItem = (arrayName, index, field, value) => {
        const newArray = [...profileData[arrayName]];
        newArray[index][field] = value;
        setProfileData({ ...profileData, [arrayName]: newArray });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-gray-50 border-t border-gray-100">
            {/* Top Navigation Bar */}
            <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-30 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <FaRobot size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">CV Customizer</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">AI-Powered Targeting</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            fetchHistory();
                            setIsHistoryOpen(true);
                        }}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <FaBriefcase className="text-gray-400" /> History
                    </button>
                    <button
                        onClick={() => handlePrint()}
                        className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <FaDownload /> Export PDF
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaSave />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Split Screen Container */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Editor */}
                <div className="w-full lg:w-[450px] shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                        {/* Smart Targeting Input */}
                        <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                            <h3 className="text-sm font-black text-indigo-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <FaRobot className="text-indigo-600" /> AI Smart Targeting
                            </h3>
                            <div className="space-y-3">
                                <textarea
                                    placeholder="Paste the Job Description or Title here... AI will analyze it to tailor your CV."
                                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 transition-all"
                                    value={targetJob}
                                    onChange={e => setTargetJob(e.target.value)}
                                />
                                <button
                                    onClick={() => handleSmartCustomize()}
                                    disabled={isCustomizing || !targetJob}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                                >
                                    {isCustomizing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaRobot />}
                                    Analyze & Tailor CV
                                </button>
                            </div>
                        </div>

                        {/* Professional Bio Section */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm"><FaUser /></span>
                                    Professional Bio
                                </h3>
                                <button
                                    onClick={() => handleRephrase(
                                        profileData.basicInfo.bio,
                                        "Professional, concise, and punchy executive summary",
                                        (newBio) => setProfileData(p => ({ ...p, basicInfo: { ...p.basicInfo, bio: newBio } })),
                                        "bio"
                                    )}
                                    disabled={rephrasingField === "bio"}
                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-indigo-100"
                                >
                                    {rephrasingField === "bio" ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <FaRobot />}
                                    AI Polish
                                </button>
                            </div>
                            <textarea
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] text-sm leading-relaxed"
                                value={profileData.basicInfo.bio || ""}
                                onChange={e => setProfileData({ ...profileData, basicInfo: { ...profileData.basicInfo, bio: e.target.value } })}
                                placeholder="Describe your professional career..."
                            />
                        </section>

                        {/* Experience Section */}
                        <section className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm"><FaBriefcase /></span>
                                    Work Experience
                                </h3>
                                <button
                                    onClick={() => setProfileData({ ...profileData, experience: [{ title: "", company: "", duration: "", description: "" }, ...profileData.experience] })}
                                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-blue-100"
                                >
                                    <FaPlus /> Add Role
                                </button>
                            </div>

                            <div className="space-y-6">
                                {profileData.experience.map((exp, idx) => (
                                    <div key={idx} className="group relative bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all hover:border-gray-200">
                                        <button
                                            onClick={() => setProfileData({ ...profileData, experience: profileData.experience.filter((_, i) => i !== idx) })}
                                            className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-50"
                                        >
                                            <FaTrash size={14} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Job Title</label>
                                                <input
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={exp.title || ""}
                                                    onChange={e => updateArrayItem('experience', idx, 'title', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Company</label>
                                                <input
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={exp.company || ""}
                                                    onChange={e => updateArrayItem('experience', idx, 'company', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Description & Achievements</label>
                                                <button
                                                    onClick={() => handleRephrase(exp.description, "Bullet points, result-oriented, technical", (newDesc) => updateArrayItem('experience', idx, 'description', newDesc), `exp-${idx}`)}
                                                    disabled={rephrasingField === `exp-${idx}`}
                                                    className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1"
                                                >
                                                    {rephrasingField === `exp-${idx}` ? <div className="w-2.5 h-2.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : <FaRobot />}
                                                    AI Polish
                                                </button>
                                            </div>
                                            <textarea
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                                value={exp.description || ""}
                                                onChange={e => updateArrayItem('experience', idx, 'description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="hidden lg:flex flex-1 bg-gray-100/50 overflow-hidden relative justify-center items-start p-6">
                    <div className="sticky top-0 w-full max-w-[900px] h-full overflow-y-auto bg-white shadow-2xl rounded-sm scrollbar-hide mb-12">
                        <PrintableCV profile={profileData} user={user} />
                    </div>
                    {/* Floating Refresh Hint */}
                    <div className="fixed bottom-10 right-10 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
                        <FaCheckCircle className="text-emerald-400" /> Real-time Preview
                    </div>
                </div>
            </div>

            {/* AI Questions Modal */}
            {aiQuestions.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={(e) => e.target === e.currentTarget && setAiQuestions([])}
                >
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white relative">
                            <button className="absolute top-6 right-8 text-white/40 group cursor-pointer hover:text-white transition-colors p-2" onClick={() => setAiQuestions([])}>
                                <FaTimes size={20} />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-4">
                                <FaRobot size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Refining Your Targeting</h3>
                            <p className="text-blue-100 mt-1 opacity-80">AI needs a bit more context to make your CV stand out for this role.</p>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                            {aiQuestions.map((q, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-sm font-bold text-slate-800 tracking-tight leading-relaxed">{q}</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all"
                                        placeholder="Your answer..."
                                        value={aiAnswers[q] || ""}
                                        onChange={e => setAiAnswers({ ...aiAnswers, [q]: e.target.value })}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="p-8 pt-0 bg-white">
                            <button
                                onClick={() => handleSmartCustomize(true)}
                                disabled={isCustomizing}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl hover:bg-indigo-700 transition font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
                            >
                                {isCustomizing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaCheckCircle />}
                                Finalize & Regenerate CV
                            </button>
                            <button
                                onClick={() => setAiQuestions([])}
                                className="w-full mt-4 text-sm font-bold text-gray-400 hover:text-gray-600"
                            >
                                Cancel Optimization
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={(e) => e.target === e.currentTarget && setIsHistoryOpen(false)}
                >
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300 max-h-[80vh]">
                        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">CV Version History</h3>
                                <p className="text-slate-400 text-xs mt-1">Select a snapshot to restore your CV to that state.</p>
                            </div>
                            <button onClick={() => setIsHistoryOpen(false)} className="text-white/50 hover:text-white transition-colors p-2">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {isLoadingHistory ? (
                                <div className="text-center py-10 text-gray-500">Loading history...</div>
                            ) : history.length > 0 ? (
                                history.map((ver, idx) => (
                                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center hover:border-blue-200 transition-colors">
                                        <div>
                                            <p className="font-bold text-gray-800">Version {history.length - idx}</p>
                                            <p className="text-xs text-gray-500">{new Date(ver.timestamp).toLocaleString()}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{ver.experience?.length || 0} Roles</span>
                                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{ver.skills?.length || 0} Skills</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestore(ver)}
                                            className="px-4 py-2 bg-white border border-gray-200 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                                        >
                                            Restore
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">No history found. Save changes to create a version.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden printable CV for actual print engine */}
            <div className="absolute -top-[10000px] -left-[10000px]">
                <div ref={printRef}>
                    <PrintableCV profile={profileData} user={user} />
                </div>
            </div>
        </div>
    );
};

export default CVCustomizer;
