
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
        name: isLogin ? (email.split('@')[0] || 'User') : name,
        role: email.includes('admin') ? 'admin' : 'user'
      };
      setIsLoading(false);
      onLogin(mockUser);
      onNavigate('home');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 text-center bg-indigo-600 text-white">
          <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Welcome Back' : 'Join NovaShop'}</h2>
          <p className="text-indigo-100 text-sm">
            {isLogin ? 'Enter your details to access your account' : 'Create an account to start your premium journey'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Full Name</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-4 transition-all"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Email Address</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-4 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Password</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-4 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium">Google</span>
            </button>
            <button type="button" className="flex items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <span className="text-sm font-medium">Apple</span>
            </button>
          </div>
        </form>
        
        <div className="p-8 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
