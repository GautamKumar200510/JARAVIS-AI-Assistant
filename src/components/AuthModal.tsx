import React, { useState } from 'react';
import { X, Mail, User as UserIcon, Sparkles, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundFX } from '../services/sound';

export const AuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, simpleLogin, demoLogin } = useAuth();

  const [displayName, setDisplayName] = useState<string>('Gautam Kumar');
  const [email, setEmail] = useState<string>('gautamkr.71019@gmail.com');
  const [callsign, setCallsign] = useState<string>('Gautam');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and valid email address.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    soundFX.playClick();

    try {
      await simpleLogin(displayName.trim(), email.trim().toLowerCase(), callsign.trim() || displayName.trim().split(' ')[0]);
      closeAuthModal();
    } catch (err: any) {
      soundFX.playError();
      setErrorMsg(err.message || 'Authentication sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickGautam = async () => {
    soundFX.playClick();
    setLoading(true);
    try {
      await simpleLogin('Gautam Kumar', 'gautamkr.71019@gmail.com', 'Gautam');
      closeAuthModal();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="jaravis-auth-modal-overlay"
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div 
        id="jaravis-auth-card"
        className="bg-[#111114] border border-[#2d2d35] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 relative overflow-hidden"
      >
        {/* Decorative Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Operative Sign In
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">
                Simple clearance with Name & Email ID
              </p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={closeAuthModal}
            className="text-gray-500 hover:text-white p-1 cursor-pointer transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Instant Sign In */}
        <button
          id="quick-gautam-login-btn"
          type="button"
          onClick={handle1ClickGautam}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-950/60 to-[#16161a] hover:from-cyan-900/60 hover:to-[#1c1c22] border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#6b4c3b] border border-white/10 flex items-center justify-center text-white text-xs font-semibold">
              G
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-cyan-300 flex items-center space-x-1.5">
                <span>Sign in as Gautam Kumar</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono">Quick Access</span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                gautamkr.71019@gmail.com
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Divider */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-gray-600">
          <div className="flex-1 h-px bg-[#1f1f23]" />
          <span>OR ENTER YOUR NAME & EMAIL</span>
          <div className="flex-1 h-px bg-[#1f1f23]" />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Simple Form: Name & Email ID only */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
              Your Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-input-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Gautam Kumar"
                className="w-full h-11 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl pl-10 pr-3.5 text-xs text-white placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
              Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. gautamkr.71019@gmail.com"
                className="w-full h-11 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl pl-10 pr-3.5 text-xs text-white placeholder-gray-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
              Assistant Callsign / Honorific (Optional)
            </label>
            <input
              id="auth-input-callsign"
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder="e.g. Gautam, Sir, Boss"
              className="w-full h-11 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-xs text-white placeholder-gray-600 outline-none font-mono"
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading || !displayName.trim() || !email.trim()}
            className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In / Enter JARAVIS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 font-mono text-center">
          Instant authentication. No complex passwords required.
        </p>
      </div>
    </div>
  );
};
