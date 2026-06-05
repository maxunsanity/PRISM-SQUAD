/**
 * iframe 이벤트 보상 아이콘 탭 → 장비는 EquipDetailPopup, 재화는 간단 설명 팝업
 */
import { useEffect, useState } from 'react';
import { useSyncExternalStore } from 'react';
import { hudStore, type EquipItem } from '../game/hudExternalStore';
import { EquipDetailPopup } from './equipUi';

export type RewardDetailPayload = {
  kind: string;
  slotId?: string;
  label?: string;
  icon?: string;
  amount?: number;
};

const CURRENCY_INFO: Record<string, { title: string; desc: string }> = {
  gold: {
    title: '골드',
    desc: '메타 골드입니다. 장비 레벨업·상점 등에서 사용합니다.',
  },
  gem: {
    title: '보석',
    desc: '프리미엄 재화입니다. 상점 보석 팩·상자 등에 사용합니다.',
  },
  lightning: {
    title: '번개 (입장권)',
    desc: '스테이지 입장에 소모되는 에너지입니다. 시간 경과·상점으로 충전할 수 있습니다.',
  },
};

export function RewardDetailOverlay() {
  const hud = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
  const [payload, setPayload] = useState<RewardDetailPayload | null>(null);

  useEffect(() => {
    const onShow = (e: Event) => {
      const d = (e as CustomEvent<RewardDetailPayload>).detail;
      if (d?.kind) setPayload(d);
    };
    const onClose = () => setPayload(null);
    window.addEventListener('host:showRewardDetail', onShow);
    window.addEventListener('host:closeRewardDetail', onClose);
    return () => {
      window.removeEventListener('host:showRewardDetail', onShow);
      window.removeEventListener('host:closeRewardDetail', onClose);
    };
  }, []);

  useEffect(() => {
    if (!hud['/event/minigame/activeId']) setPayload(null);
  }, [hud['/event/minigame/activeId']]);

  if (!payload) return null;

  if (payload.kind === 'equip' && payload.slotId) {
    const items = (hud['/equip/items'] as EquipItem[]) ?? [];
    const item = items.find(i => i.slot_id === payload.slotId);
    if (!item) {
      return (
        <SimpleRewardCard
          icon={payload.icon ?? '❓'}
          title={payload.label ?? payload.slotId}
          desc="장비 정보를 불러오지 못했습니다. 로비에서 잠시 후 다시 시도해 주세요."
          onClose={() => setPayload(null)}
        />
      );
    }
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <EquipDetailPopup
          item={item}
          gold={Number(hud['/equip/gold'] ?? 0)}
          readOnly
          onClose={() => setPayload(null)}
          onEquip={() => {}}
          onUpgrade={() => {}}
          onUnequip={() => {}}
        />
      </div>
    );
  }

  const info = CURRENCY_INFO[payload.kind] ?? {
    title: payload.label ?? '보상',
    desc: '이벤트 보상입니다.',
  };
  const amountNote =
    payload.amount != null && payload.amount > 0
      ? `\n수량: ${payload.amount.toLocaleString()}`
      : '';

  return (
    <SimpleRewardCard
      icon={payload.icon ?? '🎁'}
      title={payload.label || info.title}
      desc={info.desc + amountNote}
      onClose={() => setPayload(null)}
    />
  );
}

function SimpleRewardCard({
  icon, title, desc, onClose,
}: {
  icon: string;
  title: string;
  desc: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 63,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'auto', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 300,
          background: '#F4EFE6', border: '3px solid #000', borderRadius: 8,
          boxShadow: '4px 4px 0 #000', padding: '16px 14px', textAlign: 'center',
          fontFamily: '"Segoe UI", Roboto, sans-serif', color: '#000',
        }}
      >
        <div style={{ fontSize: 40, lineHeight: 1 }}>{icon}</div>
        <div style={{ fontWeight: 900, fontSize: 17, marginTop: 8 }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.55, marginTop: 10, whiteSpace: 'pre-wrap' }}>
          {desc}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 14, width: '100%', padding: '10px 0',
            background: '#FFB347', border: '2px solid #000', borderRadius: 8,
            fontWeight: 900, fontSize: 14, cursor: 'pointer',
            boxShadow: '2px 2px 0 #000',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
