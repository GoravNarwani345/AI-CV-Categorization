import React from 'react';
import { FaCompass, FaLightbulb, FaGraduationCap, FaBriefcase, FaRocket } from 'react-icons/fa';

const CareerGuidance = () => {
  const resources = [
    {
      title: "Interview Mastery",
      description: "Master the art of technical and behavioral interviews with our curated guides.",
      icon: <FaRocket className="text-blue-500" />,
      tag: "Top Rated"
    },
    {
      title: "Skill Upgrading",
      description: "Find the most relevant certifications to stay competitive in the current job market.",
      icon: <FaGraduationCap className="text-purple-500" />,
      tag: "Popular"
    },
    {
      title: "Resume Optimization",
      description: "Learn how to make your resume ATS-friendly and impactful for recruiters.",
      icon: <FaBriefcase className="text-green-500" />,
      tag: "Essential"
    },
    {
      title: "Market Insights",
      description: "Explore trending roles and salary expectations in your target industry.",
      icon: <FaCompass className="text-orange-500" />,
      tag: "New"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-4">
          <span className="block">Navigate Your</span>
          <span className="block text-blue-600">Career Journey</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Personalized guidance to help you bridge skill gaps and land your dream job.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
        {resources.map((resource, index) => (
          <div key={index} className="relative group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(resource.icon, { size: 32 })}
              </div>
              <span className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-full uppercase tracking-wider">
                {resource.tag}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h3>
            <p className="text-gray-600 leading-relaxed mb-6">{resource.description}</p>
            <button className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
              Learn More <FaLightbulb />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Our AI-powered engine analyzes millions of job posts to give you the most accurate advice.
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Get Personalized Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerGuidance;
