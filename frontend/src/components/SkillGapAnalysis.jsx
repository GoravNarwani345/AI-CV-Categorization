import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { fetchJobs, fetchData } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { FaChartBar, FaChartPie, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const normalizeSkill = (skill) => {
  if (!skill) return "";
  const s = skill.toLowerCase().trim();
  const map = {
    "react.js": "react",
    "reactjs": "react",
    "react": "react",
    "node.js": "node.js",
    "nodejs": "node.js",
    "node": "node.js",
    "mongodb": "mongodb",
    "mongo": "mongodb",
    "express.js": "express",
    "expressjs": "express",
    "express": "express",
    "postgresql": "postgresql",
    "postgres": "postgresql",
    "javascript": "javascript",
    "js": "javascript",
    "typescript": "typescript",
    "ts": "typescript",
    "css3": "css",
    "css": "css",
    "html5": "html",
    "html": "html",
    "amazon web services": "aws",
    "aws": "aws",
    "gsap": "gsap",
    "greensock": "gsap",
    "tailwind": "tailwind",
    "tailwindcss": "tailwind",
    "python": "python",
    "py": "python",
    "java": "java",
    "c++": "c++",
    "cpp": "c++",
    "c#": "c#",
    "csharp": "c#",
    "ruby": "ruby",
    "php": "php",
    "swift": "swift",
    "kotlin": "kotlin",
    "go": "go",
    "golang": "go",
    "rust": "rust",
    "sql": "sql",
    "mysql": "mysql",
    "redis": "redis",
    "docker": "docker",
    "kubernetes": "kubernetes",
    "k8s": "kubernetes",
    "angular": "angular",
    "angularjs": "angular",
    "vue": "vue",
    "vuejs": "vue",
    "vue.js": "vue",
    "next.js": "next.js",
    "nextjs": "next.js",
    "django": "django",
    "flask": "flask",
    "fastapi": "fastapi",
    "spring": "spring",
    "graphql": "graphql",
    "git": "git",
    "figma": "figma",
    "machine learning": "machine learning",
    "ml": "machine learning",
    "deep learning": "deep learning",
    "nlp": "nlp",
    "natural language processing": "nlp",
    "pytorch": "pytorch",
    "tensorflow": "tensorflow",
    "pandas": "pandas",
    "numpy": "numpy",
    "scikit-learn": "scikit-learn",
    "sklearn": "scikit-learn"
  };

  // 1. Exact match
  if (map[s]) return map[s];

  // 2. For multi-word skills like "python programming advance",
  //    try to find a known keyword within the string
  const words = s.split(/\s+/);
  for (const word of words) {
    if (map[word]) return map[word];
  }

  // 3. Check if any multi-word map key is contained in the string
  for (const [key, value] of Object.entries(map)) {
    if (key.includes(' ') && s.includes(key)) return value;
  }

  // 4. Fallback: return the first word as a reasonable core skill
  return s;
};

const SkillGapAnalysis = ({ user: userProp, matchedSkills, missingSkills, isTargeted = false }) => {
  const [skillGapData, setSkillGapData] = useState([]);
  const [loading, setLoading] = useState(!isTargeted);
  const { user: authUser } = useAuth();

  // Use prop user if provided, otherwise fallback to auth user
  const user = userProp || authUser;

  // Helper to get a flat, normalized array of individual skills
  const getNormalizedSkillSet = (skillsArray) => {
    if (!skillsArray || !Array.isArray(skillsArray)) return [];
    return skillsArray.flatMap(s => {
      const name = typeof s === 'string' ? s : s.name;
      if (!name) return [];
      // Handle cases where skills are piped or comma-separated (e.g. "React|Node")
      return name.split(/[|;,]/).map(item => normalizeSkill(item.trim()));
    });
  };

  // Reactively calculate current matches based on user's latest skills
  const matchPerformance = React.useMemo(() => {
    if (!isTargeted) return null;

    const userSkills = getNormalizedSkillSet(user?.skills);

    // Combine all relevant skills to check against current profile
    const allRequired = [...(matchedSkills || []), ...(missingSkills || [])];
    const currentMatched = [];
    const currentMissing = [];

    allRequired.forEach(skill => {
      // Handle potential piped skills in the requirement list too
      const subSkills = skill.split(/[|;,]/).map(item => item.trim());
      const isAnyMatch = subSkills.some(sub => userSkills.includes(normalizeSkill(sub)));

      if (isAnyMatch) {
        currentMatched.push(skill);
      } else {
        currentMissing.push(skill);
      }
    });

    // Handle case where allRequired might be empty (e.g. first load)
    if (allRequired.length === 0) {
      return { matched: matchedSkills || [], missing: missingSkills || [], percentage: 0 };
    }

    const percentage = Math.round((currentMatched.length / allRequired.length) * 100);
    return { matched: currentMatched, missing: currentMissing, percentage };
  }, [user?.skills, matchedSkills, missingSkills, isTargeted]);

  useEffect(() => {
    // If we have direct props, we don't need to fetch global data
    if (isTargeted) {
      setLoading(false);
      return;
    }

    const fetchSkillGapData = async () => {
      try {
        setLoading(true);
        // Always fetch both fresh jobs and fresh user profile for the global analysis
        const [jobsRes, profileRes] = await Promise.all([
          fetchJobs(),
          fetchData()
        ]);

        const jobs = jobsRes.success ? jobsRes.data : [];
        const freshUser = profileRes.success ? profileRes.data : user;
        const userSkills = getNormalizedSkillSet(freshUser?.skills);

        const requiredSkills = {};
        jobs.forEach(job => {
          if (job.skills) {
            job.skills.forEach(skill => {
              const normalizedList = skill.split(/[|;,]/).map(item => normalizeSkill(item.trim()));
              normalizedList.forEach(sName => {
                if (sName) {
                  requiredSkills[sName] = (requiredSkills[sName] || 0) + 1;
                }
              });
            });
          }
        });

        const chartData = Object.entries(requiredSkills).map(([skill, demand]) => {
          const hasSkill = userSkills.includes(skill);
          return {
            skill: skill.charAt(0).toUpperCase() + skill.slice(1),
            demand: demand,
            userPresence: hasSkill ? demand : 0,
            gap: hasSkill ? 0 : demand
          };
        }).sort((a, b) => b.demand - a.demand).slice(0, 8);

        setSkillGapData(chartData);
      } catch (error) {
        console.error('Error fetching skill gap data:', error);
        setSkillGapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillGapData();
  }, [user?.skills, isTargeted]);

  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-[300px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  // Targeted Match Visualization (Pie Chart)
  if (isTargeted && matchPerformance) {
    const { matched, missing, percentage } = matchPerformance;
    const pieData = [
      { name: 'Matched', value: matched.length || 0, color: '#10b981' },
      { name: 'Gaps', value: missing.length || 0, color: '#ef4444' }
    ];

    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6 animate-in slide-in-from-top duration-500">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FaChartPie className="text-blue-500" /> Match Analysis
          </h4>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-tighter">AI Match Index</span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative h-36 w-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-gray-800">{percentage}%</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 flex items-center gap-1.5 px-2">
                <FaCheckCircle size={10} /> Candidate Strengths
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matched.length > 0 ? matched.slice(0, 10).map((s, i) => (
                  <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 font-bold">
                    {s}
                  </span>
                )) : <span className="text-[10px] text-gray-400 italic px-2">No matches yet</span>}
              </div>
            </div>
            {missing.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-red-600 uppercase mb-2 flex items-center gap-1.5 px-2">
                  <FaExclamationCircle size={10} /> Needed Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missing.slice(0, 6).map((s, i) => (
                    <span key={i} className="text-[10px] bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-100 font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Global View (Bar Chart)
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-50">
      <div className="flex items-center gap-2 mb-6 text-gray-800">
        <FaChartBar className="text-blue-600" />
        <h2 className="text-xl font-bold">Market Skill Demand vs Your Profile</h2>
      </div>

      {skillGapData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillGapData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="skill" tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Bar dataKey="userPresence" fill="#22c55e" name="Skills You Have" radius={[6, 6, 0, 0]} barSize={25} />
              <Bar dataKey="gap" fill="#ef4444" name="Skills Needed" radius={[6, 6, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium">No job demand data available for analysis.</p>
        </div>
      )}
      <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
        <p className="text-[10px] text-gray-400 italic">
          * Real-time analysis of top 8 trending skills in your industry.
        </p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">You Have</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Gap</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
