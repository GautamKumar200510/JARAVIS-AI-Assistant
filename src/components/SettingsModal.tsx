import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  LogOut, 
  Play, 
  Check, 
  Sliders
} from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { useAuth } from '../context/AuthContext';
import { speechService } from '../services/speech';
import { soundFX } from '../services/sound';
import { TextFormatBar } from './TextFormatBar';

export const SettingsModal: React.FC = () => {
  const { 
    settingsOpen, 
    setSettingsOpen, 
    voiceAutoSpeak, 
    setVoiceAutoSpeak, 
    soundEffectsEnabled, 
    setSoundEffectsEnabled,
    speakText
  } = useJaravis();

  const { user, updateProfile, logout, isAuthenticated, openAuthModal } = useAuth();

  const [displayName, setDisplayName] = useState<string>(user?.displayName || 'Gautam Kumar');
  const [email, setEmail] = useState<string>(user?.email || 'gautamkr.71019@gmail.com');
  const [callsign, setCallsign] = useState<string>(user?.callsign || 'Gautam');
  const [assistantStyle, setAssistantStyle] = useState<string>(user?.assistantStyle || 'butler');
  const [pitch, setPitch] = useState<number>(user?.voiceSettings?.pitch || 1.0);
  const [rate, setRate] = useState<number>(user?.voiceSettings?.rate || 1.05);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(user?.voiceSettings?.voiceName || '');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
      setCallsign(user.callsign);
      setAssistantStyle(user.assistantStyle);
      if (user.voiceSettings) {
        setPitch(user.voiceSettings.pitch || 1.0);
        setRate(user.voiceSettings.rate || 1.05);
        setSelectedVoiceName(user.voiceSettings.voiceName || '');
      }
    }
  }, [user]);

  useEffect(() => {
    const loaded = speechService.getAvailableVoices();
    setVoices(loaded);
  }, [settingsOpen]);

  if (!settingsOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    soundFX.playClick();
    if (user) {
      await updateProfile({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        callsign: callsign.trim(),
        assistantStyle: assistantStyle as any,
        voiceSettings: {
          pitch,
          rate,
          voiceName: selectedVoiceName,
          autoSpeak: voiceAutoSpeak,
          soundEffects: soundEffectsEnabled
        }
      });
    }
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      setSettingsOpen(false);
    }, 800);
  };

  const handleTestVoice = () => {
    soundFX.playClick();
    speechService.speak(
      `All systems calibrated and ready for your command, ${callsign}. How may I assist you today?`,
      {
        pitch,
        rate,
        voiceName: selectedVoiceName
      }
    );
  };

  const callsignPresets = ['Sir', 'Boss', 'Commander', 'Doctor', 'Captain', 'Operator'];
  const stylePresets = [
    { id: 'butler', name: 'Butler / J.A.R.V.I.S.', desc: 'Polite, refined, loyal & sophisticated' },
    { id: 'technical', name: 'Technical / Engineer', desc: 'Precise, formulaic & data-oriented' },
    { id: 'concise', name: 'Concise / Tactical', desc: 'Direct, brief bullet-points only' },
    { id: 'creative', name: 'Creative / Exploratory', desc: 'Insightful, visionary & expansive' }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#111114] border border-[#2d2d35] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1f1f23] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                JARAVIS System Preferences
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Voice synthesis, operative callsign & persona tuning
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="text-gray-500 hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Section 1: User & Callsign */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Operative Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-xs md:text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-xs md:text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                  Honorific / Callsign
                </label>
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="w-full h-10 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-xs md:text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>
            </div>

            {/* Quick Callsign chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {callsignPresets.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCallsign(c)}
                  className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    callsign === c
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-[#16161a] text-gray-500 hover:text-gray-300 border border-[#1f1f23]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Assistant Personality */}
          <div className="space-y-3 pt-2 border-t border-[#1f1f23]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Assistant Personality Matrix
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stylePresets.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setAssistantStyle(st.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    assistantStyle === st.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-[#16161a] border-[#1f1f23] text-gray-400 hover:border-[#2d2d35]'
                  }`}
                >
                  <p className="text-xs font-semibold text-white mb-0.5">{st.name}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Text & Typography Formatting */}
          <div className="space-y-3 pt-2 border-t border-[#1f1f23]">
            <TextFormatBar />
          </div>

          {/* Section 4: Speech Synthesis Audio */}
          <div className="space-y-3 pt-2 border-t border-[#1f1f23]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                Speech Synthesis Voice
              </h4>
              <button
                type="button"
                onClick={handleTestVoice}
                className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Test Voice</span>
              </button>
            </div>

            {voices.length > 0 && (
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                  Browser Voice
                </label>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full h-10 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="">Default JARAVIS Recommended (British / Natural)</option>
                  {voices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Speech Rate & Pitch sliders */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                  <span>Speed / Rate</span>
                  <span>{rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono text-gray-400 mb-1">
                  <span>Voice Pitch</span>
                  <span>{pitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={pitch}
                  onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between p-2.5 bg-[#16161a] border border-[#1f1f23] rounded-xl cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-white block">Auto-Spoken Responses</span>
                  <span className="text-[10px] text-gray-500">Automatically vocalize intelligence answers aloud</span>
                </div>
                <input
                  type="checkbox"
                  checked={voiceAutoSpeak}
                  onChange={(e) => setVoiceAutoSpeak(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[#16161a] border border-[#1f1f23] rounded-xl cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-white block">Sci-Fi UI Sound Effects</span>
                  <span className="text-[10px] text-gray-500">Web Audio synthesis chimes on actions & commands</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffectsEnabled}
                  onChange={(e) => setSoundEffectsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1f1f23]">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSettingsOpen(false);
                }}
                className="flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 font-mono cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  openAuthModal('login');
                }}
                className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
              >
                Switch Account / Sign In
              </button>
            )}

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 bg-[#16161a] hover:bg-[#1f1f26] text-gray-400 hover:text-white rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
              >
                {savedStatus ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
