"use client";

import { useState } from "react";

export default function Home() {
  const [data, setData] = useState([
    { type: "ไฟฟ้า", value: 4520, unit: "kWh", cost: 21350 },
    { type: "Solar", value: 1280, unit: "kWh", cost: 0 },
    { type: "ก๊าซ", value: 850, unit: "Nm³", cost: 9800 },
    { type: "น้ำมัน", value: 420, unit: "L", cost: 14500 },
    { type: "น้ำ", value: 680, unit: "m³", cost: 5200 }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "ไฟฟ้า",
    value: "",
    unit: "kWh",
    cost: ""
  });

  const addData = () => {
    if (!form.value) return;

    setData([
      ...data,
      {
        type: form.type,
        value: Number(form.value),
        unit: form.unit,
        cost: Number(form.cost || 0)
      }
    ]);

    setForm({
      type: "ไฟฟ้า",
      value: "",
      unit: "kWh",
      cost: ""
    });

    setShowForm(false);
  };

  const electricity = data
    .filter((x) => x.type === "ไฟฟ้า")
    .reduce((a, b) => a + b.value, 0);

  const solar = data
    .filter((x) => x.type === "Solar")
    .reduce((a, b) => a + b.value, 0);

  const totalCost = data.reduce((a, b) => a + b.cost, 0);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f6f8fb",
      fontFamily: "Arial, sans-serif",
      color: "#172033"
    }}>

      {/* Sidebar */}
      <aside style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 230,
        background: "#111827",
        color: "white",
        padding: 24
      }}>
        <h2 style={{ marginBottom: 35 }}>
          ⚡ Energy System
        </h2>

        <div style={{ padding: "12px 0" }}>📊 Dashboard</div>
        <div style={{ padding: "12px 0" }}>⚡ ข้อมูลพลังงาน</div>
        <div style={{ padding: "12px 0" }}>🏭 เครื่องจักร</div>
        <div style={{ padding: "12px 0" }}>♨️ Boiler / Steam</div>
        <div style={{ padding: "12px 0" }}>☀️ Solar</div>
        <div style={{ padding: "12px 0" }}>📈 รายงาน</div>
        <div style={{ padding: "12px 0" }}>💰 ค่าใช้จ่าย</div>
        <div style={{ padding: "12px 0" }}>⚙️ ตั้งค่า</div>
      </aside>

      {/* Main */}
      <section style={{
        marginLeft: 230,
        padding: 35
      }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{ margin: 0 }}>Factory Energy Dashboard</h1>
            <p style={{ color: "#667085" }}>
              ระบบจัดการและติดตามการใช้พลังงานโรงงาน
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "#2563eb",
              color: "white",
              border: 0,
              padding: "12px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 15
            }}
          >
            + เพิ่มข้อมูล
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            marginTop: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,.06)"
          }}>
            <h3>เพิ่มข้อมูลพลังงาน</h3>

            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              style={inputStyle}
            >
              <option>ไฟฟ้า</option>
              <option>Solar</option>
              <option>ก๊าซ</option>
              <option>น้ำมัน</option>
              <option>น้ำ</option>
              <option>Steam</option>
            </select>

            <input
              placeholder="ปริมาณ"
              value={form.value}
              onChange={(e) =>
                setForm({ ...form, value: e.target.value })
              }
              style={inputStyle}
            />

            <input
              placeholder="หน่วย เช่น kWh"
              value={form.unit}
              onChange={(e) =>
                setForm({ ...form, unit: e.target.value })
              }
              style={inputStyle}
            />

            <input
              placeholder="ค่าใช้จ่าย"
              value={form.cost}
              onChange={(e) =>
                setForm({ ...form, cost: e.target.value })
              }
              style={inputStyle}
            />

            <button
              onClick={addData}
              style={{
                background: "#16a34a",
                color: "white",
                border: 0,
                padding: "10px 20px",
                borderRadius: 7,
                cursor: "pointer"
              }}
            >
              บันทึกข้อมูล
            </button>
          </div>
        )}

        {/* KPI */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
          marginTop: 25
        }}>

          <Card title="ไฟฟ้าจาก Grid" value={electricity} unit="kWh" icon="⚡" />
          <Card title="Solar Generation" value={solar} unit="kWh" icon="☀️" />
          <Card title="Boiler / Steam" value="850" unit="ตัน" icon="♨️" />
          <Card title="Energy Cost" value={totalCost.toLocaleString()} unit="บาท" icon="💰" />

        </div>

        {/* Dashboard */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginTop: 25
        }}>

          <div style={boxStyle}>
            <h3>การใช้พลังงานรายเดือน</h3>

            <div style={{
              height: 260,
              display: "flex",
              alignItems: "end",
              gap: 25,
              padding: 20
            }}>
              {[45, 70, 55, 85, 65, 95, 75, 88, 60, 80, 68, 92].map(
                (height, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      background: "#2563eb",
                      borderRadius: "5px 5px 0 0"
                    }}
                  />
                )
              )}
            </div>
          </div>

          <div style={boxStyle}>
            <h3>Energy Mix</h3>

            <div style={{
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                background:
                  "conic-gradient(#2563eb 0 55%, #16a34a 55% 75%, #f59e0b 75% 90%, #94a3b8 90% 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{
                  width: 90,
                  height: 90,
                  background: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}>
                  Energy
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Equipment */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 20
        }}>

          <div style={boxStyle}>
            <h3>☀️ Solar System</h3>
            <p>Installed Capacity: <b>500 kW</b></p>
            <p>Today's Generation: <b>{solar} kWh</b></p>
            <p>Status: <b style={{ color: "#16a34a" }}>● Online</b></p>
          </div>

          <div style={boxStyle}>
            <h3>♨️ Boiler / Steam</h3>
            <p>Steam Production: <b>850 ton</b></p>
            <p>Fuel Consumption: <b>420 L</b></p>
            <p>Efficiency: <b>82%</b></p>
          </div>

        </div>

        {/* Data table */}
        <div style={{
          ...boxStyle,
          marginTop: 20
        }}>
          <h3>ข้อมูลพลังงานล่าสุด</h3>

          <table style={{
            width: "100%",
            borderCollapse: "collapse"
          }}>
            <thead>
              <tr>
                <th style={thStyle}>ประเภท</th>
                <th style={thStyle}>ปริมาณ</th>
                <th style={thStyle}>หน่วย</th>
                <th style={thStyle}>ค่าใช้จ่าย</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{item.type}</td>
                  <td style={tdStyle}>
                    {item.value.toLocaleString()}
                  </td>
                  <td style={tdStyle}>{item.unit}</td>
                  <td style={tdStyle}>
                    {item.cost.toLocaleString()} บาท
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </section>
    </main>
  );
}

function Card({ title, value, unit, icon }) {
  return (
    <div style={{
      background: "white",
      padding: 22,
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,.05)"
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <p style={{ color: "#667085" }}>{title}</p>
      <h2 style={{ margin: 0 }}>
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </h2>
      <small>{unit}</small>
    </div>
  );
}

const inputStyle = {
  padding: 11,
  marginRight: 10,
  marginBottom: 10,
  border: "1px solid #d0d5dd",
  borderRadius: 7
};

const boxStyle = {
  background: "white",
  padding: 22,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,.05)"
};

const thStyle = {
  textAlign: "left",
  padding: 12,
  borderBottom: "1px solid #ddd"
};

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #eee"
};
