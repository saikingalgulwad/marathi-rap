import React, { useState, useEffect } from 'react';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { MapPin, DollarSign, Briefcase, Search, Filter, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchNotifications();
    fetchResumes();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

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

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/resume`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResume(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleApply = async (jobId) => {
    if (!selectedResume) {
      toast.error('Please create a resume first');
      navigate('/resume');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/applications?job_id=${jobId}&resume_id=${selectedResume}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        toast.success('Application submitted successfully!');
        fetchNotifications();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to apply');
      }
    } catch (error) {
      toast.error('Error submitting application');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || job.job_type === filterType;
    return matchesSearch && matchesType;
  });

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
      
      <div className="max-w-7xl mx-auto px-4 py-8" data-testid="jobs-container">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Job Listings</h1>
          <p className="text-lg text-gray-600">Find your next opportunity with AI-powered matching</p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 w-full"
                  data-testid="filter-type"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Selection */}
        {resumes.length === 0 ? (
          <div className="card mb-8 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800 font-medium">You need to create a resume before applying to jobs.</p>
            <button onClick={() => navigate('/resume')} className="mt-4 btn-primary" data-testid="create-resume-button">
              Create Resume
            </button>
          </div>
        ) : (
          <div className="card mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Apply with Resume:</label>
            <select
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full md:w-auto"
              data-testid="select-resume"
            >
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>{resume.title} - {resume.full_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="card text-center py-12">
              <Briefcase className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-500">No jobs found matching your criteria</p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <div key={job.id} className="job-card fade-in" style={{animationDelay: `${index * 0.05}s`}} data-testid={`job-item-${index}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 mb-4 md:mb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>{job.title}</h2>
                        <p className="text-lg text-gray-700 font-medium mb-2">{job.company}</p>
                      </div>
                      {job.match_score && (
                        <span className={`match-badge ml-4 ${job.match_score >= 80 ? 'match-high' : job.match_score >= 60 ? 'match-medium' : 'match-low'}`} data-testid={`job-match-score-${index}`}>
                          {Math.round(job.match_score)}% Match
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
                      <span className="flex items-center">
                        <MapPin size={16} className="mr-1" /> {job.location}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center">
                          <DollarSign size={16} className="mr-1" /> {job.salary_range}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Briefcase size={16} className="mr-1" /> {job.job_type}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{job.description}</p>

                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Requirements:</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, i) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>Source: {job.source}</span>
                      <span className="mx-2">•</span>
                      <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 md:ml-6">
                    <button
                      onClick={() => handleApply(job.id)}
                      className="btn-primary whitespace-nowrap"
                      disabled={!selectedResume}
                      data-testid={`apply-button-${index}`}
                    >
                      Apply Now
                    </button>
                    <button className="btn-secondary whitespace-nowrap" data-testid={`view-job-${index}`}>
                      View Details <ExternalLink className="inline ml-1" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListings;