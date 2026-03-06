# ZmanimMap

An interactive map application that calculates location-specific Jewish prayer times (zmanim) for any selected location on earth. Users can place markers on a Google Maps interface to view zmanim and the correct direction to face Yerushalayim (Jerusalem) when davening.

## Features

- **Interactive Google Maps interface** with draggable markers for selecting any location
- **Zmanim calculations** using solar position algorithms (via SunCalc), including:
  - Alos HaShachar, HaNetz, Shema (GRA/MA), Tefilla (GRA/MA), Chatzos, Mincha Gedola/Ketana, Plag HaMincha, Shkiah, Tzeis, and more
- **Direction to Yerushalayim** displayed as both a compass bearing (degrees) and a visual compass, with rhumb line and great circle route options
- **Fluid vs. stationary date markers** -- fluid markers update when you change the date; stationary markers keep the date they were placed
- **Configurable zmanim display** -- choose which zmanim to show
- **Halachic disclaimer** with notes on rounding, extreme latitudes, and daylight savings time

## Tech Stack

- **JavaScript** (vanilla ES modules)
- **jQuery** for DOM manipulation
- **Google Maps JavaScript API** for the map interface
- **SunCalc** (bundled) for solar position calculations
- **Webpack** for bundling
- **ESLint** for linting
- **HTML/CSS** with custom accordion sidebar UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later recommended)
- A [Google Maps JavaScript API key](https://developers.google.com/maps/documentation/javascript/get-api-key)

### Installation

```bash
git clone https://github.com/hbinyomin/zmanimMap.git
cd zmanimMap
npm install
```

### Configuration

Add your Google Maps API key to `src/index.html` in the Maps script tag:

```html
<script src="https://maps.googleapis.com/maps/api/js?v=3.47&key=YOUR_API_KEY&libraries=drawing"></script>
```

### Running Locally

```bash
npm start
```

This starts the Webpack dev server and opens the app in your browser.

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  index.html          # Main HTML page
  zmanimMap.js        # Core application logic (map, markers, info windows)
  suncalc.js          # Solar position calculation library
  yerushalayim.js     # Direction-to-Yerushalayim calculations
  constants.js        # Zmanim definitions and configuration
  instructions.js     # Instructions modal content
  css/
    style.css         # Main styles
    sidebarAccordian.css  # Accordion/collapsible sidebar styles
```

## License

ISC
