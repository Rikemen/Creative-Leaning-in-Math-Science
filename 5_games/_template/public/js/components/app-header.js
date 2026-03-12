/**
 * app-header.js — ナビゲーションヘッダー Web Component
 *
 * 使い方:
 *   <app-header></app-header>
 *
 * アクティブリンクの自動ハイライト:
 *   現在のページ URL と href を照合し、一致するリンクに `aria-current="page"` を付与する。
 *   CSS側で [aria-current="page"] をスタイリングすることで、ページ固有の記述が不要になる。
 *
 * カスタマイズ:
 *   - APP_NAME: ロゴ横のアプリ名を変更する
 *   - APP_ICON: Material Symbols のアイコン名を変更する
 *   - navLinks: ページ追加時はこの配列にエントリを足す
 */

// ─── プロジェクト固有の値（ここだけ変更すればよい） ─────────
const APP_NAME = 'My App';
const APP_ICON = 'apps';
// ──────────────────────────────────────────────────────────

class AppHeader extends HTMLElement {
	connectedCallback() {
		// Shadow DOM は使わない。Tailwind CDN のクラスを外部から適用するため。
		this.innerHTML = this.#template();
		this.#markCurrentPage();
	}

	/**
	 * ヘッダーのHTMLテンプレートを返す
	 * ナビリンクは全ページ共通のため、ページ追加時はここだけ編集すれば済む。
	 */
	#template() {
		const navLinks = [
			{ label: 'Home', href: 'index.html' },
			{ label: 'About', href: 'about.html' }
			// ページ追加時: { label: 'ページ名', href: 'ファイル名.html' }
		];

		const navLinksHtml = navLinks
			.map(
				({ label, href }) =>
					`<a class="nav-link text-sm font-medium hover:opacity-70 transition-opacity" href="${href}">${label}</a>`
			)
			.join('\n\t\t\t\t');

		return /* html */ `
      <header class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 md:px-20">
        <!-- ロゴ：クリックでホームに戻る -->
        <a href="index.html" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span class="material-symbols-outlined text-3xl text-slate-900 dark:text-slate-100">${APP_ICON}</span>
          <span class="text-lg font-black leading-tight tracking-tighter uppercase">${APP_NAME}</span>
        </a>

        <!-- ナビゲーション -->
        <div class="flex items-center gap-8">
          <nav class="hidden md:flex items-center gap-8">
            ${navLinksHtml}
          </nav>
        </div>
      </header>
    `;
	}

	/**
	 * 現在のページに対応するナビリンクを `aria-current="page"` でマークする
	 * ページ名のみで照合するため、ディレクトリ構造の変化に強い。
	 */
	#markCurrentPage() {
		const currentFile = location.pathname.split('/').pop() || 'index.html';

		this.querySelectorAll('.nav-link').forEach((link) => {
			const linkFile = link.getAttribute('href').split('/').pop();
			if (linkFile === currentFile) {
				link.setAttribute('aria-current', 'page');
			}
		});
	}
}

customElements.define('app-header', AppHeader);
