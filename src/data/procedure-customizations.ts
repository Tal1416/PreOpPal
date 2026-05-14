/**
 * Per-procedure content overrides for the dashboard, timeline, arrival, and
 * medications pages.
 *
 * The idea: every procedure in src/data/procedures.ts can supply its own
 * version of the static content that normally lives in src/data/content.ts.
 * Helpers at the bottom of this file merge the override on top of the generic
 * default so any page can call e.g. `tasksFor(procedureId)` and get either the
 * tailored version (if defined) or the original baseline.
 *
 * Content tokens like {{surgeon}}, {{hospital}}, {{firstName}}, {{procedure}}
 * are still resolved by personalize() at render time — no need to inline them.
 */

import type {
  ArrivalStep,
  Medication,
  Phase,
  PhaseChecklistItem,
  PhaseDetails,
  PhaseTip,
  Task,
} from "./content";

export type PhaseHighlight = {
  icon: string;
  title: string;
  detail: string;
};

/** Optional overrides for a single timeline phase. */
export type ProcedurePhaseOverride = {
  highlights?: PhaseHighlight[];
  summary?: string;
  checklist?: PhaseChecklistItem[];
  tips?: PhaseTip[];
  medications?: Medication[];
};

export type ProcedureCustomizations = {
  tasks?: Task[];
  arrival?: ArrivalStep[];
  meds?: Medication[];
  /** keyed by phase id: p1, p2, p3, p4, p5 */
  timeline?: Record<string, ProcedurePhaseOverride>;
};

/* -------------------------------------------------------------------------- */
/* Per-procedure customizations                                               */
/* -------------------------------------------------------------------------- */

export const procedureCustomizations: Record<
  string,
  ProcedureCustomizations
> = {
  /* ---------------------------- KNEE REPLACEMENT --------------------------- */
  knee: {
    tasks: [
      {
        id: "k-nsaid",
        icon: "block",
        title: "Stop NSAIDs",
        description: "Ibuprofen, naproxen, aspirin — paused 7 days before surgery.",
        status: "critical",
      },
      {
        id: "k-walker",
        icon: "elderly",
        title: "Pre-fit your walker",
        description: "Adjust height before surgery so day-one is smoother.",
        status: "pending",
      },
      {
        id: "k-pt",
        icon: "directions_walk",
        title: "Practice sit-to-stand",
        description: "Ten reps, twice daily, from a firm chair.",
        status: "pending",
      },
      {
        id: "k-ride",
        icon: "directions_car",
        title: "Confirm your driver",
        description: "No driving for ~2 weeks post-op.",
        status: "pending",
      },
      {
        id: "k-bag",
        icon: "work",
        title: "Pack a wedge pillow",
        description: "Elevation is everything in the first week.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "k-a1",
        time: "5:30 AM",
        title: "Wake & CHG shower",
        description: "Final antiseptic wash. No lotions, deodorant, or makeup.",
        icon: "shower",
      },
      {
        id: "k-a2",
        time: "6:00 AM",
        title: "Arrive at {{hospital}}",
        description: "Main entrance, Joint Surgery wing. Valet recommended.",
        icon: "local_hospital",
      },
      {
        id: "k-a3",
        time: "6:30 AM",
        title: "Surgical reception, Floor 3",
        description: "Show your ID, insurance card, and signed consent.",
        icon: "badge",
      },
      {
        id: "k-a4",
        time: "7:00 AM",
        title: "Pre-op suite & nerve block",
        description: "Anesthesia places a regional block in the operative leg.",
        icon: "vaccines",
      },
      {
        id: "k-a5",
        time: "7:45 AM",
        title: "{{surgeon}} marks your knee",
        description: "Initials on the correct leg — confirm with the team.",
        icon: "edit",
      },
      {
        id: "k-a6",
        time: "8:00 AM",
        title: "OR — procedure begins",
        description: "Implant placement is ~90 minutes. Family gets live updates.",
        icon: "schedule",
      },
    ],
    meds: [
      {
        id: "k-m1",
        name: "Ibuprofen",
        dosage: "200–400mg",
        schedule: "Stopped 7 days pre-op",
        status: "stop",
        reason: "Bleeding risk during arthroplasty.",
      },
      {
        id: "k-m2",
        name: "Aspirin (low-dose)",
        dosage: "81mg",
        schedule: "Resumed post-op for clot prevention",
        status: "new",
        reason: "Standard DVT prophylaxis after joint surgery.",
      },
      {
        id: "k-m3",
        name: "Enoxaparin",
        dosage: "40mg",
        schedule: "Subcutaneous, daily ×14 days",
        status: "new",
        reason: "Blood thinner — protects against clots while mobility is limited.",
      },
      {
        id: "k-m4",
        name: "Acetaminophen",
        dosage: "1000mg",
        schedule: "Every 6h × first 72h",
        status: "new",
        reason: "Scheduled (not as-needed) pain control reduces opioid need.",
      },
      {
        id: "k-m5",
        name: "Oxycodone",
        dosage: "5mg",
        schedule: "Every 4–6h as needed",
        status: "new",
        reason: "Breakthrough pain. Taper as soon as tolerable.",
      },
    ],
    timeline: {
      p1: {
        summary:
          "Foundation phase — joint imaging, EKG, and dental clearance all submitted to {{surgeon}}.",
        highlights: [
          { icon: "monitor_heart", title: "Cardiac clearance complete", detail: "EKG + labs to {{surgeon}}." },
          { icon: "dentistry", title: "Dental check signed off", detail: "No active infections that could seed the implant." },
          { icon: "fitness_center", title: "Quad-strength baseline", detail: "Stronger legs going in = faster PT after." },
        ],
      },
      p2: {
        summary: "Tapering NSAIDs and prepping your home for limited mobility.",
        highlights: [
          { icon: "block", title: "All NSAIDs stopped", detail: "Ibuprofen, naproxen, aspirin paused." },
          { icon: "shower", title: "CHG shower protocol", detail: "Nightly chlorhexidine wash starting tonight." },
          { icon: "chair", title: "Move your bed to ground floor", detail: "No stairs for the first week." },
        ],
        tips: [
          { icon: "directions_walk", title: "Practice walker turns", detail: "Tight kitchen / bathroom corners are where falls happen." },
        ],
      },
      p3: {
        summary: "Wedge pillow by the bed, ice packs in the freezer, walker by the door.",
        highlights: [
          { icon: "ac_unit", title: "Freeze 4+ ice packs", detail: "You'll rotate them every two hours." },
          { icon: "no_food", title: "NPO after midnight", detail: "Sips of water with meds only." },
          { icon: "checklist", title: "Walker by the front door", detail: "Pre-set to your height." },
        ],
      },
      p4: {
        summary: "Surgery day at {{hospital}}. Regional block first, then arthroplasty (~90 min).",
        highlights: [
          { icon: "local_hospital", title: "Arrive 6:00 AM", detail: "{{hospital}} — Joint Surgery wing." },
          { icon: "vaccines", title: "Regional nerve block", detail: "Numbs the leg for the first 18-24h post-op." },
          { icon: "groups", title: "{{surgeon}} marks your knee", detail: "Confirm correct leg with the team." },
        ],
      },
      p5: {
        summary: "PT starts day one. Aggressive icing and elevation for the first week.",
        highlights: [
          { icon: "directions_walk", title: "First steps within hours", detail: "PT walks with you the same day." },
          { icon: "ac_unit", title: "Ice 20 min, 4× daily", detail: "Reduces swelling more than meds." },
          { icon: "videocam", title: "Day 3 telehealth", detail: "{{surgeon}}'s team checks wound + range of motion." },
        ],
      },
    },
  },

  /* --------------------------- ACL RECONSTRUCTION -------------------------- */
  acl: {
    tasks: [
      {
        id: "a-brace",
        icon: "settings_accessibility",
        title: "Pre-fit your hinged brace",
        description: "PT will set the angles. Bring it on surgery day.",
        status: "pending",
      },
      {
        id: "a-cold",
        icon: "ac_unit",
        title: "Set up your cold-therapy machine",
        description: "Or freeze at least 3 ice packs. Aggressive icing = less PT delay.",
        status: "critical",
      },
      {
        id: "a-crutch",
        icon: "elderly",
        title: "Size your crutches",
        description: "Underarm pad at 2 fingers below armpit, grips at wrist crease.",
        status: "pending",
      },
      {
        id: "a-shorts",
        icon: "checkroom",
        title: "Pack loose shorts",
        description: "Anything that fits over the brace. No skinny pants.",
        status: "pending",
      },
      {
        id: "a-fast",
        icon: "no_food",
        title: "Begin fasting protocol",
        description: "No food after midnight. Sips of water until 2h before.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "a-a1",
        time: "6:00 AM",
        title: "Wake & shower",
        description: "Plain soap. Skip lotions and deodorant near the leg.",
        icon: "shower",
      },
      {
        id: "a-a2",
        time: "6:30 AM",
        title: "Arrive at the surgical center",
        description: "Outpatient — most ACL repairs go home same day.",
        icon: "local_hospital",
      },
      {
        id: "a-a3",
        time: "6:45 AM",
        title: "Same-Day Surgery check-in",
        description: "Bring your brace and crutches — staff will store them.",
        icon: "badge",
      },
      {
        id: "a-a4",
        time: "7:15 AM",
        title: "Femoral nerve block",
        description: "Numbs the leg for ~24h. You'll feel a heavy, warm leg after.",
        icon: "vaccines",
      },
      {
        id: "a-a5",
        time: "7:45 AM",
        title: "{{surgeon}} marks your knee",
        description: "Initials on the correct leg. Confirm together.",
        icon: "edit",
      },
      {
        id: "a-a6",
        time: "8:00 AM",
        title: "Arthroscopy begins",
        description: "Graft harvest + reconstruction is ~90 minutes.",
        icon: "schedule",
      },
      {
        id: "a-a7",
        time: "10:00 AM",
        title: "Recovery & brace fitted",
        description: "PT walks you with crutches before discharge.",
        icon: "self_improvement",
      },
    ],
    meds: [
      {
        id: "a-m1",
        name: "Ibuprofen",
        dosage: "600mg",
        schedule: "Every 6h × 5 days post-op",
        status: "new",
        reason: "Reduces inflammation. {{surgeon}} may delay this if a hamstring graft was used.",
      },
      {
        id: "a-m2",
        name: "Acetaminophen",
        dosage: "1000mg",
        schedule: "Every 6h scheduled",
        status: "new",
        reason: "Pair with ibuprofen for opioid-sparing pain control.",
      },
      {
        id: "a-m3",
        name: "Oxycodone",
        dosage: "5mg",
        schedule: "Every 4–6h as needed",
        status: "new",
        reason: "For breakthrough pain in the first 48–72h only.",
      },
      {
        id: "a-m4",
        name: "Aspirin (low-dose)",
        dosage: "81mg",
        schedule: "Daily × 2 weeks",
        status: "new",
        reason: "DVT prophylaxis — clot risk is real while crutched.",
      },
      {
        id: "a-m5",
        name: "Stool softener",
        dosage: "Docusate 100mg",
        schedule: "Twice daily while on opioids",
        status: "new",
        reason: "Anesthesia + opioids cause constipation. Start day one.",
      },
    ],
    timeline: {
      p1: {
        summary: "Pre-hab phase — stronger quads going in mean faster return after.",
        highlights: [
          { icon: "fitness_center", title: "Pre-hab with PT", detail: "2–3 weekly sessions to strengthen the quad." },
          { icon: "monitor_heart", title: "Clearance labs", detail: "EKG + bloodwork to {{surgeon}}." },
          { icon: "psychology", title: "Mental prep matters", detail: "6–9 months is a long arc. Set realistic milestones." },
        ],
      },
      p2: {
        summary: "Last week — brace fitted, crutches sized, home staged for limited mobility.",
        highlights: [
          { icon: "settings_accessibility", title: "Brace pre-fitted", detail: "PT sets the safe range of motion." },
          { icon: "ac_unit", title: "Cold therapy ready", detail: "Machine plugged in or 4+ ice packs frozen." },
          { icon: "stairs", title: "Stairs strategy", detail: "Plan to live on one floor for the first week." },
        ],
      },
      p3: {
        summary: "Pack your brace, crutches, and loose shorts. NPO from midnight.",
        highlights: [
          { icon: "no_food", title: "NPO after midnight", detail: "Sips of water only with meds." },
          { icon: "checklist", title: "Brace + crutches packed", detail: "Bring both to the surgical center." },
          { icon: "directions_car", title: "Confirm driver", detail: "No driving for ~2 weeks." },
        ],
      },
      p4: {
        summary: "Outpatient arthroscopy. Femoral block first, then graft + reconstruction.",
        highlights: [
          { icon: "local_hospital", title: "Arrive 6:30 AM", detail: "Same-Day Surgery check-in." },
          { icon: "vaccines", title: "Nerve block", detail: "Numbs the leg for ~24h post-op." },
          { icon: "self_improvement", title: "PT walk before discharge", detail: "Crutches + brace before you leave." },
        ],
      },
      p5: {
        summary: "Aggressive icing for 72h, brace 24/7 for weeks, PT 2–3× weekly.",
        highlights: [
          { icon: "ac_unit", title: "Ice 20 min every 2h", detail: "First 72h is non-negotiable." },
          { icon: "settings_accessibility", title: "Brace 24/7", detail: "Per {{surgeon}}'s angle settings — even sleeping." },
          { icon: "videocam", title: "Day 7 + 14 telehealth", detail: "Range of motion checked weekly." },
          { icon: "calendar_month", title: "Return-to-sport: 6–9 months", detail: "The long game. Patience wins." },
        ],
      },
    },
  },

  /* --------------------------- GALLBLADDER REMOVAL ------------------------- */
  gallbladder: {
    tasks: [
      {
        id: "g-diet",
        icon: "no_food",
        title: "Start low-fat eating now",
        description: "Bile flow changes overnight after surgery — preview it.",
        status: "pending",
      },
      {
        id: "g-fast",
        icon: "schedule",
        title: "Fasting cutoff: midnight",
        description: "Clear liquids OK until 2h pre-op. No solids after midnight.",
        status: "pending",
      },
      {
        id: "g-pants",
        icon: "checkroom",
        title: "Loose pants only",
        description: "No waistband pressure on the four laparoscopic incisions.",
        status: "pending",
      },
      {
        id: "g-mints",
        icon: "spa",
        title: "Pack ginger mints",
        description: "Post-anesthesia nausea is the #1 complaint here.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "g-a1",
        time: "5:30 AM",
        title: "Wake & shower",
        description: "Plain soap, no lotions on the belly.",
        icon: "shower",
      },
      {
        id: "g-a2",
        time: "6:00 AM",
        title: "Arrive at {{hospital}}",
        description: "Outpatient surgery — most leave the same day.",
        icon: "local_hospital",
      },
      {
        id: "g-a3",
        time: "6:30 AM",
        title: "Same-Day Surgery check-in",
        description: "ID + insurance card + consent form.",
        icon: "badge",
      },
      {
        id: "g-a4",
        time: "7:00 AM",
        title: "Pre-op IV & anti-nausea meds",
        description: "Ondansetron given before anesthesia helps avoid post-op nausea.",
        icon: "vaccines",
      },
      {
        id: "g-a5",
        time: "7:45 AM",
        title: "{{surgeon}} confirms the plan",
        description: "Laparoscopic — four small incisions, ~45 min procedure.",
        icon: "groups",
      },
      {
        id: "g-a6",
        time: "8:00 AM",
        title: "Surgery begins",
        description: "Cholecystectomy. CO₂ insufflation may cause shoulder pain after.",
        icon: "schedule",
      },
    ],
    meds: [
      {
        id: "g-m1",
        name: "Ondansetron",
        dosage: "4mg",
        schedule: "Every 8h as needed × 24h",
        status: "new",
        reason: "Post-anesthesia nausea is common. Take before it spikes.",
      },
      {
        id: "g-m2",
        name: "Acetaminophen",
        dosage: "650mg",
        schedule: "Every 6h × 3 days",
        status: "new",
        reason: "Primary pain control for laparoscopic incisions.",
      },
      {
        id: "g-m3",
        name: "Ibuprofen",
        dosage: "400mg",
        schedule: "Every 6h with food",
        status: "new",
        reason: "Anti-inflammatory. {{surgeon}} clears use day 1.",
      },
      {
        id: "g-m4",
        name: "Simethicone",
        dosage: "80mg",
        schedule: "Every 6h as needed × 48h",
        status: "new",
        reason: "Breaks up retained CO₂ — eases the shoulder-tip pain.",
      },
    ],
    timeline: {
      p1: {
        summary: "Pre-op imaging confirms the gallbladder problem and rules out stones in the duct.",
        highlights: [
          { icon: "biotech", title: "HIDA scan reviewed", detail: "Function score recorded for {{surgeon}}." },
          { icon: "monitor_heart", title: "Clearance labs", detail: "CBC, metabolic panel done." },
        ],
      },
      p2: {
        summary: "Transition to a low-fat diet to preview post-op bile changes.",
        highlights: [
          { icon: "restaurant", title: "Low-fat preview", detail: "Lean protein + steamed veg. Skip fried + creamy." },
          { icon: "block", title: "Hold NSAIDs", detail: "Stop ibuprofen 5 days pre-op." },
        ],
      },
      p3: {
        summary: "Pack loose-waist pants and a pillow to brace your belly when coughing.",
        highlights: [
          { icon: "no_food", title: "NPO after midnight", detail: "Clear liquids until 2h pre-op." },
          { icon: "checkroom", title: "Loose pants packed", detail: "No waistband on the incisions." },
        ],
      },
      p4: {
        summary: "Outpatient laparoscopic cholecystectomy. Home the same day for most patients.",
        highlights: [
          { icon: "local_hospital", title: "Arrive 6:00 AM", detail: "Same-Day Surgery unit." },
          { icon: "vaccines", title: "Anti-nausea pre-treatment", detail: "Given before anesthesia." },
        ],
      },
      p5: {
        summary: "Belly recovery: gentle walking, low-fat eating, watch for shoulder-tip pain.",
        highlights: [
          { icon: "directions_walk", title: "Walk early & often", detail: "Reduces CO₂ shoulder pain." },
          { icon: "restaurant", title: "Low-fat × 2 weeks", detail: "Bile flow adapts gradually." },
          { icon: "warning", title: "Yellow eyes? Call now", detail: "Could mean retained duct stones." },
        ],
      },
    },
  },

  /* ------------------------------- CATARACT -------------------------------- */
  cataract: {
    tasks: [
      {
        id: "c-drops",
        icon: "medication_liquid",
        title: "Pick up your pre-op drops",
        description: "Three different drops on three different schedules.",
        status: "critical",
      },
      {
        id: "c-shades",
        icon: "wb_sunny",
        title: "Buy wraparound sunglasses",
        description: "Light sensitivity is real for 48h after.",
        status: "pending",
      },
      {
        id: "c-driver",
        icon: "directions_car",
        title: "Confirm your driver",
        description: "No driving home — vision is blurry post-op.",
        status: "pending",
      },
      {
        id: "c-eat",
        icon: "restaurant",
        title: "Eat a light breakfast",
        description: "Topical anesthesia only — no fasting required.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "c-a1",
        time: "8:00 AM",
        title: "Light breakfast",
        description: "No fasting — topical anesthesia keeps you awake.",
        icon: "restaurant",
      },
      {
        id: "c-a2",
        time: "9:00 AM",
        title: "Arrive at the eye center",
        description: "Bring sunglasses and your driver.",
        icon: "local_hospital",
      },
      {
        id: "c-a3",
        time: "9:15 AM",
        title: "Dilation drops",
        description: "Pupil-dilating drops start the moment you check in.",
        icon: "remove_red_eye",
      },
      {
        id: "c-a4",
        time: "10:00 AM",
        title: "{{surgeon}} confirms the lens",
        description: "Final IOL power is verified — you can ask questions now.",
        icon: "groups",
      },
      {
        id: "c-a5",
        time: "10:30 AM",
        title: "Surgery — ~15 minutes",
        description: "Awake, comfortable. You'll see lights and movement only.",
        icon: "schedule",
      },
      {
        id: "c-a6",
        time: "11:30 AM",
        title: "Home with eye shield",
        description: "Sleep with the shield tonight. Vision improves over days.",
        icon: "home",
      },
    ],
    meds: [
      {
        id: "c-m1",
        name: "Moxifloxacin (antibiotic drops)",
        dosage: "1 drop",
        schedule: "4× daily × 7 days",
        status: "new",
        reason: "Prevents infection while the cornea heals.",
      },
      {
        id: "c-m2",
        name: "Prednisolone (steroid drops)",
        dosage: "1 drop",
        schedule: "4× daily, tapering over 4 weeks",
        status: "new",
        reason: "Controls post-op inflammation.",
      },
      {
        id: "c-m3",
        name: "Ketorolac (NSAID drops)",
        dosage: "1 drop",
        schedule: "4× daily × 4 weeks",
        status: "new",
        reason: "Anti-inflammatory — prevents macular edema.",
      },
      {
        id: "c-m4",
        name: "Acetaminophen",
        dosage: "500mg",
        schedule: "As needed",
        status: "new",
        reason: "Minimal discomfort expected — most patients don't need pain meds.",
      },
    ],
    timeline: {
      p1: {
        summary: "Biometry measures your eye and {{surgeon}} chooses the right intraocular lens.",
        highlights: [
          { icon: "biotech", title: "IOL measurements done", detail: "Lens power calculated by {{surgeon}}." },
          { icon: "remove_red_eye", title: "Lens choice confirmed", detail: "Monofocal, toric, or multifocal." },
        ],
      },
      p2: {
        summary: "Begin antibiotic drops 3 days before surgery if {{surgeon}} prescribed them.",
        highlights: [
          { icon: "medication_liquid", title: "Pre-op antibiotic drops", detail: "3 days before — kills bacteria on the surface." },
        ],
      },
      p3: {
        summary: "Stock sunglasses, sleep with the eye shield ready by the bed.",
        highlights: [
          { icon: "wb_sunny", title: "Wraparound shades packed", detail: "First 48h are sensitive to light." },
          { icon: "schedule", title: "No fasting required", detail: "Eat normally — local anesthesia only." },
        ],
      },
      p4: {
        summary: "15-minute procedure, awake, topical only. You'll see lights and movement.",
        highlights: [
          { icon: "remove_red_eye", title: "Dilation drops on arrival", detail: "Pupil takes 30 min to open." },
          { icon: "schedule", title: "Procedure: 15 minutes", detail: "Phacoemulsification + IOL implant." },
          { icon: "home", title: "Home with eye shield", detail: "Sleep with it tonight." },
        ],
      },
      p5: {
        summary: "Three drops, three schedules, four weeks. Vision sharpens day by day.",
        highlights: [
          { icon: "medication_liquid", title: "3 drops × 4 weeks", detail: "Set phone reminders the night before." },
          { icon: "visibility_off", title: "No eye rubbing", detail: "No swimming for 2 weeks." },
          { icon: "videocam", title: "Day 1 + Day 7 check-ins", detail: "{{surgeon}} reviews healing." },
        ],
      },
    },
  },

  /* ---------------------------- WISDOM TEETH ------------------------------- */
  wisdom: {
    tasks: [
      {
        id: "w-shop",
        icon: "shopping_cart",
        title: "Stock soft foods",
        description: "Yogurt, pudding, smoothies, mashed potatoes. Today, not tomorrow.",
        status: "critical",
      },
      {
        id: "w-ice",
        icon: "ac_unit",
        title: "Freeze two ice packs",
        description: "Cycle 20 min on / 20 min off for the first 24h.",
        status: "pending",
      },
      {
        id: "w-straw",
        icon: "no_drinks",
        title: "Remove straws from the house",
        description: "Suction = dry socket. Cups only for a week.",
        status: "critical",
      },
      {
        id: "w-driver",
        icon: "directions_car",
        title: "Confirm your driver",
        description: "IV sedation means no driving for 24h.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "w-a1",
        time: "6:30 AM",
        title: "Wake & brush gently",
        description: "Normal brushing fine. No mouthwash.",
        icon: "shower",
      },
      {
        id: "w-a2",
        time: "7:30 AM",
        title: "Arrive at the oral surgery clinic",
        description: "Outpatient. Bring your driver.",
        icon: "local_hospital",
      },
      {
        id: "w-a3",
        time: "7:45 AM",
        title: "Check in & paperwork",
        description: "ID + insurance card + signed consent.",
        icon: "badge",
      },
      {
        id: "w-a4",
        time: "8:00 AM",
        title: "IV sedation",
        description: "You'll drift off in seconds. The whole thing takes ~45 min.",
        icon: "vaccines",
      },
      {
        id: "w-a5",
        time: "8:45 AM",
        title: "Extraction × 4",
        description: "{{surgeon}} removes all four molars.",
        icon: "dentistry",
      },
      {
        id: "w-a6",
        time: "9:30 AM",
        title: "Recovery & home",
        description: "Gauze in place. Driver takes you home. Sleep on an incline.",
        icon: "home",
      },
    ],
    meds: [
      {
        id: "w-m1",
        name: "Amoxicillin",
        dosage: "500mg",
        schedule: "3× daily × 7 days",
        status: "new",
        reason: "Prevents infection in the empty sockets.",
      },
      {
        id: "w-m2",
        name: "Ibuprofen",
        dosage: "600mg",
        schedule: "Every 6h × 5 days",
        status: "new",
        reason: "Most effective pain control for dental surgery.",
      },
      {
        id: "w-m3",
        name: "Acetaminophen",
        dosage: "500mg",
        schedule: "Alternating with ibuprofen, every 3h",
        status: "new",
        reason: "Stacks safely with ibuprofen for steady relief.",
      },
      {
        id: "w-m4",
        name: "Chlorhexidine rinse",
        dosage: "15mL",
        schedule: "Twice daily, starting day 2",
        status: "new",
        reason: "Antiseptic rinse — don't spit, just tilt and drain.",
      },
    ],
    timeline: {
      p1: {
        summary: "Panoramic X-ray reviewed — {{surgeon}} confirms which roots come out.",
        highlights: [
          { icon: "biotech", title: "Panoramic X-ray done", detail: "Roots and nerve proximity mapped." },
        ],
      },
      p2: {
        summary: "Buy soft foods now — you won't feel like shopping afterward.",
        highlights: [
          { icon: "shopping_cart", title: "Soft food haul", detail: "Yogurt, smoothies, mashed potatoes, broth." },
          { icon: "ac_unit", title: "Ice packs in the freezer", detail: "20-on / 20-off for the first 24h." },
        ],
      },
      p3: {
        summary: "No food after midnight. Bring loose clothing — IV sedation means a long sleeve roll-up.",
        highlights: [
          { icon: "no_food", title: "NPO after midnight", detail: "Even water cut off 2h before." },
          { icon: "no_drinks", title: "No straws in the house", detail: "Suction = dry socket." },
        ],
      },
      p4: {
        summary: "~45 minute procedure under IV sedation. You'll wake up with gauze in place.",
        highlights: [
          { icon: "vaccines", title: "IV sedation", detail: "You won't remember the procedure." },
          { icon: "dentistry", title: "All four removed", detail: "Sockets packed with gauze." },
          { icon: "home", title: "Home with driver", detail: "Sleep on an incline tonight." },
        ],
      },
      p5: {
        summary: "Pain peaks day 2–3. Dry socket usually shows day 3–5. Salt water rinses start day 2.",
        highlights: [
          { icon: "ac_unit", title: "Ice for 24h, heat after", detail: "Then warm compresses to reduce stiffness." },
          { icon: "no_drinks", title: "No straws for 7 days", detail: "Sip from a cup." },
          { icon: "water_drop", title: "Salt water rinses day 2+", detail: "Gentle swish, no spit — let it drain." },
        ],
      },
    },
  },

  /* -------------------------------- C-SECTION ------------------------------ */
  csection: {
    tasks: [
      {
        id: "cs-bag-baby",
        icon: "child_friendly",
        title: "Pack baby's going-home bag",
        description: "Outfit, blanket, car seat installed and inspected.",
        status: "critical",
      },
      {
        id: "cs-nursing",
        icon: "woman",
        title: "Pack nursing tops",
        description: "Front-opening — no pulling over the head with an incision.",
        status: "pending",
      },
      {
        id: "cs-snacks",
        icon: "lunch_dining",
        title: "Snacks for your partner",
        description: "Long admissions need fuel.",
        status: "pending",
      },
      {
        id: "cs-fast",
        icon: "no_food",
        title: "Fasting starts 8h before",
        description: "Clear liquids until 2h pre-op.",
        status: "pending",
      },
      {
        id: "cs-mental",
        icon: "psychology",
        title: "Birth plan with {{surgeon}}",
        description: "Skin-to-skin, who cuts the cord, partner in the OR.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "cs-a1",
        time: "5:00 AM",
        title: "Wake & shower",
        description: "Soap is fine. No lotion on the belly.",
        icon: "shower",
      },
      {
        id: "cs-a2",
        time: "5:30 AM",
        title: "Arrive at {{hospital}}",
        description: "Labor & Delivery entrance — usually 24h access.",
        icon: "local_hospital",
      },
      {
        id: "cs-a3",
        time: "5:45 AM",
        title: "Triage & monitor",
        description: "Baby's heart rate + your contractions checked.",
        icon: "monitor_heart",
      },
      {
        id: "cs-a4",
        time: "6:30 AM",
        title: "Spinal anesthesia",
        description: "You stay awake. Partner joins after the block sets.",
        icon: "vaccines",
      },
      {
        id: "cs-a5",
        time: "7:00 AM",
        title: "OR — birth in ~10 minutes",
        description: "{{surgeon}} delivers baby. Skin-to-skin if eligible.",
        icon: "favorite",
      },
      {
        id: "cs-a6",
        time: "7:45 AM",
        title: "Recovery suite",
        description: "Bonding, vital signs, first feeding attempt.",
        icon: "self_improvement",
      },
    ],
    meds: [
      {
        id: "cs-m1",
        name: "Cefazolin",
        dosage: "2g IV",
        schedule: "Pre-incision",
        status: "new",
        reason: "Prophylactic antibiotic given by anesthesia.",
      },
      {
        id: "cs-m2",
        name: "Ibuprofen",
        dosage: "600mg",
        schedule: "Every 6h × 5 days",
        status: "new",
        reason: "Safe while breastfeeding. Reduces uterine cramping.",
      },
      {
        id: "cs-m3",
        name: "Acetaminophen",
        dosage: "1000mg",
        schedule: "Every 6h × 1 week",
        status: "new",
        reason: "Stack with ibuprofen for steady, breastfeeding-safe relief.",
      },
      {
        id: "cs-m4",
        name: "Oxycodone",
        dosage: "5mg",
        schedule: "Every 4–6h as needed × 3 days",
        status: "new",
        reason: "For breakthrough pain only. Minimal transfer to breastmilk.",
      },
      {
        id: "cs-m5",
        name: "Stool softener",
        dosage: "Docusate 100mg",
        schedule: "Twice daily × 2 weeks",
        status: "new",
        reason: "Anesthesia + opioids + the first BM after surgery — softer is kinder.",
      },
    ],
    timeline: {
      p1: {
        summary: "Pre-natal labs and growth scans confirm the scheduled date with {{surgeon}}.",
        highlights: [
          { icon: "pregnant_woman", title: "Final growth scan", detail: "Baby's position and size confirmed." },
          { icon: "monitor_heart", title: "Pre-op labs done", detail: "CBC, type & screen, COVID test." },
        ],
      },
      p2: {
        summary: "Birth plan finalized: skin-to-skin, partner in OR, who cuts the cord.",
        highlights: [
          { icon: "favorite", title: "Birth plan signed", detail: "Skin-to-skin on, music playlist saved." },
          { icon: "child_friendly", title: "Car seat installed", detail: "Inspected by fire station or PD." },
        ],
      },
      p3: {
        summary: "Hospital bag for two by the door. Fasting starts 8h before scheduled time.",
        highlights: [
          { icon: "no_food", title: "NPO 8h pre-op", detail: "Clear liquids until 2h before." },
          { icon: "checklist", title: "Two bags ready", detail: "Yours + baby's, by the door." },
        ],
      },
      p4: {
        summary: "Scheduled delivery via spinal anesthesia. You're awake; partner is in the OR.",
        highlights: [
          { icon: "vaccines", title: "Spinal block", detail: "Numb from chest down — fully awake." },
          { icon: "favorite", title: "Birth in ~10 min", detail: "Skin-to-skin if eligible." },
          { icon: "self_improvement", title: "Recovery + bonding", detail: "First feeding attempt within an hour." },
        ],
      },
      p5: {
        summary: "Walk within 12h, no lifting heavier than the baby for 6 weeks, mood screen at week 2.",
        highlights: [
          { icon: "directions_walk", title: "Walk within 12h", detail: "Reduces clot risk, eases gas pain." },
          { icon: "fitness_center", title: "Lift only the baby × 6 weeks", detail: "No carriers, no toddlers." },
          { icon: "psychology", title: "Mood screen at week 2", detail: "Postpartum depression is real. Speak up." },
        ],
      },
    },
  },

  /* ------------------------------- HERNIA REPAIR --------------------------- */
  hernia: {
    tasks: [
      {
        id: "h-lift",
        icon: "do_not_step",
        title: "Pre-position heavy items",
        description: "Nothing over 10 lb for 4 weeks. Move what you'll need now.",
        status: "critical",
      },
      {
        id: "h-binder",
        icon: "settings_accessibility",
        title: "Buy an abdominal binder",
        description: "Supports the repair — wear it for the first 2 weeks.",
        status: "pending",
      },
      {
        id: "h-stool",
        icon: "medication",
        title: "Pick up a stool softener",
        description: "Constipation from anesthesia + opioids is real.",
        status: "pending",
      },
      {
        id: "h-fast",
        icon: "no_food",
        title: "NPO after midnight",
        description: "Sips of water until 2h pre-op.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "h-a1",
        time: "5:30 AM",
        title: "Wake & shower",
        description: "Plain soap. No lotions on the belly.",
        icon: "shower",
      },
      {
        id: "h-a2",
        time: "6:00 AM",
        title: "Arrive at the surgical center",
        description: "Outpatient or 1-night stay depending on size.",
        icon: "local_hospital",
      },
      {
        id: "h-a3",
        time: "6:30 AM",
        title: "Surgical reception",
        description: "ID, insurance card, consent forms.",
        icon: "badge",
      },
      {
        id: "h-a4",
        time: "7:00 AM",
        title: "IV & pre-op meds",
        description: "Antibiotic given pre-incision.",
        icon: "vaccines",
      },
      {
        id: "h-a5",
        time: "7:45 AM",
        title: "{{surgeon}} marks the site",
        description: "Confirms hernia side with you while you're awake.",
        icon: "edit",
      },
      {
        id: "h-a6",
        time: "8:00 AM",
        title: "Laparoscopic repair",
        description: "Three small incisions, mesh placed. ~60 minutes.",
        icon: "schedule",
      },
    ],
    meds: [
      {
        id: "h-m1",
        name: "Cefazolin",
        dosage: "1g IV",
        schedule: "Pre-incision",
        status: "new",
        reason: "Prevents infection around the mesh.",
      },
      {
        id: "h-m2",
        name: "Acetaminophen",
        dosage: "1000mg",
        schedule: "Every 6h × 5 days",
        status: "new",
        reason: "Scheduled pain control reduces opioid need.",
      },
      {
        id: "h-m3",
        name: "Ibuprofen",
        dosage: "400mg",
        schedule: "Every 6h with food × 5 days",
        status: "new",
        reason: "Anti-inflammatory around the mesh site.",
      },
      {
        id: "h-m4",
        name: "Oxycodone",
        dosage: "5mg",
        schedule: "Every 4–6h as needed × 48h",
        status: "new",
        reason: "Breakthrough pain only. Stop ASAP to avoid constipation.",
      },
      {
        id: "h-m5",
        name: "Stool softener",
        dosage: "Docusate 100mg",
        schedule: "Twice daily × 2 weeks",
        status: "new",
        reason: "Straining tears the mesh. Soft is critical.",
      },
    ],
    timeline: {
      p1: {
        summary: "Pre-op imaging confirms hernia size and {{surgeon}} chooses open vs laparoscopic.",
        highlights: [
          { icon: "biotech", title: "Imaging reviewed", detail: "Size + location confirmed by {{surgeon}}." },
          { icon: "monitor_heart", title: "Clearance labs", detail: "CBC + metabolic panel submitted." },
        ],
      },
      p2: {
        summary: "Stop NSAIDs and any blood thinners 7 days pre-op. Stock up on stool softener.",
        highlights: [
          { icon: "block", title: "NSAIDs paused", detail: "Per {{surgeon}}'s plan." },
          { icon: "medication", title: "Stool softener stocked", detail: "Start day one." },
        ],
      },
      p3: {
        summary: "Pre-position heavy items at counter height. NPO after midnight.",
        highlights: [
          { icon: "do_not_step", title: "Counter-height staging", detail: "Nothing over 10 lb on low shelves." },
          { icon: "no_food", title: "NPO after midnight", detail: "Sips of water for meds until 2h pre-op." },
        ],
      },
      p4: {
        summary: "Laparoscopic mesh repair, three small incisions, general anesthesia.",
        highlights: [
          { icon: "local_hospital", title: "Arrive 6:00 AM", detail: "Outpatient center, surgical reception." },
          { icon: "vaccines", title: "Antibiotic pre-incision", detail: "Cefazolin standard." },
          { icon: "schedule", title: "Repair ~60 min", detail: "Mesh placed laparoscopically." },
        ],
      },
      p5: {
        summary: "Walking yes, lifting no. Strict 10-lb limit for 4 weeks.",
        highlights: [
          { icon: "directions_walk", title: "Walk daily from day 1", detail: "Builds back stamina without strain." },
          { icon: "do_not_step", title: "10 lb × 4 weeks", detail: "One violation can tear the mesh." },
          { icon: "warning", title: "Bulge returning? Call", detail: "Possible recurrence — needs review." },
        ],
      },
    },
  },

  /* ------------------------------ APPENDECTOMY ----------------------------- */
  appendectomy: {
    tasks: [
      {
        id: "ap-pillow",
        icon: "spa",
        title: "Grab a small pillow",
        description: "Brace your belly when you cough — pain drops 50%.",
        status: "pending",
      },
      {
        id: "ap-pants",
        icon: "checkroom",
        title: "Loose-waist pants",
        description: "Avoid pressure on the laparoscopic sites.",
        status: "pending",
      },
      {
        id: "ap-stool",
        icon: "medication",
        title: "Pick up stool softener",
        description: "Anesthesia constipates — start day one.",
        status: "pending",
      },
      {
        id: "ap-driver",
        icon: "directions_car",
        title: "Confirm your driver",
        description: "Even outpatient cases need a driver for 24h.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "ap-a1",
        time: "varies",
        title: "ED triage (if emergent)",
        description: "Or scheduled outpatient arrival if it's a planned interval case.",
        icon: "local_hospital",
      },
      {
        id: "ap-a2",
        time: "+30 min",
        title: "IV fluids & labs",
        description: "Antibiotic started right away.",
        icon: "vaccines",
      },
      {
        id: "ap-a3",
        time: "+1 hr",
        title: "CT confirmation",
        description: "Imaging shows the inflamed appendix.",
        icon: "biotech",
      },
      {
        id: "ap-a4",
        time: "+2 hrs",
        title: "Anesthesia consult",
        description: "{{surgeon}} introduces the team and reviews the plan.",
        icon: "groups",
      },
      {
        id: "ap-a5",
        time: "+3 hrs",
        title: "OR — laparoscopic removal",
        description: "Three small incisions. ~30 minutes.",
        icon: "schedule",
      },
      {
        id: "ap-a6",
        time: "+5 hrs",
        title: "Recovery & possible same-day discharge",
        description: "Most go home that night. Some stay one night.",
        icon: "home",
      },
    ],
    meds: [
      {
        id: "ap-m1",
        name: "Cefoxitin",
        dosage: "2g IV",
        schedule: "Pre-incision + post-op × 24h",
        status: "new",
        reason: "Covers gut bacteria — standard for appendicitis.",
      },
      {
        id: "ap-m2",
        name: "Acetaminophen",
        dosage: "1000mg",
        schedule: "Every 6h × 3 days",
        status: "new",
        reason: "Primary pain control after laparoscopic surgery.",
      },
      {
        id: "ap-m3",
        name: "Ibuprofen",
        dosage: "600mg",
        schedule: "Every 6h with food × 5 days",
        status: "new",
        reason: "Anti-inflammatory. Cleared by {{surgeon}} day 1.",
      },
      {
        id: "ap-m4",
        name: "Ondansetron",
        dosage: "4mg",
        schedule: "Every 8h as needed × 24h",
        status: "new",
        reason: "Post-anesthesia nausea is common.",
      },
    ],
    timeline: {
      p1: {
        summary: "If emergent: skip to phase 4. If interval (planned): clearance labs done.",
        highlights: [
          { icon: "monitor_heart", title: "Labs submitted", detail: "CBC, CRP, metabolic panel." },
        ],
      },
      p2: {
        summary: "Stop NSAIDs and blood thinners if scheduled. Stock stool softener.",
        highlights: [
          { icon: "block", title: "NSAIDs paused", detail: "If a planned interval appendectomy." },
        ],
      },
      p3: {
        summary: "Loose pants, pillow for bracing, NPO after midnight.",
        highlights: [
          { icon: "no_food", title: "NPO after midnight", detail: "Sips of water for meds." },
          { icon: "checkroom", title: "Loose pants ready", detail: "No waistband over incisions." },
        ],
      },
      p4: {
        summary: "Laparoscopic appendectomy. ~30 minutes. Often same-day discharge.",
        highlights: [
          { icon: "vaccines", title: "IV antibiotic", detail: "Cefoxitin standard." },
          { icon: "schedule", title: "Procedure ~30 min", detail: "Three small incisions." },
          { icon: "home", title: "Same-day discharge typical", detail: "Some stay one night." },
        ],
      },
      p5: {
        summary: "Gentle walking from day 1, gradual diet, watch for infection signs.",
        highlights: [
          { icon: "directions_walk", title: "Walk short laps day 1", detail: "Reduces gas pain and clot risk." },
          { icon: "restaurant", title: "Advance diet gradually", detail: "Clear → light → regular over 24h." },
          { icon: "warning", title: "Fever > 101°F? Call", detail: "Could mean an infection." },
        ],
      },
    },
  },

  /* ----------------------------- HIP REPLACEMENT --------------------------- */
  hip: {
    tasks: [
      {
        id: "hp-grabber",
        icon: "front_hand",
        title: "Buy a reacher tool",
        description: "You can't bend past 90° for 6 weeks.",
        status: "critical",
      },
      {
        id: "hp-toilet",
        icon: "wc",
        title: "Install a raised toilet seat",
        description: "Standard seats violate hip precautions.",
        status: "critical",
      },
      {
        id: "hp-walker",
        icon: "elderly",
        title: "Pre-fit your walker",
        description: "PT will adjust it day 1, but a good baseline helps.",
        status: "pending",
      },
      {
        id: "hp-rugs",
        icon: "do_not_step",
        title: "Remove throw rugs",
        description: "#1 fall hazard at home. Today, not tomorrow.",
        status: "critical",
      },
    ],
    arrival: [
      {
        id: "hp-a1",
        time: "5:30 AM",
        title: "Wake & CHG shower",
        description: "Final antiseptic wash. Wear loose clothing.",
        icon: "shower",
      },
      {
        id: "hp-a2",
        time: "6:00 AM",
        title: "Arrive at {{hospital}}",
        description: "Joint Surgery wing — same as knee patients.",
        icon: "local_hospital",
      },
      {
        id: "hp-a3",
        time: "6:30 AM",
        title: "Surgical reception",
        description: "ID, insurance, consent — confirm correct hip.",
        icon: "badge",
      },
      {
        id: "hp-a4",
        time: "7:00 AM",
        title: "Spinal or regional anesthesia",
        description: "Most hip patients get a spinal — better for clot prevention.",
        icon: "vaccines",
      },
      {
        id: "hp-a5",
        time: "7:45 AM",
        title: "{{surgeon}} marks the hip",
        description: "Initials on the correct side. Confirm together.",
        icon: "edit",
      },
      {
        id: "hp-a6",
        time: "8:00 AM",
        title: "OR — arthroplasty begins",
        description: "Implant placement ~90–120 min. Family gets updates.",
        icon: "schedule",
      },
    ],
    meds: [
      {
        id: "hp-m1",
        name: "Cefazolin",
        dosage: "2g IV",
        schedule: "Pre-incision",
        status: "new",
        reason: "Implant infection prophylaxis — non-negotiable.",
      },
      {
        id: "hp-m2",
        name: "Aspirin (low-dose)",
        dosage: "81mg",
        schedule: "Twice daily × 4 weeks post-op",
        status: "new",
        reason: "Standard DVT prophylaxis after hip surgery.",
      },
      {
        id: "hp-m3",
        name: "Enoxaparin",
        dosage: "40mg subcutaneous",
        schedule: "Daily × 2 weeks if higher clot risk",
        status: "new",
        reason: "Blood thinner — protects while mobility is limited.",
      },
      {
        id: "hp-m4",
        name: "Acetaminophen",
        dosage: "1000mg",
        schedule: "Every 6h × first week",
        status: "new",
        reason: "Scheduled pain control — opioid-sparing.",
      },
      {
        id: "hp-m5",
        name: "Oxycodone",
        dosage: "5mg",
        schedule: "Every 4–6h as needed",
        status: "new",
        reason: "Breakthrough pain. Taper aggressively after day 3.",
      },
    ],
    timeline: {
      p1: {
        summary: "Pre-op clearance + hip imaging. Home setup begins now, not later.",
        highlights: [
          { icon: "biotech", title: "Hip X-rays done", detail: "Implant size pre-selected by {{surgeon}}." },
          { icon: "home", title: "Home assessment", detail: "PT may visit to flag hazards." },
        ],
      },
      p2: {
        summary: "Home is your rehab center. Raised toilet seat, grab bars, walker by the bed.",
        highlights: [
          { icon: "wc", title: "Raised toilet seat installed", detail: "Standard seat = hip flex past 90°." },
          { icon: "do_not_step", title: "Throw rugs removed", detail: "Falls in the first month re-do everything." },
        ],
      },
      p3: {
        summary: "Walker by the door, ice packs frozen, NPO from midnight.",
        highlights: [
          { icon: "no_food", title: "NPO after midnight", detail: "Sips of water with meds until 2h pre-op." },
          { icon: "elderly", title: "Walker by the door", detail: "Adjusted to your height." },
        ],
      },
      p4: {
        summary: "Spinal anesthesia preferred — lower clot risk than general for hip cases.",
        highlights: [
          { icon: "vaccines", title: "Spinal anesthesia", detail: "Awake or lightly sedated." },
          { icon: "schedule", title: "Procedure 90–120 min", detail: "Implant placement + closure." },
        ],
      },
      p5: {
        summary: "Hip precautions for 6 weeks: no crossing legs, no bending past 90°, no inward rotation.",
        highlights: [
          { icon: "warning", title: "Posterior hip precautions × 6 weeks", detail: "Don't cross legs, don't bend past 90°." },
          { icon: "directions_walk", title: "PT starts day 1", detail: "Walk with walker before discharge." },
          { icon: "videocam", title: "Day 7 + 14 telehealth", detail: "Range of motion + wound check." },
        ],
      },
    },
  },

  /* ------------------------------ TONSILLECTOMY ---------------------------- */
  tonsillectomy: {
    tasks: [
      {
        id: "t-popsicles",
        icon: "icecream",
        title: "Stock popsicles + ice cream",
        description: "Hydration is the only job for 10 days.",
        status: "critical",
      },
      {
        id: "t-humidifier",
        icon: "water_drop",
        title: "Set up a cool-mist humidifier",
        description: "Dry throat = more pain.",
        status: "pending",
      },
      {
        id: "t-tylenol",
        icon: "medication_liquid",
        title: "Stock liquid acetaminophen",
        description: "No aspirin or ibuprofen — they raise bleed risk.",
        status: "critical",
      },
      {
        id: "t-time-off",
        icon: "work_off",
        title: "Block off 2 weeks",
        description: "Adult tonsillectomy is brutal. Pain peaks day 5–7.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "t-a1",
        time: "6:00 AM",
        title: "Wake & shower",
        description: "Normal routine. Empty stomach.",
        icon: "shower",
      },
      {
        id: "t-a2",
        time: "7:00 AM",
        title: "Arrive at the ENT surgical center",
        description: "Outpatient. Bring your driver.",
        icon: "local_hospital",
      },
      {
        id: "t-a3",
        time: "7:15 AM",
        title: "Check in & paperwork",
        description: "ID, insurance, signed consent.",
        icon: "badge",
      },
      {
        id: "t-a4",
        time: "8:00 AM",
        title: "General anesthesia",
        description: "Mask induction. You'll be asleep in seconds.",
        icon: "vaccines",
      },
      {
        id: "t-a5",
        time: "8:30 AM",
        title: "Tonsillectomy",
        description: "{{surgeon}} removes tonsils. ~30 minutes.",
        icon: "schedule",
      },
      {
        id: "t-a6",
        time: "10:00 AM",
        title: "Recovery & home",
        description: "Discharged once you're drinking liquids without choking.",
        icon: "home",
      },
    ],
    meds: [
      {
        id: "t-m1",
        name: "Acetaminophen (liquid)",
        dosage: "650–1000mg",
        schedule: "Every 6h scheduled × 10 days",
        status: "new",
        reason: "Primary pain control. Liquid form is easier to swallow.",
      },
      {
        id: "t-m2",
        name: "Oxycodone (liquid)",
        dosage: "5mg",
        schedule: "Every 4–6h as needed × 5 days",
        status: "new",
        reason: "For breakthrough pain in the first week.",
      },
      {
        id: "t-m3",
        name: "Dexamethasone",
        dosage: "10mg IV",
        schedule: "Intra-op",
        status: "new",
        reason: "Reduces post-op swelling and nausea.",
      },
      {
        id: "t-m4",
        name: "Ondansetron",
        dosage: "4mg",
        schedule: "Every 8h as needed × 24h",
        status: "new",
        reason: "Anti-nausea — vomiting can cause post-op bleeding.",
      },
    ],
    timeline: {
      p1: {
        summary: "ENT confirms the indication — sleep apnea, recurrent infections, or both.",
        highlights: [
          { icon: "biotech", title: "Sleep study reviewed", detail: "If indication is OSA." },
        ],
      },
      p2: {
        summary: "Stop NSAIDs 7 days pre-op. Stock popsicles, broth, and liquid acetaminophen.",
        highlights: [
          { icon: "block", title: "NSAIDs paused × 7 days", detail: "Aspirin, ibuprofen, naproxen — all stop." },
          { icon: "icecream", title: "Soft food haul", detail: "Popsicles, broth, mashed potatoes, ice cream." },
        ],
      },
      p3: {
        summary: "NPO after midnight. Humidifier set up by the bed.",
        highlights: [
          { icon: "no_food", title: "NPO after midnight", detail: "Even water cut off 2h pre-op." },
          { icon: "water_drop", title: "Humidifier ready", detail: "Cool-mist next to the bed." },
        ],
      },
      p4: {
        summary: "Outpatient. General anesthesia. ~30 minute procedure.",
        highlights: [
          { icon: "vaccines", title: "General anesthesia", detail: "Mask induction." },
          { icon: "home", title: "Home once drinking", detail: "Discharge depends on swallow." },
        ],
      },
      p5: {
        summary: "Hydrate every 20 minutes while awake. Pain peaks day 5–7. Bleeding is a 911.",
        highlights: [
          { icon: "water_drop", title: "Drink every 20 min", detail: "Dehydration causes ER returns." },
          { icon: "warning", title: "Any bleeding = 911", detail: "Bright red blood is a surgical emergency." },
          { icon: "schedule", title: "Pain peaks day 5–7", detail: "Stay on scheduled meds, not as-needed." },
        ],
      },
    },
  },

  /* -------------------------- CARPAL TUNNEL RELEASE ------------------------ */
  "carpal-tunnel": {
    tasks: [
      {
        id: "ct-sling",
        icon: "settings_accessibility",
        title: "Buy a wrist sling",
        description: "Keep the hand above the heart for the first week.",
        status: "pending",
      },
      {
        id: "ct-shirts",
        icon: "checkroom",
        title: "Pack button-front shirts",
        description: "No pulling tops over your head with a bandaged hand.",
        status: "pending",
      },
      {
        id: "ct-bag",
        icon: "water_drop",
        title: "Grab plastic bags",
        description: "Keep the dressing dry in the shower.",
        status: "pending",
      },
      {
        id: "ct-driver",
        icon: "directions_car",
        title: "Confirm your driver",
        description: "No driving for ~48h with the dominant hand done.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "ct-a1",
        time: "7:00 AM",
        title: "Wake & shower",
        description: "Normal routine. Light breakfast OK.",
        icon: "shower",
      },
      {
        id: "ct-a2",
        time: "8:00 AM",
        title: "Arrive at the hand center",
        description: "Outpatient. Light food up to 6h prior is fine for local anesthesia.",
        icon: "local_hospital",
      },
      {
        id: "ct-a3",
        time: "8:15 AM",
        title: "Check in & paperwork",
        description: "ID, insurance, signed consent.",
        icon: "badge",
      },
      {
        id: "ct-a4",
        time: "8:45 AM",
        title: "Local anesthesia + light sedation",
        description: "WALANT (wide-awake local) or short MAC — awake or drowsy.",
        icon: "vaccines",
      },
      {
        id: "ct-a5",
        time: "9:00 AM",
        title: "{{surgeon}} releases the ligament",
        description: "~15 minute open or endoscopic procedure.",
        icon: "schedule",
      },
      {
        id: "ct-a6",
        time: "9:30 AM",
        title: "Home in a soft dressing",
        description: "Sling on. Hand above the heart.",
        icon: "home",
      },
    ],
    meds: [
      {
        id: "ct-m1",
        name: "Acetaminophen",
        dosage: "650mg",
        schedule: "Every 6h × 3 days",
        status: "new",
        reason: "Primary pain control. Most patients don't need anything stronger.",
      },
      {
        id: "ct-m2",
        name: "Ibuprofen",
        dosage: "400mg",
        schedule: "Every 6h with food × 5 days",
        status: "new",
        reason: "Anti-inflammatory — reduces swelling that drives pain.",
      },
    ],
    timeline: {
      p1: {
        summary: "Nerve conduction study confirmed median nerve compression.",
        highlights: [
          { icon: "biotech", title: "Nerve study reviewed", detail: "Severity grade noted by {{surgeon}}." },
        ],
      },
      p2: {
        summary: "Stop NSAIDs 5 days pre-op if {{surgeon}} requested. Sling ready.",
        highlights: [
          { icon: "settings_accessibility", title: "Sling ready", detail: "Elevation is the whole game." },
        ],
      },
      p3: {
        summary: "Pack button-front shirts and plastic bags for showering.",
        highlights: [
          { icon: "checkroom", title: "Button shirts packed", detail: "No overhead pulling for a week." },
        ],
      },
      p4: {
        summary: "Outpatient — 15 minute procedure under local + light sedation.",
        highlights: [
          { icon: "vaccines", title: "Local anesthesia", detail: "Awake or lightly sedated." },
          { icon: "schedule", title: "Procedure 15 min", detail: "Soft dressing on after." },
        ],
      },
      p5: {
        summary: "Elevation above the heart for a week. Grip recovers gradually over weeks.",
        highlights: [
          { icon: "front_hand", title: "Elevate above the heart", detail: "Two pillows under the arm at night." },
          { icon: "fitness_center", title: "Grip strength returns slowly", detail: "Weeks for normal use, months for max." },
          { icon: "videocam", title: "Day 10–14 follow-up", detail: "Sutures removed if non-absorbable." },
        ],
      },
    },
  },

  /* --------------------------------- LASIK --------------------------------- */
  lasik: {
    tasks: [
      {
        id: "l-drops",
        icon: "medication_liquid",
        title: "Pick up your drop kit",
        description: "Antibiotic + steroid + artificial tears. Three schedules.",
        status: "critical",
      },
      {
        id: "l-shades",
        icon: "wb_sunny",
        title: "Buy wraparound sunglasses",
        description: "Light sensitivity is real for the first week.",
        status: "pending",
      },
      {
        id: "l-shields",
        icon: "shield",
        title: "Sleep shields ready",
        description: "Provided by the clinic — wear nightly for 3 nights.",
        status: "pending",
      },
      {
        id: "l-driver",
        icon: "directions_car",
        title: "Confirm your driver",
        description: "You will not be driving home. Vision is blurry post-op.",
        status: "critical",
      },
      {
        id: "l-makeup",
        icon: "block",
        title: "No makeup for 2 weeks",
        description: "Pack it away today so you're not tempted.",
        status: "pending",
      },
    ],
    arrival: [
      {
        id: "l-a1",
        time: "8:00 AM",
        title: "Wake — eat normally",
        description: "Topical anesthesia only. No fasting required.",
        icon: "restaurant",
      },
      {
        id: "l-a2",
        time: "9:00 AM",
        title: "Arrive at the LASIK center",
        description: "Bring your sunglasses and your driver.",
        icon: "local_hospital",
      },
      {
        id: "l-a3",
        time: "9:15 AM",
        title: "Final measurements",
        description: "Topography re-done — fine adjustments to the laser plan.",
        icon: "biotech",
      },
      {
        id: "l-a4",
        time: "10:00 AM",
        title: "{{surgeon}} confirms the plan",
        description: "Both eyes, flap-creation order, sedative option.",
        icon: "groups",
      },
      {
        id: "l-a5",
        time: "10:30 AM",
        title: "Surgery — ~10 minutes per eye",
        description: "Awake. Look at the green light. The laser does the rest.",
        icon: "schedule",
      },
      {
        id: "l-a6",
        time: "11:00 AM",
        title: "Home with shields",
        description: "Sleep with the shields. Vision sharpens overnight.",
        icon: "home",
      },
    ],
    meds: [
      {
        id: "l-m1",
        name: "Moxifloxacin (antibiotic drops)",
        dosage: "1 drop",
        schedule: "4× daily × 7 days",
        status: "new",
        reason: "Prevents infection while the corneal flap heals.",
      },
      {
        id: "l-m2",
        name: "Prednisolone (steroid drops)",
        dosage: "1 drop",
        schedule: "4× daily × 7 days, then taper",
        status: "new",
        reason: "Reduces post-op corneal inflammation.",
      },
      {
        id: "l-m3",
        name: "Preservative-free artificial tears",
        dosage: "1–2 drops",
        schedule: "Every 1–2 hours × first week",
        status: "new",
        reason: "Dry eye is the #1 LASIK side effect. Drop liberally.",
      },
      {
        id: "l-m4",
        name: "Acetaminophen",
        dosage: "500mg",
        schedule: "As needed",
        status: "new",
        reason: "Mild irritation only — most don't need pain meds.",
      },
    ],
    timeline: {
      p1: {
        summary: "Topography, pachymetry, and refraction confirm you're a LASIK candidate.",
        highlights: [
          { icon: "biotech", title: "Eye mapping done", detail: "Cornea thickness + curvature recorded." },
          { icon: "remove_red_eye", title: "Refraction stable × 1 year", detail: "Prescription stability confirmed." },
        ],
      },
      p2: {
        summary: "Stop wearing contacts well before surgery — soft 1 week, RGP 3 weeks.",
        highlights: [
          { icon: "block", title: "Contacts paused", detail: "Cornea needs to return to natural shape." },
        ],
      },
      p3: {
        summary: "No fasting. Just drops and a clean face — no makeup or lotion.",
        highlights: [
          { icon: "wb_sunny", title: "Shades packed", detail: "Wraparound style for the first week." },
          { icon: "block", title: "No makeup × 2 weeks", detail: "Risk of debris in the flap." },
        ],
      },
      p4: {
        summary: "Awake, comfortable, ~10 minutes per eye. Topical anesthesia only.",
        highlights: [
          { icon: "remove_red_eye", title: "Topical drops only", detail: "No needles, no IV, no fasting." },
          { icon: "schedule", title: "10 min per eye", detail: "Look at the green light. Done." },
        ],
      },
      p5: {
        summary: "Drops on schedule. Sleep shields × 3 nights. No eye rubbing for a week.",
        highlights: [
          { icon: "shield", title: "Sleep shields × 3 nights", detail: "Prevents rubbing while you sleep." },
          { icon: "water_drop", title: "Drop, drop, drop", detail: "Artificial tears every 1–2h day one." },
          { icon: "warning", title: "Pool / hot tub × 2 weeks", detail: "Bacteria can colonize the flap." },
        ],
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

import {
  arrivalSteps as defaultArrivalSteps,
  medications as defaultMedications,
  phases as defaultPhases,
  phaseDetails as defaultPhaseDetails,
  todayTasks as defaultTasks,
} from "./content";

/** Today's tasks for the procedure, or the generic baseline if no override. */
export function tasksFor(procedureId: string): Task[] {
  return procedureCustomizations[procedureId]?.tasks ?? defaultTasks;
}

/** Day-of arrival steps for the procedure, or the generic baseline. */
export function arrivalStepsFor(procedureId: string): ArrivalStep[] {
  return procedureCustomizations[procedureId]?.arrival ?? defaultArrivalSteps;
}

/** Procedure-typical pre/post-op meds, or the generic baseline. */
export function medsFor(procedureId: string): Medication[] {
  return procedureCustomizations[procedureId]?.meds ?? defaultMedications;
}

/**
 * Returns the timeline phases with this procedure's highlights merged on top
 * of the generic ones. Preserves the original phase ids, ranges, and states.
 */
export function phasesFor(procedureId: string): Phase[] {
  const overrides = procedureCustomizations[procedureId]?.timeline;
  if (!overrides) return defaultPhases;
  return defaultPhases.map((base) => {
    const o = overrides[base.id];
    if (!o?.highlights) return base;
    return { ...base, highlights: o.highlights };
  });
}

/**
 * Returns full phase details with override fields merged on top of the generic
 * version. Used by the timeline phase modal.
 */
export function phaseDetailsFor(
  procedureId: string,
  phaseId: string,
): PhaseDetails | undefined {
  const base = defaultPhaseDetails[phaseId];
  const o = procedureCustomizations[procedureId]?.timeline?.[phaseId];
  if (!o) return base;
  return {
    summary: o.summary ?? base?.summary,
    checklist: o.checklist ?? base?.checklist,
    tips: o.tips ?? base?.tips,
    medications: o.medications ?? base?.medications,
  };
}
