"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

interface PostForm {
  제목: string;
  요약: string;
  내용: string;
  카테고리: string;
  공개여부: boolean;
  썸네일: string;
}

const EMPTY_FORM: PostForm = {
  제목: "",
  요약: "",
  내용: "",
  카테고리: "",
  공개여부: true,
  썸네일: "",
};

const CATEGORIES = ["성공사례", "정책자금", "인증지원"];

function BoardEditContent() {
  const params = useSearchParams();
  const router = useRouter();
  const postId = params.get("id");

  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(!!postId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPost = useCallback(async (id: string) => {
    setLoading(true);
    setError("");
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/api/board?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.post) {
        const p = data.post;
        setForm({
          제목: p.제목 || "",
          요약: p.요약 || "",
          내용: p.내용 || "",
          카테고리: p.카테고리 || "",
          공개여부: p.공개여부 !== false,
          썸네일: p.썸네일 || "",
        });
      } else {
        setError("게시글을 불러오지 못했습니다: " + (data.error || ""));
      }
    } catch (err: any) {
      setError("불러오기 오류: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (postId) loadPost(postId);
  }, [postId, loadPost]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSave() {
    if (!form.제목.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!form.카테고리) {
      setError("카테고리를 선택해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    const token = getAuthToken();
    const method = postId ? "PUT" : "POST";
    const body = postId ? { id: postId, ...form } : { ...form };

    try {
      const res = await fetch(`${API_BASE}/api/board`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/board");
      } else {
        setError("저장 실패: " + (data.error || "알 수 없는 오류"));
      }
    } catch (err: any) {
      setError("저장 오류: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style jsx>{`
        .editor-wrap {
          max-width: 800px;
          margin: 0 auto;
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
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
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
        }
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
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
        .form-group:last-child {
          margin-bottom: 0;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--n700);
          margin-bottom: 8px;
        }
        .form-group input[type="text"],
        .form-group input[type="url"],
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
          color: var(--n800);
          background: white;
          transition: border-color 0.15s;
        }
        .form-group input[type="text"]:focus,
        .form-group input[type="url"]:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--tp-primary);
          box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
        }
        .form-group textarea {
          min-height: 320px;
          resize: vertical;
          line-height: 1.6;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .toggle-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .toggle {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        .toggle-track {
          position: absolute;
          inset: 0;
          background: var(--n300);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .toggle input:checked + .toggle-track {
          background: var(--tp-primary);
        }
        .toggle-track::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .toggle input:checked + .toggle-track::after {
          transform: translateX(20px);
        }
        .toggle-label {
          font-size: 14px;
          color: var(--n700);
          cursor: pointer;
          user-select: none;
        }
        .error-box {
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          font-size: 14px;
          color: #dc2626;
          margin-bottom: 16px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        .btn-primary:hover:not(:disabled) {
          background: var(--tp-primary-dark);
        }
        .loading-state {
          text-align: center;
          padding: 60px 40px;
          color: var(--n400);
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          .page-header {
            flex-direction: column;
            gap: 16px;
          }
          .header-actions {
            width: 100%;
            justify-content: flex-end;
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

        <div className="page-header">
          <div>
            <h1 className="page-title">
              {postId ? "게시글 수정" : "새 글 작성"}
            </h1>
            <p className="page-sub">
              {postId ? `게시글 ID: ${postId}` : "새 게시글을 작성합니다"}
            </p>
          </div>
          <div className="header-actions">
            <Link href="/dashboard/board" className="btn btn-secondary">
              취소
            </Link>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  저장 중...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {postId ? "수정 저장" : "게시글 등록"}
                </>
              )}
            </button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="loading-state">게시글을 불러오는 중...</div>
        ) : (
          <div className="panel">
            <div className="form-group">
              <label htmlFor="제목">제목</label>
              <input
                id="제목"
                type="text"
                name="제목"
                value={form.제목}
                onChange={handleChange}
                placeholder="게시글 제목을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="요약">요약</label>
              <input
                id="요약"
                type="text"
                name="요약"
                value={form.요약}
                onChange={handleChange}
                placeholder="목록에 표시될 짧은 요약을 입력하세요"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="카테고리">카테고리</label>
                <select
                  id="카테고리"
                  name="카테고리"
                  value={form.카테고리}
                  onChange={handleChange}
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="썸네일">썸네일 URL</label>
                <input
                  id="썸네일"
                  type="url"
                  name="썸네일"
                  value={form.썸네일}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="내용">내용</label>
              <textarea
                id="내용"
                name="내용"
                value={form.내용}
                onChange={handleChange}
                placeholder="게시글 본문을 입력하세요..."
              />
            </div>

            <div className="form-group">
              <label>공개여부</label>
              <div className="toggle-wrap">
                <label className="toggle" htmlFor="공개여부">
                  <input
                    id="공개여부"
                    type="checkbox"
                    name="공개여부"
                    checked={form.공개여부}
                    onChange={handleChange}
                  />
                  <span className="toggle-track" />
                </label>
                <span className="toggle-label">
                  {form.공개여부 ? "게시 (공개)" : "비공개"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
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
