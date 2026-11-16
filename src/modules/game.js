// ============================================================================
// MÓDULO DEL JUEGO POKEMEMORY
// ============================================================================
import { getPokemons, saveRanking } from "../services/api.js";
import { startTimer, stopTimer, getSecondsElapsed } from "../utils/timer.js";
import { setLastInsertedRankingId, renderRanking } from "./ranking.js";

const board = document.getElementById("game-board");
const playBtn = document.getElementById("play-btn");
const timerEl = document.getElementById("timer");

let flippedCards = [];
let matchedPairs = 0;
let totalCardsCount = 0;
let lockBoard = false;

// Algoritmo Fisher-Yates para barajar el mazo
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function flipCard(card) {
  card.classList.add("flipped");
  card.style.backgroundImage = `url("${card.dataset.image}")`;
}

function unflipCard(card) {
  card.classList.remove("flipped");
  card.style.backgroundImage = "";
}

async function handleCardClick(card) {
  if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) {
    return;
  }

  flipCard(card);
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  lockBoard = true;
  const [c1, c2] = flippedCards;
  const isMatch = c1.dataset.id === c2.dataset.id;

  if (isMatch) {
    [c1, c2].forEach((c) => {
      c.classList.add("matched");
      c.style.backgroundColor = "green";
    });

    flippedCards = [];
    matchedPairs++;
    lockBoard = false;

    if (matchedPairs === totalCardsCount / 2) {
      handleVictory();
    }
  } else {
    setTimeout(() => {
      unflipCard(c1);
      unflipCard(c2);
      flippedCards = [];
      lockBoard = false;
    }, 850);
  }
}

async function handleVictory() {
  stopTimer();
  const userId = sessionStorage.getItem("user");
  if (!userId) return;

  try {
    const newRecordId = await saveRanking(
      userId,
      getSecondsElapsed(),
      totalCardsCount
    );
    setLastInsertedRankingId(newRecordId);
    await renderRanking();
  } catch (err) {
    console.error("Error al registrar victoria:", err);
  }
}

export async function startNewGame(numCards) {
  stopTimer();
  lockBoard = true;
  flippedCards = [];
  matchedPairs = 0;
  totalCardsCount = numCards;

  playBtn.textContent = "Volver a jugar";
  board.innerHTML = "<p>Cargando Pokémon...</p>";

  try {
    const pokemons = await getPokemons(numCards / 2);
    const deck = shuffle([...pokemons, ...pokemons]);

    board.innerHTML = "";
    deck.forEach((pokemon) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.dataset.id = String(pokemon.id);
      card.dataset.image = pokemon.image;
      card.addEventListener("click", () => handleCardClick(card));
      board.appendChild(card);
    });

    lockBoard = false;
    startTimer((formattedTime) => {
      timerEl.textContent = formattedTime;
    });
  } catch (err) {
    console.error("Error al inicializar la partida:", err);
    board.innerHTML = "<p>Error al cargar las cartas de PokeAPI.</p>";
  }
}
