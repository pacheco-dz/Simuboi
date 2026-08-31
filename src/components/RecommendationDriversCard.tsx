import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Scale,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  CheckCircle2,
  Zap,
  Calculator,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SimulationInputs } from '../types';
import {
  RTUAnimal,
  RTUContractRule,
  RTUModelCalibration
} from '../services/ultrasoundSlaughterService';

interface RecommendationDriversCardProps {
  animal: RTUAnimal;
  projection: {
    dia: number;
    peso: number;
    aol: number;
    egs: number;
    imf: number;
    lucro: number;
    classificacao: string;
  }[];
  lhsResult: {
    tEstrelaDeterminista: number;
    tEstrelaRobusto: number;
    lucroMedioPorDia: Record<number, number>;
    probabilidadePrejuizo: Record<number, number>;
    var95?: Record<number, number>;
    cvar95?: Record<number, number>;
  } | null;
  contract: RTUContractRule;
  inputs: SimulationInputs;
  calibration: RTUModelCalibration;
  riskTolerance: number;
  isLot?: boolean;
}

// Reusable TooltipHelp component following app standards
const TooltipHelp: React.FC<{ 
  text: string; 
  children: React.ReactNode; 
  className?: string;
  placement?: 'top' | 'bottom';
  widthClass?: string;
}> = ({ text, children, className, placement = 'top', widthClass = 'w-56' }) => {
  const popupClasses = placement === 'top'
    ? "absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5"
    : "absolute top-full left-1/2 -translate-x-1/2 mt-2.5";
  
  const arrowClasses = placement === 'top'
    ? "absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0b0f19]"
    : "absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0b0f19]";

  return (
    <div className={`group relative hover:z-[999999] ${className || 'inline-block'}`}>
      {children}
      <div className={`${popupClasses} ${widthClass} p-2.5 bg-[#0b0f19] text-slate-200 text-[10px] font-normal leading-normal rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[999999] shadow-2xl border border-slate-800 text-center font-sans normal-case tracking-normal`}>
        {text}
        <div className={arrowClasses}></div>
      </div>
    </div>
  );
};

export const RecommendationDriversCard: React.FC<RecommendationDriversCardProps> = ({
  animal,
  projection,
  lhsResult,
  contract,
  inputs,
  calibration,
  riskTolerance,
  isLot = false
}) => {
  const [showFormulas, setShowFormulas] = useState(false);

  // 1. Determina o dia atual / último exame de ultrassom
  const maxExamDia = animal.exames && animal.exames.length > 0
    ? Math.max(...animal.exames.map(ex => ex.diaDeCocho))
    : 0;

  // Arredonda para o passo de 5 dias mais próximo existente na projeção
  const currentDia = Math.round(maxExamDia / 5) * 5;

  // Ponto da projeção no dia atual
  const pointHoje = projection.find(p => p.dia === currentDia) || projection[0] || {
    dia: currentDia,
    peso: animal.pesoEntrada,
    aol: 50,
    egs: 1.5,
    imf: 1.0,
    lucro: 0,
    classificacao: '2_escassa'
  };

  // Ponto Determinístico
  const tEstrelaDet = lhsResult?.tEstrelaDeterminista ?? 100;
  const pointDet = projection.find(p => p.dia === tEstrelaDet) || projection[0] || pointHoje;

  // Ponto Robusto (Recomendado)
  const tEstrelaRob = lhsResult?.tEstrelaRobusto ?? 90;
  const pointRob = projection.find(p => p.dia === tEstrelaRob) || projection[0] || pointHoje;

  // 2. Métricas dos 3 Cenários
  const lucroHoje = pointHoje.lucro;
  const probHoje = lhsResult?.probabilidadePrejuizo[currentDia] ?? lhsResult?.probabilidadePrejuizo[Math.round(currentDia / 10) * 10] ?? 0;

  const lucroDet = pointDet.lucro;
  const probDet = lhsResult?.probabilidadePrejuizo[tEstrelaDet] ?? 0;

  const lucroRob = pointRob.lucro;
  const probRob = lhsResult?.probabilidadePrejuizo[tEstrelaRob] ?? 0;

  const diferencialLucro = lucroRob - lucroHoje;
  const diasAteOtimo = Math.max(0, tEstrelaRob - currentDia);

  // 3. Cálculos Biológicos e Contratuais no Ponto Robusto
  const egsRob = pointRob.egs;
  const classificacaoRob = pointRob.classificacao;
  const regraEgs = contract.gradeAcabamentoEGS.find(r => r.categoria === classificacaoRob);

  // Mapeamento de Categoria EGS
  const egsCategoryMap: Record<string, { label: string; badge: string; desc: string }> = {
    '1_ausente': {
      label: 'Ausente (< 1,0mm)',
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      desc: 'Penalização por gordura insuficiente na carcaça.'
    },
    '2_escassa': {
      label: 'Escassa (1,0 a 2,9mm)',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      desc: 'Acabamento limítrofe. Risco de resfriamento prematuro da carne.'
    },
    '3_mediana': {
      label: 'Mediana (3,0 a 5,9mm)',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      desc: 'Acabamento padrão frigorífico exigido no mercado nacional.'
    },
    '4_uniforme': {
      label: 'Uniforme (6,0 a 10,0mm)',
      badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      desc: 'Acabamento premium de alta proteção térmica no resfriamento.'
    },
    '5_excessiva': {
      label: 'Excessiva (> 10,0mm)',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      desc: 'Gordura excessiva ("limpeza de canal") sujeita a deságio.'
    }
  };

  const currentCategoryInfo = egsCategoryMap[classificacaoRob] || egsCategoryMap['3_mediana'];

  // Impacto Financeiro da EGS no Contrato (R$/@)
  let egsFinanceImpactText = 'R$ 0,00/@ (Sem Bônus/Penalidade)';
  let isEgsBonus = false;
  let isEgsPenalty = false;

  if (regraEgs) {
    if (regraEgs.bonificacaoMoeda > 0) {
      egsFinanceImpactText = `+R$ ${regraEgs.bonificacaoMoeda.toFixed(2)}/@ (Bônus Contratual)`;
      isEgsBonus = true;
    } else if (regraEgs.penalizacaoMoeda > 0) {
      egsFinanceImpactText = `-R$ ${regraEgs.penalizacaoMoeda.toFixed(2)}/@ (Deságio por Acabamento)`;
      isEgsPenalty = true;
    }
  }

  // 4. Rendimento e Peso de Carcaça Quente (PCQ) no Ponto Robusto
  const tEfetivo = Math.min(tEstrelaRob, inputs.tempoAlimentacao * 1.25);
  const rcCalc = inputs.rendimentoCarcacaInicial + (inputs.rendimentoCarcaca - inputs.rendimentoCarcacaInicial) * (tEfetivo / inputs.tempoAlimentacao);
  const rcCorrente = Math.min(Math.max(inputs.rendimentoCarcaca, 58.5), rcCalc) * calibration.multiplierRendimento;
  const pesoVivoFinal = pointRob.peso * (1 - inputs.quebraPesoTransportePerc / 100);
  const pcqKg = pesoVivoFinal * (rcCorrente / 100);
  const pcqArrobas = pcqKg / 15;

  const isCarcacaLeve = pcqKg < contract.pesoMinCarcacaKg;
  const isCarcacaPesada = pcqKg > contract.pesoMaxCarcacaKg;

  // 5. Eficiência Alimentar Marginal
  const custoRacaoDia = (inputs.cmsVolumoso * inputs.precoVolumoso) + (inputs.cmsConcentrado * inputs.precoConcentrado);
  const custoFixoDia = (inputs.proLaboreMes + inputs.energiaEletricaMes + inputs.segurosMes + inputs.reparosManutencaoMes + inputs.assistenciaTecnicaMes) / (inputs.capacidadeEstatica * 30);
  const custoTotalDia = custoRacaoDia + custoFixoDia;

  const gmdMarginal = inputs.gmd * calibration.multiplierGmd * Math.max(0.65, 1 - 0.0011 * tEstrelaRob);
  const custoKgGanho = custoTotalDia / Math.max(0.1, gmdMarginal);
  const receitaKgGanho = (rcCorrente / 100) * (contract.basePrecoArroba / 15);

  return (
    <div className="bg-[#111625] p-5 rounded-2xl border border-slate-850 space-y-5 text-left">
      {/* HEADER DO CARD DE DRIVERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/10 shrink-0">
            <Award className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Drivers de Recomendação e Explicabilidade
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                Modelo Biológico-Econômico RTU
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {isLot
                ? 'Transparência decisória: decomposição dos fatores biológicos, contratuais e estocásticos consolidados do lote.'
                : 'Transparência decisória: decomposição dos fatores biológicos, contratuais e estocásticos do animal.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-400" />
            <span>{showFormulas ? 'Ocultar Equações' : 'Ver Equações'}</span>
            {showFormulas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* MATRIX DE DECISÃO: COMPARATIVO DE 3 JANELAS DE ABATE */}
      <div className="space-y-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-sans flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Matriz de Decisão por Janela de Abate
            <TooltipHelp text={isLot ? "Comparativo bioeconômico para o lote entre abate imediato (Estágio Atual), pico de lucro teórico (Determinístico) e a janela estocástica de menor risco (Robusto)." : "Comparativo bioeconômico entre abate imediato (Estágio Atual), pico de lucro teórico (Determinístico) e a janela estocástica de menor risco (Robusto)."} widthClass="w-64">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
            </TooltipHelp>
          </span>
          {diferencialLucro > 0 && (
            <TooltipHelp text={isLot ? "Ganho financeiro incremental médio estimado por cabeça no lote ao adotar a recomendação de Janela Ótima Robusta." : "Ganho financeiro incremental estimado por animal ao adotar a recomendação de Janela Ótima Robusta."} widthClass="w-60">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono cursor-help">
                {isLot ? `Ganho Potencial Médio: +R$ ${diferencialLucro.toFixed(2)}/cab` : `Ganho Potencial: +R$ ${diferencialLucro.toFixed(2)}/cab`}
              </span>
            </TooltipHelp>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* OPCÂO 1: HOJE / ESTÁGIO ATUAL */}
          <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800/80 space-y-2 relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                Estágio Atual
                <span className="text-[10px] font-mono font-black text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  Dia {currentDia}
                </span>
                <TooltipHelp text="Resultado projetado caso o animal seja abatido imediatamente na data do último exame de ultrassom." widthClass="w-56">
                  <Info className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-pointer" />
                </TooltipHelp>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                Ponto de Partida
              </span>
            </div>
            <div className="space-y-1">
              <TooltipHelp text="Lucro líquido por cabeça acumulado até o dia de hoje." widthClass="w-52">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block cursor-help">Lucro Projetado</span>
              </TooltipHelp>
              <p className="text-base font-black font-mono text-slate-200">
                R$ {lucroHoje.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-400 border-t border-slate-850">
              <div>
                <TooltipHelp text="Probabilidade estatística de apresentar margem líquida negativa no dia atual." widthClass="w-52">
                  <span className="text-[8px] text-slate-500 block uppercase cursor-help">Risco Prejuízo</span>
                </TooltipHelp>
                <span className={`font-mono font-bold ${probHoje > riskTolerance * 100 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {probHoje.toFixed(1)}%
                </span>
              </div>
              <div>
                <TooltipHelp text="Espessura de Gordura Subcutânea estimada para o dia atual." widthClass="w-52">
                  <span className="text-[8px] text-slate-500 block uppercase cursor-help">EGS Estimada</span>
                </TooltipHelp>
                <span className="font-mono text-slate-300 font-bold">{pointHoje.egs.toFixed(2)} mm</span>
              </div>
            </div>
          </div>

          {/* OPCÂO 2: DETERMINÍSTICO */}
          <div className="bg-[#080d17] p-3.5 rounded-xl border border-slate-800/80 space-y-2 relative">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-sans flex items-center gap-1">
                Determinístico
                <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Dia {tEstrelaDet}
                </span>
                <TooltipHelp text="Ponto de Lucro Teto Absoluto (onde receita marginal = custo marginal). NÃO é fixado pelo peso alvo do usuário, mas pela otimização matemática contínua." widthClass="w-64">
                  <Info className="w-3 h-3 text-slate-500 hover:text-slate-300 cursor-pointer" />
                </TooltipHelp>
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Lucro Máx. Padrão
              </span>
            </div>
            <div className="space-y-1">
              <TooltipHelp text="Lucro líquido máximo absoluto obtido no pico da curva de ganho de carcaça e bônus alimentar." widthClass="w-60">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block cursor-help">Lucro Teto Estimado</span>
              </TooltipHelp>
              <p className="text-base font-black font-mono text-amber-300">
                R$ {lucroDet.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-400 border-t border-slate-850">
              <div>
                <TooltipHelp text="Risco de prejuízo no ponto de lucro teto. Se alto, recomenda-se a Janela Ótima Robusta." widthClass="w-56">
                  <span className="text-[8px] text-slate-500 block uppercase cursor-help">Risco Prejuízo</span>
                </TooltipHelp>
                <span className={`font-mono font-bold ${probDet > riskTolerance * 100 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {probDet.toFixed(1)}%
                </span>
              </div>
              <div>
                <TooltipHelp text="Espessura de Gordura Subcutânea projetada no dia de Lucro Teto Determinístico." widthClass="w-56">
                  <span className="text-[8px] text-slate-500 block uppercase cursor-help">EGS Projetada</span>
                </TooltipHelp>
                <span className="font-mono text-slate-300 font-bold">{pointDet.egs.toFixed(2)} mm</span>
              </div>
            </div>
          </div>

          {/* OPCÂO 3: ROBUSTO (RECOMENDADO) */}
          <div className="bg-gradient-to-br from-[#0c241d] to-[#081713] p-3.5 rounded-xl border border-emerald-500/40 space-y-2 relative shadow-lg shadow-emerald-950/40">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-sans flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                Janela Ótima
                <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                  Dia {tEstrelaRob}
                </span>
                <TooltipHelp text="Janela inteligente recomendada via simulação estocástica LHS. Protege a margem financeira contra oscilações de mercado e variabilidade do lote." widthClass="w-64">
                  <Info className="w-3 h-3 text-emerald-400/80 hover:text-emerald-200 cursor-pointer" />
                </TooltipHelp>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Recomendação Inteligente
              </span>
            </div>
            <div className="space-y-1">
              <TooltipHelp text="Lucro líquido ajustado para incerteza, garantindo máxima segurança contra margens negativas." widthClass="w-60">
                <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider block cursor-help">Lucro Robusto Ajustado</span>
              </TooltipHelp>
              <p className="text-base font-black font-mono text-emerald-400">
                R$ {lucroRob.toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-300 border-t border-emerald-500/20">
              <div>
                <TooltipHelp text="Nível de risco de prejuízo mantido com segurança abaixo do limite de tolerância estipulado." widthClass="w-56">
                  <span className="text-[8px] text-emerald-400/80 block uppercase cursor-help">Risco Prejuízo</span>
                </TooltipHelp>
                <span className="font-mono font-bold text-teal-300">
                  {probRob.toFixed(1)}% (Seguro)
                </span>
              </div>
              <div>
                <TooltipHelp text="Espessura de Gordura Subcutânea projetada no dia da Janela Ótima de abate." widthClass="w-56">
                  <span className="text-[8px] text-emerald-400/80 block uppercase cursor-help">EGS Projetada</span>
                </TooltipHelp>
                <span className="font-mono text-emerald-300 font-bold">{pointRob.egs.toFixed(2)} mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DRIVERS DE DECISÃO BIOLÓGICA & ECONÔMICA */}
      <div className="space-y-4 pt-3 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              Fatores Determinantes da Recomendação Biológica
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            Detalhamento dos vetores biológicos, contratuais e estocásticos da tomada de decisão
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DRIVER 1: EGS & CONTRATO */}
          <div className="bg-[#080d17] p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white font-sans">Acabamento de Gordura (EGS)</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${currentCategoryInfo.badge}`}>
                  {currentCategoryInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                A gordura subcutânea projetada atinge <strong className="text-emerald-400 font-bold">{egsRob.toFixed(2)} mm</strong> no <strong className="text-emerald-400 font-extrabold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 font-mono">Dia {tEstrelaRob}</strong>. Isto posiciona a carcaça na classificação de acabamento <strong>{currentCategoryInfo.label}</strong> no contrato <strong>{contract.nomeFrigorifico}</strong>.
              </p>
            </div>
            <div className="p-2.5 bg-[#050914] rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Impacto na Arroba:</span>
              <span className={`font-mono font-bold ${isEgsBonus ? 'text-emerald-400' : isEgsPenalty ? 'text-rose-400' : 'text-slate-300'}`}>
                {egsFinanceImpactText}
              </span>
            </div>
          </div>

          {/* DRIVER 2: PESO DE CARCAÇA (PCQ) */}
          <div className="bg-[#080d17] p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-teal-500/10 rounded-lg text-teal-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white font-sans">Peso de Carcaça Quente (PCQ)</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
                  {pcqKg.toFixed(1)} kg ({pcqArrobas.toFixed(1)}@)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isCarcacaLeve ? (
                  <>
                    Carcaça projetada de <strong className="text-amber-300">{pcqKg.toFixed(1)} kg</strong> fica abaixo do padrão mínimo ({contract.pesoMinCarcacaKg} kg / {(contract.pesoMinCarcacaKg/15).toFixed(0)}@). Recomenda-se postergar o abate até o <strong className="text-teal-300 font-extrabold px-1.5 py-0.5 bg-teal-500/10 rounded border border-teal-500/20 font-mono">Dia {tEstrelaRob}</strong> para evitar o deságio contratual de -R$ {contract.desagioPesoFora.toFixed(2)}/@.
                  </>
                ) : isCarcacaPesada ? (
                  <>
                    Carcaça projetada de <strong className="text-rose-300">{pcqKg.toFixed(1)} kg</strong> atinge o limite máximo ({contract.pesoMaxCarcacaKg} kg / {(contract.pesoMaxCarcacaKg/15).toFixed(0)}@). Abater no <strong className="text-teal-300 font-extrabold px-1.5 py-0.5 bg-teal-500/10 rounded border border-teal-500/20 font-mono">Dia {tEstrelaRob}</strong> evita exceder o teto e sofrer penalização de -R$ {contract.desagioPesoFora.toFixed(2)}/@.
                  </>
                ) : (
                  <>
                    Carcaça projetada de <strong>{pcqKg.toFixed(1)} kg</strong> (<strong>{pcqArrobas.toFixed(1)}@</strong>) está perfeitamente enquadrada na faixa isenta no <strong className="text-teal-300 font-extrabold px-1.5 py-0.5 bg-teal-500/10 rounded border border-teal-500/20 font-mono">Dia {tEstrelaRob}</strong>.
                  </>
                )}
              </p>
            </div>
            <div className="p-2.5 bg-[#050914] rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Rendimento de Carcaça Projetado:</span>
              <span className="font-mono text-teal-300 font-bold">{rcCorrente.toFixed(2)}%</span>
            </div>
          </div>

          {/* DRIVER 3: EFICIÊNCIA ALIMENTAR MARGINAL */}
          <div className="bg-[#080d17] p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white font-sans">Eficiência Biológica Marginal</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  GMD: {gmdMarginal.toFixed(2)} kg/d
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                No <strong className="text-amber-400 font-extrabold px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 font-mono">Dia {tEstrelaRob}</strong>, a curva fisiológica de deposição reduz o GMD marginal para <strong>{gmdMarginal.toFixed(2)} kg/dia</strong>. O custo de produção de cada kg vivo adicional passa a ser de <strong>R$ {custoKgGanho.toFixed(2)}/kg</strong>.
              </p>
            </div>
            <div className="p-2.5 bg-[#050914] rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Receita Marginal por kg ganho:</span>
              <span className="font-mono text-amber-300 font-bold">R$ {receitaKgGanho.toFixed(2)}/kg</span>
            </div>
          </div>

          {/* DRIVER 4: GESTÃO DE RISCO ESTOCÁSTICO (LHS) */}
          <div className="bg-[#080d17] p-4 rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white font-sans">Ajuste de Risco Estocástico (LHS)</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                  Risco: {probRob.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {tEstrelaRob < tEstrelaDet ? (
                  <>
                    O modelo estocástico LHS antecipou a janela em <strong className="text-emerald-400 font-extrabold px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20 font-mono">{tEstrelaDet - tEstrelaRob} dias</strong> em relação ao ponto determinístico. Isso reduz a probabilidade de prejuízo de <strong>{probDet.toFixed(1)}%</strong> para <strong>{probRob.toFixed(1)}%</strong>, protegendo a margem contra oscilações de mercado.
                  </>
                ) : tEstrelaRob === tEstrelaDet ? (
                  <>
                    O ponto ótimo determinístico (<strong className="text-amber-400 font-extrabold px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 font-mono">Dia {tEstrelaDet}</strong>) já satisfaz o critério estocástico, mantendo a probabilidade de prejuízo em <strong>{probRob.toFixed(1)}%</strong>, estritamente abaixo do limite de tolerância ({(riskTolerance * 100).toFixed(0)}%).
                  </>
                ) : (
                  <>
                    A simulação estocástica indicou viabilidade para estender a recria/engorda até o <strong className="text-purple-300 font-extrabold px-1.5 py-0.5 bg-purple-500/10 rounded border border-purple-500/20 font-mono">Dia {tEstrelaRob}</strong>, capturando receita adicional com probabilidade de perda controlada em <strong>{probRob.toFixed(1)}%</strong>.
                  </>
                )}
              </p>
            </div>
            <div className="p-2.5 bg-[#050914] rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Tolerância Máxima Configurada:</span>
              <span className="font-mono text-purple-300 font-bold">{(riskTolerance * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL EXPANSÍVEL DE EQUAÇÕES E TRANSPARÊNCIA MATEMÁTICA */}
      {showFormulas && (
        <div className="bg-[#050810] p-4 rounded-xl border border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              Formulação Matemática e Equações do Modelo Biológico-Econômico
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-300">
            <div className="space-y-1.5 bg-[#090e1a] p-3 rounded-lg border border-slate-850">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                1. Função de Lucro Líquido por Boi: L(t)
              </span>
              <div className="font-mono text-[10px] bg-[#03050a] p-2 rounded text-slate-200 border border-slate-850 overflow-x-auto">
                {"L(t) = PCQ(t) × P_Arroba(t) - [CustoCompra + CustoDieta(t) + CustoFixo(t) + TMA(t)]"}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Em que PCQ(t) é o Peso de Carcaça Quente (kg/@), P_Arroba inclui bônus/penalizações do Farol da Qualidade, e TMA é a taxa de oportunidade do capital.
              </p>
            </div>

            <div className="space-y-1.5 bg-[#090e1a] p-3 rounded-lg border border-slate-850">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                2. Otimização Estocástica Robusta (LHS)
              </span>
              <div className="font-mono text-[10px] bg-[#03050a] p-2 rounded text-slate-200 border border-slate-850 overflow-x-auto">
                {"t* = argmax_t [ E[L(t)] - λ × VaR95(t) ]  sujeito a  P(L(t) < 0) ≤ α"}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Maximiza a esperança do lucro penalizada pelo Value-at-Risk (95%), garantindo que a probabilidade de prejuízo não exceda α = {(riskTolerance * 100).toFixed(0)}%.
              </p>
            </div>

            <div className="space-y-1.5 bg-[#090e1a] p-3 rounded-lg border border-slate-850">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                3. Modelo Gompertz para Deposição de Gordura: EGS(t)
              </span>
              <div className="font-mono text-[10px] bg-[#03050a] p-2 rounded text-slate-200 border border-slate-850 overflow-x-auto">
                {"EGS(t) = EGS_Exame + (EGS_inf - EGS_Exame) × [1 - exp(-k_egs × Δt)]"}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Projeção não-linear da espessura de gordura após o último exame de ultrassom, ajustada pela raça do animal (Nelore vs Cruzamento).
              </p>
            </div>

            <div className="space-y-1.5 bg-[#090e1a] p-3 rounded-lg border border-slate-850">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                4. Rendimento Dinâmico de Carcaça: RC(t)
              </span>
              <div className="font-mono text-[10px] bg-[#03050a] p-2 rounded text-slate-200 border border-slate-850 overflow-x-auto">
                {"RC(t) = RC_ini + (RC_alvo - RC_ini) × [min(t, 1.25×T) / T] × Mult_Calib"}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Evolução contínua do rendimento de carcaça saturando no teto biológico, com calibração empírica dos abates anteriores.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
