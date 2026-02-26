/**
 * app-footer.js — フッター Web Component
 *
 * 使い方:
 *   <app-footer></app-footer>
 *
 * コピーライト年号は JS で自動生成するため、毎年手動更新する必要がない。
 */
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

    return /* html */ `
      <footer class="flex flex-col gap-6 px-10 py-8 text-center border-t border-slate-200 dark:border-slate-800">
        <!-- フッターリンク -->
        <div class="flex flex-wrap items-center justify-center gap-10">
          <a class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Privacy</a>
          <a class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Terms</a>
          <a class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#">Patch Notes</a>
        </div>

        <!-- SNS・外部リンクアイコン -->
        <div class="flex flex-wrap justify-center gap-6">
          <a class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#" aria-label="ターミナル">
            <span class="material-symbols-outlined">terminal</span>
          </a>
          <a class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#" aria-label="シェア">
            <span class="material-symbols-outlined">share</span>
          </a>
          <a class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" href="#" aria-label="コミュニティ">
            <span class="material-symbols-outlined">forum</span>
          </a>
        </div>

        <!-- 著作権表記（年号は自動更新） -->
        <p class="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-medium">
          © ${year} Rikemen. All rights reserved.
        </p>
      </footer>
    `;
  }
}

customElements.define('app-footer', AppFooter);
