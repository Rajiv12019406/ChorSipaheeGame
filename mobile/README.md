# Raja Chor Mantri Sipahi — Android

Premium React Native (CLI) Android client for the Python WebSocket multiplayer server.

## Node version

React Native 0.87 requires Node **`^22.13 || ^24.3 || >=26`**.  
**Node 25 is not supported** and will print many `EBADENGINE` warnings.

With `nvs`:

```powershell
nvs add 22
nvs use 22
node -v   # should show v22.x
```

## Quick start

```bash
# Terminal 1 — from repo root
python server.py

# Terminal 2
cd mobile
npm install
npm start

# Terminal 3 (phone must show as "device" in adb devices)
npm run android
```

Default WebSocket URL for emulator: `ws://10.0.2.2:8765`

## Windows build fix (path too long)

If `npm run android` fails with:

```text
Filename longer than 260 characters
```

React Native’s native codegen paths exceed Windows’ default limit. Use **one or both**:

### 1. Enable long paths (recommended, once)

Run PowerShell **as Administrator**:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Restart the PC, then rebuild.

### 2. Build from a shorter path (quick workaround)

**Important:** use only the `R:` path in that terminal session — do not mix `D:\...` and `R:\...` or Gradle will fail with “different roots”.

```powershell
subst R: D:\funapp\raja-chor-mantri-sipahi
cd R:\mobile
npm run android
```

Or use the helper script (opens build from `R:\mobile`):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/win-android.ps1
```

To remove the drive mapping later: `subst R: /d`

### 3. Clone to a shorter folder

Example: `C:\rcms\mobile` instead of a deep path under `D:\funapp\...`.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Metro bundler |
| `npm run android` | Build & run on Android |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |

## Docs

| Doc | Contents |
|-----|----------|
| [docs/DEVELOPER.md](./docs/DEVELOPER.md) | Architecture, setup, protocol, screens, troubleshooting |
| [docs/PLAY_STORE.md](./docs/PLAY_STORE.md) | Production prep + Google Play publish flow |

## Sound assets

See `src/assets/sounds/README.md`. The sound API is implemented; add mp3 files when ready.
