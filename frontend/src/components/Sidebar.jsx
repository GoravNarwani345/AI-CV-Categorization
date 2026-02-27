import React from "react";
import { FaFileUpload, FaBriefcase, FaChartLine, FaUserGraduate, FaHome, FaUser, FaSignOutAlt, FaEnvelope, FaCheckCircle, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Sidebar = ({ setSelectedSection, selectedSection = "overview", className, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      navigate("/getstarted");
    } catch (err) {
      console.error('Logout failed', err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    { id: "overview", icon: <FaHome />, label: "Overview" },
    { id: "profile", icon: <FaUser />, label: "Profile" },
    { id: "upload", icon: <FaFileUpload />, label: "Upload CV" },
    { id: "jobs", icon: <FaBriefcase />, label: "Job Recommendations" },
    { id: "applications", icon: <FaCheckCircle />, label: "My Applications" },
    { id: "messages", icon: <FaEnvelope />, label: "Messages" },
    { id: "skills", icon: <FaChartLine />, label: "Skill Insights" },
    { id: "career", icon: <FaUserGraduate />, label: "Career Tips" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:sticky md:top-0 z-50 md:z-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white border-r border-gray-200 flex flex-col h-screen ${className || ''}`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-600">AI Career</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setSelectedSection(item.id);
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${selectedSection === item.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
              >
                {item.icon} {item.label}
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
