import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaStar, FaEnvelope, FaDownload } from 'react-icons/fa';
import { format } from 'date-fns';

const CandidateCard = ({ candidate, onOpenChat, onViewCV, onStatusUpdate }) => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const API_BASE = API_URL.replace('/api', '');

  const [isScheduling, setIsScheduling] = React.useState(false);
  const [scheduledDate, setScheduledDate] = React.useState(candidate.interviewDate || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  React.useEffect(() => {
    if (candidate.interviewDate) {
      setScheduledDate(candidate.interviewDate);
    }
  }, [candidate.interviewDate]);

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-700 border-blue-200',
    'Shortlisted': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Interview': 'bg-purple-100 text-purple-700 border-purple-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200'
  };

  const handleStatusChange = async (newStatus) => {
    if (!candidate.applicationId) {
      toast.warning("No application found for this candidate relative to your jobs.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/applications/${candidate.applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Status updated to ${newStatus}`);
        if (onStatusUpdate) onStatusUpdate();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error("Please select a date and time");
      return;
    }

    setIsScheduling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/applications/${candidate.applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewDate: scheduledDate })
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Interview scheduled successfully");
        if (onStatusUpdate) onStatusUpdate();
      } else {
        toast.error(result.error || 'Failed to schedule');
      }
    } catch (error) {
      toast.error('Error scheduling interview');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: candidate.userId })
      });
      const result = await response.json();
      if (result.success) {
        onOpenChat(result.data._id);
      } else {
        toast.error(result.error || 'Failed to start chat');
      }
    } catch (error) {
      toast.error('Error starting chat');
    }
  };

  const formatInterviewDate = (dateString) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'PPPp'); // Example: October 27th, 2023 at 10:30 AM
    } catch (e) {
      return new Date(dateString).toLocaleString();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-xl transition-all h-full flex flex-col group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-50">
            <span className="text-blue-600 font-bold text-xl">
              {candidate.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-800">{candidate.name}</h3>
              {candidate.applicationId && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[candidate.status] || 'bg-gray-100'}`}>
                  {candidate.status}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm font-medium">{candidate.position}</p>
          </div>
        </div>
        <div className="bg-yellow-50 px-2 py-1 rounded-lg flex items-center gap-1">
          <FaStar className="text-yellow-500" size={12} />
          <span className="text-xs font-bold text-yellow-700">{candidate.rating.toFixed(1)}</span>
        </div>
      </div>

      {candidate.interviewDate && (
        <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1">📅 Scheduled Interview</p>
          <p className="text-xs font-bold text-purple-700">{formatInterviewDate(candidate.interviewDate)}</p>
        </div>
      )}

      <div className="mb-4 flex-grow">
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{candidate.summary}</p>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="bg-gray-50 text-gray-600 border border-gray-100 px-3 py-1 rounded-lg text-[11px] font-semibold"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="text-[11px] text-gray-400 font-bold self-center">+{candidate.skills.length - 5} more</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-gray-400 mb-6 pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-gray-300">Experience</span>
          <span className="text-gray-600">{candidate.experience}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-gray-300">Location</span>
          <span className="text-gray-600">{candidate.location}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        {/* Status Update Dropdown */}
        {candidate.applicationId && (
          <div className="space-y-3">
            <div className="relative">
              <select
                disabled={isUpdatingStatus}
                value={candidate.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="Applied">📄 Applied / Reviewing</option>
                <option value="Shortlisted">✨ Shortlist Candidate</option>
                <option value="Interview">📅 Set Schedule Interview</option>
                <option value="Rejected">❌ Reject Application</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Date/Time Picker for Interview Status */}
            {candidate.status === 'Interview' && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <input
                  type="datetime-local"
                  className="flex-1 bg-white border border-gray-200 text-gray-800 p-2 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  value={scheduledDate ? new Date(new Date(scheduledDate).getTime() - new Date(scheduledDate).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <button
                  onClick={handleSchedule}
                  disabled={isScheduling}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                  {isScheduling ? '...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => candidate.cvUrl && onViewCV(candidate.cvUrl, candidate.name)}
            disabled={!candidate.cvUrl}
            className={`flex-1 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold ${candidate.cvUrl
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <FaEye size={14} /> {candidate.cvUrl ? "Review CV" : "No CV"}
          </button>

          <button
            onClick={handleStartChat}
            className="bg-white border border-gray-100 text-blue-600 p-2.5 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center"
            title="Message Candidate"
          >
            <FaEnvelope size={14} />
          </button>

          <a
            href={candidate.cvUrl ? `${API_BASE}${candidate.cvUrl.startsWith('/') ? candidate.cvUrl : `/${candidate.cvUrl}`}` : '#'}
            download
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center border ${candidate.cvUrl
              ? "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
              : "bg-gray-50 border-transparent text-gray-300 cursor-not-allowed"
              }`}
            title={candidate.cvUrl ? "Download PDF" : "PDF not available"}
            onClick={(e) => !candidate.cvUrl && e.preventDefault()}
          >
            <FaDownload size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
