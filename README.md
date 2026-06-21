# ZipScope

ZipScope is a futuristic ZIP-code intelligence dashboard for demographics, household economics, civic geography, weather intelligence, local market signals, and secondary sports/public odds analysis.

Tagline: Demographics. Market Signals. Civic Intelligence. One ZIP at a time.

## Run Locally

```bash
cd zipscope-sports-intel
npm install
npm run dev
```

## Property Database Backend

Phase 1 of the NC/FL statewide property database lives in `backend/`. It adds a FastAPI skeleton, SQLAlchemy schema, Alembic migration, Docker Compose PostGIS/Redis services, and seed examples for ZIP `33558` in Florida and ZIP `27030` in North Carolina.

See `backend/README.md` for setup and API details.

## Upload To GitHub

After Git is installed and available in your terminal:

```bash
git init
git add .
git commit -m "Initial ZipScope app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

The `.gitignore` file keeps dependencies, local env files, build output, logs, restore points, and visual verification artifacts out of the repository.

## API Keys

Copy `.env.local.example` to `.env.local` and add any available provider keys:

```bash
CENSUS_API_KEY=your_free_census_api_key_here
HUD_USER_TOKEN=optional_hud_user_api_token_here
VITE_ODDS_API_KEY=
VITE_SPORTS_API_KEY=
```

No secrets are hardcoded. The local Vite dev server exposes `/api/demographics?zip=27030` so `CENSUS_API_KEY` can stay server-side during local development.

`HUD_USER_TOKEN` is reserved for future HUD-USPS ZIP Code Crosswalk enrichment. The current app uses Zippopotam.us plus guarded local place seeds for labels, and Census for demographics.

## How ZIP Demographics Work

ZipScope validates a 5-digit ZIP, looks up a friendly place label, then requests official U.S. Census ACS 2024 5-year Profile data by ZIP Code Tabulation Area (ZCTA).

The demographics service maps Census fields into population, median age, male/female composition, median household income, poverty rate, high school graduation rate, bachelor's or higher rate, housing units, median home value, source year, source name, and ZCTA.

If the Census key is missing, the app attempts a no-key Census Reporter ACS profile fallback sourced from U.S. Census Bureau data. If that fallback is unavailable, the app shows a clear error card. It does not invent county, city, or demographic values.

## How To Get A Free Census API Key

Request a free key from the U.S. Census API key page:

https://api.census.gov/data/key_signup.html

Then create `.env.local`:

```bash
CENSUS_API_KEY=your_free_census_api_key_here
```

Restart the dev server after changing `.env.local`.

## Why ZIP Uses ZCTA

USPS ZIP codes are delivery routes and can change. Census ZIP Code Tabulation Areas approximate ZIP geographies for statistical reporting. ZipScope displays the friendly ZIP place label separately from the Census ZCTA demographic source.

## Test ZIPs

- `27030`: Mount Airy, NC / Surry County. Must not display Fulton County, GA.
- `27617`: Raleigh, NC / Brier Creek area.
- `90210`: Beverly Hills, CA.
- `10001`: New York, NY.

## Provider Files

- Demographics service: `src/services/demographics.ts`
- ZIP place lookup: `src/services/zipLookup.ts`
- Optional ZipAtlas link provider: `src/services/providers/zipAtlasProvider.ts`
- No-key ACS fallback: Census Reporter profile pages sourced from U.S. Census Bureau data
- Secondary sports events: `src/providers/sportsEventsProvider.ts`
- Secondary public odds: `src/providers/oddsProvider.ts`

Sports events and public odds are secondary features and can still use mock provider adapters when sports API keys are missing. Demographics no longer use mock fallback values.

## Mock Data

- `src/data/mockSportsEvents.ts`
- `src/data/mockOdds.ts`

## Utility Files

- ZIP validation: `src/utils/zipValidation.ts`
- Implied probability: `src/utils/impliedProbability.ts`
- Formatting and local market score: `src/utils/formatters.ts`
- Development validation checks: `src/services/validationChecks.ts`

## Responsible Use

Public odds are shown for informational analysis only. ZipScope does not provide betting advice.

## Future Deployment

Deploy the isolated `zipscope-sports-intel` folder as the ZipScope Vite application. The folder name is preserved for local compatibility, but the product brand is ZipScope. This project does not require modifying, moving, deleting, or replacing any other app folders.

Vercel settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

The production `/api/demographics` endpoint lives in `api/demographics.js` and uses `CENSUS_API_KEY` server-side. In Vercel, add these project environment variables as needed:

```bash
CENSUS_API_KEY=your_free_census_api_key_here
HUD_USER_TOKEN=optional_hud_user_api_token_here
VITE_ODDS_API_KEY=
VITE_SPORTS_API_KEY=
```
