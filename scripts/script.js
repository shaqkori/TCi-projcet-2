const API = "https://pokeapi.co/api/v2"; //initialises api
const typeContainer = document.getElementById("type-container"); //selects the type-container id
const cardContainer = document.getElementById("pokemon-container"); //selects the container
async function getTypes() {
  //try catch block used to handle errors without stoping the program works with the catch block to outline the errors
  try {
    //loops through the relevant types - doesn't use forEach as theres types returned that we dont want
    for (let typeID = 1; typeID < 19; typeID++) {
      const response = await fetch(`${API}/type/${typeID}`); // returns the id as the response

      if (!response.ok) {
        throw new Error("Could not fetch resource"); //error handeling
      }

      const data = await response.json();
      const type = data.name; // filters out the name from the object
      console.log(data.name);

      const button = document.createElement("button"); //creates button element

      button.textContent = type; // gives button the content of the type

      button.id = `${type}`; //the button id is set to type
      button.classList = "type-button"; // button class name is type-button

      typeContainer.appendChild(button); //adds button element to the type container
    }
  } catch (error) {
    //error handeling
    console.error(error);
  }
}

//handles creation of the pokemon card
function createPokemonCard(pokemon) {
  const card = document.createElement("div");
  card.className = "pokemon-card";

  const img = document.createElement("img");
  img.className = "pokemon-image";
  img.src = pokemon.sprites.other["official-artwork"].front_default;
  img.alt = pokemon.name;

  card.appendChild(img);

  const Pid = document.createElement("p");
  Pid.className = "pokemon-id";
  Pid.textContent = `#${pokemon.id.toString().padStart(3, "0")}`;
  card.appendChild(Pid);

  const name = document.createElement("p");
  name.className = "pokemon-name";
  name.textContent = pokemon.name;
  card.appendChild(name);

  const typesContainer = document.createElement("div");
  typesContainer.className = "pokemon-types";
  pokemon.types.forEach((t) => {
    const typeEl = document.createElement("span");
    typeEl.className = "pokemon-type";
    typeEl.id = `pokemon-type-${t.type.name}`; // <- note the .type
    typeEl.textContent = t.type.name;
    typesContainer.appendChild(typeEl);
  });

  card.appendChild(typesContainer);

  return card;
}

//handles loading of the pokmeon card element

async function getPokemon() {
  try {
    //fetch limit of 20
    const response = await fetch(`${API}/pokemon?limit=20`);
    const data = await response.json();

    //a promise so requests are parrallel waits for all of them to finish then apppends
    const pokemonPromises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    const allPokemonData = await Promise.all(pokemonPromises);

    //ensures data is in order
    allPokemonData.sort((a, b) => a.id - b.id);

    allPokemonData.forEach((pokemon) => {
      const card = createPokemonCard(pokemon);
      cardContainer.appendChild(card);
    });
  } catch (error) {
    console.error(error);
  }
}

getTypes();
getPokemon();
