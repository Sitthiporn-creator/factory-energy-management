"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function Home() {
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

    const { error } = await supabase.from("energy_data").insert([
      {
        record_date: form.record_date,
        electricity: Number(form.electricity) || 0,
        solar: Number(form.solar) || 0,
        gas: Number(form.gas) || 0,
        fuel: Number(form.fuel) || 0,
        steam: Number(form.steam) || 0,
        water: Number(form.water) || 0,
        note: form.note,
      },
    ]);

    if (error) {
      setMessage("❌ บันทึกไม่สำเร็จ: " + error.message);
      return;
    }

    setMessage("✅ บันทึกข้อมูลสำเร็จ");

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
    <main>
      <h1>Factory Energy Management</h1>
      <p>ระบบจัดการพลังงานโรงงาน</p>

      <h2>บันทึกข้อมูลพลังงาน</h2>

      <form onSubmit={saveData}>
        <div>
          <label>วันที่</label>
          <br />
          <input
            type="date"
            name="record_date"
            value={form.record_date}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>ไฟฟ้า (kWh)</label>
          <br />
          <input
            type="number"
            name="electricity"
            value={form.electricity}
            onChange={handleChange}
            placeholder="เช่น 12500"
          />
        </div>

        <br />

        <div>
          <label>Solar</label>
          <br />
          <input
            type="number"
            name="solar"
            value={form.solar}
            onChange={handleChange}
            placeholder="เช่น 3500"
          />
        </div>

        <br />

        <div>
          <label>Gas</label>
          <br />
          <input
            type="number"
            name="gas"
            value={form.gas}
            onChange={handleChange}
            placeholder="เช่น 500"
          />
        </div>

        <br />

        <div>
          <label>น้ำมัน</label>
          <br />
          <input
            type="number"
            name="fuel"
            value={form.fuel}
            onChange={handleChange}
            placeholder="เช่น 200"
          />
        </div>

        <br />

        <div>
          <label>Steam</label>
          <br />
          <input
            type="number"
            name="steam"
            value={form.steam}
            onChange={handleChange}
            placeholder="เช่น 1000"
          />
        </div>

        <br />

        <div>
          <label>น้ำ</label>
          <br />
          <input
            type="number"
            name="water"
            value={form.water}
            onChange={handleChange}
            placeholder="เช่น 800"
          />
        </div>

        <br />

        <div>
          <label>หมายเหตุ</label>
          <br />
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="รายละเอียดเพิ่มเติม"
          />
        </div>

        <br />

        <button type="submit">
          บันทึกข้อมูล
        </button>
      </form>

      <p>{message}</p>
    </main>
  );
}
