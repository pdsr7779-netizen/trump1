"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  department: string;
  photo: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(
          (data.employees || []).map((e: any) => ({
            id: e.id || "",
            name: e.이름 || e.name || "-",
            position: e.직급 || e.position || "-",
            phone: e.연락처 || e.phone || "-",
            email: e.이메일 || e.email || "",
            department: e.부서 || e.department || "-",
            photo: e.프로필URL || e.photo || "",
          })),
        );
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
        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
          vertical-align: middle;
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
        .emp-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .emp-photo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--n100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--n400);
          font-size: 18px;
          overflow: hidden;
        }
        .emp-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .emp-name {
          font-weight: 600;
          color: var(--n800);
        }
        .emp-pos {
          font-size: 13px;
          color: var(--n500);
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
        .empty {
          text-align: center;
          padding: 40px;
          color: var(--n400);
        }
      `}</style>

      <h1 className="page-title">임직원 관리</h1>
      <p className="page-sub">팀원 정보를 관리합니다</p>

      <section className="section">
        <div className="section-header">
          <h3 className="section-title">임직원 목록</h3>
          <button
            className="btn-primary"
            onClick={() => alert("임직원 추가 기능은 API 연결 후 동작합니다.")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            임직원 추가
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>이름/직급</th>
                <th>부서</th>
                <th>연락처</th>
                <th>이메일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">
                    등록된 임직원이 없습니다.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-cell">
                        <div className="emp-photo">
                          {emp.photo ? (
                            <img src={emp.photo} alt="" />
                          ) : (
                            emp.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="emp-name">{emp.name}</div>
                          <div className="emp-pos">{emp.position}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.phone}</td>
                    <td>{emp.email || "-"}</td>
                    <td>
                      <button className="btn-icon" title="수정">
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
                      </button>
                      <button className="btn-icon btn-icon-danger" title="삭제">
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
      </section>
    </>
  );
}
