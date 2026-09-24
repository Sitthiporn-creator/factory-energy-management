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

if (
text.includes("น้ำมัน") ||
text.includes("fuel") ||
text.includes("oil")
)
return "⛽";

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

/* =======================================================
MAIN ANALYSIS
======================================================= */

const [selectedEnergy, setSelectedEnergy] = useState("");
const [viewType, setViewType] = useState("monthly");
const [chartType, setChartType] = useState("line");

const [selectedMonth, setSelectedMonth] = useState("");
const [selectedYear, setSelectedYear] = useState("");

/* =======================================================
OVERVIEW FILTER
======================================================= */

const [overviewMonth, setOverviewMonth] = useState("");
const [overviewYear, setOverviewYear] = useState("");

/* =======================================================
COMPARISON
======================================================= */

const [comparisonType, setComparisonType] =
useState("monthly");

const [comparisonChartType, setComparisonChartType] =
useState("line");

const [comparisonMonth, setComparisonMonth] =
useState("");

const [comparisonYear, setComparisonYear] =
useState("");

const [comparisonYear2, setComparisonYear2] =
useState("");

const [loading, setLoading] = useState(true);

/* =========================================================
LOAD DATA
========================================================= */

useEffect(() => {
loadData();
}, []);

async function loadData() {
setLoading(true);

```
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

if (types && types.length > 0) {
  setSelectedEnergy(
    (current) =>
      current || types[0].energy_key
  );
}

setLoading(false);
```

}

/* =========================================================
ENERGY VALUE
========================================================= */

function getEnergyValue(row, energyType) {
if (!row || !energyType) return 0;

```
const dynamicValue = energyValues.find(
  (item) =>
    item.energy_data_id === row.id &&
    item.energy_type_id === energyType.id
);

if (dynamicValue) {
  return Number(dynamicValue.value) || 0;
}

return (
  Number(row[energyType.energy_key]) || 0
);
```

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

```
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
      years.add(
        text.substring(0, 4)
      );
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
```

}, [records]);

/* =========================================================
DEFAULT FILTERS
========================================================= */

useEffect(() => {
const currentDate = new Date();

```
const currentMonth =
  String(
    currentDate.getMonth() + 1
  ).padStart(2, "0");

if (!selectedMonth) {
  setSelectedMonth(currentMonth);
}

if (
  availableYears.length > 0 &&
  !selectedYear
) {
  setSelectedYear(
    availableYears[
      availableYears.length - 1
    ]
  );
}

if (!overviewMonth) {
  setOverviewMonth(currentMonth);
}

if (
  availableYears.length > 0 &&
  !overviewYear
) {
  setOverviewYear(
    availableYears[
      availableYears.length - 1
    ]
  );
}

if (!comparisonMonth) {
  setComparisonMonth(currentMonth);
}

if (
  availableYears.length > 0 &&
  !comparisonYear
) {
  setComparisonYear(
    availableYears[
      availableYears.length - 1
    ]
  );
}

if (
  availableYears.length > 1 &&
  !comparisonYear2
) {
  setComparisonYear2(
    availableYears[
      availableYears.length - 2
    ]
  );
}
```

}, [
availableYears,
selectedMonth,
selectedYear,
overviewMonth,
overviewYear,
comparisonMonth,
comparisonYear,
comparisonYear2,
]);

/* =========================================================
OVERVIEW SUMMARY
========================================================= */

const overviewSummary = useMemo(() => {
return energyTypes.map((type) => {
let total = 0;

```
  records.forEach((row) => {
    const date =
      row.record_date || "";

    const year =
      date.substring(0, 4);

    const month =
      date.substring(5, 7);

    if (
      row.period_type === "monthly" &&
      year === overviewYear &&
      month === overviewMonth
    ) {
      total += getEnergyValue(
        row,
        type
      );
    }
  });

  return {
    ...type,
    total,
  };
});
```

}, [
records,
energyTypes,
energyValues,
overviewMonth,
overviewYear,
]);

/* =========================================================
MAIN FILTERED RECORDS
========================================================= */

const filteredRecords = useMemo(() => {
return records
.filter((row) => {
const period =
row.period_type || "monthly";

```
    if (period !== viewType) {
      return false;
    }

    const date =
      row.record_date || "";

    const year =
      date.substring(0, 4);

    const month =
      date.substring(5, 7);

    if (
      selectedYear &&
      year !== selectedYear
    ) {
      return false;
    }

    if (
      viewType === "monthly" &&
      selectedMonth &&
      month !== selectedMonth
    ) {
      return false;
    }

    return true;
  })
  .sort(
    (a, b) =>
      new Date(a.record_date) -
      new Date(b.record_date)
  );
```

}, [
records,
viewType,
selectedMonth,
selectedYear,
]);

/* =========================================================
MAIN CHART DATA
========================================================= */

const chartData = useMemo(() => {
if (!selectedType) return [];

```
return filteredRecords.map(
  (row) => {
    const date =
      row.record_date || "";

    let label = date;

    if (
      viewType === "monthly"
    ) {
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

    if (
      viewType === "yearly"
    ) {
      label =
        row.period_label ||
        date.substring(0, 4);
    }

    return {
      label,
      value:
        getEnergyValue(
          row,
          selectedType
        ),
    };
  }
);
```

}, [
filteredRecords,
selectedType,
viewType,
energyValues,
]);

/* =========================================================
COMPARISON DATA
========================================================= */

const comparisonData =
useMemo(() => {
if (!selectedType) return [];

```
  const years = [
    comparisonYear,
    comparisonYear2,
  ].filter(
    (year, index, array) =>
      year &&
      array.indexOf(year) === index
  );

  if (
    comparisonType ===
    "monthly"
  ) {
    const selectedMonths =
      comparisonMonth
        ? months.filter(
            (month) =>
              month.value ===
              comparisonMonth
          )
        : months;

    return selectedMonths.map(
      (month) => {
        const item = {
          label: month.label,
        };

        years.forEach(
          (year) => {
            const matchingRows =
              records.filter(
                (row) => {
                  const date =
                    row.record_date ||
                    "";

                  return (
                    row.period_type ===
                      "monthly" &&
                    date.substring(
                      0,
                      4
                    ) === year &&
                    date.substring(
                      5,
                      7
                    ) ===
                      month.value
                  );
                }
              );

            item[
              `year_${year}`
            ] =
              matchingRows.reduce(
                (
                  sum,
                  row
                ) =>
                  sum +
                  getEnergyValue(
                    row,
                    selectedType
                  ),
                0
              );
          }
        );

        return item;
      }
    );
  }

  if (
    comparisonType ===
    "yearly"
  ) {
    return years.map(
      (year) => {
        const matchingRows =
          records.filter(
            (row) => {
              const date =
                row.record_date ||
                "";

              return (
                row.period_type ===
                  "yearly" &&
                date.substring(
                  0,
                  4
                ) === year
              );
            }
          );

        return {
          label: year,
          value:
            matchingRows.reduce(
              (
                sum,
                row
              ) =>
                sum +
                getEnergyValue(
                  row,
                  selectedType
                ),
              0
            ),
        };
      }
    );
  }

  return [];
}, [
  records,
  selectedType,
  comparisonType,
  comparisonMonth,
  comparisonYear,
  comparisonYear2,
  energyValues,
]);
```

/* =========================================================
COMPARISON YEARS
========================================================= */

const comparisonYearsToShow =
[
comparisonYear,
comparisonYear2,
].filter(
(year, index, array) =>
year &&
array.indexOf(year) === index
);

/* =========================================================
LOADING
========================================================= */

if (loading) {
return ( <div className="loadingScreen">

```
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
```

}

/* =========================================================
PAGE
========================================================= */

return (
<> <style jsx global>{`

```
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
        rgba(
          15,
          23,
          42,
          0.18
        );
    }

    .headerGlow {
      position: absolute;

      width: 300px;
      height: 300px;

      border-radius: 50%;

      background:
        rgba(
          59,
          130,
          246,
          0.15
        );

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
        rgba(
          255,
          255,
          255,
          0.12
        );

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

      padding:
        11px 17px;

      border-radius: 11px;

      background:
        rgba(
          255,
          255,
          255,
          0.1
        );

      color: white;

      border:
        1px solid
        rgba(
          255,
          255,
          255,
          0.15
        );

      transition: 0.2s;

      font-size: 14px;
    }

    .headerButton:hover {
      background:
        rgba(
          255,
          255,
          255,
          0.2
        );

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

    .overviewTools {
      display: flex;

      align-items: center;

      gap: 8px;

      flex-wrap: wrap;
    }

    .overviewTools .select {
      width: auto;

      min-width: 145px;
    }

    .summaryGrid {
      display: grid;

      grid-template-columns:
        repeat(
          auto-fit,
          minmax(
            210px,
            1fr
          )
        );

      gap: 16px;
    }

    .summaryCard {
      position: relative;

      overflow: hidden;

      background: white;

      border:
        1px solid
        #e8edf5;

      border-radius: 18px;

      padding: 20px;

      box-shadow:
        0 5px 20px
        rgba(
          15,
          23,
          42,
          0.05
        );

      transition: 0.2s;
    }

    .summaryCard:hover {
      transform:
        translateY(-3px);

      box-shadow:
        0 10px 28px
        rgba(
          15,
          23,
          42,
          0.09
        );
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
        rgba(
          15,
          23,
          42,
          0.04
        );
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

      padding:
        11px 14px;

      border:
        1px solid
        #dbe3ef;

      border-radius: 10px;

      background: white;

      color: #172033;

      outline: none;

      cursor: pointer;
    }

    .select:focus {
      border-color:
        #3b82f6;

      box-shadow:
        0 0 0 3px
        rgba(
          59,
          130,
          246,
          0.1
        );
    }

    .selectionCard {
      background:
        #f8fafc;

      border:
        1px solid
        #e2e8f0;

      border-radius: 14px;

      padding: 16px;

      margin-top: 14px;

      display: flex;

      flex-wrap: wrap;

      gap: 12px;

      align-items: flex-end;
    }

    .selectionGroup {
      flex: 1;

      min-width: 180px;
    }

    .selectionLabel {
      display: block;

      font-size: 12px;

      font-weight: 700;

      color: #475569;

      margin-bottom: 7px;
    }

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
        rgba(
          15,
          23,
          42,
          0.04
        );
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

      padding:
        6px 10px;

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

      background:
        #f8fafc;

      border-radius: 12px;
    }

    .emptyChartIcon {
      font-size: 36px;

      margin-bottom: 8px;
    }

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
        rgba(
          15,
          23,
          42,
          0.04
        );
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
      background:
        #f8fafc;

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
      background:
        #f8fbff;
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

      padding:
        30px 0 10px;
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
          repeat(
            2,
            1fr
          );
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

      .selectionGroup {
        width: 100%;

        min-width: 100%;
      }

      .chartCard,
      .tableCard {
        padding: 16px;
      }

      .chartHeader {
        align-items:
          flex-start;

        flex-direction:
          column;
      }

      .chartTools {
        width: 100%;
      }

      .chartTools .select {
        width: 100%;
      }

      .overviewTools {
        width: 100%;
      }

      .overviewTools .select {
        width: 100%;
      }
    }

  `}</style>

  <main className="page">

    <div className="container">

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
              ➕ เพิ่มหัวข้อพลังงาน
            </a>

          </div>

        </div>

      </section>

      <div className="sectionTitle">

        <h2>
          ภาพรวมการใช้พลังงาน
        </h2>

        <div className="overviewTools">

          <select
            className="select"
            value={overviewMonth}
            onChange={(e) =>
              setOverviewMonth(
                e.target.value
              )
            }
          >

            {months.map(
              (month) => (
                <option
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              )
            )}

          </select>

          <select
            className="select"
            value={overviewYear}
            onChange={(e) =>
              setOverviewYear(
                e.target.value
              )
            }
          >

            {availableYears.map(
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

      </div>

      <section className="summaryGrid">

        {overviewSummary.map(
          (item) => (

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

          )
        )}

      </section>

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
                  value={item.energy_key}
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
            onChange={(e) => {

              setViewType(
                e.target.value
              );

              setSelectedMonth("");
              setSelectedYear("");

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

      <section className="selectionCard">

        {viewType === "monthly" && (
          <>

            <div className="selectionGroup">

              <label className="selectionLabel">
                Month
              </label>

              <select
                className="select"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Months
                </option>

                {months.map(
                  (month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="selectionGroup">

              <label className="selectionLabel">
                Year
              </label>

              <select
                className="select"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Years
                </option>

                {availableYears.map(
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

          </>
        )}

        {viewType === "yearly" && (

          <div className="selectionGroup">

            <label className="selectionLabel">
              Year
            </label>

            <select
              className="select"
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
            >

              <option value="">
                All Years
              </option>

              {availableYears.map(
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

        )}

      </section>

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
                  name="Energy Consumption"
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
                  name="Energy Consumption"
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>

      </section>

      <div className="sectionTitle">

        <h2>
          เปรียบเทียบการใช้พลังงาน
        </h2>

      </div>

      <section className="filterCard">

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

              setComparisonMonth("");

            }}
          >

            <option value="monthly">
              Monthly
            </option>

            <option value="yearly">
              Yearly
            </option>

          </select>

        </div>

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

      <section className="selectionCard">

        {comparisonType ===
          "monthly" && (
          <>

            <div className="selectionGroup">

              <label className="selectionLabel">
                Month
              </label>

              <select
                className="select"
                value={comparisonMonth}
                onChange={(e) =>
                  setComparisonMonth(
                    e.target.value
                  )
                }
              >

                <option value="">
                  All Months
                </option>

                {months.map(
                  (month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="selectionGroup">

              <label className="selectionLabel">
                Year 1
              </label>

              <select
                className="select"
                value={comparisonYear}
                onChange={(e) =>
                  setComparisonYear(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Year
                </option>

                {availableYears.map(
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

            <div className="selectionGroup">

              <label className="selectionLabel">
                Year 2
              </label>

              <select
                className="select"
                value={comparisonYear2}
                onChange={(e) =>
                  setComparisonYear2(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Year
                </option>

                {availableYears.map(
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

          </>
        )}

        {comparisonType ===
          "yearly" && (
          <>

            <div className="selectionGroup">

              <label className="selectionLabel">
                Year 1
              </label>

              <select
                className="select"
                value={comparisonYear}
                onChange={(e) =>
                  setComparisonYear(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Year
                </option>

                {availableYears.map(
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

            <div className="selectionGroup">

              <label className="selectionLabel">
                Year 2
              </label>

              <select
                className="select"
                value={comparisonYear2}
                onChange={(e) =>
                  setComparisonYear2(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Year
                </option>

                {availableYears.map(
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

          </>
        )}

      </section>

      <section className="chartCard">

        <div className="chartHeader">

          <h2>
            {comparisonType ===
            "monthly"
              ? "Monthly Energy Consumption Comparison"
              : "Yearly Energy Consumption Comparison"}
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

          {comparisonData.length ===
          0 ? (

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

                {comparisonType ===
                  "yearly" ? (

                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Energy Consumption"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                ) : (

                  comparisonYearsToShow.map(
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
                  )

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

                {comparisonType ===
                  "yearly" ? (

                  <Bar
                    dataKey="value"
                    name="Energy Consumption"
                  />

                ) : (

                  comparisonYearsToShow.map(
                    (year) => (

                      <Bar
                        key={year}
                        dataKey={`year_${year}`}
                        name={year}
                      />

                    )
                  )

                )}

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>

      </section>

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
                        : "Yearly"}
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

      <div className="footer">
        Factory Energy Management System
      </div>

    </div>

  </main>
</>
```

);
}
