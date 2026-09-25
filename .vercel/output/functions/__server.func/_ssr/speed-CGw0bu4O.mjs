//#region node_modules/.nitro/vite/services/ssr/assets/speed-CGw0bu4O.js
function median(values) {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2 : sorted[mid] ?? 0;
}
async function timedFetch(url, init = {}, timeoutMs = 6e3) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		return await fetch(url, {
			cache: "no-store",
			...init,
			signal: ctrl.signal
		});
	} finally {
		clearTimeout(timer);
	}
}
async function drain(res) {
	try {
		await res.arrayBuffer();
	} catch {}
}
async function measurePing(rounds = 5) {
	const samples = [];
	for (let i = 0; i < rounds; i++) {
		const start = performance.now();
		try {
			const res = await timedFetch(`/api/speed/ping?n=${i}&t=${Date.now()}`, {}, 4e3);
			const ms = performance.now() - start;
			await drain(res);
			samples.push({
				ms,
				ok: res.ok
			});
		} catch {
			samples.push({
				ms: 0,
				ok: false
			});
		}
	}
	const good = samples.filter((s) => s.ok).map((s) => s.ms);
	const steady = good.length >= 3 ? good.slice(1) : good;
	const pingMs = median(steady);
	return {
		pingMs,
		jitterMs: median(steady.map((v) => Math.abs(v - pingMs))),
		samples
	};
}
async function readBody(res, onBytes) {
	if (!res.body) {
		const buf = await res.arrayBuffer();
		onBytes?.(buf.byteLength);
		return buf.byteLength;
	}
	const reader = res.body.getReader();
	let received = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		received += value.byteLength;
		onBytes?.(received);
	}
	return received;
}
async function measureDownload(bytes, onProgress) {
	const start = performance.now();
	try {
		const res = await timedFetch(`/api/speed/down?bytes=${bytes}&t=${Date.now()}`, {}, 15e3);
		if (!res.ok) return {
			mbps: 0,
			bytes: 0,
			ms: 0,
			ok: false
		};
		const received = await readBody(res, (got) => {
			const elapsed = (performance.now() - start) / 1e3;
			const mbps = elapsed > 0 ? got * 8 / elapsed / 1e6 : 0;
			onProgress?.(got, mbps);
		});
		const ms = performance.now() - start;
		return {
			mbps: ms > 0 ? received * 8 / (ms / 1e3) / 1e6 : 0,
			bytes: received,
			ms,
			ok: received > 0
		};
	} catch {
		return {
			mbps: 0,
			bytes: 0,
			ms: 0,
			ok: false
		};
	}
}
function randomPayload(bytes) {
	const buffer = new ArrayBuffer(bytes);
	const payload = new Uint8Array(buffer);
	const chunk = 65536;
	for (let offset = 0; offset < bytes; offset += chunk) crypto.getRandomValues(payload.subarray(offset, Math.min(offset + chunk, bytes)));
	return new Blob([buffer], { type: "application/octet-stream" });
}
async function measureUpload(bytes, onProgress) {
	const payload = randomPayload(bytes);
	const start = performance.now();
	onProgress?.(0, 0);
	try {
		const res = await timedFetch(`/api/speed/up?t=${Date.now()}`, {
			method: "POST",
			headers: { "Content-Type": "application/octet-stream" },
			body: payload
		}, 15e3);
		const ms = performance.now() - start;
		if (!res.ok) return {
			mbps: 0,
			bytes: 0,
			ms,
			ok: false
		};
		const sent = (await res.json()).bytes ?? payload.size;
		const mbps = ms > 0 ? sent * 8 / (ms / 1e3) / 1e6 : 0;
		onProgress?.(sent, mbps);
		return {
			mbps,
			bytes: sent,
			ms,
			ok: true
		};
	} catch {
		return {
			mbps: 0,
			bytes: 0,
			ms: 0,
			ok: false
		};
	}
}
function payloadForLink(kind, downlinkMbps) {
	const hint = downlinkMbps ?? 20;
	if (kind === "probe") return {
		down: hint < 8 ? 256e3 : 75e4,
		up: 18e4
	};
	if (hint < 4) return {
		down: 4e5,
		up: 2e5
	};
	if (hint < 20) return {
		down: 15e5,
		up: 4e5
	};
	return {
		down: 4e6,
		up: 1e6
	};
}
function formatMbps(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	if (value < 10) return value.toFixed(1);
	return Math.round(value).toString();
}
function formatMs(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	if (value < 10) return value.toFixed(1);
	return Math.round(value).toString();
}
//#endregion
export { measureUpload as a, measurePing as i, formatMs as n, payloadForLink as o, measureDownload as r, formatMbps as t };
