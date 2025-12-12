# 아카이브 문서

이 디렉토리는 완료되었거나 더 이상 활성화되지 않은 문서들을 보관합니다.

## 📂 구조

### completed-migrations/
완료된 데이터베이스 마이그레이션 관련 문서

- `POSTGRES_MIGRATION.md` - PostgreSQL 마이그레이션 가이드 (구버전)
- `POSTGRES_MIGRATION_COMPLETE.md` - 마이그레이션 완료 보고서 (2025-10-10)
- `POSTGRES_MIGRATION_REPORT.md` - 마이그레이션 도구 작성 보고서 (2025-10-09)
- `POSTGRES_SETUP_GUIDE.md` - PostgreSQL 설정 가이드 (구버전)

**대체 문서**: `docs/setup/POSTGRES_GUIDE.md` (통합 가이드)

### completed-fixes/
해결 완료된 버그 수정 문서

- `DEBUG_LOG_CLEANUP.md` - 디버그 로그 정리 (2025-11-14)
- `JWT_AUTH_FIX.md` - JWT 인증 수정
- `JWT_TOKEN_ERROR_FIX.md` - JWT 토큰 에러 수정 (2025-10-09)
- `KAKAO_SHARE_WEBVIEW_FIX.md` - 카카오 공유 WebView 수정
- `SHARE_URL_LOCALHOST_FIX.md` - 공유 URL localhost 수정 (2025-01-12)

**참고**: 현재 활성화된 수정 사항은 `docs/fixes/` 참조

### planning/
초기 기획 및 개발 계획 문서

- `AI_FEATURES_ROADMAP.md` - AI 기능 로드맵 (2025-11-27)
- `AI_PHASE1_DEVELOPMENT_PLAN.md` - AI Phase 1 개발 계획 (2025-11-27)
- `WHEN_TO_MIGRATE_POSTGRES.md` - PostgreSQL 마이그레이션 시점 가이드

**대체 문서**: `docs/features/AI_INSIGHTS_GUIDE.md` (구현 완료 가이드)

## 🔍 왜 아카이브하나요?

1. **문서 정리**: 활성 문서와 완료된 문서 분리
2. **히스토리 보존**: 과거 의사결정 및 과정 기록 유지
3. **검색 효율성**: 현재 관련 문서만 빠르게 찾기
4. **유지보수성**: 최신 정보만 업데이트 관리

## 📝 아카이브 정책

**아카이브 대상**:
- 완료된 마이그레이션/배포 보고서
- 해결 완료된 버그 수정 문서
- 구현 완료된 기획/계획 문서
- 더 이상 유효하지 않은 가이드 (통합/대체됨)

**보관 기간**: 영구 보관 (삭제하지 않음)

---

**Created**: 2025-12-12  
**Purpose**: 문서 정리 및 히스토리 보존
