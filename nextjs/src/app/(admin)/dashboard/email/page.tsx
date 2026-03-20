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
  callTime: string;
  date: string;
  status: string;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ──────────────────────────────────────────────
   bizup 스타일 이메일 템플릿 (트럼프 Navy/Gold 컬러)
   ────────────────────────────────────────────── */
function buildEmailHTML(
  type: string,
  lead: Lead,
  opts: { staffName: string; extraMsg: string; deadline: string },
) {
  const { staffName, extraMsg, deadline } = opts;

  const NAVY = "#1B2B4B";
  const NAVY_DARK = "#111D33";
  const GOLD = "#C9A84C";
  const GOLD_LIGHT = "#f7f0de";

  const greetings: Record<string, string> = {
    receipt: `안녕하세요, <strong>${esc(lead.name)}</strong>님! 정책자금 상담신청이 정상적으로 접수되었습니다. 영업일기준 24시간 이내 담당 기업심사관이 연락드리겠습니다.`,
    progress: `안녕하세요, <strong>${esc(lead.name)}</strong>님! 신청하신 정책자금 심사가 현재 <strong>진행 중</strong>입니다. 담당 기업심사관이 검토 후 결과를 안내드리겠습니다.`,
    approval: `안녕하세요, <strong>${esc(lead.name)}</strong>님! 축하합니다! 신청하신 정책자금이 <strong>승인</strong>되었습니다. 아래 내용을 확인하시고 담당자에게 연락주시기 바랍니다.`,
    custom: `안녕하세요, <strong>${esc(lead.name)}</strong>님!`,
  };

  const ctaMessages: Record<string, string> = {
    receipt: `영업일기준 <strong>24시간 이내</strong> 트럼프 파트너스에서 연락드리겠습니다.`,
    progress: `심사 진행 중 추가 서류 필요 시 <strong>담당자가 별도 안내</strong>드리겠습니다.`,
    approval: `<strong>축하합니다!</strong> 자세한 내용은 담당자에게 문의해주세요.`,
    custom: `궁금하신 사항은 언제든 연락주세요.`,
  };

  const headerTitles: Record<string, string> = {
    receipt: "무료 상담 신청이 접수되었습니다",
    progress: "정책자금 심사 진행안내",
    approval: "정책자금 승인을 축하합니다!",
    custom: "트럼프 파트너스 안내",
  };

  let extraSection = "";
  if (extraMsg) {
    extraSection = `
      <div style="background:${GOLD_LIGHT}; padding:10px 20px; margin:0 20px 8px; border-left:3px solid ${GOLD}; border-radius:4px;">
        <p style="font-size:12px; color:#404040; line-height:1.6; margin:0;">${esc(extraMsg).replace(/\n/g, "<br>")}</p>
      </div>`;
  }

  return `
<div style="font-family:-apple-system,'Helvetica Neue','맑은고딕',sans-serif; max-width:580px; margin:0 auto; background:#ffffff;">
  <div style="background:${NAVY_DARK}; padding:14px 20px;">
    <p style="margin:0; color:${GOLD}; font-size:13px; font-weight:700; letter-spacing:3px;">TRUMP PARTNERS</p>
    <p style="margin:2px 0 0; color:rgba(255,255,255,0.45); font-size:9px; letter-spacing:2px;">정부정책자금 경영컨설팅</p>
  </div>
  <div style="background:${GOLD_LIGHT}; border-left:3px solid ${GOLD}; padding:7px 20px; font-size:11px; color:${NAVY}; font-weight:600;">
    ${esc(headerTitles[type] || headerTitles.custom)}
  </div>
  <div style="padding:14px 20px 10px;">
    <div style="background:#f9fafb; padding:12px; border-left:3px solid ${GOLD}; border-radius:0 6px 6px 0;">
      <p style="margin:0; color:#404040; line-height:1.6; font-size:13px;">${greetings[type] || greetings.custom}</p>
    </div>
  </div>
  <div style="padding:0 20px 10px;">
    <p style="margin:0 0 6px; font-size:9px; font-weight:600; letter-spacing:2px; color:#999; padding-bottom:5px; border-bottom:1px solid #f0f0f0;">신청 정보</p>
    <table style="width:100%; border-collapse:collapse;">
      <tr style="border-bottom:1px solid #f5f5f5;">
        <td style="padding:5px 0; font-size:11px; color:#999; width:28%;">기업명</td>
        <td style="padding:5px 0; font-size:13px; color:${NAVY}; font-weight:600;">${esc(lead.company)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f5f5f5;">
        <td style="padding:5px 0; font-size:11px; color:#999;">연락처</td>
        <td style="padding:5px 0; font-size:13px; color:#1a1a1a;">${esc(lead.phone)}</td>
      </tr>
      <tr style="border-bottom:1px solid #f5f5f5;">
        <td style="padding:5px 0; font-size:11px; color:#999;">희망자금</td>
        <td style="padding:5px 0; font-size:13px; color:#1a1a1a;">${esc(lead.amount)}</td>
      </tr>
      ${lead.fundType && lead.fundType !== "-" ? `<tr style="border-bottom:1px solid #f5f5f5;"><td style="padding:5px 0; font-size:11px; color:#999;">자금종류</td><td style="padding:5px 0; font-size:13px; color:#1a1a1a;">${esc(lead.fundType)}</td></tr>` : ""}
      ${lead.callTime && lead.callTime !== "-" ? `<tr style="border-bottom:1px solid #f5f5f5;"><td style="padding:5px 0; font-size:11px; color:#999;">연락시간</td><td style="padding:5px 0; font-size:13px; color:#1a1a1a;">${esc(lead.callTime)}</td></tr>` : ""}
      ${deadline ? `<tr style="border-bottom:1px solid #f5f5f5;"><td style="padding:5px 0; font-size:11px; color:#999;">마감일</td><td style="padding:5px 0; font-size:13px; color:#1a1a1a;">${esc(deadline)}</td></tr>` : ""}
    </table>
  </div>
  ${extraSection}
  <div style="padding:10px 20px; background:${GOLD_LIGHT}; border-top:1px solid rgba(201,168,76,0.15);">
    <p style="margin:0; color:${NAVY}; font-weight:600; font-size:12px; line-height:1.5; text-align:center;">${ctaMessages[type] || ctaMessages.custom}</p>
  </div>
  <div style="padding:8px 20px; background:#fafafa; border-top:1px solid #f0f0f0;">
    <p style="margin:0; font-size:11px; color:#555; text-align:center;">문의: <strong style="color:${NAVY};">${esc(staffName || "트럼프 파트너스")}</strong> | 대표전화: <strong>1844-1053</strong></p>
  </div>
  <div style="padding:8px 20px; background:${NAVY_DARK};">
    <p style="margin:0; font-size:9px; color:rgba(255,255,255,0.35); text-align:center;">트럼프 파트너스 | trump1.co.kr | 이 메일에 회신하시면 담당자에게 전달됩니다.</p>
  </div>
</div>`;
}

export default function EmailPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState("receipt");
  const [senderName, setSenderName] = useState("트럼프 파트너스");
  const [subject, setSubject] = useState(
    "[트럼프 파트너스] 무료 상담 신청이 접수되었습니다",
  );
  const [staffName, setStaffName] = useState("트럼프 파트너스");
  const [extraMsg, setExtraMsg] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sending, setSending] = useState(false);
  const [sendLog, setSendLog] = useState<{ email: string; ok: boolean }[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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
          name: raw.name || "-",
          company: raw.company || "-",
          phone: raw.phone || "-",
          email: raw.email || "",
          amount: raw.amount || "-",
          fundType: raw.fundType || "-",
          callTime: raw.consultTime || "-",
          date: (raw.createdAt || "").split("T")[0] || "-",
          status: raw.status || "신규",
        })),
      );
    } catch {}
  }

  const filtered = leads.filter((l) => {
    if (filter === "email-only" && (!l.email || !l.email.includes("@")))
      return false;
    if (filter === "pending" && l.status !== "신규") return false;
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
      receipt: "[트럼프 파트너스] 무료 상담 신청이 접수되었습니다",
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
    setSendLog([]);

    for (const lead of targets) {
      const html = buildEmailHTML(template, lead, {
        staffName,
        extraMsg,
        deadline,
      });
      try {
        const res = await fetch(`${API_BASE}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: lead.email, subject, html, senderName }),
        });
        const data = await res.json();
        setSendLog((prev) => [
          ...prev,
          { email: lead.email, ok: data.success },
        ]);
      } catch {
        setSendLog((prev) => [...prev, { email: lead.email, ok: false }]);
      }
      // 500ms 간격으로 발송 (rate limit 방지)
      await new Promise((r) => setTimeout(r, 500));
    }

    setSending(false);
    alert(`${targets.length}건 이메일 발송 완료!`);
  };

  const previewLead = leads.find((l) => selected.has(l.id)) || {
    id: "",
    name: "홍길동",
    company: "테스트기업",
    phone: "010-1234-5678",
    email: "test@example.com",
    amount: "1억원",
    fundType: "운전자금",
    callTime: "오전 10:00",
    date: "2026-03-20",
    status: "신규",
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
          grid-template-columns: 300px 1fr 380px;
          gap: 16px;
          align-items: start;
        }
        .panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .panel-header {
          padding: 14px 18px;
          border-bottom: 1px solid var(--n200);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .panel-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--n800);
        }
        .panel-body {
          padding: 16px;
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
          padding: 8px 12px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          margin-bottom: 10px;
          box-sizing: border-box;
        }
        .search-box:focus {
          border-color: var(--tp-primary);
        }
        .filter-btns {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 4px 10px;
          font-size: 11px;
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
          max-height: 420px;
          overflow-y: auto;
        }
        .recipient-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 6px;
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
          width: 15px;
          height: 15px;
          accent-color: var(--tp-primary);
          cursor: pointer;
          flex-shrink: 0;
        }
        .r-info {
          flex: 1;
          min-width: 0;
        }
        .r-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--n800);
        }
        .r-company {
          font-size: 11px;
          color: var(--n500);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .r-email {
          font-size: 10px;
          color: var(--n400);
        }
        .selected-count {
          padding: 10px 14px;
          border-top: 1px solid var(--n200);
          font-size: 11px;
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
          gap: 6px;
          margin-bottom: 16px;
        }
        .tmpl-card {
          padding: 10px;
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
          background: rgba(201, 168, 76, 0.08);
        }
        .tmpl-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--n700);
        }
        .tmpl-desc {
          font-size: 10px;
          color: var(--n500);
          margin-top: 2px;
        }
        .form-group {
          margin-bottom: 12px;
        }
        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--n700);
          margin-bottom: 4px;
        }
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
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
          min-height: 60px;
          font-family: inherit;
        }
        .divider {
          border: none;
          border-top: 1px solid var(--n200);
          margin: 14px 0;
        }
        .btn-row {
          display: flex;
          gap: 8px;
          margin-top: 14px;
        }
        .btn-preview {
          flex: 1;
          padding: 10px;
          background: var(--n200);
          color: var(--n700);
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-preview:hover {
          background: var(--n300);
        }
        .btn-send {
          flex: 2;
          padding: 10px;
          background: var(--tp-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-send:hover {
          background: var(--tp-primary-dark);
        }
        .btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .preview-panel {
          border: 1px solid var(--n200);
          border-radius: 12px;
          overflow: hidden;
          background: #f5f5f5;
        }
        .preview-header {
          padding: 10px 16px;
          background: var(--n100);
          border-bottom: 1px solid var(--n200);
          font-size: 12px;
          font-weight: 600;
          color: var(--n600);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-meta {
          padding: 8px 16px;
          background: white;
          border-bottom: 1px solid var(--n100);
          font-size: 11px;
          color: var(--n500);
        }
        .preview-body {
          padding: 12px;
          background: #f9f9f9;
          max-height: 600px;
          overflow-y: auto;
        }
        .send-log {
          margin-top: 12px;
          max-height: 120px;
          overflow-y: auto;
          font-size: 11px;
        }
        .send-log-item {
          padding: 3px 0;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .send-log-ok {
          color: #059669;
        }
        .send-log-fail {
          color: #dc2626;
        }
        @media (max-width: 1200px) {
          .email-layout {
            grid-template-columns: 280px 1fr;
          }
          .preview-panel-wrapper {
            display: none;
          }
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
        {/* 좌: 수신자 목록 */}
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
              {(
                [
                  ["all", "전체"],
                  ["pending", "신규"],
                  ["email-only", "이메일 있는 건만"],
                ] as const
              ).map(([v, l]) => (
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
                    fontSize: 13,
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

        {/* 중: 메일 작성 */}
        <div className="panel">
          <div className="panel-header">
            <h3>메일 작성</h3>
          </div>
          <div className="panel-body">
            <div className="tmpl-cards">
              {(
                [
                  ["receipt", "접수 확인", "상담신청 접수 안내"],
                  ["progress", "진행 안내", "심사 진행상황 안내"],
                  ["approval", "승인 축하", "자금 승인 안내"],
                  ["custom", "직접 작성", "자유 형식 메일"],
                ] as const
              ).map(([k, l, d]) => (
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
              <label>마감일 (선택)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>추가 메시지 (선택)</label>
              <textarea
                value={extraMsg}
                onChange={(e) => setExtraMsg(e.target.value)}
                placeholder="이메일 본문에 추가할 메시지"
              />
            </div>

            {sendLog.length > 0 && (
              <div className="send-log">
                {sendLog.map((log, i) => (
                  <div
                    key={i}
                    className={`send-log-item ${log.ok ? "send-log-ok" : "send-log-fail"}`}
                  >
                    {log.ok ? "✓" : "✕"} {log.email}
                  </div>
                ))}
              </div>
            )}

            <div className="btn-row">
              <button
                className="btn-preview"
                onClick={() => setShowPreview(true)}
                disabled={selected.size === 0}
              >
                미리보기
              </button>
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

        {/* 우: 실시간 미리보기 (PC) */}
        <div className="preview-panel-wrapper">
          <div className="preview-panel">
            <div className="preview-header">
              <span>실시간 미리보기</span>
              <span style={{ fontSize: 10, color: "var(--n400)" }}>
                수신자 기준
              </span>
            </div>
            <div className="preview-meta">
              <div>
                제목: <strong>{subject}</strong>
              </div>
              <div>발신: {senderName} &lt;pdsr7779@gmail.com&gt;</div>
            </div>
            <div className="preview-body">
              <div
                dangerouslySetInnerHTML={{
                  __html: buildEmailHTML(template, previewLead, {
                    staffName,
                    extraMsg,
                    deadline,
                  }),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid var(--n200)",
              }}
            >
              <h3
                style={{ fontSize: 15, fontWeight: 700, color: "var(--n900)" }}
              >
                이메일 미리보기
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "var(--n500)",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                padding: "10px 20px",
                background: "var(--n50)",
                borderBottom: "1px solid var(--n200)",
                fontSize: 12,
              }}
            >
              <div style={{ color: "var(--n500)", marginBottom: 4 }}>
                제목:{" "}
                <strong style={{ color: "var(--n800)" }}>{subject}</strong>
              </div>
              <div style={{ color: "var(--n500)" }}>
                발신: {senderName} &lt;pdsr7779@gmail.com&gt;
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: buildEmailHTML(template, previewLead, {
                    staffName,
                    extraMsg,
                    deadline,
                  }),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
