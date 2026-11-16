// ============================================================================
// SERVICIOS DE COMUNICACIÓN CON APIS (Firebase & PokeAPI)
// ============================================================================
import { FIREBASE_URL, POKEAPI_URL, MAX_POKEMON_ID } from "../config.js";

async function request(url, options = {}) {
  const res = await fetch(url, options);
  return res.json();
}

/**
 * Registra o actualiza el usuario en Firebase según su email.
 * @returns {Promise<string>} ID del usuario en Firebase
 */
export async function syncUser(username, email) {
  const users = (await request(`${FIREBASE_URL}/users.json`)) || {};
  const [foundId] =
    Object.entries(users).find(
      ([, u]) => u?.email?.toLowerCase() === email.toLowerCase()
    ) || [];

  if (foundId) {
    await request(`${FIREBASE_URL}/users/${foundId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email })
    });
    return foundId;
  }

  const created = await request(`${FIREBASE_URL}/users.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email })
  });
  return created.name;
}

/**
 * Obtiene parejas de Pokémon aleatorios desde la PokeAPI.
 * @param {number} count Número de Pokémon distintos requeridos
 */
export async function getPokemons(count) {
  const uniqueIds = new Set();
  while (uniqueIds.size < count) {
    uniqueIds.add(Math.floor(Math.random() * MAX_POKEMON_ID) + 1);
  }

  return Promise.all(
    [...uniqueIds].map(async (id) => {
      const data = await request(`${POKEAPI_URL}/${id}`);
      return {
        id: data.id,
        image:
          data.sprites?.other?.["official-artwork"]?.front_default ||
          data.sprites?.front_default
      };
    })
  );
}

/**
 * Guarda el resultado de una partida ganada en Firebase.
 */
export async function saveRanking(userId, time, cards) {
  const created = await request(`${FIREBASE_URL}/rankings.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, time, cards })
  });
  return created.name;
}

/**
 * Carga simultáneamente los rankings y los usuarios registrados.
 */
export async function fetchRankingData() {
  const [rankings, users] = await Promise.all([
    request(`${FIREBASE_URL}/rankings.json`),
    request(`${FIREBASE_URL}/users.json`)
  ]);
  return { rankings: rankings || {}, users: users || {} };
}
