/**
 * Archery Arena — 관문 카탈로그 (defineCatalog 패턴)
 *
 * Layer 구조:
 *   Layer 1: aaCatalogShared      — 공통 Zod 타입
 *   Layer 2: aaCatalogOperationalUi — HUD 컴포넌트 스키마
 *   Layer 3: aaCatalogStubsAndMaterials — CSV 경로 / 머티리얼
 *   Layer 4: archeryArenaCatalog  — 관문 진입점 (이 파일)
 */

import { OperationalUiSchemas } from './aaCatalogOperationalUi.js';
import { AA_CSV_PATHS, AA_HUD_MATERIALS } from './aaCatalogStubsAndMaterials.js';
import type { ArcheryHudState } from '../game/hudExternalStore.js';

export interface AACatalog {
  /** HUD 컴포넌트 스키마 레지스트리 */
  ui: typeof OperationalUiSchemas;
  /** CSV 데이터 경로 */
  csv: typeof AA_CSV_PATHS;
  /** HUD 스타일 토큰 */
  materials: typeof AA_HUD_MATERIALS;
  /** 상태 타입 (타입 추론용) */
  _stateType: ArcheryHudState;
}

function defineCatalog(): AACatalog {
  return {
    ui: OperationalUiSchemas,
    csv: AA_CSV_PATHS,
    materials: AA_HUD_MATERIALS,
    _stateType: null as unknown as ArcheryHudState,
  };
}

export const archeryArenaCatalog = defineCatalog();
