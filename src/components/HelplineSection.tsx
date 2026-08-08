import React, { useState } from "react";
import { Phone, Globe, ShieldAlert, LifeBuoy, Heart, Search, ExternalLink } from "lucide-react";

export default function HelplineSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const hotlines = [
    {
      id: "sejiwa",
      name: "Layanan SEJIWA (Kemenkes & HIMPSI)",
      contact: "Hotline 119 (Tekan 8)",
      type: "phone",
      description: "Layanan resmi tanggap darurat psikologis besutan Kementerian Kesehatan RI bekerja sama dengan Himpunan Psikologi Indonesia. Gratis, bebas pulsa, aktif 24 jam.",
      tags: ["krisis", "resmi", "gratis", "darurat"]
    },
    {
      id: "pulih",
      name: "Yayasan Pulih (Partner Tepercaya)",
      contact: "+62 811-8436-633 (WhatsApp)",
      web: "https://yayasanpulih.org",
      type: "both",
      description: "Lembaga non-profit yang fokus pada penanganan trauma psikologis, kekerasan berbasis gender, dan dukungan kesehatan mental dengan biaya terjangkau atau bersubsidi.",
      tags: ["konseling", "tidak-menghakimi", "trauma"]
    },
    {
      id: "intothelight",
      name: "Into The Light Indonesia",
      web: "https://www.intothelightid.org",
      type: "web",
      description: "Komunitas inklusif yang berfokus pada pencegahan bunuh diri dan edukasi kesehatan mental. Menyediakan rujukan klinis, psikolog, serta rumah sakit jiwa lengkap se-Indonesia.",
      tags: ["pencegahan", "rujukan", "bunuh diri"]
    },
    {
      id: "pijar",
      name: "Pijar Psikologi",
      web: "https://pijarpsikologi.org",
      type: "web",
      description: "Portal digital edukasi psikologi terkemuka di Indonesia yang menyediakan layanan psikoedukasi, webinar, artikel ilmiah populer, serta konsultasi terpandu online.",
      tags: ["artikel", "konsultasi", "informasi"]
    },
    {
      id: "himpsi",
      name: "Layanan HIMPSI Wilayah",
      web: "https://himpsi.or.id",
      type: "web",
      description: "Asosiasi profesi Himpunan Psikologi Indonesia yang menaungi psikolog profesional resmi di seluruh provinsi Indonesia. Temukan daftar psikolog klinis berizin di daerahmu.",
      tags: ["psikolog-resmi", "profesional", "provinsi"]
    },
    {
      id: "sehatjiwasby",
      name: "Layanan Psikologi Dinkes Surabaya",
      contact: "+62 811-3343-345",
      type: "phone",
      description: "Inisiatif tanggap krisis mental wilayah terpadu untuk warga masyarakat umum.",
      tags: ["daerah", "puskesmas"]
    },
    {
      id: "lisa",
      name: "LISA (Love Inside Suicide Awareness)",
      contact: "+62 811-3855-472",
      type: "phone",
      description: "Layanan dukungan psikososial dan pencegahan bunuh diri yang menyediakan bantuan untuk seluruh Indonesia.",
      tags: ["pencegahan", "bunuh-diri", "darurat"]
    },
    {
      id: "ibunda",
      name: "Ibunda.id",
      web: "https://www.ibunda.id",
      type: "web",
      description: "Platform penyedia layanan konseling psikologi online dan tatap muka bersama psikolog profesional yang memiliki lisensi resmi.",
      tags: ["konseling-online", "psikolog"]
    },
    {
      id: "riliv",
      name: "Riliv",
      web: "https://riliv.co",
      type: "web",
      description: "Aplikasi kesehatan mental terpadu yang menyediakan layanan konseling online dengan psikolog, meditasi, dan terapi.",
      tags: ["aplikasi", "meditasi", "konseling"]
    },
    {
      id: "bicarakan",
      name: "Bicarakan.id",
      web: "https://bicarakan.id",
      type: "web",
      description: "Layanan konseling online tepercaya dengan psikolog klinis tersertifikasi, membantu mengatasi masalah kecemasan hingga trauma.",
      tags: ["konseling-online", "klinis"]
    },
    {
      id: "bpjs",
      name: "Poli Jiwa Puskesmas (BPJS)",
      contact: "Faskes Tingkat 1",
      type: "phone",
      description: "Layanan konseling psikolog dan penanganan kejiwaan secara gratis bagi peserta JKN-KIS (BPJS) melalui Puskesmas terdekat.",
      tags: ["gratis", "bpjs", "tatap-muka"]
    },
    {
      id: "komnasperempuan",
      name: "Komnas Perempuan",
      contact: "021-3903963",
      web: "https://komnasperempuan.go.id",
      type: "both",
      description: "Layanan pengaduan dan pendampingan bagi perempuan korban kekerasan berbasis gender dan kekerasan dalam rumah tangga (KDRT).",
      tags: ["perempuan", "kdrt", "pengaduan"]
    },
    {
      id: "kpai",
      name: "KPAI (Perlindungan Anak)",
      contact: "021-31901556",
      web: "https://www.kpai.go.id",
      type: "both",
      description: "Layanan pengaduan dan perlindungan anak dari kekerasan, serta rujukan pendampingan psikologis.",
      tags: ["anak", "kekerasan", "pengaduan"]
    }
  ];

  const filteredHotlines = hotlines.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 animate-fade-in" id="helpline-resources">
      {/* Visual Header Guide info */}
      <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-150 dark:border-rose-900/50 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">Kamu Tidak Berjuang Sendiri</h4>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Menulis memo dan mengobrol dengan Ozy membantu menenangkan saraf yang cemas. Namun, Ozy bukanlah pengganti layanan profesional medis/psikologis klinis formal. 
            <br />
            <strong className="text-slate-700 dark:text-slate-300">Segera hubungi kontak di bawah ini</strong> apabila perasaan beratmu sudah mengancam kenyamanan fisik atau memicu keinginan berbuat nekat.
          </p>
        </div>
      </div>

      {/* Instant Search resource */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari rujukan konseling, layanan krisis, atau pusat bantuan..."
          className="w-full bg-white dark:bg-slate-850 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200/80 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-rose-500 dark:focus:ring-rose-400 transition-all font-medium"
        />
      </div>

      {/* Resource Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHotlines.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-2">
              {/* Header Title with quick category */}
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-[13px] font-bold text-slate-850 dark:text-slate-200 tracking-tight leading-tight">
                  {item.name}
                </h5>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded-md uppercase">
                  {item.tags[0]}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2 items-center justify-between">
              {/* Info text or contact details handle */}
              {item.contact ? (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{item.contact}</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic">
                  Akses Web Online
                </div>
              )}

              {/* External web links */}
              {item.web && (
                <a
                  href={item.web}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 transition-colors px-3 py-1 rounded-lg cursor-pointer"
                >
                  <span>Kunjungi Situs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredHotlines.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
            <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Hubungi 119 Ext 8 jika layanan pencarian tidak membuahkan hasil.</p>
          </div>
        )}
      </div>

      {/* Helpful quote footer regarding clinical attention */}
      <div className="text-center py-4 text-[10.5px] text-slate-400 leading-normal">
        <Heart className="w-3 h-3 text-red-500 fill-red-500/20 inline-block mr-1 align-middle" />
        Curhat bersama Ozy membantu mengurai emosi harian, namun bantuan klinis dari ahli psikologi adalah hak dasarmu di Indonesia. Mari saling menjaga.
      </div>
    </div>
  );
}
