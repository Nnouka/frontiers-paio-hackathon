import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, AlertCircle, CheckCircle2, FileText, Pill, MapPin, Search } from 'lucide-react';
import { apiExtractFromScan, apiCheckDDI, apiSearchPharmacies } from '../../services/apiClient';
import type { ExtractedPrescriptionEntity, DrugInteraction, PharmacySearchResult } from '@shared/types/contracts';
import { DDISafetyModal } from './DDISafetyModal';

// Demo fallback coordinates (San Francisco) used when the browser Geolocation
// API is denied/unavailable, so the search flow stays demoable either way.
const DEMO_FALLBACK_COORDS = { latitude: 37.7749, longitude: -122.4194 };

function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEMO_FALLBACK_COORDS);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(DEMO_FALLBACK_COORDS),
      { timeout: 5000 }
    );
  });
}

export const CameraScanner: React.FC = () => {
  const [scanType, setScanType] = useState<'PRESCRIPTION' | 'MEDICATION_LABEL'>('PRESCRIPTION');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedPrescriptionEntity | null>(null);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [overallRisk, setOverallRisk] = useState<'NONE' | 'LOW' | 'MODERATE' | 'SEVERE'>('NONE');
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<PharmacySearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        processScan(base64, scanType);
      };
      reader.readAsDataURL(file);
    }
  };

  const processScan = async (base64Image: string, currentScanType: 'PRESCRIPTION' | 'MEDICATION_LABEL') => {
    setIsProcessing(true);
    setExtractedData(null);
    setInteractions([]);
    setSearchResults(null);

    try {
      // 1. Multimodal OCR Extraction via Gemini
      const extractRes = await apiExtractFromScan({
        imageBase64: base64Image,
        scanType: currentScanType
      });

      const extracted = extractRes.extracted;
      setExtractedData(extracted);

      if (!extracted?.drug_name) {
        return;
      }

      if (currentScanType === 'PRESCRIPTION') {
        // Phase 1 (system.md): a prescription photo is a search input, not a
        // post-purchase safety check — find nearby pharmacies with it in stock.
        setIsSearching(true);
        try {
          const { latitude, longitude } = await getCurrentPosition();
          const searchRes = await apiSearchPharmacies({
            query: extracted.drug_name,
            latitude,
            longitude,
            radiusKm: 10
          });
          setSearchResults(searchRes.pharmacies);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Phase 2 (system.md): a purchased label/receipt scan triggers the
        // drug-drug interaction safety screen against the active profile.
        const ddiRes = await apiCheckDDI({
          newMedication: {
            drug_name: extracted.drug_name,
            active_ingredient: extracted.generic_name
          }
        });

        setInteractions(ddiRes.interactions);
        setOverallRisk(ddiRes.overallRiskLevel);

        if (ddiRes.overallRiskLevel === 'SEVERE' || ddiRes.interactions.length > 0) {
          setShowSafetyModal(true);
        }
      }
    } catch (err) {
      console.error("[CameraScanner] Extraction, search, or safety screening error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerMockAspirinScan = () => {
    const mockImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    setSelectedImage(mockImage);
    // Custom trigger to demonstrate Severe DDI alert (Aspirin vs Warfarin)
    setIsProcessing(true);
    setTimeout(async () => {
      setExtractedData({
        drug_name: "Aspirin 500mg Extra Strength",
        generic_name: "Acetylsalicylic Acid",
        dosage_strength: "500 mg",
        form: "Tablet",
        dosage_instruction: "1 tablet every 6 hours as needed for severe headache",
        duration_days: 5,
        total_quantity: 20,
        warnings: [
          "Take with food or milk to prevent stomach upset",
          "Do not consume alcohol while taking aspirin"
        ],
        rawTextConfidence: 0.97
      });

      const ddiRes = await apiCheckDDI({
        newMedication: { drug_name: "Aspirin 500mg" }
      });

      setInteractions(ddiRes.interactions);
      setOverallRisk(ddiRes.overallRiskLevel);
      setShowSafetyModal(true);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Scanner Header & Mode Toggle */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="#2DD4BF" /> AI Optical Recognition & Safety Engine
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {scanType === 'PRESCRIPTION'
                ? "Scan a doctor's prescription to search nearby pharmacies for the medication (Phase 1)."
                : 'Scan a purchased pill box or label to extract dosing and screen for drug interactions (Phase 2).'}
            </p>
          </div>

          {/* Scan Type Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setScanType('PRESCRIPTION')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: scanType === 'PRESCRIPTION' ? 'var(--primary-teal)' : 'transparent',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={14} /> Doctor's Rx Slip
            </button>
            <button
              onClick={() => setScanType('MEDICATION_LABEL')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: scanType === 'MEDICATION_LABEL' ? 'var(--primary-teal)' : 'transparent',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Pill size={14} /> Pill Box / Label
            </button>
          </div>
        </div>

        {/* Capture Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-accent)',
            borderRadius: '16px',
            padding: '32px 20px',
            textAlign: 'center',
            background: 'rgba(13, 148, 136, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
          />

          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(45, 212, 191, 0.15)',
            color: '#2DD4BF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px'
          }}>
            <Upload size={28} />
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '4px' }}>
            Tap to Capture or Upload Image
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Supports JPG, PNG • Mobile camera capture enabled
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={(e) => {
                e.stopPropagation();
                processScan("", scanType);
              }}
            >
              <Sparkles size={14} color="#38BDF8" /> Run Sample OCR
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#FB7185' }}
              onClick={(e) => {
                e.stopPropagation();
                triggerMockAspirinScan();
              }}
            >
              <AlertCircle size={14} /> Test Severe DDI Alert
            </button>
          </div>
        </div>
      </div>

      {/* Processing Loader */}
      {isProcessing && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
            <Sparkles size={32} color="#2DD4BF" />
          </div>
          <h3 style={{ fontSize: '1rem', marginTop: '12px', fontWeight: 600 }}>
            Analyzing Image with Gemini...
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {scanType === 'PRESCRIPTION'
              ? 'Extracting medication name & searching nearby pharmacy stock'
              : 'Extracting chemical entities & screening against active patient medications'}
          </p>
        </div>
      )}

      {/* Extracted Entities Output */}
      {extractedData && !isProcessing && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="#2DD4BF" /> Extracted Medication Profile
            </h3>
            {extractedData.rawTextConfidence && (
              <span className="badge badge-success">
                {Math.round(extractedData.rawTextConfidence * 100)}% Confidence
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Medication Name</span>
              <strong style={{ fontSize: '1.05rem', color: '#2DD4BF' }}>{extractedData.drug_name}</strong>
              {extractedData.generic_name && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  ({extractedData.generic_name})
                </span>
              )}
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Dosage & Form</span>
              <strong style={{ fontSize: '1rem' }}>{extractedData.dosage_strength} • {extractedData.form}</strong>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Instruction</span>
              <strong style={{ fontSize: '0.95rem' }}>{extractedData.dosage_instruction}</strong>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Duration & Quantity</span>
              <strong style={{ fontSize: '0.95rem' }}>{extractedData.duration_days} Days ({extractedData.total_quantity} Total)</strong>
            </div>
          </div>

          {/* Warnings List */}
          {extractedData.warnings && extractedData.warnings.length > 0 && (
            <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#FBBF24', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> Safety Warnings Extracted
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {extractedData.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Trigger DDI View Modal */}
          {interactions.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <button
                className={`btn ${overallRisk === 'SEVERE' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  width: '100%',
                  background: overallRisk === 'SEVERE' ? 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)' : undefined
                }}
                onClick={() => setShowSafetyModal(true)}
              >
                <AlertCircle size={18} /> View Drug Safety Screening ({interactions.length} Alert{interactions.length > 1 ? 's' : ''})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Prescription -> Search Results (Phase 1) */}
      {scanType === 'PRESCRIPTION' && !isProcessing && (isSearching || searchResults !== null) && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Search size={20} color="#2DD4BF" /> Nearby Pharmacy Stock
          </h3>

          {isSearching && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching nearby pharmacies...</p>
          )}

          {!isSearching && searchResults && searchResults.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No nearby pharmacies have this medication in stock right now.
            </p>
          )}

          {!isSearching && searchResults && searchResults.length > 0 && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {searchResults.map((pharmacy) => (
                <div key={pharmacy.id} style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
                      <MapPin size={16} color="#2DD4BF" /> {pharmacy.name}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{pharmacy.address} • {pharmacy.distanceKm} km away</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {pharmacy.matchingInventory.map((item) => (
                      <div key={item.id} style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                        <span className={`badge ${item.stock_status === 'IN_STOCK' ? 'badge-success' : item.stock_status === 'LOW_STOCK' ? 'badge-warning' : 'badge-danger'}`}>
                          {item.stock_status.replace('_', ' ')}
                        </span>
                        <strong style={{ marginLeft: '8px' }}>${item.unit_price.toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DDI Safety Screening Modal */}
      {showSafetyModal && (
        <DDISafetyModal
          interactions={interactions}
          overallRisk={overallRisk}
          onClose={() => setShowSafetyModal(false)}
          onConfirmSevere={() => {
            setShowSafetyModal(false);
            alert("✅ Severe interaction acknowledged and physician consultation confirmed. Medication added to schedule.");
          }}
        />
      )}
    </div>
  );
};
