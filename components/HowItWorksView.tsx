import React from 'react';

interface HowItWorksViewProps {
  onEnterHub: () => void;
}

const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onEnterHub }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 sm:space-y-20 py-6 sm:py-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <section className="text-center space-y-4 sm:space-y-6 px-4">
        <div className="inline-block bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Platform Documentation
        </div>
        <h2 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[0.9]">
          Mastering the <br /><span className="text-blue-600">Recovery Hub.</span>
        </h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto text-xs sm:text-lg leading-relaxed">
          The Hub is a specialized recovery network for Ambrose Alli University. This guide explains how to navigate, report, and recover items securely.
        </p>
      </section>

      {/* Grid of Guides */}
      <div className="grid grid-cols-1 gap-8 px-4">
        <GuideSection 
          title="1. Reporting an Item"
          desc="Every recovery starts with a detailed report. Our administrators review these reports to ensure the community stays safe and the information is accurate."
          points={[
            "Found: You discovered an item and want to find its owner.",
            "Lost: You are searching for an item you misplaced.",
            "Photos: High-quality, clear photos are mandatory for verification.",
            "Location: Select the exact Faculty or building where the item was seen."
          ]}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
        />

        <GuideSection 
          title="2. Verification Workflow"
          desc="To prevent spam, your post will not appear on the general feed immediately. It enters a private 'Moderation Queue' visible only to Hub Staff."
          points={[
            "Wait Time: Admin verification typically takes 5–30 minutes.",
            "Profile Tracking: You can see your 'Pending' posts in your Profile Archive.",
            "Rejection: Posts with blurry photos or vague info will be discarded.",
            "Approval: Once approved, the item is pushed to the public feed."
          ]}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />

        <GuideSection 
          title="3. Coordinating Recovery"
          desc="When you find your item on the feed, you use the 'Admin Support' system to initiate a recovery conversation."
          points={[
            "Secure Messaging: Communicate directly through the platform.",
            "Identity Check: Admins may ask for student ID verification.",
            "Safe Spots: Use meeting spots like the Senate Building or Main Gates.",
            "Resolving: Once recovered, the poster marks the item as 'Resolved'."
          ]}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
      </div>

      {/* Safety Policy Card */}
      <section className="px-4">
        <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">Community Safety Policy</h3>
            </div>
            
            <p className="text-slate-400 font-medium leading-relaxed max-w-2xl text-sm sm:text-lg">
              To maintain the integrity of our campus network, users must adhere to the following safety protocols during item handovers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <SafetyPoint title="Daylight Only" desc="Never meet for recovery after 6:00 PM on campus." />
              <SafetyPoint title="Verified Spots" desc="Stick to Faculty gates or SUG Secretariat." />
              <SafetyPoint title="Student ID" desc="Always verify the other person's university identity." />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col items-center space-y-6 sm:space-y-8 py-6 px-4">
        <div className="text-center">
            <h4 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Understood the Hub?</h4>
            <p className="text-slate-500 font-medium text-xs sm:text-base mt-2">Start recovering your items today.</p>
        </div>
        <button 
          onClick={onEnterHub}
          className="w-full sm:w-auto px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all"
        >
          Return to Feed
        </button>
      </div>
    </div>
  );
};

const GuideSection = ({ title, desc, points, icon }: { title: string, desc: string, points: string[], icon: React.ReactNode }) => (
  <div className="group bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 hover:border-blue-100 hover:shadow-2xl transition-all duration-500">
    <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-8">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-6 sm:mb-0 shrink-0 group-hover:rotate-6 transition-transform">
        {icon}
      </div>
      <div className="space-y-4 flex-grow">
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 font-medium leading-relaxed text-sm sm:text-base">{desc}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
          {points.map((p, i) => (
            <li key={i} className="flex items-start space-x-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-600">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const SafetyPoint = ({ title, desc }: { title: string, desc: string }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">{title}</p>
    <p className="text-xs font-medium text-slate-300 leading-relaxed">{desc}</p>
  </div>
);

export default HowItWorksView;