import type { BagCategory } from "./content";

export type ProcedureBagItem = {
  id: string;
  label: string;
};

export type Procedure = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  emoji: string;
  accent: string;
  bodyRegion: string;
  hospitalStay: string;
  recoveryWindow: string;
  description: string;
  bagItems: ProcedureBagItem[];
  bagSectionTitle: string;
  bagSectionTagline: string;
  careTip: {
    icon: string;
    title: string;
    detail: string;
  };
  palContext: string;
};

export const procedures: Procedure[] = [
  {
    id: "knee",
    name: "Knee Replacement",
    shortName: "Knee",
    icon: "accessibility_new",
    emoji: "🦵",
    accent: "from-[#88d1e5] to-[#006172]",
    bodyRegion: "Lower limb",
    hospitalStay: "1–3 nights",
    recoveryWindow: "6–12 weeks",
    description:
      "Joint resurfacing with a metal-and-polymer implant. Inpatient, regional anesthesia, early ambulation.",
    bagItems: [
      { id: "knee-pants", label: "Loose pajama pants that fit over a brace" },
      { id: "knee-ice", label: "Reusable ice packs (×2)" },
      { id: "knee-walker", label: "Walker or pre-fitted crutches" },
      { id: "knee-pillow", label: "Wedge pillow for elevation" },
    ],
    bagSectionTitle: "For your knee",
    bagSectionTagline: "Mobility, swelling, and elevation — covered.",
    careTip: {
      icon: "directions_walk",
      title: "First steps come fast",
      detail:
        "PT usually starts the same day. Practice sit-to-stand from a firm chair this week — it makes day-one easier.",
    },
    palContext:
      "This is an elective total knee arthroplasty. Concerns to anticipate: post-op pain control, DVT prevention (compression + early walking), wound care, PT cadence, and weight-bearing instructions from the surgeon.",
  },
  {
    id: "gallbladder",
    name: "Gallbladder Removal",
    shortName: "Gallbladder",
    icon: "spa",
    emoji: "🫀",
    accent: "from-[#a8e6cf] to-[#0a7a5e]",
    bodyRegion: "Upper abdomen",
    hospitalStay: "Same day or 1 night",
    recoveryWindow: "1–2 weeks",
    description:
      "Laparoscopic cholecystectomy. Four small incisions, general anesthesia, often outpatient.",
    bagItems: [
      { id: "gb-loose", label: "Loose-waist pants — no pressure on incisions" },
      { id: "gb-pillow", label: "Small pillow to brace your belly when coughing" },
      { id: "gb-bland", label: "Bland snacks for the ride home" },
      { id: "gb-mints", label: "Ginger mints for post-anesthesia nausea" },
    ],
    bagSectionTitle: "For your gallbladder removal",
    bagSectionTagline: "Belly comfort and post-anesthesia ease.",
    careTip: {
      icon: "restaurant",
      title: "Eat low-fat for two weeks",
      detail:
        "Your bile flow changes overnight. Stick to lean proteins, steamed veggies, and avoid fried/creamy foods until your body adjusts.",
    },
    palContext:
      "This is laparoscopic cholecystectomy. Concerns to anticipate: post-anesthesia nausea, shoulder-tip pain from CO₂ insufflation, low-fat dietary adjustment, incision care, and return-to-work timing (typically 1 week for desk work).",
  },
  {
    id: "cataract",
    name: "Cataract Surgery",
    shortName: "Cataract",
    icon: "visibility",
    emoji: "👁️",
    accent: "from-[#fde2c4] to-[#c4892b]",
    bodyRegion: "Eye",
    hospitalStay: "Outpatient · 2 hours",
    recoveryWindow: "4–6 weeks",
    description:
      "Phacoemulsification with intraocular lens implant. Topical anesthesia, awake, ~15 minute procedure.",
    bagItems: [
      { id: "cat-shades", label: "Wraparound dark sunglasses for the ride home" },
      { id: "cat-drops", label: "Pre-op prescription eye drops" },
      { id: "cat-shield", label: "Protective eye shield (provided by clinic)" },
      { id: "cat-driver", label: "Confirm driver — you cannot drive home" },
    ],
    bagSectionTitle: "For your cataract surgery",
    bagSectionTagline: "Light sensitivity is real for the first 48 hours.",
    careTip: {
      icon: "schedule",
      title: "Eye drop schedule is everything",
      detail:
        "You'll have 3 different drops, each on its own cadence, for 4 weeks. Set phone reminders the night before — missing doses risks inflammation.",
    },
    palContext:
      "This is phacoemulsification cataract surgery with IOL implant. Concerns to anticipate: post-op eye drop schedule (antibiotic, steroid, NSAID — different cadences), light sensitivity for 24–48h, no rubbing the eye, no swimming for 2 weeks, vision improving over days not minutes.",
  },
  {
    id: "wisdom",
    name: "Wisdom Teeth Removal",
    shortName: "Wisdom Teeth",
    icon: "dentistry",
    emoji: "🦷",
    accent: "from-[#fbcfe8] to-[#9d174d]",
    bodyRegion: "Mouth · jaw",
    hospitalStay: "Outpatient · 1 hour",
    recoveryWindow: "5–10 days",
    description:
      "Surgical extraction of all four third molars under IV sedation. Outpatient.",
    bagItems: [
      { id: "wis-ice", label: "Two soft ice packs for cheeks" },
      { id: "wis-soup", label: "Yogurt, broth, smoothies — stocked at home" },
      { id: "wis-gauze", label: "Extra gauze pads from the clinic" },
      { id: "wis-straw", label: "DO NOT pack straws — sucking causes dry socket" },
    ],
    bagSectionTitle: "For your wisdom teeth",
    bagSectionTagline: "Cold, soft, and zero suction.",
    careTip: {
      icon: "no_drinks",
      title: "Avoid straws for 7 days",
      detail:
        "Suction dislodges the clot and causes dry socket — the most painful complication. Sip from a cup; rinse gently with salt water starting day 2.",
    },
    palContext:
      "This is surgical extraction of all four third molars under IV sedation. Concerns to anticipate: dry socket prevention (no straws, no smoking, no spitting), soft food diet, ice cycling 20-on/20-off for 24h, expected swelling peaks at 48–72h.",
  },
  {
    id: "csection",
    name: "C-Section",
    shortName: "C-Section",
    icon: "child_friendly",
    emoji: "👶",
    accent: "from-[#fcd5ce] to-[#9b2226]",
    bodyRegion: "Lower abdomen",
    hospitalStay: "2–4 nights",
    recoveryWindow: "6–8 weeks",
    description:
      "Scheduled cesarean delivery. Spinal anesthesia, partner in OR, baby skin-to-skin if eligible.",
    bagItems: [
      { id: "cs-baby", label: "Baby's going-home outfit + blanket" },
      { id: "cs-nursing", label: "Two front-opening nursing tops" },
      { id: "cs-pads", label: "Postpartum pads (heavy flow)" },
      { id: "cs-binder", label: "Abdominal binder for incision support" },
      { id: "cs-snacks", label: "Snacks for partner — long admissions" },
    ],
    bagSectionTitle: "For your C-section",
    bagSectionTagline: "Two patients now — pack for both.",
    careTip: {
      icon: "favorite",
      title: "Walk within 12 hours",
      detail:
        "Earliest mobilization reduces blood-clot risk and helps gas pain dissipate. The first walk is hard; the second is easier.",
    },
    palContext:
      "This is a scheduled cesarean delivery under spinal anesthesia. Concerns to anticipate: incision care (no lifting heavier than the baby for 6 weeks), feeding establishment, postpartum bleeding, mood/anxiety screening, and emotional bandwidth — they're recovering AND parenting a newborn.",
  },
  {
    id: "hernia",
    name: "Hernia Repair",
    shortName: "Hernia",
    icon: "fitness_center",
    emoji: "💪",
    accent: "from-[#cdb4db] to-[#5b21b6]",
    bodyRegion: "Abdominal wall",
    hospitalStay: "Same day or 1 night",
    recoveryWindow: "3–6 weeks",
    description:
      "Laparoscopic mesh repair. Three small incisions, general anesthesia, restricted lifting for 4 weeks.",
    bagItems: [
      { id: "her-loose", label: "Loose drawstring pants — no waistband pressure" },
      { id: "her-binder", label: "Abdominal support binder" },
      { id: "her-stool", label: "Stool softener (anesthesia + opioids)" },
      { id: "her-laptop", label: "Laptop — desk work resumes in days, not weeks" },
    ],
    bagSectionTitle: "For your hernia repair",
    bagSectionTagline: "Lift restrictions are real and they matter.",
    careTip: {
      icon: "do_not_step",
      title: "Nothing over 10 lb for 4 weeks",
      detail:
        "Even one 'just this one box' violation can tear the mesh. Pre-position everything you'll need at counter height before surgery day.",
    },
    palContext:
      "This is laparoscopic mesh hernia repair. Concerns to anticipate: strict lifting restriction (10 lb / 4 weeks), constipation from anesthesia + opioids, gradual return to exercise, and recognizing recurrence (bulge returning at incision).",
  },
];

export const proceduresById = Object.fromEntries(
  procedures.map((p) => [p.id, p])
) as Record<string, Procedure>;

export const DEFAULT_PROCEDURE_ID = "knee";

export function getProcedure(id: string | undefined | null): Procedure {
  if (id && proceduresById[id]) return proceduresById[id];
  return proceduresById[DEFAULT_PROCEDURE_ID];
}

/**
 * Returns the patient's bag categories with a procedure-specific category
 * prepended. The procedure category is the first thing the patient sees.
 */
export function bagCategoriesFor(
  procedureId: string,
  base: BagCategory[]
): BagCategory[] {
  const proc = getProcedure(procedureId);
  if (proc.bagItems.length === 0) return base;
  const procedureCategory: BagCategory = {
    id: `proc-${proc.id}`,
    title: proc.bagSectionTitle,
    icon: proc.icon,
    items: proc.bagItems.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
  };
  return [procedureCategory, ...base];
}
