// @prizedrop-catalog-role #진입점 #defineCatalog #병합(운영UI+재료·스텁) #액션등록
import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

import { prizedropCatalogOperationalUiComponents } from './prizedropCatalogOperationalUi';
import { prizedropCatalogStubsAndMaterialsComponents } from './prizedropCatalogStubsAndMaterials';

export const prizedropSceneCatalogComponents = {
  ...prizedropCatalogOperationalUiComponents,
  ...prizedropCatalogStubsAndMaterialsComponents,
};

export const prizedropCatalog = defineCatalog(schema, {
  components: prizedropSceneCatalogComponents as any,
  actions: {
    prizedropDropBall: {
      params: z.object({ buttonIndex: z.number().int().min(0).max(4) }) as any,
      description: '드롭 버튼 클릭 — 공 1개 소비 후 release_drop(buttonIndex) 호출. 공 0개면 경고 토스트.',
    },
    prizedropAddBalls: {
      params: z.object({}) as any,
      description: '공 +10 추가.',
    },
    prizedropCycleMultiplier: {
      params: z.object({}) as any,
      description: '배수 순환 (x1→x2→x5→x10→x1). select_multiplier() 호출.',
    },
    prizedropDismissModal: {
      params: z.object({}) as any,
      description: '보상 모달 닫기 — rewardModalStore.dismiss() 호출. 큐에 다음 항목이 있으면 180ms 후 자동 표시.',
    },
  } as any,
});

export type PrizedropSceneCatalogComponents = typeof prizedropSceneCatalogComponents;

export {
  DATA_PATHS,
  type DataKey,
} from '../game/runnerDataPaths';

export { hudBindProp } from './prizedropCatalogShared';
export {
  prizedropCatalogMaterialComponents,
  prizedropCatalogSemanticStubComponents,
} from './prizedropCatalogStubsAndMaterials';
