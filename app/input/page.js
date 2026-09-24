```js
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

const years = Array.from({ length: 11 }, (_, i) => 2025 + i);

export default function InputPage() {
  const [energyTypes, setEnergyTypes] = useState([]);
  const [periodType, setPeriodType] = useState("monthly");

  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState("2025");

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
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("ไม่สามารถโหลดข้อมูลพลังงานได้");
    } else {
      setEnergyTypes(data || []);
    }

    setLoading(false);
  }

  function changeValue(energyTypeId, value) {
    setValues((prev) => ({
      ...prev,
      [energyTypeId]: value,
    }));
  }

  function getRecordDate() {
    if (periodType === "monthly") {
      return selectedYear + "-" + selectedMonth + "-01";
    }

    return selectedYear + "-01-01";
  }

  function getPeriodLabel() {
    if (periodType === "monthly") {
      return selectedYear + "-" + selectedMonth;
    }

    return selectedYear;
  }

  function changePeriodType(type) {
    setPeriodType(type);
    setMessage("");
    setValues({});
    setNote("");
  }

  async function saveData() {
    if (energyTypes.length === 0) {
      setMessage("ยังไม่มีรายการพลังงาน");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const recordDate = getRecordDate();
      const periodLabel = getPeriodLabel();

      const { data: energyData, error: energyDataError } = await supabase
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

      if (energyDataError) {
        console.error(energyDataError);
        setMessage("บันทึกข้อมูลหลักไม่สำเร็จ");
        setSaving(false);
        return;
      }

      const energyValues = energyTypes
        .filter((item) => {
          const value = values[item.id];
          return value !== undefined && value !== "" && !isNaN(Number(value));
        })
        .map((item) => ({
          energy_data_id: energyData.id,
          energy_type_id: item.id,
          value: Number(values[item.id]),
        }));

      if (energyValues.length > 0) {
        const { error: valuesError } = await supabase
          .from("energy_values")
          .insert(energyValues);

        if (valuesError) {
          console.error(valuesError);
          setMessage("บันทึกค่าพลังงานไม่สำเร็จ");
          setSaving(false);
          return;
        }
      }

      setMessage("บันทึกข้อมูลสำเร็จ");

      setValues({});
      setNote("");

      // หลังบันทึกรายเดือน → เลื่อนไปเดือนถัดไป
      // โดยปีจะไม่เปลี่ยน
      if (periodType === "monthly") {
        const currentMonth = Number(selectedMonth);

        let nextMonth = currentMonth + 1;

        if (nextMonth > 12) {
          nextMonth = 1;
        }

        setSelectedMonth(String(nextMonth).padStart(2, "0"));
      }

      // รายปี → คงปีเดิม
      if (periodType === "yearly") {
        setSelectedYear(selectedYear);
      }
    } catch (error) {
      console.error(error);
      setMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: 40,
          fontFamily: "Arial, sans-serif",
        }}
      >
        กำลังโหลดข้อมูล...
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
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            marginBottom: 8,
            fontSize: 32,
          }}
        >
```
