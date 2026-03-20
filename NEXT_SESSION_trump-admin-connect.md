# 세션 핸드오프: 트럼프 파트너스 관리자 대시보드 연결

**경로**: F:\pola_homepage\32.26_2th_isoyoung_trump | **날짜**: 2026-03-20 20:30

## 복사해서 사용:

트럼프 관리자 대시보드 서비스 연결 + 접수 기능 테스트 + GA4 연동 + Airtable 필드 인코딩 문제 해결

## 완료된 작업:

- [x] Next.js 트럼프 전용 프로젝트 분리 (nextjs/ 폴더)
- [x] PC 인라인 메뉴바 + 모바일 하단바
- [x] 5개 서브페이지 SEO 리라이팅 (표현 전면 교체)
- [x] 메인 히어로/서비스/프로세스 섹션 리라이팅
- [x] ConsultForm 자금상담만 유지
- [x] CEO 이소영 / 기업심사관 · 대표 + 프로필사진
- [x] 트럼프 로고/파비콘 교체
- [x] Designed by Pola 백링크
- [x] 마케팅 모바일 탭 보라색 → 골드 변경
- [x] 관리자 대시보드 JSbiz 기반 Next.js 변환 (11개 파일)
- [x] API 라우트 J&I 잔재 제거 (하드코딩 Base ID, [JNI] 로그)
- [x] 텔레그램 봇 연결 (상담접수 알림 + 로그인 인증)
- [x] Vercel 환경변수 29개 등록
- [x] Vercel 도메인 설정: trump1.co.kr (기본), www→리다이렉트, admin.trump1.co.kr
- [x] Vercel rootDirectory=nextjs, framework=nextjs, nodeVersion=20.x
- [x] GitHub 연결 → git push 자동 배포
- [x] Airtable 테이블 "상담접수" + 필드 13개 생성

## 남은 작업 (다음 세션):

- [ ] **ConsultForm → 위자드 3단계 폼으로 교체**: index.html 와이어프레임에 위자드폼 CSS+JS 있음 (line 1323~). 현재 ConsultForm.tsx는 J&I 원본 단일폼. React 위자드 컴포넌트로 변환 필요
- [x] **Airtable 필드 영문화 완료**: company, bizno, repName, phone, email, industry, founded, consultTime, amount, fundType, message, createdAt, status, memo. consult API 매핑도 수정됨
- [ ] **관리자 대시보드 전체 FOUC 수정**: 로그인은 수정됨. 대시보드 각 페이지에도 로딩 스피너/애니메이션 필요. CSS 깨진 스타일 노출 방지
- [ ] **이메일 발송 미리보기 기능 없음**: 발송 전 미리보기 추가 필요
- [ ] **팝업 관리 이상**: 확인 필요
- [ ] **관리자 대시보드 재구축**: 기존 admin 삭제 후 F:\pola_homepage\31.26_2th_seongjuseok_bizup 관리자 구조 가져와서 트럼프 정보로 업데이트. 이 프로젝트가 가장 최신 관리자 구조임
- [ ] **leads/board/popups API**: Airtable 영문 필드명으로 매핑 변경 필요 (consult만 수정됨): consult API에서 한글 필드명이 Airtable에 저장 안 됨. 유니코드 이스케이프(\uXXXX)로 시도했으나 500 에러. 원인: 린터가 유니코드를 다시 한글로 변환하거나, Airtable 필드명 불일치. → **영문 필드명으로 변경하는 것이 가장 확실**
- [ ] **텔레그램 알림 테스트**: Airtable 저장 실패 때문에 catch에서 중단됨. Airtable 해결 후 재테스트
- [x] **GA4 태그 설치**: G-H9LZ9YK9DR (스트림ID: 14120140087, URL: trump1.co.kr)
- [ ] **GA4 Data API 연동**: 속성ID 529311989, 서비스 계정 trump-347@trump-biz.iam.gserviceaccount.com, 키파일 c:\Users\flame\Downloads\trump-biz-f8e3a3e2febf.json → analytics 대시보드 페이지에 연결. GA4 속성에 서비스 계정 뷰어 권한 추가 필요
- [ ] **관리자 대시보드 기능 테스트**: 각 페이지(leads/email/board/popups/analytics/employees) 실제 동작 확인
- [ ] **모바일 자금상담 히어로 영상**: 일부만 보이는 문제 수정 필요
- [ ] **텍스트 밸런스 점검**: /text-balance 전체 페이지
- [ ] **Vercel 배포 확인**: 현재 GitHub 연결 배포 상태 확인

## 실패한 접근 (반복 금지):

1. **J&I 폴더 직접 수정** → 다른 고객 프로젝트가 망가짐. 트럼프 작업은 반드시 nextjs/ 폴더에서만
2. **vercel CLI --prod 직접 배포** → Git Integration과 충돌하여 "Unexpected error" 반복. git push로만 배포
3. **MCP Vercel 도구 사용** → mkt9834 계정이라 403 에러. CLI 토큰(VERCEL_TOKEN)으로만
4. **에이전트로 5페이지 한번에 생성** → 원본 무시하고 엉터리 생성됨
5. **Airtable 한글 필드명 + Windows curl** → 인코딩 깨짐. Node.js에서도 유니코드 이스케이프 문제 발생

## 중요 컨텍스트:

- **프로젝트 구조**: nextjs/ 폴더가 Next.js 앱. 루트에는 와이어프레임 index.html과 jni-original 백업
- **J&I 원본 복원 완료**: F:\pola_homepage\11.26_1th_kimjongik_jni는 원본 상태로 복원됨
- **dev 서버**: `cd nextjs && npx next dev -p 4000`
- **SSH**: `GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_trump" git push origin main`
- **Vercel**: git push → 자동 배포. 프로젝트 설정 변경은 curl API + VERCEL_TOKEN
- **텔레그램**: 봇토큰/채팅ID는 .env.local에 저장됨
- **도메인**: trump1.co.kr(기본), www→301리다이렉트, admin.trump1.co.kr(관리자)
- **SEO 규칙**: 기업분석/기업평가/서류대행 금지, 컨설턴트=기업심사관, "출신" 표현 금지
