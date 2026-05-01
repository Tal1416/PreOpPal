/**
 * Replace `{{surgeon}}`, `{{hospital}}`, `{{procedure}}`, `{{firstName}}` tokens
 * in static copy with values from the patient profile so every page reflects
 * what the user entered on the Me / Profile screen.
 */
export function personalize(
  text: string,
  ctx: {
    firstName?: string;
    procedure?: string;
    surgeon?: string;
    hospitalName?: string;
  }
): string {
  return text
    .replace(/\{\{firstName\}\}/g, ctx.firstName?.trim() || "you")
    .replace(/\{\{procedure\}\}/g, ctx.procedure?.trim() || "your procedure")
    .replace(/\{\{surgeon\}\}/g, ctx.surgeon?.trim() || "your surgeon")
    .replace(/\{\{hospital\}\}/g, ctx.hospitalName?.trim() || "your hospital");
}

export type Task = {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: "pending" | "done" | "critical";
};

export const todayTasks: Task[] = [
  {
    id: "ibu",
    icon: "medication",
    title: "Stop Ibuprofen",
    description: "Required 7 days before procedure to reduce bleeding risk.",
    status: "critical",
  },
  {
    id: "consent",
    icon: "description",
    title: "Sign Consent Forms",
    description: "Review the digital documents in your portal.",
    status: "done",
  },
  {
    id: "bag",
    icon: "work",
    title: "Pack Recovery Bag",
    description: "See the recommended packing list for your procedure.",
    status: "pending",
  },
  {
    id: "fast",
    icon: "no_food",
    title: "Begin Fasting Protocol",
    description: "No solid food after 10pm the night before.",
    status: "pending",
  },
  {
    id: "ride",
    icon: "directions_car",
    title: "Confirm Ride Home",
    description: "A driver is required after anesthesia.",
    status: "pending",
  },
];

export type Phase = {
  id: string;
  label: string;
  title: string;
  range: string;
  progress: number;
  state: "complete" | "current" | "upcoming";
  highlights: { icon: string; title: string; detail: string }[];
};

export const phases: Phase[] = [
  {
    id: "p1",
    label: "Phase 1",
    title: "Weeks Before",
    range: "T-30 → T-8",
    progress: 1,
    state: "complete",
    highlights: [
      {
        icon: "favorite",
        title: "Pre-op cardio clearance",
        detail: "EKG and bloodwork submitted to {{surgeon}}.",
      },
      {
        icon: "monitor_heart",
        title: "Baseline vitals captured",
        detail: "Resting HR 64 bpm. BP 118/76.",
      },
    ],
  },
  {
    id: "p2",
    label: "Phase 2",
    title: "3 Days Before",
    range: "T-7 → T-3",
    progress: 0.45,
    state: "current",
    highlights: [
      {
        icon: "medication",
        title: "Stop NSAIDs",
        detail: "Ibuprofen, naproxen, aspirin pause.",
      },
      {
        icon: "shower",
        title: "CHG antiseptic shower",
        detail: "Begin nightly cleansing protocol.",
      },
      {
        icon: "spa",
        title: "Daily breath work",
        detail: "Five minutes of paced breathing.",
      },
    ],
  },
  {
    id: "p3",
    label: "Phase 3",
    title: "Day Before",
    range: "T-1",
    progress: 0,
    state: "upcoming",
    highlights: [
      {
        icon: "no_food",
        title: "Begin NPO fasting",
        detail: "Clear liquids only after noon.",
      },
      {
        icon: "checklist",
        title: "Pack hospital bag",
        detail: "ID, meds list, comfort items.",
      },
    ],
  },
  {
    id: "p4",
    label: "Phase 4",
    title: "Surgery Day",
    range: "T-0",
    progress: 0,
    state: "upcoming",
    highlights: [
      {
        icon: "local_hospital",
        title: "Arrive at 6:00 AM",
        detail: "{{hospital}} — Building B, Floor 3.",
      },
      {
        icon: "groups",
        title: "Care team briefing",
        detail: "{{surgeon}} and anesthesia will visit.",
      },
    ],
  },
  {
    id: "p5",
    label: "Phase 5",
    title: "Recovery",
    range: "T+1 → T+30",
    progress: 0,
    state: "upcoming",
    highlights: [
      {
        icon: "healing",
        title: "Physical therapy",
        detail: "Begins 24h post-op.",
      },
      {
        icon: "videocam",
        title: "Telehealth follow-up",
        detail: "Day 3, 7, and 14 check-ins.",
      },
    ],
  },
];

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  status: "stop" | "continue" | "new";
  reason: string;
  daysLeft?: number;
};

export const medications: Medication[] = [
  {
    id: "m1",
    name: "Ibuprofen",
    dosage: "200mg",
    schedule: "As needed",
    status: "stop",
    reason: "Increases bleeding risk during surgery.",
    daysLeft: 0,
  },
  {
    id: "m2",
    name: "Aspirin",
    dosage: "81mg",
    schedule: "Daily morning",
    status: "stop",
    reason: "Pause 7 days prior. Resume per {{surgeon}}.",
    daysLeft: 0,
  },
  {
    id: "m3",
    name: "Lisinopril",
    dosage: "10mg",
    schedule: "Daily morning",
    status: "continue",
    reason: "Take with sip of water on surgery morning.",
  },
  {
    id: "m4",
    name: "Atorvastatin",
    dosage: "20mg",
    schedule: "Nightly",
    status: "continue",
    reason: "Continue without interruption.",
  },
  {
    id: "m5",
    name: "Cefazolin",
    dosage: "1g IV",
    schedule: "Pre-incision",
    status: "new",
    reason: "Prophylactic antibiotic given by anesthesia.",
  },
  {
    id: "m6",
    name: "Acetaminophen",
    dosage: "650mg",
    schedule: "Every 6h post-op",
    status: "new",
    reason: "Primary post-op pain control.",
  },
];

export type BagCategory = {
  id: string;
  title: string;
  icon: string;
  items: { id: string; label: string; checked: boolean }[];
};

export const bagCategories: BagCategory[] = [
  {
    id: "docs",
    title: "Documents",
    icon: "badge",
    items: [
      { id: "id", label: "Photo ID and insurance card", checked: true },
      { id: "advance", label: "Advance directive copy", checked: true },
      { id: "meds-list", label: "Current medication list", checked: false },
    ],
  },
  {
    id: "comfort",
    title: "Comfort",
    icon: "self_care",
    items: [
      { id: "robe", label: "Loose-fitting robe", checked: true },
      { id: "slippers", label: "Non-slip slippers", checked: false },
      { id: "pillow", label: "Travel pillow", checked: false },
      { id: "headphones", label: "Headphones + playlist", checked: true },
    ],
  },
  {
    id: "hygiene",
    title: "Hygiene",
    icon: "shower",
    items: [
      { id: "tooth", label: "Toothbrush + paste", checked: false },
      { id: "deo", label: "Unscented deodorant", checked: false },
      { id: "lipbalm", label: "Lip balm", checked: true },
    ],
  },
  {
    id: "tech",
    title: "Tech",
    icon: "devices",
    items: [
      { id: "phone", label: "Phone + long charger cable", checked: true },
      { id: "ebook", label: "E-reader or book", checked: false },
    ],
  },
];

export type CareMember = {
  id: string;
  name: string;
  role: string;
  online: boolean;
  avatar: string;
};

export const careTeam: CareMember[] = [
  {
    id: "c1",
    name: "Dr. Sarah Chen",
    role: "Lead Surgeon",
    online: true,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDR_5eGY_OHj6N-CzYMDjHtffYfZazgC8wXmpYvjq_bclNBvwV9E-HC26habgFwN5ykBz1s8VmKzty5OaVVIwVRkzxS4TvSbatv-eipiQhW-iEoDDVXcUCfsD6HLckvwj8udHnQiLewAt8-X1vQLKuVLgLhsT-P3L6NSQenC5uvPH4DUi_9JhKhu7TlzAGZlRBpSucB8FOwl1dNrte0CvjK_uNrB8tNLapvCvcCCmaAoCSJS04W9-BjUVN04OC8l5n2WtV6lbMDBLM",
  },
  {
    id: "c2",
    name: "Mark Wilson, RN",
    role: "Pre-Op Specialist",
    online: true,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfBCI157jlfZ6i3iVRTSE_OnUNEHoFAakuLPhMHKgrbmqoeqxyDMnGN3d8-gh4qNcbAY56w2w7A4nt6aeB_uKRIKwQkDY5wihpZgCFIR27D-K5y6XoKU5F2a8ZPvOOUc9uBYvpWa_kVnpIAYdMPImz1Ifvso_-vexdMg5KF2Nj6elJO3oDKlq5HYbH1WR7-F1r7rlooQb67jac3xfvA3IQJHVjOXsYhP1tMp5sTTY0uFU8RqJLkif-7gLqlh2biGcVHipC1cyMLSs",
  },
  {
    id: "c3",
    name: "Nurse Amelia",
    role: "Care Coordinator",
    online: true,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDAqjCCJIaT4kTqQ0yo82X7M2HPBtEsrhFUoq9yLhjrGFwUzcFOzYq1dnIxMkJYNFTG2Qj5Yb9o7nHdrJUa8ILO2JN0hg0z4OFgATaQreaNbGB5fvxn65HII_Wr6HmAwmgLqprGAalMgPJ5ePeFrDYfBX1ICD7ylNrxm4m1XSb6NAoJurG03Sf39VQPdE67DhFPHE_MLrSqLD6Z868MScRuxIcxo9n_lATo3yRRa7LLvMWYVpsB9DK7l9EnWvnRCXiynggh4xwoFBc",
  },
  {
    id: "c4",
    name: "Dr. Patel",
    role: "Anesthesiologist",
    online: false,
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCT9KWDtyUTOI9pgs-NOuWoB1C_aLYaONH-99x36uS0bpJ1zYIX11xfqM7OF5X9HgeiBiYJA0cT_XilmeJzX9d1n0BDJO_bBkxZm9pKu6tHYTnJ6QxG_4bUDnOUl9KRLaVWO2zc5quxNMIE1dRuXIIWBQLDoRooYpnvKGLQkIuaZ9xwjdrUAi3vV-L-3rKf2_8c5Dpd-dOyPS7dr4Pmybuhu-Et_M3J-BhpP2wOUb4PQz3d90CJrOuOGhW7T6a9m9DalLWHemZk8sU",
  },
];

export type ChatMessage = {
  id: string;
  from: "user" | "nurse";
  text: string;
  time: string;
};

export const chatSeed: ChatMessage[] = [
  {
    id: "1",
    from: "nurse",
    text: "Hi Alex — I'm Nurse Amelia. I'll be your point of contact this week. How are you feeling?",
    time: "9:02 AM",
  },
  {
    id: "2",
    from: "user",
    text: "A little nervous, honestly. Is the breathing exercise enough?",
    time: "9:04 AM",
  },
  {
    id: "3",
    from: "nurse",
    text: "Completely normal. The Calm Space orb on your dashboard works really well — try the 4-4 pattern twice a day. I'll check in tomorrow.",
    time: "9:05 AM",
  },
];

export type ArrivalStep = {
  id: string;
  time: string;
  title: string;
  description: string;
  icon: string;
};

export const arrivalSteps: ArrivalStep[] = [
  {
    id: "a1",
    time: "5:30 AM",
    title: "Wake & shower",
    description:
      "Use the CHG antiseptic wash. Skip lotions, deodorant, and makeup.",
    icon: "shower",
  },
  {
    id: "a2",
    time: "6:00 AM",
    title: "Arrive at {{hospital}}",
    description: "Main entrance, Building B. Valet parking is complimentary.",
    icon: "local_hospital",
  },
  {
    id: "a3",
    time: "6:15 AM",
    title: "Check in at Surgical Reception",
    description: "Floor 3. Show your ID and insurance card. Bring your phone.",
    icon: "badge",
  },
  {
    id: "a4",
    time: "6:45 AM",
    title: "Pre-op suite",
    description:
      "Change into a gown. IV placement and final vitals. Family can join.",
    icon: "bed",
  },
  {
    id: "a5",
    time: "7:30 AM",
    title: "Meet your care team",
    description:
      "{{surgeon}} will mark the surgical site. Anesthesia confirms the plan.",
    icon: "groups",
  },
  {
    id: "a6",
    time: "8:00 AM",
    title: "Surgery begins",
    description:
      "Procedure duration is approximately 90 minutes. Family will receive updates.",
    icon: "schedule",
  },
];

export type Feature = {
  icon: string;
  title: string;
  description: string;
  accent: string;
};

export const features: Feature[] = [
  {
    icon: "spa",
    title: "Calm by design",
    description:
      "A breathing orb, paced rituals, and ambient gradients — engineered to lower your pre-op pulse.",
    accent: "from-[#88d1e5] to-[#2a7a8c]",
  },
  {
    icon: "checklist",
    title: "Personal readiness score",
    description:
      "Every task, every medication, every confirmation — quietly tracked into one number you can trust.",
    accent: "from-[#b0ecfe] to-[#006172]",
  },
  {
    icon: "chat",
    title: "Your care team, on tap",
    description:
      "Surgeons, nurses, and anesthesia — one tap away. No phone trees, no waiting on hold.",
    accent: "from-[#acedff] to-[#276676]",
  },
  {
    icon: "timeline",
    title: "Phase-aware timeline",
    description:
      "From T-30 to T+30, the right instruction at the right time. Nothing surfaced too early.",
    accent: "from-[#94d0e1] to-[#0a6879]",
  },
];
