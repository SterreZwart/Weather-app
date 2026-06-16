# Weather App Code Index

This index provides a map of the codebase and the purpose of each file.

## Core Files
- **`index.html`**: The main structure of the application. Contains the search bar, weather dashboard, forecast sections, and state containers (loading, error, no-results).
- **`index.js`**: The application logic. Handles:
    - Geolocation auto-detection on load.
    - Reverse geocoding (coordinates to city name).
    - Weather data fetching from Open-Meteo API.
    - Search functionality with suggestions.
    - Unit toggling (Metric/Imperial).
    - Dynamic rendering of current weather and 7-day forecast.
- **`style.css`**: The visual styling. Uses Vanilla CSS with a grid-based layout for desktop and a flexible column layout for mobile. Includes custom styling for the weather cards, buttons, and loading animations.

## Assets
- **`assets/images/`**: Contains all SVG and WebP icons for weather conditions (sunny, rainy, etc.) and UI elements (search icon, units icon, logo).
- **`assets/fonts/`**: Local font files for 'Bricolage Grotesque' and 'DM Sans'.

## Configuration & Meta
- **`GEMINI.md`**: Project-specific instructions and conventions for the Gemini CLI agent.
- **`README.md`**: General project overview and documentation.
- **`style-guide.md`**: Reference for colors, typography, and design specifications.
- **`.gitignore`**: Specifies files and directories to be ignored by Git.

## Recent Updates
- **Geolocation Integration**: Added `detectLocation()` and `reverseGeocode()` to `index.js`, a `locate-btn` to `index.html`, and corresponding styles to `style.css`.
