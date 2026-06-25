# Weather App Code Index

This index provides a comprehensive map of the codebase, detailing the purpose of each file, its components, functions, styles, and state management.

---

## 📂 File Directory Map
- 🏠 **[index.html](file:///Users/sterrez/Projecten/opdracht%207%23%20weather-app-main%20kopie/index.html)**: The HTML5 structure of the weather application containing UI sections (Search, Header, Dashboard, Hourly/Daily Forecast, and State overlays).
- ⚙️ **[index.js](file:///Users/sterrez/Projecten/opdracht%207%23%20weather-app-main%20kopie/index.js)**: The application logic, including API requests, rendering loops, and UI interaction handlers.
- 🎨 **[style.css](file:///Users/sterrez/Projecten/opdracht%207%23%20weather-app-main%20kopie/style.css)**: The stylesheet defining variables, layout grids, components styling, transitions, and state representations (including the `.is-broken` state).
- 📝 **[GEMINI.md](file:///Users/sterrez/Projecten/opdracht%207%23%20weather-app-main%20kopie/GEMINI.md)**: AI agent instructions.
- 📘 **[README.md](file:///Users/sterrez/Projecten/opdracht%207%23%20weather-app-main%20kopie/README.md)**: Main user documentation and feature highlights.
- 📐 **[style-guide.md](file:///Users/sterrez/Projecten/opdracht%207%23%20weather-app-main%20kopie/style-guide.md)**: Visual specifications and assets guide.

---

## ⚙️ JavaScript Reference (`index.js`)

### 🔑 State Variables
- `currentLatitude` / `currentLongitude`: Latitude and longitude of the active location. Defaults to Berlin (`52.52`, `13.41`).
- `currentCityName`: Friendly name of the active city (e.g., `"Berlin, Germany"`).
- `currentUnit`: Active measurement standard (`"metric"` or `"imperial"`).
- `selectedDayIndex`: The index of the selected day in the 7-day forecast (default: `0` for today).
- `lastWeatherData`: Stores the last fetched raw weather payload.

### 🌐 APIs Integrated
1. **Reverse Geocoding**: BigDataCloud Reverse Geocode Client (`https://api.bigdatacloud.net/data/reverse-geocode-client`) to convert Coordinates to City names.
2. **Geocoding**: Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`) to search coordinates by city name.
3. **Weather**: Open-Meteo Forecast API (`https://api.open-meteo.com/v1/forecast`) to retrieve current temperature, weather code, humidity, wind, and forecast arrays.

### 🛠️ Function Dictionary
- **`showState(state)`**: Toggles visibility of UI overlay states (`loadingState`, `errorState`, `noResultsState`, `dashboard`). Manages `.is-broken` class on `document.body` when error state is active.
- **`reverseGeocode(lat, lon)`**: Resolves a coordinates pair to a friendly locality and country string.
- **`detectLocation()`**: Requests geolocation via browser API (`navigator.geolocation`) and triggers a refresh.
- **`getCoordinates(locationName)`**: Resolves typed location queries to coordinates via the Geocoding API.
- **`getWeatherData(latitude, longitude, unit)`**: Retrieves the 7-day hourly and daily weather metrics using configured units.
- **`displayCurrentWeather(data)`**: Updates the DOM elements for current temperature, location, feels-like, wind, humidity, and precipitation.
- **`displayHourlyForecast(data)`**: Formats and inserts hourly weather conditions for the selected day into the layout.
- **`displayHourlyDaySelector(data)`**: Dynamically generates buttons to toggle between forecast days for hourly breakdowns.
- **`displayDailyForecast(data)`**: Generates 7 cards for the daily forecast, binding event listeners to update hourly projections on click.
- **`fetchAndDisplayWeather()`**: Orchestrates asynchronous data flows, updating state elements accordingly.

### 🔌 Event Listeners
- **Location Input Search**: Listens to input on `#location-search` to fetch recommendations using a 300ms debounce.
- **Search Form Submit**: Listens to submit on `#search-form` to fetch coordinates for the entered city.
- **Unit Dropdown Toggle**: Listens to clicks on `#units-toggle-btn` to show/hide units menu.
- **Close Unit Menu**: Global document click listener that closes `#unit-menu` when clicked outside.
- **Unit Selectors**: Listens to clicks on `#celsius-button` and `#fahrenheit-button` to update current units and reload data.
- **Locate Button**: Listens to clicks on `#locate-btn` to re-trigger `detectLocation()`.
- **Retry Button**: Listens to clicks on `#retry-button` in the error overlay to call `fetchAndDisplayWeather()`.

---

## 🏠 HTML Structure (`index.html`)

### 🧩 UI Regions & IDs
- `#search-form`: Form element handling submission.
- `#location-search`: The input text field.
- `#locate-btn`: The button requesting geolocation.
- `#search-suggestions`: An auto-populated suggestions `<ul>` element.
- `#units-toggle-btn`: Toggle button to summon/hide the measurement dropdown.
- `#unit-menu`: Container for unit selection option buttons (`#celsius-button` and `#fahrenheit-button`).
- `.weather-dashboard`: Main container presenting current details and forecast cards.
- `#hourly-forecast-container`: Flex/grid container for hourly forecasts.
- `#daily-forecast-container2`: Flex/grid container for daily forecasts cards.

---

## 🎨 Stylesheet System (`style.css`)

### 🌈 Color Tokens
- Neutral: `--neutral-900` (deep dark blue), `--neutral-800` (card background), `--neutral-700` (hover highlights), `--neutral-0` (white text).
- Accents: `--orange-500` (sunny highlights), `--blue-500` (primary interaction), `--blue-700` (deep active).

### 🖥️ Layout & Responsive Design
- Desktop: Features CSS Grid for multi-column dashboards.
- Mobile: Swaps to a flexible, single-column flex flow below typical viewport sizes.
