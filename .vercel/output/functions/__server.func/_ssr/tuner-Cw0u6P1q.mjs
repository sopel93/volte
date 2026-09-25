import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Check } from "../_libs/lucide-react.mjs";
import { n as cn } from "./router-BnvOWaVG.mjs";
import { n as PageHeader, r as useVoltStore, t as Button } from "./store-BX5VcFS5.mjs";
import { n as CopyButton, t as Badge } from "./copy-button-BVCPVDM-.mjs";
import { n as POLAND_5G, r as TUNER_STEPS, t as DEVICE } from "./realme-CANwfUYe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tuner-Cw0u6P1q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var APN_PROFILES = [
	{
		id: "play",
		operator: "Play",
		name: "Play Internet",
		apn: "internet",
		user: "",
		password: "",
		mcc: "260",
		mnc: "06",
		type: "default,supl",
		protocol: "IPv4/IPv6",
		auth: "PAP",
		note: "Działa dla Play i Play NOW. Nie wpisuj loginu."
	},
	{
		id: "orange",
		operator: "Orange",
		name: "Orange Internet",
		apn: "internet",
		user: "",
		password: "",
		mcc: "260",
		mnc: "03",
		type: "default,supl",
		protocol: "IPv4/IPv6",
		auth: "PAP",
		note: "Ten sam APN dla nju mobile."
	},
	{
		id: "plus",
		operator: "Plus",
		name: "Plus Internet",
		apn: "plus",
		user: "plusgsm",
		password: "plusgsm",
		mcc: "260",
		mnc: "01",
		type: "default,supl",
		protocol: "IPv4/IPv6",
		auth: "PAP",
		note: "Jeśli nie łapie danych, dodaj drugi APN o nazwie internet bez loginu."
	},
	{
		id: "tmobile",
		operator: "T-Mobile",
		name: "T-Mobile Internet",
		apn: "internet",
		user: "",
		password: "",
		mcc: "260",
		mnc: "02",
		type: "default,supl",
		protocol: "IPv4/IPv6",
		auth: "PAP",
		note: "Heyah używa tego samego APN."
	}
];
function formatApn(profile) {
	return [
		`Nazwa: ${profile.name}`,
		`APN: ${profile.apn}`,
		`Użytkownik: ${profile.user || "—"}`,
		`Hasło: ${profile.password || "—"}`,
		`MCC: ${profile.mcc}`,
		`MNC: ${profile.mnc}`,
		`Typ APN: ${profile.type}`,
		`Protokół APN: ${profile.protocol}`,
		`Uwierzytelnianie: ${profile.auth}`
	].join("\n");
}
function TunerPage() {
	const done = useVoltStore((s) => s.tunerDone);
	const toggle = useVoltStore((s) => s.toggleTuner);
	const lastBoost = useVoltStore((s) => s.lastBoost);
	const [apnId, setApnId] = (0, import_react.useState)(APN_PROFILES[0]?.id ?? "play");
	const apn = APN_PROFILES.find((p) => p.id === apnId) ?? APN_PROFILES[0];
	const finished = TUNER_STEPS.filter((s) => done[s.id]).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageHeader, {
			kicker: "Snapdragon 695 · X51",
			title: "Tuner Realme",
			children: [
				DEVICE.name,
				" (",
				DEVICE.models,
				"). Pasma 5G w PL: ",
				DEVICE.polandBands.join(", "),
				". Aplikacja nie zmienia radia — te przełączniki są w systemie i na tym modelu robią różnicę."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "px-5",
			children: [
				lastBoost?.winnerHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] uppercase tracking-[0.18em] text-subtle",
							children: "Host z ostatniej sesji"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-mono text-sm text-signal",
							children: lastBoost.winnerHost
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
							className: "mt-3 w-full",
							value: lastBoost.winnerHost,
							label: "Kopiuj do Prywatnego DNS"
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-xs text-subtle",
					children: [
						finished,
						"/",
						TUNER_STEPS.length,
						" ustawień odhaczone"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: TUNER_STEPS.map((step) => {
						const on = Boolean(done[step.id]);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-pressed": on,
									onClick: () => toggle(step.id),
									className: cn("mt-0.5 grid size-11 shrink-0 place-items-center rounded-lg transition-colors duration-150 [&_svg]:pointer-events-none", on ? "bg-signal text-accent-fg" : "bg-raised text-muted shadow-[var(--shadow-border)]"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sr-only",
										children: "Oznacz jako zrobione"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "text-sm font-medium text-fg",
												children: step.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: step.action })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm leading-relaxed text-muted",
											children: step.why
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-mono text-[11px] leading-relaxed text-subtle",
											children: step.path
										}),
										step.altPath ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 font-mono text-[11px] leading-relaxed text-subtle",
											children: ["albo: ", step.altPath]
										}) : null
									]
								})]
							})
						}, step.id);
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-medium tracking-tight",
					children: "APN operatora"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Ustawienia → Karta SIM i dane komórkowe → [SIM] → Nazwy punktów dostępu. Protokół zawsze IPv4/IPv6."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: APN_PROFILES.map((profile) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "md",
						variant: profile.id === apnId ? "primary" : "secondary",
						onClick: () => setApnId(profile.id),
						children: profile.operator
					}, profile.id))
				}),
				apn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "APN"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-0.5 text-fg",
									children: apn.apn
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "MCC / MNC"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "mt-0.5 text-fg",
									children: [
										apn.mcc,
										" / ",
										apn.mnc
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Użytkownik"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-0.5 text-fg",
									children: apn.user || "—"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-subtle",
									children: "Hasło"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-0.5 text-fg",
									children: apn.password || "—"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-subtle",
										children: "Typ · protokół"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "mt-0.5 text-fg",
										children: [
											apn.type,
											" · ",
											apn.protocol
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: apn.note
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
							className: "mt-4 w-full",
							value: formatApn(apn),
							label: "Kopiuj profil APN"
						})
					]
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 px-5 pb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-medium tracking-tight",
					children: "5G w Polsce × 9 Pro"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: POLAND_5G.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: row.operator
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[11px] text-signal",
								children: row.nr
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: row.note
						})]
					}, row.operator))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs leading-relaxed text-subtle",
					children: "Modem X51 w 9 Pro obsługuje n78 (3,5–3,7 GHz) — główne pasmo 5G w Polsce — oraz n1/n3/n28 jako kotwicę LTE w NSA. Żadna aplikacja ze sklepu nie podbija Tput radia. VOLT podaje zmiany, które system naprawdę honoruje."
				})
			]
		})
	] });
}
//#endregion
export { TunerPage as component };
