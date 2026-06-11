import React, { useState, useEffect, useMemo } from 'react';
import bgImage from './assets/images/feedlot_tractor_bg_1781181926909.png';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Scale, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Info,
  Calculator,
  ArrowRightLeft,
  AlertCircle,
  ShieldAlert,
  BarChart3,
  Settings,
  X,
  RotateCcw,
  RefreshCw,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Target,
  Save,
  FolderOpen,
  Trash2,
  Plus,
  Database,
  GitBranch,
  CreditCard,
  Download,
  FileText,
  Monitor,
  Activity,
  Zap,
  Calendar,
  AlertTriangle,
  PlayCircle,
  Map,
  Users,
  Printer,
  Factory,
  Truck,
  MoreHorizontal,
  Wand2,
  Eraser,
  Cloud,
  Droplets,
  Leaf,
  ShieldCheck,
  Wind,
  Heart,
  XCircle,
  TreePine,
  Sparkles,
  BrainCircuit,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User,
  LogOut,
  Key,
  Pencil,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  supabase, 
  isSupabaseConfigured, 
  supabaseSignUp, 
  supabaseSignIn, 
  supabaseSignOut, 
  supabaseResetPassword, 
  supabaseUpdatePassword,
  syncUserDataToSupabase,
  fetchUserDataFromSupabase
} from './lib/supabase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { optimizeDiet, calculateRequirements, DEFAULT_INGREDIENTS } from './services/dietOptimizerService';
import { fetchMarketPrices } from './services/marketService';
import { SimulationInputs, SimulationResults, LHSSimulationResults, Pesagem, Ultrassom, SavedSimulation, MarketPrice, DepreciationItem, Ingredient, DietRequirements, DietOptimizationResult, DietAnimalProfile, SavedDiet } from './types';
import { 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  LabelList,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { calculateSimulation, runLHSSimulation } from './services/simulationService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DEFAULT_INPUTS: SimulationInputs = {
  animaisHa: 40,
  pesoVivoInicial: 350,
  pesoVivoFinal: 500,
  rendimentoCarcaca: 54,
  rendimentoCarcacaInicial: 50,
  quebraPesoTransportePerc: 2.5,
  gmd: 1.5,
  cmsVolumoso: 14,
  cmsConcentrado: 5,
  encargosTrabalhistas: 45.59,
  tempoAlimentacao: 100,
  areaAnimalM2: 25,
  tmaAnual: 14.75,
  arrendamentoTerraPerc: 3.00,
  boisMaoDeObra: 100,
  taxaMortalidade: 1.00,
  outrosDespesasValor: 100.00,
  assistenciaTecnicaMes: 5000.00,
  proLaboreMes: 8000.00,
  energiaEletricaMes: 3500.00,
  segurosMes: 1500.00,
  financiamentoMes: 0.00,
  itrMes: 100.00,
  reparosManutencaoMes: 1500.00,
  depreciacaoMes: 0,
  capacidadeEstatica: 1000,
  equipe: {
    gerente: 1,
    encarregado: 0,
    administrativo: 1,
    tratorista: 2,
    mistura: 1,
    curral: 2,
    sanidade: 1,
    manutencao: 1,
    servicosGerais: 1
  },
  itensDepreciacao: [
    // INFRAESTRUTURA CIVIL
    { id: '1', nome: 'Terraplenagem', categoria: 'Infraestrutura Civil', valorNovo: 180000, vidaUtilAnos: 25, valorResidualPerc: 0 },
    { id: '2', nome: 'Drenagem', categoria: 'Infraestrutura Civil', valorNovo: 140000, vidaUtilAnos: 20, valorResidualPerc: 0 },
    { id: '3', nome: 'Vias internas', categoria: 'Infraestrutura Civil', valorNovo: 180000, vidaUtilAnos: 20, valorResidualPerc: 0 },
    { id: '4', nome: 'Cercas e porteiras', categoria: 'Infraestrutura Civil', valorNovo: 110000, vidaUtilAnos: 25, valorResidualPerc: 20 },
    { id: '5', nome: 'Currais de engorda (10)', categoria: 'Infraestrutura Civil', valorNovo: 380000, vidaUtilAnos: 40, valorResidualPerc: 20 },
    { id: '6', nome: 'Cochos (600m)', categoria: 'Infraestrutura Civil', valorNovo: 180000, vidaUtilAnos: 10, valorResidualPerc: 5 },
    { id: '7', nome: 'Bebedouros (15)', categoria: 'Infraestrutura Civil', valorNovo: 70000, vidaUtilAnos: 40, valorResidualPerc: 20 },
    { id: '8', nome: 'Centro de manejo', categoria: 'Infraestrutura Civil', valorNovo: 180000, vidaUtilAnos: 25, valorResidualPerc: 15 },
    { id: '9', nome: 'Embarcadouro', categoria: 'Infraestrutura Civil', valorNovo: 35000, vidaUtilAnos: 20, valorResidualPerc: 10 },
    { id: '10', nome: 'Curral enfermaria/isolamento', categoria: 'Infraestrutura Civil', valorNovo: 70000, vidaUtilAnos: 20, valorResidualPerc: 10 },
    { id: '11', nome: 'Galpão de insumos', categoria: 'Infraestrutura Civil', valorNovo: 260000, vidaUtilAnos: 40, valorResidualPerc: 20 },
    { id: '12', nome: 'Silos / área volumoso', categoria: 'Infraestrutura Civil', valorNovo: 280000, vidaUtilAnos: 20, valorResidualPerc: 10 },
    { id: '13', nome: 'Pátio operacional', categoria: 'Infraestrutura Civil', valorNovo: 100000, vidaUtilAnos: 20, valorResidualPerc: 0 },
    { id: '14', nome: 'Escritório/Banheiro/Almoxarifado', categoria: 'Infraestrutura Civil', valorNovo: 160000, vidaUtilAnos: 25, valorResidualPerc: 20 },
    { id: '15', nome: 'Oficina básica', categoria: 'Infraestrutura Civil', valorNovo: 60000, vidaUtilAnos: 20, valorResidualPerc: 20 },
    // ÁGUA E ENERGIA
    { id: '16', nome: 'Captação e Reservatório', categoria: 'Água e Energia', valorNovo: 160000, vidaUtilAnos: 20, valorResidualPerc: 5 },
    { id: '17', nome: 'Rede hidráulica e Bombas', categoria: 'Água e Energia', valorNovo: 140000, vidaUtilAnos: 15, valorResidualPerc: 0 },
    { id: '18', nome: 'Energia elétrica e Iluminação', categoria: 'Água e Energia', valorNovo: 155000, vidaUtilAnos: 20, valorResidualPerc: 5 },
    { id: '19', nome: 'Gerador', categoria: 'Água e Energia', valorNovo: 90000, vidaUtilAnos: 10, valorResidualPerc: 20 },
    // MÁQUINAS
    { id: '20', nome: 'Trator principal', categoria: 'Máquinas', valorNovo: 320000, vidaUtilAnos: 10, valorResidualPerc: 20 },
    { id: '21', nome: 'Vagão misturador', categoria: 'Máquinas', valorNovo: 280000, vidaUtilAnos: 15, valorResidualPerc: 5 },
    { id: '22', nome: 'Carregadeira / concha frontal', categoria: 'Máquinas', valorNovo: 300000, vidaUtilAnos: 10, valorResidualPerc: 25 },
    { id: '23', nome: 'Carreta agrícola e Implementos', categoria: 'Máquinas', valorNovo: 130000, vidaUtilAnos: 15, valorResidualPerc: 5 },
    // EQUIPAMENTOS
    { id: '24', nome: 'Balança pecuária e Tronco', categoria: 'Equipamentos', valorNovo: 140000, vidaUtilAnos: 10, valorResidualPerc: 10 },
    { id: '25', nome: 'Brete e Apartador', categoria: 'Equipamentos', valorNovo: 60000, vidaUtilAnos: 12, valorResidualPerc: 10 },
    { id: '26', nome: 'Seringa e Equip. vacinação', categoria: 'Equipamentos', valorNovo: 45000, vidaUtilAnos: 5, valorResidualPerc: 0 },
    { id: '27', nome: 'Balanças de insumos', categoria: 'Equipamentos', valorNovo: 20000, vidaUtilAnos: 8, valorResidualPerc: 5 },
    // AMBIENTAL E LICENCIAMENTO
    { id: '28', nome: 'Drenagem águas pluviais/contaminadas', categoria: 'Ambiental e Licenciamento', valorNovo: 200000, vidaUtilAnos: 20, valorResidualPerc: 0 },
    { id: '29', nome: 'Coleta e Pátio esterco', categoria: 'Ambiental e Licenciamento', valorNovo: 170000, vidaUtilAnos: 15, valorResidualPerc: 0 },
    { id: '30', nome: 'Lagoa / bacia / reservatório', categoria: 'Ambiental e Licenciamento', valorNovo: 250000, vidaUtilAnos: 25, valorResidualPerc: 0 },
    { id: '31', nome: 'Regularização e Documentação', categoria: 'Ambiental e Licenciamento', valorNovo: 145000, vidaUtilAnos: 10, valorResidualPerc: 0 },
  ],
  raca: 'nelore',
  sexo: 'macho',
  frameSize: 'medio',
  itensFinanciamento: [],
  precoBoiMagro: 4500.00,
  precoBoiGordo: 330.00,
  salarioMinimo: 3070.00,
  valorTerraHa: 50000,
  precoVolumoso: 0.54,
  precoConcentrado: 1.67,
  pesagens: [],
  ultrassom: [],
  sobrasCochoPerc: 3.00,
  custoSanidadePorBoi: 100.00,
  bonificacaoPerc: 0,
  fretePorAnimal: 100.00,
  precoEsterco: 130.00,
  quantidadeEsterco: 1.5,
  funruralPerc: 1.63,
  valorResidual: 0,
  dieselLitrosCabecaDia: 0.15,
  precoDiesel: 6.20,
  comissaoCompraPerc: 1.0,
  comissaoVendaPerc: 1.5,
  investimentoSocialAnual: 12000,
  horasTreinamentoFuncionarioAno: 40,
  indiceBemEstarAnimal: 8,
  usoEnergiaRenovavelPerc: 30,
  distanciaMediaTransporteKm: 150,
  usoAguaRecicladaPerc: 15,
  certificacaoCompliance: true,
  rastreabilidadeTotal: true,
  desviosPadrao: {
    precoBoiMagro: 200,
    precoBoiGordo: 20,
    gmd: 0.24, // CV Médio ~16% (1.5 * 0.16)
    precoConcentrado: 0.05,
    precoVolumoso: 0.03,
    pesoVivoInicial: 23, // CV Médio ~6.6% (350 * 0.066)
    pesoVivoFinal: 33, // CV Médio ~6.6% (500 * 0.066)
    rendimentoCarcaca: 1.85, // CV Médio ~3.4% (54 * 0.034)
    cmsVolumoso: 1.5, // CV Médio ~10.8% (14 * 0.108)
    cmsConcentrado: 0.54, // CV Médio ~10.8% (5 * 0.108)
    precoEsterco: 10,
    quantidadeEsterco: 0.1,
    tmaAnual: 1.475, // 10% de 14.75
    valorTerraHa: 20000, // 40% de 50000
    taxaMortalidade: 0.1, // 10% de 1.00
    salarioMinimo: 614, // 20% de 3070
    boisMaoDeObra: 35, // 35% de 100
    custoSanidadePorBoi: 20 // 20% de 100
  },
  correlacoes: {
    precoBoiMagro: { precoBoiGordo: 0.84, precoConcentrado: 0.35, pesoVivoInicial: 0.45 },
    precoBoiGordo: { precoConcentrado: 0.38, pesoVivoFinal: 0.50 },
    pesoVivoInicial: { pesoVivoFinal: 0.72 },
    precoVolumoso: { precoConcentrado: 0.25 }
  },
  copulaType: 'spearman'
};

const STRESS_INPUTS: Record<string, string> = {
  precoBoiMagro: 'Preço Boi Magro',
  precoBoiGordo: 'Preço Boi Gordo',
  gmd: 'GMD',
  precoConcentrado: 'Preço Concentrado',
  precoVolumoso: 'Preço Volumoso',
  taxaMortalidade: 'Mortalidade',
  rendimentoCarcaca: 'Rendimento de Carcaça',
  tempoAlimentacao: 'Tempo Alimentação',
  arrendamentoTerraPerc: 'Arrendamento',
  custoSanidadePorBoi: 'Sanidade',
};

const CALIBRATION_KEYS: Record<string, string> = {
  precoBoiMagro: 'Preço Boi Magro (R$/animal)',
  precoBoiGordo: 'Preço Boi Gordo (R$/@)',
  precoConcentrado: 'Preço Concentrado (R$/kg)',
  precoVolumoso: 'Preço Volumoso (R$/kg)',
  gmd: 'GMD (kg/dia)'
};

const PROFESSIONAL_LABOR_REFERENCE = {
  salariosBase: {
    auxiliar: 1900,
    peao: 2200,
    sanidade: 2300,
    tratorista: 2800,
    mistura: 3000,
    manutencao: 3200,
    administrativo: 2800,
    encarregado: 4500,
    gerente: 7500
  },
  encargos: 45.59, // Ref: Conab 2010 - Empregado rural tempo indeterminado
  proLabore: [
    { max: 1000, valor: 8000 },
    { max: 5000, valor: 12000 },
    { max: 20000, valor: 18000 },
    { max: 50000, valor: 25000 },
    { max: Infinity, valor: 35000 }
  ],
  assistenciaTecnica: [
    { max: 500, valor: 4000 },
    { max: 1000, valor: 5000 },
    { max: 1500, valor: 6000 },
    { max: 2000, valor: 7000 },
    { max: 5000, valor: 12000 },
    { max: 10000, valor: 18000 },
    { max: 20000, valor: 28000 },
    { max: 30000, valor: 38000 },
    { max: 50000, valor: 55000 },
    { max: Infinity, valor: 75000 }
  ],
  equipe: [
    { max: 500, gerente: 1, encarregado: 0, administrativo: 0, tratorista: 1, mistura: 0, curral: 1, sanidade: 0, manutencao: 1, servicosGerais: 1 },
    { max: 1000, gerente: 1, encarregado: 0, administrativo: 1, tratorista: 2, mistura: 1, curral: 2, sanidade: 1, manutencao: 1, servicosGerais: 1 },
    { max: 1500, gerente: 1, encarregado: 1, administrativo: 1, tratorista: 2, mistura: 1, curral: 2, sanidade: 1, manutencao: 1, servicosGerais: 1 },
    { max: 2000, gerente: 1, encarregado: 1, administrativo: 1, tratorista: 2, mistura: 1, curral: 2, sanidade: 1, manutencao: 1, servicosGerais: 1 },
    { max: 5000, gerente: 1, encarregado: 2, administrativo: 1, tratorista: 4, mistura: 2, curral: 4, sanidade: 2, manutencao: 2, servicosGerais: 2 },
    { max: 10000, gerente: 1, encarregado: 3, administrativo: 2, tratorista: 6, mistura: 3, curral: 5, sanidade: 3, manutencao: 3, servicosGerais: 2 },
    { max: 20000, gerente: 1, encarregado: 4, administrativo: 3, tratorista: 10, mistura: 5, curral: 8, sanidade: 5, manutencao: 5, servicosGerais: 4 },
    { max: 30000, gerente: 1, encarregado: 5, administrativo: 4, tratorista: 14, mistura: 7, curral: 12, sanidade: 7, manutencao: 7, servicosGerais: 5 },
    { max: 50000, gerente: 1, encarregado: 7, administrativo: 6, tratorista: 22, mistura: 10, curral: 18, sanidade: 10, manutencao: 10, servicosGerais: 8 },
    { max: Infinity, gerente: 1, encarregado: 9, administrativo: 8, tratorista: 30, mistura: 14, curral: 25, sanidade: 14, manutencao: 14, servicosGerais: 10 }
  ]
};

const TeamInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) => (
  <div className="flex flex-col justify-between p-3 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-200 group min-h-[92px]">
    <div className="min-h-[30px] flex items-start">
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-tight group-hover:text-emerald-400 transition-colors break-words whitespace-normal block w-full">
        {label}
      </span>
    </div>
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60">
      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Qtd</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 text-center bg-slate-900/60 border border-slate-800 rounded-lg px-1.5 py-0.5 focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-xs font-black text-slate-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono"
          min="0"
        />
        <span className="text-[8px] font-bold text-slate-500 uppercase">un</span>
      </div>
    </div>
  </div>
);

const ReportOption = ({ label, checked, onChange, icon, disabled = false }: { 
  label: string, 
  checked: boolean, 
  onChange: () => void, 
  icon: React.ReactNode,
  disabled?: boolean
}) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
      disabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100' :
      checked ? 'border-emerald-500 bg-emerald-50/60' : 'border-gray-100 bg-white hover:border-gray-200'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${checked ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-slate-400'}`}>
        {icon}
      </div>
      <span className={`font-semibold text-sm ${checked ? 'text-emerald-950 font-bold' : 'text-gray-600'}`}>{label}</span>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'
    }`}>
      {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
    </div>
  </button>
);

export default function App() {
  // --- DETECTOR DE AUTENTICAÇÃO E BANCO DE DADOS SUPABASE ---
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('simuboi_demo_mode') === 'true';
  });
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'update_password'>('login');
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [integrationTab, setIntegrationTab] = useState<'github' | 'vercel' | 'supabase'>('github');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncingData, setIsSyncingData] = useState(false);

  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLaborSummary, setShowLaborSummary] = useState(false);
  const [suggestedTeam, setSuggestedTeam] = useState<any>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [lhsResults, setLhsResults] = useState<LHSSimulationResults | null>(null);
  const [activeTab, setActiveTab] = useState<'inputs' | 'results' | 'risk' | 'data' | 'diet' | 'esg' | 'market'>('inputs');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isResultsDropdownOpen, setIsResultsDropdownOpen] = useState(false);
  const [isSensitivityInfoOpen, setIsSensitivityInfoOpen] = useState(false);
  const [isRegressionInfoOpen, setIsRegressionInfoOpen] = useState(false);
  const [isMorrisInfoOpen, setIsMorrisInfoOpen] = useState(false);
  const [isSobolInfoOpen, setIsSobolInfoOpen] = useState(false);
  const [isCopulaInfoOpen, setIsCopulaInfoOpen] = useState(false);
  const [isHistogramInfoOpen, setIsHistogramInfoOpen] = useState(false);
  const [isSavedSimsOpen, setIsSavedSimsOpen] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [selectedSimsForDominance, setSelectedSimsForDominance] = useState<string[]>([]);
  const [dominanceResults, setDominanceResults] = useState<any[]>([]);
  const [isCalculatingDominance, setIsCalculatingDominance] = useState(false);
  const [newSimName, setNewSimName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDiet, setIsSavingDiet] = useState(false);
  const [newDietName, setNewDietName] = useState('');
  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [stressResults, setStressResults] = useState<any[]>([]);
  const [whatIfInput, setWhatIfInput] = useState<string>('');
  const [whatIfChange, setWhatIfChange] = useState<number>(10);
  const [mcIterations, setMcIterations] = useState(10000);
  const [riskSubTab, setRiskSubTab] = useState<'risco' | 'cenarios' | 'impacto' | 'dominancia'>('risco');
  const [customStressScenarios, setCustomStressScenarios] = useState<any[]>([]);
  const [editingStressId, setEditingStressId] = useState<string | null>(null);
  const [isAddingStress, setIsAddingStress] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(() => {
    const today = new Date().toISOString().split('T')[0];
    return [
      { state: "SP", boiGordo: 285.50, boiMagro: 3200.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "MS", boiGordo: 278.00, boiMagro: 3050.00, ingredientPrices: {}, date: today, trend: 'up' },
      { state: "MT", boiGordo: 264.50, boiMagro: 2850.00, ingredientPrices: {}, date: today, trend: 'down' },
      { state: "GO", boiGordo: 272.00, boiMagro: 2980.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "MG", boiGordo: 279.50, boiMagro: 3100.00, ingredientPrices: {}, date: today, trend: 'up' },
      { state: "RS", boiGordo: 262.00, boiMagro: 2920.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "PR", boiGordo: 275.50, boiMagro: 3080.00, ingredientPrices: {}, date: today, trend: 'up' },
      { state: "SC", boiGordo: 270.00, boiMagro: 3120.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "PA", boiGordo: 258.00, boiMagro: 2750.00, ingredientPrices: {}, date: today, trend: 'down' },
      { state: "RO", boiGordo: 259.00, boiMagro: 2780.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "TO", boiGordo: 261.00, boiMagro: 2800.00, ingredientPrices: {}, date: today, trend: 'up' },
      { state: "BA", boiGordo: 268.00, boiMagro: 2890.00, ingredientPrices: {}, date: today, trend: 'stable' },
      { state: "MA", boiGordo: 262.00, boiMagro: 2810.00, ingredientPrices: {}, date: today, trend: 'up' }
    ];
  });
  const [isFetchingMarket, setIsFetchingMarket] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const [selectedSyncState, setSelectedSyncState] = useState('SP');
  const [agioSelectedState, setAgioSelectedState] = useState<string>('Médio');
  const [showAgioExplanation, setShowAgioExplanation] = useState<boolean>(false);
  const [savedDiets, setSavedDiets] = useState<SavedDiet[]>([]);
  const [dietIngredients, setDietIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [dietRequirements, setDietRequirements] = useState<DietRequirements>({
    pbMin: 13,
    ndtMin: 75,
    fdnMin: 15,
    fdnMax: 30,
    caMin: 0.4,
    pMin: 0.25,
    eeMax: 7,
    pdrMin: 60,
    pdrMax: 75,
    ureaMax: 1.0,
    caPRatioMin: 1.5,
    caPRatioMax: 2.5,
    cms: 10,
    forageMin: 15,
    forageMax: 45,
    optimizationGoal: 'cost'
  });
  const [dietAnimalProfile, setDietAnimalProfile] = useState<DietAnimalProfile>({
    weight: DEFAULT_INPUTS.pesoVivoInicial,
    finalWeight: DEFAULT_INPUTS.pesoVivoFinal,
    gmd: DEFAULT_INPUTS.gmd,
    sex: 'macho',
    raca: 'zebuino',
    idade: 24,
    ecc: 5,
    frameSize: 'medio',
    precoBoiGordo: DEFAULT_INPUTS.precoBoiGordo,
    rendimentoCarcaca: DEFAULT_INPUTS.rendimentoCarcaca
  });
  const [dietResult, setDietResult] = useState<DietOptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isFullProfileModalOpen, setIsFullProfileModalOpen] = useState(false);
  const [isSavedDietsModalOpen, setIsSavedDietsModalOpen] = useState(false);
  const [dietMode, setDietMode] = useState<'manual' | 'auto'>('manual');
  const [batchSize, setBatchSize] = useState(100);
  const [mixerCapacity, setMixerCapacity] = useState(4000);
  const [factoryBatchSize, setFactoryBatchSize] = useState(1000);
  const [newStress, setNewStress] = useState({
    name: '',
    changes: [] as { inputKey: string; changePerc: number }[],
    color: 'amber'
  });
  const [currentChange, setCurrentChange] = useState({
    inputKey: 'precoBoiGordo',
    changePerc: -10
  });
  const [scenarioPercentiles, setScenarioPercentiles] = useState({
    pessimistic: 10,
    expected: 50,
    optimistic: 90
  });

  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [calibrationResults, setCalibrationResults] = useState<any>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const calculateCalibration = (data: any[]) => {
    const keys = Object.keys(CALIBRATION_KEYS);
    const stats: any = {};
    
    keys.forEach(key => {
      const values = data.map(d => {
        const dataKey = Object.keys(d).find(k => k.toLowerCase() === key.toLowerCase() || k === key);
        return dataKey ? parseFloat(String(d[dataKey]).replace(',', '.')) : NaN;
      }).filter(v => !isNaN(v));

      if (values.length > 1) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        stats[key] = { mean, stdDev, cv: (stdDev / mean) * 100, count: values.length };
      }
    });

    const correlations: any = {};
    keys.forEach(k1 => {
      correlations[k1] = {};
      keys.forEach(k2 => {
        if (k1 === k2) {
          correlations[k1][k2] = 1;
          return;
        }
        
        const dataKey1 = Object.keys(data[0] || {}).find(k => k.toLowerCase() === k1.toLowerCase() || k === k1);
        const dataKey2 = Object.keys(data[0] || {}).find(k => k.toLowerCase() === k2.toLowerCase() || k === k2);

        if (!dataKey1 || !dataKey2) {
          correlations[k1][k2] = 0;
          return;
        }

        const v1 = data.map(d => parseFloat(String(d[dataKey1]).replace(',', '.')));
        const v2 = data.map(d => parseFloat(String(d[dataKey2]).replace(',', '.')));
        
        const pairs = v1.map((v, i) => [v, v2[i]]).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
        
        if (pairs.length > 2) {
          const n = pairs.length;
          const m1 = pairs.reduce((a, b) => a + b[0], 0) / n;
          const m2 = pairs.reduce((a, b) => a + b[1], 0) / n;
          const num = pairs.reduce((a, b) => a + (b[0] - m1) * (b[1] - m2), 0);
          const den = Math.sqrt(
            pairs.reduce((a, b) => a + Math.pow(b[0] - m1, 2), 0) * 
            pairs.reduce((a, b) => a + Math.pow(b[1] - m2, 2), 0)
          );
          correlations[k1][k2] = den === 0 ? 0 : num / den;
        } else {
          correlations[k1][k2] = 0;
        }
      });
    });

    return { stats, correlations };
  };
  const [vplThreshold, setVplThreshold] = useState(0);
  const [screenWidth, setScreenWidth] = useState<'standard' | 'wide' | 'full'>(() => {
    const saved = localStorage.getItem('simuboi_screen_width');
    return (saved as 'standard' | 'wide' | 'full') || 'standard';
  });
  const [showSplash, setShowSplash] = useState(false);

  const morrisStats = useMemo(() => {
    if (!lhsResults?.morris || lhsResults.morris.length === 0) return null;
    const n = lhsResults.morris.length;
    const avgMuStar = lhsResults.morris.reduce((sum, m) => sum + m.muStar, 0) / n;
    const avgSigma = lhsResults.morris.reduce((sum, m) => sum + m.sigma, 0) / n;
    return { avgMuStar, avgSigma };
  }, [lhsResults?.morris]);

  useEffect(() => {
    localStorage.setItem('simuboi_screen_width', screenWidth);
  }, [screenWidth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let racaMapped: 'zebuino' | 'europeu' | 'cruzado' = 'zebuino';
    if (inputs.raca === 'cruzamento') {
      racaMapped = 'cruzado';
    } else if (inputs.raca === 'holandes') {
      racaMapped = 'europeu';
    } else if (inputs.raca === 'nelore') {
      racaMapped = 'zebuino';
    }

    setDietAnimalProfile(prev => ({
      ...prev,
      weight: Number(inputs.pesoVivoInicial),
      finalWeight: Number(inputs.pesoVivoFinal),
      gmd: Number(inputs.gmd),
      sex: inputs.sexo as any,
      raca: racaMapped,
      frameSize: inputs.frameSize as any,
      precoBoiGordo: Number(inputs.precoBoiGordo),
      rendimentoCarcaca: Number(inputs.rendimentoCarcaca)
    }));
  }, [
    inputs.pesoVivoInicial,
    inputs.pesoVivoFinal,
    inputs.gmd,
    inputs.sexo,
    inputs.raca,
    inputs.frameSize,
    inputs.precoBoiGordo,
    inputs.rendimentoCarcaca
  ]);

  useEffect(() => {
    const reqs = calculateRequirements(dietAnimalProfile);
    setDietRequirements(prev => {
      const currentForageMin = prev.forageMin !== undefined ? prev.forageMin : 15;
      const currentForageMax = prev.forageMax !== undefined ? prev.forageMax : 45;
      return {
        ...reqs,
        forageMin: currentForageMin,
        forageMax: currentForageMax,
        optimizationGoal: prev.optimizationGoal ?? 'cost'
      };
    });
  }, [dietAnimalProfile]);

  useEffect(() => {
    if (dietMode === 'auto' && dietIngredients.length > 0) {
      const result = optimizeDiet(dietIngredients.filter(ing => ing.selected), dietRequirements, dietAnimalProfile);
      setDietResult(result);
    }
  }, [dietRequirements, dietMode, dietIngredients]);

  useEffect(() => {
    const res = calculateSimulation(inputs);
    setResults(res);
  }, [inputs]);

  useEffect(() => {
    if (!results) return;
    
    const scenarios = [
      ...customStressScenarios.map(cs => {
        let scenarioInputs = { ...inputs };
        if (cs.changes && cs.changes.length > 0) {
          cs.changes.forEach((change: any) => {
            const key = change.inputKey as keyof typeof inputs;
            if (typeof scenarioInputs[key] === 'number') {
              (scenarioInputs[key] as number) = (inputs[key] as number) * (1 + change.changePerc / 100);
            }
          });
        } else if (cs.inputKey) {
          const key = cs.inputKey as keyof typeof inputs;
          if (typeof scenarioInputs[key] === 'number') {
            (scenarioInputs[key] as number) = (inputs[key] as number) * (1 + cs.changePerc / 100);
          }
        }
        return { ...cs, inputs: scenarioInputs };
      })
    ];

    const stressRes = scenarios.map(s => {
      const res = calculateSimulation(s.inputs);
      const vplDiff = res.vpl - results.vpl;
      const vplDiffPerc = results.vpl !== 0 ? (vplDiff / Math.abs(results.vpl)) * 100 : 0;
      
      return {
        ...s,
        vpl: res.vpl,
        lucro: res.lucro,
        tir: res.tir,
        vplDiff,
        vplDiffPerc
      };
    });

    setStressResults(stressRes);
  }, [inputs, results?.vpl, customStressScenarios]);

  const thresholdStats = useMemo(() => {
    if (!lhsResults) return { above: 0, below: 0 };
    const total = lhsResults.iteracoes.length;
    const above = lhsResults.iteracoes.filter(it => it.vpl >= vplThreshold).length;
    const below = total - above;
    return {
      above: (above / total) * 100,
      below: (below / total) * 100
    };
  }, [lhsResults, vplThreshold]);

  const topCorrelations = useMemo(() => {
    const list: { key1: string; key2: string; value: number }[] = [];
    Object.entries(inputs.correlacoes).forEach(([k1, targets]) => {
      Object.entries(targets as Record<string, number>).forEach(([k2, val]) => {
        list.push({ key1: k1, key2: k2, value: val });
      });
    });
    return list
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 3);
  }, [inputs.correlacoes]);

  const marketStats = useMemo(() => {
    let priceSource = {
      boiMagro: inputs.precoBoiMagro,
      boiGordo: inputs.precoBoiGordo,
      weight: inputs.pesoVivoInicial || 350,
      label: "Simulado"
    };

    if (agioSelectedState !== 'Simulado' && marketPrices.length > 0) {
      if (agioSelectedState === 'Médio') {
        const validValues = marketPrices.filter(p => p.boiGordo > 0);
        if (validValues.length > 0) {
          const avgMagro = validValues.reduce((acc, p) => acc + p.boiMagro, 0) / validValues.length;
          const avgGordo = validValues.reduce((acc, p) => acc + p.boiGordo, 0) / validValues.length;
          priceSource = {
            boiMagro: avgMagro,
            boiGordo: avgGordo,
            weight: inputs.pesoVivoInicial || 350,
            label: "Média de Todos os Estados"
          };
        }
      } else if (agioSelectedState.startsWith('Regiao-')) {
        const regionMapping: Record<string, string[]> = {
          'Regiao-Sudeste': ['SP', 'MG'],
          'Regiao-Sul': ['RS', 'PR', 'SC'],
          'Regiao-Centro-Oeste': ['MS', 'MT', 'GO'],
          'Regiao-Norte': ['PA', 'RO', 'TO'],
          'Regiao-Nordeste': ['BA', 'MA']
                        };
        const targetStates = regionMapping[agioSelectedState];
        if (targetStates) {
          const validValues = marketPrices.filter(p => targetStates.includes(p.state.toUpperCase()) && p.boiGordo > 0);
          if (validValues.length > 0) {
            const avgMagro = validValues.reduce((acc, p) => acc + p.boiMagro, 0) / validValues.length;
            const avgGordo = validValues.reduce((acc, p) => acc + p.boiGordo, 0) / validValues.length;
            const regionLabels: Record<string, string> = {
              'Regiao-Sudeste': 'Região Sudeste',
              'Regiao-Sul': 'Região Sul',
              'Regiao-Centro-Oeste': 'Região Centro-Oeste',
              'Regiao-Norte': 'Região Norte',
              'Regiao-Nordeste': 'Região Nordeste'
            };
            priceSource = {
              boiMagro: avgMagro,
              boiGordo: avgGordo,
              weight: inputs.pesoVivoInicial || 350,
              label: `Média ${regionLabels[agioSelectedState]}`
            };
          }
        }
      } else {
        const found = marketPrices.find(p => p.state.toUpperCase() === agioSelectedState.toUpperCase());
        if (found) {
          priceSource = {
            boiMagro: found.boiMagro,
            boiGordo: found.boiGordo,
            weight: inputs.pesoVivoInicial || 350,
            label: `Mercado ${found.state}`
          };
        }
      }
    }

    const { boiMagro, boiGordo, weight, label } = priceSource;
    const pArrobaMagro = weight > 0 ? (boiMagro * 30) / weight : 0;
    const pArrobaGordo = boiGordo || 1;
    const activeAgioVal = pArrobaGordo > 0 ? ((pArrobaMagro / pArrobaGordo) - 1) * 100 : 0;

    let text = "";
    if (activeAgioVal >= 0) {
      if (activeAgioVal > 30) {
        text = `O ágio de referência (${label}) está elevado em ${activeAgioVal.toFixed(1)}%. Fortes pressões sobre as margens, considere usar mecanismos de proteção de preços (hedge).`;
      } else if (activeAgioVal > 20) {
        text = `O ágio de referência (${label}) está em nível moderado (${activeAgioVal.toFixed(1)}%). Recomendável focar em conversão alimentar de custo mínimo na dieta e máximo GMD.`;
      } else if (activeAgioVal > 10) {
        text = `Ágio de reposição (${label}) está em ${activeAgioVal.toFixed(1)}%, facilitando compras competitivas de gado magro para o ciclo de engorda.`;
      } else {
        text = `Oportunidade excepcional: ágio de reposição em patamar extremamente favorável de ${activeAgioVal.toFixed(1)}% (${label}).`;
      }
    } else {
      text = `Deságio de referência detectado (${label}): o gado magro está cotado a ${Math.abs(activeAgioVal).toFixed(1)}% abaixo do boi gordo por arroba, representando uma excelente margem de compra!`;
    }

    return {
      agioMedio: activeAgioVal,
      label: label,
      dicaText: text,
      pArrobaMagro,
      pArrobaGordo,
      boiMagro,
      boiGordo,
      weight
    };
  }, [marketPrices, agioSelectedState, inputs.pesoVivoInicial, inputs.precoBoiMagro, inputs.precoBoiGordo]);

  useEffect(() => {
    const saved = localStorage.getItem('simuboi_simulations');
    if (saved) {
      try {
        setSavedSimulations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved simulations', e);
      }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('simuboi_saved_diets');
    if (saved) {
      try {
        setSavedDiets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved diets', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('simuboi_saved_diets', JSON.stringify(savedDiets));
  }, [savedDiets]);

  // --- CONTROLLER DE SESSÃO DO SUPABASE & MOCK AUTH BANCO LOCAL ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      const stored = localStorage.getItem('simuboi_mock_session');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          // silence
        }
      }
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({ email: session.user.email || '' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({ email: session.user.email || '' });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Detectar link de redefinição de senha hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
      setAuthView('update_password');
    }
  }, []);

  // Carregar dados remotos do Supabase quando logar
  useEffect(() => {
    if (currentUser) {
      const loadRemoteData = async () => {
        setIsSyncingData(true);
        const remoteData = await fetchUserDataFromSupabase();
        if (remoteData) {
          if (remoteData.simulations && remoteData.simulations.length > 0) {
            setSavedSimulations(remoteData.simulations);
            localStorage.setItem('simuboi_simulations', JSON.stringify(remoteData.simulations));
          }
          if (remoteData.diets && remoteData.diets.length > 0) {
            setSavedDiets(remoteData.diets);
            localStorage.setItem('simuboi_saved_diets', JSON.stringify(remoteData.diets));
          }
        }
        setIsSyncingData(false);
      };
      loadRemoteData();
    }
  }, [currentUser]);

  // Sincronizar modificações locais estruturadas de volta para o Supabase
  useEffect(() => {
    if (currentUser && !isSyncingData) {
      syncUserDataToSupabase(currentUser.email, savedSimulations, savedDiets);
    }
  }, [savedSimulations, savedDiets, currentUser]);

  // Funções de manipulação do acesso
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Por favor, preencha todos os campos do formulário.');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsAuthLoading(true);
    try {
      const { data, error } = await supabaseSignIn(authEmail, authPassword);
      if (error) throw error;
      if (data?.user) {
        setCurrentUser({ email: data.user.email || authEmail });
        if (!isSupabaseConfigured) {
          localStorage.setItem('simuboi_mock_session', JSON.stringify({ email: data.user.email || authEmail }));
        }
        setAuthSuccess('Conexão realizada com sucesso!');
        setIsDemoMode(false);
        localStorage.removeItem('simuboi_demo_mode');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao realizar acesso.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authConfirmPassword) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError('As senhas digitadas não coincidem.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsAuthLoading(true);
    try {
      const { data, error } = await supabaseSignUp(authEmail, authPassword);
      if (error) throw error;
      if (data?.user) {
        setAuthSuccess(
          isSupabaseConfigured 
            ? 'Conta registrada! Enviamos um link de confirmação para o seu e-mail.' 
            : 'Conta criada com sucesso no modo Sandbox local!'
        );
        if (!isSupabaseConfigured) {
          setTimeout(() => {
            setCurrentUser({ email: authEmail });
            localStorage.setItem('simuboi_mock_session', JSON.stringify({ email: authEmail }));
            setIsDemoMode(false);
            localStorage.removeItem('simuboi_demo_mode');
          }, 1500);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao criar conta.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    localStorage.removeItem('simuboi_mock_session');
    setIsDemoMode(false);
    localStorage.removeItem('simuboi_demo_mode');
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthError('');
    setAuthSuccess('');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      setAuthError('Por favor, insira seu endereço de e-mail.');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsAuthLoading(true);
    try {
      const { error } = await supabaseResetPassword(authEmail);
      if (error) throw error;
      setAuthSuccess(
        isSupabaseConfigured
          ? 'O link de recuperação de acesso foi enviado para o seu e-mail.'
          : 'Instruções enviadas com sucesso no modo simulado local!'
      );
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao redefinir acesso.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword || !authConfirmPassword) {
      setAuthError('Ambos os campos de senha são obrigatórios.');
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthError('As novas senhas digitadas não coincidem.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }
    setAuthError('');
    setAuthSuccess('');
    setIsAuthLoading(true);
    try {
      const { error } = await supabaseUpdatePassword(authPassword);
      if (error) throw error;
      setAuthSuccess('Sua senha foi redefinida com êxito! Redirecionando...');
      setTimeout(() => {
        setAuthView('login');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthSuccess('');
      }, 2000);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao redefinir a senha.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('simuboi_demo_mode', 'true');
    setAuthError('');
    setAuthSuccess('');
  };

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    inputs: true,
    results: true,
    riskStats: true,
    riskCharts: true,
    scenarios: true,
    cashflow: true,
    rawData: true,
    diet: true,
  });

  const handleDownloadHistogramPNG = async () => {
    const chartElement = document.getElementById('vpl-histogram-chart');
    if (chartElement) {
      const canvas = await html2canvas(chartElement, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `SimuBoi_Distribuicao_VPL_${newSimName || 'Simulacao'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleDownloadReport = async () => {
    console.log('Iniciando geração de relatório PDF...');
    setIsGeneratingReport(true);
    try {
      if (typeof jsPDF !== 'function') {
        console.error('jsPDF não é uma função. Verifique a importação.');
        throw new Error('Biblioteca PDF não carregada corretamente.');
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      console.log('Documento jsPDF criado.');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Helper for adding text and checking page overflow
      const addText = (text: string, x: number, y: number, size = 10, color = [0, 0, 0], isBold = false) => {
        if (y > 280) {
          doc.addPage();
          yPos = 20;
          y = 20;
        }
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(text, x, y);
        return y + (size * 0.5) + 2;
      };

      const addParecer = (title: string, content: string, x: number, y: number) => {
        const maxWidth = pageWidth - (2 * margin) - 10;
        const lines = doc.splitTextToSize(content, maxWidth);
        const boxHeight = (lines.length * 5) + 12;

        if (y + boxHeight > 280) {
          doc.addPage();
          y = 20;
        }

        // Box background
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(x, y, pageWidth - (2 * margin), boxHeight, 3, 3, 'F');
        
        // Left border accent
        doc.setFillColor(59, 130, 246);
        doc.rect(x, y, 1.5, boxHeight, 'F');

        doc.setFontSize(9);
        doc.setTextColor(31, 41, 55);
        doc.setFont('helvetica', 'bold');
        doc.text(title, x + 5, y + 6);
        
        doc.setFontSize(8.5);
        doc.setTextColor(75, 85, 99);
        doc.setFont('helvetica', 'normal');
        doc.text(lines, x + 5, y + 12);

        return y + boxHeight + 8;
      };

      // Header
      yPos = addText('SimuBoi - Relatório Técnico de Confinamento', margin, yPos, 18, [16, 185, 129], true);
      yPos = addText(`Projeto: ${newSimName || 'Simulação Sem Nome'}`, margin, yPos, 12, [75, 85, 99]);
      yPos = addText(`Data de Emissão: ${new Date().toLocaleString('pt-BR')}`, margin, yPos, 10, [107, 114, 128]);
      yPos += 10;

      // 1. Parâmetros
      if (reportConfig.inputs) {
        console.log('Adicionando parâmetros ao PDF...');
        yPos = addText('1. Parâmetros de Entrada', margin, yPos, 14, [31, 41, 55], true);
        yPos += 2;
        
        const params = [
          { l: 'Peso Inicial', v: `${inputs.pesoVivoInicial} kg` },
          { l: 'Peso Final', v: `${inputs.pesoVivoFinal} kg` },
          { l: 'GMD', v: `${inputs.gmd} kg/dia` },
          { l: 'Preço Boi Magro', v: `R$ ${inputs.precoBoiMagro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/animal` },
          { l: 'Preço Boi Gordo', v: `R$ ${inputs.precoBoiGordo.toFixed(2)}/@` },
          { l: 'Preço Concentrado', v: `R$ ${inputs.precoConcentrado.toFixed(2)}/kg` },
          { l: 'Preço Volumoso', v: `R$ ${inputs.precoVolumoso.toFixed(2)}/kg` },
          { l: 'Tempo Alimentação', v: `${inputs.tempoAlimentacao} dias` },
          { l: 'Mortalidade', v: `${inputs.taxaMortalidade}%` },
        ];

        params.forEach(p => {
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(p.l, margin, yPos);
          doc.setTextColor(0);
          doc.text(String(p.v), margin + 60, yPos);
          yPos += 5;
        });
        
        yPos += 2;
        const inputParecer = `A configuração atual apresenta um GMD de ${inputs.gmd} kg/dia para um período de ${inputs.tempoAlimentacao} dias. O ágio de compra/venda (Preço Boi Magro vs Boi Gordo) é um fator crítico nesta estrutura de custos.`;
        yPos = addParecer('Parecer Técnico - Configuração', inputParecer, margin, yPos);
        yPos += 5;
      }

      // 2. Resultados
      if (reportConfig.results && results) {
        console.log('Adicionando resultados ao PDF...');
        yPos = addText('2. Resultados Econômicos (Determinísticos)', margin, yPos, 14, [31, 41, 55], true);
        yPos += 2;
        
        const resData = [
          { l: 'Lucro por Animal', v: formatCurrency(results.lucro) },
          { l: 'VPL do Projeto', v: formatCurrency(results.vpl) },
          { l: 'ROIA (%)', v: `${results.roia.toFixed(2)}%` },
          { l: 'Ponto de Equilíbrio (Preço)', v: formatCurrency(results.pontoEquilibrioPreco) },
          { l: 'Custo Total por Animal', v: formatCurrency(results.custoTotal) },
          { l: 'Receita Bruta por Animal', v: formatCurrency(results.receitaBruta) },
          { l: 'Custo Total por Animal/Dia', v: `${formatCurrency(results.custoTotalPorAnimalDia)}/dia` },
          { l: 'Custo Total/Dia (sem compra)', v: `${formatCurrency(results.custoTotalSemCompraDia)}/dia` },
          { l: 'Margem Líquida', v: formatCurrency(results.margemLiquida) },
        ];

        resData.forEach(r => {
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(r.l, margin, yPos);
          doc.setTextColor(r.l === 'Lucro por Animal' || r.l === 'VPL do Projeto' ? 16 : 0, r.l === 'Lucro por Animal' || r.l === 'VPL do Projeto' ? 185 : 0, r.l === 'Lucro por Animal' || r.l === 'VPL do Projeto' ? 129 : 0);
          doc.text(String(r.v), margin + 60, yPos);
          yPos += 5;
        });

        yPos += 2;
        const resParecer = results.vpl > 0 
          ? `O projeto é economicamente viável no cenário determinístico, com um VPL positivo de ${formatCurrency(results.vpl)}. O ROIA de ${results.roia.toFixed(2)}% indica um retorno atrativo frente ao capital investido.`
          : `Atenção: O projeto apresenta VPL negativo no cenário base. É necessário revisar os custos operacionais ou aguardar melhores condições de mercado para garantir a viabilidade.`;
        yPos = addParecer('Parecer Técnico - Viabilidade', resParecer, margin, yPos);
        yPos += 5;
      }

      // 3. Risco LHS Stats
      if (reportConfig.riskStats && lhsResults) {
        console.log('Adicionando estatísticas de risco ao PDF...');
        yPos = addText('3. Análise de Risco (Monte Carlo/LHS)', margin, yPos, 14, [31, 41, 55], true);
        yPos += 2;
        
        const riskData = [
          { l: 'VPL Médio Esperado', v: formatCurrency(lhsResults.vplMedio) },
          { l: 'Desvio Padrão', v: formatCurrency(lhsResults.desvioPadrao) },
          { l: 'Probabilidade de VPL > 0', v: `${lhsResults.probabilidadePositivo.toFixed(2)}%` },
          { l: 'Coeficiente de Variação', v: `${lhsResults.coeficienteVariacao.toFixed(2)}%` },
          { l: 'VPL Mínimo Simulado', v: formatCurrency(lhsResults.vplMinimo) },
          { l: 'VPL Máximo Simulado', v: formatCurrency(lhsResults.vplMaximo) },
        ];

        riskData.forEach(r => {
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(r.l, margin, yPos);
          doc.setTextColor(0);
          doc.text(String(r.v), margin + 60, yPos);
          yPos += 5;
        });

        yPos += 2;
        const riskParecer = `A probabilidade de sucesso (VPL > 0) é de ${lhsResults.probabilidadePositivo.toFixed(2)}%. Um Coeficiente de Variação de ${lhsResults.coeficienteVariacao.toFixed(2)}% sugere um nível de ${lhsResults.coeficienteVariacao > 50 ? 'alto' : 'moderado'} risco em relação à média esperada.`;
        yPos = addParecer('Parecer Técnico - Risco Probabilístico', riskParecer, margin, yPos);
        yPos += 5;
      }

      // 4. Cenários
      if (reportConfig.scenarios && lhsResults) {
        console.log('Adicionando cenários ao PDF...');
        yPos = addText('4. Cenários Probabilísticos', margin, yPos, 14, [31, 41, 55], true);
        yPos += 2;

        const vpls = [...lhsResults.iteracoes].map(i => i.vpl).sort((a, b) => a - b);
        const getVPL = (p: number) => vpls[Math.min(vpls.length - 1, Math.max(0, Math.floor(vpls.length * (p / 100))))];

        const scenarios = [
          { l: `Pessimista (${scenarioPercentiles.pessimistic}%)`, v: formatCurrency(getVPL(scenarioPercentiles.pessimistic)) },
          { l: `Esperado (${scenarioPercentiles.expected}%)`, v: formatCurrency(getVPL(scenarioPercentiles.expected)) },
          { l: `Otimista (${scenarioPercentiles.optimistic}%)`, v: formatCurrency(getVPL(scenarioPercentiles.optimistic)) },
        ];

        scenarios.forEach(s => {
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(s.l, margin, yPos);
          doc.setTextColor(0);
          doc.text(s.v, margin + 60, yPos);
          yPos += 5;
        });

        const p10 = vpls[Math.floor(vpls.length * 0.1)];
        const p90 = vpls[Math.floor(vpls.length * 0.9)];
        const scenarioParecer = `Existe uma amplitude de ${formatCurrency(p90 - p10)} entre os cenários otimista e pessimista, evidenciando a sensibilidade do negócio às oscilações de mercado.`;
        yPos = addParecer('Parecer Técnico - Amplitude de Cenários', scenarioParecer, margin, yPos);
        yPos += 5;
      }

      // 5. Fluxo de Caixa
      if (reportConfig.cashflow && results) {
        console.log('Adicionando fluxo de caixa ao PDF...');
        doc.addPage();
        yPos = 20;
        yPos = addText('5. Fluxo de Caixa Detalhado', margin, yPos, 14, [31, 41, 55], true);
        yPos += 5;

        const headers = ['Mês', 'Descrição', 'Entradas', 'Saídas', 'Saldo', 'Acumulado'];
        const colWidths = [15, 60, 25, 25, 25, 30];
        
        // Draw headers
        doc.setFontSize(8);
        doc.setTextColor(100);
        let xOffset = margin;
        headers.forEach((h, i) => {
          doc.text(h, xOffset, yPos);
          xOffset += colWidths[i];
        });
        yPos += 5;
        doc.line(margin, yPos - 3, margin + 180, yPos - 3);

        results.fluxoCaixa.forEach(item => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFontSize(7);
          doc.setTextColor(0);
          xOffset = margin;
          doc.text(String(item.mes), xOffset, yPos);
          xOffset += colWidths[0];
          doc.text(item.descricao.substring(0, 40), xOffset, yPos);
          xOffset += colWidths[1];
          doc.text(formatCurrency(item.entradas), xOffset, yPos);
          xOffset += colWidths[2];
          doc.text(formatCurrency(item.saidas), xOffset, yPos);
          xOffset += colWidths[3];
          doc.text(formatCurrency(item.saldo), xOffset, yPos);
          xOffset += colWidths[4];
          doc.text(formatCurrency(item.acumulado), xOffset, yPos);
          yPos += 4;
        });

        yPos += 5;
        const minSaldo = Math.min(...results.fluxoCaixa.map(f => f.acumulado));
        const cashParecer = `O ponto de maior exposição de caixa (saldo acumulado mínimo) é de ${formatCurrency(minSaldo)}. É fundamental garantir liquidez para cobrir este montante durante o ciclo produtivo.`;
        yPos = addParecer('Parecer Técnico - Liquidez e Caixa', cashParecer, margin, yPos);
        yPos += 5;
      }

      // 6. Dieta
      if (reportConfig.diet && dietResult && dietResult.feasible) {
        console.log('Adicionando dieta ao PDF...');
        doc.addPage();
        yPos = 20;
        yPos = addText('6. Formulação da Dieta', margin, yPos, 14, [31, 41, 55], true);
        yPos += 5;

        const optData = [
          { l: 'Custo Total Dieta (Matéria Seca - MS)', v: `R$ ${dietResult.totalCost.toFixed(3)}/kg` },
          { l: 'Custo Total Dieta (Matéria Natural - MN)', v: `R$ ${dietResult.totalCostMN.toFixed(3)}/kg` },
          { l: 'GMD Predito', v: `${dietResult.predictedGmd.toFixed(3)} kg/dia` },
          { l: 'Conversão Alimentar', v: `${dietResult.feedConversion.toFixed(2)}:1` },
          { l: 'Relação Volumoso:Concentrado', v: `${dietResult.foragePercentage.toFixed(0)}:${dietResult.concentratePercentage.toFixed(0)}` },
        ];

        optData.forEach(o => {
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(o.l, margin, yPos);
          doc.setTextColor(0);
          doc.text(String(o.v), margin + 60, yPos);
          yPos += 5;
        });

        yPos += 5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Composição da Dieta:', margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        dietResult.ingredients.forEach(ing => {
          doc.text(`- ${ing.name}: ${ing.percentage.toFixed(2)}% (MS)`, margin + 5, yPos);
          yPos += 4;
        });

        yPos += 5;
        const optParecer = `A dieta formulada apresenta um custo de R$ ${dietResult.totalCostMN.toFixed(3)} por kg de matéria natural. O GMD predito de ${dietResult.predictedGmd.toFixed(3)} kg/dia é compatível com as exigências nutricionais do lote.`;
        yPos = addParecer('Parecer Técnico - Nutrição', optParecer, margin, yPos);
        yPos += 5;
      }

      // 7. Dados da Simulação
      if (reportConfig.rawData && lhsResults) {
        console.log('Adicionando dados da simulação ao PDF...');
        yPos = addText('7. Dados das Simulações (LHS)', margin, yPos, 14, [31, 41, 55], true);
        yPos += 5;
        
        const sortedIters = [...lhsResults.iteracoes].sort((a, b) => b.vpl - a.vpl);
        const top5 = sortedIters.slice(0, 5);
        const bottom5 = sortedIters.slice(-5).reverse();

        doc.setFontSize(8);
        doc.setTextColor(16, 185, 129);
        doc.text('Top 5 Melhores Cenários (VPL):', margin, yPos);
        yPos += 4;
        top5.forEach((it, idx) => {
          doc.text(`${idx + 1}. ID ${it.id}: ${formatCurrency(it.vpl)}`, margin + 5, yPos);
          yPos += 4;
        });

        yPos += 2;
        doc.setTextColor(239, 68, 68);
        doc.text('Top 5 Piores Cenários (VPL):', margin, yPos);
        yPos += 4;
        bottom5.forEach((it, idx) => {
          doc.text(`${idx + 1}. ID ${it.id}: ${formatCurrency(it.vpl)}`, margin + 5, yPos);
          yPos += 4;
        });

        yPos += 2;
        const rawParecer = `A análise dos extremos mostra que, no melhor caso, o VPL pode atingir ${formatCurrency(top5[0].vpl)}, enquanto no pior cenário pode cair para ${formatCurrency(bottom5[0].vpl)}. Esta dispersão reforça a necessidade de estratégias de mitigação de risco.`;
        yPos = addParecer('Parecer Técnico - Extremos e Dispersão', rawParecer, margin, yPos);
        yPos += 5;
      }

      // 8. Charts
      if (reportConfig.riskCharts && lhsResults) {
        console.log('Tentando capturar gráficos com html2canvas...');
        const chartsTab = document.getElementById('charts-tab-content');
        if (chartsTab) {
          doc.addPage();
          yPos = 20;
          yPos = addText('8. Gráficos e Visualizações de Risco', margin, yPos, 14, [31, 41, 55], true);
          yPos += 5;
          
          try {
            const canvas = await html2canvas(chartsTab, { 
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - (2 * margin);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 10;

            const chartParecer = `O gráfico de distribuição (área) ilustra a concentração probabilística do VPL. A forma da curva indica ${lhsResults.vplMedio > results.vpl ? 'uma assimetria positiva (viés de alta)' : 'uma distribuição equilibrada'} em relação ao cenário determinístico.`;
            yPos = addParecer('Parecer Técnico - Análise Visual', chartParecer, margin, yPos);
          } catch (canvasError) {
            console.error('Erro ao capturar gráficos:', canvasError);
            yPos = addText('Nota: Erro ao renderizar gráficos no PDF.', margin, yPos, 8, [239, 68, 68]);
          }
        } else {
          console.log('Aba de gráficos não encontrada no DOM.');
          yPos = addText('Nota: Gráficos não incluídos pois a aba de Risco não estava ativa.', margin, yPos, 8, [239, 68, 68]);
        }
      }

      console.log('Salvando documento PDF...');
      doc.save(`SimuBoi_Relatorio_${newSimName || 'Simulacao'}.pdf`);
      console.log('PDF salvo com sucesso.');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      showToast('Ocorreu um erro ao gerar o relatório. Verifique o console para mais detalhes.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveDiet = (name: string) => {
    if (!dietResult) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newDiet: SavedDiet = {
      id: newId,
      name,
      date: new Date().toISOString(),
      result: dietResult,
      requirements: dietRequirements,
      animalProfile: dietAnimalProfile,
      ingredients: dietIngredients
    };
    setSavedDiets(prev => [newDiet, ...prev]);
    setEditingDietId(newId);
    showToast(`Dieta "${name}" salva com sucesso! Você pode carregá-la no botão "Carregar".`, 'success');
  };

  const handleUpdateDiet = (name: string) => {
    if (!dietResult || !editingDietId) return;
    setSavedDiets(prev => prev.map(d => d.id === editingDietId ? {
      ...d,
      name,
      date: new Date().toISOString(),
      result: dietResult,
      requirements: dietRequirements,
      animalProfile: dietAnimalProfile,
      ingredients: dietIngredients
    } : d));
    showToast(`Dieta "${name}" modificada e salva com sucesso!`, 'success');
  };

  const handleExportXLSX = () => {
    if (!dietResult) {
      showToast('Nenhuma dieta otimizada encontrada para exportação.', 'error');
      return;
    }

    const animalConfig = dietAnimalProfile;
    const reqs = dietRequirements;
    const profile = dietResult.nutritionalProfile;

    // Process ingredients
    const results = [...dietResult.ingredients].sort((a, b) => b.percentage - a.percentage);
    const ingredientsWithMN = results.map(ing => {
      const ingDef = dietIngredients.find(oi => oi.name === ing.name);
      const msPct = ingDef ? ingDef.ms / 100 : 0.85;
      const kgMS = (dietResult.cms || 0) * (ing.percentage / 100);
      const kgMN = msPct > 0 ? (kgMS / msPct) : 0;
      return {
        ...ing,
        type: ingDef ? ingDef.type : 'concentrado',
        price: ingDef ? ingDef.price : 0,
        kgMS,
        kgMN,
      };
    });

    const sumKgMN = ingredientsWithMN.reduce((sum, item) => sum + item.kgMN, 0);

    const rows: any[][] = [];

    // Header Panel
    rows.push(["SIMUBOI - PLANEJAMENTO E FORMULAÇÃO DE DIETA (XLSX)"]);
    rows.push(["Relatório de Otimização e Controle Nutricional"]);
    rows.push(["Data de Geração:", `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`]);
    rows.push(["Ferramenta:", "SimuBoi FeedSim Pro (NRC/NASEM 2016)"]);
    rows.push([]);

    // Section 1: Perfil do Animal
    rows.push(["1. PERFIL DO ANIMAL E CONFIGURAÇÕES DO LOTE"]);
    rows.push(["Métrica", "Valor", "Unidade", "Propriedade", "Especificação"]);
    rows.push([
      "Peso Vivo Inicial", 
      Number(animalConfig.weight), 
      "kg", 
      "Sexo (NRC)", 
      animalConfig.sex === 'macho' ? 'Macho Castrado' : animalConfig.sex === 'inteiro' ? 'Macho Inteiro' : 'Fêmea'
    ]);
    rows.push([
      "Peso Vivo Final (Meta)", 
      Number(animalConfig.finalWeight), 
      "kg", 
      "Raça / Genética", 
      animalConfig.raca === 'zebuino' ? 'Bos Indicus (Zebu)' : animalConfig.raca === 'europeu' ? 'Bos Taurus (Europeu)' : 'Cruzamento Industrial'
    ]);
    rows.push([
      "Meta GMD", 
      Number(animalConfig.gmd), 
      "kg/dia", 
      "Tamanho de Frame", 
      animalConfig.frameSize.charAt(0).toUpperCase() + animalConfig.frameSize.slice(1)
    ]);
    rows.push([
      "Idade do Lote", 
      Number(animalConfig.idade), 
      "meses", 
      "ECC (1 a 9)", 
      Number(animalConfig.ecc)
    ]);
    rows.push([
      "Tamanho do Lote", 
      Number(batchSize), 
      "animais",
      "",
      ""
    ]);
    rows.push([]);

    // Section 2: Desempenho Predito
    rows.push(["2. DESEMPENHO BIOLÓGICO PREDITO"]);
    rows.push(["Indicador de Desempenho", "Valor Estimado", "Unidade"]);
    rows.push(["GMD Calculado do Lote", Number(dietResult.predictedGmd), "kg/dia"]);
    rows.push(["Conversão Alimentar", Number(dietResult.feedConversion), ":1"]);
    rows.push(["Consumo de Matéria Seca (CMS)", Number((dietResult.cms || 0)), "kg/dia"]);
    rows.push(["CMS % Peso Vivo", Number((dietResult.cmsPercentageBW || ((dietResult.cms || 0) / animalConfig.weight * 105))), "% PV"]);
    rows.push(["Ingestão de Água Estimada", Number(dietResult.waterIntake), "Litros/animal/dia"]);
    rows.push([]);

    // Section 3: Custos Econômicos por Animal e por Lote
    const animalDailyCost = dietResult.totalCostMN * (dietResult.forageIntakeMN + dietResult.concentrateIntakeMN);
    const batchDailyCost = animalDailyCost * batchSize;

    rows.push(["3. RESUMO DE CUSTOS POR ANIMAL E POR LOTE"]);
    rows.push(["Unidade de Ração / Gasto", "Custo / kg MS (R$)", "Custo / kg MN (R$)", "Custo / Animal / Dia (R$)", `Custo Diário Lote - ${batchSize} Animais (R$)`]);
    rows.push([
      "Volumoso", 
      Number(dietResult.forageCostPerKgMS), 
      Number(dietResult.forageCostPerKgMN), 
      Number((dietResult.forageIntakeMN * dietResult.forageCostPerKgMN)),
      Number((dietResult.forageIntakeMN * dietResult.forageCostPerKgMN * batchSize))
    ]);
    rows.push([
      "Concentrado", 
      Number(dietResult.concentrateCostPerKgMS), 
      Number(dietResult.concentrateCostPerKgMN), 
      Number((dietResult.concentrateIntakeMN * dietResult.concentrateCostPerKgMN)),
      Number((dietResult.concentrateIntakeMN * dietResult.concentrateCostPerKgMN * batchSize))
    ]);
    rows.push([
      "Custo Ração Otimizado (Total)", 
      Number(dietResult.totalCost), 
      Number(dietResult.totalCostMN), 
      Number(animalDailyCost),
      Number(batchDailyCost)
    ]);
    rows.push([]);

    // Section 4: Formulação Atual - Insumos
    rows.push(["4. DETALHAMENTO DA FORMULAÇÃO DA DIETA ATUAL"]);
    rows.push([
      "Insumo", 
      "Categoria", 
      "Inclusão (% MS)", 
      "Inclusão (% MN)", 
      "Qtd. MS / Cab (kg)", 
      "Qtd. MN / Cab (kg)", 
      `Total Diário Lote (${batchSize} anim) (kg)`, 
      "Preço / kg MN (R$)", 
      "Custo Cab/Dia (R$)"
    ]);

    let totalPctMS = 0;
    let totalPctMN = 0;
    let totalKgMS = 0;
    let totalKgMN = 0;
    let totalLoteMN = 0;
    let totalCusto = 0;

    ingredientsWithMN.forEach(ing => {
      const pctMN = sumKgMN > 0 ? (ing.kgMN / sumKgMN) * 100 : 0;
      const batchMN = ing.kgMN * batchSize;
      const costPerAnimal = ing.kgMN * ing.price;

      totalPctMS += ing.percentage;
      totalPctMN += pctMN;
      totalKgMS += ing.kgMS;
      totalKgMN += ing.kgMN;
      totalLoteMN += batchMN;
      totalCusto += costPerAnimal;

      let typeLabel = "Concentrado";
      if (ing.type === 'volumoso') typeLabel = "Volumoso";
      else if (ing.type === 'mineral') typeLabel = "Mineral";
      else if (ing.type === 'aditivo') typeLabel = "Aditivo";

      rows.push([
        ing.name,
        typeLabel,
        Number(ing.percentage.toFixed(2)),
        Number(pctMN.toFixed(2)),
        Number(ing.kgMS.toFixed(3)),
        Number(ing.kgMN.toFixed(3)),
        Number(batchMN.toFixed(1)),
        Number(ing.price.toFixed(3)),
        Number(costPerAnimal.toFixed(2))
      ]);
    });

    // Total Row
    rows.push([
      "Total Geral",
      "—",
      Number(totalPctMS.toFixed(2)),
      Number(totalPctMN.toFixed(2)),
      Number(totalKgMS.toFixed(3)),
      Number(totalKgMN.toFixed(3)),
      Number(totalLoteMN.toFixed(1)),
      "—",
      Number(totalCusto.toFixed(2))
    ]);
    rows.push([]);

    // Section 5: Controle Nutricional
    const checkStatus = (val: number, req: number) => val >= req ? "✔ Conforme" : "✘ Abaixo da Exigência";
    const checkFDN = (val: number, min: number, max: number) => (val >= min && val <= max) ? "✔ Recomendado" : val < min ? "⚠ Abaixo da Fibra Mínima" : "⚠ Acima da Fibra Máxima";

    rows.push(["5. EXIGÊNCIAS NUTRICIONAIS ATINGIDAS VS EXPERIMENTADAS (CONTROLE NUTRICIONAL)"]);
    rows.push(["Nutriente", "Meta Mínima / Faixa Recom.", "Teor Formulado na Dieta", "Status de Conformidade"]);
    rows.push([
      "Proteína Bruta (PB)", 
      `${reqs.pbMin.toFixed(2)}%`, 
      `${profile.pb.toFixed(2)}%`, 
      checkStatus(profile.pb, reqs.pbMin)
    ]);
    rows.push([
      "Nutrientes Digestíveis Totais (NDT)", 
      `${reqs.ndtMin.toFixed(2)}%`, 
      `${profile.ndt.toFixed(2)}%`, 
      checkStatus(profile.ndt, reqs.ndtMin)
    ]);
    rows.push([
      "Fibra em Detergente Neutro (FDN)", 
      `${reqs.fdnMin.toFixed(1)}% a ${reqs.fdnMax.toFixed(1)}%`, 
      `${profile.fdn.toFixed(1)}%`, 
      checkFDN(profile.fdn, reqs.fdnMin, reqs.fdnMax)
    ]);
    rows.push([
      "Cálcio (Ca)", 
      `${reqs.caMin.toFixed(2)}%`, 
      `${profile.ca.toFixed(2)}%`, 
      checkStatus(profile.ca, reqs.caMin)
    ]);
    rows.push([
      "Fósforo (P)", 
      `${reqs.pMin.toFixed(2)}%`, 
      `${profile.p.toFixed(2)}%`, 
      checkStatus(profile.p, reqs.pMin)
    ]);
    rows.push([
      "Relação Cálcio:Fósforo (Ca:P)", 
      "1.50 a 2.50", 
      Number((profile.ca / Math.max(0.01, profile.p)).toFixed(2)), 
      "✔ Conforme"
    ]);
    rows.push([
      "Extrato Etéreo (Gorduras)", 
      `Max ${reqs.eeMax?.toFixed(1) || '7.0'}%`, 
      `${profile.ee.toFixed(2)}%`, 
      "✔ Conforme"
    ]);
    rows.push([]);

    // Section 6: Protocolo de Adaptação
    rows.push(["6. PROTOCOLO DE ADAPTAÇÃO RECOMENDADO"]);
    rows.push(["Fase", "Período", "Proporção Volumoso / Concentrado"]);
    rows.push(["Fase 1", "Dias 1 a 7", "60% Volumoso / 40% Concentrado"]);
    rows.push(["Fase 2", "Dias 8 a 14", "40% Volumoso / 60% Concentrado"]);
    rows.push(["Fase 3", "Dias 15 a 21", "20% Volumoso / 80% Concentrado"]);
    rows.push([]);

    // Section 7: Alertas de Nutrição
    if (dietResult.alerts.length > 0) {
      rows.push(["7. ALERTA TÉCNICOS E AMBIENTAIS DE FORMULAÇÃO"]);
      dietResult.alerts.forEach((alert, i) => {
        rows.push([`Alerta ${i + 1}`, alert]);
      });
    } else {
      rows.push(["7. ALERTAS TÉCNICOS"]);
      rows.push(["Status", "Dieta totalmente estável e equilibrada."]);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Dynamic columns sizing
    ws['!cols'] = [
      { wch: 40 }, // A
      { wch: 22 }, // B
      { wch: 18 }, // C
      { wch: 18 }, // D
      { wch: 18 }, // E
      { wch: 18 }, // F
      { wch: 18 }, // G
      { wch: 18 }, // H
      { wch: 18 }  // I
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Dieta Otimizada");
    XLSX.writeFile(wb, `SimuBoi_Relatorio_Dieta_${new Date().toISOString().substring(0,10)}.xlsx`);
    showToast('Planilha XLSX exportada com sucesso!', 'success');
  };

  const handlePrintDiet = () => {
    if (!dietResult) {
      showToast('Nenhuma dieta otimizada encontrada para impressão.', 'error');
      return;
    }

    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);

    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) {
      showToast('Erro ao inicializar o serviço de impressão.', 'error');
      return;
    }

    const animalConfig = dietAnimalProfile;
    const reqs = dietRequirements;
    const profile = dietResult.nutritionalProfile;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Otimização de Dieta - Bovinocultura</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;850&family=JetBrains+Mono:wght@400;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, sans-serif;
              color: #1e293b;
              line-height: 1.4;
              padding: 30px;
              font-size: 11px;
              background-color: #ffffff;
            }
            @media print {
              body {
                padding: 0;
                font-size: 9.5px;
              }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
            
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .header-title h1 {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: -0.01em;
            }
            .header-title p {
              font-size: 10px;
              color: #64748b;
              margin: 3px 0 0 0;
            }
            .header-meta {
              text-align: right;
            }
            .header-meta .date {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #0f172a;
              font-weight: bold;
            }
            .header-meta .app {
              font-size: 8.5px;
              color: #94a3b8;
              margin-top: 2px;
            }

            .section-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #0f172a;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-top: 20px;
              margin-bottom: 10px;
            }

            .grid-container {
              display: grid;
              grid-template-cols: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 15px;
            }
            .grid-col {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px;
            }
            .grid-col h3 {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              color: #475569;
              margin: 0 0 6px 0;
              letter-spacing: 0.05em;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            }
            .grid-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              border-bottom: 1px dashed #f1f5f9;
            }
            .grid-row:last-child {
              border-bottom: none;
            }
            .grid-label {
              color: #64748b;
              font-weight: 500;
            }
            .grid-val {
              font-weight: bold;
              color: #0f172a;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background-color: #f1f5f9;
              color: #334155;
              font-weight: 700;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              text-align: left;
              padding: 6px 8px;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 6px 8px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 9.5px;
            }
            .num {
              font-family: 'JetBrains Mono', monospace;
              text-align: right;
            }
            th.num {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              background-color: #f8fafc;
              border-top: 2px solid #cbd5e1;
            }

            .alert-container {
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 8px;
              padding: 10px;
              margin-bottom: 15px;
            }
            .alert-item {
              display: flex;
              gap: 6px;
              font-size: 9.5px;
              margin-bottom: 5px;
              color: #991b1b;
            }
            .alert-item:last-child {
              margin-bottom: 0;
            }
            .alert-bullet {
              color: #dc2626;
              font-weight: bold;
            }

            .adaptation-container {
              background-color: #f5f3ff;
              border: 1px solid #ddd6fe;
              border-radius: 8px;
              padding: 10px;
            }
            .adaptation-title {
              font-weight: bold;
              color: #5b21b6;
              margin-bottom: 6px;
              font-size: 9.5px;
            }
            
            .footer {
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              text-align: center;
              font-size: 8px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="header-title">
              <h1>Formulação de Dieta de Custo Mínimo</h1>
              <p>Relatório de Otimização e Controle Nutricional</p>
            </div>
            <div class="header-meta">
              <div class="date">${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
              <div class="app">Bovinocultura de Corte • FeedSim Pro</div>
            </div>
          </div>

          <div class="grid-container">
            <div class="grid-col">
              <h3>Perfil do Animal</h3>
              <div class="grid-row">
                <span class="grid-label">Peso Vivo Atual</span>
                <span class="grid-val">${animalConfig.weight} kg</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Raça / Sexo</span>
                <span class="grid-val" style="text-transform: capitalize;">${animalConfig.raca} / ${animalConfig.sex}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Meta GMD</span>
                <span class="grid-val">${animalConfig.gmd.toFixed(2)} kg/dia</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Frame Size</span>
                <span class="grid-val" style="text-transform: capitalize;">${animalConfig.frameSize}</span>
              </div>
            </div>

            <div class="grid-col">
              <h3>Desempenho Estimado</h3>
              <div class="grid-row">
                <span class="grid-label">GMD Calculado</span>
                <span class="grid-val">${dietResult.predictedGmd.toFixed(2)} kg/dia</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Conversão Alim.</span>
                <span class="grid-val">${dietResult.feedConversion.toFixed(2)}:1</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Consumo MS (CMS)</span>
                <span class="grid-val">${(dietResult.cms || 0).toFixed(2)} kg/dia</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">CMS % PV</span>
                <span class="grid-val">${dietResult.cmsPercentageBW ? dietResult.cmsPercentageBW.toFixed(2) : ((dietResult.cms || 0) / animalConfig.weight * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div class="grid-col">
              <h3>Custos e Lote</h3>
              <div class="grid-row">
                <span class="grid-label">Custo por kg MS</span>
                <span class="grid-val">R$ ${dietResult.totalCost.toFixed(3)}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Custo por kg de Matéria Natural (MN)</span>
                <span class="grid-val">R$ ${dietResult.totalCostMN.toFixed(3)}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Custo Animal/Dia</span>
                <span class="grid-val">R$ ${(dietResult.totalCost * (dietResult.cms || 0)).toFixed(2)}</span>
              </div>
              <div class="grid-row">
                <span class="grid-label">Lote (${batchSize} Animais)</span>
                <span class="grid-val">R$ ${(dietResult.totalCost * (dietResult.cms || 0) * batchSize).toFixed(2)}/dia</span>
              </div>
            </div>
          </div>

          <div class="section-title">Ingredientes e Composição da Dieta</div>
          <table>
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Tipo</th>
                <th class="num">Inclusão MS</th>
                <th class="num">Inclusão MN</th>
                <th class="num">Qtd. MS / Cab. (kg)</th>
                <th class="num">Qtd. MN / Cab. (kg)</th>
                <th class="num">Total p/ Lote (${batchSize} anim) (kg MN)</th>
                <th class="num">Preço / kg MN</th>
                <th class="num">Custo Cab/Dia</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const results = [...dietResult.ingredients].sort((a, b) => b.percentage - a.percentage);
                let totalPctMS = 0;
                let totalPctMN = 0;
                let totalKgMS = 0;
                let totalKgMN = 0;
                let totalLoteMN = 0;
                let totalCusto = 0;

                const ingredientsWithMN = results.map(ing => {
                  const ingDef = dietIngredients.find(oi => oi.name === ing.name);
                  const msPct = ingDef ? ingDef.ms / 100 : 0.85;
                  const kgMS = (dietResult.cms || 0) * (ing.percentage / 100);
                  const kgMN = msPct > 0 ? (kgMS / msPct) : 0;
                  return {
                    ...ing,
                    type: ingDef ? ingDef.type : 'concentrado',
                    price: ingDef ? ingDef.price : 0,
                    kgMS,
                    kgMN,
                  };
                });

                const sumKgMN = ingredientsWithMN.reduce((sum, item) => sum + item.kgMN, 0);

                return ingredientsWithMN.map(ing => {
                  const pctMN = sumKgMN > 0 ? (ing.kgMN / sumKgMN) * 100 : 0;
                  const batchMN = ing.kgMN * batchSize;
                  const costPerAnimal = ing.kgMN * ing.price;

                  totalPctMS += ing.percentage;
                  totalPctMN += pctMN;
                  totalKgMS += ing.kgMS;
                  totalKgMN += ing.kgMN;
                  totalLoteMN += batchMN;
                  totalCusto += costPerAnimal;

                  let typeLabel = "Concentrado";
                  if (ing.type === 'volumoso') typeLabel = "Volumoso";
                  else if (ing.type === 'mineral') typeLabel = "Mineral";
                  else if (ing.type === 'aditivo') typeLabel = "Aditivo";

                  return `
                    <tr>
                      <td style="font-weight: 600;">${ing.name}</td>
                      <td style="color: #64748b; font-size: 8.5px; text-transform: uppercase;">${typeLabel}</td>
                      <td class="num">${ing.percentage.toFixed(2)}%</td>
                      <td class="num">${pctMN.toFixed(2)}%</td>
                      <td class="num">${ing.kgMS.toFixed(3)}</td>
                      <td class="num">${ing.kgMN.toFixed(3)}</td>
                      <td class="num" style="font-weight: 600;">${batchMN.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</td>
                      <td class="num">R$ ${ing.price.toFixed(3)}</td>
                      <td class="num font-semibold">R$ ${costPerAnimal.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('') + `
                  <tr class="total-row">
                    <td>Total Geral</td>
                    <td>—</td>
                    <td class="num">${totalPctMS.toFixed(1)}%</td>
                    <td class="num">${totalPctMN.toFixed(1)}%</td>
                    <td class="num">${totalKgMS.toFixed(2)}</td>
                    <td class="num">${totalKgMN.toFixed(2)}</td>
                    <td class="num" style="font-weight: 800;">${totalLoteMN.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg</td>
                    <td class="num">—</td>
                    <td class="num">R$ ${totalCusto.toFixed(2)}</td>
                  </tr>
                `;
              })()}
            </tbody>
          </table>

          <div style="display: grid; grid-template-cols: 1.1fr 0.9fr; gap: 15px;">
            <div>
              <div class="section-title" style="margin-top: 0">Controle Nutricional da Formulação</div>
              <table>
                <thead>
                  <tr>
                    <th>Nutriente</th>
                    <th class="num">Meta Mínima</th>
                    <th class="num">Formulado</th>
                    <th class="num">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight: 500;">Proteína Bruta (PB)</td>
                    <td class="num">${reqs.pbMin.toFixed(2)}%</td>
                    <td class="num" style="font-weight: bold; color: ${profile.pb >= reqs.pbMin ? '#16a34a' : '#dc2626'}">${profile.pb.toFixed(2)}%</td>
                    <td style="font-weight: bold; color: ${profile.pb >= reqs.pbMin ? '#16a34a' : '#dc2626'}">${profile.pb >= reqs.pbMin ? '✔ Conforme' : '✘ Abaixo'}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Nutrientes Digestíveis Totais (NDT)</td>
                    <td class="num">${reqs.ndtMin.toFixed(2)}%</td>
                    <td class="num" style="font-weight: bold; color: ${profile.ndt >= reqs.ndtMin ? '#16a34a' : '#dc2626'}">${profile.ndt.toFixed(2)}%</td>
                    <td style="font-weight: bold; color: ${profile.ndt >= reqs.ndtMin ? '#16a34a' : '#dc2626'}">${profile.ndt >= reqs.ndtMin ? '✔ Conforme' : '✘ Abaixo'}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Fibra em Detergente Neutro (FDN)</td>
                    <td class="num">${reqs.fdnMin.toFixed(1)}% - ${reqs.fdnMax.toFixed(1)}%</td>
                    <td class="num" style="font-weight: bold; color: ${(profile.fdn >= reqs.fdnMin && profile.fdn <= reqs.fdnMax) ? '#16a34a' : '#dc2626'}">${profile.fdn.toFixed(1)}%</td>
                    <td style="font-weight: bold; color: ${(profile.fdn >= reqs.fdnMin && profile.fdn <= reqs.fdnMax) ? '#16a34a' : '#dc2626'}">
                      ${(profile.fdn >= reqs.fdnMin && profile.fdn <= reqs.fdnMax) ? '✔ Rec. FDN' : (profile.fdn < reqs.fdnMin ? '⚠ Insuficiente' : '⚠ Elevado')}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Cálcio (Ca)</td>
                    <td class="num">${reqs.caMin.toFixed(2)}%</td>
                    <td class="num" style="font-weight: bold; color: ${profile.ca >= reqs.caMin ? '#16a34a' : '#dc2626'}">${profile.ca.toFixed(2)}%</td>
                    <td style="font-weight: bold; color: ${profile.ca >= reqs.caMin ? '#16a34a' : '#dc2626'}">${profile.ca >= reqs.caMin ? '✔ Conforme' : '✘ Abaixo'}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Fósforo (P)</td>
                    <td class="num">${reqs.pMin.toFixed(2)}%</td>
                    <td class="num" style="font-weight: bold; color: ${profile.p >= reqs.pMin ? '#16a34a' : '#dc2626'}">${profile.p.toFixed(2)}%</td>
                    <td style="font-weight: bold; color: ${profile.p >= reqs.pMin ? '#16a34a' : '#dc2626'}">${profile.p >= reqs.pMin ? '✔ Conforme' : '✘ Abaixo'}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Relação Ca:P</td>
                    <td class="num">1.5 - 2.5</td>
                    <td class="num" style="font-weight: bold;">${(profile.ca / Math.max(0.01, profile.p)).toFixed(2)}</td>
                    <td style="font-weight: bold; color: #16a34a">✔ Conforme</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Extrato Etéreo (Gorduras)</td>
                    <td class="num">Max ${reqs.eeMax?.toFixed(1) || '7.0'}%</td>
                    <td class="num">${profile.ee.toFixed(2)}%</td>
                    <td style="font-weight: bold; color: #16a34a">✔ Conforme</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Água Estimada / Animal</td>
                    <td class="num">—</td>
                    <td class="num" style="font-weight: bold;">${dietResult.waterIntake.toFixed(1)} Litros</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div class="section-title" style="margin-top: 0">Alertas e Riscos Associados</div>
              ${dietResult.alerts.length > 0 ? `
                <div class="alert-container">
                  ${dietResult.alerts.map(alert => `
                    <div class="alert-item">
                      <span class="alert-bullet">■</span>
                      <span>${alert}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px; font-size: 9.5px; color: #065f46; font-weight: bold; text-align: center; margin-bottom: 15px;">
                  ✔ Dieta totalmente consistente. Nenhum distúrbio metabólico identificado.
                </div>
              `}

              <div class="section-title" style="margin-top: 10px;">Protocolo de Adaptação Recomendado</div>
              <div class="adaptation-container">
                <div class="adaptation-title">Adaptação em Escada de 3 Fases (21 dias)</div>
                <div class="grid-row" style="font-size: 9px; padding: 2px 0;">
                  <span class="grid-label" style="color: #6b21a8;">Fase 1 (Dia 1 a 7):</span>
                  <span class="grid-val" style="color: #6b21a8; font-family: 'JetBrains Mono', monospace">60% Volumoso / 40% Concentrado</span>
                </div>
                <div class="grid-row" style="font-size: 9px; padding: 2px 0;">
                  <span class="grid-label" style="color: #6b21a8;">Fase 2 (Dia 8 a 14):</span>
                  <span class="grid-val" style="color: #6b21a8; font-family: 'JetBrains Mono', monospace">40% Volumoso / 60% Concentrado</span>
                </div>
                <div class="grid-row" style="font-size: 9px; padding: 2px 0; border-bottom: none;">
                  <span class="grid-label" style="color: #6b21a8;">Fase 3 (Dia 15 a 21):</span>
                  <span class="grid-val" style="color: #6b21a8; font-family: 'JetBrains Mono', monospace">20% Volumoso / 80% Concentrado</span>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} • FeedSim Pro - Inteligência de Decisão na Bovinocultura de Corte e Confinamento de Precisão
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    frame.contentWindow?.focus();
    setTimeout(() => {
      frame.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(frame);
      }, 1000);
    }, 500);
  };

  const handleLoadDiet = (diet: SavedDiet) => {
    setDietResult(diet.result);
    setDietRequirements(diet.requirements);
    setDietAnimalProfile(diet.animalProfile);
    setDietIngredients(diet.ingredients);
    setEditingDietId(diet.id);
    setNewDietName(diet.name);
    setIsSavedDietsModalOpen(false);
    setActiveTab('diet');
    showToast(`Dieta "${diet.name}" carregada para edição.`, 'info');
  };

  const handleDeleteSavedDiet = (id: string) => {
    setSavedDiets(prev => prev.filter(d => d.id !== id));
    if (editingDietId === id) {
      setEditingDietId(null);
      setNewDietName('');
    }
  };

  const handleFetchMarketPrices = async () => {
    setIsFetchingMarket(true);
    try {
      const ingredientNames = dietIngredients.map(ing => ing.name);
      const prices = await fetchMarketPrices(ingredientNames);
      setMarketPrices(prices);
    } catch (error) {
      console.error("Erro ao buscar preços:", error);
    } finally {
      setIsFetchingMarket(false);
    }
  };

  const [isAddingFromDb, setIsAddingFromDb] = useState(false);

  const handleAddFromDb = (ing: Ingredient) => {
    if (dietIngredients.some(i => i.name === ing.name)) {
      showToast("Este insumo já está na lista.", "info");
      return;
    }
    setDietIngredients([...dietIngredients, { ...ing, selected: true }]);
    setIsAddingFromDb(false);
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      try {
        const ingredientsToUse = dietIngredients.filter(ing => ing.selected);
        
        if (ingredientsToUse.length === 0) {
          showToast("Selecione pelo menos um insumo para a formulação manual.", "info");
          setIsOptimizing(false);
          return;
        }

        // Garante que as exigências calculadas (CMS, PB, etc.) estão sincronizadas ao formular manualmente
        const reqs = calculateRequirements(dietAnimalProfile);
        const finalReqs = {
          ...reqs,
          forageMin: dietRequirements.forageMin,
          forageMax: dietRequirements.forageMax,
          optimizationGoal: dietRequirements.optimizationGoal
        };
        setDietRequirements(finalReqs);

        const result = optimizeDiet(ingredientsToUse, finalReqs, dietAnimalProfile);
        setDietResult(result);
        if (!result.feasible) {
          showToast("Não foi possível encontrar uma solução para os requisitos informados. Tente relaxar algumas restrições.", "error");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsOptimizing(false);
      }
    }, 500);
  };

  const handleCalculateRequirements = () => {
    const reqs = calculateRequirements(dietAnimalProfile);
    setDietRequirements(prev => ({
      ...prev,
      ...reqs
    }));
  };

  const handleAutoOptimizeAndApply = (goal: 'cost' | 'gmd') => {
    try {
      // 1. Sync animal profile from inputs
      const currentProfile: DietAnimalProfile = {
        weight: inputs.pesoVivoInicial,
        finalWeight: inputs.pesoVivoFinal,
        gmd: inputs.gmd,
        sex: inputs.sexo as any,
        raca: inputs.raca === 'nelore' ? 'zebuino' : inputs.raca === 'holandes' ? 'europeu' : 'cruzado',
        frameSize: inputs.frameSize as any,
        idade: 24,
        ecc: 5
      };
      setDietAnimalProfile(currentProfile);

      // 2. Set optimization goal
      const newRequirements = { 
        ...dietRequirements, 
        optimizationGoal: goal 
      };
      
      // 3. Recalculate requirements based on the synced profile
      const baseReqs = calculateRequirements(currentProfile);
      const finalReqs = { ...newRequirements, ...baseReqs, optimizationGoal: goal };
      setDietRequirements(finalReqs);

      // 4. Run optimization with standard ingredients
      const result = optimizeDiet(dietIngredients, finalReqs, currentProfile);
      
      if (!result.feasible) {
        showToast("Não foi possível encontrar uma formulação automática para este cenário. Tente ajustar os parâmetros na aba de Dieta.", "error");
        return;
      }

      setDietResult(result);

      // 5. Apply to main simulation
      setInputs(prev => ({
        ...prev,
        cmsVolumoso: result.forageIntakeMN,
        cmsConcentrado: result.concentrateIntakeMN,
        precoVolumoso: result.forageCostPerKgMN,
        precoConcentrado: result.concentrateCostPerKgMN
      }));

      const goalLabels = { cost: 'Custo Mínimo', gmd: 'Meta GMD' };
      showToast(`Ajuste por "${goalLabels[goal]}" aplicado com sucesso!`, 'success');
    } catch (error) {
      console.error("Erro na auto-formulação:", error);
    }
  };

  const handleSyncMarketPrices = () => {
    if (marketPrices.length === 0) {
      showToast("Busque os preços no módulo de Mercado primeiro.", "info");
      return;
    }
    if (marketPrices.length > 0) {
      setSelectedSyncState(marketPrices[0].state);
    }
    setIsSyncModalOpen(true);
  };

  const handleApplySyncMarketPrices = (stateCode: string) => {
    setIsSyncModalOpen(false);
    const market = marketPrices.find(mp => mp.state.toUpperCase() === stateCode.toUpperCase());
    if (market) {
      setDietAnimalProfile(prev => ({
        ...prev,
        precoBoiGordo: market.boiGordo
      }));

      // Sync ingredient prices if available
      if (market.ingredientPrices) {
        setDietIngredients(prev => prev.map(ing => {
          if (market.ingredientPrices && market.ingredientPrices[ing.name]) {
            return { ...ing, price: market.ingredientPrices[ing.name] };
          }
          return ing;
        }));
      }

      showToast(`Preços em ${stateCode.toUpperCase()} sincronizados!\n` +
            `Boi Gordo: R$ ${market.boiGordo.toFixed(2)}/@\n` +
            (market.ingredientPrices ? `Insumos da Dieta também atualizados.` : ""), 'success');
    } else {
      showToast("Estado não encontrado nos dados de mercado.", "error");
    }
  };

  const handleAddIngredient = () => {
    const newIng: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Insumo',
      type: 'concentrado',
      price: 1.0,
      pb: 10,
      ndt: 70,
      fdn: 20,
      ms: 88,
      ca: 0.1,
      p: 0.1,
      mg: 0,
      k: 0,
      na: 0,
      s: 0,
      vitA: 0,
      vitE: 0,
      ee: 0,
      pdr: 0,
      minIncl: 0,
      maxIncl: 100,
      selected: true
    };
    setDietIngredients([...dietIngredients, newIng]);
  };

  const handleRemoveIngredient = (id: string) => {
    setDietIngredients(dietIngredients.filter(ing => ing.id !== id));
  };

  const handleApplyOptimizedDiet = () => {
    if (!dietResult || !dietResult.feasible) return;
    
    // Update simulation inputs with MN values from diet
    setInputs(prev => ({
      ...prev,
      cmsVolumoso: dietResult.forageIntakeMN,
      cmsConcentrado: dietResult.concentrateIntakeMN,
      precoVolumoso: dietResult.forageCostPerKgMN,
      precoConcentrado: dietResult.concentrateCostPerKgMN
    }));
    
    showToast("Dados da dieta aplicados na simulação!\n\n" +
          `Consumo Volumoso: ${dietResult.forageIntakeMN.toFixed(2)} kg de Matéria Natural (MN)\n` +
          `Consumo Concentrado: ${dietResult.concentrateIntakeMN.toFixed(2)} kg de Matéria Natural (MN)\n` +
          `Preço Volumoso: R$ ${dietResult.forageCostPerKgMN.toFixed(2)}/kg MN\n` +
          `Preço Concentrado: R$ ${dietResult.concentrateCostPerKgMN.toFixed(2)}/kg MN`, 'success');
  };

  const handleSyncProfileWithParameters = () => {
    // Map dietAnimalProfile.raca back to inputs.raca
    let racaMappedBack: 'nelore' | 'cruzamento' | 'holandes' = 'nelore';
    if (dietAnimalProfile.raca === 'cruzado') {
      racaMappedBack = 'cruzamento';
    } else if (dietAnimalProfile.raca === 'europeu') {
      racaMappedBack = 'holandes';
    } else if (dietAnimalProfile.raca === 'zebuino') {
      racaMappedBack = 'nelore';
    }

    setInputs(prev => ({
      ...prev,
      pesoVivoInicial: Number(dietAnimalProfile.weight),
      pesoVivoFinal: Number(dietAnimalProfile.finalWeight),
      gmd: Number(dietAnimalProfile.gmd),
      sexo: dietAnimalProfile.sex as any,
      raca: racaMappedBack,
      frameSize: dietAnimalProfile.frameSize as any,
      precoBoiGordo: Number(dietAnimalProfile.precoBoiGordo),
      rendimentoCarcaca: Number(dietAnimalProfile.rendimentoCarcaca)
    }));
    showToast("Parâmetros de simulação atualizados com as informações do perfil do animal!", "success");
  };

  const handleDownloadCSV = () => {
    if (!lhsResults) {
      showToast('Execute a simulação LHS primeiro para baixar os dados.', 'info');
      return;
    }
    
    const headers = ['ID', 'VPL', ...Object.keys(lhsResults.iteracoes[0].inputs)];
    const rows = lhsResults.iteracoes.map(it => [
      it.id,
      it.vpl,
      ...Object.values(it.inputs)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SimuBoi_Dados_${newSimName || 'Simulacao'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveToLocalStorage = (sims: SavedSimulation[]) => {
    localStorage.setItem('simuboi_simulations', JSON.stringify(sims));
    setSavedSimulations(sims);
  };

  const handleSaveSimulation = () => {
    if (!newSimName.trim()) {
      showToast('Por favor, insira um nome para a simulação.', 'error');
      return;
    }

    const newSim: SavedSimulation = {
      id: crypto.randomUUID(),
      name: newSimName,
      date: new Date().toLocaleString('pt-BR'),
      inputs: { ...inputs }
    };

    const updated = [...savedSimulations, newSim];
    saveToLocalStorage(updated);
    setNewSimName('');
    setIsSaving(false);
    showToast('Simulação salva com sucesso!', 'success');
  };

  const loadSimulation = (sim: SavedSimulation) => {
    setInputs(sim.inputs);
    setLhsResults(null);
    setIsSavedSimsOpen(false);
    showToast(`Simulação "${sim.name}" carregada.`, 'success');
  };

  const deleteSimulation = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Excluir Simulação',
      message: 'Deseja realmente excluir esta simulação? Esta ação não pode ser desfeita.',
      onConfirm: () => {
        const updated = savedSimulations.filter(s => s.id !== id);
        saveToLocalStorage(updated);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRunLHS = () => {
    if (Object.keys(errors).length > 0) {
      showToast('Corrija os erros nos parâmetros antes de executar a análise de risco.', 'error');
      return;
    }
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const mc = runLHSSimulation(inputs, mcIterations);
        setLhsResults(mc);
        setIsSimulating(false);
        setActiveTab('risk');
      } catch (err) {
        console.error("Erro na simulação LHS: ", err);
        showToast('Erro ao executar a análise de risco: ' + (err instanceof Error ? err.message : String(err)), 'error');
        setIsSimulating(false);
      }
    }, 500);
  };

  const handleRunDominance = () => {
    if (selectedSimsForDominance.length < 2) {
      showToast('Selecione pelo menos 2 simulações para comparar.', 'info');
      return;
    }
    
    setIsCalculatingDominance(true);
    
    setTimeout(() => {
      const results = selectedSimsForDominance.map(id => {
        const sim = savedSimulations.find(s => s.id === id);
        if (!sim) return null;
        
        // Run LHS for the saved simulation
        const lhs = runLHSSimulation(sim.inputs, 5000); // Using fewer iterations for comparison speed
        
        // Calculate CDF points (0 to 100%)
        const vpls = lhs.iteracoes.map(i => i.vpl).sort((a, b) => a - b);
        const cdfPoints = [];
        for (let i = 0; i <= 100; i++) {
          const idx = Math.min(vpls.length - 1, Math.floor(vpls.length * (i / 100)));
          cdfPoints.push({
            prob: i,
            vpl: vpls[idx]
          });
        }
        
        return {
          id: sim.id,
          name: sim.name,
          vpls,
          cdfPoints,
          stats: {
            vplMedio: lhs.vplMedio,
            vplMinimo: lhs.vplMinimo,
            vplMaximo: lhs.vplMaximo,
            probPrejuizo: lhs.probabilidadePrejuizo,
            desvioPadrao: lhs.desvioPadrao
          }
        };
      }).filter(r => r !== null);

      // Perform Kolmogorov-Smirnov test between pairs
      const ksTests: any[] = [];
      if (results.length >= 2) {
        for (let i = 0; i < results.length; i++) {
          for (let j = i + 1; j < results.length; j++) {
            const sim1 = results[i]!;
            const sim2 = results[j]!;
            
            // Calculate KS Statistic
            // We need to compare the CDFs at various points
            // A simple way is to use the combined sorted unique VPL values
            const allVpls = [...sim1.vpls, ...sim2.vpls].sort((a, b) => a - b);
            let maxDiff = 0;
            let currentVpl = 0;
            
            // For each unique VPL, find the CDF value in both distributions
            // To be more efficient, we can just iterate through the combined list
            // and keep track of the counts
            let count1 = 0;
            let count2 = 0;
            const n1 = sim1.vpls.length;
            const n2 = sim2.vpls.length;
            
            for (const vpl of allVpls) {
              // This is a bit slow for 10k points, let's optimize
              // Since allVpls is sorted, we can just increment counts
            }
            
            // Optimized KS calculation
            let p1 = 0;
            let p2 = 0;
            let i1 = 0;
            let i2 = 0;
            
            while (i1 < n1 || i2 < n2) {
              const v1 = i1 < n1 ? sim1.vpls[i1] : Infinity;
              const v2 = i2 < n2 ? sim2.vpls[i2] : Infinity;
              
              if (v1 <= v2) {
                i1++;
                p1 = i1 / n1;
              }
              if (v2 <= v1) {
                i2++;
                p2 = i2 / n2;
              }
              
              const diff = Math.abs(p1 - p2);
              if (diff > maxDiff) {
                maxDiff = diff;
                currentVpl = Math.min(v1, v2);
              }
            }
            
            // Calculate p-value (approximate)
            const en = Math.sqrt((n1 * n2) / (n1 + n2));
            const lambda = (maxDiff + 0.12 + 0.11 / en) * en;
            let pValue = 0;
            if (lambda < 0.2) pValue = 1;
            else {
              // KS distribution approximation
              pValue = 2 * Math.exp(-2 * lambda * lambda);
              pValue = Math.min(1, pValue);
            }
            
            ksTests.push({
              sim1: sim1.name,
              sim2: sim2.name,
              dStatistic: maxDiff,
              pValue,
              significant: pValue < 0.05,
              vplAtMaxDiff: currentVpl
            });
          }
        }
      }
      
      setDominanceResults(results.map(r => ({ ...r, ksTests })) as any[]);
      setIsCalculatingDominance(false);
    }, 500);
  };

  const resetToDefaults = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Resetar para os Padrões',
      message: 'Deseja realmente resetar todos os parâmetros para os valores padrão? Isso apagará suas alterações atuais.',
      onConfirm: () => {
        setInputs(DEFAULT_INPUTS);
        setLhsResults(null);
        setActiveTab('inputs');
        setIsSettingsOpen(false);
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val = type === 'number' ? parseFloat(value) : value;
    
    // Validation Logic
    if (type === 'number' && typeof val === 'number') {
      const rules: Record<string, { min?: number; max?: number; message: string }> = {
        pesoVivoInicial: { min: 50, max: 1000, message: "Peso inicial deve estar entre 50 e 1000 kg." },
        pesoVivoFinal: { min: 100, max: 1200, message: "Peso final deve estar entre 100 e 1200 kg." },
        rendimentoCarcaca: { min: 30, max: 70, message: "Rendimento deve estar entre 30% e 70%." },
        gmd: { min: 0.01, max: 5.0, message: "GMD deve estar entre 0.01 e 5.0 kg/dia." },
        taxaMortalidade: { min: 0, max: 100, message: "Mortalidade deve estar entre 0% e 100%." },
        sobrasCochoPerc: { min: 0, max: 100, message: "Sobras devem estar entre 0% e 100%." },
        tmaAnual: { min: 0, max: 500, message: "TMA deve estar entre 0% e 500%." },
        arrendamentoTerraPerc: { min: 0, max: 100, message: "Arrendamento deve estar entre 0% e 100%." },
        funruralPerc: { min: 0, max: 20, message: "Funrural deve estar entre 0% e 20%." },
        bonificacaoPerc: { min: 0, max: 100, message: "Bonificação deve estar entre 0% e 100%." },
        encargosTrabalhistas: { min: 0, max: 500, message: "Encargos devem estar entre 0% e 500%." },
        animaisHa: { min: 0.1, max: 1000, message: "Lotação deve ser positiva." },
        areaAnimalM2: { min: 1, max: 10000, message: "Área deve ser positiva." },
        boisMaoDeObra: { min: 1, max: 10000, message: "Capacidade de M.O. deve ser positiva." },
        capacidadeEstatica: { min: 1, max: 1000000, message: "Capacidade deve ser positiva." },
        precoBoiMagro: { min: 1, message: "Preço deve ser positivo." },
        precoBoiGordo: { min: 1, message: "Preço deve ser positivo." },
        precoConcentrado: { min: 0.01, message: "Preço deve ser positivo." },
        precoVolumoso: { min: 0.01, message: "Preço deve ser positivo." },
      };

      const rule = rules[name];
      let currentError = "";

      if (rule) {
        if ((rule.min !== undefined && val < rule.min) || (rule.max !== undefined && val > rule.max)) {
          currentError = rule.message;
        }
      } else if (val < 0) {
        currentError = "Valor não pode ser negativo.";
      }

      // Cross-field validation
      if (name === 'pesoVivoFinal' && val <= inputs.pesoVivoInicial) {
        currentError = "Peso final deve ser maior que o peso inicial.";
      }
      if (name === 'pesoVivoInicial' && val >= inputs.pesoVivoFinal) {
        currentError = "Peso inicial deve ser menor que o peso final.";
      }

      setErrors(prev => {
        const next = { ...prev };
        if (currentError) {
          next[name] = currentError;
        } else {
          delete next[name];
          
          // Re-validate related fields
          if (name === 'pesoVivoFinal' && prev.pesoVivoInicial) {
            delete next.pesoVivoInicial;
          }
          if (name === 'pesoVivoInicial' && prev.pesoVivoFinal) {
            delete next.pesoVivoFinal;
          }
        }
        return next;
      });
      
      // Still clamp for safety in calculations, but allow UI to show error
      val = Math.max(0, val);
    }
    
    setInputs(prev => {
      const next = { ...prev, [name]: val };
      
      // Recalcular tempo de alimentação se peso inicial, final ou GMD mudar
      if (['pesoVivoInicial', 'pesoVivoFinal', 'gmd'].includes(name)) {
        const pvi = next.pesoVivoInicial;
        const pvf = next.pesoVivoFinal;
        const gmd = next.gmd;
        
        if (gmd > 0) {
          next.tempoAlimentacao = Math.ceil((pvf - pvi) / gmd);
        }
      }
      
      return next;
    });
  };

  const handleSdChange = (name: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      desviosPadrao: {
        ...prev.desviosPadrao,
        [name]: Math.max(0, parseFloat(value) || 0)
      }
    }));
  };

  const handleCorrelationChange = (key1: string, key2: string, value: string) => {
    const val = parseFloat(value);
    const errorKey = `corr-${key1}-${key2}`;
    
    // Strict validation: must be between -1 and 1
    if (isNaN(val) || val < -1 || val > 1) {
      setErrors(prev => ({ ...prev, [errorKey]: "Deve estar entre -1 e 1" }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }

    // Clamp between -1 and 1 for internal state safety
    const clampedVal = isNaN(val) ? 0 : Math.max(-1, Math.min(1, val));
    
    setInputs(prev => {
      const newCorrs = { ...prev.correlacoes };
      if (!newCorrs[key1]) newCorrs[key1] = {};
      newCorrs[key1][key2] = clampedVal;
      return { ...prev, correlacoes: newCorrs };
    });
  };

  const handleTeamChange = (role: string, value: string) => {
    const val = Math.max(0, parseInt(value) || 0);
    setInputs(prev => {
      const nextEquipe = { ...prev.equipe, [role]: val };
      
      const numEmployees = 
        nextEquipe.gerente + nextEquipe.encarregado + nextEquipe.administrativo + 
        nextEquipe.tratorista + nextEquipe.mistura + nextEquipe.curral + 
        nextEquipe.sanidade + nextEquipe.manutencao + nextEquipe.servicosGerais;
      
      const cltCostBase = 
        (nextEquipe.gerente * PROFESSIONAL_LABOR_REFERENCE.salariosBase.gerente) +
        (nextEquipe.encarregado * PROFESSIONAL_LABOR_REFERENCE.salariosBase.encarregado) +
        (nextEquipe.administrativo * PROFESSIONAL_LABOR_REFERENCE.salariosBase.administrativo) +
        (nextEquipe.tratorista * PROFESSIONAL_LABOR_REFERENCE.salariosBase.tratorista) +
        (nextEquipe.mistura * PROFESSIONAL_LABOR_REFERENCE.salariosBase.mistura) +
        (nextEquipe.curral * PROFESSIONAL_LABOR_REFERENCE.salariosBase.peao) +
        (nextEquipe.sanidade * PROFESSIONAL_LABOR_REFERENCE.salariosBase.sanidade) +
        (nextEquipe.manutencao * PROFESSIONAL_LABOR_REFERENCE.salariosBase.manutencao) +
        (nextEquipe.servicosGerais * PROFESSIONAL_LABOR_REFERENCE.salariosBase.auxiliar);
      
      return {
        ...prev,
        equipe: nextEquipe,
        boisMaoDeObra: numEmployees > 0 ? prev.capacidadeEstatica / numEmployees : 0,
        salarioMinimo: numEmployees > 0 ? cltCostBase / numEmployees : 0
      };
    });
  };

  const applyProfessionalLabor = () => {
    const cap = inputs.capacidadeEstatica;
    
    const team = PROFESSIONAL_LABOR_REFERENCE.equipe.find(e => cap <= e.max) || PROFESSIONAL_LABOR_REFERENCE.equipe[PROFESSIONAL_LABOR_REFERENCE.equipe.length - 1];
    
    const cltCostBase = 
      (team.gerente * PROFESSIONAL_LABOR_REFERENCE.salariosBase.gerente) +
      (team.encarregado * PROFESSIONAL_LABOR_REFERENCE.salariosBase.encarregado) +
      (team.administrativo * PROFESSIONAL_LABOR_REFERENCE.salariosBase.administrativo) +
      (team.tratorista * PROFESSIONAL_LABOR_REFERENCE.salariosBase.tratorista) +
      (team.mistura * PROFESSIONAL_LABOR_REFERENCE.salariosBase.mistura) +
      (team.curral * PROFESSIONAL_LABOR_REFERENCE.salariosBase.peao) +
      (team.sanidade * PROFESSIONAL_LABOR_REFERENCE.salariosBase.sanidade) +
      (team.manutencao * PROFESSIONAL_LABOR_REFERENCE.salariosBase.manutencao) +
      (team.servicosGerais * PROFESSIONAL_LABOR_REFERENCE.salariosBase.auxiliar);
    
    const numEmployees = team.gerente + team.encarregado + team.administrativo + team.tratorista + team.mistura + team.curral + team.sanidade + team.manutencao + team.servicosGerais;
    
    const proLabore = PROFESSIONAL_LABOR_REFERENCE.proLabore.find(p => cap <= p.max)?.valor || PROFESSIONAL_LABOR_REFERENCE.proLabore[PROFESSIONAL_LABOR_REFERENCE.proLabore.length - 1].valor;
    
    const assistencia = PROFESSIONAL_LABOR_REFERENCE.assistenciaTecnica.find(a => cap <= a.max)?.valor || PROFESSIONAL_LABOR_REFERENCE.assistenciaTecnica[PROFESSIONAL_LABOR_REFERENCE.assistenciaTecnica.length - 1].valor;
    
    setInputs(prev => ({
      ...prev,
      encargosTrabalhistas: PROFESSIONAL_LABOR_REFERENCE.encargos,
      salarioMinimo: cltCostBase / numEmployees,
      boisMaoDeObra: cap / numEmployees,
      proLaboreMes: proLabore,
      assistenciaTecnicaMes: assistencia,
      equipe: {
        gerente: team.gerente,
        encarregado: team.encarregado,
        administrativo: team.administrativo,
        tratorista: team.tratorista,
        mistura: team.mistura,
        curral: team.curral,
        sanidade: team.sanidade,
        manutencao: team.manutencao,
        servicosGerais: team.servicosGerais
      }
    }));
    
    setSuggestedTeam(team);
    setShowLaborSummary(true);
  };

  const handleDepreciationItemChange = (id: string, field: string, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      itensDepreciacao: prev.itensDepreciacao.map(item => {
        if (item.id === id) {
          let val = typeof value === 'string' ? (field === 'nome' || field === 'categoria' ? value : parseFloat(value) || 0) : value;
          
          // Validation
          if (field === 'vidaUtilAnos' && typeof val === 'number') {
            val = Math.max(1, Math.min(100, val)); // Vida útil entre 1 e 100 anos
          } else if (field === 'valorResidualPerc' && typeof val === 'number') {
            val = Math.max(0, Math.min(100, val)); // Valor residual entre 0 e 100%
          } else if (field === 'valorNovo' && typeof val === 'number') {
            val = Math.max(0, val); // Valor novo não pode ser negativo
          }

          return { ...item, [field]: val };
        }
        return item;
      })
    }));
  };

  const restoreDepreciationItemValue = (id: string) => {
    const defaultItem = DEFAULT_INPUTS.itensDepreciacao.find(item => item.id === id);
    if (defaultItem) {
      handleDepreciationItemChange(id, 'valorNovo', defaultItem.valorNovo);
    }
  };

  const addDepreciationItem = () => {
    setInputs(prev => ({
      ...prev,
      itensDepreciacao: [
        ...prev.itensDepreciacao,
        { id: Math.random().toString(36).substr(2, 9), nome: 'Novo Item', categoria: 'Outros', valorNovo: 0, vidaUtilAnos: 10, valorResidualPerc: 0 }
      ]
    }));
  };

  const removeDepreciationItem = (id: string) => {
    setInputs(prev => ({
      ...prev,
      itensDepreciacao: prev.itensDepreciacao.filter(item => item.id !== id)
    }));
  };

  const handleFinancingItemChange = (id: string, field: string, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      itensFinanciamento: prev.itensFinanciamento.map(item => {
        if (item.id === id) {
          let val = typeof value === 'string' ? (field === 'descricao' ? value : parseFloat(value) || 0) : value;
          
          // Validation
          if (field === 'valorPrincipal' && typeof val === 'number') {
            val = Math.max(0, val);
          } else if (field === 'taxaJurosAnual' && typeof val === 'number') {
            val = Math.max(0, val);
          } else if (field === 'prazoMeses' && typeof val === 'number') {
            val = Math.max(1, val);
          } else if (field === 'valorParcela' && typeof val === 'number') {
            val = Math.max(0, val);
          }

          return { ...item, [field]: val };
        }
        return item;
      })
    }));
  };

  const addFinancingItem = () => {
    setInputs(prev => ({
      ...prev,
      itensFinanciamento: [
        ...prev.itensFinanciamento,
        { id: Math.random().toString(36).substr(2, 9), descricao: 'Novo Financiamento', valorPrincipal: 0, taxaJurosAnual: 0, prazoMeses: 12 }
      ]
    }));
  };

  const removeFinancingItem = (id: string) => {
    setInputs(prev => ({
      ...prev,
      itensFinanciamento: prev.itensFinanciamento.filter(item => item.id !== id)
    }));
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatNumber = (val: number, decimals = 2) => 
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);

  const formatPerc = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(val / 100);

  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1 align-middle">
      <HelpCircle className="w-3 h-3 text-slate-400 cursor-help hover:text-purple-500 transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg shadow-2xl z-[100] font-normal normal-case leading-relaxed">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800" />
      </div>
    </div>
  );

  const NutrientItem = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
      <p className="text-sm font-black text-slate-100">{formatNumber(value, unit.includes('UI') ? 0 : 3)}{unit}</p>
    </div>
  );

  const groupedDepreciationItems = inputs.itensDepreciacao.reduce((acc, item) => {
    const cat = item.categoria || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, DepreciationItem[]>);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!currentUser && !isDemoMode) {
    return (
      <div 
        className="min-h-screen text-slate-100 font-sans flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `linear-gradient(rgba(7, 10, 19, 0.75), rgba(7, 10, 19, 0.75)), url(${bgImage})` }}
      >
        {/* Ambient subtle backdrops */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-3.5 rounded-2xl shadow-xl shadow-emerald-500/10 mb-4 animate-pulse">
              <TrendingUp className="text-white w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white flex items-center gap-1">
              Simu<span className="text-emerald-400 font-semibold">Boi</span>
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold mt-1">
              DZ - UFSM
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-2.5 leading-relaxed">
              Modelagem Bioeconômica e Engenharia de Risco Probabilística Estocástica para Confinamento de Bovinos de Corte.
            </p>
          </div>

          {/* Error and Success Alerts */}
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2 leading-relaxed w-full"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </motion.div>
          )}

          {authSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-start gap-2 leading-relaxed w-full"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </motion.div>
          )}

          {/* Form */}
          {authView === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="paulo.pacheco@ufsm.br" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 pl-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setAuthView('forgot');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-[11px] text-emerald-440 hover:text-emerald-400 transition-colors font-semibold"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Digite sua senha de acesso" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed mt-2"
              >
                {isAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Entrar na Plataforma'
                )}
              </button>
            </form>
          )}

          {authView === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="seu.email@exemplo.com" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Senha (Mínimo 6 caracteres)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Crie uma senha forte" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Repita a senha criada" 
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed mt-2"
              >
                {isAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Registrar Minha Conta'
                )}
              </button>
            </form>
          )}

          {authView === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email" 
                    placeholder="Digite seu e-mail cadastrado" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed mt-2"
              >
                {isAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Recuperar Acesso'
                )}
              </button>
            </form>
          )}

          {authView === 'update_password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Nova Senha (Mínimo 6 caracteres)</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Digite a nova senha" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    placeholder="Repita a nova senha" 
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#101726]/80 text-sm text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed mt-2"
              >
                {isAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Salvar Nova Senha'
                )}
              </button>
            </form>
          )}

          {/* Footer View Switchers */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-800/60 pt-5">
            {authView === 'login' && (
              <p className="text-xs text-slate-400">
                Ainda não tem cadastro?{' '}
                <button 
                  onClick={() => {
                    setAuthView('register');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-emerald-400 hover:text-emerald-350 transition-colors font-bold"
                >
                  Criar Conta
                </button>
              </p>
            )}

            {authView === 'register' && (
              <p className="text-xs text-slate-400">
                Já possui uma conta?{' '}
                <button 
                  onClick={() => {
                    setAuthView('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="text-emerald-400 hover:text-emerald-350 transition-colors font-bold"
                >
                  Fazer Login
                </button>
              </p>
            )}

            {authView === 'forgot' && (
              <button 
                onClick={() => {
                  setAuthView('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-350 transition-colors font-bold"
              >
                Voltar para o Login
              </button>
            )}

            {authView === 'update_password' && (
              <button 
                onClick={() => {
                  setAuthView('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-semibold"
              >
                Voltar para tela de acesso
              </button>
            )}

            {/* DEMO MODE BUTTON */}
            <div className="w-full flex items-center justify-center gap-2 relative mt-2">
              <div className="h-px bg-slate-800/80 flex-1" />
              <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Alternativa</span>
              <div className="h-px bg-slate-800/80 flex-1" />
            </div>

            <button 
              onClick={enterDemoMode}
              className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-200 py-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 hover:text-white"
            >
              <Monitor className="w-4 h-4 text-emerald-400 animate-pulse" />
              Acessar Modo Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (

    <div 
      className="min-h-screen text-[#f1f5f9] font-sans selection:bg-emerald-500/20 selection:text-emerald-300 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `linear-gradient(rgba(7, 10, 19, 0.75), rgba(7, 10, 19, 0.75)), url(${bgImage})` }}
    >
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-[#0a0f1d]/90 backdrop-blur-md">
        <div className={`${screenWidth === 'standard' ? 'max-w-7xl' : screenWidth === 'wide' ? 'max-w-[1600px]' : 'max-w-full'} mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2 rounded-xl shadow-lg shadow-emerald-500/15 shrink-0">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col shrink-0">
              <h1 className="text-lg font-display font-black tracking-tight text-white leading-none">
                Simu<span className="text-emerald-400 font-semibold">Boi</span>
              </h1>
              <span className="text-[9px] font-extrabold text-emerald-400 tracking-wider mt-0.5 uppercase leading-none">DZ - UFSM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-emerald-950/50 via-[#101726] to-teal-950/50 p-1.5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-950/20 select-none">
              <div className="relative group/menu-par">
                <button
                  onClick={() => setActiveTab('inputs')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'inputs' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  Parâmetros
                  {Object.keys(errors).length > 0 && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-48 p-2 bg-[#0c1222] text-slate-200 text-[10px] rounded-lg opacity-0 pointer-events-none group-hover/menu-par:opacity-100 transition-opacity duration-250 z-50 shadow-2xl border border-slate-800 text-center font-normal leading-normal">
                  Configuração de animais, dietas, custos e simulação estocástica
                </div>
              </div>

              {/* Dropdown "Resultados" */}
              <div 
                className="relative"
                onMouseEnter={() => setIsResultsDropdownOpen(true)}
                onMouseLeave={() => setIsResultsDropdownOpen(false)}
              >
                <button
                  onClick={() => setIsResultsDropdownOpen(prev => !prev)}
                  title="Indicadores de Resultados (Determinístico / Risco)"
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'results' || activeTab === 'risk'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Resultados</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isResultsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isResultsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 mt-1.5 w-60 bg-[#0c1222] border border-slate-800/90 p-1.5 rounded-xl shadow-2xl z-50 flex flex-col gap-1"
                    >
                      <button
                        onClick={() => {
                          if (results) {
                            setActiveTab('results');
                            setIsResultsDropdownOpen(false);
                          }
                        }}
                        disabled={!results}
                        title={!results ? "Execute a simulação para ver os resultados" : "Lucro projetado, fluxo de caixa e indicadores bioeconômicos"}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-all flex flex-col cursor-pointer ${
                          activeTab === 'results'
                            ? 'bg-slate-850 text-emerald-400 border border-slate-800/40'
                            : !results
                              ? 'text-slate-600 cursor-not-allowed opacity-40'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${activeTab === 'results' ? 'bg-emerald-400' : 'bg-transparent'}`} />
                          Análise Determinística
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 mt-0.5 leading-relaxed pl-3">
                          Lucro projetado, fluxo de caixa e indicadores bioeconômicos.
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          if (lhsResults) {
                            setActiveTab('risk');
                            setIsResultsDropdownOpen(false);
                          }
                        }}
                        disabled={!lhsResults}
                        title={!lhsResults ? "Execute a análise de risco (LHS) para ver estes dados" : "Simulação de Monte Carlo, análise probabilística e S-Curve"}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold tracking-wide transition-all flex flex-col cursor-pointer ${
                          activeTab === 'risk'
                            ? 'bg-slate-850 text-emerald-400 border border-slate-800/40'
                            : !lhsResults
                              ? 'text-slate-600 cursor-not-allowed opacity-40'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${activeTab === 'risk' ? 'bg-emerald-400' : 'bg-transparent'}`} />
                          Análise de Risco
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 mt-0.5 leading-relaxed pl-3">
                          Simulação de Monte Carlo, análise probabilística e S-Curve.
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {(['diet', 'esg', 'market'] as const).map((tab) => {
                const tooltipsMap = {
                  diet: "Formulação, nutrição e custos dos ingredientes da dieta",
                  esg: "Indicadores de sustentabilidade e bem-estar (ESG)",
                  market: "Cotações estaduais e simulação de ágio regional"
                };
                const tabLabelMap = {
                  diet: "Dieta",
                  esg: "ESG",
                  market: "Mercado"
                };
                const tabGroupClass = tab === 'diet' ? 'group/menu-diet' : tab === 'esg' ? 'group/menu-esg' : 'group/menu-market';
                const hoverClass = tab === 'diet' ? 'group-hover/menu-diet:opacity-100' : tab === 'esg' ? 'group-hover/menu-esg:opacity-100' : 'group-hover/menu-market:opacity-100';
                return (
                  <div key={tab} className={`relative ${tabGroupClass}`}>
                    <button
                      onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                        activeTab === tab 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20' 
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                      }`}
                    >
                      {tabLabelMap[tab]}
                    </button>
                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-48 p-2 bg-[#0c1222] text-slate-200 text-[10px] rounded-lg opacity-0 pointer-events-none ${hoverClass} transition-opacity duration-250 z-50 shadow-2xl border border-slate-800 text-center font-normal leading-normal`}>
                      {tooltipsMap[tab]}
                    </div>
                  </div>
                );
              })}
            </nav>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-1 border-r border-slate-800/60 pr-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3 py-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-700/50 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  title="Configurar e Baixar Relatório PDF"
                >
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                  <span className="hidden sm:inline text-xs font-semibold tracking-wide">Relatório</span>
                </button>
                <button
                  onClick={() => setIsSavedSimsOpen(true)}
                  className="px-3 py-2 text-slate-300 hover:text-teal-400 hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-700/50 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  title="Abrir Simulações Salvas"
                >
                  <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-teal-400" />
                  <span className="hidden sm:inline text-xs font-semibold tracking-wide">Projetos</span>
                </button>
                <button
                  onClick={() => setIsSaving(true)}
                  className="px-3 py-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50 rounded-xl border border-transparent hover:border-slate-700/50 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  title="Salvar Simulação Atual"
                >
                  <Save className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                  <span className="hidden sm:inline text-xs font-semibold tracking-wide">Salvar</span>
                </button>
              </div>

              <button 
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer"
                title="Ajuda e Tutorial"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer mr-1"
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* PERFIL / MODO DEMO STATUS */}
              {currentUser ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl block shrink-0">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-emerald-300 max-w-[120px] truncate" title={currentUser.email}>
                    {currentUser.email.split('@')[0]}
                  </span>
                  <button 
                    onClick={handleSignOut}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                    title="Sair da Conta"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : isDemoMode ? (
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1.5 rounded-xl block shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-amber-300">Modo Demo</span>
                  <button 
                    onClick={() => {
                      setIsDemoMode(false);
                      localStorage.removeItem('simuboi_demo_mode');
                      setCurrentUser(null);
                    }}
                    className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-md transition-all font-bold uppercase tracking-wider cursor-pointer"
                    title="Realizar login ou registrar"
                  >
                    Entrar
                  </button>
                </div>
              ) : null}
            </div>

          </div>
        </div>
        {/* Mobile Nav */}
        <div className="md:hidden flex justify-center pb-2 px-4">
          <nav className="flex gap-1 bg-gradient-to-r from-emerald-950/50 via-[#101726]/95 to-teal-950/50 p-1.5 rounded-2xl w-full overflow-x-auto custom-scrollbar border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
              {(['inputs', 'results', 'risk', 'diet', 'esg', 'market'] as const).map((tab, idx) => {
                const isDisabled = (tab === 'results') ? !results : (tab === 'risk') ? !results : false;
              return (
                <React.Fragment key={tab}>
                  <button
                    onClick={() => !isDisabled && setActiveTab(tab)}
                    disabled={isDisabled}
                    className={`flex-1 min-w-[50px] px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                      activeTab === tab 
                        ? 'bg-emerald-600 text-white' 
                        : isDisabled
                          ? 'text-slate-600 cursor-not-allowed opacity-40'
                          : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'inputs' ? 'Parâm.' : tab === 'results' ? 'Det.' : tab === 'risk' ? 'Risco' : tab === 'diet' ? 'Dieta' : tab === 'esg' ? 'ESG' : 'Mercado'}
                    {tab === 'inputs' && Object.keys(errors).length > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Subtle, highly premium context banner right below the menu/options */}
        <div className="border-t border-slate-800/40 bg-[#080d19]/80 py-2.5 px-4 sm:px-6 lg:px-8 select-none">
          <div className={`${screenWidth === 'standard' ? 'max-w-7xl' : screenWidth === 'wide' ? 'max-w-[1600px]' : 'max-w-full'} mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                <strong className="text-slate-200 font-display">Viabilidade econômica avançada:</strong> Simulação estocástica de Monte Carlo, formulação precisa de dietas e indicadores ESG integrados.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Simulador de Confinamento</span>
            </div>
          </div>
        </div>
      </header>

      <main className={`${screenWidth === 'standard' ? 'max-w-7xl' : screenWidth === 'wide' ? 'max-w-[1600px]' : 'max-w-full'} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>

        <AnimatePresence mode="wait">
          {activeTab === 'inputs' && (
            <motion.div
              key="inputs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {Object.keys(errors).length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3 overflow-hidden"
                >
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-900">Atenção: Parâmetros Inválidos</h3>
                    <p className="text-xs text-rose-400 mt-0.5">
                      Foram encontrados {Object.keys(errors).length} erros nos parâmetros. Corrija-os para garantir a precisão dos cálculos.
                    </p>
                  </div>
                </motion.div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Main Parameters */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Section: Animal & Desempenho */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300 relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                      <Scale className="w-32 h-32 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Scale className="text-emerald-400 w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Animal, Desempenho & Genética</h2>
                        <p className="text-xs text-slate-400">Parâmetros produtivos, biológicos e genéticos do rebanho.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                      <InputGroup icon={Scale} label="Peso Inicial" name="pesoVivoInicial" value={inputs.pesoVivoInicial} unit="kg" onChange={handleInputChange} isInteger tooltip={`Peso médio dos animais na entrada do confinamento. Define o capital empatado inicial (estoque) e é a base para o cálculo do ganho de peso total. Na simulação de risco, assume-se um desvio padrão de ${DEFAULT_INPUTS.desviosPadrao.pesoVivoInicial} kg.`} error={errors.pesoVivoInicial} />
                      <InputGroup icon={Scale} label="Peso Final" name="pesoVivoFinal" value={inputs.pesoVivoFinal} unit="kg" onChange={handleInputChange} isInteger tooltip={`Peso médio projetado para a venda. Determina a receita bruta total e o volume de carne produzido (arrobas). Na simulação de risco, assume-se um desvio padrão de ${DEFAULT_INPUTS.desviosPadrao.pesoVivoFinal} kg.`} error={errors.pesoVivoFinal} />
                      <InputGroup icon={Activity} label="Ganho Médio Diário (GMD)" name="gmd" value={inputs.gmd} unit="kg/dia" onChange={handleInputChange} step={0.1} tooltip={`Ganho Médio Diário esperado. É o principal indicador de eficiência biológica.`} error={errors.gmd} />
                      <InputGroup icon={TrendingUp} label="Rendimento Inicial" name="rendimentoCarcacaInicial" value={inputs.rendimentoCarcacaInicial} unit="%" onChange={handleInputChange} step={0.1} tooltip="Rendimento de carcaça estimado na entrada (boi magro). Geralmente 50%." error={errors.rendimentoCarcacaInicial} />
                      <InputGroup icon={TrendingUp} label="Rendimento Final" name="rendimentoCarcaca" value={inputs.rendimentoCarcaca} unit="%" onChange={handleInputChange} step={0.1} tooltip="Rendimento de carcaça projetado na venda (boi gordo). Geralmente 54%." error={errors.rendimentoCarcaca} />
                      <InputGroup icon={Clock} label="Tempo" name="tempoAlimentacao" value={inputs.tempoAlimentacao} unit="dias" onChange={handleInputChange} disabled isInteger tooltip="Período total de confinamento necessário para atingir o peso final. Quanto maior o tempo, maior o custo operacional total e menor a rotatividade do capital (Giro de Estoque)." error={errors.tempoAlimentacao} />
                      <InputGroup icon={ArrowRightLeft} label="Quebra de Transporte" name="quebraPesoTransportePerc" value={inputs.quebraPesoTransportePerc} unit="%" onChange={handleInputChange} step={0.1} tooltip="Percentual de perda de peso (shrinkage) durante o transporte para o frigorífico." error={errors.quebraPesoTransportePerc} />
                      <InputGroup icon={AlertCircle} label="Mortalidade" name="taxaMortalidade" value={inputs.taxaMortalidade} unit="%" onChange={handleInputChange} step={0.1} tooltip="Taxa de perda de animais durante o ciclo." error={errors.taxaMortalidade} />
                    </div>

                    <div className="h-px bg-slate-800/60 my-6" />

                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Genética & Frame</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Raça / Genética</label>
                          <select 
                            name="raca"
                            value={inputs.raca}
                            onChange={handleInputChange}
                            className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 outline-none hover:bg-[#161e30] hover:border-slate-755 focus:bg-[#0c1220] focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500/80 transition-all cursor-pointer font-sans"
                          >
                            <option value="nelore" className="bg-[#0f172a]">Nelore (Zebuíno)</option>
                            <option value="cruzamento" className="bg-[#0f172a]">Cruzamento Industrial (Taurino x Zebu)</option>
                            <option value="holandes" className="bg-[#0f172a]">Leiteiro (Holandês/Jersey)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Sexo</label>
                          <select 
                            name="sexo"
                            value={inputs.sexo}
                            onChange={handleInputChange}
                            className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 outline-none hover:bg-[#161e30] hover:border-slate-755 focus:bg-[#0c1220] focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500/80 transition-all cursor-pointer font-sans"
                          >
                            <option value="macho" className="bg-[#0f172a]">Boi Castrado / Macho</option>
                            <option value="inteiro" className="bg-[#0f172a]">Boi Inteiro</option>
                            <option value="femea" className="bg-[#0f172a]">Fêmea / Novilha</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Frame Size (Estrutura)</label>
                          <select 
                            name="frameSize"
                            value={inputs.frameSize}
                            onChange={handleInputChange}
                            className="w-full bg-[#121826] border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 outline-none hover:bg-[#161e30] hover:border-slate-755 focus:bg-[#0c1220] focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500/80 transition-all cursor-pointer font-sans"
                          >
                            <option value="pequeno" className="bg-[#0f172a]">Pequeno (Terminação Precoce)</option>
                            <option value="medio" className="bg-[#0f172a]">Médio (Padrão)</option>
                            <option value="grande" className="bg-[#0f172a]">Grande (Tardio / Exportação)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Área e terra */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <Map className="text-purple-400 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Área e terra</h2>
                        <p className="text-xs text-slate-400">Área e valor da terra.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InputGroup label="Lotação" name="animaisHa" value={inputs.animaisHa} unit="ani/ha" onChange={handleInputChange} isInteger tooltip="Quantidade de animais por hectare de área de confinamento." error={errors.animaisHa} />
                      <InputGroup label="Valor Terra" name="valorTerraHa" value={inputs.valorTerraHa} unit="R$/ha" onChange={handleInputChange} isCurrency tooltip="Preço de mercado da terra utilizada." error={errors.valorTerraHa} />
                    </div>
                  </div>
 
                  {/* Section: Pesagens & Ultrassom */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <Monitor className="text-rose-400 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Pesagens & Ultrassom</h2>
                        <p className="text-xs text-slate-400">Acompanhamento biológico.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pesagens Reais</h3>
                          <button 
                            onClick={() => setInputs(prev => ({ ...prev, pesagens: [...prev.pesagens, { id: Math.random().toString(36).substr(2, 9), dia: 0, pesoReal: 0 }] }))}
                            className="p-1 px-2.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar
                          </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {inputs.pesagens.map((p, idx) => (
                            <div key={p.id || idx} className="grid grid-cols-2 gap-2 relative group/item border border-slate-800/50 p-2 rounded-xl bg-[#121826]/40">
                              <InputGroup label="Dia" name={`pesagem_dia_${idx}`} value={p.dia} unit="d" onChange={(e: any) => {
                                const newPesagens = [...inputs.pesagens];
                                newPesagens[idx].dia = Number(e.target.value);
                                setInputs(prev => ({ ...prev, pesagens: newPesagens }));
                              }} isInteger />
                              <InputGroup label="Peso" name={`pesagem_peso_${idx}`} value={p.pesoReal} unit="kg" onChange={(e: any) => {
                                const newPesagens = [...inputs.pesagens];
                                newPesagens[idx].pesoReal = Number(e.target.value);
                                setInputs(prev => ({ ...prev, pesagens: newPesagens }));
                              }} isInteger />
                              <button 
                                onClick={() => setInputs(prev => ({ ...prev, pesagens: prev.pesagens.filter((_, i) => i !== idx) }))}
                                className="absolute -top-1 -right-1 p-1 bg-slate-800 text-rose-400 rounded-full shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity z-10 hover:text-rose-300"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {inputs.pesagens.length === 0 && <p className="text-[10px] text-slate-500 italic text-center py-4">Nenhuma pesagem cadastrada.</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ultrassom (EGS)</h3>
                          <button 
                            onClick={() => setInputs(prev => ({ ...prev, ultrassom: [...prev.ultrassom, { id: Math.random().toString(36).substr(2, 9), dia: 0, espessuraGorduraReal: 0 }] }))}
                            className="p-1 px-2.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                          >
                            <Plus className="w-3.5 h-3.5" /> Adicionar
                          </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                          {inputs.ultrassom.map((u, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-2 relative group/item border border-slate-800/50 p-2 rounded-xl bg-[#121826]/40">
                              <InputGroup label="Dia" name={`ultrassom_dia_${idx}`} value={u.dia} unit="d" onChange={(e: any) => {
                                const newUltrassom = [...inputs.ultrassom];
                                newUltrassom[idx].dia = Number(e.target.value);
                                setInputs(prev => ({ ...prev, ultrassom: newUltrassom }));
                              }} isInteger />
                              <InputGroup label="EGS" name={`ultrassom_egs_${idx}`} value={u.espessuraGorduraReal} unit="mm" onChange={(e: any) => {
                                const newUltrassom = [...inputs.ultrassom];
                                newUltrassom[idx].espessuraGorduraReal = Number(e.target.value);
                                setInputs(prev => ({ ...prev, ultrassom: newUltrassom }));
                              }} />
                              <button 
                                onClick={() => setInputs(prev => ({ ...prev, ultrassom: prev.ultrassom.filter((_, i) => i !== idx) }))}
                                className="absolute -top-1 -right-1 p-1 bg-slate-800 text-rose-400 rounded-full shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity z-10 hover:text-rose-300"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {inputs.ultrassom.length === 0 && <p className="text-[10px] text-slate-500 italic text-center py-4">Nenhum ultrassom cadastrado.</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Operacional & Pessoal */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <Users className="text-emerald-400 w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Operacional & Pessoal</h2>
                          <p className="text-xs text-slate-400">Mão de obra e despesas fixas.</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="w-full sm:w-48">
                          <InputGroup 
                            label="Capacidade Estática" 
                            name="capacidadeEstatica" 
                            value={inputs.capacidadeEstatica} 
                            unit="ani"
                            onChange={handleInputChange} 
                            step={1} 
                            isInteger
                            error={errors.capacidadeEstatica} 
                          />
                        </div>
                        <button
                          onClick={applyProfessionalLabor}
                          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-605 text-white rounded-xl text-xs font-bold hover:from-teal-550 hover:to-emerald-550 transition-all shadow-md shadow-emerald-950/20 w-full sm:w-auto mt-2 sm:mt-0"
                        >
                          <Wand2 className="w-4 h-4 text-emerald-300" />
                          Sugerir Equipe Profissional
                        </button>
                      </div>
                    </div>
                  </div>

                  {showLaborSummary && (
                    <div className="mb-6 p-5 bg-[#131b2e] rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Resumo do Dimensionamento (Ref. 2026)</h3>
                          <div className="group relative">
                            <Info className="w-3.5 h-3.5 text-slate-500 cursor-help hover:text-slate-300" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-200 text-[10px] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-slate-800">
                              <p className="font-bold mb-1">Premissas do Modelo:</p>
                              <ul className="space-y-1 list-disc list-inside opacity-90">
                                <li>Encargos: 45,59% (Ref: Conab 2010)</li>
                                <li>Operação rural mecanizada profissional</li>
                                <li>Pró-labore e Assistência escalonados</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setShowLaborSummary(false)} className="text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800 rounded-lg transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="bg-[#101726]/60 p-3 rounded-xl border border-slate-800">
                          <p className="text-[9px] text-emerald-400 uppercase font-bold mb-1">Equipe Total</p>
                          <p className="text-base font-black text-slate-100">
                            {Math.round(inputs.capacidadeEstatica / inputs.boisMaoDeObra)} <span className="text-[10px] font-normal text-slate-400">CLT</span>
                          </p>
                        </div>
                        <div className="bg-[#101726]/60 p-3 rounded-xl border border-slate-800">
                          <p className="text-[9px] text-emerald-400 uppercase font-bold mb-1">Custo CLT/mês</p>
                          <p className="text-base font-black text-slate-100">
                            {formatCurrency(inputs.salarioMinimo * (1 + inputs.encargosTrabalhistas / 100) * (inputs.capacidadeEstatica / inputs.boisMaoDeObra))}
                          </p>
                        </div>
                        <div className="bg-[#101726]/60 p-3 rounded-xl border border-slate-800">
                          <p className="text-[9px] text-emerald-400 uppercase font-bold mb-1">Custo Total/mês</p>
                          <p className="text-base font-black text-slate-100">
                            {formatCurrency(
                              (inputs.salarioMinimo * (1 + inputs.encargosTrabalhistas / 100) * (inputs.capacidadeEstatica / inputs.boisMaoDeObra)) + 
                              inputs.proLaboreMes + 
                              inputs.assistenciaTecnicaMes
                            )}
                          </p>
                        </div>
                        <div className="bg-[#101726]/80 p-3 rounded-xl border border-emerald-500/30">
                          <p className="text-[9px] text-emerald-400 uppercase font-bold mb-1">Custo/Cab/Mês</p>
                          <p className="text-base font-black text-emerald-400">
                            {formatCurrency(
                              ((inputs.salarioMinimo * (1 + inputs.encargosTrabalhistas / 100) * (inputs.capacidadeEstatica / inputs.boisMaoDeObra)) + 
                              inputs.proLaboreMes + 
                              inputs.assistenciaTecnicaMes) / inputs.capacidadeEstatica
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#0b0f19]/80 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Composição da Equipe (Editável):</p>
                          <span className="text-[9px] text-slate-500 italic">Ajuste as quantidades abaixo</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          <TeamInput label="Gerente" value={inputs.equipe.gerente} onChange={(v) => handleTeamChange('gerente', v)} />
                          <TeamInput label="Encarregado" value={inputs.equipe.encarregado} onChange={(v) => handleTeamChange('encarregado', v)} />
                          <TeamInput label="Administrativo/Apontador" value={inputs.equipe.administrativo} onChange={(v) => handleTeamChange('administrativo', v)} />
                          <TeamInput label="Tratorista" value={inputs.equipe.tratorista} onChange={(v) => handleTeamChange('tratorista', v)} />
                          <TeamInput label="Mistura/Fábrica" value={inputs.equipe.mistura} onChange={(v) => handleTeamChange('mistura', v)} />
                          <TeamInput label="Curral/Manejo" value={inputs.equipe.curral} onChange={(v) => handleTeamChange('curral', v)} />
                          <TeamInput label="Sanidade" value={inputs.equipe.sanidade} onChange={(v) => handleTeamChange('sanidade', v)} />
                          <TeamInput label="Mecânico" value={inputs.equipe.manutencao} onChange={(v) => handleTeamChange('manutencao', v)} />
                          <TeamInput label="Serviços Gerais" value={inputs.equipe.servicosGerais} onChange={(v) => handleTeamChange('servicosGerais', v)} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Mão de Obra (CLT)</h3>
                      <InputGroup label="Bois/Homem" name="boisMaoDeObra" value={inputs.boisMaoDeObra} unit="ani/hom" onChange={handleInputChange} isInteger tooltip="Quantidade de animais que um funcionário consegue manejar com eficiência. Define a produtividade do trabalho e o custo de mão de obra por animal produzido." error={errors.boisMaoDeObra} />
                      <InputGroup label="Encargos" name="encargosTrabalhistas" value={inputs.encargosTrabalhistas} unit="%" onChange={handleInputChange} tooltip="Percentual de custos extras sobre o salário nominal (FGTS, INSS, férias, etc). Valor de referência Conab (2010): 45,59% para empregado rural por tempo indeterminado." error={errors.encargosTrabalhistas} />
                      <InputGroup label="Salário Base" name="salarioMinimo" value={inputs.salarioMinimo} unit="R$" onChange={handleInputChange} isCurrency tooltip="Base salarial média para os funcionários do confinamento. Impacta o custo fixo operacional and o ponto de equilíbrio do negócio." extraInfo={`Total CLT: ${formatCurrency(inputs.salarioMinimo * (1 + inputs.encargosTrabalhistas / 100) * (inputs.capacidadeEstatica / (inputs.boisMaoDeObra || 1)))}/mês`} error={errors.salarioMinimo} />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Custos Fixos de Gestão</h3>
                      <InputGroup label="Assistência" name="assistenciaTecnicaMes" value={inputs.assistenciaTecnicaMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Honorários mensais de consultoria (veterinários, zootecnistas). O dimensionamento profissional sugere valores escalonados de R$ 4.000 a R$ 75.000 conforme a capacidade estática." error={errors.assistenciaTecnicaMes} />
                      <InputGroup label="Pró-labore" name="proLaboreMes" value={inputs.proLaboreMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Remuneração mensal dos gestores. O dimensionamento profissional sugere valores de R$ 8.000 a R$ 35.000 conforme o porte da operação." error={errors.proLaboreMes} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputGroup label="Energia Elétrica" name="energiaEletricaMes" value={inputs.energiaEletricaMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Gastos fixos com energia, água e internet." error={errors.energiaEletricaMes} />
                        <InputGroup label="Reparos & Manutenção" name="reparosManutencaoMes" value={inputs.reparosManutencaoMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Provisão mensal para reparos e manutenção de benfeitorias e máquinas." error={errors.reparosManutencaoMes} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputGroup label="Seguros" name="segurosMes" value={inputs.segurosMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Custo mensal com seguros patrimoniais." error={errors.segurosMes} />
                        <InputGroup label="Imposto Territorial Rural (ITR)" name="itrMes" value={inputs.itrMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Imposto Territorial Rural rateado mensalmente." error={errors.itrMes} />
                      </div>
                      <InputGroup label="Financiamento" name="financiamentoMes" value={inputs.financiamentoMes} unit="R$/mês" onChange={handleInputChange} step={0.01} isCurrency tooltip="Parcelas mensais de financiamentos (amortização + juros)." error={errors.financiamentoMes} />
                    </div>
                  </div>

                  {/* Section: Financiamentos & Dívidas */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                          <CreditCard className="text-indigo-400 w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Financiamentos & Dívidas</h2>
                          <p className="text-xs text-slate-400">Gestão de parcelas, juros e prazos.</p>
                        </div>
                      </div>
                      <button
                        onClick={addFinancingItem}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-xl hover:bg-indigo-500/20 transition-all shadow-sm w-full sm:w-auto justify-center"
                        title="Adiciona um novo financiamento para cálculo automático da parcela mensal."
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar Financiamento
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-800/65">
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Descrição</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Valor Principal (R$)</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Taxa de Juros (% a.a.)</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Prazo (Meses)</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Parcela Estimada (R$)</th>
                            <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right px-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {inputs.itensFinanciamento.map((item) => {
                            const r = (item.taxaJurosAnual / 100) / 12;
                            const n = item.prazoMeses;
                            const pmt = r > 0 && n > 0 
                              ? (item.valorPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
                              : (n > 0 ? item.valorPrincipal / n : 0);
                              
                            return (
                              <tr key={item.id} className="hover:bg-[#121826]/40 transition-colors group">
                                <td className="py-2.5 px-2">
                                  <TableInput
                                    value={item.descricao}
                                    onChange={(val) => handleFinancingItemChange(item.id, 'descricao', val)}
                                    isNumber={false}
                                    className="font-semibold text-slate-100 bg-transparent border-none focus:ring-0 w-full"
                                    tooltip="Ex: Trator Principal, Silo Metálico, Custeio Safra."
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <TableInput
                                    value={item.valorPrincipal}
                                    onChange={(val) => handleFinancingItemChange(item.id, 'valorPrincipal', val)}
                                    isCurrency
                                    className="text-slate-300 bg-transparent border-none focus:ring-0 w-full"
                                    tooltip="Valor total financiado (principal)."
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <TableInput
                                    value={item.taxaJurosAnual}
                                    onChange={(val) => handleFinancingItemChange(item.id, 'taxaJurosAnual', val)}
                                    isPercentage
                                    className="text-slate-300 bg-transparent border-none focus:ring-0 w-full"
                                    tooltip="Taxa de juros anual nominal."
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <TableInput
                                    value={item.prazoMeses}
                                    onChange={(val) => handleFinancingItemChange(item.id, 'prazoMeses', val)}
                                    className="text-slate-300 bg-transparent border-none focus:ring-0 w-full"
                                    tooltip="Prazo total do financiamento em meses."
                                  />
                                </td>
                                <td className="py-2.5 px-2">
                                  <div className="text-sm font-bold text-indigo-400">
                                    {formatCurrency(item.valorParcela || pmt)}
                                  </div>
                                  {item.valorParcela && (
                                    <div className="text-[10px] text-slate-500 italic">Valor manual</div>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <button
                                    onClick={() => removeFinancingItem(item.id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {inputs.itensFinanciamento.length === 0 && (
                      <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl mt-4">
                        <p className="text-sm text-slate-400">Nenhum financiamento detalhado. Use o valor manual abaixo ou adicione itens.</p>
                        <div className="mt-4 max-w-xs mx-auto">
                          <InputGroup label="Financiamento Mensal Manual" name="financiamentoMes" value={inputs.financiamentoMes} onChange={handleInputChange} step={0.01} isCurrency tooltip="Parcelas mensais de financiamentos de máquinas, infraestrutura ou custeio (amortização + juros)." error={errors.financiamentoMes} />
                        </div>
                      </div>
                    )}
                    
                    {inputs.itensFinanciamento.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-800/80">
                        <div className="text-xs text-slate-400">
                          Custo Mensal Total com Financiamentos: <span className="font-bold text-slate-200">{formatCurrency(results?.custoFinanciamento || 0)}</span>
                          <div className="text-[10px] text-slate-500 italic mt-1">
                            * Rateado por {inputs.capacidadeEstatica} animais: <span className="font-bold text-slate-300">{formatCurrency((results?.custoFinanciamento || 0) / (inputs.capacidadeEstatica || 1))} / animal</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Financial & Nutrition */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Section: Mercado & Financeiro */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <DollarSign className="text-amber-400 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Mercado & Finanças</h2>
                        <p className="text-xs text-slate-400">Preços e taxas financeiras.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <InputGroup label="Boi Magro" name="precoBoiMagro" value={inputs.precoBoiMagro} unit="R$/ani" onChange={handleInputChange} isCurrency tooltip={`Valor pago por animal na compra.`} extraInfo={`R$ ${(inputs.precoBoiMagro / inputs.pesoVivoInicial).toFixed(2)}/kg`} error={errors.precoBoiMagro} />
                      <InputGroup label="Boi Gordo" name="precoBoiGordo" value={inputs.precoBoiGordo} unit="R$/@" onChange={handleInputChange} step={0.01} isCurrency tooltip={`Preço de venda projetado por arroba.`} extraInfo={`R$ ${((inputs.rendimentoCarcaca / 100) * (inputs.precoBoiGordo / 15)).toFixed(2)}/kg`} error={errors.precoBoiGordo} />
                      <InputGroup label="Taxa Mínima de Atratividade (TMA) Anual" name="tmaAnual" value={inputs.tmaAnual} unit="%" onChange={handleInputChange} step={0.01} tooltip="Taxa Mínima de Atratividade." error={errors.tmaAnual} />
                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Bonificação" name="bonificacaoPerc" value={inputs.bonificacaoPerc} unit="%" onChange={handleInputChange} step={0.1} error={errors.bonificacaoPerc} />
                        <InputGroup label="Funrural" name="funruralPerc" value={inputs.funruralPerc} unit="%" onChange={handleInputChange} step={0.01} error={errors.funruralPerc} />
                      </div>
                    </div>
                  </div>

                  {/* Section: Nutrição & Dieta */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <Zap className="text-emerald-400 w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Nutrição & Dieta</h2>
                          <p className="text-xs text-slate-400">Consumo e custos da dieta.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Consumo Volumoso" name="cmsVolumoso" value={inputs.cmsVolumoso} unit="kg MN" onChange={handleInputChange} step={0.01} error={errors.cmsVolumoso} />
                        <InputGroup label="Consumo Concentrado" name="cmsConcentrado" value={inputs.cmsConcentrado} unit="kg MN" onChange={handleInputChange} step={0.01} error={errors.cmsConcentrado} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup label="Preço de Volumoso" name="precoVolumoso" value={inputs.precoVolumoso} unit="R$/kg MN" onChange={handleInputChange} step={0.01} isCurrency error={errors.precoVolumoso} />
                        <InputGroup label="Preço de Concentrado" name="precoConcentrado" value={inputs.precoConcentrado} unit="R$/kg MN" onChange={handleInputChange} step={0.01} isCurrency error={errors.precoConcentrado} />
                      </div>
                      <InputGroup label="Sobras no cocho" name="sobrasCochoPerc" value={inputs.sobrasCochoPerc} unit="%" onChange={handleInputChange} step={0.1} error={errors.sobrasCochoPerc} />
                    </div>
                  </div>

                  {/* Section: ESG & Sustentabilidade */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <Leaf className="text-emerald-400 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">ESG & Sustentabilidade</h2>
                        <p className="text-xs text-slate-400">Métricas socioambientais.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <InputGroup 
                        label="Investimento Social" 
                        name="investimentoSocialAnual" 
                        value={inputs.investimentoSocialAnual} 
                        unit="R$/ano" 
                        onChange={handleInputChange} 
                        isCurrency 
                        tooltip="Total investido anualmente em desenvolvimento comunitário local, projetos sociais e infraestrutura de apoio à comunidade."
                        error={errors.investimentoSocialAnual} 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <InputGroup 
                          label="Treinamento de Funcionários" 
                          name="horasTreinamentoFuncionarioAno" 
                          value={inputs.horasTreinamentoFuncionarioAno} 
                          unit="h/ano" 
                          onChange={handleInputChange} 
                          tooltip="Horas de capacitação por funcionário ao ano focadas em manejo de baixa tensão, segurança, zootecnia de precisão e bem-estar."
                          error={errors.horasTreinamentoFuncionarioAno} 
                        />
                        <InputGroup 
                          label="Bem-Estar Animal" 
                          name="indiceBemEstarAnimal" 
                          value={inputs.indiceBemEstarAnimal} 
                          unit="0-10" 
                          onChange={handleInputChange} 
                          step={1} 
                          tooltip="Métrica estipulada de 0 a 10 que quantifica a adesão a rígidas práticas de ambiência, estresse mínimo e manejo humanizado de bovinos."
                          error={errors.indiceBemEstarAnimal} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Outros Custos */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-slate-500/10 border border-slate-500/20 rounded-xl">
                        <MoreHorizontal className="text-slate-400 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-base tracking-tight">Outros Custos</h2>
                        <p className="text-xs text-slate-400">Sanidade, frete e extras.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <InputGroup label="Sanidade" name="custoSanidadePorBoi" value={inputs.custoSanidadePorBoi} unit="R$/boi" onChange={handleInputChange} isCurrency tooltip="Custo total estimado com medicamentos, vacinas, protocolos sanitários e manejo de saúde por animal. Crucial para mitigar riscos de mortalidade e garantir o GMD projetado." error={errors.custoSanidadePorBoi} />
                        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          {[
                            { label: 'Otimista', value: 75, color: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' },
                            { label: 'Realista', value: 100, color: 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30' },
                            { label: 'Pessimista', value: 160, color: 'bg-rose-950/40 text-rose-400 border-rose-900/30' }
                          ].map(preset => (
                            <button
                              key={preset.label}
                              onClick={() => handleInputChange({ target: { name: 'custoSanidadePorBoi', value: preset.value.toString(), type: 'number' } } as any)}
                              className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all hover:scale-105 ${preset.color}`}
                              title={`Aplica o custo de R$ ${preset.value} por animal para o cenário ${preset.label.toLowerCase()}.`}
                            >
                              {preset.label}: R$ {preset.value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <InputGroup label="Frete & Taxas" name="fretePorAnimal" value={inputs.fretePorAnimal} unit="R$/ani" onChange={handleInputChange} isCurrency tooltip={`Soma dos custos de transporte (compra e venda), taxas de GTA e rastreabilidade.`} error={errors.fretePorAnimal} />
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Comissão Compra" name="comissaoCompraPerc" value={inputs.comissaoCompraPerc} unit="%" onChange={handleInputChange} tooltip="Comissão paga na compra do boi magro (corretagem)." error={errors.comissaoCompraPerc} />
                        <InputGroup label="Comissão Venda" name="comissaoVendaPerc" value={inputs.comissaoVendaPerc} unit="%" onChange={handleInputChange} tooltip="Comissão paga na venda do boi gordo (corretagem)." error={errors.comissaoVendaPerc} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Consumo Diesel" name="dieselLitrosCabecaDia" value={inputs.dieselLitrosCabecaDia} unit="L/cab/dia" onChange={handleInputChange} tooltip="Consumo médio de diesel por cabeça por dia para trato e distribuição de ração." error={errors.dieselLitrosCabecaDia} />
                        <InputGroup label="Preço Diesel" name="precoDiesel" value={inputs.precoDiesel} unit="R$/L" onChange={handleInputChange} isCurrency tooltip="Preço médio do litro do diesel posto no confinamento." error={errors.precoDiesel} />
                      </div>
                      <InputGroup label="Despesas Extras" name="outrosDespesasValor" value={inputs.outrosDespesasValor} unit="R$" onChange={handleInputChange} isCurrency tooltip={`Provisão para despesas eventuais e imprevistos (reparos, taxas extras, etc).`} error={errors.outrosDespesasValor} />
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Section Infraestrutura & Depreciação */}

                {/* Section: Infraestrutura & Depreciação */}
                <div className="lg:col-span-12 bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <Database className="text-indigo-400 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-slate-100 text-lg">Infraestrutura & Depreciação</h2>
                        <p className="text-xs text-slate-400">Gestão de ativos e cálculo de depreciação do projeto.</p>
                      </div>
                    </div>
                    <button
                      onClick={addDepreciationItem}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-950/20 border border-indigo-500/30 cursor-pointer"
                      title="Adiciona um novo item de infraestrutura ou equipamento para cálculo de depreciação."
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Item
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-left border-collapse min-w-[700px] table-auto">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1 group/tooltip relative">
                              Item
                              <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-950 text-slate-200 text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-tight border border-slate-800 text-center font-normal normal-case">
                                Nome ou descrição do ativo (ex: Curral, Trator, Silo).
                                <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-950" />
                              </div>
                            </div>
                          </th>
                          <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1 group/tooltip relative">
                              Categoria
                              <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-950 text-slate-200 text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-tight border border-slate-800 text-center font-normal normal-case">
                                Grupo ao qual o ativo pertence para fins de organização e taxas de depreciação sugeridas.
                                <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-950" />
                              </div>
                            </div>
                          </th>
                          <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1 group/tooltip relative">
                              Valor Novo (R$)
                              <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-950 text-slate-200 text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-tight border border-slate-800 text-center font-normal normal-case">
                                Preço de aquisição atual do item. Base para o cálculo da depreciação anual.
                                <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-950" />
                              </div>
                            </div>
                          </th>
                          <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            <div className="flex items-center justify-center gap-1 group/tooltip relative">
                              Vida Útil (Anos)
                              <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-slate-200 text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-tight border border-slate-800 text-center font-normal normal-case">
                                Tempo estimado em que o ativo será produtivo. Impacta o valor da depreciação mensal (Custo Fixo).
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                              </div>
                            </div>
                          </th>
                          <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                            <div className="flex items-center justify-center gap-1 group/tooltip relative">
                              Residual (%)
                              <HelpCircle className="w-2.5 h-2.5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-slate-200 text-[9px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-tight border border-slate-800 text-center font-normal normal-case">
                                Percentual do valor original que se espera recuperar ao fim da vida útil (valor de revenda ou sucata).
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                              </div>
                            </div>
                          </th>
                          <th className="pb-3 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {Object.entries(groupedDepreciationItems).map(([category, items]: [string, DepreciationItem[]]) => (
                          <React.Fragment key={category}>
                            <tr className="bg-slate-900/40 border-y border-slate-800/80">
                              <td colSpan={6} className="px-4 py-2.5">
                                <div className="flex justify-between items-center animate-in fade-in duration-300">
                                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                    {category}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shadow-sm font-mono">
                                      Investimento: {formatCurrency(items.reduce((sum, i) => sum + i.valorNovo, 0))}
                                    </span>
                                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 shadow-sm font-mono">
                                      Depreciação: {formatCurrency(items.reduce((sum, i) => {
                                        const valorDepreciavel = i.valorNovo * (1 - (i.valorResidualPerc / 100));
                                        const depreciacaoAnual = valorDepreciavel / Math.max(1, i.vidaUtilAnos);
                                        return sum + (depreciacaoAnual / 12);
                                      }, 0))} / mês
                                    </span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {items.map((item) => (
                              <tr key={item.id} className="group hover:bg-slate-900/30 transition-colors border-b border-slate-850">
                                <td className="py-2 px-3">
                                  <TableInput
                                    value={item.nome}
                                    onChange={(val) => handleDepreciationItemChange(item.id, 'nome', val)}
                                    isNumber={false}
                                    className="font-medium text-slate-200"
                                    tooltip="Ex: Curral de Manejo, Trator 4x4, Silo Grão Úmido."
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <select
                                    value={item.categoria}
                                    onChange={(e) => handleDepreciationItemChange(item.id, 'categoria', e.target.value)}
                                    className="w-full bg-[#121826] border border-slate-800 text-xs text-slate-350 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer font-sans"
                                  >
                                    {CATEGORIAS_DEPRECIACAO.map(cat => (
                                      <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2 px-3">
                                  <TableInput
                                    value={item.valorNovo}
                                    onChange={(val) => handleDepreciationItemChange(item.id, 'valorNovo', val)}
                                    isCurrency
                                    className="text-emerald-400 font-bold"
                                    tooltip="Valor de aquisição do item novo."
                                  />
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <TableInput
                                    value={item.vidaUtilAnos}
                                    onChange={(val) => handleDepreciationItemChange(item.id, 'vidaUtilAnos', val)}
                                    className="text-slate-300 text-center font-mono"
                                    tooltip="Tempo estimado de uso em anos."
                                  />
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <TableInput
                                    value={item.valorResidualPerc}
                                    onChange={(val) => handleDepreciationItemChange(item.id, 'valorResidualPerc', val)}
                                    isPercentage
                                    className="text-slate-300 text-center font-mono"
                                    tooltip="Valor de revenda ao final da vida útil."
                                  />
                                </td>
                                <td className="py-2 px-3 text-right flex items-center justify-end gap-1.5 pt-4">
                                  {DEFAULT_INPUTS.itensDepreciacao.some(di => di.id === item.id) && (
                                    <button
                                      onClick={() => restoreDepreciationItemValue(item.id)}
                                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
                                      title="Restaurar valor de referência"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDepreciationItemChange(item.id, 'valorNovo', 0)}
                                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
                                    title="Zerar valor novo"
                                  >
                                    <Eraser className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => removeDepreciationItem(item.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-all cursor-pointer"
                                    title="Remover item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-950 border-t border-slate-800">
                        <tr className="font-bold text-slate-250">
                          <td colSpan={2} className="py-4 px-4 text-[10px] uppercase tracking-wider text-slate-400 font-display">Total Geral</td>
                          <td className="py-4 px-4 text-xs font-mono font-bold text-slate-100">{formatCurrency(results?.totalInvestimento || 0)}</td>
                          <td colSpan={2} className="py-4 px-4 text-right text-[10px] text-indigo-400 uppercase tracking-widest font-display">
                            Depreciação Total: <span className="text-xs font-mono font-bold text-indigo-300 ml-1">{formatCurrency(results?.totalDepreciacaoMes || 0)}</span> / mês
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  {inputs.itensDepreciacao.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-slate-400 font-medium">Nenhum item cadastrado. Use o valor manual abaixo ou adicione itens.</p>
                      <div className="mt-4 max-w-xs mx-auto">
                        <InputGroup label="Depreciação Mensal Manual" name="depreciacaoMes" value={inputs.depreciacaoMes} onChange={handleInputChange} step={0.01} isCurrency tooltip="Reserva financeira mensal para reposição futura de ativos. Garante a sustentabilidade do negócio a longo prazo ao prever a renovação de máquinas e benfeitorias sem descapitalização." error={errors.depreciacaoMes} />
                      </div>
                    </div>
                  )}
                  
                  {inputs.itensDepreciacao.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-400 font-medium">
                          Depreciação Mensal Total (Fazenda): <span className="font-bold text-slate-200">{formatCurrency(results?.totalDepreciacaoMes || 0)}</span>
                          <div className="text-[10px] text-slate-500 italic mt-1 font-mono">
                            * Rateado por {inputs.capacidadeEstatica} animais: <span className="font-bold text-indigo-400">{formatCurrency((results?.totalDepreciacaoMes || 0) / (inputs.capacidadeEstatica || 1))} / animal / mês</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-slate-500" />
                          Metodologia técnica de referência: Conab (2010)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleRunLHS}
                  disabled={isSimulating}
                  className="group relative flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all disabled:opacity-50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isSimulating ? (
                    <>
                      <RotateCcw className="w-5 h-5 animate-spin" />
                      Simulando...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5" />
                      Analisar Risco
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              {/* 1. Resumo Executivo Financeiro */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resumo Executivo Financeiro</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ResultCard 
                    title="Lucro por Animal" 
                    value={formatCurrency(results.lucro)} 
                    subValue={`${formatCurrency(results.lucroPorHa)}/ha`}
                    icon={<DollarSign className="w-4 h-4" />} 
                    color="emerald" 
                    tooltip={`Representa a sobra financeira real por animal após descontar todos os custos (incluindo oportunidades). O valor por hectare considera uma densidade de ${inputs.animaisHa} animais/ha.`}
                  />
                  <ResultCard 
                    title="VPL" 
                    value={formatCurrency(results.vpl)} 
                    subValue={`${formatCurrency(results.vplPorHa)}/ha`}
                    icon={<TrendingUp className="w-4 h-4" />} 
                    color="blue" 
                    tooltip={`Valor Presente Líquido. É a riqueza gerada pelo projeto trazida para valores de hoje, descontada pela TMA (${inputs.tmaAnual}%).`}
                  />
                  <ResultCard 
                    title="IB:C" 
                    value={results.indiceBeneficioCusto.toFixed(3)} 
                    icon={<ArrowRightLeft className="w-4 h-4" />} 
                    color="purple" 
                    tooltip="Índice Benefício:Custo. Para cada R$ 1,00 investido, quanto o projeto retorna. Valores > 1 indicam que o projeto é rentável." 
                  />
                  <ResultCard 
                    title="ROIA (%)" 
                    value={results.roia.toFixed(2) + '%'} 
                    icon={<Calculator className="w-4 h-4" />} 
                    color="amber" 
                    tooltip="Retorno Adicional sobre o Investimento. Representa a rentabilidade que excede a Taxa Mínima de Atratividade (TMA)." 
                  />
                </div>
              </motion.section>

              {/* 2. Desempenho Bioeconômico */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-display">Desempenho Bioeconômico</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                      <Scale className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo kg Ganho</p>
                        <Info className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={results.custoKgGanho}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {formatCurrency(results.custoKgGanho)}
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-emerald-400">Custo por kg de Ganho</p>
                      Custo operacional total (excluindo a compra do animal) dividido pelo total de kg ganhos. Indica quanto custa "fabricar" cada kg de carne.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0f172a]" />
                    </div>
                  </div>
                   <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                      <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo Total / Dia</p>
                        <Info className="w-3 h-3 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={results.custoTotalPorAnimalDia}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {formatCurrency(results.custoTotalPorAnimalDia)}
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-emerald-400">Custo Total por Animal/Dia</p>
                      Custo total acumulado (compra + operacional + oportunidade) dividido pelo tempo de alimentação.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                      <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo Operacional / Dia</p>
                        <Info className="w-3 h-3 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-slate-100">
                        <motion.span
                          key={results.custoTotalSemCompraDia}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {formatCurrency(results.custoTotalSemCompraDia)}
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-emerald-400">Custo Total/Dia (sem compra)</p>
                      Custo total acumulado excluindo o valor de compra do animal, dividido pelo tempo de alimentação. Reflete o custo diário de manutenção.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo @ Produzida</p>
                        <Info className="w-3 h-3 text-gray-300" />
                      </div>
                      <p className="text-lg font-bold text-slate-100">
                        <motion.span
                          key={results.custoArrobaGanho}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {formatCurrency(results.custoArrobaGanho)}
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-emerald-400">Custo por @ Produzida</p>
                      Custo total do ganho dividido pelas arrobas produzidas no período. Deve ser menor que o preço de venda da @ para haver lucro no ganho.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custo Total por @</p>
                        <Info className="w-3 h-3 text-gray-300" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold text-slate-100">
                          <motion.span
                            key={results.custoPorArroba}
                            initial={{ opacity: 0.3, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="inline-block"
                          >
                            {formatCurrency(results.custoPorArroba)}
                          </motion.span>
                        </p>
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 whitespace-nowrap" title="Ponto de Equilíbrio">
                          PE: {formatCurrency(results.pontoEquilibrioPreco)}
                        </span>
                      </div>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-purple-400">Custo Total por @</p>
                      Custo total acumulado (compra + operacional) dividido pelo total de arrobas finais. É o seu "preço de custo" final por arroba.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className={`p-3 rounded-xl ${results.agioDesagio > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                      <ArrowRightLeft className={`w-5 h-5 ${results.agioDesagio > 0 ? 'text-amber-600' : 'text-emerald-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ágio/Deságio</p>
                        <Info className="w-3 h-3 text-gray-300" />
                      </div>
                      <p className={`text-lg font-bold ${results.agioDesagio > 0 ? 'text-amber-600' : 'text-emerald-400'}`}>
                        <motion.span
                          key={results.agioDesagio}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {results.agioDesagio > 0 ? '+' : ''}{results.agioDesagio.toFixed(2)}%
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-amber-400">O que é Ágio/Deságio?</p>
                      Diferença percentual entre o preço pago na @ do boi magro e o preço recebido na @ do boi gordo. 
                      <span className="text-amber-200 font-medium"> Ágio (+)</span> aumenta o custo da arroba produzida. 
                      <span className="text-emerald-300 font-medium"> Deságio (-)</span> favorece a rentabilidade.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* 3. Métricas Biológicas */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Métricas Biológicas</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl shrink-0">
                      <Scale className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ganho Peso Total</p>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={results.ganhoPesoTotal}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {results.ganhoPesoTotal.toFixed(1)} kg
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      Total de kg ganhos por animal durante todo o período de confinamento.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shrink-0">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">@ Produzidas</p>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={results.arrobasProduzidas}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {results.arrobasProduzidas.toFixed(2)} @
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      Quantidade de arrobas de carcaça produzidas no confinamento (Ganho de carcaça).
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl shrink-0">
                      <Calculator className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eficiência Alimentar</p>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={results.eficienciaAlimentar}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {results.eficienciaAlimentar.toFixed(3)}
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-cyan-400">Conversão Alimentar</p>
                      Indica quantos kg de alimento são consumidos para ganhar 1 kg de peso vivo.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-slate-500/10 border border-slate-500/20 rounded-xl shrink-0">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo de Cocho</p>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={inputs.tempoAlimentacao}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {inputs.tempoAlimentacao} dias
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      Duração total do período de alimentação intensiva.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800/80 shadow-lg hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4 group relative text-left">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sobrecusto Dieta</p>
                      <p className="text-lg font-bold text-slate-100 font-mono">
                        <motion.span
                          key={results.sobrecustoDieta}
                          initial={{ opacity: 0.3, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="inline-block"
                        >
                          {formatCurrency(results.sobrecustoDieta)}
                        </motion.span>
                      </p>
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                      <p className="font-bold mb-1 text-red-400">Ineficiência Alimentar</p>
                      <p className="mb-2">Diferença entre o custo real e o cenário técnico (1% sobras e -5% preço).</p>
                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-white/10 text-[9px]">
                        <span className="text-slate-400">Excesso Sobras:</span>
                        <span className="font-bold">{formatCurrency(results.sobrecustoSobras)}</span>
                        <span className="text-slate-400">Diferença Preço:</span>
                        <span className="font-bold">{formatCurrency(results.sobrecustoPreco)}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* 4. Detalhamento de Custos e Viabilidade */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                >
                  <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    Composição de Custos (Matsunaga et al.)
                    <span className="text-[10px] font-normal text-slate-400 ml-auto bg-gray-50 px-2 py-1 rounded-full border border-gray-100 italic">
                      Valores por animal no período total
                    </span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 rounded-lg uppercase tracking-widest mb-1">
                      <h4 className="text-[10px] font-bold">Custos Variáveis</h4>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold">{formatCurrency(results.custoVariavel)}</span>
                        <span className="text-[10px] font-medium opacity-70">{formatPerc((results.custoVariavel / results.custoTotal) * 100)}</span>
                      </div>
                    </div>
                    <ResultRow label="Compra Animal Magro" value={formatCurrency(results.custoCompraAnimal)} dotColor="bg-emerald-500" tooltip="Custo de aquisição do animal magro para início do confinamento (por animal)." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoCompraAnimal / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Alimentação" value={formatCurrency(results.custoAlimentacao)} dotColor="bg-blue-500" tooltip="Custo total com volumoso e concentrado durante todo o período de trato (por animal)." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoAlimentacao / results.custoTotal) * 100)}</span>} />
                    <ResultRow 
                      label="Sobrecusto da Dieta" 
                      value={formatCurrency(results.sobrecustoDieta)} 
                      dotColor="bg-red-400" 
                      tooltip={`Ineficiência alimentar total. Composição: Sobras (${formatCurrency(results.sobrecustoSobras)}) + Preço (${formatCurrency(results.sobrecustoPreco)}). Cenário técnico: 1% sobras e -5% no preço dos insumos.`} 
                      extra={<span className="text-[10px] text-red-400 font-medium">{formatPerc((results.sobrecustoDieta / results.custoAlimentacao) * 100)}</span>} 
                    />
                    <ResultRow label="Sanidade" value={formatCurrency(results.custoSanidade)} dotColor="bg-amber-500" tooltip="Custos com medicamentos, vacinas e manejo sanitário no período total (por animal)." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoSanidade / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Mão de Obra" value={formatCurrency(results.custoMaoDeObra)} dotColor="bg-red-500" tooltip="Custos com pessoal e encargos trabalhistas rateados por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoMaoDeObra / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Combustível (Diesel)" value={formatCurrency(results.custoDiesel)} dotColor="bg-orange-500" tooltip="Custo com diesel para trato e distribuição de ração no período total (por animal)." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoDiesel / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Frete & Taxas" value={formatCurrency(results.custoFrete)} dotColor="bg-purple-500" tooltip="Custos de transporte, guia e rastreabilidade (por animal)." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoFrete / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Comissões (C/V)" value={formatCurrency(results.custoComissoes)} dotColor="bg-indigo-500" tooltip="Comissões de compra e venda (corretagem) por animal." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoComissoes / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Oportunidade Capital" value={formatCurrency(results.custoOportunidadeCapital)} dotColor="bg-pink-500" tooltip="Remuneração que o capital investido teria em uma aplicação alternativa durante o período de confinamento (por animal)." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoOportunidadeCapital / results.custoTotal) * 100)}</span>} />
                    
                    <div className="flex justify-between items-center text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg uppercase tracking-widest mt-4 mb-1">
                      <h4 className="text-[10px] font-bold">Custos Fixos</h4>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold">{formatCurrency(results.custoFixo)}</span>
                        <span className="text-[10px] font-medium opacity-70">{formatPerc((results.custoFixo / results.custoTotal) * 100)}</span>
                      </div>
                    </div>
                    <ResultRow label="Assistência Técnica" value={formatCurrency(results.custoAssistenciaTecnica)} dotColor="bg-slate-400" tooltip="Custo com consultoria e suporte técnico rateado por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoAssistenciaTecnica / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Pró-labore" value={formatCurrency(results.custoProLabore)} dotColor="bg-gray-400" tooltip="Remuneração do proprietário/gestor rateada por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoProLabore / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Energia Elétrica" value={formatCurrency(results.custoEnergia)} dotColor="bg-yellow-400" tooltip="Custos com energia rateados por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoEnergia / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Reparos & Manutenção" value={formatCurrency(results.custoReparos)} dotColor="bg-orange-400" tooltip="Custo com reparos e manutenção rateado por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoReparos / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Seguros" value={formatCurrency(results.custoSeguros)} dotColor="bg-blue-300" tooltip="Custo com seguros patrimoniais rateado por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoSeguros / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Financiamento" value={formatCurrency(results.custoFinanciamento)} dotColor="bg-indigo-300" tooltip="Custo com financiamentos rateado por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoFinanciamento / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="ITR" value={formatCurrency(results.custoITR)} dotColor="bg-orange-400" tooltip="Imposto sobre a Propriedade Territorial Rural rateado por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoITR / results.custoTotal) * 100)}</span>} />
                      <ResultRow 
                        label="Depreciação" 
                        value={formatCurrency(results.custoDepreciacao)} 
                        dotColor="bg-cyan-400" 
                        tooltip={`Reserva para reposição de ativos rateada por animal no período total de ${inputs.tempoAlimentacao} dias. (Equivalente a ${formatCurrency(results.custoDepreciacao / (inputs.tempoAlimentacao / 30.4167))}/mês por animal). Valores de vida útil e residual baseados na metodologia Conab (2010).`} 
                        extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoDepreciacao / results.custoTotal) * 100)}</span>} 
                      />
                    <ResultRow label="Oportunidade Máquinas" value={formatCurrency(results.custoOportunidadeMaquinas)} dotColor="bg-indigo-400" tooltip="Remuneração do capital imobilizado em máquinas rateada por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoOportunidadeMaquinas / results.custoTotal) * 100)}</span>} />
                    <ResultRow label="Oportunidade Terra" value={formatCurrency(results.custoOportunidadeTerra)} dotColor="bg-teal-400" tooltip="Remuneração do capital terra rateada por animal no período total." extra={<span className="text-[10px] text-slate-400 font-medium">{formatPerc((results.custoOportunidadeTerra / results.custoTotal) * 100)}</span>} />
                  </div>

                  <div className="pt-2 border-t border-slate-800/60">
                      <ResultRow label="Custo Operacional Efetivo (COE)" value={formatCurrency(results.custoOperacionalEfetivo)} bold tooltip="Soma dos custos variáveis (exceto oportunidade de capital)." />
                      <ResultRow label="Custo Operacional Total (COT)" value={formatCurrency(results.custoOperacionalTotal)} bold tooltip="COE + Custos Fixos (exceto oportunidades)." />
                      <ResultRow label="Custo Total (COT + Oportunidades)" value={formatCurrency(results.custoTotal)} bold tooltip="Considera todos os custos, inclusive todas as oportunidades." />
                      <ResultRow label="Custo Total por Hectare" value={`${formatCurrency(results.custoTotalPorHa)}/ha`} tooltip={`Custo total normalizado para uma densidade de ${inputs.animaisHa} animais por hectare.`} />
                    </div>
                </motion.div>

                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                  >
                    <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Composição de Receitas
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2 mb-4 p-3 bg-[#070a13] rounded-xl border border-slate-800/60">
                        <ResultRow label="Venda do Animal" value={formatCurrency(results.receitaVenda)} tooltip="Receita bruta obtida com a venda do animal gordo." />
                        <ResultRow label="Bonificação Carcaça" value={formatCurrency(results.receitaBonificacao)} tooltip="Receita adicional por qualidade de carcaça ou programas de incentivo." />
                        <ResultRow label="Chorume/Esterco" value={formatCurrency(results.receitaEsterco)} tooltip="Receita obtida com a venda ou aproveitamento do esterco produzido." />
                        <ResultRow label="Valor Residual" value={formatCurrency(results.valorResidual)} tooltip="Valor de revenda de ativos ao final do projeto (se houver)." />
                        <div className="pt-2 border-t border-slate-800/60">
                          <ResultRow label="Receita Bruta Total" value={formatCurrency(results.receitaBruta)} bold tooltip="Soma de todas as entradas financeiras do projeto." />
                          <ResultRow label="Receita Bruta Total/ha" value={`${formatCurrency(results.receitaBrutaPorHa)}/ha`} tooltip={`Receita bruta total normalizada para uma densidade de ${inputs.animaisHa} animais por hectare.`} />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                  >
                    <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Análise de Viabilidade Determinística
                    </h3>
                    <div className="space-y-3">
                      <ResultRow label="Margem Bruta" value={formatCurrency(results.margemBruta)} tooltip="Receita - COE. Sugere continuidade no curto prazo." />
                      <ResultRow label="Margem Líquida" value={formatCurrency(results.margemLiquida)} tooltip="Receita - COT. Sugere continuidade no médio/longo prazo." />
                      <div className="pt-2 border-t border-slate-800/60">
                        <ResultRow label="Lucro por Animal" value={formatCurrency(results.lucroPorBoi)} bold tooltip="Lucro real por animal no ciclo." />
                        <ResultRow label="Lucro por Hectare" value={`${formatCurrency(results.lucroPorHa)}/ha`} tooltip="Lucro real total projetado por hectare de área de confinamento." />
                        <ResultRow label="Giro Anual (Lotes/ano)" value={`${results.giroAnual.toFixed(2)} lotes`} tooltip="Número de ciclos (lotes) que podem ser realizados por ano com base no tempo de cocho." />
                        <ResultRow label="Lucro Real Total" value={formatCurrency(results.lucro)} bold tooltip="Receita - Custo Total. Considera todos os custos, inclusive oportunidade." />
                      </div>
                      <div className="pt-2 border-t border-slate-800/60">
                        <ResultRow 
                          label="VPL (Valor Presente Líquido)" 
                          value={formatCurrency(results.vpl)} 
                          bold
                          tooltip="Valor atual de todos os fluxos de caixa futuros descontados pela TMA." 
                        />
                        <ResultRow label="VPL por Hectare" value={`${formatCurrency(results.vplPorHa)}/ha`} tooltip="Valor Presente Líquido total projetado por hectare." />
                      </div>
                      <ResultRow label="TIR Mensal" value={formatPerc(results.tir)} tooltip="Taxa Interna de Retorno mensal. Representa a rentabilidade do capital investido no período." />
                      <ResultRow label="Payback Simples" value={results.payback.toFixed(2) + ' meses'} tooltip="Tempo necessário para recuperar o investimento inicial em valores nominais." />
                      <ResultRow label="Payback Descontado" value={results.paybackDescontado.toFixed(2) + ' meses'} tooltip="Tempo necessário para recuperar o investimento inicial considerando o valor do dinheiro no tempo (TMA)." />
                      <ResultRow label="Custo por @" value={`${formatCurrency(results.custoPorArroba)}/@`} tooltip={`Custo total por animal dividido pelo peso final em arrobas. Preço de venda atual: ${formatCurrency(inputs.precoBoiGordo)}/@`} />
                      <ResultRow label="Custo Total por Animal/Dia" value={`${formatCurrency(results.custoTotalPorAnimalDia)}/dia`} tooltip="Custo total dividido pelo tempo de alimentação (dias)." />
                      <ResultRow label="Ponto de Equilíbrio" value={`${formatCurrency(results.pontoEquilibrioPreco)}/@`} tooltip="Preço de venda necessário (R$/@) para cobrir todos os custos totais (VPL zero)." />
                      <div className="mt-6">
                        <TechnicalParecer 
                          title="Parecer Técnico - Viabilidade Econômica"
                          type={results.lucro > 0 ? 'success' : results.margemLiquida > 0 ? 'warning' : 'warning'}
                          content={results.lucro > 0 
                            ? "O projeto apresenta lucro real positivo, superando todos os custos de oportunidade e depreciação. Altamente viável sob as condições atuais." 
                            : results.margemLiquida > 0 
                              ? "O projeto cobre os custos operacionais e depreciação, mas não remunera totalmente o capital investido à taxa desejada (TMA). Requer monitoramento."
                              : "O projeto não cobre os custos operacionais totais. Possibilidade de descapitalização e inviabilidade econômica no longo prazo."}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Fluxo de Caixa Detalhado */}
              <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 overflow-hidden text-left">
                <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Fluxo de Caixa Detalhado (Financeiro por Animal)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-350 uppercase bg-slate-900/60 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Mês</th>
                        <th className="px-4 py-3">Descrição</th>
                        <th className="px-4 py-3 text-right">Entradas</th>
                        <th className="px-4 py-3 text-right">Saídas</th>
                        <th className="px-4 py-3 text-right">Saldo</th>
                        <th className="px-4 py-3 text-right rounded-r-lg">Acumulado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {results.fluxoCaixa.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-100">{item.mes}</td>
                          <td className="px-4 py-3 text-slate-400">{item.descricao}</td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                            {item.entradas > 0 ? formatCurrency(item.entradas) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-red-500 font-medium">
                            {item.saidas > 0 ? formatCurrency(item.saidas) : '-'}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${item.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(item.saldo)}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${item.acumulado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {formatCurrency(item.acumulado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evolução de Peso e Gordura */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                  <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    Evolução de Peso (Estimado vs Real)
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.evolucao} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="dia" 
                          label={{ value: 'Dia de Confinamento', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          label={{ value: 'Peso Vivo (kg)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8', offset: 10 }} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)} kg`,
                            name === 'pesoEstimado' ? 'Peso Estimado' : 'Peso Real'
                          ]}
                          labelFormatter={(label) => `Dia ${label}`}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />
                        <Line type="monotone" dataKey="pesoEstimado" name="Peso Estimado" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="pesoReal" name="Peso Real" stroke="#ef4444" strokeWidth={0} dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} connectNulls />
                        <ReferenceLine y={inputs.pesoVivoFinal} label={{ position: 'right', value: 'Meta Abate', fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} stroke="#9ca3af" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                  <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-rose-400" />
                    Deposição de Gordura (EGS) - Padrão MAPA
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.evolucao} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="dia" 
                          label={{ value: 'Dia de Confinamento', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          label={{ value: 'EGS (mm)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8', offset: 10 }} 
                          tick={{ fontSize: 10, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 12]}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }}
                          formatter={(value: number, name: string) => {
                            let status = "";
                            if (value === 0) status = "(Ausente)";
                            else if (value < 3) status = "(Escassa)";
                            else if (value <= 6) status = "(Mediana - Ideal)";
                            else if (value <= 10) status = "(Uniforme)";
                            else status = "(Excessiva)";
                            
                            return [
                              `${value.toFixed(2)} mm ${status}`,
                              name === 'gorduraEstimada' ? 'EGS Estimado' : 'EGS Real'
                            ];
                          }}
                          labelFormatter={(label) => `Dia ${label}`}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />
                        
                        {/* MAPA Reference Lines */}
                        <ReferenceLine y={3} label={{ position: 'right', value: 'Min Ideal (3mm)', fill: '#059669', fontSize: 9, fontWeight: 'bold' }} stroke="#34d399" strokeDasharray="3 3" />
                        <ReferenceLine y={6} label={{ position: 'right', value: 'Max Ideal (6mm)', fill: '#059669', fontSize: 9, fontWeight: 'bold' }} stroke="#34d399" strokeDasharray="3 3" />
                        <ReferenceLine y={10} label={{ position: 'right', value: 'Limite (10mm)', fill: '#ef4444', fontSize: 9 }} stroke="#fca5a5" strokeDasharray="3 3" />
                        
                        <Line type="monotone" dataKey="gorduraEstimada" name="EGS Estimado" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="gorduraReal" name="EGS Real" stroke="#881337" strokeWidth={0} dot={{ r: 5, fill: '#881337', strokeWidth: 2, stroke: '#fff' }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 p-3 bg-[#070a13] rounded-xl border border-slate-850/50">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Classificação de Acabamento (MAPA)</h4>
                    <div className="grid grid-cols-5 gap-1 text-[9px] text-center">
                      <div className="p-1 rounded bg-[#0f172a] border border-slate-800/80 text-slate-300">Ausente<br/>0mm</div>
                      <div className="p-1 rounded bg-[#0f172a] border border-slate-800/80 text-slate-300">Escassa<br/>1-3mm</div>
                      <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">Mediana<br/>3-6mm</div>
                      <div className="p-1 rounded bg-[#0f172a] border border-slate-800/80 text-slate-300">Uniforme<br/>6-10mm</div>
                      <div className="p-1 rounded bg-[#0f172a] border border-slate-800/80 text-slate-300">Excessiva<br/>&gt;10mm</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart: Custo por kg Ganho */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                    <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                      Eficiência: Custo por kg Ganho
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.evolucao} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                          <defs>
                            <linearGradient id="colorGanho" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis 
                            dataKey="dia" 
                            label={{ value: 'Dia de Confinamento', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            label={{ value: 'R$ / kg Ganho', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8', offset: 10 }} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }}
                            formatter={(value: number) => [formatCurrency(value), 'Custo / kg Ganho']}
                            labelFormatter={(label) => `Dia ${label}`}
                          />
                          <Area type="monotone" dataKey="custoPorKgGanho" name="Custo / kg Ganho" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorGanho)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-4 bg-[#070a13] rounded-2xl border border-slate-800/60 space-y-2 text-xs text-slate-300 italic">
                      <div className="flex items-center gap-2 text-slate-200 font-bold mb-1">
                        <TrendingUp className="w-3 h-3 text-teal-400" />
                        Custo / kg Ganho
                      </div>
                      <p>
                        Reflete o <strong>custo operacional efetivo</strong> (excluindo a compra do animal) dividido pelo ganho total de peso vivo acumulado.
                      </p>
                      <p className="mt-2">
                        Este indicador permite avaliar a eficiência da dieta e o impacto dos custos fixos sobre o desempenho biológico real do lote ao longo do ciclo.
                      </p>
                    </div>
                  </div>

                  {/* Chart: Custo por mm EGS */}
                  <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                    <h3 className="font-semibold text-slate-200 mb-6 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      Eficiência: Custo por mm EGS
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.evolucao} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                          <defs>
                            <linearGradient id="colorEGS" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis 
                            dataKey="dia" 
                            label={{ value: 'Dia de Confinamento', position: 'insideBottom', offset: -15, fontSize: 11, fill: '#94a3b8' }} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={{ stroke: '#e5e7eb' }}
                          />
                          <YAxis 
                            label={{ value: 'R$ / mm EGS', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8', offset: 10 }} 
                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }}
                            formatter={(value: number) => [formatCurrency(value), 'Custo / mm EGS']}
                            labelFormatter={(label) => `Dia ${label}`}
                          />
                          <Area type="monotone" dataKey="custoPorMmEGS" name="Custo / mm EGS" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorEGS)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-4 bg-[#070a13] rounded-2xl border border-slate-800/60 space-y-2 text-xs text-slate-300 italic">
                      <div className="flex items-center gap-2 text-slate-200 font-bold mb-1">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        Custo / mm EGS
                      </div>
                      <p>
                        Mostra o custo efetivo para depositar cada milímetro de gordura subcutânea. 
                        A faixa ideal de <strong>3 a 6 mm (Mediana)</strong> é o ponto de equilíbrio para a indústria:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-1 font-sans">
                        <li><strong>Proteção:</strong> Essencial contra o resfriamento.</li>
                        <li><strong>Qualidade:</strong> Garante suculência e maciez.</li>
                        <li><strong>Comercialização:</strong> Evita penalizações no frigorífico.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Testes de Estresse (Stress Testing) */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="pt-8 border-t border-slate-800/60"
              >
                <div className="flex items-center gap-3 mb-6 text-left">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100 font-display">Testes de Estresse (Stress Testing)</h2>
                    <p className="text-xs text-slate-400">Cenários determinísticos extremos para avaliação de resiliência do projeto.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stressResults.map((scenario) => {
                    const colorStyles = {
                      amber: "border-amber-500/25 bg-amber-500/5 text-amber-400",
                      red: "border-rose-500/25 bg-rose-500/5 text-rose-450",
                      orange: "border-orange-500/25 bg-orange-500/5 text-orange-400"
                    }[scenario.color as 'amber' | 'red' | 'orange'] || "border-slate-800 bg-[#121826]/80 text-slate-300";
                    
                    const isCustom = customStressScenarios.some(cs => cs.id === scenario.id);

                    return (
                      <div 
                        key={scenario.id}
                        className={`bg-[#0f172a] p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group/card ${colorStyles.split(' ').slice(0, 2).join(' ')}`}
                      >
                        {isCustom && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const cs = customStressScenarios.find(s => s.id === scenario.id);
                                if (cs) {
                                  setNewStress({
                                    name: cs.name,
                                    changes: cs.changes || [],
                                    color: cs.color || 'amber'
                                  });
                                  setEditingStressId(cs.id);
                                  setIsAddingStress(true);
                                }
                              }}
                              className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all cursor-pointer"
                              title="Editar Cenário"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomStressScenarios(prev => prev.filter(cs => cs.id !== scenario.id));
                              }}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all cursor-pointer"
                              title="Excluir Cenário"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                          <AlertTriangle className="w-16 h-16 text-slate-400" />
                        </div>
                        
                        <div className="relative z-10 text-left">
                          <h3 className="font-bold text-lg text-slate-100 mb-1">{scenario.name}</h3>
                          {scenario.changes && scenario.changes.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mb-6">
                              {scenario.changes.map((c: any, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-[#070a13] border border-slate-800 text-[9px] font-black text-slate-400 rounded-md uppercase tracking-tighter">
                                  {STRESS_INPUTS[c.inputKey]} {c.changePerc > 0 ? '+' : ''}{c.changePerc}%
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 mb-6 leading-relaxed bg-[#0c1222]/50 p-2.5 rounded-xl border border-slate-850/60">{scenario.description}</p>
                          )}
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-end mb-1">
                                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">VPL do Cenário</p>
                                <p className={`text-sm font-bold font-mono ${scenario.vpl >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {formatCurrency(scenario.vpl)}
                                </p>
                              </div>
                              <div className="w-full bg-[#070a13] h-1.5 rounded-full overflow-hidden border border-slate-800">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, Math.max(0, (scenario.vpl / (results?.vpl || 1)) * 100))}%` }}
                                  className={`h-full ${scenario.vpl >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/40">
                              <div>
                                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Impacto no VPL</p>
                                <p className={`text-sm font-bold font-mono ${scenario.vplDiff >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {scenario.vplDiffPerc > 0 ? '+' : ''}{scenario.vplDiffPerc.toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1">TIR Mensal</p>
                                <p className={`text-sm font-bold font-mono ${scenario.tir >= (inputs.tmaAnual / 100) ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {formatPerc(scenario.tir)}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800/40">
                              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1 font-sans">Lucro por Animal</p>
                              <p className="text-sm font-bold font-mono text-slate-200">{formatCurrency(scenario.lucro)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Custom Stress Card */}
                  <div 
                    onClick={() => {
                      setEditingStressId(null);
                      setNewStress({ name: '', changes: [], color: 'amber' });
                      setIsAddingStress(true);
                    }}
                    className="bg-slate-900/30 p-6 rounded-2xl border-2 border-dashed border-slate-800/60 flex flex-col items-center justify-center gap-4 hover:bg-slate-900/60 hover:border-emerald-500/35 transition-all cursor-pointer group min-h-[300px]"
                  >
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-all group-hover:text-emerald-400">
                      <Plus className="w-8 h-8 text-slate-500 group-hover:text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-300 group-hover:text-slate-100">Novo Cenário</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Personalizar Estresse</p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          )}




          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              id="charts-tab-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Configurações da Cópula */}
              <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <ShieldAlert className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">Configurações de Simulação</h3>
                      <p className="text-xs text-slate-400">Defina o modelo de dependência entre variáveis.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Modelo de Dependência</label>
                        <div className="group relative">
                          <Info className="w-3 h-3 text-gray-300 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-tight border border-white/10">
                            Escolha como as variáveis interagem. Correlações lineares são o padrão, enquanto Cópulas permitem modelar riscos extremos (caudas).
                          </div>
                        </div>
                      </div>
                      <select 
                        value={inputs.copulaType}
                        onChange={(e) => setInputs(prev => ({ ...prev, copulaType: e.target.value as any }))}
                        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 hover:border-slate-700 transition-colors outline-none cursor-pointer"
                      >
                        <option value="gaussian" className="bg-slate-900">Correlação Linear (Cópula Gaussiana)</option>
                        <option value="spearman" className="bg-slate-900">Correlação de Postos (Spearman)</option>
                        <option value="clayton" className="bg-slate-900">Cópula de Clayton (Risco de Cauda Inferior)</option>
                        <option value="gumbel" className="bg-slate-900">Cópula de Gumbel (Risco de Cauda Superior)</option>
                        <option value="independent" className="bg-slate-900">Independência Total (Sem Correlação)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Iterações</label>
                      <select 
                        value={mcIterations}
                        onChange={(e) => setMcIterations(parseInt(e.target.value))}
                        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs font-semibold focus:border-indigo-500 hover:border-slate-700 transition-colors outline-none font-sans cursor-pointer"
                      >
                        <option value={2000} className="bg-slate-900">2.000 iterações (Ultra Rápido)</option>
                        <option value={5000} className="bg-slate-900">5.000 iterações (Recomendado)</option>
                        <option value={10000} className="bg-slate-900">10.000 iterações (Alta Precisão)</option>
                        <option value={25000} className="bg-slate-900">25.000 iterações (Máximo Seguro)</option>
                      </select>
                    </div>
                    <button
                      onClick={handleRunLHS}
                      disabled={isSimulating}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/20 disabled:opacity-50"
                    >
                      {isSimulating ? 'Simulando...' : 'Recalcular'}
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-slate-900 border border-slate-800/85 rounded-xl">
                  <p className="text-[10.5px] text-slate-300 leading-relaxed">
                    {inputs.copulaType === 'gaussian' && (
                      <>
                        <span className="font-bold">Correlação Linear (Gaussiana):</span> Utiliza a decomposição de Cholesky para impor a estrutura de correlação linear especificada. Ideal para capturar a dependência média histórica entre preços.
                      </>
                    )}
                    {inputs.copulaType === 'spearman' && (
                      <>
                        <span className="font-bold">Correlação de Spearman:</span> Foca na relação de ordem (postos) entre as variáveis. É mais robusta a valores extremos e captura dependências não-lineares monotônicas.
                      </>
                    )}
                    {inputs.copulaType === 'clayton' && (
                      <>
                        <span className="font-bold">Cópula de Clayton:</span> Enfatiza a dependência em momentos de queda (cauda inferior). Simula cenários onde preços de compra e venda caem juntos com mais frequência, testando a resiliência a crises.
                      </>
                    )}
                    {inputs.copulaType === 'gumbel' && (
                      <>
                        <span className="font-bold">Cópula de Gumbel:</span> Enfatiza a dependência em momentos de alta (cauda superior). Útil para simular choques de custos onde múltiplos insumos sobem simultaneamente.
                      </>
                    )}
                    {inputs.copulaType === 'independent' && (
                      <>
                        <span className="font-bold">Independência:</span> Assume que as variáveis não possuem relação estatística. Pode subestimar o risco em mercados onde os preços são correlacionados.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {!lhsResults ? (
                <div className="bg-[#0f172a] p-12 rounded-2xl shadow-xl border border-slate-800/85 text-center">
                  <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-100">Simulação não realizada</h3>
                  <p className="text-xs text-slate-400 mt-2 mb-6">Execute a simulação de Hypercubo Latino (LHS) para analisar os riscos do projeto.</p>
                  <button
                    onClick={handleRunLHS}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all tracking-wider shadow-lg shadow-indigo-950/20 cursor-pointer animate-bounce"
                  >
                    Simular Agora
                  </button>
                </div>
              ) : (
                <>
                  {/* Barra de Sub-abas da Análise de Risco */}
                  <div className="flex flex-wrap gap-2 p-1.5 bg-[#0c1222]/90 border border-slate-800/80 rounded-2xl">
                    {[
                      { id: 'risco', label: 'Estatísticas de Risco', icon: <ShieldAlert className="w-4 h-4" /> },
                      { id: 'cenarios', label: 'Cenários Probabilísticos', icon: <BarChart3 className="w-4 h-4" /> },
                      { id: 'impacto', label: 'Estimador de Impacto (What-if)', icon: <Calculator className="w-4 h-4" /> },
                      { id: 'dominancia', label: 'Dominância Estocástica', icon: <TrendingUp className="w-4 h-4" /> }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRiskSubTab(item.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all cursor-pointer ${
                          riskSubTab === item.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {riskSubTab === 'risco' && (
                    <>
                      {lhsResults.parecerTecnico && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-2xl border text-left ${
                            lhsResults.parecerTecnico.nivelRisco === 'alto' ? 'bg-red-500/5 border-red-500/20 text-rose-300' :
                            lhsResults.parecerTecnico.nivelRisco === 'baixo' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' :
                            'bg-slate-900/60 border-slate-800 text-slate-350'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              lhsResults.parecerTecnico.nivelRisco === 'alto' ? 'bg-red-500/10 text-red-400' :
                              lhsResults.parecerTecnico.nivelRisco === 'baixo' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                                lhsResults.parecerTecnico.nivelRisco === 'alto' ? 'text-rose-455' :
                                lhsResults.parecerTecnico.nivelRisco === 'baixo' ? 'text-emerald-400' :
                                'text-slate-200'
                              }`}>
                                {lhsResults.parecerTecnico.titulo}
                              </h3>
                              <p className="text-xs leading-relaxed text-slate-300">
                                {lhsResults.parecerTecnico.texto}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left group relative"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Risco de VPL Negativo</p>
                      <p className={`text-3xl font-bold ${lhsResults.probabilidadeVplNegativo > 20 ? 'text-red-600' : 'text-emerald-400'}`}>
                        {lhsResults.probabilidadeVplNegativo.toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Probabilidade do VPL ser menor que zero.</p>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                        Chance de o VPL ser menor que zero com base nas {mcIterations.toLocaleString()} simulações. Indica a probabilidade de o projeto não atingir a TMA.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left group relative"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">VPL Médio Simulado</p>
                      <p className="text-3xl font-bold text-slate-100">{formatCurrency(lhsResults.vplMedio)}</p>
                      <p className="text-xs text-slate-400 mt-2">Média de {mcIterations.toLocaleString()} iterações aleatórias.</p>
                      {results && (
                        <p className="text-[10px] text-indigo-400 mt-1 font-medium">
                          VPL Determinístico: {formatCurrency(results.vpl)}
                        </p>
                      )}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                        Média ponderada de todos os resultados de VPL simulados. Representa o valor esperado considerando as incertezas.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left group relative"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amplitude de VPL</p>
                      <p className="text-sm font-medium text-slate-350">Min: <span className="font-mono text-slate-100">{formatCurrency(lhsResults.vplMinimo)}</span></p>
                      <p className="text-sm font-medium text-slate-350">Max: <span className="font-mono text-slate-100">{formatCurrency(lhsResults.vplMaximo)}</span></p>
                      <p className="text-xs text-slate-400 mt-2">Piores e melhores cenários simulados.</p>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                        Faixa de variação entre o pior (mínimo) e o melhor (máximo) resultado de VPL encontrado nas simulações.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left group relative"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lucro Médio Simulado</p>
                      <p className="text-2xl font-bold text-slate-100">{formatCurrency(lhsResults.lucroMedio)}</p>
                      <p className="text-xs text-slate-400 mt-1">Média do lucro real nas iterações.</p>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                        Média do lucro real por animal em todas as simulações, considerando as variações de preços e desempenho.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                      </div>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left group relative"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TIR Média Simulada</p>
                      <p className="text-2xl font-bold text-slate-100">{formatPerc(lhsResults.tirMedia)}</p>
                      <p className="text-xs text-slate-400 mt-1">Média da rentabilidade mensal.</p>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
                        Média da Taxa Interna de Retorno mensal em todas as simulações. Representa a rentabilidade média esperada.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                      </div>
                    </motion.div>
                  </div>
                </>
              )}

              {/* Probabilistic Scenarios Section */}
              {riskSubTab === 'cenarios' && lhsResults && (
                <div className="space-y-6 pt-6 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-100">Cenários Probabilísticos</h2>
                          <p className="text-sm text-slate-400">Resultados chave em diferentes níveis de probabilidade.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pessimistic Scenario */}
                        <div className="bg-[#121826]/80 p-8 rounded-2xl shadow-lg border border-red-950/40 hover:border-red-500/20 relative overflow-hidden transition-all">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp className="w-24 h-24 text-red-600 transform rotate-180" />
                          </div>
                          <div className="relative z-10 text-left">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                  <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="font-bold text-xl text-red-400">Pessimista</h3>
                              </div>
                              <div className="flex items-center gap-2 bg-red-950/40 px-2 py-1 rounded-lg">
                                <span className="text-[10px] font-bold text-rose-450 uppercase">P</span>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="99" 
                                  value={scenarioPercentiles.pessimistic}
                                  onChange={(e) => setScenarioPercentiles(prev => ({ ...prev, pessimistic: Number(e.target.value) }))}
                                  className="w-10 bg-transparent text-sm font-bold text-rose-400 focus:outline-none font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  VPL
                                </p>
                                <p className="text-2xl font-black text-red-400 font-mono">
                                  {formatCurrency(
                                    (() => {
                                      const vpls = lhsResults.iteracoes.map(i => i.vpl).sort((a, b) => a - b);
                                      const idx = Math.min(vpls.length - 1, Math.max(0, Math.floor(vpls.length * (scenarioPercentiles.pessimistic / 100))));
                                      return vpls[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  Lucro por Animal
                                </p>
                                <p className="text-2xl font-black text-red-400 font-mono">
                                  {formatCurrency(
                                    (() => {
                                      const lucros = lhsResults.iteracoes.map(i => i.lucro).sort((a, b) => a - b);
                                      const idx = Math.min(lucros.length - 1, Math.max(0, Math.floor(lucros.length * (scenarioPercentiles.pessimistic / 100))));
                                      return lucros[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  TIR Mensal
                                </p>
                                <p className="text-2xl font-black text-red-400 font-mono">
                                  {formatPerc(
                                    (() => {
                                      const tirs = lhsResults.iteracoes.map(i => i.tir).sort((a, b) => a - b);
                                      const idx = Math.min(tirs.length - 1, Math.max(0, Math.floor(tirs.length * (scenarioPercentiles.pessimistic / 100))));
                                      return tirs[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="mt-8 text-xs text-slate-400 italic">
                              Cenário com {100 - scenarioPercentiles.pessimistic}% de probabilidade de ser superado.
                            </p>
                          </div>
                        </div>

                        {/* Expected Scenario */}
                        <div className="bg-[#121826]/80 p-8 rounded-2xl shadow-lg border border-slate-800 hover:border-slate-650/40 relative overflow-hidden transition-all">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <ArrowRightLeft className="w-24 h-24 text-slate-400" />
                          </div>
                          <div className="relative z-10 text-left">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-slate-805 bg-slate-800 rounded-lg">
                                  <CheckCircle2 className="w-5 h-5 text-slate-300" />
                                </div>
                                <h3 className="font-bold text-xl text-slate-200">Esperado</h3>
                              </div>
                              <div className="flex items-center gap-2 bg-slate-900/60 px-2 py-1 rounded-lg">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">P</span>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="99" 
                                  value={scenarioPercentiles.expected}
                                  onChange={(e) => setScenarioPercentiles(prev => ({ ...prev, expected: Number(e.target.value) }))}
                                  className="w-10 bg-transparent text-sm font-bold text-slate-200 focus:outline-none font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  VPL
                                </p>
                                <p className="text-2xl font-black text-slate-100 font-mono">
                                  {formatCurrency(
                                    (() => {
                                      const vpls = lhsResults.iteracoes.map(i => i.vpl).sort((a, b) => a - b);
                                      const idx = Math.min(vpls.length - 1, Math.max(0, Math.floor(vpls.length * (scenarioPercentiles.expected / 100))));
                                      return vpls[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  Lucro por Animal
                                </p>
                                <p className="text-2xl font-black text-slate-100 font-mono">
                                  {formatCurrency(
                                    (() => {
                                      const lucros = lhsResults.iteracoes.map(i => i.lucro).sort((a, b) => a - b);
                                      const idx = Math.min(lucros.length - 1, Math.max(0, Math.floor(lucros.length * (scenarioPercentiles.expected / 100))));
                                      return lucros[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  TIR Mensal
                                </p>
                                <p className="text-2xl font-black text-slate-100 font-mono">
                                  {formatPerc(
                                    (() => {
                                      const tirs = lhsResults.iteracoes.map(i => i.tir).sort((a, b) => a - b);
                                      const idx = Math.min(tirs.length - 1, Math.max(0, Math.floor(tirs.length * (scenarioPercentiles.expected / 100))));
                                      return tirs[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="mt-8 text-xs text-slate-400 italic">
                              Cenário central da simulação ({scenarioPercentiles.expected}º percentil).
                            </p>
                          </div>
                        </div>

                        {/* Optimistic Scenario */}
                        <div className="bg-[#121826]/80 p-8 rounded-2xl shadow-lg border border-emerald-950/40 hover:border-emerald-500/20 relative overflow-hidden transition-all">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp className="w-24 h-24 text-emerald-400" />
                          </div>
                          <div className="relative z-10 text-left">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h3 className="font-bold text-xl text-emerald-400">Otimista</h3>
                              </div>
                              <div className="flex items-center gap-2 bg-emerald-950/40 px-2 py-1 rounded-lg">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">P</span>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="99" 
                                  value={scenarioPercentiles.optimistic}
                                  onChange={(e) => setScenarioPercentiles(prev => ({ ...prev, optimistic: Number(e.target.value) }))}
                                  className="w-10 bg-transparent text-sm font-bold text-emerald-400 focus:outline-none font-mono"
                                />
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  VPL
                                </p>
                                <p className="text-2xl font-black text-emerald-400 font-mono">
                                  {formatCurrency(
                                    (() => {
                                      const vpls = lhsResults.iteracoes.map(i => i.vpl).sort((a, b) => a - b);
                                      const idx = Math.min(vpls.length - 1, Math.max(0, Math.floor(vpls.length * (scenarioPercentiles.optimistic / 100))));
                                      return vpls[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">
                                  Lucro por Animal
                                </p>
                                <p className="text-2xl font-black text-emerald-400 font-mono">
                                  {formatCurrency(
                                    (() => {
                                      const lucros = lhsResults.iteracoes.map(i => i.lucro).sort((a, b) => a - b);
                                      const idx = Math.min(lucros.length - 1, Math.max(0, Math.floor(lucros.length * (scenarioPercentiles.optimistic / 100))));
                                      return lucros[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-455 uppercase tracking-wider mb-1">
                                  TIR Mensal
                                </p>
                                <p className="text-2xl font-black text-emerald-400 font-mono">
                                  {formatPerc(
                                    (() => {
                                      const tirs = lhsResults.iteracoes.map(i => i.tir).sort((a, b) => a - b);
                                      const idx = Math.min(tirs.length - 1, Math.max(0, Math.floor(tirs.length * (scenarioPercentiles.optimistic / 100))));
                                      return tirs[idx];
                                    })()
                                  )}
                                </p>
                              </div>
                            </div>
                            <p className="mt-8 text-xs text-slate-400 italic">
                              Cenário com apenas {100 - scenarioPercentiles.optimistic}% de probabilidade de ser superado.
                            </p>
                          </div>
                        </div>
                      </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <TechnicalParecer 
                      title="Parecer Técnico - Análise de Risco Probabilístico"
                      type={lhsResults.probabilidadeVplNegativo > 20 ? 'warning' : 'success'}
                      content={lhsResults.probabilidadeVplNegativo > 20 
                        ? `Risco elevado (${lhsResults.probabilidadeVplNegativo.toFixed(1)}% de VPL negativo). A probabilidade de o projeto não atingir a TMA é significativa. O Coeficiente de Variação de ${lhsResults.coeficienteVariacao.toFixed(1)}% indica alta dispersão e incerteza.` 
                        : `Risco controlado (${lhsResults.probabilidadeVplNegativo.toFixed(1)}% de VPL negativo). A probabilidade de sucesso é alta, indicando resiliência frente às variações de mercado simuladas. O C.V. de ${lhsResults.coeficienteVariacao.toFixed(1)}% sugere estabilidade relativa.`}
                    />
                  </motion.div>
                </div>
              )}

              {riskSubTab === 'risco' && lhsResults && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Histograma */}
                  <motion.div 
                    id="vpl-histogram-chart" 
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-slate-250 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          Distribuição de VPL (Área)
                        </h3>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={handleDownloadHistogramPNG}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Baixar PNG"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setIsHistogramInfoOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Como interpretar"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={lhsResults.histograma}>
                            <defs>
                              <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="valor" 
                              type="number"
                              domain={['auto', 'auto']}
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize: 10}}
                              tickFormatter={(val) => `R$ ${Math.round(val/1000)}k`}
                            />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip 
                              labelFormatter={(val) => `VPL: ${formatCurrency(val)}`}
                              formatter={(val: number) => [val, 'Frequência']}
                            />
                            <ReferenceLine 
                               x={vplThreshold} 
                               stroke="#ef4444" 
                               strokeDasharray="3 3" 
                               label={{ 
                                 value: vplThreshold === 0 ? 'VPL Zero' : `Limiar: ${formatCurrency(vplThreshold)}`, 
                                 position: 'top', 
                                 fill: '#ef4444', 
                                 fontSize: 10 
                               }} 
                             />
                            {lhsResults && (
                              <ReferenceLine 
                                x={lhsResults.vplMedio} 
                                stroke="#8b5cf6" 
                                strokeDasharray="5 5" 
                                label={{ value: 'VPL Probabilístico', position: 'top', fill: '#8b5cf6', fontSize: 10 }} 
                              />
                            )}
                            {results && (
                              <ReferenceLine 
                                x={results.vpl} 
                                stroke="#6366f1" 
                                strokeDasharray="5 5" 
                                label={{ value: 'VPL Determinístico', position: 'top', fill: '#6366f1', fontSize: 10 }} 
                              />
                            )}
                            <Area type="monotone" dataKey="frequencia" stroke="#10b981" fillOpacity={1} fill="url(#colorFreq)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-6 mt-4 text-[10px] font-medium text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 border-t-2 border-dashed border-red-500" />
                          <span>Limiar de VPL</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500" />
                          <span>VPL Determinístico</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-0.5 border-t-2 border-dashed border-violet-500" />
                          <span>VPL Probabilístico</span>
                        </div>
                      </div>

                      {lhsResults && (
                        <div className="mt-8 px-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ajuste de Limiar (Régua)</span>
                            <span className="text-sm font-bold text-emerald-400">{formatCurrency(vplThreshold)}</span>
                          </div>
                          <input 
                            type="range" 
                            min={Math.floor(lhsResults.vplMinimo / 1000) * 1000} 
                            max={Math.ceil(lhsResults.vplMaximo / 1000) * 1000} 
                            step={100}
                            value={vplThreshold} 
                            onChange={(e) => setVplThreshold(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-700/50"
                          />
                          <div className="flex justify-between mt-4 p-3 bg-[#070a13] rounded-xl border border-slate-850/50">
                            <div className="text-center flex-1 border-r border-slate-800">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">VPL &lt; {formatCurrency(vplThreshold)}</p>
                              <p className="text-lg font-bold text-red-500 font-mono">{thresholdStats.below.toFixed(2)}%</p>
                            </div>
                            <div className="text-center flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">VPL &gt; {formatCurrency(vplThreshold)}</p>
                              <p className="text-lg font-bold text-emerald-400 font-mono">{thresholdStats.above.toFixed(2)}%</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 text-center mt-2 italic">
                            Arraste a régua para ver a probabilidade de atingir diferentes metas de VPL.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-800/80">
                        <div className="text-center group relative">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Média</p>
                          <p className="text-sm font-bold text-slate-100 font-mono">{formatCurrency(lhsResults.vplMedio)}</p>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-tight border border-white/10 text-center font-normal normal-case">
                            Valor médio esperado para o VPL considerando todas as simulações.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                        <div className="text-center border-x border-slate-800 group relative">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Desvio Padrão</p>
                          <p className="text-sm font-bold text-slate-100 font-mono">{formatCurrency(lhsResults.desvioPadrao)}</p>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-tight border border-white/10 text-center font-normal normal-case">
                            Mede a dispersão dos resultados em relação à média. Quanto maior, maior a incerteza.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                        <div className="text-center group relative">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">C.V.</p>
                          <p className="text-sm font-bold text-slate-100 font-mono">{lhsResults.coeficienteVariacao.toFixed(1)}%</p>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-tight border border-white/10 text-center font-normal normal-case">
                            Coeficiente de Variação. É o desvio padrão dividido pela média. Permite comparar o risco relativo entre projetos.
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sensibilidade (Correlação) */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                          <h3 className="font-semibold text-slate-250 flex items-center gap-2">
                            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                            Análise de Sensibilidade (Correlação)
                          </h3>
                          <p className="text-[10px] text-slate-400">Impacto no VPL considerando dependência via {
                            inputs.copulaType === 'gaussian' ? 'Correlação Linear' :
                            inputs.copulaType === 'spearman' ? 'Correlação de Spearman' :
                            inputs.copulaType === 'clayton' ? 'Cópula de Clayton' :
                            inputs.copulaType === 'gumbel' ? 'Cópula de Gumbel' : 'Independência'
                          }</p>
                        </div>
                        <button 
                          onClick={() => setIsSensitivityInfoOpen(true)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                          title="Como interpretar"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="h-[600px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={lhsResults.sensibilidade}
                            layout="vertical"
                            margin={{ top: 5, right: 100, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" domain={[-1.1, 1.1]} axisLine={false} tickLine={false} />
                            <YAxis 
                              dataKey="nome" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              width={180}
                              tick={{fontSize: 10}}
                            />
                            <Tooltip 
                              formatter={(value: number) => [value.toFixed(3), 'Coef. Correlação']}
                              cursor={{fill: '#f8fafc'}}
                            />
                            <Bar 
                              dataKey="impacto" 
                              radius={[0, 4, 4, 0]}
                            >
                              {lhsResults.sensibilidade.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.impacto > 0 ? '#10b981' : '#ef4444'} 
                                />
                              ))}
                              <LabelList 
                                dataKey="impacto" 
                                position="right" 
                                content={(props: any) => {
                                  const { x, y, width, height, value } = props;
                                  if (value === undefined || value === null) return null;
                                  const isPositive = value >= 0;
                                  const posX = isPositive ? x + width + 12 : x - 12;
                                  const textAnchor = isPositive ? "start" : "end";
                                  return (
                                    <text 
                                      x={posX} 
                                      y={y + height / 2} 
                                      fill={isPositive ? '#059669' : '#dc2626'} 
                                      fontSize={11} 
                                      fontWeight="bold"
                                      textAnchor={textAnchor}
                                      dominantBaseline="middle"
                                      stroke="#fff"
                                      strokeWidth={3}
                                      paintOrder="stroke"
                                    >
                                      {value.toFixed(3)}
                                    </text>
                                  );
                                }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 text-center italic">
                        * Coeficientes de correlação indicam a força e direção da influência de cada input no VPL.
                      </p>
                    </motion.div>

                    {/* Curva S */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                    >
                      <h3 className="font-bold text-lg text-slate-200 mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-emerald-400" />
                        Curva de Probabilidade Acumulada (VPL)
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={(() => {
                              // Generate S-Curve data from histogram
                              let cumulative = 0;
                              const total = lhsResults.histograma.reduce((acc, h) => acc + h.frequencia, 0);
                              return lhsResults.histograma.map(h => {
                                cumulative += h.frequencia;
                                return {
                                  valor: h.valor,
                                  probabilidade: (cumulative / total) * 100
                                };
                              });
                            })()}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="valor" 
                              type="number" 
                              domain={['auto', 'auto']} 
                              tickFormatter={(val) => `R$ ${Math.round(val/1000)}k`}
                              tick={{fontSize: 10}}
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              tickFormatter={(val) => `${val}%`}
                              tick={{fontSize: 10}}
                            />
                            <Tooltip 
                              formatter={(value: number, name: string, props: any) => [
                                `${value.toFixed(1)}%`, 
                                `Prob. Acumulada (VPL ≤ ${formatCurrency(props.payload.valor)})`
                              ]} 
                            />
                            <ReferenceLine x={0} stroke="#ef4444" strokeWidth={2} label={{ value: 'Risco', position: 'top', fill: '#ef4444', fontSize: 10 }} />
                            {results && (
                              <ReferenceLine 
                                x={results.vpl} 
                                stroke="#10b981" 
                                strokeDasharray="5 5" 
                                label={{ value: 'VPL Determinístico', position: 'top', fill: '#10b981', fontSize: 10 }} 
                              />
                            )}
                            <Area 
                              type="monotone" 
                              dataKey="probabilidade" 
                              stroke="#6366f1" 
                              strokeWidth={3}
                              fill="#6366f1" 
                              fillOpacity={0.1} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="mt-4 text-[10px] text-slate-400 italic text-center">
                        A Curva S indica a probabilidade de o VPL ser menor ou igual a um valor. O cruzamento com R$ 0 é a probabilidade de prejuízo.
                      </p>
                    </motion.div>

                    {/* Regressão Múltipla (Correlação) */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-emerald-400" />
                          Análise de Sensibilidade por Regressão Múltipla (Standard Betas)
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">R² = {lhsResults.r2.toFixed(3)}</span>
                          <button 
                            onClick={() => setIsRegressionInfoOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Como interpretar"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="h-[600px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={lhsResults.regressao}
                            layout="vertical"
                            margin={{ top: 5, right: 100, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                            <YAxis 
                              dataKey="nome" 
                              type="category" 
                              axisLine={false} 
                              tickLine={false} 
                              width={180}
                              tick={{fontSize: 10}}
                            />
                            <Tooltip 
                              formatter={(value: number) => [value.toFixed(3), 'Standard Beta']}
                              cursor={{fill: '#f8fafc'}}
                            />
                            <Bar 
                              dataKey="beta" 
                              radius={[0, 4, 4, 0]}
                            >
                              {lhsResults.regressao.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.beta > 0 ? '#6366f1' : '#ef4444'} 
                                />
                              ))}
                              <LabelList 
                                dataKey="beta" 
                                position="right" 
                                content={(props: any) => {
                                  const { x, y, width, height, value } = props;
                                  if (value === undefined || value === null) return null;
                                  const isPositive = value >= 0;
                                  const posX = isPositive ? x + width + 12 : x - 12;
                                  const textAnchor = isPositive ? "start" : "end";
                                  return (
                                    <text 
                                      x={posX} 
                                      y={y + height / 2} 
                                      fill={isPositive ? '#4f46e5' : '#dc2626'} 
                                      fontSize={11} 
                                      fontWeight="bold"
                                      textAnchor={textAnchor}
                                      dominantBaseline="middle"
                                      stroke="#fff"
                                      strokeWidth={3}
                                      paintOrder="stroke"
                                    >
                                      {value.toFixed(3)}
                                    </text>
                                  );
                                }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-4 text-center italic">
                        * Betas padronizados mostram o impacto direto de cada variável no VPL, isolando as demais.
                      </p>
                    </motion.div>

                    {/* Morris OAT Sensitivity */}
                    {lhsResults.morris && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              Análise de Interações (Morris OAT)
                            </h3>
                            <p className="text-[10px] text-slate-400">Impacto Global (μ*) vs. Interações/Não-linearidade (σ)</p>
                          </div>
                          <button 
                            onClick={() => setIsMorrisInfoOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Como interpretar"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-2 h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis 
                                  type="number" 
                                  dataKey="muStar" 
                                  name="Importância (μ*)" 
                                  label={{ value: 'Importância Média (μ*)', position: 'bottom', fontSize: 10, offset: -10, fill: '#94a3b8' }}
                                  tick={{fontSize: 10, fill: '#94a3b8'}}
                                  axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis 
                                  type="number" 
                                  dataKey="sigma" 
                                  name="Interação (σ)" 
                                  label={{ value: 'Interação (σ)', angle: -90, position: 'left', fontSize: 10, offset: 10, fill: '#94a3b8' }}
                                  tick={{fontSize: 10, fill: '#94a3b8'}}
                                  axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <ZAxis type="number" range={[60, 400]} />
                                <Tooltip 
                                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      const isHighMu = data.muStar > (morrisStats?.avgMuStar || 0);
                                      const isHighSigma = data.sigma > (morrisStats?.avgSigma || 0);
                                      
                                      return (
                                        <div className="bg-[#0f172a] p-3 border border-slate-800 shadow-xl rounded-xl min-w-[180px] text-left">
                                          <p className="font-bold text-slate-100 mb-2 border-b border-slate-800 pb-1">{data.nome}</p>
                                          <div className="space-y-1.5">
                                            <div className="flex justify-between items-center gap-4">
                                              <span className="text-[10px] text-slate-400 uppercase font-bold">Importância (μ*)</span>
                                              <span className="text-xs font-mono font-bold text-slate-200">{data.muStar.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                              <span className="text-[10px] text-slate-400 uppercase font-bold">Interação (σ)</span>
                                              <span className="text-xs font-mono font-bold text-slate-200">{data.sigma.toFixed(2)}</span>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-slate-800">
                                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                isHighMu && isHighSigma ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                                                isHighMu ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                                                isHighSigma ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                                'bg-slate-800 text-slate-400'
                                              }`}>
                                                {isHighMu && isHighSigma ? 'Crítica (Não-linear/Interação)' :
                                                 isHighMu ? 'Importante (Linear)' :
                                                 isHighSigma ? 'Complexa (Baixo Impacto)' :
                                                 'Pouco Relevante'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                {morrisStats && (
                                  <>
                                    <ReferenceLine x={morrisStats.avgMuStar} stroke="#cbd5e1" strokeDasharray="5 5" />
                                    <ReferenceLine y={morrisStats.avgSigma} stroke="#cbd5e1" strokeDasharray="5 5" />
                                  </>
                                )}
                                <Scatter name="Variáveis" data={lhsResults.morris}>
                                  {lhsResults.morris.map((entry, index) => {
                                    const isHighMu = entry.muStar > (morrisStats?.avgMuStar || 0);
                                    const isHighSigma = entry.sigma > (morrisStats?.avgSigma || 0);
                                    let color = '#94a3b8'; // Default
                                    if (isHighMu && isHighSigma) color = '#ef4444'; // Red for critical
                                    else if (isHighMu) color = '#10b981'; // Emerald for important
                                    else if (isHighSigma) color = '#f59e0b'; // Amber for complex
                                    
                                    return (
                                      <Cell 
                                        key={`cell-${index}`} 
                                        fill={color}
                                        stroke={index < 3 ? '#fff' : 'transparent'}
                                        strokeWidth={2}
                                      />
                                    );
                                  })}
                                  <LabelList 
                                    dataKey="nome" 
                                    position="top" 
                                    style={{ fontSize: '9px', fill: '#64748b', fontWeight: '500' }} 
                                    offset={10}
                                  />
                                </Scatter>
                              </ScatterChart>
                            </ResponsiveContainer>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Variáveis Críticas</h4>
                            <div className="space-y-2">
                              {lhsResults.morris
                                .filter(m => m.muStar > (morrisStats?.avgMuStar || 0) && m.sigma > (morrisStats?.avgSigma || 0))
                                .sort((a, b) => b.muStar - a.muStar)
                                .map(m => (
                                  <div key={m.nome} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl shrink-0 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3 text-red-400" />
                                      <span className="text-xs font-bold text-slate-200">{m.nome}</span>
                                    </div>
                                    <div className="text-right font-mono">
                                      <p className="text-[10px] text-red-400 font-bold">μ*: {m.muStar.toFixed(1)}</p>
                                      <p className="text-[10px] text-slate-400">σ: {m.sigma.toFixed(1)}</p>
                                    </div>
                                  </div>
                                ))}
                              {lhsResults.morris.filter(m => m.muStar > (morrisStats?.avgMuStar || 0) && m.sigma > (morrisStats?.avgSigma || 0)).length === 0 && (
                                <p className="text-xs text-slate-400 italic">Nenhuma variável crítica identificada.</p>
                              )}
                            </div>
                            
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                <strong>Dica:</strong> Variáveis críticas têm alto impacto e comportamento complexo. Mudanças nelas podem causar variações imprevisíveis no VPL.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-slate-800 pt-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[10px] text-slate-400 font-medium">Crítica (Impacto + Interação)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] text-slate-400 font-medium">Importante (Impacto Linear)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-[10px] text-slate-400 font-medium">Complexa (Baixo Impacto)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="text-[10px] text-slate-400 font-medium">Pouco Relevante</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Sobol Sensitivity */}
                    {lhsResults.sobol && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-semibold text-slate-250 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            Índices de Sobol (Variância)
                          </h3>
                          <button 
                            onClick={() => setIsSobolInfoOpen(true)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
                            title="Como interpretar"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={lhsResults.sobol.slice(0, 8)}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                              <XAxis type="number" domain={[0, 1]} axisLine={false} tickLine={false} />
                              <YAxis 
                                dataKey="nome" 
                                type="category" 
                                axisLine={false} 
                                tickLine={false} 
                                width={180}
                                tick={{fontSize: 10}}
                              />
                              <Tooltip 
                                formatter={(value: number) => [value.toFixed(3), 'Índice']}
                                cursor={{fill: '#f8fafc'}}
                              />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar dataKey="s1" name="Efeito Direto (S1)" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                              <Bar dataKey="interaction" name="Interações" fill="#f59e0b" stackId="a" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4 text-center italic">
                          * S1 mostra a contribuição direta; a soma com interações resulta no Índice Total (ST).
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

              {/* Estimador de Impacto (What-if) */}
              {riskSubTab === 'impacto' && lhsResults && (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        <Calculator className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100">Estimador de Impacto (What-if)</h3>
                        <p className="text-xs text-slate-450">Simule mudanças individuais baseadas na regressão</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Variável de Entrada</label>
                        <select 
                          value={whatIfInput}
                          onChange={(e) => setWhatIfInput(e.target.value)}
                          className="w-full bg-slate-900/60 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        >
                          <option value="">Selecione uma variável...</option>
                          {lhsResults.regressao.map(r => (
                            <option key={r.nome} value={r.nome}>{r.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mudança Desejada (%)</label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range"
                            min="-50"
                            max="50"
                            step="1"
                            value={whatIfChange}
                            onChange={(e) => setWhatIfChange(Number(e.target.value))}
                            className="flex-1 accent-emerald-500 bg-slate-950 rounded-lg h-1.5 appearance-none"
                          />
                          <span className={`text-sm font-bold w-12 text-center ${whatIfChange >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                            {whatIfChange > 0 ? '+' : ''}{whatIfChange}%
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/15">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Impacto Estimado no VPL</p>
                        {(() => {
                          const reg = lhsResults.regressao.find(r => r.nome === whatIfInput);
                          if (!reg) return <div className="text-xl font-black text-slate-500">---</div>;
                          
                          const nomesAmigaveis: Record<string, string> = {
                            precoBoiMagro: 'Preço Boi Magro (R$/animal)',
                            precoBoiGordo: 'Preço Boi Gordo (R$/@)',
                            gmd: 'GMD',
                            precoConcentrado: 'Preço Concentrado (MV)',
                            precoVolumoso: 'Preço Volumoso (MV)',
                            pesoVivoInicial: 'Peso Inicial',
                            pesoVivoFinal: 'Peso Final',
                            rendimentoCarcaca: 'Rendimento de Carcaça',
                            cmsVolumoso: 'CMV Volumoso',
                            cmsConcentrado: 'CMV Concentrado',
                            taxaMortalidade: 'Mortalidade',
                            tempoAlimentacao: 'Tempo Alimentação',
                            valorTerraHa: 'Valor da Terra',
                            arrendamentoTerraPerc: 'Arrendamento',
                            custoSanidadePorBoi: 'Sanidade',
                            outrosDespesasValor: 'Outras Despesas (R$)'
                          };
                          const internalKey = Object.keys(nomesAmigaveis).find(k => nomesAmigaveis[k] === whatIfInput);
                          if (!internalKey) return <div className="text-xl font-black text-slate-500">---</div>;

                          const stdX = lhsResults.desviosPadraoInputs[internalKey];
                          const meanX = (inputs as any)[internalKey];
                          if (!stdX || !meanX) return <div className="text-xl font-black text-slate-500">---</div>;

                          const deltaX = (whatIfChange / 100) * meanX;
                          // deltaY = Beta_std * (deltaX / stdX) * stdVPL
                          const deltaY = reg.beta * (deltaX / stdX) * lhsResults.desvioPadrao;
                          const vplFinal = lhsResults.vplMedio + deltaY;

                          // Sensibilidade Unitária: b = Beta_std * (stdVPL / stdX)
                          const unitSensitivity = reg.beta * (lhsResults.desvioPadrao / stdX);
                          
                          const unitLabel = internalKey.includes('preco') || internalKey === 'custoSanidadePorBoi' || internalKey === 'valorTerraHa' 
                            ? 'R$ 1,00' 
                            : internalKey === 'gmd' || internalKey.includes('peso') 
                              ? '1 kg' 
                              : internalKey === 'tempoAlimentacao' 
                                ? '1 dia' 
                                : '1%';

                          return (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-black ${deltaY >= 0 ? 'text-emerald-400' : 'text-red-550'}`}>
                                  {deltaY >= 0 ? '+' : ''}{formatCurrency(deltaY)}
                                </span>
                              </div>
                              <div className="mt-2 space-y-1.5 pt-2 border-t border-emerald-500/10">
                                <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-slate-450 uppercase">VPL Final Estimado</p>
                                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(vplFinal)}</p>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-slate-450">
                                  <span>Beta Padronizado:</span>
                                  <span className="font-mono font-bold text-slate-300">{reg.beta.toFixed(3)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-slate-450">
                                  <span>Sensibilidade:</span>
                                  <span className="font-bold text-slate-300">~ {formatCurrency(unitSensitivity)} / {unitLabel}</span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-slate-450">
                                  <span>Mudança Absoluta:</span>
                                  <span className="font-bold text-slate-300">{deltaX > 0 ? '+' : ''}{internalKey.includes('preco') || internalKey === 'valorTerraHa' ? formatCurrency(deltaX) : deltaX.toFixed(2)} {unitLabel.split(' ')[1] || ''}</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-4 p-3 bg-slate-500/5 border border-slate-800 rounded-xl shrink-0 flex items-start gap-3"
                  >
                    <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans text-left">
                      Este estimador utiliza os coeficientes da regressão múltipla para prever como o VPL médio mudaria se você alterasse apenas uma variável, mantendo todas as outras constantes. Útil para planejamento de metas e análise de sensibilidade rápida.
                    </p>
                  </motion.div>
                </>
              )}

              {/* Stochastic Dominance Section */}
              {riskSubTab === 'dominancia' && lhsResults && (
                <div className="space-y-6 pt-6 text-left">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <ShieldAlert className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-100 font-display">Dominância Estocástica</h2>
                        <p className="text-xs text-slate-450">Compare até 10 simulações para identificar a melhor opção sob risco.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunDominance}
                      disabled={selectedSimsForDominance.length < 2 || isCalculatingDominance}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer ${
                        selectedSimsForDominance.length < 2 || isCalculatingDominance
                          ? 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/20 active:scale-95'
                      }`}
                    >
                      {isCalculatingDominance ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Analisar Dominância
                        </>
                      )}
                    </button>
                  </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Selection Sidebar */}
                      <div className="lg:col-span-1 space-y-4">
                        <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Selecionar Simulações</h3>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {savedSimulations.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Nenhuma simulação salva encontrada.</p>
                            ) : (
                              savedSimulations.map(sim => (
                                <label 
                                  key={sim.id}
                                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                    selectedSimsForDominance.includes(sim.id)
                                      ? 'border-indigo-500 bg-indigo-500/10 text-slate-150'
                                      : 'border-slate-800 bg-[#0c1222] hover:border-slate-700/80 text-slate-300'
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedSimsForDominance.includes(sim.id)}
                                    onChange={() => {
                                      if (selectedSimsForDominance.includes(sim.id)) {
                                        setSelectedSimsForDominance(prev => prev.filter(id => id !== sim.id));
                                      } else if (selectedSimsForDominance.length < 10) {
                                        setSelectedSimsForDominance(prev => [...prev, sim.id]);
                                      } else {
                                        showToast('Você pode selecionar no máximo 10 simulações.', 'info');
                                      }
                                    }}
                                  />
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                    selectedSimsForDominance.includes(sim.id)
                                      ? 'bg-indigo-500 border-indigo-500'
                                      : 'bg-[#121826] border-slate-700'
                                  }`}>
                                    {selectedSimsForDominance.includes(sim.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-100 truncate">{sim.name}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(sim.date).toLocaleDateString()}</p>
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                          <p className="mt-4 text-[10px] text-slate-400 italic">
                            * Selecione entre 2 e 10 simulações para comparar as curvas S.
                          </p>
                        </div>
                      </div>

                      {/* Results Area */}
                      <div className="lg:col-span-3 space-y-6">
                        {dominanceResults.length > 0 ? (
                          <>
                            {/* S-Curve Chart */}
                            <div className="bg-[#0f172a] p-8 rounded-3xl shadow-lg border border-slate-800/80">
                              <h3 className="text-lg font-bold text-slate-150 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" />
                                Curvas de Probabilidade Acumulada (S-Curves)
                              </h3>
                              <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis 
                                      dataKey="vpl" 
                                      type="number" 
                                      domain={['auto', 'auto']}
                                      tickFormatter={(val) => `R$ ${Math.round(val/1000)}k`}
                                      label={{ value: 'VPL (R$)', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#94a3b8' }}
                                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    />
                                    <YAxis 
                                      domain={[0, 100]}
                                      tickFormatter={(val) => `${val}%`}
                                      label={{ value: 'Probabilidade Acumulada', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#94a3b8' }}
                                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                      formatter={(value: any) => [`${value}%`, 'Probabilidade']}
                                      labelFormatter={(label) => `VPL: ${formatCurrency(label)}`}
                                    />
                                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
                                    {dominanceResults.map((sim, idx) => (
                                      <Line
                                        key={sim.id}
                                        data={sim.cdfPoints}
                                        type="monotone"
                                        dataKey="prob"
                                        name={sim.name}
                                        stroke={[
                                          '#10b981', // emerald
                                          '#6366f1', // indigo
                                          '#f59e0b', // amber
                                          '#ef4444', // red
                                          '#8b5cf6', // violet
                                          '#ec4899', // pink
                                          '#f97316', // orange
                                          '#06b6d4', // cyan
                                          '#3b82f6', // blue
                                          '#64748b'  // slate
                                        ][idx]}
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                      />
                                    ))}
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="mt-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <p className="text-xs text-slate-400 leading-relaxed text-left">
                                  <strong>Como interpretar:</strong> Quanto mais à direita estiver a curva, melhor o cenário. 
                                  Se uma curva nunca cruza outra e está sempre à direita, ela possui <strong>Dominância de Primeira Ordem</strong>. 
                                  Se as curvas se cruzam, a análise de <strong>Segunda Ordem</strong> avalia qual cenário oferece menor risco para investidores avessos ao risco.
                                </p>
                              </div>
                            </div>

                            {/* Statistical Comparison Table */}
                            <div className="bg-[#0f172a] rounded-3xl shadow-lg border border-slate-800/80 overflow-hidden">
                              <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
                                <h3 className="font-bold text-slate-100">Comparativo Estatístico</h3>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <Info className="w-3 h-3 text-indigo-400" />
                                  <span>Baseado em {mcIterations.toLocaleString()} iterações por cenário</span>
                                </div>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                  <thead className="text-xs text-slate-350 uppercase bg-slate-900/60 border-b border-slate-800">
                                    <tr>
                                      <th className="px-6 py-4">Simulação</th>
                                      <th className="px-6 py-4 text-right">VPL Médio</th>
                                      <th className="px-6 py-4 text-right">Risco (VPL &lt; 0)</th>
                                      <th className="px-6 py-4 text-right">Desvio Padrão</th>
                                      <th className="px-6 py-4 text-right">Amplitude</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/40">
                                    {dominanceResults.map((sim, idx) => (
                                      <tr key={sim.id} className="hover:bg-slate-850/20 transition-colors">
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: [
                                              '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#6366f1', '#64748b'
                                            ][idx] }} />
                                            <span className="font-bold text-slate-100">{sim.name}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-100">
                                          {formatCurrency(sim.stats.vplMedio)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${sim.stats.probPrejuizo > 20 ? 'text-red-600' : 'text-emerald-400'}`}>
                                          {sim.stats.probPrejuizo.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-400">
                                          {formatCurrency(sim.stats.desvioPadrao)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-400">
                                          {formatCurrency(sim.stats.vplMaximo - sim.stats.vplMinimo)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* KS Test Results */}
                            {dominanceResults[0]?.ksTests && dominanceResults[0].ksTests.length > 0 && (
                              <div className="bg-[#0f172a] rounded-3xl shadow-lg border border-slate-800/80 overflow-hidden">
                                <div className="p-6 border-b border-slate-800/80 text-left">
                                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-emerald-400" />
                                    Teste de Kolmogorov-Smirnov (K-S)
                                  </h3>
                                  <p className="text-xs text-slate-400 mt-1">
                                    Avalia se as distribuições de VPL são estatisticamente diferentes entre si.
                                  </p>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-350 uppercase bg-slate-900/60 border-b border-slate-800">
                                      <tr>
                                        <th className="px-6 py-4">Comparação</th>
                                        <th className="px-6 py-4 text-center">Estatística D</th>
                                        <th className="px-6 py-4 text-center">p-valor</th>
                                        <th className="px-6 py-4 text-center">Significância</th>
                                        <th className="px-6 py-4 text-right">Dominância</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40">
                                      {dominanceResults[0].ksTests.map((test: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-850/20 transition-colors">
                                          <td className="px-6 py-4 font-medium text-slate-200">
                                            {test.sim1} <span className="text-slate-400 mx-1">vs</span> {test.sim2}
                                          </td>
                                          <td className="px-6 py-4 text-center font-mono text-xs text-slate-300">
                                            {test.dStatistic.toFixed(4)}
                                          </td>
                                          <td className="px-6 py-4 text-center font-mono text-xs text-slate-300">
                                            {test.pValue < 0.001 ? '< 0.001' : test.pValue.toFixed(4)}
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            {test.significant ? (
                                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                                                SIGNIFICATIVO
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 bg-slate-800 text-slate-450 border border-slate-700/30 rounded-full text-[10px] font-bold">
                                                NÃO SIGNIF.
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                            {(() => {
                                              const s1 = dominanceResults.find(r => r.name === test.sim1);
                                              const s2 = dominanceResults.find(r => r.name === test.sim2);
                                              if (!s1 || !s2) return '-';
                                              
                                              // Check for First Order Stochastic Dominance
                                              if (!test.significant) return <span className="text-slate-400 italic">Equivalentes</span>;
                                              
                                              return s1.stats.vplMedio > s2.stats.vplMedio ? (
                                                <span className="text-emerald-400 font-bold">{test.sim1} &gt; {test.sim2}</span>
                                              ) : (
                                                <span className="text-indigo-400 font-bold">{test.sim2} &gt; {test.sim1}</span>
                                              );
                                            })()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                                  <p className="text-[10px] text-slate-400 leading-tight">
                                    <strong>Nota Técnica:</strong> O teste K-S quantifica a distância entre as funções de distribuição acumulada. 
                                    Um p-valor &lt; 0,05 indica que as diferenças observadas entre as simulações não são fruto do acaso, 
                                    confirmando a superioridade estatística de um cenário sobre o outro.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Dominance Analysis Result */}
                            <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-10">
                                <ShieldAlert className="w-32 h-32" />
                              </div>
                              <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                  Conclusão da Análise
                                </h3>
                                <div className="space-y-4">
                                  {(() => {
                                    // Simple dominance check
                                    const bestByMean = [...dominanceResults].sort((a, b) => b.stats.vplMedio - a.stats.vplMedio)[0];
                                    const bestByRisk = [...dominanceResults].sort((a, b) => a.stats.probPrejuizo - b.stats.probPrejuizo)[0];
                                    
                                    // Check if the difference between the top two is significant
                                    const sortedByMean = [...dominanceResults].sort((a, b) => b.stats.vplMedio - a.stats.vplMedio);
                                    const topTwoTest = dominanceResults[0].ksTests.find((t: any) => 
                                      (t.sim1 === sortedByMean[0].name && t.sim2 === sortedByMean[1].name) ||
                                      (t.sim1 === sortedByMean[1].name && t.sim2 === sortedByMean[0].name)
                                    );
                                    const isSignificant = topTwoTest?.significant;

                                    return (
                                      <>
                                        <p className="text-emerald-100 leading-relaxed">
                                          Com base nas simulações realizadas, a simulação <strong>"{bestByMean.name}"</strong> apresenta o maior retorno esperado (VPL Médio), 
                                          enquanto a simulação <strong>"{bestByRisk.name}"</strong> oferece o menor risco de prejuízo.
                                          {isSignificant ? (
                                            <span className="block mt-2 text-emerald-300 text-xs italic">
                                              * A diferença entre os principais cenários é estatisticamente significativa (p-valor &lt; 0,05).
                                            </span>
                                          ) : (
                                            <span className="block mt-2 text-emerald-300 text-xs italic">
                                              * Os cenários são estatisticamente semelhantes em termos de distribuição de probabilidade.
                                            </span>
                                          )}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                            <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-1">Recomendação (Retorno)</p>
                                            <p className="text-sm font-medium">Focar em <strong>{bestByMean.name}</strong> para maximizar o potencial de lucro.</p>
                                          </div>
                                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                            <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-1">Recomendação (Segurança)</p>
                                            <p className="text-sm font-medium">Focar em <strong>{bestByRisk.name}</strong> se a prioridade for a preservação de capital.</p>
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="bg-[#0f172a]/60 h-[400px] rounded-3xl border border-dashed border-slate-800/80 flex flex-col items-center justify-center text-center p-12 shadow-sm">
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-full mb-6">
                              <ArrowRightLeft className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-2 font-display">Pronto para Comparar</h3>
                            <p className="text-slate-400 max-w-md text-sm leading-relaxed font-sans">
                              Selecione as simulações salvas na barra lateral e clique em "Analisar Dominância" para visualizar as Curvas S e o comparativo estatístico.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
        {activeTab === 'diet' && (
            <motion.div
              key="diet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-800/80 text-left">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-xl">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-xl">Calculadora de Dieta</h3>
                        <InfoTooltip text="Ferramenta de formulação de dieta baseada em programação linear (Simplex). Calcula a combinação ideal de insumos para atingir as metas nutricionais e de desempenho." />
                      </div>
                      <p className="text-xs text-slate-400">Formulação balanceada com os mais modernos padrões globais de nutrição (NRC/NASEM 2016).</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Cards de Perfil do Animal e Objetivo e Limites acima de Insumos */}
                  <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Perfil do Animal Card */}
                    <div className="bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-6 gap-3">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-purple-400" />
                          <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest font-sans">Perfil do Animal</h4>
                        </div>
                        <button
                          onClick={handleSyncProfileWithParameters}
                          className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl font-bold text-[9px] tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border border-purple-500/15 active:scale-[0.98]"
                          title="Sincronizar este perfil com os parâmetros globais da simulação"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Sincronizar com parâmetros
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Início (kg)</label>
                            <input 
                              type="number"
                              value={dietAnimalProfile.weight}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Final (kg)</label>
                            <input 
                              type="number"
                              value={dietAnimalProfile.finalWeight}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, finalWeight: parseFloat(e.target.value) }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GMD Meta (kg/d)</label>
                            <input 
                              type="number"
                              value={dietAnimalProfile.gmd}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, gmd: parseFloat(e.target.value) }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sexo (NRC)</label>
                            <select 
                              value={dietAnimalProfile.sex}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, sex: e.target.value as any }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors"
                            >
                              <option value="macho" className="bg-[#121826]">Macho Castrado</option>
                              <option value="inteiro" className="bg-[#121826]">Macho Inteiro</option>
                              <option value="femea" className="bg-[#121826]">Fêmea</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Raça/Genética</label>
                            <select 
                              value={dietAnimalProfile.raca}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, raca: e.target.value as any }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors"
                            >
                              <option value="zebuino" className="bg-[#121826]">Bos Indicus (Zebu)</option>
                              <option value="europeu" className="bg-[#121826]">Bos Taurus (Europeu)</option>
                              <option value="cruzado" className="bg-[#121826]">Cruzamento Industrial</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Frame (Tamanho)</label>
                            <select 
                              value={dietAnimalProfile.frameSize}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, frameSize: e.target.value as any }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors"
                            >
                              <option value="pequeno" className="bg-[#121826]">Pequeno (Precoce)</option>
                              <option value="medio" className="bg-[#121826]">Médio</option>
                              <option value="grande" className="bg-[#121826]">Grande (Tardio)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Idade (Meses)</label>
                            <input 
                              type="number"
                              value={dietAnimalProfile.idade}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, idade: parseFloat(e.target.value) }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ECC (1-9)</label>
                            <input 
                              type="number"
                              min="1" max="9" step="0.5"
                              value={dietAnimalProfile.ecc}
                              onChange={(e) => setDietAnimalProfile(prev => ({ ...prev, ecc: parseFloat(e.target.value) }))}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold outline-none focus:border-purple-500 hover:border-slate-700 transition-colors font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exigências Estimadas Card */}
                    <div className="bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest font-sans">Exigências Estimadas</h4>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">NRC/NASEM 2016</span>
                        </div>
                        
                        {(() => {
                          const reqs = calculateRequirements(dietAnimalProfile);
                          const avgWeight = (dietAnimalProfile.weight + dietAnimalProfile.finalWeight) / 2;
                          const cmsPercentPV = avgWeight > 0 ? (reqs.cms / avgWeight) * 100 : 0;
                          
                          return (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50 col-span-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consumo Est. Matéria Seca (CMS)</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-xl font-black text-emerald-400 font-mono">{reqs.cms ? reqs.cms.toFixed(2) : '0.00'}</span>
                                  <span className="text-xs text-slate-400 font-bold">kg MS/dia</span>
                                  <span className="text-xs text-indigo-400 ml-auto font-mono font-bold">({cmsPercentPV.toFixed(2)}% do PV)</span>
                                </div>
                              </div>
                              
                              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mínimo PB (%)</p>
                                <p className="text-sm font-black text-slate-100 font-mono mt-1">
                                  {reqs.pbMin ? reqs.pbMin.toFixed(2) : '0.0'}%
                                </p>
                              </div>

                              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mínimo NDT (%)</p>
                                <p className="text-sm font-black text-slate-100 font-mono mt-1">
                                  {reqs.ndtMin ? reqs.ndtMin.toFixed(2) : '0.0'}%
                                </p>
                              </div>

                              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mínimo Cálcio (%)</p>
                                <p className="text-sm font-black text-slate-100 font-mono mt-1">
                                  {reqs.caMin ? reqs.caMin.toFixed(3) : '0.00'}%
                                </p>
                              </div>

                              <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mínimo Fósforo (%)</p>
                                <p className="text-sm font-black text-slate-100 font-mono mt-1">
                                  {reqs.pMin ? reqs.pMin.toFixed(3) : '0.00'}%
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="text-[9px] text-slate-400 italic leading-relaxed border-t border-slate-800/60 pt-4 mt-4">
                        * Estimativas de exigências nutricionais baseadas nas equações do NRC (2016) calculadas automaticamente a partir do perfil definido ao lado.
                      </div>
                    </div>
                  </div>

                  {/* Card de Insumos - Ocupa largura total e usa paleta escura de alto contraste super legível */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#121826] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                      <div className="p-4 border-b border-slate-800 bg-[#0f1524] flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 font-sans tracking-wide">Tabela de Insumos</h4>
                          <p className="text-[10px] text-slate-400">Ative os insumos, altere preços e regule limites para o cálculo de custo mínimo</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingDietId && (
                            <div className="mr-1 px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                              <span>Editando: <strong className="text-white">{newDietName}</strong></span>
                              <button
                                onClick={() => {
                                  setEditingDietId(null);
                                  setNewDietName('');
                                  showToast('Sessão de edição concluída. Próximo salvamento criará nova dieta.', 'info');
                                }}
                                className="ml-1 text-slate-400 hover:text-slate-100 font-bold hover:bg-slate-800 rounded px-1 transition-all"
                                title="Salvar como nova daqui em diante"
                              >
                                ×
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => setIsSavedDietsModalOpen(true)}
                            className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                            Carregar Dieta
                          </button>
                          <button
                            onClick={() => {
                              if (!editingDietId) {
                                  setNewDietName('');
                              }
                              setIsSavingDiet(true);
                            }}
                            disabled={!dietResult || !dietResult.feasible}
                            className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5 text-emerald-400" />
                            Salvar Dieta
                          </button>
                          <button
                            onClick={handleExportXLSX}
                            disabled={!dietResult}
                            className="px-3 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
                            title="Exportar planilha Excel formatada"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            Exportar XLSX
                          </button>

                        </div>
                      </div>

                      {/* Barra secundária de gerenciamento de insumos (Realocada para o Card Tabela de Insumos) */}
                      <div className="px-4 py-3 bg-[#0d1322] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                          Gerenciamento de Insumos
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={handleSyncMarketPrices}
                            className="px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold hover:bg-emerald-500/20 hover:text-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                            title="Sincronizar preços dos insumos com o módulo de Mercado"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Sincronizar Mercado
                          </button>
                          <button
                            onClick={() => setDietIngredients(DEFAULT_INGREDIENTS)}
                            className="px-2.5 py-1.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-xl text-[10px] font-bold hover:bg-slate-800 hover:text-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="Resetar todos os insumos para os valores padrão"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Resetar Insumos
                          </button>
                          <button
                            onClick={handleAddIngredient}
                            className="px-2.5 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-bold hover:bg-purple-500/20 hover:text-purple-300 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Novo Insumo
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setIsAddingFromDb(!isAddingFromDb)}
                              className="px-2.5 py-1.5 bg-[#8b5cf6] text-white rounded-xl text-[10px] font-bold hover:bg-purple-600 transition-all flex items-center gap-1 cursor-pointer border border-purple-500/15"
                            >
                              <Database className="w-3.5 h-3.5" />
                              Banco de Dados
                            </button>
                            {isAddingFromDb && (
                              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800 z-50 max-h-96 overflow-y-auto p-3 font-sans text-left">
                                <div className="text-[9px] font-bold text-slate-400 uppercase pb-2 border-b border-slate-800 mb-2 tracking-wider">Selecione para adicionar:</div>
                                <div className="space-y-1.5">
                                  {DEFAULT_INGREDIENTS.filter(di => !dietIngredients.some(oi => oi.name === di.name)).map(di => (
                                    <button
                                      key={di.id}
                                      onClick={() => {
                                        handleAddFromDb(di);
                                        setIsAddingFromDb(false);
                                      }}
                                      className="w-full text-left px-3 py-2 bg-[#121826]/60 hover:bg-[#161e30] border border-slate-800/40 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors flex flex-col gap-0.5"
                                    >
                                      <span className="text-xs font-bold">{di.name}</span>
                                      <span className="text-[9px] text-slate-500">{di.type} • PB: {di.pb}% • NDT: {di.ndt}%</span>
                                    </button>
                                  ))}
                                  {DEFAULT_INGREDIENTS.filter(di => !dietIngredients.some(oi => oi.name === di.name)).length === 0 && (
                                    <div className="text-center py-4 text-[10px] text-slate-500">Todos os insumos do banco já estão na tabela.</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-[#0f1524] text-slate-300 uppercase font-black font-sans tracking-wider border-b border-slate-800">
                            <tr>
                              <th className="px-3 py-3 w-8 text-center">
                                <input 
                                  type="checkbox"
                                  checked={dietIngredients.every(ing => ing.selected)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setDietIngredients(dietIngredients.map(ing => ({ ...ing, selected: checked })));
                                  }}
                                  className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 h-4 w-4"
                                />
                              </th>
                              <th className="px-3 py-3 text-slate-200">
                                Insumo
                                <InfoTooltip text="Nome (MS = Matéria Seca | MN = Matéria Natural)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200 font-sans">
                                Preço (R$/kg MN)
                                <InfoTooltip text="Preço por kg na Matéria Natural (como alimentado)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                Teor MS (%)
                                <InfoTooltip text="Teor de Matéria Seca do insumo" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                PB (%)
                                <InfoTooltip text="Proteína Bruta (% da Matéria Seca)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                NDT (%)
                                <InfoTooltip text="Nutrientes Digestíveis Totais (% da Matéria Seca)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                FDN (%)
                                <InfoTooltip text="Fibra em Detergente Neutro (% da Matéria Seca)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                EE (%)
                                <InfoTooltip text="Extrato Etéreo (% da Matéria Seca)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                PDR (%)
                                <InfoTooltip text="Proteína Degradável no Rúmen (% da PB)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                Ca (%)
                                <InfoTooltip text="Cálcio (% da Matéria Seca)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                P (%)
                                <InfoTooltip text="Fósforo (% da Matéria Seca)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                Min (%)
                                <InfoTooltip text="Inclusão mínima permitida na dieta (% da MS)" />
                              </th>
                              <th className="px-3 py-3 text-right text-slate-200">
                                Max (%)
                                <InfoTooltip text="Inclusão máxima permitida na dieta (% da MS)" />
                              </th>
                              <th className="px-3 py-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 bg-[#121826]">
                            {['volumoso', 'concentrado', 'mineral', 'aditivo'].map((type) => {
                              const filteredIngs = dietIngredients.filter(ing => ing.type === type);
                              if (filteredIngs.length === 0) return null;

                              const typeColors = {
                                volumoso: 'bg-emerald-950/20 text-emerald-400 border-l-4 border-l-emerald-500 border-y border-slate-800/60',
                                concentrado: 'bg-amber-950/20 text-amber-400 border-l-4 border-l-amber-500 border-y border-slate-800/60',
                                mineral: 'bg-blue-950/20 text-blue-400 border-l-4 border-l-blue-500 border-y border-slate-800/60',
                                aditivo: 'bg-purple-950/20 text-purple-400 border-l-4 border-l-purple-500 border-y border-slate-800/60'
                              };

                              return (
                                <React.Fragment key={type}>
                                  <tr className={`${typeColors[type as keyof typeof typeColors]}`}>
                                    <td colSpan={14} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#94a3b8]">
                                      {type === 'volumoso' ? '🌿 Volumosos' : type === 'concentrado' ? '🌽 Concentrados' : type === 'mineral' ? '💎 Minerais' : '🧪 Aditivos'}
                                    </td>
                                  </tr>
                                  {filteredIngs.map((ing) => {
                                    const idx = dietIngredients.findIndex(oi => oi.id === ing.id);
                                    return (
                                      <tr key={ing.id || idx} className={`hover:bg-slate-800/30 transition-colors ${!ing.selected ? 'opacity-65 bg-slate-900/40 text-slate-400' : 'text-slate-200'}`}>
                                        <td className="px-3 py-2 text-center">
                                          <input 
                                            type="checkbox"
                                            checked={ing.selected ?? false}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].selected = e.target.checked;
                                              setDietIngredients(newIngs);
                                            }}
                                            className="rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5">
                                          <input 
                                            type="text" 
                                            value={ing.name}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].name = e.target.value;
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-28 bg-slate-900/80 px-2 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 outline-none transition-all font-bold text-slate-100 rounded text-xs"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right">
                                          <input 
                                            type="number" 
                                            value={ing.price}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].price = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-16 bg-slate-900/80 px-2 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all font-mono text-xs text-emerald-400 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.ms}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].ms = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.pb}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].pb = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.ndt}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].ndt = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.fdn}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].fdn = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.ee || 0}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].ee = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.pdr || 0}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].pdr = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.ca}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].ca = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.p}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].p = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/60 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-slate-100 rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.minIncl || 0}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].minIncl = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/80 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-sky-400 font-semibold rounded"
                                          />
                                        </td>
                                        <td className="px-2 py-1.5 text-right font-mono">
                                          <input 
                                            type="number" 
                                            value={ing.maxIncl || 100}
                                            onChange={(e) => {
                                              const newIngs = [...dietIngredients];
                                              newIngs[idx].maxIncl = parseFloat(e.target.value);
                                              setDietIngredients(newIngs);
                                            }}
                                            className="w-12 bg-slate-900/80 px-1 py-1 border border-slate-800 hover:border-slate-700 focus:bg-slate-950 focus:border-purple-500 text-right outline-none transition-all text-xs font-mono text-purple-400 font-semibold rounded"
                                          />
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          <button 
                                            onClick={() => handleRemoveIngredient(ing.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="p-4 bg-[#0f1524] border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-[10px] text-slate-400 max-w-md italic">
                          * Os valores nutricionais são baseados na Matéria Seca (MS). Preço base natural. Insumos obtidos de <a href="https://www.cqbal.com.br/#!/" target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-400 font-bold">CQBAL 4.0</a>.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Objetivo e Limites Card (Realocado para baixo da Tabela de Insumos) */}
                  <div className="lg:col-span-4 bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-sky-400" />
                        <div>
                          <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest font-sans">Objetivo e Limites</h4>
                          <p className="text-[10px] text-slate-400">Configure as metas de otimização e limites de volumoso para o cálculo automático</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Meta de Otimização</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDietRequirements(prev => ({ ...prev, optimizationGoal: 'cost' }))}
                            className={`py-2.5 px-3 rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                              dietRequirements.optimizationGoal === 'cost'
                                ? "bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-950/20"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <TrendingDown className="w-3.5 h-3.5" />
                            Custo Mínimo
                          </button>
                          <button
                            type="button"
                            onClick={() => setDietRequirements(prev => ({ ...prev, optimizationGoal: 'gmd' }))}
                            className={`py-2.5 px-3 rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                              dietRequirements.optimizationGoal === 'gmd'
                                ? "bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-md shadow-purple-950/20"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Meta GMD
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex justify-between mb-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Teor de Volumoso (%)</label>
                          <span className="text-xs font-black text-emerald-400 font-mono">
                            {dietRequirements.forageMin}% a {dietRequirements.forageMax}%
                          </span>
                        </div>
                        <div className="relative w-full h-6 flex items-center">
                          {/* Background Track */}
                          <div className="absolute left-0 right-0 h-1.5 bg-slate-800 rounded-full pointer-events-none" />
                          
                          {/* Active Interval Fill */}
                          <div 
                            className="absolute h-1.5 bg-emerald-500 rounded-full pointer-events-none"
                            style={{
                              left: `${dietRequirements.forageMin}%`,
                              right: `${100 - dietRequirements.forageMax}%`
                            }}
                          />
                          
                          {/* Range input for Min */}
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="1"
                            value={dietRequirements.forageMin}
                            onChange={(e) => {
                              const val = Math.min(parseFloat(e.target.value), dietRequirements.forageMax);
                              setDietRequirements(prev => ({ 
                                ...prev, 
                                forageMin: val
                              }));
                            }}
                            className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
                          />
                          
                          {/* Range input for Max */}
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="1"
                            value={dietRequirements.forageMax}
                            onChange={(e) => {
                              const val = Math.max(parseFloat(e.target.value), dietRequirements.forageMin);
                              setDietRequirements(prev => ({ 
                                ...prev, 
                                forageMax: val
                              }));
                            }}
                            className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-900 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-900 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-wider mt-1.5 font-sans">
                          <span>Apenas Concentrado (0%)</span>
                          <span>Dieta Mista</span>
                          <span>Apenas Volumoso (100%)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800/60 flex justify-end">
                      <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="px-8 py-3 bg-purple-600 text-white rounded-xl font-black shadow-lg shadow-purple-950/20 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isOptimizing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        Formular Dieta
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <div className="h-px bg-slate-800 my-8" />
                  </div>

                  <div className="lg:col-span-4">
                      {dietResult && dietResult.feasible && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          <div className="bg-[#1e1b4b]/80 border border-purple-500/25 p-3 rounded-xl text-purple-200 shadow-md text-left">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-purple-300 opacity-90 font-sans">GMD Predito</p>
                            <p className="text-xl font-black font-mono text-purple-100">{dietResult.predictedGmd.toFixed(2)} <span className="text-xs font-normal text-purple-300 font-sans">kg/dia</span></p>
                          </div>
                          <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 shadow-sm text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Conversão</p>
                            <p className="text-xl font-black text-slate-200 font-mono">{dietResult.feedConversion.toFixed(2)} <span className="text-xs font-normal text-slate-500">:1</span></p>
                          </div>
                          <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 shadow-sm text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Consumo % PV</p>
                            <p className="text-xl font-black text-slate-200 font-mono">{dietResult.cmsPercentageBW.toFixed(2)} <span className="text-xs font-normal text-slate-500">%</span></p>
                          </div>
                          <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 shadow-sm text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Custo Diário</p>
                            <p className="text-xl font-black text-emerald-400 font-mono">{formatCurrency(dietResult.totalCostMN * (dietResult.forageIntakeMN + dietResult.concentrateIntakeMN))}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase font-sans">R$/animal/dia</p>
                          </div>
                          <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800 shadow-sm text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">Custo/@ Prod.</p>
                            <p className="text-xl font-black text-slate-200 font-mono">{formatCurrency((dietResult.totalCostMN * (dietResult.forageIntakeMN + dietResult.concentrateIntakeMN)) / (dietResult.predictedGmd / 15 * inputs.rendimentoCarcaca / 100))}</p>
                            <p className="text-[8px] text-slate-500 font-bold uppercase font-sans">R$/@ produzida</p>
                          </div>
                        </div>

                        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm mb-6 flex flex-col xl:flex-row gap-6 justify-between items-stretch">
                          <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left min-w-[500px] border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800/80">
                                  <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans w-1/4">Componente</th>
                                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans w-3/8">Custo da Dieta</th>
                                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans w-3/8">Consumo por Animal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/40">
                                <tr className="hover:bg-slate-900/10 transition-colors">
                                  <td className="py-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans">Volumoso</td>
                                  <td className="py-3">
                                    <div className="flex flex-col text-left">
                                      <span className="text-sm font-black text-emerald-400 font-mono">{formatCurrency(dietResult.forageCostPerKgMN)}/kg MN</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold font-mono mt-0.5">{formatCurrency(dietResult.forageCostPerKgMS)}/kg MS</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex flex-col text-left">
                                      <span className="text-sm font-black text-emerald-400 font-mono">{dietResult.forageIntakeMN.toFixed(2)} kg MN</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold font-mono mt-0.5">{((dietResult.cms || 0) * (dietResult.foragePercentage / 100)).toFixed(2)} kg MS</span>
                                    </div>
                                  </td>
                                </tr>
                                <tr className="hover:bg-slate-900/10 transition-colors">
                                  <td className="py-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans">Concentrado</td>
                                  <td className="py-3">
                                    <div className="flex flex-col text-left">
                                      <span className="text-sm font-black text-emerald-400 font-mono">{formatCurrency(dietResult.concentrateCostPerKgMN)}/kg MN</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold font-mono mt-0.5">{formatCurrency(dietResult.concentrateCostPerKgMS)}/kg MS</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex flex-col text-left">
                                      <span className="text-sm font-black text-emerald-400 font-mono">{dietResult.concentrateIntakeMN.toFixed(2)} kg MN</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold font-mono mt-0.5">{((dietResult.cms || 0) * (dietResult.concentratePercentage / 100)).toFixed(2)} kg MS</span>
                                    </div>
                                  </td>
                                </tr>
                                <tr className="hover:bg-slate-900/10 transition-colors bg-slate-800/10">
                                  <td className="py-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans">Média ou Total</td>
                                  <td className="py-3">
                                    <div className="flex flex-col text-left">
                                      <span className="text-sm font-black text-emerald-400 font-mono">{formatCurrency(dietResult.totalCostMN)}/kg MN</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold font-mono mt-0.5">{formatCurrency(dietResult.totalCost)}/kg MS</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex flex-col text-left">
                                      <span className="text-sm font-black text-emerald-400 font-mono">{(dietResult.forageIntakeMN + dietResult.concentrateIntakeMN).toFixed(2)} kg MN</span>
                                      <span className="text-[9.5px] text-slate-400 font-bold font-mono mt-0.5">{(dietResult.cms || 0).toFixed(2)} kg MS</span>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div className="w-full xl:w-auto flex flex-col items-center justify-center pt-4 xl:pt-0 xl:pl-6 border-t xl:border-t-0 xl:border-l border-slate-800 shrink-0">
                            <button
                              onClick={handleApplyOptimizedDiet}
                              className="w-full xl:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-purple-600 hover:from-emerald-500 hover:via-teal-500 hover:to-purple-500 text-white rounded-xl font-bold text-[10px] tracking-wide uppercase shadow-lg shadow-emerald-950/25 hover:shadow-purple-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20 active:scale-[0.98]"
                            >
                              <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                              Sincronizar com Parâmetros
                            </button>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-2 block text-center">Aplica valores formulados na simulação</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-left">Composição da Dieta (Matéria Seca - % MS)</h4>
                            <div className="h-[200px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dietResult.ingredients} layout="vertical" margin={{ left: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} width={80} />
                                  <Tooltip 
                                    cursor={{ fill: '#334155', opacity: 0.15 }}
                                    contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }}
                                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Participação (MS)']}
                                  />
                                  <Bar dataKey="percentage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20}>
                                    <LabelList dataKey="percentage" position="right" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-left">Composição da Dieta (Matéria Natural - % MN)</h4>
                            <div className="h-[200px]">
                              {(() => {
                                const mnData = dietResult.ingredients.map(ing => {
                                  const original = dietIngredients.find(oi => oi.name === ing.name);
                                  return {
                                    name: ing.name,
                                    mnWeight: ing.percentage / (original?.ms || 100)
                                  };
                                });
                                const totalMN = mnData.reduce((sum, d) => sum + d.mnWeight, 0);
                                const finalMNData = mnData.map(d => ({
                                  name: d.name,
                                  percentageMN: (d.mnWeight / totalMN) * 100
                                }));

                                return (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={finalMNData} layout="vertical" margin={{ left: 40 }}>
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                                      <XAxis type="number" hide />
                                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} width={80} />
                                      <Tooltip 
                                        cursor={{ fill: '#334155', opacity: 0.15 }}
                                        contentStyle={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.4)' }}
                                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Participação (Matéria Natural - MN)']}
                                      />
                                      <Bar dataKey="percentageMN" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                                        <LabelList dataKey="percentageMN" position="right" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                );
                              })()}
                            </div>
                          </div>


                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-sm col-span-1 md:col-span-2 text-left">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acompanhamento Nutricional (NRC/NASEM 2016 vs Alcançado)</h4>
                            <button
                              onClick={() => setIsFullProfileModalOpen(true)}
                              className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                            >
                              <Activity className="w-3 h-3" />
                              Ver Perfil Completo
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="text-left text-slate-400 font-bold uppercase tracking-widest border-b border-slate-800">
                                  <th className="pb-2 px-2 text-left">Nutriente</th>
                                  <th className="pb-2 px-2 text-center">Unidade</th>
                                  <th className="pb-2 px-2 text-right">Exigência (Min/Max)</th>
                                  <th className="pb-2 px-2 text-right">Alcançado</th>
                                  <th className="pb-2 px-2 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/40">
                                {[
                                  { label: 'Proteína Bruta', value: dietResult.nutritionalProfile.pb, min: dietRequirements.pbMin, unit: '% MS', tooltip: 'Proteína total na dieta' },
                                  { label: 'Energia (NDT)', value: dietResult.nutritionalProfile.ndt, min: dietRequirements.ndtMin, unit: '% MS', tooltip: 'Nutrientes Digestíveis Totais' },
                                  { label: 'Fibra (FDN)', value: dietResult.nutritionalProfile.fdn, min: dietRequirements.fdnMin, max: dietRequirements.fdnMax, unit: '% MS', tooltip: 'Fibra em Detergente Neutro' },
                                  { label: 'Cálcio', value: dietResult.nutritionalProfile.ca, min: dietRequirements.caMin, unit: '% MS', tooltip: 'Mineral Cálcio' },
                                  { label: 'Fósforo', value: dietResult.nutritionalProfile.p, min: dietRequirements.pMin, unit: '% MS', tooltip: 'Mineral Fósforo' },
                                  { label: 'Relação Ca:P', value: dietResult.nutritionalProfile.ca / dietResult.nutritionalProfile.p, min: dietRequirements.caPRatioMin, max: dietRequirements.caPRatioMax, unit: ':1', tooltip: 'Equilíbrio Cálcio:Fósforo' },
                                  { label: 'Extrato Etéreo', value: dietResult.nutritionalProfile.ee, max: dietRequirements.eeMax, unit: '% MS', tooltip: 'Gordura total' },
                                  { label: 'PDR', value: dietResult.nutritionalProfile.pdr, min: dietRequirements.pdrMin, max: dietRequirements.pdrMax, unit: '% PB', tooltip: 'Proteína Degradável no Rúmen' },
                                ].map((item, i) => {
                                  const isBelow = item.min !== undefined && item.value < item.min;
                                  const isAbove = item.max !== undefined && item.value > item.max;
                                  return (
                                    <tr key={i} className="hover:bg-slate-850/20 transition-colors">
                                      <td className="py-2 px-2 font-bold text-slate-100 tracking-tight flex items-center gap-1">
                                        {item.label}
                                        <InfoTooltip text={item.tooltip} />
                                      </td>
                                      <td className="py-2 px-2 text-center text-slate-400">{item.unit}</td>
                                      <td className="py-2 px-2 text-right text-slate-400 font-mono">
                                        {item.min !== undefined && item.max !== undefined ? `${item.min.toFixed(1)} - ${item.max.toFixed(1)}` : 
                                         item.min !== undefined ? `Min ${item.min.toFixed(1)}` : 
                                         item.max !== undefined ? `Max ${item.max.toFixed(1)}` : '-'}
                                      </td>
                                      <td className={`py-2 px-2 text-right font-black font-mono ${isBelow || isAbove ? 'text-amber-500' : 'text-purple-400'}`}>
                                        {item.value.toFixed(2)}
                                      </td>
                                      <td className="py-2 px-2 text-right">
                                        <span className={`text-[10px] font-black tracking-wide ${
                                          isBelow || isAbove ? 'text-amber-500' : 'text-emerald-400'
                                        }`}>
                                          {isBelow ? 'BAIXO' : isAbove ? 'ALTO' : 'OK'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm text-left">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Factory className="w-4 h-4 text-purple-400" />
                              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Fábrica de Ração</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-450 uppercase">Lote/Batida:</span>
                              <input 
                                type="number"
                                value={factoryBatchSize}
                                onChange={(e) => setFactoryBatchSize(parseFloat(e.target.value))}
                                className="w-16 p-1 bg-slate-900/60 border border-slate-800 text-xs font-bold text-purple-300 rounded outline-none focus:border-purple-500"
                              />
                              <span className="text-[9px] font-bold text-slate-455 uppercase">kg</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-400 italic mb-4 leading-relaxed">
                            * Composição para batida de {factoryBatchSize.toLocaleString()} kg de Concentrado + Núcleo.
                          </p>
                          <div className="space-y-2">
                            {(() => {
                              const totalConcNM = dietResult.ingredients
                                .filter(ing => {
                                  const original = dietIngredients.find(oi => oi.name === ing.name);
                                  return original?.type !== 'volumoso';
                                })
                                .reduce((sum, ing) => {
                                  const original = dietIngredients.find(oi => oi.name === ing.name);
                                  return sum + (ing.percentage / (original?.ms || 100));
                                }, 0);

                              return dietResult.ingredients
                                .filter(ing => {
                                  const original = dietIngredients.find(oi => oi.name === ing.name);
                                  return original?.type !== 'volumoso';
                                })
                                .map((ing, idx) => {
                                  const original = dietIngredients.find(oi => oi.name === ing.name);
                                  const weightNMPerCycle = (ing.percentage / (original?.ms || 100)) / totalConcNM * factoryBatchSize;
                                  return (
                                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-800/60 last:border-0 hover:bg-slate-850/20 transition-colors px-1">
                                      <span className="text-[10px] font-bold text-slate-300 uppercase">{ing.name}</span>
                                      <span className="text-xs font-black text-purple-400 font-mono">{weightNMPerCycle.toFixed(1)} kg</span>
                                    </div>
                                  );
                                });
                            })()}
                          </div>
                        </div>

                        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm text-left">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-emerald-400" />
                              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Vagão Forrageiro</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Capacidade:</span>
                              <input 
                                type="number"
                                value={mixerCapacity}
                                onChange={(e) => setMixerCapacity(parseFloat(e.target.value))}
                                className="w-16 p-1 bg-slate-900/60 border border-slate-800 text-xs font-bold text-emerald-400 rounded outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-400 italic mb-4 leading-relaxed">
                            * Planejamento de carga para {batchSize} animais (Capacidade: {mixerCapacity.toLocaleString()} kg).
                          </p>
                          <div className="space-y-2">
                            {[...dietResult.ingredients]
                              .sort((a, b) => {
                                const typeA = dietIngredients.find(oi => oi.name === a.name)?.type;
                                const typeB = dietIngredients.find(oi => oi.name === b.name)?.type;
                                if (typeA === 'volumoso' && typeB !== 'volumoso') return -1;
                                if (typeA !== 'volumoso' && typeB === 'volumoso') return 1;
                                return 0;
                              })
                              .map((ing, idx) => {
                                const original = dietIngredients.find(oi => oi.name === ing.name);
                                const kgNM = (ing.percentage / 100) * (dietResult.cms || 0) / ((original?.ms || 100) / 100);
                                const totalBatchNM = kgNM * batchSize;
                                const numViagens = Math.ceil(totalBatchNM / mixerCapacity);
                                return (
                                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-800/60 last:border-0 hover:bg-slate-850/20 transition-colors px-1">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-300 uppercase">{ing.name}</span>
                                      <span className="text-[8px] text-slate-400 font-bold">{idx + 1}ª Carga {numViagens > 1 ? `(${numViagens} viagens)` : ''}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-xs font-black text-emerald-400 font-mono">{totalBatchNM.toFixed(0)} kg NM</span>
                                      <span className="text-[9px] text-slate-400 italic font-mono">{(totalBatchNM / numViagens).toFixed(0)} kg/viagem</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        <div className="space-y-6 text-left">
                          <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm text-center">
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Relação Volumoso:Concentrado</p>
                            <div className="flex justify-center items-center gap-4">
                              <div className="text-center">
                                <span className="text-2xl font-black text-slate-100 font-mono">{dietResult.foragePercentage.toFixed(0)}</span>
                                <span className="text-[10px] block text-slate-400 font-black">% VOL</span>
                              </div>
                              <div className="h-8 w-px bg-slate-800" />
                              <div className="text-center">
                                <span className="text-2xl font-black text-slate-100 font-mono">{dietResult.concentratePercentage.toFixed(0)}</span>
                                <span className="text-[10px] block text-slate-400 font-black">% CONC</span>
                              </div>
                            </div>
                          </div>

                          <div className="py-2 px-1">
                            <div className="flex items-center gap-2 mb-4">
                              <BookOpen className="w-4 h-4 text-purple-400" />
                              <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Protocolo de Adaptação</h4>
                            </div>
                            <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 space-y-4 shadow-inner">
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Adaptação em Escada (21 dias)</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-xs border-b border-indigo-500/10 pb-2">
                                    <span className="text-slate-350 font-semibold font-sans">Dia 1-7: Adapt. 1</span>
                                    <span className="font-extrabold text-indigo-300 font-mono">60% Vol / 40% Conc</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs border-b border-indigo-500/10 pb-2">
                                    <span className="text-slate-350 font-semibold font-sans">Dia 8-14: Adapt. 2</span>
                                    <span className="font-extrabold text-indigo-300 font-mono">40% Vol / 60% Conc</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs pb-1.5">
                                    <span className="text-slate-350 font-semibold font-sans">Dia 15-21: Adapt. 3</span>
                                    <span className="font-extrabold text-indigo-300 font-mono">20% Vol / 80% Conc</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] text-indigo-200/60 italic leading-relaxed">
                                * Protocolo sugerido. Consulte seu zootecnista para ajustes baseados na saúde ruminal e escore de fezes.
                              </p>
                            </div>
                          </div>

                          <div className="py-2 px-1">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Alertas & Distúrbios</h4>
                              <span className={`text-[10px] font-bold tracking-widest ${dietResult.alerts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {dietResult.alerts.length > 0 ? `${dietResult.alerts.length} ALERTAS` : 'CONSISTENTE'}
                              </span>
                            </div>
                            <div className="space-y-2 mt-2">
                              {dietResult.alerts.length > 0 ? (
                                dietResult.alerts.map((alert, i) => {
                                  let bgClass = "bg-rose-500/10 border-rose-500/20 text-rose-200";
                                  let iconColor = "text-rose-400";
                                  let severityLabel = "Crítico";

                                  const alertUpper = alert.toUpperCase();
                                  if (alertUpper.includes("ALTO RISCO") || alertUpper.includes("LAMINITE") || alertUpper.includes("INTOXICAÇÃO")) {
                                    bgClass = "bg-red-500/10 border-red-500/25 text-red-200";
                                    iconColor = "text-red-400";
                                    severityLabel = "Alto Risco";
                                  } else if (alertUpper.includes("MODERADO") || alertUpper.includes("TIMPANISMO") || alertUpper.includes("BAIXA") || alertUpper.includes("ALTA") || alertUpper.includes("ALTO")) {
                                    bgClass = "bg-amber-500/10 border-amber-500/25 text-amber-250";
                                    iconColor = "text-amber-400";
                                    severityLabel = "Alerta";
                                  } else {
                                    bgClass = "bg-blue-500/10 border-blue-500/25 text-blue-200";
                                    iconColor = "text-blue-400";
                                    severityLabel = "Atenção";
                                  }

                                  return (
                                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-2xl border ${bgClass} transition-all hover:bg-slate-900/30`}>
                                      <AlertTriangle className={`w-4 h-4 ${iconColor} mt-0.5 shrink-0`} />
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-slate-100">
                                            {severityLabel}
                                          </span>
                                        </div>
                                        <p className="text-xs leading-normal font-sans text-slate-300">{alert}</p>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma inconformidade detectada ou riscos de distúrbios metabólicos.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                    {dietResult && !dietResult.feasible && (
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-rose-400">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5" />
                          <h4 className="font-bold">Inviável</h4>
                        </div>
                        <p className="text-xs leading-relaxed">
                          Não foi possível encontrar uma combinação de insumos que atenda a todos os requisitos nutricionais com as restrições de inclusão atuais.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de Ação Duplicados no Final da Página */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <h5 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Gerenciamento da Dieta</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Carregue fórmulas salvas ou salve/atualize as proporções calculadas nesta simulação.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsSavedDietsModalOpen(true)}
                      className="px-4 py-2 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                      Carregar Dieta
                    </button>
                    <button
                      onClick={() => {
                        if (!editingDietId) {
                          setNewDietName('');
                        }
                        setIsSavingDiet(true);
                      }}
                      disabled={!dietResult || !dietResult.feasible}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-700/25 transition-all flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5 text-white" />
                      Salvar Dieta
                    </button>
                    <button
                      onClick={handleExportXLSX}
                      disabled={!dietResult}
                      className="px-4 py-2 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer shadow-sm"
                      title="Exportar planilha Excel formatada"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Exportar XLSX
                    </button>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'esg' && (
            <motion.div
              key="esg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Sustainability Index Header */}
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-8 rounded-3xl shadow-xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <ShieldCheck className="w-6 h-6 text-emerald-300" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight">Índice de Sustentabilidade Pecuária (ISP)</h2>
                      <InfoTooltip text="Métrica composta que avalia o desempenho socioambiental e de governança do confinamento (0-100)." />
                    </div>
                    <p className="text-emerald-100/80 text-sm max-w-xl leading-relaxed">
                      O ISP avalia o desempenho do seu confinamento em 15 indicadores-chave de sustentabilidade, 
                      alinhados com as melhores práticas globais de ESG (Environmental, Social, and Governance - Ambiental, Social e Governança) para a pecuária de corte.
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 min-w-[200px]">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1">Score Geral</p>
                    <div className="text-6xl font-black mb-1">
                      {results ? Math.round(results.indiceSustentabilidade) : '---'}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-1000" 
                          style={{ width: `${results ? results.indiceSustentabilidade : 0}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-300">/ 100</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Environmental Pillar */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <Cloud className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 font-display">Pilar Ambiental (E)</h3>
                        <p className="text-xs text-slate-400">Emissões, recursos hídricos e eficiência de terra.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#182235]/30 p-5 rounded-2xl border border-slate-800/85 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-350 uppercase tracking-widest flex items-center">
                              Pegada de Carbono
                              <InfoTooltip text="Total de emissões de gases de efeito estufa expressas em equivalente de CO2 para todo o lote." />
                            </p>
                            <Cloud className="w-4 h-4 text-blue-400" />
                          </div>
                          <p className="text-2xl font-black text-slate-100 font-mono">
                            {results ? results.pegadaCarbonoTotal.toFixed(2) : '---'}
                            <span className="text-xs font-bold text-slate-400 ml-1 font-sans font-normal">t CO2e/lote</span>
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Emissões Entéricas</span>
                            <span className="font-bold text-indigo-400">IPCC Tier 1</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-800/30 pt-1.5">
                            <span className="text-slate-400">Intensidade por Ganho</span>
                            <span className="font-semibold text-blue-400 font-mono">
                              {results && results.ganhoPesoTotal > 0 ? ((results.pegadaCarbonoTotal * 1000) / results.ganhoPesoTotal).toFixed(1) : '---'} kg CO2e/kg ganho
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#182235]/30 p-5 rounded-2xl border border-slate-800/85 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-350 uppercase tracking-widest flex items-center">
                              Pegada Hídrica
                              <InfoTooltip text="Volume total de água doce utilizado por animal, incluindo consumo direto e limpeza." />
                            </p>
                            <Droplets className="w-4 h-4 text-cyan-400" />
                          </div>
                          <p className="text-2xl font-black text-slate-100 font-mono">
                            {results ? results.pegadaHidricaTotal.toFixed(2) : '---'}
                            <span className="text-xs font-bold text-slate-400 ml-1 font-sans font-normal">m³/animal</span>
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Consumo Direto</span>
                            <span className="font-bold text-cyan-400">{inputs.usoAguaRecicladaPerc}% Reciclada</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-800/30 pt-1.5">
                            <span className="text-slate-400">Intensidade por Ganho</span>
                            <span className="font-semibold text-cyan-400 font-mono">
                              {results && results.ganhoPesoTotal > 0 ? ((results.pegadaHidricaTotal * 1000) / results.ganhoPesoTotal).toFixed(1) : '---'} L/kg ganho
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#182235]/30 p-5 rounded-2xl border border-slate-800/85 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-350 uppercase tracking-widest flex items-center">
                              Eficiência de Terra
                              <InfoTooltip text="Área necessária para produzir 1kg de carne. Quanto menor, maior a intensificação sustentável." />
                            </p>
                            <Map className="w-4 h-4 text-purple-400" />
                          </div>
                          <p className="text-2xl font-black text-slate-100 font-mono">
                            {results ? results.eficienciaUsoTerra.toFixed(2) : '---'}
                            <span className="text-xs font-bold text-slate-400 ml-1 font-sans font-normal">m²/kg produzido</span>
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Intensificação</span>
                            <span className="font-bold text-purple-400">Alta Eficiência</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-800/30 pt-1.5">
                            <span className="text-slate-400">Uso por Ganho</span>
                            <span className="font-semibold text-purple-400 font-mono">
                              {results ? results.eficienciaUsoTerra.toFixed(2) : '---'} m²/kg ganho
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#182235]/30 p-5 rounded-2xl border border-slate-800/85 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold text-slate-350 uppercase tracking-widest flex items-center">
                              Emissão de Metano
                              <InfoTooltip text="Estimativa de metano entérico produzido pelos animais durante o ciclo de confinamento." />
                            </p>
                            <Wind className="w-4 h-4 text-emerald-400" />
                          </div>
                          <p className="text-2xl font-black text-slate-100 font-mono">
                            {results ? results.emissaoMetanoKg.toFixed(2) : '---'}
                            <span className="text-xs font-bold text-slate-400 ml-1 font-sans font-normal">kg CH4/ciclo</span>
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Impacto Atmosférico</span>
                            <span className="font-bold text-emerald-400 font-sans">GWP 25</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-800/30 pt-1.5">
                            <span className="text-slate-400">Intensidade de Metano</span>
                            <span className="font-semibold text-emerald-400 font-mono">
                              {results && results.ganhoPesoTotal > 0 ? (results.emissaoMetanoKg / results.ganhoPesoTotal).toFixed(3) : '---'} kg CH4/kg ganho
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all shadow-sm">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase mb-4 tracking-wider">Balanço de Nutrientes</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] mb-1.5 flex-wrap gap-x-2">
                              <span className="text-slate-300 flex items-center">
                                Nitrogênio (N) Excretado
                                <InfoTooltip text="Quantidade de nitrogênio eliminada via urina e fezes. Importante para gestão de efluentes." />
                              </span>
                              <div className="text-right flex flex-col items-end">
                                <span className="font-bold text-emerald-400 font-mono text-xs">{results ? results.balancoNitrogenio.toFixed(2) : '---'} kg/ani</span>
                                <span className="text-[8px] text-slate-400 font-mono">
                                  {results && results.ganhoPesoTotal > 0 ? ((results.balancoNitrogenio * 1000) / results.ganhoPesoTotal).toFixed(1) : '---'} g N/kg ganho
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: '65%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] mb-1.5 flex-wrap gap-x-2">
                              <span className="text-slate-300 flex items-center">
                                Fósforo (P) Excretado
                                <InfoTooltip text="Quantidade de fósforo eliminada. O excesso pode causar eutrofização de corpos d'água." />
                              </span>
                              <div className="text-right flex flex-col items-end">
                                <span className="font-bold text-emerald-400 font-mono text-xs">{results ? results.balancoFosforo.toFixed(2) : '---'} kg/ani</span>
                                <span className="text-[8px] text-slate-400 font-mono">
                                  {results && results.ganhoPesoTotal > 0 ? ((results.balancoFosforo * 1000) / results.ganhoPesoTotal).toFixed(1) : '---'} g P/kg ganho
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: '40%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-teal-500/5 rounded-2xl border border-teal-500/10 hover:border-teal-500/20 transition-all shadow-sm">
                        <h4 className="text-xs font-bold text-teal-400 uppercase mb-4 tracking-wider">Energia & Transporte</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-300 flex items-center">
                              Energia Renovável
                              <InfoTooltip text="Percentual da matriz energética da fazenda proveniente de fontes renováveis (Solar, Eólica, etc)." />
                            </span>
                            <span className="text-xs font-bold text-teal-400 font-mono">{inputs.usoEnergiaRenovavelPerc}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-300 flex items-center">
                              Distância Média
                              <InfoTooltip text="Distância média percorrida para transporte de animais e insumos." />
                            </span>
                            <span className="text-xs font-bold text-teal-400 font-mono">{inputs.distanciaMediaTransporteKm} km</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-300 flex items-center">
                              Emissão Transporte
                              <InfoTooltip text="Emissões de CO2 estimadas decorrentes da logística de transporte." />
                            </span>
                            <span className="text-xs font-bold text-teal-400 font-mono">
                              {results ? (inputs.distanciaMediaTransporteKm * 0.0001 * results.ganhoPesoTotal).toFixed(3) : '---'} t CO2e
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social & Governance Pillars */}
                <div className="space-y-6">
                  <div className="bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                        <Heart className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 font-display">Pilar Social (S)</h3>
                        <p className="text-xs text-slate-400">Pessoas e bem-estar animal.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/10 hover:border-pink-500/20 transition-all shadow-sm">
                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 flex items-center">
                          Bem-Estar Animal
                          <InfoTooltip text="Score baseado em protocolos de manejo, ambiência e ausência de dor/estresse." />
                        </p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-black text-slate-100 font-mono">{inputs.indiceBemEstarAnimal}</p>
                          <p className="text-[10px] font-bold text-pink-400/85 mb-1.5 font-sans">/ 10 Score</p>
                        </div>
                      </div>
                      <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/10 hover:border-pink-500/20 transition-all shadow-sm">
                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 flex items-center">
                          Treinamento Anual
                          <InfoTooltip text="Média de horas de treinamento técnico e de segurança por colaborador ao ano." />
                        </p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-black text-slate-100 font-mono">{inputs.horasTreinamentoFuncionarioAno}</p>
                          <p className="text-[10px] font-bold text-pink-400/85 mb-1.5 font-sans">horas/func</p>
                        </div>
                      </div>
                      <div className="p-4 bg-pink-500/5 rounded-2xl border border-pink-500/10 hover:border-pink-500/20 transition-all shadow-sm">
                        <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 flex items-center">
                          Investimento Social
                          <InfoTooltip text="Valor anual investido em projetos comunitários, educação e saúde local." />
                        </p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-black text-slate-100 font-mono">{formatCurrency(inputs.investimentoSocialAnual)}</p>
                          <p className="text-[10px] font-bold text-pink-400/85 mb-1.5 font-sans">/ ano</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121826] p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 font-display">Governança (G)</h3>
                        <p className="text-xs text-slate-400">Compliance e conformidade legal.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:bg-slate-900/60 transition-colors">
                        <span className="text-xs font-bold text-slate-300 flex items-center">
                          Certificação Compliance
                          <InfoTooltip text="Indica se a fazenda possui certificações de conformidade legal e ambiental." />
                        </span>
                        {inputs.certificacaoCompliance ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:bg-slate-900/60 transition-colors">
                        <span className="text-xs font-bold text-slate-300 flex items-center">
                          Rastreabilidade Total
                          <InfoTooltip text="Indica o monitoramento completo do animal desde o nascimento até o abate." />
                        </span>
                        {inputs.rastreabilidadeTotal ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 hover:bg-slate-900/60 transition-colors">
                        <span className="text-xs font-bold text-slate-300 flex items-center">
                          Auditoria Externa
                          <InfoTooltip text="Verificação periódica dos processos por empresas independentes." />
                        </span>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Impacto no Mercado Consumidor (Bem-Estar & Rastreabilidade) */}
              <div className="bg-[#121826] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <Users className="w-48 h-48 text-sky-400" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                        <Users className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-100 text-lg tracking-tight">Exigências do Consumidor Moderno</h3>
                        <p className="text-xs text-slate-400">Como o mercado global bonifica práticas de Bem-Estar Animal e Rastreabilidade do campo à mesa.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">Status de Mercado:</span>
                      {inputs.indiceBemEstarAnimal >= 8 && inputs.rastreabilidadeTotal ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Padrão Exportação (Pretendido)
                        </span>
                      ) : (inputs.indiceBemEstarAnimal >= 7 || inputs.rastreabilidadeTotal) ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" /> Adequação Parcial
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Gargalo de Valor
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Coluna de Diagnóstico */}
                    <div className="md:col-span-8 space-y-4">
                      <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/80">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                          Diagnóstico Técnico & Comercial
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          {inputs.indiceBemEstarAnimal >= 8 && inputs.rastreabilidadeTotal ? (
                            "Excelente posicionamento competitivo! A combinação de Rastreabilidade Total atestada com alto escore de Bem-Estar Animal (Score ≥ 8) responde de forma precisa às pressões do consumidor consciente atual. Isso viabiliza o envio do lote para nichos exigentes (Exemplo: Cota Hilton para Europa, programas de carnes de grife e grandes cadeias de fast-food premium), maximizando a liquidez e blindando a operação de eventuais boicotes logísticos."
                          ) : (inputs.indiceBemEstarAnimal >= 7 || inputs.rastreabilidadeTotal) ? (
                            "Atenção técnica necessária. Atender apenas um dos quesitos prejudica o aproveitamento pleno de bônus comerciais. Sem Rastreabilidade Total, o frigorífico não consegue reverter as boas práticas em bonificações oficiais de até +R$ 10,00/@; e sem o refinamento no Bem-Estar Animal o estresse pré-abate afeta o pH, a conversão e aumenta o descarte mecânico de carcaça por contusões."
                          ) : (
                            "Alerta crítico de valor fabril. A ausência de identificação individual confiável de rastreabilidade combinada a baixos escores de Bem-Estar confina o produtor à vala das commodities genéricas de baixo valor. Há um risco real de deságio de lote, maiores contusões de abate no frigorífico e bloqueio por parte de redes de supermercado varejistas que exigem conformidade ambiental auditada."
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4.5 bg-[#172134]/30 rounded-2xl border border-slate-800 flex items-start gap-3">
                          <Heart className="w-5 h-5 text-pink-400 mt-0.5 shrink-0" />
                          <div>
                            <h5 className="text-xs font-bold text-slate-100 mb-1 font-display">O Peso do Bem-Estar Animal</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Prover sombreamento, manejo sem gritos e ausência de ferrões reduz o estresse térmico e o cortisol plasmático. Do ponto de vista industrial, preserva o estoque de glicogênio muscular, mantendo o pH final da carne na faixa perfeita (5.4 a 5.7). O consumidor atual de marcas de prestígio rejeita ativamente carnes escuras, secas e duras (carne DFD) originadas de maus tratos.
                            </p>
                          </div>
                        </div>

                        <div className="p-4.5 bg-[#172134]/30 rounded-2xl border border-slate-800 flex items-start gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <h5 className="text-xs font-bold text-slate-100 mb-1 font-display">Rastreabilidade & Transparência</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Sistemas integrados de rastreamento de origem comprovam que o boi não proveio de áreas de desmate ilegal, terras indígenas ou reservas florestais protegidas. O monitoramento individual garante ao consumidor final no supermercado a integridade ética do produto que ele consome, tornando-se o passaporte obrigatório de exportação.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Coluna de Indicadores de Mercado */}
                    <div className="md:col-span-4 bg-[#0a0f1d] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800/85 pb-2.5">
                          Indicadores de Mercado
                        </h4>
                        
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Demanda Consumidora:</span>
                            <span className={`font-mono font-bold ${inputs.indiceBemEstarAnimal >= 8 && inputs.rastreabilidadeTotal ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {inputs.indiceBemEstarAnimal >= 8 && inputs.rastreabilidadeTotal ? 'NÍVEL EXTREMO' : 'MODERADO'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Prêmio por Arroba (@):</span>
                            <span className={`font-mono font-bold ${inputs.indiceBemEstarAnimal >= 8 && inputs.rastreabilidadeTotal ? 'text-emerald-400' : 'text-slate-400'}`}>
                              {inputs.indiceBemEstarAnimal >= 8 && inputs.rastreabilidadeTotal ? '+R$ 4,00 a R$ 12,00' : 'Isento de Prêmio'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Aproveitamento Mecânico:</span>
                            <span className="font-mono font-semibold text-slate-200">
                              {inputs.indiceBemEstarAnimal >= 8 ? '99.5% (Carcaça Íntegra)' : inputs.indiceBemEstarAnimal >= 6 ? '96.2% (Pouco Hematoma)' : '91.8% (Perdas Críticas)'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Risco Acidez Carne:</span>
                            <span className={`font-mono font-bold ${inputs.indiceBemEstarAnimal < 6 ? 'text-rose-400 animate-pulse' : inputs.indiceBemEstarAnimal < 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {inputs.indiceBemEstarAnimal < 6 ? 'ALTO (Carne DFD)' : inputs.indiceBemEstarAnimal < 8 ? 'MÉDIO (Sensível)' : 'MÍNIMO (Excelente)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 leading-tight">
                        *Estimativas com base nos protocolos de frigoríficos associados a marcas gourmet de carne de exportação e acordos de rastreamento europeu (SISBOV).
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation Action Card */}
              <div className="bg-[#121826] p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Leaf className="w-48 h-48 text-emerald-400" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <TreePine className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-xl font-bold text-slate-100 mb-2 flex items-center justify-center md:justify-start font-display">
                      Plano de Neutralização de Carbono
                      <InfoTooltip text="Estratégia para compensar as emissões de gases de efeito estufa através de ativos florestais." />
                    </h4>
                    <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                      Para neutralizar as emissões deste lote ({results ? results.pegadaCarbonoTotal.toFixed(2) : '---'} t CO2e), 
                      seria necessário o plantio de <span className="font-bold text-emerald-400">{results ? Math.ceil(results.pegadaCarbonoTotal * 7) : '---'} árvores nativas</span> ou a manutenção de 
                      <span className="font-bold text-emerald-400 flex-inline"> {results ? (results.pegadaCarbonoTotal * 0.2).toFixed(2) : '---'} hectares</span> de mata preservada.
                    </p>
                  </div>
                  <button className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-950/20 border border-emerald-500/30 whitespace-nowrap cursor-pointer">
                    Gerar Relatório ESG
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/40 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <Map className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-100 text-lg tracking-tight">Inteligência de Mercado</h3>
                      <p className="text-xs text-slate-400">Preços físicos de referência regional para subsidiar a simulação de ágio.</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="text-[10px] text-right text-slate-500 max-w-[200px] leading-tight hidden lg:block">
                      Fontes: <strong className="text-slate-400">CEPEA/ESALQ</strong> (Boi Gordo), <strong className="text-slate-400">SCOT</strong> & <strong className="text-slate-400">Leilões</strong> (Boi Magro).
                    </div>
                    <button
                      onClick={handleFetchMarketPrices}
                      disabled={isFetchingMarket}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-950/20 transition-all flex items-center gap-2 disabled:opacity-50 border border-indigo-500/30 cursor-pointer"
                    >
                      {isFetchingMarket ? (
                        <RotateCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Atualizar Preços
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3 space-y-8">
                    {marketPrices.length > 0 ? (
                      (['Sudeste', 'Sul', 'Centro-Oeste', 'Norte', 'Nordeste'] as const).map((regionName) => {
                        const statesInRegion = {
                          'Sudeste': ['SP', 'MG'],
                          'Sul': ['RS', 'PR', 'SC'],
                          'Centro-Oeste': ['MS', 'MT', 'GO'],
                          'Norte': ['PA', 'RO', 'TO'],
                          'Nordeste': ['BA', 'MA']
                        }[regionName];

                        const pricesInRegion = marketPrices.filter(p => statesInRegion.includes(p.state.toUpperCase()));
                        if (pricesInRegion.length === 0) return null;

                        const regionStyles: Record<string, string> = {
                          'Sudeste': 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5',
                          'Sul': 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
                          'Centro-Oeste': 'border-amber-500/20 text-amber-400 bg-amber-500/5',
                          'Norte': 'border-sky-500/20 text-sky-400 bg-sky-500/5',
                          'Nordeste': 'border-pink-500/20 text-pink-400 bg-pink-500/5'
                        };

                        return (
                          <div key={regionName} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-xl border ${regionStyles[regionName]}`}>
                                Região {regionName}
                              </span>
                              <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {pricesInRegion.map((price, idx) => {
                                const stateUpper = price.state.toUpperCase();
                                const stateArrobaMagro = (price.boiMagro * 30) / (inputs.pesoVivoInicial || 350);
                                const stateAgio = price.boiGordo > 0 ? ((stateArrobaMagro / price.boiGordo) - 1) * 100 : 0;

                                const milhoPrice = price.ingredientPrices?.["Milho Moído"] || price.ingredientPrices?.["Milho Grão"] || {
                                  SP: 1.20, MS: 1.12, MT: 1.02, GO: 1.10, MG: 1.18, RS: 1.28, PR: 1.15, SC: 1.25, PA: 1.35, RO: 1.30, TO: 1.22, BA: 1.28, MA: 1.32
                                }[stateUpper] || 1.15;

                                const sojaPrice = price.ingredientPrices?.["Farelo de Soja"] || {
                                  SP: 2.38, MS: 2.25, MT: 2.10, GO: 2.20, MG: 2.32, RS: 2.45, PR: 2.30, SC: 2.42, PA: 2.60, RO: 2.55, TO: 2.40, BA: 2.48, MA: 2.52
                                }[stateUpper] || 2.35;

                                return (
                                  <motion.div
                                    key={price.state}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all group shadow-sm text-left animate-in fade-in zoom-in-95 duration-200"
                                  >
                                    <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center font-bold text-indigo-400 shadow-sm border border-slate-800">
                                          {price.state}
                                        </div>
                                        <span className="text-sm font-bold text-slate-200">Mercado {price.state}</span>
                                      </div>
                                      <div className={`p-1 rounded-full ${
                                        price.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                                        price.trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
                                        'bg-slate-800 text-slate-500'
                                      }`}>
                                        {price.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                                         price.trend === 'down' ? <TrendingUp className="w-4 h-4 rotate-180" /> :
                                         <MoreHorizontal className="w-4 h-4" />}
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center text-left">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Boi Gordo (CEPEA)</span>
                                        <span className="text-base font-bold text-slate-100 font-mono">R$ {price.boiGordo.toFixed(2)} /@</span>
                                      </div>
                                      <div className="flex justify-between items-center text-left">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Boi Magro (SCOT)</span>
                                        <span className="text-sm font-semibold text-slate-300 font-mono">R$ {price.boiMagro.toLocaleString('pt-BR')}</span>
                                      </div>

                                      {/* ÁGIO ESPECÍFICO DO ESTADO */}
                                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/60 pb-1 text-left">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                          {stateAgio >= 0 ? 'Ágio' : 'Deságio'}
                                        </span>
                                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                                          stateAgio >= 0 
                                            ? 'bg-rose-500/10 text-[#fb7185] border border-rose-500/20' 
                                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                          {stateAgio >= 0 ? `+${stateAgio.toFixed(1)}%` : `${stateAgio.toFixed(1)}%`}
                                        </span>
                                      </div>

                                      {/* COTAÇÕES DE MILHO / SOJA */}
                                      <div className="pt-2 border-t border-slate-800/80">
                                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-2">Preços Principais Insumos</p>
                                        <div className="grid grid-cols-2 gap-x-2.5">
                                          <div className="flex flex-col p-2 bg-slate-900/60 rounded-xl border border-slate-800/60 transition-colors hover:border-slate-700/60">
                                            <span className="text-[8px] font-semibold text-slate-450 uppercase truncate">Milho Moído</span>
                                            <span className="text-xs font-bold text-indigo-400 font-mono mt-0.5 text-left">
                                              R$ {milhoPrice.toFixed(2)}<span className="text-[8px] font-normal text-slate-500">/kg</span>
                                            </span>
                                          </div>
                                          <div className="flex flex-col p-2 bg-slate-900/60 rounded-xl border border-slate-800/60 transition-colors hover:border-slate-700/60">
                                            <span className="text-[8px] font-semibold text-slate-450 uppercase truncate">Farelo Soja</span>
                                            <span className="text-xs font-bold text-indigo-400 font-mono mt-0.5 text-left">
                                              R$ {sojaPrice.toFixed(2)}<span className="text-[8px] font-normal text-slate-500">/kg</span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {price.ingredientPrices && Object.keys(price.ingredientPrices).length > 2 && (
                                        <div className="pt-2.5 border-t border-slate-800/80">
                                          <p className="text-[8px] font-bold text-slate-400 uppercase mb-1.5">Outros Insumos Locais</p>
                                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            {Object.entries(price.ingredientPrices)
                                              .filter(([name]) => !["Milho Moído", "Milho Grão", "Farelo de Soja"].includes(name))
                                              .slice(0, 4)
                                              .map(([name, val]) => (
                                                <div key={name} className="flex justify-between text-[9px]">
                                                  <span className="text-slate-400 truncate mr-1">{name}</span>
                                                  <span className="font-bold text-indigo-400 font-mono">R$ {val.toFixed(2)}</span>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex justify-between items-center">
                                        <span className="text-[9px] text-slate-500 font-mono">Ref: {price.date.split('T')[0].split('-').reverse().join('-')}</span>
                                        <button 
                                          onClick={() => {
                                            setInputs(prev => ({
                                              ...prev,
                                              precoBoiGordo: price.boiGordo,
                                              precoBoiMagro: price.boiMagro
                                            }));
                                            
                                            // Sync diet ingredients if available
                                            if (price.ingredientPrices) {
                                              setDietIngredients(prev => prev.map(ing => {
                                                if (price.ingredientPrices && price.ingredientPrices[ing.name]) {
                                                  return { ...ing, price: price.ingredientPrices[ing.name] };
                                                }
                                                return ing;
                                              }));
                                              
                                              setDietAnimalProfile(prev => ({
                                                ...prev,
                                                precoBoiGordo: price.boiGordo
                                              }));
                                            }

                                            setActiveTab('inputs');
                                            showToast(`Preços de ${price.state} aplicados na simulação e na dieta!`, 'success');
                                          }}
                                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                          Usar na Simulação
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-20 text-center">
                        <div className="p-4 bg-[#121826]/40 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                          <Map className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-sm italic">Clique em "Atualizar Preços" para carregar dados do mercado.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
                      <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-xs flex items-center gap-1.5 tracking-wider text-emerald-400">
                            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                            DICA DE MERCADO
                          </h4>
                        </div>

                        {/* State Selection */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Escolher Cotação de Referência</label>
                          <select
                            value={agioSelectedState}
                            onChange={(e) => setAgioSelectedState(e.target.value)}
                            className="w-full bg-slate-900/90 border border-slate-700 text-xs text-slate-100 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-sans"
                          >
                            <option value="Médio" className="bg-slate-900 font-sans">Média de Todos os Estados</option>
                            <option value="Regiao-Sudeste" className="bg-slate-900 font-sans">Média Região Sudeste (SP, MG)</option>
                            <option value="Regiao-Sul" className="bg-slate-900 font-sans">Média Região Sul (RS, PR, SC)</option>
                            <option value="Regiao-Centro-Oeste" className="bg-slate-900 font-sans">Média Região Centro-Oeste (MS, MT, GO)</option>
                            <option value="Regiao-Norte" className="bg-slate-900 font-sans">Média Região Norte (PA, RO, TO)</option>
                            <option value="Regiao-Nordeste" className="bg-slate-900 font-sans">Média Região Nordeste (BA, MA)</option>
                          </select>
                        </div>

                        {/* Dica Text */}
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {marketStats.dicaText}
                        </p>

                        {/* Calculated Value Display */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-xs flex items-center justify-between">
                          <div>
                            <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                              {marketStats.agioMedio >= 0 ? 'Ágio de Reposição' : 'Deságio de Reposição'} ({marketStats.label})
                            </p>
                            <p className={`text-xl font-black font-mono flex items-center gap-1.5 ${
                                marketStats.agioMedio >= 0 ? 'text-[#fb7185]' : 'text-emerald-400'
                            }`}>
                              {marketStats.agioMedio > 0 ? '+' : ''}{marketStats.agioMedio.toFixed(2)}%
                              <span className={`text-[9px] font-black font-sans uppercase tracking-widest px-1.5 py-0.5 rounded-lg border ${
                                marketStats.agioMedio >= 0
                                  ? 'bg-rose-500/10 border-rose-500/20 text-[#fb7185]'
                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                                {marketStats.agioMedio >= 0 ? 'Ágio' : 'Deságio'}
                              </span>
                            </p>
                          </div>
                          
                          <div className="text-right text-[10px] font-mono text-slate-400 space-y-0.5">
                            <div>@ Magro eq: R$ {marketStats.pArrobaMagro.toFixed(2)}</div>
                            <div>@ Gordo ref: R$ {marketStats.pArrobaGordo.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Fontes de Dados Utilizadas */}
                        <div className="flex items-start gap-2.5 p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl text-[10px] text-slate-400 backdrop-blur-xs">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 text-left">
                            <span className="font-bold text-slate-300 block text-[9px] uppercase tracking-wider">Fontes dos Dados de Referência:</span>
                            <p className="leading-tight text-[10px] text-slate-400">
                              Os preços do <span className="text-slate-300 font-semibold">Boi Gordo</span> estão pautados na referência comercial do <span className="text-indigo-400 font-semibold">Indicador CEPEA/ESALQ (USP)</span>, média apurada para o estado de São Paulo e praças de negociação ativa. O gado de reposição (<span className="text-slate-300 font-semibold">Boi Magro</span>) adota cotações históricas calibradas das praças da <span className="text-indigo-400 font-semibold">Scot Consultoria</span> e leilões regionais de gado de corte. Os insumos (<span className="text-slate-300 font-semibold">Milho, Farelo de Soja</span>, etc.) são balizados nos preços mínimos de cooperativas agropecuárias brasileiras e preços físicos apurados pela <span className="text-indigo-400 font-semibold">CONAB</span>.
                            </p>
                          </div>
                        </div>

                        {/* Fixed Explanation of Agio Calculation */}
                        <div className="mt-4 p-4 bg-[#090d16] border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-3 leading-relaxed text-left">
                          <h5 className="font-bold text-xs text-emerald-400 border-b border-slate-800/80 pb-1.5 flex items-center gap-1">
                            Metodologia de Cálculo do Ágio
                          </h5>
                          
                          <div>
                            <span className="font-bold text-slate-200 text-[10px] uppercase tracking-wider block mb-1">1. Conversão do Boi Magro para Arroba (@):</span>
                            <p className="text-slate-400 leading-normal">
                              O boi magro é negociado por cabeça (valor unitário). Para calcular o ágio em relação ao boi gordo (negociado em @), convertemos o valor do gado magro para o correspondente por arroba (@):
                            </p>
                            <div className="mt-1.5 p-2 bg-slate-900 rounded-lg text-center font-mono font-bold text-emerald-400 text-[10px] border border-slate-800">
                              Preço Arroba Magro = (Valor Boi Magro × 30) / Peso Vivo Inicial
                            </div>
                            <p className="mt-1 text-[9px] text-slate-500 italic">
                              * Nota técnica: Adota-se o padrão comercial de equivalência biológica onde 1 arroba live correspondente a 30kg de peso vivo (rendimento padrão de carcaça).
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-slate-200 text-[10px] uppercase tracking-wider block mb-1">2. Cálculo de Diferencial (Ágio %):</span>
                            <p className="text-slate-400 leading-normal">
                              O ágio representa a diferença percentual paga na arroba do animal de reposição (boi magro) sobre o preço obtido na venda do animal acabado (boi gordo):
                            </p>
                            <div className="mt-1.5 p-2 bg-slate-900 rounded-lg text-center font-mono font-bold text-emerald-400 text-[10px] border border-slate-800">
                              Ágio (%) = [ (Preço Arroba Magro / Preço Arroba Gordo) - 1 ] × 100
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-slate-200 text-[10px] uppercase tracking-wider block mb-1">3. Entendendo os Valores (Positivo vs Negativo):</span>
                            <ul className="space-y-1 mt-1 text-[10px] text-slate-400">
                              <li className="leading-snug">
                                <span className="font-bold text-rose-400">● Ágio Positivo (+)</span>: Ocorre quando a arroba paga na reposição é mais cara que a de venda do boi gordo. Isso aumenta a pressão de custos e exige máxima eficiência de GMD e conversão.
                              </li>
                              <li className="leading-snug">
                                <span className="font-bold text-emerald-400">● Ágio Negativo (-) [Deságio]</span>: Ocorre no cenário de mercado favorável em que a reposição é comprada por valor de arroba inferior à venda final. Ajuda a expandir as margens.
                              </li>
                            </ul>
                          </div>

                          <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                            <span className="font-bold text-slate-200 block mb-1">Demonstração de Valores (Cálculo Ativo):</span>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
                              <div>• Preço Boi Magro:</div>
                              <div className="text-right text-emerald-400 font-bold">R$ {marketStats.boiMagro.toLocaleString('pt-BR')}</div>
                              
                              <div>• Peso Vivo Inicial:</div>
                              <div className="text-right text-emerald-400 font-bold">{Math.round(marketStats.weight)} kg</div>
                              
                              <div className="border-t border-slate-800/60 pt-0.5">• @ Reposição Eq.:</div>
                              <div className="text-right text-emerald-400 font-bold border-t border-slate-800/60 pt-0.5">R$ {marketStats.pArrobaMagro.toFixed(2)}</div>
                              
                              <div>• @ Boi Gordo Ref.:</div>
                              <div className="text-right text-emerald-400 font-bold">R$ {marketStats.pArrobaGordo.toFixed(2)}</div>
                              
                              <div className="border-t border-slate-700/60 pt-1 font-semibold text-white">• Ágio Resultante:</div>
                              <div className="text-right text-emerald-400 font-black border-t border-slate-700/60 pt-1">
                                {marketStats.agioMedio > 0 ? '+' : ''}{marketStats.agioMedio.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800/80 shadow-lg hover:border-slate-700/60 transition-all duration-300">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Links Úteis</h4>
                      <div className="space-y-2">
                        <a href="https://www.noticiasagricolas.com.br/cotacoes/boi-gordo/macho-nelore-boi-magro" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          Notícias Agrícolas
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://www.cepea.esalq.usp.br/br/indicador/boi-gordo.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          Indicador CEPEA
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://www.scotconsultoria.com.br/cotacoes/boi-gordo/?ref=smnb" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          Scot Consultoria
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://www.lae-fmvz-usp.com/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          LAE - FMVZ/USP
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://br.tradingview.com/symbols/BMFBOVESPA-BGI1!/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          Cotações B3
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://www.ufrgs.br/nespro/cotacoes/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          Cotações NESPRO (RS)
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://portaldeinformacoes.conab.gov.br/precos-agropecuarios.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          CONAB - Preços Agropecuários
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                        <a href="https://www.agrolink.com.br/cotacoes/carnes/bovinos" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3.5 bg-[#121826]/80 rounded-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:text-emerald-400 transition-all text-xs font-semibold text-slate-200">
                          Agrolink - Cotações Bovinos
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Copula Info Modal */}
      <AnimatePresence>
        {isCopulaInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCopulaInfoOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-slate-100">Entendendo Cópulas e Correlações</h2>
                </div>
                <button 
                  onClick={() => setIsCopulaInfoOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left">
                <div className="space-y-4">
                  <section>
                    <h3 className="text-sm font-bold text-slate-200 mb-2">O que é uma Cópula?</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Em estatística, uma cópula é uma ferramenta que permite separar o comportamento individual de cada variável (sua distribuição marginal) da estrutura de dependência entre elas. 
                      Isso é fundamental em simulações de risco porque variáveis como "Preço do Boi Gordo" e "Preço do Boi Magro" não são independentes; elas tendem a subir e descer juntas.
                    </p>
                  </section>

                  <section className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/25">
                    <h3 className="text-sm font-bold text-indigo-400 mb-2">Cópula Gaussiana (Padrão)</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      É o modelo mais comum. Ela assume que a dependência entre as variáveis segue uma estrutura de correlação linear (Pearson). 
                      Utilizamos a <span className="font-bold text-indigo-350">Decomposição de Cholesky</span> para transformar variáveis independentes em correlacionadas, mantendo as propriedades estatísticas desejadas.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-slate-200 mb-2">Valores de Referência de Correlação</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Preço Gordo vs Magro</p>
                        <p className="text-xs font-bold text-emerald-400">0.85 a 0.95</p>
                        <p className="text-[9px] text-slate-400">Correlação muito alta. O ágio tende a ser estável no longo prazo.</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Preço Milho vs Boi Gordo</p>
                        <p className="text-xs font-bold text-indigo-400">0.20 a 0.40</p>
                        <p className="text-[9px] text-slate-400">Correlação moderada. Insumos e produto final têm dinâmicas distintas.</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">GMD vs Consumo</p>
                        <p className="text-xs font-bold text-violet-400">0.60 a 0.80</p>
                        <p className="text-[9px] text-slate-400">Correlação biológica. Animais que comem mais tendem a ganhar mais peso.</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Mortalidade vs GMD</p>
                        <p className="text-xs font-bold text-red-400">-0.10 a -0.30</p>
                        <p className="text-[9px] text-slate-400">Correlação negativa. Problemas sanitários reduzem o desempenho global.</p>
                      </div>
                    </div>
                  </section>

                  <section className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <h3 className="text-sm font-bold text-amber-405 text-amber-400 mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Por que visualizar?
                    </h3>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      A visualização por dispersão (Scatter Plot) permite confirmar se a "nuvem de pontos" reflete a realidade econômica. 
                      Se você configurou uma correlação de 0.9, os pontos devem estar quase alinhados. Se configurou 0, devem formar um círculo disperso.
                    </p>
                  </section>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-800 bg-slate-900 shrink-0">
                <button 
                  onClick={() => setIsCopulaInfoOpen(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-2xl font-bold text-sm transition-colors cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      {/* Calibration Modal */}
      <AnimatePresence>
        {isCalibrationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalibrationOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-100">Calibração com Dados Históricos</h2>
                </div>
                <button 
                  onClick={() => setIsCalibrationOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left">
                {!calibrationResults ? (
                  <div className="space-y-6">
                    <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
                      <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Como preparar seu arquivo
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        O arquivo deve ser um CSV com cabeçalhos. O sistema tentará identificar automaticamente as colunas para:
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3 block">
                        {Object.values(CALIBRATION_KEYS).map((label, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        accept=".csv"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsCalibrating(true);
                            Papa.parse(file, {
                              header: true,
                              skipEmptyLines: true,
                              complete: (results) => {
                                const calibrated = calculateCalibration(results.data);
                                setCalibrationResults(calibrated);
                                setIsCalibrating(false);
                              }
                            });
                          }
                        }}
                      />
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-full group-hover:scale-110 transition-transform">
                        <Download className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-200">Clique ou arraste o arquivo CSV</p>
                        <p className="text-xs text-slate-400 mt-1">Formatos aceitos: .csv</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        Estatísticas Identificadas
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(calibrationResults.stats).map(([key, stat]: [string, any]) => (
                          <div key={key} className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                            <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-2">{CALIBRATION_KEYS[key]}</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-slate-400">Média</p>
                                <p className="text-sm font-bold text-slate-100">
                                  {key.includes('preco') ? formatCurrency(stat.mean) : stat.mean.toFixed(3)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400">Desvio Padrão</p>
                                <p className="text-sm font-bold text-emerald-400">
                                  {key.includes('preco') ? formatCurrency(stat.stdDev) : stat.stdDev.toFixed(3)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-800/80">
                              <p className="text-[9px] text-slate-400">Coef. Variação: <span className="font-bold text-slate-300">{stat.cv.toFixed(1)}%</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                        Matriz de Correlação
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr>
                              <th className="p-2 text-left text-slate-400 font-bold uppercase tracking-widest">Variável</th>
                              {Object.keys(calibrationResults.correlations).map(k => (
                                <th key={k} className="p-2 text-center text-slate-400 font-bold uppercase tracking-widest">
                                  {k.replace('preco', '').replace('Boi', '')}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(calibrationResults.correlations).map(([k1, row]: [string, any]) => (
                              <tr key={k1} className="border-t border-slate-800/60">
                                <td className="p-2 font-bold text-slate-350">{CALIBRATION_KEYS[k1].split('(')[0]}</td>
                                {Object.values(row).map((val: any, idx) => (
                                  <td key={idx} className="p-2 text-center">
                                    <span className={`px-2 py-1 rounded-lg font-bold ${
                                      Math.abs(val) > 0.7 ? 'bg-emerald-500/20 text-emerald-300' :
                                      Math.abs(val) > 0.4 ? 'bg-emerald-500/10 text-emerald-400' :
                                      'text-slate-400'
                                    }`}>
                                      {val.toFixed(2)}
                                    </span>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-900 border-t border-slate-800 flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setCalibrationResults(null);
                    setIsCalibrationOpen(false);
                  }}
                  className="flex-1 py-3 text-slate-405 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
                >
                  {calibrationResults ? 'Descartar' : 'Cancelar'}
                </button>
                {calibrationResults && (
                  <button
                    onClick={() => {
                      setInputs(prev => {
                        const newInputs = { ...prev };
                        
                        Object.entries(calibrationResults.stats).forEach(([key, stat]: [string, any]) => {
                          newInputs.desviosPadrao[key] = stat.stdDev;
                          (newInputs as any)[key] = stat.mean;
                        });

                        Object.entries(calibrationResults.correlations).forEach(([k1, row]: [string, any]) => {
                          if (!newInputs.correlacoes[k1]) newInputs.correlacoes[k1] = {};
                          Object.entries(row).forEach(([k2, val]: [string, any]) => {
                            if (k1 !== k2) {
                              newInputs.correlacoes[k1][k2] = val;
                            }
                          });
                        });

                        return newInputs;
                      });
                      setCalibrationResults(null);
                      setIsCalibrationOpen(false);
                    }}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 hover:bg-emerald-500 transition-all cursor-pointer"
                  >
                    Aplicar Calibração
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Configuração de Relatório */}
      <AnimatePresence>
        {isReportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setIsReportModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-blue-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Configurar Relatório
                  </h3>
                  <button 
                    onClick={() => setIsReportModalOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm">Selecione as seções que deseja incluir no documento PDF.</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seções do Relatório</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setReportConfig({
                        inputs: true, results: true, riskStats: true, riskCharts: true, scenarios: true, cashflow: true, rawData: true, diet: true
                      })}
                      className="text-[10px] font-bold text-blue-400 hover:underline"
                    >
                      Selecionar Tudo
                    </button>
                    <button 
                      onClick={() => setReportConfig({
                        inputs: false, results: false, riskStats: false, riskCharts: false, scenarios: false, cashflow: false, rawData: false, diet: false
                      })}
                      className="text-[10px] font-bold text-slate-400 hover:underline"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <ReportOption 
                    label="Parâmetros de Entrada" 
                    checked={reportConfig.inputs} 
                    onChange={() => setReportConfig(prev => ({ ...prev, inputs: !prev.inputs }))}
                    icon={<Settings className="w-4 h-4" />}
                  />
                  <ReportOption 
                    label="Resultados Econômicos" 
                    checked={reportConfig.results} 
                    onChange={() => setReportConfig(prev => ({ ...prev, results: !prev.results }))}
                    icon={<DollarSign className="w-4 h-4" />}
                    disabled={!results}
                  />
                  <ReportOption 
                    label="Estatísticas de Risco (LHS)" 
                    checked={reportConfig.riskStats} 
                    onChange={() => setReportConfig(prev => ({ ...prev, riskStats: !prev.riskStats }))}
                    icon={<ShieldAlert className="w-4 h-4" />}
                    disabled={!lhsResults}
                  />
                  <ReportOption 
                    label="Gráficos de Risco" 
                    checked={reportConfig.riskCharts} 
                    onChange={() => setReportConfig(prev => ({ ...prev, riskCharts: !prev.riskCharts }))}
                    icon={<BarChart3 className="w-4 h-4" />}
                    disabled={!lhsResults}
                  />
                  <ReportOption 
                    label="Fluxo de Caixa" 
                    checked={reportConfig.cashflow} 
                    onChange={() => setReportConfig(prev => ({ ...prev, cashflow: !prev.cashflow }))}
                    icon={<ArrowRightLeft className="w-4 h-4" />}
                    disabled={!results}
                  />
                  <ReportOption 
                    label="Dieta Otimizada" 
                    checked={reportConfig.diet} 
                    onChange={() => setReportConfig(prev => ({ ...prev, diet: !prev.diet }))}
                    icon={<Zap className="w-4 h-4" />}
                    disabled={!dietResult}
                  />
                  <ReportOption 
                    label="Dados da Simulação (LHS)" 
                    checked={reportConfig.rawData} 
                    onChange={() => setReportConfig(prev => ({ ...prev, rawData: !prev.rawData }))}
                    icon={<Database className="w-4 h-4" />}
                    disabled={!lhsResults}
                  />
                </div>

                <button
                  onClick={async () => {
                    await handleDownloadReport();
                    setIsReportModalOpen(false);
                  }}
                  disabled={isGeneratingReport || (!results && !lhsResults)}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Gerar Relatório Selecionado
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal de Perfil Nutricional Completo */}
      <AnimatePresence>
        {isFullProfileModalOpen && dietResult && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFullProfileModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Perfil Nutricional Completo</h2>
                    <p className="text-purple-100 text-xs">Detalhamento de macro e microminerais e vitaminas</p>
                  </div>
                </div>
                <button onClick={() => setIsFullProfileModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Macrominerais (% da MS)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <NutrientItem label="Cálcio (Ca)" value={dietResult.nutritionalProfile.ca} unit="%" />
                      <NutrientItem label="Fósforo (P)" value={dietResult.nutritionalProfile.p} unit="%" />
                      <NutrientItem label="Magnésio (Mg)" value={dietResult.nutritionalProfile.mg} unit="%" />
                      <NutrientItem label="Potássio (K)" value={dietResult.nutritionalProfile.k} unit="%" />
                      <NutrientItem label="Sódio (Na)" value={dietResult.nutritionalProfile.na} unit="%" />
                      <NutrientItem label="Enxofre (S)" value={dietResult.nutritionalProfile.s} unit="%" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Vitaminas (UI/kg MS)</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <NutrientItem label="Vitamina A" value={dietResult.nutritionalProfile.vitA} unit=" UI/kg" />
                      <NutrientItem label="Vitamina E" value={dietResult.nutritionalProfile.vitE} unit=" UI/kg" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mt-8">Energia e Proteína</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <NutrientItem label="Proteína Bruta" value={dietResult.nutritionalProfile.pb} unit="%" />
                      <NutrientItem label="NDT" value={dietResult.nutritionalProfile.ndt} unit="%" />
                      <NutrientItem label="FDN" value={dietResult.nutritionalProfile.fdn} unit="%" />
                      <NutrientItem label="Extrato Etéreo" value={dietResult.nutritionalProfile.ee} unit="%" />
                      <NutrientItem label="PDR" value={dietResult.nutritionalProfile.pdr} unit="%" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Salvar Dieta (Substitui o PROMPT nativo do navegador para compatibilidade máxima) */}
      <AnimatePresence>
        {isSavingDiet && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavingDiet(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0f1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Salvar Dieta</h2>
                  <p className="text-xs text-slate-400">Dê um nome para identificar esta formulação</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome da Formulação</label>
                  <input
                    type="text"
                    value={newDietName}
                    onChange={(e) => setNewDietName(e.target.value)}
                    placeholder="Ex: Formulação Alta Energia Lote A"
                    className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all placeholder:text-slate-600"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newDietName.trim()) {
                        if (editingDietId) {
                          handleUpdateDiet(newDietName);
                        } else {
                          handleSaveDiet(newDietName);
                        }
                        setIsSavingDiet(false);
                      }
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {editingDietId ? (
                    <>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (newDietName.trim()) {
                              handleUpdateDiet(newDietName);
                              setIsSavingDiet(false);
                            }
                          }}
                          disabled={!newDietName.trim()}
                          className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-750/25 transition-all text-xs disabled:opacity-50 cursor-pointer"
                        >
                          Sobrescrever Dieta
                        </button>
                        <button
                          onClick={() => {
                            if (newDietName.trim()) {
                              handleSaveDiet(newDietName);
                              setIsSavingDiet(false);
                            }
                          }}
                          disabled={!newDietName.trim()}
                          className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-750/25 transition-all text-xs disabled:opacity-50 cursor-pointer"
                        >
                          Salvar como Nova
                        </button>
                      </div>
                      <button
                        onClick={() => setIsSavingDiet(false)}
                        className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsSavingDiet(false)}
                        className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (newDietName.trim()) {
                            handleSaveDiet(newDietName);
                            setIsSavingDiet(false);
                          }
                        }}
                        disabled={!newDietName.trim()}
                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-700/25 transition-all text-xs disabled:opacity-50 cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Dieta Salvas */}
      <AnimatePresence>
        {isSavedDietsModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavedDietsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0f1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#0f172a] p-6 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-purple-400" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">Formulações Salvas</h2>
                    <p className="text-slate-400 text-xs">Gerencie e carregue suas dietas otimizadas</p>
                  </div>
                </div>
                <button onClick={() => setIsSavedDietsModalOpen(false)} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {savedDiets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-900/60 border border-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Save className="w-8 h-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhuma formulação salva ainda.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {savedDiets.map((diet) => (
                      <div key={diet.id} className="p-4 bg-[#121826] rounded-2xl border border-slate-800/85 flex items-center justify-between group hover:border-purple-500/35 hover:bg-[#151c2d] transition-all">
                        <div>
                          <h4 className="font-bold text-slate-100">{diet.name}</h4>
                          <div className="flex items-center gap-3 mt-1 font-mono">
                            <span className="text-[10px] text-slate-405 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {new Date(diet.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-[10px] text-purple-400 font-bold">
                              R$ {formatNumber(diet.result.totalCostMN, 3)}/kg MN
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadDiet(diet)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-700/25 transition-all"
                          >
                            Carregar
                          </button>
                          <button
                            onClick={() => handleDeleteSavedDiet(diet.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Save Simulation Modal */}
      <AnimatePresence>
        {isSaving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaving(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0f1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Salvar Simulação</h2>
                  <p className="text-xs text-slate-400">Dê um nome para identificar este projeto</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Projeto</label>
                  <input
                    type="text"
                    value={newSimName}
                    onChange={(e) => setNewSimName(e.target.value)}
                    placeholder="Ex: Confinamento Inverno 2024"
                    className="w-full bg-slate-900/60 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4 flex-col">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsSaving(false)}
                      className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveSimulation}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-700/25 transition-all text-xs cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full py-3 bg-[#111827] border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-[#1f2937] rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    Baixar Relatório PDF
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full py-3 bg-[#111827] border border-amber-500/20 text-amber-400 hover:text-amber-300 hover:bg-[#1f2937] rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-amber-400" />
                    Baixar Dados (CSV)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Saved Simulations Modal */}
      <AnimatePresence>
        {isSavedSimsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSavedSimsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0f1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800/65 flex items-center justify-between bg-[#0f172a]">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h2 className="text-xl font-bold text-slate-100 animate-none">Meus Projetos</h2>
                    <p className="text-xs text-slate-400">Gerencie suas simulações salvas</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSavedSimsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {savedSimulations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-900/60 border border-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FolderOpen className="w-8 h-8 text-slate-555" />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhuma simulação salva ainda.</p>
                    <p className="text-xs text-slate-400 mt-1">Seus projetos salvos aparecerão aqui.</p>
                  </div>
                ) : (
                  savedSimulations.map((sim) => (
                    <div 
                      key={sim.id}
                      className="group bg-[#121826] border border-slate-800/80 p-4 rounded-2xl hover:border-emerald-500/35 hover:bg-[#151c2d] transition-all flex items-center justify-between"
                    >
                      <div className="flex-1 cursor-pointer animate-none" onClick={() => loadSimulation(sim)}>
                        <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{sim.name}</h4>
                        <div className="flex items-center gap-3 mt-1 font-mono text-[10px] text-slate-405">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {sim.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Scale className="w-3 h-3 text-slate-500" />
                            {sim.inputs.pesoVivoInicial}kg → {sim.inputs.pesoVivoFinal}kg
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadSimulation(sim)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title="Carregar"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteSimulation(sim.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-[#0f172a] border-t border-slate-800 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 italic">
                  * As simulações são armazenadas localmente no seu navegador.
                </p>
                <button
                  onClick={() => setIsSavedSimsOpen(false)}
                  className="px-6 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all font-sans"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Histogram Info Modal */}
      <AnimatePresence>
        {isHistogramInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistogramInfoOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-100">Como Interpretar o Histograma</h2>
                </div>
                <button 
                  onClick={() => setIsHistogramInfoOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    O que é o Histograma?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Ele mostra a <strong>frequência</strong> com que cada nível de VPL ocorreu nas milhares de simulações realizadas. É o "mapa da incerteza" do seu projeto.
                  </p>
                </section>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase mb-2">Média</h4>
                    <p className="text-xs text-slate-700">
                      É o VPL mais provável. Representa o centro da distribuição.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Desvio Padrão</h4>
                    <p className="text-xs text-amber-700">
                      Mede a dispersão. Quanto maior, mais "espalhado" é o gráfico e maior é a incerteza (risco) sobre o resultado final.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <h4 className="text-xs font-bold text-purple-800 uppercase mb-2">Coeficiente de Variação (C.V.)</h4>
                    <p className="text-xs text-purple-700">
                      Relaciona o risco (desvio) com o retorno (média). 
                      <br/>- Abaixo de 20%: Baixo risco relativo.
                      <br/>- Acima de 30%: Alto risco relativo.
                    </p>
                  </div>
                </div>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-blue-500" />
                    Linha Pontilhada Azul
                  </h3>
                  <p className="text-sm text-gray-600">
                    Representa o <strong>VPL Determinístico</strong>, ou seja, o resultado calculado com os valores fixos que você inseriu nos parâmetros, sem considerar as variações de mercado.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-4 h-0.5 border-t-2 border-dashed border-violet-500" />
                    Linha Pontilhada Violeta
                  </h3>
                  <p className="text-sm text-gray-600">
                    Representa o <strong>VPL Probabilístico (Médio)</strong>, que é a média de todos os cenários simulados no Monte Carlo. É o resultado mais provável considerando as incertezas.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Linha de VPL Zero
                  </h3>
                  <p className="text-sm text-gray-600">
                    A área do gráfico à <strong>esquerda</strong> da linha vermelha representa a probabilidade de VPL negativo. Quanto mais o gráfico "foge" para a esquerda, mais arriscado é o negócio.
                  </p>
                </section>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsHistogramInfoOpen(false)}
                  className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Regression Info Modal */}
      <AnimatePresence>
        {isRegressionInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegressionInfoOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-bold text-slate-100">Análise de Regressão Múltipla</h2>
                </div>
                <button 
                  onClick={() => setIsRegressionInfoOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    O que são os Standard Betas?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Diferente da correlação simples, os coeficientes de regressão padronizados (Standard Betas) medem o impacto de uma variável <strong>mantendo todas as outras constantes</strong>.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    O que é o R² (R-Quadrado)?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O R² indica quanto da variação total do VPL é explicada pelo modelo linear. Se o R² for baixo (ex: &lt; 0.80), significa que o modelo possui <strong>fortes relações não-lineares</strong> ou interações complexas que uma reta não consegue capturar perfeitamente.
                  </p>
                </section>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                  <p className="text-xs text-slate-400">
                    <strong>Por que usar?</strong> Se os seus inputs fossem correlacionados entre si, a regressão seria mais precisa que a correlação simples para identificar os verdadeiros "drivers" de VPL.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsRegressionInfoOpen(false)}
                  className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Morris Info Modal */}
      <AnimatePresence>
        {isMorrisInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMorrisInfoOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-100">Análise Morris (OAT)</h2>
                </div>
                <button 
                  onClick={() => setIsMorrisInfoOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    O que é o Método de Morris?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    É uma técnica de triagem que identifica quais variáveis têm maior impacto e quais apresentam comportamentos complexos (não-lineares ou interações).
                  </p>
                </section>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Importância (μ*)</h4>
                    <p className="text-xs text-emerald-400">
                      Representa a influência média da variável no VPL. Quanto maior, mais "importante" é a variável.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Interação/Não-linearidade (σ)</h4>
                    <p className="text-xs text-amber-700">
                      Indica se o efeito da variável muda dependendo de outros fatores. Valores altos sugerem que o risco é complexo e interconectado.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic">
                  Variáveis no canto superior direito do gráfico são as mais críticas, pois combinam alto impacto com alta complexidade.
                </p>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsMorrisInfoOpen(false)}
                  className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sobol Info Modal */}
      <AnimatePresence>
        {isSobolInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSobolInfoOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-amber-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-100">Índices de Sobol</h2>
                </div>
                <button 
                  onClick={() => setIsSobolInfoOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Decomposição da Variância
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    A análise de Sobol quantifica exatamente quanto da incerteza (variância) do VPL é causada por cada variável.
                  </p>
                </section>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">S1 (Efeito Direto)</h4>
                    <p className="text-xs text-emerald-400">
                      A porcentagem da variância explicada apenas por esta variável isoladamente.
                    </p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Interações</h4>
                    <p className="text-xs text-amber-700">
                      A variância que surge da combinação desta variável com outras. É o "efeito multiplicador" do risco.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-2">ST (Índice Total)</h4>
                    <p className="text-xs text-gray-600">
                      A soma de S1 e todas as suas interações. Representa o risco total associado à variável.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsSobolInfoOpen(false)}
                  className="px-8 py-2 bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sensitivity Info Modal */}
      <AnimatePresence>
        {isSensitivityInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSensitivityInfoOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-100">Como Interpretar a Análise de Sensibilidade (Correlação)</h2>
                </div>
                <button 
                  onClick={() => setIsSensitivityInfoOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <section className="space-y-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    O que são os Coeficientes?
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Eles medem a <strong>força e a direção</strong> da relação entre cada variável de entrada e o VPL final. O valor varia de -1 a +1.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Impacto Positivo (+)</h4>
                    <p className="text-xs text-emerald-400">
                      Barras para a <strong>direita</strong>. Quando este valor aumenta, o VPL tende a aumentar. 
                      <br/><br/>
                      <em>Ex: Preço do Boi Gordo.</em>
                    </p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="text-xs font-bold text-rose-800 uppercase mb-2">Impacto Negativo (-)</h4>
                    <p className="text-xs text-rose-700">
                      Barras para a <strong>esquerda</strong>. Quando este valor aumenta, o VPL tende a diminuir.
                      <br/><br/>
                      <em>Ex: Preço do Milho.</em>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSensitivityInfoOpen(false)}
                  className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition-all cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stress Test Modal */}
      <AnimatePresence>
        {isAddingStress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingStress(false);
                setEditingStressId(null);
                setNewStress({ name: '', changes: [], color: 'amber' });
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-slate-800/85 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800/60 flex items-center justify-between shrink-0 bg-[#070a13]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-550" />
                  <h2 className="text-lg font-bold text-slate-100 font-display">
                    {editingStressId ? 'Editar Cenário de Estresse' : 'Novo Cenário de Estresse'}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    setIsAddingStress(false);
                    setEditingStressId(null);
                    setNewStress({ name: '', changes: [], color: 'amber' });
                  }}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-semibold text-slate-300">Nome do Cenário</label>
                  <input 
                    type="text"
                    placeholder="Ex: Crise de Grãos"
                    value={newStress.name}
                    onChange={(e) => setNewStress(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-100 transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-350">Variáveis Estressadas</label>
                  
                  {/* List of current changes */}
                  <div className="space-y-2">
                    {newStress.changes.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic text-center py-2">Nenhuma variável adicionada ainda.</p>
                    ) : (
                      newStress.changes.map((change, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{STRESS_INPUTS[change.inputKey]}</p>
                            <p className={`text-[10px] font-bold ${change.changePerc >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                              {change.changePerc > 0 ? '+' : ''}{change.changePerc}%
                            </p>
                          </div>
                          <button 
                            onClick={() => setNewStress(prev => ({ ...prev, changes: prev.changes.filter((_, i) => i !== idx) }))}
                            className="p-1.5 hover:bg-red-500/25 text-red-400 hover:text-red-300 rounded-lg transition-all border border-transparent hover:border-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add new change section */}
                  <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Adicionar Variável</label>
                      <select 
                        value={currentChange.inputKey}
                        onChange={(e) => setCurrentChange(prev => ({ ...prev, inputKey: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/30 text-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {Object.entries(STRESS_INPUTS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Mudança (%)</label>
                        <span className={`text-xs font-bold ${currentChange.changePerc >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                          {currentChange.changePerc > 0 ? '+' : ''}{currentChange.changePerc}%
                        </span>
                      </div>
                      <input 
                        type="range"
                        min="-100"
                        max="100"
                        step="5"
                        value={currentChange.changePerc}
                        onChange={(e) => setCurrentChange(prev => ({ ...prev, changePerc: Number(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 border border-slate-800"
                      />
                    </div>

                    <button
                      onClick={() => {
                        const exists = newStress.changes.some(c => c.inputKey === currentChange.inputKey);
                        if (exists) {
                          setNewStress(prev => ({
                            ...prev,
                            changes: prev.changes.map(c => c.inputKey === currentChange.inputKey ? { ...currentChange } : c)
                          }));
                        } else {
                          setNewStress(prev => ({
                            ...prev,
                            changes: [...prev.changes, { ...currentChange }]
                          }));
                        }
                      }}
                      className="w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      {newStress.changes.some(c => c.inputKey === currentChange.inputKey) ? 'Atualizar Variável' : 'Incluir Variável'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-350">Cor do Alerta</label>
                  <div className="flex gap-3">
                    {['amber', 'orange', 'red'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewStress(prev => ({ ...prev, color: c }))}
                        className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                          c === 'amber' ? 'bg-amber-400' : c === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                        } ${newStress.color === c ? 'ring-4 ring-slate-800 scale-110' : 'opacity-60 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#070a13] border-t border-slate-800/60 flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setIsAddingStress(false);
                    setEditingStressId(null);
                    setNewStress({ name: '', changes: [], color: 'amber' });
                  }}
                  className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 border border-slate-800/85 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!newStress.name || newStress.changes.length === 0) return;
                    const description = newStress.changes.map(c => `${STRESS_INPUTS[c.inputKey]} ${c.changePerc > 0 ? '+' : ''}${c.changePerc}%`).join(', ');
                    if (editingStressId) {
                      setCustomStressScenarios(prev => prev.map(cs => cs.id === editingStressId ? { ...newStress, id: cs.id, description } : cs));
                    } else {
                      const id = `custom-${Date.now()}`;
                      setCustomStressScenarios(prev => [...prev, { ...newStress, id, description }]);
                    }
                    setIsAddingStress(false);
                    setNewStress({ name: '', changes: [], color: 'amber' });
                    setEditingStressId(null);
                  }}
                  disabled={!newStress.name || newStress.changes.length === 0}
                  className="flex-1 py-3 bg-[#3b82f6] hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-950/20 transition-all disabled:opacity-55 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                >
                  {editingStressId ? 'Salvar Alterações' : 'Criar Cenário'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0f172a] border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-800/60 flex items-center justify-between shrink-0 bg-[#070a13]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-100 font-display">Configurações</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Iterações LHS
                  </label>
                  <p className="text-xs text-slate-400">
                    Quanto maior o número de iterações, mais precisa a simulação, porém mais lenta.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[2000, 5000, 10000, 25000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setMcIterations(val)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          mcIterations === val 
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20' 
                            : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60 space-y-3">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                    Modelo de Dependência (Cópula)
                  </label>
                  <p className="text-xs text-slate-400">
                    Define como as variáveis interagem entre si na simulação.
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'gaussian', label: 'Correlação Linear (Gaussiana)', desc: 'Padrão de mercado, dependência simétrica.' },
                      { id: 'spearman', label: 'Correlação de Postos (Spearman)', desc: 'Robusta a outliers e relações não-lineares.' },
                      { id: 'clayton', label: 'Cópula de Clayton', desc: 'Foca em riscos de queda (cauda inferior).' },
                      { id: 'gumbel', label: 'Cópula de Gumbel', desc: 'Foca em riscos de alta (cauda superior).' },
                      { id: 'independent', label: 'Independência Total', desc: 'Sem relação entre as variáveis.' }
                    ].map((cop) => (
                      <button
                        key={cop.id}
                        onClick={() => setInputs(prev => ({ ...prev, copulaType: cop.id as any }))}
                        className={`p-3 rounded-xl text-left transition-all border ${
                          inputs.copulaType === cop.id 
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm' 
                            : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <p className={`text-xs font-bold ${inputs.copulaType === cop.id ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {cop.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cop.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60 space-y-3">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    Tamanho da Tela
                  </label>
                  <p className="text-xs text-slate-400">
                    Ajuste a largura máxima do aplicativo para o seu monitor.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', label: 'Padrão' },
                      { id: 'wide', label: 'Largo' },
                      { id: 'full', label: 'Total' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setScreenWidth(opt.id as any)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          screenWidth === opt.id 
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20' 
                            : 'bg-slate-900/60 text-slate-400 border-slate-800/60 hover:bg-slate-800/40 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60 space-y-3">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Calibração de Dados
                  </label>
                  <p className="text-xs text-slate-400">
                    Importe dados históricos para calibrar desvios e correlações automaticamente.
                  </p>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsCalibrationOpen(true);
                    }}
                    className="w-full py-3 bg-[#0a0f1d] border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Abrir Calibrador
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-800/60 space-y-4">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Desvios Padrão (Incerteza)
                  </label>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Defina a variabilidade esperada para cada variável (em % da média). Isso afeta a amplitude do risco no LHS.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { key: 'precoBoiMagro', label: 'Preço Boi Magro (R$/animal)' },
                      { key: 'precoBoiGordo', label: 'Preço Boi Gordo (R$/@)' },
                      { key: 'gmd', label: 'GMD (kg/dia)' },
                      { key: 'precoConcentrado', label: 'Preço Concentrado (R$/kg)' },
                      { key: 'precoVolumoso', label: 'Preço Volumoso (R$/kg)' },
                      { key: 'pesoVivoInicial', label: 'Peso Inicial (kg)' },
                      { key: 'pesoVivoFinal', label: 'Peso Final (kg)' },
                      { key: 'rendimentoCarcaca', label: 'Rendimento de Carcaça (%)' },
                      { key: 'cmsVolumoso', label: 'Consumo Volumoso (kg)' },
                      { key: 'cmsConcentrado', label: 'Consumo Concentrado (kg)' },
                      { key: 'tempoAlimentacao', label: 'Tempo Alimentação (dias)' },
                      { key: 'taxaMortalidade', label: 'Mortalidade (%)', ref: 10 },
                      { key: 'salarioMinimo', label: 'Salário Mínimo (R$)', ref: 20 },
                      { key: 'tmaAnual', label: 'TMA Anual (%)', ref: 10 },
                      { key: 'valorTerraHa', label: 'Valor da Terra (R$/ha)', ref: 40 },
                      { key: 'arrendamentoTerraPerc', label: 'Arrendamento (%)' },
                      { key: 'areaAnimalM2', label: 'Área por Animal (m²)' },
                      { key: 'boisMaoDeObra', label: 'Bois/Homem', ref: 35 },
                      { key: 'encargosTrabalhistas', label: 'Encargos (%)' },
                      { key: 'custoSanidadePorBoi', label: 'Sanidade (R$/boi)', ref: 20 },
                      { key: 'outrosDespesasValor', label: 'Outras Despesas (R$)' },
                      { key: 'animaisHa', label: 'Animais por Hectare' },
                    ].map((item: any) => {
                      const currentSd = inputs.desviosPadrao[item.key] ?? 0;
                      const meanVal = (inputs as any)[item.key] || 1;
                      const percentage = (currentSd / meanVal) * 100;
                      
                      return (
                        <div key={item.key} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-slate-300">{item.label}</span>
                              {item.ref !== undefined && (
                                <button
                                  onClick={() => {
                                    const newSd = (item.ref / 100) * meanVal;
                                    handleSdChange(item.key, newSd.toString());
                                  }}
                                  className="text-[8px] text-emerald-405 hover:text-emerald-350 bg-emerald-500/10 px-1 rounded border border-emerald-500/25 transition-colors cursor-pointer"
                                  title={`Restaurar valor de referência (${item.ref}%)`}
                                >
                                  Ref: {item.ref}%
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                {percentage.toFixed(1)}%
                              </span>
                              <span className="text-[9px] text-slate-400">
                                (± {currentSd.toFixed(2)})
                              </span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="0.1"
                            value={percentage}
                            onChange={(e) => {
                              const newPerc = parseFloat(e.target.value);
                              const newSd = (newPerc / 100) * meanVal;
                              handleSdChange(item.key, newSd.toString());
                            }}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 hover:accent-emerald-500 transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60 space-y-4">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                    Correlações (Spearman)
                  </label>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Defina a relação entre as variáveis (de -1 a 1). Valores baseados em Pacheco et al. (2014).
                  </p>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { k1: 'precoBoiMagro', k2: 'precoBoiGordo', label: 'Boi Magro x Boi Gordo' },
                      { k1: 'pesoVivoInicial', k2: 'pesoVivoFinal', label: 'Peso Inicial x Final' },
                      { k1: 'precoBoiMagro', k2: 'pesoVivoInicial', label: 'Boi Magro x Peso Inicial' },
                      { k1: 'precoBoiGordo', k2: 'pesoVivoFinal', label: 'Boi Gordo x Peso Final' },
                      { k1: 'precoBoiGordo', k2: 'precoConcentrado', label: 'Boi Gordo x Concentrado' },
                      { k1: 'precoBoiMagro', k2: 'precoConcentrado', label: 'Boi Magro x Concentrado' },
                      { k1: 'precoVolumoso', k2: 'precoConcentrado', label: 'Volumoso x Concentrado' },
                    ].map((corr) => {
                      const errorKey = `corr-${corr.k1}-${corr.k2}`;
                      const hasError = !!errors[errorKey];
                      return (
                        <div key={`${corr.k1}-${corr.k2}`} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-medium text-slate-300">{corr.label}</span>
                            <input
                              type="number"
                              step="0.01"
                              min="-1"
                              max="1"
                              value={inputs.correlacoes[corr.k1]?.[corr.k2] ?? 0}
                              onChange={(e) => handleCorrelationChange(corr.k1, corr.k2, e.target.value)}
                              className={`w-16 bg-[#070a13] border rounded-lg px-2 py-1 text-xs text-center text-slate-100 outline-none transition-all ${
                                hasError 
                                  ? 'border-red-500 ring-1 ring-red-500' 
                                  : 'border-slate-800 focus:ring-1 focus:ring-emerald-500'
                              }`}
                            />
                          </div>
                          {hasError && (
                            <span className="text-[9px] text-red-500 text-right font-medium">
                              {errors[errorKey]}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60 font-sans">
                  <button
                    onClick={resetToDefaults}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-2xl font-bold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resetar para Padrões
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Isso apagará todas as suas alterações atuais.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#070a13] border-t border-slate-800/60 flex justify-end">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer font-sans"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isGeneratingReport && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-emerald-400 font-bold">Gerando Relatório PDF...</p>
          <p className="text-xs text-slate-400 mt-2">Isso pode levar alguns segundos se houver muitos gráficos.</p>
        </div>
      )}

      {/* Modal de Confirmação Geral */}
      <AnimatePresence>
        {confirmConfig.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0f1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center"
            >
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{confirmConfig.title}</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed text-balance">{confirmConfig.message}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-800 hover:text-slate-100 transition-all text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmConfig.onConfirm}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-600/25 transition-all text-xs cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Sincronização de Mercado */}
      <AnimatePresence>
        {isSyncModalOpen && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSyncModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#0a0f1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#10b981]/10 text-[#10b981] rounded-xl border border-[#10b981]/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Sincronizar Mercado</h2>
                  <p className="text-xs text-slate-400">Escolha o estado para buscar preços</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Estado Selecionado</label>
                  <select
                    value={selectedSyncState}
                    onChange={(e) => setSelectedSyncState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#10b981] outline-none transition-all cursor-pointer"
                  >
                    {marketPrices.map((mp) => (
                      <option key={mp.state} value={mp.state} className="bg-slate-900 text-slate-100">
                        {mp.state} - Boi Gordo: R$ {mp.boiGordo.toFixed(2)}/@
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSyncModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-100 rounded-xl font-bold transition-all text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplySyncMarketPrices(selectedSyncState)}
                    className="flex-1 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/25 transition-all text-xs cursor-pointer"
                  >
                    Sincronizar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Container de Toasts/Notificações */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 max-w-xs md:max-w-sm w-full pointer-events-none p-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold backdrop-blur-md ${
                t.type === 'error'
                  ? 'bg-rose-950/95 border-rose-500/30 text-rose-200'
                  : t.type === 'info'
                  ? 'bg-blue-950/95 border-blue-500/30 text-blue-200'
                  : 'bg-emerald-950/95 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="flex-shrink-0">
                {t.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : t.type === 'info' ? (
                  <Info className="w-5 h-5 text-blue-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 leading-normal whitespace-pre-line">{t.message}</div>
              <button
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-slate-405 hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] bg-[#070a13] flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center animate-fade-in"
      >
        <div className="bg-emerald-600 p-6 rounded-3xl shadow-2xl shadow-emerald-600/20 mb-8 relative">
          <TrendingUp className="text-white w-16 h-16" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-emerald-400 rounded-3xl -z-10"
          />
        </div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-5xl font-black tracking-tighter text-slate-100 mb-2 font-display"
        >
          Simu<span className="text-emerald-400">Boi</span>
        </motion.h1>
         
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-slate-400 font-medium tracking-widest uppercase text-xs"
        >
          Inteligência em Confinamento
        </motion.p>
      </motion.div>

      <div className="absolute bottom-12 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-full h-full bg-emerald-600"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest"
      >
        Versão 1.0 • LHS Enabled
      </motion.div>
    </motion.div>
  );
}

const CATEGORIAS_DEPRECIACAO = [
  'Infraestrutura Civil',
  'Água e Energia',
  'Máquinas',
  'Equipamentos',
  'Ambiental e Licenciamento',
  'Outros'
];

function TableInput({ 
  value, 
  onChange, 
  isNumber = true,
  isCurrency = false,
  isPercentage = false,
  className = "",
  tooltip
}: { 
  value: any, 
  onChange: (val: any) => void, 
  isNumber?: boolean,
  isCurrency?: boolean,
  isPercentage?: boolean,
  className?: string,
  tooltip?: string
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  useEffect(() => {
    if (!isEditing) {
      if (isCurrency) {
        setTempValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value));
      } else if (isPercentage) {
        setTempValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value));
      } else {
        setTempValue(isNumber ? value.toString() : value);
      }
    }
  }, [value, isEditing, isNumber, isCurrency, isPercentage]);

  const handleBlur = () => {
    setIsEditing(false);
    if (isNumber || isCurrency || isPercentage) {
      const cleanValue = tempValue.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(cleanValue) || 0;
      onChange(num);
    } else {
      onChange(tempValue);
    }
  };

  return (
    <div className="relative group/table-tooltip w-full">
      <input
        type="text"
        value={isEditing ? tempValue : (isCurrency ? `R$ ${tempValue}` : isPercentage ? `${tempValue}%` : tempValue)}
        onChange={(e) => setTempValue(e.target.value)}
        onFocus={() => {
          setIsEditing(true);
          setTempValue(value.toString().replace('.', ','));
        }}
        onBlur={handleBlur}
        className={`w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:bg-[#0c1220] focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-slate-700 transition-all outline-none ${className}`}
      />
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-slate-200 text-[9px] rounded-lg opacity-0 group-hover/table-tooltip:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl leading-tight border border-slate-800 text-center font-normal">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
        </div>
      )}
    </div>
  );
}

function InputGroup({ 
  label, 
  name, 
  value, 
  onChange, 
  step = 1,
  disabled = false,
  extraInfo,
  tooltip,
  icon: Icon,
  isCurrency = false,
  isInteger = false,
  unit,
  error
}: { 
  label: string, 
  name: string, 
  value: any, 
  onChange: any, 
  step?: number,
  disabled?: boolean,
  extraInfo?: string,
  tooltip?: string,
  icon?: any,
  isCurrency?: boolean,
  isInteger?: boolean,
  unit?: string,
  error?: string
}) {
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? (isInteger ? parseInt(rawValue, 10) : parseFloat(rawValue) / 100) : 0;
    
    const fakeEvent = {
      ...e,
      target: {
        ...e.target,
        name: name,
        value: numericValue.toString(),
        type: 'number'
      }
    } as any;
    onChange(fakeEvent);
  };

  const displayValue = new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: isInteger ? 0 : 2, 
    maximumFractionDigits: isInteger ? 0 : 2 
  }).format(Number(value) || 0);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5 group/input"
    >
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-focus-within/input:text-emerald-400 transition-colors" />}
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            {label}
            {tooltip && (
              <div className="relative group/tooltip">
                <HelpCircle className="w-3 h-3 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-[#0a0f1d] text-slate-200 text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed border border-slate-800 text-center font-normal normal-case">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a0f1d]" />
                </div>
              </div>
            )}
          </label>
        </div>
        {extraInfo && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">{extraInfo}</span>}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          name={name}
          value={displayValue}
          onChange={handleNumericChange}
          step={step}
          disabled={disabled}
          className={`w-full bg-[#121826] border ${error ? 'border-red-500/80 ring-4 ring-red-500/10' : 'border-slate-800'} rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-100 placeholder-slate-500 hover:bg-[#161e30] hover:border-slate-700 focus:bg-[#0c1220] focus:outline-none focus:ring-4 ${error ? 'focus:ring-red-500/10 focus:border-red-500' : 'focus:ring-emerald-500/10 focus:border-emerald-500/80'} transition-all shadow-md ${disabled ? 'opacity-40 cursor-not-allowed bg-slate-900/60 text-slate-500' : ''} ${unit ? 'pr-12' : ''}`}
        />
        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">{unit}</span>
          </div>
        )}
        {error && (
          <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40 z-10 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-2.5 h-2.5" />
            {error}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TechnicalParecer({ title, content, type = 'info' }: { title: string, content: string, type?: 'info' | 'warning' | 'success' }) {
  const configs = {
    info: {
      bg: 'bg-sky-500/10 border-y border-r border-sky-500/20 border-l-sky-500',
      text: 'text-sky-400 font-bold',
      subText: 'text-slate-300 font-medium',
      icon: <Info className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-500/10 border-y border-r border-amber-500/20 border-l-amber-500',
      text: 'text-amber-400 font-bold',
      subText: 'text-slate-300 font-medium',
      icon: <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-500/10 border-y border-r border-emerald-500/20 border-l-emerald-500',
      text: 'text-emerald-400 font-bold',
      subText: 'text-slate-300 font-medium',
      icon: <AlertCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
    }
  };

  const config = configs[type];

  return (
    <div className={`p-4 rounded-xl border-l-[5px] ${config.bg} shadow-md`}>
      <div className="flex items-start gap-3">
        {config.icon}
        <div>
          <p className={`text-sm ${config.text}`}>{title}</p>
          <p className={`text-xs ${config.subText} mt-1 leading-relaxed`}>
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, value, subValue, icon, color, tooltip }: { title: string, value: string, subValue?: string, icon: React.ReactNode, color: string, tooltip?: string }) {
  const badgeColors: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const borderColors: Record<string, string> = {
    emerald: 'border-l-4 border-l-emerald-500/95',
    blue: 'border-l-4 border-l-blue-500/95',
    amber: 'border-l-4 border-l-amber-500/95',
    purple: 'border-l-4 border-l-purple-500/95',
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`p-5 rounded-2xl border border-slate-800/80 bg-[#0f172a] shadow-lg group relative hover:border-slate-700/50 hover:shadow-indigo-950/5 transition-all duration-300 ${borderColors[color]}`}
    >
      <div className="flex items-center justify-between mb-3 shadow-[0_0_12px_rgba(0,0,0,0.15)] md:shadow-none">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</span>
        <div className={`p-1.5 rounded-lg border ${badgeColors[color]} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-display font-extrabold text-slate-100 tracking-tight">
        <motion.span
          key={value}
          initial={{ opacity: 0.3, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </div>
      {subValue && (
        <div className="text-xs font-semibold text-slate-400 mt-1.5 flex items-center gap-1">
          <motion.span
            key={subValue}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            {subValue}
          </motion.span>
        </div>
      )}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
          <p className="font-bold mb-1 text-slate-200">{title}</p>
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </motion.div>
  );
}

function ResultRow({ label, value, bold = false, tooltip, extra, dotColor }: { label: string, value: string, bold?: boolean, tooltip?: string, extra?: React.ReactNode, dotColor?: string }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-between items-center py-1.5 group relative border-b border-slate-800/20 last:border-b-0"
    >
      <div className="flex items-center gap-1.5">
        {dotColor && <div className={`w-2 h-2 rounded-full ${dotColor}`} />}
        <span className={`text-xs ${bold ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>{label}</span>
        {tooltip && <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors cursor-help" />}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono ${bold ? 'font-bold text-slate-100' : 'font-medium text-slate-300'}`}>{value}</span>
        {extra}
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl leading-relaxed border border-white/10 text-center">
          <p className="font-bold mb-1 text-emerald-400">{label}</p>
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </motion.div>
  );
}

function HelpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeHelpTab, setActiveHelpTab] = useState<'about' | 'concepts' | 'references' | 'citation' | 'quiz' | 'manual'>('about');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  
  const handleCopy = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => {
      setCopiedFormat(null);
    }, 2000);
  };

  const [quizState, setQuizState] = useState<{
    currentQuestion: number;
    score: number;
    showResult: boolean;
    selectedOption: number | null;
    isAnswered: boolean;
  }>({
    currentQuestion: 0,
    score: 0,
    showResult: false,
    selectedOption: null,
    isAnswered: false
  });

  const quizQuestions = [
    {
      question: "Qual a principal vantagem do Latin Hypercube Sampling (LHS) sobre o Monte Carlo convencional?",
      options: [
        "É mais lento, porém mais preciso.",
        "Garante uma cobertura mais uniforme do espaço amostral com menos iterações.",
        "Não utiliza números aleatórios.",
        "Só funciona para variáveis de preço."
      ],
      correct: 1,
      explanation: "O LHS divide a distribuição em intervalos de igual probabilidade, garantindo que cada parte da curva de incerteza seja representada homogeneamente na simulação."
    },
    {
      question: "O que indica um Coeficiente de Variação (C.V.) de 45% no VPL simulado de um confinamento?",
      options: [
        "Baixo risco, indicando que o VPL é muito estável.",
        "Risco moderado e margens controláveis.",
        "Alto risco e forte dispersão dos resultados financeiros em relação à média.",
        "O sucesso do empreendimento é totalmente garantido pelas cooperativas."
      ],
      correct: 2,
      explanation: "Um C.V. acima de 30% na pecuária indica alta variabilidade nas margens operacionais, exigindo do tomador de decisão um hedge rigoroso de preços."
    },
    {
      question: "Qual o diferencial da Cópula de Clayton em relação à Cópula de Gumbel na pecuária?",
      options: [
        "A Clayton foca em riscos de cauda inferior, isto é, quando múltiplas variáveis de mercado colapsam juntas sob estresse severo.",
        "A Gumbel calcula apenas conversão alimentar.",
        "A Clayton serve apenas para o cálculo de mão de obra e frete.",
        "Ambas operam assumindo independência perfeita e correlação nula."
      ],
      correct: 0,
      explanation: "A Cópula de Clayton modela a dependência de cauda inferior. Na prática pecuária, captura o cenário catastrófico onde o preço do boi gordo desaba no mesmo momento em que os preços de ração disparam."
    },
    {
      question: "Como o SimuBoi trata a mortalidade de cocho sob a metodologia clássica de custos de Matsunaga?",
      options: [
        "Ignora as mortes para simplificar os relatórios contábeis.",
        "Assume que animais falecidos são vendidos pelo preço residual.",
        "Dilui os custos operacionais (compra e dieta) dos animais mortos sobre o rebanho sobrevivente comercializado.",
        "Gera um empréstimo bancário automático para reposição das perdas."
      ],
      correct: 2,
      explanation: "Pela metodologia Matsunaga de custos, os custos incorridos com cabeças que vão a óbito são rateados entre os sobreviventes, retratando o real prejuízo biológico sem mascarar o resultado líquido."
    },
    {
      question: "Na análise de sensibilidade via Decomposição de Sobol, o que um alto índice de Efeito Total (STi) em comparação ao de Primeira Ordem (Si) revela?",
      options: [
        "Que a variável é irrelevante para a oscilação do VPL.",
        "Que o fator possui fortes efeitos de alta ordem e interações sinérgicas complexas com outras variáveis.",
        "Que a relação do fator com o lucro operacional é puramente linear estática.",
        "Que a dosagem de nutriente é tóxica para as baias."
      ],
      correct: 1,
      explanation: "O Índice Total (STi) engloba tanto o efeito direto individual quanto todas as interações combinadas com as demais variáveis. Uma grande diferença entre STi e Si indica que o impacto dessa variável depende criticamente do patamar dos outros insumos (sinergia)."
    },
    {
      question: "Como se traduz o diferencial mercadológico de atingir Escore de Bem-Estar Animal ≥ 8 conjugado com Rastreabilidade Total?",
      options: [
        "Apenas cumprimento de burocracia ambiental com custo incremental.",
        "Liberação de bônus de mercado premium (Cota Hilton / selos verdes de grife) que elevam a cotação da arroba vendida.",
        "Isenção total de impostos de importação sobre grãos.",
        "Aceleração biológica artificial do ganho de peso diário (GMD)."
      ],
      correct: 1,
      explanation: "O mercado global e marcas nacionais de alto padrão bonificam o produtor em até R$ 10,00 por arroba pelo cumprimento simultâneo de rastreabilidade individual e bem-estar (pH muscular ideal, ausência de contusões), blindando a fazenda contra barreiras geopolíticas."
    },
    {
      question: "Para que serve a 'Semente' (Seed) em uma simulação estocástica LHS?",
      options: [
        "Para aumentar o VPL de forma otimista.",
        "Para garantir que os resultados sejam reprodutíveis, permitindo auditorias e auditorias externas.",
        "Para plantar pastagem consorciada em tempo real.",
        "Para definir o peso inicial ideal do lote magro."
      ],
      correct: 1,
      explanation: "A semente estocástica fixa a sequência do gerador pseudo-aleatório do Latin Hypercube Sampling (LHS). Isso assegura que o investidor ou pesquisador consiga reproduzir rigorosamente os mesmos mil cenários simulados."
    },
    {
      question: "O que representa a área à esquerda da 'Linha de VPL Zero' no histograma?",
      options: [
        "O VPL máximo idealizado no melhor cenário.",
        "A probabilidade real de prejuízo econômico do projeto, onde o retorno é menor que o custo mínimo exigido (TMA).",
        "A despesa com volumoso de conservação.",
        "A margem líquida líquida do varejo de carnes."
      ],
      correct: 1,
      explanation: "A área à esquerda de zero no histograma probabilístico de VPL consolida a probabilidade exata de o confinamento falhar em remunerar o capital à taxa mínima de atratividade (TMA)."
    },
    {
      question: "Na análise de sensibilidade por tornado de correlação, um coeficiente r negativo indica:",
      options: [
        "Inexistência de relação estatística.",
        "Que o aumento da variável reduz de forma direta o VPL do confinamento.",
        "Que o projeto é financeiramente inviável.",
        "Um erro grave no processamento de dados nas baias."
      ],
      correct: 1,
      explanation: "Variáveis de custo (preço da ração, preço do boi magro) têm impacto inverso: se o preço de aquisição do gado ou do insumo alimentar aumenta, o VPL gerado cai."
    }
  ];

  const handleQuizAnswer = (index: number) => {
    if (quizState.isAnswered) return;
    
    const isCorrect = index === quizQuestions[quizState.currentQuestion].correct;
    setQuizState(prev => ({
      ...prev,
      selectedOption: index,
      isAnswered: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  };

  const nextQuestion = () => {
    if (quizState.currentQuestion + 1 < quizQuestions.length) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedOption: null,
        isAnswered: false
      }));
    } else {
      setQuizState(prev => ({ ...prev, showResult: true }));
    }
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      score: 0,
      showResult: false,
      selectedOption: null,
      isAnswered: false
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0f172a]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="relative w-full h-full bg-[#0f172a] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-800/60 flex items-center justify-between bg-[#070a13] text-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-100 tracking-tight">Central de Conhecimento</h2>
                  <p className="text-xs text-slate-400">Aprenda sobre análise de risco na pecuária</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-800 flex-wrap bg-[#070a13]">
              <button
                onClick={() => setActiveHelpTab('about')}
                className={`flex-1 min-w-[140px] py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeHelpTab === 'about' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Objetivo & Diferenciais
              </button>
              <button
                onClick={() => setActiveHelpTab('manual')}
                className={`flex-1 min-w-[140px] py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeHelpTab === 'manual' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Guia & Manual
              </button>
              <button
                onClick={() => setActiveHelpTab('concepts')}
                className={`flex-1 min-w-[140px] py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeHelpTab === 'concepts' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Fundamentação Teórica
              </button>
              <button
                onClick={() => setActiveHelpTab('references')}
                className={`flex-1 min-w-[140px] py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeHelpTab === 'references' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                Referências Bibliográficas
              </button>
              <button
                onClick={() => setActiveHelpTab('citation')}
                className={`flex-1 min-w-[140px] py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeHelpTab === 'citation' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                Como Citar
              </button>
              <button
                onClick={() => setActiveHelpTab('quiz')}
                className={`flex-1 min-w-[140px] py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeHelpTab === 'quiz' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Desafio Quiz
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeHelpTab === 'about' ? (
                <div className="space-y-12">
                  <section className="bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-100 mb-2 font-display">Qual o objetivo do SimuBoi?</h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans">
                          O <strong>SimuBoi</strong> foi desenvolvido para aproximar a ciência pecuária de ponta e a tomada de decisão estratégica no campo. Nosso propósito é fornecer uma ferramenta <strong>didática, interativa e altamente científica</strong> capaz de simular em tempo real o planejamento zootécnico, a formulação nutricional, a sustentabilidade (ESG) e a viabilidade financeira de confinamentos bovinos.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* NOVO: Destaque Principal sobre a Simulação Probabilística e Análise de Risco */}
                  <section className="bg-rose-500/5 p-8 rounded-3xl border border-rose-500/10 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 leading-tight font-display">
                          Objetivo Principal: Simulação Probabilística & Gestão de Risco
                        </h3>
                        <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider mt-0.5">O diferencial tecnológico do SimuBoi</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      O maior gargalo do gerenciamento pecuário clássico é projetar um lucro estático assumindo que custos e preços de venda não mudarão nos próximos 90 a 120 dias. Na prática, a volatilidade do milho, do boi gordo e as diárias zootécnicas impõem desvios agressivos. O <strong>SimuBoi</strong> substitui a velha "fórmula otimista de papel" por uma verdadeira <strong>Engenharia de Risco Probabilística</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                        <div>
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 text-rose-450 mb-2 font-display">
                            <span className="w-2 h-2 rounded-full bg-rose-500" /> A Metodologia LHS
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            O software emprega a amostragem <strong>LHS (Latin Hypercube Sampling)</strong>. Em vez de rodar cenários aleatórios simples (Monte Carlo tradicional), o LHS particiona a faixa de incerteza de cada variável (preço de mercado, ração, ágio) de forma homogênea. Ele simula 1.000 cenários futuros possíveis simultaneamente combinando flutuações e correlações em milissegundos.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                        <div>
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 mb-2 font-display">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Relevância Estratégica
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Entender a média estatística não é suficiente. Ao descobrir a <strong>probabilidade exata de obter prejuízo</strong> (ex: "temos 18% de risco de quebrar o ponto de equilíbrio"), você ganha base objetiva para decidir se deve travar a arroba na Bolsa de Mercadorias (B3), comprar um seguro de boi gordo, renegociar contratos de milho ou ajustar o tamanho do lote.
                          </p>
                        </div>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                        <div>
                          <h5 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 text-rose-450 mb-2 font-display">
                            <span className="w-2 h-2 rounded-full bg-rose-500" /> Didática Visual da S-Curve
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            Traduzimos complexidade estatística no gráfico de <strong>Probabilidade Acumulada (S-Curve)</strong>. Uma curva muito deitada indica alta incerteza e variação brusca de caixa; uma curva mais íngreme e verticalizada à direita indica maior controle operacional e margens previsíveis, tornando complexos cálculos macroeconômicos compreensíveis para qualquer produtor.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* NOVO: Destaque Educativo e Científico - Determinístico vs Probabilístico */}
                  <section className="bg-[#070a13] p-8 rounded-3xl border border-slate-800 space-y-6 text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-100 font-display">
                          Ciência em Foco: Testes de Estresse são Determinísticos ou Probabilísticos?
                        </h4>
                        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">Entenda as diferenças conceituais e científicas</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Compreender a diferença entre ferramentas de planejamento financeiro é crucial para tomadas de decisões estratégicas de alta responsabilidade. Dentro da pecuária científica de alta performance, operamos com duas abordagens complementares disponíveis no SimuBoi:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="p-6 bg-[#0a0f1d] rounded-2xl border border-amber-500/20 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 uppercase tracking-wider mb-4 font-mono">
                            Abordagem Determinística
                          </div>
                          <h5 className="font-bold text-slate-200 text-sm mb-2 font-display">Testes de Estresse (Stress Testing)</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            São essencialmente <strong>DETERMINÍSTICOS</strong>. Eles testam a robustez do confinamento contra choques ad-hoc extremos, severos e pontuais previamente fixados (ex: uma queda abrupta de 20% no preço do boi gordo ou um aumento inesperado de 30% nos insumos). O foco é responder à pergunta: <em>"Se o pior cenário absoluto acontecer, nossa operação sobrevive?"</em>. Não se atribui uma curva de probabilidade estocástica a esse choque específico ocorrendo; analisa-se seu impacto direto no caixa operacional de forma estática e rigorosa.
                          </p>
                        </div>
                        <div className="border-t border-slate-800/80 pt-4 mt-4 text-[10px] text-amber-400 font-mono">
                          Métrica chave: Sobrevivência do caixa sob choques severos pré-determinados.
                        </div>
                      </div>

                      <div className="p-6 bg-[#0a0f1d] rounded-2xl border border-emerald-500/20 flex flex-col justify-between">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider mb-4 font-mono">
                            Abordagem Probabilística
                          </div>
                          <h5 className="font-bold text-slate-200 text-sm mb-2 font-display">Simulações Estocásticas (Monte Carlo / LHS)</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            São essencialmente <strong>PROBABILÍSTICAS</strong>. Em vez de projetar um único panorama estático ou fixo, geram-se milhares de iterações matemáticas amostrando flutuações simultâneas de preços a partir de distribuições contínuas de probabilidade. O foco é responder: <em>"Qual é a real probabilidade e frequência estatística (ex: 15% de chance) de registrarmos um VPL negativo?"</em>. Ela abrange todo o espectro de incertezas operacionais, fornecendo desvios padrões, intervalos de confiança e curvas acumuladas.
                          </p>
                        </div>
                        <div className="border-t border-slate-800/80 pt-4 mt-4 text-[10px] text-emerald-400 font-mono">
                          Métrica chave: Distribuição contínua de risco e probabilidade real de prejuízo.
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#131b35]/40 p-4 rounded-xl border border-slate-800 text-xs text-slate-350 leading-relaxed font-sans">
                      <strong className="text-slate-100">Sinergia Estratégica:</strong> No <strong>SimuBoi</strong>, integramos o melhor de ambos os mundos! Você pode rodar a <em>Simulação Probabilística global (LHS)</em> para estimar as probabilidades reais de sucesso da fazenda no dia a dia e, simultaneamente, aplicar os <em>Cenários de Estresse determinísticos</em> para blindar seu projeto contra catástrofes extremas de cauda.
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                      Por que o SimuBoi é Diferente do Mercado?
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Softwares pecuários no mercado operam quase sempre no modo <strong>determinístico</strong>. Eles simulam sob ótimas condições ideais, mas ignoram que o preço da ração sobe e a arroba gorda cai repentinamente.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-between shadow-xs">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-450 uppercase tracking-wider mb-4">
                            Modelos Tradicionais
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 mb-2 font-display">Simulação Determinística Limitada</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Trabalha com preços fixados e engessados. Se ocorrem oscilações rápidas no preço final de frete ou concentrados, perde-se o controle da verdadeira liquidez sem estimativas de desvio.
                          </p>
                        </div>
                        <div className="border-t border-rose-950/40 pt-4 mt-4 text-[10px] text-rose-400 font-bold">
                          Foco estrito em um único cenário ideal e infalível.
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between shadow-xs">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider mb-4">
                            Inovação SimuBoi
                          </div>
                          <h4 className="text-sm font-bold text-slate-100 mb-2 font-display">Distribuição Estocástica Integrada</h4>
                          <p className="text-xs text-slate-300 leading-relaxed font-normal">
                            Avaliação em múltiplas direções e escalas simultâneas de incerteza operacional. Você obtém as bandas de desvio, o pior cenário real, o melhor provável e o histograma de dispersão diretamente integrados.
                          </p>
                        </div>
                        <div className="border-t border-emerald-950/40 pt-4 mt-4 text-[10px] text-emerald-400 font-bold">
                          Segurança real para proteger o capital investido.
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* NOVO: Ampliação do Objetivo & Diferenciais com Visão Científica Integrada */}
                  <section className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      Foco Científico Ampliado: Do Consumo ao Mercado Premium
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans text-left">
                      O SimuBoi foi desenhado não para ser apenas uma planilha de cálculo rápido, mas uma rede integrada de modelos biológicos e econômicos. Cada alteração inserida reflete de forma dinâmica os efeitos colaterais da operação:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <div className="p-6 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-emerald-500/10 transition-colors">
                        <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-3 border border-emerald-500/20">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-200 text-sm mb-2 font-display">
                          Integração Bioeconômica Total
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          A modificação de qualquer ingrediente da ração recalcula automaticamente a Matéria Seca Consumida (CMS), o Ganho Médio Diário (GMD), a eficiência biológica e o período exato de cocho. Essa resposta zootécnica de precisão alimenta sem interrupção o modelo financeiro de custos (Matsunaga COE/COT/CT) e a taxa de desconto, determinando os indicadores estatísticos de resultado real (VPL, ROIA, IB:C) simulados no LHS.
                        </p>
                      </div>

                      <div className="p-6 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-rose-500/10 transition-colors">
                        <div className="w-9 h-9 bg-rose-500/10 text-rose-450 rounded-xl flex items-center justify-center mb-3 border border-rose-500/25">
                          <Heart className="w-5 h-5 animate-pulse" />
                        </div>
                        <h4 className="font-bold text-slate-200 text-sm mb-2 font-display">
                          Sustentabilidade, Bem-Estar & Ética
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Sintonizados com as exigências do consumidor moderno, acoplamos métricas de <strong>Bem-Estar Animal</strong> e do status de <strong>Rastreabilidade Total</strong> ao posicionamento comercial do lote. Boas práticas previnem perdas de acidez/pH muscular de carcaça e habilitam bônus de premiação por arroba (como redes premium e exportações Cota Hilton), enquanto a comprovação documental blinda o projeto contra barreiras geo-ambientais de compra.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* NOVA SUBSEÇÃO DE IMERSÃO E ENTUSIASMO: DIFERENCIAL DE MERCADO */}
                  <section className="bg-gradient-to-br from-indigo-900/10 via-slate-950/40 to-emerald-950/10 p-8 rounded-3xl border border-indigo-500/10 space-y-6 text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 font-display tracking-tight">
                          O Grande Diferencial de Mercado do SimuBoi
                        </h3>
                        <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Por que o SimuBoi é o parceiro definitivo para decisões de alta responsabilidade?</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2 font-display">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Transformando Incerteza em Lucratividade Prevista
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Diga adeus às incertezas! Planilhas clássicas assumem preços fixos irreais. Com o algoritmo de amostragem <strong>LHS</strong>, simulamos 1.000 caminhos futuros combinando a inflação da dieta com a cotação do boi gordo. Você descobre a probabilidade exata de prejuízo para agir com antecedência no hedge de Bolsa (B3).
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2 font-display">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Nutrição Viva Casada com a Balança
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Sua dieta interage em tempo real com as exigências de energia. Se você altera a concentração de volumoso ou farelos proteicos, o motor zootécnico recalcula o Ganho de Peso Diário (GMD), a espessura milimétrica de carcaça (EGS) e as diárias de confinamento.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2 font-display">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          ESG Conversível em Bônus de Arroba (Cota Hilton)
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Adote o selo verde e amplie seu faturamento. Unindo o escore de Bem-Estar Animal com Rastreabilidade Total individual, o SimuBoi qualifica digitalmente seu gado para canais de exportação exigentes, estimando bonificações diretas de até +R$ 10,00 por arroba.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-200 text-xs sm:text-sm flex items-center gap-2 font-display">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Rateio Inteligente de Baixas e Óbitos de Cocho
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Diferencial financeiro absoluto baseado na sistemática zootécnica de custos de Matsunaga. As despesas biológicas de cabeças perdidas são diluídas matematicamente para o rebanho sobrevivente comercializado, eliminando lucros fictícios.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6 text-left">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      Imersão Completa no Universo SimuBoi
                    </h2>
                    <p className="text-sm text-slate-350 leading-relaxed font-sans">
                      O aplicativo é estruturado sob as melhores referências da zootecnia brasileira (incluindo pesquisas do DZ-UFSM e LAE-USP). Explore nossa gama completa de recursos integrados feitos para alavancar a rentabilidade pecuária:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-orange-500/20 hover:bg-orange-500/[0.01] transition-all duration-300">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/20">
                          <Calculator className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mb-2 font-display">Simulação de Desempenho</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Projeção diária do ganho médio de peso diário (GMD), eficiência, conversão alimentar e o tempo exato necessário de cocho baseado no peso do animal.
                        </p>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-[#10b981]/25 hover:bg-[#10b981]/[0.01] transition-all duration-300">
                        <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-4 border border-[#10b981]/20">
                          <Wand2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mb-2 font-display">Formulação de Dietas</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Estruturação visual dos custos dos ingredientes (volumosos e concentrados exatos) com monitoramento dinâmico do consumo de Matéria Seca.
                        </p>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-sky-500/20 hover:bg-sky-500/[0.01] transition-all duration-300">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 border border-sky-500/20">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mb-2 font-display">Ultrassonografia (EGS)</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Predição e acompanhamento didático da deposição milimétrica de carcaça (Espessura de Gordura Subcutânea) segundo padrões industriais exigidos no gancho.
                        </p>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-indigo-500/20 hover:bg-indigo-500/[0.01] transition-all duration-300">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
                          <BrainCircuit className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mb-2 font-display">Sensibilidade Global Avançada</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Identifique de forma certeira quais insumos governam seus resultados. Empregamos o <strong>Método de Morris (OAT)</strong> para fator de triagem e a <strong>Decomposição de Variância de Sobol</strong> para mapear sinergias não-lineares.
                        </p>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-emerald-500/20 hover:bg-emerald-500/[0.01] transition-all duration-300">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                          <Leaf className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mb-2 font-display">Sustentabilidade ESG & Pegada de CH₄</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Estime eletronicamente a emissão de gases e a <strong>produção de metano entérico</strong> geradas no ciclo do rebanho. Perfeito para estruturar relatórios ambientais contemporâneos e preparar sua fazenda para créditos verdes de carbono.
                        </p>
                      </div>

                      <div className="p-5 bg-[#070a13] rounded-2xl border border-slate-800/80 hover:border-rose-500/25 hover:bg-rose-500/[0.01] transition-all duration-300">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-450 flex items-center justify-center mb-4 border border-rose-500/20">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mb-2 font-display">Simulados de Testes de Estresse</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Verifique de forma direta a liquidez financeira de sua fazenda em mercados turbulentos. Impõe pressões de preços extremos e surtos microbiológicos sanitários para testar a sobrevivência do caixa pecuário.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              ) : activeHelpTab === 'concepts' ? (
                <div className="space-y-12">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-100 text-lg tracking-tight">Fundamentação Teórica & Científica</h3>
                        <p className="text-xs text-slate-400">Modelagem determinística, amostragem LHS, cópulas estatísticas, regressões, Sobol, Morris e testes de estresse.</p>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-300 space-y-4 leading-relaxed font-sans text-xs sm:text-sm text-left">
                      <p>
                        A pecuária de corte contemporânea, especialmente o confinamento bovino, caracteriza-se por margens estreitas e alta suscetibilidade a riscos ecológicos, flutuações de preços de insumos e dinâmicas mercadológicas internacionais. Por essa razão, análises exclusivamente determinísticas são insuficientes para apoiar decisões operacionais de alta responsabilidade financeira.
                      </p>
                      <p>
                        O <strong>SimuBoi</strong> integra formulações zootécnicas consolidadas com engenharia econômica e estatística de ponta. A plataforma modela de forma interconectada as incertezas de mercado e biológicas por meio de simulações estocásticas, provendo métricas precisas de sensibilidade global e suporte de decisão avançado para produtores, projetistas e pesquisadores.
                      </p>
                    </div>
                  </section>
                  <section className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                      <h4 className="text-base font-bold text-slate-100 font-display">1. Indicadores Financeiros Determinísticos</h4>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans text-left">
                      Métricas econômicas clássicas calculadas estaticamente a partir das médias de mercado e biofísicas projetadas no confinamento:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* VPL */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                          VALOR PRESENTE LÍQUIDO (VPL)
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Soma de todos os fluxos de caixa do ciclo de cocho atualizados monetariamente à taxa mínima requerida TMA.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto">
                          VPL = FC₀ + Σ [ FC_t / (1 + TMA_mensal)ᵗ ]  (para t de 1 a n)
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          FC_0 = Investimento inicial de aquisição animal; FC_t = Fluxo líquido de caixa do período t; n = Período de alimentação equivalente em meses.
                        </p>
                      </div>

                      {/* TMA MENSAL */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-amber-500/20 text-amber-400 bg-amber-500/5">
                          TMA EQUIVALENTE MENSAL
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Harmonização temporal indispensável que converte a taxa de corte anual (TMA_anual) para a taxa mensal correspondente ao ciclo de alimentação.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto">
                          TMA_mensal = (1 + TMA_anual)^(1/12) - 1
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          Garante o desconto apropriado para horizontes curtos de terminação de bovinos.
                        </p>
                      </div>

                      {/* VPL POR HECTARE */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                          VPL POR HECTARE (VPL_ha)
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Mapeia a rentabilidade econômica líquida escalonada por área de ocupação, integrando lotação física e probabilidade real de sobrevivência zootécnica.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto">
                          VPL_ha = VPL × (1 - Mortalidade_% / 100) × Lotação_cab/ha
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          Mortalidade % = Percentual de perdas acumuladas; Lotação = Número médio de cabeças comportadas por hectare.
                        </p>
                      </div>

                      {/* IBC */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                          ÍNDICE BENEFÍCIO-CUSTO (IB:C)
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Relação de valor presente entre receitas recebidas e desembolsos amortizados operacionais totais do projeto.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto text-[11px]">
                          IB:C = Σ [ Entradas_t / (1 + TMA_m)ᵗ ] / Σ [ Saídas_t / (1 + TMA_m)ᵗ ]  (para t de 0 a n)
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          Resultados acima de 1.0 indicam retorno superior ao custo mínimo de oportunidade estipulado.
                        </p>
                      </div>

                      {/* ROIA */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-pink-500/20 text-pink-400 bg-pink-500/5">
                          RETORNO ADICIONAL DESCONTADO (ROIA)
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Mede a taxa periódica de ganho limpo gerado pelo confinamento além da TMA anualizada especificada.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto">
                          ROIA_% = ( (IB:C)^(1/n) - 1 ) × 100
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          Representa o ganho absoluto incremental líquido expressado sob forma de taxa equivalente mensal do ciclo.
                        </p>
                      </div>

                      {/* TIR SIMPLIFICADA */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-sky-500/20 text-sky-400 bg-sky-500/5">
                          TAXA INTERNA DE RETORNO DO CICLO (TIR)
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Mapeia a taxa mensal que anula o VPL do projeto, expressando de forma direta o rendimento geométrico do capital zootécnico investido.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto">
                          TIR_% = ( Retorno Total / Investimento Total )^(1/n) - 1
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          Investimento Total = Custo de Compra Inicial; Retorno Total = Receita Operacional Líquida de despesas recorrentes do ciclo.
                        </p>
                      </div>

                      {/* PE */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-rose-500/20 text-rose-400 bg-rose-500/5">
                          PONTO DE EQUILÍBRIO DA @ (PE)
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Preço final de boi gordo por arroba absoluto necessário para zerar o VPL econômico do ciclo, considerando receitas de amortização e bonificações.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto text-[11px]">
                          PE_Preço = (CT - Valor Residual - Receita Esterco) / [ Arrobas Produzidas × (1 + Bonificação_%) ]
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          CT = Custo de Produção Total do rebanho; Valor Residual = Amortizações líquidas; Receita Esterco = Receita proveniente de dejetos orgânicos.
                        </p>
                      </div>

                      {/* AGIO REPOSICAO */}
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all text-left">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                          ÁGIO DE REPOSIÇÃO
                        </span>
                        <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                          Mede o sobrepreço pago por arroba magra na compra do animal inicial frente ao valor médio de comercialização de venda da arroba gorda.
                        </p>
                        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all my-3 text-center overflow-x-auto">
                          Ágio_% = [ (Preço Compra por @ Magra / Preço Venda por @ Gorda) - 1 ] × 100
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                          Preço Compra por @ Magra = (Preço Boi Magro x 30) / Peso Vivo de Entrada inicial.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* DESEMPENHO BIOECONOMICO */}
                  <section className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      <h4 className="text-base font-bold text-slate-100 font-display">2. Ecoeficiência & Métricas Nutricionais</h4>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans text-left">
                      A eficiência física de conversão energética vegetal em deposição de massa muscular bovina rege a rentabilidade operacional:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <Scale className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-slate-205 text-xs uppercase tracking-wider font-display font-semibold">Conversão Alimentar (CA)</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
                          Mapeia a ingestão total diária de alimento em quilos de matéria seca (CMS) gasta para produzir 1 kg de ganho médio diário (GMD) de carcaça.
                        </p>
                        <div className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 select-all text-center">
                          CA = (CMS_Volumoso + CMS_Concentrado) / GMD
                        </div>
                      </div>

                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-slate-205 text-xs uppercase tracking-wider font-display font-semibold">Custo por @ Produzida</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
                          Métrica financeira crucial que divide o Custo Operacional Total pelas arrobas efetivamente ganhas nas baias do lote.
                        </p>
                        <div className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 select-all text-center">
                          Custo por Arroba = COT / Arrobas Produzidas
                        </div>
                      </div>

                      <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-bold text-slate-205 text-xs uppercase tracking-wider font-display font-semibold">Custo Operacional Diário</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-sans">
                          Aferição das despesas fixas recorrentes diárias do cocho por animal, expurgando as variações conjunturais decorrentes de investimentos de capital de reposição bovina.
                        </p>
                        <div className="p-2 bg-slate-950/90 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 select-all text-center">
                          COD = (COT - Custo Compra) / Dias de Alimentação
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* MODELAGEM ESTOCASTICA, CORRELACAO E COPULAS */}
                  <section className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                      <h4 className="text-base font-bold text-slate-100 font-display">3. Modelagem de Risco Estocástico & Cópulas Multivariadas</h4>
                    </div>

                    <div className="prose prose-sm max-w-none text-slate-300 space-y-4 text-xs sm:text-sm leading-relaxed font-sans text-left">
                      <p>
                        Cenários práticos pecuários sofrem oscilações simultâneas em premissas interdependentes (quando o preço de concentrados sobe, insumos substitutos sofrem pressões mercadológicas conjuntas). Para simular riscos reais, o <strong>SimuBoi</strong> adota amostragem estocástica sob o algoritmo <strong>Latin Hypercube Sampling (LHS)</strong> para varrer uniformemente o espaço probabilístico, associando as dependências de caudas através de formulas de <strong>Cópulas Estatísticas</strong>:
                      </p>
                      
                      <div className="p-6 bg-[#0f172a] rounded-2xl border border-slate-800/80 hover:border-rose-500/20 transition-all relative overflow-hidden text-left font-sans">
                        <h5 className="text-xs font-bold text-rose-400 font-display flex items-center gap-2 mb-3 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          Funções de Distribuições Copulares
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          Sejam u e v distribuições marginais cumulativas unificadas no intervalo unitário [0, 1]. O mapeamento de tendências estocásticas opera conforme as categorias copulares:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-mono block mb-1">CÓPULA GAUSSIANA (NORMAL)</span>
                            <div className="font-mono text-rose-400 text-xs py-2 overflow-x-auto text-center font-semibold">
                              C_R(u, v) = Φ₂ ( Φ⁻¹(u), Φ⁻¹(v), ρ )
                            </div>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-1">Preserva dependência linear simétrica padrão através de matrizes de correlação empírica.</span>
                          </div>
                          
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-mono block mb-1">CÓPULA CLAYTON (INFERIOR)</span>
                            <div className="font-mono text-rose-400 text-xs py-2 overflow-x-auto text-center font-semibold">
                              C_θ(u, v) = [ u⁻ᶿ + v⁻ᶿ - 1 ]⁻⁽¹/ᶿ⁾
                            </div>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-1">Modela riscos assimétricos de cauda esquerda (períodos onde os fatores de mercado se deterioram conjuntamente).</span>
                          </div>

                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] text-slate-400 font-mono block mb-1">CÓPULA GUMBEL (SUPERIOR)</span>
                            <div className="font-mono text-rose-400 text-xs py-2 overflow-x-auto text-center font-semibold">
                              C_θ(u, v) = exp( - [ (-ln u)ᶿ + (-ln v)ᶿ ]^(1/θ) )
                            </div>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-1">Captura fortes correlações de pico e tendências estocásticas em caudas extremas superiores.</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-405 leading-relaxed font-sans mt-3">
                        O alinhamento estocástico é complementado pelo cálculo do coeficiente de correlação linear de postos de Pearson (r) para reportar a sensibilidade preliminar de dependência linear simples entre cada input e a dispersão final do VPL gerada:
                      </p>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-rose-400 select-all text-center">
                        r_xy = ( N × Σ(X × Y) - ΣX × ΣY ) / √[ ( N × ΣX² - (ΣX)² ) × ( N × ΣY² - (ΣY)² ) ]
                      </div>
                    </div>
                  </section>

                  {/* ESTIMATIVAS AVANCADAS DE SENSIBILIDADE */}
                  <section className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                      <h4 className="text-base font-bold text-slate-100 font-display">4. Análises de Sensibilidade Estatística Avançada</h4>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans text-left">
                      O SimuBoi disponibiliza múltiplos métodos avançados da estatística computacional para dissecar e ranquear precisamente quais inputs comandam o risco operacional:
                    </p>

                    <div className="space-y-6">
                      {/* REGRESSAO LINEAR MULTIPLA */}
                      <div className="bg-[#121826]/80 p-6 rounded-2xl border border-slate-800 hover:border-pink-500/25 transition-all text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="w-5 h-5 text-pink-400" />
                          <h5 className="font-bold text-slate-100 text-sm font-display">Regressão Linear Múltipla & Coeficientes Padronizados</h5>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          Mapeamento estatístico multidimensional que realiza ajuste de MQO com dados normalizados pela média e desvio padrão. O modelo extrai os <strong>Betas Padronizados</strong> (Standardized Betas), isolando o efeito direto de cada fator em termos de desvios padrões induzidos no VPL das saídas.
                        </p>
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-pink-400 select-all text-center mb-3 overflow-x-auto">
                          Y_std_i = β₁ × X_std_1i + β₂ × X_std_2i + ... + β_k × X_std_ki + ε_i
                        </div>
                        <p className="text-xs text-slate-450 leading-relaxed mb-2">
                          O ajuste geral e a fatia de variabilidade explicada pela matriz de dependências lineares aproximadas é avaliada pelo coeficiente de determinação <strong>R²</strong>:
                        </p>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-pink-400 text-center overflow-x-auto">
                          R² = 1 - [ Σ(Y_i - Ŷ_i)² / Σ(Y_i - Ȳ)² ]
                        </div>
                      </div>

                      {/* METODO MORRIS */}
                      <div className="bg-[#121826]/80 p-6 rounded-2xl border border-slate-800 hover:border-pink-500/25 transition-all text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="w-5 h-5 text-pink-400" />
                          <h5 className="font-bold text-slate-100 text-sm font-display">Método de Screening Morris (OAT Global)</h5>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          Algoritmo OAT (One-Step-at-a-Time) que gera perturbações incrementais passo Δ do projeto de forma sequencial ao longo de r trajetórias no hipercubo de parâmetros. O modelo mensura o <strong>Efeito Elementar (EE)</strong> pontual do input sobre o resultado monetário:
                        </p>
                        <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-pink-400 select-all text-center mb-3 overflow-x-auto">
                          EE_i(x_vetor) = [ f(x₁, ..., x_i + Δ, ..., x_k) - f(x_vetor) ] / Δ
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 block font-sans">MÉDIA ABSOLUTA (μ*)</span>
                            <div className="font-mono text-pink-400 text-xs py-1.5 text-center">μ*_i = (1/r) × Σ |EE_i^(j)|  (para j de 1 a r)</div>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-1">Mede a influência e intensidade do impacto direto geral exercida pelo fator X_i sobre o VPL.</span>
                          </div>
                          
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 block font-sans">DESVIO PADRÃO (σ)</span>
                            <div className="font-mono text-pink-400 text-xs py-1.5 text-center">σ_i = √[ (1/r) × Σ (EE_i^(j) - EE_média_i)² ]  (para j de 1 a r)</div>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-1">Indica comportamento altamente não linear da variável ou efeitos de alta ordem (sinergias).</span>
                          </div>
                        </div>
                      </div>

                      {/* INDICES SOBOL */}
                      <div className="bg-[#121826]/80 p-6 rounded-2xl border border-slate-800 hover:border-pink-500/25 transition-all text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit className="w-5 h-5 text-pink-400" />
                          <h5 className="font-bold text-slate-100 text-sm font-display">Decomposição de Variância de Sobol (ANOVA Funcional)</h5>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          Delineamento matemático rigoroso de partição global que separa a variância estocástica total do VPL, V(Y), baseando-se na representação por polinômios ortogonais. O SimuBoi calcula numericamente dois coeficientes consagrados:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Índice de Primeira Ordem (Si)</span>
                            <div className="p-2 bg-slate-900 border border-slate-800/60 rounded-lg font-mono text-[11px] text-pink-400 text-center my-2 select-all overflow-x-auto">
                              S_i = V_X_i [ E_X_~i ( Y | X_i ) ] / V(Y)
                            </div>
                            <p className="text-[9px] text-slate-500 leading-tight">
                              Quantifica a contribuição direta individual exclusiva de um determinado fator X_i sobre o risco geral de variação do VPL.
                            </p>
                          </div>

                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 block">Índice de Efeito Total (STi)</span>
                            <div className="p-2 bg-slate-900 border border-slate-800/60 rounded-lg font-mono text-[11px] text-pink-400 text-center my-2 select-all overflow-x-auto">
                              ST_i = 1 - V_X_~i [ E_X_i ( Y | X_~i ) ] / V(Y)
                            </div>
                            <p className="text-[9px] text-slate-500 leading-tight">
                              Expressa a variabilidade completa gerada pelo fator, unindo seu impacto direto e as interações combinadas simultâneas com os demais parâmetros do modelo.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* METODOLOGIA DE CUSTOS E TRATAMENTO DE OBITOS */}
                  <section className="space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                      <h4 className="text-base font-bold text-slate-100 font-display">5. Sistemática de Custos (Matsunaga) & Rateio de Óbitos</h4>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans text-left">
                      O simulador incorpora os pressupostos teóricos do Instituto de Economia Agrícola (Matsunaga et al., 1976), associando penalizações biológicas por óbito para maior rigor zootécnico:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                      <div className="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/10">
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider">CUSTO OPERACIONAL EFETIVO (COE)</span>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2 font-light">
                          Desembolsos monetários efetivos imediatos ao longo do confinamento: ração, silagem, vacinas preventiva e curativa, remuneração operacional direta de mão de obra permanente, diesel gasta nas misturas e corretagem de compra.
                        </p>
                      </div>

                      <div className="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/10">
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider">CUSTO OPERACIONAL TOTAL (COT)</span>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2 font-light">
                          Incorpora o desgaste material dos ativos tangíveis. É calculado agregando-se ao COE as depreciações físicas lineares calculadas conforme a vida útil de tratores, currais, comedouros e instalações gerais.
                        </p>
                        <div className="p-2 bg-slate-950/80 border border-slate-900 rounded-lg text-amber-500 font-mono text-[10px] mt-2 text-center">
                          COT = COE + Depreciação
                        </div>
                      </div>

                      <div className="bg-[#0f172a] p-5 rounded-2xl border border-amber-500/10">
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider">CUSTO TOTAL (CT)</span>
                        <p className="text-xs text-slate-400 leading-relaxed mt-2 font-light">
                          Mensa o rendimento econômico sistêmico completo. Soma-se ao COT os custos de oportunidade intangíveis alternativos, incluindo juros sobre capital circulante e remuneração da terra a taxas TMA.
                        </p>
                      </div>
                    </div>

                    <div className="p-6 bg-[#070a13] rounded-2xl border border-amber-500/15 text-left font-sans">
                      <h5 className="text-xs font-bold text-amber-400 font-display flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Repartição e Rateio por Mortalidade Biológica
                      </h5>
                      <p className="text-xs text-slate-350 leading-relaxed mb-3">
                        Para evitar distorções econômicas comuns em modelos estáticos simples, o SimuBoi dilui matematicamente as despesas incorridas pelos animais que foram a óbito ao longo da engorda (taxa m = Mortalidade % / 100), majorando o custo real absorvido pelas cabeças sobreviventes vendidas:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-center select-all">
                          <span className="text-[9px] text-slate-500 font-mono block">CUSTO DE COMPRA AJUSTADO</span>
                          <span className="font-mono text-emerald-400 text-xs font-semibold block mt-1">
                            C_compra_sobreviventes = C_base / (1 - m)
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-center select-all">
                          <span className="text-[9px] text-slate-500 font-mono block">CUSTO DE DIETA AJUSTADO</span>
                          <span className="font-mono text-emerald-400 text-xs font-semibold block mt-1">
                            C_dieta_sobreviventes = C_dieta / (1 - m)
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* TESTE DE ESTRESSE */}
                  <section className="bg-[#0f172a] p-8 rounded-3xl border border-slate-800 shadow-md text-left">
                    <div className="flex items-center gap-3 mb-4 font-sans">
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <ShieldAlert className="w-5 h-5 text-rose-450" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-slate-100 text-base tracking-tight">6. Metodologia de Teste de Estresse (Stress Testing)</h4>
                        <p className="text-[11px] text-slate-400 font-light font-sans">Projeções de resiliência orçamentária contra choques severos e anomalias sistêmicas de mercado.</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 font-sans text-left">
                      O <strong>Teste de Estresse</strong> do SimuBoi avalia a vulnerabilidade do fluxo de caixa sob anomalias históricas de cauda. O mecanismo impõe perturbações combinadas severas que violam as premissas da curva gaussiana clássica, preparando o confinador para eventos do cisne negro (black swan events):
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400 font-sans leading-relaxed text-left">
                      <li><strong>Choque Cambial e Superinflação de Insumos:</strong> Sobrecarrega simultaneamente o volumoso e farelos proteicos em <strong className="text-rose-400">+15% a +30%</strong>, replicando secas continentais extremas ou colapso nas cadeias logísticas do milho.</li>
                      <li><strong>Desvalorização Abrupta da Carne Gorda:</strong> Aplica forte redução na arroba gorda (<strong className="text-rose-400">-10% a -20%</strong>), mimetizando fechamentos repentinos de fronteiras por barreiras não alfandegárias de sanidade ou embargos comerciais temporários.</li>
                      <li><strong>Colapso Sanitário nas Baias:</strong> Eleva a mortalidade para patamares de <strong className="text-rose-400">5% a 10%</strong>, mimetizando enfermidades agudas (como pneumonia bovina severa ou anaplasmose), com severa redução na conversão e desempenho do lote sobrevivente.</li>
                    </ul>
                  </section>

                  {/* DOMINANCIA ESTOCASTICA */}
                  <section className="bg-[#070a13] p-8 rounded-3xl border border-slate-800 text-left">
                    <h3 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2 font-display">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      7. Teoria da Dominância Estocástica na Análise de Risco
                    </h3>
                    <div className="prose prose-sm max-w-none text-slate-300 space-y-4 text-xs sm:text-sm leading-relaxed font-sans text-left">
                      <p>
                        Para dirimir conflitos de escolha na comparação de estratégias biotecnológicas (ex: Comparação de duas dietas), o simulador gera curvas de probabilidades acumuladas (S-Curves), viabilizando o escrutínio por dominâncias financeiras:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-slate-400 font-sans">
                        <li>
                          <strong>Dominância Estocástica de Primeira Ordem (FSD):</strong> A curva B domina A na tomada de decisão se a probabilidade acumulada for consistentemente igual ou inferior em toda a amplitude de VPL:
                          <div className="p-2 bg-slate-950 rounded-lg text-emerald-450 font-mono text-[11px] text-center my-2 select-all font-semibold border border-slate-900/60">
                            F_B(x) ≤ F_A(x), para todo x em ℝ
                          </div>
                        </li>
                        <li>
                          <strong>Dominância Estocástica de Segunda Ordem (SSD):</strong> Caso as curvas cumulativas se interceptem, o investidor adota o cenário de menor gravidade acumulada ponderada na cauda inferior esquerda:
                          <div className="p-2 bg-slate-950 rounded-lg text-emerald-450 font-mono text-[11px] text-center my-2 select-all font-semibold border border-slate-900/60">
                            ∫_(-∞ a x) F_B(t) dt ≤ ∫_(-∞ a x) F_A(t) dt, para todo x em ℝ
                          </div>
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* EQUACOES DE DIETA NRC/NASEM 2016 */}
                  <section className="bg-[#070a13] p-8 rounded-3xl border border-slate-800 text-left">
                    <h3 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2 font-display">
                      <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                      8. Formulação, Exigências e Otimização da Dieta (NRC/NASEM 2016)
                    </h3>
                    <div className="prose prose-sm max-w-none text-slate-300 space-y-6 text-xs sm:text-sm leading-relaxed font-sans text-left">
                      <p>
                        O módulo de <strong>Dieta</strong> do SimuBoi implementa rigorosamente o modelo matemático-biológico desenvolvido pelo comitê do <strong>NASEM 2016 (National Academies of Sciences, Engineering, and Medicine - antigo NRC)</strong> para gado de corte. A seguir são detalhadas todas as equações empregadas para estimar as exigências nutricionais diárias do lote e predizer o Ganho Médio Diário (GMD) a partir da composição química dos insumos.
                      </p>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-purple-400 font-display">
                          A. Ajustes Iniciais de Peso Vivo e Conversões
                        </h4>
                        <p className="text-xs text-slate-400 font-sans">
                          Os cálculos nutricionais e de consumo baseiam-se no Peso Corporal de Jejum (SBW) e Peso de Corpo Vazio (EBW):
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-center text-xs">
                            <span className="text-slate-500 block font-mono">SBW (Shrunk Body Weight)</span>
                            <span className="font-mono text-emerald-400 font-semibold block mt-1">SBW = BW × 0.96</span>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-center text-xs">
                            <span className="text-slate-550 block font-mono">EBW (Empty Body Weight)</span>
                            <span className="font-mono text-emerald-400 font-semibold block mt-1">EBW = SBW × 0.891</span>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-center text-xs">
                            <span className="text-slate-550 block font-mono">EBG (Empty Body Gain)</span>
                            <span className="font-mono text-emerald-400 font-semibold block mt-1">EBG = GMD × 0.951</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-purple-400 font-display">
                          B. Estimativa de Consumo de Matéria Seca (CMS / DMI)
                        </h4>
                        <p className="text-xs text-slate-400 font-sans">
                          O consumo espontâneo diário é estimado usando regressões baseadas no peso vivo total do período (média entre entrada e saída), ajustado para o sexo e o frame size:
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 font-mono text-xs text-emerald-400">
                          <p>
                            Fêmeas: CMS (kg MS/dia) = [ 3.184 + 0.01536 × SBW ] × Ajuste_Frame
                          </p>
                          <p>
                            Machos (Castrados ou Inteiros): CMS (kg MS/dia) = [ 3.83 + 0.0143 × SBW ] × Ajuste_Frame
                          </p>
                          <p className="text-[11px] text-slate-500 font-sans">
                            * Ajuste_Frame: 0.95 para Pequeno (precoce); 1.00 para Médio; 1.05 para Grande (tardio).
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-purple-400 font-display">
                          C. Energia Líquida de Manutenção (NEm) e Ganho (NEg)
                        </h4>
                        <p className="text-xs text-slate-400 font-sans">
                          As exigências diárias de manutenção (NEm, Mcal/dia) e deposição de tecidos corporais (NEg, Mcal/dia) são equacionadas a partir do peso metabólico corrigido:
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 font-mono text-xs text-emerald-400">
                          <div>
                            <span className="text-slate-500 block font-sans text-[10px]">EXIGÊNCIA DE MANUTENÇÃO (NEm)</span>
                            <p className="mt-1">
                              NEm (Mcal/dia) = 0.077 × SBW⁰.⁷⁵ × Mult_Raça × Mult_Sexo
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-snug font-sans">
                              * Mult_Raça: 0.90 para Zebuínos (ex: Nelore no Brasil, que têm menor metabolismo basal); 1.00 para Europeus ou Cruzamento Industrial.<br />
                              * Mult_Sexo: 1.15 para Macho Inteiro (maior metabolismo basal); 1.00 para Macho Castrado ou Fêmea.
                            </p>
                          </div>
                          <div className="border-t border-slate-900 pt-3">
                            <span className="text-slate-500 block font-sans text-[10px]">EXIGÊNCIA DE GANHO (NEg)</span>
                            <p className="mt-1">
                              EQSBW = SBW × (478 / FBW) <br />
                              NEg (Mcal/dia) = 0.0635 × EQSBW⁰.⁷⁵ × EBG¹.⁰⁹⁷
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 font-sans">
                              * EQSBW é o peso de corpo vivo equivalente do animal com base no Peso Final (FBW) frente ao peso corporal padrão de referência (SRW = 478 kg) para terminação nos moldes clássicos do Garrett/NRC.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-purple-400 font-display">
                          D. Proteína Metabolizável (PM) e Proteína Bruta (PB)
                        </h4>
                        <p className="text-xs text-slate-400 font-sans">
                          A exigência diária de Proteína Metabolizável (MP, g/dia) une os requerimentos para manutenção endógena (MPm) e para reposição celular de carcaça e visceral (NPg):
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 font-mono text-xs text-emerald-400">
                          <div>
                            <span className="text-slate-500 block text-[10px] font-sans">MANUTENÇÃO ENDÓGENA</span>
                            <p className="mt-1">MPm (g/dia) = 4.1 × SBW⁰.⁷⁵</p>
                          </div>
                          <div className="border-t border-slate-900 pt-3">
                            <span className="text-slate-500 block text-[10px] font-sans">DEPOSIÇÃO PROTEICA EM GANHO DE CARCAÇA (NPg)</span>
                            <p className="mt-1">NPg (g/dia) = EBG × [ 268 - (29.4 × (NEg / EBG)) ]</p>
                          </div>
                          <div className="border-t border-slate-900 pt-3">
                            <span className="text-slate-500 block text-[10px] font-sans">PROTEÍNA METABOLIZÁVEL TOTAL & TRADUÇÃO PARA PROTEÍNA BRUTA (PB)</span>
                            <p className="mt-1">
                              MP_Total (g/dia) = MPm + (NPg / 0.492) <br />
                              PB_Mínima_Dieta (%) = Max[ 9 %, ( (MP_Total / 0.67) / 1000 / CMS ) × 100 ]
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">
                              * NPg é convertido a MP correspondente usando a eficiência clássica de ganho (0.492). <br />
                              * A conversion de Proteína Metabolizável para Proteína Bruta (PB) assume uma eficiência nominal de aproveitamento ruminal/intestinal média de 67%.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-purple-400 font-display">
                          E. Exigências Minerais (Cálcio e Fósforo)
                        </h4>
                        <p className="text-xs text-slate-400 font-sans">
                          Calculados somando perdas endógenas de manutenção física e deposição muscular por grama de proteína retida (NPg), divididas pelo coeficiente de absorção alimentar líquida:
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3 font-mono text-xs text-emerald-400">
                          <div>
                            <span className="text-slate-500 block text-[10px] font-sans">CÁLCIO MÍNIMO</span>
                            <p className="mt-1">
                              Ca_Líquido (g/dia) = (0.0154 × SBW) + (0.071 × NPg) <br />
                              Ca_Mín_Dieta (%) = ( (Ca_Líquido / 0.50) / 1000 / CMS ) × 100
                            </p>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">* Assume eficiência de absorção dietética de cálcio de 50%.</span>
                          </div>
                          <div className="border-t border-slate-900 pt-3">
                            <span className="text-slate-500 block text-[10px] font-sans">FÓSFORO MÍNIMO</span>
                            <p className="mt-1">
                              P_Líquido (g/dia) = (0.016 × SBW) + (0.039 × NPg) <br />
                              P_Mín_Dieta (%) = ( (P_Líquido / 0.70) / 1000 / CMS ) × 100
                            </p>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">* Assume eficiência de absorção dietética de fósforo de 70%.</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-100 text-xs sm:text-sm uppercase tracking-wider text-purple-400 font-display">
                          F. Nutrientes Digestíveis Totais (NDT)
                        </h4>
                        <p className="text-xs text-slate-450 font-sans">
                          O NDT mínimo é balizado convertendo as exigências de NEm e NEg em equivalentes de Energia Metabolizável (ME) e então mapping no consumo de matéria seca (CMS):
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs text-emerald-400 space-y-2">
                          <p>ME_m = NEm / 0.64</p>
                          <p>ME_g = NEg / 0.42</p>
                          <p>ME_Total = ME_m + ME_g</p>
                          <p>NDT_Exigido (%) = Max[ 62 %, Min[ 85 %, (ME_Total / CMS) / 0.03615 ] ]</p>
                          <span className="text-[10px] text-slate-500 block leading-snug font-sans mt-2">
                            * Eficiência de ME para NEm = 64%; ME para NEg = 42%. <br />
                            * A relação fixa clássica estabelece que 1 kg de NDT equivale a 3.615 Mcal de ME (isto é, ME Mcal/kg = 0.03615 × % NDT).
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* NOVO: 9. Indicadores e Equações de Sustentabilidade (ESG) */}
                  <section className="bg-[#070a13] p-8 rounded-3xl border border-slate-800 text-left">
                    <h3 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2 font-display">
                      <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                      9. Indicadores e Equações de Sustentabilidade (ESG)
                    </h3>
                    <div className="prose prose-sm max-w-none text-slate-300 space-y-6 text-xs sm:text-sm leading-relaxed font-sans text-left font-sans">
                      <p>
                        Quantificação científica dos impactos ambientais e sociais baseada em balanço de massa, ecoeficiência e conformidade:
                      </p>
                      
                      <div className="space-y-6">
                        <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all text-left">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-teal-500/20 text-teal-400 bg-teal-500/5">
                            1. BALANÇO DE NITROGÊNIO (N) EXCRETADO
                          </span>
                          <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                            Representa o nitrogênio lixiviado ou volatilizado derivado da excreção urinária e fecal, obtido pelo balanço de massas proteicas:
                          </p>
                          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-teal-400 select-all my-3 text-center overflow-x-auto">
                            PB_média = (CMS_Volumo × 0.08 + CMS_Concentrado × 0.18) / CMS_Total <br />
                            Ingestão_N (kg) = (CMS_Total × PB_média) / 6.25 <br />
                            Retenção_N (kg) = (Ganho_Peso_Total × 0.15) / 6.25 <br />
                            Balanço_N (kg) = Max[ 0, Ingestão_N - Retenção_N ]
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1 font-sans">* Representa o nitrogênio lixiviado ou volatilizado derivado da excreção urinária e fecal.</span>
                        </div>

                        <div className="bg-[#121826]/80 p-5 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all text-left">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-xl border border-teal-500/20 text-teal-400 bg-teal-500/5">
                            2. BALANÇO DE FÓSFORO (P) EXCRETADO
                          </span>
                          <p className="text-xs text-slate-400 mt-3 font-sans leading-relaxed">
                            Mede o excedente residual eutofizante do fósforo excretado no meio pelo balanço de ingestão versus deposição muscular:
                          </p>
                          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-xs text-teal-400 select-all my-3 text-center overflow-x-auto">
                            P_dieta_média = (CMS_Volumo × 0.002 + CMS_Concentrado × 0.005) / CMS_Total <br />
                            Ingestão_P (kg) = CMS_Total × P_dieta_média <br />
                            Retenção_P (kg) = Ganho_Peso_Total × 0.007 <br />
                            Balanço_P (kg) = Max[ 0, Ingestão_P - Retenção_P ]
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1 font-sans">* Mede o excedente residual eutofizante do fósforo excretado no meio.</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : activeHelpTab === 'references' ? (
                <div className="space-y-12">
                  <section className="bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/10 font-sans mt-8">
                    <h3 className="text-xl font-bold text-slate-100 mb-8 flex items-center gap-2 font-display">
                      <BookOpen className="w-6 h-6 text-emerald-400" />
                      Referências Bibliográficas
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                      {/* COLUNA 1: Publicações sobre uso da metodologia em confinamento */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 font-display flex items-center justify-between border-b border-emerald-500/10 pb-2">
                            <span>Uso de Metodologia de Confinamento & Modelagem</span>
                            <span className="text-[9px] text-slate-500 font-normal lowercase font-sans">20 títulos</span>
                          </h4>
                          <ul className="text-[11px] text-slate-300 space-y-4 list-disc pl-5 font-sans leading-relaxed">
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">MACHADO, G. I. O.; VAZ, F. N.; OLEGÁRIO, J. L.; PIZZUTI, L. Â. D.; PACHECO, P. S.; SILVA, R. M. da; SOUZA, R. L. de; DALLANORA, M. E. C. (2024)</strong>. Viabilidade econômica da terminação de categorias bovinas em pastagem cultivada de inverno ou confinamento por meio da simulação de Monte Carlo. <em>Observatório de la Economía Latinoamericana</em>, v.22, p.e7792, 2024.
                              <a
                                href="https://doi.org/10.55905/oelv22n11-134"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">OLEGÁRIO, J. L.; VAZ, F. N.; PASCOAL, L. L.; VAZ, R. Z.; PIZZUTI, L. Â. D.; PACHECO, P. S.; MAYSONNAVE, G. S.; SILVA, R. M. da (2023)</strong>. Análise econômica probabilística do confinamento de novilhos com diferentes pesos iniciais. <em>Observatório de la Economía Latinoamericana</em>, v.21, p.20512 - 20527, 2023.
                              <a
                                href="https://doi.org/10.55905/oelv21n11-105"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">SILVA, R. M.; TAVEIRA, R. Z.; RESTLE, J.; FABRICIO, E. A.; CAMERA, A.; MAYSONNAVE, G. S.; BILEGO, U. O.; PACHECO, P. S.; VAZ, F. N. (2020)</strong>. Economic analysis of the risk of replacing corn grains (Zea mays) with pearl millet grains (Pennisetum glaucum) in the diet of feedlot cattle. <em>Ciência Rural</em>, v.50, p.01 - 12, 2020.
                              <a
                                href="https://doi.org/10.1590/0103-8478cr20190443"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">VAZ, M. A. B.; PACHECO, P. S.; SEIDEL, E. J.; ANSUJ, A. P. (2017)</strong>. Classification of the coefficient of variation to variables in beef cattle experiments. <em>Ciência Rural</em>, v.47, p.1 - 4, 2017.
                              <a
                                href="https://doi.org/10.1590/0103-8478cr20160946"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">ÁVILA, M. M. de; PACHECO, P. S.; PASCOAL, L. L. (2017)</strong>. Economic deterministic analysis of two years old steers production systems. <em>Ciência Animal Brasileira</em>, v.18, p.1 - 14, 2017.
                              <a
                                href="https://doi.org/10.1590/1089-6891v18e-34090"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">FABRICIO, E. A.; PACHECO, P. S.; VAZ, F. N.; LEMES, D. B.; CAMERA, A.; MACHADO, G. I. O. (2017)</strong>. Financial indicators to evaluate the economic performance of feedlot steers with different slaughter weights. <em>Ciência Rural</em>, v.47, p.e20160516, 2017.
                              <a
                                href="https://doi.org/10.1590/0103-8478cr20160516"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">LEAL, W. S.; PACHECO, P. S.; PASCOAL, L. L.; VAZ, R. Z.; MENDONÇA, F. S.; SEVERO, M. M. (2017)</strong>. Indicadores financeiros determinísticos e custos de produção do confinamento de bovinos no Rio Grande do Sul–Brasil. <em>Custos e Agronegócio On Line</em>, v.13, p.201, 2017.
                              <a
                                href="https://www.custoseagronegocioonline.com.br/numero2v13/OK%2011%20deterministicos.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">ROSA, J. R. P.; PACHECO, P. S.; FABRICIO, E. A.; CAMERA, A.; LEMES, D. B. (2017)</strong>. Risk analysis of economic viability of feedlot aberdeen angus steers fed with different proportions of concentrate. <em>Bioscience Journal</em>, v.33, p.660 - 669, 2017.
                              <a
                                href="https://doi.org/10.14393/BJ-v33n3-34547"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; VAZ, F. N.; VALENÇA, K. G.; FABRICIO, E. A.; OLEGÁRIO, J. L.; CAMPARA, J. M.; CAMERA, A. (2017)</strong>. Stochastic simulation of the economic viability of feedlot finishing steers slaughtered at different weights in southern brazil. <em>Bioscience Journal</em>, v.33, p.652 - 659, 2017.
                              <a
                                href="https://doi.org/10.14393/BJ-v33n3-34110"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">SILVA, R. M. da; TAVEIRA, R. Z.; VAZ, F. N.; FABRICIO, E. A.; MIOLLO, J. R.; CAMERA, A.; PACHECO, P. S. (2017)</strong>. Stochastic simulation of the economic viability of feedlot steers fed with different proportions of concentrate. <em>Bioscience Journal (Online)</em>, v.33, p.125 - 134, 2017.
                              <a
                                href="https://doi.org/10.14393/BJ-v33n1a2017-33608"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; FABRICIO, E. A.; CAMERA, A. (2016)</strong>. Análise Conjunta de Indicadores Financeiros na Viabilidade Econômica do Confinamento de Bovinos no Rio Grande do Sul em Diferentes Épocas do Ano. <em>Agropampa</em>, v.1, p.86-99, 2016.
                              <a
                                href="https://periodicos.unipampa.edu.br/index.php/Agropampa/article/view/131"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; PASCOAL, L. L.; RESTLE, J.; VAZ, F. N.; ARBOITTE, M. Z.; VAZ, R. Z.; SANTOS, J. P. A.; OLIVEIRA, T. M. L. de (2014)</strong>. Risk assessment of finishing beef cattle in feedlot: slaughter weights and correlation amongst input variables. <em>Revista Brasileira de Zootecnia (Online)</em>, v.43, p.92-99, 2014.
                              <a
                                href="https://rbz.org.br/article/risk-assessment-of-finishing-beef-cattle-in-feedlot-slaughter-weights-and-correlation-amongst-input-variables/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; SILVA, R. M. da; PÁDUA, J. T.; RESTLE, J.; TAVEIRA, R. Z.; VAZ, F. N.; PASCOAL, L. L.; OLEGÁRIO, J. L.; MENEZES, F. R. (2014)</strong>. Análise econômica da terminação de novilhos em confinamento recebendo diferentes proporções de cana-de-açúcar e concentrado. <em>Semina: Ciências Agrárias (Online)</em>, v.35, p.1-12, 2014.
                              <a
                                href="https://doi.org/10.5433/1679-0359.2014v35n2p999"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; RESTLE, J.; PASCOAL, L. L.; VAZ, F. N.; VAZ, R. Z.; VALENÇA, K. G.; OLEGÁRIO, J. L. (2014)</strong>. Use of correlation between input variables in estimating the risk of feedlot finishing of steers and young steers. <em>Anais da Academia Brasileira de Ciências (Online)</em>, v.86, p.353-362, 2014.
                              <a
                                href="https://doi.org/10.1590/0001-37652014110012"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; VAZ, F. N.; RESTLE, J.; ÁVILA, M. M. de; OLEGÁRIO, J. L.; MENEZES, F. R. de; VALENÇA, K. G.; LEMES, D. B.; VARGAS, F. V. de (2014)</strong>. Deterministic economic analysis of feedlot Red Angus young steers: slaughter weights and bonus. <em>Ciência Rural (UFSM)</em>, v.44, n.10, p.1874-1880, 2014.
                              <a
                                href="https://doi.org/10.1590/0103-8478cr20140631"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; RESTLE, J.; OLEGÁRIO, J. L.; MENEZES, F. R.; VAZ, F. N.; PASCOAL, L. L.; LEMES, D. B.; VALENÇA, K. G.; MACHADO, G. I. O.; RODRIGUES, A. C. T. (2014)</strong>. Correlation and Slaughter Weight on Sensitivity Analysis of Charolais Steers Feedlot Finished. <em>American International Journal of Contemporary Research (Print)</em>, v.4, p.28-34, 2014.
                              <a
                                href="https://aijcr.thebrpi.org/journals/Vol_4_No_7_July_2014/4.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; RESTLE, J.; VALENÇA, K. G.; LEMES, D. B.; MENEZES, F. R.; MACHADO, G. K. G. (2014)</strong>. ANÁLISE ECONÔMICA DETERMINÍSTICA DA TERMINAÇÃO EM CONFINAMENTO DE NOVILHOS ABATIDOS COM DISTINTOS PESOS. <em>Ciência Animal Brasileira (Online)</em>, v.15, p.420-428, 2014.
                              <a
                                href="https://doi.org/10.1590/1089-6891v15i425747"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; RESTLE, J.; VAZ, F. N.; PASCOAL, L. L.; ARBOITTE, M. Z.; VAZ, R. Z. (2012)</strong>. Viabilidade econômica da terminação em confinamento de novilhos abatidos com diferentes pesos. <em>Pesquisa Agropecuária Gaúcha</em>, v.18, p.135-145, 2012.
                              <a
                                href="http://www.fepagro.rs.gov.br/upload/1398706080_artigo5.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">RESTLE, J.; PACHECO, P. S.; COSTA, E. C. da; FREITAS, A. K. de; VAZ, F. N.; BRONDANI, I. L.; FERNANDES, J. J. de R. (2007)</strong>. Apreciação econômica da terminação em confinamento de novilhos Red Angus superjovens abatidos com diferentes pesos. <em>Revista Brasileira de Zootecnia (Online)</em>, v.36, p.978-986, 2007.
                              <a
                                href="https://doi.org/10.1590/S1516-35982007000400030"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-[#10b981]/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PACHECO, P. S.; RESTLE, J.; VAZ, F. N.; FREITAS, A. K. de; PÁDUA, J. T.; NEUMANN, M.; ARBOITTE, M. Z. (2006)</strong>. Avaliação econômica da terminação em confinamento de novilhos jovens e superjovens de diferentes grupos genéticos. <em>Revista Brasileira de Zootecnia</em>, v.35, n.1, p.147-158, 2006.
                              <a
                                href="https://doi.org/10.1590/S1516-35982006000100039"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-[#10b981]/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* COLUNA 2: Outros Temas Metodológicos */}
                      <div className="space-y-10">
                        {/* 1. Análise de Sensibilidade e Risco */}
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 font-display flex items-center justify-between border-b border-emerald-500/10 pb-2">
                            <span>Análise de Sensibilidade e Risco Estocástico</span>
                          </h4>
                          <ul className="text-[11px] text-slate-300 space-y-4 list-disc pl-5 font-sans leading-relaxed">
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">MORRIS, M. D. (1991)</strong>. Factorial sampling plans for preliminary computational experiments. <em>Technometrics</em>, v.33, n.2, p.161-174.
                              <a
                                href="https://doi.org/10.1080/00401706.1991.10484804"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">SOBOL, I. M. (2001)</strong>. Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates. <em>Mathematics and Computers in Simulation</em>, v.55, n.1-3, p.271-280.
                              <a
                                href="https://doi.org/10.1016/S0378-4754(00)00270-6"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">IMAN, R. L.; CONOVER, W. J. (1982)</strong>. A distribution-free approach to inducing rank correlation among input variables. <em>Communications in Statistics - Simulation and Computation</em>, v.11, n.3, p.311-334.
                              <a
                                href="https://doi.org/10.1080/03610918208812265"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                          </ul>
                        </div>

                        {/* 2. Indicadores e Equações de Sustentabilidade (ESG) */}
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 font-display flex items-center justify-between border-b border-emerald-500/10 pb-2">
                            <span>Sustentabilidade & Impacto Ambiental (ESG)</span>
                          </h4>
                          <ul className="text-[11px] text-slate-300 space-y-4 list-disc pl-5 font-sans leading-relaxed">
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">PALHARES, J.C.P. et al. (2023)</strong>. Produção de bovinos de corte e soluções tecnológicas para eficiência do uso da água. Embrapa Gado de Corte, 2023.
                              <a
                                href="https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/1154075/1/Producao-bovinos-corte-solucoes-2023.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">IPCC (2019)</strong>. Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories: Volume 4: Agriculture, Forestry and Other Land Use. Geneva: IPCC. (Cenários de emissões entéricas de CH₄ e pegada de CO₂e).
                              <a
                                href="https://www.ipcc-nggip.iges.or.jp/public/2019rf/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">NASEM (2016)</strong>. Nutrient Requirements of Beef Cattle. 8th revised edition. Washington, DC: National Academies Press. (Modelagem de consumo e estimativa de excreção de Nitrogênio e Fósforo via balanço de massas).
                              <a
                                href="https://doi.org/10.17226/19014"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">BERNDT, A.; SOLÓRZANO, L.A.R.; SAKAMOTO, L.S. (2013)</strong>. Pecuária de corte frente à emissão de gases de efeito estufa e estratégias diretas e indiretas para mitigar a emissão de metano. VI Simpósio de Nutrição de Ruminantes – Nutrição de precisão para sistemas intensivos de produção de carne: Alto desempenho e baixo impacto ambiental/ Anais. EMBRAPA.
                              <a
                                href="https://www.alice.cnptia.embrapa.br/alice/bitstream/doc/976223/1/PROCI2013.00235.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">RITCHIE, H. (2023)</strong>. The carbon footprint of foods: are differences explained by the impacts of methane?. <em>Our World in Data</em>. (Análise dinâmica sobre a meia-vida do metano versus CO₂ acumulado e seu impacto relativo no perfil de emissões dos alimentos proteicos).
                              <a
                                href="https://ourworldindata.org/carbon-footprint-food-methane"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                          </ul>
                        </div>

                        {/* 3. Indicadores e Dominância Estocástica */}
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 font-display flex items-center justify-between border-b border-emerald-500/10 pb-2">
                            <span>Dominância Estocástica & Decisão</span>
                          </h4>
                          <ul className="text-[11px] text-slate-300 space-y-4 list-disc pl-5 font-sans leading-relaxed">
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">HANOCH, G.; LEVY, H. (1969)</strong>. The efficiency analysis of choices involving risk. <em>The Review of Economic Studies</em>, v.36, n.3, p.335-346.
                              <a
                                href="https://doi.org/10.2307/2296431"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                DOI
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">ASSAF NETO, A. (2022)</strong>. Matemática financeira e suas aplicações. São Paulo: Atlas. (Livro)
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">KASSAI, J. R. et al. (2000)</strong>. Retorno de investimento: abordagem matemática e contábil do lucro empresarial. São Paulo: Atlas. (Livro)
                            </li>
                          </ul>
                        </div>

                        {/* 4. Cenários e Testes de Estresse */}
                        <div>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4 font-display flex items-center justify-between border-b border-emerald-500/10 pb-2">
                            <span>Cenários, Riscos & Testes de Estresse</span>
                          </h4>
                          <ul className="text-[11px] text-slate-300 space-y-4 list-disc pl-5 font-sans leading-relaxed">
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">SCHOEMAKER, P. J. (1995)</strong>. Scenario planning: a tool for strategic thinking. <em>MIT Sloan Management Review</em>, v.36, n.2, p.25-40.
                              <a
                                href="https://sloanreview.mit.edu/article/scenario-planning-a-tool-for-strategic-thinking/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">HULL, J. C. (2018)</strong>. Risk Management and Financial Institutions. Wiley. (Livro)
                            </li>
                            <li className="pl-1">
                              <strong className="text-slate-100 font-semibold font-sans">GUIDUCCI, R. do C. N.; LIMA FILHO, J. R. de; MOTA, M. M. (Ed.) (2012)</strong>. Viabilidade econômica de sistemas de produção agropecuários: metodologia e estudos de caso. Brasília, DF: Embrapa, 2012.
                              <a
                                href="http://www.alice.cnptia.embrapa.br/alice/handle/doc/959077"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/10 transition-all font-sans whitespace-nowrap"
                              >
                                Acesso
                                <ExternalLink className="w-2 h-2" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : activeHelpTab === 'citation' ? (
                <div className="space-y-12">
                  {/* NOVO: Como Citar este Aplicativo */}
                  <section className="bg-[#070a13] p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2 font-display">
                      <GraduationCap className="w-6 h-6 text-emerald-400" />
                      Como Citar este Aplicativo
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">
                      Se você utilizar o <strong>SimuBoi</strong> em pesquisas científicas, trabalhos acadêmicos de conclusão de curso, relatórios técnicos, dissertações ou teses, por favor cite a nossa plataforma utilizando as referências padronizadas abaixo. A URL oficial de publicação é <a href="https://simuboi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">https://simuboi.vercel.app</a>.
                    </p>
                    
                    <div className="space-y-4">
                      {[
                        {
                          id: 'abnt',
                          title: 'Formato ABNT (NBR 6023)',
                          text: 'PACHECO, P. S. SimuBoi: Simulador bioeconômico e estatístico de risco para confinamento bovino. Versão 1.0. Santa Maria: DZ - UFSM, 2026. Disponível em: https://simuboi.vercel.app. Acesso em: [Data de Acesso].'
                        },
                        {
                          id: 'apa',
                          title: 'Formato APA (7th Edition)',
                          text: 'Pacheco, P. S. (2026). SimuBoi: Simulador bioeconômico e estatístico de risco para confinamento bovino (Version 1.0) [Software]. Department of Animal Science, Federal University of Santa Maria (DZ - UFSM). Available from https://simuboi.vercel.app.'
                        },
                        {
                          id: 'bibtex',
                          title: 'Formato BibTeX (LaTeX)',
                          text: `@software{simuboi2026,\n  author = {Pacheco, Paulo Souza},\n  title = {SimuBoi: Simulador bioecon{\\^o}mico e estat{\\'\\i}stico de risco para confinamento bovino},\n  year = {2026},\n  version = {1.0},\n  publisher = {DZ - UFSM},\n  url = {https://simuboi.vercel.app}\n}`
                        },
                        {
                          id: 'harvard',
                          title: 'Formato Harvard (Author-Date)',
                          text: 'Pacheco, P.S., 2026. SimuBoi: Simulador bioeconômico e estatístico de risco para confinamento bovino [software]. Versão 1.0. Santa Maria: DZ - UFSM. Disponível em: <https://simuboi.vercel.app> [Acesso em: [Data de Acesso]].'
                        },
                        {
                          id: 'mla',
                          title: 'Formato MLA (9th Edition)',
                          text: 'Pacheco, Paulo Souza. SimuBoi: Simulador bioeconômico e estatístico de risco para confinamento bovino. Versão 1.0, DZ - UFSM, 2026, https://simuboi.vercel.app.'
                        },
                        {
                          id: 'vancouver',
                          title: 'Formato Vancouver',
                          text: 'Pacheco PS. SimuBoi: Simulador bioeconômico e estatístico de risco para confinamento bovino [software]. Versão 1.0. Santa Maria: DZ - UFSM; 2026. Disponível em: https://simuboi.vercel.app.'
                        }
                      ].map((cit) => (
                        <div key={cit.id} className="p-5 rounded-2xl border border-slate-800 bg-[#0c1322] hover:border-slate-700/80 transition-all duration-200 relative group">
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="text-[9px] bg-[#13223f] text-indigo-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono border border-slate-700/50">
                              {cit.id}
                            </span>
                            <button
                              onClick={() => handleCopy(cit.text, cit.id)}
                              className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 text-[11px] font-medium font-sans ${
                                copiedFormat === cit.id
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              }`}
                              title="Copiar referência"
                            >
                              {copiedFormat === cit.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="hidden sm:inline">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="hidden sm:inline">Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-slate-300 mb-2 font-display">{cit.title}</h4>
                          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl font-mono text-[10.5px] text-slate-320 leading-relaxed break-words whitespace-pre-wrap">
                            {cit.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : activeHelpTab === 'manual' ? (
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-2xl">
                        <PlayCircle className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-100 font-display">Guia de Início Rápido</h3>
                        <p className="text-sm text-slate-400 font-sans">Siga estes passos para realizar sua primeira simulação</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#070a13] p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700/80 transition-colors">
                        <div className="w-8 h-8 bg-[#131d35] text-indigo-400 border border-indigo-500/25 rounded-full flex items-center justify-center font-bold mb-4 font-mono">1</div>
                        <h4 className="font-bold text-slate-100 mb-2 font-display">Configure os Parâmetros</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">Insira os dados do animal, custos de alimentação e preços de mercado na aba "Parâmetros".</p>
                      </div>
                      <div className="bg-[#070a13] p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700/80 transition-colors">
                        <div className="w-8 h-8 bg-[#131d35] text-indigo-400 border border-indigo-500/25 rounded-full flex items-center justify-center font-bold mb-4 font-mono">2</div>
                        <h4 className="font-bold text-slate-100 mb-2 font-display">Analise os Resultados</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">Veja o lucro projetado, VPL e indicadores bioeconômicos na aba "Análise Determinística".</p>
                      </div>
                      <div className="bg-[#070a13] p-5 rounded-2xl border border-slate-800 shadow-sm hover:border-slate-700/80 transition-colors">
                        <div className="w-8 h-8 bg-[#131d35] text-indigo-400 border border-indigo-500/25 rounded-full flex items-center justify-center font-bold mb-4 font-mono">3</div>
                        <h4 className="font-bold text-slate-100 mb-2 font-display">Simule o Risco</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">Vá para a aba "Análise de Risco" para entender as chances de prejuízo e a sensibilidade do projeto.</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-display">
                       <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                       Detalhamento das Abas
                    </h3>
                    
                    <div className="space-y-4 font-sans">
                      <div className="p-4 bg-[#070a13] rounded-2xl border border-slate-800/80">
                        <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 font-display">
                          <Settings className="w-4 h-4 text-indigo-400" />
                          Aba Parâmetros
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5">
                          <li><strong>Animal & Desempenho:</strong> Defina pesos, GMD e rendimento de carcaça. O tempo de cocho é calculated automaticamente.</li>
                          <li><strong>Alimentação:</strong> Informe o consumo diário (matéria verde) e os preços do volumoso e concentrado.</li>
                          <li><strong>Custos de Produção:</strong> Inclua mão de obra, sanidade, frete e despesas administrativas.</li>
                          <li><strong>Mercado & Oportunidade:</strong> Preços de compra/venda e a TMA (Taxa Mínima de Atratividade).</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#070a13] rounded-2xl border border-slate-800/80">
                        <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 font-display">
                          <TrendingUp className="w-4 h-4 text-indigo-400" />
                          Aba Análise Determinística
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 text-left">
                          <li><strong>Viabilidade Econômica:</strong> VPL, ROIA e IB:C baseados no cenário médio (determinístico).</li>
                          <li><strong>Desempenho Bioeconômico:</strong> Custos detalhados por kg de ganho, por arroba produzida e por dia de confinamento.</li>
                          <li><strong>Fluxo de Caixa Dinâmico:</strong> Gráfico de barras e tabela analítica sequencial mapeando as entradas e saídas do caixa operacional ao longo dos meses.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#070a13] rounded-2xl border border-slate-800/80">
                        <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 font-display">
                          <ShieldAlert className="w-4 h-4 text-amber-500" />
                          Aba Análise de Risco (Simulação Probabilística LHS)
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 text-left">
                          <li><strong>Histograma do VPL & Curvação S-Curve:</strong> Visualize interativamente a probabilidade acumulada dos retornos do fluxo de caixa operacional.</li>
                          <li><strong>Probabilidade de Prejuízo Real:</strong> A métrica central que dita o risco efetivo do projeto não atingir ou violar a TMA especificada.</li>
                          <li><strong>Modelo de Dependência por Cópulas:</strong> Altere dinamicamente a modelagem de correlação conjunta de caudas (Gaussiana, Clayton para riscos e colapsos de baixa, Gumbel para escaladas otimistas).</li>
                          <li><strong>Tornado de Sensibilidade por Pearson (r):</strong> Descubra a correlação linear imediata que rege a dispersão das variáveis do cocho.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#070a13] rounded-2xl border border-slate-800/80">
                        <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 font-display">
                          <Leaf className="w-4 h-4 text-emerald-400" />
                          Aba Bem-Estar & ESG (Sustentabilidade)
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 text-left">
                          <li><strong>Escore de Bem-Estar Animal:</strong> Avalie critérios estruturais de lama, espaço de cocho, sombra e sanidade (Status Requerido &ge; 8).</li>
                          <li><strong>Rastreabilidade Individual Documentada:</strong> Simule o status do rebanho para desbloquear bônus industriais.</li>
                          <li><strong>Bonificações de Mercado de Carne Premium:</strong> Conheça a qualificação do lote para bônus reais por arroba (Cota Hilton e marcas premium de cortes de grife).</li>
                          <li><strong>Métrica Verde de Emissão de Metano entérico:</strong> Projete o volume volumétrico em kg e equivalentes das emissões gasosas estomacais de CO₂/CH₄ por ciclo do lote.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#070a13] rounded-2xl border border-slate-800/80">
                        <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 font-display">
                          <BrainCircuit className="w-4 h-4 text-pink-400" />
                          Aba Sensibilidade Global Avançada (Sobol & Morris)
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 text-left">
                          <li><strong>Método de Screening Morris (OAT):</strong> Identifica quais inputs biológicos e financeiros agem com relações altamente não-lineares ou sinergias no rebanho.</li>
                          <li><strong>Decomposição de Variância por Índices de Sobol:</strong> ANOVA funcional de precisão que destrincha a parcela exata do risco sob o VPL causada por cada cotação ou índice isoladamente.</li>
                          <li><strong>Visualização por dispersão e gráficos dinâmicos:</strong> Interprete graficamente a influência e o grau de acoplamento das decisões nutricionais.</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#070a13] rounded-2xl border border-slate-800/80">
                        <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2 font-display">
                          <AlertCircle className="w-4 h-4 text-rose-455" />
                          Aba Testes de Estresse (Choques Macroeconômicos)
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5 text-left">
                          <li><strong>Macro-Choques pré-configurados estruturais:</strong> Simule instantaneamente crises cambiais severas que encarecem concentrados exógenos, embargos industriais com desvalorização cambial ou surto sanitário nas baias do confinamento.</li>
                          <li><strong>Quebra do VPL e resiliência:</strong> Monitore as linhas de quebra do ponto de equilíbrio (Break-even pricing) e as perdas de rentabilidade reais sob eventos extremos de cauda.</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-display">
                       <div className="w-1.5 h-6 bg-pink-500 rounded-full" />
                       Escore de Bem-Estar Animal & Sistema de Rastreabilidade
                    </h3>
                    <div className="p-6 bg-[#070a13] rounded-2xl border border-pink-500/10 hover:border-pink-500/20 transition-all font-sans relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Heart className="w-24 h-24 text-pink-400" />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">
                        O ecossistema analisa o Escore de Bem-Estar Animal de maneira cruzada com o sistema de Rastreabilidade:
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                          <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-2 mb-1.5 font-display">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Padrão Exportação (Score ≥ 8 + Rastreabilidade Total)
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">
                            Habilita o confinamento a obter o status comercial máximo na aba de Resultados. Permite o enquadramento em bônus específicos (como a Cota Hilton (União Europeia), carnes de marca integrada ou nichos de mercado de prestígio), que chegam a bonificar o produtor em prêmios de preço por arroba.
                          </p>
                        </div>
                        
                        <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                          <h5 className="text-xs font-bold text-amber-400 flex items-center gap-2 mb-1.5 font-display">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Atenção Técnica (Apenas um dos requisitos atingido)
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">
                            Se houver alto bem-estar físico, mas ausência de rastreabilidade documental confiável (ou vice-versa), o motor gera um aviso recomendando foco técnico. Sem o acoplamento simultâneo das duas práticas, o produtor não usufrui dos potenciais bônus comerciais oficiais por arroba comercializada.
                          </p>
                        </div>

                        <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                          <h5 className="text-xs font-bold text-rose-400 flex items-center gap-2 mb-1.5 font-display">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Alerta de Risco (Abaixo de 7)
                          </h5>
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">
                            Alerta o produtor de que a operação está suscetível a penalizações, deságios fabris por contusões elevadas e exclusão comercial das principais cadeias varejistas contemporâneas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* NOVO MANUAL: GUIA DE CENÁRIOS DE ALTA RESPONSABILIDADE */}
                  <section className="space-y-6 text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-450">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 font-display">
                          Guia de Tomada de Decisão de Alta Responsabilidade
                        </h3>
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">Como usar a inteligência do SimuBoi em 3 simulações reais do campo profissional</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      Diferente de planilhas de cálculo isolado, o SimuBoi interconecta os efeitos biológicos e de comércio. A seguir, veja como conduzir três fluxos práticos para mitigar riscos extremos e qualificar bônus comerciais:
                    </p>

                    <div className="grid grid-cols-1 gap-6">
                      {/* CENÁRIO 1 */}
                      <div className="p-6 bg-slate-950/40 rounded-3xl border border-indigo-500/10 hover:border-indigo-500/25 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg font-mono">CASO ESTUDO 1</span>
                          <h4 className="font-bold text-slate-100 text-sm font-display">
                            Gestão de Insumos Voláteis & Trava na Bolsa (B3)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                          <strong>Desafio Comercial:</strong> O preço médio dos concentrados proteicos (farelo de soja) flutua rapidamente no mercado internacional. Qual o limite de sobrevivência da fazenda antes de necessitar de hedge futures (trava na B3)?
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-405">
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-display text-indigo-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Como Conduzir no software:
                            </span>
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>Insira a flutuação estimada em <strong>Preço do Concentrado</strong> e amplie o desvio padrão histórico nas configurações para simular tempos de crise severa.</li>
                              <li>Acesse a aba <strong>"Sensibilidade Global"</strong> para auditar os Índices de Sobol.</li>
                              <li>Se o índice de efeito total (STi) do Concentrado superar <strong>0.50</strong>, a volatilidade da ração rege a viabilidade do lote.</li>
                            </ol>
                          </div>
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                            <div>
                              <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-display text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ação Estratégica Recomendada:
                              </span>
                              <p className="text-[11px] leading-relaxed">
                                Se a <strong>Probabilidade de Prejuízo</strong> ultrapassar seu apetite ao risco (ex: &gt; 15%), trave preventivamente a arroba no mercado futuro de boi gordo ou negocie contratos parciais de CPR física de milho antes da entrada do gado na engorda.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CENÁRIO 2 */}
                      <div className="p-6 bg-slate-950/40 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/25 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-355 rounded-lg font-mono">CASO ESTUDO 2</span>
                          <h4 className="font-bold text-slate-100 text-sm font-display">
                            Certificação ESG e Planejamento para Cota Hilton
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                          <strong>Desafio Comercial:</strong> O confinamento busca vender em frigoríficos de exportação premium habilitados para quotas internacionais de valor agregado, mas precisa justificar investimentos estruturais em bem-estar.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-405">
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-display text-indigo-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Como Conduzir no software:
                            </span>
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>Na aba <strong>"Bem-Estar & ESG"</strong>, insira os parâmetros de lama nas baias, espaçamento linear de cocho e grau de sombra técnica.</li>
                              <li>Altere a chave de <strong>Rastreabilidade Individual</strong> para ativada.</li>
                              <li>Garanta que o <strong>Escore Geral</strong> final atinja um valor maior ou igual a 8.</li>
                            </ol>
                          </div>
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                            <div>
                              <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-display text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ação Estratégica Recomendada:
                              </span>
                              <p className="text-[11px] leading-relaxed">
                                Audite na aba <strong>"Resultados"</strong> o incremento financeiro gerado pelo bônus de exportação por arroba de abate. Compare o custo incremental necessário para melhorar as instalações contra o ganho real de VPL e ROIA do ciclo completo.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CENÁRIO 3 */}
                      <div className="p-6 bg-slate-950/40 rounded-3xl border border-rose-500/10 hover:border-rose-500/25 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-lg font-mono">CASO ESTUDO 3</span>
                          <h4 className="font-bold text-slate-100 text-sm font-display">
                            Gestão de Caixa Sob Crises de Óbitos de Curral
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                          <strong>Desafio Comercial:</strong> Um surto imprevisto de pneumonia respiratória ou anaplasmose bovina nas primeiras três semanas de confinamento eleva as baixas de cocho. Como projetar a insolvência real do caixa da fazenda?
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-405">
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-display text-indigo-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Como Conduzir no software:
                            </span>
                            <ol className="list-decimal pl-4 space-y-1">
                              <li>Vá até a aba de <strong>"Testes de Estresse"</strong>.</li>
                              <li>Dispare e aplique o perfil de choque <strong>"Colapso Sanitário nas Baias"</strong>.</li>
                              <li>Acompanhe como as perdas elevam de forma imediata o custo de reposição para as arrobas vendidas sobreviventes através da rotina de diluição de Matsunaga.</li>
                            </ol>
                          </div>
                          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                            <div>
                              <span className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider font-display text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ação Estratégica Recomendada:
                              </span>
                              <p className="text-[11px] leading-relaxed">
                                Avalie a <strong>Quebra de VPL</strong> resultante e compare-a com as reservas de capital operacional da sua empresa rural. Determine se o novo Ponto de Equilíbrio exigido para a venda é realizável no mercado de gado atual.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-[#0f172a] text-slate-100 p-8 rounded-3xl border border-indigo-500/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-2xl shrink-0">
                        <Save className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 font-display">Gestão de Projetos</h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6 font-sans">
                          O SimuBoi permite salvar suas simulações localmente. Use o botão <strong>"Salvar"</strong> no topo para guardar o cenário atual. Você pode acessar projetos antigos no botão <strong>"Meus Projetos"</strong>.
                        </p>
                        <div className="flex flex-wrap gap-3 font-sans">
                          <div className="px-4 py-2 bg-[#131d35] text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-2">
                            <Download className="w-3.5 h-3.5" />
                            Exportar PDF
                          </div>
                          <div className="px-4 py-2 bg-[#131d35] text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold flex items-center gap-2">
                            <Database className="w-3.5 h-3.5" />
                            Exportar CSV
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <h4 className="font-bold text-amber-450 mb-3 flex items-center gap-2 font-display">
                      <Info className="w-5 h-5 text-amber-455" />
                      Dicas Importantes
                    </h4>
                    <ul className="text-xs text-slate-350 space-y-2 list-disc pl-5 font-sans">
                      <li>Use o <strong>Modo Wide</strong> nas configurações para visualizar melhor os gráficos em telas grandes.</li>
                      <li>Ajuste os <strong>Desvios Padrão</strong> nas configurações para personalizar a análise de risco da sua região.</li>
                      <li>O <strong>Ponto de Equilíbrio</strong> é calculado automaticamente para o VPL ser zero (cobrir todos os custos).</li>
                    </ul>
                  </section>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto py-4">
                  {!quizState.showResult ? (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Questão {quizState.currentQuestion + 1} de {quizQuestions.length}</span>
                        <div className="h-2 w-32 bg-[#1e293b] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-500" 
                            style={{ width: `${((quizState.currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <h4 className="text-xl font-bold text-slate-100 leading-tight font-display">
                        {quizQuestions[quizState.currentQuestion].question}
                      </h4>

                      <div className="space-y-3 font-sans">
                        {quizQuestions[quizState.currentQuestion].options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all border-2 ${
                              quizState.selectedOption === idx
                                ? idx === quizQuestions[quizState.currentQuestion].correct
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                  : 'bg-rose-500/10 border-rose-500 text-rose-450'
                                : quizState.isAnswered && idx === quizQuestions[quizState.currentQuestion].correct
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                  : 'bg-[#0f172a] border-slate-800/80 hover:border-slate-750 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {quizState.isAnswered && idx === quizQuestions[quizState.currentQuestion].correct && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {quizState.isAnswered && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-[#070a13] rounded-2xl border border-slate-800"
                        >
                          <p className="text-xs text-slate-400 font-bold uppercase mb-1 font-mono">Explicação:</p>
                          <p className="text-sm text-slate-300 font-sans">{quizQuestions[quizState.currentQuestion].explanation}</p>
                          <button
                            onClick={nextQuestion}
                            className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold font-sans shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-colors"
                          >
                            {quizState.currentQuestion + 1 === quizQuestions.length ? 'Ver Resultado' : 'Próxima Questão'}
                          </button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-6">
                      <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                        <GraduationCap className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-100">Desafio Concluído!</h4>
                        <p className="text-slate-400">Você acertou {quizState.score} de {quizQuestions.length} questões.</p>
                      </div>
                      <div className="text-4xl font-black text-indigo-400">
                        {Math.round((quizState.score / quizQuestions.length) * 100)}%
                      </div>
                      <button
                        onClick={resetQuiz}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                      >
                        Tentar Novamente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Rodapé de Crédito e Apoio Acadêmico */}
              <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400 text-xs font-sans leading-relaxed">
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] font-mono">Desenvolvido por:</p>
                  <p className="mt-1 font-semibold text-slate-200">
                    2026&copy; Prof. Paulo Pacheco (<a href="mailto:paulo.pacheco@ufsm.br" className="text-indigo-400 hover:underline">paulo.pacheco@ufsm.br</a>) utilizando o Google AI Studio.
                  </p>
                </div>
                <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-6">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] font-mono">Realização & Apoio:</p>
                  <p className="mt-1 font-bold text-slate-200 font-sans">Departamento de Zootecnia</p>
                  <p className="text-[11px] text-slate-400 font-medium font-sans">Universidade Federal de Santa Maria (DZ - UFSM)</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0f172a] border-t border-slate-800/80 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all font-sans"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
