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
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>

        <div className="brand-text">
          <div className="brand-title">ENERGY</div>
          <div className="brand-subtitle">MANAGEMENT</div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* MENU */}
      <nav className="sidebar-nav">
        {menuGroups.map((group) => (
          <div className="menu-group" key={group.title}>
            <div className="menu-title">{group.title}</div>

            <div className="menu-list">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`menu-item ${
                      isActive ? "menu-item-active" : ""
                    }`}
                  >
                    <span className="menu-icon">{item.icon}</span>

                    <span className="menu-name">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* STATUS */}
      <div className="sidebar-bottom">
        <div className="online-dot"></div>

        <div className="status-text">
          <div className="online-title">System Online</div>
          <div className="online-subtitle">
            Energy Management
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;

          width: 250px;

          background:
            radial-gradient(
              circle at top left,
              rgba(59, 130, 246, 0.18),
              transparent 35%
            ),
            linear-gradient(
              180deg,
              #0f172a 0%,
              #111827 100%
            );

          color: white;

          padding: 24px 16px;

          box-sizing: border-box;

          z-index: 1000;

          display: flex;
          flex-direction: column;

          border-right: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        /* =========================
           BRAND
        ========================= */

        .sidebar-brand {
          display: flex;
          align-items: center;

          gap: 12px;

          padding: 4px 8px 18px;
        }

        .brand-icon {
          width: 44px;
          height: 44px;

          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );

          font-size: 23px;

          box-shadow:
            0 8px 24px
            rgba(37, 99, 235, 0.3);

          flex-shrink: 0;
        }

        .brand-text {
          min-width: 0;
        }

        .brand-title {
          font-size: 17px;
          font-weight: 800;

          letter-spacing: 1.2px;

          line-height: 1.1;
        }

        .brand-subtitle {
          margin-top: 4px;

          font-size: 10px;

          color: #94a3b8;

          letter-spacing: 1.5px;

          line-height: 1;
        }

        /* =========================
           DIVIDER
        ========================= */

        .sidebar-divider {
          height: 1px;

          background:
            rgba(255, 255, 255, 0.08);

          margin:
            0 8px 18px;
        }

        /* =========================
           NAVIGATION
        ========================= */

        .sidebar-nav {
          flex: 1;

          overflow-y: auto;

          padding-right: 2px;
        }

        .menu-group {
          margin-bottom: 24px;
        }

        .menu-title {
          padding:
            0 12px;

          margin-bottom: 8px;

          font-size: 11px;

          font-weight: 700;

          color: #64748b;

          letter-spacing: 0.8px;
        }

        .menu-list {
          width: 100%;
        }

        /* =========================
           MENU ITEM
        ========================= */

        .menu-item {
          display: grid;

          grid-template-columns:
            30px
            minmax(0, 1fr);

          align-items: center;

          column-gap: 10px;

          width: 100%;

          min-height: 46px;

          padding:
            0 12px;

          margin:
            4px 0;

          border-radius: 12px;

          color: #cbd5e1;

          text-decoration: none;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;

          font-size: 14px;

          font-weight: 500;

          box-sizing: border-box;
        }

        .menu-item:hover {
          background:
            rgba(255, 255, 255, 0.07);

          color: white;

          transform:
            translateX(2px);
        }

        .menu-item-active {
          background:
            linear-gradient(
              90deg,
              rgba(37, 99, 235, 0.95),
              rgba(14, 165, 233, 0.8)
            );

          color: white;

          box-shadow:
            0 8px 20px
            rgba(37, 99, 235, 0.2);
        }

        /* =========================
           ICON
        ========================= */

        .menu-icon {
          width: 30px;
          min-width: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          text-align: center;

          font-size: 19px;

          line-height: 1;
        }

        /* =========================
           TEXT
        ========================= */

        .menu-name {
          min-width: 0;

          overflow: hidden;

          white-space: nowrap;

          text-overflow: ellipsis;

          line-height: 1.4;
        }

        /* =========================
           BOTTOM STATUS
        ========================= */

        .sidebar-bottom {
          display: grid;

          grid-template-columns:
            12px
            minmax(0, 1fr);

          align-items: center;

          column-gap: 10px;

          padding:
            14px 12px;

          margin-top: 10px;

          border-radius: 12px;

          background:
            rgba(255, 255, 255, 0.04);

          border:
            1px solid
            rgba(255, 255, 255, 0.06);
        }

        .online-dot {
          width: 9px;
          height: 9px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 10px
            rgba(34, 197, 94, 0.8);
        }

        .status-text {
          min-width: 0;
        }

        .online-title {
          font-size: 12px;

          font-weight: 700;

          line-height: 1.2;
        }

        .online-subtitle {
          margin-top: 3px;

          font-size: 10px;

          color: #64748b;

          line-height: 1.2;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        /* =========================
           SCROLLBAR
        ========================= */

        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background:
            rgba(255, 255, 255, 0.12);

          border-radius: 10px;
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {
          .sidebar {
            width: 210px;
          }
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

            padding: 16px;
          }

          .sidebar-nav {
            overflow: visible;
          }

          .sidebar-bottom {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
