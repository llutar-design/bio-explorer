import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 링크 미리보기(og:image 등)는 전체 주소(https://…)가 있어야 카카오톡 등에서 그림이 보입니다.
// Vercel은 빌드할 때 사이트 주소를 VERCEL_PROJECT_PRODUCTION_URL 로 알려 주므로 그 값을 넣어요.
// 다른 곳에 올리거나 주소를 직접 정하고 싶으면 SITE_URL=https://주소 로 빌드하면 됩니다.
const env: Record<string, string | undefined> =
  (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

function siteUrl(): string {
  const direct = env.SITE_URL;
  if (direct) return direct.replace(/\/$/, '');
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  return vercel ? `https://${vercel}` : '';
}

function linkPreview(): Plugin {
  // 주소를 모를 때(내 컴퓨터에서 빌드)는 같은 폴더 기준(./)으로 둡니다.
  const url = siteUrl() || '.';
  return {
    name: 'link-preview-url',
    transformIndexHtml: (html) => html.split('%SITE_URL%').join(url),
  };
}

// 빌드하면 dist/index.html 한 파일에 모든 것이 들어가서,
// 인터넷이나 서버 없이 파일을 더블클릭해도 열 수 있습니다.
export default defineConfig({
  plugins: [react(), viteSingleFile(), linkPreview()],
  base: './',
  build: {
    // 학교 기기의 조금 오래된 크롬·사파리에서도 열리도록 낮은 버전 기준으로 만듭니다.
    target: ['es2018', 'chrome70', 'edge79', 'safari13', 'firefox68'],
    cssTarget: ['chrome70', 'edge79', 'safari13', 'firefox68'],
  },
});
