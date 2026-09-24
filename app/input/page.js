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
  const now = new Date();

  const [energyTypes, setEnergyTypes] = useState([]);
  const [periodType, setPeriodType] = useState("daily");

  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

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

  function getPeriodText() {
    if (periodType === "daily") {
      return `${selectedDay} ${MONTHS[selectedMonth - 1]} ${selectedYear}`;
    }

    if (periodType === "monthly") {
      return `${MONTHS[selectedMonth - 1]} ${selectedYear}`;
    }

    return `ปี ${selectedYear}`;
  }

  function handleValueChange(id, value) {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      {/* TOP HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white shadow-sm">
              ⚡
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                เพิ่มข้อมูลพลังงาน
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                บันทึกข้อมูลการใช้พลังงานของโรงงาน
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-right">
              <div className="text-xs text-slate-400">
                ช่วงเวลาที่เลือก
              </div>

              <div className="text-sm font-bold text-blue-600">
                {getPeriodText()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-8 py-6">
        {/* PERIOD */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center">
            {/* TITLE */}
            <div className="border-b border-slate-100 px-6 py-5 xl:w-[250px] xl:border-b-0 xl:border-r">
              <div className="text-base font-bold text-slate-900">
                ช่วงเวลาข้อมูล
              </div>

              <div className="mt-1 text-xs text-slate-400">
                เลือกช่วงเวลาที่ต้องการบันทึก
              </div>
            </div>

            {/* PERIOD TYPE */}
            <div className="flex gap-2 p-4 xl:w-[390px]">
              {[
                ["daily", "รายวัน"],
                ["monthly", "รายเดือน"],
                ["yearly", "รายปี"],
              ].map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPeriodType(type)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition ${
                    periodType === type
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* DATE */}
            <div className="grid flex-1 gap-3 border-t border-slate-100 p-4 sm:grid-cols-3 xl:border-l xl:border-t-0">
              {periodType === "daily" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    วัน
                  </label>

                  <select
                    value={selectedDay}
                    onChange={(e) =>
                      setSelectedDay(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
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
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    เดือน
                  </label>

                  <select
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
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
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  ปี
                </label>

                <select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white"
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ENERGY HEADER */}
        <div className="mt-7 mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              การใช้พลังงาน
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              กรอกปริมาณการใช้พลังงานของแต่ละประเภท
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
            {energyTypes.length} ประเภทพลังงาน
          </div>
        </div>

        {/* ENERGY CARDS */}
        {loading ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : energyTypes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <div className="text-4xl">⚡</div>

            <div className="mt-3 font-bold text-slate-800">
              ยังไม่มีประเภทพลังงาน
            </div>

            <div className="mt-1 text-sm text-slate-500">
              กรุณาเพิ่มประเภทพลังงานก่อน
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {energyTypes.map((energy, index) => (
              <div
                key={energy.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      {index % 4 === 0
                        ? "⚡"
                        : index % 4 === 1
                        ? "🔥"
                        : index % 4 === 2
                        ? "💧"
                        : "🏭"}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-base font-bold text-slate-800">
                        {energy.energy_name}
                      </div>

                      <div className="mt-0.5 truncate text-xs text-slate-400">
                        {energy.energy_key || "Energy"}
                      </div>
                    </div>
                  </div>

                  <div className="ml-2 shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                    {energy.unit}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="relative">
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-16 text-lg font-bold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {energy.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NOTE + SAVE */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                หมายเหตุ
              </label>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม เช่น หยุดเครื่องจักรบางส่วน, มีการซ่อมบำรุง..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="min-w-[230px] rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "กำลังบันทึก..."
                : "💾  บันทึกข้อมูลพลังงาน"}
            </button>
          </div>
        </section>

        {/* MESSAGE */}
        {message && (
          <div
            className={`mt-4 rounded-xl px-5 py-3.5 text-sm font-semibold ${
              message.includes("เรียบร้อย")
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="h-5" />
      </main>
    </div>
  );
}
