import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./router-BnvOWaVG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connection-B7Tsk06v.js
var import_jsx_runtime = require_jsx_runtime();
function Stat({ label, value, unit, hint, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-0", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.14em] text-subtle",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 flex items-baseline gap-1 font-mono text-2xl font-medium tabular-nums tracking-tight text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: value }), unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-sans font-medium text-muted",
					children: unit
				}) : null]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: hint
			}) : null
		]
	});
}
function readConnection() {
	if (typeof navigator === "undefined") return null;
	const nav = navigator;
	return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}
function mapKind(type) {
	if (type === "wifi") return "wifi";
	if (type === "cellular") return "cellular";
	if (type === "ethernet") return "ethernet";
	return "unknown";
}
function mapEffective(value) {
	if (value === "slow-2g" || value === "2g" || value === "3g" || value === "4g") return value;
	return "unknown";
}
function estimateLink(snapshot) {
	if (!snapshot.online) return {
		estimate: "offline",
		estimateLabel: "Brak sieci"
	};
	if (snapshot.kind === "wifi") return {
		estimate: "wifi",
		estimateLabel: "Wi-Fi"
	};
	if (snapshot.kind === "ethernet") return {
		estimate: "wifi",
		estimateLabel: "Ethernet"
	};
	const down = snapshot.downlinkMbps ?? 0;
	const rtt = snapshot.rttMs ?? 999;
	if (snapshot.kind === "cellular" || snapshot.effective !== "unknown") {
		if (snapshot.effective === "slow-2g" || snapshot.effective === "2g") return {
			estimate: "slow",
			estimateLabel: "2G / EDGE"
		};
		if (snapshot.effective === "3g" && down < 8) return {
			estimate: "3g",
			estimateLabel: "3G / HSPA"
		};
		if (down >= 50 && rtt <= 40) return {
			estimate: "5g",
			estimateLabel: "Szacunek 5G"
		};
		if (snapshot.effective === "4g" || down >= 8) return {
			estimate: "4g",
			estimateLabel: "LTE / 4G"
		};
		if (snapshot.effective === "3g") return {
			estimate: "3g",
			estimateLabel: "3G / HSPA"
		};
	}
	return {
		estimate: "unknown",
		estimateLabel: "Łącze aktywne"
	};
}
function snapshotLink() {
	const online = typeof navigator === "undefined" ? true : navigator.onLine;
	const conn = readConnection();
	const base = {
		online,
		kind: mapKind(conn?.type),
		effective: mapEffective(conn?.effectiveType),
		downlinkMbps: typeof conn?.downlink === "number" ? conn.downlink : null,
		rttMs: typeof conn?.rtt === "number" ? conn.rtt : null,
		saveData: Boolean(conn?.saveData)
	};
	const { estimate, estimateLabel } = estimateLink(base);
	return {
		...base,
		estimate,
		estimateLabel
	};
}
function subscribeLink(listener) {
	if (typeof window === "undefined") return () => {};
	const conn = readConnection();
	window.addEventListener("online", listener);
	window.addEventListener("offline", listener);
	conn?.addEventListener?.("change", listener);
	return () => {
		window.removeEventListener("online", listener);
		window.removeEventListener("offline", listener);
		conn?.removeEventListener?.("change", listener);
	};
}
function parseDeviceFromUa(ua = typeof navigator === "undefined" ? "" : navigator.userAgent) {
	return {
		isRealme9Pro: /RMX3471|RMX3472|RMX3474/i.test(ua) || /realme/i.test(ua) && /9\s*pro/i.test(ua),
		isRealme: /realme|RMX\d{4}/i.test(ua),
		isAndroid: /Android/i.test(ua),
		ua
	};
}
function readNextHopProtocol() {
	if (typeof performance === "undefined") return null;
	const entries = performance.getEntriesByType("resource");
	for (let i = entries.length - 1; i >= 0; i--) {
		const proto = entries[i]?.nextHopProtocol;
		if (proto) return proto;
	}
	return null;
}
function protocolLabel(proto) {
	if (!proto) return "—";
	if (proto === "h3" || proto === "http/3") return "HTTP/3 · QUIC";
	if (proto === "h2" || proto === "http/2") return "HTTP/2";
	if (proto.startsWith("http/1")) return "HTTP/1.1";
	return proto;
}
//#endregion
export { snapshotLink as a, readNextHopProtocol as i, parseDeviceFromUa as n, subscribeLink as o, protocolLabel as r, Stat as t };
