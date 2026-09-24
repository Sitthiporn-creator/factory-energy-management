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

/* =========================================================
   ICON ของพลังงานแต่ละประเภท
========================================================= */

function getEnergyIcon(name = "") {
  const text = name.toLowerCase();

  if (
    text.includes("ไฟฟ้า") ||
    text.includes("electric")
  ) {
    return "⚡";
  }

  if (
    text.includes("solar") ||
    text.includes("แสงอาทิตย์") ||
    text.includes("พลังงานแสงอาทิตย์")
  ) {
    return "☀️";
  }

  if (
    text.includes("gas") ||
    text.includes("ก๊าซ") ||
    text.includes("ก๊าซธรรมชาติ")
  ) {
    return "🔥";
  }

  if (
    text.includes("น้ำมัน") ||
    text.includes("fuel") ||
    text.includes("oil")
  ) {
    return "⛽";
  }

  if (
    text.includes("steam") ||
    text.includes("ไอน้ำ")
  ) {
    return "♨️";
  }

  if (
    text.includes("น้ำ") ||
    text.includes("water")
  ) {
    return "💧";
  }

  if (
    text.includes("ลม") ||
    text.includes("wind")
  ) {
    return "🌬️";
  }

  if (
    text.includes("แบต") ||
    text.includes("battery")
  ) {
    return "🔋";
  }

  if (
    text.includes("ชีวมวล") ||
    text.includes("biomass")
  ) {
    return "🌱";
  }

  if (
    text.includes("ความร้อน") ||
    text.includes("heat")
  ) {
    return "🌡️";
  }

  return "🔋";
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [energyTypes, setEnergyTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [energyValues, setEnergyValues] = useState([]);

  const [selectedEnergy, setSelectedEnergy] = useState("");
  const [viewType, setViewType] = useState("daily");

  const [loading, setLoading] = useState(true);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      { data: types, error: typeError },
      { data: dataRows, error: dataError },
      { data: valueRows, error: valueError },
    ] = await Promise.all([
      supabase
        .from("energy_types")
        .select("*")
        .eq("is_active", true)
        .order("id"),

      supabase
        .from("energy_data")
        .select("*")
        .order("record_date", {
          ascending: true,
        }),

      supabase
        .from("energy_values")
        .select("*"),
    ]);

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
      setSelectedEnergy(
        (current) =>
          current || types[0].energy_key
      );
    }

    setLoading(false);
  }

  /* =======================================================
     GET ENERGY VALUE
  ======================================================= */

  function getEnergyValue(row, energyType) {
    if (!row || !energyType) {
      return 0;
    }

    const dynamicValue = energyValues.find(
      (item) =>
        item.energy_data_id === row.id &&
        item.energy_type_id === energyType.id
    );

    if (dynamicValue) {
      return Number(dynamicValue.value) || 0;
    }

    return Number(
      row[energyType.energy_key]
    ) || 0;
  }

  /* =======================================================
     SELECTED ENERGY
  ======================================================= */

  const selectedType = energyTypes.find(
    (item) =>
      item.energy_key === selectedEnergy
  );

  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData = useMemo(() => {
    if (!selectedType) {
      return [];
    }

    const result = {};

    records.forEach((row) => {
      const rowPeriod =
        row.period_type || "daily";

      if (rowPeriod !== viewType) {
        return;
      }

      const value = getEnergyValue(
        row,
        selectedType
      );

      let label =
        row.period_label ||
        row.record_date;

      if (viewType === "monthly") {
        label =
          row.period_label ||
          row.record_date?.substring(0, 7);
      }

      if (viewType === "yearly") {
        label =
          row.period_label ||
          row.record_date?.substring(0, 4);
      }

      if (!result[label]) {
        result[label] = {
          label,
          value: 0,
        };
      }

      result[label].value += value;
    });

    return Object.values(result);
  }, [
    records,
    energyValues,
    selectedType,
    viewType,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    return energyTypes.map((type) => {
      let total = 0;

      records.forEach((row) => {
        total += getEnergyValue(
          row,
          type
        );
      });

      return {
        ...type,
        total,
      };
    });
  }, [
    records,
    energyTypes,
    energyValues,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loadingIcon">
          ⚡
        </div>

        <h2>
          กำลังโหลดข้อมูลพลังงาน
        </h2>

        <p>
          กรุณารอสักครู่...
        </p>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            "Noto Sans Thai",
            Arial,
            sans-serif;

          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef5ff 100%
            );

          color: #172033;
        }

        button,
        select {
          font-family: inherit;
        }

        /* ============================
           LOADING
        ============================ */

        .loadingScreen {
          min-height: 100vh;

          display: flex;
          flex-direction: column;

          justify-content: center;
          align-items: center;

          background: #f5f7fb;
        }

        .loadingIcon {
          font-size: 50px;
          margin-bottom: 10px;
        }

        .loadingScreen p {
          color: #718096;
        }

        /* ============================
           PAGE
        ============================ */

        .page {
          min-height: 100vh;
          padding: 28px;
        }

        .container {
          max-width: 1450px;
          margin: auto;
        }

        /* ============================
           HEADER
        ============================ */

        .header {
          position: relative;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #0f172a,
              #172554
            );

          color: white;

          border-radius: 24px;

          padding: 30px;

          margin-bottom: 24px;

          box-shadow:
            0 15px 40px
            rgba(15, 23, 42, 0.18);
        }

        .headerGlow {
          position: absolute;

          width: 300px;
          height: 300px;

          border-radius: 50%;

          background:
            rgba(59, 130, 246, 0.15);

          right: -80px;
          top: -120px;
        }

        .headerContent {
          position: relative;
          z-index: 2;
        }

        .headerTitle {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo {
          width: 55px;
          height: 55px;

          border-radius: 16px;

          background:
            rgba(255,255,255,0.12);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 30px;
        }

        .header h1 {
          margin: 0;

          font-size: 29px;

          font-weight: 700;
        }

        .headerSubtitle {
          margin: 8px 0 0;

          color: #cbd5e1;

          font-size: 15px;
        }

        .headerButtons {
          display: flex;
          flex-wrap: wrap;

          gap: 10px;

          margin-top: 25px;
        }

        .headerButton {
          text-decoration: none;

          padding: 11px 17px;

          border-radius: 11px;

          background:
            rgba(255,255,255,0.1);

          color: white;

          border:
            1px solid
            rgba(255,255,255,0.15);

          transition: 0.2s;

          font-size: 14px;
        }

        .headerButton:hover {
          background:
            rgba(255,255,255,0.2);

          transform:
            translateY(-1px);
        }

        .headerButton.primary {
          background: white;
          color: #172033;
          font-weight: 600;
        }

        /* ============================
           SECTION TITLE
        ============================ */

        .sectionTitle {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          margin:
            28px 0 14px;
        }

        .sectionTitle h2 {
          margin: 0;

          font-size: 19px;
        }

        .sectionTitle span {
          font-size: 13px;

          color: #718096;
        }

        /* ============================
           SUMMARY
        ============================ */

        .summaryGrid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(210px, 1fr)
            );

          gap: 16px;
        }

        .summaryCard {
          position: relative;
          overflow: hidden;

          background: white;

          border-radius: 18px;

          padding: 20px;

          border:
            1px solid
            #e8edf5;

          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.05);

          transition: 0.2s;
        }

        .summaryCard:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 10px 28px
            rgba(15, 23, 42, 0.09);
        }

        .summaryTop {
          display: flex;

          justify-content:
            space-between;

          align-items: center;
        }

        .summaryName {
          color: #64748b;

          font-size: 14px;

          font-weight: 600;
        }

        .summaryIcon {
          width: 45px;
          height: 45px;

          border-radius: 13px;

          background: #eff6ff;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 23px;
        }

        .summaryValue {
          font-size: 27px;

          font-weight: 700;

          margin-top: 16px;

          color: #0f172a;
        }

        .summaryUnit {
          margin-top: 4px;

          font-size: 12px;

          color: #94a3b8;
        }

        /* ============================
           FILTER
        ============================ */

        .filterCard {
          background: white;

          border:
            1px solid
            #e8edf5;

          border-radius: 18px;

          padding: 20px;

          display: flex;

          flex-wrap: wrap;

          gap: 18px;

          align-items: end;

          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.04);
        }

        .filterGroup {
          min-width: 210px;
        }

        .filterLabel {
          display: block;

          font-size: 13px;

          color: #64748b;

          margin-bottom: 7px;

          font-weight: 600;
        }

        .select {
          width: 100%;

          padding: 11px 14px;

          border:
            1px solid
            #dbe3ef;

          border-radius: 10px;

          background: white;

          color: #172033;

          outline: none;
        }

        .select:focus {
          border-color: #3b82f6;

          box-shadow:
            0 0 0 3px
            rgba(59,130,246,0.1);
        }

        /* ============================
           CHART
        ============================ */

        .chartCard {
          background: white;

          border:
            1px solid
            #e8edf5;

          border-radius: 18px;

          padding: 24px;

          margin-top: 16px;

          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.04);
        }

        .chartHeader {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          margin-bottom: 15px;
        }

        .chartHeader h2 {
          margin: 0;

          font-size: 18px;
        }

        .chartBadge {
          background: #eff6ff;

          color: #2563eb;

          padding: 6px 10px;

          border-radius: 8px;

          font-size: 12px;

          font-weight: 600;
        }

        .chart {
          width: 100%;
          height: 330px;
        }

        /* ============================
           TABLE
        ============================ */

        .tableCard {
          background: white;

          border:
            1px solid
            #e8edf5;

          border-radius: 18px;

          padding: 24px;

          margin-top: 16px;

          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.04);
        }

        .tableWrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;

          border-collapse:
            collapse;

          min-width: 800px;
        }

        th {
          background: #f8fafc;

          color: #475569;

          font-size: 13px;

          font-weight: 600;

          text-align: left;

          padding: 13px;

          border-bottom:
            1px solid
            #e2e8f0;
        }

        td {
          padding: 13px;

          border-bottom:
            1px solid
            #eef2f7;

          font-size: 14px;

          color: #334155;
        }

        tr:hover td {
          background: #f8fbff;
        }

        .empty {
          text-align: center;

          padding: 45px;

          color: #94a3b8;
        }

        .footer {
          text-align: center;

          color: #94a3b8;

          font-size: 12px;

          padding: 30px 0 10px;
        }

        /* ============================
           MOBILE
        ============================ */

        @media (max-width: 700px) {

          .page {
            padding: 14px;
          }

          .header {
            padding: 22px;

            border-radius: 18px;
          }

          .header h1 {
            font-size: 22px;
          }

          .summaryGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .summaryCard {
            padding: 15px;
          }

          .summaryValue {
            font-size: 21px;
          }

          .filterGroup {
            width: 100%;
          }

          .chartCard,
          .tableCard {
            padding: 16px;
          }

        }

      `}</style>

      <main className="page">

        <div className="container">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="header">

            <div className="headerGlow" />

            <div className="headerContent">

              <div className="headerTitle">

                <div className="logo">
                  ⚡
                </div>

                <div>

                  <h1>
                    Factory Energy Management
                  </h1>

                  <p className="headerSubtitle">
                    ระบบจัดการและติดตามการใช้พลังงานในโรงงาน
                  </p>

                </div>

              </div>

              <div className="headerButtons">

                <a
                  href="/input"
                  className="headerButton primary"
                >
                  ＋ เพิ่มข้อมูล
                </a>

                <a
                  href="/edit"
                  className="headerButton"
                >
                  ✏️ แก้ไขข้อมูล
                </a>

                <a
                  href="/settings"
                  className="headerButton"
                >
                  ⚙️ ตั้งค่าพลังงาน
                </a>

              </div>

            </div>

          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="sectionTitle">

            <h2>
              ภาพรวมการใช้พลังงาน
            </h2>

            <span>
              ข้อมูลทั้งหมด
            </span>

          </div>

          <section className="summaryGrid">

            {summary.map((item) => (

              <div
                className="summaryCard"
                key={item.id}
              >

                <div className="summaryTop">

                  <div className="summaryName">
                    {item.energy_name}
                  </div>

                  <div className="summaryIcon">
                    {getEnergyIcon(
                      item.energy_name
                    )}
                  </div>

                </div>

                <div className="summaryValue">

                  {item.total.toLocaleString()}

                </div>

                <div className="summaryUnit">

                  {item.unit}

                </div>

              </div>

            ))}

          </section>

          {/* =================================================
              ANALYSIS
          ================================================= */}

          <div className="sectionTitle">

            <h2>
              วิเคราะห์ข้อมูล
            </h2>

          </div>

          <section className="filterCard">

            <div className="filterGroup">

              <label className="filterLabel">
                พลังงาน
              </label>

              <select
                className="select"

                value={selectedEnergy}

                onChange={(e) =>
                  setSelectedEnergy(
                    e.target.value
                  )
                }
              >

                {energyTypes.map(
                  (item) => (

                    <option
                      key={item.id}
                      value={
                        item.energy_key
                      }
                    >

                      {getEnergyIcon(
                        item.energy_name
                      )}{" "}
                      {item.energy_name}

                    </option>

                  )
                )}

              </select>

            </div>

            <div className="filterGroup">

              <label className="filterLabel">
                รูปแบบข้อมูล
              </label>

              <select
                className="select"

                value={viewType}

                onChange={(e) =>
                  setViewType(
                    e.target.value
                  )
                }
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

          </section>

          {/* =================================================
              LINE CHART
          ================================================= */}

          <section className="chartCard">

            <div className="chartHeader">

              <h2>

                {getEnergyIcon(
                  selectedType?.energy_name
                )}{" "}

                แนวโน้มการใช้{" "}
                {selectedType?.energy_name}

              </h2>

              <div className="chartBadge">

                {selectedType?.unit}

              </div>

            </div>

            <div className="chart">

              <ResponsiveContainer>

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"

                    dataKey="value"

                    name={
                      selectedType?.energy_name
                    }

                    strokeWidth={3}

                    dot={{
                      r: 4,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </section>

          {/* =================================================
              BAR CHART
          ================================================= */}

          <section className="chartCard">

            <div className="chartHeader">

              <h2>

                {getEnergyIcon(
                  selectedType?.energy_name
                )}{" "}

                เปรียบเทียบการใช้พลังงาน

              </h2>

              <div className="chartBadge">

                {selectedType?.unit}

              </div>

            </div>

            <div className="chart">

              <ResponsiveContainer>

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"

                    name={
                      selectedType?.energy_name
                    }
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </section>

          {/* =================================================
              TABLE
          ================================================= */}

          <section className="tableCard">

            <div className="chartHeader">

              <h2>
                ตารางข้อมูลพลังงาน
              </h2>

              <div className="chartBadge">

                {records.length} รายการ

              </div>

            </div>

            <div className="tableWrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      วันที่
                    </th>

                    <th>
                      รูปแบบ
                    </th>

                    {energyTypes.map(
                      (type) => (

                        <th
                          key={type.id}
                        >

                          {getEnergyIcon(
                            type.energy_name
                          )}{" "}

                          {type.energy_name}

                          <br />

                          <small>
                            {type.unit}
                          </small>

                        </th>

                      )
                    )}

                    <th>
                      หมายเหตุ
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {records
                    .slice()
                    .reverse()
                    .map((row) => (

                      <tr key={row.id}>

                        <td>
                          {row.record_date}
                        </td>

                        <td>

                          {row.period_type ===
                          "monthly"
                            ? "รายเดือน"
                            : row.period_type ===
                              "yearly"
                            ? "รายปี"
                            : "รายวัน"}

                        </td>

                        {energyTypes.map(
                          (type) => (

                            <td
                              key={type.id}
                            >

                              {getEnergyValue(
                                row,
                                type
                              ).toLocaleString()}

                            </td>

                          )
                        )}

                        <td>

                          {row.note || "-"}

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

              {records.length === 0 && (

                <div className="empty">

                  <div
                    style={{
                      fontSize: 35,
                    }}
                  >
                    📊
                  </div>

                  <p>
                    ยังไม่มีข้อมูลพลังงาน
                  </p>

                  <a href="/input">
                    เพิ่มข้อมูลรายการแรก
                  </a>

                </div>

              )}

            </div>

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="footer">

            Factory Energy Management System

          </div>

        </div>

      </main>
    </>
  );
}
