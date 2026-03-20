"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function BoardEditContent() {
  const params = useSearchParams();
  const postId = params.get("id");

  return (
    <>
      <style jsx>{`
        .editor-wrap {
          max-width: 800px;
          margin: 0 auto;
        }
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
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--n500);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 16px;
        }
        .back-link:hover {
          color: var(--tp-primary);
        }
        .panel {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--n700);
          margin-bottom: 8px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--tp-primary);
        }
        .form-group textarea {
          min-height: 200px;
          resize: vertical;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--n700);
          cursor: pointer;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
        }
        .actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: var(--n100);
          color: var(--n700);
        }
        .btn-secondary:hover {
          background: var(--n200);
        }
        .btn-primary {
          background: var(--tp-primary);
          color: white;
        }
        .btn-primary:hover {
          background: var(--tp-primary-dark);
        }
        .notice {
          padding: 16px;
          background: var(--n50);
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          color: var(--n500);
          text-align: center;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="editor-wrap">
        <Link href="/dashboard/board" className="back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          게시판으로 돌아가기
        </Link>
        <h1 className="page-title">{postId ? "게시글 수정" : "새 글 작성"}</h1>
        <p className="page-sub">
          {postId ? `게시글 ID: ${postId}` : "새 게시글을 작성합니다"}
        </p>

        <div className="panel">
          <div className="form-group">
            <label>제목</label>
            <input type="text" placeholder="게시글 제목을 입력하세요" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>카테고리</label>
              <select>
                <option value="">카테고리 선택</option>
                <option>공지사항</option>
                <option>정책자금</option>
                <option>마케팅소식</option>
                <option>기업지원</option>
              </select>
            </div>
            <div className="form-group">
              <label>썸네일 URL</label>
              <input type="url" placeholder="https://..." />
            </div>
          </div>
          <div className="form-group">
            <label>본문</label>
            <textarea placeholder="게시글 내용을 입력하세요..." />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> 게시 (공개)
            </label>
          </div>
          <div className="actions">
            <Link href="/dashboard/board">
              <button className="btn btn-secondary">취소</button>
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => alert("저장 기능은 API 연결 후 동작합니다.")}
            >
              {postId ? "수정 저장" : "게시글 등록"}
            </button>
          </div>
        </div>

        <div className="notice">
          게시글 저장은 API Worker 연결 후 동작합니다.
        </div>
      </div>
    </>
  );
}

export default function BoardEditPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
          로딩 중...
        </div>
      }
    >
      <BoardEditContent />
    </Suspense>
  );
}
