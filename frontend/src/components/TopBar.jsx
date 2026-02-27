import React from "react";
import { FaSearch, FaUser } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

const TopBar = ({ user, onSearch }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mr-8 hidden md:block">
          AI Career System
        </h1>
        <div className="relative hidden sm:block">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates, jobs..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 md:w-80 transition-all"
          />
        </div>
      </div>
      <TopBarRight user={user} />
    </header>
  );
};

const TopBarRight = ({ user }) => {

  return (
    <div className="flex items-center gap-3 md:gap-6">
      <NotificationBell />

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
          {user?.name ? user.name.charAt(0).toUpperCase() : <FaUser size={14} />}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-gray-800 leading-none mb-0.5">{user ? user?.name : "User"}</p>
          <p className="text-[10px] text-gray-500 font-medium leading-none capitalize">{user?.role || "Candidate"}</p>
        </div>
      </div>

    </div>
  );
};

export default TopBar;
