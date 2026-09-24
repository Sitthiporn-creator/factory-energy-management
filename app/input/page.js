"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AddDataPage() {
  const now = new Date();

  const [energyTypes, setEnergyTypes] = useState([]);
  const [periodType, setPeriodType] = useState("daily");

  const [selectedYear, setSelectedYear] = useState(
    now.getFullYear()
  );

  const [selectedMonth, setSelectedMonth] = useState(
    now.getMonth() + 1
  );

  const [selectedDay, setSelectedDay] = useState(
    now.getDate()
  );

  const [values, setValues] = useState({});
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ==========================================
  // โหลดประเภทพลังงาน
  // ==========================================
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

  // ==========================================
  // จำนวนวันในเดือน
  // ==========================================
  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  useEffect(() => {
    const maxDay = getDaysInMonth(
      selectedYear,
      selectedMonth
    );

    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedYear, selectedMonth]);

  // ==========================================
  // วันที่ที่จะบันทึก
  // ==========================================
  function getPeriodData() {
    const year = String(selectedYear);

    const month = String(selectedMonth).padStart(
      2,
      "0"
    );

    const day = String(selectedDay).padStart(
      2,
      "0"
    );

    if (periodType === "daily") {
      const date =
        year + "-" + month + "-" + day;

      return {
        recordDate: date,
        periodLabel: date,
      };
    }

    if (periodType === "monthly") {
      return {
        recordDate:
          year + "-" + month + "-01",
        periodLabel:
          year + "-" + month,
      };
    }

    if (periodType === "yearly") {
      return {
        recordDate:
          year + "-01-01",
        periodLabel: year,
      };
    }

    return {
      recordDate: "",
      periodLabel: "",
    };
  }

  // ==========================================
  // เปลี่ยนประเภท
  // ==========================================
  function handlePeriodTypeChange(type) {
    setPeriodType(type);
    setMessage("");
  }

  // ==========================================
  // เปลี่ยนค่าพลังงาน
  // ==========================================
  function handleValueChange(
    energyTypeId,
    value
  ) {
    setValues((prev) => ({
      ...prev,
      [energyTypeId]: value,
    }));
  }

  // ==========================================
  // บันทึก
  // ==========================================
  async function handleSave() {
    setMessage("");

    const {
      recordDate,
      periodLabel,
    } = getPeriodData();

    if (!recordDate || !periodLabel) {
      setMessage("กรุณาเลือกช่วงเวลา");
      return;
    }

    const hasValue = energyTypes.some(
      (energy) => {
        const value = values[energy.id];

        return (
          value !== undefined &&
          value !== "" &&
          !isNaN(Number(value))
        );
      }
    );

    if (!hasValue) {
      setMessage(
        "กรุณากรอกข้อมูลพลังงานอย่างน้อย 1 รายการ"
      );
      return;
    }

    setSaving(true);

    try {
      // สร้าง energy_data
      const {
        data: energyData,
        error: dataError,
      } = await supabase
        .from("energy_data")
        .insert({
          record_date: recordDate,
          period_type: periodType,
          period_label: periodLabel,
          note: note || null,
        })
        .select()
        .single();

      if (dataError) {
        console.error(dataError);

        setMessage(
          "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
        );

        setSaving(false);
        return;
      }

      // เตรียมค่า
      const energyValues = energyTypes
        .filter((energy) => {
          const value = values[energy.id];

          return (
            value !== undefined &&
            value !== "" &&
            !isNaN(Number(value))
          );
        })
        .map((energy) => ({
          energy_data_id: energyData.id,
          energy_type_id: energy.id,
          value: Number(values[energy.id]),
        }));

      // บันทึกค่า
      if (energyValues.length > 0) {
        const {
          error: valuesError,
        } = await supabase
          .from("energy_values")
          .insert(energyValues);

        if (valuesError) {
          console.error(valuesError);

          await supabase
            .from("energy_data")
            .delete()
            .eq("id", energyData.id);

          setMessage(
            "เกิดข้อผิดพลาดในการบันทึกค่าพลังงาน"
          );

          setSaving(false);
          return;
        }
      }

      setMessage(
        "บันทึกข้อมูลเรียบร้อยแล้ว"
      );

      setValues({});
      setNote("");

    } catch (error) {
      console.error(error);

      setMessage(
        "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );
    }

    setSaving(false);
  }

  // ==========================================
  // ปี
  // ==========================================
  const years = [];

  for (
    let year = 2000;
    year <= 2100;
    year++
  ) {
    years.push(year);
  }

  // ==========================================
  // เดือน
  // ==========================================
  const months = [
    { value: 1, label: "มกราคม" },
    { value: 2, label: "กุมภาพันธ์" },
    { value: 3, label: "มีนาคม" },
    { value: 4, label: "เมษายน" },
    { value: 5, label: "พฤษภาคม" },
    { value: 6, label: "มิถุนายน" },
    { value: 7, label: "กรกฎาคม" },
    { value: 8, label: "สิงหาคม" },
    { value: 9, label: "กันยายน" },
    { value: 10, label: "ตุลาคม" },
    { value: 11, label: "พฤศจิกายน" },
    { value: 12, label: "ธันวาคม" },
  ];

  // ==========================================
  // วัน
  // ==========================================
  const daysInMonth = getDaysInMonth(
    selectedYear,
    selectedMonth
  );

  const days = [];

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    days.push(day);
  }

  const periodData = getPeriodData();

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= HEADER ================= */}
      <div className="border-b bg-white">

        <div className="mx-auto max-w-6xl px-6 py-6">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg shadow-blue-200">
              ⚡
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                เพิ่มข้อมูลพลังงาน
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                บันทึกและจัดการข้อมูลการใช้พลังงานของโรงงาน
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <main className="mx-auto max-w-6xl px-6 py-8">

        {/* ================= PERIOD CARD ================= */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                📅
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  ช่วงเวลาที่บันทึก
                </h2>

                <p className="text-sm text-slate-500">
                  เลือกช่วงเวลาของข้อมูลพลังงาน
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            {/* TYPE */}
            <div className="mb-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ประเภทข้อมูล
              </label>

              <div className="grid grid-cols-3 gap-3">

                <button
                  type="button"
                  onClick={() =>
                    handlePeriodTypeChange(
                      "daily"
                    )
                  }
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    periodType === "daily"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  <div className="text-lg">
                    📆
                  </div>

                  <div className="mt-1 font-bold">
                    รายวัน
                  </div>

                  <div className="text-xs opacity-70">
                    บันทึกตามวันที่
                  </div>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePeriodTypeChange(
                      "monthly"
                    )
                  }
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    periodType === "monthly"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  <div className="text-lg">
                    📊
                  </div>

                  <div className="mt-1 font-bold">
                    รายเดือน
                  </div>

                  <div className="text-xs opacity-70">
                    บันทึกตามเดือน
                  </div>

                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePeriodTypeChange(
                      "yearly"
                    )
                  }
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    periodType === "yearly"
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >

                  <div className="text-lg">
                    📈
                  </div>

                  <div className="mt-1 font-bold">
                    รายปี
                  </div>

                  <div className="text-xs opacity-70">
                    บันทึกตามปี
                  </div>

                </button>

              </div>

            </div>

            {/* DATE SELECT */}
            <div className="grid gap-4 md:grid-cols-3">

              {/* YEAR */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  ปี
                </label>

                <select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    เดือน
                  </label>

                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    วันที่
                  </label>

                  <select
                    value={selectedDay}
                    onChange={(e) =>
                      setSelectedDay(
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >

                    {days.map((day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        วันที่ {day}
                      </option>
                    ))}

                  </select>

                </div>
              )}

            </div>

            {/* SELECTED PERIOD */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white shadow-lg shadow-blue-100">

              <div className="text-sm text-blue-100">
                ช่วงเวลาที่เลือก
              </div>

              <div className="mt-1 text-2xl font-bold">
                {periodType === "daily" &&
                  "รายวัน "}

                {periodType === "monthly" &&
                  "รายเดือน "}

                {periodType === "yearly" &&
                  "รายปี "}

                {periodData.periodLabel}
              </div>

            </div>

          </div>

        </section>

        {/* ================= ENERGY CARD ================= */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg">
                ⚡
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  ข้อมูลการใช้พลังงาน
                </h2>

                <p className="text-sm text-slate-500">
                  กรอกปริมาณการใช้พลังงาน
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            {loading ? (

              <div className="py-12 text-center">

                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                <p className="text-sm text-slate-500">
                  กำลังโหลดข้อมูล...
                </p>

              </div>

            ) : energyTypes.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

                <div className="text-4xl">
                  ⚡
                </div>

                <p className="mt-3 font-semibold text-slate-700">
                  ยังไม่มีประเภทพลังงาน
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  กรุณาเพิ่มประเภทพลังงานก่อน
                </p>

              </div>

            ) : (

              <div className="grid gap-4 md:grid-cols-2">

                {energyTypes.map(
                  (energy) => {

                    const hasValue =
                      values[energy.id] !==
                        undefined &&
                      values[energy.id] !== "";

                    return (
                      <div
                        key={energy.id}
                        className={`rounded-2xl border p-5 transition ${
                          hasValue
                            ? "border-blue-300 bg-blue-50/40"
                            : "border-slate-200 bg-white"
                        }`}
                      >

                        <div className="mb-3 flex items-center justify-between">

                          <div>

                            <div className="font-bold text-slate-800">
                              {energy.energy_name}
                            </div>

                            <div className="mt-0.5 text-xs text-slate-500">
                              {energy.energy_key}
                            </div>

                          </div>

                          <div className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {energy.unit}
                          </div>

                        </div>

                        <div className="relative">

                          <input
                            type="number"
                            step="any"
                            value={
                              values[
                                energy.id
                              ] || ""
                            }
                            onChange={(e) =>
                              handleValueChange(
                                energy.id,
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-20 text-lg font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                            {energy.unit}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

        {/* ================= NOTE ================= */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                📝
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  หมายเหตุ
                </h2>

                <p className="text-sm text-slate-500">
                  รายละเอียดเพิ่มเติมของข้อมูลชุดนี้
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            <textarea
              value={note}
              onChange={(e) =>
                setNote(e.target.value)
              }
              rows={4}
              placeholder="เช่น มีการหยุดเครื่องจักรบางส่วน, ปิดไลน์ผลิต, หรือรายละเอียดอื่น ๆ..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

          </div>

        </section>

        {/* ================= MESSAGE ================= */}
        {message && (

          <div
            className={`mb-5 flex items-center gap-3 rounded-2xl border p-4 ${
              message.includes("เรียบร้อย")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >

            <span className="text-xl">
              {message.includes("เรียบร้อย")
                ? "✓"
                : "!"}
            </span>

            <span className="font-medium">
              {message}
            </span>

          </div>

        )}

        {/* ================= SAVE ================= */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >

          {saving ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
              กำลังบันทึกข้อมูล...
            </>
          ) : (
            <>
              <span className="text-xl">
                💾
              </span>
              บันทึกข้อมูลพลังงาน
            </>
          )}

        </button>

        {/* Footer */}
        <div className="py-6 text-center text-xs text-slate-400">
          Factory Energy Management System
        </div>

      </main>

    </div>
  );
}
