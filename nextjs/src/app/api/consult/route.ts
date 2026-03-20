import { NextRequest, NextResponse } from "next/server";

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

  await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: [
        {
          fields: {
            기업명: data.company,
            사업자번호: data.bizno,
            대표자명: data.name,
            연락처: data.phone,
            이메일: data.email,
            업종: data.industry || "",
            설립연도: data.founded || "",
            통화가능시간: data.consultTime,
            자금규모: data.amount || "",
            자금종류: data.fundType,
            문의사항: data.message || "",
            접수일시: new Date().toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
            }),
          },
        },
      ],
    }),
  });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trump] 상담 접수 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
