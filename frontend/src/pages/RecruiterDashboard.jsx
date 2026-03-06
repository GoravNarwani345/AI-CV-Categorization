import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterSidebar from '../components/RecruiterSidebar';
import TopBar from '../components/TopBar';
import CandidateCard from '../components/CandidateCard';
import JobManagement from '../components/JobManagement';
import Analytics from '../components/Analytics';
import Messaging from '../components/Messaging';
import RecruiterProfile from '../components/RecruiterProfile';
import { fetchAllProfiles } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import ChatPopup from '../components/ChatPopup';
import CVViewerModal from '../components/CVViewerModal';
import { toast } from 'react-toastify';

const RecruiterDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('candidates');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user: userData, loading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [openConversationId, setOpenConversationId] = useState(null);
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [statusFilter, setStatusFilter] = useState('All Candidates');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);

  // CV Viewer State
  const [isCVModalOpen, setIsCVModalOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState({ url: '', name: '' });

  const handleOpenChat = (conversationId) => {
    setOpenConversationId(conversationId);
    setSelectedSection('messages');
  };

  const handleOpenCV = (cvUrl, candidateName) => {
    setSelectedCV({ url: cvUrl, name: candidateName });
    setIsCVModalOpen(true);
  };

  // Fetch real candidate data from backend
  const loadData = useCallback(async () => {
    if (authLoading || !userData) return;

    try {
      setCandidatesLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      // 1. Fetch recruiter's own jobs
      const jobsRes = await fetch(`${API_BASE_URL}/jobs/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json());

      if (!jobsRes.success) {
        toast.error("Failed to load your jobs");
        return;
      }

      const recruiterJobs = jobsRes.data || [];

      // 2. For each job, fetch its applications
      const appsPromises = recruiterJobs.map(job =>
        fetch(`${API_BASE_URL}/applications/job/${job._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      );

      const appsResults = await Promise.all(appsPromises);

      // Flatten all applications into a single list
      const allApplications = [];
      const appMapByUserId = {}; // To track statuses for the candidate pool view

      appsResults.forEach(res => {
        if (res.success && res.data) {
          res.data.forEach(app => {
            allApplications.push(app);
            const userId = app.candidate?._id || app.candidate;
            // Store application metadata for the card
            appMapByUserId[userId] = {
              status: app.status,
              id: app._id,
              interviewDate: app.interviewDate
            };
          });
        }
      });

      setApplications(allApplications);

      // 3. Fetch all profiles to show the pool, but only candidates
      const profilesRes = await fetchAllProfiles();

      if (profilesRes.success) {
        const candidateList = profilesRes.data
          .filter(p => p.user && p.user.role === 'candidate')
          .map((profile) => {
            const userId = profile.user?._id || profile.user?.uid;
            const appInfo = appMapByUserId[userId] || {};

            return {
              id: profile._id,
              userId: userId,
              name: profile.user?.name || 'Unknown',
              position: profile.experience?.[0]?.title || 'Not specified',
              rating: profile.rating || 4.5,
              summary: profile.basicInfo?.bio || 'No bio provided',
              skills: profile.skills?.map(s => s.name) || [],
              experience: profile.experience?.length ? `${profile.experience.length} roles` : 'No experience listed',
              location: profile.basicInfo?.location || 'Not specified',
              cvUrl: profile.cvUrl,
              status: appInfo.status || 'Applied',
              applicationId: appInfo.id,
              interviewDate: appInfo.interviewDate
            };
          });
        setCandidates(candidateList);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Error loading dashboard data");
    } finally {
      setCandidatesLoading(false);
    }
  }, [userData, authLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive unique skills from all candidates for filter options
  const allSkills = ['All Skills', ...new Set(candidates.flatMap(c => c.skills))];

  // Apply filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSkill = skillFilter === 'All Skills' || candidate.skills.includes(skillFilter);
    const matchesStatus = statusFilter === 'All Candidates' || candidate.status === statusFilter;
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSkill && matchesStatus && matchesSearch;
  });

  const renderContent = () => {
    switch (selectedSection) {
      case 'jobs':
        return <JobManagement onViewCV={handleOpenCV} onOpenChat={handleOpenChat} />;
      case 'candidates':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Candidate Pool</h2>
              <div className="flex gap-4">
                <select
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                >
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <select
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Candidates">All Candidates</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {candidatesLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading candidate pool...</p>
              </div>
            ) : filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onOpenChat={() => handleOpenChat(candidate.userId)}
                    onViewCV={() => handleOpenCV(candidate.cvUrl, candidate.name)}
                    onStatusUpdate={loadData}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-100 italic text-gray-400 font-medium shadow-sm">
                No candidates found matching your filters.
              </div>
            )}
          </div>
        );
      case 'analytics':
        return <Analytics candidates={candidates} applications={applications} />;
      case 'messages':
        return <Messaging initialConversationId={openConversationId} />;
      case 'profile':
        return <RecruiterProfile />;
      default:
        return <div>Section coming soon...</div>;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden lg:pl-0">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on desktop, toggleable on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out h-full
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <RecruiterSidebar
          selectedSection={selectedSection}
          onSectionChange={(section) => {
            setSelectedSection(section);
            setIsSidebarOpen(false); // Hide after selection
          }}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">
        <TopBar user={userData} onSearch={setSearchTerm} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 mt-16 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
      <ChatPopup onOpenChat={handleOpenChat} />
      <CVViewerModal
        isOpen={isCVModalOpen}
        onClose={() => setIsCVModalOpen(false)}
        cvUrl={selectedCV.url}
        candidateName={selectedCV.name}
      />
    </div>
  );
};

export default RecruiterDashboard;
