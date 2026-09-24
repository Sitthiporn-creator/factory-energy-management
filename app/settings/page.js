"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function SettingsPage() {
  const [energyTypes, setEnergyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ฟอร์มเพิ่มหัวข้อ
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");

  useEffect(() => {
    loadEnergyTypes();
  }, []);

  // โหลดหัวข้อทั้งหมด
  async function loadEnergyTypes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("energy_types")
      .select("*")
      .order("id");

    if (error) {
      setMessage("❌ โหลดข้อมูลไม่สำเร็จ: " + error.message);
      setLoading(false);
      return;
    }

    setEnergyTypes(data || []);
    setLoading(false);
  }

  // เปลี่ยนค่าหัวข้อ
  function changeValue(id, field, value) {
    setEnergyTypes((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  // บันทึกหัวข้อเดิม
  async function saveItem(item) {
    setMessage("กำลังบันทึก...");

    const { error } = await supabase
      .from("energy_types")
      .update({
        energy_name: item.energy_name,
        unit: item.unit,
        is_active: item.is_active,
      })
      .eq("id", item.id);

    if (error) {
      setMessage("❌ บันทึกไม่สำเร็จ: " + error.message);
      return;
    }

    setMessage("✅ บันทึกหัวข้อสำเร็จ");

    // โหลดข้อมูลใหม่
    await loadEnergyTypes();
  }

  // สร้าง energy_key สำหรับหัวข้อใหม่
  function generateEnergyKey(name) {
    const random = Math.random()
      .toString(36)
      .substring(2, 8);

    return `custom_${Date.now()}_${random}`;
  }

  // เพิ่มหัวข้อใหม่
  async function addEnergyType() {
    if (!newName.trim()) {
      setMessage("⚠️ กรุณากรอกชื่อหัวข้อ");
      return;
    }

    if (!newUnit.trim()) {
      setMessage("⚠️ กรุณากรอกหน่วย");
      return;
    }

    setMessage("กำลังเพิ่มหัวข้อ...");

    const energyKey = generateEnergyKey(newName);

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
      setMessage("❌ เพิ่มหัวข้อไม่สำเร็จ: " + error.message);
      return;
    }

    setMessage("✅ เพิ่มหัวข้อสำเร็จ");

    // ล้างช่องกรอก
    setNewName("");
    setNewUnit("");

    // โหลดรายการใหม่
    await loadEnergyTypes();
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1>⚙️ ตั้งค่าพลังงาน</h1>
          <p>กำลังโหลด...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        <div style={cardStyle}>

          {/* หัวหน้า */}
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
                ⚙️ ตั้งค่าพลังงาน
              </h1>

              <p style={{ color: "#666" }}>
                จัดการชื่อหัวข้อ หน่วย และเพิ่มหัวข้อใหม่
              </p>
            </div>

            <a
              href="/"
              style={{
                textDecoration: "none",
                background: "#64748b",
                color: "white",
                padding: "10px 18px",
                borderRadius: "8px",
              }}
            >
              ← Dashboard
            </a>
          </div>

          {/* เพิ่มหัวข้อ */}
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              borderRadius: "12px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              ➕ เพิ่มหัวข้อ
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr auto",
                gap: "15px",
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>
                  ชื่อหัวข้อ
                </label>

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(e.target.value)
                  }
                  placeholder="เช่น พลังงานลม"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  หน่วย
                </label>

                <input
                  value={newUnit}
                  onChange={(e) =>
                    setNewUnit(e.target.value)
                  }
                  placeholder="เช่น kWh"
                  style={inputStyle}
                />
              </div>

              <button
                onClick={addEnergyType}
                style={{
                  ...buttonStyle,
                  background: "#16a34a",
                  height: "46px",
                  whiteSpace: "nowrap",
                }}
              >
                ➕ เพิ่มหัวข้อ
              </button>
            </div>
          </div>

          {/* รายการหัวข้อ */}
          <div style={{ marginTop: "30px" }}>
            <h2>📋 รายการหัวข้อ</h2>

            {energyTypes.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "15px",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr auto auto",
                    gap: "15px",
                    alignItems: "end",
                  }}
                >

                  {/* ชื่อ */}
                  <div>
                    <label style={labelStyle}>
                      ชื่อหัวข้อ
                    </label>

                    <input
                      value={item.energy_name}
                      onChange={(e) =>
                        changeValue(
                          item.id,
                          "energy_name",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  {/* หน่วย */}
                  <div>
                    <label style={labelStyle}>
                      หน่วย
                    </label>

                    <input
                      value={item.unit}
                      onChange={(e) =>
                        changeValue(
                          item.id,
                          "unit",
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  {/* เปิดใช้งาน */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      paddingBottom: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.is_active}
                      onChange={(e) =>
                        changeValue(
                          item.id,
                          "is_active",
                          e.target.checked
                        )
                      }
                    />

                    ใช้งาน
                  </label>

                  {/* บันทึก */}
                  <button
                    onClick={() =>
                      saveItem(item)
                    }
                    style={buttonStyle}
                  >
                    💾 บันทึก
                  </button>
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    color: "#888",
                    fontSize: "13px",
                  }}
                >
                  รหัสระบบ: {item.energy_key}
                </div>
              </div>
            ))}
          </div>

          {/* ข้อความ */}
          {message && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                borderRadius: "8px",
                background: "#f1f5f9",
                fontWeight: "bold",
              }}
            >
              {message}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  padding: "30px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
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

const buttonStyle = {
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};
