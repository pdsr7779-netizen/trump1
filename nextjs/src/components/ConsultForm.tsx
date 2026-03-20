"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { trackFormVisible, trackFormStart, trackFormSubmit } from "@/lib/gtag";
import "./ConsultForm.css";

const FUND_TYPES = ["창업자금", "운전자금", "시설자금", "기타자금"];
const INDUSTRIES = [
  "제조업",
  "도소매업",
  "서비스업",
  "건설업",
  "IT/소프트웨어",
  "기타",
];
const CONSULT_TIMES = [
  "오전 09:00 - 10:00",
  "오전 10:00 - 11:00",
  "오전 11:00 - 12:00",
  "오후 14:00 - 15:00",
  "오후 15:00 - 16:00",
  "오후 16:00 - 17:00",
  "오후 17:00 - 18:00",
  "언제나 가능",
];
const AMOUNTS = [
  "5천만원 이하",
  "5천만원 ~ 1억원",
  "1억원 ~ 3억원",
  "3억원 ~ 5억원",
  "5억원 ~ 10억원",
  "10억원 이상",
];

const STEP_LABELS = ["기업 정보", "자금 정보", "연락처 입력"];

export default function ConsultForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedFundTypes, setSelectedFundTypes] = useState<string[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formStarted = useRef(false);

  // form data for summary panel
  const [formData, setFormData] = useState({
    company: "",
    bizno: "",
    industry: "",
    founded: "",
    amount: "",
    name: "",
    phone: "",
    email: "",
    consultTime: "",
    message: "",
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let fired = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          fired = true;
          trackFormVisible(window.location.pathname);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleFieldFocus = (fieldName: string) => {
    if (!formStarted.current) {
      formStarted.current = true;
      trackFormStart(window.location.pathname, fieldName);
    }
  };

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFundType = (type: string) => {
    setSelectedFundTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const formatBizNo = (value: string) => {
    const nums = value.replace(/[^0-9]/g, "");
    if (nums.length <= 3) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5, 10)}`;
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/[^0-9]/g, "");
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!formData.company.trim()) {
        alert("기업명을 입력해주세요.");
        return false;
      }
      if (!formData.bizno.trim()) {
        alert("사업자번호를 입력해주세요.");
        return false;
      }
    }
    if (s === 3) {
      if (!formData.name.trim()) {
        alert("대표자명을 입력해주세요.");
        return false;
      }
      if (!formData.phone.trim()) {
        alert("연락처를 입력해주세요.");
        return false;
      }
      if (!formData.email.trim()) {
        alert("이메일을 입력해주세요.");
        return false;
      }
      if (!formData.consultTime) {
        alert("통화 가능 시간을 선택해주세요.");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < 3) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const privacyCheck =
      formRef.current?.querySelector<HTMLInputElement>('[name="privacy"]');
    if (!privacyCheck?.checked) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const data = {
        ...formData,
        fundType: selectedFundTypes.join(", "),
      };

      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Submit failed");

      trackFormSubmit(window.location.pathname);
      setStatus("success");
      setStep(1);
      setFormData({
        company: "",
        bizno: "",
        industry: "",
        founded: "",
        amount: "",
        name: "",
        phone: "",
        email: "",
        consultTime: "",
        message: "",
      });
      setSelectedFundTypes([]);
      formStarted.current = false;
      formRef.current?.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const summaryValue = (v: string) => v || "미입력";
  const summaryEmpty = (v: string) => !v;

  return (
    <section
      id="consult-form"
      ref={sectionRef}
      className="section-dark section-padding"
    >
      <div className="wz-section">
        <div className="wz-header">
          <span className="wz-badge">정부정책자금 경영컨설팅</span>
          <h2>무료 상담 신청</h2>
          <p>3단계로 간편하게 정부정책자금 상담을 신청하세요</p>
        </div>

        <div className="wz-body">
          {/* Left panel - PC only */}
          <div className="wz-left">
            <img
              className="wz-left-bg"
              src="/images/consultant-portrait.jpg"
              alt="기업심사관 이소영"
              loading="lazy"
            />
            <div className="wz-left-overlay" />
            <div className="wz-left-content">
              <span className="wz-left-badge">심사 통과율 향상</span>
              <h3>
                체계적인 현황분석으로
                <br />
                최적의 정부정책자금을
                <br />
                확보하세요
              </h3>
              <p>
                기업심사관 이소영이
                <br />
                직접 자금조달을 설계합니다
              </p>
              <p className="wz-left-note">※ 기업대출알선 서비스가 아닙니다</p>
            </div>
          </div>

          {/* Center - Form */}
          <div className="wz-center">
            {/* Progress bar */}
            <div className="wz-progress">
              {STEP_LABELS.map((label, i) => {
                const s = i + 1;
                const cls = s < step ? "done" : s === step ? "active" : "";
                return (
                  <div key={s} style={{ display: "contents" }}>
                    {i > 0 && (
                      <div
                        className={`wz-step-line ${s <= step ? "done" : ""}`}
                      />
                    )}
                    <div className={`wz-step ${cls}`}>
                      <div className="wz-step-num">{s < step ? "✓" : s}</div>
                      <div className="wz-step-label">{label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile summary for step 2+ */}
            {step > 1 && (
              <div className="wz-mob-sum show">
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: "var(--gold, #C9A84C)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ✓
                </div>
                <div
                  style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}
                >
                  {step === 2 && formData.company && (
                    <>
                      <strong>{formData.company}</strong>{" "}
                      {formData.bizno && `(${formData.bizno})`}
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <strong>{formData.company}</strong>
                      {formData.amount && <> · {formData.amount}</>}
                      {selectedFundTypes.length > 0 && (
                        <> · {selectedFundTypes.join(", ")}</>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit}>
              {/* Step 1: 기업 정보 */}
              <div className={`wz-panel ${step === 1 ? "active" : ""}`}>
                <div className="wz-row">
                  <div>
                    <label className="wz-label">
                      기업명 <span className="wz-req">*</span>
                    </label>
                    <input
                      type="text"
                      className="wz-input"
                      name="company"
                      required
                      value={formData.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      onFocus={() => handleFieldFocus("company")}
                    />
                  </div>
                  <div>
                    <label className="wz-label">
                      사업자번호 <span className="wz-req">*</span>
                    </label>
                    <input
                      type="text"
                      className="wz-input"
                      name="bizno"
                      placeholder="000-00-00000"
                      required
                      value={formData.bizno}
                      onChange={(e) =>
                        updateField("bizno", formatBizNo(e.target.value))
                      }
                      onFocus={() => handleFieldFocus("bizno")}
                    />
                  </div>
                </div>
                <div className="wz-row">
                  <div>
                    <label className="wz-label">업종</label>
                    <select
                      className="wz-input"
                      name="industry"
                      value={formData.industry}
                      onChange={(e) => updateField("industry", e.target.value)}
                      onFocus={() => handleFieldFocus("industry")}
                    >
                      <option value="">선택하세요</option>
                      {INDUSTRIES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="wz-label">설립연도</label>
                    <input
                      type="text"
                      className="wz-input"
                      name="founded"
                      placeholder="2020"
                      value={formData.founded}
                      onChange={(e) => updateField("founded", e.target.value)}
                      onFocus={() => handleFieldFocus("founded")}
                    />
                  </div>
                </div>
                <div className="wz-btns">
                  <button
                    type="button"
                    className="wz-btn wz-btn-next"
                    onClick={goNext}
                  >
                    다음 →
                  </button>
                </div>
              </div>

              {/* Step 2: 자금 정보 */}
              <div className={`wz-panel ${step === 2 ? "active" : ""}`}>
                <div className="wz-row full">
                  <div>
                    <label className="wz-label">필요 자금 규모</label>
                    <select
                      className="wz-input"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) => updateField("amount", e.target.value)}
                      onFocus={() => handleFieldFocus("amount")}
                    >
                      <option value="">선택하세요</option>
                      {AMOUNTS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="wz-fund-group">
                  <span className="wz-fund-label">
                    지원받고 싶은 자금 종류 (복수 선택 가능)
                  </span>
                  <div className="wz-fund-opts">
                    {FUND_TYPES.map((type, i) => (
                      <div
                        key={type}
                        className={`wz-fund-opt ${selectedFundTypes.includes(type) ? "checked" : ""}`}
                      >
                        <input
                          type="checkbox"
                          id={`fund-${i}`}
                          checked={selectedFundTypes.includes(type)}
                          onChange={() => toggleFundType(type)}
                        />
                        <label htmlFor={`fund-${i}`}>{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="wz-btns">
                  <button
                    type="button"
                    className="wz-btn wz-btn-prev"
                    onClick={goPrev}
                  >
                    ← 이전
                  </button>
                  <button
                    type="button"
                    className="wz-btn wz-btn-next"
                    onClick={goNext}
                  >
                    다음 →
                  </button>
                </div>
              </div>

              {/* Step 3: 연락처 입력 */}
              <div className={`wz-panel ${step === 3 ? "active" : ""}`}>
                <div className="wz-row">
                  <div>
                    <label className="wz-label">
                      대표자명 <span className="wz-req">*</span>
                    </label>
                    <input
                      type="text"
                      className="wz-input"
                      name="name"
                      required
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      onFocus={() => handleFieldFocus("name")}
                    />
                  </div>
                  <div>
                    <label className="wz-label">
                      연락처 <span className="wz-req">*</span>
                    </label>
                    <input
                      type="tel"
                      className="wz-input"
                      name="phone"
                      placeholder="010-0000-0000"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        updateField("phone", formatPhone(e.target.value))
                      }
                      onFocus={() => handleFieldFocus("phone")}
                    />
                  </div>
                </div>
                <div className="wz-row">
                  <div>
                    <label className="wz-label">
                      이메일 <span className="wz-req">*</span>
                    </label>
                    <input
                      type="email"
                      className="wz-input"
                      name="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onFocus={() => handleFieldFocus("email")}
                    />
                  </div>
                  <div>
                    <label className="wz-label">
                      통화 가능 시간 <span className="wz-req">*</span>
                    </label>
                    <select
                      className="wz-input"
                      name="consultTime"
                      required
                      value={formData.consultTime}
                      onChange={(e) =>
                        updateField("consultTime", e.target.value)
                      }
                      onFocus={() => handleFieldFocus("consultTime")}
                    >
                      <option value="">선택하세요</option>
                      {CONSULT_TIMES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="wz-row full">
                  <div>
                    <label className="wz-label">문의사항</label>
                    <textarea
                      className="wz-input"
                      name="message"
                      placeholder="자금 용도나 현재 상황, 궁금한 점을 간단히 남겨주세요"
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      onFocus={() => handleFieldFocus("message")}
                    />
                  </div>
                </div>

                <div className="wz-privacy">
                  <h4 className="wz-privacy-title">
                    개인정보 수집 및 이용 동의
                  </h4>
                  <div className="wz-privacy-check">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      required
                    />
                    <label htmlFor="privacy">
                      개인정보 수집 및 이용에 동의합니다{" "}
                      <span className="wz-req">*</span>
                      <button
                        type="button"
                        className="wz-privacy-link"
                        onClick={() => setShowPrivacy(!showPrivacy)}
                      >
                        내용보기
                      </button>
                    </label>
                  </div>
                  {showPrivacy && (
                    <div className="wz-privacy-content">
                      <p>
                        1. 수집항목: 기업명, 사업자번호, 대표자명, 연락처,
                        이메일, 문의내용
                      </p>
                      <p>2. 수집목적: 정책자금 상담 및 지원 서비스 제공</p>
                      <p>3. 보유기간: 서비스 종료 후 3년</p>
                      <p>4. 동의 거부 시 서비스 이용이 제한될 수 있습니다.</p>
                    </div>
                  )}
                </div>

                {status === "success" && (
                  <div className="wz-msg success">
                    상담 신청이 성공적으로 접수되었습니다! 빠른 시일 내
                    연락드리겠습니다.
                  </div>
                )}
                {status === "error" && (
                  <div className="wz-msg error">
                    신청 중 오류가 발생했습니다. 다시 시도해주세요.
                  </div>
                )}

                <div className="wz-btns">
                  <button
                    type="button"
                    className="wz-btn wz-btn-prev"
                    onClick={goPrev}
                  >
                    ← 이전
                  </button>
                  <button
                    type="submit"
                    className="wz-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "신청 중..." : "무료 상담 신청하기"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right summary - PC only */}
          <div className="wz-summary">
            <div className="wz-sum-title">입력 정보 확인</div>

            <div className="wz-sum-sec">
              <div className="wz-sum-hdr">
                <span className="wz-sum-badge">1</span> 기업 정보
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">기업명</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.company) ? "empty" : ""}`}
                >
                  {summaryValue(formData.company)}
                </span>
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">사업자번호</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.bizno) ? "empty" : ""}`}
                >
                  {summaryValue(formData.bizno)}
                </span>
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">업종</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.industry) ? "empty" : ""}`}
                >
                  {formData.industry || "미선택"}
                </span>
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">설립연도</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.founded) ? "empty" : ""}`}
                >
                  {summaryValue(formData.founded)}
                </span>
              </div>
            </div>

            <div className="wz-sum-sec">
              <div className="wz-sum-hdr">
                <span className="wz-sum-badge">2</span> 자금 정보
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">필요 자금</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.amount) ? "empty" : ""}`}
                >
                  {formData.amount || "미선택"}
                </span>
              </div>
              {selectedFundTypes.length > 0 ? (
                <div className="wz-sum-tags">
                  {selectedFundTypes.map((t) => (
                    <span key={t} className="wz-sum-tag">
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="wz-sum-row">
                  <span className="wz-sum-label">자금종류</span>
                  <span className="wz-sum-val empty">미선택</span>
                </div>
              )}
            </div>

            <div className="wz-sum-sec">
              <div className="wz-sum-hdr">
                <span className="wz-sum-badge">3</span> 연락처
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">대표자</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.name) ? "empty" : ""}`}
                >
                  {summaryValue(formData.name)}
                </span>
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">연락처</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.phone) ? "empty" : ""}`}
                >
                  {summaryValue(formData.phone)}
                </span>
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">이메일</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.email) ? "empty" : ""}`}
                >
                  {summaryValue(formData.email)}
                </span>
              </div>
              <div className="wz-sum-row">
                <span className="wz-sum-label">통화시간</span>
                <span
                  className={`wz-sum-val ${summaryEmpty(formData.consultTime) ? "empty" : ""}`}
                >
                  {formData.consultTime || "미선택"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
