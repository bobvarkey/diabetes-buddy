export interface FoodItem {
  id: string;
  name: string;
  nameLocal?: string;
  serving: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  fiberG: number;
  sodiumMg: number;
  category: FoodCategory;
  texture: 'regular' | 'soft' | 'pureed';
  isLowSodium: boolean;
  glycemicIndex: 'low' | 'medium' | 'high';
}

export type FoodCategory = 'veggies' | 'fruits' | 'proteins' | 'grains' | 'dairy';

export const FOOD_CATEGORIES: { key: FoodCategory; label: string; icon: string }[] = [
  { key: 'veggies', label: 'Non-Starchy Veggies', icon: '🥬' },
  { key: 'fruits', label: 'Fruits (15g carb)', icon: '🍈' },
  { key: 'proteins', label: 'Proteins', icon: '🐟' },
  { key: 'grains', label: 'Grains (¼ plate)', icon: '🍚' },
  { key: 'dairy', label: 'Dairy', icon: '🥛' },
];

export const KERALA_FOODS: FoodItem[] = [
  // VEGGIES
  { id: 'v1', name: 'Cabbage Thoran', nameLocal: 'Muttakose Thoran', serving: '200g (½ plate)', calories: 90, carbsG: 10, proteinG: 4, fatG: 5, fiberG: 5, sodiumMg: 45, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v2', name: 'Beans Mezhukupuratti', nameLocal: 'Payar Mezhukupuratti', serving: '150g', calories: 85, carbsG: 12, proteinG: 3, fatG: 4, fiberG: 4, sodiumMg: 35, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v3', name: 'Okra Stir-fry', nameLocal: 'Vendakka Mezhukupuratti', serving: '150g', calories: 75, carbsG: 8, proteinG: 3, fatG: 4, fiberG: 5, sodiumMg: 30, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v4', name: 'Spinach Thoran', nameLocal: 'Cheera Thoran', serving: '150g', calories: 70, carbsG: 6, proteinG: 4, fatG: 4, fiberG: 4, sodiumMg: 50, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v5', name: 'Snake Gourd Curry', nameLocal: 'Padavalanga Thoran', serving: '150g', calories: 65, carbsG: 7, proteinG: 2, fatG: 4, fiberG: 3, sodiumMg: 25, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v6', name: 'Ash Gourd Curry', nameLocal: 'Kumbalanga Curry', serving: '150g', calories: 55, carbsG: 8, proteinG: 1, fatG: 3, fiberG: 2, sodiumMg: 20, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v7', name: 'Bitter Gourd Stir-fry', nameLocal: 'Pavakka Mezhukupuratti', serving: '100g', calories: 45, carbsG: 5, proteinG: 2, fatG: 3, fiberG: 3, sodiumMg: 15, category: 'veggies', texture: 'regular', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'v8', name: 'Drumstick Sambar Veggies', nameLocal: 'Muringakka', serving: '100g', calories: 60, carbsG: 8, proteinG: 3, fatG: 2, fiberG: 4, sodiumMg: 40, category: 'veggies', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  // FRUITS
  { id: 'f1', name: 'Guava', nameLocal: 'Perakka', serving: '55g (1 small)', calories: 37, carbsG: 14, proteinG: 1, fatG: 0.5, fiberG: 3, sodiumMg: 1, category: 'fruits', texture: 'regular', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'f2', name: 'Papaya', nameLocal: 'Pappaya', serving: '140g (1 cup diced)', calories: 55, carbsG: 15, proteinG: 0.5, fatG: 0, fiberG: 2.5, sodiumMg: 4, category: 'fruits', texture: 'soft', isLowSodium: true, glycemicIndex: 'medium' },
  { id: 'f3', name: 'Sweet Lime', nameLocal: 'Mosambi', serving: '120g (1 medium)', calories: 50, carbsG: 15, proteinG: 0.5, fatG: 0, fiberG: 1, sodiumMg: 2, category: 'fruits', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'f4', name: 'Jamun', nameLocal: 'Njaval Pazham', serving: '100g', calories: 60, carbsG: 14, proteinG: 0.7, fatG: 0.2, fiberG: 1, sodiumMg: 14, category: 'fruits', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'f5', name: 'Amla (Indian Gooseberry)', nameLocal: 'Nellika', serving: '50g (2 pcs)', calories: 25, carbsG: 6, proteinG: 0.5, fatG: 0, fiberG: 2, sodiumMg: 1, category: 'fruits', texture: 'regular', isLowSodium: true, glycemicIndex: 'low' },
  // PROTEINS
  { id: 'p1', name: 'Sardine Moilee', nameLocal: 'Mathi Moilee', serving: '100g (2 pcs)', calories: 200, carbsG: 3, proteinG: 25, fatG: 10, fiberG: 0, sodiumMg: 150, category: 'proteins', texture: 'soft', isLowSodium: false, glycemicIndex: 'low' },
  { id: 'p2', name: 'Egg White Omelette', serving: '3 whites', calories: 50, carbsG: 0, proteinG: 11, fatG: 0, fiberG: 0, sodiumMg: 165, category: 'proteins', texture: 'soft', isLowSodium: false, glycemicIndex: 'low' },
  { id: 'p3', name: 'Chicken Stew', nameLocal: 'Kozhi Stew', serving: '150g', calories: 220, carbsG: 5, proteinG: 28, fatG: 10, fiberG: 1, sodiumMg: 200, category: 'proteins', texture: 'soft', isLowSodium: false, glycemicIndex: 'low' },
  { id: 'p4', name: 'Low-fat Paneer', nameLocal: 'Paneer', serving: '75g', calories: 140, carbsG: 2, proteinG: 14, fatG: 8, fiberG: 0, sodiumMg: 20, category: 'proteins', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'p5', name: 'Fish Curry (Pomfret)', nameLocal: 'Meen Curry', serving: '100g', calories: 180, carbsG: 4, proteinG: 22, fatG: 8, fiberG: 0, sodiumMg: 180, category: 'proteins', texture: 'soft', isLowSodium: false, glycemicIndex: 'low' },
  { id: 'p6', name: 'Dal Curry', nameLocal: 'Parippu Curry', serving: '100g', calories: 120, carbsG: 15, proteinG: 8, fatG: 3, fiberG: 4, sodiumMg: 40, category: 'proteins', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'p7', name: 'Almonds (snack)', nameLocal: 'Badam', serving: '15g (10 pcs)', calories: 87, carbsG: 3, proteinG: 3, fatG: 7.5, fiberG: 1.8, sodiumMg: 0, category: 'proteins', texture: 'regular', isLowSodium: true, glycemicIndex: 'low' },
  // GRAINS
  { id: 'g1', name: 'Matta Rice (Red)', nameLocal: 'Kuthari Choru', serving: '½ cup cooked (100g)', calories: 150, carbsG: 30, proteinG: 3, fatG: 1, fiberG: 2, sodiumMg: 5, category: 'grains', texture: 'soft', isLowSodium: true, glycemicIndex: 'medium' },
  { id: 'g2', name: 'Appam', nameLocal: 'Appam', serving: '1 piece', calories: 120, carbsG: 22, proteinG: 2, fatG: 3, fiberG: 0.5, sodiumMg: 10, category: 'grains', texture: 'soft', isLowSodium: true, glycemicIndex: 'high' },
  { id: 'g3', name: 'Puttu (half)', nameLocal: 'Puttu', serving: '½ cylinder', calories: 180, carbsG: 40, proteinG: 3, fatG: 1, fiberG: 1.5, sodiumMg: 8, category: 'grains', texture: 'soft', isLowSodium: true, glycemicIndex: 'high' },
  { id: 'g4', name: 'Idiyappam', nameLocal: 'Noolappam', serving: '2 pieces', calories: 140, carbsG: 28, proteinG: 2, fatG: 2, fiberG: 1, sodiumMg: 5, category: 'grains', texture: 'soft', isLowSodium: true, glycemicIndex: 'medium' },
  { id: 'g5', name: 'Ragi Puttu', nameLocal: 'Ragi Puttu', serving: '½ cylinder', calories: 160, carbsG: 32, proteinG: 4, fatG: 1.5, fiberG: 3, sodiumMg: 6, category: 'grains', texture: 'soft', isLowSodium: true, glycemicIndex: 'medium' },
  { id: 'g6', name: 'Wheat Dosa', nameLocal: 'Gothambu Dosa', serving: '1 medium', calories: 110, carbsG: 20, proteinG: 3, fatG: 2, fiberG: 2, sodiumMg: 15, category: 'grains', texture: 'soft', isLowSodium: true, glycemicIndex: 'medium' },
  // DAIRY
  { id: 'd1', name: 'Buttermilk', nameLocal: 'Moru / Sambharam', serving: '240ml (1 glass)', calories: 25, carbsG: 5, proteinG: 1, fatG: 0.5, fiberG: 0, sodiumMg: 80, category: 'dairy', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'd2', name: 'Curd', nameLocal: 'Thayir', serving: '120g (½ cup)', calories: 70, carbsG: 6, proteinG: 4, fatG: 3, fiberG: 0, sodiumMg: 50, category: 'dairy', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'd3', name: 'Raita (cucumber)', serving: '100g', calories: 55, carbsG: 5, proteinG: 3, fatG: 2.5, fiberG: 0.5, sodiumMg: 60, category: 'dairy', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
  { id: 'd4', name: 'Warm Turmeric Milk', nameLocal: 'Manjal Paal', serving: '200ml', calories: 80, carbsG: 8, proteinG: 5, fatG: 3, fiberG: 0, sodiumMg: 70, category: 'dairy', texture: 'soft', isLowSodium: true, glycemicIndex: 'low' },
];
