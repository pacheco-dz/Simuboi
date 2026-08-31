import { useEffect, useState } from 'react';
import { Joyride, STATUS, Step } from 'react-joyride';

export function GuidedTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Only run the tour if the user hasn't seen it yet
    const hasSeenTour = localStorage.getItem('simuboi_has_seen_tour');
    if (!hasSeenTour) {
      // Delay slightly to let the UI render completely
      const timer = setTimeout(() => {
        setRun(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('simuboi_has_seen_tour', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left font-sans">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Bem-vindo ao SimuBoi! 🐃</h2>
          <p className="text-sm text-slate-600">Este é um rápido tour guiado para apresentar as principais áreas da plataforma. Vamos começar?</p>
        </div>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-desktop-inputs',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-base font-bold text-slate-800 mb-1">1. Parâmetros</h3>
          <p className="text-xs text-slate-600">Aqui você configura os dados zootécnicos dos animais, estrutura de custos e todas as variáveis de entrada da sua simulação.</p>
        </div>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-desktop-results',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-base font-bold text-slate-800 mb-1">2. Resultados</h3>
          <p className="text-xs text-slate-600">Após clicar em "Simular", acesse os resultados determinísticos, fluxo de caixa e análise de sensibilidade estocástica (Risco).</p>
        </div>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-desktop-diet',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-base font-bold text-slate-800 mb-1">3. Formulador de Dieta</h3>
          <p className="text-xs text-slate-600">Otimize as formulações nutricionais automaticamente baseadas em menor custo, selecionando os ingredientes disponíveis.</p>
        </div>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-desktop-esg',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-base font-bold text-slate-800 mb-1">4. Sustentabilidade (ESG)</h3>
          <p className="text-xs text-slate-600">Acompanhe as emissões de gases (metano entérico) e a pegada de carbono projetada do seu rebanho.</p>
        </div>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-desktop-market',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-base font-bold text-slate-800 mb-1">5. Mercado</h3>
          <p className="text-xs text-slate-600">Monitore as cotações regionais do boi gordo e reposição, permitindo uma análise do ágio e custos mercadológicos reais.</p>
        </div>
      ),
      skipBeacon: true,
    },
    {
      target: '#tour-desktop-property',
      content: (
        <div className="text-left font-sans">
          <h3 className="text-base font-bold text-slate-800 mb-1">6. Propriedade</h3>
          <p className="text-xs text-slate-600">Configure as geolocalizações das suas propriedades ativas e receba os alertas de manejo por estresse térmico/frio (ITU).</p>
        </div>
      ),
      skipBeacon: true,
    }
  ];

  return (
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      locale={{
        back: 'Anterior',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular',
      }}
    />
  );
}
