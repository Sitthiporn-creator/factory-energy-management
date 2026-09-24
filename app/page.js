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

export default function Dashboard() {
  const [energyData, setEnergyData] = useState([]);
  const [energyTypes, setEnergyTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");

  const [selectedEnergy, setSelectedEnergy] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [dataResult, typeResult] = await Promise.all([
      supabase
        .from("energy_data")
        .select("*")
        .order("record_date", { ascending: true }),

      supabase
        .from("energy_types")
        .select("*")
        .eq("is_active", true)
        .order("id"),
    ]);

    if (dataResult.error) {
      console.error(dataResult.error);
    }

    if (typeResult.error) {
      console.error(typeResult.error);
    }

    const types = typeResult.data || [];

    setEnergyData(dataResult.data || []);
    setEnergyTypes(types);

    if (types.length > 0) {
      setSelectedEnergy(types[0].energy_key);
    }

    setLoading(false);
  }

  /*
   * ดึงค่าพลังงานจาก energy_data
   *
   * สำหรับหัวข้อเดิมที่มี column ใน energy_data
   * เช่น electricity, solar, gas, fuel, steam, water
   */
  function getEnergyValue(row, energyKey) {
    const value = row?.[energyKey];

    return Number(value) || 0;
  }

  /*
   * จัดรูปแบบวันที่
   */
  function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /*
   * จัดข้อมูลตามรูปแบบที่เลือก
   */
  const chartData = useMemo(() => {
    if (!energyData.length) return [];

    if (viewMode === "daily") {
      return energyData.map((row) => {
        const item = {
          label: formatDate(row.record_date),
          date: row.record_date,
        };

        energyTypes.forEach((type) => {
          item[type.energy_key] = getEnergyValue(
            row,
            type.energy_key
          );
        });

        return item;
      });
    }

    if (viewMode === "monthly") {
      const grouped = {};

      energyData.forEach((row) => {
        if (!row.record_date) return;

        const date = new Date(row.record_date);

        const key =
          date.getFullYear() +
          "-" +
          String(date.getMonth() + 1).padStart(2, "0");

        if (!grouped[key]) {
          grouped[key] = {
            label: key,
            date: key,
          };

          energyTypes.forEach((type) => {
            grouped[key][type.energy_key] = 0;
          });
        }

        energyTypes.forEach((type) => {
          grouped[key][type.energy_key] += getEnergyValue(
            row,
            type.energy_key
          );
        });
      });

      return Object.values(grouped);
    }

    if (viewMode === "yearly") {
      const grouped = {};

      energyData.forEach((row) => {
        if (!row.record_date) return;

        const date = new Date(row.record_date);

        const key = String(date.getFullYear());

        if (!grouped[key]) {
          grouped[key] = {
            label: key,
            date: key,
          };

          energyTypes.forEach((type) => {
            grouped[key][type.energy_key] = 0;
          });
        }

        energyTypes.forEach((type) => {
          grouped[key][type.energy_key] += getEnergyValue(
            row,
            type.energy_key
          );
        });
      });

      return Object.values(grouped);
    }

    return [];
  }, [energyData, energyTypes, viewMode]);

  /*
   * ข้อมูลสำหรับตาราง
   */
  const tableData = useMemo(() => {
    if (viewMode === "daily") {
      return [...energyData].reverse();
    }

    const grouped = {};

    energyData.forEach((row) => {
      if (!row.record_date) return;

      const date = new Date(row.record_date);

      let key = "";

      if (viewMode === "monthly") {
        key =
          date.getFullYear() +
          "-" +
          String(date.getMonth() + 1).padStart(2, "0");
      }

      if (viewMode === "yearly") {
        key = String(date.getFullYear());
      }

      if (!grouped[key]) {
        grouped[key] = {
          record_date: key,
          note: "",
        };

        energyTypes.forEach((type) => {
          grouped[key][type.energy_key] = 0;
        });
      }

      energyTypes.forEach((type) => {
        grouped[key][type.energy_key] += getEnergyValue(
          row,
          type.energy_key
        );
      });
    });

    return Object.values(grouped).reverse();
  }, [energyData, energyTypes, viewMode]);

  /*
   * สรุปยอดพลังงาน
   */
  const summaryData = useMemo(() => {
    return energyTypes.map((type) => {
      let total = 0;

      energyData.forEach((row) => {
        total += getEnergyValue(row, type.energy_key);
      });

      return {
        ...type,
        total,
      };
    });
  }, [energyData, energyTypes]);

  const selectedEnergyType = energyTypes.find(
    (type) => type.energy_key === selectedEnergy
  );

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h1>⚡ Energy Management Dashboard</h1>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>

        {/* Header */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                }}
              >
                ⚡ Energy Management Dashboard
              </h1>

              <p
                style={{
                  color: "#666",
                  marginBottom: 0,
                }}
              >
                ระบบติดตามและจัดการข้อมูลพลังงานของโรงงาน
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/input"
                style={{
                  ...menuButtonStyle,
                  background: "#2563eb",
                }}
              >
                ➕ เพิ่มข้อมูล
              </a>

              <a
                href="/edit"
                style={{
                  ...menuButtonStyle,
                  background: "#f59e0b",
                }}
              >
                ✏️ แก้ไขข้อมูล
              </a>

              <a
                href="/settings"
                style={{
                  ...menuButtonStyle,
                  background: "#64748b",
                }}
              >
                ⚙️ ตั้งค่าพลังงาน
              </a>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {summaryData.map((item) => (
            <div
              key={item.id}
              style={{
                ...cardStyle,
                padding: "20px",
              }}
            >
              <div
                style={{
                  color: "#666",
                  fontSize: "15px",
                  marginBottom: "8px",
                }}
              >
                {item.energy_name}
              </div>

              <div
                style={{
                  fontSize: "26px",
                  fontWeight: "bold",
                }}
              >
                {item.total.toLocaleString()}
              </div>

              <div
                style={{
                  color: "#888",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {item.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Control */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >

            {/* รูปแบบ */}
            <div>
              <label style={labelStyle}>
                รูปแบบ
              </label>

              <select
                value={viewMode}
                onChange={(e) =>
                  setViewMode(e.target.value)
                }
                style={selectStyle}
              >
                <option value="daily">
                  รายวัน
                </option>

                <option value="monthly">
                  รายเดือน
                </option>

                <option value="yearly">
                  รายปี
                </option>
              </select>
            </div>

            {/* เลือกพลังงาน */}
            <div>
              <label style={labelStyle}>
                ข้อมูลพลังงาน
              </label>

              <select
                value={selectedEnergy}
                onChange={(e) =>
                  setSelectedEnergy(e.target.value)
                }
                style={selectStyle}
              >
                {energyTypes.map((type) => (
                  <option
                    key={type.id}
                    value={type.energy_key}
                  >
                    {type.energy_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            📊 การใช้พลังงาน
          </h2>

          {selectedEnergyType && (
            <p
              style={{
                color: "#666",
                marginTop: "-8px",
              }}
            >
              {selectedEnergyType.energy_name} (
              {selectedEnergyType.unit})
            </p>
          )}

          <div
            style={{
              width: "100%",
              height: "400px",
              marginTop: "20px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                {selectedEnergyType && (
                  <Line
                    type="monotone"
                    dataKey={
                      selectedEnergyType.energy_key
                    }
                    name={
                      selectedEnergyType.energy_name
                    }
                    strokeWidth={3}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            📈 เปรียบเทียบการใช้พลังงาน
          </h2>

          <div
            style={{
              width: "100%",
              height: "350px",
              marginTop: "20px",
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                />

                <YAxis />

                <Tooltip />

                <Legend />

                {selectedEnergyType && (
                  <Bar
                    dataKey={
                      selectedEnergyType.energy_key
                    }
                    name={
                      selectedEnergyType.energy_name
                    }
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>
            📋 ข้อมูลพลังงาน
          </h2>

          <div
            style={{
              overflowX: "auto",
              marginTop: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>
                    {viewMode === "daily"
                      ? "วันที่"
                      : viewMode === "monthly"
                      ? "เดือน"
                      : "ปี"}
                  </th>

                  {energyTypes.map((type) => (
                    <th
                      key={type.id}
                      style={thStyle}
                    >
                      {type.energy_name}
                      <br />
                      <span
                        style={{
                          fontWeight: "normal",
                          fontSize: "12px",
                        }}
                      >
                        ({type.unit})
                      </span>
                    </th>
                  ))}

                  <th style={thStyle}>
                    หมายเหตุ
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        energyTypes.length + 2
                      }
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#888",
                      }}
                    >
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, index) => (
                    <tr
                      key={
                        row.record_date +
                        "-" +
                        index
                      }
                    >
                      <td style={tdStyle}>
                        {viewMode === "daily"
                          ? formatDate(
                              row.record_date
                            )
                          : row.record_date}
                      </td>

                      {energyTypes.map((type) => (
                        <td
                          key={type.id}
                          style={tdStyle}
                        >
                          {getEnergyValue(
                            row,
                            type.energy_key
                          ).toLocaleString()}
                        </td>
                      ))}

                      <td style={tdStyle}>
                        {row.note || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

/* =========================
   Styles
========================= */

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "auto",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "16px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const menuButtonStyle = {
  textDecoration: "none",
  color: "white",
  padding: "10px 16px",
  borderRadius: "8px",
  fontWeight: "bold",
  display: "inline-block",
};

const labelStyle = {
  display: "block",
  fontWeight: "bold",
  marginBottom: "8px",
};

const selectStyle = {
  minWidth: "180px",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "white",
  fontSize: "15px",
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  background: "#f8fafc",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "center",
};
