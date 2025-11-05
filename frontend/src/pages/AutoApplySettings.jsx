import React, { useState, useEffect } from 'react';
import { API } from '../App';
import Navbar from '../components/Navbar';
import { Save, Zap, Play, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AutoApplySettings = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    min_match_score: 70,
    job_types: ['full-time'],
    locations: [],
    max_applications_per_day: 10
  });
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auto-apply/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auto-apply/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        toast.success('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/auto-apply/trigger`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        fetchNotifications();
      } else {
        throw new Error(data.detail || 'Failed to trigger auto-apply');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setTriggering(false);
    }
  };

  const toggleJobType = (type) => {
    if (settings.job_types.includes(type)) {
      setSettings({
        ...settings,
        job_types: settings.job_types.filter(t => t !== type)
      });
    } else {
      setSettings({
        ...settings,
        job_types: [...settings.job_types, type]
      });
    }
  };

  const addLocation = () => {
    if (newLocation && !settings.locations.includes(newLocation)) {
      setSettings({
        ...settings,
        locations: [...settings.locations, newLocation]
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location) => {
    setSettings({
      ...settings,
      locations: settings.locations.filter(l => l !== location)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar notifications={notifications} />
      
      <div className="max-w-4xl mx-auto px-4 py-8" data-testid="auto-apply-container">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Auto-Apply Settings</h1>
          <p className="text-lg text-gray-600">Configure automatic job application preferences</p>
        </div>

        {/* Warning Banner */}
        {!settings.enabled && (
          <div className="card bg-blue-50 border-blue-200 mb-8 flex items-start space-x-3" data-testid="warning-banner">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Auto-Apply is Currently Disabled</h3>
              <p className="text-sm text-blue-700">Enable auto-apply below to start automatically submitting job applications.</p>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <div className="card space-y-8">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Enable Auto-Apply</h2>
              <p className="text-gray-600">Automatically apply to jobs matching your criteria</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
                data-testid="toggle-auto-apply"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
            </label>
          </div>

          {/* Match Score Threshold */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Minimum Match Score</h2>
            <p className="text-gray-600 mb-4">Only apply to jobs with at least this match percentage</p>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="50"
                max="100"
                value={settings.min_match_score}
                onChange={(e) => setSettings({ ...settings, min_match_score: parseInt(e.target.value) })}
                className="flex-1"
                data-testid="match-score-slider"
              />
              <span className="text-2xl font-bold text-blue-600 w-20 text-right" data-testid="match-score-value">
                {settings.min_match_score}%
              </span>
            </div>
            <div className="mt-4 progress-bar">
              <div className="progress-fill" style={{width: `${settings.min_match_score}%`}}></div>
            </div>
          </div>

          {/* Job Types */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Preferred Job Types</h2>
            <div className="flex flex-wrap gap-3">
              {['full-time', 'part-time', 'contract'].map(type => (
                <button
                  key={type}
                  onClick={() => toggleJobType(type)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    settings.job_types.includes(type)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  data-testid={`job-type-${type}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Preferred Locations</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.locations.map((loc, index) => (
                <span key={index} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full flex items-center space-x-2" data-testid={`location-${index}`}>
                  <span>{loc}</span>
                  <button onClick={() => removeLocation(loc)} className="text-blue-900 hover:text-red-600" data-testid={`remove-location-${index}`}>
                    ×
                  </button>
                </span>
              ))}
              {settings.locations.length === 0 && (
                <span className="text-gray-500 italic">No locations set (will apply to all locations)</span>
              )}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add location (e.g. Remote, New York)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                className="flex-1"
                data-testid="new-location-input"
              />
              <button onClick={addLocation} className="btn-primary" data-testid="add-location-button">
                Add
              </button>
            </div>
          </div>

          {/* Max Applications */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>Daily Application Limit</h2>
            <p className="text-gray-600 mb-4">Maximum number of applications to submit per day</p>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.max_applications_per_day}
              onChange={(e) => setSettings({ ...settings, max_applications_per_day: parseInt(e.target.value) })}
              className="w-full md:w-48"
              data-testid="max-applications-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary flex-1"
              data-testid="save-settings-button"
            >
              <Save className="inline mr-2" size={18} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleTrigger}
              disabled={triggering || !settings.enabled}
              className="btn-secondary flex-1"
              data-testid="trigger-auto-apply-button"
            >
              {triggering ? (
                <><div className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div> Running...</>
              ) : (
                <><Play className="inline mr-2" size={18} /> Trigger Auto-Apply Now</>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="card mt-8 bg-gradient-light">
          <div className="flex items-start space-x-3">
            <Zap className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How Auto-Apply Works</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• AutoApply scans job listings that match your resume and criteria</li>
                <li>• AI calculates match scores based on your skills and experience</li>
                <li>• Applications are automatically submitted to jobs above your threshold</li>
                <li>• You'll receive notifications for each application submitted</li>
                <li>• Track all auto-applied jobs in your Applications dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoApplySettings;