import { PatientData } from "./patient-data";
import { FoodItem, KERALA_FOODS, getSoftFoods, getLowSodiumFoods } from "./food-data";

export interface Meal {
  name: string;
  time: string;
  foods: { food: FoodItem; servings: number }[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalSodium: number;
}

export interface DayPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  snacks: { food: FoodItem; servings: number }[];
}

const MEAL_TEMPLATES: { name: string; time: string; grainIds: string[]; proteinIds: string[]; veggieIds: string[]; dairyIds: string[] }[] = [
  { name: "Breakfast", time: "7:30 AM", grainIds: ["g2", "g3", "g4", "g5", "g6"], proteinIds: ["p2", "p6", "p4"], veggieIds: ["v1", "v4"], dairyIds: ["d4"] },
  { name: "Lunch", time: "12:30 PM", grainIds: ["g1", "g5"], proteinIds: ["p1", "p3", "p5", "p6"], veggieIds: ["v1", "v2", "v3", "v5", "v6", "v7", "v8"], dairyIds: ["d1", "d2", "d3"] },
  { name: "Dinner", time: "7:00 PM", grainIds: ["g1", "g4", "g6"], proteinIds: ["p1", "p3", "p5", "p4"], veggieIds: ["v1", "v2", "v3", "v4", "v6", "v8"], dairyIds: ["d1", "d2"] },
];

const foodMap = new Map(KERALA_FOODS.map(f => [f.id, f]));

function pickRandom<T>(arr: T[], count: number = 1): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildMeal(
  template: typeof MEAL_TEMPLATES[0],
  patient: PatientData,
  usedIds: Set<string>
): Meal {
  const isSoft = patient.postStrokeDysphagia;
  const isLowNa = patient.hfNYHA >= 2;
  const targetCarbs = template.name === "Breakfast" ? 30 : 35;

  const availableGrains = template.grainIds
    .map(id => foodMap.get(id))
    .filter((f): f is FoodItem => !!f && (!isSoft || f.texture === "soft") && (!isLowNa || f.isLowSodium) && !usedIds.has(f.id));

  const availableProteins = template.proteinIds
    .map(id => foodMap.get(id))
    .filter((f): f is FoodItem => !!f && (!isSoft || f.texture === "soft") && !usedIds.has(f.id));

  const availableVeggies = template.veggieIds
    .map(id => foodMap.get(id))
    .filter((f): f is FoodItem => !!f && (!isSoft || f.texture === "soft") && !usedIds.has(f.id));

  const availableDairy = template.dairyIds
    .map(id => foodMap.get(id))
    .filter((f): f is FoodItem => !!f);

  const grain = pickRandom(availableGrains.length ? availableGrains : template.grainIds.map(id => foodMap.get(id)).filter(Boolean) as FoodItem[])[0];
  const protein = pickRandom(availableProteins.length ? availableProteins : template.proteinIds.map(id => foodMap.get(id)).filter(Boolean) as FoodItem[])[0];
  const veggies = pickRandom(availableVeggies.length ? availableVeggies : template.veggieIds.map(id => foodMap.get(id)).filter(Boolean) as FoodItem[], 2);
  const dairy = pickRandom(availableDairy, 1)[0];

  if (grain) usedIds.add(grain.id);
  if (protein) usedIds.add(protein.id);

  const foods: { food: FoodItem; servings: number }[] = [];
  if (grain) foods.push({ food: grain, servings: 1 });
  if (protein) foods.push({ food: protein, servings: 1 });
  veggies.forEach(v => foods.push({ food: v, servings: 1 }));
  if (dairy) foods.push({ food: dairy, servings: 1 });

  const totalCalories = foods.reduce((s, f) => s + f.food.calories * f.servings, 0);
  const totalCarbs = foods.reduce((s, f) => s + f.food.carbsG * f.servings, 0);
  const totalProtein = foods.reduce((s, f) => s + f.food.proteinG * f.servings, 0);
  const totalSodium = foods.reduce((s, f) => s + f.food.sodiumMg * f.servings, 0);

  return { name: template.name, time: template.time, foods, totalCalories, totalCarbs, totalProtein, totalSodium };
}

export function generate7DayPlan(patient: PatientData): DayPlan[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const snackFoods = KERALA_FOODS.filter(f => 
    (f.category === "fruits" || f.id === "p7" || f.id === "d1") &&
    (!patient.postStrokeDysphagia || f.texture === "soft")
  );

  return days.map(day => {
    const usedIds = new Set<string>();
    const meals = MEAL_TEMPLATES.map(t => buildMeal(t, patient, usedIds));
    const snacks = pickRandom(snackFoods, 2).map(f => ({ food: f, servings: 1 }));

    const totalCalories = meals.reduce((s, m) => s + m.totalCalories, 0) + snacks.reduce((s, sn) => s + sn.food.calories, 0);
    const totalCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0) + snacks.reduce((s, sn) => s + sn.food.carbsG, 0);
    const totalProtein = meals.reduce((s, m) => s + m.totalProtein, 0) + snacks.reduce((s, sn) => s + sn.food.proteinG, 0);

    return { day, meals, totalCalories, totalCarbs, totalProtein, snacks };
  });
}
