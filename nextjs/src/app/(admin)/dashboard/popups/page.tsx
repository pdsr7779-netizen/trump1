"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function getAuthToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("trump_admin_token")
    : null;
}

interface Popup {
  id: string;
  제목: string;
  ALT텍스트: string;
  이미지URL: string;
  링크URL: string;
  링크타겟: string;
  순서: number;
  활성여부: boolean;
  시작일: string;
  종료일: string;
}

type StatusKey = "게재중" | "예약됨" | "만료됨" | "비활성";

function getStatus(popup: Popup): StatusKey {
  if (!popup.활성여부) return "비활성";
  const today = new Date().toISOString().slice(0, 10);
  if (popup.시작일 && popup.시작일 > today) return "예약됨";
  if (popup.종료일 && popup.종료일 < today) return "만료됨";
  return "게재중";
}

const STATUS_STYLE: Record<StatusKey, { bg: string; color: string }> = {
  게재중: { bg: "#d1fae5", color: "#059669" },
  예약됨: { bg: "#dbeafe", color: "#2563eb" },
  만료됨: { bg: "#fef3c7", color: "#d97706" },
  비활성: { bg: "var(--n100)", color: "var(--n500)" },
};

const EMPTY_FORM = {
  제목: "",
  이미지URL: "",
  ALT텍스트: "",
  링크URL: "",
  링크타겟: "_blank",
  순서: 0,
  활성여부: true,
  시작일: "",
  종료일: "",
};

export default function PopupsPage() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Popup | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPopups();
  }, []);

  async function loadPopups() {
    setLoading(true);
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/popups?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setPopups(data.popups || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowModal(true);
  }

  function openEdit(popup: Popup) {
    setEditTarget(popup);
    setForm({
      제목: popup.제목 || "",
      이미지URL: popup.이미지URL || "",
      ALT텍스트: popup.ALT텍스트 || "",
      링크URL: popup.링크URL || "",
      링크타겟: popup.링크타겟 || "_blank",
      순서: popup.순서 ?? 0,
      활성여부: popup.활성여부 ?? true,
      시작일: popup.시작일 || "",
      종료일: popup.종료일 || "",
    });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setError("");
  }

  async function handleImageFile(file: File) {
    setUploadingImg(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const fd = new FormData();
        fd.append("base64", base64);
        fd.append("filename", file.name);
        const token = getAuthToken();
        const res = await fetch(`${API_BASE}/api/upload-thumbnail`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setForm((prev) => ({ ...prev, 이미지URL: data.url }));
        } else {
          setError("이미지 업로드 실패: " + (data.error || ""));
        }
        setUploadingImg(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("이미지 업로드 오류: " + err.message);
      setUploadingImg(false);
    }
  }

  async function handleSave() {
    if (!form.제목.trim()) {
      setError("제목을 입력하세요.");
      return;
    }
    setSaving(true);
    setError("");
    const token = getAuthToken();
    try {
      if (editTarget) {
        const res = await fetch(`${API_BASE}/api/popups`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editTarget.id, ...form }),
        });
        const data = await res.json();
        if (data.success) {
          await loadPopups();
          closeModal();
        } else {
          setError("수정 실패: " + (data.error || ""));
        }
      } else {
        const res = await fetch(`${API_BASE}/api/popups`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          await loadPopups();
          closeModal();
        } else {
          setError("등록 실패: " + (data.error || ""));
        }
      }
    } catch (err: any) {
      setError("저장 오류: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(popup: Popup) {
    if (!confirm(`"${popup.제목}" 팝업을 삭제하시겠습니까?`)) return;
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/api/popups?id=${popup.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPopups((prev) => prev.filter((p) => p.id !== popup.id));
      } else {
        alert("삭제 실패: " + (data.error || ""));
      }
    } catch (err: any) {
      alert("삭제 오류: " + err.message);
    }
  }

  const sorted = [...popups].sort((a, b) => (a.순서 ?? 0) - (b.순서 ?? 0));

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
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .count-label {
          font-size: 14px;
          color: var(--n500);
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
        .popup-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
        .popup-img {
          aspect-ratio: 1;
          background: var(--n100);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--n400);
          overflow: hidden;
        }
        .popup-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .popup-info {
          padding: 16px;
        }
        .popup-order {
          font-size: 11px;
          color: var(--n400);
          margin-bottom: 4px;
        }
        .popup-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--n800);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .popup-meta {
          font-size: 12px;
          color: var(--n500);
          margin-bottom: 10px;
        }
        .popup-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .popup-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
        .btn-sm {
          flex: 1;
          padding: 8px 0;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          background: white;
          cursor: pointer;
          color: var(--n600);
          text-align: center;
        }
        .btn-sm:hover {
          background: var(--n50);
        }
        .btn-sm-danger {
          border-color: #fecaca;
          color: #dc2626;
        }
        .btn-sm-danger:hover {
          background: #fee2e2;
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
        .loading-state {
          padding: 60px;
          text-align: center;
          color: var(--n400);
          font-size: 14px;
        }
        /* Modal */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 1;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--n100);
        }
        .modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--n900);
        }
        .modal-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--n100);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: var(--n600);
        }
        .modal-close:hover {
          background: var(--n200);
        }
        .modal-body {
          padding: 20px 24px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--n700);
          margin-bottom: 6px;
        }
        .form-label span {
          color: #dc2626;
          margin-left: 2px;
        }
        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 14px;
          color: var(--n800);
          outline: none;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--tp-primary);
        }
        .form-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 14px;
          color: var(--n800);
          outline: none;
          background: white;
          box-sizing: border-box;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .img-preview {
          margin-top: 8px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--n100);
          max-height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .img-preview img {
          max-width: 100%;
          max-height: 140px;
          object-fit: contain;
        }
        .upload-btn {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid var(--n200);
          border-radius: 8px;
          font-size: 13px;
          background: var(--n50);
          cursor: pointer;
          color: var(--n600);
        }
        .upload-btn:hover {
          background: var(--n100);
        }
        .toggle-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .toggle {
          position: relative;
          width: 44px;
          height: 24px;
          cursor: pointer;
        }
        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-track {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: var(--n200);
          transition: background 0.2s;
        }
        .toggle input:checked + .toggle-track {
          background: var(--tp-primary);
        }
        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: left 0.2s;
        }
        .toggle input:checked ~ .toggle-thumb {
          left: 23px;
        }
        .toggle-label {
          font-size: 14px;
          color: var(--n700);
        }
        .error-msg {
          padding: 10px 14px;
          background: #fee2e2;
          border-radius: 8px;
          font-size: 13px;
          color: #dc2626;
          margin-bottom: 16px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid var(--n100);
        }
        .btn-cancel {
          padding: 10px 20px;
          background: var(--n100);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          color: var(--n600);
          cursor: pointer;
        }
        .btn-cancel:hover {
          background: var(--n200);
        }
        .btn-save {
          padding: 10px 24px;
          background: var(--tp-primary);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
        }
        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-save:not(:disabled):hover {
          background: var(--tp-primary-dark);
        }
      `}</style>

      <h1 className="page-title">팝업 관리</h1>
      <p className="page-sub">메인 페이지 팝업을 관리합니다</p>

      <div className="toolbar">
        <span className="count-label">
          {loading ? "로딩 중..." : `총 ${popups.length}개`}
        </span>
        <button className="btn-primary" onClick={openAdd}>
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
          새 팝업 추가
        </button>
      </div>

      {loading ? (
        <div className="loading-state">팝업 데이터를 불러오는 중...</div>
      ) : (
        <div className="popup-grid">
          {sorted.map((popup) => {
            const status = getStatus(popup);
            const style = STATUS_STYLE[status];
            return (
              <div key={popup.id} className="popup-card">
                <div className="popup-img">
                  {popup.이미지URL ? (
                    <img
                      src={popup.이미지URL}
                      alt={popup.ALT텍스트 || popup.제목}
                    />
                  ) : (
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
                  )}
                </div>
                <div className="popup-info">
                  <div className="popup-order">순서 {popup.순서 ?? 0}</div>
                  <div className="popup-title">{popup.제목}</div>
                  <div className="popup-meta">
                    {popup.시작일 || "—"} ~ {popup.종료일 || "—"}
                  </div>
                  <span
                    className="popup-status"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {status}
                  </span>
                  <div className="popup-actions">
                    <button className="btn-sm" onClick={() => openEdit(popup)}>
                      수정
                    </button>
                    <button
                      className="btn-sm btn-sm-danger"
                      onClick={() => handleDelete(popup)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="add-card" onClick={openAdd}>
            <svg
              width="40"
              height="40"
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
      )}

      {showModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editTarget ? "팝업 수정" : "새 팝업 추가"}
              </span>
              <button className="modal-close" onClick={closeModal}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="error-msg">{error}</div>}

              <div className="form-group">
                <label className="form-label">
                  제목<span>*</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="팝업 제목을 입력하세요"
                  value={form.제목}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, 제목: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">이미지</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="이미지 URL 직접 입력"
                  value={form.이미지URL}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, 이미지URL: e.target.value }))
                  }
                />
                <button
                  className="upload-btn"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImg}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {uploadingImg ? "업로드 중..." : "파일 업로드"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                    e.target.value = "";
                  }}
                />
                {form.이미지URL && (
                  <div className="img-preview">
                    <img src={form.이미지URL} alt="미리보기" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">ALT 텍스트</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="이미지 대체 텍스트 (접근성)"
                  value={form.ALT텍스트}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ALT텍스트: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">링크 URL</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="https://..."
                  value={form.링크URL}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, 링크URL: e.target.value }))
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">링크 열기</label>
                  <select
                    className="form-select"
                    value={form.링크타겟}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, 링크타겟: e.target.value }))
                    }
                  >
                    <option value="_blank">새 탭 (_blank)</option>
                    <option value="_self">현재 탭 (_self)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">순서</label>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={form.순서}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        순서: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">시작일</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.시작일}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, 시작일: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">종료일</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.종료일}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, 종료일: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">활성여부</label>
                <div className="toggle-row">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={form.활성여부}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, 활성여부: e.target.checked }))
                      }
                    />
                    <div className="toggle-track" />
                    <div className="toggle-thumb" />
                  </label>
                  <span className="toggle-label">
                    {form.활성여부 ? "활성화됨" : "비활성"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>
                취소
              </button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "저장 중..." : editTarget ? "수정 저장" : "등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
