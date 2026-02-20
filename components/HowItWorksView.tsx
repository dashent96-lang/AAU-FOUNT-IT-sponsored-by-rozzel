import React from 'react';

interface HowItWorksViewProps {
  onEnterHub: () => void;
}

const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onEnterHub }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <section className="text-center space-y-6">
        <div className="inline-block bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Detailed Platform Guide
        </div>
        <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[0.9]">
          How Recovery <br /><span className="text-blue-600">Actually Works.</span>
        </h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm sm:text-lg leading-relaxed">
          The AAU Recovery Hub is designed to be the safest way to connect lost items with their rightful owners. Here is the breakdown of our 4-step cycle.
        </p>
      </section>

      {/* Detailed Steps */}
      <div className="space-y-12">
        <DetailedStep 
          num="01"
          title="The Reporting Phase"
          desc="Whether you've lost an item or found one, the process starts with a Report. You'll need to provide a clear title, category, and most importantly, a photo. Photos are mandatory as they significantly increase the chance of identification."
          details={[
            "Select the correct status (Lost vs Found)",
            "Choose a specific AAU campus location",
            "Provide a description with unique identifiers (not visible to all if private)"
          ]}
          icon={<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
        />

        <DetailedStep 
          num="02"
          title="Strict Admin Verification"
          desc="To keep the AAU community safe from spam and potential scams, every single post undergoes manual verification by our administrators. This ensures that only legitimate campus-related items are shown."
          details={[
            "Posts are reviewed within 5-15 minutes during active hours",
            "Items with unclear photos or suspicious details are rejected",
            "Verified posts receive a 'Verified' badge and appear on the home feed"
          ]}
          icon={<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />

        <DetailedStep 
          num="03"
          title="Discovery & Matching"
          desc="Once verified, items are listed for the entire university to see. Our powerful search and filter tools allow you to find items by category, faculty building, or specific keywords."
          details={[
            "Search across all campus locations",
            "Filter by 'Found' to see if someone has your item",
            "Filter by 'Lost' if you found something and want to see if it's reported"
          ]}
          icon={<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />

        <DetailedStep 
          num="04"
          title="The Secure Handover"
          desc="The final step is the connection. Use our built-in real-time chat to coordinate a meeting. We recommend using only the 'Safe Meeting Spots' listed in user profiles, such as the Senate building or Faculty gates."
          details={[
            "Chat in real-time within the app",
            "No need to share personal phone numbers immediately",
            "Once handed over, the poster marks it as 'Resolved' to close the case"
          ]}
          icon={<svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863-0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        />
      </div>

      {/* Safety Section */}
      <section className="bg-slate-900 rounded-[3rem] p-10 sm:p-16 text-white overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-black tracking-tight uppercase">Safety Standards</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Your safety is our priority. We encourage all users to follow these rules during recovery:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm font-bold">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Meet in broad daylight</span>
              </li>
              <li className="flex items-center space-x-3 text-sm font-bold">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Prefer Faculty Security Gates</span>
              </li>
              <li className="flex items-center space-x-3 text-sm font-bold">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Always bring a friend along</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
             <div className="w-48 h-48 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <div className="flex flex-col items-center space-y-8 py-10">
        <div className="text-center space-y-2">
            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ready to begin?</h4>
            <p className="text-slate-500 font-medium text-sm">Join the network and help make AAU better.</p>
        </div>
        <button 
          onClick={onEnterHub}
          className="group relative inline-flex items-center justify-center px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/30"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10 flex items-center">
            Enter the Main Hub
            <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </span>
        </button>
      </div>
    </div>
  );
};

const DetailedStep = ({ num, title, desc, details, icon }: { num: string, title: string, desc: string, details: string[], icon: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-12 group p-8 sm:p-12 bg-white rounded-[3rem] border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all duration-500">
    <div className="shrink-0 flex flex-col items-center space-y-4">
      <div className="text-5xl font-black text-slate-100 group-hover:text-blue-50 transition-colors leading-none">{num}</div>
      <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center transition-all group-hover:rotate-12 group-hover:scale-110">
        {icon}
      </div>
    </div>
    <div className="space-y-6">
      <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">{title}</h4>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {details.map((detail, i) => (
          <li key={i} className="flex items-start space-x-3">
             <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
             <span className="text-[11px] sm:text-xs font-bold text-slate-600 leading-tight">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export default HowItWorksView;