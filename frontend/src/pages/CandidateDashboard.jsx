import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCheckCircle, FaClock, FaBriefcase, FaChartLine, FaUpload, FaEdit, FaSearch, FaBell, FaTrophy, FaFileAlt, FaBars, FaSync } from "react-icons/fa";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import FileUpload from "../components/FileUpload";
import JobRecommendations from "../components/JobRecommendations";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import CareerTips from "../components/CareerTips";
import Profile from "../components/Profile";
import Preloader from "../components/Preloader";
import TopBar from "../components/TopBar";
import Messaging from "../components/Messaging";
import ChatPopup from "../components/ChatPopup";
import MyApplications from "../components/MyApplications";
import CVCustomizer from "../components/CVCustomizer";
import { fetchData } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import CVViewerModal from "../components/CVViewerModal";

const CandidateDashboard = () => {
  const [selectedSection, setSelectedSection] = useState("overview");
  const { user: userData, loading: authLoading, setUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [openConversationId, setOpenConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // CV Viewer State
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const handleOpenChat = (conversationId) => {
    setOpenConversationId(conversationId);
    setSelectedSection('messages');
  };

  const handleOpenCV = () => {
    setIsCVModalOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!authLoading && userData) {
      setIsLoading(false);
    }
  }, [authLoading, userData]);

  const handleUploadSuccess = async (data) => {
    // Update user state with the full profile returned from the backend
    if (data.profile) {
      // Refresh user from backend to get perfect structure and avoid redirects
      await refreshUser();

      // Redirect to profile section
      setSelectedSection("profile");
      toast.success("CV analyzed! Redirecting to your profile...");

      // Check for missing fields to notify user
      const missingFields = [];
      if (!data.profile.basicInfo?.bio) missingFields.push("Bio");
      if (!data.profile.skills || data.profile.skills.length === 0) missingFields.push("Skills");
      if (!data.profile.experience || data.profile.experience.length === 0) missingFields.push("Experience");
      if (!data.profile.education || data.profile.education.length === 0) missingFields.push("Education");
      if (!data.profile.basicInfo?.phone) missingFields.push("Phone Number");

      if (missingFields.length > 0) {
        setTimeout(() => {
          toast.info(`Please check and complete: ${missingFields.join(", ")}`, {
            autoClose: 10000,
            position: "top-center"
          });
        }, 1500);
      }
    } else {
      // Fallback for older versions or unexpected responses
      setUser(prev => ({
        ...prev,
        cvUrl: data.cvUrl,
        cvFileName: data.cvFileName,
        cvUploadedAt: new Date().toISOString()
      }));
      setSelectedSection("profile");
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-lg rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-4 md:block mb-4 md:mb-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, {userData?.name || "User"}!</h1>
                  </div>
                  <p className="text-gray-600 hidden md:block">Here's your career progress overview and personalized recommendations.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
                  >
                    <FaSync className={isRefreshing ? 'animate-spin' : ''} /> Refresh
                  </button>
                  {userData?.cvUrl && (
                    <button
                      onClick={handleOpenCV}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      <FaFileAlt /> View CV
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedSection("upload")}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaUpload /> {userData?.cvUrl ? "Update CV" : "Upload CV"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <FaCheckCircle size={24} />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <p className="text-2xl font-bold">{userData?.onboardingCompleted ? 'Complete' : 'Pending'}</p>
                  <p className="text-xs opacity-80 mt-1">Profile Onboarding</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <FaBriefcase size={24} />
                    <span className="text-sm font-medium">Skills</span>
                  </div>
                  <p className="text-2xl font-bold">{userData?.skills?.length || 0}</p>
                  <p className="text-xs opacity-80 mt-1">Listed in Profile</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <FaChartLine size={24} />
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <p className="text-2xl font-bold">{userData?.experience?.length || 0}</p>
                  <p className="text-xs opacity-80 mt-1">Work History Items</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <FaTrophy size={24} />
                    <span className="text-sm font-medium">Applications</span>
                  </div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs opacity-80 mt-1">Active Job Apps</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaClock className="text-blue-500" /> Recent Activity
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex justify-between">
                      <span>Profile Updated via AI</span>
                      <span className="text-gray-400">Just now</span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center flex flex-col items-center justify-center">
                  <FaBell className="text-gray-400 mb-2" size={20} />
                  <p className="text-sm text-gray-500 italic">No new notifications</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SkillGapAnalysis user={userData} />
              <CareerTips />
            </div>
          </div>
        );
      case "profile":
        return <Profile user={userData} />;
      case "upload":
        return <FileUpload onUploadSuccess={handleUploadSuccess} />;
      case "jobs":
        return <JobRecommendations onApplySuccess={() => setSelectedSection("applications")} />;
      case "applications":
        return <MyApplications />;
      case "skills":
        return <SkillGapAnalysis user={userData} />;
      case "career":
        return <CareerTips />;
      case "cv-customizer":
        return <CVCustomizer />;
      case "messages":
        return <Messaging initialConversationId={openConversationId} />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800">Section Coming Soon</h2>
            <p className="text-gray-600">We're working hard to bring you this feature.</p>
          </div>
        );
    }
  };

  if (isLoading) return <Preloader />;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden relative">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed/Absolute when toggleable */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out h-full
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <Sidebar
          setSelectedSection={(section) => {
            setSelectedSection(section);
            setIsSidebarOpen(false); // Hide after selection
          }}
          selectedSection={selectedSection}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
        <TopBar user={userData} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 mt-16 overflow-hidden relative flex flex-col">
          <div className={`flex-1 ${selectedSection === 'cv-customizer' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-6'}`}>
            {renderContent()}
          </div>
        </main>

        <ChatPopup onOpenChat={handleOpenChat} />
      </div>

      <CVViewerModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        cvUrl={userData?.cvUrl || ''}
        candidateName={userData?.name || 'Your'}
      />
    </div>
  );
};

export default CandidateDashboard;
