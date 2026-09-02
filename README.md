# 🔫 Block Shooter MVP

A low-poly, 8-player multiplayer arena FPS built with React Three Fiber and a server-authoritative Node.js backend.

## 🚀 Project Status
- **MVP Phase**: Core networking, client-side prediction, and hitscan combat mechanics are fully implemented.
- **Architecture**: Authoritative server using **socket.io** (TCP) to prevent cheating and ensure smooth, low-latency hit registration.
- **📊 View Full Progress**: Check out the detailed [MVP Status Report](./PROGRESS.md) to see completed features and remaining tasks.

## 🛠️ Technical Stack

### Client
| Tool | Description |
| :--- | :--- |
| **Framework** | React 19, React Router v7 |
| **3D Engine** | React Three Fiber (R3F), @react-three/drei, @react-three/rapier |
| **State** | Zustand |
| **Styling** | Tailwind CSS |
| **Utilities** | Lucide-React, Tweakpane |

### Server
| Tool | Description |
| :--- | :--- |
| **Networking** | Socket.io (TCP) |
| **Physics** | @dimforge/rapier3d-compat (Headless engine) |
| **Logging** | Pino |
| **Runtime** | Node.js with TypeScript (tsx) |

## ✨ Core Features
- 🛡️ **Server-Authoritative**: Physics and hit detection are processed on the server to prevent client-side tampering.
- ⚡ **Client-Side Prediction**: Local movement is processed instantly for a smooth experience, reconciled with server updates.
- 🎯 **Hitscan Combat**: Precise mathematical raycasting for weapon hits.
- 🕒 **Match Structure**: 4-minute rounds with automated respawn logic and team auto-balancing (4v4).
- 🔫 **Weapon System**: Rifle and pistol with independent magazine tracking, fire rate throttling, and tactical reloading.

## 🚀 Getting Started
1. **Install dependencies**: 
   `npm install` installs deps for both server and client.
2. **Run the project**: 
   `npm run dev` runs both server and client.