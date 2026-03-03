import React, { forwardRef } from 'react';

const PrintableCV = forwardRef(({ profile, user }, ref) => {
    if (!profile || !user) return null;

    const { basicInfo = {}, experience = [], education = [], skills = [] } = profile;

    return (
        <div ref={ref} className="bg-white p-12 max-w-[210mm] min-h-[297mm] mx-auto text-slate-800 font-sans leading-relaxed text-[10.5pt] shadow-inner">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
                @media print {
                    body { font-family: 'Inter', sans-serif; font-size: 10.5pt; }
                    @page { size: A4 portrait; margin: 15mm; }
                    .no-print { display: none; }
                }

                .cv-content {
                    font-family: 'Inter', sans-serif;
                    max-width: 100%;
                }

                .section-header {
                    border-bottom: 1.5px solid #e2e8f0;
                    margin-bottom: 1rem;
                    padding-bottom: 0.25rem;
                }
                `}
            </style>

            <div className="cv-content">
                {/* Header Section - Centered for classic look */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">{user.name}</h1>
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                        {user.email && <span>{user.email}</span>}
                        {basicInfo.phone && <span>{basicInfo.phone}</span>}
                        {basicInfo.location && <span>{basicInfo.location}</span>}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Summary */}
                    {basicInfo.bio && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-900 mb-3 section-header">Professional Summary</h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{basicInfo.bio}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-900 mb-4 section-header">Work Experience</h2>
                            <div className="space-y-6">
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-slate-900 text-base">{exp.title}</h3>
                                            <span className="text-sm font-semibold text-slate-500">{exp.duration}</span>
                                        </div>
                                        <div className="text-sm font-bold text-blue-700 mb-2">{exp.company}</div>
                                        <div className="text-[10pt] text-slate-600 leading-relaxed">
                                            {(Array.isArray(exp.description) ? exp.description : (typeof exp.description === 'string' ? exp.description.split('\n') : [])).map((line, i) => (
                                                <div key={i} className="flex gap-3 mb-1">
                                                    {line.trim() && (
                                                        <>
                                                            <span className="text-slate-300 mt-1 shrink-0">•</span>
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

                    {/* Skills - Standard List */}
                    {skills.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-900 mb-3 section-header">Core Competencies</h2>
                            <p className="text-slate-700 text-[10pt] leading-loose">
                                {skills.map((skill, idx) => (
                                    <span key={idx}>
                                        <span className="font-semibold text-slate-800">{skill.name}</span>
                                        {idx < skills.length - 1 && <span className="text-slate-300 mx-2">|</span>}
                                    </span>
                                ))}
                            </p>
                        </section>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-900 mb-4 section-header">Education</h2>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-[10.5pt]">{edu.degree}</h4>
                                            <p className="text-sm text-slate-600 italic">{edu.institution}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-500">{edu.year}</p>
                                            {edu.grade && <p className="text-xs text-slate-400">{edu.grade}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-16 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[8pt] text-slate-300 font-medium tracking-widest uppercase">
                        Confidential Profile • {user.name}
                    </p>
                </div>
            </div>
        </div>
    );
});

export default PrintableCV;
