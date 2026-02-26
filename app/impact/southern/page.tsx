"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   REGION DATA
───────────────────────────────────────────── */
const ACCENT = "#b8860b";

const heroImages = [
  "/Images/Eastern1.png",
  "/Images/Eastern2.png",
  "/Images/Eastern3.png",
];

const stats = [
  { value: 11,   suffix: "",  label: "Districts",      desc: "Under Southern Coverage" },
  { value: 1400, suffix: "+", label: "Members",        desc: "Registered Youth" },
  { value: 3200, suffix: "+", label: "Trees Planted",  desc: "Reforestation Total" },
  { value: 22,   suffix: "",  label: "Youth Clubs",    desc: "Active This Season" },
  { value: 55,   suffix: "+", label: "Activities",     desc: "Completed to Date" },
  { value: 8,    suffix: "",  label: "Key Partners",   desc: "NGOs & Government" },
];

const districts = [
  { name: "Blantyre",   coordinator: "Yamikani Chirwa",  activities: 12, trees: 700, members: 280 },
  { name: "Chikwawa",   coordinator: "Dalitso Mwale",    activities: 8,  trees: 520, members: 180 },
  { name: "Nsanje",     coordinator: "Esther Phangwa",   activities: 6,  trees: 380, members: 140 },
  { name: "Thyolo",     coordinator: "Kondwani Zimba",   activities: 6,  trees: 350, members: 135 },
  { name: "Mulanje",    coordinator: "Chisomo Kachali",  activities: 5,  trees: 310, members: 120 },
  { name: "Mwanza",     coordinator: "Tapiwa Mtande",    activities: 4,  trees: 250, members: 98  },
  { name: "Neno",       coordinator: "Fatima Banda",     activities: 4,  trees: 220, members: 90  },
  { name: "Chiradzulu", coordinator: "Andrew Navicho",   activities: 4,  trees: 200, members: 88  },
  { name: "Balaka",     coordinator: "Rejoice Mhone",    activities: 3,  trees: 170, members: 72  },
  { name: "Phalombe",   coordinator: "George Msiska",    activities: 2,  trees: 130, members: 60  },
  { name: "Machinga",   coordinator: "Linda Gondwe",     activities: 2,  trees: 100, members: 48  },
];

const partners = [
  { name: "Shire Valley Transformation Programme", type: "Government / World Bank", image: "/Images/mangochi.jpg",  desc: "Co-implementing riverbank stabilisation and reforestation along the Lower Shire to reduce erosion and flood risk in Chikwawa and Nsanje." },
  { name: "Mulanje Mountain Conservation Trust",   type: "NGO",                    image: "/Images/mangochi1.jpg", desc: "Joint patrols and youth education campaigns to protect the UNESCO-listed Mulanje Massif from encroachment and illegal logging." },
  { name: "Blantyre City Council",                 type: "Government",             image: "/Images/zomba1.jpg",    desc: "Urban greening partnership — planting trees along major roads and in schools across Blantyre city." },
  { name: "WWF Malawi",                            type: "International NGO",      image: "/Images/USAID.jpg",     desc: "Providing capacity-building, training materials, and co-funding for biodiversity monitoring in the Southern highlands." },
  { name: "Chancellor College (UNIMA)",            type: "Academic",               image: "/Images/Unima.jpg",     desc: "Research collaboration on vegetation cover change using satellite imagery and ground-truthing by YASCON youth teams." },
  { name: "Tea Association of Malawi",             type: "Private Sector",         image: "/Images/machinga.jpg",  desc: "Shade tree planting and soil conservation partnership across tea estates in Thyolo and Mulanje." },
  { name: "Plan International Malawi",             type: "NGO",                    image: "/Images/balaka.jpg",    desc: "Gender-inclusive conservation programming, ensuring at least 50% of Southern Region club leadership roles are held by young women." },
  { name: "GIZ Malawi",                            type: "Development Partner",    image: "/Images/ZOMBA.jpg",     desc: "Technical support for climate-smart agriculture integration within conservation programmes across Chikwawa and Nsanje." },
];

const team = [
  { name: "Yamikani Chirwa",   initials: "YC", role: "Regional Coordinator",   district: "Blantyre",                   bio: "Yamikani leads Malawi's largest YASCON region, overseeing 22 clubs and 8 major partnerships. She joined YASCON as a student volunteer in 2012." },
  { name: "Dalitso Mwale",     initials: "DM", role: "District Coordinator",   district: "Chikwawa",                   bio: "Dalitso spearheads Lower Shire riverbank restoration and coordinates closely with the Shire Valley Transformation Programme." },
  { name: "Esther Phangwa",    initials: "EP", role: "District Coordinator",   district: "Nsanje",                     bio: "Esther leads flood-resilience conservation activities in Malawi's southernmost district, working directly with at-risk communities." },
  { name: "Chisomo Kachali",   initials: "CK", role: "District Coordinator",   district: "Mulanje",                    bio: "Chisomo coordinates youth conservation patrols on the Mulanje Massif and manages the region's largest tree nursery." },
  { name: "Kondwani Zimba",    initials: "KZ", role: "District Coordinator",   district: "Thyolo",                     bio: "Kondwani works with tea estate communities to integrate shade trees and soil conservation into traditional agricultural practices." },
  { name: "Alinafe Moyo",      initials: "AM", role: "M&E Officer",            district: "Blantyre (Regional Office)", bio: "Alinafe manages data collection, activity reporting, and statistical analysis for all 11 Southern Region districts." },
  { name: "Blessings Katunga", initials: "BK", role: "Communications Officer", district: "Blantyre (Regional Office)", bio: "Blessings documents field activities, writes blog stories, and manages YASCON Southern Region's social media presence." },
];

const activities = [
  { title: "Lower Shire Riverbank Reforestation",          date: "April 2025",    district: "Chikwawa",      type: "Tree Planting", participants: 180, desc: "Youth clubs planted 520 indigenous trees along critically eroded Shire riverbanks in partnership with the Shire Valley Transformation Programme to reduce sedimentation and flooding." },
  { title: "Mulanje Massif Youth Conservation Patrol",     date: "March 2025",    district: "Mulanje",       type: "Survey",        participants: 45,  desc: "A 3-day field patrol across the Mulanje Massif to document illegal logging, encroachment, and rare plant species. Data submitted to the Mulanje Mountain Conservation Trust and Forestry Department." },
  { title: "Blantyre Urban Tree Planting",                 date: "March 2025",    district: "Blantyre",      type: "Tree Planting", participants: 150, desc: "Youth clubs collaborated with Blantyre City Council to plant 700 shade trees along major roads, in parks, and on school grounds across the city." },
  { title: "Nsanje Flood Awareness and Mangrove Drive",    date: "February 2025", district: "Nsanje",        type: "Awareness",     participants: 220, desc: "Community awareness campaign on flood-risk reduction combined with riverbank vegetation restoration in flood-prone Nsanje villages." },
  { title: "Thyolo Shade Tree Workshop with Tea Estates",  date: "January 2025",  district: "Thyolo",        type: "Workshop",      participants: 80,  desc: "A joint training session with Tea Association of Malawi members and youth clubs on integrating shade trees within tea estates for biodiversity and soil health benefits." },
  { title: "Chancellor College Vegetation Survey",         date: "December 2024", district: "Mulanje",       type: "Survey",        participants: 25,  desc: "Ground-truthing exercise for a UNIMA satellite vegetation change study, comparing deforestation trends across the Southern highlands over 10 years." },
  { title: "Mwanza Riverbank Clean-Up",                    date: "November 2024", district: "Mwanza",        type: "Clean-Up",      participants: 95,  desc: "A major clean-up along the Mwanza River targeting plastic waste and invasive water plants blocking river flow and degrading water quality." },
  { title: "Southern Region Youth Conservation Summit",    date: "October 2024",  district: "Blantyre",      type: "Workshop",      participants: 300, desc: "Annual gathering of all 22 Southern Region club coordinators to share field experiences, review regional statistics, and plan activities for the coming conservation season." },
];

const blogs = [
  { title: "The Lower Shire: Malawi's Most Threatened River",   date: "April 2025",    author: "Dalitso Mwale",     category: "Waterways",         readTime: "6 min read", excerpt: "The Lower Shire River has lost over 60% of its original riparian vegetation. YASCON's Chikwawa clubs are planting trees at scale — and the results are already visible after just one season." },
  { title: "Walking Mulanje: What Our Youth Patrols Found",     date: "March 2025",    author: "Chisomo Kachali",   category: "Conservation",      readTime: "7 min read", excerpt: "Three days in the Mulanje Massif revealed both beauty and crisis. YASCON's youth patrol documented 12 illegal logging sites — and 4 previously unrecorded plant species." },
  { title: "Greening Blantyre: Trees in the Heart of the City", date: "March 2025",    author: "Blessings Katunga", category: "Urban Ecology",     readTime: "4 min read", excerpt: "As Blantyre expands, its tree cover shrinks. YASCON is working with the city council to reverse that trend — one school and one road at a time." },
  { title: "Women Leading Conservation in Southern Malawi",     date: "February 2025", author: "Alinafe Moyo",      category: "Gender & Inclusion", readTime: "5 min read", excerpt: "Over 50% of YASCON Southern Region's club leadership positions are now held by young women. We explore what that means for conservation outcomes on the ground." },
  { title: "A Decade of Deforestation: What the Data Shows",    date: "January 2025",  author: "Yamikani Chirwa",   category: "Research",          readTime: "8 min read", excerpt: "Using satellite imagery and YASCON's own field data, Regional Coordinator Yamikani Chirwa presents a sobering look at vegetation loss across the Southern Region — and what can still be saved." },
];

/* ─────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────── */
const TYPE_COLORS: Record<string, string> = {
  "Tree Planting": "#2d7a2d",
  "Clean-Up":      "#1a6b8a",
  "Workshop":      "#7a5c2d",
  "Awareness":     "#8a1a6b",
  "Survey":        "#2d5a7a",
};

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm"
      style={{ background: color + "22", color, border: `1px solid ${color}55` }}
    >
      {text}
    </span>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10">
      <span className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: ACCENT }}>{label}</span>
      <h2 className="text-3xl md:text-4xl font-bold text-[#0f1a0f] mt-2 leading-tight">{title}</h2>
      <div className="w-12 h-[3px] mt-4 rounded-full" style={{ background: ACCENT }} />
    </div>
  );
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / 2000, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   TAB PANELS
───────────────────────────────────────────── */
function PartnersPanel() {
  return (
    <div>
      <SectionHeader label="Collaboration" title="Our Regional Partners" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((p, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Partner image */}
            <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<div style="width:64px;height:64px;border-radius:50%;background:${ACCENT}22;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:${ACCENT}">${p.name.charAt(0)}</div>`;
                }}
              />
            </div>
            <div className="p-6">
              <Badge text={p.type} color={ACCENT} />
              <h3 className="font-bold text-[#0f1a0f] text-lg mt-3 mb-2">{p.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamPanel() {
  return (
    <div>
      <SectionHeader label="People" title="Meet Our Regional Team" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((m, i) => (
          <div
            key={i}
            className="group relative overflow-hidden p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background: "#fdf8ee",
              border: "1.5px solid #e8d9a0",
              borderRadius: "20px",
            }}
          >
            <h3 className="font-black text-gray-900 text-xl leading-tight mb-1">{m.name}</h3>
            <div className="text-sm font-bold mb-2" style={{ color: ACCENT }}>{m.role}</div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "#f0e8c8", color: "#5a4a00" }}
            >
              <span>📍</span>
              {m.district}
            </div>
            <div className="w-full h-px mb-4" style={{ background: "#e8d9a0" }} />
            <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistrictsPanel() {
  const top4 = [...districts].sort((a, b) => b.activities - a.activities).slice(0, 4);
  const totalActivities = districts.reduce((s, d) => s + d.activities, 0);
  const totalTrees = districts.reduce((s, d) => s + d.trees, 0);
  const totalMembers = districts.reduce((s, d) => s + d.members, 0);

  const districtImages: Record<string, string> = {
    Blantyre:  "/Images/zomba1.jpg",
    Chikwawa:  "/Images/mangochi1.jpg",
    Nsanje:    "/Images/Eastern1.png",
    Thyolo:    "/Images/machinga.jpg",
    Mulanje:   "/Images/mangochi.jpg",
    Mwanza:    "/Images/balaka.jpg",
    Neno:      "/Images/Eastern2.png",
    Chiradzulu:"/Images/Eastern3.png",
    Balaka:    "/Images/image0.png",
    Phalombe:  "/Images/image5.png",
    Machinga:  "/Images/ZOMBA.jpg",
  };

  return (
    <div>
      <SectionHeader label="Coverage" title="Districts Overview" />

      {/* Region-wide summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-10 p-6 rounded-2xl" style={{ background: ACCENT }}>
        {[
          { label: "Total Activities", value: totalActivities },
          { label: "Total Trees Planted", value: totalTrees.toLocaleString() + "+" },
          { label: "Total Members", value: totalMembers },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-black text-white">{value}</div>
            <div className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: "#fdf0b0" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top 4 dashboard cards */}
      <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: ACCENT }}>
        Top 4 Most Active Districts
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {top4.map((d, i) => {
          const activityPct = Math.round((d.activities / totalActivities) * 100);
          const treesPct = Math.round((d.trees / totalTrees) * 100);
          return (
            <div
              key={d.name}
              className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: "#fdf8ee", border: "1.5px solid #e8d9a0" }}
            >
              {/* District image header */}
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={districtImages[d.name] ?? "/Images/Eastern1.png"}
                  alt={d.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    if (el.parentElement) el.parentElement.style.background = ACCENT;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Rank badge */}
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: ACCENT }}>{i + 1}</div>
                <div className="absolute bottom-2 left-3">
                  <h3 className="font-black text-white text-lg leading-tight drop-shadow">{d.name}</h3>
                  <div className="text-xs text-white/75 drop-shadow">{d.coordinator}</div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <div className="flex flex-col gap-2 mb-4">
                  {([
                    ["Activities", d.activities],
                    ["Trees", d.trees.toLocaleString()],
                    ["Members", d.members],
                  ] as [string, string | number][]).map(([lbl, val]) => (
                    <div key={lbl} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">{lbl}</span>
                      <span className="text-sm font-black text-gray-900">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-800">Activity share</span>
                    <span className="font-semibold text-gray-900">{activityPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "#f0e8c8" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${activityPct}%`, background: ACCENT }} />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-800">Trees share</span>
                    <span className="font-semibold text-gray-900">{treesPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: "#f0e8c8" }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${treesPct}%`, background: "#5a4a00" }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All districts full breakdown */}
      <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: ACCENT }}>
        All Districts — Full Breakdown
      </div>
      <div className="bg-white p-8 rounded-3xl" style={{ border: "1.5px solid #f0e8c8" }}>
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Activities count</div>
        <div className="flex items-end justify-between gap-3" style={{ height: "280px" }}>
          {[...districts]
            .sort((a, b) => b.activities - a.activities)
            .map((d, i) => {
              const maxActivities = Math.max(...districts.map((x) => x.activities));
              const barHeightPct = Math.round((d.activities / maxActivities) * 100);
              const barColors = ["#5a3e00","#7a5500","#9a6c00","#b8860b","#c99a1a","#d4aa30","#deba50","#e8ca70","#f0d890","#f5e4aa","#faefc8"];
              return (
                <div key={d.name} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div
                    className="w-full rounded-t-2xl rounded-b-sm transition-all duration-700 group-hover:opacity-80"
                    style={{ height: `${barHeightPct}%`, background: barColors[i], minHeight: "24px" }}
                  />
                  <div className="mt-3 text-center">
                    <div className="text-xs font-black text-gray-800 leading-tight">{d.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 hidden lg:block">{d.coordinator.split(" ")[0]}</div>
                  </div>
                </div>
              );
            })}
        </div>
        <div className="w-full h-px mt-1 mb-6" style={{ background: "#f0e8c8" }} />
        <div className="grid grid-cols-11 gap-3">
          {[...districts]
            .sort((a, b) => b.activities - a.activities)
            .map((d) => (
              <div key={d.name} className="text-center">
                <div className="text-xs font-black text-gray-700">{d.trees}</div>
                <div className="text-xs text-gray-400">trees</div>
                <div className="text-xs font-black text-gray-700 mt-1">{d.members}</div>
                <div className="text-xs text-gray-400">mbrs</div>
              </div>
            ))}
        </div>
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} /> Most active
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: "#faefc8" }} /> Least active
          </div>
          <div className="ml-auto">Bar height = relative activity count</div>
        </div>
      </div>
    </div>
  );
}

function ActivitiesPanel() {
  const [filter, setFilter] = useState("All");
  const types = ["All", ...Array.from(new Set(activities.map((a) => a.type)))];
  const filtered = filter === "All" ? activities : activities.filter((a) => a.type === filter);

  const districtImages: Record<string, string> = {
    Chikwawa:  "/Images/mangochi1.jpg",
    Blantyre:  "/Images/zomba1.jpg",
    Nsanje:    "/Images/Eastern1.png",
    Thyolo:    "/Images/machinga.jpg",
    Mulanje:   "/Images/Eastern3.png",
    Mwanza:    "/Images/balaka.jpg",
    Neno:      "/Images/Eastern2.png",
    Chiradzulu:"/Images/Eastern3.png",
  };

  return (
    <div>
      <SectionHeader label="Field Work" title="Conservation Activities" />
      <div className="flex flex-wrap gap-2 mb-8">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200"
            style={filter === t ? { background: ACCENT, color: "#fff" } : { background: "#f3f4f6", color: "#374151" }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((a, i) => (
          <div
            key={i}
            className="bg-white overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            style={{ borderRadius: "20px", border: "1.5px solid #f0e8c8" }}
          >
            {/* District photo header */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={districtImages[a.district] ?? "/Images/Eastern1.png"}
                alt={a.district}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  if (el.parentElement) el.parentElement.style.background = ACCENT;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <Badge text={a.type} color={TYPE_COLORS[a.type] ?? ACCENT} />
              </div>
              <div className="absolute bottom-3 left-4">
                <div className="text-white text-xs font-semibold opacity-80">{a.district}</div>
              </div>
            </div>
            {/* Card body */}
            <div className="p-5">
              <h3 className="font-black text-gray-900 text-base leading-snug mb-2">{a.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{a.desc}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-semibold">
                <span>{a.date}</span>
                <span>{a.participants} participants</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogsPanel() {
  const blogImages: Record<number, string> = {
    0: "/Images/mangochi1.jpg",
    1: "/Images/mangochi.jpg",
    2: "/Images/image0.png",
    3: "/Images/machinga.jpg",
    4: "/Images/Eastern1.png",
  };

  return (
    <div>
      <SectionHeader label="Stories" title="Regional Blog" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b, i) => (
          <article
            key={i}
            className="bg-white overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            style={{ borderRadius: "20px", border: "1.5px solid #f0e8c8" }}
          >
            {/* Photo header */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={blogImages[i] ?? "/Images/Eastern1.png"}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  if (el.parentElement) el.parentElement.style.background = ACCENT;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Badge text={b.category} color={ACCENT} />
                <span className="text-xs text-white/80 font-semibold">{b.readTime}</span>
              </div>
            </div>
            {/* Card body */}
            <div className="p-6">
              <h3 className="font-bold text-[#0f1a0f] text-lg mb-2 group-hover:underline">{b.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">{b.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
                <span className="font-medium">{b.author}</span>
                <span>·</span>
                <span>{b.date}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function StatsPanel() {
  return (
    <div>
      <SectionHeader label="Data" title="Southern Region — By the Numbers" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 shadow-sm text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            style={{ borderRadius: "20px", border: "1.5px solid #f0e8c8" }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: ACCENT }}>
              <CountUp target={s.value} suffix={s.suffix} />
            </div>
            <div className="font-semibold text-[#0f1a0f] text-sm uppercase tracking-wide mb-1">{s.label}</div>
            <div className="text-xs text-gray-500">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
type Tab = "partners" | "team" | "districts" | "activities" | "blogs" | "stats";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "partners",   label: "Our Partners",        icon: "⊕" },
  { id: "team",       label: "Our Team",            icon: "⊙" },
  { id: "districts",  label: "Districts",           icon: "◎" },
  { id: "activities", label: "Activities",          icon: "◈" },
  { id: "blogs",      label: "Blogs",               icon: "▤" },
  { id: "stats",      label: "Regional Statistics", icon: "▦" },
];

export default function SouthernRegionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("activities");
  const [currentImage, setCurrentImage] = useState(0);

  // Slideshow: cycle every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-0">

      {/* ── HERO with background image slideshow ── */}
      <div className="relative h-[92vh] flex flex-col justify-end overflow-hidden mt-0">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${img})`, opacity: idx === currentImage ? 1 : 0 }}
          />
        ))}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Dot indicators */}
        <div className="absolute top-6 right-6 flex gap-2 z-10">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                background: idx === currentImage ? "#fff" : "rgba(255,255,255,0.35)",
                transform: idx === currentImage ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-8 pb-12 max-w-5xl">
          <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f5d060" }}>
            YASCON Regional Hub
          </div>
          <h1 className="text-6xl font-black text-white leading-none mb-4">Southern Region</h1>
          <p className="text-lg text-white/80 mb-2 max-w-xl font-medium">
            Protecting Malawi's most densely populated region — from the Shire Valley to the highlands.
          </p>
          <p className="text-sm text-white/60 max-w-2xl leading-relaxed mb-8">
            YASCON's Southern Region is the organisation's largest and most active hub, spanning Blantyre, Chikwawa, Nsanje, Thyolo, Mulanje, Mwanza, Neno, and neighbouring districts. Our youth-led clubs tackle deforestation, riverbank erosion, and wetland loss across Malawi's commercial and agricultural heartland.
          </p>
          <div className="flex flex-wrap gap-6">
            {stats.slice(0, 4).map((s, i) => (
              <div key={i} className="text-white">
                <div className="text-3xl font-black">{s.value.toLocaleString()}{s.suffix}</div>
                <div className="text-xs text-white/60 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STICKY TAB BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-hide px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 flex-shrink-0"
              style={activeTab === tab.id ? { borderColor: ACCENT, color: ACCENT } : { borderColor: "transparent", color: "#111" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === "partners"   && <PartnersPanel />}
        {activeTab === "team"       && <TeamPanel />}
        {activeTab === "districts"  && <DistrictsPanel />}
        {activeTab === "activities" && <ActivitiesPanel />}
        {activeTab === "blogs"      && <BlogsPanel />}
        {activeTab === "stats"      && <StatsPanel />}
      </div>

    </div>
  );
}