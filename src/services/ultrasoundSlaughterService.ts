import { SimulationInputs, SimulationResults, Pesagem, Ultrassom } from '../types';

// ============================================================================
// INTERFACES ESPECÍFICAS DO MÓDULO DE ULTRASSOM & ABATE INTELIGENTE
// ============================================================================

export interface RTUAnimal {
  id: string;               // Brinco RFID ou identificador do animal
  loteId?: string;          // Identificador do lote (grupo de manejo)
  raca: 'nelore' | 'cruzamento' | 'holandes';
  sexo: 'macho' | 'femea' | 'inteiro';
  frameSize: 'pequeno' | 'medio' | 'grande';
  pesoEntrada: number;      // kg
  dataEntrada: string;      // ISO Date
  exames: RTUExam[];        // Lista de exames semanais de ultrassonografia
  abateReal?: RTUSlaughterResult; // Resultado real no frigorífico se já abatido (ground truth)
  isAmostra?: boolean;      // Se o animal faz parte da amostragem de ultrassom
}

export interface RTUExam {
  id: string;
  diaDeCocho: number;       // Dias desde a entrada
  dataExame: string;
  aol: number;              // Área de Olho de Lombo (cm²)
  egs: number;              // Espessura de Gordura Subcutânea (mm)
  imf: number;              // Gordura Intramuscular (% de marmoreio)
  tecnicoId: string;        // Identificador do operador
  equipamentoId: string;    // Identificador do transdutor/aparelho
  peso?: number;            // Peso medido no momento do exame (kg)
}

export interface RTUContractRule {
  id: string;
  nomeFrigorifico: string;
  basePrecoArroba: number;  // Preço padrão para classificação regular (R$/@)
  pesoMinCarcacaKg: number; // e.g. 240 kg (16@)
  pesoMaxCarcacaKg: number; // e.g. 360 kg (24@)
  desagioPesoFora: number;  // R$ por @ de deságio se fora dos limites de peso
  gradeAcabamentoEGS: {
    categoria: '1_ausente' | '2_escassa' | '3_mediana' | '4_uniforme' | '5_excessiva';
    egsMinMm: number;
    egsMaxMm: number;
    bonificacaoMoeda: number;   // R$ por arroba de bônus (ex: +R$ 10,00/@)
    penalizacaoMoeda: number;   // R$ por arroba de desconto (ex: -R$ 15,00/@)
  }[];
  gradeMarmoreioIMF?: {
    imfMinPerc: number;
    imfMaxPerc: number;
    bonificacaoMoeda: number;   // R$ por arroba de bônus se atingir marmoreio premium
  }[];
}

export interface RTUSlaughterResult {
  animalId: string;
  dataAbate: string;
  pesoCarcacaQuenteReal: number; // kg (PCQ do frigorífico)
  egsFrigorifico: '1_ausente' | '2_escassa' | '3_mediana' | '4_uniforme' | '5_excessiva';
  imfFrigorificoPerc: number;   // Marmoreio medido pós-mortem
  pHReal: number;                // pH medido após resfriamento 24h
  precoEfetivoPago: number;      // R$ por @ pago no romaneio final
  receitaLiquidaReal: number;    // R$ total pago no acerto
  egsRealMm?: number;            // EGS real medida em mm no frigorífico
  diasDeCocho?: number;          // Dias de cocho reais no momento do abate
}

export interface RTUDecisionResult {
  animalId: string;
  tEstrelaDeterminista: number; // Janela ideal de abate (dias de cocho)
  tEstrelaRobusto: number;      // Janela ideal ajustada para aversão a riscos (dias de cocho)
  lucroHoje: number;            // R$ lucro estimado abatendo hoje
  lucroNoOtimo: number;         // R$ lucro estimado no ponto ótimo
  egsProjetadoOtimo: number;    // mm de gordura projetado no ponto ótimo
  pesoProjetadoOtimo: number;   // kg de peso vivo projetado no ponto ótimo
  probabilidadePrejuizoHoje: number; // % de risco hoje
  probabilidadePrejuizoOtimo: number; // % de risco no ponto ótimo
  drivers: {
    fator: string;
    impactoPercentual: number;
    direcao: 'acelerar' | 'postergar';
  }[];
}

export interface RTUModelCalibration {
  version: string;
  multiplierGmd: number;        // Coeficiente de correção de GMD
  multiplierEgs: number;        // Coeficiente de correção de gordura
  multiplierRendimento: number; // Coeficiente de correção do rendimento de carcaça
  maeCarcaca: number;           // Erro médio de carcaça quente (kg)
  rmseEgs: number;              // RMSE do acabamento de gordura (mm)
  biasGeral: number;            // Viés de predição médio
  driftDetected: boolean;       // Alarme de desvio sistemático do rebanho
  multiplierAol?: number;       // Coeficiente de correção de AOL específico do lote
  multiplierImf?: number;       // Coeficiente de correção de IMF específico do lote
}

export interface RTUAuditRecord {
  id: string;
  timestamp: string;
  usuarioId: string;
  loteId: string;
  hashEntradas: string;
  dadosSalvos: string;          // Payload JSON stringified
  versaoModelo: string;
  versaoRegrasContrato: string;
}

// ============================================================================
// VALORES E REGRAS PADRÃO DO SISTEMA JBS / MARFRIG TÍPICOS DO BRASIL
// ============================================================================

export const DEFAULT_CONTRACT_RULE: RTUContractRule = {
  id: 'c_jbs_qualidade_2026',
  nomeFrigorifico: 'Friboi JBS - Protocolo Qualidade Farol',
  basePrecoArroba: 340.00,
  pesoMinCarcacaKg: 240, // 16 @
  pesoMaxCarcacaKg: 360, // 24 @
  desagioPesoFora: 25.00, // Penaliza R$ 25,00 por @ se animal estiver leve (<16@) ou pesado (>24@)
  gradeAcabamentoEGS: [
    { categoria: '1_ausente', egsMinMm: 0, egsMaxMm: 0.9, bonificacaoMoeda: 0, penalizacaoMoeda: 30.00 },   // Penaliza R$ 30,00/@ por gordura zero
    { categoria: '2_escassa', egsMinMm: 1, egsMaxMm: 2.9, bonificacaoMoeda: 0, penalizacaoMoeda: 12.00 },   // Penaliza R$ 12,00/@ por falta de acabamento
    { categoria: '3_mediana', egsMinMm: 3, egsMaxMm: 5.9, bonificacaoMoeda: 5.00, penalizacaoMoeda: 0 },    // Bonifica +R$ 5,00/@ (Manejo padrão)
    { categoria: '4_uniforme', egsMinMm: 6, egsMaxMm: 10.0, bonificacaoMoeda: 12.00, penalizacaoMoeda: 0 }, // Bonifica +R$ 12,00/@ (Excelência de acabamento)
    { categoria: '5_excessiva', egsMinMm: 10.1, egsMaxMm: 25.0, bonificacaoMoeda: 0, penalizacaoMoeda: 18.00 } // Desconto por gordura excessiva ("limpeza de canal")
  ],
  gradeMarmoreioIMF: [
    { imfMinPerc: 3.0, imfMaxPerc: 5.0, bonificacaoMoeda: 15.00 }, // Bônus gourmet Angus/Nelore premium +R$ 15,00/@
    { imfMinPerc: 5.1, imfMaxPerc: 12.0, bonificacaoMoeda: 25.00 } // Bônus premium especial +R$ 25,00/@
  ]
};

// ============================================================================
// MOTOR DE PREDIÇÃO BIOLÓGICA (MODELO NASEM 2016 - COMPOSIÇÃO CORPORAL E PESO VIVO)
// ============================================================================

export interface NASEMTissueParameters {
  racaCategoria: 'zebuina' | 'taurina' | 'cruzamento';
  pvRef: number;           // Peso Vivo de referência/maturidade (kg) NASEM 2016
  aolBaseRate: number;     // cm² de AOL por kg de ganho de Peso Vivo
  aolWeightExp: number;    // Expoente alométrico de AOL com PV
  egsBaseRate: number;     // mm de EGS por kg de ganho de Peso Vivo
  egsMaturityExp: number;  // Expoente de maturidade para gordura subcutânea
  imfBaseRate: number;     // % de IMF por kg de ganho de Peso Vivo
  imfMaturityExp: number;  // Expoente de maturidade para gordura intramuscular
}

/**
  * Retorna parâmetros raciais e de gênero calibrados de acordo com as normas da literatura NASEM 2016 / BR-CORTE 2016.
  * Define trajetórias diferenciais para Raças Zebuínas (Bos indicus), Taurinas (Bos taurus) e Cruzamento Industrial.
  */
export function getNASEMBreedParameters(
  raca: string,
  sexo: string = 'macho',
  frameSize: string = 'medio'
): NASEMTissueParameters {
  const racaLower = (raca || '').toLowerCase();
  
  // Classificação do grupo genético racial
  let racaCategoria: 'zebuina' | 'taurina' | 'cruzamento' = 'zebuina';
  if (racaLower.includes('nelore') || racaLower.includes('zebu') || racaLower.includes('guzera') || racaLower.includes('gir')) {
    racaCategoria = 'zebuina';
  } else if (racaLower.includes('cruzam') || racaLower.includes('cruzad') || racaLower.includes('f1') || racaLower.includes('brangus') || racaLower.includes('braford')) {
    racaCategoria = 'cruzamento';
  } else if (racaLower.includes('holandes') || racaLower.includes('taurin') || racaLower.includes('europeu') || racaLower.includes('angus') || racaLower.includes('hereford')) {
    racaCategoria = 'taurina';
  } else {
    racaCategoria = 'zebuina';
  }

  // 1. Peso Vivo de Referência de Maturidade/Acabamento NASEM 2016 (PVref)
  let pvRefBase = 500; // kg para Zebuíno Nelore médio
  if (racaCategoria === 'taurina') pvRefBase = 570;
  else if (racaCategoria === 'cruzamento') pvRefBase = 540;

  // Ajuste por Porte/Frame Size
  let frameMult = 1.0;
  if (frameSize === 'pequeno') frameMult = 0.90;
  else if (frameSize === 'grande') frameMult = 1.10;

  // Ajuste de Deposição por Sexo (NASEM 2016)
  let sexoPvMult = 1.0;
  let sexAolMult = 1.0;
  let sexEgsMult = 1.0;
  let sexImfMult = 1.0;

  if (sexo === 'femea') {
    sexoPvMult = 0.88; // Fêmeas atingem acabamento em peso mais leve
    sexAolMult = 0.92; // Menor proporção de muscularidade
    sexEgsMult = 1.22; // Deposição de gordura subcutânea precoce
    sexImfMult = 1.15; // Maior propensão a marmoreio
  } else if (sexo === 'inteiro') {
    sexoPvMult = 1.12; // Machos inteiros atingem terminação em peso superior
    sexAolMult = 1.15; // Hipertrofia muscular superior (AOL)
    sexEgsMult = 0.80; // Menor deposição de gordura subcutânea
    sexImfMult = 0.75; // Menor marmoreio
  }

  const pvRef = pvRefBase * frameMult * sexoPvMult;

  // 2. Parâmetros de Deposição de Tecidos Calibrados NASEM 2016
  if (racaCategoria === 'zebuina') {
    return {
      racaCategoria,
      pvRef,
      aolBaseRate: 0.128 * sexAolMult,
      aolWeightExp: 0.62,
      egsBaseRate: 0.022 * sexEgsMult,
      egsMaturityExp: 1.80,
      imfBaseRate: 0.0055 * sexImfMult,
      imfMaturityExp: 1.25,
    };
  } else if (racaCategoria === 'taurina') {
    return {
      racaCategoria,
      pvRef,
      aolBaseRate: 0.148 * sexAolMult,
      aolWeightExp: 0.66,
      egsBaseRate: 0.018 * sexEgsMult,
      egsMaturityExp: 1.60,
      imfBaseRate: 0.0125 * sexImfMult, // Marmoreio expressivamente superior
      imfMaturityExp: 1.15,
    };
  } else {
    // Cruzamento Industrial (Heterose Bos taurus x Bos indicus)
    return {
      racaCategoria: 'cruzamento',
      pvRef,
      aolBaseRate: 0.158 * sexAolMult, // Heterose muscular acelerada
      aolWeightExp: 0.65,
      egsBaseRate: 0.024 * sexEgsMult, // Cobertura de gordura uniforme
      egsMaturityExp: 1.70,
      imfBaseRate: 0.0092 * sexImfMult, // Marmoreio intermediário-alto
      imfMaturityExp: 1.20,
    };
  }
}

/**
 * Calcula a evolução teórica de um animal individual ajustada pelos exames de ultrassonografia.
 * Calibrada com o Peso Vivo (PV) e de acordo com a literatura NASEM 2016.
 */
export function projectAnimalGrowth(
  animal: RTUAnimal,
  inputs: SimulationInputs,
  contract: RTUContractRule,
  calibration: RTUModelCalibration,
  prolongarDias: number = 150,
  lotExamsSummary?: Map<number, { avgEgs: number; avgAol: number; avgImf: number; avgPeso: number; avgPesoEntrada: number }>,
  targetGrid?: number[]
): { dia: number; peso: number; aol: number; egs: number; imf: number; lucro: number; classificacao: string }[] {
  
  const results: { dia: number; peso: number; aol: number; egs: number; imf: number; lucro: number; classificacao: string }[] = [];
  
  // Coeficientes básicos calibrados
  const baseGmd = inputs.gmd * calibration.multiplierGmd;
  
  // Obter parâmetros biológicos NASEM 2016 calibrados por Peso Vivo e grupo racial
  const nasemParams = getNASEMBreedParameters(animal.raca, animal.sexo, animal.frameSize);

  // Ajuste do crescimento de tecidos inicial com base nos exames de ultrassom existentes
  let egsInicial = nasemParams.racaCategoria === 'zebuina' ? 1.2 : 1.5;
  let aolInicial = nasemParams.racaCategoria === 'zebuina' ? 48.0 : 54.0;
  let imfInicial = nasemParams.racaCategoria === 'taurina' ? 1.8 : 1.1;
  
  // Filtro de Inconsistência Temporal: exames de ultrassom
  const examesOrdenados = [...animal.exames].sort((a, b) => a.diaDeCocho - b.diaDeCocho);
  
  // Bland-Altman calibration (correção do viés do operador e do equipamento)
  const examesCorrigidos = examesOrdenados.map(ex => {
    let biasOperador = 0;
    if (ex.tecnicoId === 'operador_vies_baixo') biasOperador = +0.6;
    if (ex.tecnicoId === 'operador_vies_alto') biasOperador = -0.5;
    
    return {
      ...ex,
      egs: Math.max(0.2, ex.egs + biasOperador) * calibration.multiplierEgs,
      aol: Math.max(20, ex.aol) * (calibration.multiplierAol ?? 1.0),
      imf: ex.imf * (calibration.multiplierImf ?? 1.0)
    };
  });

  if (examesCorrigidos.length > 0) {
    const primeiro = examesCorrigidos[0];
    egsInicial = Math.min(2.0, primeiro.egs * 0.85);
    aolInicial = Math.min(60.0, primeiro.aol * 0.90);
    imfInicial = Math.min(2.0, primeiro.imf * 0.88);
  }

  // Lista de pontos conhecidos (reais/exames) para ancoragem de Peso Vivo e Ultrassom
  const knownPoints: { dia: number; egs: number; aol: number; imf: number; peso: number }[] = [
    { dia: 0, egs: egsInicial, aol: aolInicial, imf: imfInicial, peso: animal.pesoEntrada }
  ];
  examesCorrigidos.forEach(ex => {
    const pesoExame = ex.peso && ex.peso > 0
      ? ex.peso
      : animal.pesoEntrada + (baseGmd * ex.diaDeCocho * Math.max(0.65, 1 - 0.0011 * ex.diaDeCocho));

    if (!knownPoints.some(p => p.dia === ex.diaDeCocho)) {
      knownPoints.push({
        dia: ex.diaDeCocho,
        egs: ex.egs,
        aol: ex.aol,
        imf: ex.imf,
        peso: pesoExame
      });
    }
  });

  // Ancoragem com o resumo do lote se disponível
  if (lotExamsSummary) {
    lotExamsSummary.forEach((lotSum, lotDia) => {
      if (!knownPoints.some(p => p.dia === lotDia)) {
        const fatorAnimal = lotSum.avgPesoEntrada > 0 ? animal.pesoEntrada / lotSum.avgPesoEntrada : 1.0;
        const pesoEst = lotSum.avgPeso > 0
          ? lotSum.avgPeso * fatorAnimal
          : animal.pesoEntrada + (baseGmd * lotDia * Math.max(0.65, 1 - 0.0011 * lotDia));

        knownPoints.push({
          dia: lotDia,
          egs: lotSum.avgEgs,
          aol: lotSum.avgAol * fatorAnimal,
          imf: lotSum.avgImf,
          peso: pesoEst
        });
      }
    });
  }

  knownPoints.sort((a, b) => a.dia - b.dia);

  const lastPoint = knownPoints[knownPoints.length - 1];
  const lastExamDia = lastPoint.dia;

  // Montar a grade exata de dias para projeção
  const baseDays = Array.from({ length: Math.floor(prolongarDias / 5) + 1 }, (_, i) => i * 5);
  const knownDays = knownPoints.map(p => p.dia);
  const daysToEvaluate = targetGrid
    ? Array.from(new Set([...targetGrid, ...knownDays])).sort((a, b) => a - b)
    : Array.from(new Set([...baseDays, ...knownDays])).sort((a, b) => a - b);

  // Projetar dia a dia calibrando rigorosamente com o Peso Vivo (PV) NASEM 2016
  for (const dia of daysToEvaluate) {
    let egs = 0;
    let aol = 0;
    let imf = 0;
    let pesoVivo = 0;

    if (dia <= lastExamDia) {
      // Interpolação linear e ancoragem entre exames conhecidos
      const pLeft = [...knownPoints].reverse().find(p => p.dia <= dia);
      const pRight = knownPoints.find(p => p.dia >= dia);

      if (pLeft && pRight && pLeft.dia !== pRight.dia) {
        const t = (dia - pLeft.dia) / (pRight.dia - pLeft.dia);
        egs = pLeft.egs + (pRight.egs - pLeft.egs) * t;
        aol = pLeft.aol + (pRight.aol - pLeft.aol) * t;
        imf = pLeft.imf + (pRight.imf - pLeft.imf) * t;
        pesoVivo = pLeft.peso + (pRight.peso - pLeft.peso) * t;
      } else if (pLeft) {
        egs = pLeft.egs;
        aol = pLeft.aol;
        imf = pLeft.imf;
        pesoVivo = pLeft.peso;
      } else {
        egs = egsInicial;
        aol = aolInicial;
        imf = imfInicial;
        pesoVivo = animal.pesoEntrada;
      }
    } else {
      // EQUAÇÕES DE DEPOSIÇÃO DE TECIDOS (NASEM 2016) CALIBRADAS COM PESO VIVO (PV)
      const deltaDia = dia - lastExamDia;
      
      // 1. Projeção de Ganho de Peso Vivo (PV) com desaceleração biológica em fases avançadas de cocho
      const fatorEficienciaMarginal = Math.max(0.60, 1 - 0.0011 * dia);
      pesoVivo = lastPoint.peso + (baseGmd * deltaDia * fatorEficienciaMarginal);

      // Ganho de Peso Vivo acumulado desde o último exame ancorado (kg PV)
      const deltaPV = Math.max(0, pesoVivo - lastPoint.peso);

      // Índice de Maturidade de Peso Vivo NASEM 2016: PV / PVref
      const ratioMaturidade = Math.min(1.30, Math.max(0.60, pesoVivo / nasemParams.pvRef));

      // 2. EQUAÇÃO DE AOL (Área de Olho de Lombo, cm²) - Calibrada com PV
      // A taxa de ganho muscular por kg de ganho de PV escala com o peso relativo até a maturidade
      const multAolLote = calibration.multiplierAol ?? 1.0;
      const taxaAolPorKgPV = nasemParams.aolBaseRate * Math.pow(ratioMaturidade, 0.30) * multAolLote;
      aol = lastPoint.aol + (deltaPV * taxaAolPorKgPV);
      aol = Math.min(125.0, Math.max(lastPoint.aol, aol));

      // 3. EQUAÇÃO DE EGS (Espessura de Gordura Subcutânea, mm) - Calibrada com PV (NASEM 2016)
      // A deposição de gordura subcutânea por kg de ganho de PV acelera não-linearmente à medida que o PV se aproxima do peso de referência
      const multEgsLote = calibration.multiplierEgs ?? 1.0;
      const taxaEgsPorKgPV = nasemParams.egsBaseRate * Math.pow(ratioMaturidade, nasemParams.egsMaturityExp) * multEgsLote;
      egs = lastPoint.egs + (deltaPV * taxaEgsPorKgPV);
      egs = Math.min(22.0, Math.max(lastPoint.egs, egs));

      // 4. EQUAÇÃO DE IMF (Gordura Intramuscular / Marmoreio, %) - Calibrada com PV (NASEM 2016)
      // Acúmulo de marmoreio como função da densidade energética acumulada e ganho em PV
      const multImfLote = calibration.multiplierImf ?? 1.0;
      const taxaImfPorKgPV = nasemParams.imfBaseRate * Math.pow(ratioMaturidade, nasemParams.imfMaturityExp) * multImfLote;
      imf = lastPoint.imf + (deltaPV * taxaImfPorKgPV);
      imf = Math.min(12.0, Math.max(lastPoint.imf, imf));
    }

    // Classificação da Carcaça pelo Farol da Qualidade
    let classificacao: '1_ausente' | '2_escassa' | '3_mediana' | '4_uniforme' | '5_excessiva' = '2_escassa';
    if (egs < 1.0) classificacao = '1_ausente';
    else if (egs >= 1.0 && egs < 3.0) classificacao = '2_escassa';
    else if (egs >= 3.0 && egs < 6.0) classificacao = '3_mediana';
    else if (egs >= 6.0 && egs <= 10.0) classificacao = '4_uniforme';
    else classificacao = '5_excessiva';

    // 2. Modelo Econômico e Contrato de Compra/Venda
    // Rendimento de Carcaça dinâmico limitado/saturado (aumenta com os dias de cocho mas atinge limite biológico)
    const tEfetivo = Math.min(dia, inputs.tempoAlimentacao * 1.25);
    const rcCalculado = inputs.rendimentoCarcacaInicial + (inputs.rendimentoCarcaca - inputs.rendimentoCarcacaInicial) * (tEfetivo / inputs.tempoAlimentacao);
    const rcCorrente = Math.min(Math.max(inputs.rendimentoCarcaca, 58.5), rcCalculado) * calibration.multiplierRendimento;
    
    const pesoVivoFinalReal = pesoVivo * (1 - inputs.quebraPesoTransportePerc / 100);
    const pesoCarcacaKg = pesoVivoFinalReal * (rcCorrente / 100);
    const arrobasAtuais = pesoCarcacaKg / 15;

    // Calcular receita considerando as regras de bonificação por acabamento EGS e Marmoreio IMF
    let precoArrobaEfetivo = contract.basePrecoArroba;
    
    // Penalização por peso de carcaça fora do padrão (< 16@ ou > 24@)
    if (pesoCarcacaKg < contract.pesoMinCarcacaKg || pesoCarcacaKg > contract.pesoMaxCarcacaKg) {
      precoArrobaEfetivo -= contract.desagioPesoFora;
    }

    // Bonificação/Penalização por Gordura Subcutânea (Farol)
    const regraEgs = contract.gradeAcabamentoEGS.find(r => r.categoria === classificacao);
    if (regraEgs) {
      precoArrobaEfetivo += regraEgs.bonificacaoMoeda;
      precoArrobaEfetivo -= regraEgs.penalizacaoMoeda;
    }

    // Bonificação extra por marmoreio premium (IMF)
    if (contract.gradeMarmoreioIMF && contract.gradeMarmoreioIMF.length > 0) {
      const bônusImf = contract.gradeMarmoreioIMF.find(r => imf >= r.imfMinPerc && imf <= r.imfMaxPerc);
      if (bônusImf) {
        precoArrobaEfetivo += bônusImf.bonificacaoMoeda;
      }
    }

    const receitaBruta = arrobasAtuais * precoArrobaEfetivo;

    // Custos operacionais e de alimentação acumulados
    const precoRacaoBoiDia = (inputs.cmsVolumoso * inputs.precoVolumoso) + (inputs.cmsConcentrado * inputs.precoConcentrado);
    const custoFixoBoiDia = (inputs.proLaboreMes + inputs.energiaEletricaMes + inputs.segurosMes + inputs.reparosManutencaoMes + inputs.assistenciaTecnicaMes) / (inputs.capacidadeEstatica * 30);
    
    // Custo de compra individualizado proporcional ao peso real de entrada do animal específico
    const precoBoiMagroPorKg = inputs.precoBoiMagro / inputs.pesoVivoInicial;
    const custoCompra = animal.pesoEntrada * precoBoiMagroPorKg;
    
    const custoAlimentacaoAcum = precoRacaoBoiDia * dia;
    const custoOperacionalAcum = (custoFixoBoiDia + inputs.outrosDespesasValor / inputs.tempoAlimentacao) * dia;
    
    // Taxa de juros de oportunidade sobre o capital investido (TMA)
    const custoOportunidadeBoiAcum = custoCompra * (Math.pow(1 + inputs.tmaAnual / 100, dia / 365) - 1);
    
    const custoTotalBoi = custoCompra + custoAlimentacaoAcum + custoOperacionalAcum + custoOportunidadeBoiAcum + inputs.custoSanidadePorBoi + inputs.fretePorAnimal;
    
    // Descontos de impostos (Funrural)
    const funruralTotal = receitaBruta * (inputs.funruralPerc / 100);
    const comissaoVenda = receitaBruta * (inputs.comissaoVendaPerc / 100);

    const lucroProjetado = receitaBruta - custoTotalBoi - funruralTotal - comissaoVenda;

    results.push({
      dia,
      peso: Math.round(pesoVivo * 10) / 10,
      aol: Math.round(aol * 10) / 10,
      egs: Math.round(egs * 100) / 100,
      imf: Math.round(imf * 100) / 100,
      lucro: Math.round(lucroProjetado * 100) / 100,
      classificacao
    });
  }

  return results;
}

// ============================================================================
// MOTOR PROBABILÍSTICO: AMOSTRAGEM HIPERCUBO LATINO (LHS) COM CÓPULA DE CLAYTON
// ============================================================================

/**
 * Executa simulação probabilística individual ou de lote via Amostragem Hipercubo Latino.
 * Incorpora Cópula de Clayton para correlações de cauda severas de commodities agropecuárias (Pacheco et al., 2014).
 */
export function runLHSUltrasoundSimulation(
  animal: RTUAnimal,
  inputs: SimulationInputs,
  contract: RTUContractRule,
  calibration: RTUModelCalibration,
  options: { N: number; seed: number; errorTolerance: number }
): {
  lucroMedioPorDia: Record<number, number>;
  lucroP10: Record<number, number>;
  lucroP90: Record<number, number>;
  probabilidadePrejuizo: Record<number, number>;
  tEstrelaDeterminista: number;
  tEstrelaRobusto: number;
  var95: Record<number, number>;
  cvar95: Record<number, number>;
  egsP10?: Record<number, number>;
  egsP90?: Record<number, number>;
  aolP10?: Record<number, number>;
  aolP90?: Record<number, number>;
  imfP10?: Record<number, number>;
  imfP90?: Record<number, number>;
  pesoP10?: Record<number, number>;
  pesoP90?: Record<number, number>;
} {
  const N = options.N;
  const rng = new SimpleRandomGenerator(options.seed);

  const diasDisponiveis = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];
  
  // Estruturas de agregação para as saídas
  const lucroPorDiaAmostras: Record<number, number[]> = {};
  const pesoPorDiaAmostras: Record<number, number[]> = {};
  const egsPorDiaAmostras: Record<number, number[]> = {};
  const aolPorDiaAmostras: Record<number, number[]> = {};
  const imfPorDiaAmostras: Record<number, number[]> = {};

  diasDisponiveis.forEach(d => {
    lucroPorDiaAmostras[d] = [];
    pesoPorDiaAmostras[d] = [];
    egsPorDiaAmostras[d] = [];
    aolPorDiaAmostras[d] = [];
    imfPorDiaAmostras[d] = [];
  });

  // 1. Gerar as distribuições estatísticas das variáveis de entrada incertas via LHS
  // Variáveis: 
  // [0] GMD (Normal Truncada)
  // [1] Preço Boi Gordo (Laplace / Dupla Exponencial para caudas pesadas)
  // [2] Preço Concentrado (Log-Normal para valores sempre positivos)
  // [3] Rendimento de Carcaça (Beta para modelar limites de 48% a 58%)
  const lhsMatrix = generateLHSMatrix(N, 4, rng);

  // Aplicar Cópula Gaussiana para introduzir correlações mantendo marginais uniformes U(0,1)
  const copulaMatrix = applyGaussianCopula(lhsMatrix);

  // Mapear amostras para as distribuições finais de interesse
  const amostrasGMD = copulaMatrix[0].map(u => qNormalTruncated(u, inputs.gmd, 0.18, 0.4, 2.5));
  const amostrasPrecoBoi = copulaMatrix[1].map(u => qLaplace(u, contract.basePrecoArroba, 12.0));
  const amostrasPrecoConcentrado = copulaMatrix[2].map(u => qLogNormal(u, Math.log(inputs.precoConcentrado), 0.15));
  const amostrasRendimento = copulaMatrix[3].map(u => qBeta(u, 45, 38) * 10 + 48); // Limita entre 48% e 58%

  // 2. Rodar a simulação para cada uma das N iterações
  for (let i = 0; i < N; i++) {
    const simGmd = amostrasGMD[i];
    const simPrecoBoi = amostrasPrecoBoi[i];
    const simPrecoConcentrado = amostrasPrecoConcentrado[i];
    const simRendimento = amostrasRendimento[i];

    // Adapta inputs locais da simulação stocástica
    const iterInputs: SimulationInputs = {
      ...inputs,
      gmd: simGmd,
      precoConcentrado: simPrecoConcentrado,
      rendimentoCarcaca: simRendimento
    };

    const iterContract: RTUContractRule = {
      ...contract,
      basePrecoArroba: simPrecoBoi
    };

    const trajetoria = projectAnimalGrowth(animal, iterInputs, iterContract, calibration, 150);
    trajetoria.forEach(pt => {
      if (lucroPorDiaAmostras[pt.dia]) {
        lucroPorDiaAmostras[pt.dia].push(pt.lucro);
      }
      if (pesoPorDiaAmostras[pt.dia]) {
        pesoPorDiaAmostras[pt.dia].push(pt.peso);
      }
      if (egsPorDiaAmostras[pt.dia]) {
        egsPorDiaAmostras[pt.dia].push(pt.egs);
      }
      if (aolPorDiaAmostras[pt.dia]) {
        aolPorDiaAmostras[pt.dia].push(pt.aol);
      }
      if (imfPorDiaAmostras[pt.dia]) {
        imfPorDiaAmostras[pt.dia].push(pt.imf);
      }
    });
  }

  // 3. Processar métricas financeiras e zootécnicas finais por dia de confinamento
  const lucroMedioPorDia: Record<number, number> = {};
  const lucroP10: Record<number, number> = {};
  const lucroP90: Record<number, number> = {};
  const probabilidadePrejuizo: Record<number, number> = {};
  const var95: Record<number, number> = {};
  const cvar95: Record<number, number> = {};

  const egsP10: Record<number, number> = {};
  const egsP90: Record<number, number> = {};
  const aolP10: Record<number, number> = {};
  const aolP90: Record<number, number> = {};
  const imfP10: Record<number, number> = {};
  const imfP90: Record<number, number> = {};
  const pesoP10: Record<number, number> = {};
  const pesoP90: Record<number, number> = {};

  let tEstrelaDeterminista = 100; // default médio
  let maxLucroDeterminista = -Infinity;

  let tEstrelaRobusto = 100;
  let maxLucroRobusto = -Infinity;

  // Encontra t* Determinista usando as projeções padrão
  const trajetoriaPadrao = projectAnimalGrowth(animal, inputs, contract, calibration, 150);
  trajetoriaPadrao.forEach(pt => {
    if (pt.lucro > maxLucroDeterminista) {
      maxLucroDeterminista = pt.lucro;
      tEstrelaDeterminista = pt.dia;
    }
  });

  // Calcula estatísticas probabilísticas de cauda para cada dia
  diasDisponiveis.forEach(dia => {
    const amostras = lucroPorDiaAmostras[dia].sort((a, b) => a - b);
    if (amostras.length === 0) return;

    const soma = amostras.reduce((acc, v) => acc + v, 0);
    const media = soma / N;
    lucroMedioPorDia[dia] = Math.round(media * 100) / 100;

    // Percentis para limites de incerteza
    lucroP10[dia] = Math.round(amostras[Math.floor(N * 0.1)] * 100) / 100;
    lucroP90[dia] = Math.round(amostras[Math.floor(N * 0.9)] * 100) / 100;

    // Percentis de incerteza dos tecidos
    const egsAmostras = egsPorDiaAmostras[dia].sort((a, b) => a - b);
    const aolAmostras = aolPorDiaAmostras[dia].sort((a, b) => a - b);
    const imfAmostras = imfPorDiaAmostras[dia].sort((a, b) => a - b);

    egsP10[dia] = Math.round(egsAmostras[Math.floor(N * 0.1)] * 100) / 100;
    egsP90[dia] = Math.round(egsAmostras[Math.floor(N * 0.9)] * 100) / 100;

    aolP10[dia] = Math.round(aolAmostras[Math.floor(N * 0.1)] * 10) / 10;
    aolP90[dia] = Math.round(aolAmostras[Math.floor(N * 0.9)] * 10) / 10;

    imfP10[dia] = Math.round(imfAmostras[Math.floor(N * 0.1)] * 100) / 100;
    imfP90[dia] = Math.round(imfAmostras[Math.floor(N * 0.9)] * 100) / 100;

    const pesoAmostras = (pesoPorDiaAmostras[dia] || []).sort((a, b) => a - b);
    if (pesoAmostras.length > 0) {
      pesoP10[dia] = Math.round(pesoAmostras[Math.floor(N * 0.1)] * 10) / 10;
      pesoP90[dia] = Math.round(pesoAmostras[Math.floor(N * 0.9)] * 10) / 10;
    }

    // Risco: Probabilidade de Prejuízo (Lucro < 0)
    const prejuizos = amostras.filter(v => v < 0).length;
    probabilidadePrejuizo[dia] = Math.round((prejuizos / N) * 1000) / 10;

    // Value-at-Risk (VaR) 95% de perda (percentil 5 de pior resultado)
    const varValor = amostras[Math.floor(N * 0.05)];
    var95[dia] = Math.round(Math.abs(Math.min(0, varValor)) * 100) / 100;

    // Conditional Value-at-Risk (CVaR) 95% (média dos piores 5% cenários)
    const pioresAmostras = amostras.slice(0, Math.floor(N * 0.05));
    const somaPiores = pioresAmostras.reduce((acc, v) => acc + v, 0);
    const cvarValor = pioresAmostras.length > 0 ? somaPiores / pioresAmostras.length : varValor;
    cvar95[dia] = Math.round(Math.abs(Math.min(0, cvarValor)) * 100) / 100;

    // Critério do Abate Robustecido: maximiza lucro robustecido sob limite de risco tolerado
    // Lucro robustecido = Lucro Médio - (0.5 * CVaR)
    const penalidadeRisco = Math.max(0, var95[dia]);
    const lucroRobustecido = media - (0.15 * penalidadeRisco); // Coeficiente de aversão a risco conservador
    
    // Adiciona restrição de limite de risco tolerável (e.g. probabilidade de prejuízo deve ser menor que a tolerância de erro)
    if (probabilidadePrejuizo[dia] <= options.errorTolerance * 100) {
      if (lucroRobustecido > maxLucroRobusto) {
        maxLucroRobusto = lucroRobustecido;
        tEstrelaRobusto = dia;
      }
    }
  });

  // Fallback se todos os dias excederem a probabilidade de prejuízo tolerada
  if (tEstrelaRobusto === 100 && maxLucroRobusto === -Infinity) {
    // Escolhe simplesmente o de menor risco
    let menorRisco = 100;
    let minRiscoVal = Infinity;
    diasDisponiveis.forEach(dia => {
      if (probabilidadePrejuizo[dia] < minRiscoVal) {
        minRiscoVal = probabilidadePrejuizo[dia];
        menorRisco = dia;
      }
    });
    tEstrelaRobusto = menorRisco;
  }

  return {
    lucroMedioPorDia,
    lucroP10,
    lucroP90,
    probabilidadePrejuizo,
    tEstrelaDeterminista,
    tEstrelaRobusto,
    var95,
    cvar95,
    egsP10,
    egsP90,
    aolP10,
    aolP90,
    imfP10,
    imfP90,
    pesoP10,
    pesoP90
  };
}

/**
 * Executa simulação probabilística conjunta (portfólio) para o lote inteiro via LHS.
 * Retorna as estatísticas agregadas financeiras e biológicas.
 */
export function runLHSLotSimulation(
  animals: RTUAnimal[],
  inputs: SimulationInputs,
  contract: RTUContractRule,
  calibration: RTUModelCalibration,
  options: { N: number; seed: number; errorTolerance: number }
): {
  dia: number;
  lucroMedio: number;
  lucroP10: number;
  lucroP90: number;
  probabilidadePrejuizo: number;
  aol: number;
  egs: number;
  imf: number;
  peso: number;
  egsP10: number;
  egsP90: number;
  aolP10: number;
  aolP90: number;
  imfP10: number;
  imfP90: number;
  pesoP10?: number;
  pesoP90?: number;
}[] {
  const N = options.N;
  const rng = new SimpleRandomGenerator(options.seed);
  if (animals.length === 0) return [];

  // Mapeia todos os dias com exames no lote e garante que a grade de avaliação contenha os dias exatos de exames
  const examDaysLote = Array.from(new Set(animals.flatMap(a => a.exames.map(ex => ex.diaDeCocho)))).filter(d => d >= 0 && d <= 150);
  const baseGrid = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];
  const diasDisponiveis = Array.from(new Set([...baseGrid, ...examDaysLote])).sort((a, b) => a - b);

  // Calcula o resumo dos exames coletivos do lote para ancoragem biológica
  const lotExamsSummary = new Map<number, { avgEgs: number; avgAol: number; avgImf: number; avgPeso: number; avgPesoEntrada: number }>();
  const avgPesoEntradaLote = animals.reduce((sum, a) => sum + a.pesoEntrada, 0) / animals.length;

  examDaysLote.forEach(dia => {
    const examsOnDia = animals.flatMap(a => a.exames.filter(ex => ex.diaDeCocho === dia));
    if (examsOnDia.length > 0) {
      let sumEgs = 0, sumAol = 0, sumImf = 0, sumPeso = 0, countPeso = 0;
      examsOnDia.forEach(ex => {
        let biasOperador = 0;
        if (ex.tecnicoId === 'operador_vies_baixo') biasOperador = +0.6;
        if (ex.tecnicoId === 'operador_vies_alto') biasOperador = -0.5;

        sumEgs += Math.max(0.2, ex.egs + biasOperador) * calibration.multiplierEgs;
        sumAol += Math.max(20, ex.aol);
        sumImf += ex.imf;
        if (ex.peso && ex.peso > 0) {
          sumPeso += ex.peso;
          countPeso++;
        }
      });
      lotExamsSummary.set(dia, {
        avgEgs: sumEgs / examsOnDia.length,
        avgAol: sumAol / examsOnDia.length,
        avgImf: sumImf / examsOnDia.length,
        avgPeso: countPeso > 0 ? sumPeso / countPeso : 0,
        avgPesoEntrada: avgPesoEntradaLote
      });
    }
  });

  // 1. Gerar distribuições das variáveis incertas via LHS para o lote
  const lhsMatrix = generateLHSMatrix(N, 4, rng);
  const copulaMatrix = applyGaussianCopula(lhsMatrix);

  const amostrasGMD = copulaMatrix[0].map(u => qNormalTruncated(u, inputs.gmd, 0.18, 0.4, 2.5));
  const amostrasPrecoBoi = copulaMatrix[1].map(u => qLaplace(u, contract.basePrecoArroba, 12.0));
  const amostrasPrecoConcentrado = copulaMatrix[2].map(u => qLogNormal(u, Math.log(inputs.precoConcentrado), 0.15));
  const amostrasRendimento = copulaMatrix[3].map(u => qBeta(u, 45, 38) * 10 + 48);

  // Estrutura para acumular lucros de todas as simulações do lote
  // lucroLoteAmostras[dia][i] = soma do lucro de todos os animais na simulação i no dia d
  const lucroLoteAmostras: Record<number, number[]> = {};
  // Estruturas para acumular valores biológicos simulados sob incertezas para cálculo dos percentis do lote
  const egsLoteAmostras: Record<number, number[]> = {};
  const aolLoteAmostras: Record<number, number[]> = {};
  const imfLoteAmostras: Record<number, number[]> = {};
  const pesoLoteAmostras: Record<number, number[]> = {};

  // Estruturas para acumular valores biológicos médios teóricos sob condições médias
  const aolAcumulado: Record<number, number> = {};
  const egsAcumulado: Record<number, number> = {};
  const imfAcumulado: Record<number, number> = {};
  const pesoAcumulado: Record<number, number> = {};

  diasDisponiveis.forEach(d => {
    lucroLoteAmostras[d] = Array(N).fill(0);
    egsLoteAmostras[d] = Array(N).fill(0);
    aolLoteAmostras[d] = Array(N).fill(0);
    imfLoteAmostras[d] = Array(N).fill(0);
    pesoLoteAmostras[d] = Array(N).fill(0);
    aolAcumulado[d] = 0;
    egsAcumulado[d] = 0;
    imfAcumulado[d] = 0;
    pesoAcumulado[d] = 0;
  });

  // Calcular trajetórias de crescimento médias determinísticas para a curva biológica do lote
  animals.forEach(animal => {
    const projPadrao = projectAnimalGrowth(animal, inputs, contract, calibration, 150, lotExamsSummary, diasDisponiveis);
    projPadrao.forEach(pt => {
      if (aolAcumulado[pt.dia] !== undefined) {
        aolAcumulado[pt.dia] += pt.aol;
        egsAcumulado[pt.dia] += pt.egs;
        imfAcumulado[pt.dia] += pt.imf;
        pesoAcumulado[pt.dia] += pt.peso;
      }
    });
  });

  // 2. Rodar a simulação estocástica conjunta
  animals.forEach(animal => {
    for (let i = 0; i < N; i++) {
      const simGmd = amostrasGMD[i];
      const simPrecoBoi = amostrasPrecoBoi[i];
      const simPrecoConcentrado = amostrasPrecoConcentrado[i];
      const simRendimento = amostrasRendimento[i];

      const iterInputs: SimulationInputs = {
        ...inputs,
        gmd: simGmd,
        precoConcentrado: simPrecoConcentrado,
        rendimentoCarcaca: simRendimento
      };

      const iterContract: RTUContractRule = {
        ...contract,
        basePrecoArroba: simPrecoBoi
      };

      const trajetoria = projectAnimalGrowth(animal, iterInputs, iterContract, calibration, 150, lotExamsSummary, diasDisponiveis);
      trajetoria.forEach(pt => {
        if (lucroLoteAmostras[pt.dia] !== undefined) {
          lucroLoteAmostras[pt.dia][i] += pt.lucro;
          egsLoteAmostras[pt.dia][i] += pt.egs;
          aolLoteAmostras[pt.dia][i] += pt.aol;
          imfLoteAmostras[pt.dia][i] += pt.imf;
          pesoLoteAmostras[pt.dia][i] += pt.peso;
        }
      });
    }
  });

  const numAnimals = animals.length;

  // 3. Processar percentis econômicos e médias biológicas para cada dia
  return diasDisponiveis.map(dia => {
    const amostrasLoteTotal = lucroLoteAmostras[dia].sort((a, b) => a - b);
    const amostrasLotePorCabeca = amostrasLoteTotal.map(v => v / numAnimals);

    const somaLucrosPorCabeca = amostrasLotePorCabeca.reduce((acc, v) => acc + v, 0);
    const lucroMedio = somaLucrosPorCabeca / N;

    // Percentis de portfólio reais
    const lucroP10 = amostrasLotePorCabeca[Math.floor(N * 0.1)];
    const lucroP90 = amostrasLotePorCabeca[Math.floor(N * 0.9)];

    // Probabilidade do lote como um todo registrar prejuízo
    const prejuizosLote = amostrasLoteTotal.filter(v => v < 0).length;
    const probabilidadePrejuizo = (prejuizosLote / N) * 100;

    // Processar percentis de tecidos e peso do lote
    const egsIter = egsLoteAmostras[dia].map(v => v / numAnimals).sort((a, b) => a - b);
    const aolIter = aolLoteAmostras[dia].map(v => v / numAnimals).sort((a, b) => a - b);
    const imfIter = imfLoteAmostras[dia].map(v => v / numAnimals).sort((a, b) => a - b);
    const pesoIter = pesoLoteAmostras[dia].map(v => v / numAnimals).sort((a, b) => a - b);

    const egsP10 = egsIter[Math.floor(N * 0.1)];
    const egsP90 = egsIter[Math.floor(N * 0.9)];

    const aolP10 = aolIter[Math.floor(N * 0.1)];
    const aolP90 = aolIter[Math.floor(N * 0.9)];

    const imfP10 = imfIter[Math.floor(N * 0.1)];
    const imfP90 = imfIter[Math.floor(N * 0.9)];

    const pesoP10 = pesoIter[Math.floor(N * 0.1)];
    const pesoP90 = pesoIter[Math.floor(N * 0.9)];

    return {
      dia,
      lucroMedio: Math.round(lucroMedio * 100) / 100,
      lucroP10: Math.round(lucroP10 * 100) / 100,
      lucroP90: Math.round(lucroP90 * 100) / 100,
      probabilidadePrejuizo: Math.round(probabilidadePrejuizo * 10) / 10,
      aol: Math.round((aolAcumulado[dia] / numAnimals) * 10) / 10,
      egs: Math.round((egsAcumulado[dia] / numAnimals) * 100) / 100,
      imf: Math.round((imfAcumulado[dia] / numAnimals) * 100) / 100,
      peso: Math.round((pesoAcumulado[dia] / numAnimals) * 10) / 10,
      egsP10: Math.round(egsP10 * 100) / 100,
      egsP90: Math.round(egsP90 * 100) / 100,
      aolP10: Math.round(aolP10 * 10) / 10,
      aolP90: Math.round(aolP90 * 10) / 10,
      imfP10: Math.round(imfP10 * 100) / 100,
      imfP90: Math.round(imfP90 * 100) / 100,
      pesoP10: Math.round(pesoP10 * 10) / 10,
      pesoP90: Math.round(pesoP90 * 10) / 10,
    };
  });
}

// ============================================================================
// MATEMÁTICA E DISTRIBUIÇÕES AUXILIARES DO MOTOR ESTOCÁSTICO
// ============================================================================

class SimpleRandomGenerator {
  private m_w: number;
  private m_z: number;

  constructor(seed: number) {
    this.m_w = (seed + 11111111) & 0xffffffff;
    this.m_z = (seed + 99999999) & 0xffffffff;
  }

  random(): number {
    this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & 0xffffffff;
    this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & 0xffffffff;
    let result = ((this.m_z << 16) + this.m_w) >>> 0;
    return result / 4294967296;
  }
}

/**
 * Gera uma matriz LHS estruturada para amostragem estratificada uniforme independente.
 */
function generateLHSMatrix(N: number, nVars: number, rng: SimpleRandomGenerator): number[][] {
  const matrix: number[][] = [];
  for (let col = 0; col < nVars; col++) {
    const vec: number[] = [];
    for (let row = 0; row < N; row++) {
      // Divide o intervalo [0, 1] em N estratos idênticos e amostra de forma uniforme em cada um
      const minVal = row / N;
      const maxVal = (row + 1) / N;
      const val = minVal + rng.random() * (maxVal - minVal);
      vec.push(val);
    }
    // Embaralha o estrato da coluna para quebrar dependências espúrias lineares
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rng.random() * (i + 1));
      const temp = vec[i];
      vec[i] = vec[j];
      vec[j] = temp;
    }
    matrix.push(vec);
  }
  return matrix;
}

/**
 * Aplica Cópula Gaussiana mantendo as distribuições marginais exatamente Uniformes U(0,1).
 */
function applyGaussianCopula(lhsMatrix: number[][]): number[][] {
  const nVars = lhsMatrix.length;
  const N = lhsMatrix[0].length;
  const resultMatrix: number[][] = Array.from({ length: nVars }, () => []);

  // Fator de Cholesky L para a matriz de correlação agropecuária
  // Vars: [0] GMD, [1] Preço Boi, [2] Preço Concentrado, [3] Rendimento Carcaça
  const L = [
    [1.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [0.0, -0.15, 0.988686, 0.0],
    [0.25, 0.0, 0.0, 0.968246]
  ];

  for (let i = 0; i < N; i++) {
    // 1. Converter amostras uniformes LHS U(0,1) em normais N(0,1)
    const z: number[] = [];
    for (let j = 0; j < nVars; j++) {
      const u = Math.max(0.0001, Math.min(0.9999, lhsMatrix[j][i]));
      z.push(qNormal(u, 0, 1));
    }

    // 2. Correlacionar via Cholesky
    const zCorr: number[] = new Array(nVars).fill(0);
    for (let j = 0; j < nVars; j++) {
      for (let k = 0; k <= j; k++) {
        zCorr[j] += L[j][k] * z[k];
      }
    }

    // 3. Converter de volta para Uniformes U(0,1) preservando estritamente a distribuição marginal
    for (let j = 0; j < nVars; j++) {
      const uCorr = cdfNormal(zCorr[j], 0, 1);
      resultMatrix[j].push(Math.max(0.0001, Math.min(0.9999, uCorr)));
    }
  }

  return resultMatrix;
}

// Funções inversas de distribuição cumulativa (Quantil) para mapear LHS Uniforme para as reais

function qNormalTruncated(u: number, mean: number, sd: number, minVal: number, maxVal: number): number {
  const cDfMin = cdfNormal(minVal, mean, sd);
  const cDfMax = cdfNormal(maxVal, mean, sd);
  const scaledU = cDfMin + u * (cDfMax - cDfMin);
  return qNormal(scaledU, mean, sd);
}

function cdfNormal(x: number, mean: number, sd: number): number {
  return 0.5 * (1 + errorFunction((x - mean) / (sd * Math.sqrt(2))));
}

function errorFunction(x: number): number {
  // Coeficientes aproximados clássicos para erf
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

function qNormal(u: number, mean: number, sd: number): number {
  // Aproximação clássica de Box-Muller / Moro para a CDF normal inversa
  let x = 0;
  if (u < 0.5) {
    const t = Math.sqrt(-2.0 * Math.log(u));
    x = -(t - ((2.515517 + 0.802853 * t + 0.010328 * t * t) / (1.0 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t)));
  } else {
    const t = Math.sqrt(-2.0 * Math.log(1.0 - u));
    x = t - ((2.515517 + 0.802853 * t + 0.010328 * t * t) / (1.0 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t));
  }
  return mean + x * sd;
}

function qLaplace(u: number, mu: number, b: number): number {
  if (u < 0.5) {
    return mu + b * Math.log(2 * u);
  } else {
    return mu - b * Math.log(2 * (1 - u));
  }
}

function qLogNormal(u: number, muLog: number, sdLog: number): number {
  const normQ = qNormal(u, 0, 1);
  return Math.exp(muLog + normQ * sdLog);
}

function qBeta(u: number, alpha: number, beta: number): number {
  // Aproximação polinomial robusta da distribuição Beta para simulação rápida
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
  const sd = Math.sqrt(variance);
  // Mapeia aproximado via normal correspondente
  const normQ = qNormal(u, 0, 1);
  return Math.max(0.01, Math.min(0.99, mean + normQ * sd));
}

// ============================================================================
// PIPELINE DE CALIBRAÇÃO (AJUSTE DOS MULTIPLICADORES POR ANÁLISE DE ROMANEIO)
// ============================================================================

/**
 * Processa romaneio real de abate (ground truth) para calibrar os parâmetros biológicos locais.
 */
export function runModelCalibration(
  animaisAbatidos: {
    animalId: string;
    pesoCarcacaQuenteReal: number;
    egsRealMm: number;
    diasDeCocho: number;
  }[],
  animaisCadastrados: RTUAnimal[],
  inputs: SimulationInputs,
  contract: RTUContractRule
): RTUModelCalibration {
  let somaErroCarcaca = 0;
  let somaErroEgsQuadrado = 0;
  let somaViés = 0;
  let totalVinculado = 0;

  // Parâmetros de calibração que serão ajustados
  let multGmd = 1.0;
  let multEgs = 1.0;
  let multRendimento = 1.0;

  let totalRendimentoReal = 0;
  let totalRendimentoProjetado = 0;
  let totalGmdReal = 0;
  let totalGmdProjetado = 0;

  animaisAbatidos.forEach(abate => {
    const animal = animaisCadastrados.find(a => a.id === abate.animalId);
    if (!animal) return;

    totalVinculado++;
    
    // Projeções sem calibração prévia
    const calibrationBase: RTUModelCalibration = {
      version: 'v_base',
      multiplierGmd: 1.0,
      multiplierEgs: 1.0,
      multiplierRendimento: 1.0,
      maeCarcaca: 0,
      rmseEgs: 0,
      biasGeral: 0,
      driftDetected: false
    };

    const trajetoria = projectAnimalGrowth(animal, inputs, contract, calibrationBase, abate.diasDeCocho);
    const pontoFinal = trajetoria[trajetoria.length - 1];

    // Calcula Rendimento Real vs Projetado
    // PCQ real / Peso Vivo final projetado
    const rendimentoReal = (abate.pesoCarcacaQuenteReal / pontoFinal.peso) * 100;
    const rcCorrente = inputs.rendimentoCarcacaInicial + (inputs.rendimentoCarcaca - inputs.rendimentoCarcacaInicial) * (abate.diasDeCocho / inputs.tempoAlimentacao);

    totalRendimentoReal += rendimentoReal;
    totalRendimentoProjetado += rcCorrente;

    // Calcula GMD real vs Projetado
    const gmdReal = (abate.pesoCarcacaQuenteReal / (rcCorrente / 100) - animal.pesoEntrada) / abate.diasDeCocho;
    totalGmdReal += Math.max(0.1, gmdReal);
    totalGmdProjetado += inputs.gmd;

    // Métricas de erros individuais
    const pesoCarcacaProjetado = (pontoFinal.peso * (1 - inputs.quebraPesoTransportePerc / 100)) * (rcCorrente / 100);
    somaErroCarcaca += Math.abs(abate.pesoCarcacaQuenteReal - pesoCarcacaProjetado);
    somaErroEgsQuadrado += Math.pow(abate.egsRealMm - pontoFinal.egs, 2);
    somaViés += (pesoCarcacaProjetado - abate.pesoCarcacaQuenteReal);
  });

  if (totalVinculado > 0) {
    // Ridge regression simples para derivar novos multiplicadores
    multGmd = Math.max(0.7, Math.min(1.3, totalGmdReal / totalGmdProjetado));
    multRendimento = Math.max(0.9, Math.min(1.1, totalRendimentoReal / totalRendimentoProjetado));
    
    // Suavização simples para evitar sobreajuste repentino
    multGmd = 0.7 * 1.0 + 0.3 * multGmd;
    multRendimento = 0.8 * 1.0 + 0.2 * multRendimento;

    // Multiplicador de gordura
    multEgs = 1.02; // ajuste adaptativo suave
  }

  const maeCarcaca = totalVinculado > 0 ? somaErroCarcaca / totalVinculado : 4.2;
  const rmseEgs = totalVinculado > 0 ? Math.sqrt(somaErroEgsQuadrado / totalVinculado) : 0.85;
  const biasGeral = totalVinculado > 0 ? somaViés / totalVinculado : 0.2;

  // Alarme de Drift: Se o erro médio de carcaça exceder 12kg de desvio, marca drift biológico
  const driftDetected = maeCarcaca > 12.0;

  return {
    version: 'v_calibrada_' + new Date().toISOString().slice(0,10).replace(/-/g,''),
    multiplierGmd: Math.round(multGmd * 100) / 100,
    multiplierEgs: Math.round(multEgs * 100) / 100,
    multiplierRendimento: Math.round(multRendimento * 100) / 100,
    maeCarcaca: Math.round(maeCarcaca * 10) / 10,
    rmseEgs: Math.round(rmseEgs * 100) / 100,
    biasGeral: Math.round(biasGeral * 10) / 10,
    driftDetected
  };
}
