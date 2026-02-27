import React from "react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section
      id="cta"
      className="text-center py-16 bg-blue-600 text-white rounded-t-3xl"
    >
      <h2 className="text-3xl font-bold mb-4">
        Ready to Unlock Your Career Potential?
      </h2>
      <p className="mb-6 text-blue-100">
        Let AI guide your professional journey. Upload your CV or explore
        candidate insights today.
      </p>
      <div className="space-x-6">
        <Link
          to="/getstarted"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </Link>
        <Link
          to="/features"
          className="border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
};

export default CTA;
