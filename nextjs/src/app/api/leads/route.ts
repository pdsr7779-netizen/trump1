import { NextRequest, NextResponse } from "next/server";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID!;
const META_TABLE = "tbl7hadkFGFGzkc0x";

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
const headers = () => ({
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  "Content-Type": "application/json",
});

// 영문→한글 상태 매핑
const STATUS_MAP: Record<string, string> = {
  new: "신규",
  consulting: "상담중",
  done: "완료",
  hold: "대기",
};

function normalizeStatus(s: string): string {
  return STATUS_MAP[s] || s || "신규";
}

// 영문 필드 우선, 한글 fallback
function mapHomepageLead(record: {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}) {
  const f = record.fields;
  const g = (key: string) => (f[key] || "") as string;
  return {
    id: record.id,
    company: g("Name"),
    bizno: g("bizno"),
    name: g("repName"),
    phone: g("phone"),
    email: g("email"),
    industry: g("industry"),
    founded: g("founded"),
    consultTime: g("consultTime"),
    amount: g("amount"),
    fundType: g("fundType"),
    message: g("message"),
    createdAt: g("createdAt") || record.createdTime,
    status: normalizeStatus(g("status")),
    memo: g("memo"),
    source: "homepage",
    _table: AIRTABLE_TABLE_ID,
  };
}

function mapMetaLead(record: {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}) {
  const f = record.fields;
  const g = (name: string) => (f[name] || "") as string;
  return {
    id: record.id,
    company: g("상호명"),
    bizno: "",
    name: g("이름"),
    phone: g("연락처"),
    email: "",
    industry: g("업종"),
    founded: "",
    consultTime: "",
    amount: g("직전년도 매출"),
    fundType: "",
    message: g("회생 파산 불가안내"),
    createdAt: g("접수일시") || record.createdTime,
    status: normalizeStatus(g("상태")),
    memo: g("메모"),
    source: `META(${g("광고")})`,
    _table: META_TABLE,
    bizType: g("사업자종류"),
    region: g("지역"),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const records: Record<string, unknown>[] = [];

    // 홈페이지 접수
    if (!source || source === "homepage" || source === "all") {
      const res = await fetch(
        `${BASE_URL}/${AIRTABLE_TABLE_ID}?maxRecords=200`,
        { headers: headers() },
      );
      if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
      const data = await res.json();
      for (const r of data.records || []) {
        records.push(mapHomepageLead(r));
      }
    }

    // META 접수
    if (!source || source === "meta" || source === "all") {
      try {
        const res = await fetch(`${BASE_URL}/${META_TABLE}?maxRecords=200`, {
          headers: headers(),
        });
        if (res.ok) {
          const data = await res.json();
          for (const r of data.records || []) {
            records.push(mapMetaLead(r));
          }
        }
      } catch {
        // META 테이블 없을 수 있음 - 무시
      }
    }

    // 최신 순 정렬
    records.sort((a, b) => {
      const dateA = String(a.createdAt || "");
      const dateB = String(b.createdAt || "");
      return dateB.localeCompare(dateA);
    });

    // 통계
    const stats = {
      total: records.length,
      new: records.filter((r) => r.status === "신규").length,
      consulting: records.filter((r) => r.status === "상담중").length,
      progress: records.filter((r) => r.status === "진행중").length,
      done: records.filter((r) => r.status === "완료").length,
      blacklist: records.filter((r) => r.status === "블랙리스트").length,
    };

    return NextResponse.json({ success: true, leads: records, stats });
  } catch (error) {
    console.error("[Trump] Leads API error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status: newStatus, memo, _table } = await request.json();
    if (!id)
      return NextResponse.json(
        { success: false, error: "ID 필요" },
        { status: 400 },
      );

    const tableId = _table === META_TABLE ? META_TABLE : AIRTABLE_TABLE_ID;
    const fields: Record<string, string> = {};
    if (newStatus) {
      fields["status"] = newStatus;
    }
    if (memo !== undefined) {
      fields["memo"] = memo;
    }

    const res = await fetch(`${BASE_URL}/${tableId}/${id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Trump] Leads PATCH error:", err);
      throw new Error(`Airtable error: ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trump] Leads PATCH error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const table = searchParams.get("table");
    if (!id)
      return NextResponse.json(
        { success: false, error: "ID 필요" },
        { status: 400 },
      );

    const tableId = table === META_TABLE ? META_TABLE : AIRTABLE_TABLE_ID;
    const res = await fetch(`${BASE_URL}/${tableId}/${id}`, {
      method: "DELETE",
      headers: headers(),
    });

    if (!res.ok) throw new Error(`Airtable error: ${res.status}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trump] Leads DELETE error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
