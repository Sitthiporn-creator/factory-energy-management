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
  const [periodLabel, setPeriodLabel] = useState("");
  const [recordDate, setRecordDate] = useState("");
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
  }

  function changeValue(id, value) {
    setValues((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function getRecordDate() {
    if (periodType === "daily") {
      return recordDate;
    }

    if (periodType === "monthly") {
      if (!periodLabel) return "";

      return `${periodLabel}-01`;
    }

    if (periodType === "yearly") {
      if (!periodLabel) return "";

      return `${periodLabel}-01-01`;
    }

    return "";
  }

  async function saveData(e) {
    e.preventDefault();

    if (periodType === "daily" && !recordDate) {
      setMessage("⚠️ กรุณาเลือกวันที่");
      return;
    }

    if (
      (periodType === "monthly" || periodType === "yearly") &&
      !periodLabel
    ) {
      setMessage("⚠️ กรุณาเลือกช่วงเวลา");
      return;
    }

    setSaving(true);
    setMessage("กำลังบันทึก...");

    const finalRecordDate = getRecordDate();

    // 1. สร้างรายการหลัก
    const { data: energyData, error: energyError } = await supabase
      .from("energy_data")
      .insert([
        {
          record_date: finalRecordDate,
          period_type: periodType,
          period_label: periodLabel || null,
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
    setRecordDate("");
    setPeriodLabel("");
    setNote("");

    const emptyValues = {};

    energyTypes.forEach((item) => {
      emptyValues[item.id] = "";
    });

    setValues(emptyValues);

    setSaving(false);
  }

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

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        <div style={cardStyle}>

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
                onChange={(e) => {
                  setPeriodType(e.target.value);
                  setRecordDate("");
                  setPeriodLabel("");
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

            {/* ช่วงเวลา */}
            <div style={{ marginTop: "20px" }}>

              {periodType === "daily" && (
                <>
                  <label style={labelStyle}>
                    วันที่
                  </label>

                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) =>
                      setRecordDate(e.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </>
              )}

              {periodType === "monthly" && (
                <>
                  <label style={labelStyle}>
                    เดือน
                  </label>

                  <input
                    type="month"
                    value={periodLabel}
                    onChange={(e) =>
                      setPeriodLabel(e.target.value)
                    }
                    style={inputStyle}
                    required
                  />
                </>
              )}

              {periodType === "yearly" && (
                <>
                  <label style={labelStyle}>
                    ปี
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={periodLabel}
                    onChange={(e) =>
                      setPeriodLabel(e.target.value)
                    }
                    placeholder="เช่น 2026"
                    style={inputStyle}
                    required
                  />
                </>
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
