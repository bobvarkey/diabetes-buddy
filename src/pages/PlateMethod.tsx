import { useState } from "react";
import { KERALA_FOODS, FoodItem } from "@/lib/food-data";

interface PlateSlot {
  category: "veggie" | "protein" | "grain";
  label: string;
  target: string;
  color: string;
  foods: FoodItem[];
}

const PlateMethod = () => {
  const [plate, setPlate] = useState<PlateSlot[]>([
    { category: "veggie", label: "Veggies (½ plate)", target: "200g+ non-starchy", color: "hsl(var(--plate-veggie))", foods: [] },
    { category: "protein", label: "Protein (¼ plate)", target: "20-30g protein", color: "hsl(var(--plate-protein))", foods: [] },
    { category: "grain", label: "Grains (¼ plate)", target: "15-45g carbs", color: "hsl(var(--plate-grain))", foods: [] },
  ]);

  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const getAvailableFoods = (category: string) => {
    if (category === "veggie") return KERALA_FOODS.filter(f => f.category === "veggies");
    if (category === "protein") return KERALA_FOODS.filter(f => f.category === "proteins");
    return KERALA_FOODS.filter(f => f.category === "grains");
  };

  const addFood = (slotIdx: number, food: FoodItem) => {
    setPlate(prev => prev.map((s, i) => i === slotIdx ? { ...s, foods: [...s.foods, food] } : s));
    setActiveSlot(null);
  };

  const removeFood = (slotIdx: number, foodIdx: number) => {
    setPlate(prev => prev.map((s, i) => i === slotIdx ? { ...s, foods: s.foods.filter((_, fi) => fi !== foodIdx) } : s));
  };

  const totalCarbs = plate.reduce((s, sl) => s + sl.foods.reduce((ss, f) => ss + f.carbsG, 0), 0);
  const totalProtein = plate.reduce((s, sl) => s + sl.foods.reduce((ss, f) => ss + f.proteinG, 0), 0);
  const totalCal = plate.reduce((s, sl) => s + sl.foods.reduce((ss, f) => ss + f.calories, 0), 0);

  const veggieOk = plate[0].foods.length >= 1;
  const proteinOk = totalProtein >= 20 && totalProtein <= 30;
  const carbOk = totalCarbs >= 15 && totalCarbs <= 45;
  const score = [veggieOk, proteinOk, carbOk].filter(Boolean).length;

  return (
    <div className="space-y-5 animate-slide-in">
      <div>
        <h1 className="text-xl font-heading font-bold">Plate Method</h1>
        <p className="text-sm text-muted-foreground">Tap sections to add Kerala foods</p>
      </div>

      {/* SVG Plate */}
      <div className="flex justify-center">
        <svg viewBox="0 0 300 300" className="w-64 h-64 md:w-80 md:h-80">
          {/* Plate ring */}
          <circle cx="150" cy="150" r="145" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle cx="150" cy="150" r="140" fill="hsl(var(--card))" />

          {/* Veggie half - left */}
          <path
            d="M 150 10 A 140 140 0 0 0 150 290 L 150 150 Z"
            fill={plate[0].foods.length > 0 ? "hsl(var(--plate-veggie))" : "hsl(var(--plate-veggie) / 0.15)"}
            className="plate-section"
            onClick={() => setActiveSlot(0)}
            stroke="hsl(var(--card))"
            strokeWidth="2"
          />
          <text x="80" y="140" textAnchor="middle" className="fill-current text-[11px] font-medium" fill={plate[0].foods.length > 0 ? "white" : "hsl(var(--plate-veggie))"}>🥬 Veggies</text>
          <text x="80" y="158" textAnchor="middle" className="fill-current text-[9px]" fill={plate[0].foods.length > 0 ? "white" : "hsl(var(--muted-foreground))"}>½ plate · 200g+</text>

          {/* Protein quarter - top right */}
          <path
            d="M 150 10 A 140 140 0 0 1 290 150 L 150 150 Z"
            fill={plate[1].foods.length > 0 ? "hsl(var(--plate-protein))" : "hsl(var(--plate-protein) / 0.15)"}
            className="plate-section"
            onClick={() => setActiveSlot(1)}
            stroke="hsl(var(--card))"
            strokeWidth="2"
          />
          <text x="215" y="95" textAnchor="middle" className="fill-current text-[11px] font-medium" fill={plate[1].foods.length > 0 ? "white" : "hsl(var(--plate-protein))"}>🐟 Protein</text>
          <text x="215" y="113" textAnchor="middle" className="fill-current text-[9px]" fill={plate[1].foods.length > 0 ? "white" : "hsl(var(--muted-foreground))"}>¼ plate</text>

          {/* Grain quarter - bottom right */}
          <path
            d="M 290 150 A 140 140 0 0 1 150 290 L 150 150 Z"
            fill={plate[2].foods.length > 0 ? "hsl(var(--plate-grain))" : "hsl(var(--plate-grain) / 0.15)"}
            className="plate-section"
            onClick={() => setActiveSlot(2)}
            stroke="hsl(var(--card))"
            strokeWidth="2"
          />
          <text x="215" y="210" textAnchor="middle" className="fill-current text-[11px] font-medium" fill={plate[2].foods.length > 0 ? "white" : "hsl(var(--plate-grain))"}>🍚 Grains</text>
          <text x="215" y="228" textAnchor="middle" className="fill-current text-[9px]" fill={plate[2].foods.length > 0 ? "white" : "hsl(var(--muted-foreground))"}>¼ plate</text>

          {/* Score in center */}
          <circle cx="150" cy="150" r="28" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          <text x="150" y="146" textAnchor="middle" className="text-[18px] font-bold" fill="hsl(var(--foreground))">{score}/3</text>
          <text x="150" y="162" textAnchor="middle" className="text-[8px]" fill="hsl(var(--muted-foreground))">Score</text>
        </svg>
      </div>

      {/* Validation */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`text-center p-2 rounded-lg ${veggieOk ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          <span className="text-xs">{veggieOk ? "✓" : "○"} Veggies</span>
        </div>
        <div className={`text-center p-2 rounded-lg ${proteinOk ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          <span className="text-xs">{proteinOk ? "✓" : "○"} {totalProtein}g protein</span>
        </div>
        <div className={`text-center p-2 rounded-lg ${carbOk ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
          <span className="text-xs">{carbOk ? "✓" : "○"} {totalCarbs}g carbs</span>
        </div>
      </div>

      {/* Totals */}
      <div className="clinical-card flex justify-around text-center">
        <div><span className="text-lg font-heading font-bold">{totalCal}</span><span className="text-xs text-muted-foreground block">kcal</span></div>
        <div><span className="text-lg font-heading font-bold">{totalCarbs}g</span><span className="text-xs text-muted-foreground block">carbs</span></div>
        <div><span className="text-lg font-heading font-bold">{totalProtein}g</span><span className="text-xs text-muted-foreground block">protein</span></div>
      </div>

      {/* Food picker */}
      {activeSlot !== null && (
        <div className="clinical-card border-primary/30">
          <h3 className="section-title mb-3">Add to {plate[activeSlot].label}</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {getAvailableFoods(plate[activeSlot].category).map(food => (
              <button
                key={food.id}
                onClick={() => addFood(activeSlot, food)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-muted/50 flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="text-sm font-medium">{food.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{food.serving}</span>
                </div>
                <span className="text-xs text-muted-foreground">{food.carbsG}g carb · {food.proteinG}g prot</span>
              </button>
            ))}
          </div>
          <button onClick={() => setActiveSlot(null)} className="mt-2 text-xs text-muted-foreground underline">Cancel</button>
        </div>
      )}

      {/* Selected foods */}
      {plate.map((slot, si) => slot.foods.length > 0 && (
        <div key={si} className="clinical-card p-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">{slot.label}</h4>
          <div className="space-y-1">
            {slot.foods.map((food, fi) => (
              <div key={fi} className="flex items-center justify-between text-sm">
                <span>{food.name} <span className="text-muted-foreground">({food.serving})</span></span>
                <button onClick={() => removeFood(si, fi)} className="text-destructive text-xs">Remove</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlateMethod;
