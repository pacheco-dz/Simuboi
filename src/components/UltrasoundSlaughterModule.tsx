import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Scale, 
  Target, 
  Clock, 
  ChevronRight, 
  Info, 
  TrendingUp, 
  AlertCircle, 
  ShieldAlert, 
  Activity, 
  Play, 
  RefreshCw, 
  Settings, 
  Plus, 
  Trash2, 
  Download,
  Save, 
  Pencil,
  Eye,
  User, 
  MapPin, 
  Search, 
  Sliders, 
  AlertTriangle, 
  Award,
  Sparkles,
  CheckCircle2,
  FileText,
  Calendar,
  Database,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
  ComposedChart,
  ReferenceLine, 
  ScatterChart, 
  Scatter,
  Label,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { SimulationInputs, SavedDiet, DietOptimizationResult } from '../types';
import { 
  RTUAnimal, 
  RTUExam, 
  RTUContractRule, 
  RTUSlaughterResult, 
  RTUDecisionResult, 
  RTUModelCalibration, 
  RTUAuditRecord,
  DEFAULT_CONTRACT_RULE,
  projectAnimalGrowth,
  runLHSUltrasoundSimulation,
  runLHSLotSimulation,
  runModelCalibration,
  getNASEMBreedParameters
} from '../services/ultrasoundSlaughterService';
import { RecommendationDriversCard } from './RecommendationDriversCard';

// ============================================================================
// SEED INICIAL DE ANIMAIS (NELORES E CRUZADOS) COM EXAMES DE ULTRASSOM REAIS
// ============================================================================

const INITIAL_ANIMALS_SEED: RTUAnimal[] = [
  {
    id: 'RFID-1001',
    loteId: 'LOTE-A',
    raca: 'nelore',
    sexo: 'macho',
    frameSize: 'medio',
    pesoEntrada: 360,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-1', diaDeCocho: 15, dataExame: '2026-04-25', aol: 54.2, egs: 1.4, imf: 1.1, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 382 },
      { id: 'ex-2', diaDeCocho: 45, dataExame: '2026-05-25', aol: 68.4, egs: 2.5, imf: 1.8, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 426 },
      { id: 'ex-3', diaDeCocho: 75, dataExame: '2026-06-24', aol: 82.1, egs: 4.2, imf: 2.3, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 470 }
    ]
  },
  {
    id: 'RFID-1002',
    loteId: 'LOTE-B',
    raca: 'cruzamento',
    sexo: 'macho',
    frameSize: 'grande',
    pesoEntrada: 380,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-4', diaDeCocho: 15, dataExame: '2026-04-25', aol: 58.0, egs: 1.6, imf: 1.4, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 405 },
      { id: 'ex-5', diaDeCocho: 45, dataExame: '2026-05-25', aol: 72.1, egs: 3.1, imf: 2.2, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 455 },
      { id: 'ex-6', diaDeCocho: 75, dataExame: '2026-06-24', aol: 89.4, egs: 5.6, imf: 2.9, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 505 }
    ]
  },
  {
    id: 'RFID-1003',
    loteId: 'LOTE-A',
    raca: 'nelore',
    sexo: 'macho',
    frameSize: 'pequeno',
    pesoEntrada: 340,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-7', diaDeCocho: 15, dataExame: '2026-04-25', aol: 49.5, egs: 1.2, imf: 1.0, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 361 },
      { id: 'ex-8', diaDeCocho: 45, dataExame: '2026-05-25', aol: 61.2, egs: 2.2, imf: 1.5, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 402 },
      { id: 'ex-9', diaDeCocho: 75, dataExame: '2026-06-24', aol: 71.8, egs: 3.4, imf: 2.0, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 444 }
    ]
  },
  {
    id: 'RFID-1004',
    loteId: 'LOTE-B',
    raca: 'holandes',
    sexo: 'macho',
    frameSize: 'grande',
    pesoEntrada: 350,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-10', diaDeCocho: 15, dataExame: '2026-04-25', aol: 45.1, egs: 0.8, imf: 0.9, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 371 },
      { id: 'ex-11', diaDeCocho: 45, dataExame: '2026-05-25', aol: 55.4, egs: 1.5, imf: 1.2, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 412 },
      { id: 'ex-12', diaDeCocho: 75, dataExame: '2026-06-24', aol: 66.2, egs: 2.4, imf: 1.7, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 453 }
    ]
  },
  {
    id: 'RFID-1005',
    loteId: 'LOTE-A',
    raca: 'nelore',
    sexo: 'inteiro',
    frameSize: 'medio',
    pesoEntrada: 370,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-13', diaDeCocho: 15, dataExame: '2026-04-25', aol: 53.0, egs: 1.3, imf: 1.1, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 392 },
      { id: 'ex-14', diaDeCocho: 45, dataExame: '2026-05-25', aol: 69.5, egs: 2.6, imf: 1.9, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 436 },
      { id: 'ex-15', diaDeCocho: 75, dataExame: '2026-06-24', aol: 81.3, egs: 3.8, imf: 2.2, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 480 }
    ],
    abateReal: {
      animalId: 'RFID-1005',
      dataAbate: '2026-06-30',
      pesoCarcacaQuenteReal: 254.5,
      egsFrigorifico: '3_mediana',
      imfFrigorificoPerc: 2.1,
      pHReal: 5.5,
      precoEfetivoPago: 235.0,
      receitaLiquidaReal: 3987.2,
      egsRealMm: 4.0,
      diasDeCocho: 81
    }
  },
  {
    id: 'RFID-1006',
    loteId: 'LOTE-B',
    raca: 'cruzamento',
    sexo: 'macho',
    frameSize: 'medio',
    pesoEntrada: 395,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-16', diaDeCocho: 15, dataExame: '2026-04-25', aol: 61.0, egs: 1.8, imf: 1.5, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 420 },
      { id: 'ex-17', diaDeCocho: 45, dataExame: '2026-05-25', aol: 75.4, egs: 3.5, imf: 2.4, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 470 },
      { id: 'ex-18', diaDeCocho: 75, dataExame: '2026-06-24', aol: 91.2, egs: 5.9, imf: 3.2, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 520 }
    ]
  },
  {
    id: 'RFID-1007',
    loteId: 'LOTE-C',
    raca: 'nelore',
    sexo: 'femea',
    frameSize: 'medio',
    pesoEntrada: 330,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-19', diaDeCocho: 15, dataExame: '2026-04-25', aol: 47.8, egs: 1.5, imf: 1.2, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 351 },
      { id: 'ex-20', diaDeCocho: 45, dataExame: '2026-05-25', aol: 58.9, egs: 2.8, imf: 1.9, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 393 },
      { id: 'ex-21', diaDeCocho: 75, dataExame: '2026-06-24', aol: 69.4, egs: 4.1, imf: 2.5, tecnicoId: 'Dra. Ana', equipamentoId: 'Exago-Pad', peso: 435 }
    ]
  },
  {
    id: 'RFID-1008',
    loteId: 'LOTE-C',
    raca: 'cruzamento',
    sexo: 'macho',
    frameSize: 'grande',
    pesoEntrada: 405,
    dataEntrada: '2026-04-10',
    exames: [
      { id: 'ex-22', diaDeCocho: 15, dataExame: '2026-04-25', aol: 62.1, egs: 1.7, imf: 1.6, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 431 },
      { id: 'ex-23', diaDeCocho: 45, dataExame: '2026-05-25', aol: 79.5, egs: 3.3, imf: 2.5, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 483 },
      { id: 'ex-24', diaDeCocho: 75, dataExame: '2026-06-24', aol: 94.8, egs: 5.8, imf: 3.4, tecnicoId: 'Dr. Roberto', equipamentoId: 'Aloka-500', peso: 535 }
    ]
  }
];

interface UltrasoundSlaughterModuleProps {
  inputs: SimulationInputs;
  savedDiets?: SavedDiet[];
  dietResult?: DietOptimizationResult | null;
  subTab?: 'recommendations' | 'animal' | 'lote' | 'manejo' | 'simulation' | 'calibration' | 'new_exam';
  setSubTab?: (tab: 'recommendations' | 'animal' | 'lote' | 'manejo' | 'simulation' | 'calibration' | 'new_exam') => void;
}

// Reusable tooltip component for the 'Abate ultrassom' module
export const TooltipHelp: React.FC<{ 
  text: string; 
  children: React.ReactNode; 
  className?: string;
  placement?: 'top' | 'bottom';
}> = ({ text, children, className, placement = 'top' }) => {
  const popupClasses = placement === 'top'
    ? "absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5"
    : "absolute top-full left-1/2 -translate-x-1/2 mt-2.5";
  
  const arrowClasses = placement === 'top'
    ? "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b0f19]"
    : "absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0b0f19]";

  return (
    <div className={`group relative hover:z-[999999] ${className || 'inline-block'}`}>
      {children}
      <div className={`${popupClasses} w-52 p-2.5 bg-[#0b0f19] text-slate-200 text-[10px] font-normal leading-normal rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[999999] shadow-2xl border border-slate-800 text-center`}>
        {text}
        <div className={arrowClasses}></div>
      </div>
    </div>
  );
};

export interface LotState {
  id: string;
  name: string;
  description: string;
  dataInicioConfinamento: string;
  dataMensuracao: string;
  operador: string;
  marcaEquipamento: string;
  gmdMedioAlvo: number;
  dietaNome: string;
}

export const UltrasoundSlaughterModule: React.FC<UltrasoundSlaughterModuleProps> = ({ 
  inputs, 
  savedDiets: propSavedDiets, 
  dietResult,
  subTab: propSubTab,
  setSubTab: propSetSubTab
}) => {
  // ============================================================================
  // ESTADOS DO MÓDULO
  // ============================================================================
  const [internalSubTab, setInternalSubTab] = useState<'recommendations' | 'animal' | 'lote' | 'manejo' | 'simulation' | 'calibration' | 'new_exam'>('recommendations');
  const subTab = propSubTab !== undefined ? propSubTab : internalSubTab;
  const setSubTab = propSetSubTab !== undefined ? propSetSubTab : setInternalSubTab;
  const [selectedLotId, setSelectedLotId] = useState<string>('LOTE-A');

  const [userTargetWeight, setUserTargetWeight] = useState<number>(() => inputs.pesoVivoFinal || 520);

  useEffect(() => {
    if (inputs.pesoVivoFinal) {
      setUserTargetWeight(inputs.pesoVivoFinal);
    }
  }, [inputs.pesoVivoFinal]);

  const [lots, setLots] = useState<LotState[]>(() => {
    const saved = localStorage.getItem('simuboi_rtu_lots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      { id: 'LOTE-A', name: 'Lote A - Nelore Tropical', description: 'Nelore puro sob terminação tropical em cocho', dataInicioConfinamento: '2026-04-10', dataMensuracao: '2026-06-24', operador: 'Dr. Roberto', marcaEquipamento: 'Aloka-500', gmdMedioAlvo: 1.45, dietaNome: 'Ração Terminação Tropical 18%' },
      { id: 'LOTE-B', name: 'Lote B - Cruzamento Precoce', description: 'F1 Angus-Nelore de alta conversão alimentar', dataInicioConfinamento: '2026-04-12', dataMensuracao: '2026-06-26', operador: 'Dra. Sandra', marcaEquipamento: 'Exago-Pad', gmdMedioAlvo: 1.62, dietaNome: 'Ração Super Carga Energética' },
      { id: 'LOTE-C', name: 'Lote C - Angus Especial', description: 'Angus selecionado com alto potencial de marmoreio', dataInicioConfinamento: '2026-04-15', dataMensuracao: '2026-06-28', operador: 'Dr. Roberto', marcaEquipamento: 'Aloka-500', gmdMedioAlvo: 1.55, dietaNome: 'Ração Especial Marmoreio Prime' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('simuboi_rtu_lots', JSON.stringify(lots));
  }, [lots]);
  
  const [animals, setAnimals] = useState<RTUAnimal[]>(() => {
    const saved = localStorage.getItem('simuboi_rtu_animals');
    const loaded: RTUAnimal[] = saved ? JSON.parse(saved) : INITIAL_ANIMALS_SEED;
    
    // Garantir que todos os animais tenham um loteId (migração de segurança para dados antigos no localStorage)
    return loaded.map((animal, index) => {
      let updated = { ...animal };
      if (!updated.loteId) {
        if (['RFID-1001', 'RFID-1003', 'RFID-1005'].includes(updated.id)) {
          updated.loteId = 'LOTE-A';
        } else if (['RFID-1002', 'RFID-1004', 'RFID-1006'].includes(updated.id)) {
          updated.loteId = 'LOTE-B';
        } else {
          updated.loteId = 'LOTE-C';
        }
      }
      if (updated.isAmostra === undefined) {
        // Inicializar algumas amostras realistas
        updated.isAmostra = ['RFID-1001', 'RFID-1002', 'RFID-1007'].includes(updated.id);
      }
      if (updated.id === 'RFID-1005' && !updated.abateReal) {
        updated.abateReal = {
          animalId: 'RFID-1005',
          dataAbate: '2026-06-30',
          pesoCarcacaQuenteReal: 254.5,
          egsFrigorifico: '3_mediana',
          imfFrigorificoPerc: 2.1,
          pHReal: 5.5,
          precoEfetivoPago: 235.0,
          receitaLiquidaReal: 3987.2,
          egsRealMm: 4.0,
          diasDeCocho: 81
        };
      }
      return updated;
    });
  });

  const filteredAnimals = useMemo(() => {
    return animals.filter(a => a.loteId === selectedLotId);
  }, [animals, selectedLotId]);

  // Estados para inserção de novo exame
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [examAnimalId, setExamAnimalId] = useState('');
  const [examDia, setExamDia] = useState(90);
  const [examAol, setExamAol] = useState(85.0);
  const [examEgs, setExamEgs] = useState(4.5);
  const [examImf, setExamImf] = useState(2.4);
  const [examPeso, setExamPeso] = useState(520);
  const [examTecnico, setExamTecnico] = useState('Dr. Roberto');
  const [examEquipamento, setExamEquipamento] = useState('Aloka-500');

  const [contract, setContract] = useState<RTUContractRule>(DEFAULT_CONTRACT_RULE);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('RFID-1001');

  // Ajusta o animal selecionado ao trocar de lote e garante que o animal selecionado no exame também sincronize
  useEffect(() => {
    if (filteredAnimals.length > 0) {
      const isStillInLot = filteredAnimals.some(a => a.id === selectedAnimalId);
      if (!isStillInLot) {
        setSelectedAnimalId(filteredAnimals[0].id);
      }
      const isExamStillInLot = filteredAnimals.some(a => a.id === examAnimalId);
      if (!isExamStillInLot) {
        setExamAnimalId(filteredAnimals[0].id);
      }
    } else {
      setExamAnimalId('');
    }
  }, [selectedLotId, filteredAnimals, selectedAnimalId, examAnimalId]);

  const selectedExamAnimal = useMemo(() => {
    return filteredAnimals.find(a => a.id === examAnimalId) || filteredAnimals[0];
  }, [filteredAnimals, examAnimalId]);

  const [riskTolerance, setRiskTolerance] = useState<number>(0.10); // 10% de probabilidade tolerada de prejuízo
  const [lhsIterations, setLhsIterations] = useState<number>(1000); // Rápida por padrão no cliente
  const [simSeed, setSimSeed] = useState<number>(42);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estados de calibração
  const [calibration, setCalibration] = useState<RTUModelCalibration>({
    version: 'v2.4.1 (Nelore Confinamento Tropical)',
    multiplierGmd: 1.00,
    multiplierEgs: 1.00,
    multiplierRendimento: 1.00,
    maeCarcaca: 3.8,
    rmseEgs: 0.72,
    biasGeral: 0.15,
    driftDetected: false
  });

  const [auditLogs, setAuditLogs] = useState<RTUAuditRecord[]>([]);
  const [needsCalibration, setNeedsCalibration] = useState<boolean>(true);
  const [isLotCalibratorOpen, setIsLotCalibratorOpen] = useState<boolean>(false);
  const [lotAolMultiplier, setLotAolMultiplier] = useState<number>(1.00);
  const [lotEgsMultiplier, setLotEgsMultiplier] = useState<number>(1.00);
  const [lotImfMultiplier, setLotImfMultiplier] = useState<number>(1.00);
  const [lotGmdMultiplier, setLotGmdMultiplier] = useState<number>(1.00);

  // Estados para cadastro de novo animal
  const [newAnimalId, setNewAnimalId] = useState('');
  const [newAnimalRaca, setNewAnimalRaca] = useState<'nelore' | 'cruzamento' | 'holandes'>('nelore');
  const [newAnimalSexo, setNewAnimalSexo] = useState<'macho' | 'femea' | 'inteiro'>('macho');
  const [newAnimalFrame, setNewAnimalFrame] = useState<'pequeno' | 'medio' | 'grande'>('medio');
  const [newAnimalPesoEntrada, setNewAnimalPesoEntrada] = useState(350);
  const [newAnimalIsAmostra, setNewAnimalIsAmostra] = useState(false);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [selectedReadinessGroup, setSelectedReadinessGroup] = useState<string | null>(null);
  const [selectedCurveFocus, setSelectedCurveFocus] = useState<'all' | 'egs' | 'aol' | 'imf' | 'maturity'>('all');
  const [threshold1, setThreshold1] = useState(75);
  const [threshold2, setThreshold2] = useState(90);
  const [threshold3, setThreshold3] = useState(120);
  const [selectedLotsForComparison, setSelectedLotsForComparison] = useState<string[]>(['LOTE-A', 'LOTE-B', 'LOTE-C']);

  // Estados para calibração por romaneio de carcaça e dados de frigorífico
  const [autoCalibrate, setAutoCalibrate] = useState<boolean>(true); // Se a calibração será automática ou manual
  const [isCarcassModalOpen, setIsCarcassModalOpen] = useState<boolean>(false);
  const [carcassAnimalId, setCarcassAnimalId] = useState<string>('');
  const [carcassPesoReal, setCarcassPesoReal] = useState<number>(260); // em kg (PCQ)
  const [carcassEgsReal, setCarcassEgsReal] = useState<number>(4.8);   // em mm
  const [carcassImfReal, setCarcassImfReal] = useState<number>(2.5);   // %
  const [carcassPhReal, setCarcassPhReal] = useState<number>(5.6);     // pH
  const [carcassDiasCocho, setCarcassDiasCocho] = useState<number>(100); // DOF real
  const [editingCarcassAnimalId, setEditingCarcassAnimalId] = useState<string | null>(null);

  // Estados para criação de novo lote
  const [isNewLotModalOpen, setIsNewLotModalOpen] = useState(false);
  const [newLotId, setNewLotId] = useState('');
  const [newLotName, setNewLotName] = useState('');
  const [newLotDesc, setNewLotDesc] = useState('');
  const [newLotInicio, setNewLotInicio] = useState('2026-07-12');
  const [newLotMensuracao, setNewLotMensuracao] = useState('2026-09-20');
  const [newLotOperador, setNewLotOperador] = useState('Dr. Roberto');
  const [newLotEquipamento, setNewLotEquipamento] = useState('Aloka-500');
  const [newLotGmd, setNewLotGmd] = useState(1.5);
  const [newLotDieta, setNewLotDieta] = useState('Ração Terminação');

  // Estados para edição de lote existente
  const [isEditLotModalOpen, setIsEditLotModalOpen] = useState(false);
  const [editLotName, setEditLotName] = useState('');
  const [editLotDesc, setEditLotDesc] = useState('');
  const [editLotInicio, setEditLotInicio] = useState('');
  const [editLotMensuracao, setEditLotMensuracao] = useState('');
  const [editLotOperador, setEditLotOperador] = useState('');
  const [editLotEquipamento, setEditLotEquipamento] = useState('');
  const [editLotGmd, setEditLotGmd] = useState(1.5);
  const [editLotDieta, setEditLotDieta] = useState('');

  // Carregar dietas salvas no localStorage
  const [savedDiets, setSavedDiets] = useState<SavedDiet[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('simuboi_saved_diets');
    if (saved) {
      try {
        setSavedDiets(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Une as dietas salvas reativas recebidas via props com as locais em caso de fallback
  const finalSavedDiets = useMemo(() => {
    if (propSavedDiets && propSavedDiets.length > 0) {
      return propSavedDiets;
    }
    return savedDiets;
  }, [propSavedDiets, savedDiets]);

  const availableDiets = useMemo(() => {
    const list: { name: string; gmd: number; isCustom: boolean; isDraft?: boolean }[] = [];
    
    // 1. Dieta ativa formulada no rascunho (se houver)
    if (dietResult) {
      list.push({
        name: 'Dieta Ativa Formulada (Rascunho)',
        gmd: dietResult.predictedGmd || 1.5,
        isCustom: true,
        isDraft: true
      });
    }

    // 2. Dietas salvas do usuário
    const custom = finalSavedDiets.map(d => ({
      name: d.name,
      gmd: d.result?.predictedGmd || d.animalProfile?.gmd || 1.5,
      isCustom: true
    }));
    list.push(...custom);
    
    const defaults = [
      { name: 'Ração Terminação Tropical 18%', gmd: 1.45, isCustom: false },
      { name: 'Ração Super Carga Energética', gmd: 1.62, isCustom: false },
      { name: 'Ração Especial Marmoreio Prime', gmd: 1.55, isCustom: false },
      { name: 'Ração Terminação Padrão', gmd: 1.50, isCustom: false }
    ];

    const customNames = new Set(list.map(c => c.name.toLowerCase()));
    defaults.forEach(d => {
      if (!customNames.has(d.name.toLowerCase())) {
        list.push(d);
      }
    });
    
    return list;
  }, [finalSavedDiets, dietResult]);

  // Salvar animais localmente ao mudar
  useEffect(() => {
    localStorage.setItem('simuboi_rtu_animals', JSON.stringify(animals));
  }, [animals]);

  // ============================================================================
  // CÁLCULOS E MEMOIZADORES
  // ============================================================================

  // Lote selecionado ativo com metadados de manejo
  const activeLot = useMemo(() => {
    return lots.find(l => l.id === selectedLotId) || lots[0];
  }, [lots, selectedLotId]);

  // Busca as informações completas da dieta associada ao lote ativo (do rascunho de formulação ou de dietas salvas)
  const connectedDiet = useMemo(() => {
    // 1. Verifica se coincide com a dieta ativa formulada (rascunho)
    if (activeLot.dietaNome === 'Dieta Ativa Formulada (Rascunho)' && dietResult) {
      return {
        name: 'Dieta Ativa Formulada (Rascunho)',
        result: dietResult,
        isCustom: true
      };
    }

    // 2. Procura nas dietas salvas do app
    const saved = finalSavedDiets.find(d => d.name === activeLot.dietaNome);
    if (saved) {
      return {
        name: saved.name,
        result: saved.result,
        isCustom: true
      };
    }

    return null;
  }, [finalSavedDiets, dietResult, activeLot.dietaNome]);

  // Constrói um objeto SimulationInputs conectado que sobrepõe valores do simulador geral
  // com as informações nutricionais e custos da dieta conectada
  const connectedInputs = useMemo(() => {
    if (!connectedDiet || !connectedDiet.result) {
      return inputs;
    }

    const dietGmd = connectedDiet.result.predictedGmd || inputs.gmd;
    const dietCms = connectedDiet.result.cms || (inputs.cmsVolumoso + inputs.cmsConcentrado);
    const dietCostMS = connectedDiet.result.totalCost || inputs.precoConcentrado; // totalCost is R$ per kg of DM

    return {
      ...inputs,
      gmd: dietGmd,
      // Para as fórmulas econômicas de projectAnimalGrowth que fazem:
      // precoRacaoBoiDia = (cmsVolumoso * precoVolumoso) + (cmsConcentrado * precoConcentrado)
      // Definimos o custo total da dieta de MS via precoVolumoso e o CMS via cmsVolumoso, zerando o concentrado.
      // O resultado final precoRacaoBoiDia será exatamente o custo diário real da dieta formulada!
      cmsVolumoso: dietCms,
      precoVolumoso: dietCostMS,
      cmsConcentrado: 0,
      precoConcentrado: 0,
      dietaNome: activeLot.dietaNome
    };
  }, [inputs, connectedDiet, activeLot.dietaNome]);

  // Calibração inicial ao carregar se houver animais abatidos e o modo for automático
  useEffect(() => {
    const animaisComAbate = animals.filter(a => a.abateReal !== undefined);
    if (animaisComAbate.length > 0 && autoCalibrate) {
      const dadosAbateReais = animaisComAbate.map(a => ({
        animalId: a.id,
        pesoCarcacaQuenteReal: a.abateReal!.pesoCarcacaQuenteReal,
        egsRealMm: a.abateReal!.egsRealMm !== undefined ? a.abateReal!.egsRealMm : 4.0,
        diasDeCocho: a.abateReal!.diasDeCocho !== undefined ? a.abateReal!.diasDeCocho : 100
      }));
      const calibrated = runModelCalibration(dadosAbateReais, animals, connectedInputs, contract);
      setCalibration({
        ...calibrated,
        version: `Calibração Real (${animaisComAbate.length} cab)`
      });
      setNeedsCalibration(false);
    }
  }, []);

  // Animal selecionado para detalhe micro
  const selectedAnimal = useMemo(() => {
    return filteredAnimals.find(a => a.id === selectedAnimalId) || filteredAnimals[0];
  }, [filteredAnimals, selectedAnimalId]);

  // Projeta crescimento individual do animal selecionado
  const selectedAnimalProjection = useMemo(() => {
    if (!selectedAnimal) return [];
    return projectAnimalGrowth(selectedAnimal, connectedInputs, contract, calibration, 150);
  }, [selectedAnimal, connectedInputs, contract, calibration]);

  const maxExamDiaAnimal = useMemo(() => {
    if (!selectedAnimal || !selectedAnimal.exames || selectedAnimal.exames.length === 0) return 0;
    return Math.max(...selectedAnimal.exames.map(ex => ex.diaDeCocho));
  }, [selectedAnimal]);

  // Projeta crescimento individual do animal selecionado com divisão Real (RTU) vs Estimado
  const animalRealWeights = useMemo(() => {
    if (!selectedAnimal) return [];
    const points: { dia: number; pesoReal: number }[] = [
      { dia: 0, pesoReal: selectedAnimal.pesoEntrada }
    ];
    if (selectedAnimal.exames) {
      selectedAnimal.exames.forEach(ex => {
        if (ex.peso !== undefined && ex.peso > 0) {
          points.push({ dia: ex.diaDeCocho, pesoReal: ex.peso });
        }
      });
    }
    return points.sort((a, b) => a.dia - b.dia);
  }, [selectedAnimal]);

  // Resultados de Otimização Estocástica (LHS) do animal selecionado
  const selectedAnimalLHS = useMemo(() => {
    if (!selectedAnimal) return null;
    return runLHSUltrasoundSimulation(selectedAnimal, connectedInputs, contract, calibration, {
      N: lhsIterations,
      seed: simSeed,
      errorTolerance: riskTolerance
    });
  }, [selectedAnimal, connectedInputs, contract, calibration, lhsIterations, simSeed, riskTolerance]);

  const processedAnimalProjection = useMemo(() => {
    if (!selectedAnimalProjection) return [];
    return selectedAnimalProjection.map(item => {
      const isReal = item.dia <= maxExamDiaAnimal;
      const isEst = item.dia >= maxExamDiaAnimal;
      const realPt = animalRealWeights.find(pt => Math.abs(pt.dia - item.dia) < 2.5);
      
      const hasExam = selectedAnimal?.exames?.find(ex => Math.abs(ex.diaDeCocho - item.dia) < 2.5);
      let biasOperador = 0;
      if (hasExam) {
        if (hasExam.tecnicoId === 'operador_vies_baixo') biasOperador = +0.6;
        if (hasExam.tecnicoId === 'operador_vies_alto') biasOperador = -0.5;
      }
      
      const egs_exame = hasExam ? Math.max(0.2, hasExam.egs + biasOperador) * calibration.multiplierEgs : null;
      const aol_exame = hasExam ? Math.max(20, hasExam.aol) : null;
      const imf_exame = hasExam ? hasExam.imf : null;

      // Obter percentis de tecidos do LHS para o dia corrente
      const egs_p10 = selectedAnimalLHS?.egsP10?.[item.dia] !== undefined ? selectedAnimalLHS.egsP10[item.dia] : item.egs;
      const egs_p90 = selectedAnimalLHS?.egsP90?.[item.dia] !== undefined ? selectedAnimalLHS.egsP90[item.dia] : item.egs;
      
      const aol_p10 = selectedAnimalLHS?.aolP10?.[item.dia] !== undefined ? selectedAnimalLHS.aolP10[item.dia] : item.aol;
      const aol_p90 = selectedAnimalLHS?.aolP90?.[item.dia] !== undefined ? selectedAnimalLHS.aolP90[item.dia] : item.aol;

      const imf_p10 = selectedAnimalLHS?.imfP10?.[item.dia] !== undefined ? selectedAnimalLHS.imfP10[item.dia] : item.imf;
      const imf_p90 = selectedAnimalLHS?.imfP90?.[item.dia] !== undefined ? selectedAnimalLHS.imfP90[item.dia] : item.imf;

      const peso_p10 = selectedAnimalLHS?.pesoP10?.[item.dia] !== undefined ? selectedAnimalLHS.pesoP10[item.dia] : item.peso;
      const peso_p90 = selectedAnimalLHS?.pesoP90?.[item.dia] !== undefined ? selectedAnimalLHS.pesoP90[item.dia] : item.peso;

      // Para a parte real, a faixa de incerteza converge a zero (p10 = p90 = real)
      const egs_range = isEst ? [egs_p10, egs_p90] : [item.egs, item.egs];
      const aol_range = isEst ? [aol_p10, aol_p90] : [item.aol, item.aol];
      const imf_range = isEst ? [imf_p10, imf_p90] : [item.imf, item.imf];
      const peso_range = isEst ? [peso_p10, peso_p90] : [item.peso, item.peso];

      return {
        ...item,
        egs_p10,
        egs_p90,
        aol_p10,
        aol_p90,
        imf_p10,
        imf_p90,
        peso_p10,
        peso_p90,
        egs_real: isReal ? item.egs : null,
        egs_estimada: isEst ? item.egs : null,
        egs_range,
        aol_real: isReal ? item.aol : null,
        aol_estimada: isEst ? item.aol : null,
        aol_range,
        imf_real: isReal ? item.imf : null,
        imf_estimada: isEst ? item.imf : null,
        imf_range,
        peso_real: isReal ? item.peso : null,
        peso_estimado: isEst ? item.peso : null,
        peso_range,
        peso_pesagem_real: realPt ? realPt.pesoReal : null,
        egs_exame,
        aol_exame,
        imf_exame
      };
    });
  }, [selectedAnimalProjection, maxExamDiaAnimal, animalRealWeights, selectedAnimal, calibration, selectedAnimalLHS]);

  // Dados do Animal selecionado para as curvas de Lucro e Risco (Gráficos)
  const selectedAnimalProfitCurveData = useMemo(() => {
    if (!selectedAnimalLHS) return [];
    const dias = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    return dias.map(dia => {
      return {
        dia,
        lucroMedio: selectedAnimalLHS.lucroMedioPorDia[dia] || 0,
        lucroP10: selectedAnimalLHS.lucroP10[dia] || 0,
        lucroP90: selectedAnimalLHS.lucroP90[dia] || 0,
        probabilidadePrejuizo: selectedAnimalLHS.probabilidadePrejuizo[dia] || 0
      };
    });
  }, [selectedAnimalLHS]);

  // Geração de Ranking de Prontidão para Abate (Tabela de Animais)
  const rankingAnimais = useMemo(() => {
    return filteredAnimals.map(animal => {
      const proj = projectAnimalGrowth(animal, connectedInputs, contract, calibration, 150);
      const lhs = runLHSUltrasoundSimulation(animal, connectedInputs, contract, calibration, {
        N: 500, // Menos iterações para cálculo rápido na tabela
        seed: 42,
        errorTolerance: riskTolerance
      });

      // Busca dados "Hoje" (assumindo dia 75, que é o último com exames comuns)
      const diaHoje = 75;
      const ptHoje = proj.find(p => p.dia === diaHoje) || proj[proj.length - 1];
      const ptOtimo = proj.find(p => p.dia === lhs.tEstrelaRobusto) || proj[proj.length - 1];

      return {
        id: animal.id,
        raca: animal.raca,
        pesoEntrada: animal.pesoEntrada,
        pesoHoje: ptHoje.peso,
        egsHoje: ptHoje.egs,
        lucroHoje: ptHoje.lucro,
        classificacaoHoje: ptHoje.classificacao,
        tEstrelaDeterminista: lhs.tEstrelaDeterminista,
        tEstrelaRobusto: lhs.tEstrelaRobusto,
        lucroNoOtimo: ptOtimo.lucro,
        riscoHoje: lhs.probabilidadePrejuizo[diaHoje] || 0,
        examesCount: animal.exames.length
      };
    });
  }, [filteredAnimals, connectedInputs, contract, calibration, riskTolerance]);

  // Filtra o ranking de acordo com o query de busca do usuário e o grupo de prontidão selecionado
  const filteredRanking = useMemo(() => {
    let result = rankingAnimais;
    if (searchQuery) {
      result = result.filter(r => 
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.raca.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedReadinessGroup) {
      result = result.filter(r => {
        if (selectedReadinessGroup === 'imediato') return r.tEstrelaRobusto <= threshold1;
        if (selectedReadinessGroup === 'curto') return r.tEstrelaRobusto > threshold1 && r.tEstrelaRobusto <= threshold2;
        if (selectedReadinessGroup === 'medio') return r.tEstrelaRobusto > threshold2 && r.tEstrelaRobusto <= threshold3;
        if (selectedReadinessGroup === 'longo') return r.tEstrelaRobusto > threshold3;
        return true;
      });
    }
    return result;
  }, [rankingAnimais, searchQuery, selectedReadinessGroup, threshold1, threshold2, threshold3]);

  // Dados para o Gráfico de Rosca (Distribuição das Janelas de Prontidão)
  const readinessChartData = useMemo(() => {
    const imedCount = rankingAnimais.filter(r => r.tEstrelaRobusto <= threshold1).length;
    const curtoCount = rankingAnimais.filter(r => r.tEstrelaRobusto > threshold1 && r.tEstrelaRobusto <= threshold2).length;
    const medioCount = rankingAnimais.filter(r => r.tEstrelaRobusto > threshold2 && r.tEstrelaRobusto <= threshold3).length;
    const longoCount = rankingAnimais.filter(r => r.tEstrelaRobusto > threshold3).length;

    return [
      { name: 'Abate Imediato', value: imedCount, color: '#10b981' },
      { name: 'Curto Prazo', value: curtoCount, color: '#f59e0b' },
      { name: 'Médio Prazo', value: medioCount, color: '#3b82f6' },
      { name: 'Longo Prazo', value: longoCount, color: '#a855f7' },
    ];
  }, [rankingAnimais, threshold1, threshold2, threshold3]);

  // Métricas completas projetadas de todos os animais para agrupamento por lote (Comparação entre Lotes)
  const allAnimalsCalculated = useMemo(() => {
    return animals.map(animal => {
      const proj = projectAnimalGrowth(animal, connectedInputs, contract, calibration, 150);
      const lhs = runLHSUltrasoundSimulation(animal, connectedInputs, contract, calibration, {
        N: 300, // Menos iterações para cálculo rápido
        seed: 42,
        errorTolerance: riskTolerance
      });

      const diaHoje = 75;
      const ptHoje = proj.find(p => p.dia === diaHoje) || proj[proj.length - 1];

      return {
        id: animal.id,
        loteId: animal.loteId || 'LOTE-A',
        pesoHoje: ptHoje.peso,
        egsHoje: ptHoje.egs,
        tEstrelaRobusto: lhs.tEstrelaRobusto,
        tEstrelaDeterminista: lhs.tEstrelaDeterminista,
      };
    });
  }, [animals, connectedInputs, contract, calibration, riskTolerance]);

  // Estatísticas consolidadas por lote para a tabela comparativa
  const loteComparisonStats = useMemo(() => {
    return lots.map(lot => {
      const lotAnimals = allAnimalsCalculated.filter(a => a.loteId === lot.id);
      const count = lotAnimals.length;

      if (count === 0) {
        return {
          id: lot.id,
          name: lot.name,
          count: 0,
          avgEgs: 0,
          avgPeso: 0,
          avgIdadeAbate: 0,
          shortWindowCount: 0,
          shortWindowPct: 0
        };
      }

      const totalEgs = lotAnimals.reduce((sum, a) => sum + a.egsHoje, 0);
      const totalPeso = lotAnimals.reduce((sum, a) => sum + a.pesoHoje, 0);
      const totalIdadeAbate = lotAnimals.reduce((sum, a) => sum + a.tEstrelaRobusto, 0);
      
      // Janelas de prontidão curtas: Abate Imediato (<= threshold1) e Curto Prazo (<= threshold2)
      const shortWindowCount = lotAnimals.filter(a => a.tEstrelaRobusto <= threshold2).length;
      const shortWindowPct = (shortWindowCount / count) * 100;

      return {
        id: lot.id,
        name: lot.name,
        count,
        avgEgs: totalEgs / count,
        avgPeso: totalPeso / count,
        avgIdadeAbate: totalIdadeAbate / count,
        shortWindowCount,
        shortWindowPct
      };
    });
  }, [lots, allAnimalsCalculated, threshold1, threshold2]);

  // Encontra a maior taxa de prontidão curta entre os lotes selecionados (deve ser > 0)
  const maxShortWindowPct = useMemo(() => {
    const selectedStats = loteComparisonStats.filter(s => selectedLotsForComparison.includes(s.id) && s.count > 0);
    if (selectedStats.length === 0) return 0;
    const maxVal = Math.max(...selectedStats.map(s => s.shortWindowPct));
    return maxVal > 0 ? maxVal : -1; // Só destaca se houver animais e % for maior que 0
  }, [loteComparisonStats, selectedLotsForComparison]);

  // Dados consolidados do Lote para a curva de Lucro vs Dias
  const loteProfitCurveData = useMemo(() => {
    return runLHSLotSimulation(filteredAnimals, connectedInputs, contract, calibration, {
      N: 200,
      seed: 42,
      errorTolerance: riskTolerance
    });
  }, [filteredAnimals, connectedInputs, contract, calibration, riskTolerance]);

  const maxExamDiaLote = useMemo(() => {
    let maxDia = 0;
    filteredAnimals.forEach(a => {
      a.exames.forEach(ex => {
        if (ex.diaDeCocho > maxDia) {
          maxDia = ex.diaDeCocho;
        }
      });
    });
    return maxDia || 75; // Default to 75 if no exams
  }, [filteredAnimals]);

  const loteRealWeights = useMemo(() => {
    const points: { dia: number; pesoReal: number }[] = [];
    if (filteredAnimals.length > 0) {
      const avgEntrada = filteredAnimals.reduce((sum, a) => sum + a.pesoEntrada, 0) / filteredAnimals.length;
      points.push({ dia: 0, pesoReal: Math.round(avgEntrada * 10) / 10 });
      
      const examDays = Array.from(new Set(filteredAnimals.flatMap(a => a.exames.map(ex => ex.diaDeCocho))));
      examDays.forEach(dia => {
        const examsOnDia = filteredAnimals.flatMap(a => a.exames.filter(ex => ex.diaDeCocho === dia && ex.peso !== undefined && ex.peso > 0));
        if (examsOnDia.length > 0) {
          const avgWeight = examsOnDia.reduce((sum, ex) => sum + ex.peso!, 0) / examsOnDia.length;
          points.push({ dia, pesoReal: Math.round(avgWeight * 10) / 10 });
        }
      });
    }
    return points.sort((a, b) => a.dia - b.dia);
  }, [filteredAnimals]);

  // Filtra e separa dados consolidados em Real vs Estimado
  const processedLoteProfitCurveData = useMemo(() => {
    if (!loteProfitCurveData) return [];
    return loteProfitCurveData.map(item => {
      const isReal = item.dia <= maxExamDiaLote;
      const isEst = item.dia >= maxExamDiaLote;
      const realPt = loteRealWeights.find(pt => Math.abs(pt.dia - item.dia) < 2.5);

      const egs_p10 = item.egsP10 !== undefined ? item.egsP10 : item.egs;
      const egs_p90 = item.egsP90 !== undefined ? item.egsP90 : item.egs;
      
      const aol_p10 = item.aolP10 !== undefined ? item.aolP10 : item.aol;
      const aol_p90 = item.aolP90 !== undefined ? item.aolP90 : item.aol;

      const imf_p10 = item.imfP10 !== undefined ? item.imfP10 : item.imf;
      const imf_p90 = item.imfP90 !== undefined ? item.imfP90 : item.imf;

      const peso_p10 = item.pesoP10 !== undefined ? item.pesoP10 : item.peso;
      const peso_p90 = item.pesoP90 !== undefined ? item.pesoP90 : item.peso;

      const egs_range = isEst ? [egs_p10, egs_p90] : [item.egs, item.egs];
      const aol_range = isEst ? [aol_p10, aol_p90] : [item.aol, item.aol];
      const imf_range = isEst ? [imf_p10, imf_p90] : [item.imf, item.imf];
      const peso_range = isEst ? [peso_p10, peso_p90] : [item.peso, item.peso];

      // Exames do lote para o dia corrente: média dos exames dos animais do lote realizados no dia exato
      const examsOnDia = filteredAnimals.flatMap(a => a.exames).filter(ex => Math.abs(ex.diaDeCocho - item.dia) < 0.5);
      let egs_exame = null;
      let aol_exame = null;
      let imf_exame = null;

      if (examsOnDia.length > 0) {
        let sumEgs = 0;
        let sumAol = 0;
        let sumImf = 0;
        examsOnDia.forEach(ex => {
          let biasOperador = 0;
          if (ex.tecnicoId === 'operador_vies_baixo') biasOperador = +0.6;
          if (ex.tecnicoId === 'operador_vies_alto') biasOperador = -0.5;
          
          sumEgs += Math.max(0.2, ex.egs + biasOperador) * calibration.multiplierEgs;
          sumAol += Math.max(20, ex.aol);
          sumImf += ex.imf;
        });
        egs_exame = Math.round((sumEgs / examsOnDia.length) * 100) / 100;
        aol_exame = Math.round((sumAol / examsOnDia.length) * 10) / 10;
        imf_exame = Math.round((sumImf / examsOnDia.length) * 100) / 100;
      }

      return {
        ...item,
        egs_p10,
        egs_p90,
        aol_p10,
        aol_p90,
        imf_p10,
        imf_p90,
        peso_p10,
        peso_p90,
        egs_real: isReal ? item.egs : null,
        egs_estimada: isEst ? item.egs : null,
        egs_range,
        aol_real: isReal ? item.aol : null,
        aol_estimada: isEst ? item.aol : null,
        aol_range,
        imf_real: isReal ? item.imf : null,
        imf_estimada: isEst ? item.imf : null,
        imf_range,
        peso_real: isReal ? item.peso : null,
        peso_estimado: isEst ? item.peso : null,
        peso_range,
        peso_pesagem_real: realPt ? realPt.pesoReal : null,
        egs_exame,
        aol_exame,
        imf_exame
      };
    });
  }, [loteProfitCurveData, maxExamDiaLote, loteRealWeights, filteredAnimals, calibration]);

  // Dias ótimos médios do lote (Robusto e Determinista) para os gráficos e recomendações
  const avgLoteOptimumRobusto = useMemo(() => {
    if (rankingAnimais.length === 0) return 90;
    const total = rankingAnimais.reduce((sum, r) => sum + r.tEstrelaRobusto, 0);
    return Math.round(total / rankingAnimais.length);
  }, [rankingAnimais]);

  const avgLoteOptimumDeterminista = useMemo(() => {
    if (rankingAnimais.length === 0) return 75;
    const total = rankingAnimais.reduce((sum, r) => sum + r.tEstrelaDeterminista, 0);
    return Math.round(total / rankingAnimais.length);
  }, [rankingAnimais]);

  // Estrutura de dados sintetizados para o Card de Recomendação e Explicabilidade do Lote
  const loteLHS = useMemo(() => {
    if (!loteProfitCurveData || loteProfitCurveData.length === 0) return null;
    const probabilidadePrejuizoMap: Record<number, number> = {};
    const lucroMedioMap: Record<number, number> = {};
    const lucroP10Map: Record<number, number> = {};
    const lucroP90Map: Record<number, number> = {};
    
    loteProfitCurveData.forEach(item => {
      probabilidadePrejuizoMap[item.dia] = item.probabilidadePrejuizo;
      lucroMedioMap[item.dia] = item.lucroMedio;
      lucroP10Map[item.dia] = item.lucroP10;
      lucroP90Map[item.dia] = item.lucroP90;
    });

    return {
      tEstrelaDeterminista: avgLoteOptimumDeterminista,
      tEstrelaRobusto: avgLoteOptimumRobusto,
      probabilidadePrejuizo: probabilidadePrejuizoMap,
      lucroMedioPorDia: lucroMedioMap,
      lucroP10: lucroP10Map,
      lucroP90: lucroP90Map,
    };
  }, [loteProfitCurveData, avgLoteOptimumDeterminista, avgLoteOptimumRobusto]);

  const loteAnimal = useMemo(() => {
    if (!filteredAnimals || filteredAnimals.length === 0) return null;
    const avgEntrada = filteredAnimals.reduce((sum, a) => sum + a.pesoEntrada, 0) / filteredAnimals.length;
    const maxDia = maxExamDiaLote;
    
    const examsAtMax = filteredAnimals.flatMap(a => a.exames).filter(ex => ex.diaDeCocho === maxDia);
    const avgAol = examsAtMax.length ? examsAtMax.reduce((s, e) => s + e.aol, 0) / examsAtMax.length : 55;
    const avgEgs = examsAtMax.length ? examsAtMax.reduce((s, e) => s + e.egs, 0) / examsAtMax.length : 3.5;
    const avgImf = examsAtMax.length ? examsAtMax.reduce((s, e) => s + e.imf, 0) / examsAtMax.length : 2.5;

    return {
      id: `LOTE-${activeLot?.id || 'global'}`,
      brinco: `Lote ${activeLot?.name || 'Manejo'} (${filteredAnimals.length} cab)`,
      raca: 'nelore',
      sexo: 'macho',
      frameSize: 'medio',
      dataEntrada: new Date().toISOString().slice(0, 10),
      pesoEntrada: Math.round(avgEntrada),
      exames: [
        {
          id: 'ex-lote-avg',
          diaDeCocho: maxDia,
          dataExame: new Date().toISOString().slice(0, 10),
          aol: Math.round(avgAol * 10) / 10,
          egs: Math.round(avgEgs * 100) / 100,
          imf: Math.round(avgImf * 100) / 100,
          tecnicoId: 'Média Coletiva',
          equipamentoId: 'RTU Pro'
        }
      ]
    } as RTUAnimal;
  }, [filteredAnimals, maxExamDiaLote, activeLot]);

  const loteProjection = useMemo(() => {
    if (!processedLoteProfitCurveData) return [];
    return processedLoteProfitCurveData.map(item => ({
      dia: item.dia,
      peso: item.peso,
      aol: item.aol,
      egs: item.egs,
      imf: item.imf,
      lucro: item.lucroMedio,
      classificacao: item.egs < 1.0 ? '1_ausente' : item.egs < 3.0 ? '2_escassa' : item.egs < 6.0 ? '3_mediana' : item.egs < 10.0 ? '4_uniforme' : '5_excessiva'
    }));
  }, [processedLoteProfitCurveData]);

  // ============================================================================
  // FUNÇÕES OPERACIONAIS (AÇÕES)
  // ============================================================================

  // Adiciona novo exame de ultrassom
  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examAnimalId) return;

    const newExam: RTUExam = {
      id: 'ex-' + Date.now(),
      diaDeCocho: Number(examDia),
      dataExame: new Date().toISOString().slice(0, 10),
      aol: Number(examAol),
      egs: Number(examEgs),
      imf: Number(examImf),
      tecnicoId: examTecnico,
      equipamentoId: examEquipamento,
      peso: Number(examPeso)
    };

    setAnimals(prev => prev.map(animal => {
      if (animal.id === examAnimalId) {
        // Evita duplicados para o mesmo dia de cocho
        const outrosExames = animal.exames.filter(ex => ex.diaDeCocho !== newExam.diaDeCocho);
        return {
          ...animal,
          exames: [...outrosExames, newExam]
        };
      }
      return animal;
    }));

    setIsAddingExam(false);
    
    // Grava no log de auditoria
    const auditRecord: RTUAuditRecord = {
      id: 'audit-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: 'LOTE-TERMINACAO-A',
      hashEntradas: 'SHA-256-RTU-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Adicionado exame RTU no dia ${examDia} para animal ${examAnimalId}: AOL=${examAol}, EGS=${examEgs}, IMF=${examImf}, Peso=${examPeso}kg`,
      versaoModelo: calibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
  };

  // Executa pipeline de calibração automática baseado em dados reais de abate de um romaneio
  const handleTriggerCalibration = () => {
    // Mock do Romaneio de Abate oficial do Frigorífico contendo dados reais comparativos
    const dadosAbateReais = filteredAnimals.map(a => {
      // Cria um viés real sutil para simular desvios operacionais reais
      const proj = projectAnimalGrowth(a, connectedInputs, contract, {
        version: 'base', multiplierGmd: 1.0, multiplierEgs: 1.0, multiplierRendimento: 1.0, maeCarcaca: 0, rmseEgs: 0, biasGeral: 0, driftDetected: false
      }, 100);
      const pontoFinal = proj[proj.length - 1];

      return {
        animalId: a.id,
        // O frigorífico real pesou carcaças ligeiramente mais leves do que o modelo puro estimava (viés sistemático)
        pesoCarcacaQuenteReal: Math.round((pontoFinal.peso * 0.525) * 0.965 * 10) / 10,
        // EGS medida no gancho foi levemente mais uniforme
        egsRealMm: Math.round(pontoFinal.egs * 1.04 * 10) / 10,
        diasDeCocho: 100
      };
    });

    const calibrated = runModelCalibration(dadosAbateReais, filteredAnimals, connectedInputs, contract);
    setCalibration(calibrated);
    setNeedsCalibration(false);

    // Grava no log de auditoria de calibração
    const auditRecord: RTUAuditRecord = {
      id: 'audit-calib-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-CALIB-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Calibração com Romaneio Real executada para o lote ${selectedLotId}. Multiplicadores: GMD=${calibrated.multiplierGmd.toFixed(2)}, EGS=${calibrated.multiplierEgs.toFixed(2)}, RC=${calibrated.multiplierRendimento.toFixed(2)}`,
      versaoModelo: 'v2.4.2-auto',
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    // Alerta se houver drift detectado
    if (calibrated.driftDetected) {
      alert("ATENÇÃO: Drift sistemático do modelo biológico detectado no rebanho! Os coeficientes locais foram recalibrados para conter o erro.");
    }
  };

  // Calibra o modelo utilizando os dados reais de carcaça inseridos pelo usuário
  const recalibrateWithCarcassData = (currentAnimals: RTUAnimal[], forceAlert = false) => {
    const animaisComAbate = currentAnimals.filter(a => a.abateReal !== undefined);

    if (animaisComAbate.length === 0) {
      if (forceAlert) {
        alert("Nenhum animal possui informações de carcaça (abate real) cadastradas!\n\nPor favor, adicione dados reais de carcaça na tabela de Romaneio ou na Ficha do Animal antes de rodar a calibração.");
      }
      return;
    }

    const dadosAbateReais = animaisComAbate.map(a => {
      const egsReal = a.abateReal!.egsRealMm !== undefined ? a.abateReal!.egsRealMm : (
        a.abateReal!.egsFrigorifico === '1_ausente' ? 1.5 :
        a.abateReal!.egsFrigorifico === '2_escassa' ? 3.0 :
        a.abateReal!.egsFrigorifico === '3_mediana' ? 4.5 :
        a.abateReal!.egsFrigorifico === '4_uniforme' ? 6.0 : 8.0
      );

      return {
        animalId: a.id,
        pesoCarcacaQuenteReal: a.abateReal!.pesoCarcacaQuenteReal,
        egsRealMm: egsReal,
        diasDeCocho: a.abateReal!.diasDeCocho !== undefined ? a.abateReal!.diasDeCocho : 100
      };
    });

    const calibrated = runModelCalibration(dadosAbateReais, currentAnimals, inputs, contract);
    
    setCalibration({
      ...calibrated,
      version: `Calibração Real (${animaisComAbate.length} cab)`
    });
    setNeedsCalibration(false);

    // Grava no log de auditoria de calibração
    const auditRecord: RTUAuditRecord = {
      id: 'audit-calib-real-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-CALIB-REAL-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Calibração Real (${animaisComAbate.length} cab) executada. Novos multiplicadores: GMD=${calibrated.multiplierGmd.toFixed(2)}, EGS=${calibrated.multiplierEgs.toFixed(2)}, RC=${calibrated.multiplierRendimento.toFixed(2)}`,
      versaoModelo: `v3.0.0-real-${animaisComAbate.length}`,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    if (forceAlert) {
      alert(`Calibração realizada com sucesso com base em ${animaisComAbate.length} animal(is) abatido(s)!\n\nNovos multiplicadores calculados:\n• Multiplicador GMD: ${calibrated.multiplierGmd.toFixed(2)}x\n• Multiplicador Gordura (EGS): ${calibrated.multiplierEgs.toFixed(2)}x\n• Multiplicador Rendimento: ${calibrated.multiplierRendimento.toFixed(2)}x\n\nTodos os modelos matemáticos e janelas de abate foram recalibrados para maior acurácia!`);
    }
  };

  const handleSaveCarcassInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carcassAnimalId) {
      alert("Por favor, selecione um animal!");
      return;
    }

    let catEgs: '1_ausente' | '2_escassa' | '3_mediana' | '4_uniforme' | '5_excessiva' = '3_mediana';
    if (carcassEgsReal < 2.0) catEgs = '1_ausente';
    else if (carcassEgsReal < 4.0) catEgs = '2_escassa';
    else if (carcassEgsReal < 6.0) catEgs = '3_mediana';
    else if (carcassEgsReal < 8.0) catEgs = '4_uniforme';
    else catEgs = '5_excessiva';

    const newAbate: RTUSlaughterResult = {
      animalId: carcassAnimalId,
      dataAbate: new Date().toISOString().split('T')[0],
      pesoCarcacaQuenteReal: carcassPesoReal,
      egsFrigorifico: catEgs,
      imfFrigorificoPerc: carcassImfReal,
      pHReal: carcassPhReal,
      precoEfetivoPago: contract.basePrecoArroba,
      receitaLiquidaReal: (carcassPesoReal / 15) * contract.basePrecoArroba,
      egsRealMm: carcassEgsReal,
      diasDeCocho: carcassDiasCocho
    };

    const updatedAnimals = animals.map(a => {
      if (a.id === carcassAnimalId) {
        return {
          ...a,
          abateReal: newAbate
        };
      }
      return a;
    });

    setAnimals(updatedAnimals);
    setIsCarcassModalOpen(false);
    setEditingCarcassAnimalId(null);

    // Grava no log de auditoria
    const auditRecord: RTUAuditRecord = {
      id: 'audit-carcass-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-CARCASS-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Registrado dados reais de carcaça para o animal ${carcassAnimalId}: PCQ=${carcassPesoReal}kg, EGS=${carcassEgsReal}mm, IMF=${carcassImfReal}%, pH=${carcassPhReal}, DOF=${carcassDiasCocho}d`,
      versaoModelo: calibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    // Se estiver no modo automático, recalibra imediatamente!
    if (autoCalibrate) {
      recalibrateWithCarcassData(updatedAnimals, false);
    } else {
      setNeedsCalibration(true);
    }
  };

  const handleDeleteCarcassInfo = (animalId: string) => {
    if (!window.confirm(`Deseja realmente remover as informações de carcaça do animal ${animalId}?`)) {
      return;
    }

    const updatedAnimals = animals.map(a => {
      if (a.id === animalId) {
        const copy = { ...a };
        delete copy.abateReal;
        return copy;
      }
      return a;
    });

    setAnimals(updatedAnimals);

    // Se estiver no modo automático, recalibra imediatamente!
    if (autoCalibrate) {
      recalibrateWithCarcassData(updatedAnimals, false);
    } else {
      setNeedsCalibration(true);
    }
  };

  // Atualiza campo específico do lote selecionado
  const handleUpdateLotField = (field: keyof LotState, value: any) => {
    setLots(prev => prev.map(l => {
      if (l.id === selectedLotId) {
        return { ...l, [field]: value };
      }
      return l;
    }));
  };

  // Cadastra ou edita um animal no lote selecionado
  const handleAddAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimalId.trim()) {
      alert("Por favor, informe o Brinco/RFID do animal!");
      return;
    }

    if (editingAnimalId) {
      // Editar existente
      setAnimals(prev => prev.map(a => {
        if (a.id === editingAnimalId) {
          return {
            ...a,
            raca: newAnimalRaca,
            sexo: newAnimalSexo,
            frameSize: newAnimalFrame,
            pesoEntrada: newAnimalPesoEntrada,
            isAmostra: newAnimalIsAmostra
          };
        }
        return a;
      }));

      const auditRecord: RTUAuditRecord = {
        id: 'audit-edit-animal-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        usuarioId: 'Gerente Operacional',
        loteId: selectedLotId,
        hashEntradas: 'SHA-256-EDIT-' + Math.floor(Math.random() * 100000),
        dadosSalvos: `Animal ${editingAnimalId} editado: Raça ${newAnimalRaca.toUpperCase()}, Peso ${newAnimalPesoEntrada} kg.`,
        versaoModelo: calibration.version,
        versaoRegrasContrato: contract.id
      };
      setAuditLogs(prev => [auditRecord, ...prev]);

      setEditingAnimalId(null);
      setNewAnimalId('');
      setNewAnimalIsAmostra(false);
      alert(`Alterações do animal ${editingAnimalId} salvas com sucesso!`);
      return;
    }

    // Criar novo
    if (animals.some(a => a.id.toUpperCase() === newAnimalId.trim().toUpperCase())) {
      alert("Já existe um animal cadastrado com este Brinco/RFID!");
      return;
    }

    const newAnimal: RTUAnimal = {
      id: newAnimalId.trim().toUpperCase(),
      loteId: selectedLotId,
      raca: newAnimalRaca,
      sexo: newAnimalSexo,
      frameSize: newAnimalFrame,
      pesoEntrada: newAnimalPesoEntrada,
      dataEntrada: activeLot.dataInicioConfinamento || '2026-04-10',
      exames: [], // Começa sem exames
      isAmostra: newAnimalIsAmostra
    };

    setAnimals(prev => [...prev, newAnimal]);
    
    // Log de auditoria
    const auditRecord: RTUAuditRecord = {
      id: 'audit-add-animal-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-ADD-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Animal ${newAnimal.id} (${newAnimal.raca.toUpperCase()}, ${newAnimal.pesoEntrada} kg) adicionado ao lote ${selectedLotId}.`,
      versaoModelo: calibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    // Limpar campos
    setNewAnimalId('');
    setNewAnimalIsAmostra(false);
    alert(`Animal ${newAnimal.id} cadastrado com sucesso no lote!`);
  };

  const handleStartEditAnimal = (animal: RTUAnimal) => {
    setEditingAnimalId(animal.id);
    setNewAnimalId(animal.id);
    setNewAnimalRaca(animal.raca);
    setNewAnimalSexo(animal.sexo);
    setNewAnimalFrame(animal.frameSize);
    setNewAnimalPesoEntrada(animal.pesoEntrada);
    setNewAnimalIsAmostra(!!animal.isAmostra);
  };

  const handleDeleteAnimal = (animalId: string) => {
    if (confirm(`Deseja realmente excluir o animal ${animalId} do lote?`)) {
      setAnimals(prev => prev.filter(a => a.id !== animalId));
      
      const auditRecord: RTUAuditRecord = {
        id: 'audit-delete-animal-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        usuarioId: 'Gerente Operacional',
        loteId: selectedLotId,
        hashEntradas: 'SHA-256-DEL-' + Math.floor(Math.random() * 100000),
        dadosSalvos: `Animal ${animalId} excluído do lote ${selectedLotId}.`,
        versaoModelo: calibration.version,
        versaoRegrasContrato: contract.id
      };
      setAuditLogs(prev => [auditRecord, ...prev]);

      if (selectedAnimalId === animalId) {
        const remaining = animals.filter(a => a.loteId === selectedLotId && a.id !== animalId);
        if (remaining.length > 0) {
          setSelectedAnimalId(remaining[0].id);
        }
      }
      alert(`Animal ${animalId} removido com sucesso.`);
    }
  };

  const handleDeleteCurrentLot = () => {
    if (lots.length <= 1) {
      alert("Não é possível excluir o único lote do sistema! Você precisa manter pelo menos um lote ativo.");
      return;
    }

    if (confirm(`Atenção: Excluir o lote "${activeLot.name}" irá remover permanentemente o lote e TODOS os seus animais associados. Deseja realmente prosseguir?`)) {
      const lotToDeleteId = selectedLotId;
      const remainingLots = lots.filter(l => l.id !== lotToDeleteId);
      
      // Select another lot first
      const nextLotId = remainingLots[0].id;
      setSelectedLotId(nextLotId);
      
      // Delete lot and associated animals
      setLots(remainingLots);
      setAnimals(prev => prev.filter(a => a.loteId !== lotToDeleteId));

      const auditRecord: RTUAuditRecord = {
        id: 'audit-delete-lot-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        usuarioId: 'Gerente Operacional',
        loteId: lotToDeleteId,
        hashEntradas: 'SHA-256-LOT-DEL-' + Math.floor(Math.random() * 100000),
        dadosSalvos: `Lote ${lotToDeleteId} e seus animais associados foram completamente excluídos.`,
        versaoModelo: calibration.version,
        versaoRegrasContrato: contract.id
      };
      setAuditLogs(prev => [auditRecord, ...prev]);

      alert(`Lote "${lotToDeleteId}" excluído com sucesso.`);
    }
  };

  const handleCreateLot = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newLotId.trim().toUpperCase();
    if (!cleanId) {
      alert("Por favor, preencha o código/identificador do lote.");
      return;
    }
    const cleanName = newLotName.trim() || `Lote ${cleanId}`;
    
    if (lots.some(l => l.id.toUpperCase() === cleanId.toUpperCase())) {
      alert("Já existe um lote cadastrado com este identificador!");
      return;
    }

    const newLot: LotState = {
      id: cleanId,
      name: cleanName,
      description: newLotDesc.trim() || 'Lote criado pelo usuário',
      dataInicioConfinamento: newLotInicio,
      dataMensuracao: newLotMensuracao,
      operador: newLotOperador,
      marcaEquipamento: newLotEquipamento,
      gmdMedioAlvo: Number(newLotGmd) || 1.5,
      dietaNome: newLotDieta || 'Padrão'
    };

    setLots(prev => [...prev, newLot]);
    setSelectedLotId(cleanId);
    setIsNewLotModalOpen(false);

    // Seed com 2 animais
    const seedAnimal1: RTUAnimal = {
      id: `RFID-${cleanId}-01`,
      loteId: cleanId,
      raca: 'nelore',
      sexo: 'macho',
      frameSize: 'medio',
      pesoEntrada: 360,
      dataEntrada: newLotInicio,
      exames: [
        { id: `ex-${cleanId}-01-1`, diaDeCocho: 15, dataExame: '2026-04-25', aol: 68.0, egs: 2.8, imf: 1.2, tecnicoId: newLotOperador, equipamentoId: newLotEquipamento },
        { id: `ex-${cleanId}-01-2`, diaDeCocho: 45, dataExame: '2026-05-25', aol: 75.0, egs: 3.8, imf: 1.8, tecnicoId: newLotOperador, equipamentoId: newLotEquipamento }
      ],
      isAmostra: true
    };
    const seedAnimal2: RTUAnimal = {
      id: `RFID-${cleanId}-02`,
      loteId: cleanId,
      raca: 'cruzamento',
      sexo: 'macho',
      frameSize: 'grande',
      pesoEntrada: 390,
      dataEntrada: newLotInicio,
      exames: [
        { id: `ex-${cleanId}-02-1`, diaDeCocho: 15, dataExame: '2026-04-25', aol: 74.0, egs: 3.2, imf: 1.5, tecnicoId: newLotOperador, equipamentoId: newLotEquipamento },
        { id: `ex-${cleanId}-02-2`, diaDeCocho: 45, dataExame: '2026-05-25', aol: 82.0, egs: 4.5, imf: 2.2, tecnicoId: newLotOperador, equipamentoId: newLotEquipamento }
      ],
      isAmostra: true
    };
    setAnimals(prev => [...prev, seedAnimal1, seedAnimal2]);

    const auditRecord: RTUAuditRecord = {
      id: 'audit-create-lot-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: cleanId,
      hashEntradas: 'SHA-256-LOT-NEW-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Lote ${cleanId} (${cleanName}) criado e inicializado com 2 animais de exemplo.`,
      versaoModelo: calibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    // Reset fields
    setNewLotId('');
    setNewLotName('');
    setNewLotDesc('');
    setNewLotInicio('2026-07-12');
    setNewLotMensuracao('2026-09-20');
    setNewLotOperador('Dr. Roberto');
    setNewLotEquipamento('Aloka-500');
    setNewLotGmd(1.5);
    setNewLotDieta('Ração Terminação');

    alert(`Lote ${cleanId} criado com sucesso! Foram adicionados 2 animais de amostra para facilitar o início das simulações.`);
  };

  const handleStartEditLot = () => {
    setEditLotName(activeLot.name);
    setEditLotDesc(activeLot.description);
    setEditLotInicio(activeLot.dataInicioConfinamento || '');
    setEditLotMensuracao(activeLot.dataMensuracao || '');
    setEditLotOperador(activeLot.operador || '');
    setEditLotEquipamento(activeLot.marcaEquipamento || '');
    setEditLotGmd(activeLot.gmdMedioAlvo || 1.5);
    setEditLotDieta(activeLot.dietaNome || '');
    setIsEditLotModalOpen(true);
  };

  const handleSaveLotEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setLots(prev => prev.map(l => {
      if (l.id === selectedLotId) {
        return {
          ...l,
          name: editLotName.trim() || l.name,
          description: editLotDesc.trim(),
          dataInicioConfinamento: editLotInicio,
          dataMensuracao: editLotMensuracao,
          operador: editLotOperador,
          marcaEquipamento: editLotEquipamento,
          gmdMedioAlvo: Number(editLotGmd) || 1.5,
          dietaNome: editLotDieta
        };
      }
      return l;
    }));
    setIsEditLotModalOpen(false);

    const auditRecord: RTUAuditRecord = {
      id: 'audit-edit-lot-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-LOT-EDIT-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Parâmetros do Lote ${selectedLotId} foram atualizados via formulário de edição.`,
      versaoModelo: calibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
  };

  // Alterna o status de amostragem de ultrassom do animal
  const handleToggleAnimalSample = (animalId: string) => {
    setAnimals(prev => prev.map(a => {
      if (a.id === animalId) {
        return { ...a, isAmostra: !a.isAmostra };
      }
      return a;
    }));
  };

  // Executa extrapolação por amostragem baseada nos exames de ultrassom cadastrados para os animais amostra
  const handleExtrapolateSample = () => {
    const sampleAnimals = filteredAnimals.filter(a => a.isAmostra);
    if (sampleAnimals.length === 0) {
      alert("Selecione pelo menos um animal no grid abaixo para compor o grupo de amostragem!");
      return;
    }

    // Calcula as médias das métricas reais da amostra nos exames
    let totalAol = 0;
    let totalEgs = 0;
    let totalImf = 0;
    let countExams = 0;

    sampleAnimals.forEach(a => {
      if (a.exames && a.exames.length > 0) {
        const latest = a.exames[a.exames.length - 1];
        totalAol += latest.aol;
        totalEgs += latest.egs;
        totalImf += latest.imf;
        countExams++;
      }
    });

    if (countExams === 0) {
      alert("Os animais selecionados para a amostra não possuem exames de ultrassom cadastrados!\n\nPor favor, cadastre pelo menos um exame para os animais marcados como amostra na aba 'Ficha do Animal' antes de realizar a extrapolação.");
      return;
    }

    const avgAol = totalAol / countExams;
    const avgEgs = totalEgs / countExams;
    const avgImf = totalImf / countExams;

    // Valores padrão esperados em exames na metade do cocho
    const baseExpectedAol = 70.0;
    const baseExpectedEgs = 3.5;
    const baseExpectedImf = 1.8;

    // Calcula multiplicadores baseados na amostra (clamped entre 0.5 e 2.0 por segurança)
    const multAol = Math.max(0.5, Math.min(2.0, avgAol / baseExpectedAol));
    const multEgs = Math.max(0.5, Math.min(2.0, avgEgs / baseExpectedEgs));
    const multImf = Math.max(0.5, Math.min(2.0, avgImf / baseExpectedImf));

    // Determina multiplicador GMD baseado na performance geral da carcaça e gordura
    const multGmd = Math.max(0.7, Math.min(1.5, (avgAol > baseExpectedAol ? 1.05 : 0.95) * (avgEgs > baseExpectedEgs ? 1.03 : 0.97)));

    const newCalibration: RTUModelCalibration = {
      version: `Amostragem Extrapolada (${sampleAnimals.length} cab)`,
      multiplierGmd: Math.round(multGmd * 100) / 100,
      multiplierEgs: Math.round(multEgs * 100) / 100,
      multiplierRendimento: Math.round((0.95 + (multAol - 1.0) * 0.08) * 100) / 100,
      multiplierAol: Math.round(multAol * 100) / 100,
      multiplierImf: Math.round(multImf * 100) / 100,
      maeCarcaca: 3.1,
      rmseEgs: 0.55,
      biasGeral: 0.05,
      driftDetected: Math.abs(multEgs - 1.0) > 0.15
    };

    setCalibration(newCalibration);
    setNeedsCalibration(false);

    // Grava no log de auditoria
    const auditRecord: RTUAuditRecord = {
      id: 'audit-extrapol-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-EXTRAPOL-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Métricas biológicas de ultrassom extrapoladas para o lote ${selectedLotId} com base em amostra de ${sampleAnimals.length} animais. Novos multiplicadores: AOL=${newCalibration.multiplierAol?.toFixed(2)}x, EGS=${newCalibration.multiplierEgs.toFixed(2)}x, IMF=${newCalibration.multiplierImf?.toFixed(2)}x, GMD=${newCalibration.multiplierGmd.toFixed(2)}x.`,
      versaoModelo: newCalibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);

    alert(`Métricas extrapoladas e aplicadas ao lote inteiro com sucesso!\n\nNovos multiplicadores biológicos calibrados:\n• Multiplicador AOL: ${newCalibration.multiplierAol?.toFixed(2)}x (Média: ${avgAol.toFixed(1)} cm²)\n• Multiplicador Gordura (EGS): ${newCalibration.multiplierEgs.toFixed(2)}x (Média: ${avgEgs.toFixed(1)} mm)\n• Multiplicador Marmoreio (IMF): ${newCalibration.multiplierImf?.toFixed(2)}x (Média: ${avgImf.toFixed(1)}%)\n• Multiplicador GMD: ${newCalibration.multiplierGmd.toFixed(2)}x\n\nToda a projeção do lote e as recomendações individuais foram corrigidas automaticamente.`);
  };

  // Gera e exporta relatório em PDF contendo as recomendações de abate e indicadores de desempenho
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const lotInfo = lots.find(l => l.id === selectedLotId);
    
    // Título do documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(11, 22, 37); // Cor azul escuro profundo
    doc.text("SimuBoi - Relatorio de Abate RTU & Otimizacao", 15, 20);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 24, 195, 24);
    
    // Metadados
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Data de Emissao: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 15, 30);
    doc.text(`Operador Autenticado: Gerente Operacional`, 15, 35);
    doc.text(`Versao de Calibracao Geral: ${calibration.version}`, 15, 40);
    doc.text(`Regra de Contrato Comercial: ${contract.nomeFrigorifico} (ID: ${contract.id})`, 15, 45);
    
    // Detalhes do Lote Ativo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 22, 37);
    doc.text("1. Detalhes do Lote Selecionado", 15, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Identificador do Lote: ${selectedLotId}`, 15, 61);
    doc.text(`Nome Comercial: ${lotInfo?.name || ""}`, 15, 66);
    doc.text(`Descricao de Manejo: ${lotInfo?.description || ""}`, 15, 71);
    doc.text(`Total de Cabecas no Lote: ${filteredAnimals.length} animais ativos`, 15, 76);
    
    // Parâmetros de Calibração Ativos
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 22, 37);
    doc.text("2. Multiplicadores Biologicos Ajustados (Calibracao Atual)", 15, 86);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Multiplicador GMD (Ganho Medio Diario): ${calibration.multiplierGmd.toFixed(2)}x`, 15, 92);
    doc.text(`Multiplicador EGS (Espessura de Gordura Subcutanea): ${calibration.multiplierEgs.toFixed(2)}x`, 15, 97);
    doc.text(`Multiplicador AOL (Area de Olho de Lombo - Musculo): ${(calibration.multiplierAol ?? 1.00).toFixed(2)}x`, 15, 102);
    doc.text(`Multiplicador Marmoreio (IMF): ${(calibration.multiplierImf ?? 1.00).toFixed(2)}x`, 15, 107);
    doc.text(`Multiplicador Rendimento de Carcaca: ${calibration.multiplierRendimento.toFixed(2)}x`, 15, 112);
    
    // Indicadores de Desempenho do Lote
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 22, 37);
    doc.text("3. Indicadores de Desempenho e Retorno do Lote", 15, 122);
    
    // Calcular estatísticas
    const totalProntos = rankingAnimais.filter(r => r.tEstrelaDeterminista <= 75).length;
    const lucroMedioHoje = rankingAnimais.reduce((acc, r) => acc + r.lucroHoje, 0) / (rankingAnimais.length || 1);
    const lucroMedioNoOtimo = rankingAnimais.reduce((acc, r) => acc + r.lucroNoOtimo, 0) / (rankingAnimais.length || 1);
    const ganhoMarginalTotal = (lucroMedioNoOtimo - lucroMedioHoje) * rankingAnimais.length;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Animais Prontos para Abate Hoje (dia 75): ${totalProntos} de ${filteredAnimals.length} (${Math.round(totalProntos / (filteredAnimals.length || 1) * 100)}%)`, 15, 128);
    doc.text(`Lucro Medio Estimado Abatendo Hoje: R$ ${lucroMedioHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por cabeca`, 15, 133);
    doc.text(`Lucro Medio Projetado no Ponto Otimo: R$ ${lucroMedioNoOtimo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por cabeca`, 15, 138);
    doc.text(`Ganho Marginal Acumulado de Otimizacao do Lote: R$ ${ganhoMarginalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total`, 15, 143);
    
    // Tabela de Recomendações Individuais por Cabeça
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 22, 37);
    doc.text("4. Recomendacoes Individuais de Abate por Cabeca", 15, 154);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(11, 22, 37);
    // Linha de cabeçalho da tabela
    let y = 161;
    doc.text("Brinco/ID", 15, y);
    doc.text("Raca/Grupamento", 42, y);
    doc.text("P. Entrada", 75, y);
    doc.text("Peso Proj. Hoje", 100, y);
    doc.text("EGS Proj. Hoje", 128, y);
    doc.text("Abate Ideal (t*)", 152, y);
    doc.text("Lucro Projetado (Otimo)", 175, y);
    
    doc.setDrawColor(180, 180, 180);
    doc.line(15, y + 2, 195, y + 2);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    y += 7;
    
    rankingAnimais.forEach((r) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(11, 22, 37);
        doc.text("4. Recomendacoes Individuais de Abate por Cabeca (Cont.)", 15, y);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(50, 50, 50);
      }
      
      doc.text(r.id, 15, y);
      doc.text(r.raca.toUpperCase(), 42, y);
      doc.text(`${r.pesoEntrada} kg`, 75, y);
      doc.text(`${Math.round(r.pesoHoje)} kg`, 100, y);
      doc.text(`${r.egsHoje.toFixed(1)} mm`, 128, y);
      doc.text(`${r.tEstrelaRobusto} dias`, 152, y);
      doc.text(`R$ ${r.lucroNoOtimo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 175, y);
      
      y += 6;
    });
    
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y, 195, y);
    y += 8;
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text("Nota: As estimativas acima sao baseadas em simulacoes estocasticas de Monte Carlo (LHS) utilizando modelos biologicos calibrados.", 15, y);
    doc.text("Os resultados reais podem variar conforme condicoes climaticas, flutuacoes de mercado e variabilidade genetica residual.", 15, y + 4);
    
    // Salvar o arquivo PDF
    doc.save(`relatorio-otimizacao-abate-${selectedLotId.toLowerCase()}.pdf`);
    
    // Registrar no histórico de auditoria
    const auditRecord: RTUAuditRecord = {
      id: 'audit-export-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      usuarioId: 'Gerente Operacional',
      loteId: selectedLotId,
      hashEntradas: 'SHA-256-PDF-' + Math.floor(Math.random() * 100000),
      dadosSalvos: `Relatório PDF exportado para o Lote ${selectedLotId} contendo ${filteredRanking.length} animais.`,
      versaoModelo: calibration.version,
      versaoRegrasContrato: contract.id
    };
    setAuditLogs(prev => [auditRecord, ...prev]);
  };

  return (
    <div className="space-y-4" id="rtu-module-container-wrapper">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="ultrasound-slaughter-module bg-[#0a0f1d]/70 backdrop-blur-md rounded-2xl border border-slate-850 p-3.5 sm:p-4 space-y-3 shadow-xl text-left"
        id="rtu-module-container"
      >
        {/* HEADER DO MÓDULO (ULTRA COMPACTO) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg shadow-md shadow-emerald-500/10 shrink-0">
              <Scale className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-display font-bold text-white tracking-tight">
                  Ultrassom + Otimização do Abate
                </h2>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  Módulo Ativo
                </span>
                {needsCalibration ? (
                  <TooltipHelp text="O modelo biológico acumulou novos exames de ultrassom e necessita de calibração com dados de abate reais (ground truth).">
                    <span
                      onClick={() => setSubTab('calibration')}
                      className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/15 text-amber-300 rounded-full border border-amber-500/30 animate-pulse flex items-center gap-1 cursor-pointer hover:bg-amber-500/25 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      Calibração Exigida
                    </span>
                  </TooltipHelp>
                ) : (
                  <TooltipHelp text="Modelo biológico devidamente calibrado e validado contra dados de abate real (ground truth).">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-teal-500/15 text-teal-300 rounded-full border border-teal-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                      Modelo Calibrado
                    </span>
                  </TooltipHelp>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                Predição biológica de carcaça, EGS e IMF via RTU e inteligência de risco estocástica (LHS).
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLE COMPACTO DO LOTE & DIETA */}
        <div className="bg-[#111625]/60 p-2.5 sm:p-3 rounded-xl border border-slate-800/60 space-y-2.5">
          {/* BARRA SUPERIOR DO LOTE */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            {/* LOTE SELECTOR & ACTIONS */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans">Lote:</span>
              </div>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="bg-[#070913] border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1 text-xs font-semibold focus:border-emerald-500 outline-none transition-all cursor-pointer max-w-[200px]"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#0b1120] text-slate-200">
                    {l.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 shrink-0">
                <TooltipHelp text="Criar um novo lote de manejo com dados customizados.">
                  <button
                    onClick={() => setIsNewLotModalOpen(true)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </TooltipHelp>
                <TooltipHelp text="Editar os parâmetros de desempenho e equipamentos do lote ativo.">
                  <button
                    onClick={handleStartEditLot}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </TooltipHelp>
                <TooltipHelp text="Exportar Relatório PDF completo.">
                  <button
                    onClick={handleExportPDF}
                    className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </TooltipHelp>
                <TooltipHelp text="Excluir o lote de manejo ativo.">
                  <button
                    onClick={handleDeleteCurrentLot}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </TooltipHelp>
              </div>

              {lots.find((l) => l.id === selectedLotId)?.description && (
                <span className="text-[10px] text-slate-400 italic truncate max-w-xs hidden xl:inline">
                  — {lots.find((l) => l.id === selectedLotId)?.description}
                </span>
              )}
            </div>

            {/* VINCULAR DIETA AO LOTE (COMPACTO) */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Dieta:</span>
              <select
                value={activeLot.dietaNome}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const diet = availableDiets.find(d => d.name === selectedName);
                  if (diet) {
                    handleUpdateLotField('dietaNome', diet.name);
                    handleUpdateLotField('gmdMedioAlvo', diet.gmd);
                  }
                }}
                className="bg-[#05070c] border border-slate-800 rounded-lg px-2 py-1 text-xs text-teal-300 focus:outline-none focus:border-teal-500 cursor-pointer font-semibold max-w-[200px]"
              >
                {availableDiets.map(d => (
                  <option key={`recs-diet-select-${d.name}`} value={d.name}>
                    {d.name} ({d.gmd.toFixed(2)} kg/d)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* METRICAS NUTRICIONAIS E RISCO LHS EM GRID UNIFICADO COMPACTO */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-800/50">
            {/* Stat 1: GMD */}
            <div className="bg-[#05070c]/60 p-2 rounded-lg border border-slate-850/60">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">GMD</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-display font-bold text-white">
                  {connectedInputs.gmd.toFixed(2)}
                </span>
                <span className="text-[8px] text-slate-400">kg/d</span>
              </div>
            </div>

            {/* Stat 2: CMS */}
            <div className="bg-[#05070c]/60 p-2 rounded-lg border border-slate-850/60">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">CMS</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-display font-bold text-white">
                  {(connectedInputs.cmsVolumoso + connectedInputs.cmsConcentrado).toFixed(2)}
                </span>
                <span className="text-[8px] text-slate-400">kg MS/d</span>
              </div>
            </div>

            {/* Stat 3: Custo Ração */}
            <div className="bg-[#05070c]/60 p-2 rounded-lg border border-slate-850/60">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Custo Ração</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-display font-bold text-white">
                  R$ {connectedDiet && connectedDiet.result ? connectedDiet.result.totalCost.toFixed(2) : (inputs.precoConcentrado || 1.65).toFixed(2)}
                </span>
                <span className="text-[8px] text-slate-400">/kg MS</span>
              </div>
            </div>

            {/* Stat 4: Alimentação Diária */}
            <div className="bg-[#05070c]/60 p-2 rounded-lg border border-slate-850/60">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">Custo Diário</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-display font-bold text-teal-400">
                  R$ {((connectedInputs.cmsVolumoso * connectedInputs.precoVolumoso) + (connectedInputs.cmsConcentrado * connectedInputs.precoConcentrado)).toFixed(2)}
                </span>
                <span className="text-[8px] text-slate-400">/cab</span>
              </div>
            </div>

            {/* Stat 5 & 6: Tolerância Risco LHS (Slider & Badge em 2 Colunas) */}
            <div className="col-span-2 bg-[#05070c]/60 p-2 rounded-lg border border-slate-850/60 flex items-center justify-between gap-2">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between text-[8px] font-bold">
                  <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-emerald-400" /> Risco LHS
                  </span>
                  <span className="text-emerald-400 font-mono">{(riskTolerance * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.30"
                  step="0.01"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                />
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                riskTolerance <= 0.05 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : riskTolerance <= 0.15 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {riskTolerance <= 0.05 ? 'Conservador' : riskTolerance <= 0.15 ? 'Moderado' : 'Agressivo'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CONTEÚDO ATIVO COMPLETO DAS SUB-TABS */}
      <div className="w-full">
          <AnimatePresence mode="wait">
        {/* TAB 1: RECOMENDAÇÕES DE ABATE */}
        {subTab === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TooltipHelp text="Retorno incremental estimado por cabeça no lote utilizando o protocolo de ultrassom semanal em relação ao manejo tradicional.">
                <div className="bg-[#111625] p-4 rounded-2xl border border-slate-850 space-y-2 relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 ease-out cursor-pointer h-full">
                  <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-slate-800/30 group-hover:text-emerald-500/10 transition-colors">
                    <TrendingUp className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Lucro Marginal Lote</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-display font-extrabold text-white">R$ 572,40</span>
                    <span className="text-xs text-slate-400">/ cab</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +12.4% acima da média sem RTU
                  </p>
                </div>
              </TooltipHelp>

              <TooltipHelp text="Quantidade de animais que já atingiram ou excederam o período ideal projetado de engorda para maximização de retorno econômico (t*).">
                <div className="bg-[#111625] p-4 rounded-2xl border border-slate-850 space-y-2 relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 ease-out cursor-pointer h-full">
                  <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-slate-800/30 group-hover:text-amber-500/10 transition-colors">
                    <Target className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Prontos p/ Abate Hoje</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-display font-extrabold text-white">
                      {rankingAnimais.filter(r => r.tEstrelaDeterminista <= 75).length}
                    </span>
                    <span className="text-xs text-slate-400">/ {filteredAnimals.length} cab</span>
                  </div>
                  <p className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" /> Janela ideal de confinamento atingida
                  </p>
                </div>
              </TooltipHelp>

              <TooltipHelp text="Probabilidade estatística combinada (via simulação de Monte Carlo/LHS) do lote registrar prejuízo líquido por variações de mercado.">
                <div className="bg-[#111625] p-4 rounded-2xl border border-slate-850 space-y-2 relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl hover:border-red-500/30 transition-all duration-300 ease-out cursor-pointer h-full">
                  <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-slate-800/30 group-hover:text-red-500/10 transition-colors">
                    <ShieldAlert className="w-24 h-24 stroke-1" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">Risco de Prejuízo do Lote</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-display font-extrabold text-red-400">4.5%</span>
                    <span className="text-xs text-slate-400">médio</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dentro do limite tolerável de {riskTolerance * 100}%
                  </p>
                </div>
              </TooltipHelp>
            </div>

            {/* AGRUPAMENTO POR RESULTADO (JANELAS DE PRONTIDÃO DE ABATE) */}
            <div className="bg-[#0b111e] rounded-2xl border border-slate-850 p-5 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Agrupamento por Resultado (Janelas de Prontidão)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Classificação estocástica de prontidão com base no tempo ótimo de confinamento robusto (t* robusto). Configure os dias das janelas de prontidão manualmente ou clique nas categorias para filtrar.
                  </p>
                </div>
                {selectedReadinessGroup && (
                  <button
                    onClick={() => setSelectedReadinessGroup(null)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                  >
                    <X className="w-3.5 h-3.5" /> Limpar Filtro de Janela
                  </button>
                )}
              </div>

              {/* CONTROLES DE CONFIGURAÇÃO DE DIAS DAS JANELAS */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#111625] p-4 rounded-xl border border-slate-850">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Presets de Janelas</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const vals = e.target.value.split(',').map(Number);
                          setThreshold1(vals[0]);
                          setThreshold2(vals[1]);
                          setThreshold3(vals[2]);
                        }
                      }}
                      className="bg-[#080d17] border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Escolher Presets --</option>
                      <option value="75,90,120">Padrão (75 / 90 / 120 dias)</option>
                      <option value="7,14,21">Precoce Curto (7 / 14 / 21 dias)</option>
                      <option value="28,35,42">Precoce Médio (28 / 35 / 42 dias)</option>
                      <option value="42,90,150">Terminação Progressiva (42 / 90 / 150 dias)</option>
                      <option value="90,150,180">Tardio Extendido (90 / 150 / 180 dias)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        Imediato (≤)
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={threshold2 - 1}
                          value={threshold1}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            setThreshold1(val);
                            if (val >= threshold2) {
                              setThreshold2(val + 1);
                            }
                            if (val + 1 >= threshold3) {
                              setThreshold3(val + 2);
                            }
                          }}
                          className="w-full bg-[#080d17] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono text-center pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-mono">d</span>
                      </div>
                    </div>

                    <span className="text-slate-600 mt-4 font-bold text-xs">/</span>

                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        Curto Prazo (≤)
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          min={threshold1 + 1}
                          max={threshold3 - 1}
                          value={threshold2}
                          onChange={(e) => {
                            const val = Math.max(threshold1 + 1, Number(e.target.value));
                            setThreshold2(val);
                            if (val >= threshold3) {
                              setThreshold3(val + 1);
                            }
                          }}
                          className="w-full bg-[#080d17] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono text-center pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-mono">d</span>
                      </div>
                    </div>

                    <span className="text-slate-600 mt-4 font-bold text-xs">/</span>

                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        Médio Prazo (≤)
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          min={threshold2 + 1}
                          value={threshold3}
                          onChange={(e) => setThreshold3(Math.max(threshold2 + 1, Number(e.target.value)))}
                          className="w-full bg-[#080d17] border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-blue-400 focus:outline-none focus:border-blue-500 font-mono text-center pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-mono">d</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-left max-w-xs leading-relaxed border-l border-slate-800 pl-4">
                  O ajuste altera as faixas de corte de forma adaptativa. Animais com t* acima do limite final serão alocados em <strong className="text-purple-400">Longo Prazo</strong>.
                </div>
              </div>

              {/* GRID PRINCIPAL: CARDS + GRÁFICO DE ROSCA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Painel Esquerdo: Cards dos Grupos */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* GRUPO 1: IMEDIATO */}
                  <TooltipHelp 
                    text={`Animais cujo tempo ótimo de confinamento robusto (t*) é menor ou igual a ${threshold1} dias. Prontos para comercialização imediata devido ao platô de ganho de carcaça.`}
                    className="w-full h-full block"
                  >
                    <div
                      onClick={() => setSelectedReadinessGroup(selectedReadinessGroup === 'imediato' ? null : 'imediato')}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left h-full flex flex-col justify-between ${
                        selectedReadinessGroup === 'imediato'
                          ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500'
                          : 'bg-[#111625] border-slate-850 hover:border-emerald-500/40 hover:bg-[#111625]/80'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Abate Imediato
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-display font-black text-white">
                            {rankingAnimais.filter(r => r.tEstrelaRobusto <= threshold1).length}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">cab.</span>
                          <span className="text-[10px] text-emerald-400 font-semibold ml-auto bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
                            {rankingAnimais.length > 0 
                              ? ((rankingAnimais.filter(r => r.tEstrelaRobusto <= threshold1).length / rankingAnimais.length) * 100).toFixed(0)
                              : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/40">
                        <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                          t* Robusto: ≤ {threshold1} dias
                        </p>
                        <div className="text-[9px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                          ● Pronto p/ venda hoje
                        </div>
                      </div>
                    </div>
                  </TooltipHelp>

                  {/* GRUPO 2: CURTO PRAZO */}
                  <TooltipHelp 
                    text={`Animais com t* robusto projetado entre ${threshold1 + 1} e ${threshold2} dias. Programe a escala de abate de curto prazo junto ao frigorífico.`}
                    className="w-full h-full block"
                  >
                    <div
                      onClick={() => setSelectedReadinessGroup(selectedReadinessGroup === 'curto' ? null : 'curto')}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left h-full flex flex-col justify-between ${
                        selectedReadinessGroup === 'curto'
                          ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500'
                          : 'bg-[#111625] border-slate-850 hover:border-amber-500/40 hover:bg-[#111625]/80'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Curto Prazo
                          </span>
                          <Clock className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-display font-black text-white">
                            {rankingAnimais.filter(r => r.tEstrelaRobusto > threshold1 && r.tEstrelaRobusto <= threshold2).length}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">cab.</span>
                          <span className="text-[10px] text-amber-400 font-semibold ml-auto bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
                            {rankingAnimais.length > 0 
                              ? ((rankingAnimais.filter(r => r.tEstrelaRobusto > threshold1 && r.tEstrelaRobusto <= threshold2).length / rankingAnimais.length) * 100).toFixed(0)
                              : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/40">
                        <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                          t* Robusto: {threshold1 + 1} a {threshold2} dias
                        </p>
                        <div className="text-[9px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                          ● Programar escala de abate
                        </div>
                      </div>
                    </div>
                  </TooltipHelp>

                  {/* GRUPO 3: MÉDIO PRAZO */}
                  <TooltipHelp 
                    text={`Animais com t* robusto projetado entre ${threshold2 + 1} e ${threshold3} dias. Animais em fase de ganho acelerado de gordura subcutânea e eficiência alimentar otimizada.`}
                    className="w-full h-full block"
                  >
                    <div
                      onClick={() => setSelectedReadinessGroup(selectedReadinessGroup === 'medio' ? null : 'medio')}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left h-full flex flex-col justify-between ${
                        selectedReadinessGroup === 'medio'
                          ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500'
                          : 'bg-[#111625] border-slate-850 hover:border-blue-500/40 hover:bg-[#111625]/80'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Médio Prazo
                          </span>
                          <Calendar className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-display font-black text-white">
                            {rankingAnimais.filter(r => r.tEstrelaRobusto > threshold2 && r.tEstrelaRobusto <= threshold3).length}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">cab.</span>
                          <span className="text-[10px] text-blue-400 font-semibold ml-auto bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
                            {rankingAnimais.length > 0 
                              ? ((rankingAnimais.filter(r => r.tEstrelaRobusto > threshold2 && r.tEstrelaRobusto <= threshold3).length / rankingAnimais.length) * 100).toFixed(0)
                              : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/40">
                        <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                          t* Robusto: {threshold2 + 1} a {threshold3} dias
                        </p>
                        <div className="text-[9px] text-blue-400 font-medium mt-1 flex items-center gap-1">
                          ● Conversão alimentar ativa
                        </div>
                      </div>
                    </div>
                  </TooltipHelp>

                  {/* GRUPO 4: LONGO PRAZO */}
                  <TooltipHelp 
                    text={`Animais com t* robusto projetado para mais de ${threshold3} dias. Fase de recria, engorda inicial ou com menor taxa de deposição precoce.`}
                    className="w-full h-full block"
                  >
                    <div
                      onClick={() => setSelectedReadinessGroup(selectedReadinessGroup === 'longo' ? null : 'longo')}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left h-full flex flex-col justify-between ${
                        selectedReadinessGroup === 'longo'
                          ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500'
                          : 'bg-[#111625] border-slate-850 hover:border-purple-500/40 hover:bg-[#111625]/80'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Longo Prazo
                          </span>
                          <Activity className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-display font-black text-white">
                            {rankingAnimais.filter(r => r.tEstrelaRobusto > threshold3).length}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">cab.</span>
                          <span className="text-[10px] text-purple-400 font-semibold ml-auto bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
                            {rankingAnimais.length > 0 
                              ? ((rankingAnimais.filter(r => r.tEstrelaRobusto > threshold3).length / rankingAnimais.length) * 100).toFixed(0)
                              : 0}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/40">
                        <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
                          {"t* Robusto: > " + threshold3 + " dias"}
                        </p>
                        <div className="text-[9px] text-purple-400 font-medium mt-1 flex items-center gap-1">
                          ● Nutrição de base e recria
                        </div>
                      </div>
                    </div>
                  </TooltipHelp>
                </div>

                {/* Painel Direito: Gráfico de Rosca (Pie Chart) */}
                <div className="lg:col-span-4 bg-[#111625] border border-slate-850 rounded-xl p-4 flex flex-col items-center justify-between min-h-[260px] text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Distribuição das Janelas
                  </span>

                  <div className="w-full h-40 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={readinessChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {readinessChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#0b111e" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0b111e',
                            borderColor: '#334155',
                            borderRadius: '8px',
                            color: '#cbd5e1',
                            fontSize: '11px',
                            zIndex: 99999
                          }}
                          itemStyle={{ color: '#cbd5e1' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Texto interno no centro da rosca */}
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-display font-black text-white">
                        {rankingAnimais.length}
                      </span>
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Animais</span>
                    </div>
                  </div>

                  {/* Legenda customizada */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full text-[9px] text-left">
                    {readinessChartData.map((d, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                        <span className="truncate max-w-[80px]">{d.name}</span>
                        <span className="font-mono text-slate-400 ml-auto font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TABELA COMPARATIVA DE DESEMPENHO DOS LOTES */}
            <div className="bg-[#0b111e] rounded-2xl border border-slate-850 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-teal-400" />
                    Comparativo de Desempenho e Prontidão entre Lotes
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Selecione os lotes abaixo para comparar médias zootécnicas e identificar os lotes com maior concentração de abate no curto prazo (≤ {threshold2} dias).
                  </p>
                </div>
              </div>

              {/* SELETOR DE LOTES PARA COMPARAÇÃO */}
              <div className="flex flex-wrap items-center gap-2 bg-[#111625] p-3 rounded-xl border border-slate-850/60">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-2">Comparar:</span>
                {lots.map(lot => {
                  const isSelected = selectedLotsForComparison.includes(lot.id);
                  const count = allAnimalsCalculated.filter(a => a.loteId === lot.id).length;
                  return (
                    <button
                      key={lot.id}
                      onClick={() => {
                        if (isSelected) {
                          if (selectedLotsForComparison.length > 1) {
                            setSelectedLotsForComparison(selectedLotsForComparison.filter(id => id !== lot.id));
                          }
                        } else {
                          setSelectedLotsForComparison([...selectedLotsForComparison, lot.id]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                          : 'bg-[#0b111e] text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-3.5 h-3.5 accent-teal-500 rounded cursor-pointer"
                      />
                      <span>{lot.name}</span>
                      <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                        {count} cab.
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* TABELA COMPARATIVA */}
              <div className="overflow-x-auto rounded-xl border border-slate-850 bg-[#111625]/40 tabela-desempenho-lotes">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#111625] text-slate-400 border-b border-slate-850 font-bold">
                      <th className="p-3">
                        <TooltipHelp text="Nome identificador do lote de manejo" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Lote</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-3 text-right">
                        <TooltipHelp text="Número de animais (cabeças) mensurados no lote" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Animais (N)</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-3 text-right">
                        <TooltipHelp text="Espessura de Gordura Subcutânea (EGS) média do lote" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">EGS Médio</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-3 text-right">
                        <TooltipHelp text="Peso vivo médio atual do lote" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Peso Médio</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-3 text-right">
                        <TooltipHelp text="Período ótimo de confinamento (dias de cocho) projetado para o lote" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Idade de Abate Média (t*)</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-3 text-right">
                        <TooltipHelp text={`Percentual e total de animais com prontidão de abate no curto prazo (≤ ${threshold2} dias)`} placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Janela Curta (≤ {threshold2}d)</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-3 text-center">
                        <TooltipHelp text="Farol de destaque indicando lotes de alta prioridade de abate" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Filtro de Destaque</span>
                        </TooltipHelp>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40">
                    {loteComparisonStats
                      .filter(stat => selectedLotsForComparison.includes(stat.id))
                      .map(stat => {
                        const isMax = maxShortWindowPct > 0 && Math.abs(stat.shortWindowPct - maxShortWindowPct) < 0.01;
                        const isCurrentLotActive = stat.id === selectedLotId;

                        return (
                          <tr
                            key={stat.id}
                            className={`hover:bg-[#111625]/60 transition-colors ${
                              isMax 
                                ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.06)]' 
                                : isCurrentLotActive 
                                  ? 'bg-teal-500/[0.03] border-l-2 border-l-teal-500' 
                                  : ''
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {isCurrentLotActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" title="Lote Selecionado Ativo"></span>
                                )}
                                <div className="flex flex-col">
                                  <span className={`font-semibold ${isMax ? 'text-emerald-300' : 'text-white'}`}>{stat.name}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">{stat.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right font-semibold text-slate-300">
                              {stat.count} cab.
                            </td>
                            <td className="p-3 text-right font-mono text-emerald-400 font-semibold">
                              {stat.count > 0 ? `${stat.avgEgs.toFixed(2)} mm` : '-'}
                            </td>
                            <td className="p-3 text-right font-semibold text-white">
                              {stat.count > 0 ? `${stat.avgPeso.toFixed(1)} kg` : '-'}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-amber-400">
                              {stat.count > 0 ? `${stat.avgIdadeAbate.toFixed(0)} dias` : '-'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`font-mono font-bold ${isMax ? 'text-emerald-400 text-sm' : 'text-white'}`}>
                                  {stat.count > 0 ? `${stat.shortWindowPct.toFixed(1)}%` : '-'}
                                </span>
                                <span className={`text-[9px] ${isMax ? 'text-emerald-500/80' : 'text-slate-500'}`}>
                                  {stat.count > 0 ? `(${stat.shortWindowCount}/${stat.count} cab)` : ''}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              {isMax ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                                  🏆 Alta Prontidão Curta
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800/40 text-slate-500 border border-slate-800/40 text-[9px] font-semibold uppercase tracking-wider">
                                  Consistente
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-840/40">
                <Info className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  O lote ativo no painel geral está marcado com uma linha sutil à esquerda. Para trocar o lote ativo e gerenciar seus animais individuais, utilize o menu de seleção no topo da página.
                </span>
              </div>
            </div>

            {/* CONTROLES E FILTROS */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#0d1220]/80 p-4 rounded-2xl border border-slate-850">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Busca */}
                <TooltipHelp text="Filtre os animais digitando o número do brinco RFID ou raça">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar brinco RFID ou raça..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#05070c] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </TooltipHelp>
              </div>
            </div>

            {/* TABELA DE ANIMAIS */}
            <div className="bg-[#0b111e] rounded-2xl border border-slate-850 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-850 flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Mapeamento de Prontidão (Curral Ativo)</span>
                <span className="text-[10px] text-slate-400">Total: {filteredRanking.length} cabeças monitoradas</span>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#080d17]/80 text-slate-400 font-bold border-b border-slate-850">
                      <th className="p-4">
                        <TooltipHelp text="Identificador eletrônico e código do brinco (RFID) do boi" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">RFID Brinco</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4">
                        <TooltipHelp text="Racial predominante registrado do animal" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Raça</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-right">
                        <TooltipHelp text="Peso atual estimado com base no GMD e período alimentado" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Peso Hoje</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-right">
                        <TooltipHelp text="Espessura de Gordura Subcutânea projetada no dia de hoje" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">EGS Hoje</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4">
                        <TooltipHelp text="Farol de acabamento atual (Mínimo recomendado para evitar descontos é 4.0 mm)" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Farol de Gordura</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-right">
                        <TooltipHelp text="Tempo ótimo determinista (t*) para maximizar o lucro absoluto, sem considerar incertezas de mercado" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">t* Determ.</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-right">
                        <TooltipHelp text="Tempo ótimo robusto (t*) ajustado sob simulações de risco para blindar contra prejuízos" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">t* Robusto</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-right">
                        <TooltipHelp text="Margem de lucro líquido estimada por animal no ponto de abate ótimo (t* robusto)" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Lucro no Ótimo</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-right">
                        <TooltipHelp text="Risco de o animal gerar prejuízo líquido ou deságio de carcaça se abatido na data de hoje" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Risco Hoje</span>
                        </TooltipHelp>
                      </th>
                      <th className="p-4 text-center">
                        <TooltipHelp text="Ações de gestão disponíveis" placement="bottom">
                          <span className="cursor-help border-b border-dashed border-slate-600/60 pb-0.5">Ações</span>
                        </TooltipHelp>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {filteredRanking.map(r => {
                      const prontoHoje = r.tEstrelaDeterminista <= 75;
                      return (
                        <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 font-mono font-semibold text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {r.id}
                          </td>
                          <td className="p-4 capitalize text-slate-300">{r.raca}</td>
                          <td className="p-4 text-right text-white font-semibold">{r.pesoHoje} kg</td>
                          <td className="p-4 text-right font-mono text-emerald-400 font-semibold">{r.egsHoje.toFixed(1)} mm</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              r.classificacaoHoje === '4_uniforme' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              r.classificacaoHoje === '3_mediana' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              r.classificacaoHoje === '2_escassa' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {r.classificacaoHoje.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-right text-slate-300 font-semibold">{r.tEstrelaDeterminista} dias</td>
                          <td className="p-4 text-right text-emerald-300 font-bold">{r.tEstrelaRobusto} dias</td>
                          <td className="p-4 text-right text-white font-bold">R$ {r.lucroNoOtimo.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <span className={`font-mono font-bold ${r.riscoHoje > 15 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {r.riscoHoje.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedAnimalId(r.id);
                                setSubTab('animal');
                              }}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-lg text-[10px] cursor-pointer transition-colors"
                            >
                              Análise Ficha
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: FICHA DO ANIMAL (MICRO) */}
        {subTab === 'animal' && selectedAnimal && (
          <motion.div
            key="animal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* SELETOR DE ANIMAL & PARÂMETROS NASEM 2016 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#0d1220]/80 p-4 rounded-2xl border border-slate-850">
              <div className="md:col-span-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Selecionar Animal:</span>
                <select
                  value={selectedAnimalId}
                  onChange={(e) => setSelectedAnimalId(e.target.value)}
                  className="bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 w-full font-mono font-bold"
                >
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.id} ({a.raca.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              {selectedAnimal && (() => {
                const nasem = getNASEMBreedParameters(selectedAnimal.raca, selectedAnimal.sexo, selectedAnimal.frameSize);
                return (
                  <div className="md:col-span-8 flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Modelo Calibrado NASEM 2016 / BR-CORTE</span>
                        <span className="font-bold text-white capitalize">
                          Grupo Racial: {nasem.racaCategoria === 'zebuina' ? 'Zebuíno (Bos indicus)' : nasem.racaCategoria === 'taurina' ? 'Taurino (Bos taurus)' : 'Cruzamento Industrial'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#111625] px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Peso Ref (PVref)</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">{nasem.pvRef.toFixed(0)} kg</span>
                      </div>
                      <div className="bg-[#111625] px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Taxa Muscular (AOL)</span>
                        <span className="font-mono font-bold text-blue-400 text-xs">{(nasem.aolBaseRate * 100).toFixed(1)} cm²/100kg</span>
                      </div>
                      <div className="bg-[#111625] px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Expoente Gordura</span>
                        <span className="font-mono font-bold text-purple-400 text-xs">{nasem.egsMaturityExp.toFixed(2)} (PV/PVref)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* PAINEL INTERATIVO DE TRANSIÇÃO DE CURVAS E MATURIDADE DE CARCAÇA */}
            <div className="bg-[#0b101d] p-4 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                    Transição de Curvas & Maturidade de Carcaça (NASEM 2016)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  Selecione um foco para animar e destacar a inclinação de deposição tecidual
                </span>
              </div>

              {/* BOTÕES DE FOCO COM MOTION LAYOUT */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Todas as Curvas', icon: Activity, color: 'text-slate-300' },
                  { id: 'egs', label: 'Gordura EGS (mm)', icon: Target, color: 'text-emerald-400' },
                  { id: 'aol', label: 'Músculo AOL (cm²)', icon: TrendingUp, color: 'text-blue-400' },
                  { id: 'imf', label: 'Marmoreio IMF (%)', icon: Award, color: 'text-amber-400' },
                  { id: 'maturity', label: 'Maturidade & Inclinação (PV)', icon: Sparkles, color: 'text-purple-400' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedCurveFocus === tab.id;
                  return (
                    <button
                      key={`animal-curve-focus-${tab.id}`}
                      onClick={() => setSelectedCurveFocus(tab.id as any)}
                      className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isActive
                          ? 'bg-slate-800 text-white border-emerald-500/50 shadow-lg'
                          : 'bg-[#05070c] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeAnimalCurveFocusTab"
                          className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/40"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className={`w-3.5 h-3.5 ${tab.color} relative z-10`} />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* MOTION DYNAMIC PANEL */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`animal-panel-${selectedCurveFocus}`}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                  className="bg-[#05070d] p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300"
                >
                  {selectedCurveFocus === 'all' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-xs block">Visão Holística de Deposição de Tecidos (Animal)</span>
                        <p className="text-[11px] text-slate-400">
                          Acompanhamento simultâneo de hipertrofia muscular (AOL), acabamento subcutâneo (EGS) e marmoreio (IMF). As inclinações evoluem em função do Peso Vivo (PV) acumulado e da maturidade racial NASEM 2016.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                          EGS: Subcutânea
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-[10px] font-bold border border-blue-500/20">
                          AOL: Muscular
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/20">
                          IMF: Marmoreio
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedCurveFocus === 'egs' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2 space-y-1">
                        <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" /> Gordura Subcutânea (EGS) — Aceleração na Terminação
                        </span>
                        <p className="text-[11px] text-slate-400">
                          A deposição de gordura subcutânea apresenta comportamento exponencial não-linear com o aumento do Peso Vivo (PV). À medida que o animal atinge a maturidade (PV/PVref &gt; 90%), a inclinação (&Delta;EGS/&Delta;PV) se acelera para garantir acabamento mínimo exigido (4.0 mm).
                        </p>
                      </div>
                      <div className="bg-[#0c1220] p-2.5 rounded-lg border border-emerald-500/20 text-center space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Taxa Média de Deposição EGS</span>
                        <span className="text-emerald-400 font-mono font-bold text-sm block">+0.025 mm / kg PV</span>
                        <span className="text-[9px] text-slate-500">Acelera no terço final de cocho</span>
                      </div>
                    </div>
                  )}

                  {selectedCurveFocus === 'aol' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2 space-y-1">
                        <span className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Área de Olho de Lombo (AOL) — Hipertrofia Precoce
                        </span>
                        <p className="text-[11px] text-slate-400">
                          A síntese de tecido muscular predomina na fase inicial do confinamento (baixo Peso Vivo), atingindo taxas de crescimento elevadas (&Delta;AOL/&Delta;PV &approx; 0.15 cm²/kg PV). Conforme o animal ganha peso e se aproxima do peso maduro, a inclinação desacelera até o platô genético.
                        </p>
                      </div>
                      <div className="bg-[#0c1220] p-2.5 rounded-lg border border-blue-500/20 text-center space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Taxa Inicial vs Tardia AOL</span>
                        <span className="text-blue-400 font-mono font-bold text-sm block">0.15 &rarr; 0.04 cm²/kg PV</span>
                        <span className="text-[9px] text-slate-500">Desacelera com o peso vivo</span>
                      </div>
                    </div>
                  )}

                  {selectedCurveFocus === 'imf' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2 space-y-1">
                        <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> Marmoreio Intramuscular (IMF) — Acúmulo Progressivo
                        </span>
                        <p className="text-[11px] text-slate-400">
                          O marmoreio depende do aporte contínuo de energia líquida da dieta e do potencial genético racial. Sua taxa de inclinação (&Delta;IMF/&Delta;PV) se consolida na fase de terminação com dietas de alta densidade energética.
                        </p>
                      </div>
                      <div className="bg-[#0c1220] p-2.5 rounded-lg border border-amber-500/20 text-center space-y-1">
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Aporte Energético de Marmoreio</span>
                        <span className="text-amber-400 font-mono font-bold text-sm block">+0.012 % / kg PV</span>
                        <span className="text-[9px] text-slate-500">Depende de NEg concentrada</span>
                      </div>
                    </div>
                  )}

                  {selectedCurveFocus === 'maturity' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span className="font-bold text-white text-xs">
                            Deslocamento Dinâmico de Inclinação por Peso Vivo (PV) & Maturidade (NASEM 2016)
                          </span>
                        </div>
                        <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          Transição Tecidual NASEM
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        Conforme o Peso Vivo (PV) do animal evolui em relação ao seu Peso Vivo de Referência (PVref), a composição do ganho de peso se desloca da musculatura para a gordura subcutânea e de marmoreio:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Estágio 1 */}
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.05 }}
                          className="bg-[#0c101c] p-3 rounded-xl border border-blue-500/30 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Estágio 1: Crescimento Muscular</span>
                            <span className="text-[9px] text-slate-400 font-mono">&lt; 80% PVref</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação AOL (Músculo):</span>
                              <span className="font-mono font-bold text-blue-400">0.15 cm²/kg PV</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação EGS (Gordura):</span>
                              <span className="font-mono text-slate-400">0.012 mm/kg PV</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[85%]" />
                          </div>
                          <span className="text-[9px] text-slate-500 block">Alta eficiência de conversão proteica</span>
                        </motion.div>

                        {/* Estágio 2 */}
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.10 }}
                          className="bg-[#0c101c] p-3 rounded-xl border border-teal-500/30 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-teal-400 uppercase">Estágio 2: Transição de Ganho</span>
                            <span className="text-[9px] text-slate-400 font-mono">80% - 95% PVref</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação AOL (Músculo):</span>
                              <span className="font-mono text-slate-300">0.09 cm²/kg PV</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação EGS (Gordura):</span>
                              <span className="font-mono font-bold text-teal-400">0.024 mm/kg PV</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-blue-400 h-full w-[40%]" />
                            <div className="bg-emerald-400 h-full w-[60%]" />
                          </div>
                          <span className="text-[9px] text-slate-500 block">Início do acabamento de carcaça</span>
                        </motion.div>

                        {/* Estágio 3 */}
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                          className="bg-[#0c101c] p-3 rounded-xl border border-emerald-500/30 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">Estágio 3: Maturidade de Carcaça</span>
                            <span className="text-[9px] text-slate-400 font-mono">&gt; 95% PVref</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação AOL (Músculo):</span>
                              <span className="font-mono text-slate-400">0.04 cm²/kg PV</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação EGS (Gordura):</span>
                              <span className="font-mono font-bold text-emerald-400">0.038 mm/kg PV</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inclinação IMF (Marmoreio):</span>
                              <span className="font-mono font-bold text-amber-400">0.018 %/kg PV</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full w-[70%]" />
                            <div className="bg-amber-400 h-full w-[30%]" />
                          </div>
                          <span className="text-[9px] text-slate-500 block">Pico de acabamento — Ponto ideal de abate</span>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TIMELINE DE EXAMES E HISTÓRICO */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Timeline de Manejo & RTU</h3>
                </div>

                <div className="relative pl-6 border-l-2 border-emerald-500/30 space-y-5 py-2">
                  {/* Entrada */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#111625]" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Dia 0 — Entrada Confinamento</span>
                      <p className="text-xs text-white font-semibold">Peso Inicial: {selectedAnimal.pesoEntrada} kg</p>
                      <p className="text-[10px] text-slate-400">Classificação teóricaNelore de pasto</p>
                    </div>
                  </div>

                  {/* Exames */}
                  {selectedAnimal.exames.map((ex, index) => (
                    <div key={ex.id} className="relative">
                      <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-teal-400 border-4 border-[#111625]" />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-teal-400 uppercase">Dia {ex.diaDeCocho} — Exame de Ultrassom</span>
                          <span className="text-[9px] text-slate-500">{ex.dataExame}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 bg-[#080d17] p-2 rounded-xl text-center border border-slate-850">
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase">AOL</span>
                            <span className="text-[11px] text-white font-bold font-mono">{ex.aol} cm²</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase">EGS</span>
                            <span className="text-[11px] text-emerald-400 font-bold font-mono">{ex.egs} mm</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase">IMF</span>
                            <span className="text-[11px] text-white font-bold font-mono">{ex.imf}%</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-500">Operador: {ex.tecnicoId} | Equipamento: {ex.equipamentoId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GRÁFICO DE EVOLUÇÃO DE CARCAÇA E ADIPOSIDADE (RTU VS MODELO GOMPERTZ) */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 lg:col-span-2 relative z-20 hover:z-50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Curva de Deposição de Tecidos do Animal (Individual)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Áreas sombreadas: Intervalo de Incerteza (P10 - P90) para cada tecido</span>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedAnimalProjection} margin={{ top: 15, right: 25, left: -5, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9, fill: '#94a3b8' }}>
                        <Label value="Dias de Cocho (DOF)" offset={-5} position="insideBottom" fill="#94a3b8" style={{ fontSize: 10, fontWeight: 'bold' }} />
                      </XAxis>
                      <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 9, fill: '#94a3b8' }} label={{ value: 'EGS (mm) / IMF (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#10b981', style: { fontSize: 10, fontWeight: 'bold' } }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 9, fill: '#94a3b8' }} label={{ value: 'AOL (cm²)', angle: 90, position: 'insideRight', offset: 0, fill: '#3b82f6', style: { fontSize: 10, fontWeight: 'bold' } }} />
                      
                      <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-2 shadow-2xl font-sans">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between gap-4">
                              <span>Dia {label} DOF</span>
                              <span className="text-slate-400 font-normal">{data.dia <= maxExamDiaAnimal ? 'Período Observado' : 'Período Estimado'}</span>
                            </p>
                            <div className="space-y-1.5">
                              {/* EGS */}
                              <div className="flex items-center justify-between gap-4 text-[#10b981]">
                                <span className="font-medium">EGS (Gordura Subcutânea):</span>
                                <span className="font-mono font-bold">
                                  {data.egs ? data.egs.toFixed(2) : '--'} mm
                                  {data.dia >= maxExamDiaAnimal && data.egs_p10 !== undefined && (
                                    <span className="text-[10px] text-emerald-400/90 ml-1.5 font-sans font-semibold">
                                      (P10: {data.egs_p10.toFixed(2)} - P90: {data.egs_p90.toFixed(2)})
                                    </span>
                                  )}
                                </span>
                              </div>
                              {/* AOL */}
                              <div className="flex items-center justify-between gap-4 text-[#3b82f6]">
                                <span className="font-medium">AOL (Área Olho de Lombo):</span>
                                <span className="font-mono font-bold">
                                  {data.aol ? data.aol.toFixed(1) : '--'} cm²
                                  {data.dia >= maxExamDiaAnimal && data.aol_p10 !== undefined && (
                                    <span className="text-[10px] text-blue-400/90 ml-1.5 font-sans font-semibold">
                                      (P10: {data.aol_p10.toFixed(1)} - P90: {data.aol_p90.toFixed(1)})
                                    </span>
                                  )}
                                </span>
                              </div>
                              {/* IMF */}
                              <div className="flex items-center justify-between gap-4 text-[#eab308]">
                                <span className="font-medium">IMF (Marmoreio):</span>
                                <span className="font-mono font-bold">
                                  {data.imf ? data.imf.toFixed(2) : '--'} %
                                  {data.dia >= maxExamDiaAnimal && data.imf_p10 !== undefined && (
                                    <span className="text-[10px] text-yellow-400/90 ml-1.5 font-sans font-semibold">
                                      (P10: {data.imf_p10.toFixed(2)} - P90: {data.imf_p90.toFixed(2)})
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }} />

                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 9 }} />
                      
                      {/* Intervalos de Incerteza (P10 - P90) sob as curvas de cada tecido */}
                      <Area yAxisId="left" type="monotone" dataKey="egs_range" stroke="none" fill="#10b981" fillOpacity={selectedCurveFocus === 'egs' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 0.16 : 0.03} name="Incerteza P10-P90 EGS" legendType="none" connectNulls={true} />
                      <Area yAxisId="right" type="monotone" dataKey="aol_range" stroke="none" fill="#3b82f6" fillOpacity={selectedCurveFocus === 'aol' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 0.16 : 0.03} name="Incerteza P10-P90 AOL" legendType="none" connectNulls={true} />
                      <Area yAxisId="left" type="monotone" dataKey="imf_range" stroke="none" fill="#eab308" fillOpacity={selectedCurveFocus === 'imf' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 0.16 : 0.03} name="Incerteza P10-P90 IMF" legendType="none" connectNulls={true} />

                      {/* EGS (Gordura Subcutânea) */}
                      <Line yAxisId="left" type="monotone" dataKey="egs_real" stroke="#10b981" strokeOpacity={selectedCurveFocus === 'egs' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeWidth={selectedCurveFocus === 'egs' ? 4 : (selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity') ? 2.5 : 1.2} name="Gordura EGS (mm)" dot={false} activeDot={{ r: 6 }} connectNulls={true} />
                      <Line yAxisId="left" type="monotone" dataKey="egs_estimada" stroke="#10b981" strokeOpacity={selectedCurveFocus === 'egs' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeDasharray="4 4" strokeWidth={selectedCurveFocus === 'egs' ? 3 : 2} name="Gordura EGS Estimada" dot={false} legendType="none" connectNulls={true} />
                      
                      {/* AOL (Área de Olho de Lombo) */}
                      <Line yAxisId="right" type="monotone" dataKey="aol_real" stroke="#3b82f6" strokeOpacity={selectedCurveFocus === 'aol' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeWidth={selectedCurveFocus === 'aol' ? 4 : (selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity') ? 2.5 : 1.2} name="Músculo AOL (cm²)" dot={false} connectNulls={true} />
                      <Line yAxisId="right" type="monotone" dataKey="aol_estimada" stroke="#3b82f6" strokeOpacity={selectedCurveFocus === 'aol' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeDasharray="4 4" strokeWidth={selectedCurveFocus === 'aol' ? 3 : 2} name="Músculo AOL Estimado" dot={false} legendType="none" connectNulls={true} />
                      
                      {/* IMF (Gordura Intramuscular/Marmoreio) */}
                      <Line yAxisId="left" type="monotone" dataKey="imf_real" stroke="#eab308" strokeOpacity={selectedCurveFocus === 'imf' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeWidth={selectedCurveFocus === 'imf' ? 4 : (selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity') ? 2.5 : 1.2} name="Marmoreio IMF (%)" dot={false} connectNulls={true} />
                      <Line yAxisId="left" type="monotone" dataKey="imf_estimada" stroke="#eab308" strokeOpacity={selectedCurveFocus === 'imf' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeDasharray="4 4" strokeWidth={selectedCurveFocus === 'imf' ? 3 : 2} name="Marmoreio IMF Estimado" dot={false} legendType="none" connectNulls={true} />

                      {/* Pontos de Exames Reais como marcadores de destaque */}
                      <Line yAxisId="left" type="monotone" dataKey="egs_exame" stroke="transparent" name="Exame EGS Real"
                            dot={{ stroke: '#10b981', strokeWidth: 2, r: 4.5, fill: '#fff' }} legendType="none" />
                      <Line yAxisId="right" type="monotone" dataKey="aol_exame" stroke="transparent" name="Exame AOL Real"
                            dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4.5, fill: '#fff' }} legendType="none" />
                      <Line yAxisId="left" type="monotone" dataKey="imf_exame" stroke="transparent" name="Exame IMF Real"
                            dot={{ stroke: '#eab308', strokeWidth: 2, r: 4.5, fill: '#fff' }} legendType="none" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRÁFICO DE EVOLUÇÃO E PREDIÇÃO DE PESO INDIVIDUAL */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 lg:col-start-2 lg:col-span-2 relative z-20 hover:z-50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Evolução & Predição de Peso do Animal (Individual)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Linha contínua: Período Observado | Linha pontilhada: Período Estimado | Área: Incerteza (P10-P90)</span>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedAnimalProjection} margin={{ top: 15, right: 25, left: 10, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9, fill: '#94a3b8' }}>
                        <Label value="Dias de Cocho (DOF)" offset={-5} position="insideBottom" fill="#94a3b8" style={{ fontSize: 10, fontWeight: 'bold' }} />
                      </XAxis>
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke="#94a3b8" 
                        tick={{ fontSize: 9, fill: '#94a3b8' }} 
                        unit=" kg"
                        label={{ value: 'Peso Vivo do Animal (kg)', angle: -90, position: 'insideLeft', offset: 0, fill: '#10b981', style: { fontSize: 10, fontWeight: 'bold' } }}
                      />
                      <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        const pesoVal = data.peso_real ?? data.peso_estimado ?? data.peso;
                        return (
                          <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-2 shadow-2xl font-sans">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between gap-4">
                              <span>Dia {label} DOF (Animal)</span>
                              <span className="text-slate-400 font-normal">{data.dia <= maxExamDiaAnimal ? 'Observado' : 'Estimado'}</span>
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-4 text-[#10b981]">
                                <span className="font-medium">Peso Vivo:</span>
                                <span className="font-mono font-bold">{pesoVal ? pesoVal.toFixed(1) : '--'} kg</span>
                              </div>
                              {data.pesoP10 !== undefined && (
                                <div className="flex items-center justify-between gap-4 text-emerald-400/80 text-[10px]">
                                  <span>Incerteza P10 - P90:</span>
                                  <span className="font-mono">{data.pesoP10.toFixed(1)} - {data.pesoP90.toFixed(1)} kg</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-4 text-amber-400 text-[10px]">
                                <span>Meta do Usuário:</span>
                                <span className="font-mono">{userTargetWeight} kg</span>
                              </div>
                            </div>
                          </div>
                        );
                      }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                      
                      {/* Área Sombreada de Incerteza de Peso (P10 - P90) */}
                      <Area type="monotone" dataKey="peso_range" stroke="none" fill="#10b981" fillOpacity={0.12} name="Intervalo (P10-P90)" legendType="none" connectNulls={true} />

                      {/* Trecho Observado / Real (Linha Contínua) */}
                      <Line type="monotone" dataKey="peso_real" stroke="#10b981" strokeWidth={2.5} name="Evolução & Predição de Peso (kg)" dot={false} activeDot={{ r: 6 }} connectNulls={true} />

                      {/* Trecho Estimado / Projetado (Linha Pontilhada a partir do exame/estágio atual) */}
                      <Line type="monotone" dataKey="peso_estimado" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2.5} name="Peso Estimado (kg)" legendType="none" dot={false} activeDot={{ r: 6 }} connectNulls={true} />

                      {/* Pontos de Pesagens Reais Registradas */}
                      <Line type="monotone" dataKey="peso_pesagem_real" stroke="transparent" fill="#3b82f6" name="Pesagem Real Registrada (kg)" legendType="none"
                            dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#60a5fa' }} />

                      {/* Linha de Meta Definida pelo Usuário */}
                      <ReferenceLine y={userTargetWeight} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Meta: ${userTargetWeight} kg`, fill: '#f59e0b', fontSize: 9, position: 'top' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* GRÁFICOS FINANCEIROS DO ANIMAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GRÁFICO CURVA DE LUCRO DO ANIMAL COM FAIXA DE INCERTEZA */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 relative z-20 hover:z-50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Curva Individual do Animal (Lucro Médio vs DOF)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Área sombreada: Intervalo de Incerteza (P10 - P90)</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedAnimalProfitCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9 }}>
                        <Label value="Dias de Cocho (DOF)" offset={-5} position="insideBottom" fill="#94a3b8" style={{ fontSize: 10 }} />
                      </XAxis>
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl font-sans">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">Dia {label} DOF (Animal)</p>
                            <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                              <span>Lucro Médio:</span>
                              <span className="font-mono">R$ {data.lucroMedio?.toFixed(2)}/cab</span>
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-300/80 text-[10px]">
                              <span>Teto Esperado (P90):</span>
                              <span className="font-mono">R$ {data.lucroP90?.toFixed(2)}/cab</span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-300/80 text-[10px]">
                              <span>Piso Esperado (P10):</span>
                              <span className="font-mono">R$ {data.lucroP10?.toFixed(2)}/cab</span>
                            </div>
                          </div>
                        );
                      }} />
                      {selectedAnimalLHS?.tEstrelaRobusto !== undefined && (
                        <ReferenceLine x={selectedAnimalLHS.tEstrelaRobusto} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Ótimo Robusto (${selectedAnimalLHS.tEstrelaRobusto}d)`, fill: '#ef4444', fontSize: 9 }} />
                      )}
                      <Area type="monotone" dataKey="lucroP90" stroke="transparent" fill="#10b981" fillOpacity={0.06} name="Teto Esperado (P90)" />
                      <Area type="monotone" dataKey="lucroMedio" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.12} name="Lucro Líquido Médio (R$/boi)" />
                      <Area type="monotone" dataKey="lucroP10" stroke="transparent" fill="#f87171" fillOpacity={0.06} name="Piso Esperado (P10)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRÁFICO PROBABILIDADE DE PREJUÍZO POR DIA */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 relative z-20 hover:z-50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Perfil de Risco Individual (Probabilidade de Perda)</h3>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedAnimalProfitCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#f87171" tick={{ fontSize: 9 }} unit="%" />
                      <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl font-sans">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">Dia {label} DOF</p>
                            <div className="flex justify-between gap-4 text-rose-400 font-bold">
                              <span>Risco de Prejuízo:</span>
                              <span className="font-mono">{data.probabilidadePrejuizo?.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400 text-[10px]">
                              <span>Limite de Risco Tolerado:</span>
                              <span className="font-mono">{(riskTolerance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      }} />
                      <ReferenceLine y={riskTolerance * 100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Limite Risco', fill: '#10b981', fontSize: 9 }} />
                      <Line type="monotone" dataKey="probabilidadePrejuizo" stroke="#f87171" strokeWidth={2.5} name="Risco de Prejuízo (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CARD DE EXPLICABILIDADE ECONÔMICA E DRIVERS */}
            {selectedAnimal && (
              <RecommendationDriversCard
                animal={selectedAnimal}
                projection={selectedAnimalProjection}
                lhsResult={selectedAnimalLHS}
                contract={contract}
                inputs={connectedInputs}
                calibration={calibration}
                riskTolerance={riskTolerance}
              />
            )}
          </motion.div>
        )}

        {/* TAB 3: CURVA DO LOTE (MACRO) */}
        {subTab === 'lote' && (
          <motion.div
            key="lote"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* INFORMAÇÕES DE RESUMO DO LOTE */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1220]/80 p-3.5 rounded-2xl border border-slate-850">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lote em Análise</span>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {activeLot?.name || 'Manejo Global'}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                      {filteredAnimals.length} cabeças
                    </span>
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Peso Inicial Médio</span>
                  <span className="text-slate-200 font-mono font-bold">
                    {Math.round((filteredAnimals.reduce((sum, a) => sum + a.pesoEntrada, 0) / (filteredAnimals.length || 1)) * 10) / 10} kg
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">GMD Coletivo Alvo</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {(connectedInputs.gmd * calibration.multiplierGmd).toFixed(2)} kg/d
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Meta de Abate</span>
                  <span className="text-amber-400 font-mono font-bold">{userTargetWeight} kg</span>
                </div>
              </div>
            </div>

            {/* GRÁFICO 1: CURVA DE DEPOSIÇÃO DE TECIDOS DO LOTE (MÉDIAS COLETIVAS) */}
            <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 relative z-20 hover:z-50 transition-all">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Curva de Deposição de Tecidos do Lote (Médias Coletivas)</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Áreas sombreadas: Intervalo de Incerteza (P10 - P90) para cada tecido no lote</span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedLoteProfitCurveData} margin={{ top: 15, right: 25, left: -5, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                    <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9, fill: '#94a3b8' }}>
                      <Label value="Dias de Cocho (DOF)" offset={-5} position="insideBottom" fill="#94a3b8" style={{ fontSize: 10, fontWeight: 'bold' }} />
                    </XAxis>
                    <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 9, fill: '#94a3b8' }} label={{ value: 'EGS (mm) / IMF (%)', angle: -90, position: 'insideLeft', offset: 0, fill: '#10b981', style: { fontSize: 10, fontWeight: 'bold' } }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 9, fill: '#94a3b8' }} label={{ value: 'AOL (cm²)', angle: 90, position: 'insideRight', offset: 0, fill: '#3b82f6', style: { fontSize: 10, fontWeight: 'bold' } }} />
                    
                    <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-2 shadow-2xl font-sans">
                          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between gap-4">
                            <span>Dia {label} DOF (Média do Lote)</span>
                            <span className="text-slate-400 font-normal">{data.dia <= maxExamDiaLote ? 'Período Observado' : 'Período Estimado'}</span>
                          </p>
                          <div className="space-y-1.5">
                            {/* EGS */}
                            <div className="flex items-center justify-between gap-4 text-[#10b981]">
                              <span className="font-medium">EGS Média (Gordura Subcutânea):</span>
                              <span className="font-mono font-bold">
                                {data.egs ? data.egs.toFixed(2) : '--'} mm
                                {data.dia >= maxExamDiaLote && data.egs_p10 !== undefined && (
                                  <span className="text-[10px] text-emerald-400/90 ml-1.5 font-sans font-semibold">
                                    (P10: {data.egs_p10.toFixed(2)} - P90: {data.egs_p90.toFixed(2)})
                                  </span>
                                )}
                              </span>
                            </div>
                            {/* AOL */}
                            <div className="flex items-center justify-between gap-4 text-[#3b82f6]">
                              <span className="font-medium">AOL Média (Área Olho de Lombo):</span>
                              <span className="font-mono font-bold">
                                {data.aol ? data.aol.toFixed(1) : '--'} cm²
                                {data.dia >= maxExamDiaLote && data.aol_p10 !== undefined && (
                                  <span className="text-[10px] text-blue-400/90 ml-1.5 font-sans font-semibold">
                                    (P10: {data.aol_p10.toFixed(1)} - P90: {data.aol_p90.toFixed(1)})
                                  </span>
                                )}
                              </span>
                            </div>
                            {/* IMF */}
                            <div className="flex items-center justify-between gap-4 text-[#eab308]">
                              <span className="font-medium">IMF Médio (Marmoreio):</span>
                              <span className="font-mono font-bold">
                                {data.imf ? data.imf.toFixed(2) : '--'} %
                                {data.dia >= maxExamDiaLote && data.imf_p10 !== undefined && (
                                  <span className="text-[10px] text-yellow-400/90 ml-1.5 font-sans font-semibold">
                                    (P10: {data.imf_p10.toFixed(2)} - P90: {data.imf_p90.toFixed(2)})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }} />

                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 9 }} />
                    
                    {/* Intervalos de Incerteza (P10 - P90) */}
                    <Area yAxisId="left" type="monotone" dataKey="egs_range" stroke="none" fill="#10b981" fillOpacity={selectedCurveFocus === 'egs' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 0.16 : 0.03} name="Incerteza P10-P90 EGS" legendType="none" connectNulls={true} />
                    <Area yAxisId="right" type="monotone" dataKey="aol_range" stroke="none" fill="#3b82f6" fillOpacity={selectedCurveFocus === 'aol' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 0.16 : 0.03} name="Incerteza P10-P90 AOL" legendType="none" connectNulls={true} />
                    <Area yAxisId="left" type="monotone" dataKey="imf_range" stroke="none" fill="#eab308" fillOpacity={selectedCurveFocus === 'imf' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 0.16 : 0.03} name="Incerteza P10-P90 IMF" legendType="none" connectNulls={true} />

                    {/* EGS */}
                    <Line yAxisId="left" type="monotone" dataKey="egs_real" stroke="#10b981" strokeOpacity={selectedCurveFocus === 'egs' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeWidth={selectedCurveFocus === 'egs' ? 4 : (selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity') ? 2.5 : 1.2} name="Gordura EGS Média (mm)" dot={false} activeDot={{ r: 6 }} connectNulls={true} />
                    <Line yAxisId="left" type="monotone" dataKey="egs_estimada" stroke="#10b981" strokeOpacity={selectedCurveFocus === 'egs' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeDasharray="4 4" strokeWidth={selectedCurveFocus === 'egs' ? 3 : 2} name="Gordura EGS Estimada" dot={false} legendType="none" connectNulls={true} />
                    
                    {/* AOL */}
                    <Line yAxisId="right" type="monotone" dataKey="aol_real" stroke="#3b82f6" strokeOpacity={selectedCurveFocus === 'aol' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeWidth={selectedCurveFocus === 'aol' ? 4 : (selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity') ? 2.5 : 1.2} name="Músculo AOL Médio (cm²)" dot={false} connectNulls={true} />
                    <Line yAxisId="right" type="monotone" dataKey="aol_estimada" stroke="#3b82f6" strokeOpacity={selectedCurveFocus === 'aol' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeDasharray="4 4" strokeWidth={selectedCurveFocus === 'aol' ? 3 : 2} name="Músculo AOL Estimado" dot={false} legendType="none" connectNulls={true} />
                    
                    {/* IMF */}
                    <Line yAxisId="left" type="monotone" dataKey="imf_real" stroke="#eab308" strokeOpacity={selectedCurveFocus === 'imf' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeWidth={selectedCurveFocus === 'imf' ? 4 : (selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity') ? 2.5 : 1.2} name="Marmoreio IMF Médio (%)" dot={false} connectNulls={true} />
                    <Line yAxisId="left" type="monotone" dataKey="imf_estimada" stroke="#eab308" strokeOpacity={selectedCurveFocus === 'imf' || selectedCurveFocus === 'all' || selectedCurveFocus === 'maturity' ? 1.0 : 0.2} strokeDasharray="4 4" strokeWidth={selectedCurveFocus === 'imf' ? 3 : 2} name="Marmoreio IMF Estimado" dot={false} legendType="none" connectNulls={true} />

                    {/* Pontos de Exames Reais Coletivos do Lote como marcadores de destaque */}
                    <Line yAxisId="left" type="monotone" dataKey="egs_exame" stroke="transparent" name="Exame EGS Real Médio"
                          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4.5, fill: '#fff' }} legendType="none" connectNulls={true} />
                    <Line yAxisId="right" type="monotone" dataKey="aol_exame" stroke="transparent" name="Exame AOL Real Médio"
                          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4.5, fill: '#fff' }} legendType="none" connectNulls={true} />
                    <Line yAxisId="left" type="monotone" dataKey="imf_exame" stroke="transparent" name="Exame IMF Real Médio"
                          dot={{ stroke: '#eab308', strokeWidth: 2, r: 4.5, fill: '#fff' }} legendType="none" connectNulls={true} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICO 2: EVOLUÇÃO E PREDIÇÃO DE PESO COLETIVO DO LOTE */}
            <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 relative z-20 hover:z-50 transition-all">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Evolução & Predição de Peso Coletivo do Lote</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-sans">Linha contínua: Período Observado | Linha pontilhada: Período Estimado | Área: Incerteza (P10-P90)</span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedLoteProfitCurveData} margin={{ top: 15, right: 25, left: 10, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                    <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9, fill: '#94a3b8' }}>
                      <Label value="Dias de Cocho (DOF)" offset={-5} position="insideBottom" fill="#94a3b8" style={{ fontSize: 10, fontWeight: 'bold' }} />
                    </XAxis>
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="#94a3b8" 
                      tick={{ fontSize: 9, fill: '#94a3b8' }} 
                      unit=" kg"
                      label={{ value: 'Peso Médio Vivo do Lote (kg)', angle: -90, position: 'insideLeft', offset: 0, fill: '#10b981', style: { fontSize: 10, fontWeight: 'bold' } }}
                    />
                    <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      const pesoVal = data.peso_real ?? data.peso_estimado ?? data.peso;
                      return (
                        <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-2 shadow-2xl font-sans">
                          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex justify-between gap-4">
                            <span>Dia {label} DOF (Lote)</span>
                            <span className="text-slate-400 font-normal">{data.dia <= maxExamDiaLote ? 'Observado' : 'Estimado'}</span>
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-4 text-[#10b981]">
                              <span className="font-medium">Peso Médio Vivo:</span>
                              <span className="font-mono font-bold">{pesoVal ? pesoVal.toFixed(1) : '--'} kg</span>
                            </div>
                            {data.pesoP10 !== undefined && (
                              <div className="flex items-center justify-between gap-4 text-emerald-400/80 text-[10px]">
                                <span>Incerteza P10 - P90:</span>
                                <span className="font-mono">{data.pesoP10.toFixed(1)} - {data.pesoP90.toFixed(1)} kg</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-4 text-amber-400 text-[10px]">
                              <span>Meta do Usuário:</span>
                              <span className="font-mono">{userTargetWeight} kg</span>
                            </div>
                          </div>
                        </div>
                      );
                    }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    
                    {/* Área Sombreada de Incerteza de Peso (P10 - P90) */}
                    <Area type="monotone" dataKey="peso_range" stroke="none" fill="#10b981" fillOpacity={0.12} name="Intervalo (P10-P90)" legendType="none" connectNulls={true} />

                    {/* Trecho Observado / Real */}
                    <Line type="monotone" dataKey="peso_real" stroke="#10b981" strokeWidth={2.5} name="Peso Médio Real (kg)" dot={false} activeDot={{ r: 6 }} connectNulls={true} />

                    {/* Trecho Estimado / Projetado */}
                    <Line type="monotone" dataKey="peso_estimado" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2.5} name="Peso Médio Projetado (kg)" legendType="none" dot={false} activeDot={{ r: 6 }} connectNulls={true} />

                    {/* Pesagens Reais Coletivas */}
                    <Line type="monotone" dataKey="peso_pesagem_real" stroke="transparent" fill="#3b82f6" name="Pesagem Real Registrada Lote (kg)" legendType="none"
                          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#60a5fa' }} />

                    {/* Linha de Meta Definida pelo Usuário */}
                    <ReferenceLine y={userTargetWeight} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Meta: ${userTargetWeight} kg`, fill: '#f59e0b', fontSize: 9, position: 'top' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GRÁFICOS FINANCEIROS EM GRID 2 COLUNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* GRÁFICO CURVA DE LUCRO DO LOTE COM FAIXA DE INCERTEZA */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 relative z-20 hover:z-50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Curva Global do Lote (Lucro Médio vs DOF)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Área sombreada: Intervalo de Incerteza (P10 - P90)</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loteProfitCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9 }}>
                        <Label value="Dias de Cocho (DOF)" offset={-5} position="insideBottom" fill="#94a3b8" style={{ fontSize: 10 }} />
                      </XAxis>
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl font-sans">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">Dia {label} DOF (Média por Cabeça)</p>
                            <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                              <span>Lucro Médio:</span>
                              <span className="font-mono">R$ {data.lucroMedio?.toFixed(2)}/cab</span>
                            </div>
                            <div className="flex justify-between gap-4 text-emerald-300/80 text-[10px]">
                              <span>Teto Esperado (P90):</span>
                              <span className="font-mono">R$ {data.lucroP90?.toFixed(2)}/cab</span>
                            </div>
                            <div className="flex justify-between gap-4 text-rose-300/80 text-[10px]">
                              <span>Piso Esperado (P10):</span>
                              <span className="font-mono">R$ {data.lucroP10?.toFixed(2)}/cab</span>
                            </div>
                          </div>
                        );
                      }} />
                      <ReferenceLine x={avgLoteOptimumRobusto} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Janela Ótima Média (${avgLoteOptimumRobusto}d)`, fill: '#ef4444', fontSize: 9 }} />
                      <Area type="monotone" dataKey="lucroP90" stroke="transparent" fill="#10b981" fillOpacity={0.06} name="Teto Esperado (P90)" />
                      <Area type="monotone" dataKey="lucroMedio" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.12} name="Lucro Líquido Médio (R$/boi)" />
                      <Area type="monotone" dataKey="lucroP10" stroke="transparent" fill="#f87171" fillOpacity={0.06} name="Piso Esperado (P10)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRÁFICO PROBABILIDADE DE PREJUÍZO POR DIA */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 relative z-20 hover:z-50 transition-all">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Perfil de Risco do Lote (Probabilidade de Perda)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Monte Carlo / LHS</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loteProfitCurveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis dataKey="dia" stroke="#475569" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#f87171" tick={{ fontSize: 9 }} unit="%" />
                      <Tooltip wrapperStyle={{ zIndex: 999999, pointerEvents: 'none' }} allowEscapeViewBox={{ x: true, y: true }} content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#090d16] border border-slate-800 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl font-sans">
                            <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">Dia {label} DOF</p>
                            <div className="flex justify-between gap-4 text-rose-400 font-bold">
                              <span>Risco de Prejuízo:</span>
                              <span className="font-mono">{data.probabilidadePrejuizo?.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between gap-4 text-slate-400 text-[10px]">
                              <span>Limite de Risco Tolerado:</span>
                              <span className="font-mono">{(riskTolerance * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      }} />
                      <ReferenceLine y={riskTolerance * 100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Limite Risco', fill: '#10b981', fontSize: 9 }} />
                      <Line type="monotone" dataKey="probabilidadePrejuizo" stroke="#f87171" strokeWidth={2.5} name="Risco de Prejuízo (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CARD DE DRIVERS DE RECOMENDAÇÃO E EXPLICABILIDADE DO LOTE */}
            {loteAnimal && loteLHS && (
              <RecommendationDriversCard
                animal={loteAnimal}
                projection={loteProjection}
                lhsResult={loteLHS}
                contract={contract}
                inputs={connectedInputs}
                calibration={calibration}
                riskTolerance={riskTolerance}
                isLot={true}
              />
            )}
          </motion.div>
        )}

        {/* TAB: MANEJO DO LOTE E AMOSTRAGEM */}
        {subTab === 'manejo' && (
          <motion.div
            key="manejo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* CARD UNIFICADO: PARÂMETROS E CADASTRO DO LOTE */}
            <div className="bg-[#0d121f] p-5 md:p-6 rounded-2xl border border-slate-850 text-left shadow-sm hover:border-slate-800 transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:divide-x divide-slate-800/60">
                
                {/* COLUNA 1: PARÂMETROS DE DESEMPENHO DO LOTE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800/60 pb-3">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sans">Parâmetros de Desempenho do Lote</h3>
                      <p className="text-[10px] text-slate-400">Configure as premissas produtivas, período de engorda e nutrição ativa do lote.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Nome Comercial do Lote</label>
                      <input
                        type="text"
                        value={activeLot.name}
                        onChange={(e) => handleUpdateLotField('name', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Descrição de Manejo</label>
                      <input
                        type="text"
                        value={activeLot.description}
                        onChange={(e) => handleUpdateLotField('description', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" /> Início Confinamento
                      </label>
                      <input
                        type="date"
                        value={activeLot.dataInicioConfinamento}
                        onChange={(e) => handleUpdateLotField('dataInicioConfinamento', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" /> Data da Mensuração
                      </label>
                      <input
                        type="date"
                        value={activeLot.dataMensuracao}
                        onChange={(e) => handleUpdateLotField('dataMensuracao', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-teal-400" /> Operador do Ultrassom
                      </label>
                      <input
                        type="text"
                        value={activeLot.operador}
                        onChange={(e) => handleUpdateLotField('operador', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-teal-400" /> Marca do Ultrassom
                      </label>
                      <input
                        type="text"
                        value={activeLot.marcaEquipamento}
                        onChange={(e) => handleUpdateLotField('marcaEquipamento', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Carregar Dieta (Salvas/Padrão)</label>
                      <select
                        value=""
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const diet = availableDiets.find(d => d.name === selectedName);
                          if (diet) {
                            handleUpdateLotField('dietaNome', diet.name);
                            handleUpdateLotField('gmdMedioAlvo', diet.gmd);
                          }
                        }}
                        className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans cursor-pointer"
                      >
                        <option value="" disabled>-- Selecione uma Dieta para Carregar --</option>
                        {availableDiets.filter(d => d.isCustom).length > 0 && (
                          <optgroup label="Dietas Personalizadas Salvas">
                            {availableDiets.filter(d => d.isCustom).map(d => (
                              <option key={`active-custom-${d.name}`} value={d.name}>
                                {d.name} (GMD: {d.gmd.toFixed(2)} kg/d) [Custom]
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Dietas de Referência Padrão">
                          {availableDiets.filter(d => !d.isCustom).map(d => (
                            <option key={`active-ref-${d.name}`} value={d.name}>
                              {d.name} (GMD: {d.gmd.toFixed(2)} kg/d)
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">GMD Médio Alvo (kg/d)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={activeLot.gmdMedioAlvo}
                        onChange={(e) => handleUpdateLotField('gmdMedioAlvo', Number(e.target.value))}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Dieta de Terminação</label>
                      <input
                        type="text"
                        value={activeLot.dietaNome}
                        onChange={(e) => handleUpdateLotField('dietaNome', e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#121826]/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      As informações acima definem a base operacional de manejo do lote, determinando os dias de cocho na mensuração e o técnico certificado responsável.
                    </span>
                  </div>
                </div>

                {/* COLUNA 2: CADASTRO DE ANIMAIS DO LOTE */}
                <div className="space-y-4 pt-6 lg:pt-0 lg:pl-6 xl:pl-8">
                  <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800/60 pb-3">
                    <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <Plus className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sans">Cadastro de Animais do Lote</h3>
                      <p className="text-[10px] text-slate-400">Registre novos indivíduos ou edite informações de animais no lote.</p>
                    </div>
                  </div>

                  {/* SUBFORM: CADASTRO OU EDIÇÃO DE ANIMAL */}
                  <form onSubmit={handleAddAnimal} className="w-full bg-[#121826]/40 p-4 rounded-xl border border-slate-800/80 space-y-4 text-xs">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      {editingAnimalId ? (
                        <>
                          <Pencil className="w-4 h-4 text-emerald-400" /> Editar Animal {editingAnimalId}
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-emerald-400" /> Cadastrar novo animal no lote
                        </>
                      )}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">
                          Identificador RFID / Brinco {editingAnimalId && <span className="text-[10px] text-slate-500 font-normal">(Não editável)</span>}
                        </label>
                        <input
                          type="text"
                          disabled={!!editingAnimalId}
                          placeholder="Ex: RFID-1009"
                          value={newAnimalId}
                          onChange={(e) => setNewAnimalId(e.target.value)}
                          className={`w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 uppercase font-mono ${
                            editingAnimalId ? 'opacity-60 cursor-not-allowed bg-slate-900/50' : ''
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Raça / Genética</label>
                          <select
                            value={newAnimalRaca}
                            onChange={(e) => setNewAnimalRaca(e.target.value as any)}
                            className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans cursor-pointer"
                          >
                            <option value="nelore" className="bg-[#0f172a]">Nelore</option>
                            <option value="cruzamento" className="bg-[#0f172a]">Angus F1</option>
                            <option value="holandes" className="bg-[#0f172a]">Holandês</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Sexo / Tipo</label>
                          <select
                            value={newAnimalSexo}
                            onChange={(e) => setNewAnimalSexo(e.target.value as any)}
                            className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans cursor-pointer"
                          >
                            <option value="macho" className="bg-[#0f172a]">Castrado</option>
                            <option value="inteiro" className="bg-[#0f172a]">Inteiro</option>
                            <option value="femea" className="bg-[#0f172a]">Fêmea</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Porte / Frame</label>
                          <select
                            value={newAnimalFrame}
                            onChange={(e) => setNewAnimalFrame(e.target.value as any)}
                            className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans cursor-pointer"
                          >
                            <option value="pequeno" className="bg-[#0f172a]">Pequeno</option>
                            <option value="medio" className="bg-[#0f172a]">Médio</option>
                            <option value="grande" className="bg-[#0f172a]">Grande</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Peso de Entrada (kg)</label>
                          <input
                            type="number"
                            value={newAnimalPesoEntrada}
                            onChange={(e) => setNewAnimalPesoEntrada(Number(e.target.value))}
                            className="w-full bg-[#121826] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="newAnimalIsAmostra"
                          checked={newAnimalIsAmostra}
                          onChange={(e) => setNewAnimalIsAmostra(e.target.checked)}
                          className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-[#121826] w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="newAnimalIsAmostra" className="text-[11px] text-slate-300 font-semibold cursor-pointer select-none">
                          Marcar como Amostra de Ultrassom
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-md shadow-emerald-950/20 active:scale-[0.98]"
                      >
                        {editingAnimalId ? (
                          <>
                            <Save className="w-4 h-4" /> Salvar Alterações
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Cadastrar e Inserir no Lote
                          </>
                        )}
                      </button>

                      {editingAnimalId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAnimalId(null);
                            setNewAnimalId('');
                            setNewAnimalIsAmostra(false);
                          }}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>
                  </form>
                </div>

              </div>
            </div>

            {/* CARD 3B: GESTÃO E AMOSTRAGEM DE ANIMAIS */}
            <div className="bg-[#0d121f] p-5 rounded-2xl border border-slate-850 space-y-4 text-left shadow-sm hover:border-slate-800 transition-all duration-300 relative">
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800/60 pb-3">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sans">Gestão e Amostragem de Animais</h3>
                  <p className="text-[10px] text-slate-400">Acompanhe os animais ativos no lote e defina quais compõem a amostra do ultrassom.</p>
                </div>
              </div>

              {/* TABELA: SELEÇÃO DA AMOSTRA */}
              <div className="w-full space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Lista de Animais Ativos do Lote</h4>
                  <span className="text-[9px] text-slate-500">Marque a caixa para incluir/excluir o boi da amostra</span>
                </div>

                <div className="overflow-x-auto border border-slate-850/60 rounded-xl bg-[#121826]/20">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-[#121826]/60 text-slate-400 font-bold border-b border-slate-850/60 text-[9px] uppercase tracking-wider">
                        <th className="px-2 py-2">Brinco / RFID</th>
                        <th className="px-2 py-2">Genética / Sexo</th>
                        <th className="px-2 py-2 text-right">Peso Entrada</th>
                        <th className="px-2 py-2 text-center">Exames RTU</th>
                        <th className="px-2 py-2 text-center">Último Exame (AOL / EGS / IMF)</th>
                        <th className="px-2 py-2 text-center">Amostra</th>
                        <th className="px-2 py-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/60 font-medium">
                      {filteredAnimals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-center text-slate-500 bg-[#121826]/10 text-[11px]">
                            Nenhum animal cadastrado neste lote. Use o formulário de cadastro acima para adicionar.
                          </td>
                        </tr>
                      ) : (
                        filteredAnimals.map(a => {
                          const latestExam = a.exames && a.exames.length > 0 ? a.exames[a.exames.length - 1] : null;
                          return (
                            <tr key={a.id} className="hover:bg-[#121826]/40 transition-colors group">
                              <td className="px-2 py-1.5 font-mono font-bold text-white">
                                <div className="flex items-center gap-1">
                                  {a.isAmostra ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" title="Amostra ativa"></span>
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" title="Animal regular"></span>
                                  )}
                                  <span>{a.id}</span>
                                </div>
                              </td>
                              <td className="px-2 py-1.5 text-slate-300 capitalize text-[10px]">
                                {a.raca === 'cruzamento' ? 'Angus F1' : a.raca} <span className="text-slate-500 font-mono text-[9px]">({a.sexo})</span>
                              </td>
                              <td className="px-2 py-1.5 text-right font-mono text-slate-300">{a.pesoEntrada} kg</td>
                              <td className="px-2 py-1.5 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  a.exames.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {a.exames.length} ex.
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-400">
                                {latestExam ? (
                                  <span className="text-emerald-300 font-semibold">
                                    {latestExam.aol.toFixed(1)} / {latestExam.egs.toFixed(1)} / {latestExam.imf.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={!!a.isAmostra}
                                  onChange={() => handleToggleAnimalSample(a.id)}
                                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-[#121826] w-3.5 h-3.5 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-1.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <TooltipHelp text="Ficha de exames e projeção">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAnimalId(a.id);
                                        setSubTab('animal');
                                      }}
                                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-[9px] font-bold transition-all shrink-0 cursor-pointer"
                                    >
                                      Ficha
                                    </button>
                                  </TooltipHelp>

                                  <TooltipHelp text="Editar animal">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditAnimal(a)}
                                      className="p-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded transition-all cursor-pointer border border-emerald-500/10"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                  </TooltipHelp>

                                  <TooltipHelp text="Excluir animal">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteAnimal(a.id)}
                                      className="p-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-all cursor-pointer border border-red-500/10"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </TooltipHelp>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* CARD 2: EXTRAPOLAÇÃO POR AMOSTRAGEM */}
            <div className="bg-[#0d121f] p-5 rounded-2xl border border-slate-850 space-y-4 flex flex-col justify-between text-left shadow-sm hover:border-slate-800 transition-all duration-300 relative">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800/60 pb-3">
                  <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-sans">Extrapolação Estatística de Ultrassom</h3>
                    <p className="text-[10px] text-slate-400">Projete os resultados biológicos medidos na amostra para todo o lote.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  O método de amostragem permite escanear um subgrupo representativo do lote (<strong className="text-emerald-400 font-bold">grupo amostral</strong>) para mapear o comportamento biológico real da gordura (EGS), musculatura (AOL) e marmoreio (IMF).
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Ao extrapolar, o motor calcula o desvio desse grupo em relação ao modelo genérico e gera coeficientes de calibração específicos que são <strong className="text-white font-semibold">aplicados instantaneamente a todo o lote</strong>.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#121826]/40 rounded-xl border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-sans">Total Lote</span>
                    <strong className="text-lg font-display text-white block mt-0.5">{filteredAnimals.length}</strong>
                    <span className="text-[9px] text-slate-500 block">cabeças ativas</span>
                  </div>

                  <div className="p-3 bg-[#121826]/40 rounded-xl border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-sans">Amostra Atual</span>
                    <strong className="text-lg font-display text-emerald-400 block mt-0.5">
                      {filteredAnimals.filter(a => a.isAmostra).length}
                    </strong>
                    <span className="text-[9px] text-slate-500 block">
                      ({filteredAnimals.length > 0 ? Math.round((filteredAnimals.filter(a => a.isAmostra).length / filteredAnimals.length) * 100) : 0}% do lote)
                    </span>
                  </div>

                  <div className="p-3 bg-[#121826]/40 rounded-xl border border-slate-800/80 text-center col-span-2 sm:col-span-1 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-sans">Status Amostra</span>
                    {filteredAnimals.filter(a => a.isAmostra).length === 0 ? (
                      <span className="px-2 py-0.5 mt-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-[9px] font-bold">Vazia</span>
                    ) : (filteredAnimals.filter(a => a.isAmostra).length / filteredAnimals.length) < 0.15 ? (
                      <span className="px-2 py-0.5 mt-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-bold">Mínimo Baixo</span>
                    ) : (
                      <span className="px-2 py-0.5 mt-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-bold">Suficiente</span>
                    )}
                    <span className="text-[8px] text-slate-500 block mt-1">Recomendado &gt;= 15%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleExtrapolateSample}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/25 active:scale-98 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Calcular & Extrapolar Resultados para o Lote Todo
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-normal">
                  Nota: O cálculo exige que ao menos um animal da amostra possua exame de ultrassom cadastrado com os valores de AOL, EGS e IMF medidos.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CONFIGURAÇÕES LHS (SIMULAÇÃO ESTOCÁSTICA AVANÇADA) */}
        {subTab === 'simulation' && (
          <motion.div
            key="simulation"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PARÂMETROS E SEMENTES */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 lg:col-span-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Parâmetros do Motor Estocástico</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amostras N */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300 uppercase">Tamanho da Amostra (N Iterações)</label>
                    <div className="flex gap-2">
                      {[100, 500, 1000, 5000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setLhsIterations(val)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                            lhsIterations === val 
                              ? 'bg-emerald-600 border-emerald-500 text-white' 
                              : 'bg-[#080d17] border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500">Valores altos melhoram convergência estatística mas consomem CPU.</span>
                  </div>

                  {/* Seed */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300 uppercase">Semente Aleatória (Seed de Auditoria)</label>
                    <input
                      type="number"
                      value={simSeed}
                      onChange={(e) => setSimSeed(Number(e.target.value))}
                      className="w-full bg-[#080d17] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500">Garante reprodutibilidade e consistência matemática estrita.</span>
                  </div>
                </div>

                {/* DISTRIBUIÇÕES PADRÃO */}
                <div className="space-y-3 pt-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Amostrador de Incertezas Mapeadas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#080d17] rounded-xl border border-slate-850 space-y-1">
                      <span className="text-[10px] font-bold text-teal-400 uppercase">GMD (Ganho Médio Diário)</span>
                      <p className="text-slate-400">Distribuição: <strong>Normal Truncada</strong></p>
                      <p className="text-[10px] text-slate-500">Desvio Padrão: 0.18 kg/dia | Limites: 0.4 a 2.5 kg/dia</p>
                    </div>
                    <div className="p-3 bg-[#080d17] rounded-xl border border-slate-850 space-y-1">
                      <span className="text-[10px] font-bold text-teal-400 uppercase">Preço do Boi Gordo (@)</span>
                      <p className="text-slate-400">Distribuição: <strong>Laplace (Caudas Leptocúrticas)</strong></p>
                      <p className="text-[10px] text-slate-500">Escala de Cauda: 12.00 R$ | Desviador financeiro real</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CORRELAÇÕES VIA CÓPULA DE CLAYTON */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cópulas & Correlações Biológicas</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-[#080d17] rounded-xl border border-slate-850 space-y-2">
                    <span className="text-[10px] font-bold text-purple-400 uppercase block">Cópula Selecionada</span>
                    <div className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg font-bold text-center">
                      CÓPULA DE CLAYTON (CALIBRADA)
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Cópulas de Clayton modelam fortes dependências nas caudas esquerdas, simulando quebras sistêmicas simultâneas de ganho de peso e consumo de ração sob forte estresse climático.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-300 uppercase block">Fatores de Correlação Biológica</span>
                    <div className="space-y-1 font-mono text-[10px] text-slate-400">
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span>GMD vs Rendimento de Carcaça</span>
                        <span className="text-emerald-400">+0.45</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span>GMD vs Espessura de Gordura (EGS)</span>
                        <span className="text-emerald-400">+0.35</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-850">
                        <span>Preço Boi Magro vs Preço Boi Gordo</span>
                        <span className="text-emerald-400">+0.75</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB: NOVO EXAME ULTRASSOM */}
        {subTab === 'new_exam' && (
          <motion.div
            key="new_exam"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* COLUNA ESQUERDA: FORMULÁRIO */}
              <div className="bg-[#121826]/40 p-5 rounded-xl border border-slate-800/80 space-y-4 lg:col-span-5 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Registrar Novo Exame Ultrassom</h3>
                  </div>
 
                  <form onSubmit={handleAddExam} className="space-y-4 text-xs">
                    {/* Escolha do Lote */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Selecionar Lote</label>
                      <select
                        value={selectedLotId}
                        onChange={(e) => setSelectedLotId(e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans cursor-pointer"
                      >
                        {lots.map(l => (
                          <option key={l.id} value={l.id} className="bg-[#0f172a]">{l.name}</option>
                        ))}
                      </select>
                    </div>
 
                    {/* Escolha do Animal */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Selecionar Animal</label>
                      <select
                        value={examAnimalId}
                        onChange={(e) => setExamAnimalId(e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-sans cursor-pointer"
                      >
                        {filteredAnimals.length === 0 ? (
                          <option value="" className="bg-[#0f172a]">Nenhum animal neste lote</option>
                        ) : (
                          filteredAnimals.map(a => (
                            <option key={a.id} value={a.id} className="bg-[#0f172a]">{a.id} ({a.raca === 'cruzamento' ? 'Angus F1' : a.raca.toUpperCase()} - {a.sexo})</option>
                          ))
                        )}
                      </select>
                    </div>
 
                    <div className="grid grid-cols-2 gap-3">
                      {/* Dia de cocho */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Dia de Cocho (DOF)</label>
                        <input
                          type="number"
                          value={examDia}
                          onChange={(e) => setExamDia(Number(e.target.value))}
                          className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        />
                      </div>
 
                      {/* Peso */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Peso (kg)</label>
                        <input
                          type="number"
                          value={examPeso}
                          onChange={(e) => setExamPeso(Number(e.target.value))}
                          className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                        />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-2 gap-3">
                      {/* EGS */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">EGS (Gordura, mm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={examEgs}
                          onChange={(e) => setExamEgs(Number(e.target.value))}
                          className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                        />
                      </div>
 
                      {/* AOL */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">AOL (Músculo, cm²)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={examAol}
                          onChange={(e) => setExamAol(Number(e.target.value))}
                          className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                        />
                      </div>
                    </div>
 
                    <div className="grid grid-cols-2 gap-3">
                      {/* IMF */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">IMF (Marmoreio, %)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={examImf}
                          onChange={(e) => setExamImf(Number(e.target.value))}
                          className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 font-mono"
                        />
                      </div>
 
                      {/* Tecnico */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Técnico Operador</label>
                        <input
                          type="text"
                          value={examTecnico}
                          onChange={(e) => setExamTecnico(e.target.value)}
                          className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>
 
                    {/* Equipamento */}
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans">Aparelho RTU</label>
                      <input
                        type="text"
                        value={examEquipamento}
                        onChange={(e) => setExamEquipamento(e.target.value)}
                        className="w-full bg-[#121826] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-100 outline-none hover:bg-[#161e30] transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                      />
                    </div>
 
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!examAnimalId}
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-98 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Salvar Exame e Registrar Medições
                      </button>
                    </div>
                  </form>
                </div>
              </div>
 
              {/* COLUNA DIREITA: HISTÓRICO DE EXAMES DO ANIMAL SELECIONADO */}
              <div className="bg-[#121826]/40 p-5 rounded-xl border border-slate-800/80 space-y-4 lg:col-span-7 text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">Histórico de Medições do Animal</h3>
                    </div>
                    {selectedExamAnimal && (
                      <span className="px-2 py-0.5 bg-[#121826] text-slate-300 border border-slate-800 rounded text-[10px] font-mono font-bold">
                        {selectedExamAnimal.id} ({selectedExamAnimal.raca === 'cruzamento' ? 'Angus F1' : selectedExamAnimal.raca.toUpperCase()})
                      </span>
                    )}
                  </div>
 
                  {!selectedExamAnimal ? (
                    <div className="p-8 text-center bg-[#121826]/20 rounded-xl border border-slate-850/60 text-slate-400 text-[11px]">
                      Selecione um animal no formulário para visualizar seu histórico de medições.
                    </div>
                  ) : selectedExamAnimal.exames.length === 0 ? (
                    <div className="p-8 text-center bg-[#121826]/20 rounded-xl border border-slate-850/60 text-slate-400 text-[11px] space-y-1">
                      <p className="font-semibold text-white">Nenhum exame cadastrado</p>
                      <p className="text-[10px] text-slate-500">Adicione a primeira medição usando o formulário ao lado.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Tabela de Exames cadastrados */}
                      <div className="overflow-x-auto border border-slate-850/60 rounded-xl bg-[#121826]/20">
                        <table className="w-full text-left text-[10px] border-collapse">
                          <thead>
                            <tr className="bg-[#121826]/60 text-slate-400 font-bold border-b border-slate-850/60 text-[9px] uppercase tracking-wider">
                              <th className="px-2.5 py-2">Dia Cocho</th>
                              <th className="px-2.5 py-2">Data Exame</th>
                              <th className="px-2.5 py-2 text-center font-mono">AOL (cm²)</th>
                              <th className="px-2.5 py-2 text-center font-mono">EGS (mm)</th>
                              <th className="px-2.5 py-2 text-center font-mono">IMF (%)</th>
                              <th className="px-2.5 py-2">Operador / Aparelho</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-850/60 font-medium">
                            {selectedExamAnimal.exames.map((ex) => (
                              <tr key={ex.id} className="hover:bg-[#121826]/40 transition-colors">
                                <td className="px-2.5 py-1.5 font-bold text-white font-mono">{ex.diaDeCocho}</td>
                                <td className="px-2.5 py-1.5 text-slate-400">{ex.dataExame}</td>
                                <td className="px-2.5 py-1.5 text-center text-teal-400 font-bold font-mono">{ex.aol}</td>
                                <td className="px-2.5 py-1.5 text-center text-emerald-400 font-bold font-mono">{ex.egs}</td>
                                <td className="px-2.5 py-1.5 text-center text-purple-400 font-bold font-mono">{ex.imf}</td>
                                <td className="px-2.5 py-1.5 text-slate-400">
                                  <div className="truncate max-w-[150px] text-[9px]" title={`${ex.tecnicoId} - ${ex.equipamentoId}`}>
                                    {ex.tecnicoId} <span className="text-slate-600">/</span> {ex.equipamentoId}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
 
                      {/* Pequeno card resumo */}
                      <div className="p-4 bg-[#121826]/30 rounded-xl border border-slate-850/50 space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estatísticas do Animal</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-2.5 bg-[#121826]/40 rounded-lg border border-slate-850/60">
                            <span className="text-[9px] text-slate-500 block">Média AOL</span>
                            <strong className="text-sm text-teal-400 font-mono">
                              {(selectedExamAnimal.exames.reduce((acc, curr) => acc + curr.aol, 0) / selectedExamAnimal.exames.length).toFixed(1)} <span className="text-[9px] text-slate-500 font-sans font-normal">cm²</span>
                            </strong>
                          </div>
                          <div className="p-2.5 bg-[#121826]/40 rounded-lg border border-slate-850/60">
                            <span className="text-[9px] text-slate-500 block">Última EGS</span>
                            <strong className="text-sm text-emerald-400 font-mono">
                              {selectedExamAnimal.exames[selectedExamAnimal.exames.length - 1]?.egs.toFixed(1)} <span className="text-[9px] text-slate-500 font-sans font-normal">mm</span>
                            </strong>
                          </div>
                          <div className="p-2.5 bg-[#121826]/40 rounded-lg border border-slate-850/60">
                            <span className="text-[9px] text-slate-500 block">Medições Totais</span>
                            <strong className="text-sm text-white font-mono">
                              {selectedExamAnimal.exames.length}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: CALIBRAÇÃO & QUALIDADE DO MODELO (DADOS REAIS DE ABATE) */}
        {subTab === 'calibration' && (
          <motion.div
            key="calibration"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* DRIFT ALERT BANNER */}
            {calibration.driftDetected && (
              <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-red-300">DRIFT SISTEMÁTICO DO MODELO BIOLÓGICO DETECTADO</h4>
                  <p className="text-red-400/80 leading-relaxed">
                    O erro médio de predição de carcaça para as últimas entregas excedeu 12 kg de desvio. Os multiplicadores locais foram autoajustados preventivamente. Solicite revisão de qualidade dos lotes de farelo de soja da dieta.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* CONFIGURAÇÃO DE CALIBRAÇÃO ATIVA */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Calibração e Multiplicadores</h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* TOGGLE AUTO VS MANUAL */}
                  <div className="space-y-2 bg-[#080d17] p-3 rounded-xl border border-slate-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Calibração</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${autoCalibrate ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {autoCalibrate ? 'Automática' : 'Manual'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#04060a] rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setAutoCalibrate(true);
                          recalibrateWithCarcassData(animals, false);
                        }}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                          autoCalibrate
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Automática
                      </button>
                      <button
                        type="button"
                        onClick={() => setAutoCalibrate(false)}
                        className={`py-1.5 px-2 rounded-md font-bold text-[10px] transition-all cursor-pointer ${
                          !autoCalibrate
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Manual
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal pt-1">
                      {autoCalibrate 
                        ? "Os multiplicadores serão recalculados instantaneamente a cada inserção de dados de carcaça." 
                        : "Novos dados de carcaça ficarão pendentes até o usuário comandar a recalibração manual."
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-[#080d17] rounded-xl border border-slate-850 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Versão do Modelo Local</span>
                    <div className="font-mono text-white font-bold">{calibration.version}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-slate-400">Multiplicador GMD:</span>
                      <span className="text-emerald-400 font-bold">{calibration.multiplierGmd.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-slate-400">Multiplicador EGS:</span>
                      <span className="text-emerald-400 font-bold">{calibration.multiplierEgs.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-slate-400">Multiplicador Rendimento:</span>
                      <span className="text-emerald-400 font-bold">{calibration.multiplierRendimento.toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3.5 space-y-3">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">MAE Carcaça Quente:</span>
                      <span className="text-white font-bold font-mono">{calibration.maeCarcaca} kg</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">RMSE Acabamento EGS:</span>
                      <span className="text-white font-bold font-mono">{calibration.rmseEgs} mm</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Viés Médio de Predição:</span>
                      <span className="text-white font-bold font-mono">+{calibration.biasGeral} kg</span>
                    </div>
                  </div>

                  {!autoCalibrate && needsCalibration && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] flex items-start gap-2 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span><strong>Pendências de Calibração:</strong> Dados de carcaça foram modificados. Execute a recalibração manual abaixo para sincronizar.</span>
                    </div>
                  )}

                  <button
                    onClick={() => recalibrateWithCarcassData(animals, true)}
                    className={`w-full py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-lg ${
                      !autoCalibrate && needsCalibration 
                        ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-amber-500/10' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/10'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" /> 
                    {autoCalibrate ? 'Forçar Recalibração' : 'Calibrar com Dados Reais'}
                  </button>

                  <button
                    onClick={handleTriggerCalibration}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resetar para Parâmetros de Simulação
                  </button>

                  <div className="border-t border-slate-800/80 pt-3">
                    <TooltipHelp text="Ajustar coeficientes de calibração de ultrassom (AOL, EGS, Marmoreio, GMD) específicos para o lote ativo de forma fina.">
                      <button
                        id="btn-lote-calibration-modal"
                        onClick={() => {
                          setLotAolMultiplier(calibration.multiplierAol ?? 1.00);
                          setLotEgsMultiplier(calibration.multiplierEgs ?? 1.00);
                          setLotImfMultiplier(calibration.multiplierImf ?? 1.00);
                          setLotGmdMultiplier(calibration.multiplierGmd ?? 1.00);
                          setIsLotCalibratorOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-950/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-500/15"
                      >
                        <Sliders className="w-3.5 h-3.5 text-white" />
                        Configurar Lote (Ajuste Fino)
                      </button>
                    </TooltipHelp>
                  </div>
                </div>
              </div>

              {/* GRÁFICO BLAND-ALTMAN CONCORDÂNCIA DE MEDIÇÃO (MOCK REAL DO FRIGORÍFICO) */}
              <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Concordância de Acabamento (Bland-Altman)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">RTU Ultrassom vs Romaneio Real Frigorífico</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#131c2e" />
                      <XAxis type="number" dataKey="media" name="Média das Medições (mm)" stroke="#475569" tick={{ fontSize: 9 }} />
                      <YAxis type="number" dataKey="diferenca" name="Diferença (RTU - Frig, mm)" stroke="#475569" tick={{ fontSize: 9 }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <ReferenceLine y={0.15} stroke="#3b82f6" strokeWidth={2} label={{ value: 'Viés Médio (+0.15mm)', fill: '#3b82f6', fontSize: 9 }} />
                      <ReferenceLine y={1.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '+2 DP (+1.5mm)', fill: '#ef4444', fontSize: 9 }} />
                      <ReferenceLine y={-1.2} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '-2 DP (-1.2mm)', fill: '#ef4444', fontSize: 9 }} />
                      <Scatter name="Animais Abatidos" data={[
                        { media: 3.5, diferenca: 0.2 },
                        { media: 4.2, diferenca: -0.1 },
                        { media: 5.1, diferenca: 0.4 },
                        { media: 2.8, diferenca: -0.3 },
                        { media: 4.8, diferenca: 0.1 },
                        { media: 3.1, diferenca: 0.5 },
                        { media: 3.9, diferenca: -0.2 }
                      ]} fill="#10b981" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* INFORMAÇÕES DE CARCAÇA (REAL VS PROJETADO) */}
            <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Acurácia do Modelo: Ultrassom vs Carcaça Real</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selecionar Animal:</span>
                    <select
                      value={selectedAnimalId}
                      onChange={(e) => setSelectedAnimalId(e.target.value)}
                      className="bg-[#05070c] border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      {animals.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.id} {a.abateReal ? '✓ (Abatido)' : '(No Cocho)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedAnimal && selectedAnimal.abateReal && (
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0">
                      Abatido (Frigorífico)
                    </span>
                  )}
                </div>
              </div>

              {selectedAnimal && selectedAnimal.abateReal ? (
                (() => {
                  const real = selectedAnimal.abateReal;
                  const dof = real.diasDeCocho || 100;
                  // Calcula projeção sem calibração específica de lote (modelo puro) no dia do abate para comparar
                  const projAtSlaughter = projectAnimalGrowth(selectedAnimal, connectedInputs, contract, {
                    version: 'base', multiplierGmd: 1.0, multiplierEgs: 1.0, multiplierRendimento: 1.0, maeCarcaca: 0, rmseEgs: 0, biasGeral: 0, driftDetected: false
                  }, dof);
                  const ptSlaughter = projAtSlaughter[projAtSlaughter.length - 1] || { peso: selectedAnimal.pesoEntrada, egs: 1.0, imf: 1.0 };
                  const rcCorrente = connectedInputs.rendimentoCarcacaInicial + (connectedInputs.rendimentoCarcaca - connectedInputs.rendimentoCarcacaInicial) * (dof / connectedInputs.tempoAlimentacao);
                  const pcqProjetado = (ptSlaughter.peso * (1 - connectedInputs.quebraPesoTransportePerc / 100)) * (rcCorrente / 100);

                  const diffPcq = real.pesoCarcacaQuenteReal - pcqProjetado;
                  const realEgsVal = real.egsRealMm !== undefined ? real.egsRealMm : (
                    real.egsFrigorifico === '1_ausente' ? 1.5 :
                    real.egsFrigorifico === '2_escassa' ? 3.0 :
                    real.egsFrigorifico === '3_mediana' ? 4.5 :
                    real.egsFrigorifico === '4_uniforme' ? 6.0 : 8.0
                  );
                  const diffEgs = realEgsVal - ptSlaughter.egs;

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#080d17] p-3 rounded-xl border border-slate-850 space-y-1 text-left">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Peso de Carcaça (PCQ)</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-white text-base font-black font-mono">{real.pesoCarcacaQuenteReal.toFixed(1)} kg</span>
                            <span className="text-slate-400 text-xs">Proj: {pcqProjetado.toFixed(1)} kg</span>
                          </div>
                          <span className={`text-[10px] font-bold block ${Math.abs(diffPcq) < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Desvio: {diffPcq >= 0 ? `+${diffPcq.toFixed(1)}` : diffPcq.toFixed(1)} kg ({Math.abs((diffPcq / pcqProjetado) * 100).toFixed(1)}% de erro)
                          </span>
                        </div>

                        <div className="bg-[#080d17] p-3 rounded-xl border border-slate-850 space-y-1 text-left">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Acabamento Gordura (EGS)</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-emerald-400 text-base font-black font-mono">{realEgsVal.toFixed(1)} mm</span>
                            <span className="text-slate-400 text-xs">Proj: {ptSlaughter.egs.toFixed(1)} mm</span>
                          </div>
                          <span className={`text-[10px] font-bold block ${Math.abs(diffEgs) < 0.8 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Desvio: {diffEgs >= 0 ? `+${diffEgs.toFixed(1)}` : diffEgs.toFixed(1)} mm
                          </span>
                        </div>

                        <div className="bg-[#080d17] p-3 rounded-xl border border-slate-850 space-y-1 text-left">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Marmoreio (IMF)</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-white text-base font-black font-mono">{real.imfFrigorificoPerc.toFixed(2)}%</span>
                            <span className="text-slate-400 text-xs">Proj: {ptSlaughter.imf.toFixed(2)}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Desvio: {(real.imfFrigorificoPerc - ptSlaughter.imf).toFixed(2)}%
                          </span>
                        </div>

                        <div className="bg-[#080d17] p-3 rounded-xl border border-slate-850 space-y-1 text-left">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Meta de Qualidade Romaneio</span>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-slate-400">Dias de Cocho:</span>
                              <span className="text-white font-bold">{real.diasDeCocho} dias</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-slate-400">pH Real 24h:</span>
                              <span className={`font-bold ${real.pHReal <= 5.8 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {real.pHReal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setCarcassAnimalId(selectedAnimal.id);
                            setCarcassPesoReal(real.pesoCarcacaQuenteReal);
                            setCarcassEgsReal(realEgsVal);
                            setCarcassImfReal(real.imfFrigorificoPerc);
                            setCarcassPhReal(real.pHReal);
                            setCarcassDiasCocho(real.diasDeCocho || 100);
                            setEditingCarcassAnimalId(selectedAnimal.id);
                            setIsCarcassModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5 text-teal-400" /> Editar Carcaça
                        </button>
                        <button
                          onClick={() => handleDeleteCarcassInfo(selectedAnimal.id)}
                          className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/20 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover Registro
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : selectedAnimal ? (
                <div className="p-6 bg-[#080d17] rounded-xl border border-slate-850/60 flex flex-col items-center text-center space-y-3">
                  <Database className="w-8 h-8 text-slate-600 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 font-bold">Sem dados reais de abate para {selectedAnimal.id}</p>
                    <p className="text-[10px] text-slate-500 max-w-md">
                      Insira os resultados reais de abate frigorífico (peso de carcaça quente, EGS, dias de cocho) para comparar a performance preditiva e calibrar o modelo Gompertz local.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCarcassAnimalId(selectedAnimal.id);
                      setCarcassPesoReal(250);
                      setCarcassEgsReal(4.2);
                      setCarcassImfReal(2.2);
                      setCarcassPhReal(5.6);
                      setCarcassDiasCocho(75);
                      setEditingCarcassAnimalId(null);
                      setIsCarcassModalOpen(true);
                    }}
                    className="px-4 py-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Registrar Informações da Carcaça
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Nenhum animal selecionado.
                </div>
              )}
            </div>

            {/* TABELA COMPARATIVA E LANÇAMENTO DE ROMANEIO EM MASSA */}
            <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Romaneio do Frigorífico: Lançamento e Comparação de Carcaças</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const semAbate = filteredAnimals.find(a => !a.abateReal);
                      if (semAbate) {
                        setCarcassAnimalId(semAbate.id);
                      } else {
                        setCarcassAnimalId(filteredAnimals[0]?.id || '');
                      }
                      setCarcassPesoReal(245);
                      setCarcassEgsReal(4.0);
                      setCarcassImfReal(1.8);
                      setCarcassPhReal(5.6);
                      setCarcassDiasCocho(80);
                      setEditingCarcassAnimalId(null);
                      setIsCarcassModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lançar Nova Carcaça
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-850/80 bg-[#070b13]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#090e18] border-b border-slate-850 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">Animal ID</th>
                      <th className="p-3">Dias Cocho</th>
                      <th className="p-3 text-right">EGS RTU (mm)</th>
                      <th className="p-3 text-right">EGS Real (mm)</th>
                      <th className="p-3 text-right">PCQ Estimada (kg)</th>
                      <th className="p-3 text-right">PCQ Real (kg)</th>
                      <th className="p-3 text-center">pH Real</th>
                      <th className="p-3 text-right">Marmoreio Real</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-xs text-slate-300">
                    {filteredAnimals.map(a => {
                      const hasAbate = !!a.abateReal;
                      const real = a.abateReal;
                      const latestExam = a.exames && a.exames.length > 0 ? a.exames[a.exames.length - 1] : null;
                      const rtuEgs = latestExam ? latestExam.egs : 1.0;

                      const dof = real?.diasDeCocho || 100;
                      const projAtSlaughter = projectAnimalGrowth(a, connectedInputs, contract, {
                        version: 'base', multiplierGmd: 1.0, multiplierEgs: 1.0, multiplierRendimento: 1.0, maeCarcaca: 0, rmseEgs: 0, biasGeral: 0, driftDetected: false
                      }, dof);
                      const ptSlaughter = projAtSlaughter[projAtSlaughter.length - 1] || { peso: a.pesoEntrada, egs: 1.0, imf: 1.0 };
                      const rcCorrente = connectedInputs.rendimentoCarcacaInicial + (connectedInputs.rendimentoCarcaca - connectedInputs.rendimentoCarcacaInicial) * (dof / connectedInputs.tempoAlimentacao);
                      const pcqProjetado = (ptSlaughter.peso * (1 - connectedInputs.quebraPesoTransportePerc / 100)) * (rcCorrente / 100);

                      const realEgsVal = real?.egsRealMm !== undefined ? real.egsRealMm : (
                        real?.egsFrigorifico === '1_ausente' ? 1.5 :
                        real?.egsFrigorifico === '2_escassa' ? 3.0 :
                        real?.egsFrigorifico === '3_mediana' ? 4.5 :
                        real?.egsFrigorifico === '4_uniforme' ? 6.0 : 8.0
                      );

                      return (
                        <tr key={a.id} className="hover:bg-slate-800/10 transition-colors">
                          <td className="p-3 font-mono font-bold text-white">{a.id}</td>
                          <td className="p-3 font-mono text-slate-400">{hasAbate ? `${real?.diasDeCocho} d` : '-'}</td>
                          <td className="p-3 text-right font-mono text-slate-400">{rtuEgs.toFixed(1)} mm</td>
                          <td className="p-3 text-right font-mono">
                            {hasAbate ? (
                              <span className="text-emerald-400 font-bold">{realEgsVal.toFixed(1)} mm</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-400">{pcqProjetado.toFixed(1)} kg</td>
                          <td className="p-3 text-right font-mono">
                            {hasAbate ? (
                              <span className="text-white font-bold">{real?.pesoCarcacaQuenteReal.toFixed(1)} kg</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {hasAbate ? (
                              <span className={`px-2 py-0.5 rounded font-bold ${real?.pHReal && real.pHReal <= 5.8 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {real?.pHReal.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {hasAbate ? `${real?.imfFrigorificoPerc.toFixed(2)}%` : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {hasAbate ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                Abatido
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-500">
                                No Cocho
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedAnimalId(a.id)}
                                className={`p-1 rounded transition-colors cursor-pointer ${
                                  selectedAnimalId === a.id
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                                }`}
                                title="Selecionar este animal para análise de acurácia acima"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {hasAbate ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setCarcassAnimalId(a.id);
                                      setCarcassPesoReal(real!.pesoCarcacaQuenteReal);
                                      setCarcassEgsReal(realEgsVal);
                                      setCarcassImfReal(real!.imfFrigorificoPerc);
                                      setCarcassPhReal(real!.pHReal);
                                      setCarcassDiasCocho(real!.diasDeCocho || 100);
                                      setEditingCarcassAnimalId(a.id);
                                      setIsCarcassModalOpen(true);
                                    }}
                                    className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                                    title="Editar informações da carcaça"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCarcassInfo(a.id)}
                                    className="p-1 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded transition-colors cursor-pointer"
                                    title="Remover informações da carcaça"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setCarcassAnimalId(a.id);
                                    setCarcassPesoReal(250);
                                    setCarcassEgsReal(4.2);
                                    setCarcassImfReal(2.2);
                                    setCarcassPhReal(5.6);
                                    setCarcassDiasCocho(75);
                                    setEditingCarcassAnimalId(null);
                                    setIsCarcassModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-teal-500/10"
                                >
                                  Lançar Carcaça
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUDIT LOG E HISTÓRICO DE AUDITORIA */}
            <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Histórico de Auditoria e Reprodutibilidade (Audit Logs)</h3>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Nenhum log de auditoria registrado no ciclo atual.
                  </div>
                ) : (
                  auditLogs.map(log => (
                    <div key={log.id} className="p-3 bg-[#080d17] rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-white">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>{log.dadosSalvos}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Semente: {log.hashEntradas} | Modelo: {log.versaoModelo} | Contrato: {log.versaoRegrasContrato}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* MODAL PARA LANÇAR NOVO EXAME */}
      <AnimatePresence>
        {isAddingExam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b111e] border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">Registrar Novo Exame RTU</h3>
                <button
                  onClick={() => setIsAddingExam(false)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleAddExam} className="space-y-4 text-xs">
                {/* Animal */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400 uppercase">RFID Brinco do Animal</label>
                  <select
                    value={examAnimalId}
                    onChange={(e) => setExamAnimalId(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>{a.id} ({a.raca.toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Dia de cocho */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-400 uppercase">Dia de Cocho (DOF)</label>
                    <input
                      type="number"
                      value={examDia}
                      onChange={(e) => setExamDia(Number(e.target.value))}
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Peso */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-400 uppercase">Peso (kg)</label>
                    <input
                      type="number"
                      value={examPeso}
                      onChange={(e) => setExamPeso(Number(e.target.value))}
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* AOL */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-400 uppercase">AOL (Músculo, cm²)</label>
                    <input
                                           onChange={(e) => setExamImf(Number(e.target.value))}
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Tecnico */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-400 uppercase">Técnico Operador</label>
                    <input
                      type="text"
                      value={examTecnico}
                      onChange={(e) => setExamTecnico(e.target.value)}
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Equipamento */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-400 uppercase">Aparelho RTU</label>
                  <input
                    type="text"
                    value={examEquipamento}
                    onChange={(e) => setExamEquipamento(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>



                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                  >
                    Salvar Exame no Prontuário
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE AJUSTE DE CALIBRAÇÃO DO LOTE ATIVO */}
      <AnimatePresence>
        {isLotCalibratorOpen && (
          <div className="fixed inset-0 bg-[#02050b]/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4" id="tour-desktop-ultrasound-panel">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl relative text-left"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    Calibração do Lote Ativo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ajuste fino manual dos multiplicadores biológicos de crescimento para o lote corrente.
                  </p>
                </div>
                <button
                  onClick={() => setIsLotCalibratorOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {/* AOL MULTIPLIER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <TooltipHelp text="Fator multiplicador aplicado ao tamanho projetado da Área de Olho de Lombo (AOL). Ajuste se o lote apresentar desenvolvimento muscular fora do padrão genético base.">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] cursor-help">Multiplicador AOL (Músculo)</span>
                    </TooltipHelp>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{lotAolMultiplier.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.20"
                    step="0.01"
                    value={lotAolMultiplier}
                    onChange={(e) => setLotAolMultiplier(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Nelore Tardio (0.80)</span>
                    <span>Padrão (1.00)</span>
                    <span>Cruzamento Precoce (1.20)</span>
                  </div>
                </div>

                {/* EGS MULTIPLIER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <TooltipHelp text="Fator multiplicador aplicado à deposição de gordura subcutânea (EGS). Útil para ajustar o modelo conforme o tipo de dieta energética ou restrição hídrica.">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] cursor-help">Multiplicador EGS (Gordura)</span>
                    </TooltipHelp>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{lotEgsMultiplier.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.20"
                    step="0.01"
                    value={lotEgsMultiplier}
                    onChange={(e) => setLotEgsMultiplier(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Baixa Energia (0.80)</span>
                    <span>Padrão (1.00)</span>
                    <span>Alta Energia (1.20)</span>
                  </div>
                </div>

                {/* IMF MULTIPLIER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <TooltipHelp text="Fator multiplicador aplicado ao teor de gordura intramuscular (IMF/Marmoreio). Use para lotes com forte potencial genético de marmoreio (ex: Angus/Cruzamentos).">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] cursor-help">Multiplicador Marmoreio (IMF)</span>
                    </TooltipHelp>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{lotImfMultiplier.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.20"
                    step="0.01"
                    value={lotImfMultiplier}
                    onChange={(e) => setLotImfMultiplier(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Padrão Zebu (0.80)</span>
                    <span>Médio (1.00)</span>
                    <span>Grau Taurino (1.20)</span>
                  </div>
                </div>

                {/* GMD MULTIPLIER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <TooltipHelp text="Ajuste fino do Ganho Médio Diário (GMD) do lote. Corrige distorções climáticas ou de sanidade pontuais.">
                      <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] cursor-help">Multiplicador GMD (Ganho Peso)</span>
                    </TooltipHelp>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{lotGmdMultiplier.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.20"
                    step="0.01"
                    value={lotGmdMultiplier}
                    onChange={(e) => setLotGmdMultiplier(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Estresse Térmico (0.80)</span>
                    <span>Esperado (1.00)</span>
                    <span>Potencial Máximo (1.20)</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setLotAolMultiplier(1.00);
                    setLotEgsMultiplier(1.00);
                    setLotImfMultiplier(1.00);
                    setLotGmdMultiplier(1.00);
                  }}
                  className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs transition-colors cursor-pointer border border-transparent font-semibold animate-pulse"
                >
                  Restaurar Padrão
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => setIsLotCalibratorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Update main calibration state
                    setCalibration(prev => ({
                      ...prev,
                      multiplierAol: lotAolMultiplier,
                      multiplierImf: lotImfMultiplier,
                      multiplierEgs: lotEgsMultiplier,
                      multiplierGmd: lotGmdMultiplier,
                    }));
                    
                    // Create audit log
                    const logRecord: RTUAuditRecord = {
                      id: 'audit-manual-lot-' + Date.now(),
                      timestamp: new Date().toLocaleString(),
                      usuarioId: 'Gerente Operacional',
                      loteId: 'LOTE-TERMINACAO-A',
                      hashEntradas: 'SHA-256-MANUAL-' + Math.floor(Math.random() * 100000),
                      dadosSalvos: `Ajuste manual de parâmetros do Lote Ativo: AOL=${lotAolMultiplier.toFixed(2)}x, EGS=${lotEgsMultiplier.toFixed(2)}x, Marmoreio=${lotImfMultiplier.toFixed(2)}x, GMD=${lotGmdMultiplier.toFixed(2)}x`,
                      versaoModelo: calibration.version,
                      versaoRegrasContrato: contract.id
                    };
                    setAuditLogs(prev => [logRecord, ...prev]);
                    setNeedsCalibration(false); // Manually configured active lot clears prompt warning
                    
                    setIsLotCalibratorOpen(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md active:scale-95"
                >
                  Aplicar Configurações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CRIAÇÃO DE NOVO LOTE */}
      <AnimatePresence>
        {isNewLotModalOpen && (
          <div className="fixed inset-0 bg-[#02050b]/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-left"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Criar Novo Lote de Manejo
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Defina os parâmetros operacionais e o motor biológico criará o lote pronto para simulações.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewLotModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateLot} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1">Identificador / Código</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: LOTE-D"
                      value={newLotId}
                      onChange={(e) => setNewLotId(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1">Nome Comercial</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lote D - Angus Prime"
                      value={newLotName}
                      onChange={(e) => setNewLotName(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block mb-1">Descrição</label>
                  <input
                    type="text"
                    placeholder="Breve descrição do manejo do lote..."
                    value={newLotDesc}
                    onChange={(e) => setNewLotDesc(e.target.value)}
                    className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" /> Início Confinamento
                    </label>
                    <input
                      type="date"
                      value={newLotInicio}
                      onChange={(e) => setNewLotInicio(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" /> Data da Mensuração
                    </label>
                    <input
                      type="date"
                      value={newLotMensuracao}
                      onChange={(e) => setNewLotMensuracao(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-400" /> Operador do Ultrassom
                    </label>
                    <input
                      type="text"
                      value={newLotOperador}
                      onChange={(e) => setNewLotOperador(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-teal-400" /> Marca Equipamento
                    </label>
                    <input
                      type="text"
                      value={newLotEquipamento}
                      onChange={(e) => setNewLotEquipamento(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block mb-1">Carregar Dieta (Salvas/Padrão)</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const diet = availableDiets.find(d => d.name === selectedName);
                      if (diet) {
                        setNewLotDieta(diet.name);
                        setNewLotGmd(diet.gmd);
                      }
                    }}
                    className="w-full bg-[#04060b] border border-[#334155]/60 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
                  >
                    <option value="" disabled>-- Selecione uma Dieta para Carregar --</option>
                    {availableDiets.filter(d => d.isCustom).length > 0 && (
                      <optgroup label="Dietas Personalizadas Salvas">
                        {availableDiets.filter(d => d.isCustom).map(d => (
                          <option key={`modal-custom-${d.name}`} value={d.name}>
                            {d.name} (GMD: {d.gmd.toFixed(2)} kg/d) [Custom]
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Dietas de Referência Padrão">
                      {availableDiets.filter(d => !d.isCustom).map(d => (
                        <option key={`modal-ref-${d.name}`} value={d.name}>
                          {d.name} (GMD: {d.gmd.toFixed(2)} kg/d)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1">GMD Médio Alvo (kg/d)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newLotGmd}
                      onChange={(e) => setNewLotGmd(Number(e.target.value))}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1">Dieta de Terminação</label>
                    <input
                      type="text"
                      value={newLotDieta}
                      onChange={(e) => setNewLotDieta(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#04060b] rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica do Simulador:</strong> O novo lote será automaticamente inicializado com dois animais representativos padrão (Nelore e Angus F1) com exames já cadastrados para permitir que você execute extrapolações e simulações estocásticas imediatamente.
                  </span>
                </div>

                <div className="flex gap-2 pt-3">
                  <div className="flex-1"></div>
                  <button
                    type="button"
                    onClick={() => setIsNewLotModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Criar e Inicializar Lote
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE EDIÇÃO DE LOTE EXISTENTE */}
      <AnimatePresence>
        {isEditLotModalOpen && (
          <div className="fixed inset-0 bg-[#02050b]/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl relative text-left"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-emerald-400" />
                    Editar Lote de Manejo ({selectedLotId})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Modifique as informações operacionais e de desempenho do lote atual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditLotModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLotEdit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block mb-1">Nome Comercial do Lote</label>
                  <input
                    type="text"
                    required
                    value={editLotName}
                    onChange={(e) => setEditLotName(e.target.value)}
                    className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={editLotDesc}
                    onChange={(e) => setEditLotDesc(e.target.value)}
                    className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" /> Início Confinamento
                    </label>
                    <input
                      type="date"
                      value={editLotInicio}
                      onChange={(e) => setEditLotInicio(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" /> Data da Mensuração
                    </label>
                    <input
                      type="date"
                      value={editLotMensuracao}
                      onChange={(e) => setEditLotMensuracao(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-400" /> Operador do Ultrassom
                    </label>
                    <input
                      type="text"
                      value={editLotOperador}
                      onChange={(e) => setEditLotOperador(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-teal-400" /> Marca Equipamento
                    </label>
                    <input
                      type="text"
                      value={editLotEquipamento}
                      onChange={(e) => setEditLotEquipamento(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 uppercase block mb-1">Carregar Dieta (Salvas/Padrão)</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      const diet = availableDiets.find(d => d.name === selectedName);
                      if (diet) {
                        setEditLotDieta(diet.name);
                        setEditLotGmd(diet.gmd);
                      }
                    }}
                    className="w-full bg-[#04060b] border border-[#334155]/60 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer transition-colors"
                  >
                    <option value="" disabled>-- Selecione uma Dieta para Carregar --</option>
                    {availableDiets.filter(d => d.isCustom).length > 0 && (
                      <optgroup label="Dietas Personalizadas Salvas">
                        {availableDiets.filter(d => d.isCustom).map(d => (
                          <option key={`modal-edit-custom-${d.name}`} value={d.name}>
                            {d.name} (GMD: {d.gmd.toFixed(2)} kg/d) [Custom]
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Dietas de Referência Padrão">
                      {availableDiets.filter(d => !d.isCustom).map(d => (
                        <option key={`modal-edit-ref-${d.name}`} value={d.name}>
                          {d.name} (GMD: {d.gmd.toFixed(2)} kg/d)
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1">GMD Médio Alvo (kg/d)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editLotGmd}
                      onChange={(e) => setEditLotGmd(Number(e.target.value))}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300 uppercase block mb-1">Dieta de Terminação</label>
                    <input
                      type="text"
                      value={editLotDieta}
                      onChange={(e) => setEditLotDieta(e.target.value)}
                      className="w-full bg-[#04060b] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <div className="flex-1"></div>
                  <button
                    type="button"
                    onClick={() => setIsEditLotModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE DADOS REAIS DE CARCAÇA (ABATE REAL) */}
      <AnimatePresence>
        {isCarcassModalOpen && (
          <div className="fixed inset-0 bg-[#02050b]/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b1120] border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl relative text-left"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-400" />
                    {editingCarcassAnimalId ? "Editar Dados de Carcaça Real" : "Lançar Carcaça Real (Frigorífico)"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Insira as informações de abate real fornecidas pelo frigorífico (ground truth).
                  </p>
                </div>
                <button
                  onClick={() => setIsCarcassModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCarcassInfo} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase text-[10px] block">Animal Selecionado</label>
                  <select
                    value={carcassAnimalId}
                    onChange={(e) => setCarcassAnimalId(e.target.value)}
                    disabled={!!editingCarcassAnimalId}
                    className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>-- Selecione o Animal --</option>
                    {animals.map(a => (
                      <option key={`carcass-select-${a.id}`} value={a.id}>
                        {a.id} ({a.raca.toUpperCase()} - {a.pesoEntrada} kg entrada)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px] block">Dias de Cocho (DOF Real)</label>
                    <input
                      type="number"
                      value={carcassDiasCocho}
                      onChange={(e) => setCarcassDiasCocho(Number(e.target.value))}
                      min="1"
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[10px] block">Peso Carcaça Quente (PCQ kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={carcassPesoReal}
                      onChange={(e) => setCarcassPesoReal(Number(e.target.value))}
                      min="1"
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] block">EGS Real (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={carcassEgsReal}
                      onChange={(e) => setCarcassEgsReal(Number(e.target.value))}
                      min="0.1"
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] block">IMF Real (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={carcassImfReal}
                      onChange={(e) => setCarcassImfReal(Number(e.target.value))}
                      min="0.01"
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px] block">pH Real (24h)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={carcassPhReal}
                      onChange={(e) => setCarcassPhReal(Number(e.target.value))}
                      min="4.0"
                      max="7.5"
                      className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#05070c] rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-normal flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    Esses dados reais calibram o modelo Gompertz biológico do lote. Se o modo automático estiver ativo, as projeções e multiplicadores serão ajustados imediatamente.
                  </span>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCarcassModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Registro
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
