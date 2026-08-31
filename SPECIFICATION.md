# ESPECIFICAÇÃO TÉCNICA E ARQUITETURAL
## Módulo: Ultrassom + Otimização do Abate (Determinístico & Probabilístico)
### Sistema-Alvo: SimuBoi — Simulador de Confinamento Bovino Avançado

---

## A) Visão Geral do Módulo

### 1. O que o módulo faz
O módulo **"Ultrassom + Otimização do Abate (Determinístico & Probabilístico)"** é uma expansão científica e operacional para o sistema **SimuBoi**. Ele substitui a projeção linear tradicional de ganho de carcaça e acabamento de gordura por um motor de predição dinâmico realimentado por exames semanais de ultrassonografia em tempo real (*Real-Time Ultrasound - RTU*). O módulo processa dados individuais de área de olho de lombo (AOL/REA), espessura de gordura subcutânea (EGS/BFT) e gordura intramuscular (marmoreio/IMF%) para projetar curvas personalizadas de deposição de tecidos, estimar a janela ótima de abate (sob a ótica de lucro marginal máximo) e quantificar os riscos associados via amostragem estocástica de alto desempenho.

```
+---------------------------------------------------------------------------------+
|                                    SIMUBOI                                      |
|  +------------------------+  Economia de Lote   +----------------------------+  |
|  |   Motor Econômico      |====================>|  Módulo Ultrassom & Abate  |  |
|  |  (Custos, Preço Gordo) |                     |  - Reotimização semanal    |  |
|  +------------------------+                     |  - Previsão Determinística |  |
|              ^                                  |  - Amostragem LHS (Risco)  |  |
|              |                                  |  - Pipeline de Calibração  |  |
|              | Atualiza premissas de carcaça    +----------------------------+  |
|              | e taxas de ganho reais                         ||                |
|              +================================================+                 |
+---------------------------------------------------------------------------------+
```

### 2. Para quem se destina e quais decisões suporta
*   **Gerentes de Confinamento e Nutricionistas:** Decisão sobre a formulação e transição de dietas de terminação com base na evolução real do acabamento subcutâneo (EGS) e marmoreio (IMF), evitando sobre-engorda ineficiente (onde a conversão alimentar piora drasticamente).
*   **Diretores e Compradores de Gado (Originação):** Decisão sobre o agendamento de escalas de abate com frigoríficos parceiros com base na janela de peso de carcaça quente (PCQ) e acabamento contratual ideal, mitigando penalizações por carcaças leves, excessivamente gordas ("gordura excessiva") ou sub-acabadas ("gordura escassa").
*   **Analistas de Risco / CFOs do Agro:** Decisão de hedge e precificação robusta com base em distribuições probabilísticas de lucro líquido real por animal e por lote, utilizando métricas de cauda como *Value-at-Risk (VaR)* e *Conditional Value-at-Risk (CVaR)*.

### 3. Integração com a Plataforma SimuBoi Existente
O módulo funciona como um consumidor e refinador das estruturas de dados correntes. Ele consome as variáveis de custos operacionais (fixos e variáveis), custos de dieta por quilograma de matéria seca (MS) gerados em `dietOptimizerService.ts` e preços de mercado atualizados por `marketService.ts`. O módulo processa o vetor de `ultrassom` (já timidamente previsto em `types.ts` através de `Ultrassom[]`) e estende a simulação estocástica de `simulationService.ts` para projetar não apenas o peso, mas a curva de transição de tecidos (músculo vs. gordura) e o impacto nos contratos de bonificação por tipificação de carcaça.

---

## B) Arquitetura de Integração

O módulo pode ser integrado ao ecossistema SimuBoi por meio de duas abordagens de arquitetura distintas. A escolha depende da escala da fazenda e da infraestrutura de TI do cliente.

### Opção 1: Módulo como Serviço Autônomo (Microserviço Remoto)
Nesta opção, o motor de otimização e simulação estocástica (LHS) é implantado em um contêiner separado (e.g., Python/FastAPI ou Go) exposto via REST API ou gRPC.

*   **Prós:**
    *   **Isolamento Computacional:** Simulações LHS massivas ($100.000$ iterações) rodam sem impactar a interface do usuário ou o servidor principal do SimuBoi.
    *   **Modularidade de Linguagem:** Permite o uso de bibliotecas de computação científica maduras (NumPy, SciPy, Pandas) para ajuste de curvas e inteligência artificial de calibração.
    *   **Escalabilidade Horizontal:** Pode ser dimensionado sob demanda (e.g., via Google Cloud Run ou Kubernetes autoscaling) quando múltiplos lotes são processados simultaneamente.
*   **Contras:**
    *   **Latência de Rede:** Introduz chamadas HTTP/gRPC (geralmente entre $80\text{ms}$ e $250\text{ms}$ dependendo do payload).
    *   **Complexidade de Rede:** Exige gerenciamento de segurança (OAuth2/Tokens), DNS e resiliência a falhas de comunicação.
*   **Custo Computacional:** Médio/Alto (custos operacionais associados ao provisionamento de contêineres e tráfego de dados).
*   **Governança e Versionamento:** Excelente. O serviço possui repositório próprio, ciclo de CI/CD independente e versionamento semântico de API (e.g., `/api/v1/slaughter-optimization`).

### Opção 2: Módulo como Biblioteca Interna (Módulo Modular Monolítico)
O motor de simulação é implementado como uma biblioteca compilada (WebAssembly via Rust/C++ ou TypeScript nativo rodando em Web Workers no navegador ou Node.js no backend).

*   **Prós:**
    *   **Latência Zero:** Sem chamadas de rede; comunicação direta na memória do processo ($< 5\text{ms}$).
    *   **Simplicidade de Infraestrutura:** Não há novos contêineres para gerenciar. O build é acoplado ao pipeline existente do SimuBoi (Vite/TypeScript).
    *   **Custo Zero de Servidor:** Em computação cliente-side (Web Workers), o custo de processamento do LHS é distribuído para o dispositivo do próprio usuário.
*   **Contras:**
    *   **Sobrecarga de CPU Local:** Dispositivos móveis ou computadores de baixa performance podem apresentar lentidão temporária durante simulações complexas se os Web Workers não forem bem geridos.
    *   **Acoplamento de Código:** Atualizações no modelo biológico exigem novo deploy completo do frontend.
*   **Custo Computacional:** Mínimo (custo de hospedagem estática).
*   **Governança e Versionamento:** Médio. Segue estritamente as regras de versionamento do monólito e exige testes de regressão automatizados para evitar que quebras no motor afetem a interface.

---

### Fluxo de Dados End-to-End (Abordagem Híbrida Recomendada)

```
+-------------------------------------------------------------------------------------------------+
|                                     Fluxo de Dados End-to-End                                   |
+-------------------------------------------------------------------------------------------------+
[1. Coleta Diária] ------> (Peso, DMI, GMD, Custos do Lote) \
                                                             +---> [3. Motor de Otimização]
[2. RTU Semanal]  ------> (AOL, EGS, IMF, Técnico ID)     /             |
                                                                        v
[4. Regras Contrato] ---> (Grades de Bonificação Frigorífico) -------> [ Otimização Determinística ]
                                                                        | -> Projeta t* ótimo
                                                                        v
[5. Cenários Risco] ----> (Variáveis LHS: Preços, Desvios) ----------> [ Otimização Probabilística ]
                                                                        | -> Dia Ótimo Robusto (VaR)
                                                                        v
[6. Abate Real] --------> (PCQ Real, Acabamento, Preço Pago) ---------> [ Pipeline de Calibração ]
                                                                        | -> Ajusta multiplicadores de viés
                                                                        v
                                                                   [7. Audit Log / Logs]
```

1.  **Ingestão de Dados:** O sistema coleta dados diários de performance e o exame de ultrassom semanal (RTU).
2.  **Agregação e Filtragem:** Os dados passam pelo motor de qualidade (remoção de outliers e efeito de operador via Bland-Altman).
3.  **Processamento Econômico:** O motor econômico calcula as taxas marginais de custo do lote.
4.  **Predição de Carcaça:** O modelo biológico projeta a trajetória de peso vivo, rendimento de carcaça, EGS e IMF até 150 dias de cocho.
5.  **Simulação Probabilística LHS:** Rodam-se 100.000 iterações com correlação via Cópulas para determinar o risco físico e financeiro por dia futuro.
6.  **Geração de Recomendações:** A interface renderiza o painel operacional com os dias ótimos ($t^*$) determinístico e robusto.
7.  **Sincronização de Abate (Ground Truth):** Os dados de romaneio do frigorífico retroalimentam o pipeline de calibração para ajustar os coeficientes de predição para o próximo ciclo de confinamento.

---

## C) Contratos de Dados / Interfaces (Schemas)

Os contratos de dados abaixo usam notações TypeScript e JSON Schema conceitual para garantir a integração sem costuras com o código do SimuBoi (respeitando interfaces como `Pesagem` e `Ultrassom` definidas em `src/types.ts`).

### 1. Entradas Requeridas (Inputs)

```typescript
// Entidades de Negócio Core estendidas para o módulo
export interface Animal {
  id: string;               // Identificador eletrônico (RFID brinco)
  raca: 'nelore' | 'cruzamento' | 'holandes';
  sexo: 'macho' | 'femea' | 'inteiro';
  frameSize: 'pequeno' | 'medio' | 'grande';
  dataEntrada: string;      // ISO 8601
  pesoEntrada: number;      // kg
  loteId: string;
}

export interface Lote {
  id: string;
  nome: string;
  capacidadeEstatica: number;
  dataFormacao: string;
}

export interface DailyPerformance {
  animalId: string;
  data: string;
  pesoReal?: number;        // Peso coletado em balança eletrônica/passagem
  consumoMSRegistrado?: number; // kg MS/dia (DMI individual via cocho eletrônico)
  custoDietaDia: number;    // Custo real acumulado da ração consumida no dia (R$)
  custoFixoDia: number;     // Custo operacional rateado por animal/dia (R$)
}

export interface UltrasoundExam {
  id: string;
  animalId: string;
  dataExame: string;
  diaDeCocho: number;       // Dias desde a entrada no confinamento
  aol: number;              // Área de Olho de Lombo (cm²)
  egs: number;              // Espessura de Gordura Subcutânea (mm)
  imf: number;              // Gordura Intramuscular (% de marmoreio)
  tecnicoId: string;        // ID do operador do ultrassom (para análise de viés)
  equipamentoId: string;    // ID do transdutor/aparelho de RTU
}

export interface ContractRule {
  id: string;
  nomeFrigorifico: string;
  basePrecoArroba: number;  // Preço padrão para classificação de referência (R$/@)
  limitesPesoCarcaca: {
    minimoKg: number;       // Ex: 240 kg (16 arrobas)
    maximoKg: number;       // Ex: 360 kg (24 arrobas)
    penalidadePorQuiloFora: number; // R$ por kg excedente/defasado
  };
  gradeAcabamentoEGS: {
    escala: '1_ausente' | '2_escassa' | '3_mediana' | '4_uniforme' | '5_excessiva';
    egsMinMm: number;
    egsMaxMm: number;
    bonificacaoMoeda: number;   // R$ por arroba
    penalizacaoMoeda: number;  // R$ por arroba
  }[];
  gradeMarmoreioIMF?: {
    imfMinPerc: number;
    imfMaxPerc: number;
    bonificacaoMoeda: number;   // R$ por arroba
  }[];
}

export interface SlaughterResult {
  animalId: string;
  dataAbate: string;
  pesoCarcacaQuenteReal: number; // kg (PCQ oficial do frigorífico)
  rendimentoCarcacaReal: number; // % (PCQ / Peso Vivo de Embarque)
  egsFrigorifico: '1_ausente' | '2_escassa' | '3_mediana' | '4_uniforme' | '5_excessiva';
  imfFrigorificoPerc?: number;   // Real do laboratório ou tipificação visual de marmoreio
  pHReal: number;                // Medição de pH 24h para qualidade de carne (deve ser < 5.8)
  precoEfetivoPago: number;      // R$ por arroba efetivamente liquidada
  receitaLiquidaReal: number;    // R$ total recebido por animal
}
```

### 2. Saídas Produzidas (Outputs)

```typescript
export interface DecisionResult {
  loteId: string;
  dataCalculo: string;
  tEstrelaDeterminista: number;   // Dia ótimo de abate recomendado (dias de cocho)
  tEstrelaRobusto: number;        // Dia ótimo ajustado pela aversão a risco (dias de cocho)
  driversDeterminantes: {
    fator: string;                // Ex: "Custo Marginal da Dieta excedeu Ganho de Carcaça"
    impactoPercentual: number;    // Contribuição para a decisão
    direcao: 'acelerar' | 'postergar';
  }[];
  metricasHoje: {
    margemAcumuladaMedia: number; // R$/animal
    probabilidadePrejuizo: number; // %
    var95Lucro: number;           // R$/animal
    cvar95Lucro: number;          // R$/animal
  };
}

export interface SimulationRun {
  runId: string;
  timestamp: string;
  seed: number;
  versaoModelo: string;
  versaoRegrasContrato: string;
  configLHS: {
    nIteracoes: number;
    copulaUtilizada: 'gaussian' | 'clayton' | 'gumbel' | 'spearman' | 'independent';
    variaveisIncertas: string[];
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  usuarioId: string;
  acao: 'gerar_recomendacao' | 'aprovar_escala_abate' | 'recalibrar_modelo';
  parametrosEntradaHash: string; // SHA-256 para auditoria de reprodutibilidade
  payloadGravado: string;        // JSON compactado com a recomendação daquela data
  versaoCodigo: string;          // Git commit hash correspondente
}
```

### 3. Estratégia de Versionamento Triplo
Para garantir a reprodutibilidade absoluta (auditoria) e evitar que mudanças de mercado distorçam as análises históricas de performance do modelo, o módulo implementa um esquema de **Versionamento Triplo**:

1.  **ModelVersion (Versão do Modelo Biológico - e.g., `v2.4.1`):** Rastreia as equações biológicas e os coeficientes de predição de crescimento de carcaça e deposição de gordura.
2.  **ContractVersion (Versão das Regras de Contrato - e.g., `c2026_Q3_JBS`):** Rastreia as tabelas de prêmios e penalidades do frigorífico ativo. Se o frigorífico mudar a grade no meio do lote, as simulações passadas mantêm a assinatura original.
3.  **EconomicVersion (Versão dos Parâmetros Econômicos - e.g., `e2026_07_12`):** Rastreia os preços instantâneos da ração, diárias operacionais, taxa de desconto (TMA) e preço base do boi gordo vigentes na data de cálculo.

---

## D) Motor Determinístico

O motor determinístico estabelece a projeção base (cenário médio) para cada animal e lote.

### 1. Separação de Responsabilidades (SimuBoi vs. Módulo)

```
+------------------------------------------+       +------------------------------------------+
|          SISTEMA SIMUBOI (EXISTENTE)     |       |          MÓDULO NOVO DE ULTRASSOM        |
|  - Formulação de Dietas (`dietOptimizer`) |       |  - Projeção de deposição de tecidos      |
|  - Cálculo de custos operacionais fixos  |======>|  - Equações diferenciais de GMD real     |
|  - Coleta de preços de mercado históricos |       |  - Simulação de bonificação por EGS/IMF  |
|  - Gestão de custos de diária            |       |  - Cálculo do ponto ótimo marginal (t*)  |
+------------------------------------------+       +------------------------------------------+
```

### 2. Regra Matemática do Dia Ótimo de Abate ($t^*$)
A determinação do dia ótimo de abate baseia-se na teoria microeconômica da maximização do lucro acumulado ao longo do tempo de permanência em cocho ($t$). O lucro individual no dia $t$ é definido como:

$$L(t) = \text{Receita}(t) - \text{CustoAcumulado}(t)$$

Onde:
*   $$\text{Receita}(t) = \left[ \frac{\text{PV}(t) \times (1 - \text{QTransp}) \times \frac{\text{RC}(t)}{100}}{15} \right] \times \left( \text{PreçoGordo} \times \left(1 + \frac{\text{Bonif}(t)}{100}\right) \right) + \text{Esterco}(t) + \text{Residual}$$
    *   $\text{PV}(t)$ é o Peso Vivo no dia $t$ (kg).
    *   $\text{QTransp}$ é a quebra de peso no transporte para o frigorífico (%).
    *   $\text{RC}(t)$ é o Rendimento de Carcaça dinâmico no dia $t$ (%).
    *   $\text{Bonif}(t)$ é a bonificação percentual contratual, que depende diretamente da Espessura de Gordura Subcutânea ($\text{EGS}(t)$) e do Marmoreio ($\text{IMF}(t)$).
*   $$\text{CustoAcumulado}(t) = \text{CustoCompraBoi} + \int_{0}^{t} \left( \text{CustoDieta}(x) + \text{CustoFixoDia} + \text{OutrasDespesasDia} \right) dx$$

O **Dia Ótimo de Abate ($t^*$)** é o ponto de tempo que maximiza o lucro líquido. Matematicamente, ocorre quando o lucro marginal em relação ao tempo se anula:

$$\frac{dL(t)}{dt} = 0 \implies \frac{d\text{Receita}(t)}{dt} = \frac{d\text{CustoAcumulado}(t)}{dt}$$

Em termos práticos de confinamento, o gado deve ser abatido no dia em que a receita gerada por mais um dia de cocho (ganho de peso em arrobas + melhoria de classificação por gordura) é exatamente igual ao custo marginal de manter o animal por mais esse dia (consumo de ração + custos operacionais + juros do capital empatado).

#### Restrições e Penalidades Ativas:
O modelo resolve o problema de otimização sob as seguintes restrições reais de contorno:
1.  **Restrição de Peso Máximo de Carcaça ($\text{PCQ} \le \text{PCQ}_{\max}$):** Frigoríficos aplicam deságios severos (muitas vezes superiores a $15\%$) para carcaças com peso superior a 24 arrobas ($360\text{ kg}$) devido à limitação física das linhas de abate.
2.  **Restrição de Acabamento Mínimo ($\text{EGS}(t) \ge \text{EGS}_{\min}$):** Carcaças classificadas como "gordura escassa" ($\text{EGS} < 3\text{ mm}$) sofrem penalizações por queima pelo frio nas câmaras de resfriamento.
3.  **Janela Operacional do Frigorífico:** Intervalo logístico de agendamento de escalas ($\text{DiasCocho} \in [t_{\min}, t_{\max}]$).

### 3. Motor de Explicabilidade (Drivers Econômicos/Biológicos)
A decisão de recomendar o abate hoje ou estender o ciclo é decomposta usando a técnica de atribuição de contribuição marginal (baseada conceitualmente nos Valores de Shapley). O módulo detalha os Top 4 drivers explicativos na tela do usuário:
1.  **Efeito Eficiência Biológica (Alimentar):** Declínio do ganho de peso diário por quilo de alimento consumido devido à substituição da deposição de tecido muscular (água e proteína) por gordura (tecido altamente energético).
2.  **Efeito Contrato (Salto de Bonificação):** Proximidade do limite de transição de categoria de acabamento (e.g., de "Gordura Escassa" para "Gordura Mediana" de $3\text{ mm}$ a $6\text{ mm}$), que gera um acréscimo abrupto na receita.
3.  **Efeito Custos de Insumos:** Impacto de flutuações repentinas no custo do concentrado/volumoso no custo marginal do dia de confinamento.
4.  **Custo de Oportunidade do Capital:** Juros acumulados sobre o capital empatado no gado e nos insumos, calculados com base na TMA definida no SimuBoi.

---

## E) Motor Probabilístico (LHS)

A amostragem determinística falha ao ignorar a volatilidade intrínseca dos preços do agro e o comportamento biológico imprevisível de lotes de gado. O SimuBoi já utiliza LHS, e este módulo adapta a simulação estocástica de forma estrita.

### 1. Variáveis Incertas e Distribuições Recomendadas

| Variável | Distribuição | Parâmetros Recomendados | Justificativa Científica e Fonte |
| :--- | :--- | :--- | :--- |
| **GMD (Ganho Médio Diário)** | **Normal Truncada** | $\mu = \text{GMD}_{\text{esperado}}$<br>$\sigma \in [0.12, 0.22]$<br>$\text{Min} = 0.4$, $\text{Max} = 2.5\text{ kg/dia}$ | Captura a variabilidade genética individual do rebanho e desvios climáticos locais. <br>*(NASEM, 2016)* |
| **Preço Futuro do Boi Gordo** | **Laplace (Dupla Exponencial)** | $\mu = \text{Preço Base}$<br>$b \approx 4.5$ (fator de escala de cauda) | Modelos de séries temporais de commodities pecuárias apresentam caudas pesadas e leptocurtose devido a choques rápidos de mercado. <br>*(Pacheco et al., 2014)* |
| **Preço do Concentrado / Insumos** | **Log-Normal / Log-Logística** | $\mu_{\text{log}}, \sigma_{\text{log}}$ ajustados do mercado | Preços de grãos (milho, farelo de soja) são estritamente positivos e apresentam assimetria à direita. <br>*(Pacheco et al., 2014)* |
| **Rendimento de Carcaça (RC)** | **Beta** | $\alpha = 45$, $\beta = 38$<br>(Mapeado para intervalo $[48\%, 58\%]$) | O rendimento é fisicamente limitado entre $48\%$ e $58\%$ para animais de corte, com grande concentração em torno de $53.5\%$. <br>*(NASEM, 2016)* |
| **Espessura de Gordura Inicial (EGS_0)**| **Gama** | $\alpha = 3.5$, $\beta = 0.5$ | O acabamento inicial de carcaça não é negativo e apresenta assimetria acentuada à direita. <br>*(Perkins et al., 1992)* |

### 2. Matriz de Correlação e Cópulas
O módulo implementa correlações não lineares entre as variáveis de entrada para evitar simulações de cenários biologicamente irrealistas (e.g., animal com GMD baixíssimo, mas rendimento de carcaça extremamente alto).
*   **GMD vs. Rendimento de Carcaça:** Correlação positiva ($+0.45$).
*   **GMD vs. Espessura de Gordura (EGS):** Correlação positiva ($+0.35$).
*   **Preço do Boi Magro vs. Preço do Boi Gordo:** Correlação positiva de mercado ($+0.75$).
*   **GMD vs. Consumo de Matéria Seca (CMS):** Correlação positiva ($+0.60$).

O motor utiliza a **Cópula de Clayton** para modelar forte dependência nas caudas esquerdas (simula de forma acurada cenários onde o estresse térmico severo causa colapso simultâneo do GMD e do consumo de ração) e a **Cópula de Gumbel** para modelar dependência nas caudas direitas (altos preços de insumos correlacionados com picos de preços de bois).

```typescript
// Pseudocódigo de Inicialização da Cópula de Clayton para o LHS
function generateClaytonCopulaSamples(N: number, nVars: number, theta: number, rng: MersenneTwister): number[][] {
  // Passagem 1: Amostrar variável latente V da distribuição Gama(1/theta, 1)
  const v = randomGamma(1 / theta, 1, rng);
  const uSamples: number[][] = Array.from({ length: nVars }, () => []);
  
  for (let j = 0; j < nVars; j++) {
    for (let i = 0; i < N; i++) {
      const independentUniform = rng.random();
      const exponentialW = -Math.log(independentUniform);
      // Aplicar função geradora de cópula de Clayton
      uSamples[j].push(Math.pow(1 + exponentialW / v, -1 / theta));
    }
  }
  return uSamples;
}
```

### 3. Controle de Desempenho Computacional
Para garantir que o módulo rode de forma fluida no frontend, implementa-se as seguintes diretrizes de otimização:
*   **N Dinâmico Adaptativo:** O usuário pode selecionar presets: *Rápido* ($N = 1.000$ iterações, ideal para exploração inicial), *Padrão* ($N = 10.000$, para tomada de decisão) ou *Científico* ($N = 100.000$, para auditorias robustas).
*   **Cache da Matriz de Decomposição de Cholesky:** A matriz de Cholesky ($L$) depende apenas da matriz de correlação pré-configurada do lote. Ela é calculada uma única vez e mantida em memória, evitando computações redundantes de $O(K^3)$ a cada execução.
*   **Execução Incremental:** A simulação LHS é delegada a um **Web Worker** dedicado, operando em segundo plano. Os resultados intermediários são enviados para o thread principal em pacotes de $10\%$, permitindo a renderização progressiva do gráfico sem travar a interface de usuário.

### 4. Métricas de Cauda para Análise de Risco (Risco e Retorno)
A avaliação financeira estocástica abandona a média simples de lucro e reporta:
*   **Value-at-Risk (VaR) de Lucro a 95% ($\text{VaR}_{95}$):** O pior prejuízo financeiro esperado que não será excedido com $95\%$ de probabilidade.
*   **Conditional Value-at-Risk (CVaR) de Lucro a 95% ($\text{CVaR}_{95}$):** A média esperada do prejuízo financeiro nos $5\%$ de piores cenários (perda na cauda extrema).

$$\text{CVaR}_{\alpha}(L) = E[L \mid L \ge \text{VaR}_{\alpha}(L)]$$

*   **Decisão Ótima Robusta ($t^*_{\text{robusto}}$):** O dia de abate que maximiza o lucro esperado sob a restrição de que a Probabilidade de Prejuízo do lote seja inferior ao limite de tolerância definido pelo usuário (e.g., $P(\text{Lucro} < 0) \le 5\%$).

---

## F) Integração do Ultrassom Semanal

O exame de ultrassom fornece o pulso dinâmico biológico que realimenta as equações matemáticas do simulador.

### 1. Atualização Recursiva das Curvas de Deposição (Efeito RTU)
O modelo inicial de deposição de tecidos de SimuBoi (que usa o peso inicial do animal, raça e frame size) projeta uma trajetória teórica de crescimento. Ao receber exames reais de ultrassom semanal ($t_{\text{exame}}$), o módulo recalcula os coeficientes individuais do modelo de Gompertz de deposição de gordura:

$$\text{EGS}(t) = \text{EGS}_{\infty} \times e^{-e^{-k(t - T_0)}}$$

Onde:
*   $\text{EGS}_{\infty}$ é o potencial genético assintótico de espessura de gordura (mm).
*   $k$ é a taxa de maturação e deposição lipídica.
*   $T_0$ é o ponto de inflexão de deposição acelerada.

Sempre que um novo ponto de ultrassom é registrado, realiza-se um ajuste de curvas por mínimos quadrados não lineares ponderados (Levenberg-Marquardt), atribuindo maior peso estatístico às medições mais recentes para corrigir os desvios sistemáticos de GMD e conversão de energia líquida de crescimento ($NE_g$).

### 2. Controle de Qualidade de Dados (Filtro Antivieses)
Dados coletados em curral de manejo são altamente suscetíveis a ruídos de medição (e.g., animal se movendo, falta de acoplamento do gel transdutor ou erros de digitação do técnico). O módulo aplica três barreiras de validação sequencial:

1.  **Filtro de Inconsistência Temporal (Gradiente Máximo):**
    *   Um animal não pode encolher sua carcaça ou perder gordura subcutânea de forma abrupta em uma semana normal de terminação. É acionado um alerta se $\text{EGS}_t < \text{EGS}_{t-7} - 1.2\text{ mm}$ ou se a AOL apresentar variação impossível ($|\text{AOL}_t - \text{AOL}_{t-7}| > 15\text{ cm}^2$).
2.  **Modelagem de Erro de Operador (Análise Bland-Altman):**
    *   Cada operador cadastrado no sistema possui um fator histórico de viés e desvio padrão de repetibilidade calibrado contra as carcaças reais no frigorífico. Se o Operador A tende a subestimar a gordura em $0.5\text{ mm}$, o sistema adiciona automaticamente $+0.5\text{ mm}$ à leitura antes de passá-la para o motor de otimização, reduzindo o erro sistemático.
3.  **Tratamento de Dados Ausentes (Imputação de Exames Perdidos):**
    *   Caso um animal não tenha sido coletado na pesagem/ultrassonografia da semana (e.g., fuga do lote ou estresse), o sistema aplica uma **Interpolação Linear Local baseada na mediana do lote** ajustada pelo GMD individual acumulado do animal.

---

## G) Calibração e Validação com Resultados Reais de Abate (Ground Truth)

O fechamento de lote no frigorífico representa a verdade absoluta de dados. O módulo utiliza esses dados para calibrar os modelos biológicos de forma autoajustável.

```
       [ Romaneio do Frigorífico ]
                    |
                    v
    [ Pipeline de Validação Temporal ]
     - Vincula RFID -> Gancho Frigorífico
     - Calcula MAE, RMSE e Viés Sistemático
                    |
                    v
  [ Regressão Linear Robusta / Ridge ]
  - Ajusta multiplicadores de crescimento (k)
  - Corrige estimativa de Rendimento de Carcaça
                    |
                    v
 [ Atualiza Versão do Modelo (e.g., v2.4.2) ]
```

### 1. Pipeline de Feedback Estruturado
1.  **Vinculação de Dados:** O sistema importa o arquivo XML/CSV do romaneio de abate oficial (JBS, Marfrig, Minerva, etc.). O arquivo é cruzado com a rastreabilidade do confinamento usando o brinco eletrônico (RFID) ou o número do gancho na linha de abate.
2.  **Medição do Erro (Validação):** O módulo calcula o desvio entre as predições de acabamento da última simulação e o veredito real do frigorífico:
    *   $$\text{Erro}_{\text{RC}} = \text{RC}_{\text{Real}} - \text{RC}_{\text{Predita}}$$
    *   $$\text{Erro}_{\text{EGS}} = \text{EGS}_{\text{Real}} - \text{EGS}_{\text{Predita}}$$

### 2. Algoritmo de Redução de Viés (Calibração Local)
O viés acumulado por dieta, operador, lote ou raça é corrigido por meio de uma **Regressão Ridge Hierárquica** (para evitar sobreajuste com amostras pequenas). Os fatores de ajuste biológico $F_{\text{ajuste}}$ são multiplicados pelas projeções de carcaça originais:

$$F_{\text{ajuste}} = w_0 + w_1 \times \text{Raça} + w_2 \times \text{Operador} + w_3 \times \text{Nutrição}$$

Essa calibração ajusta os parâmetros de energia líquida de manutenção ($NE_m$) e crescimento ($NE_g$) adaptados à realidade específica da propriedade (Microclima e Manejo).

### 3. Métricas de Performance do Modelo
O dashboard de calibração exibe relatórios estatísticos periódicos utilizando as métricas descritas por **Bland & Altman (1986)**:
*   **MAE (Erro Médio Absoluto):** A média de erro bruto das predições de peso de carcaça (deve ser $< 4.5\text{ kg}$).
*   **RMSE (Raiz do Erro Quadrático Médio):** Penaliza erros severos de projeção de gordura.
*   **Viés de Calibração Probabilística (Reliability Diagram):** Garante que se o modelo LHS indica $80\%$ de chance de um animal obter acabamento uniforme, pelo menos $80\%$ das carcaças de fato obtenham essa tipificação no frigorífico.

### 4. Monitoramento de Drift (Desvio do Modelo) e Alarmes
*   **Desvio de Clima/Dieta (Drift):** Se a acurácia do modelo cair em mais de $25\%$ por três lotes consecutivos (e.g., MAE de peso de carcaça subir para $> 8.5\text{ kg}$), o sistema dispara um alarme na tela do usuário indicando "Drift do Modelo Biológico Detectado" e sugere a recalibração imediata dos multiplicadores ou revisão da qualidade física dos insumos da dieta.

---

## H) UX/Telas do Módulo (Plug-in no SimuBoi)

As telas do módulo seguem estritamente a identidade visual de alta legibilidade, contraste e baixa fadiga ocular já presente no `index.css` de SimuBoi (Canvas escuro Slate, textos Off-White, e uso primário de `lucide-react` para os ícones).

### 1. Localização no Menu
O módulo aparece como um novo item principal no menu de navegação lateral com o rótulo:
*   **Abate Inteligente (RTU)** `[Ícone: Scale ou Target]`

---

### 2. Detalhamento de Telas (Design e Estrutura)

#### Tela 1: Painel "Recomendação de Abate (Hoje/Semana)"
Focada em apoiar a originação e agendamento da escala de abate de forma ágil.
*   **Componentes Principais:**
    *   *KPI Cards:* Lucro Marginal Médio por Animal (R$), Quantidade de Animais Prontos para Abate Hoje, e Nível de Risco Geral do Lote.
    *   *Filtro de Risco:* Slider para definir a Tolerância ao Prejuízo (e.g., "Mostrar apenas animais com $P(\text{Lucro} \ge 0) > 90\%$").
    *   *Tabela Principal (Ranking de Prontidão):* Lista de animais ordenados por proximidade do ponto ótimo de abate determinístico.
*   **Campos da Tabela:**
    *   `RFID` | `Dias de Cocho` | `Peso Estimado (kg)` | `EGS Atual (mm)` | `Lucro Marginal Acumulado` | `Status de Carcaça (Ideal/Fora)` | `Ações (Agendar Abate / Ver Animal)`.

#### Tela 2: Detalhes do Animal (Visualização Individual)
Análise micro de evolução tecidual com base em dados de RTU e pesagens reais.
*   **Componentes Principais:**
    *   *Timeline do Animal:* Linha temporal com marcos dos exames de ultrassom (RTU) realizados e pesagens de curral.
    *   *Gráfico de Projeção Duplo (AOL e EGS):* Gráfico de dispersão (`ScatterChart` e `LineChart` combinados) mostrando as medições reais obtidas via ultrassom contra a curva projetada de deposição de carcaça pelo modelo calibrado.
    *   *Métricas de Abate:* Comparativo lado a lado da projeção do animal se abatido "Hoje" vs. na "Data Ótima" ($t^*$).
    *   *Card de Explicabilidade (Por quê?):* Lista explicativa com os drivers da recomendação do animal (e.g., *"EGS de 4.2mm atingiu patamar de bonificação uniforme máxima de R$ 10,00/@; ganho adicional de peso não compensa o custo diário de R$ 18,50 de ração."*).

#### Tela 3: Detalhes do Lote (Curvas de Decisão Robustas)
Visão consolidada para gerenciar as metas econômicas globais do confinamento.
*   **Componentes Principais:**
    *   *Gráfico de Lucro vs. Dias de Cocho:* Um gráfico de área Recharts (`AreaChart`) com uma linha de referência vertical móvel (`ReferenceLine`) sinalizando o ponto ótimo $t^*$ determinístico e o $t^*_{\text{robusto}}$ estocástico. Uma área sombreada no gráfico denota o intervalo de incerteza do lucro (percentil 10 a percentil 90).
    *   *Gráfico de Probabilidade de Prejuízo:* Curva vermelha mostrando a redução ou aumento do risco financeiro ao longo do tempo de confinamento.
    *   *Tabela de Estatísticas de Risco:* Métricas financeiras consolidadas (VPL Médio, TIR, Payback Descontado, Lucro Médio do Lote, VaR 95% e CVaR 95%).

#### Tela 4: Configuração da Simulação LHS (Configuração Avançada)
Permite ao analista de risco ajustar os limites estatísticos e de mercado antes de rodar os cenários.
*   **Componentes Principais:**
    *   *Seletor de Tamanho de Amostra ($N$):* Botões de rádio para $1.000$, $10.000$ e $100.000$ iterações.
    *   *Configuração de Distribuições por Variável:* Tabela interativa para gerenciar o desvio padrão e o tipo de distribuição (Normal, Laplace, Beta, Log-normal) para preços de insumos, preço base e GMD.
    *   *Matriz de Correlações:* Input de grade de correlação que impede combinações impossíveis (e.g., animal crescendo muito rápido sem comer nada).
    *   *Presets Rápidos:* Botões para selecionar cenários prontos de risco (e.g., "Volatilidade Alta de Commodities", "Seca Severa", "Estabilidade de Mercado").

#### Tela 5: Calibração e Qualidade do Modelo (Auditoria e Controle)
Transparência total sobre a acurácia científica das predições.
*   **Componentes Principais:**
    *   *Gráfico de Dispersão Bland-Altman:* Visualizador gráfico Recharts mapeando a concordância entre o EGS estimado por ultrassom de curral e o EGS medido fisicamente no gancho do frigorífico.
    *   *Relatórios de Métricas de Erro:* Painel exibindo as pontuações históricas de MAE, RMSE e Viés Geral do Lote de abate anterior.
    *   *Seletor de Modelo Ativo:* Menu dropdown para selecionar a versão do modelo biológico ativa na fazenda (e.g., *"v2.4.2 (Nelore de Pasto-Cocho)"*).
    *   *Drift Alert Banner:* Notificação visível que avisa sobre desvios sistemáticos no desempenho do rebanho para intervenções veterinárias rápidas.

---

### 3. Estados de Interface e Performance Percebida

```
+-------------------+      No clique de Simulação LHS      +-------------------------+
| Interface Ativa   |=============================>| Rodando em Web Worker   |
| (Responsiva, CSS) |<=============================| (Envia progresso de 10%)|
+-------------------+    Progressiva de Gráfico    +-------------------------+
```

*   **Estado de Carregamento (Loading):** Durante as simulações probabilísticas pesadas (especialmente $N = 100.000$), a interface exibe uma barra de progresso em tempo real estilizada em gradiente com uma estimativa de tempo restante. O gráfico Recharts de lote permanece parcialmente opaco para indicar que está sendo alimentado dinamicamente pelas amostras de cauda do Web Worker.
*   **Estado de Erro (Fallback):** Tratamento elegante para arquivos XML de abate corrompidos ou leituras de ultrassom inválidas, exibindo modais com instruções corretivas claras (e.g., *"O arquivo de romaneio não contém a coluna ID_Brinco. Deseja realizar o mapeamento de colunas manualmente?"*).
*   **Performance Requerida:** A renderização da tela principal ("Recomendação de Abate") com os filtros determinísticos deve responder em menos de $150\text{ms}$ utilizando dados cacheados na memória local.

---

## I) Critérios de Aceite e Casos de Teste (Garantia de Qualidade)

Para assegurar a robustez matemática e a estabilidade de código do módulo dentro do ecossistema SimuBoi, a implementação deve atender aos seguintes critérios e aprovar nos casos de teste abaixo:

### 1. Testes Determinísticos (Reprodutibilidade Estrita)
*   **Caso de Teste DET-01 (Ponto Ótimo Sem Bonificação):**
    *   *Entrada:* GMD constante de $1.5\text{ kg/dia}$, custo de ração fixado em R$ 15,00/dia, custo operacional de R$ 3,00/dia, preço base da @ do boi gordo de R$ 300,00, rendimento de carcaça fixado em $54\%$ e bonificação percentual zerada.
    *   *Resultado Esperado:* O modelo deve determinar o dia ótimo de abate como o exato ponto físico-biológico onde o ganho de carcaça diário ponderado em arrobas reduz sua eficiência marginal de modo que a receita de ganho de peso diária fique abaixo de R$ 18,00. O resultado deve ser idêntico com tolerância de desvio de centavos entre repetições consecutivas.
*   **Caso de Teste DET-02 (Salto de Acabamento EGS):**
    *   *Entrada:* Animal que cruza a barreira de $3.0\text{ mm}$ de EGS no dia 90 de confinamento, disparando a bonificação contratual de R$ 10,00 por arroba.
    *   *Resultado Esperado:* O gráfico de lucro projetado deve exibir uma descontinuidade positiva (degrau de margem) no dia 90. O dia ótimo de abate deve ser puxado em direção a esse limite, forçando a recomendação determinística a segurar o gado até atingir pelo menos $3.0\text{ mm}$ de EGS se o custo dos dias extras for inferior ao bônus total recebido na carcaça.

### 2. Testes Probabilísticos LHS (Consistência Estatística)
*   **Caso de Teste EST-01 (Consistência de Semente Estocástica):**
    *   *Entrada:* Execução consecutiva de três simulações LHS com $10.000$ iterações, utilizando semente (`seed`) de número `42` pré-configurada no gerador de números pseudoaleatórios Mersenne Twister.
    *   *Resultado Esperado:* Os valores calculados de VPL Médio, probabilidade de prejuízo, percentil 10 e percentil 90 devem ser idênticos até a sexta casa decimal nas três execuções.
*   **Caso de Teste EST-02 (Concordância de Correlação via Cópula):**
    *   *Entrada:* Configuração de correlação positiva estrita de $+0.75$ entre o preço do boi magro e o preço do boi gordo com $100.000$ amostras geradas via Cópula de Clayton.
    *   *Resultado Esperado:* A correlação de Spearman amostrada da saída gerada de dados deve ficar no intervalo de $[0.72, 0.78]$. Não devem ocorrer combinações absurdas de cauda (e.g., boi magro caríssimo mapeado com boi gordo extremamente barato).

### 3. Testes de Consistência e Limites de Dados
*   **Caso de Teste DAD-01 (Filtro de Inconsistência Temporal):**
    *   *Entrada:* Ingestão de um exame de ultrassom no dia 60 com valor de EGS de $4.5\text{ mm}$ e, subsequentemente, um exame no dia 67 com valor de EGS de $2.1\text{ mm}$ para o mesmo animal.
    *   *Resultado Esperado:* O sistema deve rejeitar o registro de ultrassom do dia 67 como "Anomalia Biológica de Gordura Detectada", disparar um alarme visual na interface do usuário e marcar o registro para auditoria manual do técnico.
*   **Caso de Teste DAD-02 (Abandono de Animais Sem Dados):**
    *   *Entrada:* Animais de um lote ativo que ficaram duas semanas sem pesagem ou exame de ultrassom por falha no manejo.
    *   *Resultado Esperado:* O sistema deve aplicar o algoritmo de interpolação linear local e projetar a evolução utilizando a mediana do lote sem travar a interface do usuário ou gerar valores nulos (`NaN`) na tela do lote.

### 4. Testes de Auditoria (Reprodutibilidade Histórica)
*   **Caso de Teste AUD-01 (Auditoria de Recomendação Passada):**
    *   *Entrada:* O usuário solicita a recomendação de abate emitida para o Animal #1002 no dia 12 de Março de 2026.
    *   *Resultado Esperado:* O sistema deve ler o `AuditLog` correspondente, validar que o hash SHA-256 das entradas originais combina, buscar os parâmetros gravados em formato compactado e reconstruir na tela exatamente as mesmas curvas de decisão e drivers explicativos apresentados naquela data histórica, mesmo se os preços de ração atuais forem completamente diferentes.

---

## J) Plano de Rollout em Produção

A implantação do módulo na base de clientes ativa do SimuBoi deve ser realizada de forma gradativa para mitigar riscos operacionais no curral e no fluxo financeiro de originação de gado das fazendas.

### 1. Rollout por Feature Flags (Ativação Gradual)
*   **Fase 1 (Interna):** Ativação exclusiva para fazendas parceiras experimentais com conectividade total e coleta diária automatizada de gado.
*   **Fase 2 (Shadow Mode):** O módulo roda em segundo plano para $20\%$ dos clientes da plataforma. O sistema lê os exames de ultrassom e as datas de abate reais ocorridas, gerando recomendações silenciosas que não aparecem na UI, apenas para avaliar a qualidade e calibrar os desvios iniciais de MAE/RMSE do modelo biológico nacional.
*   **Fase 3 (Ativação Total):** Liberação geral da funcionalidade via chave no painel de configurações para ativação autônoma pelo cliente.

### 2. Backfill Histórico
*   Sempre que um confinamento ativar o novo módulo, o SimuBoi realizará um processamento retroativo (Backfill) dos lotes de abate fechados nos últimos 12 meses. Isso permite ao fazendeiro comparar as datas de abate reais praticadas no passado contra as datas recomendadas pelo motor inteligente, demonstrando visualmente o potencial de aumento de lucratividade gerado pelas otimizações do módulo.

### 3. Gestão de Risco Operacional: "Modo Sugestão" vs. "Modo Decisão"
Para evitar que decisões automatizadas do software gerem descompassos logísticos com os frigoríficos parceiros, o módulo opera em dois níveis de governança de processos:
*   **Modo Sugestão (Padrão):** O sistema apenas sinaliza as janelas ideais de abate em formato de alerta na tela e recomenda as ações de manejo para análise e aprovação manual do gerente de pecuária.
*   **Modo Decisão (Avançado):** Quando integrado via API com plataformas de originação e logística das indústrias de carne parceiras, a aprovação de uma recomendação no sistema dispara automaticamente a reserva de escala na escala logística do frigorífico receptor.

---

## K) Bibliografia Científica e Referências

### 1. Referências Reais e Confirmadas (Citações Estritas)

*   **Bland, J.M.; Altman, D.G. 1986.** *Statistical methods for assessing agreement between two methods of clinical measurement.* **The Lancet**, 327(8476):307–310.  
    *DOI: [10.1016/S0140-6736(86)90837-8](https://doi.org/10.1016/S0140-6736(86)90837-8)*  
    *(Utilizado na especificação para calibração de viés e desvios de repetibilidade entre operadores de ultrassom de curral e tipificação no frigorífico).*

*   **Lanna, D.P.D.; Boin, C.; Toscano, J. 1998.** *Estimativa da composição química corporal e da carcaça de bovinos Nelore através de equações de predição.* **Revista Brasileira de Zootecnia**, 27(3):620–631.  
    *(Base para conversão de medições de EGS subcutânea obtida em RTU para porcentagem real de gordura corporal e teores de energia retida no ganho).*

*   **McKay, M.D.; Beckman, R.J.; Conover, W.J. 1979.** *A Comparison of Three Methods for Selecting Values of Input Variables in the Analysis of Output from a Computer Code.* **Technometrics**, 21(2):239–245.  
    *DOI: [10.1080/00401706.1979.10489755](https://doi.org/10.1080/00401706.1979.10489755)*  
    *(Metodologia matemática primária que rege o motor estocástico LHS do simulador SimuBoi).*

*   **National Academies of Sciences, Engineering, and Medicine (NASEM). 2016.** *Nutrient Requirements of Beef Cattle: Eighth Revised Edition.* **National Academies Press (US)**.  
    *DOI: [10.17226/19014](https://doi.org/10.17226/19014)*  
    *(Base científica para equações de requerimentos energéticos e limites físicos de consumo de matéria seca (DMI) e de ganho de peso (GMD) dinâmico).*

*   **Pacheco, P.S.; Restle, J.; Vaz, F.N.; Alves Filho, D.C.; Pascoal, L.L.; Segabinazzi, L.R.; Donicht, P.A.S.M. 2014.** *Análise de risco econômico de terminação de bovinos de corte em confinamento.* **Arquivo Brasileiro de Medicina Veterinária e Zootecnia**, 66(1):243–250.  
    *DOI: [10.1590/S0102-09352014000100033](https://doi.org/10.1590/S0102-09352014000100033)*  
    *(Fundamentação para as correlações estocásticas de mercado e modelagem dos preços do boi magro e concentrado via distribuições não gaussianas).*

*   **Perkins, T.L.; Green, R.D.; Hamlin, K.E. 1992.** *Evaluation of ultrasonic estimates of carcass fat thickness and longissimus muscle area in beef cattle.* **Journal of Animal Science**, 70(4):1002–1010.  
    *DOI: [10.2527/1992.7041002x](https://doi.org/10.2527/1992.7041002x)*  
    *(Validação científica e intervalos de erro estatístico das leituras de AOL e EGS em tempo real via ultrassonografia em confinamento de terminação).*

*   **Rockafellar, R.T.; Uryasev, S. 2000.** *Optimization of Conditional Value-at-Risk.* **Journal of Risk**, 2(3):21–41.  
    *DOI: [10.21314/JOR.2000.030](https://doi.org/10.21314/JOR.2000.030)*  
    *(Fundamentação matemática para modelagem e cálculo dos riscos de cauda financeira VaR e CVaR aplicados na otimização robusta de abate).*

---

### 2. Referências Pendentes de Validação (Sinalizadas para Busca Futura)

Para refinar as curvas específicas de marmoreio e deposição de gordura intramuscular (IMF%) em animais zebuínos puros (Nelore) sob dietas ricas em subprodutos tropicais, foram mapeadas as seguintes referências potenciais para validação bibliográfica no Google Scholar:

*   **[REFERÊNCIA PENDENTE 1]** "real-time ultrasound" beef "intramuscular fat" prediction Nelore carcass validation.
    *   *Termo de Busca Google Scholar:* `"real-time ultrasound" AND Nelore AND "intramuscular fat"`
    *   *Objetivo:* Obter a precisão estatística (R² e RMSE) de transdutores lineares na medição de gordura intramuscular em gado zebuíno no Brasil.
*   **[REFERÊNCIA PENDENTE 2]** Confinamento bovinos "ponto ótimo de abate" receita marginal dieta tropical.
    *   *Termo de Busca Google Scholar:* `"ponto ótimo de abate" AND confinamento AND "custo marginal"`
    *   *Objetivo:* Confirmar se há modelos econômicos nacionais publicados que usem a taxa marginal de retorno no mercado brasileiro de carnes com bonificações de qualidade (Cota Hilton / Carnes Especiais).
