"use client";
import Image from "next/image";
import React, { useMemo, useState } from "react";

type Location = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  area: string;
};

const locations: Location[] = [
  {
    id: 1,
    name: "Chilomoni Primary School",
    category: "School",
    description:
      "Partnering on tree-planting drives and climate education for learners and parents.",
    image: "/our-work/work4.jpg",
    area: "Blantyre - Education",
  },
  {
    id: 2,
    name: "Blantyre Market",
    category: "Market",
    description:
      "Waste sorting demos with vendors to cut plastics entering nearby streams.",
    image: "/our-work/work1.avif",
    area: "Blantyre CBD - Community",
  },
  {
    id: 3,
    name: "Michiru Forest",
    category: "Forest",
    description:
      "Habitat restoration walks with youth stewards protecting indigenous species.",
    image: "/our-work/work6.jpg",
    area: "Blantyre - Conservation",
  },
  {
    id: 4,
    name: "Lake Malawi Shore",
    category: "Lakes",
    description:
      "Civic education on sustainable fishing and shoreline clean-ups with local clubs.",
    image: "/hero/mission2.jpg",
    area: "Mangochi - Water",
  },
  {
    id: 5,
    name: "Community Borehole",
    category: "Water",
    description:
      "Safe water awareness sessions and maintenance support with community leaders.",
    image: "/our-work/work5.jpg",
    area: "Chilobwe - WASH",
  },
  {
    id: 6,
    name: "Blantyre Secondary School",
    category: "School",
    description:
      "Student eco-clubs piloting zero-waste lunches and climate storytelling.",
    image: "/hero/mission1.jpg",
    area: "Blantyre - Education",
  },
];

const categories = ["All", "School", "Market", "Forest", "Lakes", "Water"];

export default function LocationPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const matchesSearch = location.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = filter === "All" || location.category === filter;

      return matchesSearch && matchesCategory;
    });
  }, [filter, search]);

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[url(/hero/mission2.jpg)] bg-cover bg-center text-white py-8 px-4 text-center">
        <div className="absolute inset-0 bg-black/25 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#d4a017] bg-[#1a2e1a]/80 px-3 py-2 rounded-full">
            <span className="h-px w-5 bg-[#d4a017]" />
            Where We Work
            <span className="h-px w-5 bg-[#d4a017]/60" />
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-5 drop-shadow-lg">
            Impact Locations
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-white/90">
            The same spirit as our mission: education, advocacy, community
            action and sustainability now mapped to the places we serve.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full border border-white/30 px-4 py-2 text-sm backdrop-blur-sm transition ${
                  filter === cat
                    ? "bg-[#d4a017] text-white font-semibold shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-12 h-[3px] bg-[#d4a017] mt-8 mx-auto rounded-sm shadow-lg shadow-[#d4a017]/40" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#2f9e44]">
              Field Footprint
            </p>
            <h2 className="text-2xl font-extrabold text-[#0f2610]">
              Every location pushes our mission forward.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search a location..."
                className="w-full md:w-64 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-[#2f9e44] focus:outline-none focus:ring-2 focus:ring-[#2f9e44]/30"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="group overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all bg-white/90 backdrop-blur-sm"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={location.image}
                  alt={location.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 90vw"
                  priority={location.id <= 3}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2610]/85 via-[#0f2610]/45 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm uppercase tracking-[0.2em] font-semibold">
                      {location.category}
                    </p>
                    <span className="text-white font-bold text-lg tracking-wide drop-shadow">
                      {location.name}
                    </span>
                  </div>
                  <span className="text-xs text-white/80 bg-white/10 border border-white/20 px-2 py-1 rounded-full">
                    {location.area}
                  </span>
                </div>
              </div>
              <div className="p-6 border-t-4 border-[#2f9e44]">
                <p className="text-gray-700 leading-relaxed">
                  {location.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
