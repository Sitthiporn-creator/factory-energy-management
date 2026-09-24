"use client";

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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <style jsx>{`
        .sidebar {
          width: 250px;
          min-height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #101c3a 100%);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .logoRow {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 6px;
        }

        .logoIcon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .logoText h1 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
        }

        .logoText p {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.3;
        }

        .menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .menuItem {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          text-decoration: none;
          color: #cbd5e1;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
        }

        .menuItem:hover {
          background: rgba(255, 255, 255, 0.06);
          color: white;
        }

        .menuItem.active {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          font-weight: 600;
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
        }

        .menuItem svg {
          flex-shrink: 0;
        }
      `}</style>

      <aside className="sidebar">
        <div className="logoRow">
          <div className="logoIcon">⚡</div>
          <div className="logoText">
            <h1>Factory Energy</h1>
            <p>Management System</p>
          </div>
        </div>

        <nav className="menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`menuItem${isActive ? " active" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
