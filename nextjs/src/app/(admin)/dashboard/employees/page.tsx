"use client";

export default function EmployeesPage() {
  return (
    <>
      <style jsx>{`
        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--n900);
          margin-bottom: 4px;
        }
        .page-sub {
          font-size: 14px;
          color: var(--n500);
          margin-bottom: 24px;
        }
        .empty-state {
          background: white;
          border-radius: 12px;
          padding: 60px 24px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--n200);
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.3;
        }
        .empty-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--n700);
          margin-bottom: 8px;
        }
        .empty-desc {
          font-size: 14px;
          color: var(--n400);
          line-height: 1.6;
        }
      `}</style>

      <h1 className="page-title">임직원 관리</h1>
      <p className="page-sub">임직원 정보를 관리합니다</p>

      <div className="empty-state">
        <div className="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.3 }}
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className="empty-title">임직원 테이블 미설정</p>
        <p className="empty-desc">
          Airtable에 임직원 테이블을 생성한 후<br />
          환경변수에 테이블 ID를 설정하면 사용할 수 있습니다.
        </p>
      </div>
    </>
  );
}
