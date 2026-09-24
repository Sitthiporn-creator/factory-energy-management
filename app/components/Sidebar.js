"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: "ภาพรวม",
      items: [
        {
          name: "Dashboard",
          icon: "🏠",
          href: "/",
        },
        {
          name: "Data",
          icon: "📊",
          href: "/input",
        },
        {
          name: "กราฟและสถิติ",
          icon: "📈",
          href: "/analytics",
        },
      ],
    },
    {
      title: "การจัดการ",
      items: [
        {
          name: "รายงาน",
          icon: "📋",
          href: "/reports",
        },
        {
          name: "มาตรการอนุรักษ์พลังงาน",
          icon: "💡",
          href: "/measures",
        },
      ],
    },
    {
      title: "ระบบ",
      items: [
        {
          name: "ตั้งค่า",
          icon: "⚙️",
          href: "/settings",
        },
      ],
    },
  ];

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="brand">
        <div className="brand-logo">⚡</div>

        <div className="brand-info">
          <div className="brand-name">ENERGY</div>
          <div className="brand-subtitle">MANAGEMENT SYSTEM</div>
        </div>
      </div>

      {/* MENU */}
      <nav className="navigation">

        {menuGroups.map((group) => (
          <div className="menu-group" key={group.title}>

            <div className="group-title">
              {group.title}
            </div>

            {group.items.map((item) => {

              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`menu-item ${
                    active ? "active" : ""
                  }`}
                >
                  <span className="menu-icon">
                    {item.icon}
                  </span>

                  <span className="menu-text">
                    {item.name}
                  </span>
                </Link>
              );
            })}

          </div>
        ))}

      </nav>

      {/* STATUS */}
      <div className="system-status">
        <span className="status-dot"></span>

        <div>
          <div className="status-title">
            System Online
          </div>

          <div className="status-subtitle">
            Energy Management
          </div>
        </div>
      </div>

      <style jsx>{`

        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;

          left: 0;
          top: 0;
          bottom: 0;

          width: 250px;

          background: #0f172a;

          color: #ffffff;

          padding: 22px 14px;

          box-sizing: border-box;

          display: flex;
          flex-direction: column;

          z-index: 1000;

          border-right: 1px solid #1e293b;
        }


        /* =========================
           BRAND
        ========================= */

        .brand {
          display: flex;

          align-items: center;

          gap: 11px;

          padding: 4px 9px 22px;
        }

        .brand-logo {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #2563eb;

          border-radius: 10px;

          font-size: 21px;

          flex-shrink: 0;
        }

        .brand-info {
          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .brand-name {
          font-size: 16px;

          font-weight: 800;

          line-height: 18px;

          letter-spacing: 1px;
        }

        .brand-subtitle {
          margin-top: 3px;

          font-size: 8px;

          color: #64748b;

          font-weight: 600;

          letter-spacing: 1px;

          white-space: nowrap;
        }


        /* =========================
           NAVIGATION
        ========================= */

        .navigation {
          flex: 1;

          overflow-y: auto;

          padding-top: 5px;
        }

        .menu-group {
          margin-bottom: 22px;
        }

        .group-title {
          padding-left: 12px;

          margin-bottom: 7px;

          color: #64748b;

          font-size: 11px;

          font-weight: 700;
        }


        /* =========================
           MENU
        ========================= */

        .menu-item {
          display: flex;

          align-items: center;

          gap: 10px;

          width: 100%;

          height: 42px;

          padding: 0 11px;

          margin: 3px 0;

          border-radius: 9px;

          box-sizing: border-box;

          color: #cbd5e1;

          text-decoration: none;

          font-size: 14px;

          font-weight: 500;

          line-height: 1;

          transition:
            background 0.15s ease,
            color 0.15s ease;
        }


        /* ICON */

        .menu-icon {
          width: 22px;

          height: 22px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-shrink: 0;

          font-size: 17px;

          line-height: 1;
        }


        /* TEXT */

        .menu-text {
          display: flex;

          align-items: center;

          height: 100%;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

          color: inherit;

          font-size: 14px;

          font-weight: 500;

          line-height: 1;
        }


        /* HOVER */

        .menu-item:hover {
          background: #1e293b;

          color: #ffffff;
        }


        /* ACTIVE */

        .menu-item.active {
          background: #2563eb;

          color: #ffffff;

          font-weight: 600;
        }


        /* =========================
           SYSTEM STATUS
        ========================= */

        .system-status {
          display: flex;

          align-items: center;

          gap: 9px;

          margin-top: 10px;

          padding: 11px;

          border-radius: 9px;

          background: #111c31;

          border: 1px solid #1e293b;
        }

        .status-dot {
          width: 8px;

          height: 8px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 7px
            rgba(34, 197, 94, 0.7);

          flex-shrink: 0;
        }

        .status-title {
          font-size: 11px;

          font-weight: 700;

          color: #e2e8f0;

          line-height: 14px;
        }

        .status-subtitle {
          font-size: 9px;

          color: #64748b;

          line-height: 13px;
        }


        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 700px) {

          .sidebar {
            position: relative;

            width: 100%;

            height: auto;

            min-height: auto;
          }

          .navigation {
            overflow: visible;
          }

          .system-status {
            display: none;
          }
        }

      `}</style>
    </aside>
  );
}
