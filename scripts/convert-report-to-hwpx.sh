#!/usr/bin/env bash
# 마크다운 결과보고서 → HWPX(한글) 변환
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MD="${ROOT}/docs/동고리-결과보고서-초안.md"
OUT="${ROOT}/docs/동고리-결과보고서-초안.hwpx"

if [[ ! -f "$MD" ]]; then
  echo "파일 없음: $MD" >&2
  exit 1
fi

if command -v md2hwpx >/dev/null 2>&1; then
  md2hwpx "$MD" -o "$OUT"
elif [[ -x "${HOME}/Library/Python/3.13/bin/md2hwpx" ]]; then
  "${HOME}/Library/Python/3.13/bin/md2hwpx" "$MD" -o "$OUT"
elif [[ -x "${HOME}/Library/Python/3.13/bin/pyhwpxlib" ]]; then
  "${HOME}/Library/Python/3.13/bin/pyhwpxlib" md2hwpx "$MD" -o "$OUT"
else
  echo "md2hwpx 또는 pyhwpxlib 설치 필요:" >&2
  echo "  pip3 install md2hwpx" >&2
  exit 1
fi

echo "변환 완료: $OUT"
echo "한글에서 열기: 더블클릭 또는 한글 > 파일 > 열기"
echo "구형 .hwp 저장: 한글 > 다른 이름으로 저장 > 파일 형식 HWP"
