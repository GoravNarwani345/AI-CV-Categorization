import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { fetchJobs, fetchAllProfiles } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const SkillGapAnalysis = () => {
  const [skillGapData, setSkillGapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSkillGapData = async () => {
      try {
        setLoading(true);

        const [jobsRes, profilesRes] = await Promise.all([
          fetchJobs(),
          fetchAllProfiles()
        ]);

        const jobs = jobsRes.success ? jobsRes.data : [];
        const userSkills = user?.skills ? user.skills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase()) : [];

        const requiredSkills = {};
        jobs.forEach(job => {
          if (job.skills) {
            job.skills.forEach(skill => {
              const sName = skill.toLowerCase();
              requiredSkills[sName] = (requiredSkills[sName] || 0) + 1;
            });
          }
        });

        const chartData = Object.entries(requiredSkills).map(([skill, demand]) => {
          const hasSkill = userSkills.includes(skill);
          return {
            skill: skill.charAt(0).toUpperCase() + skill.slice(1),
            demand: demand,
            userPresence: hasSkill ? demand : 0, // Match demand height if user has it
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
  }, [user]);

  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Your Skill Gap Analysis</h2>
      {skillGapData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillGapData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="userPresence" fill="#10B981" name="Skills You Have" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="gap" fill="#EF4444" name="Skills Needed" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-2">📊</div>
          <p>No job demand data available for analysis.</p>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-4 italic">
        * Analysis based on top 8 trending skills across active job postings vs. your profile.
      </p>
    </div>
  );
};

export default SkillGapAnalysis;
