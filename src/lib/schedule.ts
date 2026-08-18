import { Match } from "./types";

/**
 * The official 28-match schedule for دوري الكابتن سعيد المسند (September
 * 2026): 20 group-stage matches (round-robin, groups A and B) followed by
 * quarter-finals, semi-finals, 3rd place, and the final. Rest days are not
 * represented — only actual matches get an entry.
 */
export const DEFAULT_MATCHES: Match[] = [
  // Group stage - Group A
  { id: "m1", number: 1, home: "A1", away: "A2", day: 1, time: "6:00 PM", stage: "المجموعة الأولى" },
  { id: "m2", number: 2, home: "A3", away: "A4", day: 1, time: "7:00 PM", stage: "المجموعة الأولى" },
  // Group stage - Group B
  { id: "m3", number: 3, home: "B1", away: "B2", day: 2, time: "6:00 PM", stage: "المجموعة الثانية" },
  { id: "m4", number: 4, home: "B3", away: "B4", day: 2, time: "7:00 PM", stage: "المجموعة الثانية" },

  { id: "m5", number: 5, home: "A1", away: "A5", day: 5, time: "5:00 PM", stage: "المجموعة الأولى" },
  { id: "m6", number: 6, home: "A2", away: "A3", day: 5, time: "6:00 PM", stage: "المجموعة الأولى" },
  { id: "m7", number: 7, home: "B1", away: "B5", day: 5, time: "7:00 PM", stage: "المجموعة الثانية" },
  { id: "m8", number: 8, home: "B2", away: "B3", day: 5, time: "8:00 PM", stage: "المجموعة الثانية" },

  // Group B plays first on the 7th
  { id: "m9", number: 9, home: "B4", away: "B5", day: 7, time: "5:00 PM", stage: "المجموعة الثانية" },
  { id: "m10", number: 10, home: "B1", away: "B3", day: 7, time: "6:00 PM", stage: "المجموعة الثانية" },
  { id: "m11", number: 11, home: "A4", away: "A5", day: 7, time: "7:00 PM", stage: "المجموعة الأولى" },
  { id: "m12", number: 12, home: "A1", away: "A3", day: 7, time: "8:00 PM", stage: "المجموعة الأولى" },

  { id: "m13", number: 13, home: "A2", away: "A4", day: 9, time: "5:00 PM", stage: "المجموعة الأولى" },
  { id: "m14", number: 14, home: "A3", away: "A5", day: 9, time: "6:00 PM", stage: "المجموعة الأولى" },
  { id: "m15", number: 15, home: "B2", away: "B4", day: 9, time: "7:00 PM", stage: "المجموعة الثانية" },
  { id: "m16", number: 16, home: "B3", away: "B5", day: 9, time: "8:00 PM", stage: "المجموعة الثانية" },

  // Group B plays first on the 12th
  { id: "m17", number: 17, home: "B1", away: "B4", day: 12, time: "5:00 PM", stage: "المجموعة الثانية" },
  { id: "m18", number: 18, home: "B2", away: "B5", day: 12, time: "6:00 PM", stage: "المجموعة الثانية" },
  { id: "m19", number: 19, home: "A1", away: "A4", day: 12, time: "7:00 PM", stage: "المجموعة الأولى" },
  { id: "m20", number: 20, home: "A2", away: "A5", day: 12, time: "8:00 PM", stage: "المجموعة الأولى" },

  // Quarter-finals
  { id: "m21", number: 21, home: "أول المجموعة الأولى", away: "رابع المجموعة الثانية", day: 14, time: "5:00 PM", stage: "ربع النهائي" },
  { id: "m22", number: 22, home: "ثاني المجموعة الأولى", away: "ثالث المجموعة الثانية", day: 14, time: "6:00 PM", stage: "ربع النهائي" },
  { id: "m23", number: 23, home: "أول المجموعة الثانية", away: "رابع المجموعة الأولى", day: 14, time: "7:00 PM", stage: "ربع النهائي" },
  { id: "m24", number: 24, home: "ثاني المجموعة الثانية", away: "ثالث المجموعة الأولى", day: 14, time: "8:00 PM", stage: "ربع النهائي" },

  // Semi-finals
  { id: "m25", number: 25, home: "فائز المباراة 21", away: "فائز المباراة 24", day: 16, time: "6:00 PM", stage: "نصف النهائي" },
  { id: "m26", number: 26, home: "فائز المباراة 22", away: "فائز المباراة 23", day: 16, time: "7:00 PM", stage: "نصف النهائي" },

  // Finals day
  { id: "m27", number: 27, home: "مباراة المركز الثالث والرابع", away: "", day: 18, time: "6:00 PM", stage: "النهائيات" },
  { id: "m28", number: 28, home: "المباراة النهائية", away: "", day: 18, time: "7:00 PM", stage: "النهائيات" },
];
