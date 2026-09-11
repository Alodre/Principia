// UI ELEMENTS
const weightReading = document.getElementById("weight-reading");
const percentageReading = document.getElementById("percentage-reading");
const statusMessage = document.getElementById("status-message");
const bagcountReading = document.getElementById("bagcount-reading");

// BUTTONS
const resetButton = document.getElementById("reset-button");
const refreshButton = document.getElementById("refresh-button");
const testButton = document.getElementById("test-button");
const toggleBtn = document.getElementById('changelog-toggle');
const panel = document.getElementById('changelog-panel');
const closeBtn = document.getElementById('changelog-close');

// CONSTANTS
const FULL_BAG_WEIGHT_GRAMS = 1000;

// UI ELEMENTS
const landingScreen = document.getElementById("landing-screen");
const monitorScreen = document.getElementById("monitor-screen");
const ivWeightButton = document.getElementById("iv-weight-button");
const backButton = document.getElementById("back-button");



ivWeightButton.addEventListener("click", () => {
    landingScreen.style.display = "none";
    monitorScreen.style.display = "block";
});

backButton.addEventListener("click", () => {
    monitorScreen.style.display = "none";
    landingScreen.style.display = "block";
});




// Update the dashboard with the latest reading
function updateDashboard(weightInGrams, bagCount) {
  const percentage = Math.round(
    (weightInGrams / FULL_BAG_WEIGHT_GRAMS) * 100
  );

  weightReading.textContent = `${weightInGrams} g`;
  percentageReading.textContent = `${percentage}% remaining`;
  bagcountReading.textContent = ` ${bagCount}`;

 if (percentage <= 20) {
  statusMessage.textContent = "Status: Low fluid — replace soon";
  statusMessage.className = "status status--low";
} else {
  statusMessage.textContent = "Status: Normal";
  statusMessage.className = "status status--normal";
}
}

// Refresh the dashboard with the latest reading from ThingSpeak
async function refreshFromThingSpeak() {
  try {
    const url =
      `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}` +
      `/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`ThingSpeak returned ${response.status}`);
    }

    const data = await response.json();
    const latestEntry = data.feeds[0];
    const weightInGrams = Number(latestEntry.field1);
    const bagCount = Number(latestEntry.field2);

    if (!Number.isFinite(weightInGrams)) {
      throw new Error("ThingSpeak did not return a usable Weight_g value.");
    }

    updateDashboard(weightInGrams, bagCount);
  } catch (error) {
    statusMessage.textContent = "Status: Could not get latest reading";
    statusMessage.className = "status status--low";

    console.error(error);
  }
}

// Event listeners for buttons
testButton.addEventListener("click", () => {
  updateDashboard(150);
});
resetButton.addEventListener("click", () => {
  updateDashboard(FULL_BAG_WEIGHT_GRAMS);
});  
refreshButton.addEventListener("click", () => {
  refreshFromThingSpeak();
});

refreshFromThingSpeak();
setInterval(refreshFromThingSpeak, 10000);

async function loadHtmlFragment(url, targetId) {
  try {
    const resp = await fetch(url, {cache: "no-store"});
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const html = await resp.text();
    const container = document.getElementById(targetId);
    if (!container) throw new Error(`Missing element #${targetId}`);

    container.innerHTML = html;               // inject the fragment
    container.classList.remove('hidden');    // make it visible (if you want it open by default)
  } catch (e) {
    console.error(`Failed to load ${url}:`, e);
  }
}