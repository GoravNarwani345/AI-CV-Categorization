import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaStar, FaEnvelope, FaDownload } from 'react-icons/fa';

const CandidateCard = ({ candidate, onOpenChat, onViewCV }) => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const API_BASE = API_URL.replace('/api', '');

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-lg">
              {candidate.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{candidate.name}</h3>
            <p className="text-gray-600">{candidate.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <FaStar className="text-yellow-500" size={14} />
          <span className="text-sm text-gray-600">{candidate.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="mb-4 flex-grow">
        <p className="text-gray-700 mb-3 line-clamp-3 text-sm">{candidate.summary}</p>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill, index) => (
            <span
              key={index}
              className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full text-[10px] font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4 pt-3 border-t border-gray-100">
        <span>Exp: {candidate.experience}</span>
        <span>{candidate.location}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => candidate.cvUrl && onViewCV(candidate.cvUrl, candidate.name)}
          disabled={!candidate.cvUrl}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${candidate.cvUrl
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
        >
          <FaEye size={14} /> {candidate.cvUrl ? "View" : "No CV"}
        </button>
        <button
          onClick={handleStartChat}
          className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors"
          title="Send Message"
        >
          <FaEnvelope />
        </button>
        <a
          href={candidate.cvUrl ? `${API_BASE}${candidate.cvUrl.startsWith('/') ? candidate.cvUrl : `/${candidate.cvUrl}`}` : '#'}
          download
          className={`py-2 px-3 rounded-lg transition-colors flex items-center justify-center ${candidate.cvUrl
            ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
            : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          title={candidate.cvUrl ? "Download CV" : "CV not available"}
          onClick={(e) => !candidate.cvUrl && e.preventDefault()}
        >
          <FaDownload />
        </a>
      </div>
    </div>
  );
};

export default CandidateCard;
