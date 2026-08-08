const fs = require('fs');

const extraWords = {
  positive: {
    "salam": 1.0, "permisi": 1.0, "kamsahamnida": 1.0, "arigato": 1.0, "thanks": 1.5, "tengkyu": 1.5,
    "makasih": 1.5, "mksh": 1.5, "gomawo": 1.0, "syukur": 2.0, "woke": 1.0, "sip": 1.5, "okey": 1.0,
    "k": 0.5, "yaps": 1.0, "hooh": 1.0, "heeh": 1.0, "iyaa": 1.0, "yoi": 1.0, "mantul": 2.0, "keren bgt": 2.0,
    "keren bngd": 2.0, "anjas": 1.5, "kece": 2.0, "cakep": 1.5, "asik": 1.5, "asikk": 1.5, "jos": 2.0, "gokil": 2.0,
    "keren parah": 2.5, "the best": 2.5, "daebak": 2.0, "terimakasih": 1.5, "thx": 1.0, "tq": 1.0, "suwun": 1.5,
    "hatur nuhun": 1.5, "maacih": 1.5, "makacih": 1.5, "nuhun": 1.5, "oke siap": 1.5, "siapp": 1.5, "sabi": 1.5,
    "gas": 1.5, "gass": 1.5, "cuan": 2.0, "lancar": 1.5, "alhamdulillah cair": 2.5, "aman sentosa": 2.0,
    "semangat pagi": 2.0, "met pagi": 1.0, "met siang": 1.0, "met malem": 1.0, "selamat pagi": 1.0,
    "selamat malam": 1.0, "selamat sore": 1.0, "met sore": 1.0, "good morning": 1.0, "good night": 1.0,
    "selamat tidur": 1.0, "selamat makan": 1.0, "enak": 1.5, "mantab": 2.0, "gurih": 1.5, "kocak": 1.5,
    "ngakak": 1.5, "lucu": 1.5, "wkwk": 1.0, "wkwkwk": 1.5, "xixi": 1.0, "haha": 1.0, "hahaha": 1.5,
    "awokawok": 1.5, "hehe": 1.0, "he": 0.5, "heum": 0.5, "salam kenal": 1.5, "salken": 1.5,
    "nice to meet you": 1.5, "ntmy": 1.5, "nice": 2.0, "bagus banget": 2.5, "perfect": 2.5,
    "sempurna": 2.5, "ajaib": 2.0, "memukau": 2.0, "luar biasa bgt": 2.5, "spektakuler": 2.5, "epic": 2.0,
    "epik": 2.0, "cemerlang": 2.0, "jenius": 2.0, "suka": 2.0, "suka bgt": 2.5, "cinta banget": 2.5,
    "lov": 1.5, "luv": 1.5, "gemesh": 2.0, "gemas": 2.0, "imut": 1.5, "cantik": 1.5, "ganteng": 1.5,
    "cakep bgt": 2.0, "anjay": 1.5, "anjayy": 1.5, "wih": 1.5, "widih": 1.5, "gile": 1.5, "gila lu": 1.5,
    "keren lu": 2.0, "mantap jiwa": 2.5, "manjiw": 2.5, "sikat": 1.5, "sikat miring": 1.5, "bisa": 1.5,
    "pasti bisa": 2.5, "bismillah": 2.0, "insyaallah": 2.0, "astaghfirullah": 1.5, "subhanallah": 2.0,
    "masyaallah": 2.0, "berkah": 2.5, "barokah": 2.5, "sukses selalu": 2.5, "sehat selalu": 2.5,
    "lancar terus": 2.5, "doa terbaik": 2.5, "aamiin": 2.0, "amin": 2.0, "gbu": 2.0, "god bless you": 2.0,
    "aleluya": 2.0, "haleluya": 2.0, "om swastiastu": 2.0, "namo buddhaya": 2.0, "salam kebajikan": 2.0,
    "rahayu": 2.0, "hore": 2.0, "yeay": 2.0, "yey": 2.0, "yippi": 2.0, "yuhu": 2.0, "cring": 1.0,
    "cling": 1.0, "berseri": 2.0, "ceria": 2.0, "riang": 2.0, "gembira": 2.5, "sukacita": 2.5,
    "suka cita": 2.5, "terharu": 2.0, "terharu bgt": 2.5, "nangis bahagia": 2.5, "sweet": 2.0, "manis": 2.0,
    "romantis": 2.0, "unyu": 1.5, "kiyowo": 2.0, "kkiyowo": 2.0, "jjang": 2.0, "jinjja": 1.5,
    "saranghae": 2.0, "saranghaeyo": 2.0, "borahae": 2.0, "senyum": 1.5, "smile": 1.5, "ketawa": 1.5,
    "ngakak abis": 2.0, "terpingkal": 2.0, "guling guling": 2.0, "rotfl": 2.0, "lmao": 2.0, "lol": 2.0,
    "canda": 1.5, "bercanda": 1.5, "just kidding": 1.5, "jk": 1.0, "gabut": 1.0, "santai": 1.5,
    "chill": 1.5, "sans": 1.5, "nyantai": 1.5, "rileks": 2.0, "rebahan": 1.5, "me time": 2.0,
    "healing": 2.0, "piknik": 2.0, "liburan": 2.0, "jalan jalan": 1.5, "kongkow": 1.5, "nongki": 1.5,
    "nongkrong": 1.5, "ngopi": 1.5, "ngabuburit": 1.5, "sahur": 1.0, "buka puasa": 1.0, "bukber": 1.5,
    "makan enak": 2.5, "kenyang": 1.5, "alhamdulillah kenyang": 2.0, "segar": 1.5, "seger": 1.5, "fresh": 1.5
  },
  crisis: {
    "akhiri hdp": 4.0, "bunuh diri": 5.0, "gantung diri": 5.0, "minum racun": 5.0, "loncat": 4.0,
    "terjun bebas": 4.0, "mati aja": 4.5, "mati ajalah": 4.5, "gk mau idup": 4.0, "nyusul tuhan": 3.5,
    "nyusul alm": 3.5, "tamat": 3.0, "koid": 3.0, "modar": 3.0, "mampus": 3.0, "mati gantung": 5.0,
    "makan baygon": 5.0, "minum baygon": 5.0, "nyilet tangan": 4.5, "lukai diri": 4.0, "nyayat tangan": 4.5,
    "self harm": 4.5, "sh": 3.5, "cutting": 3.5, "overdosis": 4.5, "od": 4.0, "pengen ngilang": 3.5,
    "ilang aja": 3.5, "lenyap": 3.5, "mati bunuh": 5.0, "mau modar": 4.0, "akhiri penderitaan": 4.5,
    "akhiri nyawa": 5.0, "kematian": 3.5, "menunggu ajal": 4.0, "jemput ajal": 4.5
  },
  anxiety: {
    "gelisah": 2.0, "resah": 2.0, "gulana": 2.0, "gundah": 2.0, "cemas bgt": 3.0, "overthinking": 2.5,
    "kepanikan": 2.5, "panik": 2.0, "panic attack": 3.0, "serangan panik": 3.0, "sesak nafas": 2.5,
    "sesek": 2.0, "napas ngos ngosan": 2.0, "dada sesak": 2.0, "jantung berdebar": 2.0,
    "keringat dingin": 2.0, "keringatan": 1.5, "gemetaran": 2.0, "merinding": 1.5, "takut bgt": 2.5,
    "merasa terancam": 3.0, "parno": 2.0, "was was": 2.0, "waswas": 2.0, "khawatir": 2.0, "kuatir": 2.0,
    "cemas berlebih": 3.0, "gelagapan": 2.0, "bingung": 1.5, "linglung": 2.0, "blank": 1.5,
    "pikiran kosong": 2.0, "gugup": 1.5, "nervous": 1.5, "grogi": 1.5, "minder bgt": 2.5, "gemper": 2.0,
    "ketar ketir": 2.0, "dag dig dug": 2.0, "seram": 1.5, "syerem": 1.5, "serem": 1.5, "ngerih": 1.5,
    "ngeri": 1.5, "merinding disko": 1.5, "fobia": 2.0, "phobia": 2.0, "trauma": 3.0, "kepikiran": 2.0,
    "kepala penuh": 2.0, "mumet": 2.0, "mumet ndase": 2.0, "suntuk": 2.0
  },
  burnout: {
    "burn out bgt": 3.0, "cape kerja": 2.5, "cape kuliah": 2.5, "cape idup": 3.0, "lelah mental": 3.0,
    "mental breakdown": 3.5, "lelah pikiran": 2.5, "otak buntu": 2.0, "gak kuat": 2.5, "gk kuat lagi": 3.0,
    "nyerah": 2.5, "menyerah": 2.5, "give up": 2.5, "pasrah": 2.0, "bodo amat": 1.5, "capek batin": 2.5,
    "batin lelah": 2.5, "letih": 2.0, "lesu": 2.0, "lunglai": 2.0, "ngedrop": 2.5, "drop bgt": 3.0,
    "gairah ilang": 2.5, "hilang motivasi": 2.5, "demotivasi": 2.5, "gak ada semangat": 2.5,
    "males ngapa ngapain": 2.0, "mager parah": 2.0, "burnout syndrome": 3.0, "overwork": 2.5,
    "kelelahan": 2.5, "tekanan batin": 3.0, "stres": 2.5, "stress bgt": 3.0, "depresi": 3.5,
    "depresi ringan": 3.0, "depresi berat": 4.0, "sakit jiwa": 2.5, "gilaa": 2.0, "pengen teriak": 2.5,
    "pengen nangis aja": 2.5, "lelah hayati": 2.5, "lelah banget": 2.5, "capek pol": 2.5,
    "pegel linu": 2.0, "remuk redam": 2.5
  },
  sadness: {
    "nangis kejer": 3.0, "air mata": 2.0, "banjir air mata": 2.5, "mata bengkak": 2.0, "menangis": 2.0,
    "tersedu sedu": 2.5, "sesenggukan": 2.5, "isak tangis": 2.5, "meratap": 2.5, "sedih bgt": 3.0,
    "pilu rasanya": 2.5, "nyesek di dada": 2.5, "sakit di dada": 2.5, "teriris": 2.5, "tersayat": 2.5,
    "luka batin": 3.0, "patah hati": 2.5, "hancur lebur": 3.0, "remuk": 2.5, "ambyar rasanya": 2.5,
    "galau maksimal": 2.5, "galau parah": 2.5, "nelangsa": 2.5, "merana bgt": 2.5, "derita": 2.5,
    "menderita": 3.0, "sengsara": 3.0, "apes": 2.0, "sial": 2.0, "nasib buruk": 2.5, "kemalangan": 2.5,
    "duka cita": 2.5, "kemurungan": 2.0, "murung": 2.0, "melankolis": 2.0, "mendung": 1.5,
    "kelabu": 1.5, "sedih tak berujung": 3.0, "sendu": 2.0, "syahdu": 1.5, "galau merana": 2.5,
    "baper": 2.0, "terbawa perasaan": 2.0, "emosional": 2.0, "cengeng": 2.0
  },
  relationship: {
    "diselingkuhin lagi": 3.5, "ketahuan selingkuh": 3.0, "tukang selingkuh": 3.0, "buaya": 2.0,
    "fakboy": 2.0, "fuckboy": 2.0, "playboy": 2.0, "cewe gatel": 2.5, "pelakor murahan": 3.0,
    "pebinor": 3.0, "kandas": 2.5, "putus cinta": 2.5, "cerai": 3.5, "gugat cerai": 3.5,
    "talak": 3.5, "pisang ranjang": 3.0, "pisah": 2.5, "ditinggalin": 2.5,
    "ditinggal pas lagi sayang sayangnya": 3.0, "dighosting lagi": 2.5, "tukang ghosting": 2.5,
    "pemberi harapan palsu": 2.5, "php": 2.0, "di php in": 2.0, "cinta sepihak": 2.5,
    "tepuk sebelah tangan": 2.5, "gak dianggep": 2.5, "diabaikan": 2.5, "dicuekin": 2.0,
    "cuek": 1.5, "dingin": 1.5, "berubah": 1.5, "dia berubah": 2.0, "berantem terus": 2.5,
    "cekcok": 2.0, "adu mulut": 2.0, "baku hantam": 3.0, "kdrt": 4.0, "kasar": 2.5,
    "main tangan": 3.5, "toxic relationship": 3.0, "red flag bgt": 2.5, "manipulatif": 3.0,
    "gaslighting": 3.0, "guilt tripping": 3.0, "cemburu": 2.0, "cemburu buta": 2.5, "posesif": 2.5,
    "mengekang": 2.5, "gak dikasih kebebasan": 2.5, "dilarang larang": 2.0, "mertua rese": 2.5,
    "ipar toxic": 2.5, "ipar rese": 2.5, "keluarga ikut campur": 2.5, "mertua ikut campur": 2.5,
    "dijodohin": 2.5, "kawin paksa": 3.0, "batal nikah": 3.5, "gagal nikah": 3.5, "selingkuhan": 3.0
  },
  academic: {
    "dosen killer": 2.5, "dosen rese": 2.0, "dosen ga jelas": 2.0, "revisi terus": 2.5, "revisi mulu": 2.5,
    "dicoret coret": 2.0, "sidang gagal": 3.0, "ngulang matkul": 2.5, "ngulang semester": 2.5,
    "ip turun": 2.5, "ipk anjlok": 2.5, "nilai jelek": 2.0, "d": 1.5, "e": 1.5, "gak lulus": 2.5,
    "tidak lulus": 2.5, "tinggal kelas": 2.5, "gak naik kelas": 2.5, "do": 2.0, "drop out dari kampus": 3.5,
    "skripsi stuck": 2.5, "skripsi mandek": 2.5, "dosen susah ditemui": 2.0, "gak di acc": 2.5,
    "ditolak": 2.0, "judul ditolak": 2.5, "tugas numpuk": 2.0, "deadline": 1.5, "begadang tugas": 2.0,
    "laporan": 1.0, "praktikum": 1.0, "jurnal": 1.0, "makalah": 1.0, "presentasi": 1.0,
    "takut presentasi": 2.0, "gugup ujian": 2.0, "nyontek": 2.0, "ketahuan nyontek": 3.0,
    "plagiat": 3.0, "turnitin": 2.0, "spp nunggak": 2.5, "ukt mahal": 2.5, "gak bisa bayar ukt": 3.0,
    "cuti kuliah": 2.0, "bolos": 1.5, "bolos sekolah": 2.0, "bolos kuliah": 2.0, "titip absen": 1.5,
    "ta": 1.0, "bolos kelas": 2.0, "males kuliah": 2.0, "salah jurusan": 2.5, "nesu": 1.5, "gapyear": 2.0
  },
  family: {
    "broken home": 3.0, "ortu cerai": 3.0, "bapak kasar": 3.5, "ibu kasar": 3.5, "dianiaya": 4.5,
    "dipukul ortu": 4.0, "dimarahi ortu": 2.5, "diomelin": 2.0, "dibanding bandingin": 2.5,
    "pilih kasih": 2.5, "anak tiri": 2.0, "anak angkat": 2.0, "gak disayang": 3.0,
    "gak dipedulikan": 3.0, "ortu toxic": 3.0, "toxic family": 3.0, "keluarga hancur": 3.5,
    "rumah neraka": 3.5, "kabur dari rumah": 3.5, "minggat": 3.0, "diusir ortu": 3.5,
    "dicoret dari kk": 3.5, "gak dianggep anak": 3.5, "anak durhaka": 3.0, "beban keluarga": 3.0,
    "beban ortu": 3.0, "anak tulang punggung": 2.5, "sandwich generation": 2.5,
    "generasi sandwich": 2.5, "biayain keluarga": 2.0, "ortu banyak utang": 3.0,
    "ditagih utang ortu": 3.0, "keluarga berantakan": 3.5, "kakak egois": 2.0, "adik nakal": 1.5,
    "berantem sama sodara": 2.5, "ribut warisan": 3.0, "rebutan warisan": 3.0, "keluarga miskin": 2.5
  },
  anger: {
    "marah besar": 3.0, "murka abis": 3.0, "mengamuk": 3.0, "emosi meledak": 3.0, "naik pitam": 2.5,
    "darah tinggi": 2.0, "kesal": 2.0, "sebal": 2.0, "mangkel": 2.0, "gondok": 2.0, "dongkol bgt": 2.5,
    "jengkelin": 2.0, "nyebelin": 2.0, "bangke": 2.5, "keparat": 3.0, "jancok": 3.0, "jancuk": 3.0,
    "cok": 2.0, "dancok": 3.0, "pante": 2.5, "puki": 3.0, "memek": 3.0, "kontol": 3.0, "kntl": 2.5,
    "mmk": 2.5, "ajg": 2.5, "bgsd": 2.5, "anjeng": 2.5, "asu tenan": 3.0, "asem": 1.5, "sialan lu": 2.5,
    "brengsek": 3.0, "kurang ajar": 2.5, "gak tau diri": 2.5, "gak ada otak": 3.0, "tolol bgt": 2.5,
    "goblok bgt": 2.5, "bego lu": 2.5, "bodo lu": 2.0, "idiot": 2.5, "cacat lu": 3.0, "sampah": 2.5,
    "sampah masyarakat": 3.0, "babi lu": 3.0, "monyet": 2.0, "kunyuk": 2.0, "setan": 2.5, "iblis": 2.5,
    "dajjal": 3.0, "laknat": 3.0, "celaka": 2.5, "bajingan tengik": 3.5, "kampang": 3.0, "kimak": 3.0,
    "pantat": 2.0, "ngentot": 3.0, "ngewe": 3.0, "sange": 2.5, "bacot": 2.5, "bct": 2.0,
    "berisik": 2.0, "brisik": 2.0, "diam lu": 2.5, "bacot lu": 2.5, "nyolot": 2.5
  },
  grief: {
    "meninggal dunia": 3.5, "wafat mendadak": 3.5, "pergi untuk selamanya": 3.5, "tutup usia": 3.0,
    "mati syahid": 3.0, "almarhum bapak": 3.0, "almarhumah ibu": 3.0, "ditinggal selamanya": 3.5,
    "kangen almarhum": 3.0, "kangen alm": 3.0, "doa untuk almarhum": 2.5, "ziarah": 2.0,
    "makam": 2.0, "kubur": 2.0, "batu nisan": 2.0, "tanah kubur": 2.0, "tabur bunga": 2.0,
    "tahlil": 2.0, "yasinan": 2.0, "buku yasin": 1.5, "bela sungkawa": 2.5, "turut berduka": 2.5,
    "berduka cita": 3.0, "nangis di makam": 3.5, "peluk nisan": 3.5, "kehilangan orang tua": 3.5,
    "yatim": 2.5, "piatu": 2.5, "yatim piatu": 3.0, "janda mati": 3.0, "duda mati": 3.0,
    "keguguran": 4.0, "bayi meninggal": 4.5, "kematian anak": 4.5, "mati muda": 3.5,
    "kecelakaan maut": 3.5, "meninggal kecelakaan": 3.5, "meninggal sakit": 3.5,
    "hilang nyawa": 3.5, "kematian": 3.0, "mati": 2.5, "maut": 2.5
  },
  selfesteem: {
    "insecure parah": 3.0, "gak pede": 2.5, "merasa jelek": 2.5, "muka jelek": 2.5,
    "muka jerawatan": 2.5, "jerawat": 1.5, "gendut bgt": 2.0, "obesitas": 2.0, "terlalu kurus": 2.0,
    "kerempeng": 2.0, "pesek": 1.5, "hitam": 1.5, "dekil": 2.0, "buluk": 2.0, "burik banget": 2.5,
    "gak good looking": 2.5, "good looking": 1.5, "privilege": 1.5, "gak punya privilege": 2.5,
    "miskin jelek": 3.0, "bodoh bgt": 2.5, "otak udang": 2.5, "lamban": 2.0, "lemot": 2.0,
    "telmi": 2.0, "tulalit": 2.0, "gak bisa apa apa": 3.0, "gak becus": 3.0, "selalu salah": 2.5,
    "menyusahkan": 3.0, "nambah beban": 3.0, "benalu": 3.0, "parasit": 3.0,
    "gak berguna sama sekali": 3.5, "sampah": 2.5, "hina": 3.0, "rendahan": 3.0, "kasta bawah": 2.5,
    "rakyat jelata": 2.0, "pecundang sejati": 3.5, "selalu kalah": 3.0, "gagal terus": 3.0,
    "loser bgt": 3.0, "gak pantas bahagia": 3.5, "gak layak": 3.5, "rendah diri": 3.0, "caper": 2.0,
    "cari perhatian": 2.0, "pansos": 2.0, "sok cantik": 2.0, "sok ganteng": 2.0
  },
  financial: {
    "miskin melarat": 3.0, "kere hore": 2.0, "gak ada duit sama sekali": 3.0, "dompet kosong": 2.5,
    "atm kosong": 2.5, "saldo nol": 2.5, "bokek parah": 2.5, "utang numpuk": 3.5,
    "terlilit utang": 3.5, "gali lobang tutup lobang": 3.0, "pinjol ilegal": 3.5, "diteror pinjol": 4.0,
    "ditagih dc": 4.0, "debt collector": 3.5, "rentenir jahat": 3.5, "bunga pinjol": 3.0,
    "galbay pinjol": 3.5, "gagal bayar": 3.0, "telat bayar": 2.5, "jatuh tempo": 2.5,
    "nunggak angsuran": 3.0, "kredit macet": 3.0, "disita bank": 3.5, "rumah disita": 4.0,
    "motor ditarik": 3.5, "bangkrut total": 3.5, "usaha hancur": 3.5, "gulung tikar": 3.0,
    "di phk": 3.5, "kena phk": 3.5, "dipecat": 3.0, "nganggur lama": 3.0, "pengangguran akut": 3.0,
    "susah cari kerja": 3.0, "loker": 1.5, "gak dapet kerja": 3.0, "gaji dipotong": 2.5,
    "gaji telat": 2.5, "belum gajian": 2.5, "gaji kecil": 2.5, "umr kecil": 2.5, "pas pasan": 2.0,
    "gak cukup makan": 3.5, "kelaparan": 3.5, "gak bisa beli susu": 3.0, "krisis moneter": 2.5
  },
  physical: {
    "sakit parah": 3.5, "sakit keras": 3.5, "kritis": 4.0, "koma": 4.0, "icu": 3.5, "ugd": 3.0,
    "rawat inap": 2.5, "operasi": 3.0, "bedah": 3.0, "amputasi": 4.0, "kanker": 4.0, "tumor": 3.5,
    "stroke": 3.5, "jantung koroner": 3.5, "ginjal": 3.0, "cuci darah": 3.5, "paru paru": 2.5,
    "tbc": 3.0, "asma": 2.5, "sesak nafas": 3.0, "covid": 2.5, "corona": 2.0, "demam berdarah": 2.5,
    "dbd": 2.5, "tipes": 2.0, "tifus": 2.0, "malaria": 2.5, "sakit gigi": 2.0, "nyeri sendi": 2.0,
    "asam urat": 2.0, "kolesterol": 2.0, "darah tinggi": 2.5, "hipertensi": 2.5, "diabetes": 2.5,
    "gula darah": 2.0, "luka parah": 3.5, "patah tulang": 3.5, "berdarah": 2.5, "muntah darah": 3.5,
    "pingsan": 3.0, "tak sadarkan diri": 3.5, "kram": 2.0, "kejang": 3.0, "lumpuh": 4.0,
    "cacat fisik": 3.5, "buta": 3.5, "tuli": 3.0, "bisu": 3.0, "alergi": 2.0, "gatal gatal": 1.5, "biduran": 1.5
  },
  existential: {
    "kehampaan": 3.0, "kekosongan jiwa": 3.0, "mati rasa": 3.0, "numb": 3.0,
    "gak ngerasa apa apa": 3.0, "hambar": 2.5, "hidup hambar": 2.5, "gak ada tujuan": 3.0,
    "tersesat dalam hidup": 3.0, "krisis identitas": 3.0, "quarter life crisis": 2.5,
    "midlife crisis": 3.0, "krisis usia": 2.5, "bingung masa depan": 2.5, "takut masa depan": 3.0,
    "gelap": 2.0, "jalan buntu": 3.0, "gak tau arah": 2.5, "gak jelas": 2.0, "hidup gak jelas": 2.5,
    "absurd": 2.0, "sia sia": 2.5, "percuma": 2.5, "buat apa hidup": 3.5, "untuk apa lahir": 3.5,
    "menyesal lahir": 3.5, "menyalahkan takdir": 3.0, "marah sama tuhan": 3.5,
    "gak percaya tuhan": 3.0, "ateis": 2.5, "agnostik": 2.0, "kehilangan iman": 3.0,
    "jauh dari tuhan": 3.0, "dosa besar": 3.0, "ahli neraka": 3.0, "takut neraka": 3.0,
    "kiamat": 2.5, "akhir zaman": 2.5
  },
  addiction: {
    "kecanduan parah": 3.5, "candu bgt": 3.0, "narkotik": 3.5, "obat terlarang": 3.5, "ekstasi": 3.0,
    "inex": 3.0, "pil koplo": 3.0, "tramadol": 3.0, "alprazolam": 3.0, "dumolid": 3.0, "ganja": 3.0,
    "cimeng": 3.0, "tembakau gorila": 3.5, "sabu sabu": 3.5, "nyabu bareng": 3.5,
    "pesta narkoba": 4.0, "sakaw": 4.0, "sakau bgt": 4.0, "overdosis narkoba": 4.5, "od narkoba": 4.5,
    "rehab": 3.0, "rehabilitasi": 3.0, "kecanduan alkohol": 3.0, "pemabuk": 3.0, "tukang mabok": 3.0,
    "minuman keras": 3.0, "oplosan": 3.5, "mabuk kepayang": 2.5, "judi slot": 3.5, "zeus": 2.5,
    "pragmatic": 2.5, "scatter": 2.0, "maxwin": 2.0, "rungkad": 3.0, "rungkad terus": 3.0,
    "depo terus": 3.0, "wd": 2.0, "withdraw": 2.0, "kalah judi": 3.0, "utang judi": 3.5,
    "kecanduan bokep": 3.5, "nonton porno": 3.0, "video porno": 3.0, "link bokep": 3.0, "vcs": 3.0,
    "open bo": 3.0, "michat": 2.5, "lont": 2.5, "lonte": 2.5, "psk": 3.0, "pelacur": 3.0,
    "jablay": 2.5, "kecanduan game": 2.5, "mabar terus": 2.0, "begadang game": 2.0,
    "kecanduan sosmed": 2.5, "fomo": 2.0
  }
};

let content = fs.readFileSync('src/utils/svmClassifier.ts', 'utf8');

Object.keys(extraWords).forEach(cat => {
  const newWordsObj = extraWords[cat];
  const keys = Object.keys(newWordsObj);
  
  let injectStr = keys.map(k => `"${k}": ${newWordsObj[k]}`).join(',\n      ');
  
  const regexStr = `category: "${cat}",(.*?)weights: \\{(.*?)\\}`;
  const regex = new RegExp(regexStr, 'gs');
  
  content = content.replace(regex, (match, p1, p2) => {
    const newWeights = p2.trim().endsWith(',') ? p2 + '\n      ' + injectStr : p2 + ',\n      ' + injectStr;
    return `category: "${cat}",${p1}weights: {${newWeights}}`;
  });
});

fs.writeFileSync('src/utils/svmClassifier.ts', content, 'utf8');
