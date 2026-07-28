import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';

interface GeminiGlassCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  confidence?: number;
  isScanning?: boolean;
}

export const GeminiGlassCard: React.FC<GeminiGlassCardProps> = ({
  children,
  title = "Gemini Multimodal Vision AI",
  subtitle = "Real-time prescription OCR & Entity Extraction",
  confidence,
  isScanning = false
}) => {
  return (
    <div className={`relative rounded-2xl p-5 border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white/80 to-purple-50/90 backdrop-blur-md shadow-lg shadow-indigo-100/50 ${isScanning ? 'gemini-shimmer' : ''}`}>
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-300">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-indigo-950">{title}</h3>
              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Cpu className="w-2.5 h-2.5" /> Vertex AI
              </span>
            </div>
            <p className="text-xs text-indigo-700/80">{subtitle}</p>
          </div>
        </div>

        {confidence !== undefined && (
          <div className="text-right">
            <div className="font-mono text-xs font-bold text-indigo-700">
              {Math.round(confidence * 100)}% Confidence
            </div>
            <div className="text-[10px] text-slate-500">OCR Entity Match</div>
          </div>
        )}
      </div>

      {children}
    </div>
  );
};
