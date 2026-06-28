import React, { useState, useEffect } from 'react';
import { User, Play, Trophy, AlertTriangle, RotateCcw } from 'lucide-react';
import type { PartidaSalva } from '../App';

interface ConfigPageProps {
  onIniciar: (jogadoresAzul: string[], jogadoresVerde: string[], meta: number, vulnerabilidade: number) => void;
  onCarregarPartida: (partida: PartidaSalva) => void;
}

export const ConfigPage: React.FC<ConfigPageProps> = ({ onIniciar, onCarregarPartida }) => {
  // Configuração da quantidade de jogadores por equipe (Geral)
  const [numJogadores, setNumJogadores] = useState<1 | 2>(2);
  
  // Configuração Time Azul (Time 1)
  const [jogadoresAzul, setJogadoresAzul] = useState<string[]>(['', '']);

  // Configuração Time Verde (Time 2)
  const [jogadoresVerde, setJogadoresVerde] = useState<string[]>(['', '']);

  // Meta de pontos
  const [metaPontos, setMetaPontos] = useState<number>(3000);
  // Vulnerabilidade
  const [vulnerabilidadePontos, setVulnerabilidadePontos] = useState<number>(1500);

  // Partidas recentes salvas localmente
  const [partidasSalvas, setPartidasSalvas] = useState<PartidaSalva[]>([]);

  useEffect(() => {
    const salvasRaw = localStorage.getItem('buraco_partidas_recentes');
    if (salvasRaw) {
      try {
        setPartidasSalvas(JSON.parse(salvasRaw));
      } catch (e) {
        console.error('Erro ao ler partidas recentes', e);
      }
    }
  }, []);

  const handleMudarNumJogadores = (num: 1 | 2) => {
    setNumJogadores(num);
    if (num === 1) {
      setJogadoresAzul([jogadoresAzul[0], '']);
      setJogadoresVerde([jogadoresVerde[0], '']);
    }
  };

  const handleMudarNomeAzul = (index: number, valor: string) => {
    const novos = [...jogadoresAzul];
    novos[index] = valor;
    setJogadoresAzul(novos);
  };

  const handleMudarNomeVerde = (index: number, valor: string) => {
    const novos = [...jogadoresVerde];
    novos[index] = valor;
    setJogadoresVerde(novos);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filtra os jogadores válidos com base na quantidade selecionada e converte para UPPERCASE
    const azulValidos = jogadoresAzul.slice(0, numJogadores).map(n => {
      const nome = n.trim() || `Jogador ${jogadoresAzul.indexOf(n) + 1}`;
      return nome.toUpperCase();
    });
    const verdeValidos = jogadoresVerde.slice(0, numJogadores).map(n => {
      const nome = n.trim() || `Jogador ${jogadoresVerde.indexOf(n) + 1}`;
      return nome.toUpperCase();
    });

    onIniciar(azulValidos, verdeValidos, metaPontos, vulnerabilidadePontos);
  };

  return (
    <div className="config-container">
      <header className="config-header">
        <div className="card-title-container">
          <div className="card-title-letter">
            <span className="card-corner top-left">♠</span>
            <span className="card-letter-main">B</span>
            <span className="card-corner bottom-right">♠</span>
          </div>
          <div className="card-title-letter red-suit">
            <span className="card-corner top-left">♥</span>
            <span className="card-letter-main">U</span>
            <span className="card-corner bottom-right">♥</span>
          </div>
          <div className="card-title-letter">
            <span className="card-corner top-left">♣</span>
            <span className="card-letter-main">R</span>
            <span className="card-corner bottom-right">♣</span>
          </div>
          <div className="card-title-letter red-suit">
            <span className="card-corner top-left">♦</span>
            <span className="card-letter-main">A</span>
            <span className="card-corner bottom-right">♦</span>
          </div>
          <div className="card-title-letter">
            <span className="card-corner top-left">♠</span>
            <span className="card-letter-main">C</span>
            <span className="card-corner bottom-right">♠</span>
          </div>
          <div className="card-title-letter red-suit">
            <span className="card-corner top-left">♥</span>
            <span className="card-letter-main">O</span>
            <span className="card-corner bottom-right">♥</span>
          </div>
        </div>
        <p className="subtitle">Configuração simplificada da sua partida</p>
      </header>

      <form onSubmit={handleSubmit} className="config-form">
        {/* SELETOR GERAL DE QUANTIDADE DE JOGADORES */}
        <div className="glass-panel general-player-count-card">
          <div className="settings-body">
            <div>
              <h2>Jogadores por Equipe</h2>
              <p className="settings-desc">Selecione quantos jogadores terá cada equipe</p>
            </div>
            <div className="player-count-selector">
              <div className="selector-buttons">
                <button
                  type="button"
                  className={`selector-btn ${numJogadores === 1 ? 'active-geral' : ''}`}
                  onClick={() => handleMudarNumJogadores(1)}
                >
                  1 Jogador
                </button>
                <button
                  type="button"
                  className={`selector-btn ${numJogadores === 2 ? 'active-geral' : ''}`}
                  onClick={() => handleMudarNumJogadores(2)}
                >
                  2 Jogadores
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="teams-grid">
          {/* CARD TIME AZUL */}
          <div className="glass-panel team-setup-card setup-azul">
            <div className="card-header-accent bg-azul"></div>
            <div className="card-body">
              <div className="team-badge badge-azul">TIME AZUL</div>
              
              <div className="inputs-container">
                <div className="input-group">
                  <label className="input-label">Nome do Jogador 1</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon icon-azul" />
                    <input
                      type="text"
                      className="input-field input-azul"
                      placeholder="Ex: João"
                      value={jogadoresAzul[0]}
                      onChange={(e) => handleMudarNomeAzul(0, e.target.value)}
                      required
                    />
                  </div>
                </div>

                {numJogadores === 2 && (
                  <div className="input-group fade-in">
                    <label className="input-label">Nome do Jogador 2</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon icon-azul" />
                      <input
                        type="text"
                        className="input-field input-azul"
                        placeholder="Ex: Maria"
                        value={jogadoresAzul[1]}
                        onChange={(e) => handleMudarNomeAzul(1, e.target.value)}
                        required={numJogadores === 2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CARD TIME VERDE */}
          <div className="glass-panel team-setup-card setup-verde">
            <div className="card-header-accent bg-verde"></div>
            <div className="card-body">
              <div className="team-badge badge-verde">TIME VERDE</div>
              
              <div className="inputs-container">
                <div className="input-group">
                  <label className="input-label">Nome do Jogador 1</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon icon-verde" />
                    <input
                      type="text"
                      className="input-field input-verde"
                      placeholder="Ex: Carlos"
                      value={jogadoresVerde[0]}
                      onChange={(e) => handleMudarNomeVerde(0, e.target.value)}
                      required
                    />
                  </div>
                </div>

                {numJogadores === 2 && (
                  <div className="input-group fade-in">
                    <label className="input-label">Nome do Jogador 2</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon icon-verde" />
                      <input
                        type="text"
                        className="input-field input-verde"
                        placeholder="Ex: Ana"
                        value={jogadoresVerde[1]}
                        onChange={(e) => handleMudarNomeVerde(1, e.target.value)}
                        required={numJogadores === 2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÕES DO JOGO (META E VULNERABILIDADE) LADO A LADO */}
        <div className="settings-grid">
          {/* CARD CONFIGURAÇÕES DO JOGO (META) */}
          <div className="glass-panel config-settings-card compact-card">
            <div className="settings-header">
              <Trophy className="settings-icon" size={20} />
              <h2>Meta de Pontuação</h2>
            </div>
            
            <div className="settings-body">
              <p className="settings-desc">Pontuação necessária para vencer a partida:</p>
              <div className="range-selector">
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={metaPontos}
                  onChange={(e) => setMetaPontos(Number(e.target.value))}
                  className="range-slider"
                />
                <div className="number-input-wrapper">
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={metaPontos}
                    onChange={(e) => setMetaPontos(Math.max(0, Number(e.target.value)))}
                    className="input-field meta-number-input"
                  />
                  <span className="points-unit">pts</span>
                </div>
              </div>
              <div className="quick-meta-buttons">
                {[3000].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className={`quick-meta-btn ${metaPontos === valor ? 'active' : ''}`}
                    onClick={() => setMetaPontos(valor)}
                  >
                    {valor.toLocaleString('pt-BR')} pts
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CARD CONFIGURAÇÕES DO JOGO (VULNERABILIDADE) */}
          <div className="glass-panel config-settings-card compact-card">
            <div className="settings-header">
              <AlertTriangle className="settings-icon text-danger" size={20} />
              <h2>Vulnerabilidade</h2>
            </div>
            
            <div className="settings-body">
              <p className="settings-desc">Pontos para o time entrar em vulnerabilidade:</p>
              <div className="range-selector">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={vulnerabilidadePontos}
                  onChange={(e) => setVulnerabilidadePontos(Number(e.target.value))}
                  className="range-slider"
                />
                <div className="number-input-wrapper">
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={vulnerabilidadePontos}
                    onChange={(e) => setVulnerabilidadePontos(Math.max(0, Number(e.target.value)))}
                    className="input-field meta-number-input"
                  />
                  <span className="points-unit">pts</span>
                </div>
              </div>
              <div className="quick-meta-buttons">
                {[1500].map((valor) => (
                  <button
                    key={valor}
                    type="button"
                    className={`quick-meta-btn ${vulnerabilidadePontos === valor ? 'active' : ''}`}
                    onClick={() => setVulnerabilidadePontos(valor)}
                  >
                    {valor.toLocaleString('pt-BR')} pts
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button type="submit" className="btn btn-primary start-match-btn">
            <Play size={20} fill="currentColor" />
            Iniciar Partida
          </button>
        </div>
      </form>

      {/* PARTIDAS RECENTES */}
      {partidasSalvas.length > 0 && (
        <div className="glass-panel config-settings-card recent-matches-card">
          <div className="settings-header">
            <RotateCcw className="settings-icon text-muted" size={22} />
            <h2>Partidas Recentes</h2>
          </div>
          <div className="settings-body recent-matches-list">
            {partidasSalvas.map((p) => {
              const nomesAzul = p.timeAzul.jogadores.map(j => j.nome).join(' / ');
              const nomesVerde = p.timeVerde.jogadores.map(j => j.nome).join(' / ');
              const finalizada = p.status === 'finalizado';

              return (
                <div key={p.id} className="recent-match-item">
                  <div className="recent-match-info">
                    <div className="recent-match-teams">
                      <span className="team-blue-text">{nomesAzul}</span>
                      <span className="vs-divider">VS</span>
                      <span className="team-green-text">{nomesVerde}</span>
                    </div>
                    <div className="recent-match-details">
                      <span className="recent-match-score">
                        {p.timeAzul.pontuacaoTotal} pts vs {p.timeVerde.pontuacaoTotal} pts
                      </span>
                      <span className="recent-match-date">{p.data}</span>
                      <span className={`recent-match-status-tag ${finalizada ? 'status-finished' : 'status-ongoing'}`}>
                        {finalizada ? 'Finalizada' : 'Em Andamento'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${finalizada ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => onCarregarPartida(p)}
                  >
                    {finalizada ? 'Acessar Partida' : 'Continuar Partida'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
