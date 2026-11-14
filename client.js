window.__ModuleLoader__.load({
	id: "@huakirax/dsh-mem0-dock-tuner",
	factory: (require) => {
		const React = require("react");
		const h = React.createElement;

		/** Locale namespace owned by this plugin. */
		const NS = "mem0-dock-tuner";
		/** localStorage key backing the toggle. Default state: hidden. */
		const STORAGE_KEY = "mem0-dock-tuner.hidden";
		/** Class toggled on <html> that the CSS rule below reacts to. */
		const HIDDEN_CLASS = "mem0-dock-hidden";

		/* ------------------------------------------------------------------ */
		/* Styles                                                              */
		/* ------------------------------------------------------------------ */
		const CSS = `
			.${HIDDEN_CLASS} .mem0-dock { display: none !important; }

			.mdt-page { max-width: 460px; padding: 4px 0 16px; font-family: inherit; }
			.mdt-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent); background: color-mix(in srgb, var(--dsw-alias-label-secondary) 5%, transparent); }
			.mdt-text { flex: 1; min-width: 0; }
			.mdt-title { font-size: 13.5px; font-weight: 600; line-height: 19px; color: var(--dsw-alias-label-primary); }
			.mdt-sub { margin-top: 2px; font-size: 12px; line-height: 17px; color: var(--dsw-alias-label-secondary); }
			.mdt-switch { position: relative; flex: none; width: 38px; height: 22px; border-radius: 999px; border: none; padding: 0; background: color-mix(in srgb, var(--dsw-alias-label-secondary) 30%, transparent); cursor: pointer; transition: background .16s ease; outline: none; }
			.mdt-switch:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, #3aa3ff 45%, transparent); }
			.mdt-switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .25); transition: transform .16s ease; }
			.mdt-switchOn { background: #3aa3ff; }
			.mdt-switchOn::after { transform: translateX(16px); }
			.mdt-hint { margin-top: 10px; padding: 0 4px; font-size: 11.5px; line-height: 17px; color: var(--dsw-alias-label-tertiary); }
		`;

		/* ------------------------------------------------------------------ */
		/* Dictionaries                                                        */
		/* ------------------------------------------------------------------ */
		const zh = {
			"toggle.title": "隐藏 mem0 状态标识",
			"toggle.sub": "输入框下方的记忆活动标识（已保存 / 检索中…）",
			"toggle.on": "已隐藏，不占位置",
			"toggle.off": "显示中",
			"hint": "隐藏只是视觉上的：mem0 的记忆抽取、召回和设置页都不受影响。标识本身仍可打开 mem0 设置页。"
		};
		const en = {
			"toggle.title": "Hide mem0 dock badge",
			"toggle.sub": "The memory activity badge below the composer (saved / searching…)",
			"toggle.on": "Hidden — takes no space",
			"toggle.off": "Visible",
			"hint": "Hiding is visual only: mem0 capture, recall and its settings page are unaffected. The badge itself still opens mem0 settings."
		};

		function interpolate(template, vars) {
			if (vars === undefined) return template;
			return String(template).replace(/\{(\w+)\}/g, (match, key) => vars[key] === undefined ? match : String(vars[key]));
		}

		function useT(locale, provided) {
			const read = () => {
				try {
					const snapshot = locale && typeof locale.getLocale === "function" ? locale.getLocale() : null;
					return snapshot && typeof snapshot.id === "string" ? snapshot.id : "zh";
				} catch {
					return "zh";
				}
			};
			const [localeId, setLocaleId] = React.useState(read);
			React.useEffect(() => {
				if (!locale || typeof locale.subscribe !== "function") return;
				const update = () => setLocaleId(read());
				const dispose = locale.subscribe(update);
				return typeof dispose === "function" ? dispose : undefined;
			}, [locale]);
			const dict = String(localeId).toLowerCase().startsWith("en") ? en : zh;
			const fallback = React.useCallback((key, vars) => interpolate(dict[key] !== undefined ? dict[key] : key, vars), [dict]);
			return typeof provided === "function" ? provided : fallback;
		}

		/* ------------------------------------------------------------------ */
		/* Toggle page in plugin settings                                      */
		/* ------------------------------------------------------------------ */
		function ConfigPage({ locale }) {
			const t = useT(locale);
			const [hidden, setHidden] = React.useState(() => {
				try {
					return localStorage.getItem(STORAGE_KEY) !== "0";
				} catch {
					return true;
				}
			});
			const toggle = () => {
				const next = !hidden;
				setHidden(next);
				try {
					localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
				} catch {
					/* private mode: state lives for this page load only */
				}
				const root = document.documentElement;
				if (next) root.classList.add(HIDDEN_CLASS);
				else root.classList.remove(HIDDEN_CLASS);
			};
			return h("div", { className: "mdt-page" },
				h("div", { className: "mdt-row" },
					h("div", { className: "mdt-text" },
						h("div", { className: "mdt-title" }, t("toggle.title")),
						h("div", { className: "mdt-sub" }, t("toggle.sub"))
					),
					h("button", {
						type: "button",
						className: "mdt-switch" + (hidden ? " mdt-switchOn" : ""),
						role: "switch",
						"aria-checked": hidden,
						"aria-label": t("toggle.title"),
						onClick: toggle
					})
				),
				h("div", { className: "mdt-hint" },
					h("strong", null, hidden ? t("toggle.on") : t("toggle.off")),
					" · ",
					t("hint")
				)
			);
		}

		/* ------------------------------------------------------------------ */
		/* Registration                                                        */
		/* ------------------------------------------------------------------ */
		function insertStyles(ctx) {
			if (typeof document === "undefined") return;
			const run = () => {
				const existing = document.querySelector('style[data-plugin-css="' + NS + '"]');
				if (existing !== null) {
					existing.textContent = CSS;
					return undefined;
				}
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-mem0-dock-tuner";
				tag.dataset.pluginCss = NS;
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => {
					if (tag.parentNode !== null) tag.parentNode.removeChild(tag);
				};
			};
			if (typeof ctx.effect === "function") ctx.effect(run, "mem0-dock-tuner: stylesheet");
			else run();
		}

		function applySavedState() {
			if (typeof document === "undefined") return;
			let hidden = true;
			try {
				hidden = localStorage.getItem(STORAGE_KEY) !== "0";
			} catch {
				hidden = true;
			}
			if (hidden) document.documentElement.classList.add(HIDDEN_CLASS);
			else document.documentElement.classList.remove(HIDDEN_CLASS);
		}

		const INJECT = ["slots", "locale"];

		function apply(ctx) {
			ctx.inject(INJECT, mount);
		}

		function mount(ctx) {
			const slots = ctx.slots;
			const locale = ctx.locale;

			insertStyles(ctx);
			applySavedState();
			ctx.effect(() => locale.register(NS, { zh, en }), "mem0-dock-tuner: dictionaries");

			ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register(
				{
					name: "plugins.bundle.config",
					key: "@huakirax/dsh-mem0-dock-tuner",
					locale: NS
				},
				() => h(ConfigPage, { locale })
			));
		}

		return { inject: INJECT, apply };
	}
});
