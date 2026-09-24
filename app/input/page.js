```js
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

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

const years = Array.from(
  { length: 101 },
  (_, index) => String(2000 + index)
);

export default function InputPage() {
  const [energyTypes, setEnergyTypes] = useState([]);

  // เหลือเฉพาะรายเดือน / รายปี
  const [periodType, setPeriodType] =
    useState("monthly");

  // เดือน / ปี
  const [selectedMonth, setSelectedMonth] =
    useState("");

  const [selectedYear, setSelectedYear] =
    useState("");

  const [values, setValues] = useState({});
  const [note, setNote] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

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
        "❌ โหลดหัวข้อไม่สำเร็จ: " +
          error.message
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

  function changeValue(id, value) {
    setValues((current) => ({
      ...current,
      [id]: value,
    }));
  }

  // ==========================================
  // สร้างวันที่สำหรับบันทึก
  // ==========================================

  function getRecordDate() {
    // รายเดือน
    if (periodType === "monthly") {
      if (
        !selectedMonth ||
        !selectedYear
      ) {
        return "";
      }

      return `${selectedYear}-${selectedMonth}-01`;
    }

    // รายปี
    if (periodType === "yearly") {
      if (!selectedYear) {
        return "";
      }

      return `${selectedYear}-01-01`;
    }

    return "";
  }

  // ==========================================
  // สร้าง Period Label
  // ==========================================

  function getPeriodLabel() {
    // รายเดือน
    if (periodType === "monthly") {
      if (
        !selectedMonth ||
        !selectedYear
      ) {
        return "";
      }

      return `${selectedYear}-${selectedMonth}`;
    }

    // รายปี
    if (periodType === "yearly") {
      if (!selectedYear) {
        return "";
      }

      return selectedYear;
    }

    return "";
  }

  // ==========================================
  // บันทึกข้อมูล
  // ==========================================

  async function saveData(e) {
    e.preventDefault();

    const finalRecordDate =
      getRecordDate();

    const finalPeriodLabel =
      getPeriodLabel();

    // ตรวจสอบช่วงเวลา
    if (
      !finalRecordDate ||
      !finalPeriodLabel
    ) {
      if (periodType === "monthly") {
        setMessage(
          "⚠️ กรุณาเลือก เดือน และปี"
        );
      } else {
        setMessage(
          "⚠️ กรุณาเลือกปี"
        );
      }

      return;
    }

    setSaving(true);
    setMessage("กำลังบันทึก...");

    // ==========================================
    // 1. สร้างรายการหลัก
    // ==========================================

    const {
      data: energyData,
      error: energyError,
    } = await supabase
      .from("energy_data")
      .insert([
        {
          record_date:
            finalRecordDate,

          period_type:
            periodType,

          period_label:
            finalPeriodLabel,

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

    // ==========================================
    // 2. เตรียมค่าพลังงาน
    // ==========================================

    const energyValues =
      energyTypes.map((item) => ({
        energy_data_id:
          energyData.id,

        energy_type_id:
          item.id,

        value:
          Number(
            values[item.id]
          ) || 0,
      }));

    // ==========================================
    // 3. บันทึกค่าพลังงาน
    // ==========================================

    const {
      error: valuesError,
    } = await supabase
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

    // ==========================================
    // บันทึกสำเร็จ
    // ==========================================

    setMessage(
      "✅ บันทึกข้อมูลสำเร็จ"
    );

    // ล้างค่าพลังงาน
    const emptyValues = {};

    energyTypes.forEach((item) => {
      emptyValues[item.id] = "";
    });

    setValues(emptyValues);

    // ล้างหมายเหตุ
    setNote("");

    // ==========================================
    // รายเดือน
    //
    // หลังบันทึก:
    // มกราคม → กุมภาพันธ์
    // กุมภาพันธ์ → มีนาคม
    // ...
    // พฤศจิกายน → ธันวาคม
    // ธันวาคม → มกราคม
    //
    // ปีจะคงเดิมเสมอ
    // ==========================================

    if (periodType === "monthly") {
      const currentMonth =
        Number(selectedMonth);

      let nextMonth =
        currentMonth + 1;

      // ถ้าเป็นธันวาคม
      // กลับไปมกราคม
      // แต่ไม่เปลี่ยนปี
      if (nextMonth > 12) {
        nextMonth = 1;
      }

      setSelectedMonth(
        String(nextMonth).padStart(
          2,
          "0"
        )
      );
    }

    // ==========================================
    // รายปี
    //
    // ปีจะคงเดิม
    // ไม่เลื่อนไปปีถัดไป
    // ==========================================

    if (periodType === "yearly") {
      setSelectedYear(
        selectedYear
      );
    }

    setSaving(false);
  }

  // ==========================================
  // เปลี่ยนประเภทข้อมูล
  // ==========================================

  function changePeriodType(type) {
    setPeriodType(type);

    // ล้างช่วงเวลา
    setSelectedMonth("");
    setSelectedYear("");

    // ล้างข้อความ
    setMessage("");
  }

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>
            📝 บันทึกข้อมูลพลังงาน
          </h1>

          <p>
            กำลังโหลดหัวข้อพลังงาน...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // หน้าเว็บ
  // ==========================================

  return (
    <main style={pageStyle}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "auto",
        }}
      >
        <div style={cardStyle}>

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                }}
              >
                📝 บันทึกข้อมูลพลังงาน
              </h1>

              <p
                style={{
                  color: "#666",
                }}
              >
                กรอกข้อมูลการใช้พลังงานของโรงงาน
              </p>
            </div>
```
