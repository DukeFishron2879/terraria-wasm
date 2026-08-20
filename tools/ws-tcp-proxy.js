#!/usr/bin/env node
// A minimal WebSocket -> TCP proxy for dev use.
// Usage:
//   node tools/ws-tcp-proxy.js --listen 9001 --target example.com:7777
//
// In Codespaces you'll forward the listen port and set the frontend's VITE_WISP_URL to
// ws://localhost:9001/ or wss://<preview-host>/ (the preview will TLS-terminate).

const net = require("net");
const WebSocket = require("ws");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
	.option("listen", { type: "number", default: 9001, description: "Port to listen for WebSocket clients" })
	.option("target", { type: "string", demandOption: true, description: "TCP target in host:port form" })
	.help().argv;

const [targetHost, targetPortStr] = argv.target.split(":");
const targetPort = parseInt(targetPortStr, 10);
if (!targetHost || !targetPort) {
	console.error("Invalid --target. Use host:port");
	process.exit(1);
}

const wss = new WebSocket.Server({ port: argv.listen });
console.log(`ws->tcp proxy listening on ws://0.0.0.0:${argv.listen} -> ${targetHost}:${targetPort}`);

wss.on("connection", (ws, req) => {
	console.log("ws connection from", req.socket.remoteAddress);
	const tcp = new net.Socket();

	tcp.connect(targetPort, targetHost, () => {
		console.log("connected to target", targetHost, targetPort);
	});

	tcp.on("data", (data) => {
		if (ws.readyState === WebSocket.OPEN) {
			try {
				ws.send(data);
			} catch (err) {
				console.error("ws send error", err);
			}
		}
	});

	tcp.on("close", () => {
		try { ws.close(); } catch {}
	});

	tcp.on("error", (err) => {
		console.error("tcp error", err);
		try { ws.terminate(); } catch {}
	});

	ws.on("message", (msg) => {
		// msg can be string or Buffer
		if (typeof msg === "string") {
			// treat as utf-8 text
			tcp.write(Buffer.from(msg, "utf8"));
		} else {
			tcp.write(msg);
		}
	});

	ws.on("close", () => {
		try { tcp.end(); } catch {}
	});

	ws.on("error", (err) => {
		console.error("ws error", err);
		try { tcp.destroy(); } catch {}
	});
});
