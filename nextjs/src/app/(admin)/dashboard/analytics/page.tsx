"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7");
  const [stats, setStats] = useState({
    visitors: "-",
    pageviews: "-",
    avgTime: "-",
    bounceRate: "-",
  });
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/analytics?days=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats({
          visitors: data.totalVisitors?.toLocaleString() || "-",
          pageviews: data.totalPageviews?.toLocaleString() || "-",
          avgTime: data.avgDuration ? `${Math.round(data.avgDuration)}초` : "-",
          bounceRate: data.bounceRate ? `${data.bounceRate}%` : "-",
        });
        setPages(data.pages || []);
      }
    } catch (err) {
      console.error(err);
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
        .period-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }
        .period-tab {
          padding: 10px 24px;
          background: var(--n100);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--n600);
          cursor: pointer;
          transition: all 0.2s;
        }
        .period-tab:hover {
          background: var(--n200);
        }
        .period-tab.active {
          background: var(--tp-primary);
          color: white;
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
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--n200);
        }
        .stat-label {
          font-size: 14px;
          color: var(--n500);
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--n900);
        }
        .chart-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--n200);
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--n800);
          margin-bottom: 16px;
        }
        .page-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .page-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--n100);
        }
        .page-item:last-child {
          border-bottom: none;
        }
        .page-rank {
          width: 24px;
          height: 24px;
          background: var(--tp-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 12px;
        }
        .page-info {
          flex: 1;
        }
        .page-name {
          font-size: 14px;
          color: var(--n700);
        }
        .page-bar {
          height: 4px;
          background: var(--n100);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 6px;
        }
        .page-bar-fill {
          height: 100%;
          background: var(--tp-primary);
          border-radius: 2px;
        }
        .page-count {
          font-size: 14px;
          font-weight: 600;
          color: var(--n500);
          margin-left: 12px;
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
          }
          .stat-value {
            font-size: 22px;
          }
          .period-tabs {
            overflow-x: auto;
          }
          .period-tab {
            flex-shrink: 0;
            padding: 8px 16px;
            font-size: 13px;
          }
        }
      `}</style>

      <h1 className="page-title">방문통계</h1>
      <p className="page-sub">사이트 방문 현황을 분석합니다</p>

      <div className="period-tabs">
        {[
          ["7", "7일"],
          ["14", "14일"],
          ["30", "30일"],
          ["90", "90일"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={`period-tab ${period === v ? "active" : ""}`}
            onClick={() => setPeriod(v)}
          >
            {l}
          </button>
        ))}
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">방문자</p>
          <p className="stat-value">{stats.visitors}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">페이지뷰</p>
          <p className="stat-value">{stats.pageviews}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">평균 체류시간</p>
          <p className="stat-value">{stats.avgTime}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">이탈률</p>
          <p className="stat-value">{stats.bounceRate}</p>
        </div>
      </section>

      <section className="chart-section">
        <h3 className="section-title">인기 페이지</h3>
        {loading ? (
          <div
            style={{ textAlign: "center", padding: 40, color: "var(--n400)" }}
          >
            데이터를 불러오는 중...
          </div>
        ) : pages.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: 40, color: "var(--n400)" }}
          >
            데이터 없음
          </div>
        ) : (
          <ul className="page-list">
            {pages.slice(0, 10).map((p: any, i: number) => {
              const maxViews = pages[0]?.views || 1;
              const pct = Math.round((p.views / maxViews) * 100);
              return (
                <li key={i} className="page-item">
                  <span className="page-rank">{i + 1}</span>
                  <div className="page-info">
                    <span className="page-name">{p.page}</span>
                    <div className="page-bar">
                      <div
                        className="page-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="page-count">
                    {p.views?.toLocaleString()}회
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="notice">
        차트 시각화는 Chart.js 또는 Recharts 연동 후 추가됩니다.
      </div>
    </>
  );
}
