import React, { useEffect, useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaBriefcase, FaGraduationCap, FaTools } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { updateProfile } from "../services/api";

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    experience: [],
    education: [],
    preferences: {},
    Age: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.basicInfo?.phone || "",
        location: user.basicInfo?.location || "",
        bio: user.basicInfo?.bio || "",
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
        preferences: user.preferences || {},
        Age: user.Age || ""
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (category, index, field, value) => {
    setProfileData(prev => {
      const updatedArray = [...prev[category]];
      updatedArray[index] = { ...updatedArray[index], [field]: value };
      return { ...prev, [category]: updatedArray };
    });
  };

  const addItem = (category, template) => {
    setProfileData(prev => ({
      ...prev,
      [category]: [...prev[category], template]
    }));
  };

  const removeItem = (category, index) => {
    setProfileData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        uid: user.uid,
        name: profileData.name,
        basicInfo: {
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio
        },
        skills: profileData.skills,
        education: profileData.education,
        experience: profileData.experience,
        preferences: profileData.preferences,
        Age: profileData.Age
      };

      const res = await updateProfile(user.uid, payload);
      if (res.success) {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(res.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.basicInfo?.phone || "",
        location: user.basicInfo?.location || "",
        bio: user.basicInfo?.bio || "",
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
        preferences: user.preferences || {},
        Age: user.Age || ""
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <FaUser size={32} />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-xl md:text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">{profileData.name || "User Name"}</h2>
            )}
            <p className="text-gray-500 capitalize">{user?.role || "Candidate"}</p>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto justify-center"
          >
            <FaEdit /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 md:flex-none flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition justify-center"
            >
              {loading ? <Loader size="small" /> : <FaSave />} Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 md:flex-none flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition justify-center"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 text-sm md:text-base">
                <FaEnvelope className="text-blue-500 flex-shrink-0" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm md:text-base">
                <FaPhone className="text-blue-500 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-b border-gray-300 focus:outline-none w-full"
                  />
                ) : (
                  <span>{profileData.phone || "Not set"}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm md:text-base">
                <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="border-b border-gray-300 focus:outline-none w-full"
                  />
                ) : (
                  <span>{profileData.location || "Not set"}</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm md:text-base">
                <span className="text-blue-500 font-bold w-5">Age</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={profileData.Age}
                    onChange={(e) => handleInputChange('Age', e.target.value)}
                    className="border-b border-gray-300 focus:outline-none w-20"
                  />
                ) : (
                  <span>{profileData.Age || "Not set"}</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bio</h3>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            ) : (
              <p className="text-gray-600 text-sm md:text-base">{profileData.bio || "No bio added yet."}</p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
              {isEditing && (
                <button
                  onClick={() => addItem('skills', { name: '', level: 'Beginner' })}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <FaPlus size={12} /> Add
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <div className="w-full space-y-2">
                  {profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2 pb-2 border-b border-gray-100 sm:border-none">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => handleArrayChange('skills', index, 'name', e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded text-sm"
                          placeholder="Skill name"
                        />
                        <div className="flex gap-2">
                          <select
                            value={skill.level}
                            onChange={(e) => handleArrayChange('skills', index, 'level', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded text-xs"
                          >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Expert</option>
                          </select>
                          <button onClick={() => removeItem('skills', index)} className="text-red-500 p-2"><FaTrash size={14} /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <button
                      onClick={() => addItem('skills', { name: '', level: 'Beginner' })}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 text-sm"
                    >
                      Add first skill
                    </button>
                  )}
                </div>
              ) : (
                profileData.skills.length > 0 ? (
                  profileData.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      {skill.name} ({skill.level})
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No skills added yet.</p>
                )
              )}
            </div>
          </div>

          {/* Education & Experience simplified for layout */}
          <div className="grid grid-cols-1 gap-6">
            {/* Experience */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
                {isEditing && (
                  <button
                    onClick={() => addItem('experience', { title: '', company: '', duration: '', description: '' })}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                          className="w-full bg-transparent border-b border-gray-300 text-sm font-bold"
                          placeholder="Job Title"
                        />
                        <button onClick={() => removeItem('experience', index)} className="text-red-500 text-xs flex items-center gap-1"><FaTrash size={10} /> Remove</button>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-800 text-sm md:text-base">{exp.title}</h4>
                        <p className="text-blue-600 text-xs md:text-sm">{exp.company} | {exp.duration}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                {isEditing && (
                  <button
                    onClick={() => addItem('education', { degree: '', institution: '', year: '', grade: '' })}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <FaPlus size={12} /> Add
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                    <h4 className="font-bold text-gray-800 text-sm md:text-base">{edu.degree}</h4>
                    <p className="text-purple-600 text-xs md:text-sm">{edu.institution}, {edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
