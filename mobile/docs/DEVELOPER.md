# Developer Documentation — Raja Chor Mantri Sipahi (Android)

Premium React Native (CLI) client for the Python WebSocket multiplayer server. This guide is for developers who set up, extend, test, and ship the Android app.

---

## 1. Stack overview

| Layer | Tech |
|--------|------|
| UI | React Native **0.87**, React **19**, TypeScript |
| Navigation | React Navigation (native stack) |
| State | Zustand (`src/store/gameStore.ts`) |
| Networking | Raw WebSocket JSON (`src/api/websocket.ts`, `protocol.ts`) |
| Animations | Reanimated 4 + worklets |
| Backend | Python `server.py` on port **8765** (authoritative rules) |
| Package ID | `com.rajachormantrisipahi` |
| Min / Target SDK | 24 / 36 |

The server owns roles, scores, rounds, bots, and winners. The app only renders state and sends player actions.

---

## 2. Prerequisites

- **Node** `^22.13 \|\| ^24.3 \|\| >=26` (Node **25** is unsupported)
- **JDK 17**
- **Android Studio** + Android SDK + platform tools (`adb`)
- **Python 3.10+** and `pip install -r requirements.txt` (repo root)
- Windows: enable long paths if Gradle fails with “Filename longer than 260 characters” (see `mobile/README.md`)

Verify:

```powershell
node -v
java -version
adb version
python --version
```

---

## 3. Local setup

### 3.1 Server (repo root)

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

Listens on `0.0.0.0:8765`.

### 3.2 Mobile app

```bash
cd mobile
npm install
npm start          # Terminal A — Metro
npm run android    # Terminal B — device/emulator
```

| Client | WebSocket host |
|--------|----------------|
| Android emulator | `10.0.2.2` |
| Physical phone (same Wi‑Fi) | PC LAN IP from `ipconfig` |
| CLI / browser on same PC | `localhost` |

Defaults live in `src/config.ts`. Users can override host on the **Join Game** screen.

---

## 4. Project layout

```
mobile/
├── App.tsx                 # Root
├── index.js                # RN entry
├── src/
│   ├── api/                # WebSocket client + typed protocol
│   ├── components/         # UI building blocks
│   ├── screens/            # Full screens
│   ├── navigation/         # Stack + param types
│   ├── store/              # Zustand game store
│   ├── hooks/              # useGame, useWebSocket
│   ├── theme/              # colors, typography, spacing, animations
│   ├── utils/              # validation, haptics, sound, game helpers
│   ├── assets/             # icons / images / sounds (see READMEs)
│   └── config.ts           # WS host/port helpers
├── android/                # Native Android project
├── __tests__/              # Jest tests
└── docs/                   # This folder
```

---

## 5. App navigation flow

```
Splash → Home → JoinGame → Lobby → HostSetup (host only)
                              ↓
                            Game (role / guess / results / scoreboard in-phase)
                              ↓
                          GameOver → Home (reconnect fresh)

Home → Settings
```

| Screen | Role |
|--------|------|
| `SplashScreen` | Brand intro |
| `HomeScreen` | Host / Join entry |
| `JoinGameScreen` | Name + server host |
| `LobbyScreen` | Waiting for players / start |
| `HostSetupScreen` | Humans count + rounds |
| `GameScreen` | In-round UI (reveal, guess, results) |
| `GameOverScreen` | Winner + final scores |
| `SettingsScreen` | App settings |

Phases are tracked in the store as `GamePhase` (`src/api/types.ts`).

---

## 6. WebSocket protocol (client contract)

### Server → client (common `type` values)

| `type` | Purpose |
|--------|---------|
| `input_request` | Name, host setup, or Sipahi guess (`prompt` / `title`) |
| `info` | Lobby / status text |
| `round_start` | `{ round, total }` |
| `role_reveal` | Personal role |
| `sipahi_turn` | Sipahi options |
| `round_end` | Guess result, roles, score deltas |
| `scoreboard` | Cumulative scores |
| `game_over` | Winner + finals |
| `error` | e.g. game full |

### Client → server

```json
{"type":"response","value":"..."}
{"type":"command","command":"start"}
```

Typed helpers: `src/api/protocol.ts`, `src/api/types.ts`.  
Connection lifecycle: `src/api/websocket.ts` + `src/hooks/useWebSocket.ts`.

---

## 7. State management

`src/store/gameStore.ts` holds:

- Connection status
- Players / scores / host flags
- Current phase and pending input
- Round + result snapshots

Prefer updating the store from protocol handlers (not ad‑hoc screen local copies of game truth). UI screens should read store + dispatch actions / send WS messages via hooks.

---

## 8. Configuration & networking

```ts
// src/config.ts
DEFAULT_WS_PORT = 8765
DEFAULT_EMULATOR_HOST = '10.0.2.2'
buildWsUrl(host, port) → "ws://..."
```

Android currently allows cleartext `ws://` via:

- `AndroidManifest.xml` → `usesCleartextTraffic="true"`
- `res/xml/network_security_config.xml`

That is intentional for **local LAN play**. Production / Play Store should move to **`wss://`** and a hosted server (see [PLAY_STORE.md](./PLAY_STORE.md)).

---

## 9. Scripts & quality

| Command | Description |
|---------|-------------|
| `npm start` | Metro bundler |
| `npm run android` | Debug build + install |
| `npm run lint` | ESLint |
| `npm test` | Jest (`__tests__/`) |

Useful tests already present:

- `__tests__/protocol.test.ts` — message parsing / helpers
- `__tests__/gameStore.test.ts` — store behaviour
- `__tests__/App.test.tsx` — smoke render

Before PRs: `npm test` and `npm run lint`.

---

## 10. Debug builds

```bash
cd mobile/android
# Windows
gradlew.bat assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

`gradle.properties` sets `reactNativeArchitectures=arm64-v8a` for faster **dev** builds. For emulators / multi-ABI release, override:

```bash
gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64
# or for store release: armeabi-v7a,arm64-v8a,x86,x86_64
```

---

## 11. Adding features (checklist)

1. **Protocol change** — update `server.py` / `game/` first, then `src/api/types.ts` + `protocol.ts`, then store handlers, then UI.
2. **New screen** — add to `navigation/types.ts` + `AppNavigator.tsx`.
3. **New UI atom** — put under `src/components/`, reuse `theme/`.
4. **Sounds** — wire via `src/utils/sound.ts`; drop files under `src/assets/sounds/` (see that folder’s README).
5. **Keep CLI/web compatible** when changing the wire format if those clients still matter.

---

## 12. Known backend limits (client must tolerate)

- Single room, max **4** players
- No mid-game reconnect / resume
- After `game_over`, server resets — Play Again = fresh connect
- Lobby roster often inferred from `info` strings
- Bot personality not sent on the wire

---

## 13. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `EBADENGINE` / Node warnings | Switch to Node 22 or 24 (not 25) |
| Path > 260 chars (Windows) | Enable LongPaths or `subst` short drive — see `mobile/README.md` |
| Emulator can’t connect | Use host `10.0.2.2`, not `localhost` |
| Phone can’t connect | Same Wi‑Fi, LAN IP, firewall allows **8765** |
| “Game already in progress” | Wait for match end; server rejects mid-game joins |
| Metro / cache weirdness | `npx react-native start --reset-cache` |

---

## 14. Related docs

- [Play Store publish flow](./PLAY_STORE.md)
- [Mobile quick start](../README.md)
- [Repo architecture & protocol summary](../../README.MD)

---

## 15. Version identity (Android)

Set in `android/app/build.gradle` → `defaultConfig`:

| Field | Current | Notes |
|-------|---------|--------|
| `applicationId` | `com.rajachormantrisipahi` | Must stay stable on Play Store |
| `versionCode` | `1` | Integer; bump every upload |
| `versionName` | `"1.0"` | User-visible string |
