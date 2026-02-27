import React from 'react';
import Navbar from '../components/Navbar';
import Features from '../components/Features';
import Footer from '../components/Footer';
import Testimonials from '../components/Testimonials';

const FeaturesPage = () => {
  return (
    <div>
      <Navbar />
      {/* Page Header */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Discover Our Powerful Features
          </h1>
          <p className="text-lg text-gray-600">
            Explore the cutting-edge AI capabilities that are transforming the way you approach career development and recruitment.
          </p>
        </div>
      </section>

      <Features />

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-10">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Why Choose Our AI System?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-blue-600 mb-6 flex items-center">
                <span className="text-2xl mr-2">🚀</span> For Job Seekers
              </h3>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Smart Career Guidance:</strong> AI-powered recommendations based on your unique skills and aspirations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Skill Gap Mastery:</strong> Detailed analysis showing exactly what skills you need to advance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Perfect Job Matches:</strong> Advanced algorithms connecting you with ideal opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Resume Enhancement:</strong> AI suggestions to make your resume stand out to employers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Market Intelligence:</strong> Real-time insights into salary trends and job market demands</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-purple-600 mb-6 flex items-center">
                <span className="text-2xl mr-2">🏢</span> For Recruiters
              </h3>
              <ul className="text-gray-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Lightning-Fast Screening:</strong> Automate candidate evaluation in seconds, not hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Fair & Unbiased:</strong> Eliminate unconscious bias with objective AI assessments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Workflow Revolution:</strong> Streamline your entire recruitment process with smart automation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Data-Driven Decisions:</strong> Make informed hiring choices backed by comprehensive analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Scale Effortlessly:</strong> Handle growing candidate pools without increasing your team size</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="mb-6 text-blue-100">Join thousands of users who have transformed their careers with our AI system.</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Start Your Journey
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
