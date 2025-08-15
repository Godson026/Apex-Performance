
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ICONS, APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import HeroVisual from '../components/landing/HeroVisual';
import ScrollProgress from '../components/ui/ScrollProgress';

const LandingPageHeader: React.FC = () => {
  const navigate = useNavigate();
  const navLinkClasses = "px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 cursor-pointer";
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: "Home", action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: "Features", action: () => navigate('/features') },
    { label: "Pricing", action: () => scrollToSection('pricing') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 sm:px-10 flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-slate-700/30 shadow-lg">
      <Link to="/" className="flex items-center group">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
          <ICONS.APP_LOGO_ICON className="h-9 w-auto text-purple-400 group-hover:text-purple-300 transition-colors duration-300 filter drop-shadow-[0_0_8px_#8B5CF6]" />
        </div>
        <span className="ml-3 text-xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300">{APP_NAME}</span>
      </Link>
      
      <nav className="hidden md:flex items-center space-x-2">
        {navItems.map(item => (
          <button key={item.label} onClick={item.action} className={navLinkClasses}>
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="space-x-3">
        <Link to="/login">
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/60 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 hover:text-purple-300 transition-all duration-300"
          >
            Login
          </Button>
        </Link>
        <Link to="/signup">
          <Button
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Sign Up Free
          </Button>
        </Link>
      </div>
    </header>
  );
};

const FeatureCard: React.FC<{title: string, description: string, icon: React.ReactNode}> = ({ title, description, icon }) => (
  <div className="group flex flex-col items-center p-6 bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-slate-700/60 hover:border-purple-500/60 hover-lift">
    <div className="p-4 mb-5 text-purple-400 bg-gradient-to-br from-purple-500/20 via-purple-600/20 to-cyan-500/20 rounded-2xl ring-2 ring-purple-500/40 shadow-lg group-hover:ring-purple-400/60 group-hover:shadow-purple-500/25 transition-all duration-500">
      {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-7 h-7" })}
    </div>
    <h3 className="mb-2 text-xl font-semibold text-slate-100 text-center group-hover:text-white transition-colors duration-300">{title}</h3>
    <p className="text-sm text-slate-400 text-center leading-relaxed group-hover:text-slate-200 transition-colors duration-300">{description}</p>
  </div>
);

const BenefitItem: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/40 group hover:border-purple-500/60 transition-all duration-300">
    <div className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
      {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-6 h-6" })}
    </div>
    <div>
      <p className="text-sm font-semibold text-white group-hover:text-purple-100 transition-colors duration-300">{title}</p>
      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">{description}</p>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Scroll animation observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all scroll-fade-in elements
    const scrollElements = document.querySelectorAll('.scroll-fade-in');
    scrollElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-x-hidden antialiased relative">
      
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-float-delay-1"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl animate-float-delay-2"></div>
      </div>
      
      <LandingPageHeader />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 flex-grow flex items-center justify-center px-6 sm:px-10 overflow-hidden">
        <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-x-12 items-center">
          <div className="text-center lg:text-left mb-16 lg:mb-0">
            {/* Trust badge */}
            <div className="scroll-fade-in inline-flex items-center px-4 py-2 mb-6 bg-slate-800/60 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-full border border-slate-600/40">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Trusted by 10,000+ traders worldwide
            </div>
            
            <div className="scroll-fade-in inline-block px-4 py-1.5 mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 text-xs font-semibold rounded-full tracking-wide border border-purple-500/30 shadow-md backdrop-blur-sm">
              ✨ Elevate Your Edge
            </div>
            
            <h1 className="scroll-fade-in text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-400 leading-tight"
              style={{ textShadow: '0 0 25px rgba(167,139,250,0.3), 0 0 40px rgba(167,139,250,0.2)' }}>
              Manage Your Edge,{' '}
              <span className="block gradient-text-animate" style={{ filter: 'drop-shadow(0 0 15px #A78BFA)'}}>
                Master the Markets
              </span>
            </h1>
            
            <p className="scroll-fade-in text-lg sm:text-xl text-slate-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {APP_NAME} provides the tools to meticulously log, analyze, and optimize your trading strategies. Turn data into discipline.
            </p>

            <div className="scroll-fade-in grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 max-w-lg mx-auto lg:mx-0">
              <BenefitItem title="100% Data Ownership" description="Your journal, your data." icon={<ICONS.LOCK_CLOSED_FORM />} />
              <BenefitItem title="24/7 Access" description="Log trades anytime, anywhere." icon={<ICONS.GLOBE_ALT />} />
              <BenefitItem title="Pro Insights" description="Deep analytics for growth." icon={<ICONS.BRAIN />} />
            </div>

            <div className="scroll-fade-in flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="primary"
                  className="group btn-hover-glow w-full sm:w-auto shadow-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold transform hover:scale-105 transition-all duration-300 ring-2 ring-purple-500/50 hover:ring-purple-400/70 animate-pulse-glow px-8 py-4"
                >
                  Get Started Free <ICONS.ARROW_RIGHT className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"/>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_3px_rgba(6,182,212,0.4)] shadow-md transform hover:scale-105 transition-all duration-300 px-8 py-4"
                onClick={() => navigate('/features')}
              >
                Explore Features
              </Button>
            </div>
          </div>
          
          <div className="relative hidden lg:block animation-delay-1000 animate-float">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-slate-900/60 backdrop-blur-xl border-t border-b border-slate-700/50">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="scroll-fade-in text-4xl sm:text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-purple-400"
              style={{ textShadow: '0 0 15px rgba(167,139,250,0.25)' }}>
              All The Tools You Need to Succeed
            </h2>
            <p className="scroll-fade-in text-md md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From granular trade logging to holistic performance review, {APP_NAME} is your co-pilot in the markets.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard title="Comprehensive Journaling" description="Log every trade detail, chart, and emotion. Capture your execution nuances." icon={<ICONS.NEW_TRADE />} />
            <FeatureCard title="Advanced Analytics" description="Visualize your performance, R-multiple curves, win rates, and profit factor." icon={<ICONS.INSIGHTS />} />
            <FeatureCard title="Price Action Mastery" description="Structured Pre & Post-session logs to refine your market narrative reading." icon={<ICONS.REVIEW_SYSTEM />} />
            <FeatureCard title="Strategic Playbooks" description="Define, test, and optimize your trading setups with clear rules and analytics." icon={<ICONS.PLAYBOOKS />} />
            <FeatureCard title="Holistic Driver Analysis" description="Correlate performance with sleep, diet, and mindset. Understand your personal edge." icon={<ICONS.BRAIN />} />
            <FeatureCard title="Knowledge Hub" description="Organize notes, concepts, and insights from mentors, books, and courses." icon={<ICONS.LEARNING_HUB />} />
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 to-black relative">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 text-center relative">
          <ICONS.SPARKLES className="scroll-fade-in w-14 h-14 text-purple-400 mx-auto mb-8 filter drop-shadow-[0_0_12px_#8B5CF6] animate-pulse-glow" />
          <p className="scroll-fade-in text-xl md:text-2xl italic text-slate-100 mb-6 leading-relaxed">
            "{APP_NAME} transformed my approach to trading. The detailed analytics helped me pinpoint exactly where I was going wrong, turning my performance around."
          </p>
          <p className="scroll-fade-in text-md font-semibold text-slate-300">- Alex P., Active Trader</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="pricing" className="py-20 md:py-28 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-purple-500/5 border-t border-purple-500/20 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl opacity-50 animate-float-delay-2"></div>
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 text-center relative">
          <h2 className="scroll-fade-in text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400"
            style={{ textShadow: '0 0 18px rgba(167,139,250,0.35)' }}>
            Ready to Unlock Your Peak Performance?
          </h2>
          <p className="scroll-fade-in text-lg text-slate-200 mb-10 leading-relaxed">
            Stop guessing and start growing. Join {APP_NAME} today and take control of your trading journey.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              variant="primary"
              className="group btn-hover-glow shadow-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold transform hover:scale-105 transition-all duration-300 ring-2 ring-purple-500/50 hover:ring-purple-400/70 px-10 py-4 animate-pulse-glow"
              style={{ animationDuration: '3s' }}
            >
              Sign Up Now - It's Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black/60 backdrop-blur-xl text-center border-t border-slate-800/70">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 inline-block mb-8">
            <ICONS.APP_LOGO_ICON className="h-12 w-auto text-purple-400 mx-auto opacity-80 filter drop-shadow-[0_0_8px_#8B5CF6]" />
          </div>
          <p className="text-sm text-slate-400 mb-4">
            &copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.
          </p>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Disclaimer: Trading involves substantial risk of loss and is not suitable for every investor. {APP_NAME} is a journaling and performance analysis tool, not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
