/**
 * 팝업 이미지 표시 규격 (정사각형)
 * - 등록 이미지는 이 영역을 여백 없이 채워서 표시됩니다.
 */
export const POPUP_IMAGE_SPEC = {
  /** 표시 영역 가로 (px) */
  width: 700,
  /** 표시 영역 세로 (px) */
  height: 700,
  /** 정사각형 비율 */
  aspectRatio: 1,
} as const;

export const POPUP_IMAGE_SPEC_LABEL = `권장 이미지 크기: ${POPUP_IMAGE_SPEC.width} × ${POPUP_IMAGE_SPEC.height}px (정사각형, 팝업을 채우도록 표시됨)`;
