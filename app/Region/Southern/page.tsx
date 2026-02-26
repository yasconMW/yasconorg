"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   REGION DATA
───────────────────────────────────────────── */
const ACCENT = "#b8860b";

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
  { name: "Shire Valley Transformation Programme", type: "Government / World Bank", desc: "Co-implementing riverbank stabilisation and reforestation along the Lower Shire to reduce erosion and flood risk in Chikwawa and Nsanje." },
  { name: "Mulanje Mountain Conservation Trust",   type: "NGO",                    desc: "Joint patrols and youth education campaigns to protect the UNESCO-listed Mulanje Massif from encroachment and illegal logging." },
  { name: "Blantyre City Council",                 type: "Government",             desc: "Urban greening partnership — planting trees along major roads and in schools across Blantyre city." },
  { name: "WWF Malawi",                            type: "International NGO",      desc: "Providing capacity-building, training materials, and co-funding for biodiversity monitoring in the Southern highlands." },
  { name: "Chancellor College (UNIMA)",            type: "Academic",               desc: "Research collaboration on vegetation cover change using satellite imagery and ground-truthing by YASCON youth teams." },
  { name: "Tea Association of Malawi",             type: "Private Sector",         desc: "Shade tree planting and soil conservation partnership across tea estates in Thyolo and Mulanje." },
  { name: "Plan International Malawi",             type: "NGO",                    desc: "Gender-inclusive conservation programming, ensuring at least 50% of Southern Region club leadership roles are held by young women." },
  { name: "GIZ Malawi",                            type: "Development Partner",    desc: "Technical support for climate-smart agriculture integration within conservation programmes across Chikwawa and Nsanje." },
];

const team = [
  { name: "Yamikani Chirwa",  initials: "YC", role: "Regional Coordinator",   district: "Blantyre",                    bio: "Yamikani leads Malawi's largest YASCON region, overseeing 22 clubs and 8 major partnerships. She joined YASCON as a student volunteer in 2012." },
  { name: "Dalitso Mwale",    initials: "DM", role: "District Coordinator",   district: "Chikwawa",                    bio: "Dalitso spearheads Lower Shire riverbank restoration and coordinates closely with the Shire Valley Transformation Programme." },
  { name: "Esther Phangwa",   initials: "EP", role: "District Coordinator",   district: "Nsanje",                      bio: "Esther leads flood-resilience conservation activities in Malawi's southernmost district, working directly with at-risk communities." },
  { name: "Chisomo Kachali",  initials: "CK", role: "District Coordinator",   district: "Mulanje",                     bio: "Chisomo coordinates youth conservation patrols on the Mulanje Massif and manages the region's largest tree nursery." },
  { name: "Kondwani Zimba",   initials: "KZ", role: "District Coordinator",   district: "Thyolo",                      bio: "Kondwani works with tea estate communities to integrate shade trees and soil conservation into traditional agricultural practices." },
  { name: "Alinafe Moyo",     initials: "AM", role: "M&E Officer",            district: "Blantyre (Regional Office)",  bio: "Alinafe manages data collection, activity reporting, and statistical analysis for all 11 Southern Region districts." },
  { name: "Blessings Katunga",initials: "BK", role: "Communications Officer", district: "Blantyre (Regional Office)",  bio: "Blessings documents field activities, writes blog stories, and manages YASCON Southern Region's social media presence." },
];

const activities = [
  { title: "Lower Shire Riverbank Reforestation",          date: "April 2025",    district: "Chikwawa",       type: "Tree Planting", participants: 180, desc: "Youth clubs planted 520 indigenous trees along critically eroded Shire riverbanks in partnership with the Shire Valley Transformation Programme to reduce sedimentation and flooding." },
  { title: "Mulanje Massif Youth Conservation Patrol",     date: "March 2025",    district: "Mulanje",         type: "Survey",        participants: 45,  desc: "A 3-day field patrol across the Mulanje Massif to document illegal logging, encroachment, and rare plant species. Data submitted to the Mulanje Mountain Conservation Trust and Forestry Department." },
  { title: "Blantyre Urban Tree Planting",                 date: "March 2025",    district: "Blantyre",        type: "Tree Planting", participants: 150, desc: "Youth clubs collaborated with Blantyre City Council to plant 700 shade trees along major roads, in parks, and on school grounds across the city." },
  { title: "Nsanje Flood Awareness and Mangrove Drive",    date: "February 2025", district: "Nsanje",          type: "Awareness",     participants: 220, desc: "Community awareness campaign on flood-risk reduction combined with riverbank vegetation restoration in flood-prone Nsanje villages." },
  { title: "Thyolo Shade Tree Workshop with Tea Estates",  date: "January 2025",  district: "Thyolo",          type: "Workshop",      participants: 80,  desc: "A joint training session with Tea Association of Malawi members and youth clubs on integrating shade trees within tea estates for biodiversity and soil health benefits." },
  { title: "Chancellor College Vegetation Survey",         date: "December 2024", district: "Mulanje/Thyolo",  type: "Survey",        participants: 25,  desc: "Ground-truthing exercise for a UNIMA satellite vegetation change study, comparing deforestation trends across the Southern highlands over 10 years." },
  { title: "Mwanza Riverbank Clean-Up",                    date: "November 2024", district: "Mwanza",          type: "Clean-Up",      participants: 95,  desc: "A major clean-up along the Mwanza River targeting plastic waste and invasive water plants blocking river flow and degrading water quality." },
  { title: "Southern Region Youth Conservation Summit",    date: "October 2024",  district: "Blantyre",        type: "Workshop",      participants: 300, desc: "Annual gathering of all 22 Southern Region club coordinators to share field experiences, review regional statistics, and plan activities for the coming conservation season." },
];

const blogs = [
  { title: "The Lower Shire: Malawi's Most Threatened River",  date: "April 2025",    author: "Dalitso Mwale",    category: "Waterways",        readTime: "6 min read", excerpt: "The Lower Shire River has lost over 60% of its original riparian vegetation. YASCON's Chikwawa clubs are planting trees at scale — and the results are already visible after just one season." },
  { title: "Walking Mulanje: What Our Youth Patrols Found",    date: "March 2025",    author: "Chisomo Kachali",  category: "Conservation",     readTime: "7 min read", excerpt: "Three days in the Mulanje Massif revealed both beauty and crisis. YASCON's youth patrol documented 12 illegal logging sites — and 4 previously unrecorded plant species." },
  { title: "Greening Blantyre: Trees in the Heart of the City",date: "March 2025",    author: "Blessings Katunga",category: "Urban Ecology",    readTime: "4 min read", excerpt: "As Blantyre expands, its tree cover shrinks. YASCON is working with the city council to reverse that trend — one school and one road at a time." },
  { title: "Women Leading Conservation in Southern Malawi",    date: "February 2025", author: "Alinafe Moyo",     category: "Gender & Inclusion",readTime: "5 min read", excerpt: "Over 50% of YASCON Southern Region's club leadership positions are now held by young women. We explore what that means for conservation outcomes on the ground." },
  { title: "A Decade of Deforestation: What the Data Shows",   date: "January 2025",  author: "Yamikani Chirwa",  category: "Research",         readTime: "8 min read", excerpt: "Using satellite imagery and YASCON's own field data, Regional Coordinator Yamikani Chirwa presents a sobering look at vegetation loss across the Southern Region — and what can still be saved." },
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
    <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm"
      style={{ background: color + "22", color, border: `1px solid ${color}55` }}>
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
          <div key={i} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-4" style={{ background: ACCENT }}>{p.name.charAt(0)}</div>
            <Badge text={p.type} color={ACCENT} />
            <h3 className="font-bold text-[#0f1a0f] text-lg mt-3 mb-2">{p.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
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
          <div key={i} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4" style={{ background: ACCENT }}>{m.initials}</div>
            <h3 className="font-bold text-[#0f1a0f] text-lg">{m.name}</h3>
            <p className="text-sm font-medium mt-1 mb-1" style={{ color: ACCENT }}>{m.role}</p>
            <p className="text-xs text-gray-500 mb-3">📍 {m.district}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistrictsPanel() {
  return (
    <div>
      <SectionHeader label="Coverage" title="Districts We Serve" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {districts.map((d, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0f1a0f] text-xl">{d.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Coordinator: <span className="font-medium text-gray-700">{d.coordinator}</span></p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: ACCENT }}>{i + 1}</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
              {([["Activities", d.activities], ["Trees", d.trees.toLocaleString()], ["Members", d.members]] as [string, string | number][]).map(([label, val]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold" style={{ color: ACCENT }}>{val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivitiesPanel() {
  const [filter, setFilter] = useState("All");
  const types = ["All", ...Array.from(new Set(activities.map((a) => a.type)))];
  const filtered = filter === "All" ? activities : activities.filter((a) => a.type === filter);
  return (
    <div>
      <SectionHeader label="Field Work" title="Conservation Activities" />
      <div className="flex flex-wrap gap-2 mb-8">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className="px-4 py-2 rounded-sm text-sm font-semibold transition-all duration-200"
            style={filter === t ? { background: ACCENT, color: "#fff" } : { background: "#f3f4f6", color: "#374151" }}>
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((a, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg p-6 hover:shadow-lg transition-all duration-300 flex gap-5">
            <div className="w-2 rounded-full flex-shrink-0 self-stretch" style={{ background: TYPE_COLORS[a.type] || ACCENT }} />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[#0f1a0f] text-lg">{a.title}</h3>
                <Badge text={a.type} color={TYPE_COLORS[a.type] || ACCENT} />
              </div>
              <p className="text-sm text-gray-600 mb-3">{a.desc}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>📅 {a.date}</span><span>📍 {a.district}</span><span>👥 {a.participants} participants</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogsPanel() {
  return (
    <div>
      <SectionHeader label="Stories" title="Regional Blog" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b, i) => (
          <article key={i} className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="h-40 flex items-center justify-center text-4xl" style={{ background: ACCENT + "15" }}>🌿</div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge text={b.category} color={ACCENT} />
                <span className="text-xs text-gray-400">{b.readTime}</span>
              </div>
              <h3 className="font-bold text-[#0f1a0f] text-lg mb-2 group-hover:underline">{b.title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">{b.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: ACCENT }}>{b.author.charAt(0)}</div>
                <span className="font-medium">{b.author}</span><span>·</span><span>{b.date}</span>
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold mb-2" style={{ color: ACCENT }}><CountUp target={s.value} suffix={s.suffix} /></div>
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
  { id: "partners",   label: "Our Partners",        icon: "🤝" },
  { id: "team",       label: "Our Team",            icon: "👥" },
  { id: "districts",  label: "Districts",           icon: "📍" },
  { id: "activities", label: "Activities",          icon: "🌿" },
  { id: "blogs",      label: "Blogs",               icon: "📝" },
  { id: "stats",      label: "Regional Statistics", icon: "📊" },
];

export default function SouthernRegionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("activities");

  return (
    <div className="min-h-screen bg-[#f7f8f5] mt-16">

      {/* HERO */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-[#0f1a0f]">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: ACCENT }} />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: ACCENT }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/impact" className="hover:text-white transition-colors">Impact</Link>
            <span>/</span>
            <span className="text-white/80">Southern Region</span>
          </div>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] px-4 py-1.5 mb-6"
              style={{ background: ACCENT + "22", border: `1px solid ${ACCENT}55`, color: ACCENT, borderRadius: "2px" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
              YASCON Regional Hub
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.06] mb-6">Southern Region</h1>
            <p className="text-lg text-white/70 mb-4 max-w-xl leading-relaxed">Protecting Malawi's most densely populated region — from the Shire Valley to the highlands.</p>
            <p className="text-sm text-white/55 max-w-2xl leading-relaxed">
              YASCON's Southern Region is the organisation's largest and most active hub, spanning Blantyre, Chikwawa, Nsanje, Thyolo, Mulanje, Mwanza, Neno, and neighbouring districts. Our youth-led clubs tackle deforestation, riverbank erosion, and wetland loss across Malawi's commercial and agricultural heartland.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.slice(0, 4).map((s, i) => (
              <div key={i} className="rounded-md p-4 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-2xl font-bold mb-1" style={{ color: ACCENT }}>{s.value.toLocaleString()}{s.suffix}</div>
                <div className="text-xs text-white/60 font-medium uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY TAB BAR */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 flex-shrink-0"
                style={activeTab === tab.id ? { borderColor: ACCENT, color: ACCENT } : { borderColor: "transparent", color: "#6b7280" }}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12">
        {activeTab === "partners"   && <PartnersPanel />}
        {activeTab === "team"       && <TeamPanel />}
        {activeTab === "districts"  && <DistrictsPanel />}
        {activeTab === "activities" && <ActivitiesPanel />}
        {activeTab === "blogs"      && <BlogsPanel />}
        {activeTab === "stats"      && <StatsPanel />}
      </div>

      {/* FOOTER CTA */}
      <section className="py-16 text-center bg-[#0f1a0f]">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] mb-3" style={{ color: ACCENT }}>Get Involved</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Southern Region Conservation Team</h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">Whether you want to volunteer, start a youth club, or support our programmes — we'd love to hear from you.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/get-involved" className="font-semibold px-7 py-3 rounded-sm text-sm text-white transition-all hover:-translate-y-0.5 shadow-lg" style={{ background: ACCENT }}>Become a Member</Link>
            <Link href="/contact" className="font-semibold px-7 py-3 rounded-sm text-sm text-white transition-all hover:-translate-y-0.5" style={{ border: "1.5px solid rgba(255,255,255,0.35)" }}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}