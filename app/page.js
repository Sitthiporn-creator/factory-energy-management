NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function Home() {
  return (
    <main>
      <h1>Factory Energy Management</h1>
      <p>ระบบจัดการพลังงานโรงงาน</p>
    </main>
  );
}
