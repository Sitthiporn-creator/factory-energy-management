"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
      .order("record_date", { ascending: true });

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
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "25px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ margin: 0 }}>
            ⚡ Factory Energy Management
          </h1>

          <p
            style={{
              marginBottom: 0,
              color: "#666",
            }}
          >
            ระบบจัดการและติดตามการใช้พลังงานโรงงาน
          </p>
        </div>

        {loading ? (
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <h2>📊 Energy Overview</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "30px",
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

            {/* Energy Chart */}
            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                marginBottom: "30px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <h2>📈 แนวโน้มการใช้พลังงาน</h2>

              {data.length > 0 ? (
                <div
                  style={{
                    width: "100%",
                    height: "400px",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="record_date"
                      />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="electricity"
                        name="ไฟฟ้า"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />

                      <Line
                        type="monotone"
                        dataKey="solar"
                        name="Solar"
                        stroke="#f59e0b"
                        strokeWidth={3}
                      />

                      <Line
                        type="monotone"
                        dataKey="gas"
                        name="Gas"
                        stroke="#ef4444"
                        strokeWidth={3}
                      />

                      <Line
                        type="monotone"
                        dataKey="fuel"
                        name="น้ำมัน"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p>ยังไม่มีข้อมูลสำหรับสร้างกราฟ</p>
              )}
            </div>

            {/* Data Table */}
            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <h2>📋 ข้อมูลพลังงาน</h2>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
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
                      <th style={th}>หมายเหตุ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.map((item) => (
                      <tr key={item.id}>
                        <td style={td}>
                          {item.record_date}
                        </td>

                        <td style={td}>
                          {Number(
                            item.electricity || 0
                          ).toLocaleString()}
                        </td>

                        <td style={td}>
                          {Number(
                            item.solar || 0
                          ).toLocaleString()}
                        </td>

                        <td style={td}>
                          {Number(
                            item.gas || 0
                          ).toLocaleString()}
                        </td>

                        <td style={td}>
                          {Number(
                            item.fuel || 0
                          ).toLocaleString()}
                        </td>

                        <td style={td}>
                          {Number(
                            item.steam || 0
                          ).toLocaleString()}
                        </td>

                        <td style={td}>
                          {Number(
                            item.water || 0
                          ).toLocaleString()}
                        </td>

                        <td style={td}>
                          {item.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.length === 0 && (
                <p>ยังไม่มีข้อมูลพลังงาน</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function Card({ title, value, unit }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          color: "#555",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        {Number(value).toLocaleString()}
      </div>

      <div
        style={{
          marginTop: "5px",
          color: "#888",
        }}
      >
        {unit}
      </div>
    </div>
  );
}

const th = {
  border: "1px solid #ddd",
  padding: "12px",
  background: "#f1f5f9",
  textAlign: "center",
};

const td = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "center",
};
