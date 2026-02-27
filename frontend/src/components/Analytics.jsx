import React, { useState, useEffect } from 'react';
import { FaUsers, FaBriefcase, FaEye, FaStar, FaClock, FaCheckCircle, FaUserPlus } from 'react-icons/fa';
import { fetchAllProfiles, fetchJobs, fetchRecentActivity, fetchProfileStats, fetchAppStats, fetchPopularSkills } from '../services/api';

const Analytics = () => {
  const [topSkills, setTopSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [growthData, setGrowthData] = useState([]);
  const [appTrends, setAppTrends] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Candidates', value: '0', change: '+0%', icon: FaUsers, color: 'text-blue-600' },
    { title: 'Active Job Posts', value: '0', change: '+0%', icon: FaBriefcase, color: 'text-green-600' },
    { title: 'Profile Views', value: '0', change: '+0%', icon: FaEye, color: 'text-purple-600' },
    { title: 'Average Rating', value: '0.0', change: '+0', icon: FaStar, color: 'text-yellow-600' }
  ]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setSkillsLoading(true);

        const [profilesStatsRes, appsStatsRes, skillsStatsRes, profilesRes, jobsRes, activityRes] = await Promise.all([
          fetchProfileStats(),
          fetchAppStats(),
          fetchPopularSkills(),
          fetchAllProfiles(),
          fetchJobs(),
          fetchRecentActivity()
        ]);

        if (profilesStatsRes.success) setGrowthData(profilesStatsRes.data);
        if (appsStatsRes.success) setAppTrends(appsStatsRes.data);
        if (skillsStatsRes.success) setTopSkills(skillsStatsRes.data);

        const profiles = profilesRes.success ? profilesRes.data : [];
        const jobs = jobsRes.success ? jobsRes.data : [];
        const totalCandidates = profiles.length;
        const activeJobPosts = jobs.length;

        let totalProfileViews = 0;
        let totalRatings = 0;
        let ratingCount = 0;

        profiles.forEach(p => {
          totalProfileViews += p.views || 0;
          if (p.rating) {
            totalRatings += p.rating;
            ratingCount++;
          }
        });

        setStats([
          { title: 'Total Candidates', value: totalCandidates.toLocaleString(), change: '+12%', icon: FaUsers, color: 'text-blue-600' },
          { title: 'Active Job Posts', value: activeJobPosts.toString(), change: '+5%', icon: FaBriefcase, color: 'text-green-600' },
          { title: 'Profile Views', value: totalProfileViews.toLocaleString(), change: '+18%', icon: FaEye, color: 'text-purple-600' },
          { title: 'Average Rating', value: ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : '0.0', change: '+0.3', icon: FaStar, color: 'text-yellow-600' }
        ]);

        if (activityRes.success) setActivities(activityRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setSkillsLoading(false);
        setActivitiesLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change} from last month</p>
              </div>
              <stat.icon className={`text-3xl ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidate Growth</h3>
          <div className="h-64 flex items-end justify-between border-b border-gray-100 pb-2">
            {growthData.length > 0 ? growthData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 w-full max-w-[40px] rounded-t transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${(data.candidates / Math.max(...growthData.map(d => d.candidates), 1)) * 200}px` }}
                ></div>
                <span className="text-[10px] text-gray-600 mt-2">{data.month}</span>
                <span className="text-[10px] font-bold text-gray-500">{data.candidates}</span>
              </div>
            )) : (
              <div className="w-full text-center text-gray-400 text-sm">No growth data yet</div>
            )}
          </div>
        </div>

        {/* Application Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Trends</h3>
          <div className="h-64 flex items-end justify-between border-b border-gray-100 pb-2">
            {appTrends.length > 0 ? appTrends.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-teal-500 w-full max-w-[40px] rounded-t transition-all duration-500 hover:bg-teal-600"
                  style={{ height: `${(data.applications / Math.max(...appTrends.map(d => d.applications), 1)) * 200}px` }}
                ></div>
                <span className="text-[10px] text-gray-600 mt-2">{data.month}</span>
                <span className="text-[10px] font-bold text-gray-500">{data.applications}</span>
              </div>
            )) : (
              <div className="w-full text-center text-gray-400 text-sm">No application data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Skills in Demand</h3>
        {skillsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : topSkills.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64 flex items-end justify-between">
              {topSkills.map((skill, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-teal-500 w-12 rounded-t mb-2"
                    style={{ height: `${(skill.count / Math.max(...topSkills.map(s => s.count))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 transform -rotate-45 origin-top-left w-16 text-center">
                    {skill.skill}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{skill.count}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              Number of candidates with each skill
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No Skills Data Available Yet</p>
            <p className="text-sm">Skills analytics will appear here as candidates complete their profiles and add their skills.</p>
          </div>
        )}
      </div>

      {/* Simple data format display - commented out to avoid rendering errors */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Data Format Check</h3>
        {skillsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(topSkills, null, 2)}
            </pre>
          </div>
        )}
      </div> */}

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activitiesLoading ? (
            <div className="text-center py-4 text-gray-500">Loading activity...</div>
          ) : activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${activity.status === 'Applied' ? 'bg-blue-100 text-blue-600' :
                    activity.status === 'Shortlisted' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {activity.status === 'Applied' ? <FaUserPlus /> : <FaCheckCircle />}
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">
                      {activity.candidate?.name} applied for <span className="text-blue-600 font-semibold">{activity.job?.title}</span>
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FaClock size={10} /> {new Date(activity.appliedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${activity.status === 'Applied' ? 'bg-blue-50 text-blue-600' :
                  activity.status === 'Shortlisted' ? 'bg-green-50 text-green-600' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                  {activity.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaClock className="mx-auto text-3xl mb-2 opacity-20" />
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
