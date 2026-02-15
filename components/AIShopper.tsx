
import React, { useState, useRef, useEffect } from 'react';
import { getShoppingAdvice } from '../services/geminiService';

const AIShopper: React.FC<{ context: string }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const advice = await getShoppingAdvice(userText, context);
    setMessages(prev => [...prev, { role: 'ai', text: advice }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="bg-white w-[350px] md:w-[400px] h-[600px] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
          <div className="p-6 bg-black text-white flex justify-between items-center border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl gold-bg flex items-center justify-center text-black font-black shadow-lg">
                FD
              </div>
              <div className="flex flex-col">
                <span className="font-black uppercase tracking-widest text-sm">Dhara AI</span>
                <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Fashion Stylist</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20 px-8">
                <div className="w-16 h-16 gold-bg rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-xl shadow-amber-500/10">✨</div>
                <h3 className="text-gray-900 font-black mb-2 uppercase tracking-widest text-sm">Welcome to Fashion Dhara</h3>
                <p className="text-xs leading-relaxed italic">"I am your personal boutique concierge. How may I assist with your selection today?"</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${m.role === 'user' ? 'bg-zinc-900 text-white rounded-br-none shadow-lg' : 'bg-white text-gray-800 shadow-xl border border-gray-100 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 rounded-bl-none flex space-x-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex space-x-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about premium trends..."
                className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-amber-500 rounded-2xl px-5 py-3 text-sm font-bold"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-3 gold-bg text-black rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-amber-500/10 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-black text-amber-500 rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-2 border-amber-500/20 active:scale-95 group"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 gold-bg rounded-full border-2 border-black animate-ping"></span>
          </div>
        </button>
      )}
    </div>
  );
};

export default AIShopper;
