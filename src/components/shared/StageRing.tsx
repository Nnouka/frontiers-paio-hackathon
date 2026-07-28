import React from 'react';

export type StageStep = 1 | 2 | 3 | 4 | 5;

interface StageRingProps {
  currentStage: StageStep;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const STAGE_LABELS: Record<StageStep, { title: string; subtitle: string }> = {
  1: { title: '1. Located', subtitle: 'Real-time stock matched' },
  2: { title: '2. Reserved', subtitle: '60-minute hold active' },
  3: { title: '3. Scanned', subtitle: 'Gemini OCR extracted' },
  4: { title: '4. Verified', subtitle: 'Safety check cleared' },
  5: { title: '5. Adhering', subtitle: 'Schedule active' },
};

export const StageRing: React.FC<StageRingProps> = ({ 
  currentStage, 
  size = 'md',
  showLabels = true 
}) => {
  const sizePixels = size === 'sm' ? 44 : size === 'md' ? 64 : 88;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const radius = (sizePixels - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 5 segments with gaps
  const segmentLength = (circumference / 5) * 0.82;
  const gapLength = (circumference / 5) * 0.18;

  return (
    <div className="inline-flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="relative flex items-center justify-center" style={{ width: sizePixels, height: sizePixels }}>
        <svg className="w-full h-full transform -rotate-90">
          {Array.from({ length: 5 }).map((_, idx) => {
            const stageNum = (idx + 1) as StageStep;
            const isCompleted = stageNum <= currentStage;
            const isCurrent = stageNum === currentStage;
            const offset = -(idx * (segmentLength + gapLength));

            return (
              <circle
                key={idx}
                cx={sizePixels / 2}
                cy={sizePixels / 2}
                r={radius}
                fill="transparent"
                stroke={
                  isCurrent 
                    ? '#00685f' 
                    : isCompleted 
                      ? '#0d9488' 
                      : '#e2e8f0'
                }
                strokeWidth={isCurrent ? strokeWidth + 1.5 : strokeWidth}
                strokeDasharray={`${segmentLength} ${gapLength}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-[#00685f]">
          {currentStage}/5
        </div>
      </div>

      {showLabels && (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#00685f]">
            Closed-Loop Stage
          </span>
          <span className="font-heading font-bold text-sm text-slate-800">
            {STAGE_LABELS[currentStage].title}
          </span>
          <span className="text-xs text-slate-500">
            {STAGE_LABELS[currentStage].subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
