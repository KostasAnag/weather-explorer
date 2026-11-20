# Weather Explorer

**Frontend Assignment: Weather Exploration.** A responsive weather app built around an interactive
2D world map. Click anywhere (or on a city label), search for a city, or jump to your own position
to see the current weather and forecasts. Save places, revisit them, and compare 2 to 5 of them
side by side.

## Features

| # | Requirement | Where to find it |
|---|---|---|
| 1 | Interactive 2D world map, pan and zoom | Map page (`/`), MapLibre GL JS |
| 2 | Weather on map click | Click any point; clicking a **city label** snaps to the city's exact point and shows its name |
| 3 | Current weather dashboard | Temperature, feels-like, conditions, humidity, wind, precipitation, cloud cover, pressure |
| 4 | Hourly and 7-day forecast | "Next 24 hours" strip and "7-day forecast" list under the current weather |
| 5 | Browser geolocation | **Zoom to my location** button: centres and zooms the map and shows the weather for your exact coordinates (labelled "My location") |
| 6 | Saved locations in `localStorage` | **Save location** button, "Saved locations" card |
| 7 | Remove and revisit saved locations | × to remove; click a chip (or its badge on the map) to revisit, which always fetches fresh weather |
| 8 | Compare 2 to 5 saved locations | Compare page (`/compare`): metrics table, 24-hour temperature lines, 7-day highs bars |

Extras beyond the brief: city **search with autocomplete**, **weather badges on the map** (icon and
temperature on every saved place and the current selection), and route-level **code splitting**.

**Hard rule honoured: no reverse geocoding.** Weather requests use latitude and longitude only. The
only geocoding is *forward* (typed city name to coordinates) for the search box. Your geolocation
position is never turned into a place name.

## How to use the app

The app has two pages, switched with the **Map** and **Compare** links at the top right. Weather is
shown in metric units (°C, km/h, mm, hPa). On a phone the layout stacks: the map comes first, the
panels below it.

### Get the weather for a place

There are three ways to pick a place on the **Map** page. Whichever you use, the right-hand column
then shows its weather and forecast, and a blue badge marks it on the map.

- **Click anywhere on the map.** The weather for the exact spot you clicked appears, headed by its
  coordinates.
- **Click a city name on the map.** Clicking a city, town or village *label* snaps to that place's
  exact point and shows its name (for example "Paris"). At world zoom only countries are labelled,
  so zoom in (scroll wheel, double-click or the **+** button) to reveal cities.
- **Search by name.** Type at least 2 characters in **Search for a city…**. Suggestions appear after a
  short pause, with region and country to tell same-named cities apart ("Athens, Attica, Greece" vs
  "Athens, Georgia, United States"). Pick one with the mouse, or use the keyboard:
  <kbd>↓</kbd> / <kbd>↑</kbd> to move, <kbd>Enter</kbd> to choose, <kbd>Esc</kbd> to close. The map
  flies to the city and the weather loads.

### Read the weather

- **Current weather:** conditions, temperature, "Feels like", and tiles for humidity, wind,
  precipitation, cloud cover and pressure.
- **Next 24 hours:** a scrollable strip starting at the current hour, with temperature and chance of
  rain for each hour. Times are the *place's* local time.
- **7-day forecast:** one row per day with conditions, chance of rain and the day's minimum and
  maximum temperature.

While data loads you see "Loading weather…" and "Loading forecast…" messages. If a request fails the
panel says so ("Could not load weather. Please try another spot."); pick another spot, or reload the
page, to try again.

### Use your own location

Press **Zoom to my location** (top right). Your browser asks for permission once; after you allow it,
the map flies to you and the panel shows the weather for your exact coordinates, labelled
**"My location"**. If you deny it, a red message explains how to allow it in your browser settings,
and everything else keeps working.

### Save places and come back to them

- Press **Save location** in the weather panel. The button becomes a disabled **Saved ✓**, so the
  same place cannot be saved twice.
- Saved places appear as chips in the **Saved locations** card, and as **weather badges on the map**
  (icon plus temperature, "…" while loading). They are kept in your browser, so they are still there
  after a reload.
- **Revisit:** click a chip, or click its badge on the map. The map flies there and the weather is
  always re-fetched, so you never see stale numbers.
- **Remove:** press the **×** on a chip.
- Only the *place* is stored (name and coordinates), never the weather. Places picked by clicking an
  empty spot have no name, so their chip shows the coordinates.

### Compare places

1. **Save at least 2 places** on the Map page (the Saved locations card reminds you how many more are
   needed).
2. Open **Compare**. Tick **2 to 5** of your saved places; once 5 are ticked the rest are disabled.
3. You get:
   - a **table** with conditions, temperature, feels-like, humidity, wind, precipitation, cloud cover
     and pressure for each place (it scrolls sideways on narrow screens);
   - a **line chart** of temperature over the next 24 hours, aligned by "hours from now" so places
     in different time zones are comparable;
   - a **bar chart** of each day's high for the next 7 days.
4. Each place keeps the same colour in the table, the lines and the bars. Under each chart, **View data
   as table** shows the same numbers in text form.
5. Your selection is stored in the page address (`/compare?loc=...`), so you can refresh the page or
   share the link and get the same comparison, as long as those places are saved in that browser.

Note: the Map page's current selection is not remembered when you switch to Compare and back (your
saved places are).

### Troubleshooting

| Problem | What to do |
|---|---|
| "Location permission was denied" | Allow location for the site in your browser's address-bar or site settings, then press the button again. It needs HTTPS or `localhost`. |
| Map is blank, or labels are missing | The first load can take several seconds in development. Check your internet connection. If it never fills in, restart `npm run dev` and hard reload (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>); see [Additional notes](#5-additional-notes). |
| "No places found" in search | Check the spelling, or try a larger nearby city. At least 2 characters are needed. |
| "Could not load weather" | Usually a network hiccup or the free weather service being busy. Pick another spot, or reload the page, to try again. |
| Compare page asks for more places | It needs at least 2 saved places. Go to **Map** and save more. |

---

## 1. Installation and setup

### Prerequisites

- **Node.js 22.22 or newer** (developed and tested on Node 26). The floor comes from
  `react-router` 8, which requires Node >= 22.22.
- **npm 10 or newer** (ships with Node).
- A modern evergreen browser with **WebGL** (needed by MapLibre).
- Internet access: weather, geocoding and map tiles are fetched from public services (see
  [Implementation choices](#2-implementation-choices)).

### Install and run

```bash
git clone https://github.com/KostasAnag/weather-explorer.git
cd weather-explorer
npm install
npm run dev
```

Then open the URL Vite prints (normally <http://localhost:5173>).

### Environment variables

**None are required.** Open-Meteo (weather and geocoding) and OpenFreeMap (map tiles) work without
API keys, so there is no `.env` file to create.

If you later add a service that needs a key, read it through `import.meta.env.VITE_*`, document it
in a `.env.example`, and never commit `.env` (the project's `AGENTS.md` records this rule).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm test` | Run the whole test suite once (196 tests) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint |
| `npx tsc -b` | Type-check only |
| `npm run build` | Type-check and produce the production build in `dist/` |
| `npm run preview` | Serve the production build locally |

A change is considered done only when `npm test`, `npx tsc -b`, `npm run lint` and `npm run build`
all pass.

### Deployment

`vercel.json` contains a rewrite so deep links such as `/compare` work on a static host (single-page
app fallback). To deploy on Vercel: import the repository, keep the **Vite** preset
(build command `npm run build`, output directory `dist`), and no environment variables are needed.
*(Not deployed yet; see [Next steps](#4-next-steps).)*

---

## 2. Implementation choices

### Stack

| Concern | Choice | Why |
|---|---|---|
| UI | **React 19** + **TypeScript 6** (strict mode is the default in TS 6) | Component model, hooks, strong typing for API data |
| Build tool | **Vite 8** | Fast dev server, simple config |
| Map | **MapLibre GL JS** with the free **OpenFreeMap "liberty"** vector style | Open source, no API key. A *vector* style is what makes city labels real, clickable features (a raster tile map cannot offer that) |
| Weather data | **Open-Meteo Forecast API** | Free, keyless, gives current, hourly and daily data in one call |
| Search | **Open-Meteo Geocoding API** | Forward geocoding (name to coordinates) for autocomplete |
| HTTP | **Axios** | Per the brief; all calls live in `src/services/` |
| Server state | **TanStack Query** | Caching, request de-duplication, loading and error states, cancellation |
| Routing | **React Router** | `/` map, `/compare`, not-found; the compare selection is kept in the URL (`?loc=...`) |
| Charts | **Recharts** | Declarative charts for the comparison page |
| Persistence | **`localStorage`** | Saved *locations* only (never weather data) |
| Styling | Plain CSS (`src/index.css`) | See [Additional notes](#5-additional-notes) |
| Tests | **Vitest** + **React Testing Library** + `user-event` + jsdom | See section 3 |

### Key decisions

- **Only locations are stored; weather is always re-fetched.** A saved place is
  `{ id, name?, latitude, longitude }`. Selecting one invalidates its cached queries, so a revisit
  always requests fresh data even if the cache would still call it fresh.
- **No duplicate saves.** A place's id is its coordinates rounded to 4 decimals (about 11 m), so
  clicking the same spot twice, or a city and a click on it, count as one place. The Save button
  turns into a disabled "Saved ✓".
- **Untrusted storage.** Data read from `localStorage` is validated; corrupt JSON, wrong shapes or a
  blocked storage API fall back to an empty list instead of crashing.
- **One cache, many views.** The selected place, the map badges and the compare page all use the
  same TanStack Query keys (`['currentWeather', lat, lon]`, `['forecast', lat, lon]`), so a place that
  is already loaded is never fetched twice.
- **Debounced, cancellable search.** Autocomplete waits for a 300 ms typing pause, needs 2 or more
  characters, and aborts outdated requests. It is an accessible ARIA combobox (keyboard: arrows,
  Enter, Escape).
- **Time zones.** Requests use `timezone=auto`, so hourly times are the location's local time. On
  the compare page the hourly lines are aligned by "hours from now", because local clocks differ.
- **Charts you can trust.** Series colours come from a validated categorical palette (checked for
  colour-blind separation), legends keep the selection order, and every chart has a
  **"View data as table"** fallback so no information depends on colour alone. Chart data keys are
  index-based (`loc0`, `loc1`, ...), because location ids contain dots, which Recharts would parse as
  nested paths.
- **Code splitting.** The map page (MapLibre) and the compare page (Recharts) are lazy-loaded,
  shrinking the main bundle from about 1.9 MB to about 286 kB.

### Third-party services and attribution

- Weather and geocoding: [Open-Meteo](https://open-meteo.com/) (free for non-commercial use, data
  under CC BY 4.0).
- Map tiles and style: [OpenFreeMap](https://openfreemap.org/), [OpenMapTiles](https://openmaptiles.org/),
  data (c) [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. The map shows its
  own attribution control.

---

## 3. Architecture and testing

### Project structure

```
src/
  pages/        One component per route: ExplorerPage (map), ComparePage, NotFoundPage
  components/   Presentational pieces: WorldMap, SearchBox, WeatherPanel, ForecastPanel,
                SavedLocationsList, ComparisonTable, ComparisonCharts, LocationPicker, ...
  hooks/        Custom hooks: useCurrentWeather, useForecast, useGeolocation, usePlaceSearch,
                useSavedLocations, useSavedWeather, useComparisonData, useDebouncedValue
  services/     ALL network and storage access: weatherService, geocodingService,
                savedLocationsStorage. Components never call Axios directly.
  lib/          Pure helpers: coordinates, locations, place detection, badges, chart data,
                weather codes and icons, formatting
  types/        API response types and app models (Open-Meteo shape vs. app shape)
  test/         Test setup
```

The layers only point downward: pages use components and hooks; hooks use services; services return
app-level types, so the UI never sees raw Open-Meteo field names.

### Testing

The project was built **test-first**, one feature at a time, with a red-green cycle for each. The suite
has **196 tests in 32 files**.

- Tests sit next to the code (`Foo.tsx` and `Foo.test.tsx`).
- **Mocks live only at the boundaries**: `axios` in service tests, the service modules in hook tests,
  `maplibre-gl` in component tests (jsdom has no WebGL). Nothing in the suite touches the network.
- Integration tests in `App.test.tsx` drive full flows: map click to weather, search to weather, save
  and revisit, and saving two places then comparing them.
- A dedicated test (`App.lazy.test.tsx`) proves that visiting `/compare` does not load the map library.
- **Limit:** Recharts draws nothing in jsdom (no layout), so chart internals are not unit-tested.
  The data builders, table fallbacks and accessibility labels are tested; the chart visuals were
  checked in a real browser.

`AGENTS.md` records these conventions for contributors and AI coding tools, and
`.claude/skills/tdd-feature/SKILL.md` describes the per-feature workflow.

---

## 4. Next steps

With more time, roughly in priority order:

1. **Ship it:** deploy to Vercel and add GitHub Actions (lint, type-check, test, build on every PR).
2. **Visible data attribution:** show an Open-Meteo credit in the UI footer (CC BY 4.0).
3. **End-to-end tests:** Playwright flows against mocked network responses, to cover what jsdom
   cannot (the real map and the charts).
4. **Keep state across pages:** the current map selection is lost when switching to Compare and back;
   lift it to a shared store or the URL.
5. **Tailwind and a design system:** migrate the hand-written CSS, and add **dark mode** (the chart
   palette already has validated dark-mode values).
6. **Units and language:** a metric/imperial toggle (°C/°F, km/h/mph) and i18n.
7. **Richer saved places:** rename, reorder, import and export, instead of showing coordinates for
   unnamed spots.
8. **Richer comparison:** choose which metric the charts show, add precipitation and wind series,
   and share a compare link as a first-class action.
9. **Weather on the map:** a precipitation radar overlay (needs a tile service, probably with an API
   key read from an env var).
10. **Performance:** batch several saved places into one Open-Meteo request (it accepts multiple
    coordinates), lazy-load MapLibre inside the page, and prefetch the compare chunk on hover.
11. **Resilience and accessibility:** retry buttons and error boundaries, offline handling, a full
    screen-reader and keyboard pass over the map interactions.

---

## 5. Additional notes

- **No API keys, no backend.** Everything runs in the browser against public services, so the app
  depends on their availability and fair-use limits. Results are cached in memory for 5 minutes
  (weather) and 10 minutes (forecast).
- **Geolocation** needs a secure context (HTTPS or `localhost`) and the user's permission. If it is
  denied or unavailable, a clear message is shown and the rest of the app keeps working. It only
  ever uses your exact coordinates, never a looked-up place name.
- **Clicking cities:** a click within about 10 px of a city, town, village or hamlet label snaps to
  that place's point and name. Elsewhere the exact clicked coordinates are used. At world zoom only
  countries are labelled; cities appear as you zoom in.
- **Restart the dev server after changing `vite.config.ts` or `package.json` dependencies**, and hard
  reload the browser. MapLibre is excluded from Vite's dependency pre-bundling because pre-bundling
  breaks its web worker; a dev server started before that setting existed will show a map without
  labels and `Worker failed to load` errors. Also avoid running two dev servers on the same project:
  they share one dependency cache.
- **Dev-mode speed:** the first map load can take several seconds in `npm run dev` (unminified
  MapLibre and large low-zoom tiles). `npm run build && npm run preview` is noticeably quicker.
- **Styling:** the original brief listed Tailwind CSS. I chose plain CSS to keep the first features
  simple; migrating is listed in the next steps.
- **Git history:** each feature was developed on its own branch with conventional commit messages and
  merged into `main` with a merge commit, so the graph shows one bubble per feature
  (`git log --graph --oneline`).
- **Units:** metric only for now (°C, km/h, mm, hPa).
