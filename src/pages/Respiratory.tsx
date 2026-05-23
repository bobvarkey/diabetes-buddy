import { useState } from "react";

// Simple Respiratory page without complex dependencies
export default function Respiratory() {
  const [mode, setMode] = useState("copd");

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">COPD/Asthma Management</h1>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setMode("copd")}
          className={`px-4 py-2 rounded ${mode === "copd" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          COPD
        </button>
        <button 
          onClick={() => setMode("asthma")}
          className={`px-4 py-2 rounded ${mode === "asthma" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          Asthma
        </button>
      </div>
      
      {mode === "copd" ? (
        <div className="border rounded p-4">
          <h2 className="font-bold text-lg mb-2">GOLD 2025 Classification</h2>
          <ul className="space-y-2">
            <li className="p-2 bg-gray-100 rounded">
              <strong>GOLD 1 - Mild</strong> FEV1 ≥80%
              <p className="text-sm text-gray-600">Minimize exposure, SABA PRN</p>
            </li>
            <li className="p-2 bg-gray-100 rounded">
              <strong>GOLD 2 - Moderate</strong> FEV1 50-79%
              <p className="text-sm text-gray-600">Add LAMA or LABA</p>
            </li>
            <li className="p-2 bg-gray-100 rounded">
              <strong>GOLD 3 - Severe</strong> FEV1 30-49%
              <p className="text-sm text-gray-600">Triple therapy + pulmonary rehab</p>
            </li>
            <li className="p-2 bg-gray-100 rounded">
              <strong>GOLD 4 - Very Severe</strong> FEV1 &lt;30%
              <p className="text-sm text-gray-600">Consider LTOT, lung reduction</p>
            </li>
          </ul>
        </div>
      ) : (
        <div className="border rounded p-4">
          <h2 className="font-bold text-lg mb-2">GINA 2025 Steps</h2>
          <ul className="space-y-2">
            <li className="p-2 bg-gray-100 rounded">
              <strong>Step 1</strong> - Mild: SABA PRN
            </li>
            <li className="p-2 bg-gray-100 rounded">
              <strong>Step 2</strong> - Moderate: Add low-dose ICS
            </li>
            <li className="p-2 bg-gray-100 rounded">
              <strong>Step 3</strong> - Severe: Medium-dose ICS+LABA
            </li>
            <li className="p-2 bg-gray-100 rounded">
              <strong>Step 4/5</strong> - Very Severe: High-dose ICS+LABA±LAMA
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}