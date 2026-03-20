# 세션 핸드오프: 트럼프 파트너스 홈페이지

**경로**: F:\pola_homepage\32.26_2th_isoyoung_trump | **날짜**: 2026-03-20 15:30

## 복사해서 사용:

J&I 프로젝트(localhost:4000) 트럼프 컬러/브랜드 적용된 상태에서 각 서브페이지 SEO 리라이팅 + 헤더를 PC 메뉴바 스타일로 변경 + 모바일 하단바 추가 + 무료상담신청 CTA 위치 오른쪽으로 조정 + 위자드폼은 자금상담에만 + 완료 후 Next.js 프로젝트를 트럼프 전용 프로젝트로 분리

## 완료된 작업:

- [x] index.html 와이어프레임 (트럼프 컬러 #1B2B4B/#C9A84C)
- [x] 명함 기반 컬러 컨셉 확정
- [x] PC 메뉴바 헤더 (인라인 6메뉴 + CTA)
- [x] 모바일 하단 가로바 네비 (5메뉴)
- [x] 모바일 상단 로고 헤더 (가운데 정렬)
- [x] YouTube 히어로 배경 적용 (메인)
- [x] 위자드 3단계 폼 구현 (자금상담 전용)
- [x] JJK 업무협약 배너 + 로고
- [x] Designed by Pola 백링크
- [x] SEO 리라이팅 (index.html)
- [x] /text-balance 스킬 생성
- [x] 텍스트 밸런스 점검 완료 (index.html)
- [x] Gemini 컨셉 이미지 생성 (form-side-concept.png)
- [x] Git 설정 (SSH github-trump + remote)
- [x] .env.local 전체 인증값 저장
- [x] CLAUDE.md 프로젝트 규칙
- [x] Vercel trump1 프로젝트 연결
- [x] J&I 프로젝트에 트럼프 컬러/브랜드/영상/연락처 일괄 적용 (localhost:4000)

## 남은 작업:

- [ ] J&I 서브페이지 SEO 리라이팅 (기업분석→역량분석, 서류대행→준비가이드, 기업심사관)
- [ ] 헤더: PC 메뉴바 스타일로 변경 (현재 J&I 햄버거 메뉴)
- [ ] 무료상담신청 CTA 버튼 메뉴 쪽으로 가깝게 배치 (PC)
- [ ] 모바일 하단 가로바 네비 추가
- [ ] 모바일 상단 로고 가운데 정렬
- [ ] 위자드폼: 자금상담 페이지에만 노출, 다른 페이지 ConsultForm 제거
- [ ] 대표 소개 섹션: 이소영 프로필사진 적용
- [ ] CEO 섹션 직함: "기업심사관 · 대표"
- [ ] 회사소개 YouTube 7초 시작 설정 확인
- [ ] 전체 페이지 텍스트 밸런스 점검 (/text-balance)
- [ ] Next.js 프로젝트를 트럼프 전용으로 분리 (현재 J&I 프로젝트 파일 직접 수정 중)
- [ ] Vercel 배포 (로컬 확인 완료 후)

## 실패한 접근 (반복 금지):

1. **에이전트로 5페이지 한번에 생성** → 원본 구조 무시하고 엉터리 HTML 생성됨. 원본을 정확히 읽지 않고 요약 기반으로 만들어서 레이아웃/내용 불일치
2. **정적 HTML로 서브페이지 수동 변환** → React/Tailwind를 inline style HTML로 변환하면 원본과 차이가 큼. CSS class 매핑이 안 맞음
3. **J&I index를 트럼프 index.html로 교체 시 public/index.html + redirect** → Next.js public 폴더에 정적 HTML 넣고 page.tsx에서 redirect하는 방식으로 해결

## 중요 컨텍스트 / 주의사항:

- **현재 작업 방식**: J&I Next.js 프로젝트(F:\pola_homepage\11.26_1th_kimjongik_jni) 파일을 직접 수정해서 localhost:4000에서 확인 중. 원본 J&I 파일이 변경된 상태임
- **J&I 원본 백업**: page.tsx.bak 있음 (src/app/(site)/page.tsx.bak)
- **jni-original 폴더**: F:\pola_homepage\32.26_2th_isoyoung_trump\jni-original/ 에 원본 TSX 파일 복사본 있음
- **배포 금지**: 사용자가 로컬 확인 후 진행하겠다고 함
- **SSH**: github-trump (id_ed25519_trump) → pdsr7779-netizen 계정
- **Vercel**: vercel --prod --token 방식, 프로젝트명 trump1
- **히어로 영상**: main=t-IvBD_ch14, about=IhxQgVi6ovY(7초), process=x3_UwtYE8dk, fund=nRLWQ0V4aGc, pro=3PWbnUuJpIY, mkt=BNylTOr-NwI
- **SEO CRITICAL**: 기업분석/기업평가/기업진단 금지, 서류작성 대행 금지, 컨설턴트="기업심사관"("출신" 표현 금지)
- **사용자 피드백**: 원본 그대로 가져오고 → 브랜딩만 바꾸는 게 빠르다. 보고 만드는 것보다.
