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

  useEffect(() => {
    loadEnergyTypes();
  }, []);

  async function loadEnergyTypes() {
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

  function changeValue(id, field, value) {
    setEnergyTypes((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  }

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

    setMessage("✅ บันทึกข้อมูลสำเร็จ");
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
                เปลี่ยนชื่อและหน่วยของข้อมูลพลังงานได้จากหน้านี้
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

          <div style={{ marginTop: "25px" }}>
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
                  <div>
                    <label style={labelStyle}>
                      ชื่อพลังงาน
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

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      paddingBottom: "12px",
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

                  <button
                    onClick={() => saveItem(item)}
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
