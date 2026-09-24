"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("energy_data")
      .select("*")
      .order("record_date", { ascending: false });

    if (error) {
      console.error(error);
      alert("โหลดข้อมูลไม่สำเร็จ: " + error.message);
      setLoading(false);
      return;
    }

    setData(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const total = (field) =>
    data.reduce((sum, item) => sum + Number(item[field] || 0), 0);

  return (
    <main
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <h1>Factory Energy Management</h1>

      <p>ระบบจัดการพลังงานโรงงาน</p>

      <hr />

      <h2>📊 Energy Dashboard</h2>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <Card
              title="⚡ ไฟฟ้า"
              value={total("electricity")}
              unit="kWh"
            />

            <Card
              title="☀️ Solar"
              value={total("solar")}
              unit="kWh"
            />

            <Card
              title="🔥 Gas"
              value={total("gas")}
              unit="หน่วย"
            />

            <Card
              title="🛢️ น้ำมัน"
              value={total("fuel")}
              unit="หน่วย"
            />

            <Card
              title="💨 Steam"
              value={total("steam")}
              unit="หน่วย"
            />

            <Card
              title="💧 น้ำ"
              value={total("water")}
              unit="หน่วย"
            />
          </div>

          <h2 style={{ marginTop: "40px" }}>
            📋 ข้อมูลพลังงาน
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th style={th}>วันที่</th>
                <th style={th}>ไฟฟ้า</th>
                <th style={th}>Solar</th>
                <th style={th}>Gas</th>
                <th style={th}>น้ำมัน</th>
                <th style={th}>Steam</th>
                <th style={th}>น้ำ</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td style={td}>{item.record_date}</td>
                  <td style={td}>{item.electricity}</td>
                  <td style={td}>{item.solar}</td>
                  <td style={td}>{item.gas}</td>
                  <td style={td}>{item.fuel}</td>
                  <td style={td}>{item.steam}</td>
                  <td style={td}>{item.water}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.length === 0 && (
            <p>ยังไม่มีข้อมูลพลังงาน</p>
          )}
        </>
      )}
    </main>
  );
}

function Card({ title, value, unit }) {
  return (
    <div
      style={{
        padding: "25px",
        borderRadius: "12px",
        background: "#f5f5f5",
        border: "1px solid #ddd",
      }}
    >
      <h3>{title}</h3>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        {value.toLocaleString()}
      </div>

      <div style={{ marginTop: "5px", color: "#666" }}>
        {unit}
      </div>
    </div>
  );
}

const th = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f0f0f0",
  textAlign: "center",
};

const td = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};
