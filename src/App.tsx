import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ConfigPage } from './pages/ConfigPage';
import { PartidaPage } from './pages/PartidaPage';

export interface Jogador {
  nome: string;
}

export interface Equipe {
  jogadores: Jogador[];
  pontuacaoTotal: number;
}

export interface Rodada {
  numero: number;
  pontosAzul: number;
  pontosVerde: number;
  acumuladoAzul: number;
  acumuladoVerde: number;
}

const LOCAL_STORAGE_KEY = 'buraco_score_app_state';

const normalizarPontosTemp = (val: unknown): number[] => {
  if (Array.isArray(val)) {
    return val.filter((x): x is number => typeof x === 'number');
  }
  if (typeof val === 'number') {
    return [val];
  }
  return [];
};

const ESTADO_INICIAL: JogoEstado = {
  timeAzul: { jogadores: [], pontuacaoTotal: 0 },
  timeVerde: { jogadores: [], pontuacaoTotal: 0 },
  rodadas: [],
  metaPontos: 3000,
  pontosVulnerabilidade: 1500,
  status: 'config',
  vencedor: null,
  pontosTemporariosAzul: [],
  pontosTemporariosVerde: [],
  ordemLancamentos: [],
};

export interface PartidaSalva {
  id: string;
  data: string;
  timeAzul: Equipe;
  timeVerde: Equipe;
  rodadas: Rodada[];
  metaPontos: number;
  pontosVulnerabilidade: number;
  status: 'jogando' | 'finalizado';
  vencedor: 'azul' | 'verde' | null;
}

interface JogoEstado {
  id?: string;
  timeAzul: Equipe;
  timeVerde: Equipe;
  rodadas: Rodada[];
  metaPontos: number;
  pontosVulnerabilidade: number;
  status: 'config' | 'jogando' | 'finalizado';
  vencedor: 'azul' | 'verde' | null;
  pontosTemporariosAzul: number[];
  pontosTemporariosVerde: number[];
  ordemLancamentos?: Array<'azul' | 'verde'>;
}

function App() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<JogoEstado>(() => {
    const salvo = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo);
        return {
          ...ESTADO_INICIAL,
          ...parsed,
          pontosTemporariosAzul: normalizarPontosTemp(parsed.pontosTemporariosAzul),
          pontosTemporariosVerde: normalizarPontosTemp(parsed.pontosTemporariosVerde),
          ordemLancamentos: Array.isArray(parsed.ordemLancamentos) ? parsed.ordemLancamentos : [],
        };
      } catch (e) {
        console.error('Erro ao ler estado do LocalStorage', e);
      }
    }
    return ESTADO_INICIAL;
  });

  // Salva no LocalStorage sempre que o estado muda
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(estado));
  }, [estado]);

  // Chave do LocalStorage para histórico de partidas recentes
  const RECENTES_STORAGE_KEY = 'buraco_partidas_recentes';

  // Salva ou atualiza a partida atual no histórico de partidas recentes (mantém as últimas 3)
  useEffect(() => {
    if (estado.status !== 'config' && estado.id) {
      const salvasRaw = localStorage.getItem(RECENTES_STORAGE_KEY);
      let salvas: PartidaSalva[] = [];
      if (salvasRaw) {
        try {
          salvas = JSON.parse(salvasRaw);
        } catch (e) {
          console.error('Erro ao ler partidas recentes', e);
        }
      }

      const index = salvas.findIndex((p) => p.id === estado.id);
      
      const partidaDados: PartidaSalva = {
        id: estado.id,
        data: salvas[index]?.data || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timeAzul: estado.timeAzul,
        timeVerde: estado.timeVerde,
        rodadas: estado.rodadas,
        metaPontos: estado.metaPontos,
        pontosVulnerabilidade: estado.pontosVulnerabilidade,
        status: estado.status,
        vencedor: estado.vencedor
      };

      if (index !== -1) {
        // Se a partida mudou de posição no array, remove e recoloca no topo
        salvas.splice(index, 1);
      }
      
      // Sempre coloca a partida mais recentemente atualizada no topo
      salvas.unshift(partidaDados);

      // Mantém no máximo 3 partidas
      salvas = salvas.slice(0, 3);

      localStorage.setItem(RECENTES_STORAGE_KEY, JSON.stringify(salvas));
    }
  }, [estado]);

  // Carregar uma partida para continuar ou acessar
  const carregarPartida = (partida: PartidaSalva) => {
    setEstado({
      id: partida.id,
      timeAzul: partida.timeAzul,
      timeVerde: partida.timeVerde,
      rodadas: partida.rodadas,
      metaPontos: partida.metaPontos,
      pontosVulnerabilidade: partida.pontosVulnerabilidade,
      status: partida.status,
      vencedor: partida.vencedor,
      pontosTemporariosAzul: [],
      pontosTemporariosVerde: [],
      ordemLancamentos: [],
    });
  };

  // Redirecionamento baseado no status do jogo (ao montar ou se o status mudar)
  useEffect(() => {
    if (estado.status === 'config') {
      navigate('/');
    } else {
      navigate('/partida');
    }
  }, [estado.status, navigate]);

  // Iniciar Partida
  const iniciarPartida = (jogadoresAzul: string[], jogadoresVerde: string[], meta: number, vulnerabilidade: number) => {
    const id = Date.now().toString();
    const timeAzul: Equipe = {
      jogadores: jogadoresAzul.map(nome => ({ nome })),
      pontuacaoTotal: 0,
    };
    const timeVerde: Equipe = {
      jogadores: jogadoresVerde.map(nome => ({ nome })),
      pontuacaoTotal: 0,
    };

    setEstado({
      id,
      timeAzul,
      timeVerde,
      rodadas: [],
      metaPontos: meta,
      pontosVulnerabilidade: vulnerabilidade,
      status: 'jogando',
      vencedor: null,
      pontosTemporariosAzul: [],
      pontosTemporariosVerde: [],
      ordemLancamentos: [],
    });
  };

  // Lançar pontuação de um time (permite até 2 lançamentos por rodada para cada equipe)
  const lancarPontos = (time: 'azul' | 'verde', pontos: number) => {
    setEstado((prev) => {
      if (prev.status === 'finalizado') return prev;

      const atuais = time === 'azul' ? prev.pontosTemporariosAzul : prev.pontosTemporariosVerde;
      if (atuais.length >= 2) return prev;

      const novos = [...atuais, pontos];

      return {
        ...prev,
        pontosTemporariosAzul: time === 'azul' ? novos : prev.pontosTemporariosAzul,
        pontosTemporariosVerde: time === 'verde' ? novos : prev.pontosTemporariosVerde,
        ordemLancamentos: [...(prev.ordemLancamentos || []), time],
      };
    });
  };

  // Confirmar e computar a rodada finalizada (só avança quando cada equipe adicionar 2x os pontos)
  const confirmarRodada = () => {
    setEstado((prev) => {
      if (prev.status === 'finalizado') return prev;
      if (prev.pontosTemporariosAzul.length < 2 || prev.pontosTemporariosVerde.length < 2) return prev;

      const somaAzul = prev.pontosTemporariosAzul.reduce((acc, val) => acc + val, 0);
      const somaVerde = prev.pontosTemporariosVerde.reduce((acc, val) => acc + val, 0);

      const acumuladoAzul = prev.timeAzul.pontuacaoTotal + somaAzul;
      const acumuladoVerde = prev.timeVerde.pontuacaoTotal + somaVerde;

      const novaRodada: Rodada = {
        numero: prev.rodadas.length + 1,
        pontosAzul: somaAzul,
        pontosVerde: somaVerde,
        acumuladoAzul,
        acumuladoVerde,
      };

      const novasRodadas = [...prev.rodadas, novaRodada];
      
      // Verifica se alguém atingiu a meta de pontos
      let status: 'jogando' | 'finalizado' = 'jogando';
      let vencedor: 'azul' | 'verde' | null = null;

      const azulAtingiu = acumuladoAzul >= prev.metaPontos;
      const verdeAtingiu = acumuladoVerde >= prev.metaPontos;

      if (azulAtingiu || verdeAtingiu) {
        if (azulAtingiu && verdeAtingiu) {
          // Em caso de empate acima da meta, ganha quem tiver mais pontos
          if (acumuladoAzul > acumuladoVerde) {
            vencedor = 'azul';
            status = 'finalizado';
          } else if (acumuladoVerde > acumuladoAzul) {
            vencedor = 'verde';
            status = 'finalizado';
          }
          // Se empatarem exatamente acima da meta, o jogo continua na próxima rodada
        } else if (azulAtingiu) {
          vencedor = 'azul';
          status = 'finalizado';
        } else {
          vencedor = 'verde';
          status = 'finalizado';
        }
      }

      return {
        ...prev,
        timeAzul: { ...prev.timeAzul, pontuacaoTotal: acumuladoAzul },
        timeVerde: { ...prev.timeVerde, pontuacaoTotal: acumuladoVerde },
        rodadas: novasRodadas,
        pontosTemporariosAzul: [],
        pontosTemporariosVerde: [],
        ordemLancamentos: [],
        status,
        vencedor,
      };
    });
  };

  // Desfazer última ação (desfaz o último lançamento temporário feito ou a última rodada finalizada)
  const desfazerUltimaAcao = () => {
    setEstado((prev) => {
      // 1. Se há lançamentos temporários na ordem, desfaz o mais recente
      const ordem = prev.ordemLancamentos || [];
      if (ordem.length > 0) {
        const ultimoTime = ordem[ordem.length - 1];
        const novaOrdem = ordem.slice(0, -1);

        return {
          ...prev,
          pontosTemporariosAzul: ultimoTime === 'azul' 
            ? prev.pontosTemporariosAzul.slice(0, -1) 
            : prev.pontosTemporariosAzul,
          pontosTemporariosVerde: ultimoTime === 'verde' 
            ? prev.pontosTemporariosVerde.slice(0, -1) 
            : prev.pontosTemporariosVerde,
          ordemLancamentos: novaOrdem,
        };
      }

      // 1.1 Se há pontos temporários sem registro de ordem (ex: legado), limpa todos
      if (prev.pontosTemporariosAzul.length > 0 || prev.pontosTemporariosVerde.length > 0) {
        return {
          ...prev,
          pontosTemporariosAzul: [],
          pontosTemporariosVerde: [],
          ordemLancamentos: [],
        };
      }

      // 2. Se não há lançamentos temporários, desfaz a última rodada finalizada
      if (prev.rodadas.length > 0) {
        const novasRodadas = prev.rodadas.slice(0, -1);
        const ultimaRodada = prev.rodadas[prev.rodadas.length - 1];

        const novoTotalAzul = prev.timeAzul.pontuacaoTotal - ultimaRodada.pontosAzul;
        const novoTotalVerde = prev.timeVerde.pontuacaoTotal - ultimaRodada.pontosVerde;

        return {
          ...prev,
          timeAzul: { ...prev.timeAzul, pontuacaoTotal: novoTotalAzul },
          timeVerde: { ...prev.timeVerde, pontuacaoTotal: novoTotalVerde },
          rodadas: novasRodadas,
          status: 'jogando', // Retorna ao jogo se estava finalizado
          vencedor: null,
          pontosTemporariosAzul: [],
          pontosTemporariosVerde: [],
          ordemLancamentos: [],
        };
      }

      return prev;
    });
  };

  // Reiniciar Partida do zero
  const reiniciarPartida = () => {
    setEstado(ESTADO_INICIAL);
  };

  // Limpar lançamentos temporários de um time específico
  const limparPontosTemporarios = (time: 'azul' | 'verde') => {
    setEstado((prev) => {
      const novaOrdem = (prev.ordemLancamentos || []).filter(t => t !== time);
      if (time === 'azul') {
        return { ...prev, pontosTemporariosAzul: [], ordemLancamentos: novaOrdem };
      } else {
        return { ...prev, pontosTemporariosVerde: [], ordemLancamentos: novaOrdem };
      }
    });
  };

  return (
    <>
      <div className="suit-background">
        <span className="suit-bg-item suit-spades">♠</span>
        <span className="suit-bg-item suit-hearts">♥</span>
        <span className="suit-bg-item suit-diamonds">♦</span>
        <span className="suit-bg-item suit-clubs">♣</span>
      </div>
      <Routes>
        <Route 
          path="/" 
          element={<ConfigPage onIniciar={iniciarPartida} onCarregarPartida={carregarPartida} />} 
        />
        <Route 
          path="/partida" 
          element={
            estado.status !== 'config' ? (
              <PartidaPage
                timeAzul={estado.timeAzul}
                timeVerde={estado.timeVerde}
                rodadas={estado.rodadas}
                metaPontos={estado.metaPontos}
                pontosVulnerabilidade={estado.pontosVulnerabilidade}
                status={estado.status}
                vencedor={estado.vencedor}
                pontosTemporariosAzul={estado.pontosTemporariosAzul}
                pontosTemporariosVerde={estado.pontosTemporariosVerde}
                onLancarPontos={lancarPontos}
                onConfirmarRodada={confirmarRodada}
                onDesfazer={desfazerUltimaAcao}
                onReiniciar={reiniciarPartida}
                onLimparPontos={limparPontosTemporarios}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
