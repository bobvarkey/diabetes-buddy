import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, ChefHat, Wheat } from "lucide-react";
import Header from "@/components/Header";

const CUISINE_MEALS = {
  asian: {
    name: "Asian (Rice-based)",
    meals: {
      breakfast: ["Congee", "Steamed buns", "Fried rice (small)", "Noodle soup"],
      lunch: ["Veg stir-fry + rice", "Chicken + rice", "Tom yum soup", "Spring rolls"],
      dinner: ["Fish + rice", "Pork + broccoli", "Hot/sour soup", "Steamed fish"],
    },
    carbs: "1 cup rice = 45g, tip: Choose brown rice",
  },
  indian: {
    name: "Indian",
    meals: {
      breakfast: ["Poha", "Idli (2) + sambar", "Paratha", "Upma"],
      lunch: ["Roti (2) + dal", "Rice (1 cup) + curry", "Rajma chawal", "Khichdi"],
      dinner: ["Roti (2) + sabzi", "Rice + dal", "Paneer + rice", "Mixed veg"],
    },
    carbs: "1 roti = 30g, 1 cup rice = 45g",
  },
  kerala: {
    name: "Kerala Sadya",
    meals: {
      breakfast: ["Puttu (1 cup)", "Appam (2)", "Idiyappam", "Banana"],
      lunch: ["Rice + sambar", "Rice + avial", "Thoran + rice", "Olan + rice"],
      dinner: ["Rice + fish curry", "Rice + meat", "Veg + rice", "Kootu curry"],
    },
    carbs: "1 cup puttu = 35g, 1 cup rice = 45g",
  },
  european: {
    name: "European",
    meals: {
      breakfast: ["Toast (2)", "Oatmeal", "Eggs + toast", "Yogurt + granola"],
      lunch: ["Sandwich", "Soup + bread", "Salad + chicken", "Pasta"],
      dinner: ["Chicken + veggies", "Fish + rice", "Stew + bread", "Pizza (2)"],
    },
    carbs: "1 slice bread = 15g, 1 cup pasta = 40g",
  },
  japanese: {
    name: "Japanese",
    meals: {
      breakfast: ["Rice + miso", "Tamagoyaki", "Natto + rice", "Pickles"],
      lunch: ["Bento", "Ramen (small)", "Udon soup", "Sashimi"],
      dinner: ["Sushi (6 pcs)", "Tempura + rice", "Teriyaki", "Donburi"],
    },
    carbs: "1/2 cup rice = 20g, tip: Choose sashimi",
  },
  chinese: {
    name: "Chinese",
    meals: {
      breakfast: ["Congee", "Steamed buns", "Dim sum", "Fried noodles"],
      lunch: ["Fried rice", "Chow mein", "Dumplings", "Lo mein"],
      dinner: ["Fish + rice", "Kung pao + rice", "Beef broccoli", "Mapo tofu"],
    },
    carbs: "1 cup fried rice = 55g, tip: More veggies",
  },
  korean: {
    name: "Korean",
    meals: {
      breakfast: ["Rice + kimchi", "Egg bread", "Porridge", "Fruit"],
      lunch: ["Bibimbap", "Kimbap (2)", "Bulgogi + rice", "Japchae"],
      dinner: ["Galbi + rice", "Pork + rice", "Jjigae + rice", "Banchan + rice"],
    },
    carbs: "1 cup rice = 45g, tip: Load veggies",
  },
  american: {
    name: "American",
    meals: {
      breakfast: ["Pancakes (2)", "Waffles (2)", "Cereal", "Bagel"],
      lunch: ["Burger/fries", "Pizza (2)", "Wrap", "Salad + bread"],
      dinner: ["Chicken + veggies", "Pasta", "Steak + potato", "Fish tacos"],
    },
    carbs: "2 pancakes = 30g, 1 pizza slice = 30g",
  },
};

export default function MealPlanner() {
  const [cuisine, setCuisine] = useState("");
  const [mealTime, setMealTime] = useState("lunch");
  const [selectedMeal, setSelectedMeal] = useState("");

  const data = CUISINE_MEALS[cuisine as keyof typeof CUISINE_MEALS];
  const mealList = data?.meals[mealTime as keyof typeof data.meals] || [];

  return (
    <>
      <Header title="Meal Planner" />
      <div className="p-4 space-y-4 pb-20">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Utensils className="h-5 w-5" />
              Meal by Cuisine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block">Select Cuisine</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger><SelectValue placeholder="Choose cuisine" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CUISINE_MEALS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {cuisine && (
              <div>
                <Label className="text-xs mb-1.5 block">Meal Time</Label>
                <div className="flex gap-2">
                  {["breakfast", "lunch", "dinner"].map(t => (
                    <Button key={t} variant={mealTime === t ? "default" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => setMealTime(t)}>
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {cuisine && mealTime && (
              <div>
                <Label className="text-xs mb-1.5 block">Meals ({mealTime})</Label>
                <div className="space-y-2">
                  {mealList.map((m, i) => (
                    <button key={i} onClick={() => setSelectedMeal(m)}
                      className={`w-full text-left p-3 rounded-lg border ${selectedMeal === m ? "bg-blue-50 border-blue-500" : "hover:bg-muted/50"}`}>
                      <span className="text-sm">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Wheat className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold">Carb Info</span>
                </div>
                <p className="text-xs">{data.carbs}</p>
              </div>
            )}

            {selectedMeal && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <ChefHat className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold">Bolus Estimate</span>
                </div>
                <p className="text-xs">1 unit per 10-15g carbs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
