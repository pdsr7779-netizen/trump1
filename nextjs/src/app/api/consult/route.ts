import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ConsultData {
  company: string;
  bizno: string;
  name: string;
  phone: string;
  email: string;
  industry: string;
  founded: string;
  consultTime: string;
  amount: string;
  fundType: string;
  message: string;
}

// Airtable 저장
async function saveToAirtable(data: ConsultData) {
  const token = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  if (!token || !baseId || !tableId)
    throw new Error("Airtable 환경변수 미설정");

  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            Name: data.company,
            bizno: data.bizno,
            repName: data.name,
            phone: data.phone,
            email: data.email,
            industry: data.industry || "",
            founded: data.founded || "",
            consultTime: data.consultTime,
            amount: data.amount || "",
            fundType: data.fundType,
            message: data.message || "",
            createdAt: new Date().toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
            }),
            status: "new",
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[Trump] Airtable 저장 실패:", res.status, err);
    throw new Error(`Airtable error: ${res.status}`);
  }
}

// 텔레그램 알림 발송
async function sendTelegramNotify(data: ConsultData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  const text = [
    "📋 *새 상담 접수*",
    "",
    `기업명: ${data.company}`,
    `대표자: ${data.name}`,
    `연락처: ${data.phone}`,
    `이메일: ${data.email}`,
    `업종: ${data.industry || "-"}`,
    `자금종류: ${data.fundType}`,
    `자금규모: ${data.amount || "-"}`,
    `통화시간: ${data.consultTime}`,
    data.message ? `문의: ${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}

// 접수 확인 이메일 발송 (Gmail OAuth2)
async function sendReceiptEmail(data: ConsultData) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const user = process.env.GMAIL_USER;
  if (!clientId || !clientSecret || !refreshToken || !user) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user,
      clientId,
      clientSecret,
      refreshToken,
    },
  });

  const infoRows = [
    { label: "기업명", value: data.company },
    { label: "연락처", value: data.phone },
    { label: "희망자금", value: data.amount || "-" },
    { label: "자금종류", value: data.fundType || "-" },
    { label: "연락시간", value: data.consultTime },
  ]
    .map(
      (r) =>
        `<tr style="border-bottom:1px solid #f5f5f5"><td style="padding:5px 0;font-size:11px;color:#999;width:28%">${r.label}</td><td style="padding:5px 0;font-size:13px;color:#1a1a1a">${r.value}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:-apple-system,'Helvetica Neue',sans-serif;max-width:580px;margin:0 auto;background:#fff">
<div style="background:#111d33;padding:14px 20px">
<p style="margin:0;color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:3px">TRUMP PARTNERS</p>
<p style="margin:2px 0 0;color:rgba(255,255,255,0.45);font-size:9px;letter-spacing:2px">정부정책자금 경영컨설팅</p>
</div>
<div style="background:#f7f0de;border-left:3px solid #c9a84c;padding:7px 20px;font-size:11px;color:#1b2b4b;font-weight:600">무료 상담 신청이 접수되었습니다</div>
<div style="padding:14px 20px 10px">
<div style="background:#f9fafb;padding:12px;border-left:3px solid #c9a84c;border-radius:0 6px 6px 0">
<p style="margin:0;color:#404040;line-height:1.6;font-size:13px">안녕하세요, <strong>${data.name}</strong>님! 정책자금 상담신청이 정상적으로 접수되었습니다. 영업일기준 24시간 이내 담당 기업심사관이 연락드리겠습니다.</p>
</div>
</div>
<div style="padding:0 20px 10px">
<p style="margin:0 0 6px;font-size:9px;font-weight:600;letter-spacing:2px;color:#999;padding-bottom:5px;border-bottom:1px solid #f0f0f0">신청 정보</p>
<table style="width:100%;border-collapse:collapse">${infoRows}</table>
</div>
<div style="padding:10px 20px;background:#f7f0de;border-top:1px solid rgba(201,168,76,0.15)">
<p style="margin:0;color:#1b2b4b;font-weight:600;font-size:12px;line-height:1.5;text-align:center">영업일기준 <strong>24시간 이내</strong> 트럼프 파트너스에서 연락드리겠습니다.</p>
</div>
<div style="padding:8px 20px;background:#fafafa;border-top:1px solid #f0f0f0">
<p style="margin:0;font-size:11px;color:#555;text-align:center">문의: <strong style="color:#1b2b4b">트럼프 파트너스</strong> | 대표전화: <strong>1844-1053</strong></p>
</div>
<div style="padding:8px 20px;background:#111d33">
<p style="margin:0;font-size:9px;color:rgba(255,255,255,0.35);text-align:center">트럼프 파트너스 | trump1.co.kr | 이 메일에 회신하시면 담당자에게 전달됩니다.</p>
</div>
</div>`;

  await transporter.sendMail({
    from: `"트럼프 파트너스" <${user}>`,
    to: data.email,
    subject: `[트럼프 파트너스] ${data.name}님, 상담 신청이 접수되었습니다`,
    html,
  });
}

export async function POST(request: NextRequest) {
  try {
    const data: ConsultData = await request.json();

    if (
      !data.company ||
      !data.name ||
      !data.phone ||
      !data.email ||
      !data.consultTime
    ) {
      return NextResponse.json(
        { success: false, error: "필수 항목을 입력해주세요." },
        { status: 400 },
      );
    }

    // 1. Airtable 저장
    await saveToAirtable(data);

    // 2. 텔레그램 알림
    try {
      await sendTelegramNotify(data);
    } catch (err) {
      console.error("[Trump] 텔레그램 알림 실패:", err);
    }

    // 3. 접수 확인 이메일
    try {
      await sendReceiptEmail(data);
    } catch (err) {
      console.error("[Trump] 이메일 발송 실패:", err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trump] 상담 접수 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
