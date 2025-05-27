<template>
    <div class="p-4">
        <h1 class="text-3xl font-bold mb-4 text-center title">Dashboard</h1>
        <p class="text-gray-600 mb-4 text-center">Chào mừng bạn đến với trang tổng quan của hệ thống quản lý khóa
            luận.</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="bar" :data="barStudentData" :options="chartOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="bar" :data="horizontalBarData" :options="horizontalOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="line" :data="lineData1" :options="chartOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="line" :data="lineData2" :options="chartOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="radar" :data="radarData" :options="chartOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="doughnut" :data="doughnutData" :options="chartOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="scatter" :data="scatterData" :options="scatterOptions" />
            </div>
            <div class="bg-white p-4 rounded-xl ">
                <Chart type="pie" :data="pieData" :options="chartOptions" />
            </div>
        </div>
    </div>

</template>

<script setup>
import { Chart } from 'vue-chartjs'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    LineElement,
    PointElement,
    RadialLinearScale
} from 'chart.js'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useAnalystStore } from '@/stores/store'
import { watchWithFilter } from '@vueuse/core'


ChartJS.register(
    Title, Tooltip, Legend,
    BarElement, CategoryScale, LinearScale,
    ArcElement, LineElement, PointElement, RadialLinearScale
)

const analysStore = useAnalystStore()

onMounted(async () => {
    await analysStore.fetchItems()
});
const data = ref()
const labelsDepartment = ref()
const dataStudentCount = ref()

const labelsTeacher = ref()
const projectCount = ref()
watchEffect(() => {
    data.value = analysStore.items
    if (data.value && data.value.countPeopleDepartment) {
        labelsDepartment.value = data.value.countPeopleDepartment.map(item => item.name);
    }
    if (data.value && data.value.countPeopleDepartment) {
        dataStudentCount.value = data.value.countPeopleDepartment.map(item => item.studentCount);
    }
    if (data.value && data.value.projectsByTeacher) {
        labelsTeacher.value = data.value.projectsByTeacher.map(item => item.name);
    }
    if (data.value && data.value.countPeopleDepartment) {
        projectCount.value = data.value.projectsByTeacher.map(item => item.projectCount);
    }
    console.log(labelsTeacher.value);


});


const barStudentData = computed(() => ({
    labels: labelsDepartment.value,
    datasets: [
        {
            label: 'Số SV làm khóa luận',
            backgroundColor: '#42A5F5',
            data: dataStudentCount.value,
            borderRadius: 6
        }
    ]
}));

const horizontalBarData = computed(() => ({
    labels: labelsTeacher.value || ['Giảng viên 1', 'Giảng viên 2', 'Giảng viên 3'],
    datasets: [{
        label: 'Số đề tài hướng dẫn',
        data: projectCount.value || [5, 3, 8],
        backgroundColor: '#7E57C2',
        borderRadius: 6
    }]
}))

// Biểu đồ tròn
const pieData = {
    labels: ['Hoàn thành', 'Chưa nộp', 'Đang làm'],
    datasets: [{
        data: [40, 10, 50],
        backgroundColor: ['#66BB6A', '#FFA726', '#42A5F5'],
        hoverOffset: 10
    }]
}

// Biểu đồ đường – theo năm
const lineData1 = {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    datasets: [{
        label: 'Số SV đăng ký',
        data: [80, 90, 100, 110, 95],
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66,165,245,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#42A5F5'
    }]
}

// Biểu đồ đường – điểm TB theo khoa
const lineData2 = {
    labels: ['CNTT', 'Kinh tế', 'Ngôn ngữ', 'Quản trị', 'Tài chính'],
    datasets: [{
        label: 'Điểm trung bình',
        data: [8.2, 7.5, 7.9, 8.0, 7.4],
        borderColor: '#FFA726',
        backgroundColor: 'rgba(255,167,38,0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFA726'
    }]
}

// Biểu đồ radar – đánh giá tiêu chí
const radarData = {
    labels: ['Tính sáng tạo', 'Tính ứng dụng', 'Trình bày', 'Nội dung', 'Kỹ năng báo cáo'],
    datasets: [{
        label: 'Mức đánh giá (1-10)',
        backgroundColor: 'rgba(66,165,245,0.2)',
        borderColor: '#42A5F5',
        pointBackgroundColor: '#42A5F5',
        data: [8, 7, 9, 8.5, 7.5]
    }]
}
const radarOptions = {
    responsive: true,
    scales: {
        r: {
            angleLines: { color: '#E5E7EB' },
            grid: { color: '#E5E7EB' },
            pointLabels: {
                font: { size: 13 },
                color: '#374151'
            },
            ticks: {
                stepSize: 2,
                min: 0,
                max: 10,
                backdropColor: 'transparent'
            }
        }
    },
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { size: 14, family: "'Inter', sans-serif" },
                color: '#374151'
            }
        }
    }
}

// Biểu đồ thanh ngang – đề tài theo giảng viên

const horizontalOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { size: 14 },
                color: '#374151'
            }
        }
    },
    scales: {
        x: {
            ticks: {
                font: { size: 13 },
                color: '#6B7280'
            },
            grid: { color: '#E5E7EB' }
        },
        y: {
            ticks: {
                font: { size: 13 },
                color: '#6B7280'
            },
            grid: { color: '#E5E7EB' }
        }
    }
}

// Biểu đồ doughnut – lĩnh vực
const doughnutData = {
    labels: ['AI', 'Blockchain', 'Tài chính', 'Logistics', 'Ngôn ngữ'],
    datasets: [{
        data: [20, 15, 25, 10, 30],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26A69A'],
        hoverOffset: 10
    }]
}

// Biểu đồ phân tán – thời gian hoàn thành vs. điểm
const scatterData = {
    datasets: [{
        label: 'Thời gian vs. Điểm',
        data: [
            { x: 4, y: 9.0 },
            { x: 5, y: 8.5 },
            { x: 6, y: 7.5 },
            { x: 4, y: 8.2 },
            { x: 7, y: 7.0 }
        ],
        backgroundColor: '#EC407A'
    }]
}
const scatterOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { size: 14 },
                color: '#374151'
            }
        }
    },
    scales: {
        x: {
            title: { display: true, text: 'Thời gian (tháng)' },
            ticks: { font: { size: 13 }, color: '#6B7280' },
            grid: { color: '#E5E7EB' }
        },
        y: {
            title: { display: true, text: 'Điểm số' },
            min: 0,
            max: 10,
            ticks: { font: { size: 13 }, color: '#6B7280' },
            grid: { color: '#E5E7EB' }
        }
    }
}

// Tùy chọn chung cho bar, line, doughnut,...
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 14,
                    family: "'Inter', sans-serif"
                },
                color: '#374151'
            }
        },
        tooltip: {
            backgroundColor: '#111827',
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
        },
        title: {
            display: false
        }
    },
    scales: {
        x: {
            ticks: {
                font: { size: 13 },
                color: '#6B7280'
            },
            grid: {
                color: '#E5E7EB'
            }
        },
        y: {
            ticks: {
                font: { size: 13 },
                color: '#6B7280'
            },
            grid: {
                color: '#E5E7EB'
            }
        }
    }
}
</script>


<style scoped>
.chart-wrapper {
    padding: 1rem;
}
</style>
