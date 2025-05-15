<template>
    <div class="space-y-6 p-4">

        <!-- THÔNG TIN SINH VIÊN -->
        <div class="bg-gray-50 p-4 rounded-md border space-y-2">
            <h2 class="font-semibold text-lg">Thông tin sinh viên</h2>
            <MyInput title="Họ tên" :modelValue="student.fullname" readonly />
            <MyInput title="MSSV" :modelValue="student.studentId" readonly />
            <MyInput title="Lớp" :modelValue="student.class" readonly />
        </div>

        <!-- FORM CHẤM ĐIỂM -->
        <div class="bg-white p-4 rounded-md border space-y-4">
            <h2 class="font-semibold text-lg">Tiêu chí chấm điểm</h2>
            <MyInput v-for="(criteria, index) in scoreForm" :key="criteria.id" :title="criteria.title" type="number"
                v-model.number="criteria.score" :min="0" :max="criteria.max" @change="calculateAverage" />
        </div>

        <!-- NHẬN XÉT -->
        <div class="bg-white p-4 rounded-md border space-y-4">
            <h2 class="font-semibold text-lg">Nhận xét</h2>
            <MyInput title="Đánh giá của giảng viên" type="editor" v-model="comment" />
        </div>

        <!-- KẾT QUẢ TỔNG KẾT -->
        <div class="bg-white p-4 rounded-md border space-y-2">
            <h2 class="font-semibold text-lg">Kết quả</h2>
            <p><strong>Điểm trung bình:</strong> {{ averageScore.toFixed(2) }}</p>
            <p><strong>Xếp loại:</strong> {{ getGradeLabel(averageScore) }}</p>
        </div>

        <!-- NÚT LƯU -->
        <div class="text-right">
            <Button label="Lưu điểm" icon="pi pi-save" class="btn-submit" @click="onSave" />
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import MyInput from '@/components/form/MyInput.vue'
import { Button } from 'primevue'

// Dữ liệu sinh viên
const student = reactive({
    fullname: 'Nguyễn Văn A',
    studentId: '123456',
    class: 'DHKTPM17A',
})

// Tiêu chí chấm điểm
const scoreForm = reactive([
    { id: 1, title: 'Hiểu biết chuyên môn', score: 0, max: 10 },
    { id: 2, title: 'Kỹ năng trình bày', score: 0, max: 10 },
    { id: 3, title: 'Tư duy phản biện', score: 0, max: 10 },
    { id: 4, title: 'Tinh thần hợp tác', score: 0, max: 10 },
])

// Nhận xét
const comment = ref('')

// Điểm trung bình
const averageScore = computed(() => {
    const total = scoreForm.reduce((sum, c) => sum + Number(c.score), 0)
    return scoreForm.length ? total / scoreForm.length : 0
})

// Xếp loại
const getGradeLabel = (score) => {
    if (score >= 9) return 'Xuất sắc'
    if (score >= 8) return 'Giỏi'
    if (score >= 7) return 'Khá'
    if (score >= 5) return 'Trung bình'
    return 'Yếu'
}

// Lưu điểm
const onSave = () => {
    const data = {
        student,
        scores: scoreForm.map(c => ({ title: c.title, score: c.score })),
        average: averageScore.value,
        grade: getGradeLabel(averageScore.value),
        comment: comment.value,
    }
    console.log('Dữ liệu lưu:', data)
    alert('Lưu thành công!')
}
</script>

<style scoped>
.btn-submit {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 6px;
}
</style>
