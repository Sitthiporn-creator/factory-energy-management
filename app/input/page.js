"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const YEARS = Array.from({ length: 101 }, (_, i) => 2000 + i);

export default function InputPage() {
  const today = new Date();

  const [energyTypes, setEnergyTypes] = useState([]);
  const [periodType, setPeriodType] = useState("daily");

  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [values, setValues] = useState({});
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth,
    0
  ).getDate();

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );

  useEffect(() => {
    loadEnergyTypes();
  }, []);

  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  async function loadEnergyTypes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("energy_types")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("ไม่สามารถโหลดประเภทพลังงานได้");
    } else {
      setEnergyTypes(data || []);
    }

    setLoading(false);
  }

  function getPeriodData() {
    const year = String(selectedYear);
    const month = String(selectedMonth).padStart(2, "0");
    const day = String(selectedDay).padStart(2, "0");

    if (periodType === "daily") {
      const date = `${year}-${month}-${day}`;

      return {
        recordDate: date,
        periodLabel: date,
      };
    }

    if (periodType === "monthly") {
      return {
        recordDate: `${year}-${month}-01`,
        periodLabel: `${year}-${month}`,
      };
    }

    return {
      recordDate: `${year}-01-01`,
      periodLabel: year,
    };
  }

  function handleValueChange(id, value) {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  }

  function getSelectedPeriodText() {
    if (periodType === "daily") {
      return `${selectedDay} ${MONTHS[selectedMonth - 1]} ${selectedYear}`;
    }

    if (periodType === "monthly") {
      return `${MONTHS[selectedMonth - 1]} ${selectedYear}`;
    }

    return `${selectedYear}`;
  }

  async function handleSave() {
    setMessage("");

    const enteredValues = energyTypes.filter((energy) => {
      const value = values[energy.id];

      return (
        value !== undefined &&
        value !== "" &&
        !Number.isNaN(Number(value))
      );
    });

    if (enteredValues.length === 0) {
      setMessage("กรุณากรอกข้อมูลพลังงานอย่างน้อย 1 รายการ");
      return;
    }

    setSaving(true);

    try {
      const { recordDate, periodLabel } = getPeriodData();

      const { data: energyData, error: energyDataError } =
        await supabase
          .from("energy_data")
          .insert({
            record_date: recordDate,
            period_type: periodType,
            period_label: periodLabel,
            note: note || null,
          })
          .select()
          .single();

      if (energyDataError) {
        throw energyDataError;
      }

      const valueRows = enteredValues.map((energy) => ({
        energy_data_id: energyData.id,
        energy_type_id: energy.id,
        value: Number(values[energy.id]),
      }));

      const { error: valuesError } = await supabase
        .from("energy_values")
        .insert(valueRows);

      if (valuesError) {
        await supabase
          .from("energy_data")
          .delete()
          .eq("id", energyData.id);

        throw valuesError;
      }

      setValues({});
      setNote("");

      setMessage("บันทึกข้อมูลพลังงานเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      setMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl text-white shadow-lg">
              ⚡
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                เพิ่มข้อมูลพลังงาน
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                บันทึกข้อมูลการใช้พลังงานเข้าสู่ระบบ
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Period Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ช่วงเวลาข้อมูล
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                เลือกช่วงเวลาที่ต้องการบันทึกข้อมูล
              </p>
            </div>

            <div className="hidden rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 sm:block">
              {getSelectedPeriodText()}
            </div>
          </div>

          {/* Period Type */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-100 p-2">
            {[
              ["daily", "รายวัน", "ข้อมูลประจำวัน"],
              ["monthly", "รายเดือน", "ข้อมูลประจำเดือน"],
              ["yearly", "รายปี", "ข้อมูลประจำปี"],
            ].map(([type, title, subtitle]) => (
              <button
                key={type}
                type="button"
                onClick={() => setPeriodType(type)}
                className={`rounded-xl px-4 py-3 text-left transition ${
                  periodType === type
                    ? "bg-white shadow-md ring-1 ring-blue-100"
                    : "text-slate-500 hover:bg-white/70"
                }`}
              >
                <div
                  className={`text-sm font-bold ${
                    periodType === type
                      ? "text-blue-600"
                      : "text-slate-700"
                  }`}
                >
                  {title}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {subtitle}
                </div>
              </button>
            ))}
          </div>

          {/* Date Selectors */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {periodType === "daily" && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  วัน
                </label>

                <select
                  value={selectedDay}
                  onChange={(e) =>
                    setSelectedDay(Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(periodType === "daily" ||
              periodType === "monthly") && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  เดือน
                </label>

                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                ปี
              </label>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(Number(e.target.value))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 px-5 py-4">
            <div>
              <div className="text-xs font-medium text-slate-500">
                ช่วงเวลาที่เลือก
              </div>

              <div className="mt-1 text-base font-bold text-blue-700">
                {getSelectedPeriodText()}
              </div>
            </div>

            <div className="text-3xl">📅</div>
          </div>
        </section>

        {/* Energy Data */}
        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                ข้อมูลการใช้พลังงาน
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                กรอกค่าการใช้พลังงานของแต่ละประเภท
              </p>
            </div>

            <div className="text-sm text-slate-400">
              {energyTypes.length} รายการ
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">
                กำลังโหลดข้อมูล...
              </p>
            </div>
          ) : energyTypes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-4xl">⚡</div>

              <h3 className="mt-4 font-bold text-slate-800">
                ยังไม่มีประเภทพลังงาน
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                กรุณาเพิ่มประเภทพลังงานก่อนเริ่มบันทึกข้อมูล
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {energyTypes.map((energy, index) => (
                <div
                  key={energy.id}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                        {index % 4 === 0
                          ? "⚡"
                          : index % 4 === 1
                          ? "🔥"
                          : index % 4 === 2
                          ? "💧"
                          : "🏭"}
                      </div>

                      <div>
                        <div className="font-bold text-slate-800">
                          {energy.energy_name}
                        </div>

                        <div className="text-xs text-slate-400">
                          {energy.energy_key || "Energy"}
                        </div>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                      {energy.unit}
                    </span>
                  </div>

                  <div className="relative mt-5">
                    <input
                      type="number"
                      step="any"
                      value={values[energy.id] || ""}
                      onChange={(e) =>
                        handleValueChange(
                          energy.id,
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pr-20 text-xl font-bold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      {energy.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Note */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            หมายเหตุ
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            เพิ่มรายละเอียดเพิ่มเติมของข้อมูลชุดนี้ได้
          </p>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="เช่น มีการหยุดเครื่องจักรบางส่วน หรือมีเหตุการณ์ผิดปกติ..."
            className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </section>

        {/* Message */}
        {message && (
          <div
            className={`mt-6 rounded-2xl px-5 py-4 text-sm font-medium ${
              message.includes("เรียบร้อย")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Save */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? "กำลังบันทึก..." : "💾 บันทึกข้อมูลพลังงาน"}
          </button>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}
