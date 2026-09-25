import "./globals.css";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import Sidebar from "./components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata = {
  title: "Factory Energy Management",
  description: "ระบบจัดการพลังงานโรงงาน",
};

export const viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      <body
        style={{
          display: "flex",
          margin: 0,
          minHeight: "100vh",
          fontFamily: "var(--font-inter), var(--font-noto-thai), sans-serif",
        }}
      >
        <Sidebar />

        <main
          className="main-content"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: "100vh",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
