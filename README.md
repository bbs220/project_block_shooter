# 🔫 Block Shooter MVP

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
| **State** | Zustand |
| **Styling** | Tailwind CSS v4 |
| **Utilities** | Lucide-React, Tweakpane, use-sound |

### Server
| Tool | Description |
| :--- | :--- |
| **Networking** | Socket.io (TCP) |
| **Physics** | @dimforge/rapier3d-compat (Headless WASM engine) |
| **Framework** | Express (Unified static client serving & WebSocket attachment) |
| **Logging** | Pino, Pino-Pretty |
| **Runtime** | Node.js with TypeScript (tsx / tsup) |

### Monorepo & DevOps
| Tool | Description |
| :--- | :--- |
| **Workspace** | npm workspaces (monorepo dependency orchestration & symlinks) |
| **Containerization** | Docker (`node:22-alpine` multi-workspace image) |
| **CI/CD** | GitHub Actions (Docker build, push to GitHub Packages / GHCR) |
| **Hosting** | Render (Web Service deployed via automated webhook) |

## ✨ Core Features
- 🛡️ **Server-Authoritative**: Physics and hit detection are processed on the server to prevent client-side tampering.
- ⚡ **Client-Side Prediction**: Local movement is processed instantly for a smooth experience, reconciled with server updates.
- 🎯 **Hitscan Combat**: Precise mathematical raycasting for weapon hits verified against server physics state.
- 🕒 **Match Structure**: 4-minute rounds with automated respawn logic and team auto-balancing (4v4).
- 🔫 **Weapon System**: Rifle and pistol with independent magazine tracking, fire rate throttling, and tactical reloading.
- 🌐 **Unified Production Deployment**: In production, Express hosts both the compiled Vite SPA (`appClient/dist`) and the Socket.io WebSocket server on a single exposed port.

## 🐳 Docker & Deployment

The project is containerized into a single production-ready Docker image:
- **Layer Caching**: Root manifest files are copied first to cache `npm install` across all workspaces.
- **Full-Stack Build**: Compiles both the client Vite bundle and the server TypeScript code inside the container.
- **Single Port**: Express serves both frontend static assets and backend WebSockets on port `9208` (dynamically overridden by cloud environments via `PORT`).
- **CI/CD Pipeline**: Merges to `main` trigger a GitHub Actions workflow that builds the Docker image, pushes to GitHub Container Registry (`ghcr.io`), and calls the Render deploy hook.

## 🚀 Getting Started

### Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
   *(Installs dependencies for all workspaces and configures package symlinks).*

2. **Run both server and client**:
   ```bash
   npm run dev
   ```
   - Client dev server: `http://localhost:5173`
   - Server API / Socket: `http://localhost:9208`

### Docker
1. **Build image**:
   ```bash
   docker build -t block-shooter .
   ```
2. **Run container**:
   ```bash
   docker run -p 9208:9208 block-shooter
   ```