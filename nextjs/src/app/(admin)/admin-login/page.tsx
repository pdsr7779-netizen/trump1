"use client";

import { useState, useEffect, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export default function AdminLoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [mounted, setMounted] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("trump_admin_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        if (payload.exp > Date.now()) {
          window.location.href = "/dashboard";
          return;
        }
        localStorage.removeItem("trump_admin_token");
      } catch {
        localStorage.removeItem("trump_admin_token");
      }
    }
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const requestCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/api/admin-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code" }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        setSuccess("텔레그램으로 인증번호가 발송되었습니다.");
        setResendTimer(60);
        setTimeout(() => codeRef.current?.focus(), 100);
      } else {
        setError(data.error || "인증번호 발송에 실패했습니다.");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("6자리 인증번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-code", code }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("인증 성공! 대시보드로 이동합니다.");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setError(data.error || "인증에 실패했습니다.");
      }
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #111d33 0%, #1b2b4b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
      <style jsx>{`
        .login-wrap {
          font-family:
            "Pretendard",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          background: linear-gradient(135deg, #111d33 0%, #1b2b4b 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-box {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .logo {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1b2b4b;
          letter-spacing: -0.5px;
        }
        .logo-gold {
          color: #c9a84c;
        }
        .logo p {
          color: #666;
          font-size: 14px;
          margin-top: 8px;
        }
        .msg {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .msg-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }
        .msg-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }
        .tg-info {
          text-align: center;
          padding: 16px;
          background: #e8eef6;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #1b2b4b;
          line-height: 1.6;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }
        .form-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 20px;
          letter-spacing: 8px;
          text-align: center;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .form-group input:focus {
          border-color: #1b2b4b;
          box-shadow: 0 0 0 3px rgba(27, 43, 75, 0.1);
        }
        .btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1b2b4b 0%, #243759 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(27, 43, 75, 0.4);
        }
        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          margin-top: 12px;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .timer {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          margin-top: 8px;
        }
        .notice {
          margin-top: 24px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
      `}</style>

      <div className="login-wrap">
        <div className="login-box">
          <div className="logo">
            <h1>
              <span className="logo-gold">Trump</span> Admin
            </h1>
            <p>관리자 전용 페이지</p>
          </div>

          {error && <div className="msg msg-error">{error}</div>}
          {success && <div className="msg msg-success">{success}</div>}

          {step === 1 && (
            <div>
              <div className="tg-info">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1B2B4B"
                  strokeWidth="2"
                  style={{ display: "block", margin: "0 auto 8px" }}
                >
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                텔레그램으로 인증번호를 받아
                <br />
                로그인합니다.
              </div>
              <button
                className="btn btn-primary"
                onClick={requestCode}
                disabled={loading}
              >
                {loading ? "발송 중..." : "인증번호 요청"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <form onSubmit={verifyCode}>
                <div className="form-group">
                  <label htmlFor="authCode">인증번호 6자리</label>
                  <input
                    ref={codeRef}
                    type="text"
                    id="authCode"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/[^0-9]/g, ""));
                      setError("");
                    }}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "확인 중..." : "인증 확인"}
                </button>
              </form>
              <button
                className="btn btn-secondary"
                onClick={requestCode}
                disabled={resendTimer > 0 || loading}
              >
                인증번호 재발송
              </button>
              {resendTimer > 0 && (
                <div className="timer">{resendTimer}초 후 재발송 가능</div>
              )}
            </div>
          )}

          <div className="notice">
            텔레그램 관리자 채널의
            <br />
            인증번호로만 로그인할 수 있습니다.
          </div>
        </div>
      </div>
    </>
  );
}
