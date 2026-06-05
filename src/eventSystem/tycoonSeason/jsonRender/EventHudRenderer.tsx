import React, { useSyncExternalStore } from 'react';
import { eventCatalog } from './catalog';
import { eventHudSpec } from './eventHudSpec';
import { eventRegistry } from './registry';
import { eventStore } from '../store/eventExternalStore';

const SLOT_TYPES: Record<string, Set<string>> = {
  mileage: new Set(['EventTycoonMileageBar']),
  tournament: new Set(['EventTournamentLeaderboard', 'SeasonExpressSideTab']),
  modal: new Set([
    'EventMilestoneRewardPopup',
    'EventMilestoneListPopup',
    'EventTournamentPanel',
    'EventTournamentSettlementPopup',
    'SeasonExpressPanel',
  ]),
};

export function EventHudRenderer({ slot }: { slot: 'mileage' | 'tournament' | 'modal' }) {
  useSyncExternalStore(
    cb => eventStore.subscribe(cb),
    () => eventStore.getSnapshot(),
  );

  const allowed = SLOT_TYPES[slot];
  const elements = eventCatalog.validate(eventHudSpec);
  return (
    <>
      {elements.map((el, i) => {
        if (!allowed.has(el.type)) return null;
        const fn = eventRegistry[el.type];
        if (!fn) return null;
        return (
          <React.Fragment key={i}>
            {fn((el as { props: Record<string, unknown> }).props)}
          </React.Fragment>
        );
      })}
    </>
  );
}
