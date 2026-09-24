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
   ENERGY ICON
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
    text === "น้ำ" ||
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
   NUMBER FORMAT
========================================================= */

function formatNumber(value) {
  return Number(value || 0).toLocaleString(
    "th-TH",
    {
      maximumFractionDigits: 2,
    }
  );
}

/* =========================================================
   PERIOD NAME
========================================================= */

function getPeriodName(type) {
  if (type === "monthly") {
    return "รายเดือน";
  }

  if (type === "yearly") {
    return "รายปี";
  }

  return "รายวัน";
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [energyTypes, setEnergyTypes] =
    useState([]);

  const [records, setRecords] =
    useState([]);

  const [energyValues, setEnergyValues] =
    useState([]);

  const [selectedEnergy, setSelectedEnergy] =
    useState("");

  const [viewType, setViewType] =
    useState("daily");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        typeResult,
        dataResult,
        valueResult,
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

      if (typeResult.error) {
        throw typeResult.error;
      }

      if (dataResult.error) {
        throw dataResult.error;
      }

      if (valueResult.error) {
        throw valueResult.error;
      }

      const types =
        typeResult.data || [];

      const dataRows =
        dataResult.data || [];

      const valueRows =
        valueResult.data || [];

      setEnergyTypes(types);
      setRecords(dataRows);
      setEnergyValues(valueRows);

      if (types.length > 0) {
        setSelectedEnergy((current) => {
          const stillExists = types.some(
            (item) =>
              item.energy_key === current
          );

          return stillExists
            ? current
            : types[0].energy_key;
        });
      } else {
        setSelectedEnergy("");
      }
    } catch (err) {
      console.error(err);

      setError(
        "ไม่สามารถโหลดข้อมูลจากฐานข้อมูลได้"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     GET ENERGY VALUE
  ======================================================= */

  function getEnergyValue(
    row,
    energyType
  ) {
    if (!row || !energyType) {
      return 0;
    }

    const dynamicValue =
      energyValues.find(
        (item) =>
          item.energy_data_id === row.id &&
          item.energy_type_id ===
            energyType.id
      );

    if (dynamicValue) {
      return (
        Number(dynamicValue.value) || 0
      );
    }

    return (
      Number(
        row[energyType.energy_key]
      ) || 0
    );
  }

  /* =======================================================
     SELECTED ENERGY
  ======================================================= */

  const selectedType =
    energyTypes.find(
      (item) =>
        item.energy_key ===
        selectedEnergy
    );

  /* =======================================================
     FILTER RECORDS
  ======================================================= */

  const filteredRecords = useMemo(() => {
    return records
      .filter((row) => {
        const rowPeriod =
          row.period_type || "daily";

        return rowPeriod === viewType;
      })
      .sort(
        (a, b) =>
          new Date(b.record_date) -
          new Date(a.record_date)
      );
  }, [records, viewType]);

  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData = useMemo(() => {
    if (!selectedType) {
      return [];
    }

    const result = {};

    filteredRecords.forEach((row) => {
      const value = getEnergyValue(
        row,
        selectedType
      );

      let label =
        row.period_label ||
        row.record_date ||
        "";

      if (viewType === "monthly") {
        label =
          row.period_label ||
          row.record_date?.substring(
            0,
            7
          ) ||
          "";
      }

      if (viewType === "yearly") {
        label =
          row.period_label ||
          row.record_date?.substring(
            0,
            4
          ) ||
          "";
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
    filteredRecords,
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
      <>
        <style jsx global>{`
          .loadingScreen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #f8fafc;
            color: #0f172a;
            font-family:
              Arial,
              "Noto Sans Thai",
              sans-serif;
          }

          .loadingIcon {
            font-size: 52px;
            margin-bottom: 10px;
          }

          .loadingScreen h2 {
            margin: 0;
          }

          .loadingScreen p {
            color: #64748b;
          }
        `}</style>

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
      </>
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
          padding: 0;
          font-family:
            Arial,
            "Noto Sans Thai",
            sans-serif;
          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef5ff 100%
            );
          color: #172033;
        }

        a {
          color: inherit;
        }

        button,
        select {
          font-family: inherit;
        }

        /* ==============================
           PAGE
        ============================== */

        .page {
          min-height: 100vh;
          padding: 28px;
        }

        .container {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
        }

        /* ==============================
           HEADER
        ============================== */

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
          width: 58px;
          height: 58px;
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

        /* ==============================
           SECTION
        ============================== */

        .sectionTitle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 28px 0 14px;
        }

        .sectionTitle h2 {
          margin: 0;
          font-size: 19px;
        }

        .sectionTitle span {
          font-size: 13px;
          color: #718096;
        }

        /* ==============================
           SUMMARY
        ============================== */

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
            1px solid #e8edf5;
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
          justify-content: space-between;
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

        /* ==============================
           CHART CARD
        ============================== */

        .chartCard {
          background: white;
          border-radius: 18px;
          padding: 22px;
          margin-top: 20px;
          border:
            1px solid #e8edf5;
          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.05);
        }

        .chartHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .chartHeader h2 {
          margin: 0;
          font-size: 18px;
        }

        .chartHeader p {
          margin: 5px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .chartBadge {
          white-space: nowrap;
          background: #eff6ff;
          color: #2563eb;
          padding: 7px 12px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
        }

        .chart {
          width: 100%;
          height: 360px;
          min-height: 360px;
        }

        .emptyChart {
          width: 100%;
          height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #94a3b8;
          background: #f8fafc;
          border-radius: 12px;
        }

        .emptyChartIcon {
          font-size: 38px;
          margin-bottom: 8px;
        }

        /* ==============================
           TABLE
        ============================== */

        .tableCard {
          background: white;
          border-radius: 18px;
          padding: 22px;
          margin-top: 20px;
          border:
            1px solid #e8edf5;
          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.05);
        }

        .tableControls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .tableTabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tableTab {
          border:
            1px solid #dbe3ef;
          background: #f8fafc;
          color: #64748b;
          padding: 9px 16px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: 0.2s;
        }

        .tableTab:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .tableTab.active {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }

        .tableEnergySelect {
          min-width: 210px;
        }

        .select {
          width: 100%;
          min-width: 210px;
          padding: 10px 13px;
          border:
            1px solid #dbe3ef;
          border-radius: 10px;
          background: white;
          color: #172033;
          outline: none;
          cursor: pointer;
          font-size: 14px;
        }

        .select:focus {
          border-color: #3b82f6;
          box-shadow:
            0 0 0 3px
            rgba(59,130,246,0.12);
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        thead {
          background: #f8fafc;
        }

        th {
          text-align: left;
          padding: 13px 15px;
          font-size: 13px;
          color: #475569;
          border-bottom:
            1px solid #e2e8f0;
          white-space: nowrap;
        }

        th small {
          color: #94a3b8;
          font-weight: 400;
        }

        td {
          padding: 14px 15px;
          font-size: 13px;
          color: #334155;
          border-bottom:
            1px solid #edf2f7;
        }

        tbody tr:hover {
          background: #f8fbff;
        }

        .empty {
          padding: 50px 20px;
          text-align: center;
          color: #94a3b8;
        }

        .empty p {
          margin: 10px 0 15px;
        }

        .empty a {
          display: inline-block;
          text-decoration: none;
          background: #2563eb;
          color: white;
          padding: 10px 16px;
          border-radius: 9px;
          font-size: 13px;
        }

        /* ==============================
           ERROR
        ============================== */

        .errorBox {
          background: #fff1f2;
          color: #be123c;
          border:
            1px solid #fecdd3;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 20px;
        }

        /* ==============================
           FOOTER
        ============================== */

        .footer {
          text-align: center;
          padding: 30px 10px;
          color: #94a3b8;
          font-size: 12px;
        }

        /* ==============================
           MOBILE
        ============================== */

        @media (max-width: 900px) {
          .page {
            padding: 18px;
          }

          .header {
            padding: 24px;
          }

          .header h1 {
            font-size: 24px;
          }

          .chart {
            height: 300px;
            min-height: 300px;
          }

          .emptyChart {
            height: 300px;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .header {
            border-radius: 16px;
            padding: 20px;
          }

          .headerTitle {
            align-items: flex-start;
          }

          .logo {
            width: 48px;
            height: 48px;
            font-size: 25px;
          }

          .header h1 {
            font-size: 20px;
          }

          .headerSubtitle {
            font-size: 13px;
          }

          .headerButtons {
            flex-direction: column;
          }

          .headerButton {
            text-align: center;
          }

          .summaryGrid {
            grid-template-columns:
              repeat(2, 1fr);
            gap: 10px;
          }

          .summaryCard {
            padding: 15px;
          }

          .summaryValue {
            font-size: 21px;
          }

          .summaryIcon {
            width: 38px;
            height: 38px;
            font-size: 19px;
          }

          .chartCard,
          .tableCard {
            padding: 15px;
            border-radius: 15px;
          }

          .chartHeader {
            align-items: flex-start;
          }

          .tableControls {
            flex-direction: column;
            align-items: stretch;
          }

          .tableTabs {
            width: 100%;
          }

          .tableTab {
            flex: 1;
          }

          .tableEnergySelect {
            width: 100%;
            min-width: 0;
          }

          .select {
            min-width: 0;
          }
        }
      `}</style>

      <main className="page">

        <div className="container">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="header">

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
                  ＋ เพิ่มข้อมูลพลังงาน
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
                  ⚙️ ตั้งค่า
                </a>

              </div>

            </div>

          </header>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="errorBox">
              ⚠️ {error}
            </div>
          )}


          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="sectionTitle">

            <h2>
              ภาพรวมการใช้พลังงาน
            </h2>

            <span>
              ข้อมูลสะสมทั้งหมด
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
                  {formatNumber(item.total)}
                </div>

                <div className="summaryUnit">
                  หน่วย {item.unit}
                </div>

              </div>

            ))}

            {summary.length === 0 && (

              <div className="summaryCard">

                <div className="summaryName">
                  ยังไม่มีประเภทพลังงาน
                </div>

                <div className="summaryUnit">
                  กรุณาเพิ่มหัวข้อที่หน้า ตั้งค่า
                </div>

              </div>

            )}

          </section>


          {/* =================================================
              LINE CHART
          ================================================= */}

          <section className="chartCard">

            <div className="chartHeader">

              <div>

                <h2>
                  📈 แนวโน้มการใช้{" "}
                  {getEnergyIcon(
                    selectedType?.energy_name
                  )}{" "}
                  {selectedType?.energy_name ||
                    "พลังงาน"}
                </h2>

                <p>
                  {getPeriodName(viewType)}
                </p>

              </div>

              <div className="chartBadge">
                {selectedType?.unit || "-"}
              </div>

            </div>


            <div className="chart">

              {chartData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 5,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${formatNumber(value)} ${
                          selectedType?.unit || ""
                        }`,
                        selectedType?.energy_name ||
                          "พลังงาน",
                      ]}
                    />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="value"
                      name={
                        selectedType?.energy_name ||
                        "พลังงาน"
                      }
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="emptyChart">

                  <div className="emptyChartIcon">
                    📈
                  </div>

                  <div>
                    ยังไม่มีข้อมูลสำหรับกราฟ
                  </div>

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              BAR CHART
          ================================================= */}

          <section className="chartCard">

            <div className="chartHeader">

              <div>

                <h2>
                  📊 ปริมาณการใช้{" "}
                  {getEnergyIcon(
                    selectedType?.energy_name
                  )}{" "}
                  {selectedType?.energy_name ||
                    "พลังงาน"}
                </h2>

                <p>
                  {getPeriodName(viewType)}
                </p>

              </div>

              <div className="chartBadge">
                {chartData.length} รายการ
              </div>

            </div>


            <div className="chart">

              {chartData.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 5,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${formatNumber(value)} ${
                          selectedType?.unit || ""
                        }`,
                        selectedType?.energy_name ||
                          "พลังงาน",
                      ]}
                    />

                    <Legend />

                    <Bar
                      dataKey="value"
                      name={
                        selectedType?.energy_name ||
                        "พลังงาน"
                      }
                      fill="#3b82f6"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div className="emptyChart">

                  <div className="emptyChartIcon">
                    📊
                  </div>

                  <div>
                    ยังไม่มีข้อมูลสำหรับกราฟ
                  </div>

                </div>

              )}

            </div>

          </section>


          {/* =================================================
              ENERGY DATA TABLE
          ================================================= */}

          <section className="tableCard">

            <div className="chartHeader">

              <div>

                <h2>
                  📋 ข้อมูลพลังงาน
                </h2>

                <p>
                  ตารางจะเปลี่ยนตามพลังงานและช่วงเวลาที่เลือก
                </p>

              </div>

              <div className="chartBadge">
                {filteredRecords.length} รายการ
              </div>

            </div>


            {/* =============================================
                PERIOD BUTTONS + ENERGY SELECT
            ============================================= */}

            <div className="tableControls">

              <div className="tableTabs">

                <button
                  type="button"
                  className={`tableTab ${
                    viewType === "daily"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setViewType("daily")
                  }
                >
                  📅 รายวัน
                </button>


                <button
                  type="button"
                  className={`tableTab ${
                    viewType === "monthly"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setViewType("monthly")
                  }
                >
                  📆 รายเดือน
                </button>


                <button
                  type="button"
                  className={`tableTab ${
                    viewType === "yearly"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setViewType("yearly")
                  }
                >
                  📊 รายปี
                </button>

              </div>


              {/* ตัวเลือกพลังงาน
                  อยู่มุมขวาบนของตาราง */}

              <div className="tableEnergySelect">

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

            </div>


            {/* =============================================
                TABLE
            ============================================= */}

            <div className="tableWrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      {viewType === "daily"
                        ? "วันที่"
                        : viewType === "monthly"
                        ? "เดือน"
                        : "ปี"}
                    </th>

                    <th>
                      รูปแบบ
                    </th>

                    <th>
                      {getEnergyIcon(
                        selectedType?.energy_name
                      )}{" "}
                      {selectedType?.energy_name ||
                        "พลังงาน"}

                      <br />

                      <small>
                        {selectedType?.unit ||
                          ""}
                      </small>
                    </th>

                    <th>
                      หมายเหตุ
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredRecords.map(
                    (row) => (

                      <tr key={row.id}>

                        <td>

                          {viewType === "daily"
                            ? row.record_date
                            : viewType ===
                              "monthly"
                            ? (
                                row.period_label ||
                                row.record_date?.substring(
                                  0,
                                  7
                                )
                              )
                            : (
                                row.period_label ||
                                row.record_date?.substring(
                                  0,
                                  4
                                )
                              )}

                        </td>


                        <td>
                          {getPeriodName(
                            viewType
                          )}
                        </td>


                        <td>

                          {formatNumber(
                            getEnergyValue(
                              row,
                              selectedType
                            )
                          )}

                          {" "}

                          {selectedType?.unit ||
                            ""}

                        </td>


                        <td>
                          {row.note || "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>


              {/* =========================================
                  NO DATA
              ========================================= */}

              {filteredRecords.length ===
                0 && (

                <div className="empty">

                  <div
                    style={{
                      fontSize: 40,
                    }}
                  >
                    📊
                  </div>

                  <p>
                    ยังไม่มีข้อมูล{" "}
                    {selectedType?.energy_name ||
                      "พลังงาน"}{" "}
                    {getPeriodName(
                      viewType
                    )}
                  </p>

                  <a href="/input">
                    ＋ เพิ่มข้อมูล
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
