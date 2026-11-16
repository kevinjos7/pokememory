// ============================================================================
// MÓDULO DE RANKING
// ============================================================================
import { fetchRankingData } from "../services/api.js";
import { formatTime } from "../utils/timer.js";

const rankingBody = document.getElementById("ranking-body");
let lastInsertedRankingId = null;

export function setLastInsertedRankingId(id) {
  lastInsertedRankingId = id;
}

function createRow(item, position) {
  const tr = document.createElement("tr");

  if (lastInsertedRankingId && item.id === lastInsertedRankingId) {
    tr.classList.add("highlight");
    tr.style.backgroundColor = "yellow";
  }

  tr.innerHTML = `
    <td>${position}</td>
    <td>${item.username}</td>
    <td>${item.email}</td>
    <td>${formatTime(item.time)}</td>
    <td>${item.cards}</td>
  `;
  return tr;
}

function createDotsRow() {
  const tr = document.createElement("tr");
  tr.classList.add("dots-row");
  tr.innerHTML = `<td colspan="5">...</td>`;
  return tr;
}

export async function renderRanking() {
  try {
    const { rankings, users } = await fetchRankingData();
    rankingBody.innerHTML = "";
    if (!rankings) return;

    // Normalizar lista y cruzar con datos de usuario
    const list = Object.entries(rankings).map(([id, item]) => ({
      id,
      username: users[item.userId]?.username || "Desconocido",
      email: users[item.userId]?.email || "-",
      time: Number(item.time),
      cards: Number(item.cards)
    }));

    // Ordenar: 1º cartas (descendente), 2º tiempo (ascendente)
    list.sort((a, b) => b.cards - a.cards || a.time - b.time);

    const total = list.length;
    if (total <= 5) {
      list.forEach((item, index) =>
        rankingBody.appendChild(createRow(item, index + 1))
      );
      return;
    }

    const highlightIndex = lastInsertedRankingId
      ? list.findIndex((item) => item.id === lastInsertedRankingId)
      : -1;

    // Primeros 4 clasificados siempre visibles
    for (let i = 0; i < 4; i++) {
      rankingBody.appendChild(createRow(list[i], i + 1));
    }

    if (highlightIndex === 4) {
      rankingBody.appendChild(createRow(list[4], 5));
      rankingBody.appendChild(createDotsRow());
    } else if (highlightIndex > 4) {
      rankingBody.appendChild(createDotsRow());
      rankingBody.appendChild(
        createRow(list[highlightIndex], highlightIndex + 1)
      );
      rankingBody.appendChild(createDotsRow());
    } else {
      rankingBody.appendChild(createDotsRow());
    }
  } catch (err) {
    console.error("Error al cargar ranking:", err);
  }
}
