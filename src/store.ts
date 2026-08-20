// Allow overriding the WISP/epoxy URL via Vite env variable VITE_WISP_URL.
// Fallback to the prior default or to the current host (wss://location.host).
const envWisp = (import.meta as any).env?.VITE_WISP_URL as string | undefined;
const defaultWisp = envWisp ?? `wss://${location.host}/`;

export let store = $store(
	{
		theme:
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: light)").matches
				? "light"
				: "dark",
		// Use environment override if provided, otherwise fall back to the prior default
		wisp: defaultWisp || "wss://anura.pro/",
		epoxyVersion: "",
	},
	{ ident: "options", backing: "localstorage", autosave: "auto" }
);
