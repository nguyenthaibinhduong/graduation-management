<template>
    <div>
        <div class="w-full mx-auto mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md text-blue-900 shadow-sm">
            <h3 class="text-lg font-semibold mb-2">
                📝 Hướng dẫn sử dụng chức năng đăng ký nhóm
            </h3>

            <ul class="list-inside text-sm space-y-2">
                <template v-if="!showMore">
                    <!-- Rút gọn: chỉ hiển thị 3 phần đầu -->
                    <li><strong>1.Tạo nhóm mới</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            <strong>Đăng ký 1 mình:</strong> Bạn có thể tạo nhóm cho riêng mình. Nhóm sẽ
                            có trạng thái <span class="font-bold">Pending</span> (đang chờ duyệt). Hệ
                            thống sẽ tạo mã nhóm duy nhất cho bạn.
                        </li>
                        <li>
                            <strong>Mời thêm thành viên vào nhóm:</strong> Bạn có thể mời các sinh viên
                            khác tham gia nhóm. Nhóm sẽ có trạng thái
                            <span class="font-bold">Create</span> (đang lập nhóm), và các thành viên bạn
                            mời sẽ nhận lời mời tham gia nhóm.
                        </li>
                    </ul>

                    <li><strong>2.Chấp nhận hoặc từ chối lời mời</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            <strong>Chấp nhận lời mời:</strong> Khi sinh viên được mời chấp nhận lời mời,
                            nhóm sẽ chuyển sang trạng thái <span class="font-bold">Pending</span> (đang
                            chờ duyệt). Các thành viên sẽ chờ giáo vụ duyệt nhóm.
                        </li>
                        <li>
                            <strong>Từ chối lời mời:</strong> Nếu một thành viên từ chối lời mời, nhóm sẽ
                            cập nhật sang trạng thái nhóm 1 thành viên
                        </li>
                    </ul>
                </template>
                <template v-else>
                    <li><strong>1.Tạo nhóm mới</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            <strong>Đăng ký 1 mình:</strong> Bạn có thể tạo nhóm cho riêng mình. Nhóm sẽ
                            có trạng thái <span class="font-bold">Pending</span> (đang chờ duyệt). Hệ
                            thống sẽ tạo mã nhóm duy nhất cho bạn.
                        </li>
                        <li>
                            <strong>Mời thêm thành viên vào nhóm:</strong> Bạn có thể mời các sinh viên
                            khác tham gia nhóm. Nhóm sẽ có trạng thái
                            <span class="font-bold">Create</span> (đang lập nhóm), và các thành viên bạn
                            mời sẽ nhận lời mời tham gia nhóm.
                        </li>
                    </ul>

                    <li><strong>2.Chấp nhận hoặc từ chối lời mời</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            <strong>Chấp nhận lời mời:</strong> Khi sinh viên được mời chấp nhận lời mời,
                            nhóm sẽ chuyển sang trạng thái <span class="font-bold">Pending</span> (đang
                            chờ duyệt). Các thành viên sẽ chờ giáo vụ duyệt nhóm.
                        </li>
                        <li>
                            <strong>Từ chối lời mời:</strong> Nếu một thành viên từ chối lời mời, nhóm sẽ
                            cập nhật sang trạng thái nhóm 1 thành viên
                        </li>
                    </ul>

                    <li><strong>3.Khóa nhóm và duyệt nhóm</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            Khi đến đợt khóa nhóm, các nhóm có trạng thái
                            <span class="font-bold">Pending</span> sẽ tự động chuyển thành
                            <span class="font-bold">Approved</span> (đã duyệt).
                        </li>
                        <li>
                            Chỉ khi nhóm có trạng thái <span class="font-bold">Approved</span>, bạn mới có
                            thể đăng ký đề tài cho nhóm.
                        </li>
                    </ul>

                    <li><strong>4.Mời thêm thành viên</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            Sau khi nhóm đã có ít nhất một thành viên, bạn có thể mời thêm thành viên vào
                            nhóm.
                        </li>
                        <li>
                            Hệ thống sẽ tự động cập nhật lại trạng thái của nhóm và số lượng thành viên.
                        </li>
                    </ul>

                    <li><strong>5.Tạo nhóm mới sau khi hủy nhóm cũ</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            Nếu nhóm hiện tại của bạn có trạng thái khác với
                            <span class="font-bold">Approved</span> (chưa duyệt), bạn cần hủy nhóm cũ để
                            tạo nhóm mới.
                        </li>
                        <li>
                            Hệ thống không cho phép tạo nhóm mới nếu nhóm cũ chưa được duyệt (status !=
                            <span class="font-bold">Approved</span>).
                        </li>
                    </ul>

                    <li><strong>6.Trường hợp nhóm đã khóa</strong></li>
                    <ul class="list-inside space-y-1">
                        <li>
                            Trong trường hợp nhóm đã có trạng thái
                            <span class="font-bold">Approved</span> và bạn muốn mời thêm thành viên mới,
                            bạn cần tạo yêu cầu đăng ký nhóm mới.
                        </li>
                        <li>Yêu cầu sẽ được gửi cho giáo vụ duyệt nhóm mới.</li>
                    </ul>
                </template>
            </ul>

            <h4 class="text-md font-semibold mt-4">⚠️ Lưu ý quan trọng:</h4>
            <ul class="list-disc list-inside text-sm">
                <li><strong>Chỉ sinh viên thuộc cùng khoa mới có thể tham gia nhóm.</strong></li>
                <li>
                    <strong>Trưởng nhóm nhóm khác không thể tạo nhóm mới, cần hủy nhóm cũ.</strong>
                </li>
                <li><strong>Nhóm đã được duyệt thì không thể thay đổi thành viên.</strong></li>
            </ul>

            <!-- Nút Toggle -->
            <button @click="showMore = !showMore" class="mt-3 text-sm text-blue-600 underline hover:text-blue-800">
                {{ showMore ? "Thu gọn" : "Xem thêm " }}
            </button>
        </div>

        <div class="w-full grid gap-x-4" :class="!['approved', 'finding', 'success'].includes(group?.status)
            ? 'grid-cols-2'
            : 'grid-cols-1'
            ">
            <div v-if="!['approved', 'finding', 'success'].includes(group?.status)"
                class="w-full mt-10 mx-auto o p-6 bg-white rounded-xl shadow-sm">
                <h2 class="text-2xl font-semibold mb-4">Đăng ký nhóm khóa luận</h2>

                <!-- Tên nhóm -->
                <div class="mb-4">
                    <label for="group_name" class="block mb-1 font-medium">Tên nhóm</label>
                    <MyInput type="text" id="group_name" v-model="group_name" class="w-full"
                        placeholder="Nhập tên nhóm" />
                </div>

                <!-- Mời thành viên -->
                <div class="mb-4">
                    <label for="student_code" class="block mb-1 font-medium">Mã sinh viên (thành viên)</label>
                    <MyInput type="text" id="student_code" v-model="student_code" class="w-full"
                        placeholder="Mã sinh viên muốn mời (tối đa 1 sinh viên)" />
                </div>

                <!-- Gửi lời mời -->
                <div class="flex justify-end space-x-2">
                    <Button label="Tạo nhóm" icon="pi pi-users" @click="createGroup" />
                    <Button label="Gửi lời mời" icon="pi pi-send" class="p-button-success" @click="inviteMember" />
                </div>

                <!-- Thông báo -->
            </div>
            <!-- Thông tin nhóm  -->
            <div class="w-full mt-10 p-6 bg-white rounded-xl shadow-sm">
                <h2 class="text-2xl font-semibold mb-4 text-green-700">Thông tin nhóm của bạn</h2>
                <div v-if="group?.length < 1 || !group" class="text-gray-500 text-sm">
                    Bạn hiện chưa có nhóm đăng ký
                </div>
                <div v-else class="space-y-2 text-base">
                    <div><span class="font-medium">Tên nhóm:</span> {{ group?.name }}</div>
                    <div><span class="font-medium">Mã nhóm:</span> {{ group?.code }}</div>
                    <div>
                        <span class="font-medium">Trưởng nhóm:</span>
                        {{ group?.leader?.user?.fullname }}
                    </div>
                    <div>
                        <span class="font-medium">Thành viên:</span>
                        <ul class="list-disc list-inside ml-2">
                            <li v-for="member in group?.status == 'create'
                                ? group?.student_attemp
                                : group?.students" :key="member.id">
                                {{ member.user?.fullname }} ({{ member.code }})
                            </li>
                        </ul>
                    </div>
                    <div>
                        <span class="font-medium">Trạng thái:</span>
                        <span :class="statusClass(group?.status)">{{
                            statusLabel(group?.status)
                        }}</span>
                    </div>
                    <div class="flex justify-end space-x-2">
                        <Button v-if="['create', 'pending'].includes(group?.status) && student?.id != group?.leader?.id"
                            label="Rời nhóm" icon="pi pi-sign-out" variant="outlined" severity="danger"
                            @click="cancelGroup(group.id)" />
                        <Button v-if="['create', 'pending'].includes(group?.status) && student?.id == group?.leader?.id"
                            label="Hủy nhóm" icon="pi pi-user-minus" variant="outlined" severity="danger"
                            @click="cancelGroup(group.id)" />
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { onMounted, ref, watchEffect } from "vue";

import Button from "primevue/button";
import MyInput from "@/components/form/MyInput.vue";
import { useAuthStore } from "@/stores/auth";
import { useGroupStore } from "@/stores/store";
import { showToast } from "@/utils/toast";

const group_name = ref("");
const student_code = ref("");
const authStore = useAuthStore();
const student = ref();
const group = ref(null);
const groupStore = useGroupStore();
const showMore = ref(false);
onMounted(async () => {
    await authStore.fetchUser();
    await groupStore.getMyGroup();
});
watchEffect(() => {
    student.value = authStore.user?.student;
    group.value = groupStore.group;
    console.log(group.value, student.value);
});

const statusLabel = (status) => {
    const statuses = {
        create: "Đang lập nhóm",
        pending: "Đang chờ duyệt",
        approved: "Đã duyệt",
        reject: "Đã huỷ",
        finding: "Đang ghi danh",
        success: "Thực hiện đề tài"
    };
    return statuses[status] || "Không xác định";
};

const statusClass = (status) => {
    const classes = {
        create: "bg-blue-100 text-blue-700 px-2  py-1 ms-2 text-sm rounded-full",
        pending: "bg-yellow-100 text-yellow-700 px-2  py-1 ms-2 text-sm rounded-full",
        approved: "bg-green-100 text-green-700 px-2  py-1 ms-2 text-sm rounded-full",
        reject: "bg-red-100 text-red-700 px-2  py-1 ms-2 text-sm rounded-full",
        finding: "bg-yellow-300 text-white px-2  py-1 ms-2 text-sm rounded-full",
        success: "bg-green-600 text-white px-2  py-1 ms-2 text-sm rounded-full",
    };
    return classes[status] || "";
};
// Hàm tạo nhóm (logic bạn tự thêm)
const createGroup = async () => {
    if (!group_name?.value) {
        showToast("Chưa điền tên nhóm", "info");
    } else {
        if (!student_code?.value) {
            const param = {
                name: group_name.value,
                student_codes: [student.value?.code],
            };
            if (!group.value) {
                await groupStore.addItem(param);
                await groupStore.getMyGroup();
                console.log(group.value);

                group_name.value = "";
                student_code.value = "";
            } else {
                showToast('Huỷ nhóm hiện tại để tạo nhóm khác', 'info');
            }

        } else {
            await inviteMember();
        }
    }
};

const inviteMember = async () => {
    if (!student_code?.value) {
        showToast("Chưa điền mã sinh viên thành viên", "info");
    } else {
        const param = {
            name: group_name.value,
            student_codes: [student.value?.code, student_code?.value],
        };
        if (!group.value) {
            await groupStore.addItem(param);
            await groupStore.getMyGroup();
            console.log(group.value);

            group_name.value = "";
            student_code.value = "";
        } else {
            showToast('Huỷ nhóm hiện tại để tạo nhóm khác', 'info');
        }


    }
};

const cancelGroup = async (id) => {
    if (id) {
        await groupStore.updateStatus(id);
        await groupStore.getMyGroup();
    }
};
</script>

<style scoped>
/* Thêm nếu cần style riêng */
</style>
