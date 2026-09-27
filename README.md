# SpringSathi AI — SIH26240 Prototype

SpringSathi AI is an interactive prototype for **AI-Based Spring Revival and Recharge Planning for Tribal Areas**.

## Problem statement

- **ID:** SIH26240
- **Title:** AI-Based Spring Revival and Recharge Planning for Tribal Areas
- **Problem creator:** Sarim Moin
- **Organization:** Ministry of Tribal Affairs
- **Department:** Ministry of Education's Innovation Cell (MIC)
- **Category:** Software
- **Technology bucket:** Agriculture, FoodTech & Rural Development

The prototype reflects the supplied problem statement context: springs are important water sources for hilly and tribal communities; their sustainability depends on recharge of the underlying aquifer; and recharge zones are difficult to identify through surface observations alone.

## Included prototype workflows

The dashboard includes a regional overview, a spring registry, explainable recharge scoring, a map-style recharge planner, intervention planning, field-work status updates, and monitoring evidence. Data is intentionally illustrative and stored in local browser storage for the prototype.

The score is presented as a transparent decision aid. It is not a trained hydrogeological model and should be replaced or calibrated with local GIS layers, rainfall records, geological data, field measurements, and community validation before real deployment.

## Run locally

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

The app starts through the existing Express/Vite development server. The prototype was smoke-tested at the session preview URL:

`https://3100-ilu4i9993l8212lkc29ma-a59aa9ab.sg2.manus.computer/`

## Validation completed

- TypeScript check passed.
- Vitest regression suite passed: 4 tests.
- Production build passed.
- Desktop browser smoke test passed.
- Mobile viewport screenshot checked at 390 × 844.
- Recharge planner, intervention dialog, field-work update, and monitoring view were exercised.
