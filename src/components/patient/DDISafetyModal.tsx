import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckSquare, Square, X, Stethoscope } from 'lucide-react';
import type { DrugInteraction } from '@shared/types/contracts';

export interface DDISafetyModalProps {
  interactions: DrugInteraction[];
  overallRisk: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
  onClose: () => void;
  onConfirmSevere: () => void;
}

export const DDISafetyModal: React.FC<DDISafetyModalProps> = ({
  interactions,
  overallRisk,
  onClose,
  onConfirmSevere
}) => {
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const hasSevere = overallRisk === 'SEVERE' || interactions.some(i => i.severity === 'SEVERE');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        border: hasSevere ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-accent)',
        boxShadow: hasSevere ? '0 0 35px rgba(244, 63, 94, 0.3)' : 'var(--shadow-glow)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: hasSevere ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: hasSevere ? '#FB7185' : '#FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Drug Safety Interaction Alert
              </h2>
              <span className={`badge ${hasSevere ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: '4px' }}>
                Overall Risk: {overallRisk}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Severe Warning Callout */}
        {hasSevere && (
          <div style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Stethoscope size={24} color="#FB7185" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FB7185', marginBottom: '4px' }}>
                  PHYSICIAN CONSULTATION REQUIRED
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0 }}>
                  A critical interaction has been detected against your active medication profile. Per clinical safety standards, this alert cannot be resolved silently.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          {interactions.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderLeft: `4px solid ${
                  item.severity === 'SEVERE'
                    ? '#F43F5E'
                    : item.severity === 'MODERATE'
                    ? '#F59E0B'
                    : '#0EA5E9'
                }`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {item.newDrugName} ⚡ {item.existingDrugName}
                </span>
                <span className={`badge ${
                  item.severity === 'SEVERE'
                    ? 'badge-danger'
                    : item.severity === 'MODERATE'
                    ? 'badge-warning'
                    : 'badge-info'
                }`}>
                  {item.severity}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {item.description}
              </p>

              <div style={{ fontSize: '0.8rem', color: '#2DD4BF', background: 'rgba(13, 148, 136, 0.1)', padding: '8px 10px', borderRadius: '6px' }}>
                <strong>Recommendation:</strong> {item.recommendation}
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory Confirmation Checkbox for Severe Risk */}
        {hasSevere ? (
          <div style={{ marginBottom: '20px' }}>
            <div
              onClick={() => setConfirmed(!confirmed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                padding: '12px',
                borderRadius: '10px',
                background: confirmed ? 'rgba(13, 148, 136, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: confirmed ? '1px solid var(--primary-teal)' : '1px solid var(--border-subtle)'
              }}
            >
              {confirmed ? (
                <CheckSquare size={20} color="#2DD4BF" />
              ) : (
                <Square size={20} color="var(--text-muted)" />
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: confirmed ? '#2DD4BF' : 'var(--text-main)' }}>
                I have consulted my prescribing doctor or pharmacist and explicitly confirm taking this combination.
              </span>
            </div>
          </div>
        ) : null}

        {/* Disclaimer */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '20px' }}>
          ℹ️ Disclaimer: PharmaPulse AI provides safety screening for logistics and risk awareness. It does not replace professional clinical diagnosis.
        </p>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel / Remove Drug
          </button>

          {hasSevere ? (
            <button
              className="btn btn-primary"
              disabled={!confirmed}
              onClick={onConfirmSevere}
              style={{
                opacity: confirmed ? 1 : 0.4,
                cursor: confirmed ? 'pointer' : 'not-allowed',
                background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)'
              }}
            >
              Confirm & Save Schedule
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onClose}
            >
              Acknowledge & Proceed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
