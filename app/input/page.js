```jsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function InputPage() {
  const [energyTypes, setEnergyTypes] = useState([]);

  const [periodType, setPeriodType] = useState("daily");

  // ปี / เดือน / วันที่
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedDay, setSelectedDay] = useState(
    String(new Date().getDate()).padStart(2, "0")
  );

  const [values, setValues] = useState({});
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /* =========================================================
     LOAD ENERGY TYPES
  ========================================================= */

  useEffect(() => {
    loadEnergyTypes();
  }, []);

  async function loadEnergyTypes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("energy_types")
      .select("*")
      .eq("is_active", true)
      .order("id");

    if (error) {
      setMessage(
        "❌ โหลดหัวข้อไม่สำเร็จ: " + error.message
      );

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
  }

  /* =========================================================
     CHANGE ENERGY VALUE
  ========================================================= */

  function changeValue(id, value) {
    setValues((current) => ({
      ...current,
      [id]: value,
    }));
  }

  /* =========================================================
     GET PERIOD DATA
  ========================================================= */

  function getPeriodData() {
    const year = String(selectedYear);
    const month = String(selectedMonth).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");

    // รายวัน
    if (periodType === "daily") {
      const date = `${year}-${month}-${day}`;

      return {
        recordDate: date,
        periodLabel: date,
      };
    }

    // รายเดือน
    if (periodType === "monthly") {
      const monthValue = `${year}-${month}`;

      return {
        recordDate: `${year}-${month}-01`,
        periodLabel: monthValue,
      };
    }

    // รายปี
    if (periodType === "yearly") {
      return {
        recordDate: `${year}-01-01`,
        periodLabel: year,
      };
    }

    return {
      recordDate: "",
      periodLabel: "",
    };
  }

  /* =========================================================
     SAVE DATA
  ========================================================= */

  async function saveData(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("กำลังบันทึก...");

    try {
      const { recordDate, periodLabel } =
        getPeriodData();

      if (!recordDate || !periodLabel) {
        setMessage("⚠️ กรุณาเลือกช่วงเวลา");
        setSaving(false);
        return;
      }

      // 1. สร้างรายการหลัก
      const { data: energyData, error: energyError } =
        await supabase
          .from("energy_data")
          .insert([
            {
              record_date: recordDate,
              period_type: periodType,
              period_label: periodLabel,
              note: note || null,
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
      const { error: valuesError } =
        await supabase
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

      // ล้างค่าพลังงาน
      const emptyValues = {};

      energyTypes.forEach((item) => {
        emptyValues[item.id] = "";
      });

      setValues(emptyValues);
      setNote("");

    } catch (error) {
      console.error(error);

      setMessage(
        "❌ เกิดข้อผิดพลาด: " +
          error.message
      );
    }

    setSaving(false);
  }

  /* =========================================================
     YEARS
  ========================================================= */

  const years = [];

  for (
    let year = 2000;
    year <= 2100;
    year++
  ) {
    years.push(year);
  }

  /* =========================================================
     MONTHS
  ========================================================= */

  const months = [
    { value: "01", label: "มกราคม" },
    { value: "02", label: "กุมภาพันธ์" },
    { value: "03", label: "มีนาคม" },
    { value: "04", label: "เมษายน" },
    { value: "05", label: "พฤษภาคม" },
    { value: "06", label: "มิถุนายน" },
    { value: "07", label: "กรกฎาคม" },
    { value: "08", label: "สิงหาคม" },
    { value: "09", label: "กันยายน" },
    { value: "10", label: "ตุลาคม" },
    { value: "11", label: "พฤศจิกายน" },
    { value: "12", label: "ธันวาคม" },
  ];

  /* =========================================================
     DAYS
  ========================================================= */

  const daysInMonth = new Date(
    selectedYear,
    Number(selectedMonth),
    0
  ).getDate();

  const days = [];

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(
      String(day).padStart(2, "0")
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>📝 บันทึกข้อมูลพลังงาน</h1>
          <p>กำลังโหลดหัวข้อพลังงาน...</p>
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main style={pageStyle}>

      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
        }}
      >

        <div style={cardStyle}>

          {/* HEADER */}

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

            {/* =================================================
                PERIOD TYPE
            ================================================= */}

            <div style={{ marginTop: "30px" }}>

              <label style={labelStyle}>
                ประเภทข้อมูล
              </label>

              <select
                value={periodType}
                onChange={(e) => {
                  setPeriodType(e.target.value);
                }}
                style={inputStyle}
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

            {/* =================================================
                DATE SELECT
            ================================================= */}

            <div
              style={{
                marginTop: "20px",
                display: "grid",
                gridTemplateColumns:
                  periodType === "daily"
                    ? "1fr 1fr 1fr"
                    : "1fr 1fr",
                gap: "15px",
              }}
            >

              {/* YEAR */}

              <div>

                <label style={labelStyle}>
                  ปี
                </label>

                <select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(
                      Number(e.target.value)
                    )
                  }
                  style={inputStyle}
                >

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

              {/* MONTH */}

              {periodType !== "yearly" && (
                <div>

                  <label style={labelStyle}>
                    เดือน
                  </label>

                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

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
              )}

              {/* DAY */}

              {periodType === "daily" && (
                <div>

                  <label style={labelStyle}>
                    วันที่
                  </label>

                  <select
                    value={selectedDay}
                    onChange={(e) =>
                      setSelectedDay(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >

                    {days.map((day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        {Number(day)}
                      </option>
                    ))}

                  </select>

                </div>
              )}

            </div>

            {/* PREVIEW */}

            <div
              style={{
                marginTop: "15px",
                padding: "12px 15px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                color: "#1d4ed8",
                fontWeight: "bold",
              }}
            >

              📅 วันที่ข้อมูล:{" "}

              {periodType === "daily" &&
                `${selectedDay}/${selectedMonth}/${selectedYear}`}

              {periodType === "monthly" &&
                `${months.find(
                  (m) =>
                    m.value === selectedMonth
                )?.label} ${selectedYear}`}

              {periodType === "yearly" &&
                selectedYear}

            </div>

            {/* =================================================
                ENERGY DATA
            ================================================= */}

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
                      value={
                        values[item.id] || ""
                      }
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

            {/* =================================================
                NOTE
            ================================================= */}

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

            {/* =================================================
                SAVE
            ================================================= */}

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

          {/* MESSAGE */}

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

/* =========================================================
   STYLES
========================================================= */

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
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.06)",
};

cons
```
