"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/company", label: "회사소개" },
  { href: "/process", label: "진행과정" },
  { href: "/fund", label: "자금상담" },
  { href: "/pro", label: "전문서비스" },
  { href: "/mkt", label: "온라인마케팅" },
];

const MOBILE_NAV_ITEMS = [
  {
    href: "/company",
    label: "회사소개",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-[18px] h-[18px]"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    href: "/process",
    label: "진행과정",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-[18px] h-[18px]"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/fund",
    label: "자금상담",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-[18px] h-[18px]"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/pro",
    label: "전문서비스",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-[18px] h-[18px]"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
  {
    href: "/mkt",
    label: "마케팅",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-[18px] h-[18px]"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ===== PC 헤더 (md 이상) + 모바일 로고 헤더 ===== */}
      <div
        className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${
          isScrolled
            ? "bg-navy/[0.98] backdrop-blur-[20px] border-b border-gold/50 shadow-[0_0_30px_rgba(201,168,76,0.2)]"
            : "bg-navy/95 border-b border-gold/30 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        }`}
      >
        <div className="max-w-wide mx-auto px-5 md:px-10 flex items-center h-[56px] md:h-[80px] lg:h-[90px]">
          {/* 모바일: 로고 가운데 정렬 */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Image
                src="/images/logo.png"
                alt="트럼프 파트너스 로고"
                width={40}
                height={40}
                className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10"
                priority
              />
              <span className="text-lg md:text-[22px] lg:text-[24px] font-bold tracking-tight gold-gradient-text whitespace-nowrap">
                트럼프 파트너스
              </span>
            </Link>
          </div>

          {/* PC 인라인 메뉴 (md 이상) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm lg:text-[15px] font-medium px-3.5 lg:px-[18px] py-2 rounded-lg transition-all whitespace-nowrap ${
                  pathname === item.href
                    ? "text-gold font-bold"
                    : "text-body hover:text-gold hover:bg-gold/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* PC CTA 버튼 (md 이상) */}
          <Link
            href="tel:1844-1053"
            className="hidden md:inline-block ml-4 lg:ml-6 px-5 py-2 rounded-lg text-[13px] font-bold text-white gold-gradient-bg whitespace-nowrap transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(201,168,76,0.4)]"
          >
            무료 상담신청
          </Link>
        </div>
      </div>

      {/* ===== 모바일 하단 고정 네비 (767px 이하) ===== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[9998] flex md:hidden bg-navy/[0.98] backdrop-blur-[20px] border-t border-gold/30 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 4px)" }}
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-[1px] py-[5px] px-[2px] text-[9px] font-medium transition-colors relative ${
                isActive
                  ? "text-gold font-bold"
                  : "text-white/45 hover:text-gold"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold rounded-sm" />
              )}
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
