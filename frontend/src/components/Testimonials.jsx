import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Ahmed",
      role: "Software Engineer",
      text: "The AI Career System helped me identify my skill gaps and suggested courses that truly boosted my job prospects!",
    },
    {
      name: "Ali Khan",
      role: "Recruiter",
      text: "It’s amazing how quickly I can now shortlist candidates with the right skills. This saved me hours every week.",
    },
  ];

  return (
    <section className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold mb-10 text-gray-800">
        What People Are Saying
      </h2>
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto px-10">
        {testimonials.map((t, i) => (
          <div key={i} className="p-8 bg-white border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            <p className="italic text-gray-600 mb-4">“{t.text}”</p>
            <h4 className="font-semibold text-gray-900">{t.name}</h4>
            <p className="text-sm text-blue-600">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
