# SpringSathi AI — Vercel Deployment

## Repository

This project is prepared for Vercel with:

- `pnpm build` as the build command.
- `dist/public` as the output directory.
- `api/index.ts` as the serverless Express/tRPC entrypoint.
- SPA fallback routing through `vercel.json`.

## Deploy from GitHub

1. Open Vercel and choose **Add New Project**.
2. Import the GitHub repository `springsathi-ai-sih26240-vercel`.
3. Keep the detected package manager as `pnpm`.
4. Confirm the build command is `pnpm build`.
5. Confirm the output directory is `dist/public`.
6. Add the server-side environment variables required by the managed scaffold, including `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`, `BUILT_IN_FORGE_API_URL`, and `BUILT_IN_FORGE_API_KEY` where the corresponding backend features are enabled.
7. Deploy.

## Prototype data note

The SpringSathi user experience currently uses illustrative seed data and browser local storage for the core prototype workflows. Before production use, replace the local state with authenticated database procedures and connect the scoring layer to validated GIS, rainfall, hydrogeological, field-measurement, and community datasets.

## Local verification

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```
