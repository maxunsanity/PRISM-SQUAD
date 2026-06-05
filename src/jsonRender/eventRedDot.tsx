/** 이벤트·탭 레드닷 — claim/action=빨간 점, new=「N」뱃지 */
import type { CSSProperties } from 'react';
import type { RedDotCategory } from '../game/redDot/types';

export function EventRedDot({
  show,
  category,
  style,
}: {
  show?: boolean;
  category?: RedDotCategory;
  style?: CSSProperties;
}) {
  if (!show) return null;
  const isNew = category === 'new';
  if (isNew) {
    return (
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          minWidth: 14,
          height: 14,
          padding: '0 3px',
          borderRadius: 7,
          background: '#4FC3F7',
          border: '2px solid #000000',
          boxShadow: '1px 1px 0 #000000',
          pointerEvents: 'none',
          zIndex: 2,
          fontSize: 8,
          fontWeight: 900,
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          ...style,
        }}
      >
        N
      </span>
    );
  }
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        top: -3,
        right: -3,
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: category === 'action' ? '#FF9500' : '#FF3B30',
        border: '2px solid #000000',
        boxShadow: '1px 1px 0 #000000',
        pointerEvents: 'none',
        zIndex: 2,
        ...style,
      }}
    />
  );
}
