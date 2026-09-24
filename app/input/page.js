"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function InputPage() {
  const [form, setForm] = useState({
    record_date: "",
    electricity: "",
    solar: "",
    gas: "",
    fuel: "",
    steam: "",
    water: "",
    note: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function saveData(e) {
    e.preventDefault();

    setMessage("กำลังบันทึก...");

    const { error } = await supabase
      .from("energy_data")
      .insert([
        {
          record_date: form.record_date,
          electricity:
            Number(form.electricity) || 0,
          solar:
            Number(form.solar) || 0,
          gas:
            Number(form.gas) || 0,
          fuel:
            Number(form.fuel) || 0,
          steam:
            Number(form.steam) || 0,
          water:
            Number(form.water) || 0,
          note: form.note,
        },
      ]);

    if (error) {
      setMessage(
        "❌ บันทึกไม่สำเร็จ: " +
          error.message
      );
      return;
    }

    setMessage(
      "✅ บันทึกข้อมูลสำเร็จ"
    );

    setForm({
      record_date: "",
      electricity: "",
      solar: "",
      gas: "",
      fuel: "",
      steam: "",
      water: "",
      note: "",
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h1>
            📝 บันทึกข้อมูลพลังงาน
          </h1>

          <p style={{ color: "#666" }}>
            กรอกข้อมูลการใช้พลังงานของโรงงาน
          </p>

          <form onSubmit={saveData}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginTop: "25px",
              }}
            >
              <Input
                label="วันที่"
                name="record_date"
                type="date"
                value={form.record_date}
                onChange={handleChange}
                required
              />

              <Input
                label="⚡ ไฟฟ้า (kWh)"
                name="electricity"
                type="number"
                value={form.electricity}
                onChange={handleChange}
                placeholder="เช่น 12500"
              />

              <Input
                label="☀️ Solar (kWh)"
                name="solar"
                type="number"
                value={form.solar}
                onChange={handleChange}
                placeholder="เช่น 3500"
              />

              <Input
                label="🔥 Gas"
                name="gas"
                type="number"
                value={form.gas}
                onChange={handleChange}
                placeholder="เช่น 500"
              />

              <Input
                label="🛢️ น้ำมัน"
                name="fuel"
                type="number"
                value={form.fuel}
                onChange={handleChange}
                placeholder="เช่น 200"
              />

              <Input
                label="💨 Steam"
                name="steam"
                type="number"
                value={form.steam}
                onChange={handleChange}
                placeholder="เช่น 1000"
              />

              <Input
                label="💧 น้ำ"
                name="water"
                type="number"
                value={form.water}
                onChange={handleChange}
                placeholder="เช่น 800"
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                หมายเหตุ
              </label>

              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="รายละเอียดเพิ่มเติม"
                rows="4"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    "1px solid #ccc",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: "25px",
                padding:
                  "12px 30px",
                border: "none",
                borderRadius: "8px",
                background:
                  "#2563eb",
                color: "white",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              💾 บันทึกข้อมูล
            </button>

            {message && (
              <p
                style={{
                  marginTop: "20px",
                  fontWeight: "bold",
                }}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontWeight: "bold",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border:
            "1px solid #ccc",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
