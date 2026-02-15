
import React, { useState, useRef, useEffect } from 'react';
import { getShoppingAdvice } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface Source {
  title: string;
  uri: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  sources?: Source[];
}

const AIShopper: React.FC<{ context: string }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLive]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const result = await getShoppingAdvice(userText, context);
    setMessages(prev => [...prev, { role: 'ai', text: result.text, sources: result.sources }]);
    setIsLoading(false);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startLiveSession = async () => {
    setIsLive(true);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const outputNode = outputAudioContextRef.current.createGain();
      outputNode.connect(outputAudioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Stylist Live Connection Established');
            setIsLoading(false);
            setIsListening(true);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => {
            console.log('Live Session Ended');
            stopLiveSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are Dhara, a world-class luxury fashion stylist. You are now in a real-time voice conversation with a client. Be sophisticated, brief but helpful, and highly professional. Guide them through high-fashion concepts.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to initiate Live Session:', err);
      setIsLive(false);
      setIsLoading(false);
    }
  };

  const stopLiveSession = () => {
    setIsLive(false);
    setIsListening(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    for (const source of sourcesRef.current.values()) {
      source.stop();
      sourcesRef.current.delete(source);
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-50">
      {isOpen ? (
        <div className="bg-white w-[400px] md:w-[500px] h-[750px] rounded-[5rem] shadow-[0_100px_200px_-40px_rgba(0,0,0,0.4)] border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-24 duration-1000">
          <div className="p-10 bg-black text-white flex justify-between items-center border-b border-white/10">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 rounded-[2rem] gold-bg flex items-center justify-center text-black font-black shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                FD
              </div>
              <div className="flex flex-col">
                <span className="font-black uppercase tracking-[0.4em] text-sm">Stylist Dhara</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.5em]">{isLive ? 'LIVE VOICE SESSION' : 'ELITE CONCIERGE'}</span>
              </div>
            </div>
            <button onClick={() => { stopLiveSession(); setIsOpen(false); }} className="hover:bg-white/10 p-4 rounded-[2rem] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 bg-zinc-50/80">
            {isLive ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-in">
                 <div className="relative">
                    <div className="absolute inset-0 gold-bg rounded-full animate-ping opacity-20"></div>
                    <div className="w-40 h-40 gold-bg rounded-[4rem] flex items-center justify-center shadow-2xl relative z-10 border-8 border-white">
                       <svg className="w-16 h-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                       </svg>
                    </div>
                 </div>
                 <div className="space-y-4">
                   <h3 className="text-3xl font-black text-gray-900 uppercase tracking-[0.4em]">Listening...</h3>
                   <p className="text-sm font-medium italic text-gray-400 px-12 leading-relaxed">"Speak freely. I am analyzing your voice to curate the perfect luxury aesthetic."</p>
                 </div>
                 <button onClick={stopLiveSession} className="px-12 py-6 bg-red-600 text-white rounded-[3rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-red-700 transition-all">Terminate Live Link</button>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-32 px-12">
                    <div className="w-24 h-24 gold-bg rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-4xl shadow-2xl shadow-amber-500/30 animate-bounce">✨</div>
                    <h3 className="text-gray-900 font-black mb-6 uppercase tracking-[0.4em] text-sm">Curating Your Vision</h3>
                    <p className="text-base leading-relaxed italic opacity-80">"How shall we redefine your presence today? I am prepared to analyze trends or curate specific acquisitions."</p>
                    <button 
                      onClick={startLiveSession}
                      className="mt-12 px-10 py-5 gold-bg text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:scale-105 transition-all flex items-center justify-center mx-auto space-x-3"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      <span>Initiate Live Stylist</span>
                    </button>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-8 rounded-[3.5rem] text-sm font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-zinc-900 text-white rounded-br-none shadow-2xl' : 'bg-white text-gray-800 shadow-2xl border border-gray-100 rounded-bl-none'}`}>
                      <div>{m.text}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-100/50">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mb-4">Pedigree Sources:</p>
                          <div className="space-y-4">
                            {m.sources.map((s, idx) => (
                              <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-[11px] text-gray-400 hover:text-amber-500 transition-all font-bold group">
                                <span className="w-2 h-2 rounded-full bg-amber-500/20 group-hover:bg-amber-500 transition-all"></span>
                                <span className="truncate">{s.title || s.uri}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            {isLoading && !isLive && (
              <div className="flex justify-start animate-in">
                <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-gray-100 rounded-bl-none flex space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-150"></div>
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            )}
          </div>
          
          {!isLive && (
            <div className="p-10 border-t border-gray-100 bg-white shadow-inner">
              <div className="flex space-x-6">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Inquire regarding prestige..."
                  className="flex-1 bg-zinc-50 border-none focus:ring-[12px] focus:ring-amber-500/10 rounded-[2rem] px-8 py-5 text-sm font-bold placeholder:text-gray-300 shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-16 h-16 gold-bg text-black rounded-[2rem] hover:brightness-110 disabled:opacity-30 transition-all shadow-2xl shadow-amber-500/40 active:scale-90 flex items-center justify-center flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-24 h-24 bg-black text-amber-500 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 transition-all border-2 border-amber-500/30 active:scale-95 group relative"
        >
          <div className="absolute inset-0 gold-bg rounded-[3.5rem] opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-2 -right-2 w-5 h-5 gold-bg rounded-full border-4 border-black animate-ping"></span>
          </div>
        </button>
      )}
    </div>
  );
};

export default AIShopper;
