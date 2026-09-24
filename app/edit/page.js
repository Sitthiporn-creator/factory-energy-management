"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function EditPage() {
  const [records, setRecords] = useState([]);
  const [energyTypes, setEnergyTypes] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [periodType, setPeriodType] = useState("daily");
  const [recordDate, setRecordDate] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [note, setNote] = useState("");

  const [values, setValues] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: types, error: typeError } = await supabase
      .from("energy_types")
      .select("*")
      .eq("is_active", true)
      .order("id");

    const { data: dataRows, error: dataError } = await supabase
      .from("energy_data")
      .select("*")
      .order("record_date", { ascending: false });

    if (typeError) {
      console.error(typeError);
      alert("ไม่สามารถโหลดหัวข้อพลังงานได้");
    }

    if (dataError) {
      console.error(dataError);
      alert("ไม่สามารถโหลดข้อมูลได้");
    }

    setEnergyTypes(types || []);
    setRecords(dataRows || []);

    setLoading(false);
  }

  async function selectRecord(record) {
    setSelectedId(record.id);
    setSelectedRecord(record);

    setPeriodType(record.period_type || "daily");
    setRecordDate(record.record_date || "");
    setPeriodLabel(record.period_label || "");
    setNote(record.note || "");

    const { data, error } = await supabase
      .from("energy_values")
      .select("*")
      .eq("energy_data_id", record.id);

    if (error) {
      console.error(error);
      alert("ไม่สามารถโหลดค่าพลังงานได้");
      return;
    }

    const newValues = {};

    energyTypes.forEach((type) => {
      const found = data?.find(
        (item) => item.energy_type_id === type.id
      );

      if (found) {
        newValues[type.id] = found.value;
      } else {
        // รองรับข้อมูลเก่า
        newValues[type.id] =
          record[type.energy_key] ?? 0;
      }
    });

    setValues(newValues);
  }

  function updateValue(typeId, value) {
    setValues((prev) => ({
      ...prev,
      [typeId]: value,
    }));
  }

  async function saveData() {
    if (!selectedRecord) {
      alert("กรุณาเลือกข้อมูลที่ต้องการแก้ไข");
      return;
    }

    if (!recordDate) {
      alert("กรุณาเลือกวันที่");
      return;
    }

    setSaving(true);

    try {
      // -----------------------------
      // 1. UPDATE energy_data
      // -----------------------------
      const { error: dataError } = await supabase
        .from("energy_data")
        .update({
          record_date: recordDate,
          period_type: periodType,
          period_label: periodLabel || null,
          note: note || null,
        })
        .eq("id", selectedRecord.id);

      if (dataError) {
        throw dataError;
      }

      // -----------------------------
      // 2. UPDATE / INSERT energy_values
      // -----------------------------
      for (const type of energyTypes) {
        const value = Number(values[type.id]) || 0;

        const { data: existing } = await supabase
          .from("energy_values")
          .select("id")
          .eq("energy_data_id", selectedRecord.id)
          .eq("energy_type_id", type.id)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("energy_values")
            .update({
              value,
            })
            .eq("id", existing.id);

          if (error) {
            throw error;
          }
        } else {
          const { error } = await supabase
            .from("energy_values")
            .insert([
              {
                energy_data_id: selectedRecord.id,
                energy_type_id: type.id,
                value,
              },
            ]);

          if (error) {
            throw error;
          }
        }
      }

      alert("✅ แก้ไขข้อมูลสำเร็จ");

      await loadData();

      setSelectedId(null);
      setSelectedRecord(null);
      setValues({});
    } catch (error) {
      console.error(error);
      alert("❌ ไม่สามารถบันทึกข้อมูลได้");
    }

    setSaving(false);
  }

  async function deleteData(id) {
    const confirmDelete = confirm(
      "ต้องการลบข้อมูลรายการนี้ใช่หรือไม่?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("energy_data")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("❌ ไม่สามารถลบข้อมูลได้");
      return;
    }

    alert("✅ ลบข้อมูลสำเร็จ");

    if (selectedId === id) {
      setSelectedId(null);
      setSelectedRecord(null);
      setValues({});
    }

    await loadData();
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <h1>กำลังโหลดข้อมูล...</h1>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>
            ✏️ แก้ไขข้อมูลพลังงาน
          </h1>

          <p style={{ color: "#666" }}>
            เลือกรายการด้านล่างเพื่อแก้ไขข้อมูล
          </p>

          <a href="/">
            <button style={buttonStyle}>
              ← กลับ Dashboard
            </button>
          </a>
        </div>

        {/* LIST */}
        <div style={cardStyle}>
          <h2>รายการข้อมูล</h2>

          {records.length === 0 ? (
            <p style={{ color: "#777" }}>
              ยังไม่มีข้อมูล
            </p>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>วันที่</th>
                    <th style={thStyle}>รูปแบบ</th>
                    <th style={thStyle}>หมายเหตุ</th>
                    <th style={thStyle}>จัดการ</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td style={tdStyle}>
                        {record.record_date}
                      </td>

                      <td style={tdStyle}>
                        {record.period_type === "monthly"
                          ? "รายเดือน"
                          : record.period_type === "yearly"
                          ? "รายปี"
                          : "รายวัน"}
                      </td>

                      <td style={tdStyle}>
                        {record.note || "-"}
                      </td>

                      <td style={tdStyle}>
                        <button
                          style={{
                            ...smallButtonStyle,
                            marginRight: "8px",
                          }}
                          onClick={() =>
                            selectRecord(record)
                          }
                        >
                          ✏️ แก้ไข
                        </button>

                        <button
                          style={deleteButtonStyle}
                          onClick={() =>
                            deleteData(record.id)
                          }
                        >
                          🗑️ ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* EDIT FORM */}
        {selectedRecord && (
          <div style={cardStyle}>
            <h2>แก้ไขข้อมูล</h2>

            {/* PERIOD */}
            <div style={gridStyle}>

              <div>
                <label>รูปแบบ</label>

                <select
                  value={periodType}
                  onChange={(e) =>
                    setPeriodType(e.target.value)
                  }
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

              <div>
                <label>
                  {periodType === "daily"
                    ? "วันที่"
                    : periodType === "monthly"
                    ? "วันที่อ้างอิง"
                    : "วันที่อ้างอิง"}
                </label>

                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) =>
                    setRecordDate(e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label>ป้ายกำกับช่วงเวลา</label>

                <input
                  type="text"
                  value={periodLabel}
                  onChange={(e) =>
                    setPeriodLabel(e.target.value)
                  }
                  placeholder="เช่น 2026-09 หรือ 2026"
                  style={inputStyle}
                />
              </div>

            </div>

            {/* ENERGY */}
            <h3
              style={{
                marginTop: "30px",
                marginBottom: "15px",
              }}
            >
              ⚡ ข้อมูลพลังงาน
            </h3>

            <div style={gridStyle}>
              {energyTypes.map((type) => (
                <div key={type.id}>
                  <label>
                    {type.energy_name} ({type.unit})
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={values[type.id] ?? ""}
                    onChange={(e) =>
                      updateValue(
                        type.id,
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* NOTE */}
            <div style={{ marginTop: "20px" }}>
              <label>หมายเหตุ</label>

              <textarea
                value={note}
                onChange={(e) =>
                  setNote(e.target.value)
                }
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            {/* BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <button
                style={saveButtonStyle}
                onClick={saveData}
                disabled={saving}
              >
                {saving
                  ? "กำลังบันทึก..."
                  : "💾 บันทึกการแก้ไข"}
              </button>

              <button
                style={cancelButtonStyle}
                onClick={() => {
                  setSelectedId(null);
                  setSelectedRecord(null);
                  setValues({});
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

/* -----------------------------
   STYLE
----------------------------- */

const pageStyle = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
};

const cardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "25px",
  marginBottom: "20px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: "7px",
  padding: "11px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "15px",
};

const buttonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "9px",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};

const smallButtonStyle = {
  padding: "8px 13px",
  border: "none",
  borderRadius: "7px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "8px 13px",
  border: "none",
  borderRadius: "7px",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
};

const saveButtonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "9px",
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
};

const cancelButtonStyle = {
  padding: "12px 20px",
  border: "none",
  borderRadius: "9px",
  background: "#6b7280",
  color: "white",
  cursor: "pointer",
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  background: "#f8fafc",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
};
