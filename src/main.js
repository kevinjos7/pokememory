// ============================================================================
// PUNTO DE ENTRADA PRINCIPAL Y CONTROLADOR DE LA APLICACIÓN
// ============================================================================
import { syncUser } from "./services/api.js";
import { renderRanking } from "./modules/ranking.js";
import { startNewGame } from "./modules/game.js";

// Elementos del DOM
const userForm = document.getElementById("user-form");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");

const gameContainer = document.getElementById("game");
const gameForm = document.getElementById("game-form");
const cardsNumberInput = document.getElementById("cards-number");
const logoutBtn = document.getElementById("logout-btn");

const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const closeModalBtn = document.getElementById("close-modal-btn");

// Control de vistas y sesión
function checkSession() {
  const userId = sessionStorage.getItem("user");

  if (userId) {
    userForm.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    renderRanking();
  } else {
    userForm.classList.remove("hidden");
    gameContainer.classList.add("hidden");
  }
}

// Modal de errores de validación
function mostrarErrorModal(mensaje) {
  modalMessage.textContent = mensaje;
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
}

closeModalBtn.addEventListener("click", () => {
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.removeAttribute("open");
  }
});

// Eventos de login y logout
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  if (!username || !email) return;

  try {
    const userId = await syncUser(username, email);
    sessionStorage.setItem("user", userId);
    checkSession();
  } catch (err) {
    console.error("Error al registrar usuario:", err);
  }
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("user");
  window.location.reload();
});

// Configuración y arranque de partida
gameForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const rawValue = cardsNumberInput.value.trim();
  const num = Number(rawValue);

  const esEnteroPositivoPar =
    rawValue !== "" &&
    Number.isInteger(num) &&
    num > 0 &&
    num % 2 === 0;

  if (!esEnteroPositivoPar) {
    mostrarErrorModal("El número de cartas debe ser un número entero, positivo y par.");
    return;
  }

  await startNewGame(num);
});

// Inicialización de la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", checkSession);
