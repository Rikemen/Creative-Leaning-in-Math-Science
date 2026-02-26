/**
 * app-header.js — ナビゲーションヘッダー Web Component
 *
 * 使い方:
 *   <app-header></app-header>
 *
 * アクティブリンクの自動ハイライト:
 *   現在のページ URL と href を照合し、一致するリンクに `aria-current="page"` を付与する。
 *   CSS側で [aria-current="page"] をスタイリングすることで、ページ固有の記述が不要になる。
 */
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
    return /* html */ `
      <header class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 md:px-20">
        <!-- ロゴ：クリックでホームに戻る -->
        <a href="index.html" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span class="material-symbols-outlined text-3xl text-slate-900 dark:text-slate-100">contrast</span>
          <span class="text-lg font-black leading-tight tracking-tighter uppercase">Squat_Maze</span>
        </a>

        <!-- ナビゲーション＋アカウントボタン -->
        <div class="flex items-center gap-8">
          <nav class="hidden md:flex items-center gap-8">
            <a class="nav-link text-sm font-medium hover:opacity-70 transition-opacity" href="game.html">GameStart</a>
            <a class="nav-link text-sm font-medium hover:opacity-70 transition-opacity" href="ranking.html">Ranking</a>
            <a class="nav-link text-sm font-medium hover:opacity-70 transition-opacity" href="setting.html">Settings</a>
          </nav>
          <button
            id="btn-account"
            class="flex items-center justify-center rounded-full size-10 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-label="アカウント">
            <span class="material-symbols-outlined text-xl">account_circle</span>
          </button>
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
