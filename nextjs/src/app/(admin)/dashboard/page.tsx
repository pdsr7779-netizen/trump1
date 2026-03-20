"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

function getStatusClass(status: string) {
  const classes: Record<string, string> = {
    신규: "pending",
    대기중: "pending",
    상담중: "progress",
    진행중: "progress",
    완료: "complete",
  };
  return classes[status] || "pending";
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: "-",
    pending: "-",
    completed: "-",
    posts: "-",
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = getAuthToken();
    if (!token) return;
    const headers = { Authorization: "Bearer " + token };

    try {
      const res = await fetch(`${API_BASE}/api/leads`, { headers });
      if (res.ok) {
        const data = await res.json();
        const leads = data.leads || [];
        const total = leads.length;
        const pending = leads.filter(
          (l: any) =>
            !l.fldStatus || l.fldStatus === "신규" || l.fldStatus === "대기중",
        ).length;
        const completed = leads.filter(
          (l: any) => l.fldStatus === "완료",
        ).length;
        setStats({
          total: String(total),
          pending: String(pending),
          completed: String(completed),
          posts: "-",
        });
        setRecentLeads(leads.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

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
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--n200);
          transition: all 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          border-color: var(--tp-primary);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon.inbox {
          background: #fee2e2;
          color: #dc2626;
        }
        .stat-icon.clock {
          background: #e8eef6;
          color: #1b2b4b;
        }
        .stat-icon.check {
          background: #d1fae5;
          color: #059669;
        }
        .stat-icon.doc {
          background: #fef3c7;
          color: #d97706;
        }
        .stat-label {
          font-size: 14px;
          color: var(--n500);
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--n900);
        }
        .recent-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--n200);
          margin-bottom: 20px;
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
        .section-link {
          font-size: 14px;
          color: var(--tp-primary);
          text-decoration: none;
        }
        .section-link:hover {
          text-decoration: underline;
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
        .loading-text {
          text-align: center;
          padding: 40px;
          color: var(--n400);
        }
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .stat-card {
            padding: 16px;
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
          .stat-icon {
            width: 40px;
            height: 40px;
            margin: 0 auto;
          }
          .stat-value {
            font-size: 22px;
          }
          .page-title {
            font-size: 20px;
          }
        }
      `}</style>

      <h1 className="page-title">대시보드</h1>
      <p className="page-sub">실시간 현황을 확인하세요</p>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon inbox">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
          </div>
          <div>
            <p className="stat-label">전체 접수</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon clock">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="stat-label">대기 중</p>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon check">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <p className="stat-label">완료</p>
            <p className="stat-value">{stats.completed}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon doc">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <p className="stat-label">게시글 수</p>
            <p className="stat-value">{stats.posts}</p>
          </div>
        </div>
      </section>

      <section className="recent-section">
        <div className="section-header">
          <h3 className="section-title">최근 접수 내역</h3>
          <Link href="/dashboard/leads" className="section-link">
            전체보기 &rarr;
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>접수일</th>
                <th>기업명</th>
                <th>대표자</th>
                <th>연락처</th>
                <th>필요자금</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="loading-text">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="loading-text">
                    접수 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead: any, i: number) => {
                  const company =
                    lead.fld76EQt8pI5wZT2f || lead["기업명"] || "-";
                  const name =
                    lead.fldHwYTsWree2KGQe || lead["대표자명"] || "-";
                  const phone = lead.fldz2CTRYIERdRTgh || lead["연락처"] || "-";
                  const amount =
                    lead.fldxUOfkeU8tLP9m4 || lead["희망자금"] || "-";
                  const dateRaw =
                    lead.fld9EGNbrLeCpefTx || lead["접수일시"] || "";
                  const date = dateRaw ? dateRaw.split("T")[0] : "-";
                  const status = lead.fldStatus || "신규";
                  return (
                    <tr key={i}>
                      <td>{date}</td>
                      <td>{company}</td>
                      <td>{name}</td>
                      <td>{phone}</td>
                      <td>{amount}</td>
                      <td>
                        <span className={`badge ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
