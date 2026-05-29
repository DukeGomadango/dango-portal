/* eslint-disable */
/**
 * <dango-header> — Dango Streamverse 共通ナビゲーションヘッダー
 *
 * Web Component + Shadow DOM による完全カプセル化。0依存で、
 * あらゆるフレームワーク / CSS 環境に <script> 1行で埋め込み可能。
 *
 * ── 使い方 ────────────────────────────────────────────
 *   <script src="https://dango-portal.vercel.app/dango-header.js"></script>
 *   <dango-header active-tool="calendar"></dango-header>
 *
 * ── 属性 ─────────────────────────────────────────────
 *   active-tool  : "counter" | "calendar" | "share" | "game"
 *                  省略時は window.location.hostname から自動検出
 *   portal-url   : ポータルのベースURL
 *                  デフォルト: "https://dango-portal.vercel.app"
 *
 * ── CSS Custom Properties（ホスト側で上書き可能） ──────
 *   --dg-green   : hsl(150, 85%, 55%)
 *   --dg-pink    : hsl(330, 95%, 65%)
 *   --dg-yellow  : hsl(45, 95%, 55%)
 *   --dg-purple  : hsl(270, 80%, 65%)
 *   --dg-bg      : #05060b
 *   --dg-fg      : #f8fafc
 *
 * @version 1.0.0
 * @license MIT
 */
(function () {
  "use strict";

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Tool Definitions
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var TOOLS = [
    {
      id: "counter",
      label: "Counter",
      color: "hsl(150, 85%, 55%)",
      colorBg: "hsla(150, 85%, 55%, 0.1)",
      url: "https://app-live-counter-suite.vercel.app",
    },
    {
      id: "calendar",
      label: "Calendar",
      color: "hsl(330, 95%, 65%)",
      colorBg: "hsla(330, 95%, 65%, 0.1)",
      url: "https://rank-calendar-app.vercel.app",
    },
    {
      id: "share",
      label: "Share Link",
      color: "hsl(45, 95%, 55%)",
      colorBg: "hsla(45, 95%, 55%, 0.1)",
      url: "https://share-link-app.vercel.app",
    },
    {
      id: "game",
      label: "Kakurenbo",
      color: "hsl(270, 80%, 65%)",
      colorBg: "hsla(270, 80%, 65%, 0.1)",
      url: "https://dango-kakurenbo.vercel.app",
    },
  ];

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Inline SVG Icons (lucide 互換 — viewBox:24x24, stroke-based)
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var SVG_MENU =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';

  var SVG_CLOSE =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  var SVG_ARROW =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

  var SVG_LOCK =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Google Fonts Injection（ドキュメントに1回だけ挿入）
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var fontsLoaded = false;

  function injectFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    if (document.getElementById("dango-header-fonts")) return;
    var link = document.createElement("link");
    link.id = "dango-header-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap";
    document.head.appendChild(link);
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Shadow DOM Styles
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  var STYLES = [
    /* ── Reset & Host ── */
    ":host {",
    "  display: block;",
    "  --dg-green: hsl(150, 85%, 55%);",
    "  --dg-pink: hsl(330, 95%, 65%);",
    "  --dg-yellow: hsl(45, 95%, 55%);",
    "  --dg-purple: hsl(270, 80%, 65%);",
    "  --dg-bg: #05060b;",
    "  --dg-fg: #f8fafc;",
    "  --dg-gradient: linear-gradient(135deg, var(--dg-green), var(--dg-pink), var(--dg-yellow));",
    "  font-family: 'Outfit', system-ui, -apple-system, sans-serif;",
    "  -webkit-font-smoothing: antialiased;",
    "  -moz-osx-font-smoothing: grayscale;",
    "}",
    "",
    "*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }",
    "a { text-decoration: none; color: inherit; }",
    "button { border: none; background: none; cursor: pointer; font: inherit; color: inherit; outline: none; }",
    "svg { display: inline-block; vertical-align: middle; flex-shrink: 0; }",
    "",

    /* ── Desktop Header ── */
    ".desktop-header {",
    "  position: fixed;",
    "  top: 0; left: 0; right: 0;",
    "  z-index: 99990;",
    "  padding: 28px 0;",
    "  background: transparent;",
    "  border-bottom: 1px solid transparent;",
    "  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);",
    "  display: none;",
    "  user-select: none;",
    "  pointer-events: auto;",
    "}",
    ".desktop-header.scrolled {",
    "  padding: 16px 0;",
    "  background: rgba(5, 6, 11, 0.5);",
    "  border-bottom-color: rgba(255, 255, 255, 0.05);",
    "  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);",
    "  backdrop-filter: blur(24px) saturate(180%);",
    "  -webkit-backdrop-filter: blur(24px) saturate(180%);",
    "}",
    "@media (min-width: 768px) { .desktop-header { display: block; } }",
    "",
    ".header-inner {",
    "  margin: 0 auto;",
    "  max-width: 80rem;",
    "  padding: 0 32px;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: space-between;",
    "}",
    "",

    /* ── Brand Logo ── */
    ".brand {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 12px;",
    "  transition: transform 300ms;",
    "}",
    ".brand:active { transform: scale(0.95); }",
    "",
    ".brand-orb {",
    "  width: 36px; height: 36px;",
    "  border-radius: 50%;",
    "  background: var(--dg-gradient);",
    "  padding: 1.5px;",
    "  transition: transform 500ms;",
    "  flex-shrink: 0;",
    "}",
    ".brand:hover .brand-orb { transform: rotate(180deg); }",
    "",
    ".brand-orb-inner {",
    "  width: 100%; height: 100%;",
    "  background: var(--dg-bg);",
    "  border-radius: 50%;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "}",
    ".brand-orb-dot {",
    "  width: 16px; height: 16px;",
    "  border-radius: 50%;",
    "  background: var(--dg-gradient);",
    "  opacity: 0.8;",
    "}",
    "",
    ".brand-text { display: flex; flex-direction: column; }",
    ".brand-name {",
    "  font-family: 'Syne', sans-serif;",
    "  font-size: 16px;",
    "  font-weight: 900;",
    "  letter-spacing: 0.05em;",
    "  text-transform: uppercase;",
    "  line-height: 1;",
    "  background: linear-gradient(to right, #f8fafc, #cbd5e1);",
    "  -webkit-background-clip: text;",
    "  -webkit-text-fill-color: transparent;",
    "  background-clip: text;",
    "}",
    ".brand-sub {",
    "  font-family: 'Outfit', sans-serif;",
    "  font-size: 9px;",
    "  font-weight: 700;",
    "  letter-spacing: 0.1em;",
    "  color: rgba(248, 250, 252, 0.4);",
    "  text-transform: uppercase;",
    "  line-height: 1;",
    "  margin-top: 4px;",
    "}",
    "",

    /* ── Nav Pill ── */
    ".nav-pill {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 6px;",
    "  padding: 4px 6px;",
    "  border-radius: 9999px;",
    "  background: rgba(255, 255, 255, 0.02);",
    "  backdrop-filter: blur(20px) saturate(180%);",
    "  -webkit-backdrop-filter: blur(20px) saturate(180%);",
    "  border: 1px solid rgba(255, 255, 255, 0.05);",
    "  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);",
    "}",
    "",
    ".nav-link {",
    "  position: relative;",
    "  padding: 8px 20px;",
    "  border-radius: 9999px;",
    "  font-size: 12px;",
    "  font-family: 'Outfit', sans-serif;",
    "  font-weight: 500;",
    "  letter-spacing: 0.1em;",
    "  color: rgba(248, 250, 252, 0.5);",
    "  text-transform: uppercase;",
    "  transition: all 300ms;",
    "  white-space: nowrap;",
    "}",
    ".nav-link:hover {",
    "  color: rgba(248, 250, 252, 0.9);",
    "  background: rgba(255, 255, 255, 0.05);",
    "}",
    ".nav-link:active { transform: scale(0.95); }",
    ".nav-link.active {",
    "  color: rgba(248, 250, 252, 0.9);",
    "  background: rgba(255, 255, 255, 0.05);",
    "}",
    ".nav-link.active::after {",
    "  content: '';",
    "  position: absolute;",
    "  bottom: 4px;",
    "  left: 50%;",
    "  transform: translateX(-50%);",
    "  width: 16px;",
    "  height: 2px;",
    "  border-radius: 9999px;",
    "  background: var(--tool-color, var(--dg-green));",
    "  box-shadow: 0 0 8px var(--tool-color, var(--dg-green));",
    "}",
    "",

    /* ── Desktop Login Button ── */
    ".login-btn {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 8px;",
    "  border-radius: 9999px;",
    "  padding: 10px 24px;",
    "  font-size: 12px;",
    "  font-family: 'Outfit', sans-serif;",
    "  font-weight: 600;",
    "  letter-spacing: 0.05em;",
    "  text-transform: uppercase;",
    "  transition: all 300ms;",
    "  background: var(--dg-fg);",
    "  color: var(--dg-bg);",
    "  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);",
    "}",
    ".login-btn:hover { background: rgba(248, 250, 252, 0.9); }",
    ".login-btn:active { transform: scale(0.95); }",
    ".login-btn svg { width: 12px; height: 12px; transition: transform 300ms; }",
    ".login-btn:hover svg { transform: translateY(-1px); }",
    "",

    /* ── Mobile Drawer Overlay ── */
    ".drawer-overlay {",
    "  position: fixed;",
    "  inset: 0;",
    "  z-index: 99991;",
    "  background: rgba(0, 0, 0, 0.6);",
    "  backdrop-filter: blur(8px);",
    "  -webkit-backdrop-filter: blur(8px);",
    "  opacity: 0;",
    "  visibility: hidden;",
    "  transition: all 500ms ease-in-out;",
    "  pointer-events: none;",
    "}",
    ".drawer-overlay.open {",
    "  opacity: 1;",
    "  visibility: visible;",
    "  pointer-events: auto;",
    "}",
    "@media (min-width: 768px) { .drawer-overlay { display: none !important; } }",
    "",

    /* ── Drawer Panel ── */
    ".drawer-panel {",
    "  position: absolute;",
    "  bottom: 0; left: 0; right: 0;",
    "  background: rgba(5, 6, 11, 0.85);",
    "  border-top: 1px solid rgba(255, 255, 255, 0.1);",
    "  border-radius: 32px 32px 0 0;",
    "  padding: 32px;",
    "  padding-bottom: calc(7rem + env(safe-area-inset-bottom, 0px));",
    "  display: flex;",
    "  flex-direction: column;",
    "  gap: 24px;",
    "  transform: translateY(100%);",
    "  transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);",
    "  box-shadow: 0 -25px 50px rgba(0, 0, 0, 0.5);",
    "  backdrop-filter: blur(30px) saturate(180%);",
    "  -webkit-backdrop-filter: blur(30px) saturate(180%);",
    "  overflow-y: auto;",
    "  max-height: 88vh;",
    "  max-height: 88svh;",
    "}",
    ".drawer-overlay.open .drawer-panel { transform: translateY(0); }",
    "",

    /* ── Drawer Handle ── */
    ".drawer-handle {",
    "  width: 48px; height: 6px;",
    "  background: rgba(255, 255, 255, 0.1);",
    "  border-radius: 9999px;",
    "  margin: 0 auto;",
    "  flex-shrink: 0;",
    "}",
    "",

    /* ── Drawer Brand ── */
    ".drawer-brand {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 12px;",
    "  justify-content: center;",
    "  margin-bottom: 8px;",
    "}",
    ".drawer-brand-orb {",
    "  width: 32px; height: 32px;",
    "  border-radius: 50%;",
    "  background: var(--dg-gradient);",
    "  padding: 1.5px;",
    "  flex-shrink: 0;",
    "}",
    ".drawer-brand-orb-inner {",
    "  width: 100%; height: 100%;",
    "  background: var(--dg-bg);",
    "  border-radius: 50%;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "}",
    ".drawer-brand-orb-dot {",
    "  width: 12px; height: 12px;",
    "  border-radius: 50%;",
    "  background: var(--dg-gradient);",
    "}",
    ".drawer-brand-name {",
    "  font-family: 'Syne', sans-serif;",
    "  font-size: 18px;",
    "  font-weight: 900;",
    "  letter-spacing: 0.05em;",
    "  text-transform: uppercase;",
    "  line-height: 1;",
    "  background: linear-gradient(to right, #f8fafc, #cbd5e1);",
    "  -webkit-background-clip: text;",
    "  -webkit-text-fill-color: transparent;",
    "  background-clip: text;",
    "}",
    "",

    /* ── Drawer Nav Cards ── */
    ".drawer-nav { display: flex; flex-direction: column; gap: 12px; }",
    "",
    ".drawer-card {",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: space-between;",
    "  padding: 16px;",
    "  border-radius: 16px;",
    "  background: rgba(255, 255, 255, 0.03);",
    "  border: 1px solid rgba(255, 255, 255, 0.05);",
    "  transition: all 200ms;",
    "}",
    ".drawer-card:hover { background: rgba(255, 255, 255, 0.06); }",
    ".drawer-card:active { transform: scale(0.98); }",
    "",
    ".drawer-card-text { display: flex; flex-direction: column; }",
    ".drawer-card-num {",
    "  font-family: 'Outfit', sans-serif;",
    "  font-size: 10px;",
    "  font-weight: 700;",
    "  color: rgba(248, 250, 252, 0.3);",
    "  text-transform: uppercase;",
    "  letter-spacing: 0.1em;",
    "}",
    ".drawer-card-label {",
    "  font-family: 'Syne', sans-serif;",
    "  font-size: 16px;",
    "  font-weight: 800;",
    "  letter-spacing: 0.05em;",
    "  color: rgba(248, 250, 252, 0.8);",
    "  text-transform: uppercase;",
    "}",
    ".drawer-card-arrow {",
    "  width: 32px; height: 32px;",
    "  border-radius: 50%;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  flex-shrink: 0;",
    "}",
    ".drawer-card-arrow svg { width: 14px; height: 14px; }",
    "",

    /* ── Drawer Login Button ── */
    ".drawer-login-btn {",
    "  width: 100%;",
    "  padding: 16px;",
    "  border-radius: 16px;",
    "  font-size: 14px;",
    "  font-family: 'Outfit', sans-serif;",
    "  font-weight: 700;",
    "  letter-spacing: 0.1em;",
    "  text-transform: uppercase;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  gap: 10px;",
    "  transition: all 300ms;",
    "  background: var(--dg-fg);",
    "  color: var(--dg-bg);",
    "  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);",
    "}",
    ".drawer-login-btn:active { transform: scale(0.95); }",
    ".drawer-login-btn svg { width: 14px; height: 14px; }",
    "",

    /* ── Drawer Bottom Spacer ── */
    ".drawer-spacer {",
    "  width: 100%;",
    "  flex-shrink: 0;",
    "  height: calc(6.5rem + env(safe-area-inset-bottom, 0px));",
    "}",
    "",

    /* ── Mobile Floating Pod ── */
    ".mobile-pod {",
    "  position: fixed;",
    "  bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));",
    "  left: 0; right: 0;",
    "  display: flex;",
    "  justify-content: center;",
    "  z-index: 99992;",
    "  pointer-events: none;",
    "  user-select: none;",
    "  transition: all 300ms;",
    "}",
    "@media (min-width: 768px) { .mobile-pod { display: none !important; } }",
    "",
    ".pod-btn {",
    "  display: flex;",
    "  align-items: center;",
    "  gap: 12px;",
    "  padding: 14px 24px;",
    "  border-radius: 9999px;",
    "  border: 1px solid rgba(255, 255, 255, 0.05);",
    "  background: rgba(5, 6, 11, 0.6);",
    "  backdrop-filter: blur(24px);",
    "  -webkit-backdrop-filter: blur(24px);",
    "  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);",
    "  color: rgba(248, 250, 252, 0.8);",
    "  pointer-events: auto;",
    "  transition: all 300ms;",
    "}",
    ".pod-btn:hover { background: rgba(5, 6, 11, 0.8); }",
    ".pod-btn:active { transform: scale(0.95); }",
    ".pod-btn.open {",
    "  background: rgba(5, 6, 11, 0.9);",
    "  border-color: rgba(255, 255, 255, 0.1);",
    "  color: var(--dg-fg);",
    "  transform: scale(0.95);",
    "}",
    ".pod-btn svg { width: 15px; height: 15px; }",
    "",
    ".pod-orb {",
    "  width: 12px; height: 12px;",
    "  border-radius: 50%;",
    "  background: var(--dg-gradient);",
    "  flex-shrink: 0;",
    "}",
    ".pod-orb.pulse { animation: dg-pulse 2s ease-in-out infinite; }",
    "",
    ".pod-label {",
    "  font-family: 'Syne', sans-serif;",
    "  font-size: 12px;",
    "  font-weight: 900;",
    "  letter-spacing: 0.1em;",
    "  text-transform: uppercase;",
    "}",
    "",
    ".pod-divider {",
    "  width: 1px; height: 14px;",
    "  background: rgba(255, 255, 255, 0.1);",
    "  flex-shrink: 0;",
    "}",
    "",

    /* ── Toast Notification ── */
    ".toast {",
    "  position: fixed;",
    "  top: max(20px, env(safe-area-inset-top, 20px));",
    "  left: 50%;",
    "  transform: translateX(-50%) translateY(-100px);",
    "  padding: 12px 24px;",
    "  background: rgba(15, 17, 22, 0.92);",
    "  backdrop-filter: blur(16px) saturate(180%);",
    "  -webkit-backdrop-filter: blur(16px) saturate(180%);",
    "  border: 1px solid rgba(255, 255, 255, 0.1);",
    "  border-radius: 9999px;",
    "  color: var(--dg-fg);",
    "  font-size: 13px;",
    "  font-weight: 600;",
    "  z-index: 99999;",
    "  transition: transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1);",
    "  pointer-events: none;",
    "  white-space: nowrap;",
    "}",
    ".toast.visible { transform: translateX(-50%) translateY(0); }",
    "",

    /* ── Keyframes ── */
    "@keyframes dg-pulse {",
    "  0%, 100% { opacity: 1; }",
    "  50% { opacity: 0.5; }",
    "}",
  ].join("\n");

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * DangoHeader — Custom Element Definition
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  class DangoHeader extends HTMLElement {
    /** 監視対象の属性 */
    static get observedAttributes() {
      return ["active-tool", "portal-url"];
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._drawerOpen = false;
      this._toastTimer = null;
      this._boundScroll = this._onScroll.bind(this);
    }

    /** アクティブツールの取得（属性 → URL自動検出 → 空文字） */
    get _activeTool() {
      var attr = this.getAttribute("active-tool");
      if (attr) return attr;
      var hostname = window.location.hostname;
      for (var i = 0; i < TOOLS.length; i++) {
        try {
          if (new URL(TOOLS[i].url).hostname === hostname) return TOOLS[i].id;
        } catch (_) {
          /* ignore */
        }
      }
      return "";
    }

    /** ポータルURLの取得 */
    get _portalUrl() {
      return (
        this.getAttribute("portal-url") || "https://dango-portal.vercel.app"
      );
    }

    /** 現在のページがポータル自身かどうか */
    get _isPortal() {
      try {
        return window.location.origin === new URL(this._portalUrl).origin;
      } catch (_) {
        return false;
      }
    }

    /** ツールへの遷移先URL */
    _getToolHref(tool) {
      return this._isPortal ? "#tool-" + tool.id : tool.url;
    }

    /* ── Lifecycle ── */

    connectedCallback() {
      injectFonts();
      this._render();
      this._bind();
      window.addEventListener("scroll", this._boundScroll, { passive: true });
      this._onScroll();
    }

    disconnectedCallback() {
      window.removeEventListener("scroll", this._boundScroll);
      if (this._toastTimer) clearTimeout(this._toastTimer);
      document.body.style.overflow = "";
    }

    attributeChangedCallback(_name, oldVal, newVal) {
      if (oldVal === newVal) return;
      if (this.isConnected) {
        var wasOpen = this._drawerOpen;
        this._render();
        this._bind();
        this._onScroll();
        if (wasOpen) this._openDrawer();
      }
    }

    /* ── Rendering ── */

    _render() {
      var active = this._activeTool;
      var portalUrl = this._portalUrl;
      var self = this;

      /* デスクトップ用ナビリンク */
      var desktopLinks = TOOLS.map(function (t) {
        var isActive = t.id === active;
        var href = self._getToolHref(t);
        return (
          '<a href="' +
          href +
          '" class="nav-link' +
          (isActive ? " active" : "") +
          '"' +
          (isActive ? ' style="--tool-color: ' + t.color + '"' : "") +
          ' data-tool="' +
          t.id +
          '">' +
          t.label +
          "</a>"
        );
      }).join("");

      /* モバイル用ドロワーカード */
      var drawerCards = TOOLS.map(function (t, i) {
        var href = self._getToolHref(t);
        return (
          '<a href="' +
          href +
          '" class="drawer-card" data-tool="' +
          t.id +
          '">' +
          '<div class="drawer-card-text">' +
          '<span class="drawer-card-num">0' +
          (i + 1) +
          "</span>" +
          '<span class="drawer-card-label">' +
          t.label +
          "</span>" +
          "</div>" +
          '<div class="drawer-card-arrow" style="background: ' +
          t.colorBg +
          "; color: " +
          t.color +
          '">' +
          SVG_ARROW +
          "</div>" +
          "</a>"
        );
      }).join("");

      this.shadowRoot.innerHTML =
        "<style>" +
        STYLES +
        "</style>" +
        /* ─── Desktop Header ─── */
        '<header class="desktop-header" id="dh">' +
        '<div class="header-inner">' +
        '<a class="brand" href="' +
        portalUrl +
        '">' +
        '<div class="brand-orb">' +
        '<div class="brand-orb-inner">' +
        '<div class="brand-orb-dot"></div>' +
        "</div>" +
        "</div>" +
        '<div class="brand-text">' +
        '<span class="brand-name">DANGO</span>' +
        '<span class="brand-sub">Streamverse</span>' +
        "</div>" +
        "</a>" +
        '<nav class="nav-pill">' +
        desktopLinks +
        "</nav>" +
        '<button class="login-btn" data-action="login">' +
        SVG_LOCK +
        "<span>\u30ED\u30B0\u30A4\u30F3</span>" +
        "</button>" +
        "</div>" +
        "</header>" +
        /* ─── Mobile Drawer ─── */
        '<div class="drawer-overlay" id="overlay">' +
        '<div class="drawer-panel" id="panel">' +
        '<div class="drawer-handle"></div>' +
        '<div class="drawer-brand">' +
        '<div class="drawer-brand-orb">' +
        '<div class="drawer-brand-orb-inner">' +
        '<div class="drawer-brand-orb-dot"></div>' +
        "</div>" +
        "</div>" +
        '<span class="drawer-brand-name">DANGO STREAMVERSE</span>' +
        "</div>" +
        '<nav class="drawer-nav">' +
        drawerCards +
        "</nav>" +
        '<button class="drawer-login-btn" data-action="login">' +
        SVG_LOCK +
        "<span>DANGO ID \u3067\u30ED\u30B0\u30A4\u30F3</span>" +
        "</button>" +
        '<div class="drawer-spacer"></div>' +
        "</div>" +
        "</div>" +
        /* ─── Mobile Pod ─── */
        '<div class="mobile-pod" id="pod">' +
        '<button class="pod-btn" id="pod-btn">' +
        '<div class="pod-orb pulse"></div>' +
        '<span class="pod-label">STREAMVERSE</span>' +
        '<div class="pod-divider"></div>' +
        SVG_MENU +
        "</button>" +
        "</div>" +
        /* ─── Toast ─── */
        '<div class="toast" id="toast"></div>';
    }

    /* ── Event Binding ── */

    _bind() {
      var self = this;
      var shadow = this.shadowRoot;

      /* Pod toggle */
      var podBtn = shadow.getElementById("pod-btn");
      if (podBtn) {
        podBtn.addEventListener("click", function () {
          self._toggleDrawer();
        });
      }

      /* Overlay close（背景クリックのみ — パネル内のクリックは伝播停止） */
      var overlay = shadow.getElementById("overlay");
      if (overlay) {
        overlay.addEventListener("click", function (e) {
          if (e.target === overlay) self._closeDrawer();
        });
      }
      var panel = shadow.getElementById("panel");
      if (panel) {
        panel.addEventListener("click", function (e) {
          e.stopPropagation();
        });
      }

      /* Drawer card clicks → ドロワーを閉じる */
      var cards = shadow.querySelectorAll(".drawer-card");
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener("click", function () {
          self._closeDrawer();
        });
      }

      /* Login buttons */
      var loginBtns = shadow.querySelectorAll('[data-action="login"]');
      for (var j = 0; j < loginBtns.length; j++) {
        loginBtns[j].addEventListener("click", function () {
          self._handleLogin();
        });
      }
    }

    /* ── Scroll Handler ── */

    _onScroll() {
      var header = this.shadowRoot
        ? this.shadowRoot.getElementById("dh")
        : null;
      if (!header) return;
      if (window.scrollY > 20 || !this._isPortal) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    /* ── Drawer Control ── */

    _toggleDrawer() {
      if (this._drawerOpen) {
        this._closeDrawer();
      } else {
        this._openDrawer();
      }
    }

    _openDrawer() {
      this._drawerOpen = true;
      var shadow = this.shadowRoot;

      var overlay = shadow.getElementById("overlay");
      var podBtn = shadow.getElementById("pod-btn");
      if (overlay) overlay.classList.add("open");
      if (podBtn) {
        podBtn.classList.add("open");
        var orb = podBtn.querySelector(".pod-orb");
        var label = podBtn.querySelector(".pod-label");
        var svg = podBtn.querySelector("svg");
        if (orb) orb.classList.remove("pulse");
        if (label) label.textContent = "CLOSE";
        if (svg) svg.outerHTML = SVG_CLOSE;
      }
      document.body.style.overflow = "hidden";
    }

    _closeDrawer() {
      this._drawerOpen = false;
      var shadow = this.shadowRoot;

      var overlay = shadow.getElementById("overlay");
      var podBtn = shadow.getElementById("pod-btn");
      if (overlay) overlay.classList.remove("open");
      if (podBtn) {
        podBtn.classList.remove("open");
        var orb = podBtn.querySelector(".pod-orb");
        var label = podBtn.querySelector(".pod-label");
        var svg = podBtn.querySelector("svg");
        if (orb) orb.classList.add("pulse");
        if (label) label.textContent = "STREAMVERSE";
        if (svg) svg.outerHTML = SVG_MENU;
      }
      document.body.style.overflow = "";
    }

    /* ── Login Handler ── */

    _handleLogin() {
      this._closeDrawer();
      this._showToast(
        "\uD83C\uDF61 \u30ED\u30B0\u30A4\u30F3\u6A5F\u80FD\u306F\u8FD1\u65E5\u516C\u958B\u4E88\u5B9A\u3067\u3059"
      );
    }

    /* ── Toast ── */

    _showToast(msg) {
      var toast = this.shadowRoot
        ? this.shadowRoot.getElementById("toast")
        : null;
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("visible");
      var self = this;
      if (self._toastTimer) clearTimeout(self._toastTimer);
      self._toastTimer = setTimeout(function () {
        toast.classList.remove("visible");
      }, 2500);
    }
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Register the Custom Element
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

  if (!customElements.get("dango-header")) {
    customElements.define("dango-header", DangoHeader);
  }
})();
