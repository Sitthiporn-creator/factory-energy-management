import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "Factory Energy Management",
  description: "ระบบจัดการพลังงานโรงงาน",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
