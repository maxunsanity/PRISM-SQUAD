/**
 * catalog.ts — defineCatalog() 단일 진입점
 * 외부는 이 파일만 import. operationalUi / stubs 직접 import 금지.
 */
import { z } from 'zod';
import {
  PrismHudTopBar,
  PrismHudTimer,
  PrismHudExpBar,
  PrismHudKillCount,
  PrismHudGold,
  PrismHudPlayerHp,
  PrismHudBossHp,
  PrismHudPauseBtn,
  PrismHudSkillSlots,
  PrismHudBossWarning,
  PrismLobbyScreen,
  PrismSceneTransition,
  PrismPauseScreen,
  PrismRushWarning,
  PrismBossIntro,
  PrismBossDeath,
  PrismTalentScreen,
  PrismEquipScreen,
  PrismShopScreen,
  PrismChallengeScreen,
  PrismEvolutionScreen,
  PrismAdventureUp,
  PrismBattlePopup,
  PrismEnergyShop,
  PrismLuckyTrain,
  PrismSkillModal,
  PrismResultScreen,
  PrismAvatarSelect,
} from './operationalUi';
import { PrismStub_TalentScreen } from './stubsAndMaterials';

const allElements = z.discriminatedUnion('type', [
  PrismHudTopBar,
  PrismHudTimer,
  PrismHudExpBar,
  PrismHudKillCount,
  PrismHudGold,
  PrismHudPlayerHp,
  PrismHudBossHp,
  PrismHudPauseBtn,
  PrismHudSkillSlots,
  PrismHudBossWarning,
  PrismLobbyScreen,
  PrismSceneTransition,
  PrismPauseScreen,
  PrismRushWarning,
  PrismBossIntro,
  PrismBossDeath,
  PrismTalentScreen,
  PrismEquipScreen,
  PrismShopScreen,
  PrismChallengeScreen,
  PrismEvolutionScreen,
  PrismAdventureUp,
  PrismBattlePopup,
  PrismEnergyShop,
  PrismLuckyTrain,
  PrismSkillModal,
  PrismResultScreen,
  PrismAvatarSelect,
  PrismStub_TalentScreen,
]);

// 위에서 두 번 등록되는 것 방지용 체크 (discriminatedUnion은 중복 type 허용 안 함)

export type CatalogElement = z.infer<typeof allElements>;

function defineCatalog() {
  return {
    validate(elements: unknown[]): CatalogElement[] {
      return elements.map((el, i) => {
        const result = allElements.safeParse(el);
        if (!result.success) {
          throw new Error(
            `[PRISM CATALOG] element[${i}] 검증 실패:\n${result.error.message}`
          );
        }
        if (!(result.data as { visible?: boolean }).visible === undefined) {
          throw new Error(`[PRISM CATALOG] element[${i}] visible 필드 누락`);
        }
        return result.data;
      });
    },
  };
}

export const catalog = defineCatalog();
