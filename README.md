# 🔫 Block Shooter MVP
[![deploy pipeline](https://github.com/bbs220/project_block_shooter/actions/workflows/deploy.yaml/badge.svg)](https://github.com/bbs220/project_block_shooter/actions/workflows/deploy.yaml)
## Play it [here](https://project-block-shooter.onrender.com/)!

A low-poly, 8-player multiplayer arena FPS built with React Three Fiber and a server-authoritative Node.js backend.

## 🚀 Project Status
- **MVP Phase**: Core networking, client-side prediction, and hitscan combat mechanics are fully implemented.
- **Architecture**: Authoritative server using **socket.io** (TCP) to prevent cheating and ensure smooth, low-latency hit registration.

## 📦 Monorepo Architecture & Structure

This project is organized as an **npm workspaces** monorepo, keeping the client, server, and shared libraries unified under a single repository:

```text
project_block_shooter/
├── apps/
│   ├── appClient/          # React 19 + R3F 3D frontend client (Vite)
│   └── appServer/          # Node.js + Express + Headless Rapier game server
├── packages/
│   └── shared/             # @block-shooter/shared (Single Source of Truth)
├── .github/workflows/      # Automated CI/CD Docker build & deploy pipeline
└── Dockerfile              # Production container build
```

### 🔗 Symbolic Links & Workspace Linking
- **Automatic Symlinks**: Through npm workspaces, `@block-shooter/shared` is symlinked directly into `node_modules/@block-shooter/shared`.
- **Zero-Build Hot Reloading**: Changes made to shared constants, weapon balances, or map geometry immediately reflect in both client (via Vite HMR) and server (via tsx/nodemon) without publishing packages or running rebuild steps.

## ⚖️ Shared Package: Single Source of Truth

The `@block-shooter/shared` package serves as the immutable single source of truth across both client and server, preventing state desynchronization:

- **Weapon Balancing (`weapons.ts`)**: Defines stats for all weapons (`assaultRifle`, `pistol`, `burstRifle`) including damage, fire rates, magazine capacities, reload times, ranges, and firing modes (`auto`, `semi`, `burst`). Both client HUD/prediction and server hit verification consume the exact same records.
- **Physics & Gameplay Constants (`appConstants.ts`)**: Shared values for heavy gravity vector, player capsule radius and height, camera eye-level offset, walk/sprint velocities, jump force, and team deathmatch score limits.
- **Map & Arena Geometry (`maps.ts`)**: Procedural arena generator (`createBoxArena`) producing mathematical boundary and floor dimensions shared between the server's Rapier physics colliders and client Three.js render meshes.

## 🛠️ Technical Stack

### Client
| Tool | Description |
| :--- | :--- |
| **Framework** | React 19, React Router v7 |
| **3D Engine** | React Three Fiber (R3F), @react-three/drei, @react-three/rapier |
| **Typography** | @fontsource/inter (Self-hosted WOFF2 fonts) |
| **State** | Zustand |
| **Styling** | Tailwind CSS v4 |
| **Utilities** | Lucide-React, Tweakpane, use-sound |

### Server
| Tool | Description |
| :--- | :--- |
| **Networking** | Socket.io (TCP) |
| **Physics** | @dimforge/rapier3d-compat (Headless WASM engine) |
| **Framework** | Express 5 (HTTP compression, strict CSP, static serving & WebSockets) |
| **Logging** | Pino, Pino-Pretty |
| **Runtime** | Node.js with TypeScript (tsx / tsup) |

### Monorepo & DevOps
| Tool | Description |
| :--- | :--- |
| **Workspace** | npm workspaces (monorepo dependency orchestration & symlinks) |
| **Containerization** | Docker (`node:24-slim` Debian-based multi-workspace image) |
| **CI/CD** | GitHub Actions (Automated Docker build on Node 24, push to ghcr.io) |
| **Hosting** | Render (Web Service deployed via automated webhook) |

## ✨ Core Features
- 🛡️ **Server-Authoritative**: Physics and hit detection are processed on the server to prevent client-side tampering.
- ⚡ **Client-Side Prediction**: Local movement is processed instantly for a smooth experience, reconciled with server updates.
- 🎯 **Hitscan Combat**: Precise mathematical raycasting for weapon hits verified against server physics state.
- 🕒 **Match Structure**: 4-minute rounds with automated respawn logic and team auto-balancing (4v4).
- 🔫 **Weapon System**: Rifle and pistol with independent magazine tracking, fire rate throttling, and tactical reloading.
- 🌐 **Unified Production Deployment**: In production, Express hosts both the compiled Vite SPA (`appClient/dist`) and the Socket.io WebSocket server on a single exposed port.
- 🔒 **Hardened Web Standards & Security**: Built with strict CSP (`'wasm-unsafe-eval'`, blob/data fetching), COOP window isolation, immutable static asset caching, Gzip/Brotli compression, and self-hosted WOFF2 fonts.
- ♿ **Accessibility & Graphics Resilience**: Native skip links, keyboard drawer isolation (`inert`), ARIA roles, prefers-reduced-motion queries, and React Error Boundaries for 3D WebGL context recovery.

## 🐳 Docker & Deployment

The project is containerized into a single production-ready Docker image:
- **Base Image**: Uses Debian-based `node:24-slim` for standard glibc support, regular 8MB thread stacks, and Node 24 runtime parity.
- **Layer Caching**: Root manifest files are copied first to cache `npm install` across all workspaces.
- **Full-Stack Build**: Compiles both the client Vite bundle and the server TypeScript code inside the container.
- **Environment Guarantee**: Locks `ENV NODE_ENV=production` directly at runtime to ensure static client assets are served reliably.
- **Single Port**: Express serves both frontend static assets and backend WebSockets on port `9208` (dynamically overridden by cloud environments via `PORT`).
- **CI/CD Pipeline**: Merges to `main` trigger a GitHub Actions workflow using native Node 24 action versions that builds the Docker image, pushes to GitHub Container Registry (`ghcr.io`), and triggers the Render deploy hook.

## 🚀 Getting Started
1. **Install dependencies**: 
   `npm install` installs deps for both server and client.
2. **Run the project**: 
   `npm run dev` runs both server and client.
