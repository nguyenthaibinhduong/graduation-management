<template>
    <div class="flex min-h-screen  text-gray-800">
        <!-- Sidebar -->

        <!-- Main Content -->
        <div class="flex-1 p-6">



            <h1 class="text-3xl font-bold mb-4 text-center title">Dashboard</h1>
            <p class="text-gray-600 mb-4 text-center">Chào mừng bạn đến với trang tổng quan của hệ thống quản lý khóa
                luận.</p>
            <div class="w-full grid grid-cols-1">
                <Card>
                    <template #content>
                        <div class="flex justify-center items-center mb-6">
                            <h1 class="text-2xl font-bold title text-center py-3">
                                Thống kê khóa luận tốt nghiệp
                            </h1>
                        </div>
                        <div class="grid grid-cols-3 gap-6">
                            <!-- Tổng Quan -->
                            <div class="bg-white p-4 rounded-lg shadow">
                                <h2 class="text-lg font-semibold mb-4">
                                    Tổng Quan
                                </h2>
                                <div class="text-5xl font-bold">
                                    120
                                </div>
                                <div class="text-gray-500">
                                    Tổng Số Khóa Luận
                                </div>
                                <div class="text-5xl font-bold mt-8">
                                    30
                                </div>
                                <div class="text-gray-500">
                                    Đang Thực Hiện
                                </div>
                                <div class="text-5xl font-bold mt-8">
                                    15
                                </div>
                                <div class="text-gray-500">
                                    Chưa Bảo Vệ
                                </div>
                                <div class="text-5xl font-bold mt-8">
                                    1
                                </div>
                                <div class="text-gray-500">
                                    Không Đạt
                                </div>
                            </div>
                            <!-- Trạng Thái Khóa Luận -->
                            <div class="bg-white p-4 rounded-lg shadow">
                                <h2 class="text-lg font-semibold mb-4">
                                    Trạng Thái Khóa Luận
                                </h2>
                                <div class="flex justify-center items-center">
                                    <img alt="Pie chart showing the status of theses" height="150"
                                        src="https://storage.googleapis.com/a1aa/image/vPeQXg2-1bHc8T15TAjIVjWVq3yQ7mIQAHeLkhVIIFA.jpg"
                                        width="100%" />
                                </div>
                                <div class="mt-4">
                                    <div class="flex items-center">
                                        <div class="w-4 h-4 bg-blue-500 mr-2">
                                        </div>
                                        <div>
                                            Đã Bảo Vệ
                                        </div>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <div class="w-4 h-4 bg-green-500 mr-2">
                                        </div>
                                        <div>
                                            Dạng Thực Hiện
                                        </div>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <div class="w-4 h-4 bg-red-500 mr-2">
                                        </div>
                                        <div>
                                            Không Đạt
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Phân Bố Điểm Số -->
                            <div class="bg-white p-4 rounded-lg shadow">
                                <h2 class="text-lg font-semibold mb-4">
                                    Phân Bố Điểm Số
                                </h2>
                                <div class="flex justify-center items-center">
                                    <img alt="Bar chart showing the distribution of scores" height="150"
                                        src="https://storage.googleapis.com/a1aa/image/RIm-pP2PCvnAfySriquvIW1MpkFf014swlX37DGwS3w.jpg"
                                        width="100%" />
                                </div>
                            </div>

                        </div>
                        <div class="grid grid-cols-2 gap-6 mt-5">

                            <!-- Danh Sách Khóa Luận -->
                            <div class="bg-white p-4 rounded-lg shadow">
                                <h2 class="text-lg font-semibold mb-4">
                                    Danh Sách Khóa Luận
                                </h2>
                                <table class="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th class="pb-2">
                                                Tiêu Đề
                                            </th>
                                            <th class="pb-2">
                                                Lĩnh Vực
                                            </th>
                                            <th class="pb-2">
                                                Điểm Số
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="py-2">
                                                Xây dựng ứng dụng web quản lý...
                                            </td>
                                            <td class="py-2">
                                                Công Nghệ Thông Tin
                                            </td>
                                            <td class="py-2">
                                                8.5
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="py-2">
                                                Phân tích thị trường chứng khoán v
                                            </td>
                                            <td class="py-2">
                                                Kinh Tế
                                            </td>
                                            <td class="py-2">
                                                7.8
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="py-2">
                                                Thiết kế hệ thống điều khiển tự độ...
                                            </td>
                                            <td class="py-2">
                                                Kỹ Thuật
                                            </td>
                                            <td class="py-2">
                                                8.0
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="py-2">
                                                Nghiên cứu văn hóa doanh nghiệp t...
                                            </td>
                                            <td class="py-2">
                                                Xã Hội Học
                                            </td>
                                            <td class="py-2">
                                                8.7
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="py-2">
                                                Giảng dạy tiếng Anh cho người lớ...
                                            </td>
                                            <td class="py-2">
                                                Ngôn Ngữ
                                            </td>
                                            <td class="py-2">
                                                9.1
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <!-- Khóa Luận Theo Lĩnh Vực -->
                            <div class="bg-white p-4 rounded-lg shadow">
                                <h2 class="text-lg font-semibold mb-4">
                                    Khóa Luận Theo Lĩnh Vực
                                </h2>
                                <div class="flex justify-center items-center">
                                    <img alt="Pie chart showing the distribution of theses by field" height="150"
                                        src="https://storage.googleapis.com/a1aa/image/HL2DT96TiyOuo3UQg6dNaRzZbuxyNvO-xWI4K1w18ak.jpg"
                                        width="100%" />
                                </div>
                                <div class="mt-4">
                                    <div class="flex items-center">
                                        <div class="w-4 h-4 bg-blue-500 mr-2">
                                        </div>
                                        <div>
                                            Công Nghệ Thông Tin
                                        </div>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <div class="w-4 h-4 bg-green-500 mr-2">
                                        </div>
                                        <div>
                                            Kinh Tế
                                        </div>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <div class="w-4 h-4 bg-orange-500 mr-2">
                                        </div>
                                        <div>
                                            Kỹ Thuật
                                        </div>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <div class="w-4 h-4 bg-red-500 mr-2">
                                        </div>
                                        <div>
                                            Xã Hội Học
                                        </div>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <div class="w-4 h-4 bg-yellow-500 mr-2">
                                        </div>
                                        <div>
                                            Ngôn Ngữ
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </template>

                </Card>
            </div>

        </div>
    </div>
</template>

<script setup>
import Card from 'primevue/card'




</script>
