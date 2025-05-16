<template>
    <div class="flex min-h-screen bg-transparent">
        <Card class="w-full">
            <template #title>
                <div class="w-full flex justify-between items-center pb-10">
                    <GoBack />
                    <h2 class="text-xl font-bold text-blue-800">Thông tin tài khoản</h2>
                </div>
            </template>
            <template #content>
                <div class="w-full flex justify-center">
                    <div class="w-1/5 flex justify-center items-center">
                        <img v-if="user?.avatar" :src="user?.avatar" alt="Avatar"
                            class="w-36 h-36 rounded-full object-cover" />
                        <img v-else :src="'https://avatar.iran.liara.run/username?username=' + user?.fullname"
                            alt="Default Avatar" class="w-36 h-36 rounded-full object-cover" />

                    </div>

                </div>
                <div class="w-full flex justify-center">
                    <h1 class="pt-5 text-5xl font-bold">{{ user?.fullname || 'Chưa cập nhật' }}</h1>

                </div>
                <h3 class="text-lg my-10 font-semibold text-gray-800 border-b pb-2">Thông tin cá nhân</h3>
                <div class="w-full grid grid-cols-2 gap-4">
                    <!-- Personal Information --
                    <!-- User info Teacher/Student-->
                    <template v-if="user?.role === 'student'">
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-gray-700">Mã số sinh viên:</label>
                            <span>{{ user?.student?.code }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-gray-700">Khoa:</label>
                            <span>{{ user?.student?.department?.name || 'Chưa cập nhật' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-gray-700">Ngành:</label>
                            <span>{{ user?.student?.major?.name || 'Chưa cập nhật' }}</span>
                        </div>
                    </template>
                    <template v-if="user?.role === 'teacher'">
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-gray-700">Mã nhân viên:</label>
                            <span>{{ user?.teacher?.code || 'Chưa cập nhật' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-gray-700">Học vị:</label>
                            <span>{{ user?.teacher?.degree || 'Chưa cập nhật' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <label class="font-semibold text-gray-700">Khoa</label>
                            <span>{{ user?.teacher?.department?.name || 'Chưa cập nhật' }}</span>
                        </div>
                    </template>
                    <!--  -->
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Ngày sinh:</label>
                        <span>{{
                            dayjs(user?.birth_date).format('MM/DD/YYYY') || 'Chưa cập nhật'
                            }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Địa chỉ:</label>
                        <span>{{ user?.address || 'Chưa cập nhật' }}</span>
                    </div>

                </div>
                <h3 class="text-lg my-10 font-semibold text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
                <div class="w-full grid grid-cols-2 gap-4"><!-- Contact Information -->

                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Email:</label>
                        <span>{{ user?.email }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Số điện thoại:</label>
                        <span>{{ user?.phone || 'Chưa cập nhật' }}</span>
                    </div>

                    <!-- Account Information -->
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Vai trò:</label>
                        <span>
                            {{
                                user?.role === 'student'
                                    ? 'Sinh viên'
                                    : user?.role === 'teacher'
                                        ? 'Giảng viên'
                                        : 'Quản trị viên'
                            }}
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Ngày tạo:</label>
                        <span>{{ dayjs(user?.created_at).format('MM/DD/YYYY') }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="font-semibold text-gray-700">Ngày cập nhật:</label>
                        <span>{{ dayjs(user?.updated_at).format('MM/DD/YYYY') }}</span>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup>
import GoBack from '@/components/button/GoBack.vue';
import { useUserStore } from '@/stores/store';
import dayjs from 'dayjs';
import { Card } from 'primevue';
import { onMounted, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const userStore = useUserStore()
const user = ref()
onMounted(async () => {
    const user_id = route.params.id;
    await userStore.findItem(user_id)
})
watchEffect(() => {
    user.value = userStore.item;

});
</script>
