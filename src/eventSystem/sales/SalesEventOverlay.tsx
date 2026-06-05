import { useSyncExternalStore } from 'react';
import { hudStore } from '../../game/hudExternalStore';
import {
  eventSideTabShellStyleLeft,
  eventSideTabStackTopPx,
  isBattleLobbyHud,
} from '../tycoonSeason/jsonRender/eventHudLayout';
import { mallMarvelsStore } from '../mallMarvels/store';
import { MallMarvelsModal } from '../mallMarvels/jsonRender/MallMarvelsModal';
import { driversJoyStore } from '../driversJoy/store';
import { DriversJoyModal } from '../driversJoy/jsonRender/DriversJoyModal';
import { getDriversJoyController, getMallMarvelsController } from './salesRuntime';
import { EventRedDot } from '../../jsonRender/eventRedDot';
import { pickScopeRedDot } from '../../game/redDot/redDotUi';

/** 왼쪽 스택 — 쇼핑몰·드라이버만 (라바/퍼즐·시즌 탭과 분리) */
function salesLeftTabStackIndex(
  tab: 'mall' | 'drivers',
  opts: { showMall: boolean; showDrivers: boolean },
): number {
  let idx = 0;
  if (tab === 'mall') return idx;
  if (opts.showMall) idx += 1;
  return idx;
}

function ShoppingBagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* 쇼핑백 몸체 */}
      <path d="M 6 8 L 18 8 L 16 20 L 8 20 Z" fill="#FF8A80" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
      {/* 손잡이 */}
      <path d="M 10 8 C 10 5, 14 5, 14 8" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function MiniCarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      {/* 차체 */}
      <path d="M 3 14 Q 3 11 6 11 L 8 8 Q 9 6 11 6 L 15 6 Q 17 6 18 8 L 20 11 Q 22 11 22 14 L 22 16 C 22 17, 20 17, 20 17 L 4 17 C 4 17, 3 17, 3 14 Z" fill="#FF5252" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
      {/* 유리창 */}
      <path d="M 9 11 L 10 8 L 13 8 L 13 11 Z" fill="#E0F7FA" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 14 11 L 14 8 L 16 8 L 17 11 Z" fill="#E0F7FA" stroke="#000000" strokeWidth="1.8" strokeLinejoin="round" />
      {/* 바퀴 */}
      <circle cx="7" cy="17" r="3" fill="#90A4AE" stroke="#000000" strokeWidth="2" />
      <circle cx="7" cy="17" r="1" fill="#FFFFFF" />
      <circle cx="17" cy="17" r="3" fill="#90A4AE" stroke="#000000" strokeWidth="2" />
      <circle cx="17" cy="17" r="1" fill="#FFFFFF" />
    </svg>
  );
}

function SalesSideTab({
  emoji,
  icon,
  label,
  badge,
  dotCategory,
  top,
  bg,
  onClick,
}: {
  emoji?: string;
  icon?: React.ReactNode;
  label: string;
  badge: string;
  dotCategory?: ReturnType<typeof pickScopeRedDot>;
  top: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: 0,
        top,
        ...eventSideTabShellStyleLeft({
          transition: 'transform 0.2s ease-in-out, top 0.2s ease-in-out',
          zIndex: 48,
        }),
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid #000000', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '1.5px 1.5px 0 #000000', fontSize: 24,
        }}>
          {icon ? icon : emoji}
        </div>
        <EventRedDot
          show={dotCategory != null}
          category={dotCategory ?? undefined}
          style={{ top: -2, left: -2, right: 'auto' }}
        />
      </div>
      <div style={{
        marginTop: 6, fontSize: 9, fontWeight: 900, color: '#000000', lineHeight: 1.1,
        textAlign: 'center', whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{
        marginTop: 5, fontSize: 9, fontWeight: 900,
        background: '#FFFFFF', border: '2px solid #000000',
        borderRadius: 6, padding: '2px 4px', color: '#000000',
        display: 'inline-block', boxShadow: '1px 1px 0 #000000',
        minWidth: 32, textAlign: 'center', whiteSpace: 'nowrap',
      }}>
        {badge}
      </div>
    </div>
  );
}

export function SalesEventOverlay() {
  const hud = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
  const mallSnap = useSyncExternalStore(
    cb => mallMarvelsStore.subscribe(cb),
    () => mallMarvelsStore.getSnapshot(),
  );
  const djSnap = useSyncExternalStore(
    cb => driversJoyStore.subscribe(cb),
    () => driversJoyStore.getSnapshot(),
  );

  const showMall = Boolean(hud['/lobby/showMallMarvels']);
  const showDrivers = Boolean(hud['/lobby/showDriversJoy']);
  const battleLobby = isBattleLobbyHud(hud);
  const mallCtrl = getMallMarvelsController();
  const djCtrl = getDriversJoyController();

  if (!battleLobby || (!showMall && !showDrivers)) {
    return (
      <>
        <MallMarvelsModal onClaim={id => mallCtrl?.claimStep(id)} />
        <DriversJoyModal onPurchase={() => djCtrl?.purchase()} />
      </>
    );
  }

  const leftStackOpts = { showMall, showDrivers };

  const topFor = (tab: 'mall' | 'drivers') =>
    `${eventSideTabStackTopPx(battleLobby, salesLeftTabStackIndex(tab, leftStackOpts))}px`;

  const mallTimer = mallSnap['/mallMarvels/timerText'];
  const djTimer = djSnap['/driversJoy/timerText'];
  const mallDotCategory = pickScopeRedDot(hud, 'mall');
  const driversDotCategory = pickScopeRedDot(hud, 'drivers');

  return (
    <>
      {showMall && (
        <SalesSideTab
          icon={<ShoppingBagIcon />}
          label="쇼핑몰"
          badge={mallTimer || '—'}
          dotCategory={mallDotCategory}
          top={topFor('mall')}
          bg="#FFB6C1"
          onClick={() => mallCtrl?.openModal()}
        />
      )}
      {showDrivers && djCtrl?.canShowTab() !== false && (
        <SalesSideTab
          icon={<MiniCarIcon />}
          label="드라이버"
          badge={djTimer || '—'}
          dotCategory={driversDotCategory}
          top={topFor('drivers')}
          bg="#3DDC84"
          onClick={() => djCtrl?.openModal()}
        />
      )}
      <MallMarvelsModal onClaim={id => mallCtrl?.claimStep(id)} />
      <DriversJoyModal onPurchase={() => djCtrl?.purchase()} />
    </>
  );
}
