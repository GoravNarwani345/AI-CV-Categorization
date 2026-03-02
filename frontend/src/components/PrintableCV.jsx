import React, { forwardRef } from 'react';

const PrintableCV = forwardRef(({ profile, user }, ref) => {
    if (!profile || !user) return null;

    const { basicInfo = {}, experience = [], education = [], skills = [] } = profile;

    return (
        <div ref={ref} className="bg-white p-12 max-w-[210mm] min-h-[297mm] mx-auto text-gray-800 font-sans leading-relaxed text-[10pt] shadow-inner">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                @media print {
                    body { font-family: 'Inter', sans-serif; font-size: 10pt; }
                    @page { size: A4 portrait; margin: 10mm; }
                    .no-print { display: none; }
                }

                .cv-container {
                    font-family: 'Inter', sans-serif;
                }
                `}
            </style>

            <div className="cv-container">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-2 border-gray-900 pb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">{user.name}</h1>
                        <p className="text-lg font-medium text-blue-600 uppercase tracking-[0.2em]">{user.role || 'Professional'}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1 text-sm text-gray-500 font-medium">
                        {user.email && <div className="flex items-center gap-2">{user.email}</div>}
                        {basicInfo.phone && <div className="flex items-center gap-2">{basicInfo.phone}</div>}
                        {basicInfo.location && <div className="flex items-center gap-2">{basicInfo.location}</div>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Main Content (2/3) */}
                    <div className="md:col-span-2 space-y-10">
                        {/* Summary */}
                        {basicInfo.bio && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-4 flex items-center gap-3">
                                    <span className="w-8 h-px bg-gray-200"></span> Summary
                                </h2>
                                <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">{basicInfo.bio}</p>
                            </section>
                        )}

                        {/* Experience */}
                        {experience.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-px bg-gray-200"></span> Experience
                                </h2>
                                <div className="space-y-10">
                                    {experience.map((exp, idx) => (
                                        <div key={idx} className="relative pl-6 border-l border-gray-100">
                                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <h3 className="font-bold text-gray-900 text-base">{exp.title}</h3>
                                                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{exp.duration}</span>
                                            </div>
                                            <div className="text-sm font-semibold text-blue-600 mb-4">{exp.company}</div>
                                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap space-y-2">
                                                {(Array.isArray(exp.description) ? exp.description : (typeof exp.description === 'string' ? exp.description.split('\n') : [])).map((line, i) => (
                                                    <div key={i} className="flex gap-2 text-justify">
                                                        {line.trim() && (
                                                            <>
                                                                {line.trim().startsWith('•') || line.trim().startsWith('-') ? null : <span className="text-blue-400 mt-1 shrink-0">•</span>}
                                                                <span>{line.trim().replace(/^[•-]\s*/, '')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar (1/3) */}
                    <div className="space-y-10">
                        {/* Skills */}
                        {skills.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-5">Technical Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-[9pt] font-semibold border border-gray-100">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {education.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-5">Education</h2>
                                <div className="space-y-6">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{edu.degree}</h4>
                                            <p className="text-xs text-gray-500 font-medium">{edu.institution}</p>
                                            <p className="text-[9pt] font-bold text-blue-500">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-50 text-center">
                    <p className="text-[8pt] text-gray-300 font-medium tracking-widest uppercase">
                        Generated by AI CV Categorization System
                    </p>
                </div>
            </div>
        </div>
    );
});

export default PrintableCV;
