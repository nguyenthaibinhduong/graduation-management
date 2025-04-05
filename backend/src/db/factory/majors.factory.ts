import { Major } from 'src/entities/major.entity';
import { Department } from 'src/entities/department.entity';

const departmentNames = [
  'Khoa Công nghệ thông tin',
  'Khoa Kinh tế',
  'Khoa Du lịch',
  'Khoa Ngôn ngữ',
  'Khoa Y Dược'
];

const majorNames = [
  'Kỹ thuật phần mềm',
  'Hệ thống thông tin',
  'Quản trị kinh doanh',
  'Marketing',
  'Du lịch & Lữ hành',
  'Tiếng Anh thương mại',
  'Y học cổ truyền',
  'Dược học',
  'Tài chính ngân hàng',
  'Kế toán',
  'Kiểm toán',
  'Quan hệ công chúng',
  'Quản trị khách sạn',
  'Thiết kế đồ họa',
  'Kỹ thuật điện tử',
  'Công nghệ thực phẩm',
  'Vật lý trị liệu',
  'Quản trị nhân sự',
  'Công nghệ sinh học',
  'Luật kinh tế'
];

// Hàm tạo mã ngẫu nhiên gồm 6 chữ số
function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class DepartmentFactory {
  static createMany(): Department[] {
    return departmentNames.map(name => {
      const department = new Department();
      department.code = generateRandomCode();
      department.name = name;
      return department;
    });
  }
}

export class MajorFactory {
  static createMany(departments: Department[]): Major[] {
    return majorNames.map(name => {
      const major = new Major();
      major.code = generateRandomCode();
      major.name = name;
      major.department = departments[Math.floor(Math.random() * departments.length)];
      return major;
    });
  }
}
