"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ type }) {
  const icons = {
    home: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 21v-6h6v6"
          stroke="currentColor"
          strokeWidth="2"
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
          strokeWidth="2"
        />
        <path
          d="M8 8h8M8 12h8M8 16h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),

    chart: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19V5M4 19h17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="m7 15 4-4 3 2 5-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),

    report: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M6 3h9l4 4v14H6V3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M14 3v5h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 12h6M9 16h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),

    bulb: (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M9 18h6M10 21h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8.2 14.8C6.8 13.7 6 12 6 10a6 6 0 1 1 12 0c0 2-.8 3.7-2.2 4.8-.7.6-1.1 1.3-1.1 2.2h-5.4c0-.9-.4-1.6-1.1-2.2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),

    settings: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z"
          stroke="currentColor"
          strokeWidth="1.6"
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

      {/* LOGO */}

      <div className="brand">

        <div className="brand-logo">
          ⚡
        </div>

        <div className="brand-content">
          <div className="brand-title">
            Factory Energy
          </div>

          <div className="brand-subtitle">
            Management System
          </div>
        </div>

      </div>

      {/* MENU */}

      <nav className="menu">

        {menus.map((item) => {

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

              <span className="icon">
                <Icon type={item.icon} />
              </span>

              <span className="text">
                {item.name}
              </span>

            </Link>
          );
        })}

      </nav>

      {/* BOTTOM */}

      <div className="bottom">

        <div className="bottom-icon">
          🏭
        </div>

        <div>
          <div className="bottom-title">
            โรงงานตัวอย่าง
          </div>

          <div className="bottom-text">
            ระบบจัดการพลังงานภายในโรงงาน
          </div>
        </div>

      </div>

      <style jsx>{`

        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;

          top: 0;
          left: 0;
          bottom: 0;

          width: 250px;

          background: #14233f;

          color: white;

          padding: 18px 12px;

          display: flex;

          flex-direction: column;

          box-sizing: border-box;

          z-index: 1000;

          border-right: 1px solid
            rgba(255,255,255,0.06);
        }


        /* =========================
           BRAND
        ========================= */

        .brand {
          display: flex;

          align-items: center;

          gap: 11px;

          height: 52px;

          padding: 0 8px;

          margin-bottom: 20px;
        }

        .brand-logo {
          width: 40px;

          height: 40px;

          flex-shrink: 0;

          border-radius: 10px;

          display: flex;

          align-items: center;

          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #3b82f6,
              #2563eb
            );

          font-size: 23px;

          box-shadow:
            0 5px 15px
            rgba(37,99,235,0.35);
        }

        .brand-content {
          display: flex;

          flex-direction: column;

          justify-content: center;

          min-width: 0;
        }

        .brand-title {
          font-size: 16px;

          font-weight: 700;

          line-height: 20px;

          white-space: nowrap;
        }

        .brand-subtitle {
          color: #91a1ba;

          font-size: 10px;

          line-height: 14px;

          white-space: nowrap;
        }


        /* =========================
           MENU
        ========================= */

        .menu {
          display: flex;

          flex-direction: column;

          gap: 5px;

          width: 100%;
        }


        /* =========================
           MENU ITEM
        ========================= */

        .menu-item {
          width: 100%;

          height: 46px;

          display: flex;

          flex-direction: row;

          align-items: center;

          justify-content: flex-start;

          gap: 12px;

          padding: 0 14px;

          margin: 0;

          box-sizing: border-box;

          border-radius: 9px;

          color: #bdc9da;

          text-decoration: none;

          font-size: 15px;

          font-weight: 500;

          line-height: 1;

          white-space: nowrap;

          overflow: hidden;

          transition:
            background 0.15s ease,
            color 0.15s ease;
        }


        /* =========================
           ICON
        ========================= */

        .icon {
          width: 22px;

          height: 22px;

          flex: 0 0 22px;

          display: flex;

          align-items: center;

          justify-content: center;

          color: currentColor;
        }

        .icon :global(svg) {
          width: 21px;

          height: 21px;

          display: block;
        }


        /* =========================
           TEXT
        ========================= */

        .text {
          flex: 1;

          min-width: 0;

          display: block;

          font-size: 15px;

          font-weight: 500;

          line-height: 46px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;

          color: inherit;
        }


        /* =========================
           HOVER
        ========================= */

        .menu-item:hover {
          background: #1e3358;

          color: #ffffff;
        }


        /* =========================
           ACTIVE
        ========================= */

        .menu-item.active {
          background: #2878ed;

          color: #ffffff;

          font-weight: 600;

          box-shadow:
            0 5px 14px
            rgba(37,99,235,0.25);
        }

        .menu-item.active .text {
          font-weight: 600;
        }


        /* =========================
           BOTTOM
        ========================= */

        .bottom {
          margin-top: auto;

          padding: 14px 9px 4px;

          border-top:
            1px solid
            rgba(255,255,255,0.07);

          display: flex;

          align-items: center;

          gap: 9px;
        }

        .bottom-icon {
          width: 35px;

          height: 35px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 22px;

          flex-shrink: 0;
        }

        .bottom-title {
          font-size: 12px;

          font-weight: 600;

          color: #ffffff;

          line-height: 16px;
        }

        .bottom-text {
          font-size: 9px;

          color: #71809a;

          line-height: 13px;

          white-space: nowrap;
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

          .bottom {
            display: none;
          }

        }

      `}</style>

    </aside>
  );
}
