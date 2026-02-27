import React, { useState, useEffect } from 'react';
import { FaTimes, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaEye, FaChevronDown, FaChevronUp, FaRobot, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaEnvelope, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import PostJobForm from './PostJobForm';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { updateJob as updateJobApi } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const JobManagement = ({ onViewCV, onOpenChat }) => {
  const [jobs, setJobs] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [smartCandidates, setSmartCandidates] = useState([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const [outreachLoading, setOutreachLoading] = useState({});
  const { user } = useAuth();

  const fetchJobs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/jobs`);
      const result = await response.json();
      if (result.success) {
        // Find jobs posted by this recruiter - use .id or .uid depending on what's in user object
        const myJobs = result.data.filter(job => job.recruiter === user.id || job.recruiter === user.uid);
        setJobs(myJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setJobs(jobs.filter(job => job._id !== id));
        toast.success('Job deleted successfully');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const handleAddJob = async (newJobData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newJobData)
      });
      const result = await response.json();
      if (result.success) {
        setJobs([result.data, ...jobs]);
        toast.success('Job posted successfully');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleUpdateJob = async (updatedJobData) => {
    try {
      const result = await updateJobApi(editingJob._id, updatedJobData);
      if (result.success) {
        setJobs(jobs.map(j => j._id === editingJob._id ? result.data : j));
        toast.success('Job updated successfully');
      } else {
        toast.error(result.error || 'Failed to update job');
      }
    } catch (error) {
      toast.error('Failed to update job');
    }
    setEditingJob(null);
    setIsFormOpen(false);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingJob(null);
  };

  const fetchApplicants = async (jobId) => {
    try {
      setApplicantsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/applications/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setApplicants(result.data);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to load applicants');
    } finally {
      setApplicantsLoading(false);
    }
  };

  // Helper to fetch profile and then view CV
  const handleViewApplicantCV = async (candidateId, candidateName) => {
    try {
      const token = localStorage.getItem('token');
      // We need the profile to get the cvUrl
      const response = await fetch(`${API_URL}/profiles/user/${candidateId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success && result.data.cvUrl) {
        onViewCV(result.data.cvUrl, candidateName);
      } else {
        toast.error('CV not found for this candidate');
      }
    } catch (error) {
      toast.error('Error fetching candidate profile');
    }
  };

  const updateApplicantStatus = async (jobId, appId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        setApplicants(applicants.map(app => app._id === appId ? { ...app, status: newStatus } : app));
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleStartChat = (candidateUserId) => {
    if (onOpenChat && candidateUserId) {
      onOpenChat(candidateUserId);
      setViewingJob(null); // Close the modal after starting chat
    } else {
      toast.error("Could not start chat. Candidate user ID not found.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shortlisted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Interview':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    if (viewingJob) {
      fetchApplicants(viewingJob._id);
      fetchSmartCandidates(viewingJob._id);
    } else {
      setApplicants([]);
      setSmartCandidates([]);
    }
  }, [viewingJob]);

  const fetchSmartCandidates = async (jobId) => {
    try {
      setSmartLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/best-candidates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setSmartCandidates(result.data);
      }
    } catch (error) {
      console.error('Error fetching smart matches:', error);
    } finally {
      setSmartLoading(false);
    }
  };

  const handleGenerateOutreach = async (appId) => {
    try {
      setOutreachLoading(prev => ({ ...prev, [appId]: true }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/applications/${appId}/outreach-draft`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setApplicants(prev => prev.map(app =>
          app._id === appId ? { ...app, outreachDraft: result.data } : app
        ));
        toast.success("Outreach draft ready!");
      }
    } catch (error) {
      toast.error("Failed to generate outreach");
    } finally {
      setOutreachLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your jobs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Job Management</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> Post New Job
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500">Posted: {new Date(job.postedDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{job.applicantsCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => setViewingJob(job)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-900"
                        onClick={() => handleEditJob(job)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No jobs posted yet. Click "Post New Job" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PostJobForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingJob ? handleUpdateJob : handleAddJob}
        editMode={!!editingJob}
        existingJob={editingJob}
      />

      {/* Viewing Job Modal */}
      {viewingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">{viewingJob.title}</h2>
              <button onClick={() => setViewingJob(null)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h3>
                <p className="text-gray-700">{viewingJob.description}</p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Applicants ({applicants.length})</h3>
                {applicantsLoading ? (
                  <p className="text-center text-gray-500 py-4">Loading applicants...</p>
                ) : applicants.length > 0 ? (
                  <div className="space-y-6">
                    {applicants.map((app) => (
                      <div key={app._id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              {app.candidate?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{app.candidate?.name}</p>
                              <p className="text-xs text-gray-500">{app.candidate?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartChat(app.candidate?.user?._id || app.candidate?.user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Message Candidate"
                            >
                              <FaEnvelope size={16} />
                            </button>
                            <select
                              value={app.status || 'Applied'}
                              onChange={(e) => updateApplicantStatus(viewingJob._id, app._id, e.target.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusStyle(app.status)}`}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <button
                              onClick={() => handleViewApplicantCV(app.candidate?._id, app.candidate?.name)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View CV"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={() => handleGenerateOutreach(app._id)}
                              disabled={outreachLoading[app._id]}
                              className="bg-blue-50 text-blue-600 text-xs px-3 py-2 rounded-lg hover:bg-blue-100 transition-all font-bold flex items-center gap-1 border border-blue-100"
                            >
                              {outreachLoading[app._id] ? (
                                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : <FaEnvelope size={12} />}
                              Outreach
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  toast.info("Generating AI Insights...");
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(`${API_URL}/applications/${app._id}/ai-insights`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  const result = await res.json();
                                  if (result.success) {
                                    setApplicants(applicants.map(a =>
                                      a._id === app._id ? { ...a, aiInsights: result.data } : a
                                    ));
                                    toast.success("AI Insights ready!");
                                  }
                                } catch (e) {
                                  toast.error("Failed to generate AI insights");
                                }
                              }}
                              className="bg-purple-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-purple-700 transition-all font-bold"
                            >
                              AI Analysis
                            </button>
                          </div>
                        </div>

                        {/* AI Insights Section */}
                        {app.aiInsights && (
                          <div className="p-4 bg-purple-50/30 border-t border-purple-100 animate-fade-in">
                            <div className="mb-3">
                              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
                                Candidate Summary
                              </h4>
                              <p className="text-sm text-gray-700 leading-relaxed italic">"{app.aiInsights.summary}"</p>
                            </div>
                            <div className="mb-3">
                              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
                                Technical Interview Questions
                              </h4>
                              <ul className="grid grid-cols-1 gap-2">
                                {app.aiInsights.interviewQuestions.map((q, idx) => (
                                  <li key={idx} className="bg-white p-2 rounded-lg text-xs text-gray-600 border border-purple-100 flex gap-2">
                                    <span className="font-bold text-purple-500">{idx + 1}.</span>
                                    {q}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {app.aiInsights.screeningChecklist && (
                              <div>
                                <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                  <span className="w-1 h-3 bg-teal-500 rounded-full"></span>
                                  Recruiter Screening Checklist
                                </h4>
                                <ul className="grid grid-cols-1 gap-2">
                                  {app.aiInsights.screeningChecklist.map((item, idx) => (
                                    <li key={idx} className="bg-white p-2 rounded-lg text-xs text-gray-600 border border-teal-100 flex gap-2">
                                      <FaCheckCircle className="text-teal-500 shrink-0 mt-0.5" size={10} />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Outreach Draft Section */}
                        {app.outreachDraft && (
                          <div className="p-4 bg-blue-50/30 border-t border-blue-100 animate-fade-in">
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                              AI Outreach Draft
                            </h4>
                            <div className="relative group">
                              <pre className="text-sm text-gray-700 leading-relaxed font-sans whitespace-pre-wrap bg-white p-4 rounded-xl border border-blue-50">
                                {app.outreachDraft}
                              </pre>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(app.outreachDraft);
                                  toast.success("Outreach draft copied!");
                                }}
                                className="absolute top-2 right-2 text-blue-600 bg-blue-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                                title="Copy to clipboard"
                              >
                                <FaCheckCircle size={14} />
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">
                              💡 Tip: This draft is personalized based on their specific experience highlights.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No applicants yet.</p>
                )}
              </div>

              {/* AI Best Matches Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">AI Best Matches</h3>
                  <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">AI Discovery</span>
                </div>

                {smartLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                    <p className="text-sm text-purple-600 font-medium">Analyzing candidate pool...</p>
                  </div>
                ) : smartCandidates.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {smartCandidates.map((cad, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                              {cad.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{cad.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{cad.matchScore}% Match</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 italic leading-relaxed bg-gray-50 p-2 rounded-lg border-l-2 border-purple-400">
                          "{cad.matchReason}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No high-potential candidates found in the system yet.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${viewingJob.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{viewingJob.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
