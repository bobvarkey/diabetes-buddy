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
  texture: "regular" | "soft" | "pureed";
  isLowSodium: boolean;
  glycemicIndex: "low" | "medium" | "high";
  cuisine: "American" | "European" | "Chinese" | "North Indian" | "South Indian" | "Kerala" | "Japanese" | "Other";
  dietType: "vegetarian" | "non-vegetarian" | "vegan" | "pescatarian" | "eggetarian";
}

export type FoodCategory = "veggies" | "fruits" | "proteins" | "grains" | "dairy";

export type CuisineType = "American" | "European" | "Chinese" | "North Indian" | "South Indian" | "Kerala" | "Japanese" | "Other";

export type DietType = "vegetarian" | "non-vegetarian" | "vegan" | "pescatarian" | "eggetarian";

export const FOOD_CATEGORIES: { key: FoodCategory; label: string; color: string; icon: string }[] = [
  { key: "veggies", label: "Non-Starchy Veggies", color: "bg-plate-veggie", icon: "🥬" },
  { key: "fruits", label: "Fruits (15g carb servings)", color: "bg-plate-protein", icon: "🍈" },
  { key: "proteins", label: "Proteins", color: "bg-plate-protein", icon: "🐟" },
  { key: "grains", label: "Grains (¼ plate)", color: "bg-plate-grain", icon: "🍚" },
  { key: "dairy", label: "Dairy & Beverages", color: "bg-plate-dairy", icon: "🥛" },
];

export const ALL_FOODS: FoodItem[] = [
  // KERALA FOODS - VEGGIES (Vegetarian)
  { id: "v1", name: "Cabbage Thoran", nameLocal: "Muttakose Thoran", serving: "200g (½ plate)", calories: 90, carbsG: 10, proteinG: 4, fatG: 5, fiberG: 5, sodiumMg: 45, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegetarian" },
  { id: "v2", name: "Beans Mezhukupuratti", nameLocal: "Payar Mezhukupuratti", serving: "150g", calories: 85, carbsG: 12, proteinG: 3, fatG: 4, fiberG: 4, sodiumMg: 35, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegan" },
  { id: "v3", name: "Okra Stir-fry", nameLocal: "Vendakka Mezhukupuratti", serving: "150g", calories: 75, carbsG: 8, proteinG: 3, fatG: 4, fiberG: 5, sodiumMg: 30, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegetarian" },
  { id: "v4", name: "Spinach Thoran", nameLocal: "Cheera Thoran", serving: "150g", calories: 70, carbsG: 6, proteinG: 4, fatG: 4, fiberG: 4, sodiumMg: 50, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegetarian" },
  { id: "v5", name: "Snake Gourd Curry", nameLocal: "Padavalanga Thoran", serving: "150g", calories: 65, carbsG: 7, proteinG: 2, fatG: 4, fiberG: 3, sodiumMg: 25, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegan" },
  { id: "v6", name: "Ash Gourd Curry", nameLocal: "Kumbalanga Curry", serving: "150g", calories: 55, carbsG: 8, proteinG: 1, fatG: 3, fiberG: 2, sodiumMg: 20, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegan" },
  { id: "v7", name: "Bitter Gourd Stir-fry", nameLocal: "Pavakka Mezhukupuratti", serving: "100g", calories: 45, carbsG: 5, proteinG: 2, fatG: 3, fiberG: 3, sodiumMg: 15, category: "veggies", texture: "regular", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegan" },
  { id: "v8", name: "Drumstick Sambar Veggies", nameLocal: "Muringakka", serving: "100g", calories: 60, carbsG: 8, proteinG: 3, fatG: 2, fiberG: 4, sodiumMg: 40, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegetarian" },

  // NORTH INDIAN VEGGIES
  { id: "ni_v1", name: "Aloo Gobi", serving: "150g", calories: 120, carbsG: 18, proteinG: 3, fatG: 5, fiberG: 3, sodiumMg: 200, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "medium", cuisine: "North Indian", dietType: "vegan" },
  { id: "ni_v2", name: "Palak Paneer (without cream)", serving: "150g", calories: 110, carbsG: 8, proteinG: 8, fatG: 5, fiberG: 2, sodiumMg: 180, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "North Indian", dietType: "vegetarian" },
  { id: "ni_v3", name: "Chana Masala", serving: "150g", calories: 140, carbsG: 20, proteinG: 8, fatG: 4, fiberG: 5, sodiumMg: 220, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "medium", cuisine: "North Indian", dietType: "vegan" },

  // SOUTH INDIAN VEGGIES
  { id: "si_v1", name: "Mixed Vegetable Sambar", serving: "150g", calories: 95, carbsG: 15, proteinG: 4, fatG: 3, fiberG: 4, sodiumMg: 180, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "South Indian", dietType: "vegan" },
  { id: "si_v2", name: "Bottle Gourd Poriyal", serving: "150g", calories: 65, carbsG: 10, proteinG: 2, fatG: 3, fiberG: 2, sodiumMg: 35, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "South Indian", dietType: "vegetarian" },

  // AMERICAN VEGGIES
  { id: "am_v1", name: "Steamed Broccoli", serving: "200g", calories: 70, carbsG: 10, proteinG: 5, fatG: 1, fiberG: 3, sodiumMg: 120, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },
  { id: "am_v2", name: "Grilled Asparagus", serving: "150g", calories: 50, carbsG: 7, proteinG: 3, fatG: 1, fiberG: 2, sodiumMg: 100, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },
  { id: "am_v3", name: "Grilled Bell Peppers", serving: "150g", calories: 60, carbsG: 12, proteinG: 2, fatG: 1, fiberG: 2.5, sodiumMg: 5, category: "veggies", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },

  // EUROPEAN VEGGIES
  { id: "eu_v1", name: "Zucchini Gratin", serving: "150g", calories: 85, carbsG: 8, proteinG: 3, fatG: 5, fiberG: 2, sodiumMg: 150, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "European", dietType: "vegetarian" },
  { id: "eu_v2", name: "Cauliflower Gratin", serving: "150g", calories: 100, carbsG: 10, proteinG: 4, fatG: 5, fiberG: 3, sodiumMg: 170, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "European", dietType: "vegetarian" },

  // CHINESE VEGGIES
  { id: "ch_v1", name: "Stir-fried Bok Choy", serving: "150g", calories: 60, carbsG: 6, proteinG: 2, fatG: 3, fiberG: 1, sodiumMg: 250, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "Chinese", dietType: "vegan" },
  { id: "ch_v2", name: "Mushroom with Garlic Sauce", serving: "120g", calories: 80, carbsG: 8, proteinG: 3, fatG: 4, fiberG: 1, sodiumMg: 280, category: "veggies", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "Chinese", dietType: "vegetarian" },

  // JAPANESE VEGGIES
  { id: "ja_v1", name: "Edamame", serving: "100g", calories: 95, carbsG: 7, proteinG: 11, fatG: 4, fiberG: 3, sodiumMg: 200, category: "veggies", texture: "regular", isLowSodium: false, glycemicIndex: "low", cuisine: "Japanese", dietType: "vegan" },

  // FRUITS (All Vegan)
  { id: "f1", name: "Guava", nameLocal: "Perakka", serving: "55g (1 small)", calories: 37, carbsG: 14, proteinG: 1, fatG: 0.5, fiberG: 3, sodiumMg: 1, category: "fruits", texture: "regular", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegan" },
  { id: "f2", name: "Papaya", nameLocal: "Pappaya", serving: "140g (1 cup diced)", calories: 55, carbsG: 15, proteinG: 0.5, fatG: 0, fiberG: 2.5, sodiumMg: 4, category: "fruits", texture: "soft", isLowSodium: true, glycemicIndex: "medium", cuisine: "Kerala", dietType: "vegan" },
  { id: "f3", name: "Apple (medium)", serving: "150g", calories: 80, carbsG: 21, proteinG: 0.3, fatG: 0.2, fiberG: 3.5, sodiumMg: 2, category: "fruits", texture: "regular", isLowSodium: true, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },
  { id: "f4", name: "Orange", serving: "130g", calories: 60, carbsG: 15, proteinG: 1, fatG: 0.3, fiberG: 2.5, sodiumMg: 0, category: "fruits", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "European", dietType: "vegan" },
  { id: "f5", name: "Berries (mixed)", serving: "100g", calories: 57, carbsG: 12, proteinG: 0.7, fatG: 0.5, fiberG: 2.5, sodiumMg: 2, category: "fruits", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },

  // PROTEINS - KERALA
  { id: "p1", name: "Sardine Moilee", nameLocal: "Mathi Moilee", serving: "100g (2 pcs)", calories: 200, carbsG: 3, proteinG: 25, fatG: 10, fiberG: 0, sodiumMg: 150, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "Kerala", dietType: "pescatarian" },
  { id: "p2", name: "Egg White Omelette", serving: "3 whites", calories: 50, carbsG: 0, proteinG: 11, fatG: 0, fiberG: 0, sodiumMg: 165, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "eggetarian" },
  { id: "p3", name: "Chicken Stew", nameLocal: "Kozhi Stew", serving: "150g", calories: 220, carbsG: 5, proteinG: 28, fatG: 10, fiberG: 1, sodiumMg: 200, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "Kerala", dietType: "non-vegetarian" },
  { id: "p4", name: "Low-fat Paneer", nameLocal: "Paneer", serving: "75g", calories: 140, carbsG: 2, proteinG: 14, fatG: 8, fiberG: 0, sodiumMg: 20, category: "proteins", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "North Indian", dietType: "vegetarian" },
  { id: "p5", name: "Grilled Salmon", serving: "100g", calories: 206, carbsG: 0, proteinG: 22, fatG: 13, fiberG: 0, sodiumMg: 75, category: "proteins", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "American", dietType: "pescatarian" },
  { id: "p6", name: "Tandoori Chicken (skinless)", serving: "100g", calories: 165, carbsG: 0, proteinG: 32, fatG: 3.5, fiberG: 0, sodiumMg: 420, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "North Indian", dietType: "non-vegetarian" },
  { id: "p7", name: "Tofu (firm)", serving: "100g", calories: 76, carbsG: 2, proteinG: 8, fatG: 4.5, fiberG: 1, sodiumMg: 200, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "Chinese", dietType: "vegan" },
  { id: "p8", name: "Tuna Sashimi", serving: "100g", calories: 144, carbsG: 0, proteinG: 30, fatG: 1.2, fiberG: 0, sodiumMg: 40, category: "proteins", texture: "regular", isLowSodium: true, glycemicIndex: "low", cuisine: "Japanese", dietType: "pescatarian" },
  { id: "p9", name: "Dal (Lentil Curry)", serving: "150g", calories: 135, carbsG: 20, proteinG: 9, fatG: 2, fiberG: 5, sodiumMg: 60, category: "proteins", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "North Indian", dietType: "vegan" },
  { id: "p10", name: "Chana (Chickpea Curry)", serving: "150g", calories: 160, carbsG: 22, proteinG: 8, fatG: 4, fiberG: 6, sodiumMg: 200, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "medium", cuisine: "North Indian", dietType: "vegan" },
  { id: "p11", name: "Whole Eggs (2)", serving: "100g", calories: 155, carbsG: 1.1, proteinG: 13, fatG: 11, fiberG: 0, sodiumMg: 140, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "eggetarian" },
  { id: "p12", name: "Mutton Curry (lean)", serving: "100g", calories: 190, carbsG: 2, proteinG: 28, fatG: 8, fiberG: 0, sodiumMg: 280, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "North Indian", dietType: "non-vegetarian" },
  { id: "p13", name: "Grilled Shrimp", serving: "100g", calories: 99, carbsG: 0, proteinG: 21, fatG: 0.3, fiberG: 0, sodiumMg: 190, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "pescatarian" },
  { id: "p14", name: "Tempeh", serving: "100g", calories: 192, carbsG: 7, proteinG: 19, fatG: 11, fiberG: 8, sodiumMg: 130, category: "proteins", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "Chinese", dietType: "vegan" },

  // GRAINS
  { id: "g1", name: "Matta Rice (Red)", nameLocal: "Kuthari Choru", serving: "½ cup cooked (100g)", calories: 150, carbsG: 30, proteinG: 3, fatG: 1, fiberG: 2, sodiumMg: 5, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "medium", cuisine: "Kerala", dietType: "vegan" },
  { id: "g2", name: "Appam", nameLocal: "Appam", serving: "1 piece", calories: 120, carbsG: 22, proteinG: 2, fatG: 3, fiberG: 0.5, sodiumMg: 10, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "high", cuisine: "Kerala", dietType: "vegetarian" },
  { id: "g3", name: "Whole Wheat Roti", serving: "1 medium (30g)", calories: 80, carbsG: 15, proteinG: 3, fatG: 1, fiberG: 2, sodiumMg: 2, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "medium", cuisine: "North Indian", dietType: "vegan" },
  { id: "g4", name: "Basmati Rice", serving: "½ cup cooked (100g)", calories: 150, carbsG: 35, proteinG: 2, fatG: 0.3, fiberG: 0.5, sodiumMg: 1, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "medium", cuisine: "North Indian", dietType: "vegan" },
  { id: "g5", name: "Brown Rice", serving: "½ cup cooked (100g)", calories: 110, carbsG: 23, proteinG: 2.5, fatG: 1, fiberG: 1.8, sodiumMg: 2, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },
  { id: "g6", name: "Quinoa", serving: "½ cup cooked (80g)", calories: 111, carbsG: 20, proteinG: 4, fatG: 2, fiberG: 2.5, sodiumMg: 8, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Other", dietType: "vegan" },
  { id: "g7", name: "Wheat Noodles", serving: "80g cooked", calories: 140, carbsG: 26, proteinG: 4, fatG: 1.5, fiberG: 2, sodiumMg: 400, category: "grains", texture: "soft", isLowSodium: false, glycemicIndex: "medium", cuisine: "Chinese", dietType: "vegan" },
  { id: "g8", name: "Sushi Rice", serving: "⅓ cup cooked (60g)", calories: 90, carbsG: 20, proteinG: 1.5, fatG: 0.3, fiberG: 0.3, sodiumMg: 200, category: "grains", texture: "soft", isLowSodium: false, glycemicIndex: "high", cuisine: "Japanese", dietType: "vegan" },
  { id: "g9", name: "Oats (rolled)", serving: "½ cup cooked (150g)", calories: 150, carbsG: 27, proteinG: 5, fatG: 3, fiberG: 4, sodiumMg: 2, category: "grains", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },

  // DAIRY
  { id: "d1", name: "Buttermilk", nameLocal: "Moru / Sambharam", serving: "240ml (1 glass)", calories: 25, carbsG: 5, proteinG: 1, fatG: 0.5, fiberG: 0, sodiumMg: 80, category: "dairy", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegetarian" },
  { id: "d2", name: "Curd", nameLocal: "Thayir", serving: "120g (½ cup)", calories: 70, carbsG: 6, proteinG: 4, fatG: 3, fiberG: 0, sodiumMg: 50, category: "dairy", texture: "soft", isLowSodium: true, glycemicIndex: "low", cuisine: "Kerala", dietType: "vegetarian" },
  { id: "d3", name: "Greek Yogurt", serving: "100g", calories: 59, carbsG: 3.3, proteinG: 10, fatG: 0.4, fiberG: 0, sodiumMg: 75, category: "dairy", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "vegetarian" },
  { id: "d4", name: "Cottage Cheese", serving: "100g", calories: 98, carbsG: 3.5, proteinG: 11, fatG: 5, fiberG: 0, sodiumMg: 390, category: "dairy", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "vegetarian" },
  { id: "d5", name: "Almond Milk (unsweetened)", serving: "240ml", calories: 30, carbsG: 1, proteinG: 1, fatG: 2.5, fiberG: 0, sodiumMg: 170, category: "dairy", texture: "soft", isLowSodium: false, glycemicIndex: "low", cuisine: "American", dietType: "vegan" },
];

export const KERALA_FOODS = ALL_FOODS.filter(f => f.cuisine === "Kerala");

export function getFoodsByCategory(category: FoodCategory, cuisine?: CuisineType, diet?: DietType): FoodItem[] {
  return ALL_FOODS.filter(f =>
    f.category === category &&
    (!cuisine || f.cuisine === cuisine) &&
    (!diet || f.dietType === diet)
  );
}

export function getFoodsByCuisine(cuisine: CuisineType, diet?: DietType): FoodItem[] {
  return ALL_FOODS.filter(f => f.cuisine === cuisine && (!diet || f.dietType === diet));
}

export function getFoodsByDiet(diet: DietType, cuisine?: CuisineType): FoodItem[] {
  return ALL_FOODS.filter(f => f.dietType === diet && (!cuisine || f.cuisine === cuisine));
}

export function getSoftFoods(cuisine?: CuisineType, diet?: DietType): FoodItem[] {
  return ALL_FOODS.filter(f =>
    (f.texture === "soft" || f.texture === "pureed") &&
    (!cuisine || f.cuisine === cuisine) &&
    (!diet || f.dietType === diet)
  );
}

export function getLowSodiumFoods(cuisine?: CuisineType, diet?: DietType): FoodItem[] {
  return ALL_FOODS.filter(f =>
    f.isLowSodium &&
    (!cuisine || f.cuisine === cuisine) &&
    (!diet || f.dietType === diet)
  );
}
