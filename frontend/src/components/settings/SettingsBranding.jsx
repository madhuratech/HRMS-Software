import React from 'react';
import { Save, RotateCcw, Palette, Image, ShieldCheck, Eye } from 'lucide-react';

const KpiCard = ({ label, value, iconBg, iconColor, icon: Icon }) => (
  <div style={{
    background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(15,23,42,.04)',
    padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 0', minWidth: 0,
  }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} />
    </div>
    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
    </div>
  </div>
);

export function SettingsBranding() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", width: '100%', boxSizing: 'border-box', background: '#F8FAFC', minHeight: '100vh', padding: 0 }}>
      
      {/* Shared Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Branding Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Customize company logos, primary colors, and PDF themes</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            <RotateCcw size={14} color="#6B7280" /> Reset Theme
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 18px', background: '#2952E3', color: '#FFF', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(41,82,227,0.25)' }}>
            <Save size={14} /> Save Branding
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20, width: '100%' }}>
        <KpiCard label="Logo Status"    value="Uploaded 2MB" iconBg="#EFF6FF" iconColor="#2563EB" icon={Image} />
        <KpiCard label="Active Theme"   value="Enterprise Blue" iconBg="#ECFDF5" iconColor="#059669" icon={Palette} />
        <KpiCard label="Favicon"        value="Active 32x32" iconBg="#EFF6FF" iconColor="#2563EB" icon={Image} />
        <KpiCard label="PDF Watermark"  value="Enabled"      iconBg="#ECFDF5" iconColor="#059669" icon={ShieldCheck} />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        
        {/* Left Options */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 24, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Brand Identity & Theme Colors</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Primary Color (#2952E3)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" defaultValue="#2952E3" style={{ width: 44, height: 38, border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                <input type="text" defaultValue="#2952E3" style={{ flex: 1, height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#111827' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Accent Success Color (#10B981)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" defaultValue="#10B981" style={{ width: 44, height: 38, border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                <input type="text" defaultValue="#10B981" style={{ flex: 1, height: 38, padding: '0 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#111827' }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Upload Company Logo</h4>
            <div style={{ border: '2px dashed #E5E7EB', borderRadius: 12, padding: 30, textAlign: 'center', background: '#FAFAFA' }}>
              <Image size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Click to upload SVG, PNG or JPG</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Maximum file size: 5MB. Recommended resolution: 400x100px</div>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <div style={{ background: '#FFF', borderRadius: 14, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={16} /> Theme Live Preview
          </h3>
          <div style={{ background: '#0F172A', borderRadius: 10, padding: 16, color: '#FFF' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', marginBottom: 10 }}>Enterprise HRMS</div>
            <div style={{ background: '#2952E3', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>Active Navigation Item</div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default SettingsBranding;
