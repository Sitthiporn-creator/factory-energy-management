"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const ENERGY_TYPES = {
  electricity: {
    label: "⚡ ไฟฟ้า",
    unit: "kWh",
  },
  solar: {
    label: "☀️ Solar",
    unit: "kWh",
  },
  gas: {
    label: "🔥 Gas",
    unit: "หน่วย",
  },
  fuel: {
    label: "🛢️ น้ำมัน",
    unit: "หน่วย",
  },
  steam: {
    label: "💨 Steam",
    unit: "หน่วย",
  },
  water: {
    label: "💧 น้ำ",
    unit: "หน่วย",
  },
};

const MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [energyType, setEnergyType] = useState("electricity");
  const [selectedYear, setSelectedYear] = useState("");
  const [chartMode, setChartMode] = useState("monthly");

  async function loadData() {
    setLoading(true);

    const { data: energyData, error } = await supabase
      .from("energy_data")
      .select("*")
      .order("record_date", { ascending: true });

    if (error) {
      console.error(error);
      alert("โหลดข้อมูลไม่สำเร็จ: " + error.message);
      setLoading(false);
      return;
    }

    setData(energyData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------
  // ปีที่มีข้อมูล
  // -----------------------------

  const years = useMemo(() => {
    const yearSet = new Set();

    data.forEach((item) => {
      if (item.record_date) {
        const year = new Date(item.record_date).getFullYear();
        yearSet.add(year);
      }
    });

    return Array.from(yearSet).sort((a, b) => b - a);
  }, [data]);

  // ตั้งค่าปีเริ่มต้น
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(String(years[0]));
    }
  }, [years, selectedYear]);

  // -----------------------------
  // รวมยอด
  // -----------------------------

  const total = (field) => {
    return data.reduce(
      (sum, item) => sum + Number(item[field] || 0),
      0
    );
  };

  // -----------------------------
  // ข้อมูลกราฟรายเดือน
  // -----------------------------

  const monthlyData = useMemo(() => {
    if (!selectedYear) return [];

    const result = MONTHS.map((month, index) => ({
      month,
      value: 0,
    }));

    data.forEach((item) => {
      if (!item.record_date) return;

      const date = new Date(item.record_date);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (String(year) === String(selectedYear)) {
        result[month].value += Number(
          item[energyType] || 0
        );
      }
    });

    return result;
  }, [data, selectedYear, energyType]);

  // -----------------------------
  // ข้อมูลกราฟรายปี
  // -----------------------------

  const yearlyData = useMemo(() => {
    const result = {};

    data.forEach((item) => {
      if (!item.record_date) return;

      const year = new Date(item.record_date).getFullYear();

      if (!result[year]) {
        result[year] = 0;
      }

      result[year] += Number(
        item[energyType] || 0
      );
    });

    return Object.keys(result)
      .sort((a, b) => Number(a) - Number(b))
      .map((year) => ({
        year,
        value: result[year],
      }));
  }, [data, energyType]);

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
          maxWidth: "1300px",
          margin: "auto",
        }}
      >
        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "25px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
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
              padding: "50px",
              borderRadius: "16px",
              textAlign: "center",
            }}
          >
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            {/* =========================
                SUMMARY
            ========================= */}

            <h2>📊 Energy Overview</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
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

            {/* =========================
                CHART CONTROL
            ========================= */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                marginBottom: "25px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <h2>
                📈 วิเคราะห์การใช้พลังงาน
              </h2>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "15px",
                  marginTop: "20px",
                }}
              >
                {/* ประเภทพลังงาน */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    ประเภทพลังงาน
                  </label>

                  <select
                    value={energyType}
                    onChange={(e) =>
                      setEnergyType(e.target.value)
                    }
                    style={selectStyle}
                  >
                    {Object.entries(
                      ENERGY_TYPES
                    ).map(([key, item]) => (
                      <option
                        key={key}
                        value={key}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ปี */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    ปี
                  </label>

                  <select
                    value={selectedYear}
                    onChange={(e) =>
                      setSelectedYear(e.target.value)
                    }
                    style={selectStyle}
                  >
                    {years.length === 0 ? (
                      <option value="">
                        ไม่มีข้อมูล
                      </option>
                    ) : (
                      years.map((year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* รูปแบบกราฟ */}

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    เปรียบเทียบ
                  </label>

                  <select
                    value={chartMode}
                    onChange={(e) =>
                      setChartMode(e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="monthly">
                      รายเดือน
                    </option>

                    <option value="yearly">
                      รายปี
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* =========================
                MONTHLY CHART
            ========================= */}

            {chartMode === "monthly" && (
              <div
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "16px",
                  marginBottom: "30px",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                <h2>
                  📅 การใช้
                  {ENERGY_TYPES[energyType].label}{" "}
                  รายเดือน ปี {selectedYear}
                </h2>

                <p style={{ color: "#666" }}>
                  หน่วย:{" "}
                  {ENERGY_TYPES[energyType].unit}
                </p>

                <div
                  style={{
                    width: "100%",
                    height: "450px",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={monthlyData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="month"
                      />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="value"
                        name={
                          ENERGY_TYPES[
                            energyType
                          ].label
                        }
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* =========================
                YEARLY CHART
            ========================= */}

            {chartMode === "yearly" && (
              <div
                style={{
                  background: "white",
                  padding: "25px",
                  borderRadius: "16px",
                  marginBottom: "30px",
                  boxShadow:
                    "0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                <h2>
                  📊 เปรียบเทียบ
                  {ENERGY_TYPES[energyType].label}{" "}
                  รายปี
                </h2>

                <p style={{ color: "#666" }}>
                  หน่วย:{" "}
                  {ENERGY_TYPES[energyType].unit}
                </p>

                <div
                  style={{
                    width: "100%",
                    height: "450px",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={yearlyData}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="year"
                      />

                      <YAxis />

                      <Tooltip />

                      <Legend />

                      <Bar
                        dataKey="value"
                        name={
                          ENERGY_TYPES[
                            energyType
                          ].label
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* =========================
                DATA TABLE
            ========================= */}

            <div
              style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <h2>📋 ข้อมูลพลังงานทั้งหมด</h2>

              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    marginTop: "15px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={th}>
                        วันที่
                      </th>

                      <th style={th}>
                        ไฟฟ้า
                      </th>

                      <th style={th}>
                        Solar
                      </th>

                      <th style={th}>
                        Gas
                      </th>

                      <th style={th}>
                        น้ำมัน
                      </th>

                      <th style={th}>
                        Steam
                      </th>

                      <th style={th}>
                        น้ำ
                      </th>

                      <th style={th}>
                        หมายเหตุ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data
                      .slice()
                      .reverse()
                      .map((item) => (
                        <tr key={item.id}>
                          <td style={td}>
                            {item.record_date}
                          </td>

                          <td style={td}>
                            {formatNumber(
                              item.electricity
                            )}
                          </td>

                          <td style={td}>
                            {formatNumber(
                              item.solar
                            )}
                          </td>

                          <td style={td}>
                            {formatNumber(
                              item.gas
                            )}
                          </td>

                          <td style={td}>
                            {formatNumber(
                              item.fuel
                            )}
                          </td>

                          <td style={td}>
                            {formatNumber(
                              item.steam
                            )}
                          </td>

                          <td style={td}>
                            {formatNumber(
                              item.water
                            )}
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
                <p>
                  ยังไม่มีข้อมูลพลังงาน
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// ======================================
// CARD
// ======================================

function Card({ title, value, unit }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "16px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.06)",
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
          fontSize: "30px",
          fontWeight: "bold",
          marginTop: "10px",
        }}
      >
        {formatNumber(value)}
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

// ======================================
// FORMAT NUMBER
// ======================================

function formatNumber(value) {
  return Number(value || 0).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2,
    }
  );
}

// ======================================
// TABLE STYLE
// ======================================

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

const selectStyle = {
  padding: "10px 15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "white",
  fontSize: "15px",
  minWidth: "180px",
};
