"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

function getIcon(name = "") {
  const value = name.toLowerCase();

  if (
    value.includes("electric") ||
    value.includes("ไฟฟ้า")
  ) {
    return "⚡";
  }

  if (
    value.includes("solar") ||
    value.includes("แสงอาทิตย์")
  ) {
    return "☀️";
  }

  if (
    value.includes("gas") ||
    value.includes("ก๊าซ")
  ) {
    return "🔥";
  }

  if (
    value.includes("fuel") ||
    value.includes("oil") ||
    value.includes("น้ำมัน")
  ) {
    return "⛽";
  }

  if (
    value.includes("steam") ||
    value.includes("ไอน้ำ")
  ) {
    return "♨️";
  }

  if (
    value.includes("water") ||
    value.includes("น้ำ")
  ) {
    return "💧";
  }

  if (value.includes("wind")) {
    return "🌬️";
  }

  if (value.includes("battery")) {
    return "🔋";
  }

  if (value.includes("biomass")) {
    return "🌱";
  }

  if (value.includes("heat")) {
    return "🌡️";
  }

  return "🔋";
}

function generateEnergyKey(name) {
  const random = Math.random()
    .toString(36)
    .substring(2, 8);

  return `custom_${Date.now()}_${random}`;
}

export default function SettingsPage() {
  const [energyTypes, setEnergyTypes] = useState([]);

  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadEnergyTypes();
  }, []);

  async function loadEnergyTypes() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("energy_types")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setError("ไม่สามารถโหลดหัวข้อพลังงานได้");
    } else {
      setEnergyTypes(data || []);
    }

    setLoading(false);
  }

  // ================================
  // เพิ่มหัวข้อ
  // ================================
  async function addEnergyType() {
    setMessage("");
    setError("");

    if (!newName.trim()) {
      setError("กรุณากรอกชื่อหัวข้อ");
      return;
    }

    if (!newUnit.trim()) {
      setError("กรุณากรอกหน่วย");
      return;
    }

    setSaving(true);

    try {
      const energyKey = generateEnergyKey(
        newName.trim()
      );

      const { error } = await supabase
        .from("energy_types")
        .insert([
          {
            energy_key: energyKey,
            energy_name: newName.trim(),
            unit: newUnit.trim(),
            is_active: true,
          },
        ]);

      if (error) {
        console.error(error);
        setError("ไม่สามารถเพิ่มหัวข้อได้");
        return;
      }

      setNewName("");
      setNewUnit("");

      setMessage(
        `เพิ่มหัวข้อ "${newName.trim()}" เรียบร้อยแล้ว`
      );

      await loadEnergyTypes();
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเพิ่มหัวข้อ");
    } finally {
      setSaving(false);
    }
  }

  // ================================
  // แก้ไขชื่อหัวข้อ / หน่วย
  // ================================
  async function updateEnergyType(id, field, value) {
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("energy_types")
      .update({
        [field]: value,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("ไม่สามารถแก้ไขข้อมูลได้");
      return;
    }

    setEnergyTypes((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );

    setMessage("บันทึกการแก้ไขเรียบร้อยแล้ว");
  }

  // ================================
  // เปิด / ปิดหัวข้อ
  // ================================
  async function toggleEnergyType(item) {
    setMessage("");
    setError("");

    const newStatus = !item.is_active;

    const { error } = await supabase
      .from("energy_types")
      .update({
        is_active: newStatus,
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      setError("ไม่สามารถเปลี่ยนสถานะได้");
      return;
    }

    setEnergyTypes((current) =>
      current.map((energy) =>
        energy.id === item.id
          ? {
              ...energy,
              is_active: newStatus,
            }
          : energy
      )
    );

    setMessage(
      newStatus
        ? `เปิดใช้งาน "${item.energy_name}" แล้ว`
        : `ปิดใช้งาน "${item.energy_name}" แล้ว`
    );
  }

  // ================================
  // ลบหัวข้อ + ลบข้อมูลของหัวข้อนั้น
  // ================================
  async function deleteEnergyType(item) {
    setMessage("");
    setError("");

    const confirmed = window.confirm(
      `⚠️ ยืนยันการลบหัวข้อ\n\n` +
        `"${item.energy_name}"\n\n` +
        `ข้อมูลของหัวข้อนี้ที่บันทึกไว้ทั้งหมดจะถูกลบด้วย\n` +
        `และไม่สามารถกู้คืนได้\n\n` +
        `ต้องการลบหรือไม่?`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      // --------------------------------
      // 1. ลบค่าพลังงานของหัวข้อนี้ทั้งหมด
      // --------------------------------
      const { error: valuesError } = await supabase
        .from("energy_values")
        .delete()
        .eq("energy_type_id", item.id);

      if (valuesError) {
        console.error(valuesError);

        setError(
          `ไม่สามารถลบข้อมูลของ "${item.energy_name}" ได้`
        );

        return;
      }

      // --------------------------------
      // 2. ลบหัวข้อพลังงาน
      // --------------------------------
      const { error: typeError } = await supabase
        .from("energy_types")
        .delete()
        .eq("id", item.id);

      if (typeError) {
        console.error(typeError);

        setError(
          `ลบข้อมูลพลังงานแล้ว แต่ไม่สามารถลบหัวข้อ "${item.energy_name}" ได้`
        );

        return;
      }

      // --------------------------------
      // 3. ลบออกจากหน้าจอ
      // --------------------------------
      setEnergyTypes((current) =>
        current.filter(
          (energy) => energy.id !== item.id
        )
      );

      setMessage(
        `ลบ "${item.energy_name}" และข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว`
      );
    } catch (err) {
      console.error(err);

      setError("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="energy-settings-page">
      <div className="settings-container">

        {/* ================================
            HEADER
        ================================= */}
        <div className="page-header">
          <div>
            <div className="page-title">
              ➕ เพิ่มข้อมูล
            </div>

            <div className="page-subtitle">
              เพิ่ม แก้ไข และจัดการหัวข้อพลังงาน
            </div>
          </div>
        </div>

        {/* ================================
            MESSAGE
        ================================= */}
        {message && (
          <div className="message success">
            {message}
          </div>
        )}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {/* ================================
            ADD NEW ENERGY TYPE
        ================================= */}
        <div className="card add-card">
          <div className="card-title">
            <span>➕</span>
            เพิ่มหัวข้อใหม่
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>
                ชื่อหัวข้อ
              </label>

              <input
                type="text"
                value={newName}
                onChange={(e) =>
                  setNewName(e.target.value)
                }
                placeholder="เช่น Compressed Air"
              />
            </div>

            <div className="form-group">
              <label>
                หน่วย
              </label>

              <input
                type="text"
                value={newUnit}
                onChange={(e) =>
                  setNewUnit(e.target.value)
                }
                placeholder="เช่น Nm³"
              />
            </div>

            <div className="button-area">
              <button
                className="add-button"
                onClick={addEnergyType}
                disabled={saving}
              >
                {saving
                  ? "กำลังดำเนินการ..."
                  : "➕ เพิ่มหัวข้อ"}
              </button>
            </div>

          </div>
        </div>

        {/* ================================
            ENERGY TYPE LIST
        ================================= */}
        <div className="card">

          <div className="card-header-row">
            <div>
              <div className="card-title">
                <span>📋</span>
                หัวข้อพลังงาน
              </div>

              <div className="card-description">
                จัดการชื่อ หน่วย สถานะ และลบหัวข้อ
              </div>
            </div>

            <div className="count-badge">
              {energyTypes.length} หัวข้อ
            </div>
          </div>

          {loading ? (
            <div className="loading">
              กำลังโหลดข้อมูล...
            </div>
          ) : energyTypes.length === 0 ? (
            <div className="empty">
              ยังไม่มีหัวข้อพลังงาน
            </div>
          ) : (
            <div className="energy-list">

              {energyTypes.map((item) => (
                <div
                  className="energy-row"
                  key={item.id}
                >

                  {/* ICON */}
                  <div className="energy-icon">
                    {getIcon(item.energy_name)}
                  </div>

                  {/* NAME */}
                  <div className="energy-info">
                    <div className="energy-name">
                      <input
                        type="text"
                        value={item.energy_name}
                        onChange={(e) => {
                          setEnergyTypes((current) =>
                            current.map((energy) =>
                              energy.id === item.id
                                ? {
                                    ...energy,
                                    energy_name:
                                      e.target.value,
                                  }
                                : energy
                            )
                          );
                        }}
                        onBlur={(e) =>
                          updateEnergyType(
                            item.id,
                            "energy_name",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="energy-key">
                      {item.energy_key}
                    </div>
                  </div>

                  {/* UNIT */}
                  <div className="unit-area">
                    <label>
                      หน่วย
                    </label>

                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => {
                        setEnergyTypes((current) =>
                          current.map((energy) =>
                            energy.id === item.id
                              ? {
                                  ...energy,
                                  unit: e.target.value,
                                }
                              : energy
                          )
                        );
                      }}
                      onBlur={(e) =>
                        updateEnergyType(
                          item.id,
                          "unit",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* STATUS */}
                  <div className="status-area">

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={() =>
                          toggleEnergyType(item)
                        }
                      />

                      <span className="slider"></span>
                    </label>

                    <span
                      className={
                        item.is_active
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {item.is_active
                        ? "ใช้งาน"
                        : "ปิดใช้งาน"}
                    </span>

                  </div>

                  {/* DELETE */}
                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteEnergyType(item)
                    }
                    disabled={saving}
                    title="ลบหัวข้อและข้อมูลทั้งหมด"
                  >
                    🗑️
                    <span>ลบ</span>
                  </button>

                </div>
              ))}

            </div>
          )}
        </div>

        {/* ================================
            WARNING
        ================================= */}
        <div className="warning-box">
          <div className="warning-icon">
            ⚠️
          </div>

          <div>
            <div className="warning-title">
              หมายเหตุเกี่ยวกับการลบหัวข้อ
            </div>

            <div className="warning-text">
              เมื่อกดลบหัวข้อ ระบบจะลบข้อมูลค่าพลังงาน
              ของหัวข้อนั้นที่บันทึกไว้ทั้งหมดด้วย
              เช่น ลบหัวข้อ Gas ข้อมูล Gas รายวัน
              รายเดือน และรายปีจะถูกลบทั้งหมด
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .energy-settings-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 32px;
        }

        .settings-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
        }

        .page-subtitle {
          margin-top: 6px;
          color: #64748b;
          font-size: 15px;
        }

        .message {
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        .success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }

        .card-description {
          margin-top: 5px;
          color: #64748b;
          font-size: 13px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 220px auto;
          gap: 16px;
          align-items: end;
          margin-top: 22px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group label,
        .unit-area label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }

        input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          padding: 11px 13px;
          outline: none;
          font-size: 14px;
          background: white;
          color: #0f172a;
          transition: 0.2s;
        }

        input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .button-area {
          display: flex;
        }

        .add-button {
          border: none;
          background: #2563eb;
          color: white;
          padding: 12px 20px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .add-button:hover {
          background: #1d4ed8;
        }

        .add-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .card-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .count-badge {
          background: #eff6ff;
          color: #2563eb;
          border-radius: 999px;
          padding: 7px 13px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .loading,
        .empty {
          padding: 40px 20px;
          text-align: center;
          color: #64748b;
        }

        .energy-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .energy-row {
          display: grid;
          grid-template-columns: 52px minmax(180px, 1fr) 180px 150px 90px;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .energy-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          font-size: 23px;
        }

        .energy-info {
          min-width: 0;
        }

        .energy-name input {
          font-weight: 700;
          background: white;
        }

        .energy-key {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 11px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .unit-area {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .status-area {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .switch {
          position: relative;
          width: 42px;
          height: 23px;
          display: inline-block;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          inset: 0;
          cursor: pointer;
          background: #cbd5e1;
          border-radius: 999px;
          transition: 0.2s;
        }

        .slider::before {
          content: "";
          position: absolute;
          width: 17px;
          height: 17px;
          left: 3px;
          top: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .switch input:checked + .slider {
          background: #2563eb;
        }

        .switch input:checked + .slider::before {
          transform: translateX(19px);
        }

        .status {
          font-size: 12px;
          font-weight: 700;
        }

        .status.active {
          color: #059669;
        }

        .status.inactive {
          color: #94a3b8;
        }

        .delete-button {
          border: 1px solid #fecaca;
          background: #fff1f2;
          color: #dc2626;
          border-radius: 9px;
          padding: 9px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .delete-button:hover {
          background: #fee2e2;
          border-color: #fca5a5;
        }

        .delete-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .warning-box {
          display: flex;
          gap: 13px;
          padding: 17px 19px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 12px;
          color: #92400e;
        }

        .warning-icon {
          font-size: 22px;
        }

        .warning-title {
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .warning-text {
          font-size: 13px;
          line-height: 1.7;
        }

        @media (max-width: 1000px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .button-area {
            grid-column: 1 / -1;
          }

          .energy-row {
            grid-template-columns: 48px 1fr 140px;
          }

          .status-area {
            grid-column: 2;
          }

          .delete-button {
            grid-column: 3;
            grid-row: 2;
          }
        }

        @media (max-width: 700px) {
          .energy-settings-page {
            padding: 20px 15px;
          }

          .page-title {
            font-size: 25px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .button-area {
            grid-column: auto;
          }

          .energy-row {
            grid-template-columns: 48px 1fr;
          }

          .unit-area,
          .status-area,
          .delete-button {
            grid-column: 1 / -1;
          }

          .delete-button {
            width: 100%;
          }

          .card-header-row {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
