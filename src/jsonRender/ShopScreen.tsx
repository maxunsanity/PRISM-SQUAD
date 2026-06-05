/**
 * ShopScreen.tsx — 하단 탭 「상점」 (CSV 데이터 → hudStore)
 * 2D 스케치 스타일: 베이지 배경 + 검정 실선 + 플랫 섀도우
 */
import React from 'react';
import { hudStore, type ShopBoxHud, type ShopGemPackHud, type ShopGoldPackHud } from '../game/hudExternalStore';
import { fmtKrw } from '../game/shopUtils';
import { NavTabBar } from './NavTabBar';
import { renderEquipIcon } from './equipUi';

function useHud() {
  return React.useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
}

function resolveValue(prop: unknown, hud: ReturnType<typeof hudStore.getSnapshot>): unknown {
  if (prop && typeof prop === 'object' && '$state' in (prop as object)) {
    return hud[(prop as { $state: keyof ReturnType<typeof hudStore.getSnapshot> }).$state];
  }
  return prop;
}

const fmtGold = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

/* 자원 캡슐용 2D 스케치 SVG 아이콘 렌더러 */
function getResourceSketchIcon(type: string, size = 16) {
  const strokeColor = '#000000';
  const normalized = type.trim();
  if (normalized.includes('💳') || normalized === 'card' || normalized === 'cash') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        {/* 신용카드 */}
        <rect x="3" y="6" width="18" height="12" rx="2" fill="#ECEFF1" stroke={strokeColor} strokeWidth="2.2" />
        <line x1="3" y1="10" x2="21" y2="10" stroke={strokeColor} strokeWidth="2.2" />
        <rect x="6" y="13" width="4" height="2" fill={strokeColor} />
      </svg>
    );
  }
  if (normalized.includes('⚡') || normalized === 'energy') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M13,2 L3,14 L11,14 L9,22 L19,10 L11,10 Z" fill="#FFF176" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (normalized.includes('💎') || normalized === 'gem' || normalized === 'gems' || normalized === 'dna') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <polygon points="12,2 18,8 18,16 12,22 6,16 6,8" fill="#7BE8F4" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round"/>
        <polygon points="12,5 16,9 16,15 12,19 8,15 8,9" fill="#ffffff" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (normalized.includes('🪙') || normalized === 'gold' || normalized === 'metaGold') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="12" cy="12" r="9" fill="#FFD700" stroke={strokeColor} strokeWidth="2.2" />
        <circle cx="12" cy="12" r="6" fill="#FFF176" stroke={strokeColor} strokeWidth="1.5" />
      </svg>
    );
  }
  if (normalized.includes('🔑') || normalized === 'key') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M7 10 C7 8.3 8.3 7 10 7 C 11.7 7 13 8.3 13 10 C 13 11 12.5 12 11.7 12.5 L 15 16 L 15 18 L 13 18 L 13 16 L 11.5 14.5 L 10 13 C 8.3 13 7 11.7 7 10 Z" fill="#FFE082" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="1.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1.2" />
      </svg>
    );
  }
  return null;
}

/* 자원 캡슐 */
function CurPill({ label, val, bg }: { label: string; val: string; bg?: string }) {
  const icon = getResourceSketchIcon(label, 15);
  const emojiFallback: Record<string, string> = {
    card: '💳',
    energy: '⚡',
    gem: '💎',
    gold: '🪙',
    key: '🔑'
  };
  const fallbackText = emojiFallback[label] ?? label;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      background: bg ?? '#ffffff',
      border: '2px solid #000000',
      borderRadius: 20, padding: '4px 10px',
      boxShadow: '1.5px 1.5px 0 #000000',
      minWidth: 0,
    }}>
      {icon ? icon : <span style={{ fontWeight: 900, fontSize: 11, color: '#000000', whiteSpace: 'nowrap' }}>{fallbackText}</span>}
      <span style={{ fontWeight: 900, fontSize: 12, color: '#000000', whiteSpace: 'nowrap' }}>{val}</span>
    </div>
  );
}

/* 섹션 헤더 배너 */
function SectionBanner({ title }: { title: string }) {
  return (
    <div style={{
      margin: '12px 10px 8px', padding: '7px 14px', borderRadius: 8,
      background: '#FFB347',
      border: '2.5px solid #000000',
      color: '#000000', fontWeight: 900, fontSize: 14, textAlign: 'center',
      boxShadow: '2.5px 2.5px 0 #000000',
    }}>{title}</div>
  );
}

/* 2D 스케치 스타일 상자 아이콘 렌더러 */
function BoxIcon({ isDefense }: { isDefense: boolean }) {
  if (isDefense) {
    return (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ display: 'block', margin: '0 auto' }}>
        {/* 상자 본체 */}
        <path d="M 8 18 L 40 18 L 38 42 L 10 42 Z" fill="#EF5350" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
        {/* 상자 뚜껑 */}
        <path d="M 6 12 L 42 12 L 42 18 L 6 18 Z" fill="#C62828" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
        {/* 노란색 리본 벨트 */}
        <rect x="21" y="12" width="6" height="30" fill="#FFCA28" stroke="#000000" strokeWidth="2.5" />
        {/* 귀여운 리본 매듭 */}
        <path d="M 16 6 C 18 1, 24 12, 24 12 C 24 12, 30 1, 32 6 C 34 11, 25 13, 24 12 C 23 13, 14 11, 16 6 Z" fill="#FFB300" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        {/* 중앙 별 데칼 */}
        <polygon points="24,22 26,26 30,26 27,29 28,33 24,31 20,33 21,29 18,26 22,26" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ display: 'block', margin: '0 auto' }}>
      {/* 상자 본체 */}
      <path d="M 8 18 L 40 18 L 38 42 L 10 42 Z" fill="#D7CCC8" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
      {/* 상자 뚜껑 */}
      <path d="M 6 12 L 42 12 L 42 18 L 6 18 Z" fill="#A1887F" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
      {/* 가운데 가로 세로 테이프 */}
      <rect x="21" y="12" width="6" height="30" fill="#FFE082" stroke="#000000" strokeWidth="2" />
      {/* 상자 주름 테두리 디테일 */}
      <line x1="14" y1="24" x2="14" y2="36" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="24" x2="34" y2="36" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* 상자 카드 */
function BoxCard({
  box,
  defensePity,
  supplyKeys,
  onOpen,
}: {
  box: ShopBoxHud;
  defensePity: number;
  supplyKeys: number;
  onOpen: (id: string) => void;
}) {
  const isDefense = box.box_id === 'defense';
  const canOpen = isDefense ? supplyKeys > 0 : true;
  return (
    <div style={{
      flex: 1,
      background: '#ffffff',
      border: '2.5px solid #000000',
      borderRadius: 10,
      padding: 10,
      boxShadow: '3px 3px 0 #000000',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BoxIcon isDefense={isDefense} />
      </div>
      <div style={{ color: '#000000', fontWeight: 900, fontSize: 12, textAlign: 'center' }}>{box.label}</div>
      <div style={{ color: '#555555', fontSize: 9, textAlign: 'center' }}>
        {isDefense && box.pity_max > 0
          ? `${box.subtitle} (${defensePity}/${box.pity_max})`
          : box.subtitle}
      </div>
      <button
        type="button"
        onClick={() => onOpen(box.box_id)}
        style={{
          width: '100%', padding: 8,
          border: '2px solid #000000', borderRadius: 6,
          background: canOpen ? '#FFB347' : '#E8DFD1',
          color: '#000000',
          fontWeight: 900, fontSize: 11, cursor: canOpen ? 'pointer' : 'not-allowed',
          boxShadow: canOpen ? '2px 2px 0 #000000' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        {isDefense && supplyKeys > 0 ? (
          <>
            {getResourceSketchIcon('🔑', 14)}
            <span>{supplyKeys}/1 · 열기</span>
          </>
        ) : (
          <>
            {getResourceSketchIcon('💎', 14)}
            <span>{box.gem_cost} · 열기</span>
          </>
        )}
      </button>
    </div>
  );
}

/* 보석팩 카드 */
function GemCard({ pack, canBuy, isFirst, onBuy }: {
  pack: ShopGemPackHud;
  canBuy: boolean;
  isFirst: boolean;
  onBuy: () => void;
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '2.5px solid #000000',
      borderRadius: 10,
      padding: 10,
      boxShadow: '3px 3px 0 #000000',
      position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {isFirst && (
        <div style={{
          position: 'absolute', top: 5, left: 5,
          background: '#FF4455', color: '#ffffff',
          fontSize: 8, fontWeight: 900, padding: '2px 5px', borderRadius: 4,
          border: '1.5px solid #000000',
        }}>첫구매 +{pack.bonus_gems}</div>
      )}
      <div style={{ textAlign: 'center', fontSize: 24, marginTop: isFirst ? 14 : 4 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 18,8 18,16 12,22 6,16 6,8" fill="#7BE8F4" stroke="#000000" strokeWidth="2" strokeLinejoin="round"/>
          <polygon points="12,5 16,9 16,15 12,19 8,15 8,9" fill="#ffffff" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ color: '#000000', fontWeight: 900, fontSize: 18, textAlign: 'center' }}>
        {isFirst ? pack.gems + pack.bonus_gems : pack.gems}
      </div>
      <div style={{ color: '#555555', fontSize: 9, textAlign: 'center', marginBottom: 4 }}>{pack.label}</div>
      <button
        type="button"
        disabled={!canBuy}
        onClick={onBuy}
        style={{
          width: '100%', padding: '7px 4px',
          border: '2px solid #000000', borderRadius: 6,
          background: canBuy ? '#3DDC84' : '#E8DFD1',
          color: '#000000', fontWeight: 900, fontSize: 11,
          cursor: canBuy ? 'pointer' : 'not-allowed',
          boxShadow: canBuy ? '2px 2px 0 #000000' : 'none',
        }}
      >{fmtKrw(pack.price_krw)}</button>
    </div>
  );
}

/* 골드팩 카드 */
function GoldCard({ pack, canBuy, onBuy }: {
  pack: ShopGoldPackHud;
  canBuy: boolean;
  onBuy: () => void;
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '2.5px solid #000000',
      borderRadius: 10,
      padding: 10,
      boxShadow: '3px 3px 0 #000000',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFD700">
          <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" fill="#FFF176" stroke="#000000" strokeWidth="1.5" />
        </svg>
      </div>
      <div style={{ color: '#000000', fontWeight: 900, fontSize: 15, textAlign: 'center' }}>
        {pack.gold.toLocaleString()}
      </div>
      <div style={{ color: '#555555', fontSize: 9, textAlign: 'center', marginBottom: 4 }}>{pack.label}</div>
      <button
        type="button"
        disabled={!canBuy}
        onClick={onBuy}
        style={{
          width: '100%', padding: '7px 4px',
          border: '2px solid #000000', borderRadius: 6,
          background: canBuy ? (pack.is_free ? '#FFB347' : '#3DDC84') : '#E8DFD1',
          color: '#000000', fontWeight: 900, fontSize: 11,
          cursor: canBuy ? 'pointer' : 'not-allowed',
          boxShadow: canBuy ? '2px 2px 0 #000000' : 'none',
        }}
      >{pack.is_free ? '무료' : pack.sublabel}</button>
    </div>
  );
}

export function ShopScreenImpl({
  cashKrw: cashProp,
  gems: gemsProp,
  metaGold: goldProp,
  energy: energyProp,
  supplyKeys: keysProp,
  defensePity: pityProp,
  purchasedGemIds: purchasedProp,
  gemPacks: gemPacksProp,
  goldPacks: goldPacksProp,
  boxes: boxesProp,
  maxEnergy: maxEnergyProp,
  showResetButton: showResetProp,
  testCashKrw: testCashProp,
}: {
  cashKrw: unknown;
  gems: unknown;
  metaGold: unknown;
  energy: unknown;
  supplyKeys: unknown;
  defensePity: unknown;
  purchasedGemIds: unknown;
  gemPacks: unknown;
  goldPacks: unknown;
  boxes: unknown;
  maxEnergy: unknown;
  showResetButton: unknown;
  testCashKrw: unknown;
}) {
  const hud = useHud();
  if (!hud['/shop/visible']) return null;

  const cashKrw = Number(resolveValue(cashProp, hud) ?? 0);
  const gems = Number(resolveValue(gemsProp, hud) ?? 0);
  const metaGold = Number(resolveValue(goldProp, hud) ?? 0);
  const energy = Number(resolveValue(energyProp, hud) ?? 0);
  const maxEnergy = Number(resolveValue(maxEnergyProp, hud) ?? 60);
  const supplyKeys = Number(resolveValue(keysProp, hud) ?? 0);
  const defensePity = Number(resolveValue(pityProp, hud) ?? 0);
  const showReset = Boolean(resolveValue(showResetProp, hud));
  const testCashKrw = Number(resolveValue(testCashProp, hud) ?? 1_000_000);
  const gemPacks = (resolveValue(gemPacksProp, hud) as ShopGemPackHud[]) ?? [];
  const goldPacks = (resolveValue(goldPacksProp, hud) as ShopGoldPackHud[]) ?? [];
  const boxes = (resolveValue(boxesProp, hud) as ShopBoxHud[]) ?? [];
  const purchasedIds = new Set(
    (resolveValue(purchasedProp, hud) as string[] | undefined) ?? [],
  );

  const defenseBox = boxes.find(b => b.box_id === 'defense');

  const buyGem = (id: string) => window.dispatchEvent(new CustomEvent('shop:buyGem', { detail: id }));
  const buyGold = (id: string) => window.dispatchEvent(new CustomEvent('shop:buyGold', { detail: id }));
  const openBox = (id: string) => window.dispatchEvent(new CustomEvent('shop:openBox', { detail: id }));
  const resetCash = () => window.dispatchEvent(new CustomEvent('shop:resetCash'));
  const close = () => window.dispatchEvent(new CustomEvent('shop:close'));

  return (
    <div style={{
      position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 47,
      display: 'flex', flexDirection: 'column',
      background: '#F4EFE6',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '10px 12px 8px',
        background: '#EDE5D8',
        borderBottom: '3px solid #000000',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={close} style={{ background: 'transparent', border: 'none', color: '#000000', fontSize: 20, cursor: 'pointer', fontWeight: 900, padding: 0, display: 'flex', alignItems: 'center', marginRight: 4 }}>←</button>
            {/* 상점 아이콘 SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="13" rx="2" fill="#FFB347" stroke="#000000" strokeWidth="2" />
              <path d="M5 7V5C5 3.9 5.9 3 7 3h10c1.1 0 2 .9 2 2v2" stroke="#000000" strokeWidth="2" />
              <rect x="9" y="12" width="6" height="5" rx="1" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
            </svg>
            <span style={{ color: '#000000', fontWeight: 900, fontSize: 16 }}>상점</span>
          </div>
          {showReset && (
            <button type="button" onClick={resetCash} style={{
              fontSize: 9, fontWeight: 700, padding: '4px 8px', borderRadius: 6,
              background: '#ffffff', border: '2px solid #000000',
              color: '#000000', cursor: 'pointer', boxShadow: '1.5px 1.5px 0 #000000',
            }}>캐시 {fmtKrw(testCashKrw)} 리셋</button>
          )}
        </div>
        {/* 자원 캡슐들 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          <CurPill label="card" val={fmtKrw(cashKrw)} />
          <CurPill label="energy" val={`${energy}/${maxEnergy}`} bg="#FFF9C4" />
          <CurPill label="gem" val={String(gems)} bg="#E0F7FA" />
          <CurPill label="gold" val={fmtGold(metaGold)} bg="#FFF8E1" />
        </div>
        <div style={{ marginTop: 6, fontSize: 10, color: '#888888', fontWeight: 700 }}>
          구매 테스트 · 캐시 DB 잔액으로 보석 결제 시뮬레이션
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {/* 배너 (선택적) */}
        {defenseBox?.banner_title && (
          <div style={{
            margin: '10px 10px 0', padding: 12, borderRadius: 10,
            background: '#ffffff',
            border: '2.5px solid #000000',
            boxShadow: '3px 3px 0 #000000',
          }}>
            <div style={{ color: '#000000', fontSize: 12, fontWeight: 900, textAlign: 'center' }}>
              {defenseBox.banner_title}
            </div>
            {defenseBox.banner_desc && (
              <div style={{ color: '#555555', fontSize: 12, textAlign: 'center', margin: '6px 0', lineHeight: 1.4 }}>
                {defenseBox.banner_desc}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>
              <div style={{
                background: '#ffffff',
                border: '2px solid #000000',
                borderRadius: 8,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '1.5px 1.5px 0 #000000',
              }}>
                {renderEquipIcon('armor', 'EPIC', 32)}
              </div>
              <div style={{
                background: '#ffffff',
                border: '2px solid #000000',
                borderRadius: 8,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '1.5px 1.5px 0 #000000',
              }}>
                {renderEquipIcon('weapon', 'EPIC', 32)}
              </div>
            </div>
          </div>
        )}

        {/* 지원품 상자 */}
        <SectionBanner title="지원품 상자" />
        <div style={{ display: 'flex', gap: 8, padding: '0 10px', marginBottom: 4 }}>
          {boxes.map(b => (
            <BoxCard
              key={b.box_id}
              box={b}
              defensePity={defensePity}
              supplyKeys={supplyKeys}
              onOpen={openBox}
            />
          ))}
        </div>

        {/* 보석 */}
        <SectionBanner title="보석" />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 10px',
        }}>
          {gemPacks.map(p => (
            <GemCard
              key={p.pack_id}
              pack={p}
              canBuy={cashKrw >= p.price_krw}
              isFirst={!purchasedIds.has(p.pack_id)}
              onBuy={() => buyGem(p.pack_id)}
            />
          ))}
        </div>

        {/* 골드 */}
        <SectionBanner title="골드" />
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 10px 12px',
        }}>
          {goldPacks.map(p => (
            <GoldCard
              key={p.pack_id}
              pack={p}
              canBuy={p.is_free || gems >= p.gem_cost}
              onBuy={() => buyGold(p.pack_id)}
            />
          ))}
        </div>
      </div>

      <NavTabBar active="shop" />
    </div>
  );
}
