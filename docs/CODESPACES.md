# Running the project in Codespaces (multiplayer/dev)

This page explains the minimal steps to run the frontend and a simple WebSocket→TCP proxy inside a Codespace so browser clients in the preview can reach a Terraria netplay server via the epoxy/wisp path.

Prerequisites:
- You have a working Codespace and can open forwarded ports / preview.
- Node (pnpm) is available. If you're building the dotnet parts too, make sure dotnet and mono-devel are installed per the main README.

Quick steps (recommended for dev):
1. Install JS deps
   pnpm install

2. Start the proxy + frontend (example: proxy listens on 9001 and proxies to TERRARIA_HOST:7777)
   TARGET=127.0.0.1:7777 LISTEN_PORT=9001 ./scripts/dev-all.sh

   - The script sets VITE_WISP_URL to ws://localhost:9001/ for the frontend.
   - In Codespaces, forward port 9001 (expose it) and open the forwarded preview URL for the frontend (Vite server on port 5001 by default).

3. Configure Codespaces preview:
   - If you open the Codespaces preview for the frontend, the preview host is typically HTTPS/TLS-terminated. The preview host will forward incoming WSS to your ws listener. If you prefer, set VITE_WISP_URL to the preview host directly:
     VITE_WISP_URL="wss://<your-preview-host>/" pnpm dev

Debugging tips:
- In browser DevTools > Console, look for logs from the client:
  - "loading epoxy" (client initialized epoxy)
  - Any WebSocket connection failures — inspect the URL being requested.
- If you see Cross-Origin errors or SharedArrayBuffer / Shared Memory errors, check that the dev server responses include:
  - Cross-Origin-Embedder-Policy: require-corp
  - Cross-Origin-Opener-Policy: same-origin

Notes:
- This proxy is only meant for local dev and Codespaces previews. It's not hardened for production.
- If you have an existing epoxy/dreamland server or a production-grade WISP endpoint, point VITE_WISP_URL at that endpoint instead of using the simple proxy.
