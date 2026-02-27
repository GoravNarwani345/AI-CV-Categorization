import React from "react";
import { FaBriefcase, FaUsers, FaChartBar, FaEnvelope, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const RecruiterSidebar = ({ onSectionChange, selectedSection = "candidates", className }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      toast.success("Logged out successfully!");
      navigate("/getstarted");
    } catch (err) {
      console.error('Logout failed', err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    { id: "jobs", icon: <FaBriefcase />, label: "Jobs" },
    { id: "candidates", icon: <FaUsers />, label: "Candidates" },
    { id: "analytics", icon: <FaChartBar />, label: "Analytics" },
    { id: "messages", icon: <FaEnvelope />, label: "Messages" },
    { id: "profile", icon: <FaUserCircle />, label: "Profile" },
  ];

  return (
    <div className={`w-64 bg-white shadow-lg h-screen sticky top-0 z-40 p-5 flex flex-col ${className || ''}`}>
      <div>
        <h1 className="text-2xl font-bold text-blue-600 mb-6">AI Recruiter</h1>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${selectedSection === item.id
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
              {item.icon} {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout button at the bottom */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default RecruiterSidebar;
