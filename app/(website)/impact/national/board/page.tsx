"use client";

import Image from "next/image";

const boardMembers = [
  {
    name: "Mwai Mtayamanja",
    role: "National Coordinator",
    image: "/teampics/national-coordinator.png",
    bio: "Leads the board and ensures the organization follows its mission and vision.",
  },
  {
    name: "Clement Chiwambo",
    role: "Funding & Compliance Manager",
    image: "/avatars/avatar-2.svg",
    bio: "",
  },
  {
    name: "Rashid Mailos",
    role: "Extension Methodologies Manager",
    image: "/avatars/avatar-2.svg",
    bio: "",
  },
  {
    name: "Salomy Chivunga",
    role: "Public Relations & Events Manager",
    image: "/avatars/avatar-2.svg",
    bio: "",
  },
  {
    name: "Mussa John Witness",
    role: "Media Relations Manager",
    image: "/avatars/avatar-2.svg",
    bio: "",
  },
];

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 mt-20">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-gray-800">Board of Directors</h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Meet the leadership team guiding our organization’s vision, strategy,
          and governance.
        </p>
      </div>

      {/* Board Grid */}
      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
        {boardMembers.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 text-center"
          >
            <div className="relative w-28 h-28 mx-auto mb-4">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-800">
              {member.name}
            </h3>

            <p className="text-blue-600 text-sm font-medium">{member.role}</p>

            <p className="text-gray-500 text-sm mt-3">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
