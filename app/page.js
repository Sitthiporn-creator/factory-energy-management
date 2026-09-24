"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function Dashboard() {
  const [energyTypes, setEnergyTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [energyValues, setEnergyValues] = useState([]);
  const [selectedEnergy, setSelectedEnergy] = useState("");
  const [viewType, setViewType] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: types, error: typeError } = await supabase
      .from("energy_types")
      .select("*")
      .eq("is_active", true)
      .order("id");

    const { data: dataRows, error: dataError } = await supabase
      .from("energy_data")
      .select("*")
      .order("record_date", { ascending: true });

    const { data: valueRows, error: valueError } = await supabase
      .from("energy_values")
      .select("*");

    if (typeError) {
      console.error(typeError);
    }

    if (dataError) {
      console.error(dataError);
    }

    if (valueError) {
      console.error(valueError);
    }

    setEnergyTypes(types || []);
    setRecords(dataRows || []);
    setEnergyValues(valueRows || []);

    if (types?.length > 0) {
      setSelectedEnergy((current) => current || types[0].energy_key);
    }

    setLoading(false);
  }

  /*
    หาค่าพลังงานของแต่ละรายการ

    ลำดับการอ่าน:
    1. อ่านจาก energy_values ก่อน
    2. ถ้าไม่มีข้อมูล ให้ fallback ไปอ่านจาก energy_data
  */
  function getEnergyValue(row, energyType) {
    if (!row || !energyType) return 0;

    const dynamicValue = energyValues.find(
      (item) =>
        item.energy_data_id === row.id &&
        item.energy_type_id === energyType.id
    );

    if (dynamicValue) {
      return Number(dynamicValue.value) || 0;
    }

    const oldValue = row[energyType.energy_key];

    return Number(oldValue) || 0;
  }

  /*
    เตรียมข้อมูลตามรูปแบบที่เลือก
  */
  const chartData = useMemo(() => {
    if (!selectedEnergy) return [];

    const selectedType = energyTypes.find(
      (item) => item.energy_key === selectedEnergy
    );

    if (!selectedType) return [];

    const result = {};

    records.forEach((row) => {
      const value = getEnergyValue(row, selectedType);

      let label = row.period_label;

      if (!label) {
        if (viewType === "monthly") {
          label = row.record_date?.substring(0, 7);
        } else if (viewType === "yearly") {
          label = row.record_date?.substring(0, 4);
        } else {
          label = row.record_date;
        }
      }

      if (viewType === "daily") {
        if (row.period_type !== "daily") return;
      }

      if (viewType === "monthly") {
        if (row.period_type !== "monthly") return;
      }

      if (viewType === "yearly") {
        if (row.period_type !== "yearly") return;
      }

      if (!result[label]) {
        result[label] = {
          label,
          value: 0,
        };
      }

      result[label].value += value;
    });

    return Object.values(result).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [
    records,
    energyValues,
    energyTypes,
    selectedEnergy,
    viewType,
  ]);

  /*
    ค่ารวมของพลังงานแต่ละชนิด
  */
  const summary = useMemo(() => {
    return energyTypes.map((type) => {
      let total = 0;

      records.forEach((row) => {
        total += getEnergyValue(row, type);
      });

      return {
        ...type,
        total,
      };
    });
  }, [records, energyTypes, energyValues]);

  const selectedType = energyTypes.find(
    (item) => item.energy_key === selectedEnergy
  );

  /*
    ตารางข้อมูล
  */
  const tableData = useMemo(() => {
    return [...records].reverse();
  }, [records]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>กำลังโหลดข้อมูล...</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            ⚡ Factory Energy Management
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#666",
            }}
          >
            ระบบจัดการและติดตามการใช้พลังงานในโรงงาน
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <a href="/input">
              <button style={buttonStyle}>➕ เพิ่มข้อมูล</button>
            </a>

            <a href="/edit">
              <button style={buttonStyle}>✏️ แก้ไขข้อมูล</button>
            </a>

            <a href="/settings">
              <button style={buttonStyle}>⚙️ ตั้งค่าพลังงาน</button>
            </a>
          </div>
        </div>

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          {summary.map((item) => (
            <div
              key={item.id}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                {item.energy_name}
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              >
                {item.total.toLocaleString()}
              </div>

              <div
                style={{
                  color: "#888",
                  marginTop: "5px",
                }}
              >
                {item.unit}
              </div>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div>
              <label>พลังงาน</label>

              <br />

              <select
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(e.target.value)}
                style={selectStyle}
              >
                {energyTypes.map((item) => (
                  <option key={item.id} value={item.energy_key}>
                    {item.energy_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>รูปแบบ</label>

              <br />

              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                style={selectStyle}
              >
                <option value="daily">รายวัน</option>
                <option value="monthly">รายเดือน</option>
                <option value="yearly">รายปี</option>
              </select>
            </div>
          </div>
        </div>

        {/* CHART */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {selectedType?.energy_name || "พลังงาน"}{" "}
            {selectedType?.unit
              ? `(${selectedType.unit})`
              : ""}
          </h2>

          <div style={{ width: "100%", height: "350px" }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="label" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="value"
                  name={selectedType?.energy_name}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            เปรียบเทียบการใช้พลังงาน
          </h2>

          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="label" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="value"
                  name={selectedType?.energy_name}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABLE */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            overflowX: "auto",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            ข้อมูลพลังงาน
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>วันที่</th>
                <th style={thStyle}>รูปแบบ</th>

                {energyTypes.map((type) => (
                  <th key={type.id} style={thStyle}>
                    {type.energy_name}
                    <br />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "normal",
                        color: "#777",
                      }}
                    >
                      {type.unit}
                    </span>
                  </th>
                ))}

                <th style={thStyle}>หมายเหตุ</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td style={tdStyle}>
                    {row.record_date}
                  </td>

                  <td style={tdStyle}>
                    {row.period_type === "daily"
                      ? "รายวัน"
                      : row.period_type === "monthly"
                      ? "รายเดือน"
                      : "รายปี"}
                  </td>

                  {energyTypes.map((type) => (
                    <td key={type.id} style={tdStyle}>
                      {getEnergyValue(row, type).toLocaleString()}
                    </td>
                  ))}

                  <td style={tdStyle}>
                    {row.note || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tableData.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "#777",
                padding: "30px",
              }}
            >
              ยังไม่มีข้อมูลพลังงาน
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: "11px 18px",
  border: "none",
  borderRadius: "10px",
  background: "#111827",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
};

const selectStyle = {
  marginTop: "6px",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  minWidth: "180px",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  background: "#f8fafc",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};
