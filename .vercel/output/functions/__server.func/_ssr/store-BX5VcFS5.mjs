import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-BnvOWaVG.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,color] duration-150 ease-[var(--ease-smooth-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/60 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90 rounded-md",
			secondary: "bg-raised text-fg shadow-[var(--shadow-border)] hover:bg-raised/80 rounded-md",
			ghost: "text-muted hover:text-fg hover:bg-raised rounded-md",
			signal: "bg-signal text-accent-fg hover:opacity-90 rounded-md"
		},
		size: {
			md: "h-11 px-4 text-sm",
			lg: "h-12 px-5 text-sm",
			xl: "h-14 px-6 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function PageHeader({ kicker, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "px-5 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4",
		children: [
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-subtle",
				children: kicker
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-sans text-3xl font-medium tracking-tight text-fg",
				children: title
			}),
			children ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children
			}) : null
		]
	});
}
var useVoltStore = create()(persist((set) => ({
	tunerDone: {},
	lastBoost: null,
	lastDns: [],
	speedHistory: [],
	toggleTuner: (id) => set((state) => ({ tunerDone: {
		...state.tunerDone,
		[id]: !state.tunerDone[id]
	} })),
	setBoost: (record) => set({ lastBoost: record }),
	setDns: (ranking) => set({ lastDns: ranking }),
	addSpeed: (record) => set((state) => ({ speedHistory: [record, ...state.speedHistory].slice(0, 8) }))
}), { name: "volt-realme-9pro" }));
//#endregion
export { PageHeader as n, useVoltStore as r, Button as t };
