import React, { useState, useEffect } from 'react';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Calendar, MapPin, Building } from 'lucide-react';
import { toast } from 'sonner';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications(data);

      // Fetch job details for each application
      const jobsMap = {};
      for (const app of data) {
        if (!jobsMap[app.job_id]) {
          const jobRes = await fetch(`${API}/jobs/${app.job_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const jobData = await jobRes.json();
          jobsMap[app.job_id] = jobData;
        }
      }
      setJobs(jobsMap);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filterStatus === 'all'
    ? applications
    : applications.filter(app => app.status === filterStatus);

  const getStatusBadgeClass = (status) => {
    const classes = {
      'submitted': 'status-submitted',
      'interview': 'status-interview',
      'accepted': 'status-accepted',
      'rejected': 'status-rejected'
    };
    return `px-4 py-2 rounded-full text-sm font-semibold ${classes[status] || 'bg-gray-100 text-gray-700'}`;
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
      
      <div className="max-w-7xl mx-auto px-4 py-8" data-testid="applications-container">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>My Applications</h1>
          <p className="text-lg text-gray-600">Track all your job applications in one place</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center" data-testid="stat-all">
            <div className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Space Grotesk'}}>{applications.length}</div>
            <p className="text-gray-600">Total</p>
          </div>
          <div className="card text-center" data-testid="stat-submitted">
            <div className="text-3xl font-bold text-blue-600 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {applications.filter(a => a.status === 'submitted').length}
            </div>
            <p className="text-gray-600">Submitted</p>
          </div>
          <div className="card text-center" data-testid="stat-interview">
            <div className="text-3xl font-bold text-yellow-600 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {applications.filter(a => a.status === 'interview').length}
            </div>
            <p className="text-gray-600">Interview</p>
          </div>
          <div className="card text-center" data-testid="stat-accepted">
            <div className="text-3xl font-bold text-green-600 mb-1" style={{fontFamily: 'Space Grotesk'}}>
              {applications.filter(a => a.status === 'accepted').length}
            </div>
            <p className="text-gray-600">Accepted</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="filter-all"
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'submitted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="filter-submitted"
            >
              Submitted ({applications.filter(a => a.status === 'submitted').length})
            </button>
            <button
              onClick={() => setFilterStatus('interview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'interview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="filter-interview"
            >
              Interview ({applications.filter(a => a.status === 'interview').length})
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'accepted' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="filter-accepted"
            >
              Accepted ({applications.filter(a => a.status === 'accepted').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="filter-rejected"
            >
              Rejected ({applications.filter(a => a.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No applications found</p>
            <p className="text-gray-400">Start applying to jobs to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => {
              const job = jobs[app.job_id];
              if (!job) return null;

              return (
                <div key={app.id} className="card fade-in" style={{animationDelay: `${index * 0.05}s`}} data-testid={`application-${index}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>{job.title}</h2>
                      
                      <div className="flex flex-wrap gap-4 mb-3 text-gray-600">
                        <span className="flex items-center">
                          <Building size={16} className="mr-1" /> {job.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin size={16} className="mr-1" /> {job.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={16} className="mr-1" /> Applied {new Date(app.applied_date).toLocaleDateString()}
                        </span>
                      </div>

                      {app.notes && (
                        <p className="text-sm text-gray-600 mb-3">{app.notes}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {job.requirements?.slice(0, 4).map((req, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end space-y-2">
                      <span className={getStatusBadgeClass(app.status)} data-testid={`application-status-${index}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      {job.salary_range && (
                        <span className="text-sm text-gray-600">{job.salary_range}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;