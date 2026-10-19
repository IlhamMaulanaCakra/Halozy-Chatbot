<div align="center">

<img width="1200" height="475" alt="Halozy Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

# 🫂 Halozy Chatbot

**Teman curhat berbasis AI untuk kesehatan mental di Indonesia**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 📖 Tentang Halozy

**Halozy** adalah aplikasi chatbot teman curhat berbasis AI yang dirancang khusus untuk pengguna di Indonesia. Halozy menggabungkan kecerdasan bahasa besar (LLM) dari Google Gemini dengan klasifikasi lokal berbasis SVM untuk mendeteksi kondisi emosional pengguna secara real-time, termasuk sistem keamanan krisis yang beroperasi **tanpa bergantung pada API eksternal**.

> **"Halozy hadir bukan sebagai psikolog, melainkan sebagai teman yang selalu ada untuk mendengar."**

---

## ⚙️ Arsitektur Tiga Pilar Utama

Halozy dibangun di atas tiga komponen inti yang saling melengkapi. Memahami ketiga file berikut berarti memahami seluruh sistem:

```
┌─────────────────────────────────────────────────────────┐
│                    HALOZY SYSTEM                        │
│                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │ dataset.json│──▶│svmClassifier│──▶│  server.ts   │  │
│  │  (Training  │   │    .ts      │   │ (LLM Prompt  │  │
│  │    Data)    │   │ (Klasifikasi│   │  + Routing)  │  │
│  └─────────────┘   │   Lokal)    │   └──────────────┘  │
│                    └─────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🧬 Pilar 1 — `src/data/dataset.json` · Dataset SVM

> **File:** [`src/data/dataset.json`](src/data/dataset.json) — 42 KB · 1913 baris

Dataset ini adalah **"otak lokal"** Halozy. Berisi bobot vektor dukungan (*support vector weights*) yang digunakan untuk mengklasifikasikan pesan pengguna ke dalam 16 kategori emosional tanpa memerlukan API eksternal.

### Kategori Emosional yang Didukung

| Kategori | Deskripsi | Skor Mental (0–10) |
|---|---|---|
| `crisis` | Darurat jiwa / pikiran bunuh diri | **1** (kritis) |
| `anxiety` | Kecemasan / panik berlebih | 3–4 |
| `burnout` | Kelelahan ekstrem / kejenuhan | 3–4 |
| `sadness` | Kesedihan mendalam | 3–5 |
| `anger` | Kemarahan / frustrasi | 3–4 |
| `grief` | Duka cita / kehilangan | 2–4 |
| `selfesteem` | Masalah harga diri | 3–4 |
| `relationship` | Masalah hubungan interpersonal | 3–5 |
| `academic` | Tekanan akademis / belajar | 3–5 |
| `family` | Konflik keluarga | 3–5 |
| `financial` | Tekanan finansial | 3–5 |
| `physical` | Masalah kesehatan fisik | 3–5 |
| `existential` | Krisis makna / eksistensial | 3–5 |
| `addiction` | Kecanduan / perilaku kompulsif | 2–4 |
| `positive` | Emosi positif / apresiasi diri | 7–9 |
| `neutral` | Pesan umum / tidak terklasifikasi | **5** |

### Struktur Bobot di Dataset

```json
{
  "category": "crisis",
  "primaryEmotion": "Gawat Darurat / Putus Asa",
  "baseBias": 0,
  "weights": {
    "bunuh diri": 5,
    "ingin mati": 4.5,
    "sayat lengan": 4.5,
    "self harm": 4.5,
    "capek hidup": 2.8,
    "mati aja": 4.5
  }
}
```

> **Bobot lebih tinggi** = sinyal lebih kuat bahwa teks termasuk kategori tersebut. Bigram seperti `"bunuh diri"` mendapat bobot maksimal (5.0) karena tingkat bahayanya.

---

## 🤖 Pilar 2 — `src/utils/svmClassifier.ts` · Klasifikasi SVM

> **File:** [`src/utils/svmClassifier.ts`](src/utils/svmClassifier.ts) — 7.7 KB · 200 baris

Modul ini mengimplementasikan **Support Vector Machine (SVM) gaya linear** secara murni di sisi klien menggunakan TF-IDF Word Vectorizer dan perkalian dot-product. Klasifikasi berjalan **100% lokal, zero-latency, tanpa API**.

### Cara Kerja Algoritma

```
Input Teks Pengguna
        │
        ▼
┌───────────────────┐
│  preprocessText() │  ← Lowercase, hapus stopwords, hitung bigram
│  TF-IDF Vectorize │    dan normalisasi tanda hubung
└────────┬──────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Dot Product × Support Vectors     │  ← Kalikan TF vektor dengan
│  score = Σ(weight[word] × tf)      │    bobot setiap profil SVM
│  + baseBias                        │
└────────┬───────────────────────────┘
         │
         ▼
┌───────────────────┐
│  Dynamic Scoring  │  ← Intensifier ("banget", "parah", "sangat")
│  Intensity Tuning │    menyesuaikan skor final secara dinamis
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Hard Crisis Gate │  ← Lapisan keamanan wajib: cek frasa kritis
│  (Safety Layer)   │    secara langsung, bypass hasil SVM biasa
└────────┬──────────┘
         │
         ▼
  ClassificationResult
  { category, sentimentScore, suggestions, requiresCounselor }
```

### Fitur Preprocessing Bahasa Indonesia

- **Stopword removal** — menghapus 50+ kata umum (`yang`, `di`, `karena`, `kok`, `sih`, dll.)
- **Bigram detection** — menangkap frasa 2 kata (`"bunuh diri"`, `"sakit hati"`) dengan bobot **1.5× lebih kuat**
- **Hyphen normalization** — `"sia-sia"` → diproses sebagai `sia`, `sia sia`, dan `sia-sia` sekaligus
- **Intensity modifiers** — kata seperti `"banget"`, `"parah"`, `"nggak"` menurunkan skor mental secara dinamis

### Interface Hasil Klasifikasi

```typescript
export interface ClassificationResult {
  category: "anxiety" | "burnout" | "sadness" | "crisis" | ...; // 16 kategori
  primaryEmotion: string;      // Label emosi dalam Bahasa Indonesia
  sentimentScore: number;      // Skor 0–10 (0 = krisis, 10 = sangat positif)
  summaryQuote: string;        // Kutipan dukungan yang dipilih secara acak
  suggestions: string[];       // 3 saran praktis yang dipersonalisasi
  requiresCounselor: boolean;  // true jika disarankan ke profesional
  tags: string[];              // Tag emosi tambahan
}
```

---

## 🌐 Pilar 3 — `server.ts` · Backend & Prompt LLM

> **File:** [`server.ts`](server.ts) — 19 KB · 486 baris

Server Express.js ini menjadi **jembatan antara SVM lokal dan Gemini LLM**. Ia mengelola routing API, keamanan, dan prompt engineering untuk persona "Ozy".

### Alur Pemrosesan Pesan

```
Pesan dari Pengguna
        │
        ▼
[1] Crisis Scanner (Regex) ──── KRISIS? ──▶ Respon darurat langsung
        │ AMAN                               (tanpa LLM, tanpa delay)
        ▼
[2] API Key check ─────────── TIDAK ADA? ──▶ Demo mode response
        │ ADA
        ▼
[3] System Prompt (Ozy Persona) ──▶ Gemini 2.5 Flash (primary)
        │                                    │ GAGAL?
        │                                    ▼
        │                           Gemini 1.5 Flash (fallback)
        │                                    │ GAGAL?
        │                                    ▼
        │                           Offline empathetic response
        ▼
    JSON Response { text, crisisTriggered, sentimentScore }
```

### System Prompt — Persona "Ozy"

Prompt dirancang dengan **5 aturan ketat** untuk menjaga kualitas percakapan:

```
Anda adalah "Ozy", sesosok AI yang menjadi teman curhat terpercaya,
hangat, dan bersahabat yang dirancang khusus untuk mendengarkan
keluh kesah pengguna di Indonesia dengan penuh empati.

Aturan Penting:
1. Bahasa Indonesia luwes & bersahabat ('kamu', 'aku')
2. TIDAK memaksa pertanyaan pribadi yang invasif
3. Maksimal 3 paragraf pendek per respons
4. Prinsip supportive CBT sederhana (reframing, mindfulness)
5. Rujuk ke profesional jika masalah berkepanjangan
   (SEJIWA 119 Ext 8, BincangMurni, Riliv)
```

### Endpoint API Utama

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/chat` | Percakapan dengan Ozy (Gemini LLM) |
| `POST` | `/api/sentiment` | Analisis sentimen teks |
| `POST` | `/api/sync/login` | Login akun pengguna |
| `POST` | `/api/sync/register` | Registrasi akun baru |
| `GET/POST` | `/api/sync/entries` | Sinkronisasi catatan jurnal |

### Keamanan Server

- 🛡️ **Helmet.js** — HTTP security headers otomatis
- ⏱️ **Rate Limiting** — 100 req/15 menit (chat), 20 req/15 menit (auth)
- 🔐 **bcryptjs** — Hash password sebelum disimpan ke database
- 🔒 **Enkripsi end-to-end** — Catatan jurnal dienkripsi di sisi klien

---

## 🚀 Cara Menjalankan Lokal

**Prasyarat:** Node.js v18+

```bash
# 1. Clone repository
git clone https://github.com/IlhamMaulanaCakra/Halozy-Chatbot.git
cd Halozy-Chatbot

# 2. Install dependencies
npm install

# 3. Konfigurasi environment
cp .env.example .env
# Edit .env dan isi GEMINI_API_KEY dengan API key Gemini Anda

# 4. Jalankan server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 🗂️ Struktur Proyek

```
Halozy-Chatbot/
├── server.ts                    ← 🌐 Backend Express + LLM Prompt
├── src/
│   ├── data/
│   │   ├── dataset.json         ← 🧬 Dataset bobot SVM (16 kategori)
│   │   ├── responses.json       ← 💬 Respons & saran per kategori
│   │   └── responses.ts         ← 📘 TypeScript versi responses
│   ├── utils/
│   │   ├── svmClassifier.ts     ← 🤖 Algoritma SVM lokal
│   │   ├── crypto.ts            ← 🔑 Enkripsi end-to-end
│   │   └── profanityFilter.ts   ← 🚫 Filter kata kasar
│   └── components/
│       └── Chatroom.tsx         ← 💻 UI Komponen Chat
├── .env.example                 ← ⚙️  Template konfigurasi
└── README.md                    ← 📄 Dokumentasi ini
```

---

## 🔗 Tautan

- 🌐 **GitHub Repository:** [IlhamMaulanaCakra/Halozy-Chatbot](https://github.com/IlhamMaulanaCakra/Halozy-Chatbot)
- 🤖 **AI Studio App:** [Buka di AI Studio](https://ai.studio/apps/5a7209e8-9c11-4878-9522-05f9c09560c7)

---

<div align="center">

Dibuat dengan ❤️ untuk kesehatan mental Indonesia

**Jika kamu butuh bantuan segera → Hubungi SEJIWA: 119 Ext 8**

</div>
