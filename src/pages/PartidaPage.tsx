import React, { useState, useEffect } from 'react';
import { Undo2, RotateCcw, Plus, Trophy, Award, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import type { Equipe, Rodada } from '../App';

interface PartidaPageProps {
  timeAzul: Equipe;
  timeVerde: Equipe;
  rodadas: Rodada[];
  metaPontos: number;
  pontosVulnerabilidade: number;
  status: 'jogando' | 'finalizado';
  vencedor: 'azul' | 'verde' | null;
  pontosTemporariosAzul: number[];
  pontosTemporariosVerde: number[];
  onLancarPontos: (time: 'azul' | 'verde', pontos: number) => void;
  onConfirmarRodada: () => void;
  onDesfazer: () => void;
  onReiniciar: () => void;
  onLimparPontos: (time: 'azul' | 'verde') => void;
}

export const PartidaPage: React.FC<PartidaPageProps> = ({
  timeAzul,
  timeVerde,
  rodadas,
  metaPontos,
  pontosVulnerabilidade,
  status,
  vencedor,
  pontosTemporariosAzul,
  pontosTemporariosVerde,
  onLancarPontos,
  onConfirmarRodada,
  onDesfazer,
  onReiniciar,
  onLimparPontos,
}) => {
  // Estados locais para controlar o Modal de Pontuação
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTime, setModalTime] = useState<'azul' | 'verde' | null>(null);
  const [pontosInput, setPontosInput] = useState<string>('');

  // Estados locais para controlar confirmação de reiniciar
  const [confirmarReiniciarAberto, setConfirmarReiniciarAberto] = useState(false);

  // Estados para animação dos placares
  const [animarAzul, setAnimarAzul] = useState(false);
  const [animarVerde, setAnimarVerde] = useState(false);

  // Verificação de avanço: cada equipe deve adicionar 2x os pontos na mesma rodada
  const azulCompleto = pontosTemporariosAzul.length === 2;
  const verdeCompleto = pontosTemporariosVerde.length === 2;
  const temAmbosLancamentos = azulCompleto && verdeCompleto;

  const formatarLancamentos = (pontos: number[]) => {
    if (pontos.length < 2) return '';
    const [p1, p2] = pontos;
    const sinal = p2 >= 0 ? `+ ${p2}` : `- ${Math.abs(p2)}`;
    return `${p1} ${sinal}`;
  };

  // Verificação de Vulnerabilidade com fallback de segurança (equipe atingiu ou superou o limite)
  const limiteVulnerabilidade = pontosVulnerabilidade || 1500;
  const azulVulneravel = timeAzul.pontuacaoTotal >= limiteVulnerabilidade;
  const verdeVulneravel = timeVerde.pontuacaoTotal >= limiteVulnerabilidade;

  // Efeito para disparar animação de alteração do total do Time Azul
  useEffect(() => {
    if (timeAzul.pontuacaoTotal !== 0) {
      setAnimarAzul(true);
      const timer = setTimeout(() => setAnimarAzul(false), 600);
      return () => clearTimeout(timer);
    }
  }, [timeAzul.pontuacaoTotal]);

  // Efeito para disparar animação de alteração do total do Time Verde
  useEffect(() => {
    if (timeVerde.pontuacaoTotal !== 0) {
      setAnimarVerde(true);
      const timer = setTimeout(() => setAnimarVerde(false), 600);
      return () => clearTimeout(timer);
    }
  }, [timeVerde.pontuacaoTotal]);

  // Nomes formatados segundo a Regra dos Nomes
  const formatarNomesEquipe = (equipe: Equipe) => {
    if (equipe.jogadores.length === 1) {
      return equipe.jogadores[0].nome;
    }
    return equipe.jogadores.map(j => j.nome).join(' / ');
  };

  const nomeAzulExibicao = formatarNomesEquipe(timeAzul);
  const nomeVerdeExibicao = formatarNomesEquipe(timeVerde);

  // Abre modal para pontuar um time específico
  const abrirModalPontuacao = (time: 'azul' | 'verde') => {
    setModalTime(time);
    setPontosInput('');
    setModalAberto(true);
  };

  // Trata a mudança do input de pontos aceitando apenas formato de sinal opcional seguido de dígitos
  const handleMudarPontosInput = (valor: string) => {
    const regex = /^[+-]?\d*$/;
    if (regex.test(valor)) {
      setPontosInput(valor);
    }
  };

  // Confirma e envia os pontos do modal
  const handleConfirmarPontos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTime) return;
    
    const valorTratado = pontosInput.trim();
    if (valorTratado === '' || valorTratado === '+' || valorTratado === '-') return;

    const valor = parseInt(valorTratado, 10);
    if (isNaN(valor)) return;

    onLancarPontos(modalTime, valor);
    setModalAberto(false);
    setModalTime(null);
  };

  const handleAtalhoMenos300 = (time: 'azul' | 'verde') => {
    onLancarPontos(time, -300);
  };

  const rodadaAtual = rodadas.length + 1;

  // Renderização da tabela de rodadas acumuladas
  const renderTabelaRodadas = () => {
    if (rodadas.length === 0) {
      return (
        <div className="sem-rodadas">
          Nenhuma rodada finalizada ainda. Lance a pontuação de ambos os times para computar a rodada.
        </div>
      );
    }

    const totalAzul = timeAzul.pontuacaoTotal;
    const totalVerde = timeVerde.pontuacaoTotal;
    const limiteVulnerabilidade = pontosVulnerabilidade || 1500;

    const faltaVulnerarAzul = Math.max(0, limiteVulnerabilidade - totalAzul);
    const faltaVulnerarVerde = Math.max(0, limiteVulnerabilidade - totalVerde);

    const faltaMetaAzul = Math.max(0, metaPontos - totalAzul);
    const faltaMetaVerde = Math.max(0, metaPontos - totalVerde);

    return (
      <div className="table-responsive">
        <table className="rounds-table">
          <thead>
            <tr>
              <th>Rodada</th>
              <th>Time Azul ({nomeAzulExibicao})</th>
              <th>Time Verde ({nomeVerdeExibicao})</th>
            </tr>
          </thead>
          <tbody>
            {rodadas.map((r) => {
              const azulPositivo = r.pontosAzul >= 0;
              const verdePositivo = r.pontosVerde >= 0;

              return (
                <tr key={r.numero} className="round-row">
                  <td className="round-num">RD {r.numero}</td>
                  <td className={`round-score-change ${azulPositivo ? 'positivo' : 'negativo'}`}>
                    {azulPositivo ? `+${r.pontosAzul}` : r.pontosAzul}
                  </td>
                  <td className={`round-score-change ${verdePositivo ? 'positivo' : 'negativo'}`}>
                    {verdePositivo ? `+${r.pontosVerde}` : r.pontosVerde}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="tfoot-row tfoot-total">
              <td className="tfoot-metric">TOTAL ACUMULADO</td>
              <td className="tfoot-val azul-acc">{totalAzul} pts</td>
              <td className="tfoot-val verde-acc">{totalVerde} pts</td>
            </tr>
            <tr className="tfoot-row tfoot-diferenca">
              <td className="tfoot-metric">DIFERENÇA ATUAL</td>
              <td className="tfoot-val azul-acc" style={{ color: totalAzul > totalVerde ? '#60a5fa' : 'var(--text-muted)', fontWeight: totalAzul > totalVerde ? 800 : 'normal' }}>
                {totalAzul > totalVerde ? `+${totalAzul - totalVerde} pts` : totalAzul === totalVerde ? '0 pts' : '-'}
              </td>
              <td className="tfoot-val verde-acc" style={{ color: totalVerde > totalAzul ? '#34d399' : 'var(--text-muted)', fontWeight: totalVerde > totalAzul ? 800 : 'normal' }}>
                {totalVerde > totalAzul ? `+${totalVerde - totalAzul} pts` : totalAzul === totalVerde ? '0 pts' : '-'}
              </td>
            </tr>
            <tr className="tfoot-row tfoot-vulnerabilidade">
              <td className="tfoot-metric">FALTA P/ VULNERAR (Meta: {limiteVulnerabilidade})</td>
              <td className={`tfoot-val ${faltaVulnerarAzul === 0 ? 'vulneravel-texto' : 'azul-acc'}`}>
                {faltaVulnerarAzul === 0 ? 'VULNERÁVEL' : `${faltaVulnerarAzul} pts`}
              </td>
              <td className={`tfoot-val ${faltaVulnerarVerde === 0 ? 'vulneravel-texto' : 'verde-acc'}`}>
                {faltaVulnerarVerde === 0 ? 'VULNERÁVEL' : `${faltaVulnerarVerde} pts`}
              </td>
            </tr>
            <tr className="tfoot-row tfoot-meta">
              <td className="tfoot-metric">RESTANTE PARA VITÓRIA (Meta: {metaPontos})</td>
              <td className={`tfoot-val ${faltaMetaAzul === 0 ? 'meta-atingida-texto' : 'azul-acc'}`}>
                {faltaMetaAzul === 0 ? 'META ATINGIDA' : `${faltaMetaAzul} pts`}
              </td>
              <td className={`tfoot-val ${faltaMetaVerde === 0 ? 'meta-atingida-texto' : 'verde-acc'}`}>
                {faltaMetaVerde === 0 ? 'META ATINGIDA' : `${faltaMetaVerde} pts`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="partida-container">
      {/* CABEÇALHO */}
      <header className="partida-header glass-panel">
        <div className="header-meta">
          <div className="header-meta-item">
            <span className="meta-label">Meta do Jogo</span>
            <span className="meta-value value-trophy">
              <Trophy size={14} className="icon-trophy" /> {metaPontos} pts
            </span>
          </div>
          
          {/* Título BURACO em formato de cartas compactas */}
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

          <div className="header-round-badge">
            <span className="round-label">Rodada Atual</span>
            <span className="round-value">{rodadaAtual}</span>
          </div>
        </div>

        {/* PLACAR PRINCIPAL */}
        <div className="scoreboard-grid">
          {/* Time Azul */}
          <div className={`score-team-panel panel-azul ${azulVulneravel ? 'vulneravel-active' : ''}`}>
            {azulVulneravel && <span className="tag-vulneravel">VULNERÁVEL</span>}
            <h2 className="team-names text-azul">{nomeAzulExibicao}</h2>
            <div className={`score-display text-azul ${animarAzul ? 'score-change' : ''}`}>
              {timeAzul.pontuacaoTotal}
            </div>
            <div className="team-indicator indicator-azul"></div>
          </div>

          <div className="scoreboard-vs">VS</div>

          {/* Time Verde */}
          <div className={`score-team-panel panel-verde ${verdeVulneravel ? 'vulneravel-active' : ''}`}>
            {verdeVulneravel && <span className="tag-vulneravel">VULNERÁVEL</span>}
            <h2 className="team-names text-verde">{nomeVerdeExibicao}</h2>
            <div className={`score-display text-verde ${animarVerde ? 'score-change' : ''}`}>
              {timeVerde.pontuacaoTotal}
            </div>
            <div className="team-indicator indicator-verde"></div>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTROLES E LANÇAMENTO */}
      <div className="controls-grid">
        {/* Controles Time Azul */}
        <div className={`glass-panel control-card card-azul ${azulVulneravel ? 'vulneravel-active' : ''}`}>
          <div className={`control-card-header ${azulVulneravel ? 'bg-danger' : 'bg-azul-accent'}`}></div>
          <div className="control-card-body">
            {azulVulneravel && <span className="tag-vulneravel">VULNERÁVEL</span>}
            <h3>Lançar Azul</h3>
            
            {/* Indicador de Lançamento na rodada */}
            <div className="round-status-box">
              {pontosTemporariosAzul.length === 0 ? (
                <div className="status-pending">Aguardando lançamentos (0/2)...</div>
              ) : pontosTemporariosAzul.length === 1 ? (
                <div className="status-launched-azul">
                  <CheckCircle2 size={16} /> 1º Lançamento: <span>{pontosTemporariosAzul[0]} pts</span>
                </div>
              ) : (
                <div className="status-launched-azul">
                  <CheckCircle2 size={16} /> Lançado: <span>{pontosTemporariosAzul[0] + pontosTemporariosAzul[1]} pts</span> ({formatarLancamentos(pontosTemporariosAzul)})
                </div>
              )}
            </div>

            <div className="control-buttons">
              {!azulCompleto && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-azul"
                    onClick={() => abrirModalPontuacao('azul')}
                    disabled={status === 'finalizado'}
                  >
                    <Plus size={18} /> {pontosTemporariosAzul.length === 1 ? 'Adicionar 2º Ponto' : 'Adicionar Pontos'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-azul-outline"
                    onClick={() => handleAtalhoMenos300('azul')}
                    disabled={status === 'finalizado'}
                  >
                    Atalho -300
                  </button>
                </>
              )}

              {pontosTemporariosAzul.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => onLimparPontos('azul')}
                  disabled={status === 'finalizado'}
                  style={{ marginTop: '0.25rem' }}
                >
                  <Trash2 size={16} /> Limpar Lançamento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controles Time Verde */}
        <div className={`glass-panel control-card card-verde ${verdeVulneravel ? 'vulneravel-active' : ''}`}>
          <div className={`control-card-header ${verdeVulneravel ? 'bg-danger' : 'bg-verde-accent'}`}></div>
          <div className="control-card-body">
            {verdeVulneravel && <span className="tag-vulneravel">VULNERÁVEL</span>}
            <h3>Lançar Verde</h3>

            {/* Indicador de Lançamento na rodada */}
            <div className="round-status-box">
              {pontosTemporariosVerde.length === 0 ? (
                <div className="status-pending">Aguardando lançamentos (0/2)...</div>
              ) : pontosTemporariosVerde.length === 1 ? (
                <div className="status-launched-verde">
                  <CheckCircle2 size={16} /> 1º Lançamento: <span>{pontosTemporariosVerde[0]} pts</span>
                </div>
              ) : (
                <div className="status-launched-verde">
                  <CheckCircle2 size={16} /> Lançado: <span>{pontosTemporariosVerde[0] + pontosTemporariosVerde[1]} pts</span> ({formatarLancamentos(pontosTemporariosVerde)})
                </div>
              )}
            </div>

            <div className="control-buttons">
              {!verdeCompleto && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-verde"
                    onClick={() => abrirModalPontuacao('verde')}
                    disabled={status === 'finalizado'}
                  >
                    <Plus size={18} /> {pontosTemporariosVerde.length === 1 ? 'Adicionar 2º Ponto' : 'Adicionar Pontos'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-verde-outline"
                    onClick={() => handleAtalhoMenos300('verde')}
                    disabled={status === 'finalizado'}
                  >
                    Atalho -300
                  </button>
                </>
              )}

              {pontosTemporariosVerde.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => onLimparPontos('verde')}
                  disabled={status === 'finalizado'}
                  style={{ marginTop: '0.25rem' }}
                >
                  <Trash2 size={16} /> Limpar Lançamento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BOTÃO ÚNICO DE CONFIRMAÇÃO */}
      {temAmbosLancamentos && (
        <div className="confirm-round-section fade-in">
          <button
            type="button"
            className="btn btn-primary confirm-round-btn"
            onClick={onConfirmarRodada}
            disabled={status === 'finalizado'}
          >
            Confirmar Lançamento
          </button>
        </div>
      )}

      {/* HISTÓRICO / TABELA DE RODADAS */}
      <section className="glass-panel history-section">
        <div className="section-header">
          <h2 className="section-title">Histórico de Rodadas</h2>
          <div className="section-actions">
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={onDesfazer}
              disabled={rodadas.length === 0 && pontosTemporariosAzul.length === 0 && pontosTemporariosVerde.length === 0}
              title="Desfazer último lançamento ou rodada"
            >
              <Undo2 size={16} /> Desfazer
            </button>
            <button 
              type="button" 
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmarReiniciarAberto(true)}
              title="Reiniciar partida do zero"
            >
              <RotateCcw size={16} /> Reiniciar
            </button>
          </div>
        </div>
        {renderTabelaRodadas()}
      </section>

      {/* MODAL DE LANÇAMENTO DE PONTUAÇÃO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className={`card-header-accent ${modalTime === 'azul' ? 'bg-azul' : 'bg-verde'}`}></div>
            <h3 className="modal-title">
              Rodada {rodadaAtual} {modalTime && `• ${(modalTime === 'azul' ? pontosTemporariosAzul.length : pontosTemporariosVerde.length) + 1}º Lançamento`}
            </h3>
            <div className={`modal-players-highlight text-${modalTime}`}>
              {modalTime === 'azul' ? nomeAzulExibicao : nomeVerdeExibicao}
            </div>
            <div className="modal-current-score">
              Pontuação atual: <strong className={`text-${modalTime}`}>{modalTime === 'azul' ? timeAzul.pontuacaoTotal : timeVerde.pontuacaoTotal} pts</strong>
            </div>
            
            <form onSubmit={handleConfirmarPontos}>
              <div className="input-group">
                <label className="input-label">Digite a pontuação</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`input-field ${modalTime === 'azul' ? 'input-azul' : 'input-verde'}`}
                  placeholder="Ex: +120 ou -300"
                  value={pontosInput}
                  onChange={(e) => handleMudarPontosInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setModalAberto(false);
                    setModalTime(null);
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`btn ${modalTime === 'azul' ? 'btn-azul' : 'btn-verde'}`}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE REINICIALIZAÇÃO */}
      {confirmarReiniciarAberto && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content confirm-modal">
            <div className="card-header-accent bg-danger"></div>
            <div className="warning-icon-wrapper text-danger">
              <AlertTriangle size={32} />
            </div>
            <h3 className="modal-title text-center">Reiniciar Partida?</h3>
            <p className="modal-text text-center">
              Todos os nomes de jogadores, rodadas e pontuações atuais serão perdidos permanentemente. Tem certeza?
            </p>
            <div className="modal-actions full-width-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmarReiniciarAberto(false)}
              >
                Voltar ao Jogo
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirmarReiniciarAberto(false);
                  onReiniciar();
                }}
              >
                Sim, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COMEMORATIVO / ANÚNCIO DE VENCEDOR */}
      {status === 'finalizado' && vencedor && (
        <div className="modal-overlay">
          {/* Confetes / Naipes Caindo no plano de fundo do modal */}
          <div className="confetti-container">
            {Array.from({ length: 60 }).map((_, idx) => {
              const naipes = ['♠', '♥', '♦', '♣'];
              const naipe = naipes[idx % 4];
              const classeNaipe = idx % 2 === 0 ? 'red-suit' : 'blue-suit';
              
              const left = Math.random() * 100;
              const animationDelay = Math.random() * 6;
              const animationDuration = 4 + Math.random() * 5;
              const size = 16 + Math.random() * 24;
              const rotation = Math.random() * 360;
              
              return (
                <span
                  key={idx}
                  className={`confetti-item ${classeNaipe}`}
                  style={{
                    left: `${left}%`,
                    animationDelay: `${animationDelay}s`,
                    animationDuration: `${animationDuration}s`,
                    fontSize: `${size}px`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {naipe}
                </span>
              );
            })}
          </div>

          <div className="glass-panel modal-content winner-modal winner-glow">
            <div className={`card-header-accent ${vencedor === 'azul' ? 'bg-azul' : 'bg-verde'}`}></div>
            <div className="trophy-cup-wrapper">
              <Award className={`icon-winner-${vencedor}`} size={64} />
              {/* Estrelas cintilantes */}
              <div className="sparkle sparkle-1">★</div>
              <div className="sparkle sparkle-2">✦</div>
              <div className="sparkle sparkle-3">★</div>
              <div className="sparkle sparkle-4">✦</div>
            </div>
            
            <h3 className="winner-subtitle text-center">PARABÉNS!</h3>
            <h2 className="winner-title text-center">TEMOS UM VENCEDOR!</h2>
            
            {/* Nomes da Equipe em Destaque Gigante */}
            <div className={`winner-team-name-giant text-center text-${vencedor}`}>
              {vencedor === 'azul' ? nomeAzulExibicao : nomeVerdeExibicao}
            </div>

            {/* Pontuação do Vencedor em Destaque Gigante */}
            <div className="winner-score-giant-wrapper text-center">
              <span className="winner-score-label">PONTUAÇÃO FINAL</span>
              <div className={`winner-score-giant-value text-${vencedor}`}>
                {vencedor === 'azul' ? timeAzul.pontuacaoTotal : timeVerde.pontuacaoTotal}
                <span className="winner-score-pts"> PTS</span>
              </div>
            </div>

            <div className="winner-details-compact text-center">
              <p className="meta-info">
                Meta de pontos superada ({metaPontos} pts) em {rodadas.length} rodadas.
              </p>
            </div>

            <div className="winner-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onDesfazer}
                title="Desfazer última jogada para continuar jogando"
              >
                <Undo2 size={16} /> Desfazer Rodada
              </button>
              
              <button
                type="button"
                className={`btn ${vencedor === 'azul' ? 'btn-azul' : 'btn-verde'}`}
                onClick={onReiniciar}
              >
                Nova Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
