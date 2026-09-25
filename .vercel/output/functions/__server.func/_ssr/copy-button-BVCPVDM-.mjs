import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Check, s as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as cn } from "./router-BnvOWaVG.mjs";
import { t as Button } from "./store-BX5VcFS5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/copy-button-BVCPVDM-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "neutral", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone === "neutral" && "bg-raised text-muted shadow-[var(--shadow-border)]", tone === "signal" && "bg-signal-dim text-signal", tone === "warn" && "bg-warn/15 text-warn", tone === "danger" && "bg-danger/15 text-danger", className),
		children
	});
}
async function copyText(value, ok = "Skopiowano") {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(ok);
		return true;
	} catch {
		toast.error("Nie udało się skopiować");
		return false;
	}
}
function CopyButton({ value, label = "Kopiuj", done = "Skopiowano", className }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "secondary",
		className: cn("min-w-0", className),
		onClick: async () => {
			if (await copyText(value, done)) {
				setCopied(true);
				window.setTimeout(() => setCopied(false), 1600);
			}
		},
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), copied ? "Skopiowano" : label]
	});
}
//#endregion
export { CopyButton as n, Badge as t };
