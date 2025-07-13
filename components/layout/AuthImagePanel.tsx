

import React from 'react';
import { ICONS, APP_NAME } from '../../constants';

const AuthImagePanel: React.FC = () => {
  // Simulate profile images from the design
  const profileImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  ];


  return (
    <div className="relative hidden lg:flex flex-1 flex-col items-center justify-center p-12 bg-slate-950 text-white overflow-hidden">
      {/* Customized background with brand color accents and subtle patterns */}
      <div 
        className="absolute inset-0" 
        style={{
          // Brand's primary color is #8B5CF6 (violet-500)
          backgroundImage: `
            radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 70%),
            linear-gradient(135deg, rgba(255,255,255,0.02) 25%, transparent 25%),
            linear-gradient(225deg, rgba(255,255,255,0.02) 25%, transparent 25%)
          `,
          backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px',
          backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat',
        }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Use the main app logo, styled with brand color */}
        <ICONS.APP_LOGO_ICON className="w-40 h-40 mb-8 text-primary-light opacity-90" />
        
        <h2 className="text-4xl font-bold mb-4">{`Welcome to ${APP_NAME}`}</h2>
        <p className="text-slate-300 mb-6 text-lg leading-relaxed">
          Unlock your trading potential with advanced analytics, journaling, and AI-powered insights. Track your progress, refine your strategies, and achieve peak performance.
        </p>
        <p className="text-slate-400 mb-10">
          More than 17k traders joined us, it's your turn.
        </p>

        <div className="w-full bg-slate-800/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
          <h3 className="text-2xl font-semibold mb-3">Reach Your Trading Goals Faster</h3>
          <p className="text-slate-300 text-sm mb-6">
            Be among the first founders to experience the easiest way to start building your edge.
          </p>
          <div className="flex -space-x-2 justify-center">
            {profileImages.map((src, index) => (
              <img
                key={index}
                className="inline-block h-10 w-10 rounded-full ring-2 ring-slate-700"
                src={src}
                alt={`User ${index + 1}`}
              />
            ))}
             <span className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-600 text-xs font-medium text-slate-200 ring-2 ring-slate-700">
              +2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePanel;

