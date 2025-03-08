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
  <div class="py-5 flex justify-start items-center transition">
    <div class="flex items-center gap-5">
      <ToggleSwitch v-model="isDarkMode" />
      <span >Dark/Light Mode</span>
    </div>
  </div>
</template>

<style>
/* Chuyển đổi màu mượt mà */
html {
  transition: background-color 0.3s, color 0.3s;
}
</style>
