// @prizedrop-catalog-role #재료(Material·CSV경로) #시맨틱스텁 #registry없음
import { z } from 'zod';
import { DATA_PATHS } from '../game/runnerDataPaths';
import { bindRefProps } from './prizedropCatalogShared';

const csvFormat = z.literal('csv');

function dataMaterialProps(path: string, role: string) {
  return z.object({
    format: csvFormat.describe('런타임 로더 포맷'),
    sourcePath: z.literal(path as string).describe('레포 기준 경로 — 변경 시 runnerDataPaths.ts와 함께 수정'),
    materialRole: z.literal(role as string).describe('기획·Spec에서 구분용 역할 태그'),
  });
}

export const prizedropCatalogMaterialComponents = {
  PrizedropDataMaterial_SlotLightning: {
    props: dataMaterialProps(DATA_PATHS.SLOT_LIGHTNING, 'slot_reward_weight_jackpot'),
    description: '01 슬롯 7개 — 번개 보상/잭팟/가중치/색상. 확률 순서: 10 > 20 > 1 > 잭팟100.',
    example: { format: 'csv', sourcePath: DATA_PATHS.SLOT_LIGHTNING, materialRole: 'slot_reward_weight_jackpot' },
  },
  PrizedropDataMaterial_Multiplier: {
    props: dataMaterialProps(DATA_PATHS.MULTIPLIER, 'multiplier_levels_cost'),
    description: '02 배수 4단계 (×1/×2/×5/×10).',
    example: { format: 'csv', sourcePath: DATA_PATHS.MULTIPLIER, materialRole: 'multiplier_levels_cost' },
  },
  PrizedropDataMaterial_Milestone: {
    props: dataMaterialProps(DATA_PATHS.MILESTONE, 'milestone_threshold_reward'),
    description: '03 마일스톤 5단계 — 100/200/300/400/500 균등 임계값. 게이지 20% 구간 균등.',
    example: { format: 'csv', sourcePath: DATA_PATHS.MILESTONE, materialRole: 'milestone_threshold_reward' },
  },
  PrizedropDataMaterial_BoardObstacle: {
    props: dataMaterialProps(DATA_PATHS.BOARD_OBSTACLE, 'board_obstacle_layout'),
    description: '04 장애물 32개 — type: pin/circle/triangle/diamond/rect. Zod enum에 모두 등록 필수.',
    example: { format: 'csv', sourcePath: DATA_PATHS.BOARD_OBSTACLE, materialRole: 'board_obstacle_layout' },
  },
};

export const prizedropCatalogSemanticStubComponents = {
  PrizedropGameBoard: {
    props: bindRefProps,
    description: 'Three.js 보드 월드 — Matter.js 물리 + OrthographicCamera 렌더. Width:360 / Height:396.',
    example: {},
  },
  PrizedropBall: {
    props: bindRefProps,
    description: '구슬 엔티티 — BankPlayer 키프레임 재생. 드롭 1회당 공 1개 소비.',
    example: {},
  },
  PrizedropSlot: {
    props: bindRefProps,
    description: '슬롯 7개 착지 영역 (하단 25px). SSoT: 01_slot_lightning.csv.',
    example: {},
  },
  PrizedropBumper: {
    props: bindRefProps,
    description: '슬롯 구분선 상단 네모 충돌체 6개 (bump_0~5). 공 슬라이딩 방지.',
    example: {},
  },
};

export const prizedropCatalogStubsAndMaterialsComponents = {
  ...prizedropCatalogMaterialComponents,
  ...prizedropCatalogSemanticStubComponents,
};
