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
  {
    id: "appendectomy",
    name: "Appendectomy",
    shortName: "Appendix",
    icon: "emergency",
    emoji: "🚨",
    accent: "from-[#fecaca] to-[#991b1b]",
    bodyRegion: "Lower abdomen",
    hospitalStay: "1–2 nights",
    recoveryWindow: "1–3 weeks",
    description:
      "Laparoscopic removal of the appendix. Usually urgent rather than scheduled, general anesthesia.",
    bagItems: [
      { id: "app-loose", label: "Loose-waist pants — no pressure on incisions" },
      { id: "app-pillow", label: "Pillow to brace your belly when coughing" },
      { id: "app-charger", label: "Charger — admission lengths vary" },
      { id: "app-stool", label: "Stool softener" },
    ],
    bagSectionTitle: "For your appendectomy",
    bagSectionTagline: "Comfort, mobility, and gentle return to food.",
    careTip: {
      icon: "directions_walk",
      title: "Walk early, walk often",
      detail:
        "Short laps around the room within hours of waking up reduce CO₂ shoulder pain and prevent post-op clots. Slow is fine — just keep moving.",
    },
    palContext:
      "This is laparoscopic appendectomy. Concerns to anticipate: incision care, early ambulation, post-anesthesia nausea, gradual diet advancement, and watching for signs of infection (fever, redness, increased pain).",
  },
  {
    id: "hip",
    name: "Hip Replacement",
    shortName: "Hip",
    icon: "accessibility",
    emoji: "🦴",
    accent: "from-[#bae6fd] to-[#075985]",
    bodyRegion: "Lower limb",
    hospitalStay: "1–3 nights",
    recoveryWindow: "8–12 weeks",
    description:
      "Total hip arthroplasty with a metal-and-polymer implant. Inpatient, regional or general anesthesia, hip precautions for 6 weeks.",
    bagItems: [
      { id: "hip-grabber", label: "Reacher / grabber tool — you can't bend past 90°" },
      { id: "hip-sock", label: "Sock aid and long-handled shoehorn" },
      { id: "hip-cushion", label: "Wedge cushion to keep hips at safe angle" },
      { id: "hip-walker", label: "Walker pre-fitted by PT" },
    ],
    bagSectionTitle: "For your hip replacement",
    bagSectionTagline: "Adaptive tools that protect the new joint.",
    careTip: {
      icon: "warning",
      title: "Hip precautions for 6 weeks",
      detail:
        "Don't cross your legs, don't bend past 90°, don't twist the operated leg inward. Set up your home so nothing forces a violation.",
    },
    palContext:
      "This is total hip arthroplasty. Concerns to anticipate: posterior hip precautions (no crossing legs, no bending past 90°, no inward rotation), DVT prevention, home setup before surgery (raised toilet seat, grab bars), and PT cadence.",
  },
  {
    id: "tonsillectomy",
    name: "Tonsillectomy",
    shortName: "Tonsils",
    icon: "front_hand",
    emoji: "👄",
    accent: "from-[#fbcfe8] to-[#831843]",
    bodyRegion: "Throat",
    hospitalStay: "Outpatient",
    recoveryWindow: "10–14 days",
    description:
      "Removal of the tonsils under general anesthesia. Outpatient for most, painful sore throat for ~10 days after.",
    bagItems: [
      { id: "ton-cold", label: "Popsicles, ice cream, ice chips — bought ahead" },
      { id: "ton-humidifier", label: "Cool-mist humidifier for the bedroom" },
      { id: "ton-soft", label: "Yogurt, pudding, mashed potatoes — soft only" },
      { id: "ton-tylenol", label: "Liquid acetaminophen (no aspirin/NSAIDs)" },
    ],
    bagSectionTitle: "For your tonsillectomy",
    bagSectionTagline: "Cold, soft, hydrated — for ten days.",
    careTip: {
      icon: "water_drop",
      title: "Hydration is the only job",
      detail:
        "Dehydration is the #1 reason for ER returns. Drink something every 20 minutes while awake, even if it stings. Cool > cold > anything hot.",
    },
    palContext:
      "This is a tonsillectomy under general anesthesia. Concerns to anticipate: severe sore throat peaking days 3-7, hydration above all else (popsicles count), referred ear pain (normal), avoiding NSAIDs/aspirin (bleed risk), and watching for post-op bleeding which is a 911 emergency.",
  },
  {
    id: "acl",
    name: "ACL Reconstruction",
    shortName: "ACL",
    icon: "directions_run",
    emoji: "🏃",
    accent: "from-[#bbf7d0] to-[#15803d]",
    bodyRegion: "Knee · ligament",
    hospitalStay: "Outpatient",
    recoveryWindow: "6–9 months",
    description:
      "Arthroscopic ACL graft (hamstring, patellar tendon, or allograft). Outpatient, brace and crutches after, PT for months.",
    bagItems: [
      { id: "acl-brace", label: "Pre-fitted hinged knee brace" },
      { id: "acl-crutch", label: "Crutches sized to your height" },
      { id: "acl-ice", label: "Cold-therapy machine or 3+ ice packs" },
      { id: "acl-pants", label: "Loose shorts or pants that fit over the brace" },
    ],
    bagSectionTitle: "For your ACL repair",
    bagSectionTagline: "Long recovery starts with the first week of icing.",
    careTip: {
      icon: "ac_unit",
      title: "Ice 20 minutes every 2 hours",
      detail:
        "Aggressive icing in the first 72 hours reduces swelling, pain, and PT delay. A cold-therapy machine is worth every penny.",
    },
    palContext:
      "This is arthroscopic ACL reconstruction. Concerns to anticipate: aggressive icing for first 72h, brace settings per surgeon, PT starting within days, weight-bearing instructions, opioids vs NSAIDs (some surgeons avoid NSAIDs early because they slow ligament healing), and the long psychological haul of 6-9 month return-to-sport.",
  },
  {
    id: "carpal-tunnel",
    name: "Carpal Tunnel Release",
    shortName: "Carpal Tunnel",
    icon: "back_hand",
    emoji: "✋",
    accent: "from-[#fde68a] to-[#92400e]",
    bodyRegion: "Wrist",
    hospitalStay: "Outpatient · 30 min",
    recoveryWindow: "2–6 weeks",
    description:
      "Open or endoscopic transection of the transverse carpal ligament. Local anesthesia, awake, very short procedure.",
    bagItems: [
      { id: "ct-sling", label: "Sling or shoulder strap to keep hand elevated" },
      { id: "ct-driver", label: "Driver — you can't drive for ~48h" },
      { id: "ct-shirts", label: "Button-front shirts (no pulling over the head)" },
      { id: "ct-bag", label: "Plastic bag for showering — keep dressing dry" },
    ],
    bagSectionTitle: "For your carpal tunnel release",
    bagSectionTagline: "Elevation, dryness, and patience.",
    careTip: {
      icon: "front_hand",
      title: "Elevate above your heart",
      detail:
        "Swelling causes 90% of the early pain. Sleep with your hand on two pillows for the first week — pain drops dramatically.",
    },
    palContext:
      "This is open or endoscopic carpal tunnel release. Concerns to anticipate: elevation above heart for the first week, keeping the dressing dry, regaining grip strength gradually, pillar pain (normal for weeks), and full sensory recovery taking 6+ months for severe pre-op cases.",
  },
  {
    id: "lasik",
    name: "LASIK",
    shortName: "LASIK",
    icon: "remove_red_eye",
    emoji: "👀",
    accent: "from-[#a5b4fc] to-[#3730a3]",
    bodyRegion: "Eye · refractive",
    hospitalStay: "Outpatient · 30 min",
    recoveryWindow: "1–2 weeks",
    description:
      "Laser reshaping of the cornea to correct refractive error. Topical anesthesia, awake, both eyes in one visit.",
    bagItems: [
      { id: "la-shades", label: "Wraparound dark sunglasses for the ride home" },
      { id: "la-shield", label: "Sleep shields (clinic provides)" },
      { id: "la-drops", label: "Prescription artificial tears + antibiotic drops" },
      { id: "la-driver", label: "Confirm driver — you cannot drive home" },
    ],
    bagSectionTitle: "For your LASIK",
    bagSectionTagline: "Drops, shades, and zero rubbing.",
    careTip: {
      icon: "visibility_off",
      title: "Don't touch your eyes for a week",
      detail:
        "Sleep shields the first 3 nights. No rubbing, no makeup, no swimming for 2 weeks. The first 24 hours determine the final result.",
    },
    palContext:
      "This is bilateral LASIK with femtosecond flap creation. Concerns to anticipate: aggressive drop regimen (steroid + antibiotic + artificial tears), no eye rubbing for a week, sleep shields for 3 nights, halos/glare at night for 1-3 months, and dry eye for weeks to months.",
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
