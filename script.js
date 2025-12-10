//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // clear previous

  episodeList.forEach((episode) => {
    const card = document.createElement("div");
    card.className = "episode-card";

    const code = makeEpisodeCode(episode.season, episode.number);

    card.innerHTML = `
<div class="episode-title">${episode.name} – ${code}</div>
<img src="${episode.image.medium}" alt="Episode image" />
<div class="summary">${episode.summary}</div>
<a href="${episode.url}" target="_blank">View on TVMaze</a>
`;

    rootElem.appendChild(card);
  });
}

function makeEpisodeCode(season, episodeNum) {
  const s = season.toString().padStart(2, "0");
  const e = episodeNum.toString().padStart(2, "0");
  return `S${s}E${e}`;
}

window.onload = setup;
