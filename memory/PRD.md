# Diabetes Buddy — PRD

## Overview
Mobile clinical decision support app converted from the open-source `bobvarkey/diabetes-buddy` web tool. Built as Expo React Native app for iOS App Store and Android Play Store. ADA Standards 2026 + LAI Lipid + Kerala diet integration.

## Target Users
Endocrinologists, internists, GPs, and diabetes educators in Kerala/India treating T2DM patients with comorbidities (post-stroke, CKD, HF, ASCVD, dysphagia).

## Architecture
- **Frontend**: Expo SDK 54, expo-router 6 (Stack-based), React Native 0.81
- **Storage**: AsyncStorage (local, no backend)
- **Backend**: Not used (stays untouched as default FastAPI scaffold)
- **No 3rd-party integrations** — fully offline clinical tool

## 13 Screens (Stack + Hub menu)
1. **Dashboard** (`/`) — Hero, vital stats, BG trend, med alerts, quick tools
2. **Patient Profile** (`/patient`) — Demographics, BMI/eGFR auto-calc, comorbidities, labs, current meds, BG series
3. **Complete Prescription** (`/summary`) — Combined output: meds + diet + hypo protocol
4. **Med Optimizer** (`/medications`) — ADA 2026 priorities-first algorithm with 16-drug DB
5. **Prediabetes Algorithm** (`/prediabetes`) — AACE 2023 lifestyle + meds pathway
6. **Insulin Titration** (`/insulin-titration`) — 3 protocols (Simple, Treat-to-Target, Conservative)
7. **Hypo Risk Score** (`/hypo-risk`) — 21-factor weighted scoring
8. **Renal Dose Adjustment** (`/renal-dosing`) — eGFR table for 18 drugs
9. **NICE CKD Guideline** (`/ckd-guideline`) — Decision tree by CKD stage
10. **Kerala Food Database** (`/foods`) — 30+ foods with carb/GI/sodium/texture
11. **Plate Method** (`/plate`) — Visual ½/¼/¼ meal builder
12. **7-Day Diet Plan** (`/diet-plan`) — Auto-generated, dysphagia/HF aware
13. **Progress** (`/progress`) — Weight loss & BG tracking
14. **Menu** (`/menu`) — Modal hub for full navigation (header menu icon)

## Clinical Logic (ported 1:1 from source)
- CKD-EPI 2021 race-free eGFR auto-calc
- ADA 2026 pathway selection: ASCVD → GLP-1 RA, HF/CKD → SGLT2i, Hypo-min → DPP-4i, Weight-mgmt → GIP/GLP-1
- 16-drug profiles with renal dose adjustments, CV/renal benefits, weight effects
- LAI Lipid post-stroke target LDL <55
- Hypoglycemia protocol (moru, almond, dysphagia-safe)
- Insulin titration: Simple ±2U, Riddle Treat-to-Target, Conservative for elderly/CKD
- Hypo risk: 21 factors, age/eGFR/insulin auto-driven from patient data
- Kerala food DB with dysphagia-soft + low-sodium filtering for HF

## Store-Ready
- App icons & splash screen present
- Bundle ID: `com.diabetesbuddy.app`
- Dark medical theme (#0a0e1a base) — eye-friendly for clinical use
- testIDs on all interactive elements

## Smart Enhancement (one)
- **Hub Menu** as modal: 13 tools accessible from any screen via header icon — preserves clinical workflow speed

## Limitations / Notes
- All data is **local-only** via AsyncStorage; no patient PHI leaves the device (HIPAA-friendly design)
- Clinical decision support tool — physician review required (footer disclaimer)
- No authentication needed (single-user clinical tool per device)
