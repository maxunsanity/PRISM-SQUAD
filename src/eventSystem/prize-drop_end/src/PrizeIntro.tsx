/**
 * 퍼즐 드롭 입장/미션 인트로 — 게임 자체 화면(퍼즐 폴더 소유).
 *  - 로드 시 먼저 표시: 보유 퍼즐볼 + (호스트가 보낸) 획득 미션 안내.
 *  - [입장] → 인트로 닫고 보드 플레이.
 *  - 호스트는 balance/missionLines 데이터만 제공 → 이 화면은 어느 호스트에서도 동일 동작.
 */
import { useEffect, useReducer } from 'react';
import { hudStore } from './game/hudExternalStore';

type MissionLine = { title: string; detail: string };

const CURRENCY_NAME = '퍼즐볼';

export function PrizeIntro() {
  const [, force] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    // 첫 렌더~구독 사이에 도착한 walletSync(race)를 놓치지 않도록 구독 직후 1회 동기화
    force();
    return hudStore.subscribe(force);
  }, []);

  // 스토어는 JSON-pointer(중첩) 접근 — get(path)로 읽음. 초기 평면 기본값은 undefined로 보이므로
  // intro_visible 은 "명시적 false 일 때만 숨김"(undefined=최초 진입=표시)
  const visible = hudStore.get('/hud/intro_visible') !== false;
  if (!visible) return null;

  const balls = Number(hudStore.get('/hud/ball_count') ?? 0);
  const lines = (hudStore.get('/hud/mission_lines') as MissionLine[]) ?? [];
  const enter = () => hudStore.update({ '/hud/intro_visible': false });

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: 'rgba(20,18,14,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 18,
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 320,
        background: '#F4EFE6',
        border: '3px solid #1a1a1a',
        borderRadius: 14,
        boxShadow: '4px 4px 0 #1a1a1a',
        padding: '22px 20px 20px',
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 30, lineHeight: 1 }}>🎰</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1a1a1a', marginTop: 6 }}>퍼즐 드롭</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B6256', marginTop: 4 }}>
            {CURRENCY_NAME}을 떨어뜨려 보상을 노리세요
          </div>
        </div>

        {/* 획득 미션 (호스트 제공 데이터 — 없으면 제네릭) */}
        <div style={{
          background: '#FFFFFF', border: '2px solid #1a1a1a', borderRadius: 10,
          padding: '10px 12px', marginBottom: 12,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#1a1a1a', marginBottom: 6 }}>📋 {CURRENCY_NAME} 모으는 법</div>
          {lines.length > 0 ? lines.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 12, fontWeight: 700, color: '#1a1a1a', padding: '3px 0',
            }}>
              <span>{r.title}</span>
              <span style={{ fontWeight: 900 }}>→ {CURRENCY_NAME} {r.detail}</span>
            </div>
          )) : (
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>
              호스트 게임을 플레이해 {CURRENCY_NAME}을 모으세요
            </div>
          )}
        </div>

        {/* 보유량 */}
        <div style={{
          background: '#FFFFFF', border: '2px solid #1a1a1a', borderRadius: 10,
          padding: '10px 12px', marginBottom: 16, textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6256' }}>보유 {CURRENCY_NAME}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a' }}>
            {balls}<span style={{ fontSize: 13 }}> 개</span>
          </div>
        </div>

        {/* 입장 */}
        <button
          type="button"
          onClick={enter}
          disabled={balls <= 0}
          style={{
            width: '100%', border: '2.5px solid #1a1a1a', borderRadius: 8,
            background: '#FFD54F', color: '#1a1a1a',
            fontWeight: 900, fontSize: 15, padding: '12px 14px',
            boxShadow: '3px 3px 0 #1a1a1a', cursor: balls <= 0 ? 'default' : 'pointer',
            opacity: balls <= 0 ? 0.5 : 1, outline: 'none',
          }}
        >
          {balls > 0 ? '입장하기' : `${CURRENCY_NAME}이 없습니다`}
        </button>
      </div>
    </div>
  );
}
