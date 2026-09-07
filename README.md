# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Monitoring (Sentry)

Error monitoring and route-level traffic tracking run through Sentry. Setup lives in
`src/monitoring/`:

- `sentry.ts` — initialises the SDK. Self-initialising on import, and imported first in
  `src/main.tsx` so init completes before `App.tsx` builds the router wrapper.
- `useSentryUser.ts` — attaches the user id and `role` / `workspace_id` tags to the scope.
  No email, name, or phone number is sent.
- `captureApiError.ts` — reports 5xx and unreachable-server failures from
  `src/shared/utils/api.ts`. Expected 4xx and subscription errors are filtered out.

Sentry stays completely inert unless `VITE_SENTRY_DSN` is set, so local development and
credential-free builds are unaffected.

Route traffic appears in Sentry under **Insights → Frontend**, with routes named by pattern
(`/debtors/:id`, not `/debtors/847`). Session Replay is deliberately not enabled — the app
renders debtor names and balances.

### Runtime variables

Copy `.env.example` to `.env` and fill in what you need:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API origin |
| `VITE_SENTRY_DSN` | Sentry DSN. Unset disables Sentry entirely. Safe to expose publicly. |
| `VITE_SENTRY_ENVIRONMENT` | Sentry environment name. Defaults to `production`. |
| `VITE_APP_VERSION` | Release identifier. Must match the release the source maps upload under. |

### Production build

Source maps are built as `hidden` and deleted after upload, so they reach Sentry but are
never served from the public `/assets/` path.

All build-time configuration arrives as Docker build args. `SENTRY_AUTH_TOKEN` is read
from a BuildKit secret if one is mounted, falling back to a build arg:

```
docker build \
  --build-arg VITE_SENTRY_DSN="$VITE_SENTRY_DSN" \
  --build-arg VITE_APP_VERSION="$(git rev-parse --short HEAD)" \
  --build-arg SENTRY_ORG=<org> \
  --build-arg SENTRY_PROJECT=<project> \
  --secret id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
  -t tuabi-web .
```

Prefer the secret. Passing the token as a build arg works, but the value is echoed into the
build log and retained in the build stage's layer history; passing it as a secret leaks it
to neither. The token is never in the served image either way — the final `nginx:alpine`
stage copies nothing but `/app/dist`.

### Deploying on Dokploy

Set **Build Type** to `Dockerfile` first (General tab), with Dockerfile Path `Dockerfile`
and Docker Build Stage left empty so the build runs through to the `serve` stage. Only then
do the two build-time fields appear in the **Environment** tab.

That tab then holds three fields, which are not interchangeable:

| Field in the Environment tab | Use it for |
| --- | --- |
| **Environment** | Nothing. Injected at container runtime, into nginx serving an already-compiled bundle. |
| **Build Time Arguments** | `VITE_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `VITE_APP_VERSION` |
| **Build-time Secrets** | `SENTRY_AUTH_TOKEN` — the key name becomes the secret id the Dockerfile mounts |

Both build-time fields take `KEY=VALUE`, one per line.

Set `VITE_APP_VERSION` from the panel's commit variable so releases map to commits. Any
stable string works, since the SDK and the source-map upload both read this one value.

Omit the `SENTRY_*` arguments and the build still succeeds — the upload step is skipped
when the org, project, and auth token are not all present.

Always pass `VITE_APP_VERSION` when uploading. `.dockerignore` excludes `.git`, so sentry-cli
cannot fall back to detecting a release name from git history inside the build.

Two things to know about that upload step:

- A failed upload (bad token, Sentry outage) **warns but does not fail the build**, and the
  local `.map` files are deleted regardless. The deploy still succeeds, but that release's
  stack traces stay minified. If you would rather a broken token block the deploy, pass an
  `errorHandler` that rethrows to `sentryVitePlugin`.
- `workbox.sourcemap` is off. Workbox generates `sw.js` after the upload-and-cleanup step, so
  its maps would otherwise survive into `dist/` and be served publicly.

### Docker build context

`.dockerignore` excludes `node_modules`, `dist`, `.git`, and the `.env` files. Excluding
`node_modules` matters: `COPY . .` runs after `npm ci`, so without it your local (macOS)
`node_modules` overwrites the Linux ones installed in the image. That is what the old
`npm install --no-save @tailwindcss/oxide-linux-x64-gnu` line was working around, and it is
no longer needed.
