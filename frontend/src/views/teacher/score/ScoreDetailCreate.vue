<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Chọn phiếu đánh giá</h2>
    <Dropdown v-model="selectedForm" :options="form" optionLabel="title" placeholder="Chọn phiếu" class="w-1/4 mb-4" />

    <div v-if="selectedForm" class="w-full bg-white p-4 rounded-xl">
      <h3 class="text-lg font-semibold my-4">Bạn đã chọn: {{ selectedForm.title }}</h3>
      <div v-if="criteria && criteria.criteria && criteria.criteria.length">
        <DataTable :value="criteria.criteria" class="mb-4 w-full" responsiveLayout="stack">
          <Column field="name" header="Tên tiêu chí" style="width: 18%" />
          <Column field="content" header="Mô tả" style="width: 28%">
            <template #body="{ data }">
              <span v-html="safeHtml(data?.content)" />
            </template>
          </Column>
          <Column field="weightPercent" header="Trọng số (%)" style="width: 12%; text-align: center" />
          <Column field="max_score" header="Điểm tối đa" style="width: 12%; text-align: center" />
          <Column header="Điểm">
            <template #body="{ data }">
              <InputNumber v-model="scores[data.id]" :min="0" :max="data.max_score" :step="data.step" showButtons
                buttonLayout="horizontal" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
            </template>
          </Column>
          <Column header="Nhận xét" style="width: 32%">
            <template #body="{ data }">
              <InputText v-model="comments[data.id]" class="w-full" />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="text-right">
        <Button label="Lưu điểm" icon="pi pi-save" class="btn-submit" @click="openConfirmModal" :loading="loading" />
      </div>
    </div>
    <!-- Confirmation Modal -->
  </div>
  <Dialog v-model:visible="confirmVisible" modal header="Xác nhận lưu điểm" :closable="false">
    <div>
      <p class="mb-2 font-semibold">Bạn có chắc chắn muốn lưu các điểm sau?</p>
      <ul class="mb-2">
        <li v-for="c in criteria.criteria" :key="c.id" class="mb-1">
          <span class="font-semibold">{{ c.name }}: </span>
          <span>Điểm: {{ scores[c.id] ?? "Chưa nhập" }}</span>,
          <span>Nhận xét: {{ comments[c.id] || "..." }}</span>
        </li>
      </ul>
      <div v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Huỷ" @click="confirmVisible = false" severity="secondary" />
        <Button label="Xác nhận" icon="pi pi-check" @click="submitScores" :loading="loading" />
      </div>
    </div>
  </Dialog>
  <h1></h1>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useEvaluationStore, useScoreStore, useStudentStore } from "@/stores/store";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputNumber from "primevue/inputnumber";
import { Button, InputText } from "primevue";
import Dialog from "primevue/dialog";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import DOMPurify from "dompurify";

const evaluationStore = useEvaluationStore();
const scoreStore = useScoreStore();
const authStore = useAuthStore();
const studentStore = useStudentStore();
const route = useRoute();
const router = useRouter();

const studentId = ref(route.params.id);
const studentInfo = ref(null);
const groupId = ref(route.query.groupId);

const form = ref([]);
const selectedForm = ref(null);
const criteria = ref([]);
const scores = ref({});
const comments = ref({});
const loading = ref(false);
const confirmVisible = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  await evaluationStore.fetchItems();
  await studentStore.findItem(studentId.value);
  form.value = evaluationStore.items;
  studentInfo.value = studentStore.student;
});

watch(selectedForm, async (val) => {
  if (val && val.id) {
    await evaluationStore.findItem(val.id);
    criteria.value = evaluationStore.item;
    scores.value = {};
    comments.value = {};
    if (criteria.value && criteria.value.criteria) {
      criteria.value.criteria.forEach((c) => {
        scores.value[c.id] = null;
        comments.value[c.id] = "";
      });
    }
  } else {
    criteria.value = null;
    scores.value = {};
    comments.value = {};
  }
});

const getNestedValue = (obj, field) => {
  return field.split(".").reduce((acc, key) => acc?.[key], obj) || "N/A";
};

function openConfirmModal() {
  confirmVisible.value = true;
}

const safeHtml = (rawHtml) => {
  return DOMPurify.sanitize(rawHtml);
};

const submitScores = async () => {
  // Validate all scores are filled
  const missing = criteria.value?.criteria?.some(
    (c) =>
      scores.value[c.id] === null ||
      scores.value[c.id] === undefined ||
      scores.value[c.id] === ""
  );
  if (missing) {
    errorMessage.value = "Vui lòng nhập đầy đủ điểm cho tất cả tiêu chí.";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  try {
    const teacherId = authStore.user?.teacher?.id;
    let teacherType = null;
    if (groupId.value && teacherId) {
      teacherType = await scoreStore.fetchTeacherType(
        groupId.value,
        teacherId,
        route.params.type
      );
    }
    const scoreId = null; // TODO: Replace with actual logic to fetch or create score_id
    for (const c of criteria.value.criteria) {
      const scoreValue = scores.value[c.id];
      const comment = comments.value[c.id];
      if (scoreValue === null || scoreValue === undefined) continue;

      const scoreDetailData = {
        score_id: scoreId,
        teacher_id: teacherId,
        student_id: studentId.value,
        criteria_id: c.id,
        teacherType: teacherType?.teacherType || teacherType,
        scoreValue,
        comment,
      };
      await scoreStore.createScoreDetail(scoreDetailData,);
    }
    confirmVisible.value = false;
    router.push({ path: "/score" });
  } catch (err) {
    // handle error
  } finally {
    loading.value = false;
  }
};
</script>
