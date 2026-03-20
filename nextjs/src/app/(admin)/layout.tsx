import type { Metadata } from "next";
import "./dashboard/dashboard.css";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
