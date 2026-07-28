import React, { useState } from 'react';
import { 
  Pill, 
  Search, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Building2, 
  CheckCircle2, 
  Terminal, 
  Zap,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { 
  apiSearchPharmacies, 
  apiCreateHold, 
  apiExtractFromScan, 
  apiCheckDDI, 
  apiCreateSchedule, 
  apiLogMedication, 
  apiLogAdherence, 
  apiGetAdherenceAnalytics,
  getApiClientConfig,
  setApiClientConfig
} from './services/apiClient';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'patient' | 'portal' | 'contracts'>('patient');
  const [useMock, setUseMock] = useState<boolean>(getApiClientConfig().useMockFallback);
  
  // Console state for testing callables
  const [testOutput, setTestOutput] = useState<string>("Ready to test Epic 0 Cloud Functions contracts...\nSelect an action below to invoke a callable endpoint.");
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const toggleMock = (val: boolean) => {
    setUseMock(val);
    setApiClientConfig({ useMockFallback: val });
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setIsTesting(true);
    setTestOutput(`[Calling ${name}...]`);
    try {
      const startTime = performance.now();
      const res = await testFn();
      const elapsed = Math.round(performance.now() - startTime);
      setTestOutput(`✅ SUCCESS (${elapsed}ms) - ${name}\n\n` + JSON.stringify(res, null, 2));
    } catch (err: any) {
      setTestOutput(`❌ ERROR - ${name}\n\n` + (err?.message || String(err)));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0D9488 0%, #0EA5E9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)'
            }}>
              <Pill size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Pharma<span className="gradient-text">Pulse</span> AI
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Frontiers PAIO • Health & Medication Ecosystem
              </p>
            </div>
          </div>

          {/* Integration Status & Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`badge ${useMock ? 'badge-warning' : 'badge-success'}`}>
              <Zap size={12} />
              {useMock ? 'Local Mock Mode' : 'Firebase Emulator Connected'}
            </div>

            <button 
              onClick={() => toggleMock(!useMock)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Toggle between Firebase Callable Emulators & In-Browser Typed Mocks"
            >
              <RotateCcw size={14} />
              Mode: {useMock ? 'Mock' : 'Emulator'}
            </button>
          </div>

        </div>

        {/* Primary Route Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button 
            className={`btn ${activeTab === 'patient' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('patient')}
            style={{ borderRadius: '10px' }}
          >
            <Pill size={16} /> Patient App (WS1)
          </button>
          
          <button 
            className={`btn ${activeTab === 'portal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('portal')}
            style={{ borderRadius: '10px' }}
          >
            <Building2 size={16} /> Pharmacy Portal (WS2)
          </button>

          <button 
            className={`btn ${activeTab === 'contracts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('contracts')}
            style={{ borderRadius: '10px' }}
          >
            <Terminal size={16} /> API Contracts (Epic 0)
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'patient' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Mobile Patient Companion</h2>
                <span className="badge badge-info">Workstream 1 Ready</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Search nearby pharmacies, scan prescriptions with AI OCR, check drug safety interactions, and receive FCM push reminders.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div className="glass-card glass-card-interactive" style={{ padding: '16px' }}>
                  <Search size={20} color="#2DD4BF" style={{ marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Geo Search</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Radius stock check & interactive map integration</p>
                </div>

                <div className="glass-card glass-card-interactive" style={{ padding: '16px' }}>
                  <Sparkles size={20} color="#38BDF8" style={{ marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>AI Label OCR</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vertex AI Gemini vision entity extraction</p>
                </div>

                <div className="glass-card glass-card-interactive" style={{ padding: '16px' }}>
                  <ShieldAlert size={20} color="#FB7185" style={{ marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Safety Screening</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Drug interaction & severe alert safety guards</p>
                </div>

                <div className="glass-card glass-card-interactive" style={{ padding: '16px' }}>
                  <Clock size={20} color="#FBBF24" style={{ marginBottom: '8px' }} />
                  <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>Push Reminders</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FCM Web Push + in-app fallback banner</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portal' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pharmacy Management Portal</h2>
              <span className="badge badge-info">Workstream 2 Ready</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Role-gated pharmacy dashboard for inventory management, 60-minute stock hold processing, and operating hours updates.
            </p>
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
              <Building2 size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Pharmacy Portal Shell Initialized</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Routes gated via Firebase Auth custom claims (<code style={{ color: '#2DD4BF' }}>role: pharmacy</code>). Ready for Workstream 2 UI implementation.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Callable Buttons */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#2DD4BF" /> Shared Callables (8 Contracts)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("searchPharmacies", () => apiSearchPharmacies({ latitude: 37.7749, longitude: -122.4194, query: "Amoxicillin" }))}
                >
                  <MapPin size={16} color="#2DD4BF" /> 1. searchPharmacies (WS2)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("createHold", () => apiCreateHold({ pharmacyId: "pharm-001", inventoryId: "inv-101", quantity: 1 }))}
                >
                  <Clock size={16} color="#2DD4BF" /> 2. createHold (WS2)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("extractFromScan", () => apiExtractFromScan({ scanType: "PRESCRIPTION" }))}
                >
                  <Sparkles size={16} color="#38BDF8" /> 3. extractFromScan (WS3)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("checkDDI", () => apiCheckDDI({ newMedication: { drug_name: "Aspirin 100mg" } }))}
                >
                  <ShieldAlert size={16} color="#FB7185" /> 4. checkDDI (WS3)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("createSchedule", () => apiCreateSchedule({ medicationId: "med-101", naturalLanguageInstruction: "twice daily after meals", durationDays: 7, totalQuantity: 14 }))}
                >
                  <Clock size={16} color="#FBBF24" /> 5. createSchedule (WS4)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("logMedication", () => apiLogMedication({ medication_name: "Amoxicillin 500mg", dosage: "500 mg", frequency_per_day: 2, total_quantity: 20, start_date: new Date().toISOString() }))}
                >
                  <Pill size={16} color="#818CF8" /> 6. logMedication (WS5)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("logAdherence", () => apiLogAdherence({ medicationId: "med-101", scheduled_time: new Date().toISOString(), action: "TAKEN" }))}
                >
                  <Activity size={16} color="#818CF8" /> 7. logAdherence (WS5)
                </button>

                <button 
                  disabled={isTesting}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start' }}
                  onClick={() => runTest("getAdherenceAnalytics", () => apiGetAdherenceAnalytics({ windowDays: 30 }))}
                >
                  <Activity size={16} color="#818CF8" /> 8. getAdherenceAnalytics (WS5)
                </button>
              </div>
            </div>

            {/* Test Console Output */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={16} color="#38BDF8" /> Output Console
                </h3>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  Mode: {useMock ? 'Local Mock' : 'Emulator'}
                </span>
              </div>
              
              <pre style={{
                flex: 1,
                minHeight: '260px',
                padding: '14px',
                background: '#070A11',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#38BDF8',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {testOutput}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        PharmaPulse AI Ecosystem • Frontiers PAIO Hackathon • Google/Firebase Services Stack
      </footer>
    </div>
  );
};

export default App;
