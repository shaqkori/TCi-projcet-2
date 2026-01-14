const API = "https://pokeapi.co/api/v2";
const typeContainer = document.getElementById("type-container");

async function getTypes() {
  try {
    for (let typeID = 1; typeID < 19; typeID++) {
      const response = await fetch(`${API}/type/${typeID}`);

      if (!response.ok) {
        throw new Error("Could not fetch resource");
      }

      const data = await response.json();
      const type = data.name;
      console.log(data.name);

      const button = document.createElement("button");

      button.textContent = type;

      button.id = `${type}`;
      button.classList = "type-button";

      typeContainer.appendChild(button);
    }
  } catch (error) {
    console.error(error);
  }
}

getTypes();
