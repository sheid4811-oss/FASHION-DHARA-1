
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigate: (page: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        name: isLogin ? (email.split('@')[0] || 'Member') : name,
        role: email.includes('admin') ? 'admin' : 'user'
      };
      setIsLoading(false);
      onLogin(mockUser);
      onNavigate('home');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-32 animate-in">
      <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
        <div className="p-16 text-center bg-black text-white relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #D4AF37, transparent)' }}></div>
          <div className="w-20 h-20 gold-bg rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-black font-black text-2xl shadow-2xl relative z-10 border-4 border-white/10">FD</div>
          <h2 className="text-5xl font-black mb-4 uppercase tracking-[0.4em] relative z-10">{isLogin ? 'AUTHENTICATE' : 'ESTABLISH'}</h2>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.5em] relative z-10 opacity-60">
            {isLogin ? 'Access your private boutique portfolio' : 'Join our international fashion society'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-16 md:p-24 space-y-10">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase mb-4 tracking-[0.4em] ml-2">MEMBER IDENTITY</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Legal Name"
                className="w-full bg-zinc-50 border-none focus:ring-[12px] focus:ring-amber-500/10 rounded-[2.5rem] p-8 font-black transition-all shadow-inner placeholder:text-gray-300"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-4 tracking-[0.4em] ml-2">DIGITAL SIGNATURE (EMAIL)</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@fashiondhara.com"
              className="w-full bg-zinc-50 border-none focus:ring-[12px] focus:ring-amber-500/10 rounded-[2.5rem] p-8 font-black transition-all shadow-inner placeholder:text-gray-300"
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase mb-4 tracking-[0.4em] ml-2">SECURE PASSKEY</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-50 border-none focus:ring-[12px] focus:ring-amber-500/10 rounded-[2.5rem] p-8 font-black transition-all shadow-inner placeholder:text-gray-300"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-8 bg-black text-white rounded-[3rem] font-black uppercase tracking-[0.5em] hover:brightness-150 transition-all shadow-2xl flex items-center justify-center text-[11px] border-2 border-amber-500/50"
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 text-amber-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (isLogin ? 'AUTHORIZE ENTRY' : 'COMMIT SIGNATURE')}
          </button>
          
          <div className="relative py-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.5em]"><span className="bg-white px-8 text-gray-300">Alternative Credentials</span></div>
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <button type="button" className="flex items-center justify-center p-6 border-2 border-gray-50 rounded-[2rem] hover:bg-zinc-50 transition-all text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 shadow-sm">
              Google ID
            </button>
            <button type="button" className="flex items-center justify-center p-6 border-2 border-gray-50 rounded-[2rem] hover:bg-zinc-50 transition-all text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 shadow-sm">
              Apple ID
            </button>
          </div>
        </form>
        
        <div className="p-16 bg-zinc-50 text-center border-t border-gray-100">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">
            {isLogin ? "Not yet established with our house?" : "Already holding membership?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-4 text-amber-600 font-black hover:gold-gradient transition-all border-b-2 border-transparent hover:border-amber-600"
            >
              {isLogin ? 'Establish Identity' : 'Authorize Entry'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
