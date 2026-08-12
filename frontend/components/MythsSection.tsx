import React from "react";
import MythFlipCard from "./ui/myth-flip-card";

const MYTHS_DATA = [
  {
    id: 1,
    mythTitle: "Donating blood causes severe physical weakness",
    mythDesc: "Many believe donating blood drains energy permanently and requires days of bed rest to recover.",
    realityTitle: "Body restores fluid volume within 24–48 hours",
    realityDesc: "Your body replenishes plasma quickly. Healthy adults can resume normal light activities right after a brief rest and juice.",
  },
  {
    id: 2,
    mythTitle: "Blood donation is painful and unsafe",
    mythDesc: "People fear infection or severe long-term pain from needles during the extraction process.",
    realityTitle: "Strictly sterile, single-use equipment",
    realityDesc: "You only feel a minor initial pinch. All needles are 100% sterile, single-use, and disposed of immediately.",
  },
  {
    id: 3,
    mythTitle: "People with high BP or diabetes can't donate",
    mythDesc: "It is widely assumed that taking routine chronic medications disqualifies you automatically.",
    realityTitle: "Controlled conditions are eligible",
    realityDesc: "If your blood pressure or blood sugar is well-managed with medication on donation day, you are eligible to donate.",
  },
  {
    id: 4,
    mythTitle: "Donating blood takes too much time",
    mythDesc: "Attendants think blood donation is an all-day hospital procedure requiring hours of waiting.",
    realityTitle: "The actual extraction takes 8–10 minutes",
    realityDesc: "The entire process—registration, quick health check, and donation—takes under 30 minutes total.",
  },
  {
    id: 5,
    mythTitle: "You can contract diseases like HIV while donating",
    mythDesc: "A common fear is that blood banks reuse equipment or transmit viruses to donors.",
    realityTitle: "Zero risk of acquiring infections",
    realityDesc: "Equipment is opened fresh right in front of you. It is physically impossible to catch infections from donating.",
  },
  {
    id: 6,
    mythTitle: "Smokers and tea drinkers cannot donate blood",
    mythDesc: "Belief that lifestyle habits like smoking or high caffeine permanently contaminate donated blood.",
    realityTitle: "Eligible with temporary brief pauses",
    realityDesc: "Smokers can donate as long as they abstain 2 hours before and after donation to keep blood pressure steady.",
  },
  {
    id: 7,
    mythTitle: "Females should not donate blood at all",
    mythDesc: "Cultural myth claiming women naturally have insufficient blood volume for regular donation.",
    realityTitle: "Eligible if hemoglobin levels are normal",
    realityDesc: "Any healthy woman with a hemoglobin level of 12.5 g/dL or above can safely donate blood every 4 months.",
  },
  {
    id: 8,
    mythTitle: "You only need to donate blood during major disasters",
    mythDesc: "People think emergency stockpiles are always full unless a large-scale trauma occurs.",
    realityTitle: "Blood expires and is needed daily",
    realityDesc: "Red blood cells last only 42 days. Thalassemia patients and cancer therapies require continuous daily supplies.",
  },
];

const MythsSection: React.FC = () => {
  return (
    <section className="relative w-full bg-[#FFF7F7] py-20 px-4 md:px-8 border-t border-[#F0D9DC]">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="rounded-full bg-[#FDE8EA] px-3.5 py-1 text-xs font-semibold text-[#C1121F] border border-[#FDE8EA]">
            FACT VS FICTION
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-[#171717] md:text-4xl tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Common Blood Donation Myths
          </h2>
          <p className="mt-3 text-sm text-[#969696]">
            Separate medical facts from urban rumors. Click any card to uncover the reality.
          </p>
        </div>

        {/* 4 CARDS PER LINE ON DESKTOP (Grid 4-col) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MYTHS_DATA.map((item) => (
            <MythFlipCard key={item.id} {...item}/>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MythsSection;
