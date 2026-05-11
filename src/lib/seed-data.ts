import dbConnect from './mongodb';
import { Department, Position } from '@/models/Department';

const seedData = [
  {
    name: 'Ban Giám đốc',
    code: 'BGD',
    description: 'Ban điều hành và quản lý cấp cao',
    positions: [
      { name: 'Giám đốc', code: 'GD' },
      { name: 'Phó Giám đốc', code: 'PGD' },
    ],
  },
  {
    name: 'Phòng Hành chính - Nhân sự',
    code: 'HCNS',
    description: 'Quản lý nhân sự và các công việc hành chính',
    positions: [
      { name: 'Trưởng phòng HCNS', code: 'TP_HCNS' },
      { name: 'Chuyên viên nhân sự', code: 'CV_NS' },
    ],
  },
  {
    name: 'Phòng Kế toán',
    code: 'KT',
    description: 'Quản lý tài chính và kế toán',
    positions: [
      { name: 'Kế toán trưởng', code: 'KTT' },
      { name: 'Kế toán viên', code: 'KTV' },
    ],
  },
  {
    name: 'Phòng Kinh doanh',
    code: 'KD',
    description: 'Phát triển kinh doanh và bán hàng',
    positions: [
      { name: 'Trưởng phòng kinh doanh', code: 'TP_KD' },
      { name: 'Nhân viên kinh doanh', code: 'NV_KD' },
    ],
  },
  {
    name: 'Phòng Kỹ thuật',
    code: 'TECH',
    description: 'Phát triển sản phẩm và hỗ trợ kỹ thuật',
    positions: [
      { name: 'Trưởng phòng kỹ thuật', code: 'TP_KT' },
      { name: 'Lập trình viên', code: 'LTV' },
      { name: 'Kỹ thuật viên', code: 'KTV_TECH' },
    ],
  },
  {
    name: 'Phòng Marketing',
    code: 'MKT',
    description: 'Tiếp thị và truyền thông',
    positions: [
      { name: 'Trưởng phòng Marketing', code: 'TP_MKT' },
      { name: 'Chuyên viên Marketing', code: 'CV_MKT' },
    ],
  },
];

export async function seedDepartments() {
  await dbConnect();

  for (const dept of seedData) {
    // Check if department already exists
    let department = await Department.findOne({ code: dept.code });
    
    if (!department) {
      department = await Department.create({
        name: dept.name,
        code: dept.code,
        description: dept.description,
      });
      console.log(`Created department: ${dept.name}`);
    } else {
      console.log(`Department ${dept.name} already exists`);
    }

    // Seed positions for this department
    for (const pos of dept.positions) {
      const positionExists = await Position.findOne({ code: pos.code });
      if (!positionExists) {
        await Position.create({
          name: pos.name,
          code: pos.code,
          departmentId: department._id,
        });
        console.log(`  Created position: ${pos.name}`);
      } else {
        console.log(`  Position ${pos.name} already exists`);
      }
    }
  }

  return { message: 'Seeding completed successfully' };
}
