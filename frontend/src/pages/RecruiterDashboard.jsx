import React, { useEffect, useState } from 'react';
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

const RecruiterDashboard = () => {
  const [selectedSection, setSelectedSection] = useState('candidates');
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

  // Authentication is handled by ProtectedRoute and AuthContext
  // No local state needed for session management here

  // Fetch real candidate data from backend
  useEffect(() => {
    if (authLoading) return;
    if (!userData) {
      setCandidatesLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setCandidatesLoading(true);
        const token = localStorage.getItem('token');

        // Parallel fetch for profiles and applications
        const [profilesRes, appsRes] = await Promise.all([
          fetchAllProfiles(),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/applications/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json().catch(() => ({ success: false })))
        ]);

        let appMap = {};
        if (appsRes.success) {
          // If recruiter, find apps for their jobs (backend route might need adjustment or we use jobs route)
          // For now, let's assume we can at least get a pool of applications
          setApplications(appsRes.data || []);
          appsRes.data?.forEach(app => {
            const candidateId = app.candidate?._id || app.candidate;
            if (!appMap[candidateId] || app.status === 'Shortlisted' || app.status === 'Interview') {
              appMap[candidateId] = app.status;
            }
          });
        }

        if (profilesRes.success) {
          const candidateList = profilesRes.data
            .filter(p => p.user && p.user.role === 'candidate')
            .map((profile) => ({
              id: profile._id,
              userId: profile.user?._id || profile.user?.uid,
              name: profile.user?.name || 'Unknown',
              position: profile.experience?.[0]?.title || 'Not specified',
              rating: profile.rating || 4.5, // Use real rating if available
              summary: profile.basicInfo?.bio || 'No bio provided',
              skills: profile.skills?.map(s => s.name) || [],
              experience: profile.experience?.length ? `${profile.experience.length} roles` : 'No experience listed',
              location: profile.basicInfo?.location || 'Not specified',
              cvUrl: profile.cvUrl,
              status: appMap[profile.user?._id] || 'Applied'
            }));
          setCandidates(candidateList);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setCandidatesLoading(false);
      }
    };

    loadData();
  }, [userData, authLoading]);

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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option>All Candidates</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>
            {candidatesLoading ? (
              <div className="text-center py-12 text-gray-500">Loading candidates...</div>
            ) : filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onOpenChat={() => handleOpenChat(candidate.userId)}
                    onViewCV={() => handleOpenCV(candidate.cvUrl, candidate.name)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No candidates registered yet.
              </div>
            )}
          </div>
        );
      case 'analytics':
        return <Analytics />;
      case 'messages':
        return <Messaging conversationId={openConversationId} />;
      case 'profile':
        return <RecruiterProfile />;
      default:
        return <div>Section under construction</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RecruiterSidebar
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
      />
      <div className="flex-1 flex flex-col">
        <TopBar user={userData} onSearch={setSearchTerm} />
        <main className="p-8 mt-16 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
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
