import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 개발 환경에서는 모든 규칙을 경고로 설정
      "no-console": "off",
      "no-debugger": "warn",
      "no-unused-vars": "warn",
      "no-undef": "warn",
      
      // TypeScript 관련 규칙
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      
      // React 관련 규칙
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react/jsx-key": "warn",
      "react/jsx-no-bind": "warn",
      "react/no-array-index-key": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-no-leaked-render": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      
      // 기타 규칙
      "object-shorthand": "warn",
      "prefer-template": "warn",
    },
  },
];

export default eslintConfig;
