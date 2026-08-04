# Blossom

Blossom is a desktop app that turns a short, guided wizard into a fully configured, ready-to-host Minecraft server — no manual server.properties editing, no hunting for the right JAR, no wrangling plugins by hand.

Answer a few questions. Blossom downloads the right server software, installs your plugins/mods, writes the configuration, and generates start scripts.

## Features

- **Guided wizard** — project basics, server software, identity, world settings, performance, networking and plugins, each with validation and autosave
- **Server software** — Vanilla, Paper, Spigot, Fabric and Forge, resolved and installed automatically for the chosen Minecraft version
- **Plugin/mod search** — live search against Modrinth, filtered to what's compatible with your loader and version
- **Config templates** — save a wizard configuration as a template and reuse it for future servers
- **Auto-updates** — the app checks GitHub Releases and offers to install new versions in place
- **Cross-platform start scripts** — generates both `start.bat` and `start.sh`

## Tech stack

- [Electron](https://www.electronjs.org/) + [electron-vite](https://electron-vite.org/) + [electron-builder](https://www.electron.build/)
- [React 19](https://react.dev/) + [Zustand](https://zustand-demo.pmnd.rs/) for the wizard UI and state
- [Tailwind CSS 4](https://tailwindcss.com/) for styling
- [Zod](https://zod.dev/) for input validation, on both the renderer and the IPC boundary
- [Vitest](https://vitest.dev/) for unit tests

## Getting started

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the app in development mode |
| `npm run build` | Type-check and build the app |
| `npm run build:win` | Build a distributable Windows installer |
| `npm run typecheck` | Type-check the main, preload and renderer processes |
| `npm run lint` | Lint the codebase |
| `npm run test` | Run the unit test suite |
| `npm run format` | Format the codebase with Prettier |

## Project structure

```
src/
  main/         Electron main process — IPC handlers, generators, services
    generators/   Writes server.properties, eula.txt, start scripts, README
    ipc/          IPC handler registration, validates all renderer input
    services/     Downloads, checksums, Java/Git detection, auto-update
  preload/      Typed contextBridge API exposed to the renderer
  renderer/     React UI — wizard steps, shared UI kit, i18n
  shared/       Types and Zod schemas shared across processes
```

## Continuous integration

Every push and pull request runs type-checking, linting and the test suite via [GitHub Actions](.github/workflows/ci.yml).

## License

Private project — all rights reserved.
