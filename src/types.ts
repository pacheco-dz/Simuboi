export interface DepreciationItem {
  id: string;
  nome: string;
  categoria: string;
  valorNovo: number;
  vidaUtilAnos: number;
  valorResidualPerc: number;
}

export interface Equipe {
  gerente: number;
  encarregado: number;
  administrativo: number;
  tratorista: number;
  mistura: number;
  curral: number;
  sanidade: number;
  manutencao: number;
  servicosGerais: number;
}

export interface FinanciamentoItem {
  id: string;
  descricao: string;
  valorPrincipal: number;
  taxaJurosAnual: number;
  prazoMeses: number;
  valorParcela?: number; // Opcional se for calculado, ou manual
}

export interface Pesagem {
  id: string;
  dia: number;
  pesoReal: number;
}

export interface Ultrassom {
  id: string;
  dia: number;
  espessuraGorduraReal: number; // mm
}

export interface SimulationInputs {
  animaisHa: number;
  pesoVivoInicial: number;
  pesoVivoFinal: number;
  rendimentoCarcaca: number;
  rendimentoCarcacaInicial: number;
  quebraPesoTransportePerc: number;
  gmd: number;
  cmsVolumoso: number; // Consumo Matéria Verde
  cmsConcentrado: number; // Consumo Matéria Verde
  encargosTrabalhistas: number;
  tempoAlimentacao: number;
  areaAnimalM2: number;
  tmaAnual: number;
  arrendamentoTerraPerc: number;
  boisMaoDeObra: number;
  taxaMortalidade: number;
  outrosDespesasValor: number;
  assistenciaTecnicaMes: number;
  proLaboreMes: number;
  energiaEletricaMes: number;
  segurosMes: number;
  financiamentoMes: number;
  itrMes: number;
  reparosManutencaoMes: number;
  depreciacaoMes: number;
  capacidadeEstatica: number;
  itensDepreciacao: DepreciationItem[];
  itensFinanciamento: FinanciamentoItem[];
  equipe: Equipe;

  // Preços e Custos Unitários
  precoBoiMagro: number;
  precoBoiGordo: number;
  salarioMinimo: number;
  valorTerraHa: number;
  precoVolumoso: number;
  precoConcentrado: number;
  sobrasCochoPerc: number;
  custoSanidadePorBoi: number;
  bonificacaoPerc: number;
  fretePorAnimal: number;
  precoEsterco: number;
  quantidadeEsterco: number;
  funruralPerc: number;
  valorResidual: number;
  dieselLitrosCabecaDia: number;
  precoDiesel: number;
  comissaoCompraPerc: number;
  comissaoVendaPerc: number;

  // ESG - Métricas Adicionais
  investimentoSocialAnual: number;
  horasTreinamentoFuncionarioAno: number;
  indiceBemEstarAnimal: number;
  usoEnergiaRenovavelPerc: number;
  distanciaMediaTransporteKm: number;
  usoAguaRecicladaPerc: number;
  certificacaoCompliance: boolean;
  rastreabilidadeTotal: boolean;

  // Evolução e Pesagens
  pesagens: Pesagem[];
  ultrassom: Ultrassom[];

  // Modelo Biológico Avançado
  raca: 'nelore' | 'cruzamento' | 'holandes';
  sexo: 'macho' | 'femea' | 'inteiro';
  frameSize: 'pequeno' | 'medio' | 'grande';

  // Desvios Padrão para Monte Carlo
  desviosPadrao: Record<string, number>;
  
  // Correlações entre variáveis
  correlacoes: Record<string, Record<string, number>>;
  copulaType: 'gaussian' | 'clayton' | 'gumbel' | 'spearman' | 'independent';

  // Configurações de Clima e Estresse Térmico
  averageThi?: number;
  ativarEstresseTermico?: boolean;
}

export interface FluxoCaixaItem {
  mes: number;
  descricao: string;
  entradas: number;
  saidas: number;
  saldo: number;
  acumulado: number;
  // Categorias para o gráfico empilhado
  compraAnimais?: number;
  alimentacao?: number;
  sanidade?: number;
  operacional?: number;
  funrural?: number;
  vendaAnimais?: number;
  outrasReceitas?: number;
}

export interface EvolucaoPonto {
  dia: number;
  pesoEstimado: number;
  pesoReal?: number;
  gorduraEstimada: number;
  gorduraReal?: number;
  custoAcumulado: number;
  custoPorMmEGS?: number;
  custoPorKgGanho?: number;
  lucroEstimado?: number;
}

export interface SimulationResults {
  custoFixo: number;
  custoVariavel: number;
  custoOperacionalEfetivo: number;
  custoOperacionalTotal: number;
  receitaBruta: number;
  receitaBrutaPorHa: number;
  receitaVenda: number;
  receitaBonificacao: number;
  receitaEsterco: number;
  valorResidual: number;
  margemBruta: number;
  margemLiquida: number;
  lucro: number;
  lucroPorBoi: number;
  lucroPorHa: number;
  giroAnual: number;
  pontoEquilibrioPreco: number;
  vpl: number;
  vplPorHa: number;
  tir: number;
  payback: number;
  paybackDescontado: number;
  indiceBeneficioCusto: number;
  roia: number;
  custoKgGanho: number;
  custoArrobaGanho: number;
  custoPorArroba: number;
  custoTotal: number;
  custoTotalPorHa: number;
  custoOportunidadeTotal: number;
  custoAlimentacao: number;
  sobrecustoDieta: number;
  sobrecustoSobras: number;
  sobrecustoPreco: number;
  custoCompraAnimal: number;
  custoMaoDeObra: number;
  custoSanidade: number;
  custoFrete: number;
  custoAssistenciaTecnica: number;
  custoProLabore: number;
  custoEnergia: number;
  custoDiesel: number;
  custoComissoes: number;
  custoReparos: number;
  custoSeguros: number;
  custoFinanciamento: number;
  custoITR: number;
  custoDepreciacao: number;
  totalDepreciacaoMes: number;
  totalInvestimento: number;
  custoOportunidadeMaquinas: number;
  custoOportunidadeTerra: number;
  custoOportunidadeCapital: number;
  custoOutros: number;
  custoFunrural: number;
  agioDesagio: number;
  
  // ESG - Resultados Calculados
  balancoNitrogenio: number;
  balancoFosforo: number;
  emissaoMetanoKg: number;
  eficienciaUsoTerra: number;
  pegadaCarbonoTotal: number;
  pegadaHidricaTotal: number;
  indiceSustentabilidade: number;

  ganhoPesoTotal: number;
  arrobasProduzidas: number;
  eficienciaAlimentar: number;
  custoTotalPorAnimalDia: number;
  custoTotalSemCompraDia: number;
  fluxoCaixa: FluxoCaixaItem[];
  evolucao: EvolucaoPonto[];

  // Métricas de Impacto do Estresse Térmico
  gmdOriginal?: number;
  cmsVolumosoOriginal?: number;
  cmsConcentradoOriginal?: number;
  gmdPerdaEstressePerc?: number;
  cmsPerdaEstressePerc?: number;
  thiCalculado?: number;
  statusClinicoClima?: string;
}

export interface LHSIteration {
  id: number;
  inputs: Record<string, number>;
  vpl: number;
  lucro: number;
  tir: number;
}

export interface MorrisResult {
  nome: string;
  muStar: number; // Importância (Média dos efeitos absolutos)
  sigma: number;  // Interação/Não-linearidade (Desvio padrão dos efeitos)
}

export interface SobolResult {
  nome: string;
  s1: number;  // Efeito de primeira ordem
  st: number;  // Efeito total
  interaction: number; // Interação (ST - S1)
}

export interface LHSSimulationResults {
  probabilidadeVplNegativo: number;
  probabilidadePrejuizo: number;
  probabilidadePositivo: number;
  vplMedio: number;
  vplMinimo: number;
  vplMaximo: number;
  desvioPadrao: number;
  coeficienteVariacao: number;
  lucroMedio: number;
  tirMedia: number;
  histograma: { faixa: string; frequencia: number; valor: number }[];
  sensibilidade: { nome: string; impacto: number }[];
  regressao: { key: string; nome: string; beta: number }[];
  r2: number;
  desviosPadraoInputs: Record<string, number>;
  iteracoes: LHSIteration[];
  correlationSamples?: Record<string, { x: number; y: number; nameX: string; nameY: string }[]>;
  morris?: MorrisResult[];
  sobol?: SobolResult[];
  parecerTecnico?: {
    titulo: string;
    texto: string;
    nivelRisco: 'baixo' | 'moderado' | 'alto';
  };
}

export interface SavedSimulation {
  id: string;
  name: string;
  date: string;
  inputs: SimulationInputs;
}

export interface MarketPrice {
  state: string;
  boiGordo: number;
  boiMagro: number;
  ingredientPrices?: Record<string, number>;
  date: string;
  trend: 'up' | 'down' | 'stable';
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'volumoso' | 'concentrado' | 'mineral' | 'aditivo';
  price: number; // R$ per kg (Natural Basis)
  pb: number;    // Crude Protein (% of DM)
  ndt: number;   // TDN (% of DM)
  fdn: number;   // NDF (% of DM)
  ms: number;    // Dry Matter (%)
  ca: number;    // Calcium (% of DM)
  p: number;     // Phosphorus (% of DM)
  mg?: number;   // Magnesium (% of DM)
  k?: number;    // Potassium (% of DM)
  na?: number;   // Sodium (% of DM)
  s?: number;    // Sulfur (% of DM)
  vitA?: number; // Vitamin A (UI/kg DM)
  vitE?: number; // Vitamin E (UI/kg DM)
  ee?: number;   // Ether Extract (% of DM)
  pdr?: number;  // Rumen Degradable Protein (% of CP)
  isUrea?: boolean;
  minIncl?: number; // Min inclusion (% of DM)
  maxIncl?: number; // Max inclusion (% of DM)
  selected?: boolean;
}

export interface DietRequirements {
  pbMin: number;
  ndtMin: number;
  fdnMin: number;
  fdnMax: number;
  caMin: number;
  pMin: number;
  eeMax?: number;
  pdrMin?: number;
  pdrMax?: number;
  ureaMax?: number;
  caPRatioMin?: number;
  caPRatioMax?: number;
  cms?: number; // Consumo de Matéria Seca (kg/dia)
  forageMin?: number;
  forageMax?: number;
  optimizationGoal?: 'cost' | 'gmd';
}

export interface DietOptimizationResult {
  feasible: boolean;
  ingredients: { name: string; percentage: number; costContribution: number }[];
  totalCost: number; // R$ per kg of DM
  totalCostMN: number; // R$ per kg of MN (as fed)
  cms?: number; // Consumo de Matéria Seca (kg/dia)
  foragePercentage: number;
  concentratePercentage: number;
  cmsPercentageBW: number;
  forageIntakeMN: number;
  concentrateIntakeMN: number;
  forageCostMN: number;
  concentrateCostMN: number;
  forageCostPerKgMN: number;
  concentrateCostPerKgMN: number;
  forageCostPerKgMS: number;
  concentrateCostPerKgMS: number;
  predictedGmd: number;
  feedConversion: number;
  waterIntake: number;
  alerts: string[];
  nutritionalProfile: {
    pb: number;
    ndt: number;
    fdn: number;
    ee: number;
    pdr: number;
    ca: number;
    p: number;
    mg: number;
    k: number;
    na: number;
    s: number;
    vitA: number;
    vitE: number;
  };
}

export interface SavedDiet {
  id: string;
  name: string;
  date: string;
  result: DietOptimizationResult;
  requirements: DietRequirements;
  animalProfile: DietAnimalProfile;
  ingredients: Ingredient[];
}

export interface DietAnimalProfile {
  weight: number;
  finalWeight: number;
  gmd: number;
  sex: 'macho' | 'femea' | 'inteiro';
  raca: 'zebuino' | 'europeu' | 'cruzado';
  idade: number; 
  ecc: number; 
  frameSize: 'pequeno' | 'medio' | 'grande';
  precoBoiGordo?: number;
  rendimentoCarcaca?: number;
  adg?: number;
}
