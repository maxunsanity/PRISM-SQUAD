import { z } from 'zod';
import {
  EventTycoonMileageBar,
  EventTournamentLeaderboard,
  EventMilestoneRewardPopup,
  EventMilestoneListPopup,
  EventTournamentPanel,
  EventTournamentSettlementPopup,
  SeasonExpressPanel,
  SeasonExpressSideTab,
} from './operationalUi';

const allElements = z.discriminatedUnion('type', [
  EventTycoonMileageBar,
  EventTournamentLeaderboard,
  EventMilestoneRewardPopup,
  EventMilestoneListPopup,
  EventTournamentPanel,
  EventTournamentSettlementPopup,
  SeasonExpressPanel,
  SeasonExpressSideTab,
]);

export type EventCatalogElement = z.infer<typeof allElements>;

function defineCatalog() {
  return {
    validate(elements: unknown[]): EventCatalogElement[] {
      return elements.map((el, i) => {
        const result = allElements.safeParse(el);
        if (!result.success) {
          throw new Error(`[EVENT CATALOG] element[${i}] 검증 실패:\n${result.error.message}`);
        }
        return result.data;
      });
    },
  };
}

export const eventCatalog = defineCatalog();
