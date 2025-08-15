import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ICONS, APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import ScrollProgress from '../components/ui/ScrollProgress';

const FeatureCard: React.FC<{title: string, description: string, icon: React.ReactNode, benefits: string[]}> = ({ 
  title, 
  description, 
  icon, 
  benefits 
}) => (
  <div className="group feature-card-animate flex flex-col p-8 bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] border border-slate-700/40 hover:border-purple-500/60 relative overflow-hidden hover-lift">
    {/* Animated background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Icon container with enhanced styling */}
    <div className="relative z-10 p-5 mb-6 text-purple-400 bg-gradient-to-br from-purple-500/20 via-purple-600/20 to-cyan-500/20 rounded-2xl ring-2 ring-purple-500/30 shadow-lg group-hover:ring-purple-400/60 group-hover:shadow-purple-500/25 transition-all duration-500">
      {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-8 h-8" })}
    </div>
    
    <h3 className="relative z-10 mb-4 text-2xl font-bold text-slate-100 text-center group-hover:text-white transition-colors duration-300">{title}</h3>
    <p className="relative z-10 text-slate-300 text-center leading-relaxed mb-6 group-hover:text-slate-200 transition-colors duration-300">{description}</p>
    
    <ul className="relative z-10 space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center text-sm text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
          <div className="flex-shrink-0 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors duration-300">
            <ICONS.CHECK_CIRCLE className="w-3 h-3 text-green-400" />
          </div>
          <span className="leading-relaxed">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: "Comprehensive Journaling",
      description: "Log every trade detail with precision and structure",
      icon: <ICONS.NEW_TRADE />,
      benefits: [
        "Capture entry/exit prices and timing",
        "Log position sizes and risk management",
        "Record market conditions and setup",
        "Track emotional state and mindset"
      ]
    },
    {
      title: "Advanced Analytics",
      description: "Transform raw data into actionable insights",
      icon: <ICONS.INSIGHTS />,
      benefits: [
        "Win rate and profit factor analysis",
        "R-multiple distribution curves",
        "Performance correlation insights",
        "Custom metric calculations"
      ]
    },
    {
      title: "Price Action Mastery",
      description: "Structured pre and post-session analysis",
      icon: <ICONS.REVIEW_SYSTEM />,
      benefits: [
        "Pre-session market preparation",
        "Post-session trade review",
        "Pattern recognition tracking",
        "Market narrative development"
      ]
    },
    {
      title: "Strategic Playbooks",
      description: "Define, test, and optimize your trading setups",
      icon: <ICONS.PLAYBOOKS />,
      benefits: [
        "Setup identification and rules",
        "Backtesting and validation",
        "Performance tracking by setup",
        "Continuous optimization"
      ]
    },
    {
      title: "Holistic Driver Analysis",
      description: "Correlate performance with lifestyle factors",
      icon: <ICONS.BRAIN />,
      benefits: [
        "Sleep quality tracking",
        "Diet and nutrition correlation",
        "Mindset and stress monitoring",
        "Performance optimization insights"
      ]
    },
    {
      title: "Knowledge Hub",
      description: "Organize and retain trading knowledge",
      icon: <ICONS.LEARNING_HUB />,
      benefits: [
        "Note organization system",
        "Concept categorization",
        "Mentor insights tracking",
        "Course and book summaries"
      ]
    }
  ];

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
      
      {/* Header */}
      <header className="relative z-40 py-6 px-6 sm:px-10 flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-slate-700/30 shadow-lg">
        <Link to="/" className="flex items-center group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
            <ICONS.APP_LOGO_ICON className="h-9 w-auto text-purple-400 group-hover:text-purple-300 transition-colors duration-300 filter drop-shadow-[0_0_8px_#8B5CF6]" />
          </div>
          <span className="ml-3 text-xl font-bold text-white group-hover:text-purple-100 transition-colors duration-300">{APP_NAME}</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300">
            Home
          </Link>
          <span className="px-4 py-2 rounded-lg text-sm font-medium text-purple-400 bg-purple-500/20 border border-purple-500/30">
            Features
          </span>
          <Link to="/#pricing" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300">
            Pricing
          </Link>
        </nav>
        
        <div className="space-x-3">
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-purple-500/60 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 hover:text-purple-300 transition-all duration-300">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
              Sign Up Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Reduced height for better above-the-fold experience */}
      <section className="relative pt-24 pb-16 flex items-center justify-center px-6 sm:px-10 overflow-hidden">
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          {/* Trust badge */}
          <div className="scroll-fade-in inline-flex items-center px-4 py-2 mb-6 bg-slate-800/60 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-full border border-slate-600/40">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Trusted by 10,000+ traders worldwide
          </div>
          
          <div className="scroll-fade-in inline-block px-6 py-2 mb-8 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 text-sm font-semibold rounded-full tracking-wide border border-purple-500/30 shadow-lg backdrop-blur-sm">
            ✨ Feature Deep Dive
          </div>
          
          <h1 className="scroll-fade-in text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-400 leading-tight">
            All The Tools You Need to{' '}
            <span className="block gradient-text-animate">
              Succeed
            </span>
          </h1>
          
          <p className="scroll-fade-in text-lg sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            From granular trade logging to holistic performance review, {APP_NAME} is your co-pilot in the markets. 
            Discover how each feature works together to elevate your trading performance.
          </p>
          
          {/* Hero CTA */}
          <div className="scroll-fade-in flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="primary" className="group btn-hover-glow bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 ring-2 ring-purple-500/50 hover:ring-purple-400/70">
                Get Started Free
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button size="lg" variant="outline" className="border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_3px_rgba(6,182,212,0.4)] shadow-md transform hover:scale-105 transition-all duration-300 px-8 py-4">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 bg-slate-900/40 backdrop-blur-xl border-t border-slate-700/30 relative">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-16">
            <h2 className="scroll-fade-in text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-purple-400">
              Powerful Features That Drive Results
            </h2>
            <p className="scroll-fade-in text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Every tool is designed with one goal: to help you become a better trader
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 to-blue-950 relative">
        <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 relative">
          <div className="text-center mb-20">
            <h2 className="scroll-fade-in text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-cyan-400">
              How It All Works Together
            </h2>
            <p className="scroll-fade-in text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {APP_NAME} creates a comprehensive feedback loop that continuously improves your trading performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { number: "1", title: "Log & Record", description: "Capture every trade detail with our structured journaling system" },
              { number: "2", title: "Analyze & Review", description: "Use advanced analytics to identify patterns and areas for improvement" },
              { number: "3", title: "Optimize & Execute", description: "Apply insights to refine strategies and improve future performance" }
            ].map((step, index) => (
              <div key={index} className="text-center group scroll-fade-in">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-all duration-500 ring-4 ring-purple-500/20 group-hover:ring-purple-500/40">
                    <span className="text-3xl font-black text-purple-400 group-hover:text-purple-300 transition-colors duration-300">{step.number}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 -right-6 w-12 h-0.5 bg-gradient-to-r from-purple-500/40 to-cyan-500/40 group-hover:from-purple-500/60 group-hover:to-cyan-500/60 transition-all duration-500"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-100 transition-colors duration-300">{step.title}</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-purple-500/5 via-cyan-500/5 to-purple-500/5 border-t border-purple-500/20 relative overflow-hidden">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 text-center relative">
          <h2 className="scroll-fade-in text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400">
            Ready to Experience These Features?
          </h2>
          <p className="scroll-fade-in text-lg text-slate-200 mb-10 leading-relaxed max-w-2xl mx-auto">
            Start your journey with {APP_NAME} today and discover how powerful these tools can be for your trading success.
          </p>
          
          <div className="scroll-fade-in flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/signup">
              <Button size="lg" variant="primary" className="group btn-hover-glow bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-lg transform hover:scale-105 transition-all duration-300 ring-2 ring-purple-500/50 hover:ring-purple-400/70 px-10 py-4 shadow-2xl hover:shadow-purple-500/30">
                Get Started Free
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button size="lg" variant="outline" className="border-2 border-cyan-400/60 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_20px_3px_rgba(6,182,212,0.4)] shadow-md transform hover:scale-105 transition-all duration-300 px-10 py-4">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black/60 backdrop-blur-xl text-center border-t border-slate-800/50">
        <div className="w-full max-w-4xl mx-auto px-6 sm:px-10">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 inline-block mb-8">
            <ICONS.APP_LOGO_ICON className="h-12 w-auto text-purple-400 mx-auto filter drop-shadow-[0_0_8px_#8B5CF6]" />
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

export default FeaturesPage;
