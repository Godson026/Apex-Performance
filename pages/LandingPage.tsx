
import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS, APP_NAME } from '../constants';
import Button from '../components/ui/Button';
import HeroVisual from '../components/landing/HeroVisual';

const LandingPageHeader: React.FC = () => {
  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-primary-light transition-colors duration-200 hover:filter hover:drop-shadow-[0_0_6px_var(--tw-shadow-color)] shadow-primary-light";
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" }, // Assuming a features section ID
    { label: "Pricing", href: "#pricing" }, // Assuming a pricing section ID
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 sm:px-10 flex justify-between items-center bg-black/30 backdrop-blur-md border-b border-slate-700/50">
      <Link to="/" className="flex items-center">
        <ICONS.APP_LOGO_ICON className="h-9 w-auto text-primary-light filter drop-shadow-[0_0_8px_#A78BFA]" />
        <span className="ml-2 text-xl font-bold text-white">{APP_NAME}</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-1">
        {navItems.map(item => (
          <a key={item.label} href={item.href} className={navLinkClasses}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="space-x-2">
        <Link to="/login">
          <Button
            variant="outline"
            size="sm"
            className="border-primary-light/60 text-primary-light hover:bg-primary-light/10 hover:border-primary-light hover:shadow-[0_0_10px_2px_rgba(167,139,250,0.4)]"
          >
            Login
          </Button>
        </Link>
        <Link to="/signup">
          <Button
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-primary-DEFAULT to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white shadow-lg hover:shadow-primary-DEFAULT/50 transform transition-all duration-200 hover:scale-105"
          >
            Sign Up Free
          </Button>
        </Link>
      </div>
    </header>
  );
};

const FeatureCard: React.FC<{title: string, description: string, icon: React.ReactNode}> = ({ title, description, icon }) => (
    <div className="flex flex-col items-center p-6 bg-slate-800/40 dark:bg-slate-900/30 backdrop-blur-lg rounded-xl shadow-2xl hover:shadow-primary-DEFAULT/40 transition-all duration-300 transform hover:-translate-y-2 border border-slate-700/60 hover:border-primary-DEFAULT/60">
        <div className="p-4 mb-5 text-primary-light bg-gradient-to-br from-primary-DEFAULT/20 to-purple-600/20 dark:bg-gradient-to-br dark:from-primary-dark/30 dark:to-purple-700/30 rounded-full ring-2 ring-primary-DEFAULT/40 shadow-lg">
            {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-7 h-7" })}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-slate-100 text-center">{title}</h3>
        <p className="text-sm text-slate-400 dark:text-slate-300 text-center leading-relaxed">{description}</p>
    </div>
);

const BenefitItem: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
  <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-700/40">
    <div className="text-primary-light">
      {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-6 h-6" })}
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-slate-400 dark:text-slate-300">{description}</p>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col
        bg-gradient-to-br from-slate-950 via-black to-slate-900
        text-white overflow-x-hidden antialiased relative">

      <div className="absolute inset-0 noise-texture opacity-75"></div>
      <LandingPageHeader />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 md:pt-56 md:pb-32 flex-grow flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Grid Background */}
        <div
            className="absolute inset-0 opacity-25 dark:opacity-20"
            style={{
                backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.05) 1.5px, transparent 1.5px), linear-gradient(to right, rgba(139, 92, 246, 0.05) 1.5px, transparent 1.5px)',
                backgroundSize: '40px 40px',
                animation: 'animated-grid 5s linear infinite',
            }}
        />
        {/* Radial Glows */}
        <div className="absolute inset-0 pointer-events-none animate-hue-rotate-pulse">
            <div className="absolute -top-1/2 -left-1/3 w-2/3 h-2/3 bg-primary-dark/25 dark:bg-primary-DEFAULT/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-1500"></div>
            <div className="absolute -bottom-1/2 -right-1/3 w-2/3 h-2/3 bg-sky-700/25 dark:bg-sky-600/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-3000"></div>
        </div>

        <div className="relative z-10 container mx-auto grid lg:grid-cols-2 gap-x-12 items-center">
          <div className="text-center lg:text-left mb-16 lg:mb-0">
            <div className="inline-block px-4 py-1.5 mb-6 bg-primary-DEFAULT/10 dark:bg-primary-dark/20 text-primary-light text-xs font-semibold rounded-full tracking-wide border border-primary-DEFAULT/30 shadow-md">
              Elevate Your Edge.
            </div>
            <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-primary-light animate-subtle-pulse-glow"
                style={{ textShadow: '0 0 25px rgba(167,139,250,0.3), 0 0 40px rgba(167,139,250,0.2)' }}
            >
              Manage Your Edge, <span className="block text-primary-light" style={{ filter: 'drop-shadow(0 0 15px #A78BFA)'}}>Master the Markets.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 dark:text-slate-200 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {APP_NAME} provides the tools to meticulously log, analyze, and optimize your trading strategies. Turn data into discipline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10 max-w-lg mx-auto lg:mx-0">
              <BenefitItem title="100% Data Ownership" description="Your journal, your data." icon={<ICONS.LOCK_CLOSED_FORM />} />
              <BenefitItem title="24/7 Access" description="Log trades anytime, anywhere." icon={<ICONS.GLOBE_ALT />} />
              <BenefitItem title="Pro Insights" description="Deep analytics for growth." icon={<ICONS.BRAIN />} />
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
              <Link to="/signup">
                <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto shadow-xl bg-gradient-to-r from-primary-DEFAULT to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white font-bold transform hover:scale-105 transition-all duration-300 ring-2 ring-primary-dark/50 hover:ring-primary-light/70 animate-subtle-pulse-glow"
                >
                  Get Started Free <ICONS.ARROW_RIGHT className="w-5 h-5 ml-2"/>
                </Button>
              </Link>
              <Link to="#features">
                   <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-primary-light/60 text-primary-light hover:bg-primary-light/10 hover:border-primary-light hover:shadow-[0_0_15px_3px_rgba(167,139,250,0.4)] shadow-md transform hover:scale-105 transition-all duration-300"
                   >
                      Explore Features
                   </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:block animation-delay-1000 animate-gentle-float">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-slate-900/60 dark:bg-black/40 backdrop-blur-xl border-t border-b border-slate-700/50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14 md:mb-20">
            <h2
                className="text-4xl sm:text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-primary-light"
                style={{ textShadow: '0 0 15px rgba(167,139,250,0.25)' }}
            >
                All The Tools You Need to Succeed
            </h2>
            <p className="text-md md:text-lg text-slate-400 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
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

      {/* Testimonial Placeholder */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 to-black relative">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-6 text-center max-w-3xl relative">
            <ICONS.SPARKLES className="w-14 h-14 text-primary-light mx-auto mb-8 filter drop-shadow-[0_0_12px_#A78BFA] animate-subtle-pulse-glow" />
            <p className="text-xl md:text-2xl italic text-slate-100 dark:text-slate-50 mb-6 leading-relaxed">
                "{APP_NAME} transformed my approach to trading. The detailed analytics helped me pinpoint exactly where I was going wrong, turning my performance around."
            </p>
            <p className="text-md font-semibold text-slate-300 dark:text-slate-200">- Alex P., Active Trader</p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="pricing" className="py-20 md:py-28 bg-primary-dark/5 dark:bg-primary-DEFAULT/10 border-t border-primary-DEFAULT/20 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary-DEFAULT/10 rounded-full filter blur-3xl opacity-50 animate-gentle-float"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-sky-500/10 rounded-full filter blur-3xl opacity-50 animate-gentle-float animation-delay-2000"></div>
        <div className="container mx-auto px-6 text-center max-w-3xl relative">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-light"
            style={{ textShadow: '0 0 18px rgba(167,139,250,0.35)' }}
          >
            Ready to Unlock Your Peak Performance?
          </h2>
          <p className="text-lg text-slate-200 dark:text-slate-100 mb-10 leading-relaxed">
            Stop guessing and start growing. Join {APP_NAME} today and take control of your trading journey.
          </p>
          <Link to="/signup">
            <Button
                size="lg"
                variant="primary"
                className="shadow-xl bg-gradient-to-r from-primary-DEFAULT to-purple-600 hover:from-primary-dark hover:to-purple-700 text-white font-bold transform hover:scale-105 transition-all duration-300 ring-2 ring-primary-dark/50 hover:ring-primary-light/70 px-10 py-4 animate-subtle-pulse-glow"
                style={{ animationDuration: '3s' }}
            >
              Sign Up Now - It's Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-center border-t border-slate-800/70">
        <ICONS.APP_LOGO_ICON className="h-10 w-auto text-primary-light mx-auto mb-4 opacity-80 filter drop-shadow-[0_0_5px_#A78BFA]" />
        <p className="text-sm text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.
        </p>
         <p className="text-xs text-slate-500 dark:text-slate-600 mt-3">
          Disclaimer: Trading involves substantial risk of loss and is not suitable for every investor. {APP_NAME} is a journaling and performance analysis tool, not financial advice.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
