<template>
  <div class="flex min-h-screen py-10 px-4 bg-gray-50 justify-center items-start">
    <Card class="w-full max-w-5xl bg-white shadow-md rounded-xl">
      <!-- Tiêu đề và trạng thái -->
      <template #title>
        <div class="flex  items-center border-b pb-4">
          <h2 class="text-2xl font-bold text-blue-800">
            Đề tài: {{ project.title || "Chưa có tiêu đề" }}
          </h2>

        </div>
      </template>

      <!-- Nội dung chính -->
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50 rounded-md text-blue-800">


          <div class="space-y-1">
            <label class="font-semibold">👨‍🏫 GV Hướng dẫn:</label>
            <p>{{ project.teacher?.user?.fullname || "Chưa xác định" }}</p>
          </div>

          <div v-if="project.student?.user?.fullname" class="space-y-1">
            <label class="font-semibold">👩‍🎓 SV Đề xuất:</label>
            <p>{{ project.student?.user?.fullname }}</p>
          </div>

          <div class="space-y-1">
            <label class="font-semibold">📅 Học kỳ:</label>
            <p>{{ project.course?.name || "Chưa xác định" }}</p>
          </div>
        </div>
        <div class="my-2 px-2">
          <label class="font-semibold">📄 Mô tả:</label>
          <p>{{ project.description || "Chưa cập nhật" }}</p>
        </div>

        <!-- Nội dung chi tiết -->
        <div class="mt-8">
          <h3 class="text-center text-xl font-bold text-blue-900 mb-4">📝 Nội dung đề tài</h3>
          <div class=" w-full flex justify-center">
            <span :class="statusClass(project.status)">
              {{ statusLabel(project.status) }}
            </span>
          </div>
          <div class="border border-gray-300 rounded-lg p-5 text-gray-800 leading-relaxed">
            <span v-html="safeHtml(project?.content) || 'Chưa cập nhật'"></span>
          </div>
        </div>
      </template>

      <!-- Footer với các hành động -->
      <template #footer>
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
          <!-- Select đợt nếu là admin -->
          <div v-if="project.status === 'approve' && authStore.user?.role === 'admin'" class="w-full md:w-1/2">
            <MyInput v-model="sessonSelected" id="session_id" type="select" :options="session" optionLabel="title"
              optionValue="id" placeholder="Chọn đợt đăng ký" />
          </div>

          <!-- Các nút hành động -->
          <div class="flex  gap-3 justify-end w-full">
            <Button size="small" v-if="project.status === 'propose' && authStore.user?.role === 'teacher'"
              label="Gửi duyệt" class="btn-submit p-2 px-4 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white"
              @click="sendStatus" />

            <Button size="small" v-if="project.status === 'pending' && authStore.user?.role === 'admin'"
              label="Duyệt đề tài" class="btn-submit p-2 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white"
              @click="Approve" />

            <Button size="small" v-if="project.status === 'approve' && authStore.user?.role === 'admin'"
              label="Công bố đề tài" class="btn-submit p-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              @click="Public" />

            <Button size="small"
              v-if="project.status === 'public' && authStore.user?.role === 'student' && group?.status == 'approved'"
              label="Đăng ký thực hiện"
              class="btn-submit p-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white" @click="Register" />
            <div v-if="project.status === 'public' && authStore.user?.role === 'student' && group?.status == 'pending'"
              class="w-full p-3 bg-yellow-50 text-yellow-400 rounded-lg">Vui lòng đợi duyệt nhóm để được đăng ký đề
              tài</div>
            <div v-if="project.status === 'public' && authStore.user?.role === 'student' && group?.status == 'finding'"
              class="w-full p-3 bg-yellow-50 text-yellow-400 rounded-lg">Bạn đã đăng ký đề tài. Vui lòng chờ sự phân bổ
              Giảng viên hướng dẫn </div>
            <Button size="small" v-if="project.status === 'public' && authStore.user?.role === 'student' && !group"
              label="Đăng ký nhóm thực hiện"
              class="btn-submit p-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
              @click="router.push(`/group-manangerment`)" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>


<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEnrollmentStore, useGroupStore, useProjectStore } from "@/stores/store";
import { useAuthStore } from "@/stores/auth";
import { Button, Card } from "primevue";
import MyInput from "@/components/form/MyInput.vue";
import { showToast } from "@/utils/toast";
import DOMPurify from 'dompurify';


const safeHtml = (rawHtml) => { return DOMPurify.sanitize(rawHtml) };


const authStore = useAuthStore();
const projectStore = useProjectStore();
const project = ref(null);
const sessonSelected = ref(null);
const session = ref([]);
const sessionStore = useEnrollmentStore();
const groupStore = useGroupStore();
const updateData = ref({
  id: null,
  obj_id: null,
  status: "",
});
const group = ref()
const route = useRoute();
const router = useRouter();
onMounted(async () => {
  try {
    await sessionStore.fetchItems();
    await authStore.fetchUser();

    const user = authStore.user;
    if (!user) throw new Error("Không thể lấy thông tin người dùng");

    const projectId = route.params.id;
    const obj_id = user?.student?.id || user?.teacher?.id;
    await projectStore.findItem(projectId, obj_id, user.role);
    if (authStore.user?.role == 'student') {
      await groupStore.getMyGroup()
    }
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
});

watchEffect(() => {
  session.value = sessionStore.items;
  project.value = projectStore.item;
  if (authStore.user?.role == 'student') {
    group.value = groupStore.group
  }
});

const statusLabel = (status) => {
  const statuses = {
    propose: "Đề xuất",
    pending: "Đang chờ duyệt",
    approve: "Đã duyệt",
    public: "Đã công bố",
  };
  return statuses[status] || "Không xác định";
};

const statusClass = (status) => {
  const classes = {
    propose: "bg-blue-100 px-4 text-blue-700 py-2 text-md rounded",
    pending: "bg-yellow-100 px-4 text-yellow-700 py-2 text-md rounded",
    approve: "bg-green-100 px-4 text-green-700 py-2 text-md rounded",
    public: "bg-purple-100 px-4 text-purple-700 py-2 text-md rounded",
  };
  return classes[status] || "";
};

const sendStatus = async () => {
  const projectId = route.params.id;
  updateData.value.id = projectId;
  if (authStore.user?.teacher && authStore.user?.role == "teacher") {
    updateData.value.obj_id = authStore.user?.teacher?.id;
    updateData.value.status = "pending";
    await projectStore.updateStatusItem(updateData.value, authStore.user.role);
    await projectStore.findItem(
      projectId,
      authStore.user?.teacher?.id,
      authStore.user.role
    );
  }
};

const Approve = async () => {
  const projectId = route.params.id;
  updateData.value.id = projectId;
  if (authStore.user?.role == "admin") {
    updateData.value.obj_id = project.teacher?.id;
    updateData.value.status = "approve";
    await projectStore.updateStatusItem(updateData.value, authStore.user.role);
    await projectStore.findItem(
      projectId,
      project.value?.teacher?.id,
      authStore.user.role
    );
  }
};

const Public = async () => {
  if (sessonSelected.value != null) {
    const projectId = route.params.id;
    if (authStore.user?.role == "admin") {
      const payload = {
        id: projectId,
        session_id: sessonSelected.value || null,
        user_id: authStore.user?.id,
      };
      await projectStore.publicItem(payload, authStore.user.role);
      await projectStore.findItem(
        projectId,
        project.value?.teacher?.id,
        authStore.user.role
      );
    }
  } else {
    showToast("Vui lòng chọn đợt đăng ký!", "info", "INFO");
  }


};

const Register = async () => {
  const projectId = route.params.id;
  await groupStore.registerProject(group.value?.id, projectId);
  await groupStore.getMyGroup()
}
</script>
