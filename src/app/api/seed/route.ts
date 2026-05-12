import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { Department, Position } from '@/models/Department';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

const departments = [
  { name: 'Phòng Kỹ thuật', code: 'KT', positions: ['Kỹ sư phần mềm', 'Kỹ sư hệ thống', 'Kỹ sư QA', 'Trưởng phòng kỹ thuật', 'Lập trình viên Backend', 'Lập trình viên Frontend'] },
  { name: 'Phòng Kinh doanh', code: 'KD', positions: ['Nhân viên kinh doanh', 'Trưởng nhóm kinh doanh', 'Giám đốc kinh doanh', 'Chuyên viên tư vấn', 'Nhân viên telesales'] },
  { name: 'Phòng Nhân sự', code: 'NS', positions: ['Chuyên viên nhân sự', 'Trưởng phòng nhân sự', 'Nhân viên tuyển dụng', 'Chuyên viên đào tạo', 'Nhân viên C&B'] },
  { name: 'Phòng Kế toán', code: 'KT2', positions: ['Kế toán viên', 'Kế toán trưởng', 'Nhân viên kiểm toán', 'Chuyên viên tài chính', 'Kế toán thuế'] },
  { name: 'Phòng Marketing', code: 'MKT', positions: ['Nhân viên Marketing', 'Chuyên viên Content', 'Trưởng phòng Marketing', 'Designer', 'SEO Specialist'] },
  { name: 'Phòng Hành chính', code: 'HC', positions: ['Nhân viên hành chính', 'Thư ký', 'Trưởng phòng hành chính', 'Lễ tân', 'Nhân viên văn phòng'] },
  { name: 'Phòng IT', code: 'IT', positions: ['Quản trị mạng', 'Chuyên viên bảo mật', 'Kỹ thuật viên IT', 'Trưởng phòng IT', 'DBA', 'DevOps Engineer'] },
  { name: 'Phòng Sản xuất', code: 'SX', positions: ['Công nhân sản xuất', 'Tổ trưởng sản xuất', 'Quản đốc', 'Kỹ sư sản xuất', 'Nhân viên kiểm tra chất lượng'] },
  { name: 'Phòng Logistics', code: 'LOG', positions: ['Nhân viên kho', 'Tài xế', 'Quản lý kho', 'Nhân viên xuất nhập khẩu', 'Điều phối viên'] },
  { name: 'Phòng Pháp lý', code: 'PL', positions: ['Chuyên viên pháp lý', 'Luật sư nội bộ', 'Trưởng phòng pháp lý', 'Nhân viên tuân thủ'] },
];

export async function POST(request: Request) {
  try {
    await dbConnect();

    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Position.deleteMany({});
    await User.deleteMany({ username: 'admin' });

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@company.com',
      passwordHash: adminPasswordHash,
      role: 'Admin',
    });

    const deptDocs: any[] = [];
    const posDocs: any[] = [];

    for (const dept of departments) {
      const deptDoc = await Department.create({
        name: dept.name,
        code: dept.code,
        description: `Phòng ${dept.name}`,
      });
      deptDocs.push(deptDoc);

      for (let i = 0; i < dept.positions.length; i++) {
        const posDoc = await Position.create({
          name: dept.positions[i],
          code: `${dept.code}_POS${String(i + 1).padStart(2, '0')}`,
          departmentId: deptDoc._id,
        });
        posDocs.push({ ...posDoc.toObject(), deptId: deptDoc._id });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo thành công ${deptDocs.length} phòng ban, ${posDocs.length} chức vụ.`,
      stats: {
        employees: 0,
        departments: deptDocs.length,
        positions: posDocs.length,
      },
    });
  } catch (error: any) {

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const [empCount, deptCount, posCount] = await Promise.all([
      Employee.countDocuments(),
      Department.countDocuments(),
      Position.countDocuments(),
    ]);
    return NextResponse.json({ employees: empCount, departments: deptCount, positions: posCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
