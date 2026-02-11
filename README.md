## Development Setup

1. Copy `.env.example` to `.env.local` (or `.env`) and fill in your Base44 credentials. At minimum, provide `VITE_BASE44_APP_ID`, `VITE_BASE44_BACKEND_URL`, and `VITE_BASE44_APP_BASE_URL`. When both URLs point to the same API host, the new Vite config automatically reuses the backend URL so the Base44 proxy is always enabled.
2. Install dependencies:
	```bash
	npm install
	```
3. Start the dev server:
	```bash
	npm run dev
	```

The Vite config now infers `VITE_BASE44_APP_BASE_URL` from whichever Base44 URL you provide, preventing the `[base44] Proxy not enabled` warning and ensuring `/api` calls are forwarded to the right backend during development.
