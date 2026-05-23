import { useState } from "react";
export default function RespiratorySimple() {
  const [fev1, setFev1] = useState("");
  const result = () => {
    const f = Number(fev1);
    if (f >= 80) return "GOLD 1 - Mild";
    if (f >= 50) return "GOLD 2 - Moderate";
    if (f >= 30) return "GOLD 3 - Severe";
    return "GOLD 4 - Very Severe";
  };
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">COPD Simple</h1>
      <input type="number" placeholder="FEV1 %" className="border p-2 rounded w-full my-2" 
        onChange={e => setFev1(e.target.value)} />
      {fev1 && <div className="p-2 bg-blue-100 rounded">{result()}</div>}
    </div>
  );
}
