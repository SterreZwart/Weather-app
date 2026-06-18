// DOM Elements
// 
const searchForm = document.getElementById("search-form");
const locationSearchInput = document.getElementById("location-search");
const searchSuggestions = document.getElementById("search-suggestions");
const unitsToggleBtn = document.getElementById("units-toggle-btn");
const unitMenu = document.getElementById("unit-menu");
const celsiusButton = document.getElementById("celsius-button");
const fahrenheitButton = document.getElementById("fahrenheit-button");
const currentLocationElement = document.getElementById("current-location");
const currentDateElement = document.getElementById("current-date");
const temperatureValueElement = document.getElementById("temperature-value");
const weatherIconElement = document.getElementById("weather-icon");
//const weatherDescriptionElement = document.getElementById('weather-description'); remove
const feelsLikeElement = document.getElementById("feels-like");
const humidityElement = document.getElementById("humidity");
const windSpeedElement = document.getElementById("wind-speed");
const precipitationElement = document.getElementById("precipitation");
const hourlyForecastContainer = document.getElementById(
  "hourly-forecast-container",
);
const dailyForecastContainer2 = document.getElementById(
  "daily-forecast-container2",
);
const locateBtn = document.getElementById("locate-btn");

// State Containers
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const noResultsState = document.getElementById("no-results-state");
const searchQueryDisplay = document.getElementById("search-query-display");
const dashboard = document.querySelector(".weather-dashboard");
const weatherDetails = document.querySelector(".weather-details")
const retryButton = document.getElementById("retry-button");

const API_BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_CODE_MAP = {
  0: { description: "Clear sky", icon: "icon-sunny.webp" },
  1: { description: "Mainly clear", icon: "icon-sunny.webp" },
  2: { description: "Partly cloudy", icon: "icon-partly-cloudy.webp" },
  3: { description: "Overcast", icon: "icon-overcast.webp" },
  45: { description: "Fog", icon: "icon-fog.webp" },
  48: { description: "Depositing rime fog", icon: "icon-fog.webp" },
  51: { description: "Drizzle: Light", icon: "icon-drizzle.webp" },
  53: { description: "Drizzle: Moderate", icon: "icon-drizzle.webp" },
  55: { description: "Drizzle: Dense intensity", icon: "icon-drizzle.webp" },
  61: { description: "Rain: Slight", icon: "icon-rain.webp" },
  63: { description: "Rain: Moderate", icon: "icon-rain.webp" },
  65: { description: "Rain: Heavy intensity", icon: "icon-rain.webp" },
  71: { description: "Snow fall: Slight", icon: "icon-snow.webp" },
  73: { description: "Snow fall: Moderate", icon: "icon-snow.webp" },
  75: { description: "Snow fall: Heavy intensity", icon: "icon-snow.webp" },
  80: { description: "Rain showers: Slight", icon: "icon-rain.webp" },
  81: { description: "Rain showers: Moderate", icon: "icon-rain.webp" },
  82: { description: "Rain showers: Violent", icon: "icon-rain.webp" },
  95: { description: "Thunderstorm", icon: "icon-storm.webp" },
};

// Application State
let currentLatitude = 52.52;
let currentLongitude = 13.41;
let currentCityName = "Berlin, Germany";
let currentUnit = "metric";
let selectedDayIndex = 0;
let lastWeatherData = null;

// --- Functions ---

function showState(state) {
  // 1. Add 'is-broken' class to body if there's an error, remove it if not
  if (state === errorState) {
    document.body.classList.add("is-broken");
  } else {
    document.body.classList.remove("is-broken");
  }

  // 2. Run your normal hiding/showing logic
  [loadingState, errorState, noResultsState, dashboard].forEach(
    (el) => (el.hidden = true),
  );
  state.hidden = false;
}

async function reverseGeocode(lat, lon) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const city = data.city || data.locality || "Unknown Location";
    const country = data.countryName || "";
    return country ? `${city}, ${country}` : city;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return "Your Location";
  }
}

async function detectLocation() {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by your browser");
    fetchAndDisplayWeather(); // Fallback
    return;
  }

  showState(loadingState);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;
      currentCityName = await reverseGeocode(currentLatitude, currentLongitude);
      locationSearchInput.value = ""; // Clear search if we found location
      selectedDayIndex = 0;
      await fetchAndDisplayWeather();
    },
    (error) => {
      console.warn("Geolocation error:", error.message);
      // Fallback to default Berlin if it's the first load or if user explicitly requested and it failed
      fetchAndDisplayWeather();
    },
    { timeout: 10000 },
  );
}

async function getCoordinates(locationName) {
  const url = `${GEOCODING_API_BASE_URL}?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { latitude, longitude, name, country } = data.results[0];
      return { latitude, longitude, name: `${name}, ${country}` };
    } else {
      searchQueryDisplay.textContent = locationName;
      showState(noResultsState);
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    errorMessage.textContent =
      "Could not find location. Check your connection.";
    showState(errorState);
    return null;
  }
}

async function getWeatherData(latitude, longitude, unit) {
  const isMetric = unit === "metric";
  const temperatureUnit = isMetric ? "celsius" : "fahrenheit";
  const windSpeedUnit = isMetric ? "kmh" : "mph";
  const precipitationUnit = isMetric ? "mm" : "inch";

  const url = `${API_BASE_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}&precipitation_unit=${precipitationUnit}&timezone=auto&forecast_days=7`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    errorMessage.textContent = "Something went wrong";
    showState(errorState);
    return null;
  }
}

function displayCurrentWeather(data) {
  const current = data.current;
  const weatherInfo = WEATHER_CODE_MAP[current.weather_code] || {
    description: "Unknown",
    icon: "icon-sunny.webp",
  };

  currentLocationElement.textContent = currentCityName;
  currentDateElement.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  temperatureValueElement.textContent = Math.round(current.temperature_2m);

  weatherIconElement.src = `./assets/images/${weatherInfo.icon}`;
  weatherIconElement.alt = weatherInfo.description;
  //weatherDescriptionElement.textContent = weatherInfo.description; remove

  const unitSuffix = currentUnit === "metric" ? "km/h" : "mph";
  const precipSuffix = currentUnit === "metric" ? "mm" : "in";

  feelsLikeElement.textContent = `${Math.round(current.apparent_temperature)}°`;
  humidityElement.textContent = `${current.relative_humidity_2m}%`;
  windSpeedElement.textContent = `${Math.round(current.wind_speed_10m)} ${unitSuffix}`;

  // Sum of precipitation for today
  const totalPrecip = data.daily.precipitation_sum[0] || 0;
  precipitationElement.textContent = `${totalPrecip} ${precipSuffix}`;
}

function displayHourlyForecast(data) {
  hourlyForecastContainer.innerHTML = "";

  const startIndex = selectedDayIndex * 24;
  const endIndex = startIndex + 24;

  const now = new Date();
  const currentHour = now.getHours();

  let displayedCount = 0;

  for (let i = startIndex; i < endIndex; i++) {
    // If it's today (selectedDayIndex === 0), skip past hours
    if (selectedDayIndex === 0 && i < startIndex + currentHour) continue;

    // If it's today, stop after rendering 8 hours.
    // For future days, this limit is ignored, showing the whole day (or you can adjust this).

    const timeValue = new Date(data.hourly.time[i]);
    // Use padStart to ensure "9:00" looks like "09:00" if desired, or keep your format
    const hour = timeValue.getHours();
    const temp = Math.round(data.hourly.temperature_2m[i]);
    const code = data.hourly.weather_code[i];
    const weatherInfo = WEATHER_CODE_MAP[code] || { icon: "icon-sunny.webp" };

    const row = document.createElement("div");
    row.className = "hourly-row";
    row.innerHTML = `
        <span class="hourly-time">${hour}:00</span>
        <img src="./assets/images/${weatherInfo.icon}" alt="" class="hourly-icon">
        <span class="hourly-temp">${temp}°</span>
        `;

    hourlyForecastContainer.appendChild(row);
    displayedCount++;
  }
}

function displayHourlyDaySelector(data) {
  const existingSelector = document.getElementById("hourly-day-selector");
  if (existingSelector) existingSelector.remove();

  const selector = document.createElement("div");
  selector.id = "hourly-day-selector";
  selector.className = "hourly-day-selector";

  for (let i = 0; i < 7; i++) {
    const dateValue = new Date(data.daily.time[i]);
    const dayName =
      i === 0
        ? "Today"
        : dateValue.toLocaleDateString("en-US", { weekday: "short" });

    const btn = document.createElement("button");
    btn.className = `hourly-day-btn ${i === selectedDayIndex ? "active" : ""}`;
    btn.textContent = dayName;
    btn.addEventListener("click", () => {
      selectedDayIndex = i;
      displayHourlyForecast(data);
      displayHourlyDaySelector(data);
    });
    selector.appendChild(btn);
  }

  hourlyForecastContainer.parentElement.insertBefore(
    selector,
    hourlyForecastContainer,
  );
}

function displayDailyForecast(data) {
  dailyForecastContainer2.innerHTML = "";
  const daily = data.daily;

  for (let i = 0; i < 7; i++) {
    const dateValue = new Date(daily.time[i]);
    const dayName =
      i === 0
        ? "Today"
        : dateValue.toLocaleDateString("en-US", { weekday: "short" });
    const maxTemp = Math.round(daily.temperature_2m_max[i]);
    const minTemp = Math.round(daily.temperature_2m_min[i]);
    const code = daily.weather_code[i];
    const weatherInfo = WEATHER_CODE_MAP[code] || { icon: "icon-sunny.webp" };

    const card = document.createElement("div");
    card.className = `daily-card ${i === selectedDayIndex ? "active" : ""}`;
    card.innerHTML = `
            <span class="daily-day">${dayName}</span>
            <img src="./assets/images/${weatherInfo.icon}" alt="" class="daily-icon">
            <div class="daily-temp-range">
                <span class="daily-temp-max">${maxTemp}°</span>
                <span class="daily-temp-min">${minTemp}°</span>
            </div>
        `;

    // Add click listener to daily cards as well for better UX
    card.addEventListener("click", () => {
      selectedDayIndex = i;
      displayHourlyForecast(data);
      displayHourlyDaySelector(data);

      // Highlight active daily card
      document
        .querySelectorAll(".daily-card")
        .forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });

    dailyForecastContainer2.appendChild(card);
  }
}

async function fetchAndDisplayWeather() {
  showState(loadingState);
  const weatherData = await getWeatherData(
    currentLatitude,
    currentLongitude,
    currentUnit,
  );
  if (weatherData) {
    lastWeatherData = weatherData;
    displayCurrentWeather(weatherData);
    displayHourlyForecast(weatherData);
    displayHourlyDaySelector(weatherData);
    displayDailyForecast(weatherData);
    showState(dashboard);
  }
}

// --- Event Listeners ---

let debounceTimer;
locationSearchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  clearTimeout(debounceTimer);
  if (query.length < 3) {
    searchSuggestions.hidden = true;
    return;
  }

  debounceTimer = setTimeout(async () => {
    const url = `${GEOCODING_API_BASE_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) {
        searchSuggestions.innerHTML = "";
        data.results.forEach((res) => {
          const li = document.createElement("li");
          li.textContent = `${res.name}, ${res.admin1 ? res.admin1 + ", " : ""}${res.country}`;
          li.addEventListener("click", () => {
            currentLatitude = res.latitude;
            currentLongitude = res.longitude;
            currentCityName = `${res.name}, ${res.country}`;
            locationSearchInput.value = currentCityName;
            searchSuggestions.hidden = true;
            selectedDayIndex = 0;
            fetchAndDisplayWeather();
          });
          searchSuggestions.appendChild(li);
        });
        searchSuggestions.hidden = false;
      } else {
        searchSuggestions.hidden = true;
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 300);
});

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const locationName = locationSearchInput.value.trim();
  if (locationName) {
    searchSuggestions.hidden = true;
    const coords = await getCoordinates(locationName);
    if (coords) {
      currentLatitude = coords.latitude;
      currentLongitude = coords.longitude;
      currentCityName = coords.name;
      selectedDayIndex = 0;
      await fetchAndDisplayWeather();
    }
  }
});

unitsToggleBtn.addEventListener("click", () => {
  unitMenu.hidden = !unitMenu.hidden;
  unitsToggleBtn.querySelector(".dropdown-icon").style.transform =
    unitMenu.hidden ? "rotate(0deg)" : "rotate(180deg)";
});

// Close unit menu when clicking outside
document.addEventListener("click", (e) => {
  if (!unitsToggleBtn.contains(e.target) && !unitMenu.contains(e.target)) {
    unitMenu.hidden = true;
    unitsToggleBtn.querySelector(".dropdown-icon").style.transform =
      "rotate(0deg)";
  }
});

celsiusButton.addEventListener("click", () => {
  if (currentUnit !== "metric") {
    currentUnit = "metric";
    celsiusButton.classList.add("active");
    fahrenheitButton.classList.remove("active");
    unitMenu.hidden = true;
    fetchAndDisplayWeather();
  }
});

fahrenheitButton.addEventListener("click", () => {
  if (currentUnit !== "imperial") {
    currentUnit = "imperial";
    fahrenheitButton.classList.add("active");
    celsiusButton.classList.remove("active");
    unitMenu.hidden = true;
    fetchAndDisplayWeather();
  }
});

retryButton.addEventListener("click", fetchAndDisplayWeather);

locateBtn.addEventListener("click", () => {
  detectLocation();
});

// Initial load
detectLocation();


