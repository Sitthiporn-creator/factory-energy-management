"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

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

const years = Array.from(
{ length: 101 },
(_, index) => String(2000 + index)
);

export default function InputPage() {
const [energyTypes, setEnergyTypes] = useState([]);
const [periodType, setPeriodType] = useState("monthly");

// เดือน / ปี
const [selectedMonth, setSelectedMonth] = useState("");
const [selectedYear, setSelectedYear] = useState("");

const [values, setValues] = useState({});
const [note, setNote] = useState("");

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");

useEffect(() => {
loadEnergyTypes();
}, []);

async function loadEnergyTypes() {
setLoading(true);

```
const { data, error } = await supabase
  .from("energy_types")
  .select("*")
  .eq("is_active", true)
  .order("id");

if (error) {
  setMessage("❌ โหลดหัวข้อไม่สำเร็จ: " + error.message);
  setLoading(false);
  return;
}

setEnergyTypes(data || []);

const initialValues = {};

(data || []).forEach((item) => {
  initialValues[item.id] = "";
});

setValues(initialValues);
setLoading(false);
```

}

function changeValue(id, value) {
setValues((current) => ({
...current,
[id]: value,
}));
}

function getRecordDate() {
if (periodType === "monthly") {
if (!selectedMonth || !selectedYear) {
return "";
}

```
  return selectedYear + "-" + selectedMonth + "-01";
}

if (periodType === "yearly") {
  if (!selectedYear) {
    return "";
  }

  return selectedYear + "-01-01";
}

return "";
```

}

function getPeriodLabel() {
if (periodType === "monthly") {
if (!selectedMonth || !selectedYear) {
return "";
}

```
  return selectedYear + "-" + selectedMonth;
}

if (periodType === "yearly") {
  if (!selectedYear) {
    return "";
  }

  return selectedYear;
}

return "";
```

}

async function saveData(e) {
e.preventDefault();

```
const finalRecordDate = getRecordDate();
const finalPeriodLabel = getPeriodLabel();

if (!finalRecordDate || !finalPeriodLabel) {
  if (periodType === "monthly") {
    setMessage("⚠️ กรุณาเลือก เดือน และปี");
  } else {
    setMessage("⚠️ กรุณาเลือกปี");
  }

  return;
}

setSaving(true);
setMessage("กำลังบันทึก...");

// 1. สร้างรายการหลัก
const { data: energyData, error: energyError } =
  await supabase
    .from("energy_data")
    .insert([
      {
        record_date: finalRecordDate,
        period_type: periodType,
        period_label: finalPeriodLabel,
        note: note,
      },
    ])
    .select()
    .single();

if (energyError) {
  setMessage(
    "❌ บันทึกข้อมูลหลักไม่สำเร็จ: " +
      energyError.message
  );

  setSaving(false);
  return;
}

// 2. เตรียมค่าพลังงาน
const energyValues = energyTypes.map((item) => ({
  energy_data_id: energyData.id,
  energy_type_id: item.id,
  value: Number(values[item.id]) || 0,
}));

// 3. บันทึกค่าพลังงาน
const { error: valuesError } = await supabase
  .from("energy_values")
  .insert(energyValues);

if (valuesError) {
  setMessage(
    "⚠️ สร้างรายการแล้ว แต่บันทึกค่าพลังงานไม่สำเร็จ: " +
      valuesError.message
  );

  setSaving(false);
  return;
}

setMessage("✅ บันทึกข้อมูลสำเร็จ");

// ล้างข้อมูล
setNote("");

const emptyValues = {};

energyTypes.forEach((item) => {
  emptyValues[item.id] = "";
});

setValues(emptyValues);

// หลังบันทึกรายเดือน
// เลื่อนไปเดือนถัดไปอัตโนมัติ
// โดยปีคงเดิม
if (periodType === "monthly") {
  const currentMonth = Number(selectedMonth);

  let nextMonth = currentMonth + 1;

  if (nextMonth > 12) {
    nextMonth = 1;
  }

  setSelectedMonth(
    String(nextMonth).padStart(2, "0")
  );
}

// รายปีไม่เปลี่ยนปี
if (periodType === "yearly") {
  setSelectedYear(selectedYear);
}

setSaving(false);
```

}

// เปลี่ยนประเภทข้อมูล
function changePeriodType(type) {
setPeriodType(type);

```
// ล้างเฉพาะตัวเลือกช่วงเวลา
setSelectedMonth("");
setSelectedYear("");
```

}

if (loading) {
return ( <main style={pageStyle}> <div style={cardStyle}> <h1>📝 บันทึกข้อมูลพลังงาน</h1> <p>กำลังโหลดหัวข้อพลังงาน...</p> </div> </main>
);
}

return ( <main style={pageStyle}>
<div style={{ maxWidth: "1000px", margin: "auto" }}> <div style={cardStyle}>

```
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            📝 บันทึกข้อมูลพลังงาน
          </h1>

          <p style={{ color: "#666" }}>
            กรอกข้อมูลการใช้พลังงานของโรงงาน
          </p>
        </div>

        <a
          href="/"
          style={{
            textDecoration: "none",
            background: "#64748b",
            color: "white",
            padding: "10px 18px",
            borderRadius: "8px",
          }}
        >
          ← Dashboard
        </a>
      </div>

      <form onSubmit={saveData}>

        {/* ประเภทช่วงเวลา */}
        <div style={{ marginTop: "30px" }}>
          <label style={labelStyle}>
            ประเภทข้อมูล
          </label>

          <select
            value={periodType}
            onChange={(e) =>
              changePeriodType(e.target.value)
            }
            style={inputStyle}
          >
            <option value="monthly">
              รายเดือน
            </option>

            <option value="yearly">
              รายปี
            </option>
          </select>
        </div>

        {/* ช่วงเวลา */}
        <div style={{ marginTop: "20px" }}>

          {/* ================= รายเดือน ================= */}
          {periodType === "monthly" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, 1fr)",
                gap: "15px",
              }}
            >
              {/* เดือน */}
              <div>
                <label style={labelStyle}>
                  เดือน
                </label>

                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(e.target.value)
                  }
                  style={inputStyle}
                  required
                >
                  <option value="">
                    เลือกเดือน
                  </option>

                  {months.map((month) => (
                    <option
                      key={month.value}
                      value={month.value}
                    >
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* ปี */}
              <div>
                <label style={labelStyle}>
                  ปี
                </label>

                <select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(e.target.value)
                  }
                  style={inputStyle}
                  required
                >
                  <option value="">
                    เลือกปี
                  </option>

                  {years.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ================= รายปี ================= */}
          {periodType === "yearly" && (
            <div>
              <label style={labelStyle}>
                ปี
              </label>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(e.target.value)
                }
                style={inputStyle}
                required
              >
                <option value="">
                  เลือกปี
                </option>

                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* หัวข้อพลังงาน */}
        <div style={{ marginTop: "30px" }}>
          <h2>
            ⚡ ข้อมูลพลังงาน
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {energyTypes.map((item) => (
              <div key={item.id}>
                <label style={labelStyle}>
                  {item.energy_name} ({item.unit})
                </label>

                <input
                  type="number"
                  step="any"
                  value={values[item.id] || ""}
                  onChange={(e) =>
                    changeValue(
                      item.id,
                      e.target.value
                    )
                  }
                  placeholder="กรอกจำนวน"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        {/* หมายเหตุ */}
        <div style={{ marginTop: "30px" }}>
          <label style={labelStyle}>
            หมายเหตุ
          </label>

          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            rows="4"
            placeholder="รายละเอียดเพิ่มเติม"
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        {/* ปุ่ม */}
        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: "30px",
            padding: "13px 30px",
            border: "none",
            borderRadius: "8px",
            background: saving
              ? "#94a3b8"
              : "#2563eb",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: saving
              ? "not-allowed"
              : "pointer",
          }}
        >
          {saving
            ? "กำลังบันทึก..."
            : "💾 บันทึกข้อมูล"}
        </button>

      </form>

      {/* Message */}
      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "8px",
            background: "#f1f5f9",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}

    </div>
  </div>
</main>
);
}

const pageStyle = {
minHeight: "100vh",
background: "#f4f7fb",
padding: "30px",
fontFamily: "Arial, sans-serif",
};

const cardStyle = {
background: "white",
padding: "30px",
borderRadius: "16px",
boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const labelStyle = {
display: "block",
fontWeight: "bold",
marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
  boxSizing: "border-box",
};
