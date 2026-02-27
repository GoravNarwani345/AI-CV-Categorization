import React, { useState, useEffect } from "react";
import { FaLightbulb, FaBook, FaCertificate, FaUsers, FaExternalLinkAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CareerTips = () => {
  const [data, setData] = useState({ tips: [], courses: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const iconMap = {
    book: <FaBook />,
    cert: <FaCertificate />,
    users: <FaUsers />,
    lightbulb: <FaLightbulb />
  };

  const colorMap = {
    book: "bg-blue-100 text-blue-600",
    cert: "bg-green-100 text-green-600",
    users: "bg-purple-100 text-purple-600",
    lightbulb: "bg-yellow-100 text-yellow-600"
  };

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/profiles/career-tips`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching tips:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTips();
  }, [user]);

  if (loading) return (
    <div className="bg-white shadow-lg rounded-2xl p-8 h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 italic">Consulting AI for career advice...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <span className="bg-purple-600 w-2 h-8 rounded-full"></span>
          AI Career Path Suggestions
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {data.tips?.length > 0 ? data.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-purple-100 hover:shadow-lg hover:shadow-purple-50 transition-all duration-300">
              <div className={`p-4 rounded-xl shadow-sm ${colorMap[tip.iconType] || colorMap.lightbulb}`}>
                {iconMap[tip.iconType] || iconMap.lightbulb}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{tip.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-500">
              Upload your CV to get personalized career advice.
            </div>
          )}
        </div>
      </div>

      {data.courses?.length > 0 && (
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="bg-emerald-600 w-2 h-8 rounded-full"></span>
            Recommended Certifications
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {data.courses.map((course, i) => (
              <div key={i} className="group p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 hover:bg-white hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                      {course.provider}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${course.type === 'Free'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                      {course.type || 'Course'}
                    </span>
                  </div>
                  <a
                    href={course.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Explore <FaExternalLinkAlt size={12} />
                  </a>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm italic border-l-2 border-emerald-200 pl-3 leading-relaxed">
                  {course.relevance}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerTips;
