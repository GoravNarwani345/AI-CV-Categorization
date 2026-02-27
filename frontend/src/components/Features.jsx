import React from "react";
import { FaRobot, FaChartLine, FaUserTie } from "react-icons/fa";

const Features = () => {
  const features = [
    {
      icon: <FaRobot className="text-4xl text-blue-600 mb-4" />,
      title: "AI CV Categorization",
      desc: "Our AI analyzes resumes and classifies them by domain, experience, and skills.",
    },
    {
      icon: <FaChartLine className="text-4xl text-green-600 mb-4" />,
      title: "Smart Career Recommendations",
      desc: "Get personalized career paths and job matches tailored to your profile.",
    },
    {
      icon: <FaUserTie className="text-4xl text-purple-600 mb-4" />,
      title: "For Recruiters",
      desc: "Automatically shortlist top candidates with intelligent screening tools.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-12">
        Powerful Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto px-10">
        {features.map((item, index) => (
          <div
            key={index}
            className="p-8 bg-white border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer grid place-items-center"
          >
            {item.icon}
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
