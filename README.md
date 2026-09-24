# Planet Boarding Pass Generator

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-success?logo=github)](https://planetfelipe.github.io/PlanetBoardingPassGenerator/)

🔗 **Live tool:** https://planetfelipe.github.io/PlanetBoardingPassGenerator/

📦 **Repository:** https://github.com/PlanetFelipe/PlanetBoardingPassGenerator

## Overview

A web application that retrieves live flight details from Planet's `Test.GetFlightDetails` API and generates boarding pass barcodes for testing purposes.

## Features

- Load flights from GetFlightDetails API
- Search flights by Country, Location and Status
- Generate QR Code
- Generate Aztec Code
- Generate PDF417 Barcode
- Dark Mode support
- Light Mode support
- Responsive design
- Flight selection
- Barcode download support
- Reset functionality

## Screenshots

> _Add screenshots here._

<!-- ![Light mode](docs/screenshots/light-mode.png) -->
<!-- ![Dark mode](docs/screenshots/dark-mode.png) -->

## Technologies

- HTML
- CSS
- JavaScript
- REST API
- Barcode generation ([bwip-js](https://github.com/metafloor/bwip-js), vendored locally)

## Getting Started

This is a static web application with no build step or backend required.

1. Clone the repository:
   ```
   git clone https://github.com/PlanetFelipe/PlanetBoardingPassGenerator.git
   ```
2. Open `index.html` directly in a browser, or serve the folder with any static file server, e.g.:
   ```
   npx serve .
   ```
3. Enter a **Country**, **Location** and **Status**, then click **Load Flights**.
4. Select a flight from the results table to generate its QR Code, Aztec Code and PDF417 barcodes.
5. Use the **Download PNG** button on any barcode card to save it as an image.

> **Note:** The live `Test.GetFlightDetails` API call may fail when opened from `file://` or from a host without CORS access. In that case, the app automatically falls back to an embedded sample response so the UI remains usable.

## Project Structure

```
PlanetBoardingPassGenerator/
├── index.html                  # Application entry point / markup
├── css/
│   └── style.css               # Styling, theme variables, light/dark mode
├── js/
│   ├── app.js                  # Page orchestration: query, flight table, selection
│   ├── flight-details-api.js   # Test.GetFlightDetails API wrapper + fallback sample
│   ├── barcode-generator.js    # bwip-js wrapper (render/clear/download)
│   ├── theme.js                # Dark/light mode toggle
│   └── vendor/
│       └── bwip-js-min.js      # Vendored bwip-js library (MIT licensed)
└── assets/                     # Static assets (e.g. screenshots)
```

## GitHub Pages Deployment

This is a static web app with no build step, so it is served as-is by GitHub Pages.

- **Live site:** [https://planetfelipe.github.io/PlanetBoardingPassGenerator/](https://planetfelipe.github.io/PlanetBoardingPassGenerator/)
- **Source:** deployed from the `main` branch, repository root (`index.html`)
- All CSS/JS references use relative paths, so the app works correctly under the `/PlanetBoardingPassGenerator/` sub-path used by GitHub Pages.
- See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step setup and troubleshooting instructions.

## Future Enhancements

- Additional airport support
- Advanced filtering
- Export capabilities

## Author

Created by Felipe Silveira

GitHub: [https://github.com/PlanetFelipe](https://github.com/PlanetFelipe)

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
