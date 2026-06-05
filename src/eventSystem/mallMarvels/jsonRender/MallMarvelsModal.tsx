import React from 'react';
import { useSyncExternalStore } from 'react';
import { mallMarvelsStore, type MallStepView } from '../store';

type Props = { onClaim: (stepId: number) => void };

function renderSketchReward(label: string) {
  const cleanLabel = label.trim();
  const parts = cleanLabel.split(/\s+/);
  const iconPart = parts[0];
  const textPart = parts.slice(1).join(' ');

  let icon: React.ReactNode = null;

  if (iconPart.includes('⚡')) {
    icon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
        <path d="M13,2 L3,14 L11,14 L9,22 L19,10 L11,10 Z" fill="#FFF176" stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  } else if (iconPart.includes('🪙')) {
    icon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFD700" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
        <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="6" fill="#FFF176" stroke="#000000" strokeWidth="1.5" />
      </svg>
    );
  } else if (iconPart.includes('📦')) {
    icon = (
      <svg width="18" height="18" viewBox="0 0 48 48" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
        <path d="M 8 18 L 40 18 L 38 42 L 10 42 Z" fill="#D7CCC8" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 6 12 L 42 12 L 42 18 L 6 18 Z" fill="#A1887F" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="21" y="12" width="6" height="30" fill="#FFE082" stroke="#000000" strokeWidth="1.8" />
      </svg>
    );
  } else if (iconPart.includes('🎁')) {
    icon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
        <path d="M 4 10 L 20 10 L 18 21 L 6 21 Z" fill="#FFE082" stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 2 6 L 22 6 L 22 10 L 2 10 Z" fill="#FFB300" stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
        <rect x="11" y="6" width="2" height="15" fill="#FF5252" />
        <path d="M 8 3 C 10 1, 12 6, 12 6 C 12 6, 14 1, 16 3 C 18 5, 13 6, 12 6 Z" fill="#FF5252" stroke="#000000" strokeWidth="1.5" />
      </svg>
    );
  } else if (iconPart.includes('⚔️') || iconPart.includes('장비')) {
    icon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
        <path d="M 18 3 L 21 6 L 10 17 L 7 17 L 7 14 Z" fill="#ECEFF1" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 6 18 L 3 21 C 2.5 21.5, 2.5 22.5, 3 23 C 3.5 23.5, 4.5 23.5, 5 23 L 8 20 Z" fill="#8D6E63" stroke="#000000" strokeWidth="2" />
        <line x1="5" y1="19" x2="8" y2="16" stroke="#000000" strokeWidth="2" />
      </svg>
    );
  } else {
    const emojiMatch = cleanLabel.match(/^([⚡🪙📦🎁⚔️])(.*)$/);
    if (emojiMatch) {
      return renderSketchReward(`${emojiMatch[1]} ${emojiMatch[2]}`);
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
      <span>{textPart || cleanLabel}</span>
    </div>
  );
}

function StepCard({ step, onClaim }: { step: MallStepView; onClaim: (id: number) => void }) {
  const locked = step.lock_state === 'LOCKED';
  const claimed = step.lock_state === 'CLAIMED';
  const canClaim = step.lock_state === 'AVAILABLE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: '100%', borderRadius: 10, border: '3px solid #000000',
        background: step.card_color, padding: '10px 10px 8px',
        boxShadow: '3px 3px 0 #000000', opacity: locked ? 0.55 : 1,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 36 }}>
          {step.reward_labels.map((label, i) => (
            <span key={i} style={{
              fontSize: 13, fontWeight: 900, background: '#FFFFFF',
              border: '2px solid #000000', borderRadius: 6, padding: '4px 8px',
              boxShadow: '1px 1px 0 #000000',
              display: 'inline-flex', alignItems: 'center',
            }}>
              {renderSketchReward(label)}
            </span>
          ))}
        </div>
        <button
          type="button"
          disabled={!canClaim}
          onClick={() => canClaim && onClaim(step.step_id)}
          style={{
            width: '100%', marginTop: 8, padding: '9px 0', borderRadius: 8,
            border: '2px solid #000000',
            background: claimed ? '#E8DFD1' : canClaim ? '#3DDC84' : '#cccccc',
            color: '#000000', fontWeight: 900, fontSize: 15, cursor: canClaim ? 'pointer' : 'not-allowed',
            boxShadow: canClaim ? '2px 2px 0 #000000' : 'none',
          }}
        >
          {claimed ? '수령 완료' : locked ? '🔒 잠김' : step.button_label}
        </button>
      </div>
    </div>
  );
}

export function MallMarvelsModal({ onClaim }: Props) {
  const snap = useSyncExternalStore(
    cb => mallMarvelsStore.subscribe(cb),
    () => mallMarvelsStore.getSnapshot(),
  );
  if (!snap['/mallMarvels/modalOpen']) return null;

  const steps = snap['/mallMarvels/steps'];
  const close = () => mallMarvelsStore.set('/mallMarvels/modalOpen', false);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 62, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 340, maxHeight: '88%', display: 'flex', flexDirection: 'column',
          borderRadius: 8, border: '3px solid #000000', background: '#F4EFE6', color: '#000000',
          overflow: 'hidden', boxShadow: '4px 4px 0 #000000',
        }}
      >
        <div style={{
          background: '#B388FF', padding: '12px 12px 10px', position: 'relative', flexShrink: 0,
          borderBottom: '3px solid #000000',
        }}>
          <button
            type="button"
            onClick={close}
            style={{
              position: 'absolute', right: 10, top: 10,
              width: 26, height: 26, borderRadius: 6, border: '2px solid #000000', background: '#F4EFE6',
              color: '#000000', fontWeight: 900, cursor: 'pointer', lineHeight: 1, padding: 0,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            ×
          </button>
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{snap['/mallMarvels/title']}</div>
            <div style={{ fontSize: 11, fontWeight: 900, marginTop: 4 }}>⏱ {snap['/mallMarvels/timerText']}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 12px 4px', minHeight: 0 }}>
          <div style={{
            fontSize: 11, fontWeight: 900, textAlign: 'center', marginBottom: 10,
            background: '#E8DFD1', border: '2px solid #000000', borderRadius: 8, padding: '8px 6px',
            boxShadow: '2px 2px 0 #000000',
          }}>
            {snap['/mallMarvels/introTip']}
          </div>
          {steps.map((step, i) => (
            <React.Fragment key={step.step_id}>
              <StepCard step={step} onClaim={onClaim} />
              {i < steps.length - 1 ? (
                <div style={{ fontSize: 16, lineHeight: 1, color: '#000000', fontWeight: 900, textAlign: 'center' }}>↓</div>
              ) : (
                <div style={{ height: 4 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
