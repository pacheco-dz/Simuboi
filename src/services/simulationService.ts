import { SimulationInputs, SimulationResults, LHSSimulationResults, FluxoCaixaItem, LHSIteration, MorrisResult, SobolResult, EvolucaoPonto } from '../types';

export function calculateSimulation(inputs: SimulationInputs): SimulationResults {
  const {
    pesoVivoInicial,
    pesoVivoFinal,
    rendimentoCarcaca,
    rendimentoCarcacaInicial,
    quebraPesoTransportePerc,
    gmd,
    precoBoiMagro,
    precoBoiGordo,
    cmsVolumoso,
    cmsConcentrado,
    precoVolumoso,
    precoConcentrado,
    sobrasCochoPerc,
    tempoAlimentacao,
    custoSanidadePorBoi,
    salarioMinimo,
    assistenciaTecnicaMes,
    proLaboreMes,
    energiaEletricaMes,
    segurosMes,
    financiamentoMes,
    itrMes,
    reparosManutencaoMes,
    depreciacaoMes,
    capacidadeEstatica,
    itensDepreciacao,
    boisMaoDeObra,
    encargosTrabalhistas,
    outrosDespesasValor,
    taxaMortalidade,
    tmaAnual,
    arrendamentoTerraPerc,
    valorTerraHa,
    areaAnimalM2,
    bonificacaoPerc,
    fretePorAnimal,
    precoEsterco,
    quantidadeEsterco,
    funruralPerc,
    valorResidual: valorResidualManual,
    itensFinanciamento,
    dieselLitrosCabecaDia,
    precoDiesel,
    comissaoCompraPerc,
    comissaoVendaPerc,
    investimentoSocialAnual,
    horasTreinamentoFuncionarioAno,
    indiceBemEstarAnimal,
    usoEnergiaRenovavelPerc,
    distanciaMediaTransporteKm,
    usoAguaRecicladaPerc,
    certificacaoCompliance,
    rastreabilidadeTotal,
    pesagens,
    ultrassom,
    raca,
    frameSize
  } = inputs;

  const tmaMensal = (Math.pow(1 + tmaAnual / 100, 1 / 12) - 1) * 100;

  // Calculate depreciation from items if available
  let totalDepreciacaoMes = Number(depreciacaoMes) || 0;
  let totalValorNovo = 0;
  if (itensDepreciacao && itensDepreciacao.length > 0) {
    totalValorNovo = itensDepreciacao.reduce((sum, item) => sum + (Number(item.valorNovo) || 0), 0);
    totalDepreciacaoMes = itensDepreciacao.reduce((acc, item) => {
      const valorNovo = Number(item.valorNovo) || 0;
      const valorResidualPerc = Number(item.valorResidualPerc) || 0;
      const vidaUtilAnos = Number(item.vidaUtilAnos) || 1;
      const valorDepreciavel = valorNovo * (1 - (valorResidualPerc / 100));
      const depreciacaoAnual = valorDepreciavel / Math.max(1, vidaUtilAnos);
      return acc + (depreciacaoAnual / 12);
    }, 0);
  }

  // Calculate financing from items if available
  let totalFinanciamentoMes = financiamentoMes;
  if (itensFinanciamento && itensFinanciamento.length > 0) {
    totalFinanciamentoMes = itensFinanciamento.reduce((acc, item) => {
      if (item.valorParcela && item.valorParcela > 0) {
        return acc + item.valorParcela;
      }
      // Se não tiver parcela, calcula usando Price (PMT)
      const r = (item.taxaJurosAnual / 100) / 12;
      const n = item.prazoMeses;
      if (r > 0 && n > 0) {
        const pmt = (item.valorPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        return acc + pmt;
      } else if (n > 0) {
        // Juros zero
        return acc + (item.valorPrincipal / n);
      }
      return acc;
    }, 0);
  }
  
  // Rateio por animal (Custo por animal por mês)
  const cap = Math.max(1, capacidadeEstatica);
  const depreciacaoPerAnimalMes = totalDepreciacaoMes / cap;
  const assistenciaPerAnimalMes = assistenciaTecnicaMes / cap;
  const proLaborePerAnimalMes = proLaboreMes / cap;
  const energiaPerAnimalMes = energiaEletricaMes / cap;
  const segurosPerAnimalMes = segurosMes / cap;
  const financiamentoPerAnimalMes = totalFinanciamentoMes / cap;
  const itrPerAnimalMes = itrMes / cap;
  const reparosPerAnimalMes = reparosManutencaoMes / cap;
  const valorNovoPerAnimal = totalValorNovo / cap;

  const survivalRate = 1 - (taxaMortalidade / 100);
  const numMeses = tempoAlimentacao / 30.4167; // Média de dias no mês para maior precisão

  // 1. Custos Variáveis (Base por animal iniciado)
  const custoCompraBase = precoBoiMagro;
  const custoSanidadeBase = custoSanidadePorBoi;
  
  const fatorSobras = 1 + (sobrasCochoPerc / 100);
  const custoAlimentacaoVolumosoBase = cmsVolumoso * precoVolumoso * tempoAlimentacao * fatorSobras;
  const custoAlimentacaoConcentradoBase = cmsConcentrado * precoConcentrado * tempoAlimentacao * fatorSobras;
  const custoAlimentacaoTotalBase = custoAlimentacaoVolumosoBase + custoAlimentacaoConcentradoBase;
  
  // Mão de obra (Diarista/Contratada)
  const custoMaoDeObraBaseRaw = (salarioMinimo * (1 + encargosTrabalhistas / 100)) / boisMaoDeObra;
  const custoMaoDeObraTotalBase = custoMaoDeObraBaseRaw * (tempoAlimentacao / 30.4167);
  
  const custoDieselBase = dieselLitrosCabecaDia * precoDiesel * tempoAlimentacao;
  const custoFreteBase = fretePorAnimal;
  
  // Somatório dos custos variáveis para cálculo da oportunidade
  const somaVariaveisBase = custoCompraBase + custoSanidadeBase + custoAlimentacaoTotalBase + custoMaoDeObraTotalBase + custoFreteBase + custoDieselBase;
  const custoOportunidadeCapitalBase = somaVariaveisBase * (tmaMensal / 100) * (tempoAlimentacao / 30.4167);

  const custoVariavelTotalBase = somaVariaveisBase + custoOportunidadeCapitalBase + outrosDespesasValor;

  // 2. Custos Fixos (Base por animal iniciado)
  const custoAssistenciaTecnicaBase = assistenciaPerAnimalMes * numMeses;
  const custoProLaboreBase = proLaborePerAnimalMes * numMeses;
  const custoEnergiaBase = energiaPerAnimalMes * numMeses;
  const custoSegurosBase = segurosPerAnimalMes * numMeses;
  const custoFinanciamentoBase = financiamentoPerAnimalMes * numMeses;
  const custoITRBase = itrPerAnimalMes * numMeses;
  const custoReparosBase = reparosPerAnimalMes * numMeses;
  const custoDepreciacaoBase = depreciacaoPerAnimalMes * numMeses;
  
  // Oportunidade de máquinas: Valor Novo * TMA mensal * numMeses
  const custoOportunidadeMaquinasBase = valorNovoPerAnimal * (tmaMensal / 100) * numMeses;
  
  const areaAnimalHa = areaAnimalM2 / 10000;
  // Oportunidade da terra: Valor da terra (ha) * Arrendamento (%) * numMeses
  // Arrendamento é anual, então dividimos por 12 para mensal
  const custoOportunidadeTerraBase = (valorTerraHa * (arrendamentoTerraPerc / 100) / 12) * areaAnimalHa * numMeses;

  const custoFixoTotalBase = custoAssistenciaTecnicaBase + custoProLaboreBase + custoEnergiaBase + custoSegurosBase + custoFinanciamentoBase + custoITRBase + custoReparosBase + custoDepreciacaoBase + custoOportunidadeMaquinasBase + custoOportunidadeTerraBase;

  // --- AJUSTE DE MORTALIDADE (Distribuir custos sobre os sobreviventes) ---
  const custoCompra = custoCompraBase / survivalRate;
  const custoAlimentacaoTotal = custoAlimentacaoTotalBase / survivalRate;

  // Cálculo do Sobrecusto da Dieta (Refinado)
  // 1. Sobrecusto por Sobras (Diferença entre sobras atuais e o mínimo técnico de 1%)
  const fatorSobrasTecnico = 1.01;
  const custoAlimentacaoTecnicoBase = (cmsVolumoso * precoVolumoso + cmsConcentrado * precoConcentrado) * tempoAlimentacao * fatorSobrasTecnico;
  const custoAlimentacaoTecnico = custoAlimentacaoTecnicoBase / survivalRate;
  const sobrecustoSobras = Math.max(0, custoAlimentacaoTotal - custoAlimentacaoTecnico);

  // 2. Sobrecusto por Preço (Diferença entre preço atual e um benchmark de mercado -5%)
  const precoVolumosoOtimizado = precoVolumoso * 0.95;
  const precoConcentradoOtimizado = precoConcentrado * 0.95;
  const custoAlimentacaoPrecoOtimizadoBase = (cmsVolumoso * precoVolumosoOtimizado + cmsConcentrado * precoConcentradoOtimizado) * tempoAlimentacao * fatorSobras;
  const custoAlimentacaoPrecoOtimizado = custoAlimentacaoPrecoOtimizadoBase / survivalRate;
  const sobrecustoPreco = Math.max(0, custoAlimentacaoTotal - custoAlimentacaoPrecoOtimizado);

  // 3. Sobrecusto Total (Considerando ambos os fatores otimizados)
  const custoAlimentacaoOtimizadoBase = (cmsVolumoso * precoVolumosoOtimizado + cmsConcentrado * precoConcentradoOtimizado) * tempoAlimentacao * fatorSobrasTecnico;
  const custoAlimentacaoOtimizado = custoAlimentacaoOtimizadoBase / survivalRate;
  const sobrecustoDieta = Math.max(0, custoAlimentacaoTotal - custoAlimentacaoOtimizado);

  const custoSanidade = custoSanidadeBase / survivalRate;
  const custoMaoDeObraTotal = custoMaoDeObraTotalBase / survivalRate;
  const custoDiesel = custoDieselBase / survivalRate;
  const custoFrete = custoFreteBase / survivalRate;
  const custoOportunidadeCapital = custoOportunidadeCapitalBase / survivalRate;
  const custoOutros = outrosDespesasValor / survivalRate;
  
  const custoVariavelTotal = custoVariavelTotalBase / survivalRate;
  
  const custoAssistenciaTecnica = custoAssistenciaTecnicaBase / survivalRate;
  const custoProLabore = custoProLaboreBase / survivalRate;
  const custoEnergia = custoEnergiaBase / survivalRate;
  const custoSeguros = custoSegurosBase / survivalRate;
  const custoFinanciamento = custoFinanciamentoBase / survivalRate;
  const custoITR = custoITRBase / survivalRate;
  const custoReparos = custoReparosBase / survivalRate;
  const custoDepreciacao = custoDepreciacaoBase / survivalRate;
  const custoOportunidadeMaquinas = custoOportunidadeMaquinasBase / survivalRate;
  const custoOportunidadeTerra = custoOportunidadeTerraBase / survivalRate;

  const custoFixoTotal = custoFixoTotalBase / survivalRate;
  // -----------------------------------------------------------------------

  // 4. Receitas (Por animal sobrevivente)
  const pesoVivoFinalReal = pesoVivoFinal * (1 - quebraPesoTransportePerc / 100);
  const receitaVenda = (pesoVivoFinalReal * (rendimentoCarcaca / 100) / 15) * precoBoiGordo;
  const custoFunrural = receitaVenda * (funruralPerc / 100);
  
  const custoComissaoCompra = (custoCompraBase * comissaoCompraPerc / 100) / survivalRate;
  const custoComissaoVenda = (receitaVenda * comissaoVendaPerc / 100);
  const custoComissoes = custoComissaoCompra + custoComissaoVenda;

  const receitaBonificacao = receitaVenda * (bonificacaoPerc / 100);
  const receitaEsterco = precoEsterco * quantidadeEsterco;
  
  // Valor Residual: Soma dos valores residuais dos ativos + valor residual manual por animal
  const totalValorResidualAtivos = (itensDepreciacao || []).reduce((sum, item) => {
    return sum + (item.valorNovo * (item.valorResidualPerc / 100));
  }, 0);
  
  const valorResidual = (totalValorResidualAtivos / cap) + valorResidualManual;
  
  const receitaBruta = receitaVenda + receitaBonificacao + valorResidual + receitaEsterco;

  // 3. Totais (Ajustados com Funrural)
  const custoOperacionalEfetivo = (custoVariavelTotal - custoOportunidadeCapital) + custoComissoes; 
  const custoOperacionalTotal = custoOperacionalEfetivo + custoDepreciacao + custoAssistenciaTecnica + custoProLabore + custoEnergia + custoSeguros + custoFinanciamento + custoITR + custoFunrural;
  
  const custoOportunidadeTotal = custoOportunidadeCapital + custoOportunidadeMaquinas + custoOportunidadeTerra;
  const custoTotal = custoOperacionalTotal + custoOportunidadeTotal;
  const custoFixoTotalFinal = custoFixoTotal + custoFunrural;

  // 5. Indicadores
  const margemBruta = receitaBruta - custoOperacionalEfetivo;
  const margemLiquida = receitaBruta - custoOperacionalTotal;
  const lucro = receitaBruta - custoTotal;
  const lucroPorBoi = lucro;
  const giroAnual = 365 / tempoAlimentacao;
  
  const ganhoPesoTotal = pesoVivoFinal - pesoVivoInicial;
  const arrobasProduzidas = (pesoVivoFinalReal * (rendimentoCarcaca / 100)) / 15;
  const arrobasIniciais = (pesoVivoInicial * (rendimentoCarcacaInicial / 100)) / 15; // Assuming same yield for initial weight for comparison
  const arrobasGanhos = arrobasProduzidas - arrobasIniciais;
  
  const custoKgGanho = ganhoPesoTotal > 0 ? (custoTotal - custoCompra) / ganhoPesoTotal : 0;
  const custoArrobaGanho = arrobasGanhos > 0 ? (custoTotal - custoCompra) / arrobasGanhos : 0;
  const eficienciaAlimentar = gmd > 0 ? (cmsVolumoso + cmsConcentrado) / gmd : 0;
  const custoPorArroba = arrobasProduzidas > 0 ? custoTotal / arrobasProduzidas : 0;
  const custoTotalPorAnimalDia = tempoAlimentacao > 0 ? custoTotal / tempoAlimentacao : 0;
  const custoTotalSemCompraDia = tempoAlimentacao > 0 ? (custoTotal - custoCompra) / tempoAlimentacao : 0;

  // 6. Evolução de Peso e Gordura (Diário para o gráfico)
  const evolucao: EvolucaoPonto[] = [];
  const egsInicial = 1.5; // mm (estimativa inicial comum)
  
  // Heurística de deposição de gordura (mm/dia) baseada em peso, raça e frame size
  const getGmdEgs = (peso: number, raca: string, frameSize: string) => {
    let base = 0.02; // mm/dia base
    
    // Ajuste por raça
    if (raca === 'cruzamento') base *= 1.15;
    if (raca === 'holandes') base *= 0.8;
    
    // Ajuste por frame size (animais menores terminam mais cedo)
    if (frameSize === 'pequeno') base *= 1.25;
    if (frameSize === 'grande') base *= 0.85;

    const aceleracao = peso > 400 ? (peso - 400) * 0.0002 : 0;
    return base + aceleracao;
  };

  // Conversão EGS (mm) para % de Gordura Corporal (Nelore - Lanna et al.)
  const getFatPerc = (egs: number) => 10.5 + 1.2 * egs;

  let pesoAtualEvol = pesoVivoInicial;
  let egsAtualEvol = egsInicial;
  let custoAcumuladoEvol = custoCompra;
  
  const custoVariavelDia = (custoAlimentacaoTotal + custoSanidade + custoMaoDeObraTotal + custoDiesel + custoFrete + custoOutros) / Math.max(1, tempoAlimentacao);
  const custoFixoDia = (custoFixoTotalFinal - custoFunrural) / Math.max(1, tempoAlimentacao);

  for (let dia = 0; dia <= tempoAlimentacao; dia += 5) {
    if (dia > 0) {
      const gmdEgs = getGmdEgs(pesoAtualEvol, raca, frameSize);
      
      // Redução do GMD conforme o animal engorda (eficiência cai)
      let gmdAjustado = gmd;
      if (egsAtualEvol > 6) {
        gmdAjustado *= 0.95;
      }
      if (egsAtualEvol > 10) {
        gmdAjustado *= 0.85;
      }

      pesoAtualEvol += gmdAjustado * 5;
      egsAtualEvol += gmdEgs * 5;
      custoAcumuladoEvol += (custoVariavelDia + custoFixoDia) * 5;
    }

    const fatPerc = getFatPerc(egsAtualEvol);
    const fatMassKg = pesoAtualEvol * (fatPerc / 100);
    
    const pesagemReal = pesagens?.find(p => Math.abs(p.dia - dia) < 2.5);
    const ultrassomReal = ultrassom?.find(u => Math.abs(u.dia - dia) < 2.5);

    const deltaEGS = egsAtualEvol - egsInicial;
    const deltaPeso = pesoAtualEvol - pesoVivoInicial;
    
    const custoPorMmEGS = deltaEGS > 0 ? (custoAcumuladoEvol - custoCompra) / deltaEGS : 0;
    const custoPorKgGanhoEvol = deltaPeso > 0 ? (custoAcumuladoEvol - custoCompra) / deltaPeso : 0;

    // Calcular Lucro Estimado por animal no dia (Lucro Projetado)
    const rendimentoAtual = tempoAlimentacao > 0 
      ? rendimentoCarcacaInicial + (rendimentoCarcaca - rendimentoCarcacaInicial) * (dia / tempoAlimentacao) 
      : rendimentoCarcaca;
    const pesoVivoFinalRealAtual = pesoAtualEvol * (1 - quebraPesoTransportePerc / 100);
    const carcacaAtualKg = pesoVivoFinalRealAtual * (rendimentoAtual / 100);
    const arrobasAtuais = carcacaAtualKg / 15;
    const receitaVendaAtual = arrobasAtuais * precoBoiGordo;
    const custoFunruralAtual = receitaVendaAtual * (funruralPerc / 100);
    const custoComissaoVendaAtual = receitaVendaAtual * (comissaoVendaPerc / 100);
    const custoComissoesAtual = custoComissaoCompra + custoComissaoVendaAtual;
    const receitaBonificacaoAtual = receitaVendaAtual * (bonificacaoPerc / 100);
    const receitaEstercoAtual = tempoAlimentacao > 0 ? (precoEsterco * quantidadeEsterco) * (dia / tempoAlimentacao) : 0;
    const valorResidualAtual = tempoAlimentacao > 0 ? valorResidual * (dia / tempoAlimentacao) : 0;
    const receitaBrutaAtual = receitaVendaAtual + receitaBonificacaoAtual + receitaEstercoAtual + valorResidualAtual;
    const custoOportunidadeCapitalAtual = tempoAlimentacao > 0 ? custoOportunidadeCapital * (dia / tempoAlimentacao) : 0;
    const custoTotalDia = custoAcumuladoEvol + custoComissoesAtual + custoFunruralAtual + custoOportunidadeCapitalAtual;
    const lucroEstimado = receitaBrutaAtual - custoTotalDia;

    evolucao.push({
      dia,
      pesoEstimado: pesoAtualEvol,
      pesoReal: pesagemReal?.pesoReal,
      gorduraEstimada: egsAtualEvol,
      gorduraReal: ultrassomReal?.espessuraGorduraReal,
      custoAcumulado: custoAcumuladoEvol,
      custoPorMmEGS,
      custoPorKgGanho: custoPorKgGanhoEvol,
      lucroEstimado
    });
  }

  // Ponto de Equilíbrio
  const pontoEquilibrioPreco = arrobasProduzidas > 0 
    ? (custoTotal - valorResidual - receitaEsterco) / (arrobasProduzidas * (1 + bonificacaoPerc / 100))
    : 0;

  // 6. Fluxo de Caixa Detalhado (Mensal) - Fluxo Financeiro (Desembolsos Reais)
  const numMesesInteiro = Math.ceil(tempoAlimentacao / 30);
  const fluxoCaixa: FluxoCaixaItem[] = [];
  let saldoAcumulado = 0;

  // Mês 0: Investimento Inicial (Compra)
  const saidaInicial = custoCompra;
  saldoAcumulado -= saidaInicial;
  fluxoCaixa.push({
    mes: 0,
    descricao: 'Compra de Animais',
    entradas: 0,
    saidas: saidaInicial,
    saldo: -saidaInicial,
    acumulado: saldoAcumulado,
    compraAnimais: saidaInicial,
    alimentacao: 0,
    sanidade: 0,
    operacional: 0,
    funrural: 0,
    vendaAnimais: 0,
    outrasReceitas: 0
  });

  // Custos mensais operacionais (Desembolsos Reais)
  // Excluímos Depreciação e Oportunidades (não são saídas de caixa)
  // Excluímos Funrural (será cobrado na venda, no último mês)
  const alimentacaoMensal = custoAlimentacaoTotal / numMesesInteiro;
  const sanidadeMensal = custoSanidade / numMesesInteiro;
  const operacionalMensal = (custoOperacionalTotal - custoCompra - custoDepreciacao - custoFunrural - custoAlimentacaoTotal - custoSanidade) / numMesesInteiro;

  for (let m = 1; m <= numMesesInteiro; m++) {
    let entradas = 0;
    let saidas = alimentacaoMensal + sanidadeMensal + operacionalMensal;
    let descricao = `Custos Operacionais - Mês ${m}`;
    
    let vendaAnimais = 0;
    let outrasReceitas = 0;
    let funrural = 0;

    if (m === numMesesInteiro) {
      vendaAnimais = receitaVenda + receitaBonificacao;
      outrasReceitas = receitaEsterco;
      entradas = receitaBruta;
      funrural = custoFunrural;
      saidas += funrural; // Funrural é cobrado no momento da venda
      descricao = `Venda de Animais + Outras Receitas (Líquido de Funrural)`;
    }

    const saldoMes = entradas - saidas;
    saldoAcumulado += saldoMes;

    fluxoCaixa.push({
      mes: m,
      descricao: m === numMesesInteiro ? 'Venda e Encerramento' : descricao,
      entradas: entradas,
      saidas: saidas,
      saldo: saldoMes,
      acumulado: saldoAcumulado,
      compraAnimais: 0,
      alimentacao: alimentacaoMensal,
      sanidade: sanidadeMensal,
      operacional: operacionalMensal,
      funrural: funrural,
      vendaAnimais: vendaAnimais,
      outrasReceitas: outrasReceitas
    });
  }

  // 7. Indicadores Financeiros Sincronizados com Fluxo de Caixa
  const vpl = fluxoCaixa.reduce((acc, item) => {
    return acc + item.saldo / Math.pow(1 + tmaMensal / 100, item.mes);
  }, 0);

  const animaisPorHa = inputs.animaisHa; 
  const lucroPorHa = lucro * survivalRate * animaisPorHa;
  const vplPorHa = vpl * survivalRate * animaisPorHa;
  const custoTotalPorHa = custoTotal * survivalRate * animaisPorHa;
  const receitaBrutaPorHa = receitaBruta * survivalRate * animaisPorHa;

  const vpPositivo = fluxoCaixa.reduce((acc, item) => {
    return acc + (item.entradas / Math.pow(1 + tmaMensal / 100, item.mes));
  }, 0);
  const vpNegativo = fluxoCaixa.reduce((acc, item) => {
    return acc + (item.saidas / Math.pow(1 + tmaMensal / 100, item.mes));
  }, 0);
  const indiceBeneficioCusto = vpNegativo !== 0 ? vpPositivo / vpNegativo : 0;

  const roia = (Math.pow(Math.max(0.0001, indiceBeneficioCusto), 1 / Math.max(1, numMesesInteiro)) - 1) * 100;

  const investimentoTotal = saidaInicial;
  // Retorno Total Financeiro (Líquido de desembolsos, excluindo depreciação que não é caixa)
  const retornoTotal = receitaBruta - (custoOperacionalTotal - custoCompra - custoDepreciacao);
  // TIR Simplificada (CAGR do ciclo)
  const tir = (Math.pow(Math.max(0.0001, retornoTotal / investimentoTotal), 1 / Math.max(1, numMesesInteiro)) - 1) * 100;
  
  // Payback Simples baseado no fluxo de caixa
  const payback = investimentoTotal / (Math.max(0.0001, (saldoAcumulado + investimentoTotal) / Math.max(1, numMesesInteiro)));

  // Payback Descontado
  let paybackDescontado = 0;
  let vplAcumuladoParaPayback = 0;
  for (let i = 0; i < fluxoCaixa.length; i++) {
    const item = fluxoCaixa[i];
    const valorDescontado = item.saldo / Math.pow(1 + tmaMensal / 100, item.mes);
    const vplAnterior = vplAcumuladoParaPayback;
    vplAcumuladoParaPayback += valorDescontado;
    
    if (vplAnterior < 0 && vplAcumuladoParaPayback >= 0) {
      if (valorDescontado !== 0) {
        paybackDescontado = (item.mes - 1) + (Math.abs(vplAnterior) / valorDescontado);
      } else {
        paybackDescontado = item.mes;
      }
      break;
    }
  }

  const precoArrobaMagro = pesoVivoInicial > 0 ? (precoBoiMagro * 30) / pesoVivoInicial : 0;
  const precoArrobaGordo = precoBoiGordo;
  const agioDesagio = precoArrobaGordo > 0 ? ((precoArrobaMagro / precoArrobaGordo) - 1) * 100 : 0;

  // --- ESG CALCULATIONS ---
  // 1. Balanço de Nutrientes (Estimativas baseadas em literatura)
  const pbDietaMedia = (cmsVolumoso * 0.08 + cmsConcentrado * 0.18) / (cmsVolumoso + cmsConcentrado || 1);
  const pDietaMedia = (cmsVolumoso * 0.002 + cmsConcentrado * 0.005) / (cmsVolumoso + cmsConcentrado || 1);
  
  const ingestaoMS = (cmsVolumoso + cmsConcentrado) * tempoAlimentacao;
  const ingestaoN = (ingestaoMS * pbDietaMedia) / 6.25;
  const retencaoN = (ganhoPesoTotal * 0.15) / 6.25; // 15% de proteína no ganho
  const balancoNitrogenio = Math.max(0, ingestaoN - retencaoN);

  const ingestaoP = ingestaoMS * pDietaMedia;
  const retencaoP = ganhoPesoTotal * 0.007; // 0.7% de fósforo no ganho
  const balancoFosforo = Math.max(0, ingestaoP - retencaoP);

  // 2. Emissões e Pegadas
  const emissaoMetanoKg = ganhoPesoTotal * 2.0; // ~2kg CH4 por kg de ganho (estimativa simplificada)
  const pegadaCarbonoTotal = ganhoPesoTotal * 0.05; // t CO2e
  const pegadaHidricaTotal = (tempoAlimentacao * 45 / 1000) * (1 - usoAguaRecicladaPerc / 100); // m3/animal

  // 3. Eficiência de Uso da Terra
  const eficienciaUsoTerra = areaAnimalM2 / (ganhoPesoTotal || 1); // m2/kg produzido

  // 4. Índice de Sustentabilidade (0-100)
  let scoreESG = 0;
  scoreESG += (indiceBemEstarAnimal / 10) * 25; // Bem-estar (25%)
  scoreESG += (usoEnergiaRenovavelPerc / 100) * 15; // Energia (15%)
  scoreESG += (usoAguaRecicladaPerc / 100) * 10; // Água (10%)
  scoreESG += (certificacaoCompliance ? 15 : 0); // Governança (15%)
  scoreESG += (rastreabilidadeTotal ? 15 : 0); // Rastreabilidade (15%)
  scoreESG += Math.min(20, (horasTreinamentoFuncionarioAno / 40) * 20); // Social (20%)
  const indiceSustentabilidade = scoreESG;

  return {
    custoFixo: custoFixoTotalFinal,
    custoVariavel: custoVariavelTotal,
    custoOperacionalEfetivo,
    custoOperacionalTotal,
    custoTotal,
    custoOportunidadeTotal,
    receitaBruta,
    receitaBrutaPorHa,
    receitaVenda,
    receitaBonificacao,
    receitaEsterco,
    valorResidual,
    margemBruta,
    margemLiquida,
    lucro,
    lucroPorBoi,
    lucroPorHa,
    giroAnual,
    pontoEquilibrioPreco,
    vpl,
    vplPorHa,
    tir,
    payback,
    paybackDescontado,
    indiceBeneficioCusto,
    roia,
    custoKgGanho,
    custoArrobaGanho,
    custoPorArroba,
    custoTotalPorAnimalDia,
    custoTotalSemCompraDia,
    custoAlimentacao: custoAlimentacaoTotal,
    sobrecustoDieta,
    sobrecustoSobras,
    sobrecustoPreco,
    custoCompraAnimal: custoCompra,
    custoMaoDeObra: custoMaoDeObraTotal,
    custoSanidade,
    custoFrete,
    custoAssistenciaTecnica,
    custoProLabore,
    custoEnergia,
    custoDiesel,
    custoComissoes,
    custoReparos,
    custoSeguros,
    custoFinanciamento,
    custoITR,
    custoDepreciacao,
    totalDepreciacaoMes,
    totalInvestimento: totalValorNovo,
    custoOportunidadeMaquinas,
    custoOportunidadeTerra,
    custoOportunidadeCapital,
    custoOutros,
    custoFunrural,
    agioDesagio,
    
    // ESG Results
    balancoNitrogenio,
    balancoFosforo,
    emissaoMetanoKg,
    eficienciaUsoTerra,
    pegadaCarbonoTotal,
    pegadaHidricaTotal,
    indiceSustentabilidade,

    ganhoPesoTotal,
    arrobasProduzidas: arrobasGanhos,
    eficienciaAlimentar,
    custoTotalPorHa,
    fluxoCaixa,
    evolucao
  };
}

// Mersenne Twister implementation for reproducible and high-quality random numbers
class MersenneTwister {
  private mt = new Array(624);
  private index = 0;

  constructor(seed = Date.now()) {
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253 + i) >>> 0;
    }
  }

  random() {
    if (this.index === 0) this.generateNumbers();

    let y = this.mt[this.index];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    this.index = (this.index + 1) % 624;
    return (y >>> 0) / 4294967296;
  }

  private generateNumbers() {
    for (let i = 0; i < 624; i++) {
      const y = (this.mt[i] & 0x80000000) + (this.mt[(i + 1) % 624] & 0x7fffffff);
      this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
      if (y % 2 !== 0) this.mt[i] ^= 0x9908b0df;
    }
  }
}

// Helper for normal distribution random numbers (Box-Muller transform)
function randomNormal(mean: number, stdDev: number, rng: { random: () => number } = Math): number {
  const u = 1 - rng.random();
  const v = rng.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

// Gamma distribution sampler (Marsaglia and Tsang)
function randomGamma(alpha: number, beta: number, rng: { random: () => number } = Math): number {
  if (alpha < 1) {
    return randomGamma(alpha + 1, beta, rng) * Math.pow(rng.random(), 1 / alpha);
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v;
    do {
      x = randomNormal(0, 1, rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng.random();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v * beta;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * beta;
  }
}

// Positive Stable distribution sampler (Chambers-Mallows-Stuck)
// Used for Gumbel copula with index alpha in (0, 1]
function randomPositiveStable(alpha: number, rng: { random: () => number } = Math): number {
  const u = (rng.random() - 0.5) * Math.PI;
  const w = -Math.log(rng.random());
  const a = alpha;
  const b = 1 - a;
  
  const term1 = Math.sin(a * (u + Math.PI / 2)) / Math.pow(Math.cos(u), 1 / a);
  const term2 = Math.pow(Math.cos(u - a * (u + Math.PI / 2)) / w, b / a);
  
  return term1 * term2;
}

// Normal CDF approximation (Abramowitz and Stegun)
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.39894228 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

// Inverse Normal CDF approximation for LHS
function inverseNormalCDF(p: number, mean: number, stdDev: number): number {
  if (p <= 0) p = 0.0001;
  if (p >= 1) p = 0.9999;
  
  const t = p < 0.5 ? Math.sqrt(-2.0 * Math.log(p)) : Math.sqrt(-2.0 * Math.log(1.0 - p));
  const x = t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t);
  
  const z = p < 0.5 ? -x : x;
  return mean + z * stdDev;
}

// Inverse Log-logistic CDF: F^-1(p) = alpha * (p / (1-p))^(1/beta)
function inverseLogLogisticCDF(p: number, alpha: number, beta: number): number {
  if (p <= 0) p = 0.0001;
  if (p >= 1) p = 0.9999;
  return alpha * Math.pow(p / (1 - p), 1 / beta);
}

// Inverse Pearson Type V (Inverse Gamma) CDF
// F(x; alpha, beta) = Q(alpha, beta/x)
// x = beta / Q^-1(p, alpha)
function inversePearson5CDF(p: number, alpha: number, beta: number): number {
  if (p <= 0) p = 0.0001;
  if (p >= 1) p = 0.9999;
  
  // Approximation for Q^-1(p, alpha)
  // For large alpha, it's related to Normal
  // For simplicity, we use a numerical approach or a robust approximation
  // Here we use a simple approximation based on Wilson-Hilferty
  const z = inverseNormalCDF(1 - p, 0, 1);
  const v = 1 / (9 * alpha);
  const q_inv = alpha * Math.pow(1 - v + z * Math.sqrt(v), 3);
  
  return beta / Math.max(0.0001, q_inv);
}

// Inverse Laplace CDF
function inverseLaplaceCDF(p: number, mu: number, b: number): number {
  if (p <= 0) p = 0.0001;
  if (p >= 1) p = 0.9999;
  if (p < 0.5) {
    return mu + b * Math.log(2 * p);
  } else {
    return mu - b * Math.log(2 * (1 - p));
  }
}

// Approximations for parameter estimation from mean and stdDev
function estimateLaplaceParams(mean: number, stdDev: number) {
  const mu = mean;
  const b = stdDev / Math.sqrt(2);
  return { mu, b };
}

function estimateLogLogisticParams(mean: number, stdDev: number) {
  const cv = stdDev / mean;
  const beta = Math.PI / (cv * Math.sqrt(3)); // Approximation for shape parameter
  const alpha = mean * (Math.sin(Math.PI / beta) / (Math.PI / beta));
  return { alpha, beta };
}

function estimatePearson5Params(mean: number, stdDev: number) {
  const variance = stdDev * stdDev;
  const alpha = (mean * mean / variance) + 2;
  const beta = mean * (alpha - 1);
  return { alpha, beta };
}

function shuffleArray(array: any[], rng: { random: () => number } = Math) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Cholesky decomposition for correlating variables
function cholesky(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
      } else {
        L[i][j] = (matrix[i][j] - sum) / (L[j][j] || 1);
      }
    }
  }
  return L;
}

const NOMES_AMIGAVEIS: Record<string, string> = {
  precoBoiMagro: 'Preço Boi Magro (R$/animal)',
  precoBoiGordo: 'Preço Boi Gordo (R$/@)',
  gmd: 'GMD',
  precoConcentrado: 'Preço Concentrado (MV)',
  precoVolumoso: 'Preço Volumoso (MV)',
  sobrasCochoPerc: 'Sobras no Cocho (%)',
  pesoVivoInicial: 'Peso Inicial',
  pesoVivoFinal: 'Peso Final',
  cmsVolumoso: 'CMV Volumoso',
  cmsConcentrado: 'CMV Concentrado',
  taxaMortalidade: 'Mortalidade',
  tempoAlimentacao: 'Tempo Alimentação',
  valorTerraHa: 'Valor da Terra',
  arrendamentoTerraPerc: 'Arrendamento',
  areaAnimalM2: 'Área por Animal (m²)',
  rendimentoCarcaca: 'Rendimento de Carcaça (%)',
  custoSanidadePorBoi: 'Sanidade',
  outrosDespesasValor: 'Outras Despesas (R$)',
  bonificacaoPerc: 'Bonificação Carcaça (%)',
  fretePorAnimal: 'Frete, Guia transporte, Comissão compra e venda, Rastreabilidade (R$/animal)',
  precoEsterco: 'Preço Esterco (R$/ton)',
  quantidadeEsterco: 'Quantidade Esterco (ton)',
  tmaAnual: 'TMA Anual (%)',
  funruralPerc: 'Funrural (%)',
  segurosMes: 'Seguros Patrimoniais',
  financiamentoMes: 'Financiamento/Dívida'
};

export function runLHSSimulation(inputs: SimulationInputs, iterations: number = 100000): LHSSimulationResults {
  const rng = new MersenneTwister(42); // Fixed seed for stability
  const results: number[] = [];
  let prejuizos = 0;

  // Identificar chaves com desvio padrão
  const keysToSimulate = Object.keys(inputs.desviosPadrao).filter(k => inputs.desviosPadrao[k] > 0);
  const nKeys = keysToSimulate.length;
  
  // Matriz de correlação baseada nos inputs (default: Pacheco et al. 2014)
  // Ordem: keysToSimulate
  const corrMatrix = Array.from({ length: nKeys }, () => Array(nKeys).fill(0));
  for (let i = 0; i < nKeys; i++) corrMatrix[i][i] = 1;

  const correlations = inputs.correlacoes || {};

  for (let i = 0; i < nKeys; i++) {
    for (let j = 0; j < nKeys; j++) {
      if (i === j) continue;
      const keyI = keysToSimulate[i];
      const keyJ = keysToSimulate[j];
      const corr = correlations[keyI]?.[keyJ] || correlations[keyJ]?.[keyI] || 0;
      corrMatrix[i][j] = corr;
    }
  }

  const L = cholesky(corrMatrix);
  const copulaType = inputs.copulaType || 'gaussian';

  // Pre-calculate parameters for specific distributions
  const distParams: Record<string, any> = {};
  keysToSimulate.forEach(key => {
    const mean = (inputs as any)[key];
    const stdDev = inputs.desviosPadrao[key];
    if (key === 'precoBoiMagro' || key === 'precoConcentrado') {
      distParams[key] = estimateLogLogisticParams(mean, stdDev);
    } else if (key === 'precoBoiGordo') {
      distParams[key] = estimateLaplaceParams(mean, stdDev);
    } else if (key === 'precoVolumoso') {
      distParams[key] = estimatePearson5Params(mean, stdDev);
    }
  });

  // Gerar amostras LHS independentes (Z-scores padrão)
  const independentZ: number[][] = Array.from({ length: nKeys }, () => {
    const samples = [];
    for (let i = 0; i < iterations; i++) {
      const p = (i + rng.random()) / iterations;
      samples.push(inverseNormalCDF(p, 0, 1));
    }
    shuffleArray(samples, rng);
    return samples;
  });

  // Aplicar correlação via Cópula
  const lhsSamples: Record<string, number[]> = {};
  keysToSimulate.forEach(key => lhsSamples[key] = []);

  // Para Cópulas Arquimedianas (Clayton/Gumbel), calculamos um theta médio
  let avgCorr = 0;
  let count = 0;
  for (let i = 0; i < nKeys; i++) {
    for (let j = i + 1; j < nKeys; j++) {
      avgCorr += corrMatrix[i][j];
      count++;
    }
  }
  avgCorr = count > 0 ? Math.min(0.99, avgCorr / count) : 0;
  const thetaClayton = Math.max(0.1, (2 * avgCorr) / (1 - Math.max(0.01, avgCorr)));
  const thetaGumbel = Math.max(1.1, 1 / (1 - Math.max(0.01, avgCorr)));

  for (let i = 0; i < iterations; i++) {
    const zVector = independentZ.map(row => row[i]);
    const uVector = zVector.map(z => normalCDF(z));
    const correlatedU = Array(nKeys).fill(0);
    
    if (copulaType === 'gaussian' || copulaType === 'spearman') {
      const correlatedZ = Array(nKeys).fill(0);
      
      // Se for Spearman, convertemos a correlação de postos para correlação linear equivalente
      // rho_pearson = 2 * sin(pi/6 * rho_spearman)
      // Para simplificar e manter performance, usamos a matriz original se for gaussian
      // mas se for spearman poderíamos ajustar. No entanto, muitos apps usam a matriz diretamente.
      // Vamos manter a matriz original mas tratar como dependência de postos.
      
      for (let row = 0; row < nKeys; row++) {
        for (let col = 0; col <= row; col++) {
          correlatedZ[row] += L[row][col] * zVector[col];
        }
      }
      for (let row = 0; row < nKeys; row++) {
        correlatedU[row] = normalCDF(correlatedZ[row]);
      }
    } else if (copulaType === 'clayton') {
      // Clayton Copula via latent variable V ~ Gamma(1/theta, 1)
      const theta = thetaClayton;
      const v = randomGamma(1 / theta, 1, rng);
      for (let row = 0; row < nKeys; row++) {
        const e = -Math.log(uVector[row]);
        correlatedU[row] = Math.pow(1 + e / v, -1 / theta);
      }
    } else if (copulaType === 'gumbel') {
      // Gumbel Copula via latent variable V ~ PositiveStable(1/theta)
      const alpha = 1 / thetaGumbel;
      const v = randomPositiveStable(alpha, rng);
      for (let row = 0; row < nKeys; row++) {
        const e = -Math.log(uVector[row]);
        correlatedU[row] = Math.exp(-Math.pow(e / v, alpha));
      }
    } else {
      for (let row = 0; row < nKeys; row++) {
        correlatedU[row] = uVector[row];
      }
    }

    keysToSimulate.forEach((key, idx) => {
      const mean = (inputs as any)[key];
      const stdDev = inputs.desviosPadrao[key];
      const p = Math.max(0.0001, Math.min(0.9999, correlatedU[idx]));
      
      let simulatedValue;
      if (key === 'precoBoiMagro' || key === 'precoConcentrado') {
        const { alpha, beta } = distParams[key];
        simulatedValue = inverseLogLogisticCDF(p, alpha, beta);
      } else if (key === 'precoBoiGordo') {
        const { mu, b } = distParams[key];
        simulatedValue = inverseLaplaceCDF(p, mu, b);
      } else if (key === 'precoVolumoso') {
        const { alpha, beta } = distParams[key];
        simulatedValue = inversePearson5CDF(p, alpha, beta);
      } else {
        simulatedValue = inverseNormalCDF(p, mean, stdDev);
      }
      
      lhsSamples[key].push(simulatedValue);
    });
  }

  // Coletar amostras para visualização (limitar a 500 pontos para performance)
  const correlationSamples: Record<string, { x: number; y: number; nameX: string; nameY: string }[]> = {};
  const sampleSize = Math.min(500, iterations);
  
  for (let i = 0; i < nKeys; i++) {
    for (let j = i + 1; j < nKeys; j++) {
      const keyX = keysToSimulate[i];
      const keyY = keysToSimulate[j];
      const corr = corrMatrix[i][j];
      
      if (Math.abs(corr) > 0.05 || (keyX === 'precoBoiMagro' && keyY === 'precoBoiGordo')) {
        const pairKey = `${keyX}_${keyY}`;
        correlationSamples[pairKey] = [];
        for (let s = 0; s < sampleSize; s++) {
          correlationSamples[pairKey].push({
            x: lhsSamples[keyX][s],
            y: lhsSamples[keyY][s],
            nameX: NOMES_AMIGAVEIS[keyX] || keyX,
            nameY: NOMES_AMIGAVEIS[keyY] || keyY
          });
        }
      }
    }
  }

  // Para análise de sensibilidade
  const inputVariations: Record<string, number[]> = {};
  keysToSimulate.forEach(key => {
    inputVariations[key] = [];
  });

  const iterationsData: LHSIteration[] = [];

  for (let i = 0; i < iterations; i++) {
    const simulatedInputs: SimulationInputs = { ...inputs };
    const iterationInputs: Record<string, number> = {};

    keysToSimulate.forEach((key) => {
      let simulatedValue = lhsSamples[key][i];
      
      // Restrições de valores positivos
      if (['pesoVivoInicial', 'pesoVivoFinal', 'gmd', 'cmsVolumoso', 'cmsConcentrado', 'precoBoiMagro', 'precoBoiGordo', 'precoVolumoso', 'precoConcentrado', 'precoEsterco', 'quantidadeEsterco', 'sobrasCochoPerc'].includes(key)) {
        simulatedValue = Math.max(0.0001, simulatedValue);
      }
      
      (simulatedInputs as any)[key] = simulatedValue;
      iterationInputs[key] = simulatedValue;
      inputVariations[key].push(simulatedValue);
    });

    // Recalcular tempo de alimentação se peso inicial, final ou GMD mudar na simulação
    if (keysToSimulate.some(k => ['pesoVivoInicial', 'pesoVivoFinal', 'gmd'].includes(k))) {
      const pvi = simulatedInputs.pesoVivoInicial;
      const pvf = simulatedInputs.pesoVivoFinal;
      const gmd = simulatedInputs.gmd;
      if (gmd > 0) {
        simulatedInputs.tempoAlimentacao = Math.ceil((pvf - pvi) / gmd);
      }
    }

    const sim = calculateSimulation(simulatedInputs);
    results.push(sim.vpl);
    iterationsData.push({
      id: i + 1,
      inputs: iterationInputs,
      vpl: sim.vpl,
      lucro: sim.lucro,
      tir: sim.tir
    });
    if (sim.vpl < 0) prejuizos++;
  }

  // Cálculo de Sensibilidade (Correlação de Pearson como proxy para coeficientes padronizados)
  const sensibilidade = Object.keys(inputVariations).map(key => {
    const x = inputVariations[key];
    const y = results;
    const n = x.length;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    const correlation = denominator === 0 ? 0 : numerator / denominator;
    
    return {
      nome: NOMES_AMIGAVEIS[key] || key,
      impacto: correlation
    };
  })
  .filter(s => Math.abs(s.impacto) > 0.01)
  .sort((a, b) => Math.abs(b.impacto) - Math.abs(a.impacto));

  // Cálculo de Regressão Múltipla (Standardized Betas)
  const regressionData = calculateMultipleRegression(inputVariations, results);

  results.sort((a, b) => a - b);
  const vplMedio = results.reduce((a, b) => a + b, 0) / iterations;
  const lucroMedio = iterationsData.reduce((a, b) => a + b.lucro, 0) / iterations;
  const tirMedia = iterationsData.reduce((a, b) => a + b.tir, 0) / iterations;
  const vplMinimo = results[0];
  const vplMaximo = results[iterations - 1];
  const probabilidadeVplNegativo = (prejuizos / iterations) * 100;

  // Cálculo de Desvio Padrão e Coeficiente de Variação
  const variancia = results.reduce((acc, val) => acc + Math.pow(val - vplMedio, 2), 0) / iterations;
  const desvioPadrao = Math.sqrt(variancia);
  const coeficienteVariacao = vplMedio !== 0 ? (desvioPadrao / Math.abs(vplMedio)) * 100 : 0;

  // Criar histograma
  const numBins = 15;
  const binSize = (vplMaximo - vplMinimo) / numBins;
  const histograma = [];

  for (let i = 0; i < numBins; i++) {
    const start = vplMinimo + i * binSize;
    const end = start + binSize;
    const count = results.filter(r => r >= start && r < end).length;
    histograma.push({
      faixa: `${Math.round(start)} a ${Math.round(end)}`,
      frequencia: count,
      valor: (start + end) / 2
    });
  }

  // Cálculo de Morris OAT
  const morris = calculateMorrisSensitivity(inputs, keysToSimulate, rng);

  // Cálculo de Sobol
  const sobol = calculateSobolSensitivity(inputs, keysToSimulate, rng);

  const generateTechnicalOpinion = (res: any, inputs: SimulationInputs) => {
    const probPrejuizo = res.probabilidadePrejuizo;
    const cv = res.coeficienteVariacao;
    const copula = inputs.copulaType || 'gaussian';
    
    let nivelRisco: 'baixo' | 'moderado' | 'alto' = 'moderado';
    if (probPrejuizo < 5 && cv < 15) nivelRisco = 'baixo';
    else if (probPrejuizo > 20 || cv > 30) nivelRisco = 'alto';
    
    let titulo = "Parecer Técnico de Risco";
    let texto = "";
    
    if (copulaType === 'gaussian') {
      texto = `A análise utilizou Correlação Linear (Cópula Gaussiana). Este modelo é adequado para capturar a dependência média entre variáveis. Com uma probabilidade de prejuízo de ${probPrejuizo.toFixed(1)}%, o projeto apresenta um perfil de risco ${nivelRisco}. `;
    } else if (copula === 'spearman') {
      texto = `A análise utilizou a Correlação de Postos de Spearman. Este modelo é robusto a outliers e captura relações não-lineares, mas que mantêm a ordem (monotônicas). Com uma probabilidade de prejuízo de ${probPrejuizo.toFixed(1)}%, o projeto apresenta um perfil de risco ${nivelRisco}. `;
    } else if (copula === 'clayton') {
      texto = `A análise utilizou Cópula de Clayton, que enfatiza a dependência de cauda inferior. Isso significa que o modelo simulou cenários onde preços de compra e venda caem simultaneamente com mais frequência, sendo um teste de estresse mais rigoroso para crises de mercado. `;
    } else if (copula === 'gumbel') {
      texto = `A análise utilizou Cópula de Gumbel, focada em dependência de cauda superior. Este modelo simula com mais peso cenários onde custos (como milho e reposição) explodem simultaneamente, testando a resiliência do caixa a choques inflacionários. `;
    } else {
      texto = `A análise assumiu independência total entre as variáveis. Note que isso pode subestimar o risco real, pois no mercado pecuário os preços de compra e venda costumam ser altamente correlacionados. `;
    }
    
    if (nivelRisco === 'alto') {
      texto += "Recomenda-se cautela e estratégias de hedge (travas de preço) para mitigar a volatilidade observada.";
    } else if (nivelRisco === 'baixo') {
      texto += "Os indicadores sugerem uma operação resiliente com baixa probabilidade de retornos negativos sob as condições simuladas.";
    } else {
      texto += "O projeto demonstra viabilidade aceitável, mas requer monitoramento constante dos principais drivers de custo.";
    }
    
    return { titulo, texto, nivelRisco };
  };

  const resultsObj: LHSSimulationResults = {
    probabilidadeVplNegativo,
    probabilidadePrejuizo: probabilidadeVplNegativo,
    probabilidadePositivo: 100 - probabilidadeVplNegativo,
    vplMedio,
    vplMinimo,
    vplMaximo,
    desvioPadrao,
    coeficienteVariacao,
    lucroMedio,
    tirMedia,
    histograma,
    sensibilidade,
    regressao: regressionData.betas,
    r2: regressionData.r2,
    desviosPadraoInputs: regressionData.stds,
    iteracoes: iterationsData,
    correlationSamples,
    morris,
    sobol
  };

  resultsObj.parecerTecnico = generateTechnicalOpinion(resultsObj, inputs);

  return resultsObj;
}

function calculateSobolSensitivity(inputs: SimulationInputs, keys: string[], rng: MersenneTwister): SobolResult[] {
  const N = 500; // Número de amostras base
  const k = keys.length;
  const results: SobolResult[] = [];
  
  // 1. Gerar Matrizes A e B (N x k)
  const A: number[][] = Array.from({ length: N }, () => keys.map(key => {
    const mean = (inputs as any)[key];
    const stdDev = inputs.desviosPadrao[key];
    const p = rng.random();
    
    if (key === 'precoBoiMagro' || key === 'precoConcentrado') {
      const { alpha, beta } = estimateLogLogisticParams(mean, stdDev);
      return inverseLogLogisticCDF(p, alpha, beta);
    } else if (key === 'precoBoiGordo') {
      const { mu, b } = estimateLaplaceParams(mean, stdDev);
      return inverseLaplaceCDF(p, mu, b);
    } else if (key === 'precoVolumoso') {
      const { alpha, beta } = estimatePearson5Params(mean, stdDev);
      return inversePearson5CDF(p, alpha, beta);
    } else {
      return inverseNormalCDF(p, mean, stdDev);
    }
  }));

  const B: number[][] = Array.from({ length: N }, () => keys.map(key => {
    const mean = (inputs as any)[key];
    const stdDev = inputs.desviosPadrao[key];
    const p = rng.random();
    
    if (key === 'precoBoiMagro' || key === 'precoConcentrado') {
      const { alpha, beta } = estimateLogLogisticParams(mean, stdDev);
      return inverseLogLogisticCDF(p, alpha, beta);
    } else if (key === 'precoBoiGordo') {
      const { mu, b } = estimateLaplaceParams(mean, stdDev);
      return inverseLaplaceCDF(p, mu, b);
    } else if (key === 'precoVolumoso') {
      const { alpha, beta } = estimatePearson5Params(mean, stdDev);
      return inversePearson5CDF(p, alpha, beta);
    } else {
      return inverseNormalCDF(p, mean, stdDev);
    }
  }));

  // 2. Calcular Y_A e Y_B
  const Y_A = A.map(row => {
    const rowInputs = { ...inputs };
    keys.forEach((key, idx) => (rowInputs as any)[key] = row[idx]);
    return calculateSimulation(rowInputs).vpl;
  });

  const Y_B = B.map(row => {
    const rowInputs = { ...inputs };
    keys.forEach((key, idx) => (rowInputs as any)[key] = row[idx]);
    return calculateSimulation(rowInputs).vpl;
  });

  const meanY = [...Y_A, ...Y_B].reduce((a, b) => a + b, 0) / (2 * N);
  const varY = [...Y_A, ...Y_B].reduce((a, b) => a + Math.pow(b - meanY, 2), 0) / (2 * N);

  if (varY === 0) return [];

  // 3. Calcular S1 e ST para cada variável
  for (let i = 0; i < k; i++) {
    // Matriz C_i: Todas as colunas de A, exceto a i-ésima que vem de B
    const Y_Ci = A.map((rowA, rowIdx) => {
      const rowInputs = { ...inputs };
      keys.forEach((key, colIdx) => {
        (rowInputs as any)[key] = (colIdx === i) ? B[rowIdx][colIdx] : rowA[colIdx];
      });
      return calculateSimulation(rowInputs).vpl;
    });

    // S1: First-order index
    // S1 = (1/N * sum(Y_B * Y_Ci) - E[Y]^2) / V[Y]
    let sumS1 = 0;
    for (let j = 0; j < N; j++) {
      sumS1 += Y_B[j] * Y_Ci[j];
    }
    const s1 = (sumS1 / N - Math.pow(meanY, 2)) / varY;

    // ST: Total-order index
    // ST = (1/(2N) * sum((Y_A - Y_Ci)^2)) / V[Y]
    let sumST = 0;
    for (let j = 0; j < N; j++) {
      sumST += Math.pow(Y_A[j] - Y_Ci[j], 2);
    }
    const st = (sumST / (2 * N)) / varY;

    results.push({
      nome: NOMES_AMIGAVEIS[keys[i]] || keys[i],
      s1: Math.max(0, s1),
      st: Math.max(0, st),
      interaction: Math.max(0, st - s1)
    });
  }

  return results.sort((a, b) => b.st - a.st);
}

function calculateMorrisSensitivity(inputs: SimulationInputs, keys: string[], rng: MersenneTwister): MorrisResult[] {
  const r = 20; // Número de trajetórias
  const delta = 0.1; // Passo (10% do desvio padrão ou range)
  
  const results: MorrisResult[] = [];
  
  for (const key of keys) {
    const elementaryEffects: number[] = [];
    const mean = (inputs as any)[key];
    const stdDev = inputs.desviosPadrao[key];
    
    if (stdDev === 0) continue;

    for (let i = 0; i < r; i++) {
      // Ponto base aleatório (usando a distribuição definida ou normal como fallback)
      const p = rng.random();
      let xBase;
      
      if (key === 'precoBoiMagro' || key === 'precoConcentrado') {
        const { alpha, beta } = estimateLogLogisticParams(mean, stdDev);
        xBase = inverseLogLogisticCDF(p, alpha, beta);
      } else if (key === 'precoBoiGordo') {
        const { mu, b } = estimateLaplaceParams(mean, stdDev);
        xBase = inverseLaplaceCDF(p, mu, b);
      } else if (key === 'precoVolumoso') {
        const { alpha, beta } = estimatePearson5Params(mean, stdDev);
        xBase = inversePearson5CDF(p, alpha, beta);
      } else {
        xBase = inverseNormalCDF(p, mean, stdDev);
      }

      // Ponto com incremento
      const pDelta = Math.min(0.9999, p + delta);
      let xDelta;
      
      if (key === 'precoBoiMagro' || key === 'precoConcentrado') {
        const { alpha, beta } = estimateLogLogisticParams(mean, stdDev);
        xDelta = inverseLogLogisticCDF(pDelta, alpha, beta);
      } else if (key === 'precoBoiGordo') {
        const { mu, b } = estimateLaplaceParams(mean, stdDev);
        xDelta = inverseLaplaceCDF(pDelta, mu, b);
      } else if (key === 'precoVolumoso') {
        const { alpha, beta } = estimatePearson5Params(mean, stdDev);
        xDelta = inversePearson5CDF(pDelta, alpha, beta);
      } else {
        xDelta = inverseNormalCDF(pDelta, mean, stdDev);
      }

      // Simulação base
      const inputsBase = { ...inputs, [key]: xBase };
      const resBase = calculateSimulation(inputsBase);
      
      // Simulação com delta
      const inputsDelta = { ...inputs, [key]: xDelta };
      const resDelta = calculateSimulation(inputsDelta);
      
      // Efeito Elementar (Normalizado pelo desvio padrão para comparação justa)
      const ee = (resDelta.vpl - resBase.vpl) / (pDelta - p);
      elementaryEffects.push(ee);
    }

    const muStar = elementaryEffects.reduce((sum, ee) => sum + Math.abs(ee), 0) / r;
    const mu = elementaryEffects.reduce((sum, ee) => sum + ee, 0) / r;
    const sigma = Math.sqrt(elementaryEffects.reduce((sum, ee) => sum + Math.pow(ee - mu, 2), 0) / r);

    results.push({
      nome: NOMES_AMIGAVEIS[key] || key,
      muStar,
      sigma
    });
  }

  return results.sort((a, b) => b.muStar - a.muStar);
}

function calculateMultipleRegression(X_map: Record<string, number[]>, Y: number[]) {
  const keys = Object.keys(X_map);
  const n = Y.length;
  const k_orig = keys.length;

  if (k_orig === 0) return { betas: [], r2: 0, stds: {} };

  // 1. Standardize Y
  const meanY = Y.reduce((a, b) => a + b, 0) / n;
  const stdY = Math.sqrt(Y.reduce((a, b) => a + Math.pow(b - meanY, 2), 0) / n);
  const Y_std = Y.map(y => (y - meanY) / (stdY || 1));

  // 2. Standardize X and store STDs
  const X_std_map: Record<string, number[]> = {};
  const stds: Record<string, number> = {};
  keys.forEach(key => {
    const x = X_map[key];
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const stdX = Math.sqrt(x.reduce((a, b) => a + Math.pow(b - meanX, 2), 0) / n);
    stds[key] = stdX;
    X_std_map[key] = x.map(xi => (xi - meanX) / (stdX || 1));
  });

  // 3. Identify top 8 variables for interactions (using simple correlation)
  const correlations = keys.map(key => {
    const x = X_std_map[key];
    const corr = x.reduce((sum, xi, i) => sum + xi * Y_std[i], 0) / n;
    return { key, absCorr: Math.abs(corr) };
  })
  .sort((a, b) => b.absCorr - a.absCorr)
  .slice(0, 8)
  .map(c => c.key);

  // 4. Create interaction terms
  const interactionKeys: string[] = [];
  const X_interactions: Record<string, number[]> = {};

  for (let i = 0; i < correlations.length; i++) {
    for (let j = i + 1; j < correlations.length; j++) {
      const key1 = correlations[i];
      const key2 = correlations[j];
      const interactionKey = `${key1}:${key2}`;
      interactionKeys.push(interactionKey);
      
      const interactionValues = X_std_map[key1].map((v, idx) => v * X_std_map[key2][idx]);
      // Standardize the interaction term itself
      const meanInt = interactionValues.reduce((a, b) => a + b, 0) / n;
      const stdInt = Math.sqrt(interactionValues.reduce((a, b) => a + Math.pow(b - meanInt, 2), 0) / n);
      X_interactions[interactionKey] = interactionValues.map(v => (v - meanInt) / (stdInt || 1));
    }
  }

  // 4b. Create squared terms for top 5 variables to capture non-linearity
  const squaredKeys: string[] = [];
  const X_squared: Record<string, number[]> = {};
  correlations.slice(0, 5).forEach(key => {
    const squaredKey = `${key}^2`;
    squaredKeys.push(squaredKey);
    const squaredValues = X_std_map[key].map(v => v * v);
    const meanSq = squaredValues.reduce((a, b) => a + b, 0) / n;
    const stdSq = Math.sqrt(squaredValues.reduce((a, b) => a + Math.pow(b - meanSq, 2), 0) / n);
    X_squared[squaredKey] = squaredValues.map(v => (v - meanSq) / (stdSq || 1));
  });

  const allKeys = [...keys, ...interactionKeys, ...squaredKeys];
  const k = allKeys.length;

  // 5. Build X matrix (n x k)
  const X_matrix = Array.from({ length: n }, (_, i) => [
    ...keys.map(key => X_std_map[key][i]),
    ...interactionKeys.map(key => X_interactions[key][i]),
    ...squaredKeys.map(key => X_squared[key][i])
  ]);

  // 6. X'X (k x k) - Otimizado usando simetria (triangular superior) para dobrar a velocidade
  const XtX = Array.from({ length: k }, () => Array(k).fill(0));
  for (let i = 0; i < k; i++) {
    for (let j = i; j < k; j++) {
      let sum = 0;
      for (let l = 0; l < n; l++) {
        sum += X_matrix[l][i] * X_matrix[l][j];
      }
      XtX[i][j] = sum;
      XtX[j][i] = sum;
    }
  }

  // 7. X'Y (k x 1)
  const XtY = Array(k).fill(0);
  for (let i = 0; i < k; i++) {
    for (let l = 0; l < n; l++) {
      XtY[i] += X_matrix[l][i] * Y_std[l];
    }
  }

  // 8. Solve (XtX + lambda*I) * Beta = XtY
  const lambda = 0.001; // Reduced regularization for simulation data (no noise)
  for (let i = 0; i < k; i++) {
    XtX[i][i] += lambda * n;
  }

  const Beta = solveLinearSystem(XtX, XtY);

  // 9. Calculate R2
  let rss = 0;
  let tss = 0;
  for (let i = 0; i < n; i++) {
    let y_pred = 0;
    for (let j = 0; j < k; j++) {
      y_pred += X_matrix[i][j] * Beta[j];
    }
    rss += Math.pow(Y_std[i] - y_pred, 2);
    tss += Math.pow(Y_std[i], 2);
  }
  const r2 = 1 - (rss / (tss || 1));

  const betas = allKeys.map((key, i) => {
    let nome = NOMES_AMIGAVEIS[key] || key;
    if (key.includes(':')) {
      const [k1, k2] = key.split(':');
      nome = `Interação: ${NOMES_AMIGAVEIS[k1] || k1} x ${NOMES_AMIGAVEIS[k2] || k2}`;
    } else if (key.includes('^2')) {
      const baseKey = key.replace('^2', '');
      nome = `Não-linear: (${NOMES_AMIGAVEIS[baseKey] || baseKey})²`;
    }
    return {
      key,
      nome,
      beta: Beta[i]
    };
  })
  .filter(r => Math.abs(r.beta) > 0.001)
  .sort((a, b) => Math.abs(b.beta) - Math.abs(a.beta));

  return { betas, r2, stds };
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let max = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
    }
    [A[i], A[max]] = [A[max], A[i]];
    [b[i], b[max]] = [b[max], b[i]];

    for (let j = i + 1; j < n; j++) {
      const factor = A[j][i] / (A[i][i] || 1);
      b[j] -= factor * b[i];
      for (let k = i; k < n; k++) {
        A[j][k] -= factor * A[i][k];
      }
    }
  }

  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (b[i] - sum) / (A[i][i] || 1);
  }
  return x;
}
