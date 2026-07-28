import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scan, 
  Sparkles, 
  Camera, 
  Upload, 
  CheckCircle2, 
  ShieldAlert, 
  Cpu,
  ArrowRight
} from 'lucide-react';
import { GeminiGlassCard } from '../../../components/shared/GeminiGlassCard';

export const ScanCapture: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSample, setSelectedSample] = useState<'severe' | 'standard'>('severe');

  const handleStartScan = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/patient/scan/review?sample=${selectedSample}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Multimodal Vision AI Scanner</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 mt-1">
          Scan Purchased Prescription Label
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Capture a photo of your pill bottle label or receipt. Gemini AI will extract structured drug entity data and verify safety against your existing regimen.
        </p>
      </div>

      {/* Camera Finder Viewfinder Box */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-indigo-500/40 p-8 flex flex-col items-center justify-center text-center text-white min-h-[320px] shadow-2xl">
        {/* Shimmer loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md flex flex-col items-center justify-center z-20 space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-400 border-t-transparent animate-spin" />
            <span className="font-mono text-sm font-bold text-indigo-200 animate-pulse">
              Gemini Vision AI Extracting Entities & Checking DDI...
            </span>
          </div>
        )}

        {/* Viewfinder Target Framing Corner Lines */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-400" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-400" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-400" />

        <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-indigo-300" />
        </div>

        <h3 className="font-heading font-bold text-lg">Align Prescription Label within Frame</h3>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          Ensure drug name, dosage (e.g. 500mg), and daily instructions are clearly visible under good lighting.
        </p>

        {/* Sample selector for demo testing */}
        <div className="mt-6 flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2">Demo Preset:</span>
          <button
            onClick={() => setSelectedSample('severe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSample === 'severe' 
                ? 'bg-rose-600 text-white font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Severe DDI (Amoxicillin + Warfarin)
          </button>
          <button
            onClick={() => setSelectedSample('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSample === 'standard' 
                ? 'bg-emerald-600 text-white font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Standard Safe (Atorvastatin 20mg)
          </button>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleStartScan}
        disabled={isProcessing}
        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-heading font-bold text-base rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        <span>Scan Label with Gemini Multimodal AI</span>
      </button>
    </div>
  );
};
