"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
type EnergyType = {
  id: number;
  energy_key: string;
  energy_name: string;
  unit: string;
  is_active: boolean;
};

export default function AddDataPage() {
  const now = new Date();

  const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);

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

  const [values, setValues] = useState<Record<number, string>>({});

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  // ==============================
  // โหลดประเภทพลังงาน
  // ==============================
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

  // ==============================
  // จำนวนวันในเดือน
  // ==============================
  function getDaysInMonth(
    year: number,
    month: number
  ) {
    return new Date(year, month, 0).getDate();
  }

  // ==============================
  // ถ้าเปลี่ยนเดือนแล้ววันเกิน
  // ให้ปรับวันอัตโนมัติ
  // ==============================
  useEffect(() => {
    const maxDay = getDaysInMonth(
      selectedYear,
      selectedMonth
    );

    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedYear, selectedMonth]);

  // ==============================
  // สร้างข้อมูลช่วงเวลาที่เลือก
  // ==============================
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

    // รายวัน
    if (periodType === "daily") {
      const date =
        year + "-" + month + "-" + day;

      return {
        recordDate: date,
        periodLabel: date,
      };
    }

    // รายเดือน
    if (periodType === "monthly") {
      const monthValue =
        year + "-" + month;

      return {
        recordDate:
          year + "-" + month + "-01",

        periodLabel: monthValue,
      };
    }

    // รายปี
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

  // ==============================
  // เมื่อเปลี่ยนประเภทช่วงเวลา
  // ==============================
  function handlePeriodTypeChange(
    type: string
  ) {
    setPeriodType(type);
    setMessage("");
  }

  // ==============================
  // เปลี่ยนค่าพลังงาน
  // ==============================
  function handleValueChange(
    energyTypeId: number,
    value: string
  ) {
    setValues((prev) => ({
      ...prev,
      [energyTypeId]: value,
    }));
  }

  // ==============================
  // บันทึกข้อมูล
  // ==============================
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

    // ตรวจสอบว่ามีการกรอกข้อมูลหรือไม่
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
      // ==============================
      // สร้างรายการ energy_data
      // ==============================
      const { data: energyData, error: dataError } =
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

      if (dataError) {
        console.error(dataError);

        setMessage(
          "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
        );

        setSaving(false);
        return;
      }

      // ==============================
      // เตรียมข้อมูล energy_values
      // ==============================
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

      // ==============================
      // บันทึกค่า energy_values
      // ==============================
      if (energyValues.length > 0) {
        const {
          error: valuesError,
        } = await supabase
          .from("energy_values")
          .insert(energyValues);

        if (valuesError) {
          console.error(valuesError);

          // ลบ energy_data ที่สร้างไว้
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

      // ==============================
      // สำเร็จ
      // ==============================
      setMessage(
        "บันทึกข้อมูลเรียบร้อยแล้ว"
      );

      // ล้างค่า
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

  // ==============================
  // ปี
  // ==============================
  const years = [];

  for (
    let year = 2000;
    year <= 2100;
    year++
  ) {
    years.push(year);
  }

  // ==============================
  // เดือน
  // ==============================
  const months = [
    {
      value: 1,
      label: "มกราคม",
    },
    {
      value: 2,
      label: "กุมภาพันธ์",
    },
    {
      value: 3,
      label: "มีนาคม",
    },
    {
      value: 4,
      label: "เมษายน",
    },
    {
      value: 5,
      label: "พฤษภาคม",
    },
    {
      value: 6,
      label: "มิถุนายน",
    },
    {
      value: 7,
      label: "กรกฎาคม",
    },
    {
      value: 8,
      label: "สิงหาคม",
    },
    {
      value: 9,
      label: "กันยายน",
    },
    {
      value: 10,
      label: "ตุลาคม",
    },
    {
      value: 11,
      label: "พฤศจิกายน",
    },
    {
      value: 12,
      label: "ธันวาคม",
    },
  ];

  // ==============================
  // วัน
  // ==============================
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

  // ==============================
  // UI
  // ==============================
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-5xl">

        {/* หัวข้อ */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            เพิ่มข้อมูลพลังงาน
          </h1>

          <p className="mt-1 text-gray-500">
            บันทึกข้อมูลการใช้พลังงานเข้าสู่ระบบ
          </p>
        </div>

        {/* ช่วงเวลา */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            เลือกช่วงเวลาที่บันทึก
          </h2>

          {/* ประเภทช่วงเวลา */}
          <div className="mb-5">

            <label className="mb-2 block text-sm font-medium text-gray-700">
              ประเภทข้อมูล
            </label>

            <select
              value={periodType}
              onChange={(e) =>
                handlePeriodTypeChange(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 md:w-72"
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

          {/* เลือกปี */}
          <div className="grid gap-4 md:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ปี
              </label>

              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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

            {/* เดือน */}
            {periodType !== "yearly" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  เดือน
                </label>

                <select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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

            {/* วัน */}
            {periodType === "daily" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  วัน
                </label>

                <select
                  value={selectedDay}
                  onChange={(e) =>
                    setSelectedDay(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
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

          {/* ช่วงเวลาที่เลือก */}
          <div className="mt-5 rounded-xl bg-blue-50 p-4">

            <div className="text-sm text-gray-500">
              ช่วงเวลาที่กำลังบันทึก
            </div>

            <div className="mt-1 text-xl font-bold text-blue-700">
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

        {/* ข้อมูลพลังงาน */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-semibold text-gray-800">
            ข้อมูลการใช้พลังงาน
          </h2>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              กำลังโหลดข้อมูล...
            </div>
          ) : energyTypes.length === 0 ? (
            <div className="rounded-xl bg-yellow-50 p-5 text-yellow-800">
              ยังไม่มีประเภทพลังงาน
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {energyTypes.map(
                (energy) => (
                  <div
                    key={energy.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >

                    <label className="mb-2 block font-medium text-gray-800">
                      {energy.energy_name}
                    </label>

                    <div className="flex items-center gap-3">

                      <input
                        type="number"
                        step="any"
                        value={
                          values[
                            energy.id
                          ] ?? ""
                        }
                        onChange={(e) =>
                          handleValueChange(
                            energy.id,
                            e.target.value
                          )
                        }
                        placeholder="กรอกค่า"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                      />

                      <span className="min-w-[60px] text-sm text-gray-500">
                        {energy.unit}
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* หมายเหตุ */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">

          <label className="mb-2 block text-lg font-semibold text-gray-800">
            หมายเหตุ
          </label>

          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            rows={4}
            placeholder="ระบุหมายเหตุเพิ่มเติม (ถ้ามี)"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
          />

        </div>

        {/* ข้อความแจ้งเตือน */}
        {message && (
          <div
            className={`mb-5 rounded-xl p-4 ${
              message.includes("เรียบร้อย")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* ปุ่มบันทึก */}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "กำลังบันทึก..."
            : "บันทึกข้อมูล"}
        </button>

      </div>
    </div>
  );
}
