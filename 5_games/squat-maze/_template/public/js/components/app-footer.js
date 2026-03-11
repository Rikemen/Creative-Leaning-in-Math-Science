/**
 * app-footer.js — フッター Web Component
 *
 * 使い方:
 *   <app-footer></app-footer>
 *
 * コピーライト年号は JS で自動生成するため、毎年手動更新する必要がない。
 *
 * カスタマイズ:
 *   - COPYRIGHT_HOLDER: 著作権者名を変更する
 *   - footerLinks: リンクを追加・変更する
 */

// ─── プロジェクト固有の値（ここだけ変更すればよい） ─────────
const COPYRIGHT_HOLDER = 'Your Name';
// ──────────────────────────────────────────────────────────

class AppFooter extends HTMLElement {
	connectedCallback() {
		// Shadow DOM は使わない。Tailwind CDN のクラスを外部から適用するため。
		this.innerHTML = this.#template();
	}

	/**
	 * フッターのHTMLテンプレートを返す
	 * リンク追加・著作権表記の変更はここだけ編集すれば全ページに反映する。
	 */
	#template() {
		const year = new Date().getFullYear();

		const footerLinks = [
			{ label: 'Privacy', href: '#' },
			{ label: 'Terms', href: '#' }
		];

		const linksHtml = footerLinks
			.map(
				({ label, href }) =>
					`<a class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors" href="${href}">${label}</a>`
			)
			.join('\n\t\t\t\t');

		return /* html */ `
      <footer class="flex flex-col gap-6 px-10 py-8 text-center border-t border-slate-200 dark:border-slate-800">
        <!-- フッターリンク -->
        <div class="flex flex-wrap items-center justify-center gap-10">
          ${linksHtml}
        </div>

        <!-- 著作権表記（年号は自動更新） -->
        <p class="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-medium">
          © ${year} ${COPYRIGHT_HOLDER}. All rights reserved.
        </p>
      </footer>
    `;
	}
}

customElements.define('app-footer', AppFooter);
