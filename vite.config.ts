import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// 빌드하면 dist/index.html 한 파일에 모든 것이 들어가서,
// 인터넷이나 서버 없이 파일을 더블클릭해도 열 수 있습니다.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: {
    // 학교 기기의 조금 오래된 크롬·사파리에서도 열리도록 낮은 버전 기준으로 만듭니다.
    target: ['es2018', 'chrome70', 'edge79', 'safari13', 'firefox68'],
    cssTarget: ['chrome70', 'edge79', 'safari13', 'firefox68'],
  },
});
