const API = "https://pokeapi.co/api/v2";
const typeContainer = document.getElementById("type-container");
const cardContainer = document.getElementById("pokemon-container");
const backBtn = document.getElementById("backButton");

let currentOffset = 0;
const batchSize = 20;
let isLoading = false;

let selected = []; // selected types
let allPokemon = []; // master Pokémon list
let favourites = [];

let selectedPokemon = [];

//applies dark mode class  when clicked
const toggleBtn = document.getElementById("darkModeToggle");
toggleBtn.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

//handles rendering the pokemon to the page
function renderPokemon() {
  cardContainer.innerHTML = ""; //sets the default of the dom to be empty

  let pokemonToRender = allPokemon; // holds all the pokemon we want to display to the screen

  // apply AND filter only if types selected
  if (selected.length > 0) {
    pokemonToRender = allPokemon.filter(
      (
        pokemon //filtering logic - loops over all pokemon and keeps the one where the condition is true so the type of pokemon
      ) =>
        selected.every(
          (
            selectedType //.every all selected types are present in the pokemon so for dual types
          ) => pokemon.types.some((t) => t.type.name === selectedType) //.some  check if it has either typeing and adds it to the array
        ) //these functions work together to filter out the correct pokemon
    );
  }
  //loops through and adds card to the dom
  pokemonToRender.forEach((pokemon) => {
    const card = createPokemonCard(pokemon);
    cardContainer.appendChild(card);
  });
}

//gets the types and handles adding them to screen
async function getTypes() {
  try {
    for (let typeID = 1; typeID <= 18; typeID++) {
      const response = await fetch(`${API}/type/${typeID}`);
      const data = await response.json();
      const typeName = data.name;

      //creats the types as checkboxes

      const input = document.createElement("input");
      const label = document.createElement("label");

      input.type = "checkbox";
      input.id = typeName;
      input.className = "types";

      label.htmlFor = typeName;
      label.className = "type-button";
      label.textContent = typeName;

      typeContainer.appendChild(input);
      typeContainer.appendChild(label);

      //handles the logic for checking whats selected  adds to the array of types
      input.addEventListener("change", () => {
        if (input.checked) {
          selected.push(typeName);
          label.classList.add(`pokemon-type-${typeName}`); //hover class to change to shiny sprite
        } else {
          selected = selected.filter((t) => t !== typeName); // filters the type from the array
          label.classList.remove(`pokemon-type-${typeName}`); //removes hover class
        }

        renderPokemon(); //renders pokemon
      });
    }
  } catch (err) {
    console.error(err);
  }
}

//clears the array of any types
function clearTypes() {
  const clearBtn = document.getElementById("clear");

  clearBtn.addEventListener("click", () => {
    selected = []; //sets array = empty
    renderPokemon();
  });
}

//handles getting the pokemon data

async function getPokemon() {
  if (isLoading) return;
  isLoading = true;

  try {
    const response = await fetch(
      `${API}/pokemon?limit=${batchSize}&offset=${currentOffset}` //limits to how much to load at a time and tracks how many is loaded to the page
    );
    const data = await response.json(); //response
    currentOffset += batchSize; // keeps track of the data loaded

    const pokemonData = await Promise.all(
      data.results.map((p) => fetch(p.url).then((res) => res.json())) //promise function loads all data in parrallel the then renders after
    );

    allPokemon.push(...pokemonData); // adds the data to the pokemon array
    allPokemon.sort((a, b) => a.id - b.id); //ensures pokemon are rendered in sequential order

    renderPokemon(); //respects filters
  } catch (err) {
    console.error(err);
  }

  isLoading = false;
}

window.addEventListener("scroll", () => {
  //handles loading more pokemon
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.body.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    getPokemon();
  }
});

//creates the actual card
function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.dataset.id = `${pokemon.id}`;

  const img = document.createElement("img");
  img.className = "pokemon-image";

  const normal = pokemon.sprites.other["official-artwork"].front_default;
  const shiny = pokemon.sprites.other["official-artwork"].front_shiny;

  img.src = normal;
  img.alt = pokemon.name;

  img.addEventListener("mouseenter", () => (img.src = shiny)); //when mouse over the pokemon image then you can see it shiny
  img.addEventListener("mouseleave", () => (img.src = normal));

  card.appendChild(img);

  const id = document.createElement("p");
  id.className = "pokemon-id";
  id.textContent = `#${pokemon.id.toString().padStart(3, "0")}`;
  card.appendChild(id);

  const name = document.createElement("p");
  name.className = "pokemon-name";
  name.textContent = pokemon.name;
  card.appendChild(name);

  const typesContainer = document.createElement("div");
  typesContainer.className = "pokemon-types";

  //loops through each type the pokeon has and appends it to the type container
  pokemon.types.forEach((t) => {
    const span = document.createElement("span");
    span.className = "pokemon-type";
    span.id = `pokemon-type-${t.type.name}`;
    span.textContent = t.type.name;
    typesContainer.appendChild(span);
  });

  card.appendChild(typesContainer);
  console.log(card.id);
  return card;
}

function showPokemon() {
  document.getElementById("pokemonMain").style.display = "none";
  document.getElementById("pokemonDetail").style.display = "block";
}

function showPokedex() {
  document.getElementById("pokemonMain").style.display = "block";
  document.getElementById("pokemonDetail").style.display = "none";
}

//handles getting the pokemon details when clicked
function getPokemonDetails(id) {
  //find function returns the first pokemon that matches the id
  return allPokemon.find((pokemon) => pokemon.id == id);
}

cardContainer.addEventListener("click", (e) => {
  //listens for the click on teh card
  const card = e.target.closest(".pokemon-card");
  if (!card) return;
  const id = card.dataset.id;
  const pokemon = getPokemonDetails(id);

  if (pokemon) {
    showPokemonDetail(pokemon);
    showPokemon();
  }
});

//handles displaying the detail on the page
function showPokemonDetail(pokemon) {
  document.getElementById("pokemonId").innerText = `#${pokemon.id
    .toString()
    .padStart(3, "0")}`;
  document.getElementById("pokemonName").innerText = pokemon.name;
  document.getElementById("pokemonGenus").innerText = pokemon.genus || ""; // from species API

  // Image
  document.getElementById("pokemonImage").src =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;
  document.getElementById("pokemonImage").alt = pokemon.name;

  // Types
  const typesContainer = document.getElementById("pokemonTypes");
  typesContainer.innerHTML = ""; // clear old types
  pokemon.types.forEach(({ type }) => {
    const span = document.createElement("span");
    span.className = `pokemon-type ${type.name}`;
    span.innerText = type.name;
    span.style.backgroundColor = type.name; // optional function for consistent type colors
    typesContainer.appendChild(span);
  });

  // Physical info
  document.getElementById("pokemonHeight").innerText = `${
    pokemon.height / 10
  } m`; // height in meters
  document.getElementById("pokemonWeight").innerText = `${
    pokemon.weight / 10
  } kg`; // weight in kg

  // Description / Pokédex entry
  document.getElementById("pokemonDescription").innerText =
    pokemon.description || "No description available";

  // Base Stats
  const statsContainer = document.getElementById("statsContainer");
  statsContainer.innerHTML = ""; // clear old stats
  let total = 0;
  pokemon.stats.forEach((stat) => {
    total += stat.base_stat;
    const statDiv = document.createElement("div");
    statDiv.className = "stat";

    statDiv.innerHTML = `
      <div class="flex justify-between mb-1">
        <span>${stat.stat.name}</span>
        <span>${stat.base_stat}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-600" style="width: ${
          stat.base_stat / 2
        }%"></div>
      </div>
    `;

    statsContainer.appendChild(statDiv);
  });

  document.getElementById("totalStats").innerText = total;
}

//resets the page
backBtn.addEventListener("click", () => {
  showPokedex();
});

getTypes();
getPokemon();
clearTypes();
