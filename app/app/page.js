"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "40px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>⚡ Factory Energy Management</h1>

      <p>
        ระบบจัดการพลังงานโรงงาน
      </p>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginTop: "30px",
          maxWidth: "400px"
        }}
      >
        <h2>Dashboard</h2>

        <p>ข้อมูลไฟฟ้า</p>
        <h1>{count.toLocaleString()} kWh</h1>

        <button
          onClick={() => setCount(count + 500)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          + เพิ่ม 500 kWh
        </button>
      </div>
    </main>
  );
}
