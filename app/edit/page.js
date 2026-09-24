"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function EditPage() {
  const [energyData, setEnergyData] = useState([]);
  const [energyTypes, setEnergyTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [editForm, setEditForm] = useState({
    record_date: "",
    period_type: "daily",
    period_label: "",
    note: "",
  });

  const [editValues, setEditValues] = useState({});

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);

    const [dataResult, typeResult] = await Promise.all([
      supabase
        .from("energy_data")
        .select("*")
        .order("record_date", { ascending: false }),

      supabase
        .from("energy_types")
        .select("*")
        .eq("is_active", true)
        .order("id"),
    ]);

    if (dataResult.error) {
      setMessage(
        "❌ โหลดข้อมูลไม่สำเร็จ: " +
          dataResult.error.message
      );
      setLoading(false);
      return;
    }

    if (typeResult.error) {
      setMessage(
        "❌ โหลดหัวข้อไม่สำเร็จ: " +
          typeResult.error.message
      );
      setLoading(false);
      return;
    }

    setEnergyData(dataResult.data || []);
    setEnergyTypes(typeResult.data || []);

    setLoading(false);
  }

  function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function getPeriodText(item) {
    if (item.period_type === "monthly") {
      return item.period_label || "-";
    }

    if (item.period_type === "yearly") {
      return item.period_label || "-";
    }

    return formatDate(item.record_date);
  }

  /*
   * อ่านค่าพลังงาน
   *
   * ถ้าเป็นข้อมูลใหม่:
   * อ่านจาก energy_values
   *
   * ถ้าเป็นข้อมูลเก่า:
   * อ่านจาก column เดิมของ energy_data
   */
  function getOldValue(row, energyKey) {
    const value = row?.[energyKey];

    return Number(value) || 0;
  }

  async function startEdit(item) {
    setMessage("");
    setEditingId(item.id);

    setEditForm({
      record_date: item.record_date || "",
      period_type: item.period_type || "daily",
      period_label: item.period_label || "",
      note: item.note || "",
    });

    const initialValues = {};

    energyTypes.forEach((type) => {
      initialValues[type.id] = getOldValue(
        item,
        type.energy_key
      );
    });

    /*
     * โหลดค่าจาก energy_values
     */
    const { data, error } = await supabase
      .from("energy_values")
      .select("*")
      .eq("energy_data_id", item.id);

    if (!error && data) {
      data.forEach((valueItem) => {
        initialValues[valueItem.energy_type_id] =
          Number(valueItem.value) || 0;
      });
    }

    setEditValues(initialValues);
  }

  function changeEditValue(id, value) {
    setEditValues((current) => ({
      ...current,
      [id]: value,
    }));
  }

  function changeForm(field, value) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getRecordDate() {
    if (editForm.period_type === "daily") {
      return editForm.record_date;
    }

    if (editForm.period_type === "monthly") {
      if (!editForm.period_label) return "";

      return `${editForm.period_label}-01`;
    }

    if (editForm.period_type === "yearly") {
      if (!editForm.period_label) return "";

      return `${editForm.period_label}-01-01`;
    }

    return editForm.record_date;
  }

  async function saveEdit() {
    if (!editingId) return;

    setSaving(true);
    setMessage("กำลังบันทึก...");

    const recordDate = getRecordDate();

    /*
     * 1. อัปเดตข้อมูลหลัก
     */
    const { error: dataError } = await supabase
      .from("energy_data")
      .update({
        record_date: recordDate,
        period_type: editForm.period_type,
        period_label:
          editForm.period_label || null,
        note: editForm.note,
      })
      .eq("id", editingId);

    if (dataError) {
      setMessage(
        "❌ แก้ไขข้อมูลไม่สำเร็จ: " +
          dataError.message
      );
      setSaving(false);
      return;
    }

    /*
     * 2. อัปเดตค่าหัวข้อพลังงาน
     */
    for (const type of energyTypes) {
      const value =
        Number(editValues[type.id]) || 0;

      /*
       * หัวข้อเดิมที่มี column ใน energy_data
       *
       * อัปเดตเพื่อให้ข้อมูลเก่ายังใช้งานได้
       */
      const legacyColumns = [
        "electricity",
        "solar",
        "gas",
        "fuel",
        "steam",
        "water",
      ];

      if (legacyColumns.includes(type.energy_key)) {
        await supabase
          .from("energy_data")
          .update({
            [type.energy_key]: value,
          })
          .eq("id", editingId);
      }

      /*
       * ตรวจสอบว่ามี energy_values อยู่แล้วหรือไม่
       */
      const { data: existing } = await supabase
        .from("energy_values")
        .select("id")
        .eq("energy_data_id", editingId)
        .eq("energy_type_id", type.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("energy_values")
          .update({
            value: value,
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("energy_values")
          .insert([
            {
              energy_data_id: editingId,
              energy_type_id: type.id,
              value: value,
            },
          ]);
      }
    }

    setMessage("✅ แก้ไขข้อมูลสำเร็จ");

    setEditingId(null);

    await loadAllData();

    setSaving(false);
  }

  async function deleteData(id) {
    const confirmDelete = window.confirm(
      "ต้องการลบข้อมูลรายการนี้ใช่หรือไม่?"
    );

    if (!confirmDelete) return;

    setMessage("กำลังลบข้อมูล...");

    /*
     * energy_values จะถูกลบอัตโนมัติ
     * เนื่องจากตั้งค่า on delete cascade ไว้
     */
    const { error } = await supabase
      .from("energy_data")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(
        "❌ ลบข้อมูลไม่สำเร็จ: " +
          error.message
      );
      return;
    }

    setMessage("✅ ลบข้อมูลสำเร็จ");

    if (editingId === id) {
      setEditingId(null);
    }

    await loadAllData();
  }

  function cancelEdit() {
    setEditingId(null);
    setMessage("");
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h1>✏️ แก้ไขข้อมูล</h1>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>

        {/* Header */}
        <div
          style={{
            ...cardStyle,
            marginBottom: "20px",
          }}
        >
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
                ✏️ แก้ไขข้อมูลพลังงาน
              </h1>

              <p style={{ color: "#666" }}>
                แก้ไขหรือลบข้อมูลที่บันทึกไว้
              </p>
            </div>

            <a
              href="/"
              style={backButtonStyle}
            >
              ← Dashboard
            </a>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              ...cardStyle,
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}

        {/* Edit Form */}
        {editingId && (
          <div
            style={{
              ...cardStyle,
              marginBottom: "20px",
              border: "2px solid #f59e0b",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              ✏️ กำลังแก้ไขข้อมูล
            </h2>

            {/* ประเภท */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>
                ประเภทข้อมูล
              </label>

              <select
                value={editForm.period_type}
                onChange={(e) => {
                  changeForm(
                    "period_type",
                    e.target.value
                  );

                  changeForm(
                    "record_date",
                    ""
                  );

                  changeForm(
                    "period_label",
                    ""
                  );
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

            {/* เวลา */}
            <div style={{ marginBottom: "25px" }}>

              {editForm.period_type ===
                "daily" && (
                <>
                  <label style={labelStyle}>
                    วันที่
                  </label>

                  <input
                    type="date"
                    value={
                      editForm.record_date || ""
                    }
                    onChange={(e) =>
                      changeForm(
                        "record_date",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </>
              )}

              {editForm.period_type ===
                "monthly" && (
                <>
                  <label style={labelStyle}>
                    เดือน
                  </label>

                  <input
                    type="month"
                    value={
                      editForm.period_label || ""
                    }
                    onChange={(e) =>
                      changeForm(
                        "period_label",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </>
              )}

              {editForm.period_type ===
                "yearly" && (
                <>
                  <label style={labelStyle}>
                    ปี
                  </label>

                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={
                      editForm.period_label || ""
                    }
                    onChange={(e) =>
                      changeForm(
                        "period_label",
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </>
              )}
            </div>

            {/* พลังงาน */}
            <h3>⚡ ข้อมูลพลังงาน</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              {energyTypes.map((type) => (
                <div key={type.id}>
                  <label style={labelStyle}>
                    {type.energy_name} (
                    {type.unit})
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={
                      editValues[type.id] ?? ""
                    }
                    onChange={(e) =>
                      changeEditValue(
                        type.id,
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* หมายเหตุ */}
            <div style={{ marginTop: "25px" }}>
              <label style={labelStyle}>
                หมายเหตุ
              </label>

              <textarea
                value={editForm.note}
                onChange={(e) =>
                  changeForm(
                    "note",
                    e.target.value
                  )
                }
                rows="4"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </div>

            {/* ปุ่ม */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={saveEdit}
                disabled={saving}
                style={{
                  ...actionButtonStyle,
                  background: saving
                    ? "#94a3b8"
                    : "#16a34a",
                }}
              >
                💾 {saving
                  ? "กำลังบันทึก..."
                  : "บันทึกการแก้ไข"}
              </button>

              <button
                onClick={cancelEdit}
                style={{
                  ...actionButtonStyle,
                  background: "#64748b",
                }}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        )}

        {/* รายการข้อมูล */}
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>
            📋 รายการข้อมูล
          </h2>

          {energyData.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "#888",
              }}
            >
              ยังไม่มีข้อมูล
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      ช่วงเวลา
                    </th>

                    <th style={thStyle}>
                      รูปแบบ
                    </th>

                    {energyTypes.map((type) => (
                      <th
                        key={type.id}
                        style={thStyle}
                      >
                        {type.energy_name}
                        <br />
                        <span
                          style={{
                            fontWeight:
                              "normal",
                            fontSize: "12px",
                          }}
                        >
                          ({type.unit})
                        </span>
                      </th>
                    ))}

                    <th style={thStyle}>
                      หมายเหตุ
                    </th>

                    <th style={thStyle}>
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {energyData.map((item) => (
                    <tr key={item.id}>

                      <td style={tdStyle}>
                        {getPeriodText(item)}
                      </td>

                      <td style={tdStyle}>
                        {item.period_type ===
                        "monthly"
                          ? "รายเดือน"
                          : item.period_type ===
                            "yearly"
                          ? "รายปี"
                          : "รายวัน"}
                      </td>

                      {energyTypes.map(
                        (type) => (
                          <td
                            key={type.id}
                            style={tdStyle}
                          >
                            {getOldValue(
                              item,
                              type.energy_key
                            ).toLocaleString()}
                          </td>
                        )
                      )}

                      <td style={tdStyle}>
                        {item.note || "-"}
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent:
                              "center",
                          }}
                        >
                          <button
                            onClick={() =>
                              startEdit(item)
                            }
                            style={{
                              ...smallButtonStyle,
                              background:
                                "#f59e0b",
                            }}
                          >
                            ✏️
                          </button>

                          <button
                            onClick={() =>
                              deleteData(item.id)
                            }
                            style={{
                              ...smallButtonStyle,
                              background:
                                "#dc2626",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

/* =========================
   Styles
========================= */

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1400px",
  margin: "auto",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "16px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const backButtonStyle = {
  textDecoration: "none",
  background: "#64748b",
  color: "white",
  padding: "10px 18px",
  borderRadius: "8px",
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

const actionButtonStyle = {
  border: "none",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallButtonStyle = {
  border: "none",
  color: "white",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  background: "#f8fafc",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};
