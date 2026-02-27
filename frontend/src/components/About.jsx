import React from "react";
import aboutImg from "../assets/images/about.svg"; // optional illustration

const About = () => {
  return (
    <section
      id="about"
      className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-20 bg-gray-50"
    >
      {/* Left Side Image */}
      <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
        <img
          src={aboutImg}
          alt="About AI Career System"
          className="rounded-2xl w-full max-w-md shadow-lg hover:shadow-xl transition-all duration-300"
        />
      </div>

      {/* Right Side Text */}
      <div className="md:w-1/2 text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Empowering Careers with Artificial Intelligence
        </h2>
        <p className="text-gray-600 mb-6">
          The AI Career System is designed to revolutionize the recruitment and
          career guidance process. Using Natural Language Processing and
          Machine Learning, it analyzes resumes, categorizes candidates, and
          suggests personalized career paths and skill improvements.
        </p>
        <p className="text-gray-600">
          Whether you're a job seeker looking for guidance or a recruiter
          searching for the best fit, our system bridges the gap using
          intelligence, automation, and data-driven insights.
        </p>
      </div>
    </section>
  );
};

export default About;
