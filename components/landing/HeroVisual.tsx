import React from 'react';

const HeroVisual: React.FC = () => {
  const DecorativeSphere: React.FC<{ className?: string, size?: string, animationDelay?: string, colorClass?: string, blurClass?: string, opacity?: string }> = 
    ({ className, size = "w-12 h-12", animationDelay, colorClass = "bg-primary-DEFAULT/30 dark:bg-primary-light/20", blurClass = "blur-md", opacity = "opacity-60" }) => (
    <div 
      className={`absolute rounded-full ${size} ${colorClass} ${className} ${blurClass} ${opacity}`}
      style={{ animation: `gentle-float 10s ease-in-out infinite ${animationDelay || '0s'}`}}
    />
  );

  const tradesData = [
    { asset: 'EUR/USD', entry: '1.0750', exit: '1.0810', rr: '+2.5R', result: 'Win', resultColor: 'text-emerald-400' },
    { asset: 'GBP/JPY', entry: '190.20', exit: '189.70', rr: '-1.0R', result: 'Loss', resultColor: 'text-red-400' },
    { asset: 'AUD/USD', entry: '0.6600', exit: '0.6600', rr: '0.0R', result: 'BE', resultColor: 'text-slate-400' },
    { asset: 'USD/CAD', entry: '1.3710', exit: '1.3755', rr: '+1.8R', result: 'Win', resultColor: 'text-emerald-400' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[450px] md:min-h-[550px] xl:min-h-[650px] pointer-events-none select-none">
      {/* Main Textured Background Sphere - More dynamic */}
      <div 
        className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] xl:w-[700px] xl:h-[700px] rounded-full noise-texture overflow-hidden opacity-80 animate-hue-rotate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.15) 0%, rgba(76, 29, 149, 0.1) 35%, rgba(2, 6, 23, 0.05) 70%)',
          animationName: 'slow-scale-fade, slow-spin-counter-clockwise, hue-rotate-pulse',
          animationDuration: '25s, 120s, 10s',
          animationTimingFunction: 'ease-in-out, linear, ease-in-out',
          animationIterationCount: 'infinite, infinite, infinite',
          animationDirection: 'normal, normal, alternate',
          boxShadow: '0 0 250px 60px rgba(109, 40, 217, 0.15), inset 0 0 100px 25px rgba(139, 92, 246, 0.1)'
        }}
      />
      
      {/* Glowing Dashboard Screen */}
      <div 
        className="relative z-10 w-[400px] h-[280px] md:w-[480px] md:h-[320px] xl:w-[560px] xl:h-[370px] 
                   bg-slate-800/60 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl 
                   shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),_0_0_0_1.5px_rgba(255,255,255,0.07)]
                   border border-slate-700/50 p-4 flex flex-col overflow-hidden
                   transform transition-transform duration-500 hover:scale-[1.02]"
        style={{ 
          animation: 'gentle-float 8s ease-in-out infinite reverse 0.3s',
          transform: 'perspective(1500px) rotateX(10deg) rotateY(-5deg) rotateZ(1deg)' 
        }}
      >
        {/* Dashboard Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/70">
          <div className="flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70 mr-1.5"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70 mr-1.5"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 mr-2.5"></div>
            <h3 className="text-xs font-medium text-slate-300">Apex Performance Dashboard</h3>
          </div>
          <div className="w-16 h-1.5 bg-primary-dark/40 rounded-full opacity-70"></div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="flex-grow grid grid-cols-3 gap-3 overflow-hidden">
          {/* Left Column: Trades Table & Small Widget */}
          <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
            <div className="bg-slate-900/40 p-2.5 rounded-md shadow-inner flex-grow overflow-y-auto tiny-scrollbar">
              <h4 className="text-xs font-semibold text-primary-light mb-1.5 px-1">Recent Trades</h4>
              <table className="w-full text-[10px] xl:text-xs">
                <thead className="text-slate-400">
                  <tr>
                    <th className="text-left py-1 px-1 font-medium">Asset</th>
                    <th className="text-right py-1 px-1 font-medium">Entry</th>
                    <th className="text-right py-1 px-1 font-medium">Exit</th>
                    <th className="text-right py-1 px-1 font-medium">R:R</th>
                    <th className="text-right py-1 px-1 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {tradesData.map((trade, idx) => (
                    <tr key={idx} className="border-t border-slate-700/50 hover:bg-primary-dark/20">
                      <td className="py-1 px-1">{trade.asset}</td>
                      <td className="text-right py-1 px-1">{trade.entry}</td>
                      <td className="text-right py-1 px-1">{trade.exit}</td>
                      <td className={`text-right py-1 px-1 font-medium ${trade.rr.startsWith('+') ? 'text-emerald-400' : trade.rr.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>{trade.rr}</td>
                      <td className={`text-right py-1 px-1 font-semibold ${trade.resultColor}`}>{trade.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-900/40 p-2 rounded-md shadow-inner h-16 flex items-center justify-around">
                <div className="text-center">
                    <span className="text-[9px] text-slate-400">Win Rate</span>
                    <p className="text-sm font-bold text-emerald-400">62.5%</p>
                </div>
                 <div className="text-center">
                    <span className="text-[9px] text-slate-400">Profit Factor</span>
                    <p className="text-sm font-bold text-sky-400">1.85</p>
                </div>
            </div>
          </div>

          {/* Right Column: Charts */}
          <div className="col-span-1 flex flex-col gap-3 overflow-hidden">
            {/* Candlestick Chart */}
            <div className="bg-slate-900/40 p-2.5 rounded-md shadow-inner flex-grow flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-primary-light mb-1 text-center">Price Action</h4>
              <svg viewBox="0 0 80 50" className="w-full h-auto opacity-90 filter drop-shadow-[0_0_5px_#A78BFA]">
                <defs>
                    <linearGradient id="candleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(167,139,250,0.8)" />
                        <stop offset="100%" stopColor="rgba(139,92,246,0.8)" />
                    </linearGradient>
                </defs>
                {/* Candles (example) */}
                <rect x="10" y="15" width="8" height="20" fill="rgba(16,185,129,0.7)" stroke="rgba(16,185,129,1)" strokeWidth="0.5" rx="0.5"/>
                <line x1="14" y1="10" x2="14" y2="38" stroke="rgba(16,185,129,1)" strokeWidth="0.5"/>
                
                <rect x="25" y="10" width="8" height="25" fill="rgba(239,68,68,0.7)" stroke="rgba(239,68,68,1)" strokeWidth="0.5" rx="0.5"/>
                <line x1="29" y1="5" x2="29" y2="38" stroke="rgba(239,68,68,1)" strokeWidth="0.5"/>

                <rect x="40" y="20" width="8" height="15" fill="rgba(16,185,129,0.7)" stroke="rgba(16,185,129,1)" strokeWidth="0.5" rx="0.5"/>
                <line x1="44" y1="18" x2="44" y2="38" stroke="rgba(16,185,129,1)" strokeWidth="0.5"/>

                <rect x="55" y="12" width="8" height="28" fill="url(#candleGlow)" stroke="rgba(167,139,250,1)" strokeWidth="0.7" rx="0.5" className="animate-subtle-pulse-glow" style={{animationDuration: '2.5s'}}/>
                <line x1="59" y1="8" x2="59" y2="43" stroke="rgba(167,139,250,1)" strokeWidth="0.7"/>
                
                {/* Grid Lines */}
                {[5,15,25,35,45].map(y => <line key={`h-${y}`} x1="0" y1={y} x2="80" y2={y} stroke="#8B5CF6" strokeWidth="0.2" opacity="0.1"/>)}
              </svg>
            </div>
            {/* Bias Accuracy */}
            <div className="bg-slate-900/40 p-2.5 rounded-md shadow-inner h-20 flex flex-col justify-center">
              <h4 className="text-xs font-semibold text-primary-light mb-1 text-center">Bias Accuracy</h4>
              <div className="flex justify-around items-end h-full">
                  <div className="text-center">
                      <div className="w-4 h-8 bg-sky-500/70 rounded-t-sm mx-auto" style={{filter: 'drop-shadow(0 -2px 3px rgba(56,189,248,0.5))'}}></div>
                      <p className="text-[9px] text-sky-300 mt-0.5">Bull: 70%</p>
                  </div>
                   <div className="text-center">
                      <div className="w-4 h-6 bg-pink-500/70 rounded-t-sm mx-auto" style={{filter: 'drop-shadow(0 -2px 3px rgba(236,72,153,0.5))'}}></div>
                      <p className="text-[9px] text-pink-300 mt-0.5">Bear: 55%</p>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Accents - Kept from previous version, positions might need minor tweaks if overlapping dashboard too much */}
      <DecorativeSphere className="-top-10 -left-16 sm:-top-16 sm:-left-24" size="w-32 h-32 sm:w-40 sm:h-40" animationDelay="0.2s" colorClass="bg-sky-600/15 dark:bg-sky-500/10" blurClass="blur-2xl" opacity="opacity-40" />
      <DecorativeSphere className="bottom-0 -right-12 sm:bottom-4 sm:-right-20" size="w-28 h-28 sm:w-36 sm:h-36" animationDelay="1.5s" colorClass="bg-pink-600/15 dark:bg-pink-500/10" blurClass="blur-2xl" opacity="opacity-40" />
      <DecorativeSphere className="top-1/4 -translate-y-1/2 -left-28 sm:-left-36" size="w-20 h-20 sm:w-24 sm:h-24" animationDelay="2.8s" colorClass="bg-primary-DEFAULT/25 dark:bg-primary-light/20" blurClass="blur-xl"/>
      <DecorativeSphere className="bottom-1/3 -right-24 sm:-right-32" size="w-16 h-16 sm:w-20 sm:h-20" animationDelay="4.1s" colorClass="bg-emerald-600/15 dark:bg-emerald-500/10" blurClass="blur-xl"/>
      
      <DecorativeSphere className="top-1/3 left-1/4" size="w-2.5 h-2.5" animationDelay="0.7s" colorClass="bg-slate-100/80" blurClass="blur-xs filter brightness-200" opacity="opacity-90" />
      <DecorativeSphere className="bottom-1/4 right-1/3" size="w-3.5 h-3.5" animationDelay="2s" colorClass="bg-primary-light/90" blurClass="blur-sm filter brightness-200" opacity="opacity-90" />
    </div>
  );
};

export default HeroVisual;
