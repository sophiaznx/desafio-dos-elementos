// =========================================================
// JOGO: Desafio dos Elementos (Criado por Sophia - 9B)
// =========================================================

// Lista das 10 fases do templo com dificuldade crescente
// Posições das poças são em porcentagem (%) da largura do cenário
const FASES_DO_JOGO = [
  {
    conta: "6 + 5 = ?",
    respostaCerta: 11,
    opcoes: [10, 11, 12, 13],
    explicacao: "Somando 6 + 5, temos 11.",
    obstaculos: [
      { tipo: "fogo", inicio: 42, largura: 11 }
    ]
  },
  {
    conta: "15 - 7 = ?",
    respostaCerta: 8,
    opcoes: [7, 8, 9, 6],
    explicacao: "Tirando 7 de 15, sobram 8.",
    obstaculos: [
      { tipo: "agua", inicio: 45, largura: 11 }
    ]
  },
  {
    conta: "4 × 3 = ?",
    respostaCerta: 12,
    opcoes: [7, 10, 12, 16],
    explicacao: "4 vezes 3 é igual a 12 (4 + 4 + 4).",
    obstaculos: [
      { tipo: "fogo", inicio: 35, largura: 10 },
      { tipo: "agua", inicio: 62, largura: 10 }
    ]
  },
  {
    conta: "18 ÷ 3 = ?",
    respostaCerta: 6,
    opcoes: [5, 6, 7, 9],
    explicacao: "Dividindo 18 em 3 partes iguais, cada parte vale 6.",
    obstaculos: [
      { tipo: "agua", inicio: 34, largura: 10 },
      { tipo: "fogo", inicio: 60, largura: 10 }
    ]
  },
  {
    conta: "14 + 19 = ?",
    respostaCerta: 33,
    opcoes: [23, 31, 33, 35],
    explicacao: "14 + 10 = 24, e 24 + 9 = 33.",
    obstaculos: [
      { tipo: "fogo", inicio: 32, largura: 11 },
      { tipo: "agua", inicio: 58, largura: 11 }
    ]
  },
  {
    conta: "32 - 15 = ?",
    respostaCerta: 17,
    opcoes: [15, 17, 18, 23],
    explicacao: "32 - 10 = 22, e 22 - 5 = 17.",
    obstaculos: [
      { tipo: "agua", inicio: 30, largura: 10 },
      { tipo: "fogo", inicio: 50, largura: 10 },
      { tipo: "agua", inicio: 70, largura: 9 }
    ]
  },
  {
    conta: "6 × 7 = ?",
    respostaCerta: 42,
    opcoes: [36, 40, 42, 48],
    explicacao: "Na tabuada do 6, 6 × 7 = 42.",
    obstaculos: [
      { tipo: "fogo", inicio: 28, largura: 10 },
      { tipo: "agua", inicio: 48, largura: 10 },
      { tipo: "fogo", inicio: 68, largura: 10 }
    ]
  },
  {
    conta: "45 ÷ 5 = ?",
    respostaCerta: 9,
    opcoes: [7, 8, 9, 10],
    explicacao: "Como 5 × 9 = 45, então 45 ÷ 5 = 9.",
    obstaculos: [
      { tipo: "agua", inicio: 28, largura: 11 },
      { tipo: "fogo", inicio: 52, largura: 11 },
      { tipo: "agua", inicio: 72, largura: 9 }
    ]
  },
  {
    conta: "8 × 9 = ?",
    respostaCerta: 72,
    opcoes: [63, 64, 72, 81],
    explicacao: "8 vezes 9 é 72 (80 - 8).",
    obstaculos: [
      { tipo: "fogo", inicio: 26, largura: 10 },
      { tipo: "agua", inicio: 46, largura: 10 },
      { tipo: "fogo", inicio: 66, largura: 10 }
    ]
  },
  {
    conta: "100 - 37 = ?",
    respostaCerta: 63,
    opcoes: [53, 63, 67, 73],
    explicacao: "100 - 30 = 70, e 70 - 7 = 63.",
    obstaculos: [
      { tipo: "agua", inicio: 25, largura: 10 },
      { tipo: "fogo", inicio: 45, largura: 11 },
      { tipo: "agua", inicio: 66, largura: 11 }
    ]
  }
];

// Estado atual do jogo
let indiceFaseAtual = 0;
let pontuacao = 0;
let portaDestrancada = false;
let jogoFinalizado = false;
let tempoInicioMs = Date.now();
let intervaloRelogio = null;

// Posições dos personagens (em porcentagem horizontal de 0 a 100)
// Água começa um pouco à frente do Fogo e eles caminham juntos
let posicaoAguaX = 11;
let posicaoFogoX = 4;
let estaPulando = false;
let alturaPulo = 0;

// Elementos da tela
const textoFase = document.getElementById("texto-fase");
const textoPontos = document.getElementById("texto-pontos");
const textoTempo = document.getElementById("texto-tempo");
const statusPorta = document.getElementById("status-porta");
const portaSaida = document.getElementById("porta-saida");
const iconePorta = document.getElementById("icone-porta");
const camadaObstaculos = document.getElementById("camada-obstaculos");
const elAgua = document.getElementById("personagem-agua");
const elFogo = document.getElementById("personagem-fogo");
const textoConta = document.getElementById("texto-conta");
const opcoesResposta = document.getElementById("opcoes-resposta");
const mensagemFeedback = document.getElementById("mensagem-feedback");
const telaVitoria = document.getElementById("tela-vitoria");
const finalPontos = document.getElementById("final-pontos");
const finalTempo = document.getElementById("final-tempo");
const botaoTema = document.getElementById("botao-tema");

// =========================================================
// INTEGRAÇÃO COM O PORTAL DA ESCOLA (vrgame)
// =========================================================

function enviarAlturaParaPortal() {
  const altura = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: "vrgame:resize", height: altura }, "*");
}

function aplicarTema(tema) {
  if (tema === "light" || tema === "claro") {
    document.body.classList.add("tema-claro");
    botaoTema.textContent = "🌙";
  } else {
    document.body.classList.remove("tema-claro");
    botaoTema.textContent = "☀️";
  }
  enviarAlturaParaPortal();
}

// Escuta mensagens enviadas pelo portal (tema e tela cheia)
window.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme") {
    const temaRecebido = dados.theme || dados.value || "dark";
    aplicarTema(temaRecebido);
  }

  if (dados.type === "vrgame:fullscreen") {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setTimeout(enviarAlturaParaPortal, 150);
  }
});

window.addEventListener("resize", enviarAlturaParaPortal);

// =========================================================
// CONTROLE DE TEMPO E INTERFACE
// =========================================================

function formatarTempo(ms) {
  const totalSegundos = Math.floor(ms / 1000);
  const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
  const segundos = String(totalSegundos % 60).padStart(2, "0");
  return `${minutos}:${segundos}`;
}

function iniciarRelogio() {
  if (intervaloRelogio) clearInterval(intervaloRelogio);
  intervaloRelogio = setInterval(() => {
    if (!jogoFinalizado) {
      const decorrido = Date.now() - tempoInicioMs;
      textoTempo.textContent = formatarTempo(decorrido);
    }
  }, 500);
}

function mostrarFeedback(texto, tipo) {
  mensagemFeedback.textContent = texto;
  mensagemFeedback.className = `feedback ${tipo}`;
  enviarAlturaParaPortal();
}

function atualizarPosicaoVisualPersonagens() {
  elAgua.style.left = `${posicaoAguaX}%`;
  elFogo.style.left = `${posicaoFogoX}%`;

  const baseChao = 28 + alturaPulo;
  elAgua.style.bottom = `${baseChao}px`;
  elFogo.style.bottom = `${baseChao}px`;
}

// =========================================================
// CARREGAMENTO DA FASE E DESAFIO MATEMÁTICO
// =========================================================

function carregarFase(indice) {
  const fase = FASES_DO_JOGO[indice];
  portaDestrancada = false;
  estaPulando = false;
  alturaPulo = 0;

  // Posição inicial segura na esquerda do templo
  posicaoFogoX = 4;
  posicaoAguaX = 11;
  atualizarPosicaoVisualPersonagens();

  // Atualiza cabeçalho e porta
  textoFase.textContent = `${indice + 1} / ${FASES_DO_JOGO.length}`;
  textoPontos.textContent = pontuacao;
  statusPorta.textContent = "🔒 Porta Trancada";
  portaSaida.classList.remove("aberta");
  portaSaida.classList.add("trancada");
  iconePorta.textContent = "🔒";

  // Desenha as poças de fogo e água da fase
  camadaObstaculos.innerHTML = "";
  fase.obstaculos.forEach((obs) => {
    const divObs = document.createElement("div");
    divObs.className = `obstaculo poca-${obs.tipo}`;
    divObs.style.left = `${obs.inicio}%`;
    divObs.style.width = `${obs.largura}%`;
    divObs.textContent = obs.tipo === "fogo" ? "🔥" : "💧";
    camadaObstaculos.appendChild(divObs);
  });

  // Monta a conta matemática e os botões de resposta
  textoConta.textContent = fase.conta;
  opcoesResposta.innerHTML = "";

  fase.opcoes.forEach((valorOpcao) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "botao-opcao";
    botao.textContent = valorOpcao;
    botao.addEventListener("click", () => verificarRespostaMatematica(valorOpcao));
    opcoesResposta.appendChild(botao);
  });

  enviarAlturaParaPortal();
}

function verificarRespostaMatematica(valorEscolhido) {
  if (jogoFinalizado || portaDestrancada) return;

  const fase = FASES_DO_JOGO[indiceFaseAtual];

  if (valorEscolhido === fase.respostaCerta) {
    portaDestrancada = true;
    pontuacao += 100;
    textoPontos.textContent = pontuacao;

    // Abre a porta visualmente
    statusPorta.textContent = "🔓 Porta Aberta!";
    portaSaida.classList.remove("trancada");
    portaSaida.classList.add("aberta");
    iconePorta.textContent = "🚪";

    // Desativa botões da conta já resolvida
    const botoes = opcoesResposta.querySelectorAll("button");
    botoes.forEach((b) => (b.disabled = true));

    mostrarFeedback(`Acertou! ${fase.explicacao} Agora leve Água e Fogo até a porta!`, "acerto");
  } else {
    pontuacao = Math.max(0, pontuacao - 20);
    textoPontos.textContent = pontuacao;
    mostrarFeedback(`Ops, ${valorEscolhido} não é o resultado. ${fase.explicacao} Voltando ao início da fase!`, "erro");
    carregarFase(indiceFaseAtual);
  }
}

// =========================================================
// MOVIMENTO, PULO E COLISÃO COM OBSTÁCULOS
// =========================================================

function pular() {
  if (jogoFinalizado || estaPulando) return;

  estaPulando = true;
  alturaPulo = 54;
  atualizarPosicaoVisualPersonagens();

  setTimeout(() => {
    alturaPulo = 0;
    estaPulando = false;
    atualizarPosicaoVisualPersonagens();
    verificarColisoesEChegada();
  }, 420);
}

function moverPersonagens(passo) {
  if (jogoFinalizado) return;

  // Limites para manter os dois dentro da tela
  const novoFogoX = Math.max(2, Math.min(82, posicaoFogoX + passo));
  const diferenca = novoFogoX - posicaoFogoX;

  posicaoFogoX = novoFogoX;
  posicaoAguaX = Math.max(9, Math.min(89, posicaoAguaX + diferenca));

  atualizarPosicaoVisualPersonagens();
  verificarColisoesEChegada();
}

function verificarColisoesEChegada() {
  const fase = FASES_DO_JOGO[indiceFaseAtual];

  // Se estiverem no ar (pulando), passam por cima das poças com segurança
  if (!estaPulando) {
    for (const obs of fase.obstaculos) {
      const fimObs = obs.inicio + obs.largura;

      // Água não pode encostar em poça de fogo
      const aguaNoObstaculo = posicaoAguaX + 3 > obs.inicio && posicaoAguaX < fimObs;
      if (obs.tipo === "fogo" && aguaNoObstaculo) {
        mostrarFeedback("💧 A Água encostou no fogo! Use o botão Pular para atravessar.", "erro");
        carregarFase(indiceFaseAtual);
        return;
      }

      // Fogo não pode encostar em poça de água
      const fogoNoObstaculo = posicaoFogoX + 3 > obs.inicio && posicaoFogoX < fimObs;
      if (obs.tipo === "agua" && fogoNoObstaculo) {
        mostrarFeedback("🔥 O Fogo encostou na água! Use o botão Pular para atravessar.", "erro");
        carregarFase(indiceFaseAtual);
        return;
      }
    }
  }

  // Verifica se chegaram juntos até a porta de saída (direita da tela)
  if (posicaoAguaX >= 84) {
    if (!portaDestrancada) {
      mostrarFeedback("A porta está trancada! Resolva a conta matemática acima para abrir.", "neutro");
      return;
    }

    avancarDeFase();
  }
}

function avancarDeFase() {
  pontuacao += 50;
  textoPontos.textContent = pontuacao;

  if (indiceFaseAtual + 1 < FASES_DO_JOGO.length) {
    indiceFaseAtual++;
    mostrarFeedback(`Muito bem! Vocês avançaram para a fase ${indiceFaseAtual + 1}!`, "acerto");
    carregarFase(indiceFaseAtual);
  } else {
    finalizarJogo();
  }
}

function finalizarJogo() {
  jogoFinalizado = true;
  clearInterval(intervaloRelogio);

  const tempoTotalMs = Date.now() - tempoInicioMs;
  const maxScore = FASES_DO_JOGO.length * 150;

  finalPontos.textContent = `${pontuacao} / ${maxScore}`;
  finalTempo.textContent = formatarTempo(tempoTotalMs);
  telaVitoria.classList.remove("escondido");

  // Envia o resultado final para o portal da escola
  window.parent.postMessage(
    {
      type: "vrgame:finish",
      score: pontuacao,
      maxScore: maxScore,
      timeMs: tempoTotalMs,
      detail: { jogo: "desafio-dos-elementos" }
    },
    "*"
  );

  enviarAlturaParaPortal();
}

function reiniciarJogoCompleto() {
  indiceFaseAtual = 0;
  pontuacao = 0;
  jogoFinalizado = false;
  tempoInicioMs = Date.now();
  telaVitoria.classList.add("escondido");
  mostrarFeedback("Resolva a conta e guie Água e Fogo juntos até a porta!", "neutro");
  carregarFase(0);
  iniciarRelogio();
}

// =========================================================
// EVENTOS DE BOTÕES E TECLADO
// =========================================================

document.getElementById("btn-esquerda").addEventListener("click", () => moverPersonagens(-6));
document.getElementById("btn-direita").addEventListener("click", () => moverPersonagens(6));
document.getElementById("btn-pular").addEventListener("click", pular);
document.getElementById("btn-reiniciar-fase").addEventListener("click", () => {
  mostrarFeedback("Fase reiniciada. Tente novamente!", "neutro");
  carregarFase(indiceFaseAtual);
});

document.getElementById("btn-jogar-novamente").addEventListener("click", reiniciarJogoCompleto);

botaoTema.addEventListener("click", () => {
  const estaClaro = document.body.classList.contains("tema-claro");
  aplicarTema(estaClaro ? "dark" : "light");
});

// Suporte ao teclado no computador (setas ou A/D/W/Espaço)
document.addEventListener("keydown", (evento) => {
  if (evento.key === "ArrowLeft" || evento.key === "a" || evento.key === "A") {
    moverPersonagens(-6);
  } else if (evento.key === "ArrowRight" || evento.key === "d" || evento.key === "D") {
    moverPersonagens(6);
  } else if (evento.key === "ArrowUp" || evento.key === "w" || evento.key === "W" || evento.key === " ") {
    evento.preventDefault();
    pular();
  }
});

// =========================================================
// INICIALIZAÇÃO DO JOGO
// =========================================================

carregarFase(0);
iniciarRelogio();

// Avisa ao portal que o jogo carregou e está pronto
window.parent.postMessage({ type: "vrgame:ready" }, "*");
enviarAlturaParaPortal();