export const EMERGENCY_TYPES = [
  {
    id: "medical",
    label: "Medical Emergency",
    desc: "Sudden illness, severe pain, unconsciousness",
    icon: "Siren",
  },
  {
    id: "accident",
    label: "Accident / Trauma",
    desc: "Road accident, fall, major injury, bleeding",
    icon: "CarFront",
  },
  {
    id: "unconscious",
    label: "Unconscious Person",
    desc: "Not responding, fainted, unconscious",
    icon: "BedDouble",
  },
  {
    id: "breathing",
    label: "Breathing Difficulty",
    desc: "Trouble breathing, chest pain, asthma",
    icon: "Wind",
  },
  {
    id: "chest_pain",
    label: "Chest Pain",
    desc: "Heart-related emergency, severe chest discomfort",
    icon: "HeartPulse",
  },
  {
    id: "other",
    label: "Other Emergency",
    desc: "Any other medical emergency",
    icon: "MoreHorizontal",
  },
];

export const PATIENT_CONDITIONS = [
  { id: "conscious", label: "Conscious", icon: "UserCheck" },
  { id: "semi_conscious", label: "Semi-conscious", icon: "UserMinus" },
  { id: "unconscious", label: "Unconscious", icon: "UserX" },
];

export const SEVERITY_LEVELS = [
  { id: "mild", label: "Mild", color: "rq-success" },
  { id: "moderate", label: "Moderate", color: "rq-warning" },
  { id: "severe", label: "Severe", color: "orange-500" },
  { id: "life_threatening", label: "Life-threatening", color: "rq-red" },
];

export const SYMPTOMS = [
  { id: "chest_pain", label: "Chest Pain", icon: "HeartPulse" },
  { id: "breathing_difficulty", label: "Breathing Difficulty", icon: "Wind" },
  { id: "bleeding", label: "Bleeding", icon: "Droplet" },
  { id: "high_fever", label: "High Fever", icon: "Thermometer" },
  { id: "seizure", label: "Seizure", icon: "Brain" },
  { id: "unconsciousness", label: "Unconsciousness", icon: "BedDouble" },
  { id: "other", label: "Other", icon: "MoreHorizontal" },
];

export function emergencyTypeById(id) {
  return EMERGENCY_TYPES.find((t) => t.id === id);
}