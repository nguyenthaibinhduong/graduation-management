<template>
  <div class="flex min-h-screen bg-transparent py-8 justify-center">
    <Card class="w-full">
      <template #title>
        <div class="w-full flex justify-between items-center pb-6">
          <h2 class="text-xl font-bold text-blue-800">
            Đề tài {{ project.title || "" }}
          </h2>
          <span :class="statusClass(project.status)">
            {{ statusLabel(projectStore?.item?.status) }}
          </span>
        </div>
      </template>
      <template #content>
        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-100 rounded-lg p-5 text-blue-600">
          <div class="flex items-center gap-2">
            <label class="font-semibold text-blue-700">Mô tả:</label>
            <span>{{ project.description || "Chưa cập nhật" }}</span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-blue-700">Giáo viên hướng dẫn:</label>
            <span>{{ project.teacher?.user?.fullname || "Chưa xác định" }}</span>
          </div>

          <div v-if="project.student?.user?.fullname" class="flex items-center gap-2">
            <label class="font-semibold text-blue-700">Sinh viên đề xuất:</label>
            <span>{{ project.student?.user?.fullname || "Chưa xác định" }}</span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-blue-700">Học kỳ:</label>
            <span>{{ project.course?.name || "Chưa xác định" }}</span>
          </div>
        </div>
        <h2 class="w-full text-center font-bold text-2xl py-5">Nội dung</h2>
        <div class="w-full border border-gray-400 p-5 rounded-lg">
          <span class="mt-10" v-html="safeHtml(project?.content) || 'Chưa cập nhật'"></span>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-between">
          <div class="w-3/5">
            <MyInput v-if="project?.status == 'approve' && authStore.user?.role == 'admin'" v-model="sessonSelected"
              id="session_id" type="select" :options="session" optionLabel="title" optionValue="id"
              placeholder="Chọn đợt đăng ký" />

          </div>

          <div class="w-1/2 flex justify-end">
            <Button @click="sendStatus" class="btn-submit p-2 rounded-md gap-x-5"
              v-if="project?.status == 'propose' && authStore.user?.role == 'teacher'">Gửi duyệt</Button>
            <Button @click="Approve" class="btn-submit p-2 rounded-md"
              v-if="project?.status == 'pending' && authStore.user?.role == 'admin'">Duyệt đề tài</Button>

            <Button @click="Public" class="btn-submit p-2 rounded-md"
              v-if="project?.status == 'approve' && authStore.user?.role == 'admin'">Công bố đề tài</Button>

            <Button @click="Public" class="btn-submit p-2 rounded-md"
              v-if="project?.status == 'public' && authStore.user?.role == 'student'">Đăng ký thực hiện đề tài</Button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useEnrollmentStore, useProjectStore } from "@/stores/store";
import { useAuthStore } from "@/stores/auth";
import { Card } from "primevue";
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
const updateData = ref({
  id: null,
  obj_id: null,
  status: "",
});
const route = useRoute();
onMounted(async () => {
  try {
    await sessionStore.fetchItems();
    await authStore.fetchUser();

    const user = authStore.user;
    if (!user) throw new Error("Không thể lấy thông tin người dùng");

    const projectId = route.params.id;
    const obj_id = user?.student?.id || user?.teacher?.id;
    await projectStore.findItem(projectId, obj_id, user.role);
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
});

watchEffect(() => {
  session.value = sessionStore.items;
  project.value = projectStore.item;
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
    propose: "bg-blue-100 text-blue-700 p-2 rounded",
    pending: "bg-yellow-100 text-yellow-700 p-2 rounded",
    approve: "bg-green-100 text-green-700 p-2 rounded",
    public: "bg-purple-100 text-purple-700 p-2 rounded",
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
</script>
