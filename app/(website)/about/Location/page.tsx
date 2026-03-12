"use client";

import { useState, useEffect } from "react";

const heroImages = ["/Images/Eastern1.png", "/Images/Eastern2.png", "/Images/Eastern3.png"];

const regions = [
  {
    name: "Northern Region",
    borderColor: "border-green-700",
    bgColor: "bg-green-700",
    textColor: "text-green-700",
    districts: [
      {
        name: "Mzimba",
        description: "YASCON works with communities in Mzimba to promote forest conservation and sustainable land use practices.",
        programs: ["Reforestation", "Community Training", "Wildlife Protection"],
        beneficiaries: 1240,
      },
      {
        name: "Rumphi",
        description: "Our teams engage youth in Rumphi on environmental education and river catchment conservation.",
        programs: ["Environmental Education", "River Conservation", "Youth Clubs"],
        beneficiaries: 870,
      },
      {
        name: "Karonga",
        description: "Coastal and wetland conservation initiatives are led by YASCON volunteers in Karonga district.",
        programs: ["Wetland Conservation", "Fish Farming", "Climate Awareness"],
        beneficiaries: 640,
      },
    ],
  },
  {
    name: "Central Region",
    borderColor: "border-green-900",
    bgColor: "bg-green-900",
    textColor: "text-green-900",
    districts: [
      {
        name: "Lilongwe",
        description: "As the national capital, Lilongwe hosts our headquarters and flagship urban greening and waste management programs.",
        programs: ["Urban Greening", "Waste Management", "Policy Advocacy"],
        beneficiaries: 3200,
      },
      {
        name: "Dowa",
        description: "YASCON runs soil conservation and agroforestry programs in Dowa, addressing land degradation.",
        programs: ["Agroforestry", "Soil Conservation", "Farmer Training"],
        beneficiaries: 1450,
      },
      {
        name: "Kasungu",
        description: "Wildlife corridor conservation and anti-poaching youth campaigns are active in Kasungu.",
        programs: ["Wildlife Corridors", "Anti-Poaching", "Eco-Tourism"],
        beneficiaries: 980,
      },
    ],
  },
  {
    name: "Eastern Region",
    borderColor: "border-green-600",
    bgColor: "bg-green-600",
    textColor: "text-green-600",
    districts: [
      {
        name: "Zomba",
        description: "Mountain ecosystem conservation and university partnerships define YASCON's work in Zomba.",
        programs: ["Mountain Conservation", "Research Partnerships", "Tree Nurseries"],
        beneficiaries: 1100,
      },
      {
        name: "Machinga",
        description: "YASCON empowers rural communities in Machinga through climate-smart agriculture and water conservation.",
        programs: ["Climate-Smart Agriculture", "Water Conservation", "Women Empowerment"],
        beneficiaries: 760,
      },
    ],
  },
  {
    name: "Southern Region",
    borderColor: "border-emerald-600",
    bgColor: "bg-emerald-600",
    textColor: "text-emerald-600",
    districts: [
      {
        name: "Blantyre",
        description: "Urban environmental programs in Blantyre focus on air quality, green spaces, and youth leadership.",
        programs: ["Air Quality", "Green Spaces", "Youth Leadership"],
        beneficiaries: 2800,
      },
      {
        name: "Thyolo",
        description: "Tea estate ecosystem restoration and biodiversity monitoring are key activities in Thyolo.",
        programs: ["Ecosystem Restoration", "Biodiversity", "Community Gardens"],
        beneficiaries: 920,
      },
      {
        name: "Mulanje",
        description: "Mulanje Mountain conservation, endemic species protection, and ecotourism are priorities here.",
        programs: ["Mountain Conservation", "Endemic Species", "Eco-Tourism"],
        beneficiaries: 1350,
      },
      {
        name: "Nsanje",
        description: "Flood resilience, mangrove restoration, and climate adaptation programs run in Nsanje.",
        programs: ["Flood Resilience", "Mangrove Restoration", "Climate Adaptation"],
        beneficiaries: 580,
      },
    ],
  },
];

const totalDistricts = regions.reduce((sum, r) => sum + r.districts.length, 0);
const totalBeneficiaries = regions.reduce(
  (sum, r) => sum + r.districts.reduce((s, d) => s + d.beneficiaries, 0),
  0
);

export default function WhereWeWork() {
  const [activeDistrict, setActiveDistrict] = useState<{ region: number; district: number } | null>(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentImage(prev => (prev + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Slideshow */}
      <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === currentImage ? 1 : 0 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${img}')` }}
            />
            <div className="absolute inset-0 bg-black/55" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 flex items-center h-full pt-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-5 border rounded-sm text-yellow-400 border-yellow-400/40 bg-yellow-400/10">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                Our Footprint Across Malawi
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Where We Work
              </h1>
              <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-10 max-w-xl">
                YASCON operates across all four regions of Malawi, partnering with communities,
                institutions, and local governments to drive environmental change.
              </p>
              <div className="flex flex-wrap gap-10">
                <div className="text-white">
                  <div className="text-4xl font-bold leading-none">4</div>
                  <div className="text-xs uppercase tracking-widest mt-1 text-white/55">Regions</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl font-bold leading-none">{totalDistricts}</div>
                  <div className="text-xs uppercase tracking-widest mt-1 text-white/55">Districts</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl font-bold leading-none">{totalBeneficiaries.toLocaleString()}+</div>
                  <div className="text-xs uppercase tracking-widest mt-1 text-white/55">Beneficiaries</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Dots */}
        <div className="absolute z-20 flex gap-2 bottom-8 left-1/2 -translate-x-1/2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentImage ? "w-6 bg-yellow-400" : "w-2 bg-white/40"}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <section className="bg-yellow-500 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-green-950">4</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-900 mt-1">Regions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-950">{totalDistricts}</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-900 mt-1">Districts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-950">{totalBeneficiaries.toLocaleString()}+</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-900 mt-1">Beneficiaries</p>
          </div>
        </div>
      </section>

      {/* Regions & Districts */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        {regions.map((region, rIdx) => (
          <div key={rIdx} className="mb-14">

            {/* Region Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-1 h-10 rounded-full ${region.bgColor}`} />
              <div>
                <h2 className="text-2xl font-bold text-green-950">{region.name}</h2>
                <p className="text-sm text-green-800">{region.districts.length} districts</p>
              </div>
            </div>

            {/* Districts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {region.districts.map((district, dIdx) => {
                const isActive = activeDistrict?.region === rIdx && activeDistrict?.district === dIdx;
                return (
                  <button
                    key={dIdx}
                    onClick={() =>
                      setActiveDistrict(isActive ? null : { region: rIdx, district: dIdx })
                    }
                    className={`text-left border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                      isActive ? `${region.borderColor} shadow-lg` : "border-gray-200"
                    }`}
                  >
                    <div className={`h-1.5 w-full ${region.bgColor}`} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <svg className={`w-4 h-4 ${region.textColor}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <h3 className="text-base font-bold text-green-950">{district.name}</h3>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${region.bgColor}`}>
                          {district.beneficiaries.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-green-900 leading-relaxed mb-4">{district.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {district.programs.map((prog, pIdx) => (
                          <span
                            key={pIdx}
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${region.borderColor} ${region.textColor}`}
                          >
                            {prog}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-green-950 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Want to Make an Impact in Your Community?</h2>
        <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
          Join YASCON as a volunteer, partner, or donor and help us expand our reach across Malawi.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="/get-involved"
            className="border-2 border-white text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white hover:text-green-800 transition-colors"
          >
            Get Involved
          </a>
          <a
            href="/donate"
            className="bg-yellow-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-yellow-600 transition-colors"
          >
            Donate Now
          </a>
        </div>
      </section>

    </main>
  );
}