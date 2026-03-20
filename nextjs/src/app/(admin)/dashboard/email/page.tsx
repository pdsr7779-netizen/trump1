"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  amount: string;
  fundType: string;
  date: string;
  status: string;
}

export default function EmailPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState("receipt");
  const [senderName, setSenderName] = useState("트럼프 파트너스");
  const [subject, setSubject] = useState(
    "[트럼프 파트너스] 무료진단 신청이 접수되었습니다",
  );
  const [staffName, setStaffName] = useState("트럼프 파트너스");
  const [extraMsg, setExtraMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLeads(
        (data.leads || []).map((raw: any) => ({
          id: raw.id,
          name: raw.fldHwYTsWree2KGQe || raw.CEO || "-",
          company: raw.fld76EQt8pI5wZT2f || raw.Company || "-",
          phone: raw.fldz2CTRYIERdRTgh || raw.Phone || "-",
          email: raw.fldi1pKqTFx1DwVQs || raw.Email || "",
          amount: raw.fldxUOfkeU8tLP9m4 || raw.FundAmount || "-",
          fundType: raw.fldtSYYIXPTlSJcDT || raw.FundType || "-",
          date: (raw.fld9EGNbrLeCpefTx || "").split("T")[0] || "-",
          status: "pending",
        })),
      );
    } catch {}
  }

  const filtered = leads.filter((l) => {
    if (filter === "email-only" && (!l.email || !l.email.includes("@")))
      return false;
    if (filter === "pending" && l.status !== "pending") return false;
    if (search) {
      const kw = search.toLowerCase();
      return (
        l.name.toLowerCase().includes(kw) ||
        l.company.toLowerCase().includes(kw) ||
        l.email.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    const emailLeads = filtered.filter((l) => l.email && l.email.includes("@"));
    const allSelected = emailLeads.every((l) => selected.has(l.id));
    const next = new Set(selected);
    emailLeads.forEach((l) =>
      allSelected ? next.delete(l.id) : next.add(l.id),
    );
    setSelected(next);
  };

  const selectTemplate = (t: string) => {
    setTemplate(t);
    const subjects: Record<string, string> = {
      receipt: "[트럼프 파트너스] 무료진단 신청이 접수되었습니다",
      progress: "[트럼프 파트너스] 정책자금 심사 진행안내",
      approval: "[트럼프 파트너스] 정책자금 승인 안내",
      custom: "[트럼프 파트너스] ",
    };
    setSubject(subjects[t] || "");
  };

  const sendEmails = async () => {
    if (sending || selected.size === 0) return;
    const targets = leads.filter(
      (l) => selected.has(l.id) && l.email?.includes("@"),
    );
    if (targets.length === 0) {
      alert("유효한 이메일 주소가 없습니다.");
      return;
    }
    if (!confirm(`${targets.length}명에게 이메일을 발송하시겠습니까?`)) return;
    setSending(true);
    // Mock send
    await new Promise((r) => setTimeout(r, 1000));
    alert(`${targets.length}건 이메일 발송 완료! (목업)`);
    setSending(false);
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
        .email-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
          align-items: start;
        }
        .panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--n200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .panel-header h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--n800);
        }
        .panel-body {
          padding: 20px;
        }
        .badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          background: var(--tp-primary-light);
          color: var(--tp-primary);
        }
        .search-box {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .search-box:focus {
          border-color: var(--tp-primary);
        }
        .filter-btns {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 4px 10px;
          font-size: 12px;
          border: 1px solid var(--n200);
          border-radius: 4px;
          background: white;
          cursor: pointer;
          color: var(--n600);
        }
        .filter-btn.active {
          background: var(--tp-primary-light);
          border-color: var(--tp-primary);
          color: var(--tp-primary);
        }
        .recipient-list {
          max-height: 480px;
          overflow-y: auto;
        }
        .recipient-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .recipient-item:hover {
          background: var(--n50);
        }
        .recipient-item.sel {
          background: var(--tp-primary-light);
        }
        .recipient-item input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--tp-primary);
          cursor: pointer;
          flex-shrink: 0;
        }
        .r-info {
          flex: 1;
          min-width: 0;
        }
        .r-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--n800);
        }
        .r-company {
          font-size: 12px;
          color: var(--n500);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .r-email {
          font-size: 11px;
          color: var(--n400);
        }
        .selected-count {
          padding: 12px 16px;
          border-top: 1px solid var(--n200);
          font-size: 12px;
          color: var(--n500);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .selected-count strong {
          color: var(--tp-primary);
        }
        .tmpl-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        .tmpl-card {
          padding: 12px;
          border: 2px solid var(--n200);
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }
        .tmpl-card:hover {
          border-color: var(--n300);
        }
        .tmpl-card.active {
          border-color: var(--tp-gold);
          background: rgba(201, 168, 76, 0.1);
        }
        .tmpl-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .tmpl-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--n700);
        }
        .tmpl-desc {
          font-size: 11px;
          color: var(--n500);
          margin-top: 2px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--n700);
          margin-bottom: 6px;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .form-group input:focus,
        .form-group textarea:focus {
          border-color: var(--tp-primary);
        }
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }
        .divider {
          border: none;
          border-top: 1px solid var(--n200);
          margin: 20px 0;
        }
        .btn-send {
          width: 100%;
          padding: 12px;
          background: var(--tp-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 16px;
        }
        .btn-send:hover {
          background: var(--tp-primary-dark);
        }
        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @media (max-width: 768px) {
          .email-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <h1 className="page-title">이메일 발송</h1>
      <p className="page-sub">접수 고객에게 맞춤 이메일을 발송하세요</p>

      <div className="email-layout">
        <div className="panel">
          <div className="panel-header">
            <h3>수신자 선택</h3>
            <span className="badge">{leads.length}건</span>
          </div>
          <div className="panel-body">
            <input
              className="search-box"
              placeholder="이름, 기업명, 이메일 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-btns">
              {[
                ["all", "전체"],
                ["pending", "신규"],
                ["email-only", "이메일 있는 건만"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className={`filter-btn ${filter === v ? "active" : ""}`}
                  onClick={() => setFilter(v)}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="recipient-list">
              {filtered.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "var(--n400)",
                    fontSize: "13px",
                  }}
                >
                  해당하는 수신자가 없습니다.
                </div>
              ) : (
                filtered.map((lead) => {
                  const hasEmail = lead.email && lead.email.includes("@");
                  const isSel = selected.has(lead.id);
                  return (
                    <label
                      key={lead.id}
                      className={`recipient-item ${isSel ? "sel" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSel}
                        disabled={!hasEmail}
                        onChange={() => toggleSelect(lead.id)}
                      />
                      <div className="r-info">
                        <div className="r-name">{lead.name}</div>
                        <div className="r-company">{lead.company}</div>
                        <div className="r-email">
                          {hasEmail ? lead.email : "이메일 없음"}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <div className="selected-count">
            <span>
              선택 <strong>{selected.size}</strong> / {filtered.length} 명
            </span>
            <button className="filter-btn" onClick={selectAll}>
              전체 선택
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>메일 작성</h3>
          </div>
          <div className="panel-body">
            <div className="tmpl-cards">
              {[
                ["receipt", "접수 확인", "상담신청 접수 안내"],
                ["progress", "진행 안내", "심사 진행상황 안내"],
                ["approval", "승인 축하", "자금 승인 안내"],
                ["custom", "직접 작성", "자유 형식 메일"],
              ].map(([k, l, d]) => (
                <div
                  key={k}
                  className={`tmpl-card ${template === k ? "active" : ""}`}
                  onClick={() => selectTemplate(k)}
                >
                  <div className="tmpl-label">{l}</div>
                  <div className="tmpl-desc">{d}</div>
                </div>
              ))}
            </div>
            <hr className="divider" />
            <div className="form-group">
              <label>보내는 이름</label>
              <input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="발신자 표시명"
              />
            </div>
            <div className="form-group">
              <label>제목</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="이메일 제목"
              />
            </div>
            <hr className="divider" />
            <div className="form-group">
              <label>담당자명</label>
              <input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="담당자명"
              />
            </div>
            <div className="form-group">
              <label>추가 메시지 (선택)</label>
              <textarea
                value={extraMsg}
                onChange={(e) => setExtraMsg(e.target.value)}
                placeholder="이메일 하단에 추가할 메시지를 입력하세요."
              />
            </div>
            <button
              className="btn-send"
              onClick={sendEmails}
              disabled={sending || selected.size === 0}
            >
              {sending
                ? "발송 중..."
                : selected.size > 0
                  ? `${selected.size}명에게 발송`
                  : "수신자를 선택하세요"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
