import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';
import { FaMagic, FaSpinner } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const navigate = useNavigate();

  // Form data states
  const [basicInfo, setBasicInfo] = useState({
    phone: '',
    location: '',
    bio: ''
  });

  const [education, setEducation] = useState([{
    degree: '',
    institution: '',
    year: '',
    grade: ''
  }]);

  const [experience, setExperience] = useState([{
    title: '',
    company: '',
    duration: '',
    description: ''
  }]);

  const [skills, setSkills] = useState([{
    name: '',
    level: 'Beginner'
  }]);

  const [preferences, setPreferences] = useState({
    jobType: [],
    salaryRange: '',
    locationPreference: ''
  });

  const handleAIAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/cv/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          saveToProfile: true,
          completeOnboarding: true
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success("AI has successfully extracted your data and set up your profile!");

        // Update local user state to reflect onboarding completion
        setUser({ ...user, onboardingCompleted: true });

        // Immediate redirect to dashboard as requested by user
        setTimeout(() => {
          navigate('/candidateDashboard');
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      toast.error(error.message || "Failed to analyze CV. You can still fill it manually or skip to dashboard.");
      // If AI fails, we stay on the page but allow them to see the error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          onboardingCompleted: true,
          basicInfo: { phone: '', location: '', bio: '' },
          education: [],
          experience: [],
          skills: [],
          preferences: {}
        })
      });

      const result = await response.json();
      if (result.success) {
        setUser({ ...user, onboardingCompleted: true });
        toast.success("Profile setup completed! Welcome back.");
        navigate(user.role === 'recruiter' ? '/recruiterDashboard' : '/candidateDashboard');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const onboardingData = {
        basicInfo,
        education: education.filter(edu => edu.degree || edu.institution),
        experience: experience.filter(exp => exp.title || exp.company),
        skills: skills.filter(skill => skill.name),
        preferences,
        onboardingCompleted: true
      };

      const response = await fetch(`${API_URL}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(onboardingData)
      });

      const result = await response.json();
      if (result.success) {
        setUser({ ...user, onboardingCompleted: true });
        toast.success("Profile setup completed successfully!");
        navigate(user.role === 'recruiter' ? '/recruiterDashboard' : '/candidateDashboard');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', institution: '', year: '', grade: '' }]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperience([...experience, { title: '', company: '', duration: '', description: '' }]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'Beginner' }]);
  };

  const updateSkill = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    if (!user) return null;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              {user.role === 'candidate' && (
                <button
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing || !cvUploaded}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${!cvUploaded
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-md"
                    }`}
                  title={!cvUploaded ? "Upload a CV first" : "Click to auto-fill with AI"}
                >
                  {isAnalyzing ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  {isAnalyzing ? "Analyzing CV..." : "AI Auto-Fill"}
                </button>
              )}
            </div>

            {user.role === 'candidate' && !cvUploaded && (
              <div className="mb-8">
                <FileUpload onUploadSuccess={() => setCvUploaded(true)} />
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100 flex items-start gap-3">
                  <FaMagic className="text-purple-600 mt-1" />
                  <div>
                    <p className="text-purple-900 font-medium">Pro-Tip: Use AI Auto-Fill</p>
                    <p className="text-purple-700 text-sm">Upload your resume first, then click "AI Auto-Fill" to skip the manual typing!</p>
                  </div>
                </div>
              </div>
            )}

            {cvUploaded && user.role === 'candidate' && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <div className="bg-green-500 text-white p-1 rounded-full"><FaMagic size={10} /></div>
                  <span className="font-medium">Resume detected! You can now use AI Auto-Fill.</span>
                </div>
                <button
                  onClick={() => setCvUploaded(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Change file
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={basicInfo.phone}
                  onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={basicInfo.location}
                  onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State/Country"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={basicInfo.bio}
                onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        );

      case 2:
        return user.role === 'candidate' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Education {index + 1}</h3>
                  {education.length > 1 && (
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree/Program</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="University Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year of Completion</label>
                    <input
                      type="number"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2023"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Grade/GPA</label>
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3.8 GPA or First Class"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              + Add Another Education
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-1000 employees</option>
                  <option>1000+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="HR Manager, Tech Lead, etc."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return user.role === 'candidate' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Skills & Experience</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              {skills.map((skill, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Skill name (e.g., JavaScript, Python)"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                  {skills.length > 1 && (
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSkill}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                + Add Skill
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              {experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    {experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addExperience}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                + Add Work Experience
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Recruitment Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.jobType.includes(type)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...preferences.jobType, type]
                            : preferences.jobType.filter(t => t !== type);
                          setPreferences({ ...preferences, jobType: updated });
                        }}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range Budget</label>
                <select
                  value={preferences.salaryRange}
                  onChange={(e) => setPreferences({ ...preferences, salaryRange: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select range</option>
                  <option>50,000 - 100,000 PKR</option>
                  <option>100,000 - 150,000 PKR</option>
                  <option>150,000 - 250,000 PKR</option>
                  <option>250,000 - 400,000 PKR</option>
                  <option>400,000+ PKR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Locations</label>
                <input
                  type="text"
                  value={preferences.locationPreference}
                  onChange={(e) => setPreferences({ ...preferences, locationPreference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Remote, On-site, Hybrid"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return user.role === 'candidate' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Job Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.jobType.includes(type)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...preferences.jobType, type]
                            : preferences.jobType.filter(t => t !== type);
                          setPreferences({ ...preferences, jobType: updated });
                        }}
                        className="mr-2"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range Expectations</label>
                <select
                  value={preferences.salaryRange}
                  onChange={(e) => setPreferences({ ...preferences, salaryRange: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select range</option>
                  <option>50,000 - 100,000 PKR</option>
                  <option>100,000 - 150,000 PKR</option>
                  <option>150,000 - 250,000 PKR</option>
                  <option>250,000 - 400,000 PKR</option>
                  <option>400,000+ PKR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Locations</label>
                <input
                  type="text"
                  value={preferences.locationPreference}
                  onChange={(e) => setPreferences({ ...preferences, locationPreference: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Remote, On-site, Hybrid"
                />
              </div>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalSteps = user.role === 'candidate' ? 4 : 3;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI CV Categorization!</h1>
          <p className="text-gray-600">Let's set up your profile to get the best experience.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-2 ${i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Skip for now
          </button>
          <div className="space-x-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
