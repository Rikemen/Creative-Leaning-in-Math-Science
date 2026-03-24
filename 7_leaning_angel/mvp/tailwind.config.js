/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 恋愛シミュレーション風のカラーパレット
      colors: {
        sakura: {
          50: '#fef1f7',
          100: '#fde6f0',
          200: '#fccce3',
          300: '#faa1cb',
          400: '#f76da8',
          500: '#f04388',
          600: '#e02068',
          700: '#c2134f',
          800: '#a01342',
          900: '#85143a',
        },
      },
      fontFamily: {
        // V2以降でカスタムフォントを適用する際のプレースホルダー
        display: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
