const searchInput = document.getElementById("episodeSearch");
const episodeSelector = document.getElementById("episodeSelector");
const episodeCount = document.getElementById("episodeCount");
const episodesGrid = document.getElementById("episodesGrid");

let showsCache = null;
let episodesCache = {};
let currentShows = [];
let currentEpisodes = [];
let viewMode = "shows";

async function loadShows() {
  if (showsCache) {
    currentShows = showsCache;
    renderShows(currentShows);
    return;
  }

  const res = await fetch("https://api.tvmaze.com/shows");
  const data = await res.json();

  data.sort((a, b) => a.name.localeCompare(b.name));
  showsCache = data;
  currentShows = data;

  renderShows(currentShows);
}

function renderShows(shows) {
  viewMode = "shows";
  episodesGrid.innerHTML = "";
  episodeSelector.style.display = "none";
  episodeCount.textContent = `Displaying ${shows.length} shows`;

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "episodeCard";

    card.innerHTML = `
  <h2 class="show-link">${show.name}</h2>

  <img
    src="${show.image ? show.image.medium : ""}"
    alt="${show.name}"
    class="show-link"
  />

  <div class="summary">
    ${show.summary || "No summary available."}
  </div>

  <ul class="show-meta">
    <li><strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}</li>
    <li><strong>Status:</strong> ${show.status || "N/A"}</li>
    <li><strong>Rating:</strong> ${
      show.rating && show.rating.average ? show.rating.average : "N/A"
    }</li>
    <li><strong>Runtime:</strong> ${
      show.runtime ? show.runtime : "N/A"
    } minutes</li>
  </ul>

  <button>View Episodes</button>
`;

    card
      .querySelectorAll(".show-link, button")
      .forEach((el) =>
        el.addEventListener("click", () => loadEpisodes(show.id))
      );

    episodesGrid.appendChild(card);
  });

  addTVMazeCredit();
}

async function loadEpisodes(showID) {
  viewMode = "episodes";
  episodeSelector.style.display = "inline";

  if (episodesCache[showID]) {
    currentEpisodes = episodesCache[showID];
    renderEpisodes(currentEpisodes);
    return;
  }

  const res = await fetch(`https://api.tvmaze.com/shows/${showID}/episodes`);
  const episodes = await res.json();

  episodesCache[showID] = episodes;
  currentEpisodes = episodes;
  renderEpisodes(episodes);
}

function renderEpisodes(episodes) {
  episodesGrid.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Shows";
  backBtn.onclick = () => renderShows(currentShows);
  episodesGrid.appendChild(backBtn);

  episodeSelector.innerHTML = "";

  episodes.forEach((ep) => {
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;

    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${code} - ${ep.name}`;
    episodeSelector.appendChild(option);

    const card = document.createElement("div");
    card.className = "episodeCard";
    card.innerHTML = `
      <h2>${ep.name} - ${code}</h2>
      <img src="${ep.image ? ep.image.medium : ""}" alt="${ep.name}" />
      <div class="summary">
        ${ep.summary || "No summary available."}
      </div>
      <a href="${ep.url}" target="_blank">View on TVMaze</a>
    `;

    episodesGrid.appendChild(card);
  });

  episodeCount.textContent = `Displaying ${episodes.length} episodes`;
  addTVMazeCredit();
}

searchInput.addEventListener("input", () => {
  const text = searchInput.value.toLowerCase();

  if (viewMode === "shows") {
    const filtered = currentShows.filter(
      (show) =>
        show.name.toLowerCase().includes(text) ||
        (show.summary && show.summary.toLowerCase().includes(text)) ||
        show.genres.join(" ").toLowerCase().includes(text)
    );

    renderShows(filtered);
  } else {
    const filtered = currentEpisodes.filter(
      (ep) =>
        ep.name.toLowerCase().includes(text) ||
        (ep.summary && ep.summary.toLowerCase().includes(text))
    );

    renderEpisodes(filtered);
  }
});

episodeSelector.addEventListener("change", () => {
  const index = currentEpisodes.findIndex(
    (ep) => ep.id == episodeSelector.value
  );

  const card = episodesGrid.children[index + 1];
  if (card) {
    card.scrollIntoView({ behavior: "smooth" });
  }
});

function addTVMazeCredit() {
  if (!document.getElementById("tvmazeCredit")) {
    const footer = document.createElement("footer");
    footer.id = "tvmazeCredit";
    footer.innerHTML =
      'Data provided by <a href="https://www.tvmaze.com/api" target="_blank">TVMaze.com</a>';
    document.body.appendChild(footer);
  }
}

loadShows();
