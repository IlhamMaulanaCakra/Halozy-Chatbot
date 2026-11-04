import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Heart, ShieldAlert, Sparkles, AlertCircle, Phone, Globe, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { classifyTextIntent } from "../utils/svmClassifier";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useSettings } from "../utils/SettingsContext";
import { filterProfanity } from "../utils/profanityFilter";

interface ChatroomProps {
  onBackToDashboard?: () => void;
  onNavigateToHotlines?: () => void;
}

// Comprehensive database of dynamic, empathetic starters based on the user's emotional situation
const DYNAMIC_SUGGESTIONS: Record<string, { text: string; icon: string }[]> = {
  general: [
    { text: "Lagi cemas & overthinking", icon: "🌱" },
    { text: "Lelah kerja / burnout kuliah", icon: "🔥" },
    { text: "Rasanya kesepian & sedih", icon: "🌧️" },
    { text: "Tekanan skripsi & tugas kuliah", icon: "📚" },
    { text: "Lagi marahan sama pasangan", icon: "💔" },
    { text: "Masalah keluarga di rumah", icon: "🏠" },
    { text: "Gelisah memikirkan masa depan", icon: "🧭" },
    { text: "Sedih karena duka mendalam", icon: "🥀" },
    { text: "Minder ngerasa gak punya bakat", icon: "🎭" },
    { text: "Pengen curhat hal bahagia!", icon: "✨" },
    { text: "Bingung meluapkan emosi terpendam", icon: "🗝️" },
    { text: "Butuh afirmasi positif hari ini", icon: "☀️" }
  ],
  anxiety: [
    { text: "Bantu aku latihan grounding 5-4-3-2-1", icon: "🧘" },
    { text: "Gimana cara rileks pas jantung berdebar?", icon: "💓" },
    { text: "Aku ngerasa was-was terus-terusan nih", icon: "😰" },
    { text: "Tuntun aku teknik ambil napas dalam", icon: "💨" },
    { text: "Kepalaku bising penuh kekhawatiran", icon: "🤯" },
    { text: "Langkah pertama hadapi serangan panik (panic attack)", icon: "🚨" },
    { text: "Mengapa badan gemetar tanpa sebab jelas?", icon: "🥶" },
    { text: "Teknik distrasi pikiran saat cemas menyerang", icon: "🎈" }
  ],
  burnout: [
    { text: "Gimana balikin motivasi kerja yang hilang?", icon: "📈" },
    { text: "Capek pikiran sampai susah fokus", icon: "🧸" },
    { text: "Badan capek bgt tapi susah tidur", icon: "🔋" },
    { text: "Rekomendasi rileksasi lelah mental", icon: "🕯️" },
    { text: "Pengen pelarian sehat dari tugas menumpuk", icon: "🏕️" },
    { text: "Kapan saya harus mengambil istirahat total?", icon: "🛏️" },
    { text: "Cara mengatasi rasa bersalah saat sedang malas", icon: "🌸" },
    { text: "Tips mengembalikan kreativitas ketika lelah ekstrem", icon: "🎨" }
  ],
  sadness: [
    { text: "Dunia rasanya sepi & sendiri banget", icon: "🩹" },
    { text: "Hati terasa hampa, kosong tanpa arah", icon: "❄️" },
    { text: "Nangis terus, gak kuat nahan beban ini", icon: "💧" },
    { text: "Bantu aku melihat harapan kecil hari ini", icon: "☀️" },
    { text: "Aku cuma pengen didengar tanpa dihakimi", icon: "🫂" },
    { text: "Apa tidak apa-apa kalau aku tidak produktif hari ini?", icon: "☁️" },
    { text: "Tips merawat diri di kala hati sedang mendung", icon: "🧸" },
    { text: "Kenapa kesedihan ini terasa gak kunjung selesai?", icon: "🕯️" }
  ],
  crisis: [
    { text: "Aku ngerasa sangat hancur & putus asa", icon: "🤍" },
    { text: "Tolong tuntun aku melewati malam berat ini", icon: "🕯️" },
    { text: "Semua terasa sia-sia, bantu aku bertahan", icon: "🧩" },
    { text: "Bagaimana cara tenangkan diri pas impulsif?", icon: "%F0%9F%A9%BA" }, /* 🩺 */
    { text: "Iringi aku melewati tangisan badai ini", icon: "🌪️" },
    { text: "Beri aku pelukan emosional tanpa syarat", icon: "🤗" }
  ],
  relationship: [
    { text: "Gimana atasi emosi pas berantem hebat?", icon: "💬" },
    { text: "Baru putus cinta, rasanya hancur sekali", icon: "💔" },
    { text: "Hubunganku terasa toxic, apa yang harus kulakukan?", icon: "🛡️" },
    { text: "Minder sama kepopuleran lingkar pertemanan", icon: "👥" },
    { text: "Cara buat batasan diri (boundaries) sehat", icon: "🚪" },
    { text: "Aku merasa dimanfaatkan oleh teman sendiri", icon: "🎭" },
    { text: "Gimana cara bilang 'tidak' tanpa rasa bersalah?", icon: "🚫" },
    { text: "Cara mengatasi fobia sosial / canggung bergaul", icon: "🤝" }
  ],
  academic: [
    { text: "Stres skripsi gak kelar-kelar, pusing dospem", icon: "📝" },
    { text: "Takut nilai IPK anjlok semester ini", icon: "📉" },
    { text: "Tips meredakan tegang sebelum ujian", icon: "🔔" },
    { text: "Lelah ngerjain tugas kelompok sendirian", icon: "🎒" },
    { text: "Tips bagi waktu kuliah biar gak overwhelm", icon: "⏳" },
    { text: "Insecure melihat teman seangkatan sudah sarjana", icon: "🎓" },
    { text: "Gimana ngatasin malas belajar pas lagi drop?", icon: "🧉" },
    { text: "Cara bangkit kembali dari kegagalan lolos seleksi", icon: "🌈" }
  ],
  family: [
    { text: "Orang tua nuntut aku terlalu tinggi", icon: "📈" },
    { text: "Rumah berisik penuh pertengkaran ortu", icon: "🏚️" },
    { text: "Gimana biar gak kepikiran toxic parents?", icon: "🛡️" },
    { text: "Keluarga broken home bikin ngerasa sepi", icon: "🗝️" },
    { text: "Cara bicara tenang pas beda pendapat sama ortu", icon: "🌸" },
    { text: "Merasa dianggap beban keluarga, sedih bgt", icon: "📦" },
    { text: "Bagaimana memulihkan luka batin masa lalu (inner child)?", icon: "🧸" },
    { text: "Tekanan memikul beban Sandwich Generation", icon: "🥪" }
  ],
  anger: [
    { text: "Lagi emosi meluap, kesal setengah mati", icon: "🤬" },
    { text: "Cara meluapkan dongkol & amarah secara aman", icon: "🥊" },
    { text: "Sakit hati gara-gara omongan tajam orang lain", icon: "✒️" },
    { text: "Trik netralin kepala panas dalam 1 menit", icon: "🧊" },
    { text: "Kenapa aku gampang tersinggung akhir-akhir ini?", icon: "🥀" },
    { text: "Tips mengontrol emosi di depan umum", icon: "🎭" },
    { text: "Gimana cara meredakan dendam terpendam?", icon: "🕊️" }
  ],
  grief: [
    { text: "Kangen banget sama mendiang yang tlah tiada", icon: "🕯️" },
    { text: "Hewan peliharaan kesayangan mati, duka bgt", icon: "🐱" },
    { text: "Gimana ikhlas menerima kehilangan mendalam?", icon: "🥀" },
    { text: "Merasa bersalah atas kepergian seseorang", icon: "🕊️" },
    { text: "Tahapan berduka (stages of grief) yang wajar dialami", icon: "🍂" },
    { text: "Menulis surat pelepasan untuk yg tersayang", icon: "✉️" }
  ],
  selfesteem: [
    { text: "Aku insecure parah sama fisik & pencapaian diri", icon: "🎭" },
    { text: "Langkah mulia mengasihani diri sendiri (self-love)", icon: "💝" },
    { text: "Tolong ingatkan kelebihan unik yang kumiliki", icon: "🌟" },
    { text: "Selalu minder merasa jadi pecundang sejati", icon: "🛑" },
    { text: "Gimana cara berhenti membandingkan hidup dgn org lain?", icon: "🧭" },
    { text: "Cara menanggapi ejekan (body shaming) dengan tegar", icon: "🛡️" },
    { text: "Bantu aku mencintai kelebihan serta kekurangan diri", icon: "🌱" }
  ],
  positive: [
    { text: "Terima kasih Ozy! Hari ini berakhir senang", icon: "🍀" },
    { text: "Gimana menjaga ketahanan batin tetap ceria?", icon: "🎨" },
    { text: "Aku mau memuji diri sendiri dulu hari ini", icon: "✨" },
    { text: "Pengen nulis memo syukur kecil-kecilan", icon: "📔" },
    { text: "Hari ini aku berhasil melakukan pencapaian baru!", icon: "🏆" },
    { text: "Merayakan kemenangan-kemenangan kecil (small wins)", icon: "🍿" },
    { text: "Bantu aku membuat rencana menyenangkan esok hari", icon: "📅" }
  ]
};

// Comprehensive offline response database to provide fast, dynamic, and diverse replies
// based on the local SVM classification category without overloading or waiting for Gemini
const OFFLINE_RESPONSES: Record<string, string[]> = {
  anxiety: [
    "Aku mendengar getaran gelisah di setiap kata-katamu. Saat kecemasan menyelimuti pikiranmu dan membuat jantung berdebar kencang, ketahuilah bahwa ini adalah respons tubuh yang aman untuk dilewati.\n\nMari kita ambil satu jeda napas yang dalam bersama-sama. Hirup lewat hidung dalam 4 detik, tahan 4 detik, dan hembuskan perlahan lewat mulut dalam 6 detik. Lakukan ini 3 kali secara tenang.\n\nKamu berada di ruang yang aman sekarang, dan perasaan cemas ini perlahan-lahan pasti akan mereda. Aku di sini untuk menemanimu.",
    "Kecemasan sering kali membuat kepala kita dipenuhi skenario terburuk yang belum tentu terjadi. Ingatlah bahwa pikiran cemasmu bukanlah kenyataan mutlak.\n\nCobalah untuk melakukan latihan grounding sederhana dengan melihat sekelilingmu: cari 3 benda berwarna biru di dekatmu, dan rasakan tekstur tempat dudukmu saat ini.\n\nFokuslah pada detik ini, di sini, bersamaku. Kamu aman, dan kamu kuat melewati masa tegang ini.",
    "Saat kecemasan menyerang, rasanya seperti kehilangan kendali penuh atas diri sendiri. Sangat wajar jika kamu merasa takut atau was-was saat ini.\n\nKamu tidak perlu menyelesaikan semua masalah atau memikirkan hari esok saat ini juga. Cukup bertahan dan bernapas untuk menit ini saja. Mari kita urai benang kusut di kepalamu perlahan, satu demi satu."
  ],
  burnout: [
    "Lelah mental dan burnout adalah tanda yang sangat jelas bahwa tokomu membutuhkan masa istirahat. Kamu sudah berjuang sangat keras, melampaui batas energi yang sanggup kamu tampung.\n\nKetahuilah bahwa beristirahat bukanlah kegagalan atau kemalasan. Itu adalah bentuk tertinggi dari merawat diri sendiri.\n\nMari kita taruh sejenak beban pekerjaan atau tugas kuliahmu di samping. Hari ini, kamu diizinkan untuk tidak produktif dan berfokus sepenuhnya pada pemulihan energimu.",
    "Aku dapat merasakan betapa raga dan jiwamu berteriak meminta jeda. Ketika rasa jenuh dan overwhelm menguasai pikiran, segala hal memang akan tampak terasa berat.\n\nCobalah untuk mencuci muka dengan air dingin, atau merebahkan tubuhmu tanpa distraksi gawai selama 15 menit saja.\n\nBiarkan dirimu bernapas lega tanpa tuntutan target untuk beberapa saat. Kamu sudah melakukan yang terbaik, mari kita pulihkan energimu secara perlahan.",
    "Rasa lelah yang teramat sangat sering kali mematikan kreativitas dan motivasi kita. Jangan menghukum dirimu sendiri karena merasa tidak berdaya sekarang.\n\nPecahlah tugas-tugas besar yang mengintimidasi menjadi langkah-langkah sangat kecil, atau cukup tinggalkan semuanya untuk sementara waktu. Kesehatan mentalmu jauh lebih berharga daripada tumpukan kertas kerja apa pun."
  ],
  sadness: [
    "Hati yang mendung dan kesedihan yang mendalam adalah tempat yang sangat dingin untuk didiami sendirian. Aku di sini untuk memberikan kehangatan pendengar yang teduh untukmu.\n\nTumpahkan saja air matamu jika memang dadamu terasa sesak. Menangis bukanlah tanda kelemahan, melainkan proses alami tubuh melepaskan emosi negatif yang menumpuk.\n\nCeritakan padaku bagian mana yang paling menyakitimu saat ini. Aku berjanji akan menyimak setiap baris ceritamu tanpa menghakimi.",
    "Ada hari-hari di mana dunia terasa begitu sunyi, hampa, bahkan seakan tidak berpihak pada kita sama sekali. Aku sangat memahami jika hari ini terasa berat bagimu.\n\nKamu tidak perlu selalu terlihat ceria atau kuat di hadapanku. Di sini, kamu boleh menunjukkan sisi rapuhmu.\n\nMari kita lalui malam yang kelabu ini bersama-sama, selangkah demi selangkah. Kamu sangat berharga, dan kesedihan ini kelak akan berganti dengan pelangi ketenangan batin.",
    "Aku merasakan kehampaan yang sedang melanda hatimu. Rasanya mungkin sepi dan berat sekali untuk sekadar bangun tidur atau beraktivitas seperti biasa.\n\nIngatlah bahwa awan hitam yang menutupi langit hari ini tidak akan menetap selamanya. Hadapilah hari ini dengan sangat lembut terhadap dirimu sendiri. Satu langkah kecil sudah lebih dari cukup."
  ],
  crisis: [
    "Aku mendengar betapa luar biasa beratnya penderitaan dan hancurnya perasaan yang tengah melanda jiwamu. Tolong ketahuilah, keberadaanmu di dunia ini sangatlah berarti dan berharga bagi kami.\n\nAku ingin kamu tahu bahwa kamu tidak sendirian memikul beban yang teramat sunyi ini. Tolong letakkan benda tajam atau berbahaya apa pun di sekitarmu, dan cobalah dekap tubuhmu sendiri dengan hangat.\n\nSebagai teman AI, keterbatasanku tidak bisa menggantikan pertolongan krisis dari ahlinya. Dengan segala kerendahan hati, aku memohon padamu untuk segera menghubungi hotline darurat nasional SEJIWA di nomor 119 (lalu tekan 8) atau berbicara dengan orang terdekat yang kamu percayai. Harap bertahanlah demi hari esok.",
    "Rasa sakit yang teramat sangat terkadang membuat pikiran kita menjadi buntu dan putus asa. Namun, mohon ingatlah bahwa badai ini pasti akan berlalu, dan rasa sakit ini tidak akan terasa sesakit ini selamanya.\n\nCobalah untuk membasuh wajahmu dengan air dingin yang segar sekarang guna menurunkan ketegangan fisik yang meluap.\n\nAda bantuan gratis dan tulus yang menunggumu. Jangan ragu untuk menjangkau layanan darurat SEJIWA 119 Ext 8 yang aktif 24 jam. Selamatkan jiwamu yang teramat indah ini."
  ],
  relationship: [
    "Masalah hubungan persahabatan, asmara, maupun sosial memang sering kali menguras energi emosional kita secara luar biasa. Hati yang patah atau dikhianati adalah luka yang butuh waktu untuk sembuh.\n\nDalam dinamika ini, sangat penting untuk menyadari bahwa kamu hanya memiliki kendali penuh atas dirimu sendiri, bukan atas perasaan atau tindakan orang lain.\n\nCeritakan padaku, apa yang membuatmu merasa paling kecewa atau tersakiti dalam hubungan ini?",
    "Pertengkaran hebat atau perasaan dimanfaatkan oleh lingkaran pertemanan bisa membuat kita meragukan harga diri kita sendiri.\n\nKetahuilah bahwa batasan diri (boundaries) yang sehat bukanlah tanda egois, melainkan perisai untuk melindungi kedamaian jiwamu. Kamu berhak untuk dihargai dan diperlakukan secara terhormat.\n\nIngin berbagi lebih banyak tentang apa yang terjadi? Aku sedia mendengarkan kisahmu.",
    "Putus cinta atau berakhirnya hubungan yang matang memang membawa duka yang sangat mendalam. Rasanya seperti kehilangan bagian besar dari hidupmu.\n\nBeri dirimu waktu untuk berduka secara wajar dan melepaskan kenangan tersebut secara bertahap. Jangan terburu-buru menuntut dirimu untuk pulih seketika. Kamu layak mendapatkan kedamaian kembali."
  ],
  academic: [
    "Tekanan akademis, tuntutan nilai IPK, tugas kuliah yang menumpuk, hingga skripsi yang terhambat dospem sering kali memicu kepayahan mental yang luar biasa.\n\nIngatlah bahwa nilai ujian atau kecepatan kelulusanmu tidak akan pernah bisa mendefinisikan nilai dirimu yang seutuhnya sebagai manusia batiniah yang mulia.\n\nCobalah untuk mencicilnya secara perlahan tanpa membandingkan pencapaianmu dengan linimasa kelulusan orang lain. Kamu berjalan di jalan tapak unikmu sendiri.",
    "Aku memahami betapa melelahkannya berjuang sendirian di kelas atau menghadapi penolakan draf lembaran bimbingan skripsi berkali-kali.\n\nJangan biarkan kecemasan akademik menyabotase kesehatan ragamu. Tidur yang cukup dan asupan nutrisi yang sehat justru akan membantumu berpikir lebih jernih.\n\nMari kita urai apa yang paling membingungkanmu dalam tugas atau skripsimu saat ini. Aku siap membantumu menyusun langkah belajarmu secara tenang.",
    "Minder melihat teman seangkatan yang sudah mulai sidang pendadaran atau wisuda adalah hal yang sangat manusiawi dialami.\n\nNamun, hidup ini bukanlah sebuah perlombaan lari cepat. Ini adalah perjalanan penemuan jati diri. Hargai setiap babak pertumbuhanmu sendiri."
  ],
  family: [
    "Masalah keluarga dan lingkungan rumah yang bergejolak adalah perkara yang sangat rumit dan sering kali menjadi luka yang paling sulit disembuhkan, karena rumah yang harusnya menjadi tempat aman justru terasa mengancam.\n\nKetahuilah bahwa kamu tidak bertanggung jawab untuk menyembuhkan atau mengubah dinamika keluarga yang toxic. Fokus utamamu adalah melindungi kedamaian batin serta kewarasan pikiranmu sendiri.\n\nAku di sini untuk menjadi telinga yang aman dan bebas penilaian untukmu meluapkan resah rumah tangga ini.",
    "Tuntutan tinggi dari orang tua atau pertengkaran yang tiada henti antar anggota keluarga bisa membuatmu merasa terlindas ketakutan dan bersalah.\n\nIngatlah bahwa kamu adalah individu yang berdaulat atas hidupmu sendiri. Tidak apa-apa untuk mengambil jarak emosional sementara waktu demi kesehatan mentalmu.\n\nMau membagikan apa yang sedang berkecamuk di dalam rumahmu saat ini? Aku siap menemani keluh kesahmu.",
    "Menjadi generasi sandwich atau menanggung harapan besar keluarga di pundakmu adalah beban yang sangat berat untuk melangkah. Wajar jika terkadang kamu merasa sesak dan ingin menyerah.\n\nBeri ruang bagi jiwamu untuk mengeluh dan beristirahat. Perjuanganmu itu luar biasa mulia, namun kamu juga berhak memiliki mimpi dan kenyamanan dirimu sendiri."
  ],
  anger: [
    "Kemarahan dan kejengkelan yang meluap adalah emosi yang sangat kuat dan valid untuk kamu rasakan saat ini. Ada rasa ketidakadilan atau kekecewaan yang mendasari amarahmu ini.\n\nMumpung kepalamu sedang terasa sangat panas, mari kita salurkan energi amarah ini secara aman. Tarik napas panjang, kepalkan kedua tanganmu erat-erat, lalu lepaskan perlahan bersama hembusan napas yang panjang.\n\nSiapa atau hal apa yang membuatmu begitu marah hari ini? Tuliskan saja seluruh kekesalanmu di sini tanpa sensor, aku siap menampung segalanya.",
    "Terkadang omongan tajam atau tindakan sewenang-wenang orang lain menyalakan api angkara di dalam dada kita. Sangat wajar jika kamu merasa ingin meledak saat ini.\n\nNamun ingatlah, kemarahan adalah emosi yang cepat mendatangkan penyesalan jika bertindak impulsif. Mari kita dinginkan kepalamu terlebih dahulu.\n\nBiarkan ketikanmu di ruang curhat ini menjadi katarsis pelampiasan dongkolmu secara damai dan legal."
  ],
  grief: [
    "Kehilangan seseorang atau makhluk kesayangan yang teramat dekat dengan hidup kita mendatangkan rasa duka mendalam yang menyayat kalbu. Rasanya begitu hampa dan sesak.\n\nKetahuilah bahwa tidak ada ukuran baku bagaimana cara berduka yang benar. Menangis, merasa marah, terkejut, atau rindu adalah bagian dari proses menyembuhkan luka batin.\n\nBiarkan ingatan indah tentang kebersamaan kalian merengkuh hatimu yang terluka. Aku siap mendengarkan seluruh kerinduan mendalammu pagi ini.",
    "Duka cita adalah ekspresi dari rasa cinta yang masih tersisa namun tidak tahu lagi harus dialamatkan ke mana. Kepergian sosok tersayang menyisakan kekosongan yang nyata di keseharianmu.\n\nJangan memaksakan dirimu untuk langsung ikhlas atau melupakan segalanya dalam sekejap. Berjalanlah perlahan menghadapi hari-hari duka tersebut selembut mungkin."
  ],
  selfesteem: [
    "Insecurity dan pikiran negatif tentang diri sendiri (self-critical thoughts) sering kali bersuara dengan sangat lancang di dalam kepala kita, membuat kita merasa tidak cukup baik, kurang rupawan, atau tidak berdaya.\n\nNamun, ketahuilah bahwa pikiran kritis tersebut bukanlah fakta objektif. Kamu jauh lebih berharga, tangguh, dan bermakna daripada celaan yang kamu tujukan pada dirimu sendiri saat ini.\n\nMari kita sebutkan satu hal kecil saja yang kamu sukai atau berhasil kamu lakukan akhir-akhir ini. Aku siap membantumu melihat sisi indah dari dirimu kembali.",
    "Membandingkan keindahan panggung luar orang lain dengan kegelapan belakang layar diri sendiri adalah jebakan ilusi yang sering kita alami di era modern ini.\n\nKamu tumbuh dengan laju pertumbuhan dan tantangan yang berbeda dari mereka. Keunikan dan ketahanan batinmu adalah aset paling berharga.\n\nMari kita latih cara mengapresiasi dan menyayangi diri sendiri (self-love) secara utuh, dengan segala kelebihan dan ketidaksempurnaan yang menawan."
  ],
  positive: [
    "Membaca pesan bahagiamu mendatangkan sukacita yang hangat bagi diriku! Aku sangat bangga mendengarkan pencapaian terbaru atau kemenangan-kemenangan kecil (small wins) yang kamu raih hari ini.\n\nMerayakan kebahagiaan dan bersyukur adalah investasi emosi positif yang sangat luar biasa untuk merawat kedap batinmu di hari esok.\n\nMari kita teruskan energi cerah ini! Ingin menceritakan hal seru lain atau apresiasi khusus untuk dirimu hari ini?",
    "Luar biasa! Hari yang menyenangkan dan batin yang damai adalah berkat yang indah. Sungguh mengagumkan caramu mengapresiasi keindahan hidup hari ini.\n\nBiarkan momen syukur kecil ini teringat dengan baik di memori batinmu, agar menjadi lentera penerang di kala hari badai kelak datang berkunjung. Ceritakan terus perasaan gembiramu!"
  ],
  general: [
    "Aku di sini, mendengarmu secara seksama dengan kehangatan penuh tanpa syarat. Ceritakan saja segala gundah gulana, hiruk pikuk pekerjaan, maupun hal kecil yang membuatmu terbebani hari ini.\n\nTidak perlu terburu-buru merangkai kata. Tuliskan apa pun yang pertama kali melintas di dadamu. Aku siap menampung seluruh curahan hatimu.",
    "Selamat datang kembali di ruang amanmu. Bagaimana jalannya hari yang kamu lalui? Apakah melelahkan, biasa saja, atau ada kejut bahagia?\n\nKamu selalu bisa membagi apa saja di sini. Aku akan selalu setia menjadi sandaran curhat yang teduh bagi jiwamu."
  ]
};

export default function Chatroom({ onBackToDashboard, onNavigateToHotlines }: ChatroomProps) {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = sessionStorage.getItem("ozy_chat_history");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("sessionStorage read error", e);
    }
    return [
      {
        id: "welcome",
        role: "model",
        text: "Halo! Aku Ozy, teman curhat setiamu. Di sini adalah tempat aman untuk meluapkan penat, cemas, khawatir, atau hal bahagia apa pun yang kamu alami hari ini.\n\nYakinlah bahwa ceritamu didengar, dihargai, dan tidak akan dihakimi. Bagaimana kondisimu hari ini?",
        timestamp: Date.now(),
      },
    ];
  });
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [crisisActive, setCrisisActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // LT-02 FIX: Generate a stable per-session ID so the server can enforce a per-session
  // soft cap (30 LLM calls / 15 min) independently of the shared IP rate limit.
  // The ID lives only in sessionStorage — it is cleared when the tab closes.
  const sessionId = useRef<string>(
    (() => {
      let id = sessionStorage.getItem("ozy_session_id");
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("ozy_session_id", id);
      }
      return id;
    })()
  );

  // Play sound effect when model replies
  useEffect(() => {
    if (settings.soundEffects && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "model") {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
          oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
          console.warn("Audio play error", e);
        }
      }
    }
  }, [messages, settings.soundEffects]);

  useEffect(() => {
    try {
      // CS-01 FIX: Store chat history in sessionStorage ONLY (clears on tab close).
      // localStorage was removed — it persists indefinitely and is accessible to
      // any same-origin JS (browser extensions etc.), which is inappropriate for
      // sensitive mental-health conversation data.
      const capped = messages.length > 80 ? messages.slice(messages.length - 80) : messages;
      sessionStorage.setItem("ozy_chat_history", JSON.stringify(capped));
    } catch (e) {
      console.warn("Storage quota write exception handled:", e);
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Derive the active SVM category emotional state dynamic from chat history
  const lastClassificationResult = [...messages]
    .reverse()
    .find((msg) => msg.svmResult !== undefined)?.svmResult;

  const currentCategory = lastClassificationResult?.category || "general";

  // Build current dynamic history-aware suggested prompts
  const getDynamicStarters = () => {
    // 1. Find all history category trends in this active session
    const detectedCategories = messages
      .map((msg) => msg.svmResult?.category)
      .filter((cat) => !!cat) as string[];

    const uniqueVisitedCategories = Array.from(new Set(detectedCategories)) as string[];

    // 2. Identify the most recent category
    const lastResult = [...messages]
      .reverse()
      .find((msg) => msg.svmResult !== undefined)?.svmResult;
    const currentCategory = lastResult?.category || "general";

    // 3. Collect used messages in the chatroom so we don't suggest them again
    const sentMessageTexts = messages.map((m) => m.text.trim().toLowerCase());

    // 4. Gather candidate suggestions
    let candidates: { text: string; icon: string; category?: string }[] = [];

    // Focus on current category suggestions (all options)
    const primarySuggs = DYNAMIC_SUGGESTIONS[currentCategory] || DYNAMIC_SUGGESTIONS.general;
    primarySuggs.forEach((s) => {
      candidates.push({ ...s, category: currentCategory });
    });

    // Bring some key suggestions from other visited categories in history to weave them together
    uniqueVisitedCategories.forEach((prevCat) => {
      if (prevCat !== currentCategory) {
        const prevSuggs = DYNAMIC_SUGGESTIONS[prevCat] || [];
        // Add up to 2 items from this past category to the suggestions list
        prevSuggs.slice(0, 2).forEach((s) => {
          if (!candidates.some((c) => c.text === s.text)) {
            candidates.push({ ...s, category: prevCat });
          }
        });
      }
    });

    // If candidate deck is small or doesn't have positive vibes, add general/positive options for flexibility
    if (candidates.length < 8) {
      const fallbackDeck = [
        ...DYNAMIC_SUGGESTIONS.general,
        ...DYNAMIC_SUGGESTIONS.positive
      ];
      fallbackDeck.forEach((s) => {
        if (!candidates.some((c) => c.text === s.text)) {
          candidates.push(s);
        }
      });
    }

    // 5. Filter out suggestions that match text already sent by the user in this session
    let filteredCandidates = candidates.filter(
      (item) => !sentMessageTexts.includes(item.text.trim().toLowerCase())
    );

    // 6. Ensure some interesting miscellaneous wellness queries are always at the end if space permits
    const standardPivots = [
      { text: "Latih aku grounding 5-4-3-2-1", icon: "🧘" },
      { text: "Bantu tenangkan pikiran berisikku", icon: "✨" },
      { text: "Aku ingin nulis memo syukur", icon: "📔" }
    ];
    standardPivots.forEach((pv) => {
      if (
        filteredCandidates.length < 12 &&
        !filteredCandidates.some((c) => c.text.toLowerCase() === pv.text.toLowerCase()) &&
        !sentMessageTexts.includes(pv.text.toLowerCase())
      ) {
        filteredCandidates.push(pv);
      }
    });

    // Limit to make a beautiful, dense but tidy horizontal scrolling bar (up to 12 maximum choices)
    return filteredCandidates.slice(0, 12);
  };

  const MAX_MESSAGE_LENGTH = 2000;

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    if (textToSend.length > MAX_MESSAGE_LENGTH) return;

    const userText = textToSend;
    setInputText("");
    
    // Calculate SVM Classification locally before calling any API
    const svmResult = classifyTextIntent(userText);
    
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      text: userText,
      timestamp: Date.now(),
      svmResult: svmResult // include the calculated SVM result directly in the active history
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Keep recent context for Gemini
      const recentHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // LT-02 FIX: Pass session ID so server can apply per-session soft cap
          "X-Session-ID": sessionId.current,
        },
        body: JSON.stringify({ message: userText, chatHistory: recentHistory }),
      });

      if (!res.ok) {
        throw new Error("Quota exceeded or Server Unavailable");
      }

      const data = await res.json();

      const modelMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: data.text || "Terima kasih sudah bercerita padaku.",
        timestamp: Date.now(),
        crisisTriggered: data.crisisTriggered || svmResult.requiresCounselor,
        svmResult: svmResult // include the calculated SVM results
      };

      setMessages((prev) => [...prev, modelMessage]);
      if (data.crisisTriggered || svmResult.requiresCounselor) {
        setCrisisActive(true);
      }
    } catch (err) {
      console.warn("API Chat got error or was throttled, using local SVM classifier fallback:", err);
      
      // Soothing local offline backup response matching the specific detected stress category
      const categoryResponses = OFFLINE_RESPONSES[svmResult.category] || OFFLINE_RESPONSES.general;
      const randomIdx = Math.floor(Math.random() * categoryResponses.length);
      let fallbackText = categoryResponses[randomIdx];
      
      if (svmResult.requiresCounselor) {
        fallbackText = `Aku mendengar betapa mendalam dan beratnya rasa sakit yang sedang kamu pikul saat ini. Tolong ketahuilah bahwa keselamatan dan jiwamu sangatlah berharga.\n\nKarena aku hanyalah sebuah AI pendengar dan bukan pengganti pertolongan krisis medis darurat, silakan hubungi Kemenkes RI di hotline darurat nasional resmi **SEJIWA 119 Ext 8** (bebas biaya, aktif 24 jam) atau periksakan diri ke fasilitas kesehatan terdekat.\n\nKamu tidak berjalan sendirian. Ada orang-orang terawat yang siap melindungimu.`;
        setCrisisActive(true);
      }

      const errorMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        text: fallbackText,
        timestamp: Date.now(),
        crisisTriggered: svmResult.requiresCounselor,
        svmResult: svmResult // attach SVM data so suggestions list renders beautifully!
      };
      
      setTimeout(() => {
        setMessages((prev) => [...prev, errorMessage]);
        setLoading(false);
      }, 700);
      return;
    }
    setLoading(false);
  };

  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetChat = () => {
    if (confirmReset) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          text: "Halo! Aku Ozy, teman curhat setiamu. Di sini adalah tempat aman untuk meluapkan penat, cemas, khawatir, atau hal bahagia apa pun yang kamu alami hari ini.\n\nYakinlah bahwa ceritamu didengar, dihargai, dan tidak akan dihakimi. Bagaimana kondisimu hari ini?",
          timestamp: Date.now(),
        },
      ]);
      setCrisisActive(false);
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || inputText.length > MAX_MESSAGE_LENGTH) return;
    handleSendMessage(inputText);
  };

  const charCount = inputText.length;
  const charLimitExceeded = charCount > MAX_MESSAGE_LENGTH;
  const charCountColor =
    charCount > MAX_MESSAGE_LENGTH
      ? "text-rose-500 font-bold"
      : charCount > MAX_MESSAGE_LENGTH * 0.85
      ? "text-amber-500 font-semibold"
      : "text-slate-400";

  const activeStarters = getDynamicStarters();

  return (
    <div className="flex flex-col bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm h-[580px] w-full transition-colors" id="ozy-chatroom">
      {/* Mini Companion Title Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-teal-50 dark:from-teal-900/20 to-emerald-50/40 dark:to-emerald-900/10 border-b border-rose-100/30 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-sm shadow-inner">
            🌿
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 leading-none font-sans">
              Ozy Teman Curhat
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bicaraan Ringan • Hangat & Menenangkan</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mulai Ulang / Reset Conversation Button */}
          <button
            onClick={handleResetChat}
            className={`flex items-center gap-1 text-[10px] font-bold transition-colors px-2.5 py-1.5 rounded-lg cursor-pointer ${
              confirmReset 
                ? "bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700" 
                : "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700"
            }`}
            title="Mulai Ulang Percakapan"
          >
            <RotateCcw className={`w-3 h-3 ${confirmReset ? "animate-spin" : ""}`} />
            {confirmReset ? "Yakin Reset?" : "Mulai Ulang"}
          </button>

          {onNavigateToHotlines && (
            <button
              onClick={onNavigateToHotlines}
              className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors px-2.5 py-1.5 rounded-lg cursor-pointer"
            >
              <Phone className="w-3 h-3" />
              Butuh Bantuan?
            </button>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/40 dark:bg-slate-900/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start animate-fade-in"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs inline-block leading-relaxed ${
                msg.role === "user"
                  ? "bg-teal-700 text-white dark:bg-teal-600 rounded-br-sm shadow-sm"
                  : msg.crisisTriggered
                  ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.015)]"
                  : "bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.015)]"
              }`}
            >
              <div className={`text-[12.5px] leading-relaxed font-sans ${msg.role === "user" ? "text-white" : "text-slate-850 dark:text-slate-200"}`}>
                {msg.role === "model" ? (
                  <div className="markdown-body [&>p]:mb-2 last:[&>p]:mb-0 [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
                    <Markdown rehypePlugins={[rehypeSanitize]}>{settings.profanityFilter ? filterProfanity(msg.text) : msg.text}</Markdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-line">{settings.profanityFilter ? filterProfanity(msg.text) : msg.text}</div>
                )}
              </div>

              {/* Robust Local SVM Intent Analysis & Sugesti Box inside chatbot */}
              {msg.role === "model" && msg.svmResult && (
                <div className="mt-3 pt-3 border-t border-slate-150/70 dark:border-slate-700/70 space-y-2.5 text-slate-750 dark:text-slate-300">
                  {settings.showInternalAnalysis && (
                    <details className="group">
                      <summary className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer list-none flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors [&::-webkit-details-marker]:hidden">
                        <span className="group-open:rotate-90 transition-transform text-[8px] inline-block">▶</span>
                        Lihat Analisis Sentimen Internal
                      </summary>
                      <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 mt-2">
                        <span className="text-[10.5px] font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1 animate-pulse">
                          <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-500 fill-teal-600/10 dark:fill-teal-500/10" />
                          SVM Emotion: {msg.svmResult.primaryEmotion}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          msg.svmResult.sentimentScore <= 3 ? "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800" :
                          msg.svmResult.sentimentScore <= 5 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800" :
                          "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        } border`}>
                          Tingkat Keseimbangan: {msg.svmResult.sentimentScore}/10
                        </span>
                      </div>
                    </details>
                  )}

                  {settings.showQuotes && msg.svmResult.sentimentScore < 5 && msg.svmResult.summaryQuote && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-amber-50/40 dark:bg-amber-900/20 p-2.5 rounded-xl border-l-2 border-teal-600/40 dark:border-teal-500/40">
                      💡 &ldquo;{msg.svmResult.summaryQuote}&rdquo;
                    </div>
                  )}

                  {settings.showSuggestions && msg.svmResult.sentimentScore < 5 && (
                    <div className="space-y-1">
                      <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 block">💡 Sugesti & Rekomendasi Pemulihan:</span>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5 pl-0.5 font-sans">
                        {msg.svmResult.suggestions.map((sug, i) => (
                          <li key={i} className="leading-relaxed list-none flex items-start gap-1">
                            <span className="text-teal-600 dark:text-teal-500 mt-0.5">✔</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Immediate Counselor Advisory reminder if needed */}
                  {msg.svmResult.requiresCounselor && (
                    <div className="bg-rose-100/50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-2.5 rounded-xl space-y-1 mt-1.5">
                      <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-400 text-[10.5px] font-bold">
                        <Phone className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" />
                        Peringatan Himbauan Konselor:
                      </div>
                      <p className="text-[10.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        Kami sangat menganjurkan Anda menghubungi psikolog atau psikiater klinis berlisensi di area terdekat Anda jika masalah ini terasa terus-menerus membelenggu jiwamu. Anda layak bahagia.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className={`mt-1.5 text-[9px] opacity-70 text-right font-mono ${msg.role === "user" ? "text-teal-100" : "text-slate-400 dark:text-slate-500"}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-2.5 rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-bounce delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-bounce" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono italic ml-1">Ozy sedang menyimak...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Safety Alert Warning block */}
      <AnimatePresence>
        {crisisActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2.5 bg-rose-600 dark:bg-rose-700 text-white text-[11px] leading-snug flex flex-col items-stretch space-y-1"
          >
            <div className="flex items-start gap-1.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-100 mt-0.5" />
              <div className="flex-1 font-sans">
                <span className="font-bold block">🚨 Peringatan Hubungi Konselor Professional</span>
                Jika kamu sedang merasa sangat hancur dan ingin melukai diri, mohon hubungi SEJIWA **119 (Tekan 8)** atau kunjungi tab Layanan Psikolog untuk rujukan resmi gratis.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Curhat Starter Button Recommendations */}
      <div className="px-4 py-2.5 bg-gradient-to-b from-slate-50 dark:from-slate-900/50 to-white dark:to-slate-850 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
        {activeStarters.map((starter, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading || crisisActive}
            onClick={() => handleSendMessage(starter.text)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1.5 px-3.5 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-teal-50/50 dark:hover:bg-teal-900/30 hover:border-teal-200 dark:hover:border-teal-700/50 hover:text-teal-800 dark:hover:text-teal-300 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <span>{starter.icon}</span>
            <span>{starter.text}</span>
          </button>
        ))}
      </div>

      {/* Chat Input Field Container */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-inner">
        {crisisActive ? (
          <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-rose-700 dark:text-rose-400 font-bold mb-2">
              Percakapan dihentikan demi keselamatanmu.
            </p>
            <button
              onClick={handleResetChat}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold py-1.5 px-4 rounded-lg shadow-sm transition-colors"
            >
              Mulai Ulang Percakapan
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmitForm} className="flex flex-col gap-1.5">
            <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              placeholder="Ketik curahan hatimu di sini..."
              maxLength={MAX_MESSAGE_LENGTH + 50}
              className={`flex-1 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 transition-all font-sans ${
                charLimitExceeded
                  ? "border-rose-400 dark:border-rose-600 focus:ring-rose-500"
                  : "border-slate-200 dark:border-slate-700 focus:ring-teal-600 dark:focus:ring-teal-500"
              }`}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim() || charLimitExceeded}
              className="bg-teal-700 dark:bg-teal-600 hover:bg-teal-800 dark:hover:bg-teal-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer font-sans"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim
            </button>
            </div>
            {charCount > 0 && (
              <div className={`text-right text-[10px] pr-1 transition-colors ${charCountColor}`}>
                {charCount}/{MAX_MESSAGE_LENGTH}
                {charLimitExceeded && (
                  <span className="ml-1.5">— Pesan terlalu panjang</span>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
