import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as LoaderCircle, c as Circle, l as Check, u as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as cn } from "./router-BnvOWaVG.mjs";
import { n as PageHeader, r as useVoltStore, t as Button } from "./store-BX5VcFS5.mjs";
import { n as CopyButton, t as Badge } from "./copy-button-BVCPVDM-.mjs";
import { n as raceDns, r as warmDomains, t as pickWinner } from "./dns-CnrcLiqt.mjs";
import { i as measurePing, n as formatMs, o as payloadForLink, r as measureDownload, t as formatMbps } from "./speed-CGw0bu4O.mjs";
import { a as snapshotLink, n as parseDeviceFromUa, o as subscribeLink, t as Stat } from "./connection-B7Tsk06v.mjs";
import { t as DEVICE } from "./realme-CANwfUYe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CPX3LAJZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SignalRing({ active, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto grid size-52 place-items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none absolute inset-0 rounded-full border border-signal/25", active && "animate-[volt-pulse_2.8s_var(--ease-out)_infinite]") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none absolute inset-5 rounded-full border border-signal/40", active && "animate-[volt-pulse_2.8s_var(--ease-out)_infinite_0.2s]") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none absolute inset-10 rounded-full border border-border-strong bg-raised", active && "bg-signal-dim") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "relative z-10 font-mono text-xs uppercase tracking-[0.22em] text-muted",
				children: label
			})
		]
	});
}
var INITIAL = [
	{
		id: "wake",
		label: "Wybudzenie radia",
		detail: "RRC idle → connected",
		status: "wait"
	},
	{
		id: "ping",
		label: "Opóźnienie",
		detail: "Mediana RTT",
		status: "wait"
	},
	{
		id: "dns",
		label: "Wyścig DNS",
		detail: "DoH z tej wieży",
		status: "wait"
	},
	{
		id: "warm",
		label: "Rozgrzewka domen",
		detail: "Cache dla 10 serwisów",
		status: "wait"
	},
	{
		id: "down",
		label: "Próbka łącza",
		detail: "Pobranie testowe",
		status: "wait"
	}
];
function initialBoostSteps() {
	return INITIAL.map((step) => ({ ...step }));
}
function patch(steps, id, patchValue) {
	return steps.map((step) => step.id === id ? {
		...step,
		...patchValue
	} : step);
}
async function runBoostSession(onSteps) {
	let steps = initialBoostSteps();
	const emit = (next) => {
		steps = next;
		onSteps(steps);
	};
	emit(patch(steps, "wake", { status: "run" }));
	const link = snapshotLink();
	await measurePing(1);
	await new Promise((r) => setTimeout(r, 280));
	emit(patch(steps, "wake", {
		status: "done",
		detail: link.estimateLabel
	}));
	emit(patch(steps, "ping", { status: "run" }));
	const ping = await measurePing(5);
	emit(patch(steps, "ping", {
		status: ping.pingMs > 0 ? "done" : "fail",
		detail: ping.pingMs > 0 ? `${Math.round(ping.pingMs)} ms · jitter ${Math.round(ping.jitterMs)} ms` : "Brak odpowiedzi"
	}));
	emit(patch(steps, "dns", { status: "run" }));
	const ranking = await raceDns();
	const winner = pickWinner(ranking);
	emit(patch(steps, "dns", {
		status: winner ? "done" : "fail",
		detail: winner ? `${winner.name} · ${Math.round(winner.ms)} ms` : "Żaden resolver nie odpowiedział"
	}));
	emit(patch(steps, "warm", { status: "run" }));
	const warmed = await warmDomains((done, total) => {
		emit(patch(steps, "warm", {
			status: "run",
			detail: `${done}/${total}`
		}));
	});
	emit(patch(steps, "warm", {
		status: "done",
		detail: `${warmed} domen`
	}));
	emit(patch(steps, "down", { status: "run" }));
	const payload = payloadForLink("probe", link.downlinkMbps);
	const down = await measureDownload(payload.down);
	emit(patch(steps, "down", {
		status: down.ok ? "done" : "fail",
		detail: down.ok ? `${down.mbps.toFixed(1)} Mb/s` : "Pomiar nieudany"
	}));
	if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([
		18,
		40,
		18
	]);
	return {
		link,
		pingMs: ping.pingMs,
		jitterMs: ping.jitterMs,
		downMbps: down.mbps,
		ranking,
		winner,
		warmed
	};
}
function StepIcon({ status }) {
	if (status === "run") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin text-signal" });
	if (status === "done") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4 text-signal" });
	if (status === "fail") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-4 text-danger" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, { className: "size-4 text-subtle" });
}
function BoostPanel() {
	const lastBoost = useVoltStore((s) => s.lastBoost);
	const setBoost = useVoltStore((s) => s.setBoost);
	const setDns = useVoltStore((s) => s.setDns);
	const [running, setRunning] = (0, import_react.useState)(false);
	const [steps, setSteps] = (0, import_react.useState)(initialBoostSteps);
	async function start() {
		if (running) return;
		setRunning(true);
		setSteps(initialBoostSteps());
		try {
			const outcome = await runBoostSession(setSteps);
			setDns(outcome.ranking);
			setBoost({
				at: Date.now(),
				pingMs: outcome.pingMs,
				downMbps: outcome.downMbps,
				winnerName: outcome.winner?.name ?? "—",
				winnerHost: outcome.winner?.hostname ?? "",
				winnerMs: outcome.winner?.ms ?? 0,
				estimateLabel: outcome.link.estimateLabel
			});
		} finally {
			setRunning(false);
		}
	}
	const winnerHost = lastBoost?.winnerHost;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignalRing, {
						active: running,
						label: running ? "Sesja" : "Nasłuch"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "primary",
						size: "xl",
						className: "mt-2 w-full rounded-lg",
						disabled: running,
						onClick: start,
						children: running ? "Trwa pomiar…" : lastBoost ? "Ponów sesję" : "Uruchom sesję"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-center text-sm leading-relaxed text-muted",
						children: "Wybudza radio, mierzy RTT, ściga resolvery DNS i rozgrzewa cache. Nie steruje pasmem n78 — to robi modem Snapdragon X51."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-4 space-y-0.5 rounded-2xl bg-surface p-2 shadow-[var(--shadow-border)]",
				children: steps.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: cn("flex items-center gap-3 rounded-xl px-3 py-2.5", step.status === "run" && "bg-raised"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepIcon, { status: step.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-fg",
							children: step.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-mono text-[11px] text-subtle",
							children: step.detail
						})]
					})]
				}, step.id))
			}),
			lastBoost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] uppercase tracking-[0.18em] text-subtle",
						children: "Plan po sesji"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Opóźnienie",
								value: formatMs(lastBoost.pingMs),
								unit: "ms"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Próbka",
								value: formatMbps(lastBoost.downMbps),
								unit: "Mb/s"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "DNS",
								value: formatMs(lastBoost.winnerMs),
								unit: "ms"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted",
						children: [
							"Łącze: ",
							lastBoost.estimateLabel,
							". Najszybszy DNS z tej wieży:",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: lastBoost.winnerName
							}),
							"."
						]
					}),
					winnerHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm text-signal",
								children: winnerHost
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
								value: winnerHost,
								label: "Kopiuj host Prywatnego DNS",
								done: "Host DNS skopiowany"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/tuner",
									children: ["Otwórz tuner Realme", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})
							})
						]
					}) : null
				]
			}) : null
		]
	});
}
function LinkLive() {
	const [link, setLink] = (0, import_react.useState)(null);
	const [deviceLabel, setDeviceLabel] = (0, import_react.useState)(DEVICE.models);
	(0, import_react.useEffect)(() => {
		const sync = () => setLink(snapshotLink());
		sync();
		const device = parseDeviceFromUa();
		setDeviceLabel(device.isRealme9Pro ? DEVICE.name : device.isRealme ? "realme · profil 9 Pro 5G" : DEVICE.models);
		return subscribeLink(sync);
	}, []);
	const tone = !link || !link.online ? "neutral" : link.estimate === "5g" || link.estimate === "wifi" ? "signal" : link.estimate === "slow" ? "warn" : "neutral";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2 px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: link && !link.online ? "danger" : tone,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-current" }), link ? link.online ? link.estimateLabel : "Offline" : "Łącze"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: deviceLabel }),
			link?.saveData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				tone: "warn",
				children: "Oszczędzanie danych"
			}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageHeader, {
			kicker: "VOLT · tuner komórkowy",
			title: "realme 9 Pro 5G",
			children: [
				DEVICE.chipset,
				" · modem ",
				DEVICE.modem,
				" · ",
				DEVICE.nr,
				". Sesja mierzy Twoje łącze i wskazuje DNS oraz ustawienia, które na tym modelu naprawdę skracają czas ładowania."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkLive, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoostPanel, {})
		})
	] });
}
//#endregion
export { Home as component };
