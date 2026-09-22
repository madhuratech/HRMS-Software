import React, { useState, useEffect } from 'react';
import {
  Clock, Sparkles, ShieldCheck, Compass, AlertCircle,
  RefreshCw, ArrowUpRight, LogOut, CheckCircle2
} from 'lucide-react';
import { getDemoTimeRemainingSeconds, endDemoSession } from '../../lib/demoDummyStore';

export function DemoSessionBanner({
  companyName = 'Apex Technologies',
  customerName = 'Super Admin',
  onOpenTour,
  onCutSession,
  onUpgrade
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(getDemoTimeRemainingSeconds());

  useEffect(() => {
    const timer = setInterval(() => {
      const sec = getDemoTimeRemainingSeconds();
      setRemainingSeconds(sec);
      if (sec <= 0) {
        clearInterval(timer);
        if (onCutSession) onCutSession();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onCutSession]);

  const formatTime = (totalSec) => {
    if (totalSec <= 0) return '00:00:00';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds < 30 * 60; // < 30 minutes left

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
        borderBottom: '1px solid #334155',
        color: '#ffffff',
        padding: '5px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        zIndex: 50,
        position: 'relative',
        fontSize: '12px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      {/* Left: Customer & Company Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            padding: '2px 7px',
            borderRadius: '5px',
            fontWeight: 800,
            fontSize: '10px',
            letterSpacing: '0.4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Sparkles size={11} />
          <span>SUPER ADMIN</span>
        </div>

        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '12px' }}>
          {companyName}
        </span>
        <span style={{ color: '#64748b' }}>•</span>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
          Admin: <strong style={{ color: '#e2e8f0' }}>{customerName}</strong>
        </span>

        {/* Isolated Dummy Storage Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            padding: '1.5px 8px',
            fontSize: '10.5px',
            fontWeight: 600
          }}
        >
          <ShieldCheck size={12} />
          <span>Isolated Dummy Database • Production Safe</span>
        </div>
      </div>

      {/* Right: 3-Hour Countdown Clock & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Countdown Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: isLowTime ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.8)',
            border: `1px solid ${isLowTime ? '#ef4444' : '#475569'}`,
            borderRadius: '6px',
            padding: '3px 8px',
            color: isLowTime ? '#f87171' : '#e2e8f0'
          }}
        >
          <Clock size={13} className={isLowTime ? 'animate-pulse text-red-400' : 'text-blue-400'} />
          <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Demo Ends In:
          </span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12.5px', letterSpacing: '0.5px' }}>
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Guided Tour Launcher */}
        <button
          onClick={onOpenTour}
          style={{
            background: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Compass size={13} /> Take Tour
        </button>

        {/* Upgrade / Plan Button */}
        <button
          onClick={onUpgrade}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Upgrade to Full Plan</span>
          <ArrowUpRight size={12} />
        </button>

        {/* Exit Session */}
        <button
          onClick={onCutSession}
          title="Exit Demo Workspace"
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: 'none',
            cursor: 'pointer',
            padding: '3px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
