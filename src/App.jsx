import { useState, useEffect, useRef } from "react";
const C = {
  sun: "#F5C518", sunLight: "#FFFBEA", sunDark: "#C49A00",
  gray: "#4A4A4A", grayLight: "#F7F7F5", grayMid: "#E0DED8",
  white: "#FFFFFF", text: "#1A1A1A", muted: "#8A8A8A",
  red: "#E05252", green: "#3DAA72", blue: "#3A7BD5", orange: "#F07C2A",
  teal: "#2A9D8F", purple: "#7B5EA7",
};
const ratingColors = {
  "A+++":"#1a7a1a","A++":"#2a9a2a","A+":"#3daa3d","A":"#6abf3d",
  "B":"#a8c830","C":"#d4d400","D":"#f0c000","E":"#f09000","F":"#e05a00","G":"#cc2222",
};
const ratingOrder = ["A+++","A++","A+","A","B","C","D","E","F","G"];

// ── ROI CALCULATOR ─────────────────────────────────────────────────────────
function calcROI(answers, rec) {
  const sizeMap = {"40 m² alatt":35,"40–70 m²":55,"70–120 m²":95,"120–200 m²":160,"200 m² felett":220};
  const size = sizeMap[answers.r_size] || 80;
  const gasBill = {"Nincs gáz":0,"0–15 000 Ft":8000,"15 000–40 000 Ft":25000,"40 000–80 000 Ft":60000,"80 000 Ft felett":100000};
  const elecBill = {"0–10 000 Ft":5000,"10 000–25 000 Ft":17000,"25 000–50 000 Ft":37000,"50 000 Ft felett":65000};
  const monthlyGas = gasBill[answers.r_gasbill] || 0;
  const monthlyElec = elecBill[answers.r_elecbill] || 17000;
  const yearlyGas = monthlyGas * 12;
  const yearlyElec = monthlyElec * 12;

  switch(rec.name) {
    case "Hőszigetelés":
    case "Hőszigetelés + Nyílászárócsere":
      const heatSave = Math.round(yearlyGas * 0.35 + yearlyElec * 0.15);
      const heatCost = size < 60 ? 900000 : size < 120 ? 1800000 : 2800000;
      return { save: heatSave, cost: heatCost, years: Math.round(heatCost / heatSave) };
    case "Napelem rendszer":
      const pvSave = Math.round(yearlyElec * 0.75);
      const pvCost = size < 60 ? 1800000 : size < 120 ? 2800000 : 3800000;
      return { save: pvSave, cost: pvCost, years: Math.round(pvCost / pvSave) };
    case "Napkollektor (melegvíz)":
      const ncSave = Math.round((yearlyGas * 0.2 + yearlyElec * 0.1));
      return { save: Math.max(ncSave, 60000), cost: 650000, years: Math.round(650000 / Math.max(ncSave, 60000)) };
    case "Hőszivattyú":
      const hpSave = Math.round(yearlyGas * 0.7);
      const hpCost = 2500000;
      return { save: hpSave, cost: hpCost, years: Math.round(hpCost / Math.max(hpSave, 1)) };
    case "Akkumulátor rendszer":
      const batSave = Math.round(yearlyElec * 0.4);
      return { save: batSave, cost: 2000000, years: Math.round(2000000 / Math.max(batSave, 1)) };
    case "EV töltő":
      return { save: 180000, cost: 250000, years: 1 };
    case "Távhő optimalizálás + egyedi szabályozás":
      return { save: Math.round(yearlyGas * 0.15 + yearlyElec * 0.1), cost: 150000, years: 2 };
    case "Panel hőszigetelés (EPS rendszer)":
      const panelSave = Math.round(yearlyGas * 0.3 + yearlyElec * 0.1);
      return { save: Math.max(panelSave, 80000), cost: 1200000, years: Math.round(1200000 / Math.max(panelSave, 80000)) };
    default:
      return null;
  }
}

function formatFt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + ' M Ft';
  if (n >= 1000) return Math.round(n/1000) + ' e Ft';
  return n + ' Ft';
}
// ── FLOW BLOCKS ────────────────────────────────────────────────────────────
const BLOCKS = {
  residential: [
    { id:"epulet",      label:"Az épület",     icon:"🏠", color:C.blue },
    { id:"fogyasztas",  label:"Fogyasztás",    icon:"⚡", color:C.orange },
    { id:"rendszerek",  label:"Rendszerek",    icon:"🔧", color:C.teal },
    { id:"kornyezet",   label:"Környezet",     icon:"🌿", color:C.green },
    { id:"celok",       label:"Célok",         icon:"🎯", color:C.sun },
  ],
  commercial: [
    { id:"epulet",      label:"Az épület",     icon:"🏢", color:C.blue },
    { id:"fogyasztas",  label:"Fogyasztás",    icon:"⚡", color:C.orange },
    { id:"rendszerek",  label:"Rendszerek",    icon:"🔧", color:C.teal },
    { id:"celok",       label:"Célok",         icon:"🎯", color:C.sun },
  ],
};
// ── QUESTIONS ──────────────────────────────────────────────────────────────
const QUESTIONS = {
  residential: [
    // ÉPÜLET
    { id:"r_type",       block:"epulet",    q:"Milyen típusú az épület?",                              multi:false, opts:["Önálló családi ház","Ikerház","Sorház","Társasházi lakás – téglaépület","Panellakás / panel épület","Tanya / vidéki birtok","Nyaraló"] , basic:true },
    { id:"r_attached",   block:"epulet",    q:"Hány oldalon érintkezik más épülettel?",                multi:false, opts:["Sehol – teljesen önálló","1 oldalon (ikerház)","2 oldalon (sorközi)","Több oldalon (társasház)"] },
    { id:"r_neighbors",  block:"epulet",    q:"Van-e szomszéd fal / szomszéd lakás?",                 multi:true,  opts:["Felső szomszéd van","Alsó szomszéd van","Oldalsó szomszéd","Nincs szomszéd","Nem releváns"] },
    { id:"r_size",       block:"epulet",    q:"Mekkora az alapterület?",                               multi:false, opts:["40 m² alatt","40–70 m²","70–120 m²","120–200 m²","200 m² felett"] , basic:true },
    { id:"r_floors",     block:"epulet",    q:"Hány szintes az épület?",                               multi:false, opts:["Földszintes","Emeletes (2 szint)","2+ emeletes","Tetőtér beépítéssel"] },
    { id:"r_year",       block:"epulet",    q:"Mikor épült az épület?",                                multi:false, opts:["1960 előtt","1960–1980","1980–2000","2000–2010","2010 után"] , basic:true },
    { id:"r_material",   block:"epulet",    q:"Mi az épület fő falanyaga?",                            multi:false, opts:["Tégla – régi tömör","Tégla – modern üreges","Ytong / pórobeton","Beton / panel","Fa szerkezet","Vályog","Kő","Vegyes / nem tudom"] , basic:true },
    { id:"r_roof_type",  block:"epulet",    q:"Milyen a tető típusa?",                                 multi:false, opts:["Nyeregtető (saját)","Kontyolt tető (saját)","Lapostető (saját)","Nincs saját tető (lakás)"] , basic:true },
    { id:"r_roof_ins",   block:"epulet",    q:"Szigetelt-e a tető / padlás?",                          multi:false, opts:["Igen, korszerűen (15+ cm)","Igen, de vékony","Nem","Nem tudom"] },
    { id:"r_wall_ins",   block:"epulet",    q:"Van-e homlokzati hőszigetelés?",                        multi:false, opts:["Igen, 10+ cm","Igen, de vékonyabb","Nincs","Nem tudom"] },
    { id:"r_floor_ins",  block:"epulet",    q:"Szigetelt-e a padló / alaplemez?",                      multi:false, opts:["Igen","Nem","Nem tudom"] },
    { id:"r_windows",    block:"epulet",    q:"Milyen típusú a nyílászáró?",                           multi:false, opts:["Egyrétegű – fa keret (régi)","Kétrétegű – régebbi PVC/fa","Kétrétegű – modern, jó tömítés","Háromrétegű (korszerű)","Vegyes"] , basic:true },
    { id:"r_win_year",   block:"epulet",    q:"Mikor cserélték a nyílászárókat?",                      multi:false, opts:["Eredeti (épülettel együtt)","1990–2005 között","2005–2015 között","2015 után","Nem tudom"] },
    { id:"r_orientation",block:"epulet",    q:"Merre néznek a főfelületek / tető?",                    multi:true,  opts:["Dél","Délkelet","Délnyugat","Kelet","Nyugat","Észak","Nem tudom"] },
    // FOGYASZTÁS
    { id:"r_persons",    block:"fogyasztas", q:"Hány személy él az épületben?",                        multi:false, opts:["1 fő","2 fő","3–4 fő","5+ fő"] , basic:true },
    { id:"r_heating",    block:"fogyasztas", q:"Mivel fűtöd az épületet? (több is lehetséges)",        multi:true,  opts:["Gázkazán","Kombi cirkó","Távhő (szolgáltatói)","Elektromos fűtőtest","Hőszivattyú","Fa / pellet kazán","Kandalló","Padlófűtés","Egyéb"] , basic:true },
    { id:"r_heat_year",  block:"fogyasztas", q:"Mikor telepítették a fűtési rendszert?",               multi:false, opts:["1990 előtt","1990–2005","2005–2015","2015 után","Nem tudom"] },
    { id:"r_hotwater",   block:"fogyasztas", q:"Honnan jön a melegvíz?",                               multi:false, opts:["Kombi cirkó (bojler nélkül)","Gázboiler","Elektromos bojler","Távhő (szolgáltatói)","Napkollektor","Hőszivattyú","Egyéb"] , basic:true },
    { id:"r_ventilation",block:"fogyasztas", q:"Van-e gépi szellőzés / hővisszanyerő?",                multi:false, opts:["Igen – hővisszanyerős (HRV)","Igen – egyszerű elszívó","Nincs, természetes","Nem tudom"] },
    { id:"r_gasbill",    block:"fogyasztas", q:"Havi átlag gázszámla (fűtési szezonban)?",             multi:false, opts:["Nincs gáz","0–15 000 Ft","15 000–40 000 Ft","40 000–80 000 Ft","80 000 Ft felett"] , basic:true },
    { id:"r_elecbill",   block:"fogyasztas", q:"Havi átlag villanyszámla?",                            multi:false, opts:["0–10 000 Ft","10 000–25 000 Ft","25 000–50 000 Ft","50 000 Ft felett"] , basic:true },
    { id:"r_water",      block:"fogyasztas", q:"Van-e nagyobb vízfogyasztás?",                         multi:false, opts:["Nagy kert / rendszeres locsolás","Medence is van","Kis kert, alkalmi locsolás","Nincs kert"] },
    { id:"r_ev",         block:"fogyasztas", q:"Elektromos autó?",                                     multi:false, opts:["Van már","Tervezem 1-2 éven belül","Nem tervezem"] },
    // MEGLÉVŐ RENDSZEREK
    { id:"r_solar_pv",   block:"rendszerek", q:"Van-e már napelem?",                                   multi:false, opts:["Igen, van","Nincs","Tervezett / folyamatban"] , basic:true },
    { id:"r_solar_kw",   block:"rendszerek", q:"Ha van napelem – mekkora a rendszer?",                 multi:false, opts:["Nincs napelem","1–3 kWp","3–6 kWp","6–10 kWp","10 kWp felett"] },
    { id:"r_battery",    block:"rendszerek", q:"Van-e akkumulátor / tárolórendszer?",                  multi:false, opts:["Igen, van","Nincs","Tervezett"] },
    { id:"r_collector",  block:"rendszerek", q:"Van-e napkollektor (melegvíz)?",                       multi:false, opts:["Igen, van","Nincs","Tervezett"] },
    { id:"r_rainwater",  block:"rendszerek", q:"Van-e esővízgyűjtő rendszer?",                         multi:false, opts:["Igen, van","Nincs","Tervezett"] },
    { id:"r_renovations",block:"rendszerek", q:"Milyen felújítások történtek már? (több is)",          multi:true,  opts:["Homlokzati szigetelés","Tetőszigetelés","Nyílászárócsere","Fűtéskorszerűsítés","Villamos hálózat","Vízvezeték","Semmi jelentős"] },
    // KÖRNYEZET
    { id:"r_shading",    block:"kornyezet",  q:"Van-e árnyékolás a tetőn / déli oldalon?",             multi:true,  opts:["Nagy fák a déli oldalon","Szomszéd épület árnyékol","Saját tetőszerkezet árnyékol","Nincs jelentős árnyékolás"] },
    { id:"r_land",       block:"kornyezet",  q:"Mekkora a telek / kert?",                              multi:false, opts:["Nagy (500 m² felett)","Közepes (100–500 m²)","Kis kert / udvar","Nincs (lakás)"] },
    // CÉLOK
    { id:"r_ownership",  block:"celok",      q:"Saját vagy bérelt az ingatlan?",                       multi:false, opts:["Saját tulajdon","Bérelt","Szülőké / más tulajdona"] },
    { id:"r_goal",       block:"celok",      q:"Mi a fő motiváció? (több is)",                         multi:true,  opts:["Spórolni a számlákon","Energetikai függetlenség","Környezettudatosság","Ingatlan értéke","Komfort növelése"] , basic:true },
    { id:"r_budget",     block:"celok",      q:"Mekkora tőke áll rendelkezésre?",                      multi:false, opts:["0–500 000 Ft","500 000 – 2 000 000 Ft","2 000 000 – 5 000 000 Ft","5 000 000 Ft felett"] , basic:true },
    { id:"r_horizon",    block:"celok",      q:"Milyen időtávban gondolkodol?",                        multi:false, opts:["1–2 év","3–5 év","10+ év"] },
    { id:"r_plan",       block:"celok",      q:"Mi a legfontosabb következő lépés számodra?",           multi:false, opts:["Teljes felújítás egyszerre","Lépésről lépésre haladok","Csak egy-két dolgot szeretnék megcsinálni","Még csak tájékozódom"] },
    { id:"r_notes",      block:"celok",      q:"Van egyéb megjegyzés, különleges adottság?",           multi:false, opts:[], freetext: true },
  ],
  commercial: [
    { id:"c_type",       block:"epulet",    q:"Milyen típusú az épület / helyiség?",                   multi:false, opts:["Iroda","Kiskereskedelmi üzlet","Vendéglátóhely","Szolgáltató (szalon, műhely)","Raktár","Üzem / gyár","Mezőgazdasági épület","Egyéb"] },
    { id:"c_size",       block:"epulet",    q:"Mekkora az alapterület?",                               multi:false, opts:["100 m² alatt","100–300 m²","300–1000 m²","1000 m² felett"] },
    { id:"c_year",       block:"epulet",    q:"Mikor épült az épület?",                                multi:false, opts:["1980 előtt","1980–2000","2000–2015","2015 után"] },
    { id:"c_material",   block:"epulet",    q:"Mi az épület fő falanyaga?",                            multi:false, opts:["Tégla","Beton / panel","Szendvicspanel","Fa / könnyűszerkezet","Vegyes / nem tudom"] },
    { id:"c_roof_type",  block:"epulet",    q:"Milyen a tető?",                                        multi:false, opts:["Lapostető (saját)","Nyeregtető (saját)","Ipari hall tető","Nincs saját tető"] },
    { id:"c_insulation", block:"epulet",    q:"Van-e hőszigetelés?",                                   multi:true,  opts:["Homlokzat szigetelt","Tető szigetelt","Nincs szigetelés","Nem tudom"] },
    { id:"c_windows",    block:"epulet",    q:"Nyílászárók típusa?",                                   multi:false, opts:["Egyrétegű (régi)","Kétrétegű (régebbi)","Kétrétegű (modern)","Háromrétegű","Főleg üvegfelület (curtain wall)"] },
    { id:"c_orientation",block:"epulet",    q:"Merre néz a tető / főfelület?",                         multi:true,  opts:["Dél / Délkelet / Délnyugat","Kelet / Nyugat","Észak","Vegyes","Nem tudom"] },
    { id:"c_ownership",  block:"epulet",    q:"Saját vagy bérelt az ingatlan?",                        multi:false, opts:["Saját tulajdon","Bérelt","Egyéb"] },
    { id:"c_heating",    block:"fogyasztas", q:"Fűtési rendszer?",                                     multi:true,  opts:["Gázkazán / kazánház","Hőszivattyú","Elektromos","Távhő","Fa / pellet","Nincs fűtés","Egyéb"] },
    { id:"c_cooling",    block:"fogyasztas", q:"Van-e hűtési / klíma rendszer?",                       multi:false, opts:["Igen, split klíma","Igen, központi klíma","VRF / VRV rendszer","Nincs","Egyéb"] },
    { id:"c_hotwater",   block:"fogyasztas", q:"Melegvíz forrása?",                                    multi:false, opts:["Gázboiler","Elektromos bojler","Napkollektor","Hőszivattyú","Nem releváns"] },
    { id:"c_gasbill",    block:"fogyasztas", q:"Havi átlag gázszámla?",                                multi:false, opts:["Nincs gáz","0–50 000 Ft","50 000–150 000 Ft","150 000–500 000 Ft","500 000 Ft felett"] },
    { id:"c_elecbill",   block:"fogyasztas", q:"Havi átlag villanyszámla?",                            multi:false, opts:["0–50 000 Ft","50 000–150 000 Ft","150 000–500 000 Ft","500 000 Ft felett"] },
    { id:"c_ophours",    block:"fogyasztas", q:"Hány órát üzemel naponta?",                            multi:false, opts:["8 óra (irodai munkaidő)","12 óra","16+ óra","24/7"] },
    { id:"c_ev",         block:"fogyasztas", q:"Van-e vagy tervezett céges elektromos jármű?",         multi:false, opts:["Van már","Tervezve","Nincs"] },
    { id:"c_solar",      block:"rendszerek", q:"Van-e már napelem?",                                   multi:false, opts:["Igen","Nincs","Tervezett"] },
    { id:"c_battery",    block:"rendszerek", q:"Van-e akkumulátor / szünetmentes?",                    multi:false, opts:["Igen","Nincs","Tervezett"] },
    { id:"c_bms",        block:"rendszerek", q:"Van-e épületautomatizálás / BMS?",                     multi:false, opts:["Igen, komplex BMS","Részleges automatizálás","Nincs","Nem tudom"] },
    { id:"c_goal",       block:"celok",      q:"Fő motiváció? (több is)",                              multi:true,  opts:["Rezsiköltség csökkentés","ESG / fenntarthatósági célok","Energetikai függetlenség","Pályázati lehetőségek","PR / imázs"] },
    { id:"c_budget",     block:"celok",      q:"Rendelkezésre álló keret?",                            multi:false, opts:["1 M Ft alatt","1–5 M Ft","5–20 M Ft","20 M Ft felett"] },
    { id:"c_horizon",    block:"celok",      q:"Döntési időtáv?",                                      multi:false, opts:["3 hónapon belül","6–12 hónap","1–3 év","Csak tájékozódom"] },
    { id:"c_notes",      block:"celok",      q:"Egyéb megjegyzés, különleges adottság?",               multi:false, opts:[], freetext: true },
  ],
};
// ── ENERGY RATING ──────────────────────────────────────────────────────────
function calcRating(answers, flow) {
  let score = 0;
  const yearKey = flow === "residential" ? "r_year" : "c_year";
  const year = answers[yearKey] || "";
  if (year.includes("1960 előtt") || year.includes("1980 előtt")) score += 38;
  else if (year.includes("1960") || year.includes("1980")) score += 28;
  else if (year.includes("1980") || year.includes("2000")) score += 18;
  else if (year.includes("2000") || year.includes("2010")) score += 10;
  else score += 4;
  if (flow === "residential") {
    const wallIns = answers.r_wall_ins || "";
    if (wallIns.includes("Nincs")) score += 18;
    else if (wallIns.includes("vékonyabb")) score += 8;
    const roofIns = answers.r_roof_ins || "";
    if (roofIns.includes("Nem") && !roofIns.includes("tudom")) score += 10;
    else if (roofIns.includes("vékony")) score += 5;
    const win = answers.r_windows || "";
    if (win.includes("Egyrétegű")) score += 18;
    else if (win.includes("régebbi")) score += 10;
    else if (win.includes("modern")) score += 4;
    const heat = answers.r_heating || [];
    if (Array.isArray(heat) && heat.some(h => h.includes("Gázkazán") || h.includes("Kombi"))) score += 8;
    if (Array.isArray(heat) && heat.some(h => h.includes("Hőszivattyú"))) score -= 8;
    const gas = answers.r_gasbill || "";
    if (gas.includes("80 000")) score += 10;
    else if (gas.includes("40 000")) score += 6;
  } else {
    const ins = answers.c_insulation || [];
    if (Array.isArray(ins) && ins.includes("Nincs szigetelés")) score += 20;
    const win = answers.c_windows || "";
    if (win.includes("Egyrétegű")) score += 15;
    else if (win.includes("régebbi")) score += 8;
    const gas = answers.c_gasbill || "";
    if (gas.includes("500 000")) score += 12;
    else if (gas.includes("150 000")) score += 7;
  }
  score = Math.max(0, Math.min(100, score));
  if (score <= 8) return "A+++";
  if (score <= 16) return "A++";
  if (score <= 24) return "A+";
  if (score <= 32) return "A";
  if (score <= 42) return "B";
  if (score <= 52) return "C";
  if (score <= 62) return "D";
  if (score <= 72) return "E";
  if (score <= 82) return "F";
  return "G";
}
function improvedRating(current) {
  const idx = ratingOrder.indexOf(current);
  return ratingOrder[Math.max(0, idx - 3)];
}
// ── COMPONENTS ─────────────────────────────────────────────────────────────
function BlockProgress({ blocks, answers, questions }) {
  const blockCompletion = blocks.map(b => {
    const qs = questions.filter(q => q.block === b.id && !q.freetext);
    const answered = qs.filter(q => {
      const a = answers[q.id];
      return a !== undefined && a !== "" && !(Array.isArray(a) && a.length === 0);
    });
    return { ...b, pct: qs.length ? Math.round((answered.length / qs.length) * 100) : 0 };
  });
  return (
    <div style={{ display:"flex", gap:6, marginBottom:24, overflowX:"auto", paddingBottom:4 }}>
      {blockCompletion.map(b => (
        <div key={b.id} style={{ flex:1, minWidth:52, textAlign:"center" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background: b.pct === 100 ? b.color : b.color+"22", border:`2px solid ${b.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, margin:"0 auto 4px", transition:"background 0.3s" }}>
            {b.pct === 100 ? "✓" : b.icon}
          </div>
          <div style={{ fontSize:9, color: b.pct > 0 ? b.color : C.muted, fontWeight:700, lineHeight:1.2 }}>{b.label}</div>
          <div style={{ height:3, background:C.grayMid, borderRadius:2, marginTop:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${b.pct}%`, background:b.color, transition:"width 0.4s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function QuizOption({ label, selected, onClick, multi }) {
  return (
    <button onClick={onClick} style={{ padding:"12px 16px", background:selected ? C.sunLight : C.white, border:`2px solid ${selected ? C.sun : C.grayMid}`, borderRadius:10, cursor:"pointer", textAlign:"left", fontSize:14, color:C.text, fontWeight:selected ? 700 : 500, display:"flex", alignItems:"center", gap:10, width:"100%", transition:"all 0.15s" }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = C.sun+"88"; e.currentTarget.style.background = C.sunLight+"88"; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = C.grayMid; e.currentTarget.style.background = C.white; }}}
    >
      <div style={{ width:18, height:18, borderRadius:multi ? 4 : "50%", border:`2px solid ${selected ? C.sun : C.grayMid}`, background:selected ? C.sun : "transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:C.text, fontWeight:900, transition:"all 0.15s" }}>
        {selected && (multi ? "✓" : "●")}
      </div>
      {label}
    </button>
  );
}
function RatingBar({ label, rating }) {
  const color = ratingColors[rating] || "#888";
  const idx = ratingOrder.indexOf(rating);
  const pct = Math.round(((ratingOrder.length - 1 - idx) / (ratingOrder.length - 1)) * 100);
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:16, fontWeight:900, color, background:color+"18", padding:"2px 10px", borderRadius:6 }}>{rating}</span>
      </div>
      <div style={{ height:10, background:C.grayMid, borderRadius:6, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, #cc2222, #f09000, #d4d400, #6abf3d, #1a7a1a)`, borderRadius:6, transition:"width 0.8s ease" }} />
      </div>
    </div>
  );
}
// ── PDF CERTIFICATE ─────────────────────────────────────────────────────────
function generatePDF(answers, flow, currentRating, improvedRat, recs, contact = {}) {
  const date = new Date().toLocaleDateString("hu-HU");
  const typeKey = flow === "residential" ? "r_type" : "c_type";
  const sizeKey = flow === "residential" ? "r_size" : "c_size";
  const buildingType = answers[typeKey] || "–";
  const size = answers[sizeKey] || "–";
  const currentColor = ratingColors[currentRating] || "#888";
  const improvedColor = ratingColors[improvedRat] || "#888";
  const currentPct = Math.round(((ratingOrder.length-1-ratingOrder.indexOf(currentRating))/(ratingOrder.length-1))*100);
  const improvedPct = Math.round(((ratingOrder.length-1-ratingOrder.indexOf(improvedRat))/(ratingOrder.length-1))*100);
  const steps = ratingOrder.indexOf(currentRating) - ratingOrder.indexOf(improvedRat);
  const recRows = recs.map((r, i) =>
    `<tr>
      <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f0ede8;">${r.icon} <strong>${r.name}</strong></td>
      <td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #f0ede8;">${r.cost}</td>
      <td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #f0ede8;">${r.payback}</td>
    </tr>`
  ).join("");
  const html = `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="UTF-8">
<title>reSource – Épület Összefoglaló</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800&family=Inter:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #1A1A1A; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page { box-shadow: none !important; }
  }
  .page { max-width: 760px; margin: 0 auto; padding: 48px 44px; }
  /* HEADER */
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 22px; margin-bottom: 32px; border-bottom: 3px solid #F5C518; }
  .logo-wrap { display: flex; align-items: center; gap: 14px; }
  .logo-icon { width: 46px; height: 46px; background: #F5C518; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; color: #1A1A1A; }
  .logo-name { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .logo-sub { font-size: 11px; color: #999; margin-top: 1px; }
  .header-right { text-align: right; }
  .header-right .doc-title { font-size: 13px; font-weight: 700; color: #1A1A1A; }
  .header-right .doc-date { font-size: 12px; color: #999; margin-top: 2px; }
  /* HERO */
  .hero { background: linear-gradient(135deg, #FFFBEA, #fff9e0); border: 1.5px solid #F5C51866; border-radius: 14px; padding: 24px 26px; margin-bottom: 28px; }
  .hero-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
  .hero-sub { font-size: 14px; color: #666; }
  /* INFO GRID */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 28px; }
  .info-box { background: #F7F7F5; border-radius: 10px; padding: 13px 15px; }
  .info-label { font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .info-value { font-size: 14px; font-weight: 700; color: #1A1A1A; }
  /* RATING */
  .rating-box { background: linear-gradient(135deg, #f9fdf9, #fff); border: 1.5px solid #3DAA7233; border-radius: 14px; padding: 22px 24px; margin-bottom: 28px; }
  .rating-box-title { font-size: 11px; font-weight: 800; color: #2a8a2a; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 18px; }
  .rating-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .rating-label { font-size: 13px; color: #555; font-weight: 600; }
  .rating-badge { font-size: 18px; font-weight: 900; padding: 3px 14px; border-radius: 7px; }
  .bar-bg { height: 10px; background: #E8E8E4; border-radius: 5px; overflow: hidden; margin-bottom: 16px; }
  .bar-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #cc2222, #f09000, #d4d400, #6abf3d, #1a7a1a); }
  .improve-badge { display: inline-block; background: #e8f5e9; color: #1a6a1a; border: 1px solid #3DAA7244; border-radius: 8px; padding: 7px 16px; font-size: 13px; font-weight: 700; margin-top: 4px; }
  /* RECS */
  .recs-title { font-size: 14px; font-weight: 800; color: #1A1A1A; margin-bottom: 12px; letter-spacing: 0.3px; }
  .recs-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
  .recs-table thead { background: #F7F7F5; }
  .recs-table th { padding: 10px 14px; font-size: 10px; text-align: left; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
  /* RULE BOX */
  .rule-box { background: #F7F7F5; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; }
  .rule-box-title { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
  .rule-box p { font-size: 13px; color: #555; line-height: 1.7; }
  /* COMPLEX HOME */
  .ch-box { background: linear-gradient(135deg, #f0faf0, #e8f5e9); border: 1.5px solid #4CAF8244; border-radius: 14px; padding: 20px 22px; margin-bottom: 28px; }
  .ch-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .ch-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #6abf3d, #2a9a2a); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .ch-title { font-size: 14px; font-weight: 800; color: #1a6a1a; }
  .ch-sub { font-size: 11px; color: #3a8a3a; }
  .ch-body { font-size: 13px; color: #444; line-height: 1.65; }
  .ch-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .ch-tag { font-size: 11px; background: #d4edda; color: #1a6a1a; border-radius: 5px; padding: 3px 9px; font-weight: 700; }
  /* FOOTER */
  .footer { border-top: 2px solid #F5C518; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; }
  .footer-left .name { font-size: 13px; font-weight: 800; }
  .footer-left .contact { font-size: 11px; color: #999; margin-top: 2px; }
  .footer-right { text-align: right; font-size: 11px; color: #999; }
  .disclaimer { font-size: 10px; color: #bbb; margin-top: 18px; line-height: 1.6; }
  /* PRINT BUTTON */
  .print-btn-wrap { text-align: center; padding: 24px 0 8px; }
  .print-btn { background: #F5C518; border: none; border-radius: 12px; padding: 14px 36px; font-size: 16px; font-weight: 800; color: #1A1A1A; cursor: pointer; font-family: inherit; }
  .print-hint { font-size: 12px; color: #999; margin-top: 8px; }
</style>
</head>
<body>
<div class="page">
  <!-- HEADER -->
  <div class="header">
    <div class="logo-wrap">
      <div class="logo-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a =>
            `<line x1="${(12 + 8.5*Math.cos(a*Math.PI/180)).toFixed(2)}" y1="${(12 + 8.5*Math.sin(a*Math.PI/180)).toFixed(2)}" x2="${(12 + 11*Math.cos(a*Math.PI/180)).toFixed(2)}" y2="${(12 + 11*Math.sin(a*Math.PI/180)).toFixed(2)}" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round"/>`
          ).join("")}
          <circle cx="12" cy="12" r="7" fill="#1A1A1A"/>
          <path d="M12 8.5v3" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M9.5 10a3.5 3.5 0 1 0 5 0" stroke="white" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        </svg>
      </div>
      <div>
        <div class="logo-name"><span style="font-weight:300">re</span><span style="font-weight:800">S</span><span style="font-weight:300">ource</span> <span style="font-size:14px;color:#999;font-weight:400">app</span></div>
        <div class="logo-sub">resourcestrategist.com</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">Épület Energetikai Összefoglaló</div>
      <div class="doc-date">${date}</div>
    </div>
  </div>

  <!-- HERO -->
  <div class="hero">
    <div class="hero-title">🏡 Az épületed rendszere</div>
    <div class="hero-sub">Személyre szabott energetikai elemzés és fejlesztési terv a megadott adatok alapján</div>
    ${contact.name ? `<div style="margin-top:10px;font-size:13px;color:#555;line-height:1.7;"><strong>${contact.name}</strong>${contact.city ? "<br>" + contact.city + (contact.street ? ", " + contact.street : "") : ""}${contact.email ? "<br>" + contact.email : ""}${contact.phone ? " · " + contact.phone : ""}</div>` : ""}
  </div>

  <!-- INFO GRID -->
  <div class="info-grid">
    <div class="info-box"><div class="info-label">Épület típusa</div><div class="info-value">${buildingType}</div></div>
    <div class="info-box"><div class="info-label">Alapterület</div><div class="info-value">${size}</div></div>
    <div class="info-box"><div class="info-label">Helyszín</div><div class="info-value">${contact.city || "–"}${contact.street ? "<br><span style='font-size:11px;color:#888'>" + contact.street + "</span>" : ""}</div></div>
    <div class="info-box"><div class="info-label">Ajánlott lépések</div><div class="info-value">${recs.length} rendszer</div></div>
  </div>

  <!-- RATING -->
  <div class="rating-box">
    <div class="rating-box-title">⚡ Energetikai Besorolás</div>
    <div class="rating-row">
      <span class="rating-label">Jelenlegi besorolás</span>
      <span class="rating-badge" style="color:${currentColor};background:${currentColor}18">${currentRating}</span>
    </div>
    <div class="bar-bg"><div class="bar-fill" style="width:${currentPct}%"></div></div>
    <div class="rating-row">
      <span class="rating-label">Felújítás utáni besorolás</span>
      <span class="rating-badge" style="color:${improvedColor};background:${improvedColor}18">${improvedRat}</span>
    </div>
    <div class="bar-bg"><div class="bar-fill" style="width:${improvedPct}%"></div></div>
    <div class="improve-badge">🎯 ${steps} kategóriás javulás érhető el az ajánlott lépésekkel!</div>
  </div>

  <!-- RECS TABLE -->
  <div class="recs-title">📋 Ajánlott fejlesztési lépések – prioritási sorrendben</div>
  <table class="recs-table">
    <thead><tr><th>Rendszer</th><th>Beruházás</th><th>Megtérülés</th></tr></thead>
    <tbody>${recRows}</tbody>
  </table>

  <!-- GOLDEN RULE -->
  <div class="rule-box">
    <div class="rule-box-title">💡 Az arany szabály</div>
    <p>Először csökkentsd a veszteségeket (szigetelés, nyílászárók), aztán termeld az energiát (napelem, napkollektor), végül tárold (akkumulátor). Fordított sorrendben drágább és kevésbé hatékony.</p>
  </div>

  <!-- COMPLEX HOME -->
  <div class="ch-box">
    <div class="ch-header">
      <div class="ch-icon">🌿</div>
      <div>
        <div class="ch-title">Complex Home – Ha újat építenél</div>
        <div class="ch-sub">Moduláris, rezsimentes, önellátó passzívház</div>
      </div>
    </div>
    <div class="ch-body">Favázas, előre gyártott elemekből összerakható, teljesen off-grid ház – napelemmel, hőszivattyúval, esővízgyűjtéssel. Körülbelül 30 nap alatt felépíthető, bárhol a világon.</div>
    <div class="ch-tags">
      <span class="ch-tag">🌿 Rezsimentes</span>
      <span class="ch-tag">⚡ Off-grid</span>
      <span class="ch-tag">🔧 ~30 nap</span>
      <span class="ch-tag">🌍 Bárhol</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <div class="name">reSource</div>
      <div class="contact">hello@resourcestrategist.com · resourcestrategist.com</div>
    </div>
    <div class="footer-right">complex home partner<br>© 2025 reSource</div>
  </div>
  <div class="disclaimer">* Ez az összefoglaló tájékoztató jellegű, a megadott válaszok alapján becsült értékekkel dolgozik. Pontos energetikai tanúsítványhoz és mérnöki tervhez tanúsító szakember bevonása szükséges. A reSource nem vállal felelősséget az ebből következő döntésekért.</div>

  <!-- PRINT BUTTON -->
  <div class="print-btn-wrap no-print">
    <button class="print-btn" onclick="window.print()">⬇️ Mentés PDF-ként</button>
    <div class="print-hint">Kattintás után válaszd a "Mentés PDF-ként" opciót a nyomtatási ablakban</div>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
// ── RECS LOGIC ─────────────────────────────────────────────────────────────
function getResidentialRecs(answers) {
  const recs = [];
  const own = answers.r_ownership === "Saját tulajdon";
  const hasRoof = !["Nincs saját tető (lakás)"].includes(answers.r_roof_type);
  const goodDir = (answers.r_orientation || []).some(o => ["Dél","Délkelet","Délnyugat"].includes(o));
  const oldBuilding = ["1960 előtt","1960–1980","1980–2000"].includes(answers.r_year);
  const poorWallIns = (answers.r_wall_ins || "").includes("Nincs") || (answers.r_wall_ins || "").includes("vékonyabb");
  const poorRoofIns = (answers.r_roof_ins || "").includes("Nem") && !(answers.r_roof_ins || "").includes("tudom");
  const badWindows = ["Egyrétegű – fa keret (régi)","Kétrétegű – régebbi PVC/fa"].includes(answers.r_windows);
  const noSolar = answers.r_solar_pv !== "Igen, van";
  const gasHeat = (answers.r_heating || []).some(h => h.includes("Gáz") || h.includes("Kombi") || h.includes("pellet") || h.includes("Távhő"));
  const isPanel = answers.r_type === "Panellakás / panel épület";
  const hasTavho = (answers.r_heating || []).includes("Távhő (szolgáltatói)") || answers.r_hotwater === "Távhő (szolgáltatói)";
  const highGas = ["40 000–80 000 Ft","80 000 Ft felett"].includes(answers.r_gasbill);
  const highElec = ["25 000–50 000 Ft","50 000 Ft felett"].includes(answers.r_elecbill);
  const hasEV = ["Van már","Tervezem 1-2 éven belül"].includes(answers.r_ev);
  const bigBudget = ["2 000 000 – 5 000 000 Ft","5 000 000 Ft felett"].includes(answers.r_budget);
  const wantsIndep = (answers.r_goal || []).includes("Energetikai függetlenség");
  const hasWater = ["Nagy kert / rendszeres locsolás","Medence is van"].includes(answers.r_water);
  if (oldBuilding && (poorWallIns || poorRoofIns)) recs.push({ priority:1, icon:"🏠", name:"Hőszigetelés", tag:"ELSŐ LÉPÉS", tagColor:C.red, cost:"800 000 – 3 000 000 Ft", payback:"5–10 év", connects:["Hőszivattyú","Napelem"] });
  if (isPanel && poorWallIns) recs.push({ priority:1, icon:"🏢", name:"Panel hőszigetelés (EPS rendszer)", tag:"PANEL SPECIFIKUS", tagColor:C.red, cost:"600 000 – 2 000 000 Ft", payback:"6–10 év", connects:["Nyílászárócsere"] });
  if (hasTavho) recs.push({ priority:2, icon:"🔄", name:"Távhő optimalizálás + egyedi szabályozás", tag:"MEGTAKARÍTÁS", tagColor:C.orange, cost:"80 000 – 300 000 Ft", payback:"2–4 év", connects:["Hőszivattyú"] });
  if (badWindows) recs.push({ priority:1, icon:"🪟", name:"Nyílászárócsere", tag:"FONTOS", tagColor:C.orange, cost:"300 000 – 1 500 000 Ft", payback:"4–7 év", connects:[] });
  if (own && hasRoof && goodDir && noSolar) recs.push({ priority:poorWallIns ? 2 : 1, icon:"☀️", name:"Napelem rendszer", tag:highElec ? "KIEMELT" : "AJÁNLOTT", tagColor:C.sun, cost:"1 500 000 – 4 000 000 Ft", payback:"5–8 év", connects:["Akkumulátor","EV töltő"] });
  if (answers.r_hotwater !== "Napkollektor" && own && hasRoof) recs.push({ priority:2, icon:"🌡️", name:"Napkollektor (melegvíz)", tag:"GYORS MEGTÉRÜLÉS", tagColor:C.green, cost:"400 000 – 900 000 Ft", payback:"4–7 év", connects:[] });
  if (gasHeat && !poorWallIns && bigBudget && own) recs.push({ priority:3, icon:"♻️", name:"Hőszivattyú", tag:highGas ? "KIEMELT – MAGAS GÁSZ" : "HOSSZÚ TÁV", tagColor:highGas ? C.red : C.blue, cost:"1 500 000 – 4 500 000 Ft", payback:"7–12 év", connects:["Napelem"] });
  if (hasEV && own) recs.push({ priority:3, icon:"⚡", name:"EV töltő", tag:"PRAKTIKUS", tagColor:C.orange, cost:"150 000 – 400 000 Ft", payback:"Azonnali", connects:["Napelem"] });
  if (wantsIndep && bigBudget) recs.push({ priority:4, icon:"🔋", name:"Akkumulátor rendszer", tag:"AUTONÓMIA", tagColor:C.sunDark, cost:"1 500 000 – 3 500 000 Ft", payback:"8–12 év", connects:["Napelem"] });
  if (hasWater && own) recs.push({ priority:5, icon:"💧", name:"Esővízgyűjtés", tag:"EGYSZERŰ START", tagColor:C.teal, cost:"50 000 – 300 000 Ft", payback:"3–6 év", connects:[] });
  if (answers.r_ventilation === "Nincs, természetes szellőzés" && bigBudget) recs.push({ priority:4, icon:"🌀", name:"Hővisszanyerős szellőzés", tag:"KOMFORT", tagColor:C.purple, cost:"400 000 – 1 200 000 Ft", payback:"5–9 év", connects:[] });
  if (recs.length === 0) recs.push({ priority:1, icon:"📊", name:"Okos termosztát + mérés", tag:"AZONNAL", tagColor:C.green, cost:"30 000 – 150 000 Ft", payback:"1–2 év", connects:[], confidence:85 });

  // Add confidence scores
  const sorted = recs.sort((a,b) => a.priority - b.priority);
  return sorted.map((r, i) => ({
    ...r,
    confidence: r.confidence || Math.max(95 - (i * 8) - (poorWallIns && r.name.includes("Napelem") ? 25 : 0), 40),
    notYet: r.name === "Napelem rendszer" && (poorWallIns || poorRoofIns) ? "Előbb a szigetelés – nélküle 25-30%-kal kevesebbet termel" :
            r.name === "Akkumulátor rendszer" && !recs.find(x => x.name === "Napelem rendszer") ? "Előbb napelemet érdemes telepíteni" :
            r.name === "Hőszivattyú" && (poorWallIns || poorRoofIns) ? "Rossz szigetelésű házban sokat fogyaszt – előbb szigetelj" : null,
    isTop: i === 0,
  }));
}
function getCommercialRecs(answers) {
  const recs = [];
  const own = answers.c_ownership === "Saját tulajdon";
  const hasRoof = !["Nincs saját tető"].includes(answers.c_roof_type);
  const goodDir = (answers.c_orientation || []).some(o => o.includes("Dél"));
  const noSolar = answers.c_solar !== "Igen";
  const highGas = ["150 000–500 000 Ft","500 000 Ft felett"].includes(answers.c_gasbill);
  const highElec = ["150 000–500 000 Ft","500 000 Ft felett"].includes(answers.c_elecbill);
  const bigBudget = ["5–20 M Ft","20 M Ft felett"].includes(answers.c_budget);
  const ins = answers.c_insulation || [];
  const poorIns = Array.isArray(ins) && ins.includes("Nincs szigetelés");
  if (poorIns) recs.push({ priority:1, icon:"🏢", name:"Épületszigetelés", tag:"ALAP", tagColor:C.red, cost:"Egyedi felmérés", payback:"5–10 év", connects:[] });
  if (own && hasRoof && goodDir && noSolar) recs.push({ priority:poorIns ? 2 : 1, icon:"☀️", name:"Ipari / kereskedelmi napelem", tag:highElec ? "KIEMELT" : "AJÁNLOTT", tagColor:C.sun, cost:"3 000 000 – 20 000 000 Ft", payback:"4–7 év", connects:["Akkumulátor"] });
  if (highGas) recs.push({ priority:2, icon:"♻️", name:"Hőszivattyú / kazáncsere", tag:"REZSIOPTIMALIZÁLÁS", tagColor:C.blue, cost:"Egyedi felmérés", payback:"5–10 év", connects:[] });
  if (!answers.c_bms || answers.c_bms === "Nincs") recs.push({ priority:3, icon:"🤖", name:"Épületautomatizálás (BMS)", tag:"ESG + MEGTAKARÍTÁS", tagColor:C.teal, cost:"500 000 – 3 000 000 Ft", payback:"3–6 év", connects:[] });
  if (bigBudget) recs.push({ priority:4, icon:"🔋", name:"Akkumulátor (kereskedelmi)", tag:"CSÚCSTELJ. KEZELÉS", tagColor:C.sunDark, cost:"5 000 000 – 30 000 000 Ft", payback:"6–10 év", connects:["Napelem"] });
  if (answers.c_ev === "Van már" || answers.c_ev === "Tervezve") recs.push({ priority:3, icon:"⚡", name:"Céges EV töltők", tag:"FLOTTA", tagColor:C.orange, cost:"300 000 – 2 000 000 Ft", payback:"Azonnali", connects:[] });
  if (recs.length === 0) recs.push({ priority:1, icon:"📊", name:"Energiaaudit + mérés", tag:"ELSŐ LÉPÉS", tagColor:C.green, cost:"150 000 – 400 000 Ft", payback:"Azonnal", connects:[] });
  return recs.sort((a,b) => a.priority - b.priority);
}
// ── RESULTS ────────────────────────────────────────────────────────────────
function ResultsView({ answers, flow, onRestart }) {
  const recs = (flow === "residential" ? getResidentialRecs(answers) : getCommercialRecs(answers)).map(r => ({
    ...r,
    roi: calcROI(answers, r)
  }));
  const current = calcRating(answers, flow);
  const improved = improvedRating(current);
  const steps = ratingOrder.indexOf(current) - ratingOrder.indexOf(improved);
  const [downloading, setDownloading] = useState(false);
  const [contact, setContact] = useState({ name:"", city:"", street:"", email:"", phone:"" });
  const [contactDone, setContactDone] = useState(false);
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = () => {
    if (!contact.name.trim()) { setContactError("Kérjük add meg a neved!"); return; }
    if (!contact.city?.trim()) { setContactError("Kérjük add meg az irányítószámot és várost!"); return; }
    if (!contact.email.trim() && !contact.phone.trim()) { setContactError("Email vagy telefonszám szükséges!"); return; }
    setContactError("");
    setContactDone(true);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      generatePDF(answers, flow, current, improved, recs, contact);
      setDownloading(false);
    }, 300);
  };
  return (
    <div>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.sunLight},#fff9e6)`, border:`1.5px solid ${C.sun}55`, borderRadius:12, padding:"18px 16px", marginBottom:18 }}>
        <div style={{ fontSize:32, marginBottom:8 }}>🏡</div>
        <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6, fontFamily:"'Playfair Display', Georgia, serif" }}>A te épületed terve</h2>
        <p style={{ fontSize:13, color:C.gray, lineHeight:1.5 }}>{recs.length} ajánlott fejlesztés – energetikai besorolással és prioritási sorrendben.</p>
      </div>
      {/* Energy rating */}
      <div style={{ background:C.white, border:`1.5px solid ${C.grayMid}`, borderRadius:14, overflow:"hidden", marginBottom:16 }}>
        <div style={{ background:`linear-gradient(135deg,#1a7a1a18,${C.sunLight})`, padding:"14px 16px", borderBottom:`1px solid ${C.grayMid}` }}>
          <div style={{ fontSize:11, fontWeight:800, color:C.sunDark, letterSpacing:1.5, marginBottom:4 }}>⚡ ENERGETIKAI BESOROLÁS</div>
          <p style={{ fontSize:13, color:C.gray, margin:0 }}>Az ajánlott felújítások elvégzése után elérhető szint:</p>
        </div>
        <div style={{ padding:"16px 16px 14px" }}>
          <RatingBar label="Jelenlegi besorolás" rating={current} />
          <div style={{ textAlign:"center", fontSize:18, color:C.green, margin:"6px 0" }}>↓</div>
          <RatingBar label="Felújítás utáni besorolás" rating={improved} />
          {steps > 0 && <div style={{ marginTop:10, background:"#3daa7218", border:"1px solid #3daa7244", borderRadius:8, padding:"8px 12px", fontSize:13, color:"#1a6a1a", fontWeight:700, textAlign:"center" }}>🎯 {steps} kategóriás javulás érhető el!</div>}
          <p style={{ fontSize:10, color:C.muted, marginTop:10, lineHeight:1.5 }}>* Tájékoztató jellegű becslés. Pontos értékhez energetikai tanúsító szakember szükséges.</p>
        </div>
      </div>
      {/* TOP 1 kártya */}
      {recs[0] && (
        <div style={{ background:"linear-gradient(135deg,#1A1A1A,#2a2a2a)", borderRadius:14, padding:"18px 16px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, color:C.sun, letterSpacing:2, marginBottom:8 }}>⚡ HA CSAK 1 DOLGOT TESZEL</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>{recs[0].icon} {recs[0].name}</div>
          <div style={{ fontSize:13, color:"#ccc", lineHeight:1.6, marginBottom:10 }}>
            Ez a legfontosabb lépés a te épületed esetében. Minden más erre épül.
          </div>
          {recs[0].roi && (
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ background:"#ffffff18", borderRadius:8, padding:"8px 12px", flex:1 }}>
                <div style={{ fontSize:10, color:"#aaa", marginBottom:2 }}>ÉVI MEGTAKARÍTÁS</div>
                <div style={{ fontWeight:800, fontSize:14, color:C.sun }}>{formatFt(recs[0].roi.save)}</div>
              </div>
              <div style={{ background:"#ffffff18", borderRadius:8, padding:"8px 12px", flex:1 }}>
                <div style={{ fontSize:10, color:"#aaa", marginBottom:2 }}>MEGTÉRÜLÉS</div>
                <div style={{ fontWeight:800, fontSize:14, color:C.sun }}>{recs[0].roi.years} év</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mit ne csinálj még */}
      {recs.some(r => r.notYet) && (
        <div style={{ background:"#fff5f5", border:"1.5px solid #E0525222", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:800, color:C.red, letterSpacing:1.5, marginBottom:8 }}>❌ MOST MÉG NE CSINÁLD</div>
          {recs.filter(r => r.notYet).map(r => (
            <div key={r.name} style={{ display:"flex", gap:10, marginBottom:6, alignItems:"flex-start" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{r.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{r.name}</div>
                <div style={{ fontSize:12, color:C.red, marginTop:1 }}>{r.notYet}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recs */}
      <p style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Összes ajánlott lépés</p>
      {recs.map((rec, i) => (
        <div key={rec.name} style={{ background:C.white, border:`1.5px solid ${C.grayMid}`, borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom: rec.roi ? 10 : 0 }}>
            <div style={{ width:42, height:42, borderRadius:10, background:rec.tagColor+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{rec.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ marginBottom:3 }}>
                <span style={{ fontSize:10, fontWeight:800, color:rec.tagColor, background:rec.tagColor+"18", padding:"2px 7px", borderRadius:4 }}>{rec.tag}</span>
                <span style={{ fontSize:10, color:C.muted, marginLeft:6 }}>#{i+1}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{rec.name}</div>
              {!rec.roi && <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{rec.cost} · {rec.payback}</div>}
              {rec.confidence && (
                <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ flex:1, height:4, background:C.grayMid, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${rec.confidence}%`, background: rec.confidence > 80 ? C.green : rec.confidence > 60 ? C.sun : C.orange, borderRadius:2 }} />
                  </div>
                  <span style={{ fontSize:10, color: rec.confidence > 80 ? C.green : rec.confidence > 60 ? C.sunDark : C.orange, fontWeight:700, flexShrink:0 }}>
                    {rec.confidence}% illeszkedés
                  </span>
                </div>
              )}
            </div>
          </div>
          {rec.roi && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <div style={{ background:C.grayLight, borderRadius:8, padding:"8px 12px", flex:1, minWidth:90 }}>
                <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>BERUHÁZÁS</div>
                <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{formatFt(rec.roi.cost)}</div>
              </div>
              <div style={{ background:"#e8f5e9", borderRadius:8, padding:"8px 12px", flex:1, minWidth:90 }}>
                <div style={{ fontSize:10, color:"#2a7a2a", marginBottom:2 }}>ÉVI MEGTAKARÍTÁS</div>
                <div style={{ fontWeight:700, fontSize:13, color:"#1a6a1a" }}>{formatFt(rec.roi.save)}</div>
              </div>
              <div style={{ background:C.sunLight, borderRadius:8, padding:"8px 12px", flex:1, minWidth:90 }}>
                <div style={{ fontSize:10, color:C.sunDark, marginBottom:2 }}>MEGTÉRÜLÉS</div>
                <div style={{ fontWeight:700, fontSize:13, color:C.sunDark }}>{rec.roi.years} év</div>
              </div>
              {rec.roi.save * 10 > rec.roi.cost && (
                <div style={{ background:"#e3f2fd", borderRadius:8, padding:"8px 12px", flex:"0 0 100%" }}>
                  <div style={{ fontSize:10, color:"#1565c0", marginBottom:2 }}>10 ÉV ALATT NETTÓ NYERESÉG</div>
                  <div style={{ fontWeight:800, fontSize:14, color:"#1565c0" }}>+{formatFt(rec.roi.save * 10 - rec.roi.cost)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {/* Golden rule */}
      <div style={{ background:C.grayLight, borderRadius:12, padding:"14px 16px", margin:"16px 0 8px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:5 }}>💡 Az arany szabály</div>
        <p style={{ fontSize:13, color:C.gray, lineHeight:1.6, margin:0 }}>Először csökkentsd a veszteségeket (szigetelés, ablakok), aztán termeld az energiát (napelem), végül tárold (akkumulátor).</p>
      </div>

      {/* Detailed survey CTA */}
      {!detailedMode && (
        <div style={{ background:`linear-gradient(135deg,${C.sunLight},#fff)`, border:`1.5px solid ${C.sun}55`, borderRadius:14, padding:"16px 16px", marginBottom:8 }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:4 }}>🔍 Pontosabb eredményt szeretnél?</div>
          <p style={{ fontSize:12, color:C.muted, lineHeight:1.6, marginBottom:12 }}>A részletes felmérés (+8-10 perc) még pontosabb ajánlásokat és energetikai besorolást ad.</p>
          <button
            onClick={() => { setDetailedMode(true); setStep(14); setScreen("quiz"); }}
            style={{ width:"100%", padding:"12px", background:C.sun, border:"none", borderRadius:10, cursor:"pointer", fontWeight:800, fontSize:14, color:C.text }}
          >
            Részletesebb felmérés indítása →
          </button>
        </div>
      )}
      {/* Contact + PDF download */}
      <div style={{ background:C.white, border:`1.5px solid ${C.grayMid}`, borderRadius:14, overflow:"hidden", marginBottom:12 }}>
        <div style={{ padding:"16px 16px 8px", borderBottom:`1px solid ${C.grayMid}`, background:`linear-gradient(135deg,${C.sunLight},#fff)` }}>
          <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:2 }}>⬇️ PDF összefoglaló letöltése</div>
          <div style={{ fontSize:12, color:C.muted }}>Add meg adataidat – emailben is elküldjük, és visszakereshető marad.</div>
        </div>
        <div style={{ padding:"16px" }}>
          {!contactDone ? (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:10 }}>
                <input
                  placeholder="Neved *"
                  value={contact.name}
                  onChange={e => setContact(p => ({...p, name: e.target.value}))}
                  style={{ padding:"11px 14px", border:`1.5px solid ${contactError && !contact.name.trim() ? C.red : C.grayMid}`, borderRadius:10, fontSize:14, outline:"none", color:C.text, fontFamily:"inherit" }}
                />
                <input
                  placeholder="Irányítószám és város *"
                  value={contact.city}
                  onChange={e => setContact(p => ({...p, city: e.target.value}))}
                  style={{ padding:"11px 14px", border:`1.5px solid ${contactError && !contact.city?.trim() ? C.red : C.grayMid}`, borderRadius:10, fontSize:14, outline:"none", color:C.text, fontFamily:"inherit" }}
                />
                <input
                  placeholder="Utca, házszám"
                  value={contact.street}
                  onChange={e => setContact(p => ({...p, street: e.target.value}))}
                  style={{ padding:"11px 14px", border:`1.5px solid ${C.grayMid}`, borderRadius:10, fontSize:14, outline:"none", color:C.text, fontFamily:"inherit" }}
                />
                <input
                  placeholder="Email cím"
                  value={contact.email}
                  onChange={e => setContact(p => ({...p, email: e.target.value}))}
                  style={{ padding:"11px 14px", border:`1.5px solid ${contactError && !contact.email && !contact.phone ? C.red : C.grayMid}`, borderRadius:10, fontSize:14, outline:"none", color:C.text, fontFamily:"inherit" }}
                />
                <input
                  placeholder="Telefonszám"
                  value={contact.phone}
                  onChange={e => setContact(p => ({...p, phone: e.target.value}))}
                  style={{ padding:"11px 14px", border:`1.5px solid ${C.grayMid}`, borderRadius:10, fontSize:14, outline:"none", color:C.text, fontFamily:"inherit" }}
                />
              </div>
              {contactError && <div style={{ fontSize:12, color:C.red, marginBottom:8 }}>⚠ {contactError}</div>}
              <button
                onClick={handleContactSubmit}
                style={{ width:"100%", padding:"13px", background:C.sun, border:"none", borderRadius:10, cursor:"pointer", fontWeight:800, fontSize:15, color:C.text }}
              >
                Összefoglaló megnyitása →
              </button>
              <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:8 }}>Adataidat csak a reSource kezeli, harmadik félnek nem adjuk át.</div>
            </>
          ) : (
            <>
              <div style={{ background:"#e8f5e9", borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#1a6a1a", fontWeight:600 }}>
                ✓ Köszönöm, {contact.name}! Az összefoglaló megnyílik egy új fülön.
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{ width:"100%", padding:"13px", background:downloading ? C.grayMid : C.sun, border:"none", borderRadius:10, cursor:downloading ? "default" : "pointer", fontWeight:800, fontSize:15, color:C.text, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
              >
                {downloading ? "⏳ Megnyitás..." : "⬇️ PDF letöltése / nyomtatása"}
              </button>
              <div style={{ fontSize:11, color:C.muted, textAlign:"center", marginTop:8 }}>A nyomtatási ablakban válaszd: „Mentés PDF-ként"</div>
            </>
          )}
        </div>
      </div>


      {/* CTA */}
      <div style={{ borderRadius:14, overflow:"hidden", border:`1.5px solid ${C.grayMid}`, marginBottom:14 }}>
        <div style={{ padding:"16px 16px", background:C.white }}>
          <div style={{ fontSize:22, marginBottom:8 }}>📬</div>
          <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:6 }}>Kérd az ingyenes szakértői egyeztetést!</div>
          <p style={{ fontSize:13, color:C.gray, lineHeight:1.6, marginBottom:14 }}>Személyes segítséget kérsz? Vedd fel velünk a kapcsolatot és együtt megtaláljuk a legjobb megoldást.</p>
          <div style={{ display:"flex", gap:8 }}>
            <input placeholder="email@cimed.hu" style={{ flex:1, padding:"11px 14px", border:`1.5px solid ${C.grayMid}`, borderRadius:10, fontSize:14, outline:"none", color:C.text }} />
            <button style={{ padding:"11px 16px", background:C.sun, border:"none", borderRadius:10, cursor:"pointer", fontWeight:800, fontSize:14, color:C.text }}>→</button>
          </div>
        </div>
      </div>

      <button onClick={onRestart} style={{ width:"100%", padding:"12px", background:"transparent", border:`1.5px solid ${C.grayMid}`, borderRadius:10, cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600 }}>
        ↺ Újrakezdés más épülettel
      </button>
    </div>
  );
}
// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function ResourceApp() {
  const [screen, setScreen] = useState("intro"); // intro | flowSelect | quiz | results
  const [flow, setFlow] = useState(null); // residential | commercial
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState([]);
  const [freetext, setFreetext] = useState("");
  const [detailedMode, setDetailedMode] = useState(false);
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:wght@700;800&display=swap'); * { box-sizing:border-box; margin:0; padding:0; } button:focus { outline:none; }`;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);
  const questions = flow ? QUESTIONS[flow] : [];
  const blocks = flow ? BLOCKS[flow] : [];
  const visibleQuestions = questions.filter(q => {
    if (q.condition && !q.condition(answers)) return false;
    if (flow === "commercial") return true;
    if (!detailedMode && q.basic !== true) return false;
    return true;
  });
  useEffect(() => {
    if (screen === "quiz" && visibleQuestions[step]) {
      const q = visibleQuestions[step];
      const cur = answers[q.id];
      if (q.freetext) { setFreetext(cur || ""); setSelected([]); }
      else if (q.multi) { setSelected(Array.isArray(cur) ? cur : []); }
      else { setSelected(cur ? [cur] : []); }
    }
  }, [step, screen, flow]);
  const q = visibleQuestions[step];
  const isMulti = q?.multi;
  const isFreetext = q?.freetext;
  const currentBlock = blocks.find(b => b.id === q?.block);
  const pct = visibleQuestions.length ? Math.round((step / visibleQuestions.length) * 100) : 0;
  const advance = (newAnswers) => {
    const nextStep = step + 1;
    if (nextStep >= visibleQuestions.length) { setScreen("results"); }
    else { setStep(nextStep); }
  };
  const toggleOpt = (opt) => {
    if (!isMulti) {
      const newAnswers = { ...answers, [q.id]: opt };
      setAnswers(newAnswers);
      setTimeout(() => advance(newAnswers), 160);
      return;
    }
    const excl = ["Semmi nincs felújítva","Nincs szomszéd","Nem releváns","Nem releváns"];
    setSelected(prev => {
      if (excl.some(e => opt.includes(e))) return [opt];
      const base = prev.filter(x => !excl.some(e => x.includes(e)));
      return base.includes(opt) ? base.filter(x => x !== opt) : [...base, opt];
    });
  };
  const confirmMulti = () => {
    if (selected.length === 0) return;
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    advance(newAnswers);
  };
  const confirmFreetext = () => {
    const newAnswers = { ...answers, [q.id]: freetext };
    setAnswers(newAnswers);
    advance(newAnswers);
  };
  const handleBack = () => {
    if (step === 0) setScreen("flowSelect");
    else setStep(s => s - 1);
  };
  const handleRestart = () => { setAnswers({}); setStep(0); setSelected([]); setFlow(null); setDetailedMode(false); setScreen("intro"); };
  return (
    <div style={{ minHeight:"100vh", background:C.grayLight, fontFamily:"'Helvetica Neue', Arial, sans-serif", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px 60px" }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
          {/* App icon: sun + power */}
          <div style={{ width:42, height:42, background:C.sun, borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px #F5C51844" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              {/* Sun rays */}
              {[0,30,60,90,120,150,180,210,240,270,300,330].map(angle => (
                <line key={angle}
                  x1={12 + 8.5*Math.cos(angle*Math.PI/180)}
                  y1={12 + 8.5*Math.sin(angle*Math.PI/180)}
                  x2={12 + 11*Math.cos(angle*Math.PI/180)}
                  y2={12 + 11*Math.sin(angle*Math.PI/180)}
                  stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round"/>
              ))}
              {/* Sun circle */}
              <circle cx="12" cy="12" r="7" fill="#1A1A1A"/>
              {/* Power icon */}
              <path d="M12 8.5v3" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M9.5 10a3.5 3.5 0 1 0 5 0" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          {/* Brand name */}
          <div>
            <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:20, fontWeight:700, color:C.text, letterSpacing:"-0.3px", lineHeight:1 }}>
              <span style={{ fontWeight:300 }}>re</span><span style={{ fontWeight:700 }}>S</span><span style={{ fontWeight:300 }}>ource</span>
            </div>
            <div style={{ fontFamily:"'DM Sans', sans-serif", fontSize:11, color:C.muted, letterSpacing:"0.5px", marginTop:2 }}>app</div>
          </div>
        </div>
        <div style={{ background:C.white, borderRadius:18, padding:"26px 22px", boxShadow:"0 2px 24px rgba(0,0,0,0.07)" }}>
          {/* ── INTRO ── */}
          {screen === "intro" && (
            <div>
              <div style={{ fontSize:42, marginBottom:14 }}>🏠</div>
              <h1 style={{ fontSize:24, fontWeight:800, color:C.text, marginBottom:12, lineHeight:1.3, fontFamily:"'Playfair Display', Georgia, serif" }}>Tervezd meg épületed rendszerét</h1>
              <p style={{ fontSize:14, color:C.gray, lineHeight:1.65, marginBottom:22 }}>Részletes kérdőív alapján személyre szabott javaslatokat kapsz – energetikai besorolással, letölthető összefoglalóval és lépésről lépésre tervvel.</p>
              <div style={{ display:"flex", gap:8, marginBottom:26, flexWrap:"wrap" }}>
                {["⏱ 5–8 perc","🎯 Személyre szabott","⚡ Energetikai besorolás","⬇️ Letölthető összefoglaló"].map(tag => (
                  <span key={tag} style={{ fontSize:11, background:C.grayLight, color:C.gray, borderRadius:6, padding:"4px 10px", fontWeight:600 }}>{tag}</span>
                ))}
              </div>
              <button onClick={() => setScreen("flowSelect")} style={{ width:"100%", padding:"15px", background:C.sun, border:"none", borderRadius:12, cursor:"pointer", fontSize:16, fontWeight:800, color:C.text }}>
                Kezdjük el →
              </button>
            </div>
          )}
          {/* ── FLOW SELECT ── */}
          {screen === "flowSelect" && (
            <div>
              <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:8, fontFamily:"'Playfair Display', Georgia, serif" }}>Milyen épületről van szó?</h2>
              <p style={{ fontSize:13, color:C.muted, marginBottom:22 }}>A kérdések ettől függően változnak.</p>
              {[
                { id:"residential", icon:"🏠", label:"Lakóépület", desc:"Ház, lakás, tanya, nyaraló", color:C.blue },
                { id:"commercial",  icon:"🏢", label:"Vállalkozás / Üzlet", desc:"Iroda, üzlet, üzem, raktár", color:C.teal },
              ].map(f => (
                <button key={f.id} onClick={() => { setFlow(f.id); setStep(0); setAnswers({}); setScreen("quiz"); }}
                  style={{ width:"100%", padding:"18px 16px", background:C.white, border:`2px solid ${C.grayMid}`, borderRadius:14, cursor:"pointer", textAlign:"left", marginBottom:12, display:"flex", alignItems:"center", gap:14 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = f.color; e.currentTarget.style.background = f.color+"10"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.grayMid; e.currentTarget.style.background = C.white; }}
                >
                  <div style={{ width:50, height:50, borderRadius:12, background:f.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color:C.text }}>{f.label}</div>
                    <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{f.desc}</div>
                  </div>
                  <div style={{ marginLeft:"auto", color:C.muted }}>›</div>
                </button>
              ))}
              <button onClick={() => setScreen("intro")} style={{ marginTop:8, background:"none", border:"none", color:C.muted, fontSize:13, cursor:"pointer", padding:0 }}>← Vissza</button>
            </div>
          )}
          {/* ── QUIZ ── */}
          {screen === "quiz" && q && (
            <div>
              {/* Block progress */}
              <BlockProgress blocks={blocks} answers={answers} questions={visibleQuestions} />
              {/* Progress bar */}
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:C.muted }}>{step + 1} / {visibleQuestions.length}</span>
                  <span style={{ fontSize:11, color:C.sunDark, fontWeight:700 }}>{pct}%</span>
                </div>
                <div style={{ height:4, background:C.grayMid, borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.sun},${C.sunDark})`, borderRadius:2, transition:"width 0.3s" }} />
                </div>
              </div>
              {/* Block label */}
              {currentBlock && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:currentBlock.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>{currentBlock.icon}</div>
                  <span style={{ fontSize:11, fontWeight:700, color:currentBlock.color, letterSpacing:1.5, textTransform:"uppercase" }}>{currentBlock.label}</span>
                  {isMulti && <span style={{ fontSize:11, color:C.sunDark, fontWeight:700 }}>· több is választható</span>}
                </div>
              )}
              <h2 style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:18, lineHeight:1.35, fontFamily:"'Playfair Display', Georgia, serif" }}>{q.q}</h2>
              {isFreetext ? (
                <>
                  <textarea value={freetext} onChange={e => setFreetext(e.target.value)} placeholder="Ide írhatod a megjegyzésedet, különleges adottságokat…" rows={4} style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${C.grayMid}`, borderRadius:10, fontSize:14, color:C.text, resize:"vertical", outline:"none", fontFamily:"inherit" }} />
                  <button onClick={confirmFreetext} style={{ marginTop:12, width:"100%", padding:"13px", background:C.sun, border:"none", borderRadius:10, cursor:"pointer", fontWeight:800, fontSize:15, color:C.text }}>
                    {freetext ? "Mentés és tovább →" : "Kihagyom →"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    {q.opts.map(opt => <QuizOption key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggleOpt(opt)} multi={isMulti} />)}
                  </div>
                  {isMulti && (
                    <button onClick={confirmMulti} disabled={selected.length === 0} style={{ marginTop:14, width:"100%", padding:"13px", background:selected.length > 0 ? C.sun : C.grayMid, border:"none", borderRadius:10, cursor:selected.length > 0 ? "pointer" : "default", fontWeight:800, fontSize:15, color:C.text }}>
                      Tovább →
                    </button>
                  )}
                </>
              )}
              <button onClick={handleBack} style={{ marginTop:14, background:"none", border:"none", color:C.muted, fontSize:13, cursor:"pointer", padding:0 }}>← Vissza</button>
            </div>
          )}
          {/* ── RESULTS ── */}
          {screen === "results" && (
            <ResultsView answers={answers} flow={flow} onRestart={handleRestart} />
          )}
        </div>
        <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:C.muted }}>reSource App · 2025</div>
      </div>
    </div>
  );
}
