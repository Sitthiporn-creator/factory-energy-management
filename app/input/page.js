"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const months = [
{ value: "01", label: "January" },
{ value: "02", label: "February" },
{ value: "03", label: "March" },
{ value: "04", label: "April" },
{ value: "05", label: "May" },
{ value: "06", label: "June" },
{ value: "07", label: "July" },
{ value: "08", label: "August" },
{ value: "09", label: "September" },
{ value: "10", label: "October" },
{ value: "11", label: "November" },
{ value: "12", label: "December" },
];

const years = Array.from({ length: 11 }, (_, i) => 2025 + i);

export default function InputPage() {
const [energyTypes, setEnergyTypes] = useState([]);
const [periodType, setPeriodType] = useState("monthly");

const [selectedMonth, setSelectedMonth] = useState("01");
const [selectedYear, setSelectedYear] = useState("2025");

const [values, setValues] = useState({});
const [note, setNote] = useState("");

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");

useEffect(() => {
loadEnergyTypes();
}, []);

async function loadEnergyTypes() {
setLoading(true);

```
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
```

}

function changeValue(energyTypeId, value) {
setValues((prev) => ({
...prev,
[energyTypeId]: value,
}));
}

function getRecordDate() {
if (periodType === "monthly") {
return selectedYear + "-" + selectedMonth + "-01";
}

```
return selectedYear + "-01-01";
```

}

function getPeriodLabel() {
if (periodType === "monthly") {
return selectedYear + "-" + selectedMonth;
}

```
return selectedYear;
```

}

function changePeriodType(type) {
s
