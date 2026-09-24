"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ type }) {
  const icons = {
    home: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M3 10.8L12 3l9 7.8v8.7a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-8.7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 21v-6h6v6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),

    data: (
      <svg viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="3"
          width="16"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 8h8M8 12h8M8 16h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),

    chart: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19V5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M4 19h17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M7 15l4-4 3 2 5-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="15" r="1" fill="currentColor" />
        <circle cx="11" cy="11" r="1" fill="currentColor" />
        <circle cx="14" cy="13" r="1" fill="currentColor" />
        <circle cx="19" cy="7" r="1" fill="currentColor" />
      </svg>
    ),

    report: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M6 3h9l4 4v14H6V3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 12h6M9 16h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),

    bulb: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M9 18h6M10 21h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8.2 14.8C6.8 13.7 6 12 6 10a6 6 0 1 1 12 0c0 2-.8 3.7-2.2 4.8-.7.6-1.1 1.3-1.1 2.2h-5.4c0-.9-.4-1.6-1.1-2.2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),

    settings: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return icons[type];
}

export default function Sidebar() {
  const pathname = usePathname();

  const menus = [
    {
      name: "Dashboard",
      icon: "home",
      href: "/",
    },
    {
      name: "Data",
      icon: "data",
      href: "/input",
    },
    {
      name: "กราฟและสถิติ",
      icon: "chart",
      href: "/analytics",
    },
    {
      name: "รายงาน",
      icon: "report",
      href: "/reports",
    },
    {
      name: "มาตรการอนุรักษ์พลังงาน",
      icon: "bulb",
      href: "/measures",
    },
    {
      name: "ตั้งค่า",
      icon: "settings",
      href: "/settings",
    },
  ];

  return (
    <aside className="sidebar">

      {/* =========================
          BRAND
      ========================= */}

      <div className="brand">

        <div className="brand-logo">
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M22.5 3 9 22h9l-1.5 15L31 17h-9l.5-14Z"
              fill="white"
              stroke="white"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="brand-text">
          <div className="brand-title">
            Factory Energy
          </div>

          <div className="brand-subtitle">
            Management System
          </div>
        </div>

      </div>

      {/* =========================
          MENU
      ========================= */}

      <nav className="sidebar-menu">

        {menus.map((menu) => {

          const active =
            menu.href === "/"
              ? pathname === "/"
              : pathname.startsWith(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`sidebar-item ${
                active ? "active" : ""
              }`}
            >

              <span className="sidebar-icon">
                <Icon type={menu.icon} />
              </span>

              <span className="sidebar-text">
                {menu.name}
              </span>

            </Link>
          );
        })}

      </nav>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="sidebar-bottom">

        <div className="factory-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M5 34h30"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M8 34V17l9 4v-8l9 4v17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <path
              d="M29 34V10h5v24"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M12 27h2M19 27h2M26 27h2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="factory-name">
          โรงงานตัวอย่าง
        </div>

        <div className="factory-description">
          ระบบจัดการพลังงานภายในโรงงาน
        </div>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;

          left: 0;
          top: 0;
          bottom: 0;

          width: 208px;

          background:
            linear-gradient(
              180deg,
              #14233f 0%,
              #101d34 100%
            );

          color: #ffffff;

          display: flex;
          flex-direction: column;

          padding: 17px 10px;

          border-right: 1px solid
            rgba(255,255,255,0.05);

          z-index: 1000;
        }


        /* =========================
           BRAND
        ========================= */

        .brand {
          display: flex;

          align-items: center;

          gap: 10px;

          padding:
            2px 8px 19px;
        }

        .brand-logo {
          width: 35px;
          height: 35px;

          flex-shrink: 0;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #3b82f6,
              #2563eb
            );

          display: flex;

          align-items: center;
          justify-content: center;

          box-shadow:
            0 5px 15px
            rgba(37,99,235,0.35);
        }

        .brand-logo svg {
          width: 25px;
          height: 25px;
        }

        .brand-text {
          min-width: 0;
        }

        .brand-title {
          font-size: 15px;

          font-weight: 700;

          line-height: 18px;

          white-space: nowrap;
        }

        .brand-subtitle {
          margin-top: 2px;

          color: #94a3b8;

          font-size: 9px;

          line-height: 12px;

          white-space: nowrap;
        }


        /* =========================
           MENU
        ========================= */

        .sidebar-menu {
          display: flex;

          flex-direction: column;

          gap: 3px;

          margin-top: 9px;
        }

        .sidebar-item {
          width: 100%;

          height: 40px;

          display: flex;

          align-items: center;

          gap: 10px;

          padding: 0 12px;

          border-radius: 8px;

          text-decoration: none;

          color: #b9c5d6;

          font-size: 13px;

          font-weight: 500;

          line-height: 1;

          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .sidebar-item:hover {
          background:
            rgba(255,255,255,0.07);

          color: #ffffff;
        }

        .sidebar-item.active {
          background: #2874e8;

          color: #ffffff;

          box-shadow:
            0 5px 14px
            rgba(37,99,235,0.25);
        }


        /* =========================
           ICON
        ========================= */

        .sidebar-icon {
          width: 19px;
          height: 19px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          color: currentColor;
        }

        .sidebar-icon :global(svg) {
          width: 18px;
          height: 18px;

          display: block;
        }


        /* =========================
           TEXT
        ========================= */

        .sidebar-text {
          display: block;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

          font-size: 13px;

          line-height: 1.2;

          color: inherit;
        }


        /* =========================
           BOTTOM
        ========================= */

        .sidebar-bottom {
          margin-top: auto;

          padding:
            15px 10px 4px;

          border-top:
            1px solid
            rgba(255,255,255,0.06);
        }

        .factory-icon {
          width: 34px;
          height: 34px;

          color: #8fa4c4;

          margin-bottom: 6px;
        }

        .factory-icon svg {
          width: 34px;
          height: 34px;
        }

        .factory-name {
          color: #ffffff;

          font-size: 11px;

          font-weight: 600;

          line-height: 15px;
        }

        .factory-description {
          color: #64748b;

          font-size: 8px;

          line-height: 13px;

          margin-top: 2px;

          white-space: nowrap;
        }


        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 900px) {

          .sidebar {
            width: 208px;
          }

        }

        @media (max-width: 700px) {

          .sidebar {
            position: relative;

            width: 100%;

            height: auto;

            min-height: auto;

            padding: 15px;
          }

          .sidebar-menu {
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
