"use client";

import { useEffect, useMemo, useState } from "react";

const CONTACT_WEBHOOK = "https://hook.eu1.make.com/lsu9uh21a5adryscrbb1dugri9ddxuca";

const C = {
  sun: "#4CAF50",
  sunLight: "#F1F8F1",
  sunDark: "#2E7D32",
  gray: "#4A4A4A",
  grayLight: "#F2F2F2",
  grayMid: "#E0E0E0",
  white: "#FFFFFF",
  text: "#1E1E1E",
  muted: "#8A8A8A",
  red: "#D32F2F",
  green: "#4CAF50",
  blue: "#1565C0",
  orange: "#E65100",
  teal: "#00695C",
  purple: "#4527A0",
  climate: "#1A7A5E",
  traditional: "#8A6A43",
};

const MODULES = [
  {
    id: "energy",
    title: "Resource Energy",
    icon: "⚡",
    accent: C.sun,
    short: "Energetikai és megújuló energia előszűrés.",
    description:
      "Lakó-, társasházi és céges épületek energetikai felmérése: napelem, hőszivattyú, szigetelés, nyílászáró, vízgazdálkodás és megtérülés.",
    button: "Energetikai felmérés indítása",
  },
  {
    id: "build",
    title: "Resource Build",
    icon: "🏗️",
    accent: C.orange,
    short: "Felújítási és kivitelezési projekt-előkészítés.",
    description:
      "Projektindítás, szakági igény, költségsáv, kivitelezői partnerkeresés, műszaki előkészítés és projektmenedzsment támogatás.",
    button: "Építési projekt indítása",
  },
  {
    id: "traditional",
    title: "Resource Traditional",
    icon: "◌",
    accent: C.traditional,
    short: "Hagyományos és természetes építési technológiájú házak.",
    description:
      "Vályog-, vert falú, kő-, vegyes falazatú, régi tömör tégla- és favázas épületek biztonságos felújítási előszűrése.",
    button: "Hagyományos épület felmérése",
  },
  {
    id: "climate",
    title: "Resource Climate",
    icon: "🌿",
    accent: C.climate,
    short: "Klímabiztonsági, vízstratégiai és adaptációs felmérés.",
    description:
      "Hőhullám, túlmelegedés, aszály, vízbiztonság, esővízgyűjtés, zöldfelület, árnyékolás és mikroklíma-fejlesztési javaslatok.",
    button: "Klímafelmérés indítása",
  },
];

const ENERGY_FLOWS = [
  {
    id: "residential",
    title: "Lakóépület",
    icon: "🏠",
    description: "Családi ház, lakás, nyaraló vagy vidéki birtok energetikai előszűrése.",
  },
  {
    id: "commercial",
    title: "Vállalkozás / céges épület",
    icon: "🏢",
    description: "Iroda, üzlet, vendéglátóhely, raktár, telephely vagy üzem energetikai felmérése.",
  },
  {
    id: "multiunit",
    title: "Társasház / panelház",
    icon: "🏘️",
    description: "Társasházak, panelházak és lakóközösségek energetikai és vízgazdálkodási előszűrése.",
  },
];

const COMMON_COUNTRIES = [
  "Magyarország",
  "Franciaország",
  "Németország",
  "Ausztria",
  "Olaszország",
  "Spanyolország",
  "Portugália",
  "Egyéb",
];

const BLOCKS = {
  residential: [
    { id: "helyszin", label: "Helyszín", color: C.blue },
    { id: "epulet", label: "Épület", color: C.blue },
    { id: "fogyasztas", label: "Fogyasztás", color: C.orange },
    { id: "rendszerek", label: "Rendszerek", color: C.teal },
    { id: "celok", label: "Célok", color: C.sun },
  ],
  commercial: [
    { id: "helyszin", label: "Helyszín", color: C.blue },
    { id: "epulet", label: "Épület", color: C.blue },
    { id: "fogyasztas", label: "Fogyasztás", color: C.orange },
    { id: "rendszerek", label: "Rendszerek", color: C.teal },
    { id: "celok", label: "Célok", color: C.sun },
  ],
  multiunit: [
    { id: "helyszin", label: "Helyszín", color: C.blue },
    { id: "epulet", label: "Épület", color: C.blue },
    { id: "fogyasztas", label: "Fogyasztás", color: C.orange },
    { id: "kozos", label: "Közös részek", color: C.teal },
    { id: "celok", label: "Célok", color: C.sun },
  ],
  build: [
    { id: "helyszin", label: "Helyszín", color: C.blue },
    { id: "projekt", label: "Projekt", color: C.orange },
    { id: "munka", label: "Munkák", color: C.teal },
    { id: "penzugy", label: "Pénzügy", color: C.sun },
    { id: "tamogatas", label: "Támogatás", color: C.purple },
  ],
  traditional: [
    { id: "helyszin", label: "Helyszín", color: C.blue },
    { id: "szerkezet", label: "Szerkezet", color: C.traditional },
    { id: "nedvesseg", label: "Nedvesség", color: C.teal },
    { id: "felujitas", label: "Felújítás", color: C.orange },
    { id: "celok", label: "Célok", color: C.sun },
  ],
  climate: [
    { id: "helyszin", label: "Helyszín", color: C.blue },
    { id: "telek", label: "Telek", color: C.climate },
    { id: "viz", label: "Víz", color: C.teal },
    { id: "ho", label: "Hő", color: C.orange },
    { id: "biztonsag", label: "Biztonság", color: C.purple },
  ],
};

const QUESTIONS = {
  residential: [
    { id: "country", block: "helyszin", q: "Melyik országban van az épület?", opts: COMMON_COUNTRIES, basic: true },
    { id: "zip", block: "helyszin", q: "Melyik településen vagy irányítószámon van az épület?", freetext: true, basic: true },
    { id: "r_type", block: "epulet", q: "Milyen típusú az épület?", opts: ["Önálló családi ház", "Ikerház", "Sorház", "Társasházi lakás – téglaépület", "Panellakás / panel épület", "Tanya / vidéki birtok", "Nyaraló"], basic: true },
    { id: "r_size", block: "epulet", q: "Mekkora az alapterület?", opts: ["40 m² alatt", "40–70 m²", "70–120 m²", "120–200 m²", "200 m² felett"], basic: true },
    { id: "r_year", block: "epulet", q: "Mikor épült az épület?", opts: ["1960 előtt", "1960–1980", "1980–2000", "2000–2010", "2010 után", "Nem tudom"], basic: true },
    { id: "r_material", block: "epulet", q: "Mi az épület fő falanyaga?", opts: ["Tégla – régi tömör", "Tégla – modern üreges", "Ytong / pórobeton", "Beton / panel", "Fa szerkezet", "Vályog", "Kő", "Vegyes / nem tudom"], basic: true },
    { id: "r_roof_type", block: "epulet", q: "Milyen a tető típusa?", opts: ["Nyeregtető (saját)", "Kontyolt tető (saját)", "Lapostető (saját)", "Nincs saját tető (lakás)"], basic: true },
    { id: "r_wall_ins", block: "epulet", q: "Van-e homlokzati hőszigetelés?", opts: ["Igen, 10+ cm", "Igen, de vékonyabb", "Nincs", "Nem tudom"], basic: true },
    { id: "r_roof_ins", block: "epulet", q: "Szigetelt-e a tető / padlás?", opts: ["Igen, korszerűen", "Igen, de vékony", "Nem", "Nem tudom"], basic: true },
    { id: "r_windows", block: "epulet", q: "Milyen típusú a nyílászáró?", opts: ["Egyrétegű – régi", "Kétrétegű – régebbi", "Kétrétegű – modern", "Háromrétegű", "Vegyes"], basic: true },
    { id: "r_heating", block: "fogyasztas", q: "Mivel fűtöd az épületet?", multi: true, opts: ["Gázkazán", "Kombi cirkó", "Távhő", "Elektromos fűtés", "Hőszivattyú", "Fa / pellet", "Kandalló", "Padlófűtés", "Egyéb"], basic: true },
    { id: "r_hotwater", block: "fogyasztas", q: "Honnan jön a melegvíz?", opts: ["Kombi cirkó", "Gázboiler", "Elektromos bojler", "Távhő", "Napkollektor", "Hőszivattyú", "Egyéb"], basic: true },
    { id: "r_gasbill", block: "fogyasztas", q: "Havi átlag gázszámla?", opts: ["Nincs gáz", "0–15 000 Ft", "15 000–40 000 Ft", "40 000–80 000 Ft", "80 000 Ft felett"], basic: true },
    { id: "r_elecbill", block: "fogyasztas", q: "Havi átlag villanyszámla?", opts: ["0–10 000 Ft", "10 000–25 000 Ft", "25 000–50 000 Ft", "50 000 Ft felett"], basic: true },
    { id: "r_solar_pv", block: "rendszerek", q: "Van-e már napelem?", opts: ["Igen, van", "Nincs", "Tervezett / folyamatban"], basic: true },
    { id: "r_battery", block: "rendszerek", q: "Van-e akkumulátor / tárolórendszer?", opts: ["Igen, van", "Nincs", "Tervezett"] },
    { id: "r_water", block: "rendszerek", q: "Van-e nagyobb vízfogyasztás vagy kert?", opts: ["Nagy kert / rendszeres locsolás", "Medence is van", "Kis kert, alkalmi locsolás", "Nincs kert"] },
    { id: "r_ev", block: "rendszerek", q: "Elektromos autó?", opts: ["Van már", "Tervezem 1-2 éven belül", "Nem tervezem"] },
    { id: "r_goal", block: "celok", q: "Mi a fő motiváció?", multi: true, opts: ["Spórolni a számlákon", "Energetikai függetlenség", "Környezettudatosság", "Ingatlan értéke", "Komfort növelése", "Klímabiztonság"], basic: true },
    { id: "r_budget", block: "celok", q: "Mekkora tőke áll rendelkezésre?", opts: ["0–500 000 Ft", "500 000 – 2 000 000 Ft", "2 000 000 – 5 000 000 Ft", "5 000 000 Ft felett"], basic: true },
    { id: "notes", block: "celok", q: "Van egyéb megjegyzés?", freetext: true },
  ],
  commercial: [
    { id: "country", block: "helyszin", q: "Melyik országban van az épület / helyiség?", opts: COMMON_COUNTRIES, basic: true },
    { id: "zip", block: "helyszin", q: "Melyik településen vagy irányítószámon van?", freetext: true, basic: true },
    { id: "c_type", block: "epulet", q: "Milyen típusú az épület / helyiség?", opts: ["Iroda", "Kiskereskedelmi üzlet", "Vendéglátóhely", "Szolgáltató", "Raktár", "Üzem / gyár", "Mezőgazdasági épület", "Egyéb"], basic: true },
    { id: "c_size", block: "epulet", q: "Mekkora az alapterület?", opts: ["100 m² alatt", "100–300 m²", "300–1000 m²", "1000 m² felett"], basic: true },
    { id: "c_year", block: "epulet", q: "Mikor épült az épület?", opts: ["1980 előtt", "1980–2000", "2000–2015", "2015 után", "Nem tudom"] },
    { id: "c_roof_type", block: "epulet", q: "Milyen a tető?", opts: ["Lapostető (saját)", "Nyeregtető (saját)", "Ipari hall tető", "Nincs saját tető", "Nem tudom"] },
    { id: "c_insulation", block: "epulet", q: "Van-e hőszigetelés?", multi: true, opts: ["Homlokzat szigetelt", "Tető szigetelt", "Nincs szigetelés", "Nem tudom"] },
    { id: "c_heating", block: "fogyasztas", q: "Fűtési rendszer?", multi: true, opts: ["Gázkazán / kazánház", "Hőszivattyú", "Elektromos", "Távhő", "Fa / pellet", "Nincs fűtés", "Egyéb"] },
    { id: "c_cooling", block: "fogyasztas", q: "Van-e hűtési / klíma rendszer?", opts: ["Igen, split klíma", "Igen, központi klíma", "VRF / VRV rendszer", "Nincs", "Egyéb"] },
    { id: "c_gasbill", block: "fogyasztas", q: "Havi átlag gázszámla?", opts: ["Nincs gáz", "0–50 000 Ft", "50 000–150 000 Ft", "150 000–500 000 Ft", "500 000 Ft felett"] },
    { id: "c_elecbill", block: "fogyasztas", q: "Havi átlag villanyszámla?", opts: ["0–50 000 Ft", "50 000–150 000 Ft", "150 000–500 000 Ft", "500 000 Ft felett"], basic: true },
    { id: "c_ophours", block: "fogyasztas", q: "Hány órát üzemel naponta?", opts: ["8 óra", "12 óra", "16+ óra", "24/7"] },
    { id: "c_solar", block: "rendszerek", q: "Van-e már napelem?", opts: ["Igen", "Nincs", "Tervezett"] },
    { id: "c_battery", block: "rendszerek", q: "Van-e akkumulátor / szünetmentes?", opts: ["Igen", "Nincs", "Tervezett"] },
    { id: "c_bms", block: "rendszerek", q: "Van-e épületautomatizálás / BMS?", opts: ["Igen, komplex BMS", "Részleges automatizálás", "Nincs", "Nem tudom"] },
    { id: "c_goal", block: "celok", q: "Fő motiváció?", multi: true, opts: ["Rezsiköltség csökkentés", "ESG / fenntarthatósági célok", "Energetikai függetlenség", "Pályázati lehetőségek", "PR / imázs", "Klímabiztonság"], basic: true },
    { id: "c_budget", block: "celok", q: "Rendelkezésre álló keret?", opts: ["1 M Ft alatt", "1–5 M Ft", "5–20 M Ft", "20 M Ft felett"], basic: true },
    { id: "notes", block: "celok", q: "Egyéb megjegyzés?", freetext: true },
  ],
  multiunit: [
    { id: "country", block: "helyszin", q: "Melyik országban van az épület?", opts: COMMON_COUNTRIES, basic: true },
    { id: "zip", block: "helyszin", q: "Melyik településen vagy irányítószámon van az épület?", freetext: true, basic: true },
    { id: "m_type", block: "epulet", q: "Milyen típusú épületről van szó?", opts: ["Panelház", "Hagyományos társasház", "Tégla társasház", "Vegyes szerkezetű társasház", "Lakópark / társasházi épületegyüttes", "Egyéb"], basic: true },
    { id: "m_units", block: "epulet", q: "Körülbelül hány lakás van az épületben?", opts: ["1–10 lakás", "11–30 lakás", "31–60 lakás", "61–100 lakás", "100+ lakás", "Nem tudom pontosan"], basic: true },
    { id: "m_age", block: "epulet", q: "Mikor épült nagyjából az épület?", opts: ["1950 előtt", "1950–1979", "1980–1999", "2000–2010", "2010 után", "Nem tudom"], basic: true },
    { id: "m_renovated", block: "epulet", q: "Milyen felújítás történt már az épületen?", multi: true, opts: ["Homlokzati szigetelés", "Tetőszigetelés", "Nyílászárócsere", "Fűtéskorszerűsítés", "Lépcsőházi világítás", "Napelemes rendszer", "Nem volt jelentős felújítás", "Nem tudom"] },
    { id: "m_heating", block: "fogyasztas", q: "Milyen fűtési rendszer működik az épületben?", opts: ["Távhő", "Központi kazán", "Egyedi gázfűtés lakásonként", "Elektromos fűtés", "Vegyes rendszer", "Nem tudom"], basic: true },
    { id: "m_metering", block: "fogyasztas", q: "Van-e mérés vagy szabályozás?", multi: true, opts: ["Egyedi hőmennyiségmérés", "Radiátorszelepek", "Okosmérés", "Közös mérés", "Nincs egyedi mérés", "Nem tudom"] },
    { id: "m_roof", block: "kozos", q: "Milyen a tető állapota / hasznosíthatósága?", opts: ["Jó állapotú lapostető", "Felújítandó lapostető", "Magastető", "Nem alkalmas napelemre", "Nem tudom"] },
    { id: "m_green", block: "kozos", q: "Milyen külső vagy közös zöldfelület tartozik az épülethez?", multi: true, opts: ["Belső udvar", "Közös kert", "Parkoló / burkolt udvar", "Zöldtető lehetősége", "Nincs érdemi zöldfelület", "Nem tudom"] },
    { id: "m_water", block: "kozos", q: "Érdekes lehet vízgazdálkodási fejlesztés?", multi: true, opts: ["Esővízgyűjtés", "Öntözőrendszer", "Zöldfelület vízmegtartása", "Burkolt felületek csapadékvíz-kezelése", "Szürkevíz-hasznosítás", "Nem releváns", "Nem tudom"] },
    { id: "m_goal", block: "celok", q: "Mi lenne a legfontosabb cél?", multi: true, opts: ["Közös költségek csökkentése", "Energiahatékonyság javítása", "Fűtési költség csökkentése", "Épület állapotának javítása", "Ingatlanérték növelése", "Közös terek korszerűsítése", "Zöldfelület / udvar fejlesztése", "Pályázati / támogatási lehetőség keresése"], basic: true },
    { id: "m_budget", block: "celok", q: "Van-e becsült költségkeret?", opts: ["Még nincs", "1–5 millió Ft", "5–20 millió Ft", "20–50 millió Ft", "50 millió Ft felett", "Pályázattól / finanszírozástól függ"], basic: true },
    { id: "notes", block: "celok", q: "Van megjegyzés az épületről vagy a lakóközösségről?", freetext: true },
  ],
  build: [
    { id: "country", block: "helyszin", q: "Melyik országban van a projekt?", opts: COMMON_COUNTRIES, basic: true },
    { id: "zip", block: "helyszin", q: "Település / irányítószám", freetext: true, basic: true },
    { id: "b_type", block: "projekt", q: "Milyen típusú projektről van szó?", opts: ["Lakóépület felújítás", "Társasház / panel", "Céges épület", "Iroda / üzlet", "Ipari / raktár", "Hagyományos / természetes építésű ház", "Új építés", "Egyéb"], basic: true },
    { id: "b_stage", block: "projekt", q: "Hol tart most a projekt?", opts: ["Csak ötlet", "Helyszín megvan", "Van terv", "Van költségkeret", "Kivitelezőt keresek", "Már elindult, de problémás"], basic: true },
    { id: "b_work", block: "munka", q: "Milyen munkákra lehet szükség?", multi: true, opts: ["Szigetelés", "Tető", "Nyílászárók", "Villanyszerelés", "Víz / gépészet", "Fűtéskorszerűsítés", "Napelem", "Hőszivattyú", "Belső felújítás", "Teljes generálkivitelezés", "Még nem tudom"], basic: true },
    { id: "b_docs", block: "munka", q: "Milyen előkészítés van meg?", multi: true, opts: ["Alaprajz", "Fotók", "Műszaki terv", "Energetikai tanúsítvány", "Árajánlat", "Semmi", "Nem tudom"] },
    { id: "b_budget", block: "penzugy", q: "Mekkora a becsült költségkeret?", opts: ["1 M Ft alatt", "1–5 M Ft", "5–20 M Ft", "20–100 M Ft", "100 M Ft felett", "Még nincs meghatározva"], basic: true },
    { id: "b_timing", block: "penzugy", q: "Mikor indulna a projekt?", opts: ["Azonnal", "1–3 hónap", "3–6 hónap", "6–12 hónap", "Csak tájékozódom"] },
    { id: "b_support", block: "tamogatas", q: "Miben kérnél segítséget?", multi: true, opts: ["Szakember keresés", "Kivitelező ellenőrzés", "Költségbecslés", "Projektmenedzsment", "Energetikai koncepció", "Műszaki előkészítés", "Ajánlatok összehasonlítása"], basic: true },
    { id: "notes", block: "tamogatas", q: "Röviden írd le a projektet", freetext: true },
  ],
  traditional: [
    { id: "country", block: "helyszin", q: "Melyik országban van az épület?", opts: COMMON_COUNTRIES, basic: true },
    { id: "zip", block: "helyszin", q: "Település / régió / irányítószám", freetext: true, basic: true },
    { id: "t_type", block: "szerkezet", q: "Milyen hagyományos épületről van szó?", opts: ["Vályogház", "Vert falú ház", "Döngölt föld / földfal", "Kőház", "Vegyes falazatú ház", "Régi tömör téglaépület", "Favázas / Fachwerk épület", "Nem tudom"], basic: true },
    { id: "t_age", block: "szerkezet", q: "Mikor épülhetett az épület?", opts: ["1850 előtt", "1850–1918", "1919–1945", "1946–1970", "1970 után", "Nem tudom"], basic: true },
    { id: "t_wall_thickness", block: "szerkezet", q: "Körülbelül milyen vastag a külső fal?", opts: ["30 cm alatt", "30–45 cm", "45–60 cm", "60 cm felett", "Nem tudom"], basic: true },
    { id: "t_plaster", block: "szerkezet", q: "Milyen vakolat vagy felület van a falakon?", multi: true, opts: ["Mészvakolat", "Agyagvakolat", "Cementes vakolat", "Gipszkarton / előtétfal", "Festett, de nem tudom mivel", "Részben levert / hiányos", "Nem tudom"], basic: true },
    { id: "t_damp", block: "nedvesseg", q: "Tapasztalható nedvesség vagy sókivirágzás?", multi: true, opts: ["Nedves lábazat", "Salétrom / sókivirágzás", "Penész", "Leváló vakolat", "Dohos szag", "Nem tapasztalható", "Nem tudom"], basic: true },
    { id: "t_water_management", block: "nedvesseg", q: "Milyen a tető és a csapadékvíz elvezetése?", multi: true, opts: ["Tető jó állapotú", "Tető javítandó", "Eresz és lefolyó rendben", "Hiányos / hibás eresz", "A víz az épület mellé folyik", "Magas a környező terepszint", "Nem tudom"], basic: true },
    { id: "t_floor", block: "nedvesseg", q: "Milyen a földszinti padló?", opts: ["Hagyományos tégla / döngölt padló", "Beton aljzat", "Fa padló", "Vegyes", "Nem tudom"] },
    { id: "t_previous_works", block: "felujitas", q: "Milyen korábbi beavatkozások történtek?", multi: true, opts: ["Cementes újravakolás", "Beton padló készült", "Vegyi falszigetelés / injektálás", "Műanyag nyílászárók", "Külső hőszigetelés", "Belső hőszigetelés", "Tetőfelújítás", "Nem történt jelentős felújítás", "Nem tudom"], basic: true },
    { id: "t_heating", block: "felujitas", q: "Milyen fűtési rendszer működik?", multi: true, opts: ["Gázkazán", "Cserépkályha / kandalló", "Fa / pellet", "Elektromos fűtés", "Hőszivattyú", "Nincs működő fűtés", "Egyéb"], basic: true },
    { id: "t_planned", block: "felujitas", q: "Milyen fejlesztést tervezel?", multi: true, opts: ["Nedvességi probléma kezelése", "Vakolatcsere", "Padló felújítása", "Tető / födém szigetelése", "Nyílászárók javítása vagy cseréje", "Homlokzati vagy belső szigetelés", "Fűtéskorszerűsítés", "Teljes felújítás", "Még nem tudom"], basic: true },
    { id: "t_goal", block: "celok", q: "Mi a legfontosabb cél?", multi: true, opts: ["Egészségesebb belső klíma", "Nedvesség megszüntetése", "Energiafogyasztás csökkentése", "Eredeti szerkezetek megőrzése", "Komfort növelése", "Természetes anyagok használata", "Ingatlan értékének megőrzése"], basic: true },
    { id: "notes", block: "celok", q: "Röviden írd le az épület állapotát vagy a problémát", freetext: true },
  ],
  climate: [
    { id: "country", block: "helyszin", q: "Melyik országban van az ingatlan?", opts: COMMON_COUNTRIES, basic: true },
    { id: "zip", block: "helyszin", q: "Település / régió / irányítószám", freetext: true, basic: true },
    { id: "cl_type", block: "telek", q: "Milyen ingatlant szeretnél vizsgálni?", opts: ["Családi ház", "Társasház", "Céges épület", "Telephely", "Hagyományos épület", "Birtok / nagy telek", "Egyéb"], basic: true },
    { id: "cl_land", block: "telek", q: "Mekkora a telek / külső terület?", opts: ["Nincs külső terület", "Kis udvar", "100–500 m²", "500–3000 m²", "3000 m² felett", "Nem tudom"], basic: true },
    { id: "cl_green", block: "telek", q: "Milyen a zöldfelület aránya?", opts: ["Sok fa és növényzet", "Közepes zöldfelület", "Kevés zöld", "Főleg burkolt felület", "Nem tudom"], basic: true },
    { id: "cl_water", block: "viz", q: "Van-e vízforrás vagy vízmegtartási lehetőség?", multi: true, opts: ["Kút", "Forrás", "Patak", "Tó", "Esővízgyűjtés", "Nagy tetőfelület", "Nincs", "Nem tudom"], basic: true },
    { id: "cl_rain_problem", block: "viz", q: "Van-e csapadékvíz-probléma?", multi: true, opts: ["Villámárvíz / elöntés", "Víz áll az udvaron", "Gyorsan kiszárad a kert", "Nincs ismert probléma", "Nem tudom"] },
    { id: "cl_overheat", block: "ho", q: "Mennyire melegszik túl az épület nyáron?", opts: ["Nagyon", "Közepesen", "Kicsit", "Nem jellemző", "Nem tudom"], basic: true },
    { id: "cl_shading", block: "ho", q: "Milyen az árnyékolás?", multi: true, opts: ["Nagy fák", "Pergola / árnyékoló", "Zsalugáter / redőny", "Nincs érdemi árnyékolás", "Nem tudom"], basic: true },
    { id: "cl_cooling", block: "ho", q: "Hogyan hűtöd az épületet?", opts: ["Klímával", "Természetes szellőzéssel", "Ventilátorral", "Nincs hűtés", "Nem tudom"] },
    { id: "cl_backup", block: "biztonsag", q: "Van-e backup energia vagy tartalék víz?", multi: true, opts: ["Akkumulátor", "Aggregátor", "Víztartály", "Kút", "Nincs", "Tervezett", "Nem tudom"], basic: true },
    { id: "cl_goal", block: "biztonsag", q: "Mi a fő klímabiztonsági cél?", multi: true, opts: ["Hőhullám elleni védelem", "Vízmegtartás", "Aszálytűrő kert", "Villámárvíz-kezelés", "Önellátás", "Backup energia", "Élhetőbb mikroklíma"], basic: true },
    { id: "notes", block: "biztonsag", q: "Röviden írd le a problémát vagy célt", freetext: true },
  ],
};

const flowLabels = {
  residential: "Lakóépület",
  commercial: "Vállalkozás / céges épület",
  multiunit: "Társasház / panelház",
  build: "Resource Build",
  traditional: "Resource Traditional",
  climate: "Resource Climate",
};

function HouseLeafLogo({ size = 28, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M2 14L16 3L30 14V30H21V21H11V30H2V14Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M11 24C11 24 12 17 18 15C18 15 19 21 15 24C17 24 20 21 20 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 24C13.5 21 18 15 18 15" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function isAnswered(question, value) {
  if (question.freetext) return true;
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== "";
}

function formatFt(n) {
  if (!Number.isFinite(n)) return "–";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(".0", "")} M Ft`;
  if (n >= 1000) return `${Math.round(n / 1000)} e Ft`;
  return `${n} Ft`;
}

function getEnergyRating(answers, flow) {
  let score = 0;
  const year = answers.r_year || answers.c_year || answers.m_age || "";
  if (year.includes("1950") || year.includes("1960 előtt") || year.includes("1980 előtt")) score += 32;
  else if (year.includes("1960") || year.includes("1980") || year.includes("1979")) score += 24;
  else if (year.includes("1980") || year.includes("2000")) score += 17;
  else if (year.includes("2010")) score += 7;
  else score += 12;

  if (flow === "residential") {
    if ((answers.r_wall_ins || "").includes("Nincs")) score += 18;
    if ((answers.r_roof_ins || "").includes("Nem")) score += 10;
    if ((answers.r_windows || "").includes("Egyrétegű")) score += 16;
    if ((answers.r_gasbill || "").includes("80 000")) score += 12;
    if ((answers.r_heating || []).includes("Hőszivattyú")) score -= 8;
  }

  if (flow === "commercial") {
    if ((answers.c_insulation || []).includes("Nincs szigetelés")) score += 20;
    if ((answers.c_elecbill || "").includes("500 000")) score += 14;
    if ((answers.c_gasbill || "").includes("500 000")) score += 12;
    if (answers.c_bms === "Igen, komplex BMS") score -= 8;
  }

  if (flow === "multiunit") {
    if ((answers.m_renovated || []).includes("Nem volt jelentős felújítás")) score += 20;
    if (answers.m_heating === "Távhő") score += 8;
    if ((answers.m_metering || []).includes("Nincs egyedi mérés")) score += 10;
  }

  score = Math.max(0, Math.min(100, score));
  if (score <= 10) return "A+++";
  if (score <= 18) return "A++";
  if (score <= 26) return "A+";
  if (score <= 34) return "A";
  if (score <= 44) return "B";
  if (score <= 54) return "C";
  if (score <= 64) return "D";
  if (score <= 74) return "E";
  if (score <= 84) return "F";
  return "G";
}

const ratingOrder = ["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"];
const ratingColors = {
  "A+++": "#1a7a1a",
  "A++": "#2a9a2a",
  "A+": "#3daa3d",
  A: "#6abf3d",
  B: "#a8c830",
  C: "#d4d400",
  D: "#f0c000",
  E: "#f09000",
  F: "#e05a00",
  G: "#cc2222",
};

function improvedRating(current) {
  const index = ratingOrder.indexOf(current);
  return ratingOrder[Math.max(0, index - 3)] || current;
}

function getEnergyRecs(answers, flow) {
  if (flow === "commercial") return getCommercialRecs(answers);
  if (flow === "multiunit") return getMultiunitRecs(answers);
  return getResidentialRecs(answers);
}

function getResidentialRecs(answers) {
  const recs = [];
  const poorWall = (answers.r_wall_ins || "").includes("Nincs") || (answers.r_wall_ins || "").includes("vékonyabb");
  const poorRoof = (answers.r_roof_ins || "").includes("Nem") || (answers.r_roof_ins || "").includes("vékony");
  const badWindows = (answers.r_windows || "").includes("Egyrétegű") || (answers.r_windows || "").includes("régebbi");
  const hasRoof = !(answers.r_roof_type || "").includes("Nincs saját tető");
  const noSolar = answers.r_solar_pv !== "Igen, van";
  const highElec = ["25 000–50 000 Ft", "50 000 Ft felett"].includes(answers.r_elecbill);
  const highGas = ["40 000–80 000 Ft", "80 000 Ft felett"].includes(answers.r_gasbill);
  const goals = answers.r_goal || [];

  if (poorWall || poorRoof) recs.push({ priority: 1, name: "Hőveszteség csökkentése", tag: "ELSŐ LÉPÉS", cost: "800 000 – 3 000 000 Ft", payback: "5–10 év", reason: "A rossz szigetelés miatt előbb a veszteséget érdemes csökkenteni." });
  if (badWindows) recs.push({ priority: 1, name: "Nyílászárók javítása / cseréje", tag: "FONTOS", cost: "300 000 – 1 500 000 Ft", payback: "4–8 év", reason: "Komfortot javít és csökkenti a fűtési/hűtési igényt." });
  if (hasRoof && noSolar) recs.push({ priority: poorWall ? 3 : 2, name: "Napelem rendszer elővizsgálata", tag: highElec ? "KIEMELT" : "AJÁNLOTT", cost: "1 500 000 – 4 500 000 Ft", payback: "5–9 év", reason: "A villamosenergia-fogyasztás részben kiváltható." });
  if (highGas && !poorWall) recs.push({ priority: 3, name: "Hőszivattyú elővizsgálata", tag: "HOSSZÚ TÁV", cost: "2 000 000 – 5 500 000 Ft", payback: "7–12 év", reason: "Csak hőigény- és hőleadói vizsgálat után érdemes dönteni." });
  if (goals.includes("Energetikai függetlenség")) recs.push({ priority: 4, name: "Akkumulátor / backup rendszer", tag: "AUTONÓMIA", cost: "1 500 000 – 4 000 000 Ft", payback: "8–12 év", reason: "Önellátási és üzembiztonsági célhoz kapcsolódik." });
  if ((answers.r_water || "").includes("kert") || (answers.r_water || "").includes("Medence")) recs.push({ priority: 2, name: "Esővízgyűjtés és vízmegtartás", tag: "KLÍMA", cost: "100 000 – 900 000 Ft", payback: "3–8 év", reason: "Kerti vízhasználatnál gyorsan értelmezhető fejlesztési irány." });
  if (recs.length === 0) recs.push({ priority: 1, name: "Okosmérés és fűtési szabályozás", tag: "AZONNAL", cost: "30 000 – 300 000 Ft", payback: "1–3 év", reason: "Alacsony kockázatú első lépés a pontosabb döntésekhez." });
  return recs.sort((a, b) => a.priority - b.priority);
}

function getCommercialRecs(answers) {
  const recs = [];
  const poorIns = (answers.c_insulation || []).includes("Nincs szigetelés");
  const hasRoof = answers.c_roof_type && !answers.c_roof_type.includes("Nincs saját tető");
  const highElec = ["150 000–500 000 Ft", "500 000 Ft felett"].includes(answers.c_elecbill);
  const highGas = ["150 000–500 000 Ft", "500 000 Ft felett"].includes(answers.c_gasbill);

  if (poorIns) recs.push({ priority: 1, name: "Épületburok és szigetelés felmérése", tag: "ALAP", cost: "Egyedi felmérés", payback: "5–10 év", reason: "Céges épületnél a veszteségek csökkentése stabil megtakarítást hozhat." });
  if (hasRoof && highElec) recs.push({ priority: 1, name: "Kereskedelmi napelem rendszer", tag: "KIEMELT", cost: "3 000 000 – 25 000 000 Ft", payback: "4–8 év", reason: "Magas nappali fogyasztásnál különösen erős lehet." });
  if (highGas) recs.push({ priority: 2, name: "Hőszivattyú / kazáncsere koncepció", tag: "REZSIOPTIMALIZÁLÁS", cost: "Egyedi felmérés", payback: "5–10 év", reason: "Gépészeti állapotfelmérés szükséges." });
  if (!answers.c_bms || answers.c_bms === "Nincs") recs.push({ priority: 3, name: "Épületautomatizálás / BMS", tag: "ESG", cost: "500 000 – 5 000 000 Ft", payback: "3–7 év", reason: "Üzemidő és fogyasztás optimalizálására alkalmas." });
  recs.push({ priority: 4, name: "Energiaaudit és ajánlatkérés előkészítése", tag: "KÖVETKEZŐ", cost: "150 000 – 600 000 Ft", payback: "Azonnal", reason: "Összehasonlítható ajánlatokhoz pontos műszaki tartalom kell." });
  return recs.sort((a, b) => a.priority - b.priority);
}

function getMultiunitRecs(answers) {
  const recs = [];
  const renovations = answers.m_renovated || [];
  const needsFacade = renovations.includes("Nem volt jelentős felújítás") || !renovations.includes("Homlokzati szigetelés");
  const hasBadMetering = (answers.m_metering || []).includes("Nincs egyedi mérés") || (answers.m_metering || []).includes("Közös mérés");

  if (needsFacade) recs.push({ priority: 1, name: "Társasházi energetikai felmérés", tag: "ELSŐ LÉPÉS", cost: "Egyedi felmérés", payback: "Projektfüggő", reason: "A ház közös döntést és szakmai előkészítést igényel." });
  if (answers.m_roof && !answers.m_roof.includes("Nem alkalmas")) recs.push({ priority: 2, name: "Közös napelem / tetőhasznosítás vizsgálata", tag: "KÖZÖS RENDSZER", cost: "Egyedi felmérés", payback: "6–10 év", reason: "Közös fogyasztás vagy közösségi energia irányába vizsgálható." });
  if (hasBadMetering) recs.push({ priority: 2, name: "Mérés és fűtésszabályozás javítása", tag: "MEGTAKARÍTÁS", cost: "Lakásszámtól függ", payback: "2–6 év", reason: "Társasházban a mérés és szabályozás gyakran gyorsabb első lépés." });
  if ((answers.m_water || []).length || (answers.m_green || []).length) recs.push({ priority: 3, name: "Közös udvar / vízgazdálkodás / mikroklíma", tag: "CLIMATE", cost: "500 000 Ft-tól", payback: "Hasznossági alapú", reason: "Esővíz, zöldfelület és burkolt felületek együtt kezelhetők." });
  if (recs.length === 0) recs.push({ priority: 1, name: "Közgyűlési előkészítő energetikai anyag", tag: "INDÍTÁS", cost: "Egyedi", payback: "Azonnal", reason: "A lakóközösség döntéséhez rövid, érthető anyag szükséges." });
  return recs.sort((a, b) => a.priority - b.priority);
}

function getBuildRecs(answers) {
  const recs = [];
  const work = answers.b_work || [];
  const docs = answers.b_docs || [];
  const stage = answers.b_stage || "";

  if (stage.includes("ötlet") || docs.includes("Semmi")) recs.push({ priority: 1, name: "Műszaki tartalom tisztázása", tag: "ELSŐ LÉPÉS", cost: "Egyedi", payback: "Kockázatcsökkentés", reason: "Ajánlatkérés előtt pontosítani kell, mit kell beárazni." });
  if (work.includes("Teljes generálkivitelezés") || work.length >= 4) recs.push({ priority: 2, name: "Projektmenedzsment / műszaki ellenőrzés", tag: "KOMPLEX", cost: "Projektérték 3–8%", payback: "Kockázatcsökkentés", reason: "Több szakág esetén koordináció nélkül könnyen szétesik a projekt." });
  if (work.includes("Villanyszerelés") || work.includes("Víz / gépészet") || work.includes("Hőszivattyú")) recs.push({ priority: 2, name: "Szakági felmérés", tag: "SZAKMAI", cost: "Egyedi", payback: "Hibák elkerülése", reason: "A gépészet és villamos rendszer döntően befolyásolja a költséget." });
  if (work.includes("Napelem") || work.includes("Hőszivattyú") || work.includes("Szigetelés")) recs.push({ priority: 3, name: "Energy modul szerinti energetikai előszűrés", tag: "KAPCSOLÓDÓ", cost: "Alap / részletes riport", payback: "Döntéstámogatás", reason: "Energetikai beruházás előtt érdemes külön energialogikával is nézni." });
  recs.push({ priority: 4, name: "Összehasonlítható ajánlatkérési csomag", tag: "AJÁNLAT", cost: "Egyedi", payback: "Átláthatóság", reason: "Ugyanarra a műszaki tartalomra kell ajánlatot kérni." });
  return recs.sort((a, b) => a.priority - b.priority);
}

function getTraditionalRecs(answers) {
  const recs = [];
  const type = answers.t_type || "";
  const plaster = answers.t_plaster || [];
  const damp = answers.t_damp || [];
  const drainage = answers.t_water_management || [];
  const previous = answers.t_previous_works || [];
  const planned = answers.t_planned || [];

  const moistureRisk =
    damp.some((item) => !["Nem tapasztalható", "Nem tudom"].includes(item)) ||
    drainage.some((item) =>
      ["Tető javítandó", "Hiányos / hibás eresz", "A víz az épület mellé folyik", "Magas a környező terepszint"].includes(item)
    );

  const incompatibleMaterials =
    plaster.includes("Cementes vakolat") ||
    plaster.includes("Gipszkarton / előtétfal") ||
    previous.includes("Cementes újravakolás") ||
    previous.includes("Beton padló készült");

  recs.push({
    priority: 1,
    name: "Szerkezet- és nedvességdiagnosztika",
    tag: "ELSŐ LÉPÉS",
    cost: "Egyedi felmérés",
    payback: "Kockázatcsökkentés",
    reason: "Hagyományos falazatnál először a nedvesség forrását, a fal anyagát és a korábbi rétegrendeket kell tisztázni."
  });

  if (moistureRisk) {
    recs.push({
      priority: 1,
      name: "Tető, eresz, terepszint és csapadékvíz rendezése",
      tag: "NEDVESSÉG",
      cost: "A hibától függ",
      payback: "Állagmegóvás",
      reason: "A fal kiszárítása előtt a víz utánpótlását kell megszüntetni; önmagában a fal kezelése nem elegendő."
    });
  }

  if (incompatibleMaterials) {
    recs.push({
      priority: 2,
      name: "Páraáteresztő rétegrend vizsgálata",
      tag: "ANYAGHASZNÁLAT",
      cost: "Egyedi",
      payback: "Épületfizikai biztonság",
      reason: "A cementes, párazáró vagy rosszul szellőző rétegek nedvességet tarthatnak a hagyományos falban."
    });
  }

  if (type.includes("Vályog") || type.includes("Vert") || type.includes("föld") || type.includes("Vegyes")) {
    recs.push({
      priority: 2,
      name: "Vályog- és földfalhoz értő szakember bevonása",
      tag: "SZAKÉRTELEM",
      cost: "Egyedi",
      payback: "Hibák elkerülése",
      reason: "Ezek a szerkezetek eltérő vakolatot, csomópontokat és nedvességkezelést igényelnek, mint a modern téglafalak."
    });
  }

  if (planned.some((item) => item.includes("szigetelés"))) {
    recs.push({
      priority: 3,
      name: "Hőszigetelés csak páratechnikai vizsgálat után",
      tag: "ÓVATOSAN",
      cost: "Egyedi tervezés",
      payback: "Kockázatfüggő",
      reason: "A hibás belső vagy külső szigetelés rejtett nedvesedést, penészt és szerkezeti károsodást okozhat."
    });
  }

  recs.push({
    priority: 3,
    name: "Padlásfödém, nyílászáró és fűtésszabályozás vizsgálata",
    tag: "BIZTONSÁGOSABB IRÁNY",
    cost: "100 000 Ft-tól",
    payback: "3–10 év",
    reason: "Gyakran ezekkel lehet kisebb épületfizikai kockázattal javítani a komfortot és az energiafelhasználást."
  });

  recs.push({
    priority: 4,
    name: "Felújítási sorrend és összehangolt műszaki koncepció",
    tag: "KÖVETKEZŐ",
    cost: "Egyedi",
    payback: "Átláthatóság",
    reason: "A víz, a fal, a padló, a szellőzés, a fűtés és az energetika csak együtt tervezhető biztonságosan."
  });

  return recs.sort((a, b) => a.priority - b.priority);
}

function getClimateRecs(answers) {
  const recs = [];
  const water = answers.cl_water || [];
  const shading = answers.cl_shading || [];
  const backup = answers.cl_backup || [];
  const goals = answers.cl_goal || [];

  if (answers.cl_overheat === "Nagyon" || answers.cl_overheat === "Közepesen") recs.push({ priority: 1, name: "Túlmelegedési kockázat csökkentése", tag: "HŐHULLÁM", cost: "Egyedi", payback: "Komfort és biztonság", reason: "Árnyékolás, passzív hűtés és szellőzés együtt kezelendő." });
  if (shading.includes("Nincs érdemi árnyékolás")) recs.push({ priority: 1, name: "Árnyékolási stratégia", tag: "PASSZÍV", cost: "100 000 Ft-tól", payback: "Komfort", reason: "A hőterhelés csökkentése gyakran olcsóbb, mint több klíma telepítése." });
  if (!water.includes("Esővízgyűjtés") && !water.includes("Nincs")) recs.push({ priority: 2, name: "Esővízgyűjtés és vízmegtartás", tag: "VÍZ", cost: "100 000 – 1 500 000 Ft", payback: "3–8 év / biztonság", reason: "A vízmegtartás aszály és intenzív eső mellett is fontos." });
  if ((answers.cl_green || "").includes("Kevés") || (answers.cl_green || "").includes("burkolt")) recs.push({ priority: 2, name: "Zöldfelület és burkolt felületek újragondolása", tag: "MIKROKLÍMA", cost: "Egyedi", payback: "Élhetőség", reason: "A zöldfelület javítja a mikroklímát és csökkenti a hősziget-hatást." });
  if (goals.includes("Backup energia") || backup.includes("Nincs")) recs.push({ priority: 3, name: "Kritikus rendszerek backup terve", tag: "RESILIENCE", cost: "Egyedi", payback: "Üzembiztonság", reason: "Áramkimaradás és hőhullám esetén kulcsrendszerek működése fontos." });
  recs.push({ priority: 4, name: "Klímaadaptációs ütemterv", tag: "STRATÉGIA", cost: "Egyedi", payback: "Hosszú távú érték", reason: "A víz, árnyék, hő és energia együtt ad klímabiztonságot." });
  return recs.sort((a, b) => a.priority - b.priority);
}

function getResults(answers, flow, selectedModule) {
  if (["residential", "commercial", "multiunit"].includes(flow)) {
    const current = getEnergyRating(answers, flow);
    const improved = improvedRating(current);
    return {
      scoreLabel: "Energy Score",
      score: current,
      improved,
      color: ratingColors[current],
      title: "Energetikai előszűrés eredménye",
      summary: "A megadott adatok alapján az app előzetes energetikai fejlesztési sorrendet javasol. A pontos döntéshez helyszíni felmérés szükséges.",
      recs: getEnergyRecs(answers, flow),
    };
  }

  if (flow === "build") {
    const readiness = buildScore(answers);
    return {
      scoreLabel: "Build Readiness Score",
      score: `${readiness}/100`,
      color: readiness >= 70 ? C.green : readiness >= 40 ? C.orange : C.red,
      title: "Projekt-előkészítettségi értékelés",
      summary: "A Build modul azt mutatja meg, mennyire előkészített a projekt, milyen szakágak és dokumentumok szükségesek a következő lépéshez.",
      recs: getBuildRecs(answers),
    };
  }

  if (flow === "traditional") {
    const sensitivity = traditionalScore(answers);
    return {
      scoreLabel: "Traditional Building Risk Score",
      score: `${sensitivity}/100`,
      color: sensitivity >= 70 ? C.red : sensitivity >= 40 ? C.orange : C.green,
      title: "Hagyományos épület felújítási előszűrése",
      summary: "A Traditional modul a falazat, nedvesség, vakolatok, korábbi beavatkozások és tervezett felújítás alapján jelzi a fő épületfizikai kockázatokat és a biztonságosabb következő lépéseket.",
      recs: getTraditionalRecs(answers),
    };
  }

  const resilience = climateScore(answers);
  return {
    scoreLabel: "Climate Resilience Score",
    score: `${resilience}/100`,
    color: resilience >= 70 ? C.green : resilience >= 40 ? C.orange : C.red,
    title: "Klímabiztonsági előszűrés",
    summary: "A Climate modul a hőhullám, vízbiztonság, árnyékolás, zöldfelület és backup rendszerek alapján ad adaptációs javaslatokat.",
    recs: getClimateRecs(answers),
  };
}

function buildScore(answers) {
  let score = 25;
  if (["Van terv", "Van költségkeret"].includes(answers.b_stage)) score += 25;
  if ((answers.b_docs || []).some((d) => !["Semmi", "Nem tudom"].includes(d))) score += 20;
  if (answers.b_budget && !answers.b_budget.includes("nincs")) score += 15;
  if ((answers.b_support || []).length) score += 15;
  return Math.min(100, score);
}

function traditionalScore(answers) {
  let risk = 20;
  const damp = answers.t_damp || [];
  const drainage = answers.t_water_management || [];
  const plaster = answers.t_plaster || [];
  const previous = answers.t_previous_works || [];
  const planned = answers.t_planned || [];

  if (damp.some((item) => !["Nem tapasztalható", "Nem tudom"].includes(item))) risk += 25;
  if (drainage.some((item) => ["Tető javítandó", "Hiányos / hibás eresz", "A víz az épület mellé folyik", "Magas a környező terepszint"].includes(item))) risk += 20;
  if (plaster.includes("Cementes vakolat") || plaster.includes("Gipszkarton / előtétfal")) risk += 15;
  if (previous.some((item) => ["Beton padló készült", "Vegyi falszigetelés / injektálás", "Belső hőszigetelés", "Külső hőszigetelés"].includes(item))) risk += 10;
  if (planned.some((item) => item.includes("szigetelés"))) risk += 10;

  return Math.min(100, risk);
}

function climateScore(answers) {
  let score = 45;
  if (answers.cl_overheat === "Nem jellemző") score += 15;
  if ((answers.cl_shading || []).some((s) => ["Nagy fák", "Pergola / árnyékoló", "Zsalugáter / redőny"].includes(s))) score += 15;
  if ((answers.cl_water || []).some((w) => ["Kút", "Forrás", "Patak", "Tó", "Esővízgyűjtés"].includes(w))) score += 15;
  if ((answers.cl_backup || []).some((b) => ["Akkumulátor", "Aggregátor", "Víztartály", "Kút"].includes(b))) score += 10;
  if ((answers.cl_green || "").includes("burkolt") || (answers.cl_overheat || "") === "Nagyon") score -= 20;
  return Math.max(0, Math.min(100, score));
}


function LineIcon({ type, size = 28 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (type === "energy") {
    return (
      <svg {...common}>
        <path d="M13 2 5.8 12.5h5.5L10.7 22l7.5-12.2h-5.4L13 2Z" />
      </svg>
    );
  }

  if (type === "build") {
    return (
      <svg {...common}>
        <path d="M4 21h16" />
        <path d="M6 21V9l6-4 6 4v12" />
        <path d="M9 21v-6h6v6" />
        <path d="M9 11h.01M15 11h.01" />
      </svg>
    );
  }

  if (type === "traditional") {
    return (
      <svg {...common}>
        <path d="M4 20h16" />
        <path d="M6 20V10l6-5 6 5v10" />
        <path d="M9 20v-6h6v6" />
        <path d="M7 11c2 1 3.5 1 5 0s3-1 5 0" />
        <path d="M8 8.5c1.5.8 2.7.8 4 0s2.5-.8 4 0" />
      </svg>
    );
  }

  if (type === "climate") {
    return (
      <svg {...common}>
        <path d="M12 22c4.2-3.2 6.5-6.8 6.5-10.5A6.5 6.5 0 0 0 12 5a6.5 6.5 0 0 0-6.5 6.5C5.5 15.2 7.8 18.8 12 22Z" />
        <path d="M8.5 12.5c2.5.2 4.5-1.2 6-4" />
        <path d="M12 18V9" />
      </svg>
    );
  }

  if (type === "residential") {
    return (
      <svg {...common}>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === "commercial") {
    return (
      <svg {...common}>
        <path d="M4 21h16" />
        <path d="M6 21V4h12v17" />
        <path d="M9 8h.01M12 8h.01M15 8h.01M9 12h.01M12 12h.01M15 12h.01" />
        <path d="M10 21v-5h4v5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4 21V6h16v15" />
      <path d="M8 6V3h8v3" />
      <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
      <path d="M10 21v-4h4v4" />
    </svg>
  );
}


function ModuleSelect({ onSelect }) {
  return (
    <Shell>
      <section style={styles.heroPanel}>
        <div style={styles.heroEyebrow}>Nemzetközi épületfejlesztési platform</div>
        <h1 style={styles.heroTitle}>Értsd meg az épületet, mielőtt döntést hozol.</h1>
        <p style={styles.heroLead}>
          Előzetes döntéstámogatás energetikai, kivitelezési, hagyományos épületszerkezeti és klímabiztonsági
          fejlesztésekhez — ország- és épülettípus-specifikus logikával.
        </p>
      </section>

      <div style={styles.moduleGrid}>
        {MODULES.map((m, index) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            style={{
              ...styles.moduleCard,
              "--module-accent": moduleColor(m.id),
            }}
          >
            <div style={styles.moduleCardTop}>
              <div
                style={{
                  ...styles.moduleIcon,
                  color: moduleColor(m.id),
                  background: `${moduleColor(m.id)}12`,
                  borderColor: `${moduleColor(m.id)}28`,
                }}
              >
                <LineIcon type={m.id} size={27} />
              </div>
              <div style={styles.moduleNumber}>0{index + 1}</div>
            </div>

            <div>
              <div style={{ ...styles.moduleEyebrow, color: moduleColor(m.id) }}>
                {m.id === "energy"
                  ? "Energetika"
                  : m.id === "build"
                    ? "Kivitelezés"
                    : m.id === "traditional"
                      ? "Hagyományos épületek"
                      : "Klímabiztonság"}
              </div>
              <h2 style={styles.moduleTitle}>{m.title.replace("Resource ", "")}</h2>
              <p style={styles.moduleDescription}>{m.description}</p>
            </div>

            <div style={styles.moduleAction}>
              <span>{m.button}</span>
              <span aria-hidden="true">→</span>
            </div>
          </button>
        ))}
      </div>

      <Disclaimer />
    </Shell>
  );
}



function EnergyFlowSelect({ onSelect, onBack }) {
  return (
    <Shell>
      <BackButton onClick={onBack}>← Vissza a modulokhoz</BackButton>

      <section style={styles.sectionIntro}>
        <div style={{ ...styles.sectionIcon, color: C.sunDark, background: C.sunLight }}>
          <LineIcon type="energy" size={29} />
        </div>
        <div>
          <div style={styles.eyebrow}>Resource Energy</div>
          <h1 style={styles.sectionTitle}>Milyen épületet szeretnél felmérni?</h1>
          <p style={styles.sectionLead}>
            Válaszd ki az épülettípust. A következő kérdések már ehhez igazodnak.
          </p>
        </div>
      </section>

      <div style={styles.flowGrid}>
        {ENERGY_FLOWS.map((flow) => (
          <button key={flow.id} style={styles.flowCard} onClick={() => onSelect(flow.id)}>
            <div style={styles.flowIcon}>
              <LineIcon type={flow.id} size={27} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={styles.flowTitle}>{flow.title}</h2>
              <p style={styles.flowDescription}>{flow.description}</p>
            </div>
            <div style={styles.flowArrow}>→</div>
          </button>
        ))}
      </div>

      <Disclaimer />
    </Shell>
  );
}


function QuizScreen({ flow, moduleId, answers, setAnswers, step, setStep, onBack, onFinish }) {
  const questions = QUESTIONS[flow] || [];
  const q = questions[step];
  const blocks = BLOCKS[flow] || [];
  const answeredRequired = q ? isAnswered(q, answers[q.id]) || !q.basic : true;

  function updateAnswer(question, value) {
    setAnswers((prev) => {
      if (!question.multi) return { ...prev, [question.id]: value };
      const current = Array.isArray(prev[question.id]) ? prev[question.id] : [];
      return current.includes(value)
        ? { ...prev, [question.id]: current.filter((v) => v !== value) }
        : { ...prev, [question.id]: [...current, value] };
    });
  }

  if (!q) return null;

  return (
    <Shell compact>
      <BackButton onClick={onBack}>← Vissza</BackButton>
      <div style={styles.quizTop}>
        <div>
          <div style={styles.eyebrow}>{flowLabels[flow]}</div>
          <h1 style={{ ...styles.h2, marginBottom: 6 }}>{q.q}</h1>
          <p style={styles.muted}>Kérdés {step + 1} / {questions.length}</p>
        </div>
        <div style={styles.progressCircle}>{Math.round(((step + 1) / questions.length) * 100)}%</div>
      </div>
      <BlockProgress blocks={blocks} questions={questions} answers={answers} />

      {q.freetext ? (
        <textarea
          value={answers[q.id] || ""}
          onChange={(e) => updateAnswer(q, e.target.value)}
          placeholder="Írd be ide..."
          style={styles.textarea}
        />
      ) : (
        <div style={styles.optionList}>
          {q.opts.map((opt) => {
            const selected = q.multi ? (answers[q.id] || []).includes(opt) : answers[q.id] === opt;
            return <QuizOption key={opt} label={opt} selected={selected} multi={q.multi} onClick={() => updateAnswer(q, opt)} />;
          })}
        </div>
      )}

      <div style={styles.navRow}>
        <button style={styles.secondaryButton} onClick={() => (step > 0 ? setStep(step - 1) : onBack())}>Vissza</button>
        <button
          style={{ ...styles.primaryButton, background: moduleColor(moduleId), opacity: answeredRequired ? 1 : 0.45 }}
          disabled={!answeredRequired}
          onClick={() => (step < questions.length - 1 ? setStep(step + 1) : onFinish())}
        >
          {step < questions.length - 1 ? "Tovább" : "Eredmény megtekintése"}
        </button>
      </div>
    </Shell>
  );
}

function ResultsScreen({ moduleId, flow, answers, onRestart, onBack }) {
  const result = useMemo(() => getResults(answers, flow, moduleId), [answers, flow, moduleId]);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", city: answers.zip || "", message: "" });
  const [privacy, setPrivacy] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [status, setStatus] = useState("");

  async function submitLead() {
    if (!contact.name.trim()) return setStatus("Add meg a neved.");
    if (!privacy) return setStatus("Az adatkezelési hozzájárulás kötelező.");
    if (!contact.email.trim() && !contact.phone.trim()) return setStatus("Email vagy telefonszám szükséges.");

    const payload = {
      lead_id: `RS-${Date.now()}`,
      datum: new Date().toLocaleString("hu-HU"),
      forras: "Resource App v1",
      module: moduleId,
      flow,
      flow_label: flowLabels[flow],
      country: answers.country || "",
      city: answers.zip || contact.city || "",
      contact,
      privacy_accepted: privacy ? "Igen" : "Nem",
      newsletter: newsletter ? "Igen" : "Nem",
      score_label: result.scoreLabel,
      score: result.score,
      recommended_first_step: result.recs[0]?.name || "",
      recommended_steps: result.recs.map((r) => r.name).join(", "),
      answers,
      lead_statusz: "Új lead",
      partner_statusz: "Nincs partnerhez rendelve",
    };

    try {
      await fetch(CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("Köszönjük, az összefoglaló elküldve. Hamarosan felvesszük veled a kapcsolatot.");
    } catch (error) {
      setStatus("Nem sikerült elküldeni. Ellenőrizd a kapcsolatot vagy próbáld újra később.");
    }
  }

  function openPrintReport() {
    const html = createReportHtml({ result, answers, flow, moduleId, contact });
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  return (
    <Shell>
      <BackButton onClick={onBack}>← Vissza az utolsó kérdéshez</BackButton>
      <div style={styles.resultHero}>
        <div>
          <div style={styles.eyebrow}>{MODULES.find((m) => m.id === moduleId)?.title} · {flowLabels[flow]}</div>
          <h1 style={styles.h1}>{result.title}</h1>
          <p style={styles.leadLeft}>{result.summary}</p>
        </div>
        <div style={{ ...styles.scoreBox, borderColor: `${result.color}55`, background: `${result.color}12` }}>
          <div style={styles.scoreLabel}>{result.scoreLabel}</div>
          <div style={{ ...styles.scoreValue, color: result.color }}>{result.score}</div>
          {result.improved && <div style={styles.muted}>Javítható: {result.improved}</div>}
        </div>
      </div>

      <div style={styles.cardsList}>
        {result.recs.map((rec, index) => (
          <div key={`${rec.name}-${index}`} style={styles.recCard}>
            <div style={styles.recTop}>
              <div>
                <div style={styles.recTag}>{rec.tag}</div>
                <h3 style={styles.recTitle}>{index + 1}. {rec.name}</h3>
              </div>
              <div style={styles.recCost}>{rec.cost}</div>
            </div>
            <p style={styles.cardDesc}>{rec.reason}</p>
            <div style={styles.recMeta}>Megtérülés / érték: <strong>{rec.payback}</strong></div>
          </div>
        ))}
      </div>

      <div style={styles.reportBox}>
        <h2 style={styles.h2}>Kapcsolat és riport</h2>
        <p style={styles.cardDesc}>Add meg az elérhetőséged, és a felmérés adatai leadként bekerülnek a Resource rendszerbe. A PDF gomb egy nyomtatható / menthető összefoglalót nyit meg.</p>
        <div style={styles.formGrid}>
          <input style={styles.input} placeholder="Név" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <input style={styles.input} placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <input style={styles.input} placeholder="Telefon" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          <input style={styles.input} placeholder="Város / irányítószám" value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} />
        </div>
        <textarea style={styles.textareaSmall} placeholder="Üzenet / megjegyzés" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} />
        <label style={styles.checkboxLine}><input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} /> Elfogadom, hogy a Resource a megadott adatokat kapcsolatfelvétel céljából kezelje.</label>
        <label style={styles.checkboxLine}><input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} /> Kérek később Resource frissítéseket / hírlevelet.</label>
        {status && <div style={styles.statusBox}>{status}</div>}
        <div style={styles.navRow}>
          <button style={{ ...styles.primaryButton, background: moduleColor(moduleId) }} onClick={submitLead}>Összefoglaló elküldése</button>
          <button style={styles.secondaryButton} onClick={openPrintReport}>PDF / nyomtatás</button>
          <button style={styles.secondaryButton} onClick={onRestart}>Új felmérés</button>
        </div>
      </div>
      <Disclaimer />
    </Shell>
  );
}

function BlockProgress({ blocks, questions, answers }) {
  const stats = blocks.map((b) => {
    const qs = questions.filter((q) => q.block === b.id && !q.freetext);
    const done = qs.filter((q) => isAnswered(q, answers[q.id])).length;
    return { ...b, pct: qs.length ? Math.round((done / qs.length) * 100) : 0 };
  });

  return (
    <div style={{ display: "flex", gap: 5, margin: "18px 0 24px", overflowX: "auto", paddingBottom: 4 }}>
      {stats.map((b) => (
        <div key={b.id} style={{ flex: 1, minWidth: 64 }}>
          <div style={{ fontSize: 10, color: b.pct ? b.color : C.muted, fontWeight: 800, textAlign: "center", marginBottom: 5 }}>{b.label}</div>
          <div style={{ height: 5, background: C.grayMid, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${b.pct}%`, background: b.color, borderRadius: 3, transition: "width .25s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}


function QuizOption({ label, selected, onClick, multi }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.option,
        borderColor: selected ? "#355E55" : "rgba(48,70,63,0.14)",
        background: selected ? "#EDF3F0" : "rgba(255,255,255,0.94)",
        boxShadow: selected ? "0 0 0 3px rgba(53,94,85,0.06)" : "0 5px 16px rgba(31,43,39,0.035)",
        fontWeight: selected ? 700 : 500,
      }}
    >
      <span
        style={{
          ...styles.optionMark,
          borderRadius: multi ? 6 : "50%",
          borderColor: selected ? "#355E55" : "#AEB8B3",
          background: selected ? "#355E55" : "#FFFFFF",
        }}
      >
        {selected ? (multi ? "✓" : "•") : ""}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}



function Shell({ children, compact = false }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 0%, rgba(53,94,85,0.08), transparent 34%), linear-gradient(180deg,#F4F2EC 0%,#F8F7F3 50%,#F1F3EF 100%)",
        padding: compact ? "14px 14px 38px" : "18px 14px 46px",
        fontFamily: "'Poppins','Helvetica Neue',Arial,sans-serif",
        color: "#252724",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1080, margin: "0 auto" }}>
        <header style={styles.appHeader}>
          <div style={styles.brandWrap}>
            <div style={styles.brandMark}>
              <HouseLeafLogo size={21} color="#FFFFFF" />
            </div>
            <div>
              <div style={styles.brandName}>Resource</div>
              <div style={styles.brandSubtitle}>Building Intelligence</div>
            </div>
          </div>
          <div className="resource-header-label" style={styles.headerMeta}>
            Energy · Build · Traditional · Climate
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}


function LogoMark() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 62, height: 62, borderRadius: 18, background: C.sun, marginBottom: 16 }}>
      <HouseLeafLogo size={36} color="#fff" />
    </div>
  );
}


function SectionHeader({ title, subtitle }) {
  const type =
    title.includes("Energy") ? "energy" :
    title.includes("Build") ? "build" :
    title.includes("Traditional") ? "traditional" : "climate";

  return (
    <section style={styles.sectionIntro}>
      <div style={{ ...styles.sectionIcon, color: moduleColor(type), background: `${moduleColor(type)}12` }}>
        <LineIcon type={type} size={29} />
      </div>
      <div>
        <div style={{ ...styles.eyebrow, color: moduleColor(type) }}>{title}</div>
        <h1 style={styles.sectionTitle}>{subtitle}</h1>
      </div>
    </section>
  );
}


function BackButton({ children, onClick }) {
  return <button onClick={onClick} style={styles.backButton}>{children}</button>;
}

function Disclaimer() {
  return (
    <div style={styles.disclaimer}>
      Az alkalmazás előzetes döntéstámogató elemzést ad. Nem helyettesíti az energetikai tanúsítványt, műszaki tervet, statikai szakvéleményt vagy engedélyezési dokumentációt.
    </div>
  );
}

function moduleColor(moduleId) {
  return MODULES.find((m) => m.id === moduleId)?.accent || C.sun;
}

function createReportHtml({ result, answers, flow, moduleId, contact }) {
  const rows = result.recs
    .map((r, i) => `<tr><td>${i + 1}. ${r.name}</td><td>${r.cost}</td><td>${r.payback}</td></tr>`)
    .join("");
  return `<!doctype html><html lang="hu"><head><meta charset="utf-8"><title>Resource App Report</title><style>
    body{font-family:Arial,sans-serif;color:#1E1E1E;margin:0;background:#fff}.page{max-width:780px;margin:0 auto;padding:44px}.header{border-bottom:3px solid #4CAF50;padding-bottom:18px;margin-bottom:28px}.brand{font-weight:800;font-size:24px}.muted{color:#777;font-size:13px}.score{display:inline-block;padding:12px 18px;border-radius:12px;background:#F1F8F1;font-size:28px;font-weight:900;color:#2E7D32;margin:12px 0}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{text-align:left;border-bottom:1px solid #eee;padding:10px;font-size:13px}th{background:#F2F2F2}h1{font-size:26px}p{line-height:1.6}.box{background:#F7FAF7;border:1px solid #E3E8E3;border-radius:14px;padding:16px;margin:18px 0}@media print{button{display:none}}
  </style></head><body><div class="page"><div class="header"><div class="brand">Resource App</div><div class="muted">${new Date().toLocaleDateString("hu-HU")} · ${MODULES.find((m) => m.id === moduleId)?.title || ""} · ${flowLabels[flow] || ""}</div></div><h1>${result.title}</h1><p>${result.summary}</p><div class="box"><div class="muted">${result.scoreLabel}</div><div class="score">${result.score}</div></div>${contact?.name ? `<p><strong>${contact.name}</strong><br>${contact.email || ""} ${contact.phone || ""}<br>${contact.city || answers.zip || ""}</p>` : ""}<h2>Ajánlott lépések</h2><table><thead><tr><th>Lépés</th><th>Költségsáv</th><th>Érték / megtérülés</th></tr></thead><tbody>${rows}</tbody></table><p class="muted" style="margin-top:24px">Tájékoztató jellegű előszűrés. Helyszíni felmérés és szakértői ellenőrzés szükséges.</p><button onclick="window.print()" style="margin-top:20px;padding:12px 18px;border:0;border-radius:10px;background:#4CAF50;color:#fff;font-weight:700">Mentés PDF-ként</button></div></body></html>`;
}


const styles = {
  appHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 22,
    padding: "11px 14px",
    border: "1px solid rgba(48,70,63,0.11)",
    borderRadius: 16,
    background: "rgba(255,255,255,0.82)",
    boxShadow: "0 8px 28px rgba(31,43,39,0.055)",
    backdropFilter: "blur(10px)",
  },
  brandWrap: { display: "flex", alignItems: "center", gap: 11 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: "#355E55",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: { fontSize: 16, fontWeight: 800, color: "#252724", letterSpacing: "-0.02em" },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#78817C",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginTop: 1,
  },
  headerMeta: {
    fontSize: 10,
    fontWeight: 700,
    color: "#7D827E",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },

  heroPanel: {
    background: "linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,249,246,0.92))",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 24,
    padding: "clamp(26px,5vw,54px)",
    boxShadow: "0 16px 42px rgba(31,43,39,0.07)",
    marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#5B746D",
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: "clamp(35px,6vw,62px)",
    lineHeight: 1.02,
    letterSpacing: "-0.05em",
    margin: 0,
    fontWeight: 800,
    color: "#252724",
    maxWidth: 820,
  },
  heroLead: {
    fontSize: 15,
    lineHeight: 1.75,
    color: "#69706B",
    maxWidth: 740,
    margin: "22px 0 0",
  },

  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))",
    gap: 14,
  },
  moduleCard: {
    minHeight: 285,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 20,
    padding: 22,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 28px rgba(31,43,39,0.065)",
    fontFamily: "inherit",
    color: "#252724",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  moduleCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  moduleIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleNumber: { fontSize: 11, color: "#929791", letterSpacing: "0.1em", fontWeight: 700 },
  moduleEyebrow: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  moduleTitle: { fontSize: 27, lineHeight: 1.1, margin: 0, fontWeight: 800, letterSpacing: "-0.035em" },
  moduleDescription: { fontSize: 13, color: "#6E746F", lineHeight: 1.65, margin: "14px 0 0" },
  moduleAction: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid rgba(48,70,63,0.1)",
    fontSize: 12,
    fontWeight: 800,
    color: "#2F3D38",
  },

  sectionIntro: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 10px 28px rgba(31,43,39,0.06)",
    marginBottom: 16,
  },
  sectionIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: "clamp(26px,4vw,36px)",
    lineHeight: 1.15,
    margin: 0,
    fontWeight: 800,
    letterSpacing: "-0.035em",
    color: "#252724",
  },
  sectionLead: { fontSize: 14, color: "#727872", lineHeight: 1.65, margin: "8px 0 0" },

  flowGrid: { display: "grid", gap: 12 },
  flowCard: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 16,
    textAlign: "left",
    padding: 18,
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 17,
    background: "rgba(255,255,255,0.94)",
    boxShadow: "0 8px 22px rgba(31,43,39,0.05)",
    cursor: "pointer",
    color: "#252724",
    fontFamily: "inherit",
  },
  flowIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    background: "#EDF3F0",
    color: "#355E55",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  flowTitle: { fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  flowDescription: { fontSize: 13, color: "#747A75", lineHeight: 1.55, margin: "5px 0 0" },
  flowArrow: { fontSize: 22, color: "#355E55", paddingLeft: 6 },

  h1: { fontSize: 34, lineHeight: 1.14, margin: 0, fontWeight: 800, letterSpacing: "-0.035em", color: "#252724" },
  h2: { fontSize: 24, lineHeight: 1.25, margin: 0, fontWeight: 800, letterSpacing: "-0.025em", color: "#252724" },
  lead: { fontSize: 15, lineHeight: 1.7, color: "#707670", maxWidth: 760, margin: "12px auto 0" },
  leadLeft: { fontSize: 15, lineHeight: 1.7, color: "#707670", margin: "10px 0 0", maxWidth: 720 },
  muted: { fontSize: 12, color: "#848A85", margin: 0 },
  eyebrow: { fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#355E55", marginBottom: 7 },

  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 },
  choiceCard: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 18,
    padding: 20,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 10px 28px rgba(31,43,39,0.06)",
    fontFamily: "inherit",
  },
  iconBox: { width: 50, height: 50, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25, marginBottom: 14 },
  cardTitle: { fontSize: 20, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" },
  cardShort: { fontSize: 13, fontWeight: 700, color: "#303431", lineHeight: 1.45, margin: "0 0 8px" },
  cardDesc: { fontSize: 13, color: "#737974", lineHeight: 1.65, margin: "0 0 16px" },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    color: "#fff",
    borderRadius: 12,
    padding: "12px 17px",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 7px 18px rgba(35,63,58,0.16)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(48,70,63,0.15)",
    background: "rgba(255,255,255,0.94)",
    color: "#303431",
    borderRadius: 12,
    padding: "12px 16px",
    fontWeight: 800,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  backButton: {
    border: "1px solid rgba(48,70,63,0.14)",
    background: "rgba(255,255,255,0.88)",
    color: "#3E4945",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
    fontFamily: "inherit",
    marginBottom: 14,
    boxShadow: "0 5px 16px rgba(31,43,39,0.045)",
  },
  disclaimer: {
    marginTop: 22,
    background: "rgba(255,255,255,0.66)",
    border: "1px solid rgba(48,70,63,0.1)",
    borderRadius: 14,
    padding: 15,
    fontSize: 11,
    lineHeight: 1.65,
    color: "#747A75",
    textAlign: "center",
  },

  quizTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 28px rgba(31,43,39,0.06)",
  },
  progressCircle: {
    width: 62,
    height: 62,
    borderRadius: 18,
    background: "#E7EEEA",
    border: "1px solid rgba(53,94,85,0.12)",
    color: "#355E55",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    flexShrink: 0,
  },
  optionList: { display: "grid", gap: 9 },
  option: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
    padding: "14px 15px",
    border: "1px solid",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 14,
    color: "#252724",
    fontFamily: "inherit",
  },
  optionMark: {
    width: 20,
    height: 20,
    border: "1.5px solid",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 900,
    flexShrink: 0,
  },
  textarea: {
    width: "100%",
    minHeight: 150,
    border: "1px solid rgba(48,70,63,0.15)",
    borderRadius: 13,
    padding: 14,
    fontFamily: "inherit",
    fontSize: 14,
    resize: "vertical",
    background: "rgba(255,255,255,0.94)",
  },
  textareaSmall: {
    width: "100%",
    minHeight: 90,
    border: "1px solid rgba(48,70,63,0.15)",
    borderRadius: 13,
    padding: 12,
    fontFamily: "inherit",
    fontSize: 14,
    resize: "vertical",
    marginTop: 10,
    background: "rgba(255,255,255,0.94)",
  },
  input: {
    border: "1px solid rgba(48,70,63,0.15)",
    borderRadius: 12,
    padding: "12px 13px",
    fontFamily: "inherit",
    fontSize: 14,
    width: "100%",
    background: "rgba(255,255,255,0.94)",
  },
  navRow: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between", alignItems: "center", marginTop: 20 },

  resultHero: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 220px",
    gap: 18,
    alignItems: "stretch",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 12px 30px rgba(31,43,39,0.06)",
    marginBottom: 18,
  },
  scoreBox: {
    border: "1px solid",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  scoreLabel: { fontSize: 11, color: "#858B86", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.1 },
  scoreValue: { fontSize: 34, fontWeight: 900, margin: "8px 0" },
  cardsList: { display: "grid", gap: 12, marginTop: 18 },
  recCard: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 8px 22px rgba(31,43,39,0.045)",
  },
  recTop: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },
  recTag: { display: "inline-block", fontSize: 10, fontWeight: 800, color: "#355E55", background: "#EDF3F0", padding: "5px 8px", borderRadius: 999, marginBottom: 8 },
  recTitle: { margin: 0, fontSize: 18, lineHeight: 1.3 },
  recCost: { fontSize: 12, fontWeight: 800, color: "#303431", background: "#F1F2EF", borderRadius: 10, padding: "8px 10px", whiteSpace: "nowrap" },
  recMeta: { fontSize: 12, color: "#858B86", borderTop: "1px solid rgba(48,70,63,0.09)", paddingTop: 10, marginTop: 10 },
  reportBox: {
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(48,70,63,0.12)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 12px 30px rgba(31,43,39,0.055)",
    marginTop: 18,
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 },
  checkboxLine: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#777D78", lineHeight: 1.5, marginTop: 10 },
  statusBox: { background: "#EDF3F0", border: "1px solid rgba(53,94,85,0.18)", color: "#355E55", borderRadius: 10, padding: 12, fontSize: 13, fontWeight: 700, marginTop: 12 },
};


export default function ResourceApp() {
  const [selectedModule, setSelectedModule] = useState(null);
  const [flow, setFlow] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [screen, setScreen] = useState("module");

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
      *{box-sizing:border-box}
      html,body,#root{margin:0;min-height:100%;background:#F4F2EC}
      button{transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease, background .15s ease}
      button:hover{transform:translateY(-1px)}
      button:focus-visible{outline:3px solid rgba(53,94,85,.22);outline-offset:2px}
      @media(max-width:760px){
        .resource-header-label{display:none!important}
      }
      @media(max-width:620px){
        button:hover{transform:none}
      }
      @media(max-width:560px){
        h1{font-size:inherit}
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  function restart() {
    setSelectedModule(null);
    setFlow(null);
    setStep(0);
    setAnswers({});
    setScreen("module");
  }

  function selectModule(moduleId) {
    setSelectedModule(moduleId);
    setFlow(null);
    setStep(0);
    setAnswers({});
    if (moduleId === "energy") setScreen("energyFlow");
    else {
      setFlow(moduleId);
      setScreen("quiz");
    }
  }

  function startFlow(nextFlow) {
    setFlow(nextFlow);
    setStep(0);
    setAnswers({});
    setScreen("quiz");
  }

  if (screen === "module") return <ModuleSelect onSelect={selectModule} />;

  if (screen === "energyFlow") {
    return <EnergyFlowSelect onSelect={startFlow} onBack={restart} />;
  }

  if (screen === "quiz") {
    return (
      <QuizScreen
        flow={flow}
        moduleId={selectedModule}
        answers={answers}
        setAnswers={setAnswers}
        step={step}
        setStep={setStep}
        onBack={() => {
          if (selectedModule === "energy") setScreen("energyFlow");
          else restart();
        }}
        onFinish={() => setScreen("results")}
      />
    );
  }

  return (
    <ResultsScreen
      moduleId={selectedModule}
      flow={flow}
      answers={answers}
      onRestart={restart}
      onBack={() => setScreen("quiz")}
    />
  );
}
