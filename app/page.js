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

const DEFAULT_ENERGY_TYPES = [
  {
    id: "electricity",
    energy_key: "electricity",
    energy_name: "ไฟฟ้า",
    unit: "kWh",
  },
  {
    id: "solar",
    energy_key: "solar",
    energy_name: "Solar",
    unit: "kWh",
  },
  {
    id: "gas",
    energy_key: "gas",
    energy_name: "Gas",
    unit: "Nm³",
  },
  {
    id: "fuel",
    energy_key: "fuel",
    energy_name: "น้ำมัน",
    unit: "ลิตร",
  },
  {
    id: "steam",
    energy_key: "steam",
    energy_name: "Steam",
    unit: "ตัน",
  },
  {
    id: "water",
    energy_key: "water",
    energy_name: "น้ำ",
    unit: "m³",
  },
];

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

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [energyTypes, setEnergyTypes] = useState(
    DEFAULT_ENERGY_TYPES
  );

  const [energyType, setEnergyType] =
    useState("electricity");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [chartMode, setChartMode] =
    useState("monthly");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
    loadEnergyTypes();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("energy_data")
      .select("*")
      .order("record_date", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setData(data || []);

    if (data && data.length > 0) {
      const years = data.map((item) =>
        new Date(
          item.record_date
        ).getFullYear()
      );

      setSelectedYear(
        String(Math.max(...years))
      );
    }

    setLoading(false);
  }

  async function loadEnergyTypes() {
    const { data, error } = await supabase
      .from("energy_types")
      .select("*")
      .eq("is_active", true)
      .order("id");

    if (error) {
      console.error(error);
      return;
    }

    if (data && data.length > 0) {
      setEnergyTypes(data);

      setEnergyType(
        data[0].energy_key
      );
    }
  }

  const years = useMemo(() => {
    const yearSet = new Set(
      data.map((item) =>
        new Date(
          item.record_date
        ).getFullYear()
      )
    );

    return Array.from(yearSet).sort(
      (a, b) => b - a
    );
  }, [data]);

  const selectedEnergy =
    energyTypes.find(
      (item) =>
        item.energy_key === energyType
    );

  const monthlyData = useMemo(() => {
    const result = MONTHS.map(
      (month) => ({
        month,
        value: 0,
      })
    );

    data.forEach((item) => {
      const date = new Date(
        item.record_date
      );

      const year =
        date.getFullYear();

      const month =
        date.getMonth();

      if (
        String(year) ===
        String(selectedYear)
      ) {
        result[month].value +=
          Number(
            item[energyType]
          ) || 0;
      }
    });

    return result;
  }, [
    data,
    energyType,
    selectedYear,
  ]);

  const yearlyData = useMemo(() => {
    const grouped = {};

    data.forEach((item) => {
      const year =
        new Date(
          item.record_date
        ).getFullYear();

      if (!grouped[year]) {
        grouped[year] = 0;
      }

      grouped[year] +=
        Number(
          item[energyType]
        ) || 0;
    });

    return Object.keys(grouped)
      .sort()
      .map((year) => ({
        year,
        value: grouped[year],
      }));
  }, [data, energyType]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "25px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "16px",
            marginBottom: "20px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                }}
              >
                ⚡ Factory Energy
                Management
              </h1>

              <p
                style={{
                  color: "#666",
                  marginBottom: 0,
                }}
              >
                ระบบจัดการและติดตาม
                การใช้พลังงาน
              </p>
            </div>

            {/* BUTTONS */}
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
                  textDecoration:
                    "none",
                  background:
                    "#2563eb",
                  color: "white",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "8px",
                  fontWeight:
                    "bold",
                }}
              >
                ➕ เพิ่มข้อมูล
              </a>

              <a
                href="/edit"
                style={{
                  textDecoration:
                    "none",
                  background:
                    "#f59e0b",
                  color: "white",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "8px",
                  fontWeight:
                    "bold",
                }}
              >
                ✏️ แก้ไขข้อมูล
              </a>

              <a
                href="/settings"
                style={{
                  textDecoration:
                    "none",
                  background:
                    "#64748b",
                  color: "white",
                  padding:
                    "12px 20px",
                  borderRadius:
                    "8px",
                  fontWeight:
                    "bold",
                }}
              >
                ⚙️ ตั้งค่าพลังงาน
              </a>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {energyTypes.map(
            (item) => {
              const total =
                data.reduce(
                  (
                    sum,
                    row
                  ) =>
                    sum +
                    (Number(
                      row[
                        item.energy_key
                      ]
                    ) || 0),
                  0
                );

              return (
                <div
                  key={
                    item.energy_key
                  }
                  style={{
                    background:
                      "white",
                    padding:
                      "20px",
                    borderRadius:
                      "14px",
                    boxShadow:
                      "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#666",
                      marginBottom:
                        "8px",
                    }}
                  >
                    {
                      item.energy_name
                    }
                  </div>

                  <div
                    style={{
                      fontSize:
                        "25px",
                      fontWeight:
                        "bold",
                    }}
                  >
                    {total.toLocaleString()}
                  </div>

                  <div
                    style={{
                      color:
                        "#888",
                      marginTop:
                        "5px",
                    }}
                  >
                    {item.unit}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* CONTROLS */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              alignItems:
                "center",
            }}
          >
            <div>
              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "bold",
                  marginBottom:
                    "6px",
                }}
              >
                ประเภทพลังงาน
              </label>

              <select
                value={energyType}
                onChange={(e) =>
                  setEnergyType(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #ccc",
                }}
              >
                {energyTypes.map(
                  (item) => (
                    <option
                      key={
                        item.energy_key
                      }
                      value={
                        item.energy_key
                      }
                    >
                      {
                        item.energy_name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "bold",
                  marginBottom:
                    "6px",
                }}
              >
                ปี
              </label>

              <select
                value={
                  selectedYear
                }
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #ccc",
                }}
              >
                {years.map(
                  (year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "bold",
                  marginBottom:
                    "6px",
                }}
              >
                รูปแบบ
              </label>

              <select
                value={
                  chartMode
                }
                onChange={(e) =>
                  setChartMode(
                    e.target.value
                  )
                }
                style={{
                  padding:
                    "10px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #ccc",
                }}
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

        {/* CHART */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        >
          <h2>
            {
              selectedEnergy?.energy_name
            }{" "}
            {chartMode ===
            "monthly"
              ? "รายเดือน"
              : "รายปี"}
          </h2>

          <p
            style={{
              color: "#666",
            }}
          >
            หน่วย:{" "}
            {
              selectedEnergy?.unit
            }
          </p>

          <div
            style={{
              width: "100%",
              height: "400px",
            }}
          >
            <ResponsiveContainer>
              {chartMode ===
              "monthly" ? (
                <LineChart
                  data={
                    monthlyData
                  }
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
                      selectedEnergy?.energy_name
                    }
                    stroke="#2563eb"
                    strokeWidth={
                      3
                    }
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={
                    yearlyData
                  }
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
                      selectedEnergy?.energy_name
                    }
                    fill="#2563eb"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* DATA TABLE */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "14px",
          }}
        >
          <h2>
            📋 ข้อมูลพลังงาน
          </h2>

          {loading ? (
            <p>
              กำลังโหลดข้อมูล...
            </p>
          ) : data.length ===
            0 ? (
            <p>
              ยังไม่มีข้อมูล
            </p>
          ) : (
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f1f5f9",
                    }}
                  >
                    <th
                      style={
                        thStyle
                      }
                    >
                      วันที่
                    </th>

                    {energyTypes.map(
                      (item) => (
                        <th
                          key={
                            item.energy_key
                          }
                          style={
                            thStyle
                          }
                        >
                          {
                            item.energy_name
                          }
                          <br />
                          <small>
                            (
                            {
                              item.unit
                            }
                            )
                          </small>
                        </th>
                      )
                    )}

                    <th
                      style={
                        thStyle
                      }
                    >
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.map(
                    (item) => (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          {
                            item.record_date
                          }
                        </td>

                        {energyTypes.map(
                          (
                            energy
                          ) => (
                            <td
                              key={
                                energy.energy_key
                              }
                              style={
                                tdStyle
                              }
                            >
                              {Number(
                                item[
                                  energy.energy_key
                                ] ||
                                  0
                              ).toLocaleString()}
                            </td>
                          )
                        )}

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {item.note ||
                            "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const thStyle = {
  padding: "12px",
  borderBottom:
    "1px solid #ddd",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom:
    "1px solid #eee",
};
