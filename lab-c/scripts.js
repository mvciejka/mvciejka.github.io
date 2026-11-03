// =======================================================================================================
//
//                                       button: Moja lokalizacja
//
// =======================================================================================================
const x = document.getElementById("pozycja-info");
let marker = null;
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    x.innerHTML = "<strong>Błąd pobierania lokalizacji:</strong> Twoja przeglądarka nie wspiera geolokalizacji.";
    x.classList.add("error");
  }
}

function success(position) {
  // tekstowa informacja o lokalizacji
  x.innerHTML = "<h3>Twoja lokalizacja</h3>" +
    "<strong>Szerokość geograficzna:</strong> " + position.coords.latitude +
    "<br><strong>Długość geograficzna:</strong> " + position.coords.longitude;
  x.classList.remove("error");

  // ustawianie widoku na obecną lokalizację
  map.setView([position.coords.latitude, position.coords.longitude], 16);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  }).addTo(map);

  if (marker) map.removeLayer(marker);
  L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)
    .bindPopup('Twoja lokalizacja')
    .openPopup();
  document.getElementById("bt-usun-znacznik").hidden = false;
}

function error(positionError) {
  alert("Nie udało się pobrać lokalizacji: " + positionError.message);
}

function removeMarker() {
  if (marker) {
    map.removeLayer(marker);
    marker = null;
  }
  document.querySelectorAll("img.leaflet-marker-icon").forEach(marker => {marker.remove();})
  document.getElementById("bt-usun-znacznik").hidden = true;
}

// =======================================================================================================
//
//                                       button: Pobierz mapę
//
// =======================================================================================================
function mapScreenshot() {
  const container = map.getContainer();
  const area = container.getBoundingClientRect();
  const originX = area.left + container.clientLeft;
  const originY = area.top + container.clientTop;

  const canvas = document.createElement("canvas");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  const context = canvas.getContext("2d");

  container.querySelectorAll("img.leaflet-tile-loaded").forEach(img => {
    const r = img.getBoundingClientRect();
    context.drawImage(img, r.left - originX, r.top - originY, r.width, r.height);
  });
  return canvas;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

function makeDraggable(el) {
  el.draggable = true;
  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", el.id);
    e.dataTransfer.effectAllowed = "move";
    el.classList.add("dragging");
  });
  el.addEventListener("dragend", () => el.classList.remove("dragging"));
}
function splitCanvasIntoPuzzles(src_canvas, cols=4, rows=4) {
  const pieces = [];
  const w = Math.floor(src_canvas.width / cols);
  const h = Math.floor(src_canvas.height / rows);

  for (let row = 0; row < rows; row++){
    for (let col = 0; col < cols; col++) {
      const piece = document.createElement("canvas");
      piece.width = w;
      piece.height = h;
      piece.getContext("2d").drawImage(src_canvas, col * w, row * h, w, h, 0, 0, w, h);
      piece.className = "puzzle-piece";
      const index = row * cols + col;
      piece.id = "piece-" + index;
      piece.dataset.index = index;
      makeDraggable(piece);
      pieces.push(piece);
    }
  }
  return shuffleArray(pieces);
}

function getMap() {
  // czyszczenie rozsypanki
  const rozsypanka = document.getElementById('rozsypanka');
  rozsypanka.innerHTML = "";
  createGrid();
  // zapisywanie mapy do canvasa
  const screenshot = mapScreenshot();
  const pieces = splitCanvasIntoPuzzles(screenshot);
  // dodawanie puzzli do rozsypanki
  pieces.forEach(piece => {rozsypanka.appendChild(piece);});
}

// =======================================================================================================
//
//                                       grid do układanie puzzli #puzzle
//
// =======================================================================================================
function createGrid(cols = 4, rows = 4) {
  const board = document.getElementById("puzzle");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let i = 0; i < cols * rows; i++) {
    const cell = document.createElement("div");
    cell.className = "drop-zone";
    cell.dataset.index = i;
    board.appendChild(cell);
  }
}

function allowDrop(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function getDraggedPiece(e) {
  return document.getElementById(e.dataTransfer.getData("text/plain"));
}

function dropOnGrid(e) {
  e.preventDefault();
  const cell = e.target.closest(".drop-zone");
  const piece = getDraggedPiece(e);
  if (!cell || !piece) return;

  const occupant = cell.firstElementChild;
  if (occupant === piece) return;

  if (occupant) piece.parentElement.appendChild(occupant);
  cell.appendChild(piece);
  checkPuzzle();
}

function dropOnRozsypanka(e) {
  e.preventDefault();
  const piece = getDraggedPiece(e);
  if (piece) document.getElementById("rozsypanka").appendChild(piece);
}

function checkPuzzle() {
  const cells = [...document.querySelectorAll("#puzzle .drop-zone")];
  const filled = cells.filter(cell => cell.querySelector(".puzzle-piece"));
  if (filled.length !== cells.length) return;

  const correct = cells.every(cell => cell.querySelector(".puzzle-piece").dataset.index === cell.dataset.index);
  if (correct) {
    console.log("Puzzle ułozone poprawnie");
    notify("Brawo!", "Puzzle ułozone poprawnie!");
  }
  else {
    console.log("Puzzle ułozone niepoprawnie");
    notify("Ups!", "Nie udało się ułoyć puzzli. Spróbuj jeszcze raz.")
  }
}

// =======================================================================================================
//
//                                     powiadomienia systemowe
//
// =======================================================================================================
function askNotificationPermission() {
  if (!("Notification" in window)) {
    alert("Twoja przeglądarka nie obsługuje powiadomień systemowych!");
    return;
  }
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body
    });
  }
  else {
    alert(title + " " + body);
  }
}
// =======================================================================================================
//
//                                            MAIN
//
// =======================================================================================================
//inicjalizacja mapy
const map = L.map('map');
// Plac Grunwaldzki
map.setView([53.432800827175164, 14.548062585212087], 16);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  maxZoom: 19
}).addTo(map);

askNotificationPermission();

createGrid();
const board = document.getElementById("puzzle");
board.addEventListener("dragover", allowDrop);
board.addEventListener("drop", dropOnGrid);

const rozsypanka = document.getElementById("rozsypanka");
rozsypanka.addEventListener("dragover", allowDrop);
rozsypanka.addEventListener("drop", dropOnRozsypanka);







