<template>
  <div class="flex min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
    <!-- Left side (can be used for visuals or branding) -->
    <div class="w-1/2 flex items-center justify-center">
      <div class="text-center px-8">

        <h1 class="text-4xl font-bold text-blue-800 mb-4">Hệ thống quản lý khóa luận</h1>
        <p class="text-blue-900 text-lg">Chào mừng bạn quay trở lại, vui lòng đăng nhập để tiếp tục.</p>

      </div>
    </div>

    <!-- Login form on the right -->
    <div class="w-1/2 flex items-center justify-center">

      <Card class="w-[30rem] bg-white shadow-xl rounded-2xl px-6 py-8">

        <template #title>
          <div class="w-full flex justify-center">
            <img
              src="https://res.cloudinary.com/dvimvchbw/image/upload/v1743822679/iuh_logo_chi%CC%81nh_thu%CC%9B%CC%81c_nzlpep.png"
              alt="Logo" class="w-[300px] mb-1" />
          </div>
          <h2 class="text-center text-2xl font-semibold title pb-5">Đăng nhập hệ thống</h2>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="flex flex-col gap-4 mt-5">
            <FloatLabel class="mb-5">
              <label for="username">Tên đăng nhập</label>
              <InputText size="large" id="username" v-model="username" type="text" required class="w-full" />
            </FloatLabel>

            <FloatLabel class="mb-5">
              <label for="password">Mật khẩu</label>
              <InputText size="large" id="password" v-model="password" type="password" required class="w-full" />
            </FloatLabel>

            <Button type="submit" label="ĐĂNG NHẬP" class="mt-2 w-full btn-submit h-[4rem] text-[1.2rem]" />

          </form>

          <p v-if="errorMessage" class="text-red-600 text-sm text-center mt-3">
            {{ errorMessage }}
          </p>
          <!-- <h5 class="mt-3" align="center">Lưu ý: - <b>Mật khẩu mặc định dùng cho đăng nhập lần đầu tiên là password<br>
              - Sau khi đăng nhập vui lòng đổi lại mật khẩu và chịu trách nhiệm với mật khẩu của mình.</b><br>
            - Trường hợp sinh viên đăng nhập không được vui lòng gửi email về phuoccse@gmail.com để được hỗ trợ!</h5> -->
        </template>

      </Card>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { Card, Button, InputText, FloatLabel } from "primevue";
import { ref } from "vue";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await authStore.login(username.value, password.value);
    router.push("/");
  } catch (error) {
    errorMessage.value = "Email hoặc mật khẩu không đúng!";
  }
};
</script>

<style scoped></style>
