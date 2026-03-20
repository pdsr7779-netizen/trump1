'use client'

import { useEffect, useState, useCallback } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

interface Lead {
  id: string; date: string; dateRaw: string; company: string; name: string; phone: string;
  email: string; business: string; region: string; amount: string; fundType: string;
  callTime: string; content: string; status: string; memo: string;
}

function getAuthToken() { return typeof window !== 'undefined' ? localStorage.getItem('trump_admin_token') : null }

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [detail, setDetail] = useState<Lead | null>(null)
  const pageSize = 10

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    setLoading(true)
    const token = getAuthToken()
    if (!token) return
    try {
      let all: Lead[] = []; let offset: string | null = null
      do {
        let url = `${API_BASE}/api/leads`
        if (offset) url += `?offset=${offset}`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (res.status === 401) { localStorage.removeItem('trump_admin_token'); location.href = '/admin-login'; return }
        if (!res.ok) throw new Error('API 오류')
        const data = await res.json()
        const leads = (data.leads || []).map((raw: any) => {
          const dateRaw = raw.fld9EGNbrLeCpefTx || raw.CreatedAt || ''
          return {
            id: raw.id, date: dateRaw ? dateRaw.split('T')[0] : '-', dateRaw,
            company: raw.fld76EQt8pI5wZT2f || raw.Company || '-',
            name: raw.fldHwYTsWree2KGQe || raw.CEO || '-',
            phone: raw.fldz2CTRYIERdRTgh || raw.Phone || '-',
            email: raw.fldi1pKqTFx1DwVQs || raw.Email || '',
            business: raw.fldIIQPwWwd89640a || raw.Industry || '-',
            region: '-', amount: raw.fldxUOfkeU8tLP9m4 || raw.FundAmount || '-',
            fundType: raw.fldtSYYIXPTlSJcDT || raw.FundType || '-',
            callTime: raw.fldZYFyw2g0JBmXns || raw.AvailableTime || '',
            content: raw.fldKkUCKTNsUg7FCF || raw.Message || '',
            status: 'pending', memo: '',
          } as Lead
        })
        all.push(...leads)
        offset = data.offset || null
      } while (offset)
      setAllLeads(all)
      setFiltered(all)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const filterLeads = useCallback(() => {
    let result = [...allLeads]
    if (statusFilter) result = result.filter(l => l.status === statusFilter)
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter)
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
      result = result.filter(l => new Date(l.date) >= cutoff)
    }
    if (search) {
      const kw = search.toLowerCase()
      result = result.filter(l => l.name.toLowerCase().includes(kw) || l.phone.includes(kw) || l.company.toLowerCase().includes(kw))
    }
    setFiltered(result)
    setPage(1)
  }, [allLeads, statusFilter, dateFilter, search])

  useEffect(() => { filterLeads() }, [filterLeads])

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const pageLeads = filtered.slice((page - 1) * pageSize, page * pageSize)

  const exportCsv = () => {
    if (filtered.length === 0) { alert('내보낼 데이터가 없습니다.'); return }
    const headers = ['접수일','기업명','대표자','연락처','업종','희망금액','이메일']
    const rows = filtered.map(l => [l.date, l.company, l.name, l.phone, l.business, l.amount, l.email])
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `접수내역_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  return (
    <>
      <style jsx>{`
        .page-title { font-size: 24px; font-weight: 700; color: var(--n900); margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: var(--n500); margin-bottom: 24px; }
        .filter-section { background: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .filter-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .filter-group { display: flex; gap: 12px; }
        .filter-select { padding: 10px 14px; border: 1px solid var(--n200); border-radius: 8px; font-size: 14px; color: var(--n700); background: white; min-width: 140px; }
        .search-group { display: flex; gap: 8px; }
        .search-input { padding: 10px 14px; border: 1px solid var(--n200); border-radius: 8px; font-size: 14px; width: 280px; outline: none; }
        .search-input:focus { border-color: var(--tp-primary); }
        .btn-search { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; background: var(--tp-primary); color: white; border: none; border-radius: 8px; cursor: pointer; }
        .filter-summary { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--n100); font-size: 14px; color: var(--n600); }
        .btn-export { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--n100); color: var(--n700); border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
        .btn-export:hover { background: var(--n200); }
        .leads-section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--n100); white-space: nowrap; }
        th { font-size: 13px; font-weight: 600; color: var(--n500); background: var(--n50); }
        td { font-size: 14px; color: var(--n700); }
        tbody tr:hover { background: var(--n50); }
        td a { color: var(--tp-primary); text-decoration: none; }
        td a:hover { text-decoration: underline; }
        .status-select { padding: 6px 10px; border: none; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; }
        .status-select.pending { background: #fef3c7; color: #d97706; }
        .status-select.progress { background: #dbeafe; color: #2563eb; }
        .status-select.complete { background: #d1fae5; color: #059669; }
        .status-select.cancel { background: #fee2e2; color: #dc2626; }
        .btn-icon { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; background: var(--n100); border: none; border-radius: 4px; color: var(--n600); cursor: pointer; }
        .btn-icon:hover { background: var(--n200); color: var(--n800); }
        .btn-icon-danger:hover { background: #fee2e2; color: #dc2626; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--n100); }
        .pg-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--n100); border: none; border-radius: 8px; color: var(--n600); cursor: pointer; }
        .pg-btn:hover:not(:disabled) { background: var(--tp-primary); color: white; }
        .pg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pg-info { font-size: 14px; color: var(--n600); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--n200); }
        .modal-title { font-size: 18px; font-weight: 600; color: var(--n900); }
        .modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--n500); cursor: pointer; border-radius: 4px; }
        .modal-body { padding: 24px; }
        .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item.full { grid-column: 1 / -1; }
        .detail-item label { font-size: 12px; font-weight: 500; color: var(--n500); }
        .detail-item span { font-size: 14px; color: var(--n800); }
        .detail-item p { font-size: 14px; color: var(--n800); margin: 0; line-height: 1.6; padding: 12px; background: var(--n50); border-radius: 8px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--n200); background: var(--n50); }
        .btn-secondary { padding: 10px 20px; background: var(--n100); color: var(--n700); border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--tp-primary); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
        .empty { text-align: center; padding: 40px; color: var(--n400); }
        @media (max-width: 768px) {
          .filter-row { flex-direction: column; align-items: stretch; }
          .filter-group { flex-wrap: wrap; }
          .search-input { flex: 1; width: auto; }
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <h1 className="page-title">접수내역</h1>
      <p className="page-sub">고객 상담 요청을 관리하세요</p>

      <section className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">전체 상태</option>
              <option value="pending">대기중</option>
              <option value="progress">상담중</option>
              <option value="complete">완료</option>
              <option value="cancel">취소</option>
            </select>
            <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option value="7">최근 7일</option>
              <option value="30">최근 30일</option>
              <option value="90">최근 90일</option>
              <option value="all">전체</option>
            </select>
          </div>
          <div className="search-group">
            <input className="search-input" placeholder="이름, 연락처, 회사명 검색..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') filterLeads() }} />
            <button className="btn-search" onClick={filterLeads}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>
        <div className="filter-summary">
          <span>총 <strong>{filtered.length}</strong>건</span>
          <button className="btn-export" onClick={exportCsv}>엑셀 다운로드</button>
        </div>
      </section>

      <section className="leads-section">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>접수일</th><th>기업명</th><th>대표자</th><th>연락처</th><th>업종</th><th>희망금액</th><th>상태</th><th>관리</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty">데이터를 불러오는 중...</td></tr>
              ) : pageLeads.length === 0 ? (
                <tr><td colSpan={8} className="empty">검색 결과가 없습니다.</td></tr>
              ) : pageLeads.map(lead => (
                <tr key={lead.id}>
                  <td>{lead.date}</td><td>{lead.company}</td><td>{lead.name}</td>
                  <td><a href={`tel:${lead.phone}`}>{lead.phone}</a></td>
                  <td>{lead.business}</td><td>{lead.amount}</td>
                  <td>
                    <select className={`status-select ${lead.status}`} value={lead.status}
                      onChange={e => { const s = e.target.value; setAllLeads(prev => prev.map(l => l.id === lead.id ? {...l, status: s} : l)) }}>
                      <option value="pending">대기중</option><option value="progress">상담중</option>
                      <option value="complete">완료</option><option value="cancel">취소</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => setDetail(lead)} title="상세보기">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="pg-info">{page} / {totalPages} 페이지</span>
          <button className="pg-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </section>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">접수 상세 정보</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>접수일시</label><span>{detail.dateRaw ? new Date(detail.dateRaw).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : detail.date}</span></div>
                <div className="detail-item"><label>기업명</label><span>{detail.company}</span></div>
                <div className="detail-item"><label>대표자명</label><span>{detail.name}</span></div>
                <div className="detail-item"><label>연락처</label><span>{detail.phone}</span></div>
                <div className="detail-item"><label>이메일</label><span>{detail.email || '-'}</span></div>
                <div className="detail-item"><label>업종</label><span>{detail.business}</span></div>
                <div className="detail-item"><label>희망금액</label><span>{detail.amount}{detail.fundType !== '-' ? ` (${detail.fundType})` : ''}</span></div>
                <div className="detail-item"><label>통화가능시간</label><span>{detail.callTime || '-'}</span></div>
                <div className="detail-item full"><label>상담내용</label><p>{detail.content || '-'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDetail(null)}>닫기</button>
              <button className="btn-primary" onClick={() => { if (detail.phone) window.location.href = `tel:${detail.phone}` }}>전화걸기</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
