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
    text.includes("electric") ||
    text.includes("ไฟฟ้า")
  ) {
    return "⚡";
  }

  if (
    text.includes("solar") ||
    text.includes("แสงอาทิตย์")
  ) {
    return "☀️";
  }

  if (
    text.includes("gas") ||
    text.includes("ก๊าซ") ||
    text.includes("แก๊ส")
  ) {
    return "🔥";
  }

  if (
    text.includes("fuel") ||
    text.includes("oil") ||
    text.includes("น้ำมัน")
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
    text.includes("water") ||
    text.includes("น้ำ")
  ) {
    return "💧";
  }

  if (text.includes("wind")) {
    return "🌬️";
  }

  if (text.includes("battery")) {
    return "🔋";
  }

  if (text.includes("biomass")) {
    return "🌱";
  }

  if (text.includes("heat")) {
    return "🌡️";
  }

  return "🔋";
}

/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(number);
}

/* =========================================================
   GET PERIOD LABEL
========================================================= */

function getPeriodLabel(row, viewType) {
  if (!row) return "";

  if (viewType === "daily") {
    return row.period_label || row.record_date || "";
  }

  if (viewType === "monthly") {
    return (
      row.period_label ||
      row.record_date?.substring(0, 7) ||
      ""
    );
  }

  if (viewType === "yearly") {
    return (
      row.period_label ||
      row.record_date?.substring(0, 4) ||
      ""
    );
  }

  return row.period_label || row.record_date || "";
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
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
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);

    try {
      const [
        energyTypesResult,
        recordsResult,
        energyValuesResult,
      ] = await Promise.all([
        supabase
          .from("energy_types")
          .select("*")
          .eq("is_active", true)
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("energy_data")
          .select("*")
          .order("record_date", {
            ascending: true,
          }),

        supabase
          .from("energy_values")
          .select("*")
          .order("id", {
            ascending: true,
          }),
      ]);

      if (energyTypesResult.error) {
        console.error(
          energyTypesResult.error
        );
      }

      if (recordsResult.error) {
        console.error(
          recordsResult.error
        );
      }

      if (energyValuesResult.error) {
        console.error(
          energyValuesResult.error
        );
      }

      const types =
        energyTypesResult.data || [];

      setEnergyTypes(types);
      setRecords(recordsResult.data || []);
      setEnergyValues(
        energyValuesResult.data || []
      );

      if (
        types.length > 0 &&
        !selectedEnergy
      ) {
        setSelectedEnergy(
          types[0].energy_key
        );
      }
    } catch (error) {
      console.error(
        "Dashboard load error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SELECTED ENERGY
  ======================================================= */

  const selectedType = useMemo(() => {
    return energyTypes.find(
      (item) =>
        item.energy_key === selectedEnergy
    );
  }, [
    energyTypes,
    selectedEnergy,
  ]);

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

    const found = energyValues.find(
      (item) =>
        Number(item.energy_data_id) ===
          Number(row.id) &&
        Number(item.energy_type_id) ===
          Number(energyType.id)
    );

    if (found) {
      return Number(found.value) || 0;
    }

    return (
      Number(
        row[energyType.energy_key]
      ) || 0
    );
  }

  /* =======================================================
     FILTER RECORDS
  ======================================================= */

  const filteredRecords = useMemo(() => {
    if (!records.length) {
      return [];
    }

    return records
      .filter((row) => {
        if (viewType === "daily") {
          return (
            !row.period_type ||
            row.period_type === "daily"
          );
        }

        if (viewType === "monthly") {
          return (
            row.period_type === "monthly"
          );
        }

        if (viewType === "yearly") {
          return (
            row.period_type === "yearly"
          );
        }

        return true;
      })
      .sort((a, b) => {
        return (
          new Date(a.record_date) -
          new Date(b.record_date)
        );
      });
  }, [records, viewType]);

  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData = useMemo(() => {
    if (!selectedType) {
      return [];
    }

    const grouped = {};

    filteredRecords.forEach((row) => {
      const label = getPeriodLabel(
        row,
        viewType
      );

      if (!grouped[label]) {
        grouped[label] = {
          label,
          value: 0,
        };
      }

      grouped[label].value +=
        getEnergyValue(
          row,
          selectedType
        );
    });

    return Object.values(grouped);
  }, [
    filteredRecords,
    selectedType,
    viewType,
    energyValues,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summaryData = useMemo(() => {
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
    energyTypes,
    records,
    energyValues,
  ]);

  /* =======================================================
     SELECTED TOTAL
  ======================================================= */

  const selectedTotal = useMemo(() => {
    if (!selectedType) {
      return 0;
    }

    return filteredRecords.reduce(
      (sum, row) => {
        return (
          sum +
          getEnergyValue(
            row,
            selectedType
          )
        );
      },
      0
    );
  }, [
    filteredRecords,
    selectedType,
    energyValues,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontSize: "18px",
          color: "#475569",
        }}
      >
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            ระบบจัดการและติดตามการใช้พลังงานโรงงาน
          </p>
        </div>

        <div className="header-date">

          <div className="header-date-icon">
            📊
          </div>

          <div>

            <div className="header-date-title">
              ข้อมูลพลังงาน
            </div>

            <div className="header-date-sub">
              Factory Energy Management
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="summary-grid">

        {summaryData.map((item) => (
          <div
            className="summary-card"
            key={item.id}
          >

            <div className="summary-card-top">

              <div className="summary-icon">
                {getEnergyIcon(
                  item.energy_name
                )}
              </div>

              <div className="summary-name">
                {item.energy_name}
              </div>

            </div>

            <div className="summary-value">
              {formatNumber(item.total)}
            </div>

            <div className="summary-unit">
              {item.unit}
            </div>

          </div>
        ))}

      </div>

      {/* =================================================
          ANALYSIS SECTION
      ================================================= */}

      <div className="analysis-section">

        <div className="section-title">

          <h2>
            วิเคราะห์ข้อมูลพลังงาน
          </h2>

          <p>
            เลือกประเภทพลังงานและช่วงเวลาที่ต้องการดู
          </p>

        </div>

        {/* ===============================================
            CONTROLS
        =============================================== */}

        <div className="analysis-controls">

          {/* ENERGY SELECT */}

          <div className="energy-control">

            <label>
              ข้อมูลพลังงาน
            </label>

            <select
              value={selectedEnergy}
              onChange={(e) =>
                setSelectedEnergy(
                  e.target.value
                )
              }
            >

              {energyTypes.map(
                (type) => (
                  <option
                    key={type.id}
                    value={
                      type.energy_key
                    }
                  >
                    {getEnergyIcon(
                      type.energy_name
                    )}{" "}
                    {type.energy_name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* PERIOD SELECT */}

          <div className="period-tabs">

            <button
              className={
                viewType === "daily"
                  ? "period-tab active"
                  : "period-tab"
              }
              onClick={() =>
                setViewType("daily")
              }
            >
              รายวัน
            </button>

            <button
              className={
                viewType === "monthly"
                  ? "period-tab active"
                  : "period-tab"
              }
              onClick={() =>
                setViewType("monthly")
              }
            >
              รายเดือน
            </button>

            <button
              className={
                viewType === "yearly"
                  ? "period-tab active"
                  : "period-tab"
              }
              onClick={() =>
                setViewType("yearly")
              }
            >
              รายปี
            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          SELECTED ENERGY SUMMARY
      ================================================= */}

      <div className="selected-energy-card">

        <div className="selected-energy-left">

          <div className="selected-energy-icon">
            {getEnergyIcon(
              selectedType?.energy_name
            )}
          </div>

          <div>

            <div className="selected-energy-label">
              พลังงานที่กำลังแสดง
            </div>

            <div className="selected-energy-name">
              {selectedType?.energy_name ||
                "-"}
            </div>

          </div>

        </div>

        <div className="selected-energy-total">

          <div className="selected-total-label">
            รวมช่วงที่เลือก
          </div>

          <div className="selected-total-value">
            {formatNumber(selectedTotal)}
          </div>

          <div className="selected-total-unit">
            {selectedType?.unit || ""}
          </div>

        </div>

      </div>

      {/* =================================================
          LINE CHART
      ================================================= */}

      <div className="chart-card">

        <div className="chart-header">

          <div>

            <h3>
              📈 กราฟเส้น
            </h3>

            <p>
              {selectedType?.energy_name ||
                "ข้อมูลพลังงาน"}{" "}
              ({selectedType?.unit || ""})
            </p>

          </div>

        </div>

        <div className="chart-container">

          {chartData.length === 0 ? (

            <div className="empty-chart">
              ยังไม่มีข้อมูลสำหรับช่วงเวลานี้
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    selectedType?.energy_name ||
                      "พลังงาน",
                  ]}
                  labelFormatter={(label) =>
                    `ช่วงเวลา: ${label}`
                  }
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="value"
                  name={
                    selectedType?.energy_name ||
                    "การใช้พลังงาน"
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

          )}

        </div>

      </div>

      {/* =================================================
          BAR CHART
      ================================================= */}

      <div className="chart-card">

        <div className="chart-header">

          <div>

            <h3>
              📊 กราฟแท่ง
            </h3>

            <p>
              {selectedType?.energy_name ||
                "ข้อมูลพลังงาน"}{" "}
              ({selectedType?.unit || ""})
            </p>

          </div>

        </div>

        <div className="chart-container">

          {chartData.length === 0 ? (

            <div className="empty-chart">
              ยังไม่มีข้อมูลสำหรับช่วงเวลานี้
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 12,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    formatNumber(value),
                    selectedType?.energy_name ||
                      "พลังงาน",
                  ]}
                  labelFormatter={(label) =>
                    `ช่วงเวลา: ${label}`
                  }
                />

                <Legend />

                <Bar
                  dataKey="value"
                  name={
                    selectedType?.energy_name ||
                    "การใช้พลังงาน"
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

          )}

        </div>

      </div>

      {/* =================================================
          DATA TABLE
      ================================================= */}

      <div className="data-table-card">

        {/* TABLE HEADER */}

        <div className="table-header">

          <div>

            <h2>
              ข้อมูลพลังงาน
            </h2>

            <p>
              รายการข้อมูลตามช่วงเวลาที่เลือก
            </p>

          </div>

          {/* แสดงพลังงานที่เลือก */}
          <div className="table-current-energy">

            <span className="table-energy-icon">
              {getEnergyIcon(
                selectedType?.energy_name
              )}
            </span>

            <span>
              {selectedType?.energy_name ||
                "-"}
            </span>

          </div>

        </div>

        {/* TABLE */}

        {filteredRecords.length === 0 ? (

          <div className="empty-table">

            <div className="empty-table-icon">
              📋
            </div>

            <h3>
              ยังไม่มีข้อมูล
            </h3>

            <p>
              ยังไม่มีข้อมูลสำหรับช่วงเวลาที่เลือก
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    ลำดับ
                  </th>

                  <th>
                    ช่วงเวลา
                  </th>

                  <th>
                    วันที่บันทึก
                  </th>

                  <th>
                    {selectedType?.energy_name ||
                      "พลังงาน"}
                  </th>

                  <th>
                    หน่วย
                  </th>

                  <th>
                    หมายเหตุ
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredRecords
                  .slice()
                  .reverse()
                  .map(
                    (row, index) => {

                      const value =
                        getEnergyValue(
                          row,
                          selectedType
                        );

                      return (
                        <tr
                          key={row.id}
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>
                            <span className="period-badge">
                              {getPeriodLabel(
                                row,
                                viewType
                              )}
                            </span>
                          </td>

                          <td>
                            {row.record_date ||
                              "-"}
                          </td>

                          <td className="energy-value-cell">
                            {formatNumber(
                              value
                            )}
                          </td>

                          <td>
                            {selectedType?.unit ||
                              "-"}
                          </td>

                          <td className="note-cell">
                            {row.note ||
                              "-"}
                          </td>

                        </tr>
                      );
                    }
                  )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="dashboard-footer">
        Factory Energy Management System
      </div>

      {/* =================================================
          CSS
      ================================================= */}

      <style jsx>{`

        .dashboard-page {
          padding: 32px;
          min-height: 100vh;
          background: #f8fafc;
        }

        /* HEADER */

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
        }

        .dashboard-header p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 15px;
        }

        .header-date {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px 16px;
          box-shadow: 0 2px 8px
            rgba(
              15,
              23,
              42,
              0.04
            );
        }

        .header-date-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          font-size: 22px;
        }

        .header-date-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .header-date-sub {
          margin-top: 3px;
          font-size: 12px;
          color: #64748b;
        }

        /* SUMMARY */

        .summary-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(210px, 1fr)
            );
          gap: 18px;
          margin-bottom: 28px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 3px 12px
            rgba(
              15,
              23,
              42,
              0.04
            );
        }

        .summary-card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .summary-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff6ff;
          font-size: 21px;
        }

        .summary-name {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
        }

        .summary-value {
          margin-top: 20px;
          font-size: 27px;
          font-weight: 700;
          color: #0f172a;
        }

        .summary-unit {
          margin-top: 4px;
          color: #64748b;
          font-size: 13px;
        }

        /* ANALYSIS */

        .analysis-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          margin-bottom: 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px 20px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 22px;
          color: #0f172a;
        }

        .section-title p {
          margin: 5px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        /* CONTROLS */

        .analysis-controls {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .energy-control {
          min-width: 180px;
        }

        .energy-control label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .energy-control select {
          height: 42px;
          min-width: 180px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          background: white;
          color: #0f172a;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
        }

        .energy-control select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px
            rgba(
              37,
              99,
              235,
              0.1
            );
        }

        /* PERIOD */

        .period-tabs {
          display: flex;
          gap: 5px;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
        }

        .period-tab {
          border: none;
          background: transparent;
          padding: 9px 16px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
          transition: 0.2s;
        }

        .period-tab:hover {
          background: #e2e8f0;
        }

        .period-tab.active {
          background: #2563eb;
          color: white;
          font-weight: 600;
        }

        /* SELECTED ENERGY */

        .selected-energy-card {
          background: linear-gradient(
            135deg,
            #eff6ff,
            #ffffff
          );
          border: 1px solid #bfdbfe;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .selected-energy-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .selected-energy-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
          border: 1px solid #dbeafe;
        }

        .selected-energy-label {
          font-size: 12px;
          color: #64748b;
        }

        .selected-energy-name {
          margin-top: 3px;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .selected-energy-total {
          text-align: right;
        }

        .selected-total-label {
          font-size: 12px;
          color: #64748b;
        }

        .selected-total-value {
          margin-top: 3px;
          font-size: 22px;
          font-weight: 700;
          color: #2563eb;
        }

        .selected-total-unit {
          font-size: 12px;
          color: #64748b;
        }

        /* CHART */

        .chart-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 3px 12px
            rgba(
              15,
              23,
              42,
              0.04
            );
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 17px;
          color: #0f172a;
        }

        .chart-header p {
          margin: 5px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .chart-container {
          width: 100%;
          height: 360px;
        }

        .empty-chart {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 14px;
        }

        /* TABLE */

        .data-table-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 3px 12px
            rgba(
              15,
              23,
              42,
              0.04
            );
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 22px;
          border-bottom: 1px solid #e2e8f0;
        }

        .table-header h2 {
          margin: 0;
          font-size: 20px;
          color: #0f172a;
        }

        .table-header p {
          margin: 5px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .table-current-energy {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #eff6ff;
          color: #2563eb;
          padding: 8px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
        }

        .table-energy-icon {
          font-size: 17px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f8fafc;
        }

        th {
          padding: 14px 16px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        td {
          padding: 14px 16px;
          font-size: 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          white-space: nowrap;
        }

        tbody tr:hover {
          background: #f8fafc;
        }

        .period-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 7px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
        }

        .energy-value-cell {
          font-weight: 700;
          color: #2563eb;
        }

        .note-cell {
          white-space: normal;
          min-width: 180px;
          max-width: 300px;
        }

        /* EMPTY TABLE */

        .empty-table {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-table-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .empty-table h3 {
          margin: 0;
          color: #334155;
        }

        .empty-table p {
          margin: 7px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        /* FOOTER */

        .dashboard-footer {
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
          padding: 28px 0 10px;
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {

          .analysis-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .analysis-controls {
            width: 100%;
            justify-content: flex-start;
          }

        }

        @media (max-width: 900px) {

          .dashboard-page {
            padding: 22px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .selected-energy-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .selected-energy-total {
            text-align: left;
          }

        }

        @media (max-width: 600px) {

          .dashboard-page {
            padding: 15px;
          }

          .dashboard-header h1 {
            font-size: 26px;
          }

          .analysis-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .energy-control {
            width: 100%;
          }

          .energy-control select {
            width: 100%;
          }

          .period-tabs {
            width: 100%;
          }

          .period-tab {
            flex: 1;
            padding: 9px 8px;
          }

          .chart-container {
            height: 300px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .table-header {
            align-items: flex-start;
            flex-direction: column;
          }

        }

      `}</style>

    </div>
  );
}
