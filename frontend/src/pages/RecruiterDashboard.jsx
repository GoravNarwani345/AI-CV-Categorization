import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSync, FaRobot } from 'react-icons/fa';
import RecruiterSidebar from '../components/RecruiterSidebar';
import TopBar from '../components/TopBar';
import CandidateCard from '../components/CandidateCard';
import JobManagement from '../components/JobManagement';
import Analytics from '../components/Analytics';
import Messaging from '../components/Messaging';
import RecruiterProfile from '../components/RecruiterProfile';
import { fetchAllProfiles } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import ChatPopup from '../components/ChatPopup';
import CVViewerModal from '../components/CVViewerModal';
import { toast } from 'react-toastify';

const RecruiterDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('candidates');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user: userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationUpdate, clearApplicationUpdate } = useSocket();
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [openConversationId, setOpenConversationId] = useState(null);
  const [skillFilter, setSkillFilter] = useState('All Skills');
  const [statusFilter, setStatusFilter] = useState('All Candidates');
  const [jobFilter, setJobFilter] = useState('All Jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoShortlistLoading, setAutoShortlistLoading] = useState(false);

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
      setIsRefreshing(true);
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
      setJobs(recruiterJobs);

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
      const appMapByUserIdAndJob = {}; // Track applications by user and job

      appsResults.forEach((res, idx) => {
        if (res.success && res.data) {
          res.data.forEach(app => {
            allApplications.push(app);
            const userId = app.candidate?._id || app.candidate;
            const jobId = recruiterJobs[idx]._id;
            
            // Store application metadata for the card
            appMapByUserId[userId] = {
              status: app.status,
              id: app._id,
              interviewDate: app.interviewDate,
              jobId: jobId
            };
            
            // Track by user and job for filtering
            if (!appMapByUserIdAndJob[userId]) {
              appMapByUserIdAndJob[userId] = [];
            }
            appMapByUserIdAndJob[userId].push(jobId.toString());
          });
        }
      });

      setApplications(allApplications);

      // 3. Fetch all profiles to show the pool, but only candidates
      const profilesRes = await fetchAllProfiles();

      if (profilesRes.success) {
        const candidateList = profilesRes.data
          .filter(p => {
            const userId = p.user?._id || p.user?.uid;
            // Only show candidates who have applied to at least one of this recruiter's jobs
            return p.user && p.user.role === 'candidate' && appMapByUserIdAndJob[userId];
          })
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
              interviewDate: appInfo.interviewDate,
              appliedJobs: appMapByUserIdAndJob[userId] || []
            };
          });
        setCandidates(candidateList);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Error loading dashboard data");
    } finally {
      setCandidatesLoading(false);
      setIsRefreshing(false);
    }
  }, [userData, authLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for real-time application updates
  useEffect(() => {
    if (applicationUpdate) {
      console.log('Recruiter received application update:', applicationUpdate);
      loadData();
      clearApplicationUpdate();
    }
  }, [applicationUpdate, clearApplicationUpdate, loadData]);
  
  // Sync section with URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (['jobs', 'candidates', 'analytics', 'messages', 'profile'].includes(lastPart)) {
      setSelectedSection(lastPart);
    }
  }, [location.pathname]);

  const handleSectionChange = (section) => {
    setSelectedSection(section);
    navigate(`/recruiterDashboard/${section}`);
  };

  const handleAutoShortlist = async (jobId) => {
    try {
      setAutoShortlistLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/applications/job/${jobId}/auto-shortlist`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || 'Candidates auto-shortlisted!');
        loadData();
      } else {
        toast.error(result.error || 'Failed to auto-shortlist');
      }
    } catch (error) {
      toast.error('Failed to auto-shortlist candidates');
    } finally {
      setAutoShortlistLoading(false);
    }
  };

  // Derive unique skills from all candidates for filter options
  const allSkills = ['All Skills', ...new Set(candidates.flatMap(c => c.skills))];

  // Apply filters
  const filteredCandidates = candidates.filter(candidate => {
    // Ensure candidate has applied to at least one job
    const hasAppliedToJobs = candidate.appliedJobs && candidate.appliedJobs.length > 0;
    if (!hasAppliedToJobs) return false;
    
    const matchesSkill = skillFilter === 'All Skills' || candidate.skills.includes(skillFilter);
    const matchesStatus = statusFilter === 'All Candidates' || candidate.status === statusFilter;
    const matchesJob = jobFilter === 'All Jobs' || candidate.appliedJobs.includes(jobFilter);
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSkill && matchesStatus && matchesJob && matchesSearch;
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
              <div className="flex gap-4 flex-wrap items-center">
                <button
                  onClick={loadData}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  title="Refresh candidates"
                >
                  <FaSync className={isRefreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {jobFilter !== 'All Jobs' && (
                  <button
                    onClick={() => handleAutoShortlist(jobFilter)}
                    disabled={autoShortlistLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                    title="AI auto-shortlist candidates for this job"
                  >
                    {autoShortlistLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : <FaRobot />}
                    AI Auto-Shortlist
                  </button>
                )}
                <select
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                >
                  <option value="All Jobs">All Jobs</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
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
          onSectionChange={handleSectionChange}
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
