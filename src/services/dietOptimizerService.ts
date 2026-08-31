import solverPkg from 'javascript-lp-solver';
const solver = (solverPkg as any).default || solverPkg;
import { Ingredient, DietRequirements, DietOptimizationResult, DietAnimalProfile } from '../types';

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Milho Grão', type: 'concentrado', price: 1.2, pb: 9, ndt: 88, fdn: 12, ms: 88, ca: 0.03, p: 0.28, mg: 0.12, k: 0.40, na: 0.02, s: 0.12, vitA: 0, vitE: 20, ee: 4.0, pdr: 40, maxIncl: 85, selected: true, ch4Potential: 12.5 },
  { id: '2', name: 'Farelo de Soja', type: 'concentrado', price: 2.5, pb: 46, ndt: 80, fdn: 15, ms: 89, ca: 0.30, p: 0.65, mg: 0.30, k: 2.20, na: 0.02, s: 0.40, vitA: 0, vitE: 5, ee: 1.5, pdr: 35, maxIncl: 30, selected: true, ch4Potential: 14.0 },
  { id: '3', name: 'Silagem de Milho', type: 'volumoso', price: 0.35, pb: 7, ndt: 65, fdn: 45, ms: 33, ca: 0.25, p: 0.20, mg: 0.20, k: 1.20, na: 0.01, s: 0.10, vitA: 15000, vitE: 30, ee: 3.0, pdr: 70, minIncl: 10, selected: true, ch4Potential: 21.0 },
  { id: '4', name: 'Caroço de Algodão', type: 'concentrado', price: 1.8, pb: 22, ndt: 90, fdn: 44, ms: 90, ca: 0.16, p: 0.60, mg: 0.40, k: 1.20, na: 0.02, s: 0.25, vitA: 0, vitE: 40, ee: 18.0, pdr: 30, maxIncl: 15, selected: true, ch4Potential: 9.5 },
  { id: '5', name: 'Ureia', type: 'mineral', price: 3.5, pb: 280, ndt: 0, fdn: 0, ms: 99, ca: 0, p: 0, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0, ee: 0, pdr: 100, isUrea: true, maxIncl: 1.5, selected: true, ch4Potential: 0 },
  { id: '6', name: 'Núcleo Mineral', type: 'mineral', price: 4.5, pb: 0, ndt: 0, fdn: 0, ms: 95, ca: 18, p: 6, mg: 2.5, k: 0.5, na: 10, s: 2, vitA: 200000, vitE: 500, ee: 0, pdr: 0, minIncl: 3, maxIncl: 5, selected: true, ch4Potential: 0 },
  { id: '7', name: 'Polpa Cítrica', type: 'concentrado', price: 1.1, pb: 7, ndt: 78, fdn: 21, ms: 88, ca: 1.8, p: 0.12, mg: 0.15, k: 1.10, na: 0.05, s: 0.10, vitA: 0, vitE: 0, ee: 2.0, pdr: 45, maxIncl: 30, selected: true, ch4Potential: 16.0 },
  { id: '8', name: 'Farelo de Trigo', type: 'concentrado', price: 1.0, pb: 17, ndt: 71, fdn: 40, ms: 88, ca: 0.14, p: 1.0, mg: 0.50, k: 1.50, na: 0.05, s: 0.25, vitA: 0, vitE: 10, ee: 4.0, pdr: 75, maxIncl: 25, selected: true, ch4Potential: 15.5 },
  { id: '9', name: 'Sorgo Grão', type: 'concentrado', price: 1.0, pb: 10, ndt: 82, fdn: 12, ms: 88, ca: 0.04, p: 0.30, mg: 0.15, k: 0.45, na: 0.02, s: 0.15, vitA: 0, vitE: 15, ee: 3.0, pdr: 45, maxIncl: 60, selected: true, ch4Potential: 13.0 },
  { id: '10', name: 'Casca de Soja', type: 'concentrado', price: 0.9, pb: 12, ndt: 75, fdn: 60, ms: 90, ca: 0.50, p: 0.20, mg: 0.25, k: 1.50, na: 0.02, s: 0.15, vitA: 0, vitE: 0, ee: 2.0, pdr: 50, maxIncl: 40, selected: true, ch4Potential: 15.0 },
  { id: '11', name: 'Farelo de Algodão 38', type: 'concentrado', price: 2.0, pb: 38, ndt: 72, fdn: 28, ms: 91, ca: 0.20, p: 1.10, mg: 0.60, k: 1.50, na: 0.03, s: 0.45, vitA: 0, vitE: 10, ee: 1.8, pdr: 40, maxIncl: 25, selected: true, ch4Potential: 14.5 },
  { id: '12', name: 'Feno de Tifton', type: 'volumoso', price: 0.8, pb: 12, ndt: 58, fdn: 70, ms: 85, ca: 0.40, p: 0.25, mg: 0.20, k: 1.80, na: 0.05, s: 0.20, vitA: 20000, vitE: 40, ee: 2.0, pdr: 75, selected: true, ch4Potential: 22.0 },
  { id: '13', name: 'DDG (Grão de Destilaria)', type: 'concentrado', price: 1.5, pb: 30, ndt: 85, fdn: 35, ms: 90, ca: 0.10, p: 0.80, mg: 0.30, k: 1.10, na: 0.20, s: 0.40, vitA: 0, vitE: 20, ee: 10.0, pdr: 45, maxIncl: 30, selected: true, ch4Potential: 13.5 },
  { id: '14', name: 'Silagem de Capim', type: 'volumoso', price: 0.25, pb: 8, ndt: 52, fdn: 65, ms: 28, ca: 0.35, p: 0.18, mg: 0.18, k: 1.50, na: 0.02, s: 0.15, vitA: 10000, vitE: 20, ee: 2.5, pdr: 75, selected: true, ch4Potential: 23.0 },
  { id: '15', name: 'Farelo de Milho (Refaz)', type: 'concentrado', price: 1.1, pb: 10, ndt: 80, fdn: 25, ms: 88, ca: 0.05, p: 0.35, mg: 0.15, k: 0.50, na: 0.02, s: 0.15, vitA: 0, vitE: 10, ee: 4.5, pdr: 50, selected: true, ch4Potential: 14.0 },
  { id: '16', name: 'Calcário Calcítico', type: 'mineral', price: 0.4, pb: 0, ndt: 0, fdn: 0, ms: 99, ca: 38, p: 0, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0, ee: 0, pdr: 0, selected: true, ch4Potential: 0 },
  { id: '17', name: 'Fosfato Bicálcico', type: 'mineral', price: 3.8, pb: 0, ndt: 0, fdn: 0, ms: 98, ca: 24, p: 18, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0, ee: 0, pdr: 0, selected: true, ch4Potential: 0 },
  { id: '18', name: 'Cana-de-açúcar', type: 'volumoso', price: 0.15, pb: 3, ndt: 62, fdn: 48, ms: 25, ca: 0.15, p: 0.08, mg: 0.10, k: 0.80, na: 0.01, s: 0.05, vitA: 0, vitE: 0, ee: 1.5, pdr: 60, selected: false, ch4Potential: 20.0 },
  { id: '19', name: 'Silagem de Sorgo', type: 'volumoso', price: 0.30, pb: 8, ndt: 60, fdn: 52, ms: 30, ca: 0.30, p: 0.22, mg: 0.18, k: 1.10, na: 0.02, s: 0.12, vitA: 8000, vitE: 15, ee: 2.8, pdr: 65, selected: false, ch4Potential: 22.0 },
  { id: '20', name: 'Farelo de Amendoim', type: 'concentrado', price: 2.2, pb: 48, ndt: 82, fdn: 18, ms: 90, ca: 0.25, p: 0.60, mg: 0.35, k: 1.40, na: 0.03, s: 0.30, vitA: 0, vitE: 5, ee: 1.8, pdr: 40, selected: false, ch4Potential: 14.5 },
  { id: '21', name: 'Casca de Algodão', type: 'volumoso', price: 0.8, pb: 4, ndt: 42, fdn: 85, ms: 90, ca: 0.20, p: 0.10, mg: 0.15, k: 0.80, na: 0.02, s: 0.10, vitA: 0, vitE: 0, ee: 1.5, pdr: 50, selected: false, ch4Potential: 23.5 },
  { id: '22', name: 'Monensina Sódica', type: 'aditivo', price: 45.0, pb: 0, ndt: 0, fdn: 0, ms: 95, ca: 0, p: 0, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0, ee: 0, pdr: 0, maxIncl: 0.03, selected: false, ch4Potential: 0 },
  { id: '23', name: 'Virginiamicina', type: 'aditivo', price: 85.0, pb: 0, ndt: 0, fdn: 0, ms: 95, ca: 0, p: 0, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0, ee: 0, pdr: 0, maxIncl: 0.02, selected: false, ch4Potential: 0 },
  { id: '24', name: 'Probiótico', type: 'aditivo', price: 25.0, pb: 0, ndt: 0, fdn: 0, ms: 95, ca: 0, p: 0, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0, ee: 0, pdr: 0, maxIncl: 0.1, selected: false, ch4Potential: 0 },
];

export function calculateRequirements(profile: DietAnimalProfile): DietRequirements {
  const { weight, finalWeight, adg, sex, raca, frameSize } = profile;
  // Use average weight for the period
  const BW = (weight + finalWeight) / 2;
  const ADG = adg || profile.gmd; // Fallback to gmd if adg is not explicitly provided in the profile

  // NRC/NASEM 2016 (BCNRM 2016) Equations
  const SBW = BW * 0.96;
  const EBW = SBW * 0.891;
  const EBG = ADG * 0.951;

  // DMI Prediction for finishing cattle (such as NRC/NASEM 2016 Table 25.1 / global empirical base)
  let DMI = sex === 'femea' 
    ? 3.184 + 0.01536 * SBW 
    : 3.83 + 0.0143 * SBW;

  // Adjust DMI for frame size
  if (frameSize === 'pequeno') DMI *= 0.95;
  if (frameSize === 'grande') DMI *= 1.05;

  // NEm Requirement (Base is 0.077 * SBW^0.75)
  // Race Adjustment: Zebu (Nellore in Brazil) has ~10% lower maintenance requirement
  const raceMultiplier = raca === 'zebuino' ? 0.90 : 1.0;
  // Sex Adjustment: Intact males (inteiro) have ~15% higher maintenance than steers/heifers
  const sexMultiplier = sex === 'inteiro' ? 1.15 : 1.0;

  const NEm = 0.077 * Math.pow(SBW, 0.75) * raceMultiplier * sexMultiplier;
  
  // Standard Reference Weight is 478kg for standard steer
  const SRW = 478;
  const FBW = finalWeight || 550;
  const EQSBW = SBW * (SRW / FBW);
  
  const NEg = 0.0635 * Math.pow(EQSBW, 0.75) * Math.pow(EBG, 1.097);

  // NASEM 2016 standard metabolizable protein for maintenance
  const MPm = 4.1 * Math.pow(SBW, 0.75);
  // NPg calculation (NRC/NASEM 2016 standard)
  const NPg = EBG * (268 - (29.4 * (NEg / EBG)));
  
  const kGain = 0.492;
  const MPtotal = MPm + (NPg / kGain);
  
  // CP Estimation (approximate efficiency for NRC)
  const CP = MPtotal / 0.67;

  // Mineral reqs NRC/NASEM 2016 (approximate based on BW and ADG)
  const CaReq = (0.0154 * SBW) + (0.071 * NPg);
  const PReq = (0.016 * SBW) + (0.039 * NPg);

  // Exact NDT requirement from ME requirement:
  // NEm_req and NEg_req are converted to ME using average finishing efficiencies (km = 0.64, kg = 0.42)
  const ME_m = NEm / 0.64;
  const ME_g = NEg / 0.42;
  const ME_total = ME_m + ME_g;
  // ME (Mcal/kg DM) = 0.03615 * NDT (%) -> NDT (%) = (ME_total / DMI) / 0.03615
  const ndtNeeded = (ME_total / DMI) / 0.03615;

  return {
    pbMin: Math.max(9, (CP / 1000 / DMI) * 100),
    ndtMin: Math.max(62, Math.min(85, ndtNeeded)),
    fdnMin: 18,
    fdnMax: 28,
    caMin: (CaReq / 1000 / DMI / 0.5) * 100, // Efficiency ~50%
    pMin: (PReq / 1000 / DMI / 0.7) * 100, // Efficiency ~70%
    eeMax: 7,
    pdrMin: 65,
    pdrMax: 80,
    ureaMax: 1.0,
    caPRatioMin: 1.5,
    caPRatioMax: 2.5,
    cms: DMI,
    forageMin: 10,
    forageMax: 100,
    optimizationGoal: 'cost' // Default to cost
  };
}

function predictGMD(nutritionalProfile: any, profile: DietAnimalProfile, cms: number): number {
  const { weight, finalWeight, raca, sex } = profile;
  const BW = (weight + finalWeight) / 2;
  const NDT = nutritionalProfile.ndt;

  // NDT to ME (Mcal/kg) approx: ME = 0.04409 * NDT * 0.82
  const ME = 0.04409 * NDT * 0.82;
  const SBW = BW * 0.96;
  
  // Race and Sex adjustments for maintenance
  const raceMultiplier = raca === 'zebuino' ? 0.90 : 1.0;
  const sexMultiplier = sex === 'inteiro' ? 1.15 : 1.0;
  const NEm_req = 0.077 * Math.pow(SBW, 0.75) * raceMultiplier * sexMultiplier;
  
  // NEm and NEg of diet (Garrett & Lofgreen equations used in NRC/NASEM 2016)
  const ME_capped = Math.max(1.5, Math.min(3.5, ME));
  const NEm_diet = 1.37 * ME_capped - 0.138 * Math.pow(ME_capped, 2) + 0.0105 * Math.pow(ME_capped, 3) - 1.12;
  const NEg_diet = 1.42 * ME_capped - 0.174 * Math.pow(ME_capped, 2) + 0.0122 * Math.pow(ME_capped, 3) - 1.65;
  
  // DMI required for maintenance
  const DMI_m = NEm_req / NEm_diet;
  // DMI remaining for gain
  const DMI_g = Math.max(0, cms - DMI_m);
  // Net energy available for gain
  const NEg_available = DMI_g * NEg_diet;
  
  const SRW = 478;
  const FBW = finalWeight || 550;
  const EQSBW = SBW * (SRW / FBW);
  
  // EBG (Empty Body Weight Gain) from NEg available
  const EBG = Math.pow(NEg_available / (0.0635 * Math.pow(EQSBW, 0.75)), 1 / 1.097);
  // ADG (Average Daily Gain) = EBG / 0.951
  const ADG = EBG / 0.951;
  
  return isNaN(ADG) ? 0 : ADG;
}

export function optimizeDiet(
  ingredients: Ingredient[],
  requirements: DietRequirements,
  profile: DietAnimalProfile
): DietOptimizationResult {
  let currentRequirements = { ...requirements };
  let lastResult: DietOptimizationResult | null = null;
  let iterations = 0;
  const MAX_ITERATIONS = 5;
  const CONVERGENCE_THRESHOLD = 0.01;

  while (iterations < MAX_ITERATIONS) {
    const isGmdGoal = currentRequirements.optimizationGoal === 'gmd';
    const isEcoGoal = currentRequirements.optimizationGoal === 'eco';
    
    const model: any = {
      optimize: 'objective',
      opType: 'min',
      constraints: {
        total: { equal: 100 },
        pb: { min: 0 },
        ndt: { min: 0 },
        fdn: { min: (currentRequirements.fdnMin || 15) * 100, max: (currentRequirements.fdnMax || 30) * 100 },
        ca: { min: currentRequirements.caMin * 100 },
        p: { min: currentRequirements.pMin * 100 },
        ee: { max: (currentRequirements.eeMax || 7) * 100 },
        urea: { max: (currentRequirements.ureaMax || 1) * 100 },
        pdrMinConstraint: { min: 0 },
        pdrMaxConstraint: { min: 0 },
        caPRatioMinConstraint: { min: 0 },
        caPRatioMaxConstraint: { min: 0 },
        pdrNdtRatioMinConstraint: { min: 0 },
        forageConstraint: { min: currentRequirements.forageMin ?? 0, max: currentRequirements.forageMax ?? 100 },
      },
      variables: {},
    };

    const safetyFactor = 1.01;
    const pbPenalty = 10000;
    const ndtPenalty = 50000;

    model.variables.slack_pb = {
      objective: pbPenalty,
      pb: 100,
    };
    model.variables.slack_ndt = {
      objective: ndtPenalty,
      ndt: 100,
    };

    model.constraints.pb = { min: currentRequirements.pbMin * 100 * ((isGmdGoal || isEcoGoal) ? 1 : safetyFactor) };
    model.constraints.ndt = { min: currentRequirements.ndtMin * 100 };

    // Para Eco-Otimo: penalizamos ingredientes com alto potencial de metano no objetivo
    // O Carbon Methane Cost (proxy de penalidade) -> ex: R$ 0.10 por cada grama CH4/kg MS para refletir um forte incentivo a ingredientes "limpos".
    const ch4PenaltyCost = 0.05; 

    ingredients.filter(ing => ing.selected).forEach((ing) => {
      const priceMS = ing.price / (ing.ms / 100);
      let objectiveValue = priceMS;
      
      if (isEcoGoal && ing.ch4Potential) {
        objectiveValue += (ing.ch4Potential * ch4PenaltyCost);
      }
      
      const pdrDM = (ing.pdr || 0) * (ing.pb / 100);

      model.variables[ing.name] = {
        objective: objectiveValue,
        total: 1,
        pb: ing.pb,
        ndt: ing.ndt,
        fdn: ing.fdn,
        ca: ing.ca,
        p: ing.p,
        ee: ing.ee || 0,
        urea: ing.isUrea ? 100 : 0,
        pdrMinConstraint: ing.pb * ((ing.pdr || 0) - (currentRequirements.pdrMin || 0)),
        pdrMaxConstraint: ing.pb * ((currentRequirements.pdrMax || 100) - (ing.pdr || 0)),
        caPRatioMinConstraint: ing.ca - (currentRequirements.caPRatioMin || 0) * ing.p,
        caPRatioMaxConstraint: (currentRequirements.caPRatioMax || 10) * ing.p - ing.ca,
        pdrNdtRatioMinConstraint: pdrDM - 0.10 * ing.ndt,
        forageConstraint: ing.type === 'volumoso' ? 1 : 0,
      };

      if (ing.minIncl !== undefined) {
        model.constraints[`min_${ing.name}`] = { min: ing.minIncl };
        model.variables[ing.name][`min_${ing.name}`] = 1;
      }
      if (ing.maxIncl !== undefined) {
        model.constraints[`max_${ing.name}`] = { max: ing.maxIncl };
        model.variables[ing.name][`max_${ing.name}`] = 1;
      }
    });

    const solution = solver.Solve(model) as any;
    
    if (!solution.feasible) {
      return {
        feasible: false,
        ingredients: [],
        totalCost: 0,
        totalCostMN: 0,
        foragePercentage: 0,
        concentratePercentage: 0,
        cmsPercentageBW: 0,
        forageIntakeMN: 0,
        concentrateIntakeMN: 0,
        forageCostMN: 0,
        concentrateCostMN: 0,
        forageCostPerKgMN: 0,
        concentrateCostPerKgMN: 0,
        forageCostPerKgMS: 0,
        concentrateCostPerKgMS: 0,
        predictedGmd: 0,
        feedConversion: 0,
        waterIntake: 0,
        alerts: [],
        nutritionalProfile: { pb: 0, ndt: 0, fdn: 0, ee: 0, pdr: 0, ca: 0, p: 0, mg: 0, k: 0, na: 0, s: 0, vitA: 0, vitE: 0 }
      };
    }

    const result = processSolution(solution, ingredients, currentRequirements, profile);

    if (lastResult && Math.abs(result.predictedGmd - lastResult.predictedGmd) < CONVERGENCE_THRESHOLD) {
      return result;
    }

    // Adjust requirements to hit the target GMD regardless of the optimization goal
    if (Math.abs(result.predictedGmd - profile.gmd) > 0.05) {
      const ndtAdjustment = (profile.gmd - result.predictedGmd) * 2; 
      currentRequirements.ndtMin = Math.max(60, Math.min(85, currentRequirements.ndtMin + ndtAdjustment));
    }

    lastResult = result;
    iterations++;
  }

  return lastResult!;
}

function processSolution(
  result: any,
  ingredients: Ingredient[],
  requirements: DietRequirements,
  profile: DietAnimalProfile
): DietOptimizationResult {
  const optimizedIngredients = ingredients
    .map(ing => {
      const percentage = result[ing.name] || 0;
      const priceMS = ing.price / (ing.ms / 100);
      return {
        name: ing.name,
        percentage: percentage,
        costContribution: (percentage / 100) * priceMS
      };
    })
    .filter(ing => ing.percentage > 0);

  // Calculate actual nutritional profile and NM cost
  let actualPb = 0;
  let actualNdt = 0;
  let actualFdn = 0;
  let actualEe = 0;
  let actualPdr = 0;
  let actualCa = 0;
  let actualP = 0;
  let actualMg = 0;
  let actualK = 0;
  let actualNa = 0;
  let actualS = 0;
  let actualVitA = 0;
  let actualVitE = 0;
  let totalMNWeight = 0;
  let totalUrea = 0;
  
  let foragePercentage = 0;
  let concentratePercentage = 0;
  let forageIntakeMN = 0;
  let concentrateIntakeMN = 0;
  let forageCostMN = 0;
  let concentrateCostMN = 0;
  let forageCostMS = 0;
  let concentrateCostMS = 0;

  const cms = requirements.cms || 0;
  const BW = (profile.weight + profile.finalWeight) / 2;

  optimizedIngredients.forEach(optIng => {
    const ing = ingredients.find(i => i.name === optIng.name)!;
    const intakeDM = (optIng.percentage / 100) * cms;
    const intakeNM = intakeDM / (ing.ms / 100);
    const costNM = intakeNM * ing.price;

    actualPb += (optIng.percentage / 100) * ing.pb;
    actualNdt += (optIng.percentage / 100) * ing.ndt;
    actualFdn += (optIng.percentage / 100) * ing.fdn;
    actualEe += (optIng.percentage / 100) * (ing.ee || 0);
    actualPdr += (optIng.percentage / 100) * (ing.pdr || 0) * (ing.pb / 100);
    actualCa += (optIng.percentage / 100) * ing.ca;
    actualP += (optIng.percentage / 100) * ing.p;
    actualMg += (optIng.percentage / 100) * (ing.mg || 0);
    actualK += (optIng.percentage / 100) * (ing.k || 0);
    actualNa += (optIng.percentage / 100) * (ing.na || 0);
    actualS += (optIng.percentage / 100) * (ing.s || 0);
    actualVitA += (optIng.percentage / 100) * (ing.vitA || 0);
    actualVitE += (optIng.percentage / 100) * (ing.vitE || 0);
    totalMNWeight += (optIng.percentage / (ing.ms || 100));
    if (ing.isUrea) totalUrea += optIng.percentage;

    if (ing.type === 'volumoso') {
      foragePercentage += optIng.percentage;
      forageIntakeMN += intakeNM;
      forageCostMN += costNM;
      forageCostMS += optIng.costContribution;
    } else {
      concentratePercentage += optIng.percentage;
      concentrateIntakeMN += intakeNM;
      concentrateCostMN += costNM;
      concentrateCostMS += optIng.costContribution;
    }
  });

  const totalCostDM = optimizedIngredients.reduce((sum, ing) => sum + ing.costContribution, 0);
  const totalCostMN = totalCostDM / totalMNWeight;
  const cmsPercentageBW = (cms / BW) * 100;
  const waterIntake = 0.05 * BW + 4 * cms;

  const predictedGmd = predictGMD({ ndt: actualNdt, pb: actualPb }, profile, cms);
  const feedConversion = predictedGmd > 0 ? cms / predictedGmd : 0;

  // Calculo de Métricas Ambientais (Eco-ótima)
  const estimatedCh4DailyVal = optimizedIngredients.reduce((sum, optIng) => {
    const ing = ingredients.find(i => i.name === optIng.name)!;
    const intakeDM = (optIng.percentage / 100) * cms;
    return sum + intakeDM * (ing.ch4Potential || 0);
  }, 0);

  const estimatedCo2DailyVal = estimatedCh4DailyVal * 28; // g CO2e/dia (CH4 GWP = 28)

  const nitrogenIntakeDaily = (cms * (actualPb / 100) * 1000) / 6.25;
  const nitrogenRetentionDaily = (predictedGmd * 0.15 * 1000) / 6.25;
  const nitrogenBalanceDailyVal = Math.max(0, nitrogenIntakeDaily - nitrogenRetentionDaily);

  // Technical Alerts & Metabolic Disorders
  const alerts: string[] = [];
  
  if (result.slack_pb > 0 || result.slack_ndt > 0) {
    alerts.push(`Atenção: Meta nutricional (GMD) não atingida com os insumos selecionados. Otimizado para o máximo possível.`);
  }

  const caPRatio = actualP > 0 ? actualCa / actualP : 0;
  if (caPRatio < 1.5) alerts.push(`Relação Ca:P baixa (${caPRatio.toFixed(2)}). Risco de cálculos urinários e desequilíbrio mineral.`);
  if (caPRatio > 2.5) alerts.push(`Relação Ca:P alta (${caPRatio.toFixed(2)}).`);
  
  if (actualEe > 7) alerts.push(`Extrato Etéreo alto (${actualEe.toFixed(1)}%). Risco de inibição da fibra ruminal e diarreia.`);
  if (totalUrea > 1.0) alerts.push(`Ureia alta (${totalUrea.toFixed(2)}% da MS). Risco de intoxicação amoniacal.`);
  
  // Acidosis risk
  if (actualFdn < 18 || concentratePercentage > 80) {
    alerts.push(`ALTO RISCO DE ACIDOSE: Baixa fibra (${actualFdn.toFixed(1)}% FDN) e/ou alto concentrado (${concentratePercentage.toFixed(0)}%).`);
  } else if (actualFdn < 22 || concentratePercentage > 70) {
    alerts.push(`Risco moderado de acidose subaguda (SARA). Monitore o pH ruminal.`);
  }

  // Tympanism (Bloat) risk - associated with high concentrate and fine particles
  if (concentratePercentage > 75 && actualFdn < 20) {
    alerts.push(`Risco de Timpanismo: Dieta com alta fermentescibilidade e baixo estímulo de ruminação.`);
  }

  // Laminitis risk (secondary to acidosis)
  if (actualFdn < 16) {
    alerts.push(`Risco de Laminite: Decorrente de acidose láctica severa por falta de fibra efetiva.`);
  }
  
  const pdrNdtRatio = actualNdt > 0 ? actualPdr / actualNdt : 0;
  if (pdrNdtRatio < 0.10) alerts.push(`Relação PDR:NDT baixa (${pdrNdtRatio.toFixed(2)}). Risco de deficiência de N para bactérias.`);

  return {
    feasible: true,
    ingredients: optimizedIngredients,
    totalCost: totalCostDM,
    totalCostMN: totalCostMN,
    cms: cms,
    foragePercentage,
    concentratePercentage,
    cmsPercentageBW,
    forageIntakeMN: forageIntakeMN,
    concentrateIntakeMN: concentrateIntakeMN,
    forageCostMN: forageCostMN,
    concentrateCostMN: concentrateCostMN,
    forageCostPerKgMN: forageIntakeMN > 0 ? forageCostMN / forageIntakeMN : 0,
    concentrateCostPerKgMN: concentrateIntakeMN > 0 ? concentrateCostMN / concentrateIntakeMN : 0,
    forageCostPerKgMS: foragePercentage > 0 ? (forageCostMS / (foragePercentage / 100)) : 0,
    concentrateCostPerKgMS: concentratePercentage > 0 ? (concentrateCostMS / (concentratePercentage / 100)) : 0,
    predictedGmd,
    feedConversion,
    waterIntake,
    estimatedCh4Daily: estimatedCh4DailyVal,
    estimatedCo2Daily: estimatedCo2DailyVal,
    nitrogenBalanceDaily: nitrogenBalanceDailyVal,
    alerts,
    nutritionalProfile: {
      pb: actualPb,
      ndt: actualNdt,
      fdn: actualFdn,
      ee: actualEe,
      pdr: actualPb > 0 ? (actualPdr / actualPb) * 100 : 0,
      ca: actualCa,
      p: actualP,
      mg: actualMg,
      k: actualK,
      na: actualNa,
      s: actualS,
      vitA: actualVitA,
      vitE: actualVitE
    }
  };
}

export function recalculateDietWithPercentages(
  percentages: { name: string; percentage: number }[],
  ingredients: Ingredient[],
  requirements: DietRequirements,
  profile: DietAnimalProfile
): DietOptimizationResult {
  const resultObj: any = {
    slack_pb: 0,
    slack_ndt: 0
  };
  percentages.forEach(p => {
    resultObj[p.name] = p.percentage;
  });
  return processSolution(resultObj, ingredients, requirements, profile);
}

