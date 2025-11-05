import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API } from '../App';
import Navbar from '../components/Navbar';
import { Save, Sparkles, Plus, Trash2, Loader } from 'lucide-react';
import { toast } from 'sonner';

const ResumeBuilder = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  });

  const [newExperience, setNewExperience] = useState({ company: '', title: '', duration: '', description: '' });
  const [newEducation, setNewEducation] = useState({ school: '', degree: '', year: '', field: '' });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchResume();
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

  const fetchResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/resume`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.length > 0) {
        const resume = data[0];
        setResumeId(resume.id);
        setFormData({
          full_name: resume.full_name,
          email: resume.email,
          phone: resume.phone,
          title: resume.title,
          summary: resume.summary,
          experience: resume.experience,
          education: resume.education,
          skills: resume.skills
        });
        if (resume.ai_suggestions) {
          setAiSuggestions(resume.ai_suggestions);
        }
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = resumeId ? `${API}/resume/${resumeId}` : `${API}/resume`;
      const method = resumeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        if (!resumeId && data.id) {
          setResumeId(data.id);
        }
        toast.success('Resume saved successfully!');
      } else {
        throw new Error('Failed to save resume');
      }
    } catch (error) {
      toast.error('Error saving resume');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!resumeId) {
      toast.error('Please save your resume first');
      return;
    }

    setOptimizing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/resume/${resumeId}/optimize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions);
      toast.success('AI analysis complete!');
    } catch (error) {
      toast.error('Error optimizing resume');
    } finally {
      setOptimizing(false);
    }
  };

  const addExperience = () => {
    if (newExperience.company && newExperience.title) {
      setFormData({
        ...formData,
        experience: [...formData.experience, newExperience]
      });
      setNewExperience({ company: '', title: '', duration: '', description: '' });
    }
  };

  const removeExperience = (index) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index)
    });
  };

  const addEducation = () => {
    if (newEducation.school && newEducation.degree) {
      setFormData({
        ...formData,
        education: [...formData.education, newEducation]
      });
      setNewEducation({ school: '', degree: '', year: '', field: '' });
    }
  };

  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar notifications={notifications} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Resume Builder</h1>
          <p className="text-lg text-gray-600">Create and optimize your resume with AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card space-y-6" data-testid="resume-form">
              {/* Basic Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      data-testid="input-full-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      required
                      data-testid="input-title"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    rows={4}
                    placeholder="Brief summary of your professional experience and goals"
                    required
                    data-testid="input-summary"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Work Experience</h2>
                <div className="space-y-4 mb-4">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg relative" data-testid={`experience-${index}`}>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        data-testid={`remove-experience-${index}`}
                      >
                        <Trash2 size={18} />
                      </button>
                      <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                      <p className="text-sm text-gray-500 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company"
                      value={newExperience.company}
                      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      data-testid="new-experience-company"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newExperience.title}
                      onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                      data-testid="new-experience-title"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2020-2023)"
                    value={newExperience.duration}
                    onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                    data-testid="new-experience-duration"
                  />
                  <textarea
                    placeholder="Job description and achievements"
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    rows={2}
                    data-testid="new-experience-description"
                  />
                  <button type="button" onClick={addExperience} className="btn-primary w-full" data-testid="add-experience-button">
                    <Plus className="inline mr-2" size={18} /> Add Experience
                  </button>
                </div>
              </div>

              {/* Education */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Education</h2>
                <div className="space-y-4 mb-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg relative" data-testid={`education-${index}`}>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        data-testid={`remove-education-${index}`}
                      >
                        <Trash2 size={18} />
                      </button>
                      <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                      <p className="text-gray-600">{edu.school} • {edu.year}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="School/University"
                      value={newEducation.school}
                      onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                      data-testid="new-education-school"
                    />
                    <input
                      type="text"
                      placeholder="Degree"
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      data-testid="new-education-degree"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                      data-testid="new-education-field"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={newEducation.year}
                      onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                      data-testid="new-education-year"
                    />
                  </div>
                  <button type="button" onClick={addEducation} className="btn-primary w-full" data-testid="add-education-button">
                    <Plus className="inline mr-2" size={18} /> Add Education
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Skills</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full flex items-center space-x-2" data-testid={`skill-${index}`}>
                      <span>{skill}</span>
                      <button type="button" onClick={() => removeSkill(skill)} className="text-blue-900 hover:text-red-600" data-testid={`remove-skill-${index}`}>
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    data-testid="new-skill-input"
                  />
                  <button type="button" onClick={addSkill} className="btn-primary" data-testid="add-skill-button">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <button type="submit" disabled={loading} className="btn-primary flex-1" data-testid="save-resume-button">
                  <Save className="inline mr-2" size={18} />
                  {loading ? 'Saving...' : 'Save Resume'}
                </button>
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={optimizing || !resumeId}
                  className="btn-secondary flex-1"
                  data-testid="optimize-resume-button"
                >
                  {optimizing ? (
                    <><Loader className="inline mr-2 animate-spin" size={18} /> Analyzing...</>
                  ) : (
                    <><Sparkles className="inline mr-2" size={18} /> AI Optimize</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center" style={{fontFamily: 'Space Grotesk'}}>
                <Sparkles className="mr-2 text-blue-600" size={24} />
                AI Suggestions
              </h2>
              
              {!aiSuggestions ? (
                <div className="text-center py-12">
                  <Sparkles className="mx-auto mb-4 text-gray-300" size={48} />
                  <p className="text-gray-500 mb-4">No suggestions yet</p>
                  <p className="text-sm text-gray-400">Save your resume and click AI Optimize to get personalized suggestions</p>
                </div>
              ) : (
                <div className="space-y-6" data-testid="ai-suggestions">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Overall Score</span>
                      <span className="text-2xl font-bold text-blue-600" data-testid="overall-score">{aiSuggestions.overall_score}/100</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${aiSuggestions.overall_score}%`}}></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary Improvement</h3>
                    <p className="text-sm text-gray-600">{aiSuggestions.summary_improvement}</p>
                  </div>

                  {aiSuggestions.skills_to_add && aiSuggestions.skills_to_add.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Recommended Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.skills_to_add.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestions.action_items && aiSuggestions.action_items.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Action Items</h3>
                      <ul className="space-y-2">
                        {aiSuggestions.action_items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const X = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default ResumeBuilder;