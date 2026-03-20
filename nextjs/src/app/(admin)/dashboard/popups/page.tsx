"use client";

import { useState } from "react";

export default function PopupsPage() {
  const [popups] = useState([
    {
      id: "1",
      title: "정책자금 무료 상담 안내",
      active: true,
      startDate: "2026-03-01",
      endDate: "2026-04-30",
    },
    {
      id: "2",
      title: "신규 고객 이벤트",
      active: false,
      startDate: "2026-02-01",
      endDate: "2026-03-31",
    },
  ]);

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
        .popup-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .popup-card {
          background: white;
          border-radius: 12px;
          border: 1px solid var(--n200);
          overflow: hidden;
          transition: all 0.2s;
        }
        .popup-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        .popup-image {
          aspect-ratio: 1;
          background: var(--n100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--n400);
        }
        .popup-info {
          padding: 16px;
        }
        .popup-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--n800);
          margin-bottom: 8px;
        }
        .popup-meta {
          font-size: 12px;
          color: var(--n500);
          margin-bottom: 8px;
        }
        .popup-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .popup-status.active {
          background: #d1fae5;
          color: #059669;
        }
        .popup-status.inactive {
          background: var(--n100);
          color: var(--n500);
        }
        .popup-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .btn-sm {
          padding: 8px 16px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          background: white;
          cursor: pointer;
          color: var(--n600);
        }
        .btn-sm:hover {
          background: var(--n50);
        }
        .add-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          border: 2px dashed var(--n300);
          cursor: pointer;
          color: var(--n500);
          background: white;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .add-card:hover {
          border-color: var(--tp-primary);
          color: var(--tp-primary);
          background: var(--n50);
        }
        .notice {
          margin-top: 24px;
          padding: 16px;
          background: var(--n50);
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          color: var(--n500);
          text-align: center;
        }
      `}</style>

      <h1 className="page-title">팝업 관리</h1>
      <p className="page-sub">메인 페이지 팝업을 관리합니다</p>

      <div className="popup-grid">
        {popups.map((popup) => (
          <div key={popup.id} className="popup-card">
            <div className="popup-image">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="popup-info">
              <div className="popup-title">{popup.title}</div>
              <div className="popup-meta">
                {popup.startDate} ~ {popup.endDate}
              </div>
              <span
                className={`popup-status ${popup.active ? "active" : "inactive"}`}
              >
                {popup.active ? "활성" : "비활성"}
              </span>
              <div className="popup-actions">
                <button className="btn-sm">수정</button>
                <button className="btn-sm">삭제</button>
              </div>
            </div>
          </div>
        ))}
        <div
          className="add-card"
          onClick={() => alert("팝업 추가 기능은 API 연결 후 동작합니다.")}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span style={{ marginTop: 12, fontSize: 14 }}>새 팝업 추가</span>
        </div>
      </div>

      <div className="notice">
        팝업 관리는 R2 이미지 업로드 API 연결 후 완전히 동작합니다.
      </div>
    </>
  );
}
