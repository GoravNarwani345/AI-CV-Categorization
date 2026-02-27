import React from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/images/hero.svg"; // optional illustration

const Hero = () => {
  return (
    <section
      id="home"
      className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-24 bg-gradient-to-br from-blue-50 to-white"
    >
      {/* Left Text Content */}
      <div className="text-center md:text-left md:w-1/2">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          AI-Driven <span className="text-blue-600">CV Categorization</span> <br />
          & Career Path Recommendation
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
          Discover your ideal career path with artificial intelligence.
          Upload your CV and get smart job matches and skill insights instantly.
        </p>

        <div className="mt-8 space-x-6">
          <Link
            to="/getstarted"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Get Started
          </Link>
          <Link
            to="/features"
            className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center">
        <img
          src={heroImg}
          alt="AI Career System Illustration"
          className="w-full max-w-md md:max-w-lg"
        />
      </div>
    </section>
  );
};

export default Hero;
