import { MarketPrice } from "../types";

export async function fetchMarketPrices(ingredientNames: string[] = []): Promise<MarketPrice[]> {
  try {
    // Simulates a tiny network response latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Base mock prices for default elements
    const defaultIngPrices: Record<string, number> = {
      "Milho Moído": 1.15,
      "Farelo de Soja": 2.38,
      "Silagem de Milho": 0.35,
      "Caroço de Algodão": 1.25,
      "Ureia Pecuária": 3.20,
      "Núcleo Confinamento": 4.50,
      "Polpa Cítrica": 0.95,
      "Casca de Soja": 1.10,
      "Feno de Capim": 0.55,
      "Pó de Varredura": 0.70,
      "Melaço de Cana": 1.40,
      "Sal Mineralizado": 2.80,
      "Calcário Calcítico": 0.45,
      "Fosfato Bicálcico": 3.80,
      "Milho Grão": 1.10,
    };

    const getSimulatedIngPrices = () => {
      const prices: Record<string, number> = {};
      ingredientNames.forEach(name => {
        const basePrice = defaultIngPrices[name] || (0.5 + Math.random() * 3.0);
        // Introduces small random fluctuations of -5% to +5% for realistic dynamism
        const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
        prices[name] = parseFloat((basePrice * fluctuation).toFixed(2));
      });
      return prices;
    };

    const today = new Date().toISOString().split('T')[0];

    return [
      { 
        state: "SP", 
        boiGordo: 285.50, 
        boiMagro: 3200.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'stable' 
      },
      { 
        state: "MS", 
        boiGordo: 278.00, 
        boiMagro: 3050.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'up' 
      },
      { 
        state: "MT", 
        boiGordo: 264.50, 
        boiMagro: 2850.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'down' 
      },
      { 
        state: "GO", 
        boiGordo: 272.00, 
        boiMagro: 2980.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'stable' 
      },
      { 
        state: "MG", 
        boiGordo: 279.50, 
        boiMagro: 3100.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'up' 
      },
      { 
        state: "RS", 
        boiGordo: 262.00, 
        boiMagro: 2920.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'stable' 
      },
      { 
        state: "PR", 
        boiGordo: 275.50, 
        boiMagro: 3080.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'up' 
      },
      { 
        state: "SC", 
        boiGordo: 270.00, 
        boiMagro: 3120.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'stable' 
      },
      { 
        state: "PA", 
        boiGordo: 258.00, 
        boiMagro: 2750.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'down' 
      },
      { 
        state: "RO", 
        boiGordo: 259.00, 
        boiMagro: 2780.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'stable' 
      },
      { 
        state: "TO", 
        boiGordo: 261.00, 
        boiMagro: 2800.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'up' 
      },
      { 
        state: "BA", 
        boiGordo: 268.00, 
        boiMagro: 2890.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'stable' 
      },
      { 
        state: "MA", 
        boiGordo: 262.00, 
        boiMagro: 2810.00, 
        ingredientPrices: getSimulatedIngPrices(), 
        date: today, 
        trend: 'up' 
      }
    ];
  } catch (error) {
    console.error("Erro ao buscar preços de mercado:", error);
    const today = new Date().toISOString().split('T')[0];
    return [
      { state: "SP", boiGordo: 280.00, boiMagro: 3100.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "MS", boiGordo: 275.00, boiMagro: 3000.00, ingredientPrices: {}, date: today, trend: 'up' },
      { state: "MA", boiGordo: 262.00, boiMagro: 2810.00, ingredientPrices: {}, date: today, trend: 'up' }
    ];
  }
}
