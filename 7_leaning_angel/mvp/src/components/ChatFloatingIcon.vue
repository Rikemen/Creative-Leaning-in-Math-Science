<template>
  <!-- 画面右下に常駐するさくら先輩のアイコン -->
  <button
    class="fixed bottom-6 right-6 z-40 h-16 w-16 overflow-hidden rounded-full
           bg-sakura-400 shadow-xl ring-4 ring-sakura-200
           transition-transform duration-200 hover:scale-110 active:scale-95"
    aria-label="さくら先輩に質問する"
    @click="$emit('open-chat')"
  >
    <!-- MVPでは絵文字で代用、後にさくら先輩アイコン画像に差し替え -->
    <span class="flex h-full w-full items-center justify-center text-3xl">
      🌸
    </span>
  </button>
</template>

<script setup>
defineEmits(['open-chat'])
</script>
