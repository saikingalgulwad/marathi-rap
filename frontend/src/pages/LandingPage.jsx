import React, { useState } from 'react';
import { Sparkles, Zap, Target, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('register');

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900" style={{fontFamily: 'Space Grotesk'}}>AutoApply</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => openAuth('login')} className="text-gray-700 hover:text-blue-600 font-medium" data-testid="header-login-button">
              Sign In
            </button>
            <button onClick={() => openAuth('register')} className="btn-primary" data-testid="header-signup-button">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 max-w-7xl mx-auto text-center">
        <div className="fade-in">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} />
            <span className="text-sm font-semibold">AI-Powered Job Automation</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6" style={{fontFamily: 'Space Grotesk'}}>
            Land Your Dream Job
            <br />
            <span className="text-blue-600">On Autopilot</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            AutoApply uses advanced AI to match you with perfect jobs and automatically submits applications while you focus on preparing for interviews.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => openAuth('register')} className="btn-primary text-lg px-8 py-4" data-testid="hero-get-started-button">
              Get Started Free <ArrowRight className="inline ml-2" size={20} />
            </button>
            <button className="btn-secondary text-lg px-8 py-4" data-testid="hero-learn-more-button">
              Learn More
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20">
          <div className="text-center fade-in">
            <div className="text-4xl font-bold text-blue-600 mb-2" style={{fontFamily: 'Space Grotesk'}}>500+</div>
            <div className="text-gray-600">Jobs Applied Daily</div>
          </div>
          <div className="text-center fade-in" style={{animationDelay: '0.1s'}}>
            <div className="text-4xl font-bold text-blue-600 mb-2" style={{fontFamily: 'Space Grotesk'}}>85%</div>
            <div className="text-gray-600">Match Accuracy</div>
          </div>
          <div className="text-center fade-in" style={{animationDelay: '0.2s'}}>
            <div className="text-4xl font-bold text-blue-600 mb-2" style={{fontFamily: 'Space Grotesk'}}>10k+</div>
            <div className="text-gray-600">Active Users</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>
            How AutoApply Works
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Three simple steps to revolutionize your job search
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center fade-in" data-testid="step-1">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>1. Build Your Resume</h3>
              <p className="text-gray-600">
                Create or upload your resume. Our AI analyzes it and suggests improvements to maximize your chances.
              </p>
            </div>

            <div className="card text-center fade-in" style={{animationDelay: '0.1s'}} data-testid="step-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>2. AI Matches Jobs</h3>
              <p className="text-gray-600">
                Our AI scans thousands of job listings and matches you with positions that fit your skills and preferences.
              </p>
            </div>

            <div className="card text-center fade-in" style={{animationDelay: '0.2s'}} data-testid="step-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Space Grotesk'}}>3. Auto-Apply</h3>
              <p className="text-gray-600">
                Sit back as AutoApply automatically submits applications on your behalf, saving hours of manual work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 gradient-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 mb-16" style={{fontFamily: 'Space Grotesk'}}>
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 fade-in">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>AI Resume Optimization</h3>
                <p className="text-gray-600">Get personalized suggestions to improve your resume and stand out from the competition.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 fade-in" style={{animationDelay: '0.05s'}}>
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Smart Job Matching</h3>
                <p className="text-gray-600">Our AI analyzes job requirements and matches you with the best opportunities.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 fade-in" style={{animationDelay: '0.1s'}}>
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Automated Applications</h3>
                <p className="text-gray-600">Save hours by letting AutoApply submit applications automatically based on your criteria.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 fade-in" style={{animationDelay: '0.15s'}}>
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Real-time Notifications</h3>
                <p className="text-gray-600">Stay updated with instant notifications about applications and new job matches.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 fade-in" style={{animationDelay: '0.2s'}}>
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Application Tracking</h3>
                <p className="text-gray-600">Monitor all your applications in one dashboard with detailed analytics and insights.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 fade-in" style={{animationDelay: '0.25s'}}>
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'Space Grotesk'}}>Multi-Platform Support</h3>
                <p className="text-gray-600">Access jobs from LinkedIn, Indeed, Naukri, and more, all in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 gradient-blue">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{fontFamily: 'Space Grotesk'}}>
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of job seekers who are landing their dream jobs with AutoApply
          </p>
          <button onClick={() => openAuth('register')} className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all" data-testid="cta-get-started-button">
            Get Started for Free <ArrowRight className="inline ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-4 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold" style={{fontFamily: 'Space Grotesk'}}>AutoApply</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-powered job application automation platform
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 AutoApply. All rights reserved.
          </p>
        </div>
      </footer>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode={authMode} />
    </div>
  );
};

export default LandingPage;