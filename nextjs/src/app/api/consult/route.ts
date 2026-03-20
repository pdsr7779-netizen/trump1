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
            "\uAE30\uC5C5\uBA85": data.company,
            "\uC0AC\uC5C5\uC790\uBC88\uD638": data.bizno,
            "\uB300\uD45C\uC790\uBA85": data.name,
            "\uC5F0\uB77D\uCC98": data.phone,
            "\uC774\uBA54\uC77C": data.email,
            "\uC5C5\uC885": data.industry || "",
            "\uC124\uB9BD\uC5F0\uB3C4": data.founded || "",
            "\uD1B5\uD654\uAC00\uB2A5\uC2DC\uAC04": data.consultTime,
            "\uC790\uAE08\uADDC\uBAA8": data.amount || "",
            "\uC790\uAE08\uC885\uB958": data.fundType,
            "\uBB38\uC758\uC0AC\uD56D": data.message || "",
            "\uC811\uC218\uC77C\uC2DC": new Date().toLocaleString("ko-KR", {
              timeZone: "Asia/Seoul",
            }),
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
