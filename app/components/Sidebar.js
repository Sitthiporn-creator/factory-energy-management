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
    <aside className="fes-sidebar">

      {/* LOGO */}
      <div className="fes-brand">
        <div className="fes-brand-logo">
          ⚡
        </div>

        <div className="fes-brand-info">
          <div className="fes-brand-title">
            Factory Energy
          </div>

          <div className="fes-brand-subtitle">
            Management System
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="fes-menu">

        {menus.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`fes-menu-item ${
                active ? "fes-active" : ""
              }`}
            >
              <span className="fes-icon">
                <Icon type={item.icon} />
              </span>

              <span className="fes-text">
                {item.name}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* FOOTER */}
      <div className="fes-footer">

        <div className="fes-footer-icon">
          🏭
        </div>

        <div>
          <div className="fes-footer-title">
            โรงงานตัวอย่าง
          </div>

          <div className="fes-footer-text">
            ระบบจัดการพลังงานภายในโรงงาน
          </div>
        </div>

      </div>

      <style jsx>{`

        .fes-sidebar {
          position: fixed !important;

          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;

          width: 250px !important;

          background: #14233f !important;

          color: #ffffff !important;

          padding: 18px 12px !important;

          box-sizing: border-box !important;

          display: flex !important;

          flex-direction: column !important;

          z-index: 9999 !important;

          border-right: 1px solid
            rgba(255,255,255,0.06) !important;
        }


        /* =========================
           BRAND
        ========================= */

        .fes-brand {
          width: 100% !important;

          height: 55px !important;

          display: flex !important;

          flex-direction: row !important;

          align-items: center !important;

          justify-content: flex-start !important;

          gap: 11px !important;

          padding: 0 8px !important;

          margin-bottom: 20px !important;

          box-sizing: border-box !important;
        }

        .fes-brand-logo {
          width: 40px !important;

          height: 40px !important;

          min-width: 40px !important;

          display: flex !important;

          align-items: center !important;

          justify-content: center !important;

          background: #2878ed !important;

          border-radius: 10px !important;

          font-size: 23px !important;

          flex-shrink: 0 !important;
        }

        .fes-brand-info {
          display: flex !important;

          flex-direction: column !important;

          align-items: flex-start !important;

          justify-content: center !important;

          min-width: 0 !important;
        }

        .fes-brand-title {
          font-size: 16px !important;

          font-weight: 700 !important;

          line-height: 20px !important;

          white-space: nowrap !important;
        }

        .fes-brand-subtitle {
          font-size: 10px !important;

          color: #91a1ba !important;

          line-height: 14px !important;

          white-space: nowrap !important;
        }


        /* =========================
           MENU
        ========================= */

        .fes-menu {
          width: 100% !important;

          display: flex !important;

          flex-direction: column !important;

          gap: 5px !important;

          margin: 0 !important;

          padding: 0 !important;
        }


        /* =========================
           MENU ITEM
        ========================= */

        .fes-menu-item {
          width: 100% !important;

          height: 46px !important;

          min-height: 46px !important;

          display: flex !important;

          flex-direction: row !important;

          align-items: center !important;

          justify-content: flex-start !important;

          gap: 12px !important;

          padding: 0 14px !important;

          margin: 0 !important;

          box-sizing: border-box !important;

          border-radius: 9px !important;

          background: transparent !important;

          color: #bdc9da !important;

          text-decoration: none !important;

          font-size: 15px !important;

          font-weight: 500 !important;

          line-height: normal !important;

          white-space: nowrap !important;

          overflow: hidden !important;
        }


        .fes-menu-item:hover {
          background: #1e3358 !important;

          color: #ffffff !important;
        }


        .fes-menu-item.fes-active {
          background: #2878ed !important;

          color: #ffffff !important;

          font-weight: 600 !important;
        }


        /* =========================
           ICON
        ========================= */

        .fes-icon {
          width: 22px !important;

          height: 22px !important;

          min-width: 22px !important;

          max-width: 22px !important;

          display: flex !important;

          flex-direction: row !important;

          align-items: center !important;

          justify-content: center !important;

          flex-shrink: 0 !important;

          color: currentColor !important;
        }

        .fes-icon :global(svg) {
          width: 20px !important;

          height: 20px !important;

          display: block !important;
        }


        /* =========================
           TEXT
        ========================= */

        .fes-text {
          display: block !important;

          width: auto !important;

          height: auto !important;

          flex: 1 1 auto !important;

          min-width: 0 !important;

          margin: 0 !important;

          padding: 0 !important;

          color: inherit !important;

          font-size: 15px !important;

          font-weight: inherit !important;

          line-height: normal !important;

          text-align: left !important;

          white-space: nowrap !important;

          overflow: hidden !important;

          text-overflow: ellipsis !important;

          text-decoration: none !important;
        }


        /* =========================
           FOOTER
        ========================= */

        .fes-footer {
          margin-top: auto !important;

          padding: 15px 9px 4px !important;

          border-top: 1px solid
            rgba(255,255,255,0.07) !important;

          display: flex !important;

          flex-direction: row !important;

          align-items: center !important;

          gap: 9px !important;
        }

        .fes-footer-icon {
          width: 34px !important;

          height: 34px !important;

          display: flex !important;

          align-items: center !important;

          justify-content: center !important;

          font-size: 22px !important;

          flex-shrink: 0 !important;
        }

        .fes-footer-title {
          color: #ffffff !important;

          font-size: 12px !important;

          font-weight: 600 !important;
        }

        .fes-footer-text {
          color: #71809a !important;

          font-size: 9px !important;

          margin-top: 2px !important;
        }


        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 700px) {
          .fes-sidebar {
            position: relative !important;

            width: 100% !important;

            height: auto !important;

            min-height: auto !important;
          }

          .fes-footer {
            display: none !important;
          }
        }

      `}</style>

    </aside>
  );
}
