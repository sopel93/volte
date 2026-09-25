import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PageHeader, r as useVoltStore, t as Button } from "./store-BX5VcFS5.mjs";
import { a as measureUpload, i as measurePing, n as formatMs, o as payloadForLink, r as measureDownload, t as formatMbps } from "./speed-CGw0bu4O.mjs";
import { a as snapshotLink, i as readNextHopProtocol, r as protocolLabel, t as Stat } from "./connection-B7Tsk06v.mjs";
import { a as CartesianGrid, i as Line, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pomiar-XzSfAodM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpeedPage() {
	const history = useVoltStore((s) => s.speedHistory);
	const addSpeed = useVoltStore((s) => s.addSpeed);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [phase, setPhase] = (0, import_react.useState)("Gotowe do pomiaru");
	const [liveDown, setLiveDown] = (0, import_react.useState)(0);
	const [liveUp, setLiveUp] = (0, import_react.useState)(0);
	const latest = history[0];
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	async function run() {
		if (running) return;
		setRunning(true);
		setLiveDown(0);
		setLiveUp(0);
		try {
			const link = snapshotLink();
			const payload = payloadForLink("full", link.downlinkMbps);
			setPhase("Wybudzenie radia");
			await measurePing(1);
			setPhase("Opóźnienie");
			const ping = await measurePing(6);
			setPhase("Pobieranie");
			const down = await measureDownload(payload.down, (_b, mbps) => {
				setLiveDown(mbps);
			});
			setPhase("Wysyłanie");
			const up = await measureUpload(payload.up, (_b, mbps) => {
				setLiveUp(mbps);
			});
			addSpeed({
				at: Date.now(),
				pingMs: ping.pingMs,
				jitterMs: ping.jitterMs,
				downMbps: down.mbps,
				upMbps: up.mbps,
				protocol: readNextHopProtocol()
			});
			setPhase("Zakończono");
		} finally {
			setRunning(false);
		}
	}
	const chart = (0, import_react.useMemo)(() => [...history].reverse().map((row, i) => ({
		i: i + 1,
		down: Number(row.downMbps.toFixed(1)),
		up: Number(row.upMbps.toFixed(1))
	})), [history]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "Laboratorium",
		title: "Pomiar łącza",
		children: "Pobieranie i wysyłanie idą przez ten sam serwer — bez CDN operatora, więc wynik jest porównywalny między sesjami. Pierwsze pakiety po uśpieniu radia są odrzucane."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Pobieranie",
							value: formatMbps(running ? liveDown : latest?.downMbps ?? 0),
							unit: "Mb/s"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Wysyłanie",
							value: formatMbps(running ? liveUp : latest?.upMbps ?? 0),
							unit: "Mb/s"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Ping",
							value: formatMs(latest?.pingMs ?? 0),
							unit: "ms",
							hint: latest ? `jitter ${formatMs(latest.jitterMs)} · ${protocolLabel(latest.protocol)}` : void 0
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "xl",
					className: "mt-5 w-full rounded-lg",
					disabled: running,
					onClick: run,
					children: running ? phase : "Uruchom test"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-subtle",
					children: phase
				})
			]
		}), mounted && chart.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.18em] text-subtle",
				children: "Historia"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
						data: chart,
						margin: {
							top: 8,
							right: 8,
							left: -22,
							bottom: 0
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								stroke: "rgba(244,244,245,0.06)",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "i",
								tick: {
									fill: "#71717a",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								tick: {
									fill: "#71717a",
									fontSize: 11
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								contentStyle: {
									background: "#18181c",
									border: "1px solid rgba(244,244,245,0.1)",
									borderRadius: 12,
									fontSize: 12
								},
								labelFormatter: (v) => `Pomiar ${v}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "down",
								name: "↓ Mb/s",
								stroke: "#5eead4",
								strokeWidth: 2,
								dot: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
								type: "monotone",
								dataKey: "up",
								name: "↑ Mb/s",
								stroke: "#e4e4e7",
								strokeWidth: 2,
								dot: false
							})
						]
					})
				})
			})]
		}) : null]
	})] });
}
//#endregion
export { SpeedPage as component };
