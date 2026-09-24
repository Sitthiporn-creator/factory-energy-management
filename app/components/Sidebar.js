"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    href: "/",
    label: "หน้าหลัก",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
      </svg>
    ),
  },
  {
    href: "/input",
    label: "ข้อมูลพลังงาน",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "รายงาน",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "กราฟและสถิติ",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <rect x="4" y="12" width="4" height="8" rx="1" />
        <rect x="10" y="7" width="4" height="13" rx="1" />
        <rect x="16" y="3" width="4" height="17" rx="1" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "จัดการผู้ใช้",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "ตั้งค่า",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z" />
      </svg>
    ),
  },
];

const styles = {
  sidebar: {
    width: 250,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0f172a 0%, #101c3a 100%)",
    padding: "22px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 26,
    boxSizing: "border-box",
    flexShrink: 0,
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 6px",
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  logoTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.3,
  },
  logoSubtitle: {
    margin: 0,
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.3,
  },
  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  menuItemBase: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 14px",
    borderRadius: 12,
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
  },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(null);

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoRow}>
        <div style={styles.logoIcon}>⚡</div>
        <div>
          <p style={styles.logoTitle}>Factory Energy</p>
          <p style={styles.logoSubtitle}>Management System</p>
        </div>
      </div>

      <nav style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const isHovered = hovered === item.href;

          const itemStyle = {
            ...styles.menuItemBase,
            color: isActive ? "#ffffff" : "#cbd5e1",
            background: isActive
              ? "linear-gradient(135deg, #2563eb, #3b82f6)"
              : isHovered
              ? "rgba(255, 255, 255, 0.06)"
              : "transparent",
            fontWeight: isActive ? 600 : 500,
            boxShadow: isActive ? "0 6px 16px rgba(37, 99, 235, 0.35)" : "none",
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              style={itemStyle}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
