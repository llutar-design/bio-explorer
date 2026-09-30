# 우리 반 생물 탐험대

초등 저학년용 생물 수집 게임입니다. 로그인·서버·인터넷 연결 없이 동작합니다.

## 바로 실행하기
**`우리반-생물-탐험대.html`** 파일을 더블클릭해 Chrome이나 Edge로 여세요. (`dist/index.html`과 같은 파일입니다.)
이 파일 하나에 게임이 모두 들어 있어서, USB나 공유 폴더로 옮겨 써도 됩니다.
프로젝트 맨 위의 `index.html`은 만들기용 원본이라 열어도 게임이 켜지지 않습니다.

## 생물 내용 고치기
생물 이름, 분류, 설명, 등장 장소는 `src/data/creatures.ts` 한 파일에서 관리합니다.
그림은 `src/art/CreatureArt.tsx` 에 있습니다.
별 개수, 탐험가 등급, 배지, 미션, 반짝 생물이 나올 확률은 `src/game/progress.ts` 에서 바꿀 수 있습니다. 고친 뒤에는 다시 빌드해야 합니다(Node.js 필요).

```
npm install
npm run check:data   # 20가지가 모두 등장할 수 있는지 점검
npm run build        # dist/index.html 새로 만들기
npm run dev          # 고치면서 미리 보기
```

## 기록
탐험 기록은 그 브라우저(localStorage)에만 저장됩니다. 같은 기기에서 같은 브라우저를 쓰면 기록도 함께 씁니다.
