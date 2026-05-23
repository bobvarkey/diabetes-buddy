import { useState } from "react";
export default function RespiratoryModerate() {
  const [exac, setExac] = useState(0);
  const result = exac >= 2 ? "HIGH RISK - Triple therapy" : "LOW RISK - LAMA adequate";
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">COPD Moderate</h1>
      <input type="number" placeholder="Exacerbations/year" className="border p-2 rounded w-full my-2"
        onChange={e => setExac(Number(e.target.value))} />
      {exac > 0 && <div className="p-2 bg-green-100 rounded">{result}</div>}
    </div>
  );
}
