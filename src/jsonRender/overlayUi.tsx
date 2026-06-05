import React from 'react';

const sketchBtnBase: React.CSSProperties = {
  border: '2.5px solid #000000',
  borderRadius: 8,
  fontWeight: 900,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  outline: 'none',
};

export function SketchCloseButton({
  onClick,
  style,
}: {
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="닫기"
      style={{
        background: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: 6,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '1.5px 1.5px 0 #000000',
        padding: 0,
        outline: 'none',
        ...style,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M 6 6 L 18 18 M 18 6 L 6 18" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function SketchPrimaryButton({
  children,
  onClick,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sketchBtnBase,
        background: '#FFD54F',
        color: '#000000',
        boxShadow: '3px 3px 0 #000000',
        padding: '10px 14px',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function SketchSecondaryButton({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...sketchBtnBase,
        background: '#FFFFFF',
        color: '#000000',
        boxShadow: '2px 2px 0 #000000',
        padding: '10px 14px',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** `meta_config.csv` `avatar_profile_limit` → hud `/meta/avatarProfileLimit` */
export function avatarProfileLimitFromHud(hud: Record<string, unknown>): number {
  return Number(hud['/meta/avatarProfileLimit'] ?? 16);
}
