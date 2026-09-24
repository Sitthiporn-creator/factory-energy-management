"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function Home() {
  async function testSupabase() {
    const { data, error } = await supabase
      .from("energy_data")
      .select("*")
      .limit(5);

    if (error) {
      alert("เชื่อมต่อไม่สำเร็จ: " + error.message);
      console.error(error);
      return;
    }

    console.log(data);
    alert("เชื่อมต่อ Supabase สำเร็จ! พบข้อมูล " + data.length + " รายการ");
  }

  return (
    <main>
      <h1>Factory Energy Management</h1>
      <p>ระบบจัดการพลังงานโรงงาน</p>

      <button onClick={testSupabase}>
        ทดสอบเชื่อมต่อ Supabase
      </button>
    </main>
  );
}
