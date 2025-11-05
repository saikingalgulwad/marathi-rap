import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../App';
import Navbar from '../components/Navbar';
import { Briefcase, FileText, TrendingUp, Clock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch stats
      const statsRes = await fetch(`${API}/applications/stats`, { headers });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent jobs
      const jobsRes = await fetch(`${API}/jobs`, { headers });
      const jobsData = await jobsRes.json();
      setRecentJobs(jobsData.slice(0, 5));

      // Fetch notifications
      const notifsRes = await fetch(`${API}/notifications`, { headers });
      const notifsData = await notifsRes.json();
      setNotifications(notifsData);

    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar notifications={notifications} />
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar notifications={notifications} />
      
      <div className="max-w-7xl mx-auto px-4 py-8" data-testid="dashboard-container">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-lg text-gray-600">Here's your job search overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card fade-in" data-testid="stat-total-applications">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {stats?.total_applications || 0}
            </div>
            <p className="text-gray-600">Applications</p>
          </div>

          <div className="card fade-in" style={{animationDelay: '0.05s'}} data-testid="stat-submitted">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="text-green-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-500">Submitted</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {stats?.submitted || 0}
            </div>
            <p className="text-gray-600">This month</p>
          </div>

          <div className="card fade-in" style={{animationDelay: '0.1s'}} data-testid="stat-interviews">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-500">Interviews</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {stats?.interview || 0}
            </div>
            <p className="text-gray-600">Scheduled</p>
          </div>

          <div className="card fade-in" style={{animationDelay: '0.15s'}} data-testid="stat-success-rate">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <span className="text-sm font-medium text-gray-500">Success</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {stats?.total_applications ? Math.round(((stats?.interview || 0) / stats?.total_applications) * 100) : 0}%
            </div>
            <p className="text-gray-600">Response rate</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/resume" className="card hover:shadow-lg transition-all" data-testid="quick-action-resume">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Build Resume</h3>
                <p className="text-sm text-gray-600">Create or update your resume</p>
              </div>
            </div>
          </Link>

          <Link to="/jobs" className="card hover:shadow-lg transition-all" data-testid="quick-action-jobs">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Jobs</h3>
                <p className="text-sm text-gray-600">Find matching opportunities</p>
              </div>
            </div>
          </Link>

          <Link to="/auto-apply" className="card hover:shadow-lg transition-all" data-testid="quick-action-auto-apply">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Auto-Apply</h3>
                <p className="text-sm text-gray-600">Automate applications</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Jobs */}
        <div className="card mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" style={{fontFamily: 'Space Grotesk'}}>Top Matched Jobs</h2>
            <Link to="/jobs" className="text-blue-600 font-semibold hover:underline" data-testid="view-all-jobs">View All</Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No jobs found yet</p>
              <Link to="/resume" className="text-blue-600 font-semibold hover:underline">Create your resume to get started</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job, index) => (
                <div key={job.id} className="job-card" data-testid={`job-card-${index}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                      <p className="text-gray-600 mb-2">{job.company} • {job.location}</p>
                      <p className="text-sm text-gray-500 mb-3">{job.salary_range}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements?.slice(0, 3).map((req, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {job.match_score && (
                        <span className={`match-badge ${job.match_score >= 80 ? 'match-high' : job.match_score >= 60 ? 'match-medium' : 'match-low'}`} data-testid={`match-score-${index}`}>
                          {Math.round(job.match_score)}% Match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;