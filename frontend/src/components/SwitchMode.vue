<script setup>
import { ref, watchEffect, onMounted } from "vue";
import ToggleSwitch from "primevue/toggleswitch";

const darkTheme = "my-app-dark";
const isDarkMode = ref(localStorage.getItem("darkMode") === "true");

// Theo dõi và cập nhật class của document khi thay đổi chế độ
watchEffect(() => {
  document.documentElement.classList.toggle(darkTheme, isDarkMode.value);
  localStorage.setItem("darkMode", isDarkMode.value);
});

// Đảm bảo chế độ tối được áp dụng ngay khi trang tải lại
onMounted(() => {
  if (isDarkMode.value) {
    document.documentElement.classList.add(darkTheme);
  }
});
</script>

<template>
  <div class="py-5 flex justify-start items-center transition">
    <div class="flex items-center gap-5">
      <ToggleSwitch v-model="isDarkMode" />
      <span>Dark/Light Mode</span>
    </div>
  </div>
</template>

<style>
/* Chuyển đổi màu mượt mà */
html {
  transition: background-color 0.3s, color 0.3s;
}
</style>
