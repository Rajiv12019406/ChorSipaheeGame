# Raja Chor Mantri Sipahi

Traditional Indian multiplayer game (**Raja / Chor / Mantri / Sipahi**) with:

- Python WebSocket server (authoritative game rules)
- CLI client (`client.py`)
- Web client (`template/index.html`)
- **Premium React Native Android client** (`mobile/`)

All clients speak the same WebSocket protocol and can play together.

---

## Architecture

```
┌──────────────────┐     WebSocket JSON      ┌─────────────────────┐
│  Android (RN)    │◄───────────────────────►│                     │
│  CLI client.py   │◄───────────────────────►│  server.py :8765    │
│  Web index.html  │◄───────────────────────►│  game/engine.py     │
└──────────────────┘                         └─────────────────────┘
```

The Python server is the **source of truth** for roles, scores, rounds, bots, and winners. Clients only display state and send player actions.

### Roles & points

| Role   | Points |
|--------|--------|
| Raja   | 1000   |
| Mantri | 800    |
| Sipahi | 500    |
| Chor   | 0      |

Wrong Sipahi guess → Sipahi/Chor points swap for that round.

---

## Requirements

### Python server
- Python 3.10+
- `websockets` (`pip install -r requirements.txt`)

### Android app (`mobile/`)
- Node.js 22.11+
- JDK 17
- Android SDK / Android Studio
- React Native CLI (no Expo)

---

## Python server setup

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
python server.py
```

Server listens on **`0.0.0.0:8765`** so Android emulator / LAN devices can connect.

- Same machine CLI/web: `ws://localhost:8765`
- Android emulator: `ws://10.0.2.2:8765`
- Physical phone: `ws://<YOUR_LAN_IP>:8765`

---

## WebSocket protocol (summary)

### Server → client
| type | purpose |
|------|---------|
| `input_request` prompt=`name` | Ask player name |
| `input_request` prompt=`choose_chor` | Host humans **or** Sipahi guess (check `title`) |
| `input_request` prompt=`number_input` | Host rounds (min/max) |
| `info` | Lobby / status text |
| `round_start` | `{round, total}` |
| `role_reveal` | Personal role |
| `sipahi_turn` | Sipahi name + options |
| `round_end` | Correct?, all roles, score deltas |
| `scoreboard` | Cumulative scores |
| `game_over` | Winner + final scores |
| `error` | e.g. Game Full |

### Client → server
```json
{"type":"response","value":"..."}
{"type":"command","command":"start"}
```

---

## Android app

```bash
cd mobile
npm install
npm start
# other terminal
npm run android
```

Developer guide and Play Store publish flow: [`mobile/docs/DEVELOPER.md`](mobile/docs/DEVELOPER.md) · [`mobile/docs/PLAY_STORE.md`](mobile/docs/PLAY_STORE.md)

### WebSocket configuration

Edit on **Join Game** screen, or defaults in `mobile/src/config.ts`:

- Emulator host: `10.0.2.2`
- Port: `8765`

### Emulator
1. Start `python server.py` on the host
2. Launch Android emulator
3. In app, use host `10.0.2.2`

### Physical device
1. Phone and PC on the same Wi‑Fi
2. Find PC LAN IP (`ipconfig` / `ifconfig`)
3. Enter that IP on Join Game (e.g. `192.168.1.10`)
4. Ensure firewall allows port **8765**

### Build debug APK

```bash
cd mobile/android
./gradlew assembleDebug
# Windows:
gradlew.bat assembleDebug
```

APK: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### Debugging connection problems
1. Confirm `python server.py` prints `0.0.0.0:8765`
2. Emulator must use `10.0.2.2`, not `localhost`
3. Phone must use LAN IP, not `10.0.2.2`
4. Cleartext `ws://` is enabled in the Android manifest for local play
5. If "Game already in progress", wait for the current match to finish (server rejects mid-game joins)

---

## Mobile project structure

```
mobile/
├── App.tsx
├── src/
│   ├── api/          # WebSocket + typed protocol
│   ├── components/   # Premium UI pieces
│   ├── screens/      # Splash → Game Over flow
│   ├── store/        # Zustand game state
│   ├── navigation/
│   ├── hooks/
│   ├── theme/
│   ├── utils/        # validation, haptics, sound
│   ├── assets/
│   └── config.ts
└── android/
```

### npm scripts
```bash
npm start
npm run android
npm run lint
npm test
```

---

## CLI / Web clients (unchanged)

```bash
python server.py
python client.py
# or
python -m http.server 8000 --directory template
```

Android + CLI + Web can share one server session when the protocol allows.

---

## Known backend limitations (client adapts)

- Single room, max 4 players
- No mid-game reconnect / resume (server closes new joins while `game_started`)
- After `game_over`, server resets — Play Again reconnects fresh
- Lobby player list is inferred from `info` strings (no structured roster message)
- Bot personality is not sent over the wire (UI shows generic bot labels)

---

## Credits

Based on the traditional game [Raja Chor Mantri Sipahi](https://en.wikipedia.org/wiki/Raja_Chor_Mantri_Sipahi).
