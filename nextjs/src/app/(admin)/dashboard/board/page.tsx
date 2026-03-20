"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  views: number;
  published: boolean;
  thumbnail: string;
}

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtered, setFiltered] = useState<Post[]>([]);
  const [category, setCategory] = useState("전체");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;
  const categories = ["전체", "공지사항", "정책자금", "마케팅소식", "기업지원"];

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/board?admin=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const mapped = (data.posts || []).map((p: any) => ({
          id: p.id,
          slug: p.슬러그 || "",
          title: p.제목 || "",
          category: p.카테고리 || "",
          date: p.작성일 || "",
          views: p.조회수 || 0,
          published: p.게시여부 || false,
          thumbnail: p.썸네일URL || p.썸네일 || "",
        }));
        setPosts(mapped);
        setFiltered(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setFiltered(
      category === "전체"
        ? posts
        : posts.filter((p) => p.category === category),
    );
    setPage(1);
  }, [category, posts]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const deletePost = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/api/board`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        alert("삭제되었습니다.");
      } else alert("삭제 실패: " + (data.error || ""));
    } catch (err: any) {
      alert("삭제 오류: " + err.message);
    }
  };

  const getCatClass = (cat: string) =>
    ({
      공지사항: "complete",
      정책자금: "progress",
      마케팅소식: "pending",
      기업지원: "complete",
    })[cat] || "";
  const fmtDate = (d: string) => {
    if (!d) return "-";
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };

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
        .board-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--n100);
          overflow-x: auto;
        }
        .tab {
          padding: 10px 20px;
          background: var(--n100);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--n600);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .tab:hover {
          background: var(--n200);
        }
        .tab.active {
          background: var(--tp-primary);
          color: white;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--n800);
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--tp-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: var(--tp-primary-dark);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid var(--n100);
        }
        th {
          font-size: 13px;
          font-weight: 600;
          color: var(--n500);
          background: var(--n50);
        }
        td {
          font-size: 14px;
          color: var(--n700);
        }
        tbody tr:hover {
          background: var(--n50);
        }
        .thumb {
          width: 80px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
          background: var(--n100);
        }
        .thumb-ph {
          width: 80px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--n100);
          border-radius: 6px;
          color: var(--n400);
        }
        .post-title {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .post-title a {
          color: var(--n800);
          text-decoration: none;
          font-weight: 500;
        }
        .post-title a:hover {
          color: var(--tp-primary);
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge.pending {
          background: #fef3c7;
          color: #d97706;
        }
        .badge.progress {
          background: #dbeafe;
          color: #2563eb;
        }
        .badge.complete {
          background: #d1fae5;
          color: #059669;
        }
        .btn-icon {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--n100);
          border: none;
          border-radius: 4px;
          color: var(--n600);
          cursor: pointer;
          margin-right: 4px;
        }
        .btn-icon:hover {
          background: var(--n200);
        }
        .btn-icon-danger:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--n100);
        }
        .pg-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--n100);
          border: none;
          border-radius: 8px;
          color: var(--n600);
          cursor: pointer;
        }
        .pg-btn:hover:not(:disabled) {
          background: var(--tp-primary);
          color: white;
        }
        .pg-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .empty {
          text-align: center;
          padding: 40px;
          color: var(--n400);
        }
      `}</style>

      <h1 className="page-title">게시판 관리</h1>
      <p className="page-sub">게시글 CRUD 관리</p>

      <section className="board-section">
        <div className="tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="section-header">
          <h3 className="section-title">게시글 관리</h3>
          <Link href="/dashboard/board/edit" className="btn-primary">
            글 작성
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 90 }}>썸네일</th>
                <th>제목</th>
                <th style={{ width: 90 }}>카테고리</th>
                <th style={{ width: 110 }}>작성일</th>
                <th style={{ width: 90 }}>조회수</th>
                <th style={{ width: 90 }}>상태</th>
                <th style={{ width: 110 }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty">
                    게시글을 불러오는 중...
                  </td>
                </tr>
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                pageData.map((post) => (
                  <tr key={post.id}>
                    <td>
                      {post.thumbnail ? (
                        <img
                          src={
                            post.thumbnail.startsWith("http")
                              ? post.thumbnail
                              : "/" + post.thumbnail.replace(/^\//, "")
                          }
                          alt=""
                          className="thumb"
                        />
                      ) : (
                        <div className="thumb-ph">
                          <svg
                            width="20"
                            height="20"
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
                      )}
                    </td>
                    <td className="post-title">
                      <Link href={`/dashboard/board/edit?id=${post.id}`}>
                        {post.title || "(제목 없음)"}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${getCatClass(post.category)}`}>
                        {post.category || "-"}
                      </span>
                    </td>
                    <td>{fmtDate(post.date)}</td>
                    <td>{(post.views || 0).toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${post.published ? "complete" : "pending"}`}
                      >
                        {post.published ? "게시중" : "비공개"}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/board/edit?id=${post.id}`}
                        className="btn-icon"
                        title="수정"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => deletePost(post.id)}
                        title="삭제"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pg-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
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
            </button>
            <span style={{ fontSize: 14, color: "var(--n600)" }}>
              {page} / {totalPages} 페이지
            </span>
            <button
              className="pg-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </>
  );
}
