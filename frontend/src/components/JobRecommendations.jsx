import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaMoneyBill, FaBriefcase } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { fetchJobs, fetchData, applyForJob } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const JobRecommendations = ({ onApplySuccess }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // Use the new semantic match endpoint
        const response = await fetch(`${API_URL}/jobs/match`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
          // Fetch the full job details for the matched IDs
          // Or we can rely on the match endpoint to return basic job info
          // For now, let's fetch all jobs and merge
          const jobRes = await fetchJobs();

          if (jobRes.success) {
            const enrichedJobs = result.data.map(match => {
              const jobDetails = jobRes.data.find(j => j._id === match.jobId);
              return {
                ...jobDetails,
                match: `${match.matchScore}%`,
                score: match.matchScore,
                reason: match.reason
              };
            }).filter(j => j._id); // Filter out any jobs not found

            setJobs(enrichedJobs);
          }
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      const result = await applyForJob(jobId);
      if (result.success) {
        toast.success("Application submitted successfully!");
        if (onApplySuccess) onApplySuccess();
      } else {
        toast.error(result.error || "Application failed");
      }
    } catch (error) {
      console.error('Apply error:', error);
      toast.error("Application failed");
    }
  };

  if (loading) return (
    <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500 italic">Finding your perfect career match using AI...</p>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 animate-fade-in shadow-blue-50/50 h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <span className="bg-blue-600 w-2 h-8 rounded-full"></span>
        AI-Recommended Jobs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? jobs.sort((a, b) => b.score - a.score).map((job, index) => (
          <div key={index} className="group border border-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 bg-white/50 backdrop-blur-sm hover:bg-white border-l-4 border-l-transparent hover:border-l-blue-500 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{job.title}</h3>
                <p className="text-sm text-gray-600 font-medium truncate">{job.company}</p>
              </div>
              <div className="flex flex-col items-end ml-2">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 whitespace-nowrap">
                  {job.match}
                </span>
              </div>
            </div>

            {/* AI Reasoning Section */}
            {job.reason && (
              <div className="mb-4 p-3 bg-blue-50/30 rounded-xl border border-blue-100/30 flex-1">
                <p className="text-[11px] text-blue-700 leading-relaxed italic line-clamp-3">
                  <span className="font-bold not-italic mr-1">🤖 AI:</span>
                  "{job.reason}"
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                <FaBriefcase className="text-purple-400" />
                <span>{job.level || 'Fresher'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                <FaMapMarkerAlt className="text-blue-400" />
                <span>{job.location || 'Remote'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                <FaMoneyBill className="text-green-400" />
                <span>{job.salary || 'Competitive'}</span>
              </div>
            </div>

            <button
              onClick={() => handleApply(job._id)}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-[0.98] mt-auto"
            >
              Apply Now
            </button>
          </div>
        )) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-gray-500 font-medium">Upload your CV to unlock laser-focused job recommendations!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
