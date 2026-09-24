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

  if (text.includes("ไฟฟ้า") || text.includes("electric")) return "⚡";
  if (text.includes("solar") || text.includes("แสงอาทิตย์")) return "☀️";
  if (text.includes("gas") || text.includes("ก๊าซ")) return "🔥";
  if (text.includes("น้ำมัน") || text.includes("fuel") || text.includes("oil")) return "⛽";
  if (text.includes("steam") || text.includes("ไอน้ำ")) return "♨️";
  if (text.includes("น้ำ") || text.includes("water")) return "💧";
  if (text.includes("ลม") || text.includes("wind")) return "🌬️";
  if (text.includes("แบต") || text.includes("battery")) return "🔋";
  if (text.includes("ชีวมวล") || text.includes("biomass")) return "🌱";
  if (text.includes("ความร้อน") || text.includes("heat")) return "🌡️";

  return "🔋";
}

/* =========================================================
   MONTHS
========================================================= */

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [energyTypes, setEnergyTypes] = useState([]);
  const [records, setRecords] = useState([]);
  const [energyValues, setEnergyValues] = useState([]);

  const [selectedEnergy, setSelectedEnergy] = useState("");
  const [viewType, setViewType] = useState("daily");
  const [chartType, setChartType] = useState("line");

  /* Main chart selections */
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  /* Comparison */
  const [comparisonType, setComparisonType] = useState("monthly");
  const [comparisonChartType, setComparisonChartType] = useState("line");
  const [comparisonMonths, setComparisonMonths] = useState([]);
  const [comparisonYears, setComparisonYears] = useState([]);
  const [comparisonDays, setComparisonDays] = useState([]);

  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD DATA
  ========================================================= */

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

    if (typeError) console.error(typeError);
    if (dataError) console.error(dataError);
    if (valueError) console.error(valueError);

    setEnergyTypes(types || []);
    setRecords(dataRows || []);
    setEnergyValues(valueRows || []);

    if (types?.length > 0) {
      setSelectedEnergy(
        (current) => current || types[0].energy_key
      );
    }

    setLoading(false);
  }

  /* =========================================================
     ENERGY VALUE
  ========================================================= */

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

    return Number(
      row[energyType.energy_key]
    ) || 0;
  }

  /* =========================================================
     SELECTED ENERGY
  ========================================================= */

  const selectedType = energyTypes.find(
    (item) =>
      item.energy_key === selectedEnergy
  );

  /* =========================================================
     AVAILABLE YEARS
  ========================================================= */

  const availableYears = useMemo(() => {
    const years = new Set();

    records.forEach((row) => {
      if (row.record_date) {
        years.add(
          row.record_date.substring(0, 4)
        );
      }

      if (row.period_label) {
        const text = String(row.period_label);

        if (/^\d{4}$/.test(text)) {
          years.add(text);
        }

        if (/^\d{4}-\d{2}/.test(text)) {
          years.add(text.substring(0, 4));
        }
      }
    });

    const result = Array.from(years).sort();

    if (result.length === 0) {
      const currentYear =
        new Date().getFullYear();

      return [
        String(currentYear - 2),
        String(currentYear - 1),
        String(currentYear),
      ];
    }

    return result;
  }, [records]);

  /* =========================================================
     AVAILABLE DAYS
  ========================================================= */

  const days = Array.from(
    { length: 31 },
    (_, index) =>
      String(index + 1).padStart(2, "0")
  );

  /* =========================================================
     MAIN FILTERED RECORDS
  ========================================================= */

  const filteredRecords = useMemo(() => {
    return records
      .filter((row) => {
        const period =
          row.period_type || "daily";

        if (period !== viewType) {
          return false;
        }

        const date =
          row.record_date || "";

        const year =
          date.substring(0, 4);

        const month =
          date.substring(5, 7);

        const day =
          date.substring(8, 10);

        if (
          selectedYears.length > 0 &&
          !selectedYears.includes(year)
        ) {
          return false;
        }

        if (
          viewType === "monthly" &&
          selectedMonths.length > 0 &&
          !selectedMonths.includes(month)
        ) {
          return false;
        }

        if (
          viewType === "daily"
        ) {
          if (
            selectedMonths.length > 0 &&
            !selectedMonths.includes(month)
          ) {
            return false;
          }

          if (
            selectedDays.length > 0 &&
            !selectedDays.includes(day)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.record_date) -
          new Date(b.record_date)
      );
  }, [
    records,
    viewType,
    selectedDays,
    selectedMonths,
    selectedYears,
  ]);

  /* =========================================================
     MAIN CHART DATA
========================================================= */

  const chartData = useMemo(() => {
    if (!selectedType) return [];

    return filteredRecords.map((row) => {
      const date =
        row.record_date || "";

      let label = date;

      if (viewType === "daily") {
        label = date;
      }

      if (viewType === "monthly") {
        const month =
          date.substring(5, 7);

        const year =
          date.substring(0, 4);

        const monthName =
          months.find(
            (item) =>
              item.value === month
          )?.label || month;

        label =
          `${monthName} ${year}`;
      }

      if (viewType === "yearly") {
        label =
          row.period_label ||
          date.substring(0, 4);
      }

      return {
        label,
        value: getEnergyValue(
          row,
          selectedType
        ),
      };
    });
  }, [
    filteredRecords,
    selectedType,
    viewType,
    energyValues,
  ]);

  /* =========================================================
     SUMMARY
========================================================= */

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

  /* =========================================================
     COMPARISON DATA
========================================================= */

  const comparisonData = useMemo(() => {
    if (!selectedType) return [];

    /* =========================================
       MONTHLY
    ========================================= */

    if (
      comparisonType === "monthly"
    ) {
      const result = {};

      const years =
        comparisonYears.length > 0
          ? comparisonYears
          : availableYears;

      const monthsToUse =
        comparisonMonths.length > 0
          ? comparisonMonths
          : months.map(
              (item) => item.value
            );

      monthsToUse.forEach(
        (monthValue) => {
          const monthName =
            months.find(
              (item) =>
                item.value ===
                monthValue
            )?.label ||
            monthValue;

          const item = {
            label: monthName,
          };

          years.forEach((year) => {
            const matchingRows =
              records.filter((row) => {
                const date =
                  row.record_date ||
                  "";

                const rowYear =
                  date.substring(0, 4);

                const rowMonth =
                  date.substring(5, 7);

                return (
                  row.period_type ===
                    "monthly" &&
                  rowYear === year &&
                  rowMonth ===
                    monthValue
                );
              });

            item[`year_${year}`] =
              matchingRows.reduce(
                (sum, row) =>
                  sum +
                  getEnergyValue(
                    row,
                    selectedType
                  ),
                0
              );
          });

          result[monthValue] =
            item;
        }
      );

      return Object.values(result);
    }

    /* =========================================
       YEARLY
    ========================================= */

    if (
      comparisonType === "yearly"
    ) {
      const years =
        comparisonYears.length > 0
          ? comparisonYears
          : availableYears;

      return years.map((year) => {
        const matchingRows =
          records.filter((row) => {
            const date =
              row.record_date || "";

            return (
              row.period_type ===
                "yearly" &&
              date.substring(0, 4) ===
                year
            );
          });

        return {
          label: year,
          value:
            matchingRows.reduce(
              (sum, row) =>
                sum +
                getEnergyValue(
                  row,
                  selectedType
                ),
              0
            ),
        };
      });
    }

    /* =========================================
       DAILY
    ========================================= */

    if (
      comparisonType === "daily"
    ) {
      const years =
        comparisonYears.length > 0
          ? comparisonYears
          : availableYears;

      const selectedMonth =
        comparisonMonths[0] ||
        "01";

      const selectedDaysForComparison =
        comparisonDays.length > 0
          ? comparisonDays
          : days;

      const result = [];

      selectedDaysForComparison.forEach(
        (day) => {
          const monthName =
            months.find(
              (item) =>
                item.value ===
                selectedMonth
            )?.label ||
            selectedMonth;

          const item = {
            label:
              `${day} ${monthName}`,
          };

          years.forEach((year) => {
            const matchingRows =
              records.filter((row) => {
                const date =
                  row.record_date ||
                  "";

                return (
                  row.period_type ===
                    "daily" &&
                  date.substring(0, 4) ===
                    year &&
                  date.substring(5, 7) ===
                    selectedMonth &&
                  date.substring(8, 10) ===
                    day
                );
              });

            item[`year_${year}`] =
              matchingRows.reduce(
                (sum, row) =>
                  sum +
                  getEnergyValue(
                    row,
                    selectedType
                  ),
                0
              );
          });

          result.push(item);
        }
      );

      return result;
    }

    return [];
  }, [
    records,
    selectedType,
    comparisonType,
    comparisonMonths,
    comparisonYears,
    comparisonDays,
    availableYears,
    energyValues,
  ]);

  /* =========================================================
     COMPARISON YEARS
========================================================= */

  const comparisonYearsToShow =
    comparisonYears.length > 0
      ? comparisonYears
      : availableYears;

  /* =========================================================
     TOGGLE HELPERS
========================================================= */

  function toggleItem(
    value,
    current,
    setter
  ) {
    if (current.includes(value)) {
      setter(
        current.filter(
          (item) => item !== value
        )
      );
    } else {
      setter([
        ...current,
        value,
      ]);
    }
  }

  function selectAll(
    values,
    setter
  ) {
    setter([...values]);
  }

  function clearAll(setter) {
    setter([]);
  }

  /* =========================================================
     LOADING
========================================================= */

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

  /* =========================================================
     PAGE
========================================================= */

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

        .page {
          min-height: 100vh;
          padding: 28px;
        }

        .container {
          max-width: 1450px;
          margin: auto;
        }

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

        /* ==============================
           FILTER CARD
        ============================== */

        .filterCard {
          background: white;

          border:
            1px solid
            #e8edf5;

          border-radius: 18px;

          padding: 20px;

          display: flex;

          flex-wrap: wrap;

          gap: 16px;

          align-items: flex-end;

          box-shadow:
            0 5px 20px
            rgba(15, 23, 42, 0.04);
        }

        .filterGroup {
          min-width: 190px;
          flex: 1;
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

        /* ==============================
           MULTI SELECT
        ============================== */

        .selectionCard {
          background: #f8fafc;

          border:
            1px solid
            #e2e8f0;

          border-radius: 14px;

          padding: 16px;

          margin-top: 14px;
        }

        .selectionHeader {
          display: flex;

          justify-content:
            space-between;

          align-items: center;

          gap: 10px;

          margin-bottom: 12px;

          flex-wrap: wrap;
        }

        .selectionTitle {
          font-size: 13px;

          font-weight: 700;

          color: #334155;
        }

        .selectionActions {
          display: flex;

          gap: 6px;
        }

        .smallButton {
          border:
            1px solid
            #dbe3ef;

          background: white;

          color: #475569;

          padding: 6px 10px;

          border-radius: 8px;

          cursor: pointer;

          font-size: 12px;
        }

        .smallButton:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .optionGrid {
          display: flex;

          flex-wrap: wrap;

          gap: 8px;
        }

        .optionButton {
          border:
            1px solid
            #dbe3ef;

          background: white;

          color: #64748b;

          padding: 8px 12px;

          border-radius: 9px;

          cursor: pointer;

          font-size: 12px;

          transition: 0.15s;
        }

        .optionButton:hover {
          border-color: #93c5fd;
        }

        .optionButton.active {
          background: #2563eb;

          color: white;

          border-color: #2563eb;
        }

        /* ==============================
           CHART
        ============================== */

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

          gap: 12px;

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

          white-space: nowrap;
        }

        .chart {
          width: 100%;
          height: 380px;
          min-height: 380px;
        }

        .chartTools {
          display: flex;

          gap: 10px;

          flex-wrap: wrap;

          align-items: center;
        }

        .chartTools .select {
          width: auto;
          min-width: 145px;
        }

        .emptyChart {
          width: 100%;

          height: 380px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-direction: column;

          color: #94a3b8;

          background: #f8fafc;

          border-radius: 12px;
        }

        .emptyChartIcon {
          font-size: 36px;

          margin-bottom: 8px;
        }

        /* ==============================
           TABLE
        ============================== */

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
            min-width: 100%;
          }

          .chartCard,
          .tableCard {
            padding: 16px;
          }

          .chartHeader {
            align-items: flex-start;

            flex-direction: column;
          }

          .chartTools {
            width: 100%;
          }

          .chartTools .select {
            width: 100%;
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
              MAIN ANALYSIS
          ================================================= */}

          <div className="sectionTitle">

            <h2>
              วิเคราะห์ข้อมูล
            </h2>

          </div>

          <section className="filterCard">

            {/* ENERGY */}

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

                {energyTypes.map((item) => (

                  <option
                    key={item.id}
                    value={item.energy_key}
                  >
                    {getEnergyIcon(
                      item.energy_name
                    )}{" "}
                    {item.energy_name}
                  </option>

                ))}

              </select>

            </div>

            {/* VIEW TYPE */}

            <div className="filterGroup">

              <label className="filterLabel">
                รูปแบบข้อมูล
              </label>

              <select
                className="select"
                value={viewType}
                onChange={(e) => {
                  setViewType(
                    e.target.value
                  );

                  setSelectedDays([]);
                  setSelectedMonths([]);
                  setSelectedYears([]);
                }}
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

            {/* CHART TYPE */}

            <div className="filterGroup">

              <label className="filterLabel">
                รูปแบบกราฟ
              </label>

              <select
                className="select"
                value={chartType}
                onChange={(e) =>
                  setChartType(
                    e.target.value
                  )
                }
              >

                <option value="line">
                  Line Chart
                </option>

                <option value="bar">
                  Bar Chart
                </option>

              </select>

            </div>

          </section>

          {/* =================================================
              MAIN SELECTION
          ================================================= */}

          <section className="selectionCard">

            <div className="selectionHeader">

              <div className="selectionTitle">

                {viewType === "daily"
                  ? "เลือกวันที่ / เดือน / ปี"
                  : viewType === "monthly"
                  ? "เลือกเดือน / ปี"
                  : "เลือกปี"}

              </div>

              <div className="selectionActions">

                {viewType === "daily" && (
                  <>
                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          days,
                          setSelectedDays
                        )
                      }
                    >
                      Select All Days
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setSelectedDays
                        )
                      }
                    >
                      Clear
                    </button>
                  </>
                )}

                {viewType === "monthly" && (
                  <>
                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          months.map(
                            (item) =>
                              item.value
                          ),
                          setSelectedMonths
                        )
                      }
                    >
                      Select All Months
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setSelectedMonths
                        )
                      }
                    >
                      Clear
                    </button>
                  </>
                )}

                {viewType === "yearly" && (
                  <>
                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          availableYears,
                          setSelectedYears
                        )
                      }
                    >
                      Select All Years
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setSelectedYears
                        )
                      }
                    >
                      Clear
                    </button>
                  </>
                )}

              </div>

            </div>

            {/* DAILY */}

            {viewType === "daily" && (

              <>
                <div className="selectionTitle">
                  Day
                </div>

                <div className="optionGrid">

                  {days.map((day) => (

                    <button
                      key={day}
                      className={`optionButton ${
                        selectedDays.includes(
                          day
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleItem(
                          day,
                          selectedDays,
                          setSelectedDays
                        )
                      }
                    >
                      {day}
                    </button>

                  ))}

                </div>

                <div
                  className="selectionTitle"
                  style={{
                    marginTop: 16,
                  }}
                >
                  Month
                </div>

                <div className="optionGrid">

                  {months.map((month) => (

                    <button
                      key={month.value}
                      className={`optionButton ${
                        selectedMonths.includes(
                          month.value
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleItem(
                          month.value,
                          selectedMonths,
                          setSelectedMonths
                        )
                      }
                    >
                      {month.label}
                    </button>

                  ))}

                </div>

                <div
                  className="selectionTitle"
                  style={{
                    marginTop: 16,
                  }}
                >
                  Year
                </div>

                <div className="optionGrid">

                  {availableYears.map(
                    (year) => (

                      <button
                        key={year}
                        className={`optionButton ${
                          selectedYears.includes(
                            year
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleItem(
                            year,
                            selectedYears,
                            setSelectedYears
                          )
                        }
                      >
                        {year}
                      </button>

                    )
                  )}

                </div>

              </>

            )}

            {/* MONTHLY */}

            {viewType === "monthly" && (

              <>

                <div className="selectionTitle">
                  Month
                </div>

                <div className="optionGrid">

                  {months.map((month) => (

                    <button
                      key={month.value}
                      className={`optionButton ${
                        selectedMonths.includes(
                          month.value
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleItem(
                          month.value,
                          selectedMonths,
                          setSelectedMonths
                        )
                      }
                    >
                      {month.label}
                    </button>

                  ))}

                </div>

                <div
                  className="selectionTitle"
                  style={{
                    marginTop: 16,
                  }}
                >
                  Year
                </div>

                <div className="optionGrid">

                  {availableYears.map(
                    (year) => (

                      <button
                        key={year}
                        className={`optionButton ${
                          selectedYears.includes(
                            year
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleItem(
                            year,
                            selectedYears,
                            setSelectedYears
                          )
                        }
                      >
                        {year}
                      </button>

                    )
                  )}

                </div>

              </>

            )}

            {/* YEARLY */}

            {viewType === "yearly" && (

              <>

                <div className="selectionTitle">
                  Year
                </div>

                <div className="optionGrid">

                  {availableYears.map(
                    (year) => (

                      <button
                        key={year}
                        className={`optionButton ${
                          selectedYears.includes(
                            year
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleItem(
                            year,
                            selectedYears,
                            setSelectedYears
                          )
                        }
                      >
                        {year}
                      </button>

                    )
                  )}

                </div>

              </>

            )}

          </section>

          {/* =================================================
              MAIN CHART
          ================================================= */}

          <section className="chartCard">

            <div className="chartHeader">

              <h2>
                {getEnergyIcon(
                  selectedType?.energy_name
                )}{" "}
                Energy Consumption
              </h2>

              <div className="chartTools">

                <select
                  className="select"
                  value={chartType}
                  onChange={(e) =>
                    setChartType(
                      e.target.value
                    )
                  }
                >

                  <option value="line">
                    Line Chart
                  </option>

                  <option value="bar">
                    Bar Chart
                  </option>

                </select>

                <div className="chartBadge">
                  {selectedType?.unit || ""}
                </div>

              </div>

            </div>

            <div className="chart">

              {chartData.length === 0 ? (

                <div className="emptyChart">

                  <div className="emptyChartIcon">
                    📊
                  </div>

                  <div>
                    No data available
                  </div>

                </div>

              ) : chartType === "line" ? (

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

              ) : (

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

              )}

            </div>

          </section>

          {/* =================================================
              COMPARISON
          ================================================= */}

          <div className="sectionTitle">

            <h2>
              เปรียบเทียบการใช้พลังงาน
            </h2>

          </div>

          <section className="filterCard">

            {/* COMPARISON TYPE */}

            <div className="filterGroup">

              <label className="filterLabel">
                Comparison
              </label>

              <select
                className="select"
                value={comparisonType}
                onChange={(e) => {
                  setComparisonType(
                    e.target.value
                  );

                  setComparisonMonths([]);
                  setComparisonYears([]);
                  setComparisonDays([]);
                }}
              >

                <option value="monthly">
                  Monthly
                </option>

                <option value="yearly">
                  Yearly
                </option>

                <option value="daily">
                  Daily
                </option>

              </select>

            </div>

            {/* COMPARISON CHART */}

            <div className="filterGroup">

              <label className="filterLabel">
                Chart Type
              </label>

              <select
                className="select"
                value={comparisonChartType}
                onChange={(e) =>
                  setComparisonChartType(
                    e.target.value
                  )
                }
              >

                <option value="line">
                  Line Chart
                </option>

                <option value="bar">
                  Bar Chart
                </option>

              </select>

            </div>

          </section>

          {/* =================================================
              COMPARISON SELECTION
          ================================================= */}

          <section className="selectionCard">

            {/* MONTHLY */}

            {comparisonType ===
              "monthly" && (

              <>

                <div className="selectionHeader">

                  <div className="selectionTitle">
                    Select Months
                  </div>

                  <div className="selectionActions">

                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          months.map(
                            (item) =>
                              item.value
                          ),
                          setComparisonMonths
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setComparisonMonths
                        )
                      }
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="optionGrid">

                  {months.map((month) => (

                    <button
                      key={month.value}
                      className={`optionButton ${
                        comparisonMonths.includes(
                          month.value
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleItem(
                          month.value,
                          comparisonMonths,
                          setComparisonMonths
                        )
                      }
                    >
                      {month.label}
                    </button>

                  ))}

                </div>

                <div
                  className="selectionHeader"
                  style={{
                    marginTop: 18,
                  }}
                >

                  <div className="selectionTitle">
                    Select Years
                  </div>

                  <div className="selectionActions">

                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          availableYears,
                          setComparisonYears
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setComparisonYears
                        )
                      }
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="optionGrid">

                  {availableYears.map(
                    (year) => (

                      <button
                        key={year}
                        className={`optionButton ${
                          comparisonYears.includes(
                            year
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleItem(
                            year,
                            comparisonYears,
                            setComparisonYears
                          )
                        }
                      >
                        {year}
                      </button>

                    )
                  )}

                </div>

              </>

            )}

            {/* YEARLY */}

            {comparisonType ===
              "yearly" && (

              <>

                <div className="selectionHeader">

                  <div className="selectionTitle">
                    Select Years
                  </div>

                  <div className="selectionActions">

                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          availableYears,
                          setComparisonYears
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setComparisonYears
                        )
                      }
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="optionGrid">

                  {availableYears.map(
                    (year) => (

                      <button
                        key={year}
                        className={`optionButton ${
                          comparisonYears.includes(
                            year
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleItem(
                            year,
                            comparisonYears,
                            setComparisonYears
                          )
                        }
                      >
                        {year}
                      </button>

                    )
                  )}

                </div>

              </>

            )}

            {/* DAILY */}

            {comparisonType ===
              "daily" && (

              <>

                <div className="selectionTitle">
                  Select Month
                </div>

                <div className="optionGrid">

                  {months.map((month) => (

                    <button
                      key={month.value}
                      className={`optionButton ${
                        comparisonMonths[0] ===
                        month.value
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setComparisonMonths([
                          month.value,
                        ])
                      }
                    >
                      {month.label}
                    </button>

                  ))}

                </div>

                <div
                  className="selectionHeader"
                  style={{
                    marginTop: 18,
                  }}
                >

                  <div className="selectionTitle">
                    Select Days
                  </div>

                  <div className="selectionActions">

                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          days,
                          setComparisonDays
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setComparisonDays
                        )
                      }
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="optionGrid">

                  {days.map((day) => (

                    <button
                      key={day}
                      className={`optionButton ${
                        comparisonDays.includes(
                          day
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleItem(
                          day,
                          comparisonDays,
                          setComparisonDays
                        )
                      }
                    >
                      {day}
                    </button>

                  ))}

                </div>

                <div
                  className="selectionHeader"
                  style={{
                    marginTop: 18,
                  }}
                >

                  <div className="selectionTitle">
                    Select Years
                  </div>

                  <div className="selectionActions">

                    <button
                      className="smallButton"
                      onClick={() =>
                        selectAll(
                          availableYears,
                          setComparisonYears
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      className="smallButton"
                      onClick={() =>
                        clearAll(
                          setComparisonYears
                        )
                      }
                    >
                      Clear
                    </button>

                  </div>

                </div>

                <div className="optionGrid">

                  {availableYears.map(
                    (year) => (

                      <button
                        key={year}
                        className={`optionButton ${
                          comparisonYears.includes(
                            year
                          )
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleItem(
                            year,
                            comparisonYears,
                            setComparisonYears
                          )
                        }
                      >
                        {year}
                      </button>

                    )
                  )}

                </div>

              </>

            )}

          </section>

          {/* =================================================
              COMPARISON CHART
          ================================================= */}

          <section className="chartCard">

            <div className="chartHeader">

              <h2>
                Monthly / Yearly / Daily Energy Comparison
              </h2>

              <div className="chartTools">

                <select
                  className="select"
                  value={comparisonChartType}
                  onChange={(e) =>
                    setComparisonChartType(
                      e.target.value
                    )
                  }
                >

                  <option value="line">
                    Line Chart
                  </option>

                  <option value="bar">
                    Bar Chart
                  </option>

                </select>

                <div className="chartBadge">
                  {selectedType?.unit || ""}
                </div>

              </div>

            </div>

            <div className="chart">

              {comparisonData.length === 0 ? (

                <div className="emptyChart">

                  <div className="emptyChartIcon">
                    📈
                  </div>

                  <div>
                    No comparison data available
                  </div>

                </div>

              ) : comparisonChartType ===
                "line" ? (

                <ResponsiveContainer>

                  <LineChart
                    data={
                      comparisonData
                    }
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

                    {comparisonYearsToShow.map(
                      (year) => (

                        <Line
                          key={year}
                          type="monotone"
                          dataKey={`year_${year}`}
                          name={year}
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                        />

                      )
                    )}

                    {comparisonType ===
                      "yearly" && (
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
                    )}

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <ResponsiveContainer>

                  <BarChart
                    data={
                      comparisonData
                    }
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

                    {comparisonYearsToShow.map(
                      (year) => (

                        <Bar
                          key={year}
                          dataKey={`year_${year}`}
                          name={year}
                        />

                      )
                    )}

                    {comparisonType ===
                      "yearly" && (
                      <Bar
                        dataKey="value"
                        name={
                          selectedType?.energy_name
                        }
                      />
                    )}

                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>

          </section>

          {/* =================================================
              DATA TABLE
          ================================================= */}

          <section className="tableCard">

            <div className="chartHeader">

              <h2>
                📊 ข้อมูลพลังงาน
              </h2>

              <div className="chartBadge">
                {filteredRecords.length} รายการ
              </div>

            </div>

            <div className="tableWrapper">

              <table>

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Period
                    </th>

                    <th>
                      {selectedType?.energy_name ||
                        "Energy"}
                      <br />
                      <small>
                        {selectedType?.unit ||
                          ""}
                      </small>
                    </th>

                    <th>
                      Note
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRecords.map(
                    (row) => (

                      <tr key={row.id}>

                        <td>
                          {row.record_date}
                        </td>

                        <td>
                          {row.period_type ===
                          "monthly"
                            ? "Monthly"
                            : row.period_type ===
                              "yearly"
                            ? "Yearly"
                            : "Daily"}
                        </td>

                        <td>
                          {getEnergyValue(
                            row,
                            selectedType
                          ).toLocaleString()}{" "}
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

              {filteredRecords.length ===
                0 && (

                <div className="empty">

                  <div
                    style={{
                      fontSize: 35,
                    }}
                  >
                    📊
                  </div>

                  <p>
                    ยังไม่มีข้อมูลที่ตรงกับตัวเลือก
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
