<script setup>
import { ref, watch } from "vue";
import ToggleSwitch from "primevue/toggleswitch";

const isDarkMode = ref(false);
const darkTheme = "my-app-dark";

// Theo dõi sự thay đổi của isDarkMode để thêm hoặc xóa class dark mode
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add(darkTheme);
  } else {
    document.documentElement.classList.remove(darkTheme);
  }
});
</script>

<template>
  <div class="p-5 flex flex-col items-center justify-center transition">
    <div class="flex items-center gap-2">
      <span >Dark/Light Mode</span>
      <ToggleSwitch v-model="isDarkMode" />
    </div>
  </div>
</template>

<style>
/* Chuyển đổi màu mượt mà */
html {
  transition: background-color 0.3s, color 0.3s;
}
</style>
