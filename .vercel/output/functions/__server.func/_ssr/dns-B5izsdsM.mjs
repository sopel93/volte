import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as cn } from "./router-BnvOWaVG.mjs";
import { n as PageHeader, r as useVoltStore, t as Button } from "./store-BX5VcFS5.mjs";
import { n as CopyButton, t as Badge } from "./copy-button-BVCPVDM-.mjs";
import { n as raceDns, t as pickWinner } from "./dns-CnrcLiqt.mjs";
import { n as formatMs } from "./speed-CGw0bu4O.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dns-B5izsdsM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DnsPage() {
	const ranking = useVoltStore((s) => s.lastDns);
	const setDns = useVoltStore((s) => s.setDns);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [live, setLive] = (0, import_react.useState)(ranking);
	const winner = pickWinner(live);
	async function run() {
		if (running) return;
		setRunning(true);
		setLive([]);
		try {
			const next = await raceDns((probe) => {
				setLive((prev) => {
					return [...prev.filter((p) => p.id !== probe.id), probe].sort((a, b) => {
						if (a.ok !== b.ok) return a.ok ? -1 : 1;
						return a.ms - b.ms;
					});
				});
			});
			setDns(next);
			setLive(next);
		} finally {
			setRunning(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		kicker: "Resolver",
		title: "Wyścig DNS",
		children: "Pomiar DNS-over-HTTPS z Twojej wieży, nie z serwera aplikacji. Android 9+ przyjmie zwycięzcę jako Prywatny DNS — to jedyna zmiana DNS bez roota, której modem przestrzega."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "xl",
				className: "w-full rounded-lg",
				disabled: running,
				onClick: run,
				children: running ? "Ścigam resolvery…" : "Uruchom wyścig"
			}),
			winner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] uppercase tracking-[0.18em] text-subtle",
						children: "Zwycięzca z tej wieży"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xl font-medium tracking-tight",
						children: winner.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-sm text-signal",
						children: winner.hostname
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: winner.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
							value: winner.hostname,
							label: "Kopiuj nazwę hosta",
							done: "Host skopiowany"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/tuner",
								children: ["Ścieżka w ustawieniach Realme", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
							})
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: live.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]", index === 0 && row.ok && "ring-1 ring-signal/40"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: row.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums text-fg",
								children: row.ok ? `${formatMs(row.ms)} ms` : "brak"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-[11px] text-subtle",
							children: row.hostname
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [row.blocksAds ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "signal",
								children: "mniej reklam = mniej danych"
							}) : null, index === 0 && row.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "signal",
								children: "najszybszy"
							}) : null]
						})
					]
				}, row.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs leading-relaxed text-subtle",
				children: "AdGuard wygra na oszczędności transferu, Cloudflare zwykle na czystym RTT. Wklejasz host do: Ustawienia → Hasło i bezpieczeństwo → Prywatny DNS → Nazwa hosta dostawcy."
			})
		]
	})] });
}
//#endregion
export { DnsPage as component };
