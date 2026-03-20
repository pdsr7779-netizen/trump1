"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/dashboard/leads",
    label: "접수내역",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/email",
    label: "이메일 발송",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/dashboard/board",
    label: "게시판 관리",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/employees",
    label: "임직원 관리",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/dashboard/popups",
    label: "팝업 관리",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "방문통계",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const BOTTOM_NAV = [
  { href: "/dashboard", label: "대시보드", icon: NAV_ITEMS[0].icon },
  { href: "/dashboard/leads", label: "접수", icon: NAV_ITEMS[1].icon },
  { href: "/dashboard/board", label: "게시판", icon: NAV_ITEMS[3].icon },
  { href: "/dashboard/analytics", label: "통계", icon: NAV_ITEMS[6].icon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("trump_admin_token");
      window.location.href = "/admin-login";
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --tp-primary: #1b2b4b;
          --tp-primary-dark: #111d33;
          --tp-primary-light: #e8eef6;
          --tp-primary-hover: #243759;
          --tp-gold: #c9a84c;
          --tp-gold-dark: #8b6914;
          --tp-gold-light: #e2c878;
          --tp-accent: #c9a84c;
          --tp-success: #10b981;
          --tp-warning: #f59e0b;
          --tp-error: #ef4444;
          --n50: #f9fafb;
          --n100: #f3f4f6;
          --n200: #e5e7eb;
          --n300: #d1d5db;
          --n400: #9ca3af;
          --n500: #6b7280;
          --n600: #4b5563;
          --n700: #374151;
          --n800: #1f2937;
          --n900: #111827;
          --sidebar-w: 260px;
        }
        .db-container {
          display: flex;
          min-height: 100vh;
          background: var(--n100);
        }
        .db-sidebar {
          width: var(--sidebar-w);
          background: linear-gradient(180deg, #111d33 0%, #1b2b4b 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          transition: transform 0.3s ease;
        }
        .db-sidebar-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }
        .db-logo {
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .db-logo-gold {
          color: var(--tp-gold);
        }
        .db-logo-sub {
          font-size: 12px;
          color: var(--n400);
          margin-left: 8px;
        }
        .db-sidebar-nav {
          flex: 1;
          padding: 16px 12px;
        }
        .db-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--n400);
          text-decoration: none;
          border-radius: 8px;
          margin-bottom: 4px;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
        }
        .db-nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .db-nav-item.active {
          background: rgba(201, 168, 76, 0.2);
          color: white;
          border-left: 3px solid var(--tp-gold);
        }
        .db-sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        .db-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }
        .db-main {
          flex: 1;
          margin-left: var(--sidebar-w);
          padding: 24px;
        }
        .db-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--n200);
        }
        .db-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .db-page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--n900);
        }
        .db-page-sub {
          font-size: 14px;
          color: var(--n500);
          margin-top: 4px;
        }
        .db-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .db-user {
          font-size: 14px;
          color: var(--n600);
        }
        .db-btn-logout {
          padding: 8px 16px;
          background: var(--n200);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          color: var(--n700);
          cursor: pointer;
          transition: all 0.2s;
        }
        .db-btn-logout:hover {
          background: var(--n300);
        }
        .db-mobile-menu {
          display: none;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: var(--n700);
          cursor: pointer;
          border-radius: 8px;
        }
        .db-mobile-menu:hover {
          background: var(--n100);
        }
        .db-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid var(--n200);
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        .db-bottom-list {
          list-style: none;
          display: flex;
          justify-content: space-around;
          margin: 0;
          padding: 0;
        }
        .db-bottom-item {
          flex: 1;
        }
        .db-bottom-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 4px 8px;
          color: var(--n400);
          text-decoration: none;
          transition: all 0.2s;
          font-size: 10px;
          font-weight: 500;
        }
        .db-bottom-link:hover,
        .db-bottom-link.active {
          color: var(--tp-primary);
        }
        .db-bottom-link.active {
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .db-sidebar {
            transform: translateX(-100%);
          }
          .db-sidebar.open {
            transform: translateX(0);
          }
          .db-overlay.open {
            display: block;
          }
          .db-main {
            margin-left: 0;
            padding: 16px;
            padding-bottom: 80px;
          }
          .db-mobile-menu {
            display: flex;
          }
          .db-bottom-nav {
            display: block;
          }
          .db-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .db-page-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="db-container">
        <div
          className={`db-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`db-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="db-sidebar-header">
            <h1 className="db-logo">
              <span className="db-logo-gold">Trump</span> Partners
            </h1>
            <span className="db-logo-sub">관리자</span>
          </div>

          <nav className="db-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`db-nav-item ${isActive(item.href) ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="db-sidebar-footer">
            <a
              href="https://trump1.co.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="db-nav-item"
            >
              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span>사이트 보기</span>
            </a>
          </div>
        </aside>

        <main className="db-main">
          <header className="db-header">
            <div className="db-header-left">
              <button
                className="db-mobile-menu"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
            <div className="db-header-right">
              <span className="db-user">관리자</span>
              <button className="db-btn-logout" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>

      <nav className="db-bottom-nav">
        <ul className="db-bottom-list">
          {BOTTOM_NAV.map((item) => (
            <li key={item.href} className="db-bottom-item">
              <Link
                href={item.href}
                className={`db-bottom-link ${isActive(item.href) ? "active" : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
