"use client";
import { useState, useEffect } from "react";

const C = {
  sun: "#4CAF50", sunLight: "#F1F8F1", sunDark: "#2E7D32",
  gray: "#4A4A4A", grayLight: "#F2F2F2", grayMid: "#E0E0E0",
  white: "#FFFFFF", text: "#1E1E1E", muted: "#8A8A8A",
  red: "#D32F2F", green: "#4CAF50", blue: "#1565C0", orange: "#E65100",
  teal: "#00695C", purple: "#4527A0",
};

const CONTACT_WEBHOOK = "https://hook.eu1.make.com/lsu9uh21a5adryscrbb1dugri9ddxuca";

const ratingColors = {
  "A+++":"#1a7a1a","A++":"#2a9a2a","A+":"#3daa3d","A":"#6abf3d",
  "B":"#a8c830","C":"#d4d400","D":"#f0c000","E":"#f09000","F":"#e05a00","G":"#cc2222",
};
const ratingOrder = ["A+++","A++","A+","A","B","C","D","E","F","G"];

function HouseLeafLogo({ size = 26, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M2 14L16 3L30 14V30H21V21H11V30H2V14Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
      <path d="M11 24C11 24 12 17 18 15C18 15 19 21 15 24C17 24 20 21 20 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M15 24C13.5 21 18 15 18 15" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function calcROI(answers, rec) {
  const sizeMap = {"40 m\u00b2 alatt":35,"40\u201370 m\u00b2":55,"70\u2013120 m\u00b2":95,"120\u2013200 m\u00b2":160,"200 m\u00b2 felett":220};
  const size = sizeMap[answers.r_size] || 80;
  const gasBill = {"Nincs g\u00e1z":0,"0\u201315 000 Ft":8000,"15 000\u201340 000 Ft":25000,"40 000\u201380 000 Ft":60000,"80 000 Ft felett":100000};
  const elecBill = {"0\u201310 000 Ft":5000,"10 000\u201325 000 Ft":17000,"25 000\u201350 000 Ft":37000,"50 000 Ft felett":65000};
  const yearlyGas = (gasBill[answers.r_gasbill] || 0) * 12;
  const yearlyElec = (elecBill[answers.r_elecbill] || 17000) * 12;
  switch(rec.name) {
    case "H\u0151szigetel\u00e9s":
    case "H\u0151szigetel\u00e9s + Ny\u00edl\u00e1sz\u00e1r\u00f3csere": { const s=Math.round(yearlyGas*0.35+yearlyElec*0.15); const c=size<60?900000:size<120?1800000:2800000; return {save:s,cost:c,years:Math.round(c/Math.max(s,1))}; }
    case "Napelem rendszer": { const s=Math.round(yearlyElec*0.75); const c=size<60?1800000:size<120?2800000:3800000; return {save:s,cost:c,years:Math.round(c/Math.max(s,1))}; }
    case "Napkollektor (melegv\u00edz)": { const s=Math.max(Math.round(yearlyGas*0.2+yearlyElec*0.1),60000); return {save:s,cost:650000,years:Math.round(650000/s)}; }
    case "H\u0151szivatty\u00fa": { const s=Math.round(yearlyGas*0.7); return {save:s,cost:2500000,years:Math.round(2500000/Math.max(s,1))}; }
    case "Akkumul\u00e1tor rendszer": { const s=Math.round(yearlyElec*0.4); return {save:s,cost:2000000,years:Math.round(2000000/Math.max(s,1))}; }
    case "EV t\u00f6lt\u0151": return {save:180000,cost:250000,years:1};
    case "T\u00e1vh\u0151 optimaliz\u00e1l\u00e1s + egyedi szab\u00e1lyoz\u00e1s": return {save:Math.round(yearlyGas*0.15+yearlyElec*0.1),cost:150000,years:2};
    case "Panel h\u0151szigetel\u00e9s (EPS rendszer)": { const s=Math.max(Math.round(yearlyGas*0.3+yearlyElec*0.1),80000); return {save:s,cost:1200000,years:Math.round(1200000/s)}; }
    default: return null;
  }
}

function formatFt(n) {
  if (n>=1000000) return (n/1000000).toFixed(1).replace('.0','')+' M Ft';
  if (n>=1000) return Math.round(n/1000)+' e Ft';
  return n+' Ft';
}

function calcWater(answers) {
  const sizeMap = {"40 m\u00b2 alatt":35,"40\u201370 m\u00b2":55,"70\u2013120 m\u00b2":95,"120\u2013200 m\u00b2":160,"200 m\u00b2 felett":220};
  const size = sizeMap[answers.r_size] || 80;
  const roofArea = Math.round(size * 0.65);
  const city = (answers.r_city || "").toLowerCase();
  let rainfall = 550;
  if (city.includes("budapest")||city.includes("1")) rainfall=580;
  else if (city.includes("debrecen")||city.includes("4")) rainfall=520;
  else if (city.includes("p\u00e9cs")||city.includes("7")) rainfall=640;
  else if (city.includes("gy\u0151r")||city.includes("9")) rainfall=600;
  else if (city.includes("miskolc")||city.includes("3")) rainfall=560;
  else if (city.includes("sopron")) rainfall=680;
  const runoff = answers.r_roof_type==="Lapostető (saj\u00e1t)"?0.85:0.80;
  const annualLiters = Math.round(roofArea*rainfall*runoff);
  const persons = {"1 f\u0151":1,"2 f\u0151":2,"3\u20134 f\u0151":3.5,"5+ f\u0151":5}[answers.r_persons]||2;
  const replaceable = Math.round(persons*150*365*0.40);
  const savings = Math.round(Math.min(annualLiters,replaceable)*0.35);
  const tankSize = Math.max(Math.round(Math.min(annualLiters,replaceable)/6/1000)*1000,3000);
  let droughtRisk="K\u00f6zepes", droughtColor="#E67E22";
  if (rainfall<520){droughtRisk="Magas";droughtColor="#E74C3C";}
  else if (rainfall>620){droughtRisk="Alacsony";droughtColor="#27AE60";}
  return {roofArea,rainfall,annualLiters,replaceable,savings,tankSize,droughtRisk,droughtColor,
    selfSufficiency:Math.round(Math.min(annualLiters/replaceable*100,100))};
}

function WaterCard({answers}) {
  if (!answers.r_roof_type||answers.r_roof_type.includes("Nincs saját tető")) return null;
  const w = calcWater(answers);
  return (
    <div style={{background:"linear-gradient(135deg,#EBF5FB,#E8F8F5)",border:"1.5px solid #A9D4F055",borderRadius:14,overflow:"hidden",marginBottom:14}}>
      <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#1A5276,#1A7A5E)",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22}}>💧</span>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>Vízgazdálkodási elemzés</div>
          <div style={{fontSize:11,color:"#A8D8EA",marginTop:1}}>Tetőfelület és megadott irányítószám alapján becsülve</div>
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {[
            {label:"ÉVI GYŰJTHETŐ VÍZ",val:`${(w.annualLiters/1000).toFixed(0)}m³`,sub:`${w.annualLiters.toLocaleString()} liter`,color:"#1A5276"},
            {label:"ÉVI MEGTAKARÍTÁS",val:formatFt(w.savings),sub:"vízdíj megtakarítás",color:"#1A7A5E"},
            {label:"ÖNELLÁTÁS",val:`${w.selfSufficiency}%`,sub:"nem ivóvíz igény",color:"#1A5276"},
          ].map(item=>(
            <div key={item.label} style={{background:"#fff",borderRadius:10,padding:"12px 14px",flex:1,minWidth:90,border:"1px solid #A9D4F033"}}>
              <div style={{fontSize:10,color:"#5D8AA8",fontWeight:700,marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:18,fontWeight:800,color:item.color}}>{item.val}</div>
              <div style={{fontSize:11,color:"#888"}}>{item.sub}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:10,padding:"12px 14px",marginBottom:10,border:"1px solid #A9D4F033"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700,color:"#1A5276"}}>Évi csapadék a régiódban</span>
            <span style={{fontSize:12,fontWeight:800,color:"#1A5276"}}>{w.rainfall} mm</span>
          </div>
          <div style={{height:8,background:"#E8F4FD",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.round(w.rainfall/800*100)}%`,background:"linear-gradient(90deg,#3498DB,#1A5276)",borderRadius:4}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{background:w.droughtColor+"18",border:`1px solid ${w.droughtColor}44`,borderRadius:8,padding:"8px 12px",flex:1}}>
            <div style={{fontSize:10,color:w.droughtColor,fontWeight:700,marginBottom:2}}>ASZÁLYKOCKÁZAT</div>
            <div style={{fontSize:13,fontWeight:800,color:w.droughtColor}}>{w.droughtRisk}</div>
          </div>
          <div style={{background:"#E8F8F5",border:"1px solid #A8E6C544",borderRadius:8,padding:"8px 12px",flex:2}}>
            <div style={{fontSize:10,color:"#1A7A5E",fontWeight:700,marginBottom:2}}>AJÁNLOTT TARTÁLYMÉRET</div>
            <div style={{fontSize:13,fontWeight:800,color:"#1A7A5E"}}>{(w.tankSize/1000).toFixed(0)}.000 liter</div>
          </div>
        </div>
        <div style={{fontSize:11,color:"#666",lineHeight:1.6,background:"#f0f8ff",borderRadius:8,padding:"10px 12px"}}>
          Az adatok becslések: a megadott irányítószám/település, az átlagos csapadékmennyiség és az épület becsült tetőfelülete alapján készülnek.
        </div>
      </div>
    </div>
  );
}

const BLOCKS = {
  residential: [
    {id:"epulet",label:"Épület",color:C.blue},
    {id:"fogyasztas",label:"Fogyasztás",color:C.orange},
    {id:"rendszerek",label:"Rendszerek",color:C.teal},
    {id:"kornyezet",label:"Környezet",color:C.sunDark},
    {id:"celok",label:"Célok",color:C.sun},
  ],
  commercial: [
    {id:"epulet",label:"Épület",color:C.blue},
    {id:"fogyasztas",label:"Fogyasztás",color:C.orange},
    {id:"rendszerek",label:"Rendszerek",color:C.teal},
    {id:"celok",label:"Célok",color:C.sun},
  ],
};

const QUESTIONS = {
  residential: [
    {id:"r_type",block:"epulet",q:"Milyen típusú az épület?",multi:false,opts:["Önálló családi ház","Ikerház","Sorház","Társasházi lakás – téglaépület","Panellakás / panel épület","Tanya / vidéki birtok","Nyaraló"],basic:true},
    {id:"r_zip",block:"epulet",q:"Melyik településen vagy irányítószámon van az épület?",multi:false,opts:[],freetext:true,basic:true},
    {id:"r_attached",block:"epulet",q:"Hány oldalon érintkezik más épülettel?",multi:false,opts:["Sehol – teljesen önálló","1 oldalon (ikerház)","2 oldalon (sorközi)","Több oldalon (társasház)"]},
    {id:"r_neighbors",block:"epulet",q:"Van-e szomszéd fal / szomszéd lakás?",multi:true,opts:["Felső szomszéd van","Alsó szomszéd van","Oldalsó szomszéd","Nincs szomszéd","Nem releváns"]},
    {id:"r_size",block:"epulet",q:"Mekkora az alapterület?",multi:false,opts:["40 m² alatt","40–70 m²","70–120 m²","120–200 m²","200 m² felett"],basic:true},
    {id:"r_floors",block:"epulet",q:"Hány szintes az épület?",multi:false,opts:["Földszintes","Emeletes (2 szint)","2+ emeletes","Tetőtér beépítéssel"]},
    {id:"r_year",block:"epulet",q:"Mikor épült az épület?",multi:false,opts:["1960 előtt","1960–1980","1980–2000","2000–2010","2010 után"],basic:true},
    {id:"r_material",block:"epulet",q:"Mi az épület fő falanyaga?",multi:false,opts:["Tégla – régi tömör","Tégla – modern üreges","Ytong / pórobeton","Beton / panel","Fa szerkezet","Vályog","Kő","Vegyes / nem tudom"],basic:true},
    {id:"r_roof_type",block:"epulet",q:"Milyen a tető típusa?",multi:false,opts:["Nyeregtető (saját)","Kontyolt tető (saját)","Lapostető (saját)","Nincs saját tető (lakás)"],basic:true},
    {id:"r_roof_ins",block:"epulet",q:"Szigetelt-e a tető / padlás?",multi:false,opts:["Igen, korszerűen (15+ cm)","Igen, de vékony","Nem","Nem tudom"]},
    {id:"r_wall_ins",block:"epulet",q:"Van-e homlokzati hőszigetelés?",multi:false,opts:["Igen, 10+ cm","Igen, de vékonyabb","Nincs","Nem tudom"]},
    {id:"r_floor_ins",block:"epulet",q:"Szigetelt-e a padló / alaplemez?",multi:false,opts:["Igen","Nem","Nem tudom"]},
    {id:"r_windows",block:"epulet",q:"Milyen típusú a nyílászáró?",multi:false,opts:["Egyrétegű – fa keret (régi)","Kétrétegű – régebbi PVC/fa","Kétrétegű – modern, jó tömítés","Háromrétegű (korszerű)","Vegyes"],basic:true},
    {id:"r_win_year",block:"epulet",q:"Mikor cserélték a nyílászárókat?",multi:false,opts:["Eredeti (épülettel együtt)","1990–2005 között","2005–2015 között","2015 után","Nem tudom"]},
    {id:"r_orientation",block:"epulet",q:"Merre néznek a főfelületek / tető?",multi:true,opts:["Dél","Délkelet","Délnyugat","Kelet","Nyugat","Észak","Nem tudom"]},
    {id:"r_persons",block:"fogyasztas",q:"Hány személy él az épületben?",multi:false,opts:["1 fő","2 fő","3–4 fő","5+ fő"],basic:true},
    {id:"r_heating",block:"fogyasztas",q:"Mivel fűtöd az épületet?",multi:true,opts:["Gázkazán","Kombi cirkó","Távhő (szolgáltatói)","Elektromos fűtőtest","Hőszivattyú","Fa / pellet kazán","Kandalló","Padlófűtés","Egyéb"],basic:true},
    {id:"r_heat_year",block:"fogyasztas",q:"Mikor telepítették a fűtési rendszert?",multi:false,opts:["1990 előtt","1990–2005","2005–2015","2015 után","Nem tudom"]},
    {id:"r_hotwater",block:"fogyasztas",q:"Honnan jön a melegvíz?",multi:false,opts:["Kombi cirkó (bojler nélkül)","Gázboiler","Elektromos bojler","Távhő (szolgáltatói)","Napkollektor","Hőszivattyú","Egyéb"],basic:true},
    {id:"r_ventilation",block:"fogyasztas",q:"Van-e gépi szellőzés / hővisszanyerő?",multi:false,opts:["Igen – hővisszanyerős (HRV)","Igen – egyszerű elszívó","Nincs, természetes","Nem tudom"]},
    {id:"r_gasbill",block:"fogyasztas",q:"Havi átlag gázszámla (fűtési szezonban)?",multi:false,opts:["Nincs gáz","0–15 000 Ft","15 000–40 000 Ft","40 000–80 000 Ft","80 000 Ft felett"],basic:true},
    {id:"r_elecbill",block:"fogyasztas",q:"Havi átlag villanyszámla?",multi:false,opts:["0–10 000 Ft","10 000–25 000 Ft","25 000–50 000 Ft","50 000 Ft felett"],basic:true},
    {id:"r_water",block:"fogyasztas",q:"Van-e nagyobb vízfogyasztás?",multi:false,opts:["Nagy kert / rendszeres locsolás","Medence is van","Kis kert, alkalmi locsolás","Nincs kert"]},
    {id:"r_ev",block:"fogyasztas",q:"Elektromos autó?",multi:false,opts:["Van már","Tervezem 1-2 éven belül","Nem tervezem"]},
    {id:"r_solar_pv",block:"rendszerek",q:"Van-e már napelem?",multi:false,opts:["Igen, van","Nincs","Tervezett / folyamatban"],basic:true},
    {id:"r_solar_kw",block:"rendszerek",q:"Ha van napelem – mekkora a rendszer?",multi:false,opts:["Nincs napelem","1–3 kWp","3–6 kWp","6–10 kWp","10 kWp felett"]},
    {id:"r_battery",block:"rendszerek",q:"Van-e akkumulátor / tárolórendszer?",multi:false,opts:["Igen, van","Nincs","Tervezett"]},
    {id:"r_collector",block:"rendszerek",q:"Van-e napkollektor (melegvíz)?",multi:false,opts:["Igen, van","Nincs","Tervezett"]},
    {id:"r_rainwater",block:"rendszerek",q:"Van-e esővízgyűjtő rendszer?",multi:false,opts:["Igen, van","Nincs","Tervezett"]},
    {id:"r_renovations",block:"rendszerek",q:"Milyen felújítások történtek már?",multi:true,opts:["Homlokzati szigetelés","Tetőszigetelés","Nyílászárócsere","Fűtéskorszerűsítés","Villamos hálózat","Vízvezeték","Semmi jelentős"]},
    {id:"r_shading",block:"kornyezet",q:"Van-e árnyékolás a tetőn / déli oldalon?",multi:true,opts:["Nagy fák a déli oldalon","Szomszéd épület árnyékol","Saját tetőszerkezet árnyékol","Nincs jelentős árnyékolás"]},
    {id:"r_land",block:"kornyezet",q:"Mekkora a telek / kert?",multi:false,opts:["Nagy (500 m² felett)","Közepes (100–500 m²)","Kis kert / udvar","Nincs (lakás)"]},
    {id:"r_ownership",block:"celok",q:"Saját vagy bérelt az ingatlan?",multi:false,opts:["Saját tulajdon","Bérelt","Szülőké / más tulajdona"]},
    {id:"r_goal",block:"celok",q:"Mi a fő motiváció?",multi:true,opts:["Spórolni a számlákon","Energetikai függetlenség","Környezettudatosság","Ingatlan értéke","Komfort növelése"],basic:true},
    {id:"r_budget",block:"celok",q:"Mekkora tőke áll rendelkezésre?",multi:false,opts:["0–500 000 Ft","500 000 – 2 000 000 Ft","2 000 000 – 5 000 000 Ft","5 000 000 Ft felett"],basic:true},
    {id:"r_horizon",block:"celok",q:"Milyen időtávban gondolkodol?",multi:false,opts:["1–2 év","3–5 év","10+ év"]},
    {id:"r_plan",block:"celok",q:"Mi a legfontosabb következő lépés számodra?",multi:false,opts:["Teljes felújítás egyszerre","Lépésről lépésre haladok","Csak egy-két dolgot szeretnék megcsinálni","Még csak tájékozódom"]},
    {id:"r_notes",block:"celok",q:"Van egyéb megjegyzés, különleges adottság?",multi:false,opts:[],freetext:true},
  ],
  commercial: [
    {id:"c_type",block:"epulet",q:"Milyen típusú az épület / helyiség?",multi:false,opts:["Iroda","Kiskereskedelmi üzlet","Vendéglátóhely","Szolgáltató (szalon, műhely)","Raktár","Üzem / gyár","Mezőgazdasági épület","Egyéb"]},
    {id:"c_size",block:"epulet",q:"Mekkora az alapterület?",multi:false,opts:["100 m² alatt","100–300 m²","300–1000 m²","1000 m² felett"]},
    {id:"c_year",block:"epulet",q:"Mikor épült az épület?",multi:false,opts:["1980 előtt","1980–2000","2000–2015","2015 után"]},
    {id:"c_material",block:"epulet",q:"Mi az épület fő falanyaga?",multi:false,opts:["Tégla","Beton / panel","Szendvicspanel","Fa / könnyűszerkezet","Vegyes / nem tudom"]},
    {id:"c_roof_type",block:"epulet",q:"Milyen a tető?",multi:false,opts:["Lapostető (saját)","Nyeregtető (saját)","Ipari hall tető","Nincs saját tető"]},
    {id:"c_insulation",block:"epulet",q:"Van-e hőszigetelés?",multi:true,opts:["Homlokzat szigetelt","Tető szigetelt","Nincs szigetelés","Nem tudom"]},
    {id:"c_windows",block:"epulet",q:"Nyílászárók típusa?",multi:false,opts:["Egyrétegű (régi)","Kétrétegű (régebbi)","Kétrétegű (modern)","Háromrétegű","Főleg üvegfelület (curtain wall)"]},
    {id:"c_orientation",block:"epulet",q:"Merre néz a tető / főfelület?",multi:true,opts:["Dél / Délkelet / Délnyugat","Kelet / Nyugat","Észak","Vegyes","Nem tudom"]},
    {id:"c_ownership",block:"epulet",q:"Saját vagy bérelt az ingatlan?",multi:false,opts:["Saját tulajdon","Bérelt","Egyéb"]},
    {id:"c_heating",block:"fogyasztas",q:"Fűtési rendszer?",multi:true,opts:["Gázkazán / kazánház","Hőszivattyú","Elektromos","Távhő","Fa / pellet","Nincs fűtés","Egyéb"]},
    {id:"c_cooling",block:"fogyasztas",q:"Van-e hűtési / klíma rendszer?",multi:false,opts:["Igen, split klíma","Igen, központi klíma","VRF / VRV rendszer","Nincs","Egyéb"]},
    {id:"c_hotwater",block:"fogyasztas",q:"Melegvíz forrása?",multi:false,opts:["Gázboiler","Elektromos bojler","Napkollektor","Hőszivattyú","Nem releváns"]},
    {id:"c_gasbill",block:"fogyasztas",q:"Havi átlag gázszámla?",multi:false,opts:["Nincs gáz","0–50 000 Ft","50 000–150 000 Ft","150 000–500 000 Ft","500 000 Ft felett"]},
    {id:"c_elecbill",block:"fogyasztas",q:"Havi átlag villanyszámla?",multi:false,opts:["0–50 000 Ft","50 000–150 000 Ft","150 000–500 000 Ft","500 000 Ft felett"]},
    {id:"c_ophours",block:"fogyasztas",q:"Hány órát üzemel naponta?",multi:false,opts:["8 óra (irodai munkaidő)","12 óra","16+ óra","24/7"]},
    {id:"c_ev",block:"fogyasztas",q:"Van-e vagy tervezett céges elektromos jármű?",multi:false,opts:["Van már","Tervezve","Nincs"]},
    {id:"c_solar",block:"rendszerek",q:"Van-e már napelem?",multi:false,opts:["Igen","Nincs","Tervezett"]},
    {id:"c_battery",block:"rendszerek",q:"Van-e akkumulátor / szünetmentes?",multi:false,opts:["Igen","Nincs","Tervezett"]},
    {id:"c_bms",block:"rendszerek",q:"Van-e épületautomatizálás / BMS?",multi:false,opts:["Igen, komplex BMS","Részleges automatizálás","Nincs","Nem tudom"]},
    {id:"c_goal",block:"celok",q:"Fő motiváció?",multi:true,opts:["Rezsiköltség csökkentés","ESG / fenntarthatósági célok","Energetikai függetlenség","Pályázati lehetőségek","PR / imázs"]},
    {id:"c_budget",block:"celok",q:"Rendelkezésre álló keret?",multi:false,opts:["1 M Ft alatt","1–5 M Ft","5–20 M Ft","20 M Ft felett"]},
    {id:"c_horizon",block:"celok",q:"Döntési időtáv?",multi:false,opts:["3 hónapon belül","6–12 hónap","1–3 év","Csak tájékozódom"]},
    {id:"c_notes",block:"celok",q:"Egyéb megjegyzés, különleges adottság?",multi:false,opts:[],freetext:true},
  ],
};

function calcRating(answers, flow) {
  let score = 0;
  const year = answers[flow==="residential"?"r_year":"c_year"]||"";
  if (year.includes("1960 előtt")||year.includes("1980 előtt")) score+=38;
  else if (year.includes("1960")||year.includes("1980")) score+=28;
  else if (year.includes("1980")||year.includes("2000")) score+=18;
  else if (year.includes("2000")||year.includes("2010")) score+=10;
  else score+=4;
  if (flow==="residential") {
    const wi=answers.r_wall_ins||""; if(wi.includes("Nincs"))score+=18; else if(wi.includes("vékonyabb"))score+=8;
    const ri=answers.r_roof_ins||""; if(ri.includes("Nem")&&!ri.includes("tudom"))score+=10; else if(ri.includes("vékony"))score+=5;
    const win=answers.r_windows||""; if(win.includes("Egyrétegű"))score+=18; else if(win.includes("régebbi"))score+=10; else if(win.includes("modern"))score+=4;
    const heat=answers.r_heating||[];
    if(Array.isArray(heat)&&heat.some(h=>h.includes("Gázkazán")||h.includes("Kombi")))score+=8;
    if(Array.isArray(heat)&&heat.some(h=>h.includes("Hőszivattyú")))score-=8;
    const gas=answers.r_gasbill||""; if(gas.includes("80 000"))score+=10; else if(gas.includes("40 000"))score+=6;
  } else {
    const ins=answers.c_insulation||[]; if(Array.isArray(ins)&&ins.includes("Nincs szigetelés"))score+=20;
    const win=answers.c_windows||""; if(win.includes("Egyrétegű"))score+=15; else if(win.includes("régebbi"))score+=8;
    const gas=answers.c_gasbill||""; if(gas.includes("500 000"))score+=12; else if(gas.includes("150 000"))score+=7;
  }
  score=Math.max(0,Math.min(100,score));
  if(score<=8)return"A+++"; if(score<=16)return"A++"; if(score<=24)return"A+"; if(score<=32)return"A";
  if(score<=42)return"B"; if(score<=52)return"C"; if(score<=62)return"D"; if(score<=72)return"E"; if(score<=82)return"F"; return"G";
}

function improvedRating(current) {
  return ratingOrder[Math.max(0,ratingOrder.indexOf(current)-3)];
}

function getResidentialRecs(answers) {
  const recs=[];
  const own=answers.r_ownership==="Saját tulajdon";
  const hasRoof=!answers.r_roof_type?.includes("Nincs saját tető");
  const goodDir=(answers.r_orientation||[]).some(o=>["Dél","Délkelet","Délnyugat"].includes(o));
  const oldBuilding=["1960 előtt","1960–1980","1980–2000"].includes(answers.r_year);
  const poorWallIns=(answers.r_wall_ins||"").includes("Nincs")||(answers.r_wall_ins||"").includes("vékonyabb");
  const poorRoofIns=(answers.r_roof_ins||"").includes("Nem")&&!(answers.r_roof_ins||"").includes("tudom");
  const badWindows=["Egyrétegű – fa keret (régi)","Kétrétegű – régebbi PVC/fa"].includes(answers.r_windows);
  const noSolar=answers.r_solar_pv!=="Igen, van";
  const gasHeat=(answers.r_heating||[]).some(h=>h.includes("Gáz")||h.includes("Kombi")||h.includes("pellet")||h.includes("Távhő"));
  const isPanel=answers.r_type==="Panellakás / panel épület";
  const hasTavho=(answers.r_heating||[]).includes("Távhő (szolgáltatói)")||answers.r_hotwater==="Távhő (szolgáltatói)";
  const highGas=["40 000–80 000 Ft","80 000 Ft felett"].includes(answers.r_gasbill);
  const highElec=["25 000–50 000 Ft","50 000 Ft felett"].includes(answers.r_elecbill);
  const hasEV=["Van már","Tervezem 1-2 éven belül"].includes(answers.r_ev);
  const bigBudget=["2 000 000 – 5 000 000 Ft","5 000 000 Ft felett"].includes(answers.r_budget);
  const wantsIndep=(answers.r_goal||[]).includes("Energetikai függetlenség");
  const hasWater=["Nagy kert / rendszeres locsolás","Medence is van"].includes(answers.r_water);
  if(oldBuilding&&(poorWallIns||poorRoofIns))recs.push({priority:1,name:"Hőszigetelés",tag:"ELSŐ LÉPÉS",tagColor:C.red,cost:"800 000 – 3 000 000 Ft",payback:"5–10 év"});
  if(isPanel&&poorWallIns)recs.push({priority:1,name:"Panel hőszigetelés (EPS rendszer)",tag:"PANEL SPECIFIKUS",tagColor:C.red,cost:"600 000 – 2 000 000 Ft",payback:"6–10 év"});
  if(hasTavho)recs.push({priority:2,name:"Távhő optimalizálás + egyedi szabályozás",tag:"MEGTAKARÍTÁS",tagColor:C.orange,cost:"80 000 – 300 000 Ft",payback:"2–4 év"});
  if(badWindows)recs.push({priority:1,name:"Nyílászárócsere",tag:"FONTOS",tagColor:C.orange,cost:"300 000 – 1 500 000 Ft",payback:"4–7 év"});
  if(own&&hasRoof&&goodDir&&noSolar)recs.push({priority:poorWallIns?2:1,name:"Napelem rendszer",tag:highElec?"KIEMELT":"AJÁNLOTT",tagColor:C.sun,cost:"1 500 000 – 4 000 000 Ft",payback:"5–8 év"});
  if(answers.r_hotwater!=="Napkollektor"&&own&&hasRoof)recs.push({priority:2,name:"Napkollektor (melegvíz)",tag:"GYORS MEGTÉRÜLÉS",tagColor:C.sunDark,cost:"400 000 – 900 000 Ft",payback:"4–7 év"});
  if(gasHeat&&!poorWallIns&&bigBudget&&own)recs.push({priority:3,name:"Hőszivattyú",tag:highGas?"KIEMELT – MAGAS GÁZ":"HOSSZÚ TÁV",tagColor:highGas?C.red:C.blue,cost:"1 500 000 – 4 500 000 Ft",payback:"7–12 év"});
  if(hasEV&&own)recs.push({priority:3,name:"EV töltő",tag:"PRAKTIKUS",tagColor:C.orange,cost:"150 000 – 400 000 Ft",payback:"Azonnali"});
  if(wantsIndep&&bigBudget)recs.push({priority:4,name:"Akkumulátor rendszer",tag:"AUTONÓMIA",tagColor:C.sunDark,cost:"1 500 000 – 3 500 000 Ft",payback:"8–12 év"});
  if(hasWater&&own)recs.push({priority:5,name:"Esővízgyűjtés",tag:"EGYSZERŰ START",tagColor:C.teal,cost:"50 000 – 300 000 Ft",payback:"3–6 év"});
  if(recs.length===0)recs.push({priority:1,name:"Okos termosztát + mérés",tag:"AZONNAL",tagColor:C.sunDark,cost:"30 000 – 150 000 Ft",payback:"1–2 év",confidence:85});
  return recs.sort((a,b)=>a.priority-b.priority).map((r,i)=>({
    ...r,
    confidence:r.confidence||Math.max(95-(i*8)-(poorWallIns&&r.name.includes("Napelem")?25:0),40),
    notYet:r.name==="Napelem rendszer"&&(poorWallIns||poorRoofIns)?"Előbb a szigetelés – nélküle 25–30%-kal kevesebbet termel":
           r.name==="Akkumulátor rendszer"&&!recs.find(x=>x.name==="Napelem rendszer")?"Előbb napelemet érdemes telepíteni":
           r.name==="Hőszivattyú"&&(poorWallIns||poorRoofIns)?"Rossz szigetelésű házban sokat fogyaszt – előbb szigetelj":null,
  }));
}

function getCommercialRecs(answers) {
  const recs=[];
  const own=answers.c_ownership==="Saját tulajdon";
  const hasRoof=!["Nincs saját tető"].includes(answers.c_roof_type);
  const goodDir=(answers.c_orientation||[]).some(o=>o.includes("Dél"));
  const noSolar=answers.c_solar!=="Igen";
  const highElec=["150 000–500 000 Ft","500 000 Ft felett"].includes(answers.c_elecbill);
  const highGas=["150 000–500 000 Ft","500 000 Ft felett"].includes(answers.c_gasbill);
  const bigBudget=["5–20 M Ft","20 M Ft felett"].includes(answers.c_budget);
  const ins=answers.c_insulation||[];
  const poorIns=Array.isArray(ins)&&ins.includes("Nincs szigetelés");
  if(poorIns)recs.push({priority:1,name:"Épületszigetelés",tag:"ALAP",tagColor:C.red,cost:"Egyedi felmérés",payback:"5–10 év"});
  if(own&&hasRoof&&goodDir&&noSolar)recs.push({priority:poorIns?2:1,name:"Ipari / kereskedelmi napelem",tag:highElec?"KIEMELT":"AJÁNLOTT",tagColor:C.sun,cost:"3 000 000 – 20 000 000 Ft",payback:"4–7 év"});
  if(highGas)recs.push({priority:2,name:"Hőszivattyú / kazáncsere",tag:"REZSIOPTIMALIZÁLÁS",tagColor:C.blue,cost:"Egyedi felmérés",payback:"5–10 év"});
  if(!answers.c_bms||answers.c_bms==="Nincs")recs.push({priority:3,name:"Épületautomatizálás (BMS)",tag:"ESG + MEGTAKARÍTÁS",tagColor:C.teal,cost:"500 000 – 3 000 000 Ft",payback:"3–6 év"});
  if(bigBudget)recs.push({priority:4,name:"Akkumulátor (kereskedelmi)",tag:"CSÚCSTELJ. KEZELÉS",tagColor:C.sunDark,cost:"5 000 000 – 30 000 000 Ft",payback:"6–10 év"});
  if(answers.c_ev==="Van már"||answers.c_ev==="Tervezve")recs.push({priority:3,name:"Céges EV töltők",tag:"FLOTTA",tagColor:C.orange,cost:"300 000 – 2 000 000 Ft",payback:"Azonnali"});
  if(recs.length===0)recs.push({priority:1,name:"Energiaaudit + mérés",tag:"ELSŐ LÉPÉS",tagColor:C.sunDark,cost:"150 000 – 400 000 Ft",payback:"Azonnal"});
  return recs.sort((a,b)=>a.priority-b.priority);
}

function generatePDF(answers,flow,currentRating,improvedRat,recs,contact={}) {
  const date=new Date().toLocaleDateString("hu-HU");
  const buildingType=answers[flow==="residential"?"r_type":"c_type"]||"–";
  const size=answers[flow==="residential"?"r_size":"c_size"]||"–";
  const cC=ratingColors[currentRating]||"#888"; const iC=ratingColors[improvedRat]||"#888";
  const cP=Math.round(((ratingOrder.length-1-ratingOrder.indexOf(currentRating))/(ratingOrder.length-1))*100);
  const iP=Math.round(((ratingOrder.length-1-ratingOrder.indexOf(improvedRat))/(ratingOrder.length-1))*100);
  const steps=ratingOrder.indexOf(currentRating)-ratingOrder.indexOf(improvedRat);
  const recRows=recs.map(r=>`<tr><td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0;"><strong>${r.name}</strong></td><td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">${r.cost}</td><td style="padding:10px 14px;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;">${r.payback}</td></tr>`).join("");
  const html=`<!DOCTYPE html><html lang="hu"><head><meta charset="UTF-8"><title>reSource</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Poppins',Arial,sans-serif;background:#fff;color:#1E1E1E;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.no-print{display:none!important;}}
.page{max-width:760px;margin:0 auto;padding:48px 44px;}
.header{display:flex;align-items:center;justify-content:space-between;padding-bottom:22px;margin-bottom:32px;border-bottom:3px solid #4CAF50;}
.hero{background:#E8F5E9;border-radius:14px;padding:24px 26px;margin-bottom:28px;}
.hero-title{font-size:24px;font-weight:700;margin-bottom:4px;}
.hero-sub{font-size:14px;color:#555;}
.info-grid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:28px;}
.info-box{background:#F2F2F2;border-radius:10px;padding:13px 15px;}
.info-label{font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;}
.info-value{font-size:14px;font-weight:700;}
.rating-box{background:#F9FDF9;border:1.5px solid #4CAF5044;border-radius:14px;padding:22px 24px;margin-bottom:28px;}
.rating-title{font-size:11px;font-weight:800;color:#2E7D32;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:18px;}
.rating-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
.rating-badge{font-size:18px;font-weight:900;padding:3px 14px;border-radius:7px;}
.bar-bg{height:8px;background:#E0E0E0;border-radius:4px;overflow:hidden;margin-bottom:16px;}
.bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#cc2222,#f09000,#d4d400,#6abf3d,#1a7a1a);}
.improve-badge{display:inline-block;background:#E8F5E9;color:#1a6a1a;border:1px solid #4CAF5044;border-radius:8px;padding:7px 16px;font-size:13px;font-weight:700;margin-top:4px;}
.recs-table{width:100%;border-collapse:collapse;margin-bottom:26px;}
.recs-table thead{background:#F2F2F2;}
.recs-table th{padding:10px 14px;font-size:10px;text-align:left;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:.8px;}
.rule-box{background:#F2F2F2;border-radius:12px;padding:16px 20px;margin-bottom:28px;}
.footer{border-top:2px solid #4CAF50;padding-top:18px;display:flex;justify-content:space-between;align-items:center;}
.print-btn{background:#4CAF50;border:none;border-radius:12px;padding:14px 36px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;font-family:inherit;}
</style></head><body><div class="page">
<div class="header">
  <div style="display:flex;align-items:center;gap:14px;">
    <img src="/logo.png" height="46" style="object-fit:contain;" alt="reSource app"/>
    <div style="font-size:11px;color:#999;">resourcestrategist.com</div>
  </div>
  <div style="text-align:right;"><div style="font-size:13px;font-weight:700;">Épület Energetikai Összefoglaló</div><div style="font-size:12px;color:#999;margin-top:2px;">${date}</div></div>
</div>
<div class="hero">
  <div class="hero-title">Az épületed energetikai terve</div>
  <div class="hero-sub">Személyre szabott elemzés és fejlesztési javaslatok a megadott adatok alapján</div>
  ${contact.name?`<div style="margin-top:10px;font-size:13px;color:#555;line-height:1.7;"><strong>${contact.name}</strong>${contact.city?"<br>"+contact.city+(contact.street?", "+contact.street:""):""}${contact.email?"<br>"+contact.email:""}${contact.phone?" · "+contact.phone:""}</div>`:""}
</div>
<div class="info-grid">
  <div class="info-box"><div class="info-label">Épület típusa</div><div class="info-value">${buildingType}</div></div>
  <div class="info-box"><div class="info-label">Alapterület</div><div class="info-value">${size}</div></div>
  <div class="info-box"><div class="info-label">Helyszín</div><div class="info-value">${contact.city||"–"}</div></div>
  <div class="info-box"><div class="info-label">Ajánlott lépések</div><div class="info-value">${recs.length} rendszer</div></div>
</div>
<div class="rating-box">
  <div class="rating-title">Energetikai Besorolás</div>
  <div class="rating-row"><span style="font-size:13px;color:#555;font-weight:600;">Jelenlegi</span><span class="rating-badge" style="color:${cC};background:${cC}18">${currentRating}</span></div>
  <div class="bar-bg"><div class="bar-fill" style="width:${cP}%"></div></div>
  <div class="rating-row"><span style="font-size:13px;color:#555;font-weight:600;">Felújítás után</span><span class="rating-badge" style="color:${iC};background:${iC}18">${improvedRat}</span></div>
  <div class="bar-bg"><div class="bar-fill" style="width:${iP}%"></div></div>
  <div class="improve-badge">${steps} kategóriás javulás érhető el az ajánlott lépésekkel</div>
</div>
<div style="font-size:14px;font-weight:700;margin-bottom:12px;">Ajánlott fejlesztési lépések – prioritási sorrendben</div>
<table class="recs-table"><thead><tr><th>Rendszer</th><th>Beruházás</th><th>Megtérülés</th></tr></thead><tbody>${recRows}</tbody></table>
<div class="rule-box"><div style="font-size:13px;font-weight:700;margin-bottom:6px;">Az arany szabály</div><p style="font-size:13px;color:#555;line-height:1.7;">Először csökkentsd a veszteségeket (szigetelés, nyílászárók), aztán termeld az energiát (napelem, napkollektor), végül tárold (akkumulátor).</p></div>
<div class="footer">
  <div><div style="font-size:13px;font-weight:800;">reSource app</div><div style="font-size:11px;color:#999;margin-top:2px;">hello@resourcestrategist.com · resourcestrategist.com</div></div>
  <div style="text-align:right;font-size:11px;color:#999;">© 2025 reSource</div>
</div>
<div style="font-size:10px;color:#bbb;margin-top:18px;line-height:1.6;">* Tájékoztató jellegű becslés. Pontos energetikai tanúsítványhoz tanúsító szakember bevonása szükséges.</div>
<div style="text-align:center;padding:24px 0 8px;" class="no-print"><button class="print-btn" onclick="window.print()">Mentés PDF-ként</button></div>
</div></body></html>`;
  const win=window.open("","_blank");
  if(win){win.document.write(html);win.document.close();}
}

function BlockProgress({blocks,answers,questions}) {
  const bc=blocks.map(b=>{
    const qs=questions.filter(q=>q.block===b.id&&!q.freetext);
    const ans=qs.filter(q=>{const a=answers[q.id];return a!==undefined&&a!==""&&!(Array.isArray(a)&&a.length===0);});
    return {...b,pct:qs.length?Math.round((ans.length/qs.length)*100):0};
  });
  return (
    <div style={{display:"flex",gap:4,marginBottom:24,overflowX:"auto",paddingBottom:4}}>
      {bc.map(b=>(
        <div key={b.id} style={{flex:1,minWidth:48}}>
          <div style={{fontSize:9,color:b.pct>0?b.color:C.muted,fontWeight:700,textAlign:"center",marginBottom:4}}>{b.label}</div>
          <div style={{height:4,background:C.grayMid,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${b.pct}%`,background:b.color,borderRadius:2,transition:"width 0.4s"}}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizOption({label,selected,onClick,multi}) {
  const [hover,setHover]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{padding:"12px 16px",background:selected?C.sunLight:hover?"#F5FAF5":C.white,border:`1.5px solid ${selected?C.sun:hover?C.sun+"66":C.grayMid}`,borderRadius:8,cursor:"pointer",textAlign:"left",fontSize:14,color:C.text,fontWeight:selected?600:400,display:"flex",alignItems:"center",gap:12,width:"100%",transition:"all 0.15s",fontFamily:"'Poppins',sans-serif"}}>
      <div style={{width:18,height:18,borderRadius:multi?4:"50%",border:`2px solid ${selected?C.sun:C.grayMid}`,background:selected?C.sun:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:900}}>
        {selected&&(multi?"✓":"●")}
      </div>
      {label}
    </button>
  );
}

function RatingBar({label,rating}) {
  const color=ratingColors[rating]||"#888";
  const pct=Math.round(((ratingOrder.length-1-ratingOrder.indexOf(rating))/(ratingOrder.length-1))*100);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <span style={{fontSize:12,color:C.muted,fontWeight:600}}>{label}</span>
        <span style={{fontSize:15,fontWeight:800,color,background:color+"18",padding:"2px 10px",borderRadius:6}}>{rating}</span>
      </div>
      <div style={{height:8,background:C.grayMid,borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#cc2222,#f09000,#d4d400,#6abf3d,#1a7a1a)",borderRadius:4,transition:"width 0.8s ease"}}/>
      </div>
    </div>
  );
}

function ResultsView({answers,flow,onRestart,detailedMode,setDetailedMode,setStep,setScreen}) {
  const recs=(flow==="residential"?getResidentialRecs(answers):getCommercialRecs(answers)).map(r=>({...r,roi:calcROI(answers,r)}));
  const current=calcRating(answers,flow);
  const improved=improvedRating(current);
  const steps=ratingOrder.indexOf(current)-ratingOrder.indexOf(improved);
  const [downloading,setDownloading]=useState(false);
  const [contact,setContact]=useState({name:"",city:"",street:"",email:"",phone:""});
  const [contactDone,setContactDone]=useState(false);
  const [contactError,setContactError]=useState("");

 const handleContactSubmit=()=>{
  const email = contact.email.trim();
  const phone = contact.phone.trim();
  const phoneDigits = phone.replace(/\D/g,"");

  if(!contact.name.trim()){
    setContactError("Kérjük add meg a neved!");
    return;
  }

  if(!contact.city?.trim()){
    setContactError("Kérjük add meg az irányítószámot és várost!");
    return;
  }

  if(!email && !phone){
    setContactError("Email vagy telefonszám szükséges!");
    return;
  }

  if(email && !email.includes("@")){
    setContactError("Kérjük valós email címet adj meg.");
    return;
  }

  if(phone && phoneDigits.length < 8){
    setContactError("Kérjük valós telefonszámot adj meg.");
    return;
  }

  setContactError("");
  setContactDone(true);

fetch(CONTACT_WEBHOOK, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    lead_id: "RS-" + Date.now(),
    datum: new Date().toLocaleString("hu-HU"),
    forras: "reSource App",

    nev: contact.name,
    email: contact.email || "",
    telefon: contact.phone || "",
    varos: answers.r_zip || contact.city || "",
    utca: contact.street || "",

    flow: flow === "residential" ? "Lakóépület" : "Vállalkozás",

    epulet_tipus: answers.r_type || answers.c_type || "",
    epulet_meret: answers.r_size || answers.c_size || "",
    epitesi_ev: answers.r_year || answers.c_year || "",
    falazat: answers.r_material || answers.c_material || "",
    teto_tipus: answers.r_roof_type || answers.c_roof_type || "",
    nyilaszarok: answers.r_windows || answers.c_windows || "",

    futes: Array.isArray(answers.r_heating)
      ? answers.r_heating.join(", ")
      : Array.isArray(answers.c_heating)
      ? answers.c_heating.join(", ")
      : "",

    melegviz: answers.r_hotwater || answers.c_hotwater || "",
    gaz_szamla: answers.r_gasbill || answers.c_gasbill || "",
    villany_szamla: answers.r_elecbill || answers.c_elecbill || "",

    napelem: answers.r_solar_pv || answers.c_solar || "",
    akkumulátor: answers.r_battery || answers.c_battery || "",
    elektromos_auto: answers.r_ev || answers.c_ev || "",

    nagyobb_vizfogyasztas: answers.r_water || "",
    kert_zoldfelulet: answers.r_land || "",
    ontozes: answers.r_water || "",
    esovizgyujtes: answers.r_rainwater || "",

    cel: Array.isArray(answers.r_goal)
      ? answers.r_goal.join(", ")
      : Array.isArray(answers.c_goal)
      ? answers.c_goal.join(", ")
      : "",

    koltsegkeret: answers.r_budget || answers.c_budget || "",
    idotav: answers.r_horizon || answers.c_horizon || "",
    megjegyzes: answers.r_notes || answers.c_notes || "",

    jelenlegi_besorolas: current,
    felujitas_utani_besorolas: improved,

    ajanlott_elso_lepes: recs[0]?.name || "",
    ajanlott_lepesek: recs.map((r) => r.name).join(", "),

    vizgazdalkodas:
      flow === "residential" &&
      answers.r_roof_type &&
      !answers.r_roof_type.includes("Nincs saját tető")
        ? "Van vízgazdálkodási becslés"
        : "Nem releváns",

    kert_mikroklima_ajanlas:
      flow === "residential" && answers.r_land && answers.r_land !== "Nincs (lakás)"
        ? "Kert / zöldfelület fejlesztés vizsgálható"
        : "Nem releváns",

    ajanlott_partner_kategoria: recs[0]?.name || "",

    lead_statusz: "Új lead",
    partner_statusz: "Nincs partnerhez rendelve",
    jutalek_statusz: "Nem releváns",
    utolso_frissites: new Date().toLocaleString("hu-HU"),
    belso_megjegyzes: "Appból érkezett automatikus lead"
  })
}).catch(() => {});
  };

  const handleDownload=()=>{
    setDownloading(true);
    setTimeout(()=>{generatePDF(answers,flow,current,improved,recs,contact);setDownloading(false);},300);
  };

  const inp={padding:"12px 14px",border:`1.5px solid ${C.grayMid}`,borderRadius:8,fontSize:14,outline:"none",color:C.text,fontFamily:"'Poppins',sans-serif",width:"100%",background:C.white};

  return (
    <div>
      <div style={{background:C.sunLight,border:`1.5px solid ${C.sun}44`,borderRadius:12,padding:"20px 18px",marginBottom:16}}>
        <h2 style={{fontSize:19,fontWeight:700,color:C.text,marginBottom:6}}>Épületed energetikai terve</h2>
        <p style={{fontSize:13,color:C.gray,lineHeight:1.6}}>{recs.length} ajánlott fejlesztés – besorolással és prioritási sorrendben.</p>
      </div>

      <div style={{background:C.white,border:`1.5px solid ${C.grayMid}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
        <div style={{background:C.sunLight,padding:"12px 16px",borderBottom:`1px solid ${C.grayMid}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.sunDark,letterSpacing:1.5,textTransform:"uppercase"}}>Energetikai besorolás</div>
        </div>
        <div style={{padding:"16px"}}>
          <RatingBar label="Jelenlegi besorolás" rating={current}/>
          <div style={{textAlign:"center",fontSize:16,color:C.sun,margin:"4px 0",fontWeight:600}}>↓</div>
          <RatingBar label="Felújítás utáni besorolás" rating={improved}/>
          {steps>0&&<div style={{marginTop:10,background:C.sunLight,border:`1px solid ${C.sun}44`,borderRadius:8,padding:"8px 12px",fontSize:13,color:C.sunDark,fontWeight:600,textAlign:"center"}}>{steps} kategóriás javulás érhető el</div>}
          <p style={{fontSize:10,color:C.muted,marginTop:10,lineHeight:1.5}}>* Tájékoztató jellegű becslés.</p>
        </div>
      </div>

      {recs[0]&&(
        <div style={{background:C.text,borderRadius:12,padding:"20px 18px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.sun,letterSpacing:2,marginBottom:8,textTransform:"uppercase"}}>Ha csak 1 dolgot teszel</div>
          <div style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:6}}>{recs[0].name}</div>
          <div style={{fontSize:13,color:"#bbb",lineHeight:1.6,marginBottom:12}}>Ez a legfontosabb lépés a te épületed esetében.</div>
          {recs[0].roi&&(
            <div style={{display:"flex",gap:8}}>
              <div style={{background:"#ffffff14",borderRadius:8,padding:"10px 12px",flex:1}}>
                <div style={{fontSize:10,color:"#888",marginBottom:2,textTransform:"uppercase"}}>Évi megtakarítás</div>
                <div style={{fontWeight:700,fontSize:14,color:C.sun}}>{formatFt(recs[0].roi.save)}</div>
              </div>
              <div style={{background:"#ffffff14",borderRadius:8,padding:"10px 12px",flex:1}}>
                <div style={{fontSize:10,color:"#888",marginBottom:2,textTransform:"uppercase"}}>Megtérülés</div>
                <div style={{fontWeight:700,fontSize:14,color:C.sun}}>{recs[0].roi.years} év</div>
              </div>
            </div>
          )}
        </div>
      )}

      {recs.some(r=>r.notYet)&&(
        <div style={{background:"#FFF5F5",border:`1.5px solid ${C.red}22`,borderRadius:12,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.red,letterSpacing:1.5,marginBottom:10,textTransform:"uppercase"}}>Most még ne csináld</div>
          {recs.filter(r=>r.notYet).map(r=>(
            <div key={r.name} style={{marginBottom:8}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{r.name}</div>
              <div style={{fontSize:12,color:C.red,marginTop:2}}>{r.notYet}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Összes ajánlott lépés</div>
      {recs.map((rec,i)=>(
        <div key={rec.name} style={{background:C.white,border:`1.5px solid ${C.grayMid}`,borderRadius:10,padding:"14px 16px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:rec.roi?10:0}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:rec.tagColor,marginTop:7,flexShrink:0}}/>
            <div style={{flex:1}}>
              <span style={{fontSize:10,fontWeight:700,color:rec.tagColor,background:rec.tagColor+"18",padding:"2px 8px",borderRadius:4}}>{rec.tag}</span>
              <div style={{fontWeight:600,fontSize:14,color:C.text,marginTop:4,marginBottom:4}}>{rec.name}</div>
              {rec.confidence&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:rec.roi?6:0}}>
                  <div style={{flex:1,height:3,background:C.grayMid,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${rec.confidence}%`,background:rec.confidence>80?C.sun:rec.confidence>60?C.orange:C.red,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:10,color:C.muted,fontWeight:600,flexShrink:0}}>{rec.confidence}% illeszkedés</span>
                </div>
              )}
              {!rec.roi&&<div style={{fontSize:12,color:C.muted}}>{rec.cost} · {rec.payback}</div>}
            </div>
          </div>
          {rec.roi&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <div style={{background:C.grayLight,borderRadius:6,padding:"7px 10px",flex:1,minWidth:80}}>
                <div style={{fontSize:9,color:C.muted,marginBottom:2,textTransform:"uppercase"}}>Beruházás</div>
                <div style={{fontWeight:600,fontSize:12,color:C.text}}>{formatFt(rec.roi.cost)}</div>
              </div>
              <div style={{background:C.sunLight,borderRadius:6,padding:"7px 10px",flex:1,minWidth:80}}>
                <div style={{fontSize:9,color:C.sunDark,marginBottom:2,textTransform:"uppercase"}}>Évi megtakarítás</div>
                <div style={{fontWeight:600,fontSize:12,color:C.sunDark}}>{formatFt(rec.roi.save)}</div>
              </div>
              <div style={{background:"#E3F2FD",borderRadius:6,padding:"7px 10px",flex:1,minWidth:80}}>
                <div style={{fontSize:9,color:C.blue,marginBottom:2,textTransform:"uppercase"}}>Megtérülés</div>
                <div style={{fontWeight:600,fontSize:12,color:C.blue}}>{rec.roi.years} év</div>
              </div>
              {rec.roi.save*10>rec.roi.cost&&(
                <div style={{background:"#E8F5E9",borderRadius:6,padding:"7px 10px",flex:"0 0 100%"}}>
                  <div style={{fontSize:9,color:C.sunDark,marginBottom:2,textTransform:"uppercase"}}>10 év alatt nettó nyereség</div>
                  <div style={{fontWeight:700,fontSize:13,color:C.sunDark}}>+{formatFt(rec.roi.save*10-rec.roi.cost)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{background:C.white,border:`1.5px solid ${C.grayMid}`,borderRadius:12,overflow:"hidden",marginBottom:14}}>
        <div style={{background:C.sunLight,padding:"12px 16px",borderBottom:`1px solid ${C.grayMid}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.sunDark,letterSpacing:1.5,textTransform:"uppercase"}}>Ajánlott szakemberek a régiódban</div>
        </div>
        <div style={{padding:"14px 16px"}}>
          <p style={{fontSize:13,color:C.gray,lineHeight:1.6,marginBottom:12}}>A felmérés alapján az alábbi kategóriákban tudunk minősített partnert ajánlani:</p>
          {recs.slice(0,3).map(rec=>(
            <div key={rec.name} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.grayLight,borderRadius:8,marginBottom:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:rec.tagColor,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{rec.name}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>Minősített reSource partner</div>
              </div>
              <div style={{fontSize:10,fontWeight:700,color:C.sun,background:C.sunLight,padding:"3px 8px",borderRadius:4}}>Elérhető</div>
            </div>
          ))}
          <p style={{fontSize:11,color:C.muted,marginTop:8}}>Az adatok megadása után személyre szabott partnerlistát küldünk.</p>
        </div>
      </div>

      {/* VÍZGAZDÁLKODÁS */}
      {flow === "residential" && (
  <>
    <WaterCard answers={{...answers, r_city: answers.r_zip || contact.city}} />

    {answers.r_roof_type && !answers.r_roof_type.includes("Nincs saját tető") && (
      <div style={{
        background:C.white,
        border:`1.5px solid ${C.grayMid}`,
        borderRadius:12,
        overflow:"hidden",
        marginBottom:14
      }}>
        <div style={{
          background:"linear-gradient(135deg,#EBF5FB,#E8F8F5)",
          padding:"12px 16px",
          borderBottom:`1px solid ${C.grayMid}`
        }}>
          <div style={{
            fontSize:11,
            fontWeight:700,
            color:"#1A5276",
            letterSpacing:1.5,
            textTransform:"uppercase"
          }}>
            Vízgazdálkodási partner
          </div>
        </div>

        <div style={{padding:"14px 16px"}}>
          <div style={{
            fontSize:14,
            fontWeight:700,
            color:C.text,
            marginBottom:6
          }}>
            Esővízgyűjtéshez és öntözéshez is ajánlható szakember
          </div>

          <p style={{
            fontSize:13,
            color:C.gray,
            lineHeight:1.6,
            marginBottom:12
          }}>
            A tető és a megadott település alapján nálad érdemes lehet vízgyűjtési, öntözési vagy víztakarékos kertmegoldást is vizsgálni. Ehhez külön, erre szakosodott partnert is tudunk ajánlani.
          </p>

          <div style={{
            display:"flex",
            gap:8,
            flexWrap:"wrap"
          }}>
            {["Esővízgyűjtés","Öntözés","Víztakarékos kert"].map(tag=>(
              <span key={tag} style={{
                fontSize:11,
                background:"#E8F8F5",
                color:"#1A7A5E",
                borderRadius:999,
                padding:"5px 10px",
                fontWeight:700
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
)}

      <div style={{background:C.grayLight,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:5}}>Az arany szabály</div>
        <p style={{fontSize:12,color:C.gray,lineHeight:1.7,margin:0}}>Először csökkentsd a veszteségeket (szigetelés, ablakok), aztán termeld az energiát (napelem), végül tárold (akkumulátor).</p>
      </div>

      {!detailedMode&&(
        <div style={{background:C.sunLight,border:`1.5px solid ${C.sun}44`,borderRadius:12,padding:"16px",marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Pontosabb eredményt szeretnél?</div>
         <p style={{fontSize:12,color:C.muted,lineHeight:1.6,marginBottom:12}}>
  A részletes felmérés további 5–6 perc, és pontosabb ajánlásokat ad.
</p>
          <button onClick={()=>{setDetailedMode(true);setStep(14);setScreen("quiz");}}
            style={{width:"100%",padding:"12px",background:C.sun,border:"none",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:14,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>
            Részletesebb felmérés indítása
          </button>
        </div>
      )}

      <div style={{background:C.white,border:`1.5px solid ${C.grayMid}`,borderRadius:12,overflow:"hidden",marginBottom:12}}>
        <div style={{padding:"14px 16px",background:C.sunLight,borderBottom:`1px solid ${C.grayMid}`}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>PDF összefoglaló letöltése</div>
          <div style={{fontSize:12,color:C.muted}}>Add meg adataidat – emailben is elküldjük, és partnert is ajánlunk.</div>
        </div>
        <div style={{padding:"16px"}}>
          {!contactDone?(
           <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
  <input
    placeholder="Neved *"
    value={contact.name}
    onChange={e=>setContact(p=>({...p,name:e.target.value}))}
    style={{
      ...inp,
      borderColor:contactError&&!contact.name.trim()?C.red:C.grayMid
    }}
  />

  <input
    placeholder="Irányítószám és város *"
    value={contact.city}
    onChange={e=>setContact(p=>({...p,city:e.target.value}))}
    style={{
      ...inp,
      borderColor:contactError&&!contact.city?.trim()?C.red:C.grayMid
    }}
  />

  <input
    placeholder="Utca, házszám"
    value={contact.street}
    onChange={e=>setContact(p=>({...p,street:e.target.value}))}
    style={inp}
  />

  <input
    type="email"
    inputMode="email"
    placeholder="Email cím"
    value={contact.email}
    onChange={e=>setContact(p=>({...p,email:e.target.value}))}
    style={{
      ...inp,
      borderColor:contactError&&contact.email&&!contact.email.includes("@")?C.red:C.grayMid
    }}
  />

  <input
    type="tel"
    inputMode="tel"
    placeholder="+36 30 123 4567"
    value={contact.phone}
    onChange={e=>setContact(p=>({...p,phone:e.target.value}))}
    onFocus={()=>{
      if(!contact.phone.trim()){
        setContact(p=>({...p,phone:"+36 "}));
      }
    }}
    style={{
      ...inp,
      borderColor:contactError&&contact.phone&&contact.phone.replace(/\D/g,"").length<8?C.red:C.grayMid
    }}
  />
</div>
          ):(
            <>
              <div style={{background:C.sunLight,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:13,color:C.sunDark,fontWeight:600}}>
                Köszönöm, {contact.name}! Hamarosan felvesszük veled a kapcsolatot.
              </div>
              <button onClick={handleDownload} disabled={downloading}
                style={{width:"100%",padding:"13px",background:downloading?C.grayMid:C.sun,border:"none",borderRadius:8,cursor:downloading?"default":"pointer",fontWeight:700,fontSize:14,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>
                {downloading?"Megnyitás...":"PDF letöltése / nyomtatása"}
              </button>
            </>
          )}
        </div>
      </div>

      <button onClick={onRestart}
        style={{width:"100%",padding:"12px",background:"transparent",border:`1.5px solid ${C.grayMid}`,borderRadius:8,cursor:"pointer",fontSize:13,color:C.muted,fontWeight:500,fontFamily:"'Poppins',sans-serif"}}>
        Újrakezdés más épülettel
      </button>
    </div>
  );
}

export default function ResourceApp() {
  const [screen,setScreen]=useState("intro");
  const [flow,setFlow]=useState(null);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [selected,setSelected]=useState([]);
  const [freetext,setFreetext]=useState("");
  const [detailedMode,setDetailedMode]=useState(false);

  useEffect(()=>{
    const s=document.createElement("style");
    s.textContent=`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button:focus{outline:none;}`;
    document.head.appendChild(s);
    return ()=>document.head.removeChild(s);
  },[]);

  const questions=flow?QUESTIONS[flow]:[];
  const blocks=flow?BLOCKS[flow]:[];
  const visibleQuestions=questions.filter(q=>{
    if(q.condition&&!q.condition(answers)) return false;
    if(flow==="commercial") return true;
    if(!detailedMode&&q.basic!==true) return false;
    return true;
  });

  useEffect(()=>{
    if(screen==="quiz"&&visibleQuestions[step]){
      const q=visibleQuestions[step];
      const cur=answers[q.id];
      if(q.freetext){setFreetext(cur||"");setSelected([]);}
      else if(q.multi){setSelected(Array.isArray(cur)?cur:[]);}
      else{setSelected(cur?[cur]:[]);}
    }
  },[step,screen,flow]);

  const q=visibleQuestions[step];
  const isMulti=q?.multi;
  const isFreetext=q?.freetext;
  const currentBlock=blocks.find(b=>b.id===q?.block);
  const pct=visibleQuestions.length?Math.round((step/visibleQuestions.length)*100):0;

  const advance=()=>{
    const nextStep=step+1;
    if(nextStep>=visibleQuestions.length) setScreen("results");
    else setStep(nextStep);
  };

  const toggleOpt=(opt)=>{
    if(!isMulti){setAnswers(prev=>({...prev,[q.id]:opt}));setTimeout(()=>advance(),160);return;}
    const excl=["Semmi nincs felújítva","Nincs szomszéd","Nem releváns"];
    setSelected(prev=>{
      if(excl.some(e=>opt.includes(e))) return [opt];
      const base=prev.filter(x=>!excl.some(e=>x.includes(e)));
      return base.includes(opt)?base.filter(x=>x!==opt):[...base,opt];
    });
  };

  const confirmMulti=()=>{if(selected.length===0)return;setAnswers(prev=>({...prev,[q.id]:selected}));advance();};
  const confirmFreetext=()=>{setAnswers(prev=>({...prev,[q.id]:freetext}));advance();};
  const handleBack=()=>{if(step===0)setScreen("flowSelect");else setStep(s=>s-1);};
  const handleRestart=()=>{setAnswers({});setStep(0);setSelected([]);setFlow(null);setDetailedMode(false);setScreen("intro");};

  const font="'Poppins','Helvetica Neue',Arial,sans-serif";

  return (
    <div style={{minHeight:"100vh",background:C.grayLight,fontFamily:font,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"24px 16px 60px"}}>
      <div style={{width:"100%",maxWidth:480}}>


        <div style={{background:C.white,borderRadius:16,padding:"26px 22px",boxShadow:"0 2px 20px rgba(0,0,0,0.06)"}}>

          {screen==="intro"&&(
  <div style={{textAlign:"center"}}>

    <div style={{
      display:"flex",
      justifyContent:"center",
      marginBottom:22
    }}>
      <img
        src="/logo.png"
        alt="reSource app"
        style={{
          width:"300px",
          maxWidth:"85%",
          height:"auto",
          objectFit:"contain"
        }}
      />
    </div>

  <h1 style={{
  fontSize:26,
  fontWeight:800,
  color:C.text,
  marginBottom:12,
  lineHeight:1.18,
  textAlign:"center"
}}>
  Tedd otthonod korszerűbbé és értékesebbé
</h1>

<p style={{
  fontSize:15,
  color:C.gray,
  lineHeight:1.65,
  marginBottom:18,
  textAlign:"center"
}}>
  Néhány egyszerű kérdés alapján megmutatjuk, milyen energia-, víz- és zöldfelületi fejlesztésekkel érdemes kezdened. A cél egy tudatosabban működő, komfortosabb otthon, amely hosszú távon értékesebb is lehet.
</p>

<div style={{
  background:C.sunLight,
  border:`1px solid ${C.sun}33`,
  color:C.sunDark,
  borderRadius:10,
  padding:"10px 12px",
  fontSize:13,
  fontWeight:700,
  marginBottom:18,
  textAlign:"center"
}}>
  Ingyenes felmérés, személyre szabott összefoglalóval és partnerajánlással.
</div>
    
    <div style={{
      display:"flex",
      gap:8,
      marginBottom:26,
      flexWrap:"wrap",
      justifyContent:"center"
    }}>
     {[
  "Ingyenes",
  "2–3 perc alatt elindítható",
  "Személyre szabott javaslat",
  "Partnerajánlás",
  "Letölthető összefoglaló"
].map(tag=>(
        <span
          key={tag}
          style={{
            fontSize:11,
            background:C.grayLight,
            color:C.gray,
            borderRadius:6,
            padding:"5px 10px",
            fontWeight:500
          }}
        >
          {tag}
        </span>
      ))}
    </div>

    <button
      onClick={()=>setScreen("flowSelect")}
      style={{
        width:"100%",
        padding:"14px",
        background:C.sun,
        border:"none",
        borderRadius:10,
        cursor:"pointer",
        fontSize:15,
        fontWeight:700,
        color:"#fff",
        fontFamily:font
      }}
    >
      Ingyenes Felmérés indítása
    </button>
  </div>
)}

         {screen==="flowSelect"&&(
  <div>
    <h2 style={{
      fontSize:20,
      fontWeight:700,
      color:C.text,
      marginBottom:8,
      lineHeight:1.3
    }}>
      Milyen épületről van szó?
    </h2>

    <p style={{
      fontSize:13,
      color:C.muted,
      marginBottom:20,
      lineHeight:1.6
    }}>
      Válaszd ki, hogy lakóépületet vagy vállalkozási ingatlant szeretnél felmérni.
    </p>

    {[
      {
        id:"residential",
        label:"Lakóépület",
        desc:"Családi ház, lakás, tanya vagy nyaraló",
        badge:"Otthon"
      },
      {
        id:"commercial",
        label:"Vállalkozás / Üzlet",
        desc:"Iroda, üzlet, üzem, raktár vagy vendéglátóhely",
        badge:"Cég"
      },
    ].map(f=>(
      <button
        key={f.id}
        onClick={()=>{setFlow(f.id);setStep(0);setAnswers({});setScreen("quiz");}}
        style={{
          width:"100%",
          padding:"17px 16px",
          background:C.white,
          border:`1.5px solid ${C.grayMid}`,
          borderRadius:12,
          cursor:"pointer",
          textAlign:"left",
          marginBottom:10,
          display:"flex",
          alignItems:"center",
          gap:14,
          fontFamily:font,
          transition:"all 0.15s"
        }}
        onMouseEnter={e=>{
          e.currentTarget.style.borderColor=C.sun;
          e.currentTarget.style.background=C.sunLight;
        }}
        onMouseLeave={e=>{
          e.currentTarget.style.borderColor=C.grayMid;
          e.currentTarget.style.background=C.white;
        }}
      >
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <div style={{fontWeight:700,fontSize:15,color:C.text}}>
              {f.label}
            </div>
            <span style={{
              fontSize:10,
              color:C.sunDark,
              background:C.sunLight,
              border:`1px solid ${C.sun}33`,
              borderRadius:999,
              padding:"2px 8px",
              fontWeight:600
            }}>
              {f.badge}
            </span>
          </div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>
            {f.desc}
          </div>
        </div>

        <div style={{
          marginLeft:"auto",
          color:C.sun,
          fontSize:20,
          fontWeight:600
        }}>
          ›
        </div>
      </button>
    ))}

    <button
      onClick={()=>setScreen("intro")}
      style={{
        background:"none",
        border:"none",
        color:C.muted,
        fontSize:13,
        cursor:"pointer",
        padding:"8px 0",
        fontFamily:font
      }}
    >
      ← Vissza
    </button>
  </div>
)}

          {screen==="quiz"&&q&&(
            <div>
              <BlockProgress blocks={blocks} answers={answers} questions={visibleQuestions}/>
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:11,color:C.muted}}>{step+1} / {visibleQuestions.length}</span>
                  <span style={{fontSize:11,color:C.sunDark,fontWeight:700}}>{pct}%</span>
                </div>
                <div style={{height:3,background:C.grayMid,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:C.sun,borderRadius:2,transition:"width 0.3s"}}/>
                </div>
              </div>
              {currentBlock&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:currentBlock.color}}/>
                  <span style={{fontSize:11,fontWeight:700,color:currentBlock.color,letterSpacing:1,textTransform:"uppercase"}}>{currentBlock.label}</span>
                  {isMulti&&<span style={{fontSize:11,color:C.muted,fontWeight:500}}>· több is választható</span>}
                </div>
              )}
              <h2 style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:18,lineHeight:1.4}}>{q.q}</h2>
              {isFreetext?(
               <>
  {q.id === "r_zip" ? (
    <>
      <input
        value={freetext}
        onChange={e=>setFreetext(e.target.value)}
        placeholder="Pl. 1117 Budapest vagy 7621 Pécs"
        style={{
          width:"100%",
          padding:"14px 16px",
          border:`1.5px solid ${C.grayMid}`,
          borderRadius:10,
          fontSize:15,
          color:C.text,
          outline:"none",
          fontFamily:font,
          background:C.white
        }}
      />

      <div style={{
        fontSize:11,
        color:C.muted,
        lineHeight:1.5,
        marginTop:8,
        marginBottom:12
      }}>
        Ezt a vízgazdálkodási becslés és regionális partnerajánlások pontosításához használjuk.
      </div>

      <button
        onClick={confirmFreetext}
        disabled={!freetext.trim()}
        style={{
          marginTop:4,
          width:"100%",
          padding:"13px",
          background:freetext.trim()?C.sun:C.grayMid,
          border:"none",
          borderRadius:8,
          cursor:freetext.trim()?"pointer":"default",
          fontWeight:700,
          fontSize:14,
          color:freetext.trim()?"#fff":C.muted,
          fontFamily:font
        }}
      >
        Tovább
      </button>
    </>
  ) : (
    <>
      <textarea
        value={freetext}
        onChange={e=>setFreetext(e.target.value)}
        placeholder="Ide írhatod a megjegyzésedet…"
        rows={4}
        style={{
          width:"100%",
          padding:"12px 14px",
          border:`1.5px solid ${C.grayMid}`,
          borderRadius:8,
          fontSize:14,
          color:C.text,
          resize:"vertical",
          outline:"none",
          fontFamily:font
        }}
      />

      <button
        onClick={confirmFreetext}
        style={{
          marginTop:12,
          width:"100%",
          padding:"13px",
          background:C.sun,
          border:"none",
          borderRadius:8,
          cursor:"pointer",
          fontWeight:700,
          fontSize:14,
          color:"#fff",
          fontFamily:font
        }}
      >
        {freetext ? "Mentés és tovább" : "Kihagyom"}
      </button>
    </>
  )}
</>
              ):(
                <>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {q.opts.map(opt=><QuizOption key={opt} label={opt} selected={selected.includes(opt)} onClick={()=>toggleOpt(opt)} multi={isMulti}/>)}
                  </div>
                  {isMulti&&(
                    <button onClick={confirmMulti} disabled={selected.length===0}
                      style={{marginTop:14,width:"100%",padding:"13px",background:selected.length>0?C.sun:C.grayMid,border:"none",borderRadius:8,cursor:selected.length>0?"pointer":"default",fontWeight:700,fontSize:14,color:selected.length>0?"#fff":C.muted,fontFamily:font}}>
                      Tovább
                    </button>
                  )}
                </>
              )}
              <button onClick={handleBack} style={{marginTop:14,background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",padding:0,fontFamily:font}}>← Vissza</button>
            </div>
          )}

          {screen==="results"&&(
            <ResultsView answers={answers} flow={flow} onRestart={handleRestart} detailedMode={detailedMode} setDetailedMode={setDetailedMode} setStep={setStep} setScreen={setScreen}/>
          )}
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:C.muted}}>reSource app · 2025</div>
      </div>
    </div>
  );
}
