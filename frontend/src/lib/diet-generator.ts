import { PatientData } from './patient-data';
import { FoodItem, KERALA_FOODS } from './food-data';

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

const MEAL_TEMPLATES = [
  { name: 'Breakfast', time: '7:30 AM', grainIds: ['g2', 'g3', 'g4', 'g5', 'g6'], proteinIds: ['p2', 'p6', 'p4'], veggieIds: ['v1', 'v4'], dairyIds: ['d4'] },
  { name: 'Lunch', time: '12:30 PM', grainIds: ['g1', 'g5'], proteinIds: ['p1', 'p3', 'p5', 'p6'], veggieIds: ['v1', 'v2', 'v3', 'v5', 'v6', 'v7', 'v8'], dairyIds: ['d1', 'd2', 'd3'] },
  { name: 'Dinner', time: '7:00 PM', grainIds: ['g1', 'g4', 'g6'], proteinIds: ['p1', 'p3', 'p5', 'p4'], veggieIds: ['v1', 'v2', 'v3', 'v4', 'v6', 'v8'], dairyIds: ['d1', 'd2'] },
];

const foodMap = new Map(KERALA_FOODS.map(f => [f.id, f]));

function pickRandom<T>(arr: T[], count = 1): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildMeal(t: typeof MEAL_TEMPLATES[number], p: PatientData, used: Set<string>): Meal {
  const isSoft = p.postStrokeDysphagia;
  const isLowNa = p.hfNYHA >= 2;
  const grains = t.grainIds.map(id => foodMap.get(id)).filter((f): f is FoodItem => !!f && (!isSoft || f.texture === 'soft') && (!isLowNa || f.isLowSodium) && !used.has(f.id));
  const proteins = t.proteinIds.map(id => foodMap.get(id)).filter((f): f is FoodItem => !!f && (!isSoft || f.texture === 'soft') && !used.has(f.id));
  const veggies = t.veggieIds.map(id => foodMap.get(id)).filter((f): f is FoodItem => !!f && (!isSoft || f.texture === 'soft') && !used.has(f.id));
  const dairy = t.dairyIds.map(id => foodMap.get(id)).filter((f): f is FoodItem => !!f);
  const grain = pickRandom(grains.length ? grains : (t.grainIds.map(id => foodMap.get(id)).filter(Boolean) as FoodItem[]))[0];
  const protein = pickRandom(proteins.length ? proteins : (t.proteinIds.map(id => foodMap.get(id)).filter(Boolean) as FoodItem[]))[0];
  const veg = pickRandom(veggies.length ? veggies : (t.veggieIds.map(id => foodMap.get(id)).filter(Boolean) as FoodItem[]), 2);
  const drink = pickRandom(dairy, 1)[0];
  if (grain) used.add(grain.id);
  if (protein) used.add(protein.id);
  const foods: { food: FoodItem; servings: number }[] = [];
  if (grain) foods.push({ food: grain, servings: 1 });
  if (protein) foods.push({ food: protein, servings: 1 });
  veg.forEach(v => foods.push({ food: v, servings: 1 }));
  if (drink) foods.push({ food: drink, servings: 1 });
  return {
    name: t.name, time: t.time, foods,
    totalCalories: foods.reduce((s, f) => s + f.food.calories, 0),
    totalCarbs: foods.reduce((s, f) => s + f.food.carbsG, 0),
    totalProtein: foods.reduce((s, f) => s + f.food.proteinG, 0),
    totalSodium: foods.reduce((s, f) => s + f.food.sodiumMg, 0),
  };
}

export function generate7DayPlan(p: PatientData): DayPlan[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const snackFoods = KERALA_FOODS.filter(f => (f.category === 'fruits' || f.id === 'p7' || f.id === 'd1') && (!p.postStrokeDysphagia || f.texture === 'soft'));
  return days.map(day => {
    const used = new Set<string>();
    const meals = MEAL_TEMPLATES.map(t => buildMeal(t, p, used));
    const snacks = pickRandom(snackFoods, 2).map(f => ({ food: f, servings: 1 }));
    return {
      day, meals,
      totalCalories: meals.reduce((s, m) => s + m.totalCalories, 0) + snacks.reduce((s, sn) => s + sn.food.calories, 0),
      totalCarbs: meals.reduce((s, m) => s + m.totalCarbs, 0) + snacks.reduce((s, sn) => s + sn.food.carbsG, 0),
      totalProtein: meals.reduce((s, m) => s + m.totalProtein, 0) + snacks.reduce((s, sn) => s + sn.food.proteinG, 0),
      snacks,
    };
  });
}
