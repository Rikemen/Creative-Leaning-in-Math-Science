// ──────────────────────────────────────────────
// Squat Maze — 共通定数
// ゲーム全体で参照される設定値を一元管理する。
// 値を変えるだけで難易度やビジュアルを調整できる。
// ──────────────────────────────────────────────

// ── 画面 ──
export const BACKGROUND_COLOR = '#050505';

// ── プレイヤー ──
export const PLAYER_SIZE = 24; // ひし形の一辺（px）
export const PLAYER_X_RATIO = 0.12; // 画面左端からの位置（画面幅比）
export const PLAYER_GLOW_BLUR = 15; // ネオン発光の強さ

// ── 壁 ──
export const WALL_COLOR = '#1a1a1a'; // 壁の塗りつぶし色（void-grey）
export const WALL_SEGMENT_WIDTH = 80; // ギザギザ1区間の幅（px）
export const WALL_BASE_HEIGHT_RATIO = 0.15; // 壁の基本高さ（画面高さ比）
export const WALL_AMPLITUDE_RATIO = 0.04; // ギザギザの振幅（画面高さ比）
export const WALL_GLOW_BLUR = 10; // 壁境界線のネオン発光
export const WALL_STROKE_COLOR = 'rgba(255, 255, 255, 0.8)';
export const SCROLL_SPEED = 3; // 壁のスクロール速度（px/frame）

// ── 障害物 ──
export const OBSTACLE_WIDTH = 20; // ブロックの幅（px）
export const OBSTACLE_HEIGHT = 20; // ブロックの高さ（px）
export const OBSTACLE_SPAWN_INTERVAL = 90; // 出現間隔（フレーム数、約1.5秒@60fps）
export const OBSTACLE_COLOR = '#ffffff'; // ブロックの色
export const OBSTACLE_GLOW_BLUR = 8; // ブロックのネオン発光

// ── 当たり判定 ──
export const INVINCIBLE_DURATION = 60; // 被弾後の無敵時間（フレーム数、1秒@60fps）
export const HIT_FLASH_DURATION = 10; // 赤フラッシュの持続時間（フレーム数）
export const HIT_FLASH_COLOR = 'rgba(255, 50, 50, 0.25)'; // 被弾時の画面フラッシュ色
