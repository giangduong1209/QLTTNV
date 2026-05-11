import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { Department, Position } from '@/models/Department';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

// ─── Dữ liệu mẫu Việt Nam ────────────────────────────────────────────────────

const hoList = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const tenDemNam = ['Văn', 'Đình', 'Minh', 'Quốc', 'Hữu', 'Đức', 'Công', 'Tuấn', 'Thanh', 'Xuân'];
const tenDemNu = ['Thị', 'Ngọc', 'Thanh', 'Thu', 'Hương', 'Lan', 'Mai', 'Bích', 'Phương', 'Hồng'];
const tenNam = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khoa', 'Long', 'Minh', 'Nam', 'Phong', 'Quân', 'Sơn', 'Thành', 'Tùng', 'Việt', 'Khải', 'Nhật', 'Hải', 'Hoàng', 'Lâm'];
const tenNu = ['Anh', 'Bảo', 'Chi', 'Diệu', 'Hà', 'Khánh', 'Linh', 'My', 'Ngân', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Uyên', 'Vân', 'Yến', 'Hương', 'Nhi', 'Trâm', 'Ly'];

const cities = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Quy Nhơn',
];

const streets = [
  'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Đinh Tiên Hoàng',
  'Lý Thường Kiệt', 'Phan Đình Phùng', 'Hoàng Diệu', 'Bạch Đằng', 'Hùng Vương',
  'Ngô Quyền', 'Trần Phú', 'Điện Biên Phủ', 'Lê Duẩn', 'Nguyễn Trãi',
];

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

const educationLevels: Array<'THPT' | 'Cao đẳng' | 'Đại học' | 'Thạc sĩ' | 'Tiến sĩ' | 'Khác'> = ['THPT', 'Cao đẳng', 'Đại học', 'Đại học', 'Đại học', 'Thạc sĩ', 'Tiến sĩ', 'Khác'];
const contractTypes: Array<'Full-time' | 'Part-time' | 'Contract' | 'Internship'> = ['Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract', 'Internship'];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  const prefixes = ['032', '033', '034', '035', '036', '038', '039', '070', '076', '077', '078', '079', '086', '089', '090', '091', '094', '096', '097', '098'];
  return rand(prefixes) + Array.from({ length: 7 }, () => randomInt(0, 9)).join('');
}

function generateIdCard(): string {
  return Array.from({ length: 12 }, () => randomInt(0, 9)).join('');
}

function generateDate(startYear: number, endYear: number): Date {
  const year = randomInt(startYear, endYear);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return new Date(year, month - 1, day);
}

function generateBankAccount(): string {
  const bankPrefixes = ['970415', '970407', '970422', '970436', '970418', '970432'];
  return rand(bankPrefixes) + Array.from({ length: 9 }, () => randomInt(0, 9)).join('');
}

function generateTaxId(): string {
  return Array.from({ length: 10 }, () => randomInt(0, 9)).join('');
}

// ─── Seed Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await dbConnect();

    // 1. Xóa dữ liệu cũ
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Position.deleteMany({});
    await User.deleteMany({ username: 'admin' }); // Reset admin user specifically or all if preferred

    // 1.5. Tạo tài khoản admin mặc định
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@company.com',
      passwordHash: adminPasswordHash,
      role: 'Admin',
    });

    // 2. Tạo phòng ban và chức vụ
    const deptDocs: any[] = [];
    const posDocs: any[] = [];

    for (const dept of departments) {
      const deptDoc = await Department.create({
        name: dept.name,
        code: dept.code,
        description: `Phòng ${dept.name} – quản lý các hoạt động liên quan`,
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

    // 3. Tạo 500 nhân viên
    const employees: any[] = [];
    const usedIdCards = new Set<string>();
    const usedEmails = new Set<string>();
    const usedPhones = new Set<string>();
    const salaryMap: Record<string, [number, number]> = {
      KT: [12000000, 35000000],
      KD: [8000000, 25000000],
      NS: [8000000, 20000000],
      KT2: [10000000, 22000000],
      MKT: [9000000, 22000000],
      HC: [7000000, 15000000],
      IT: [12000000, 40000000],
      SX: [6000000, 15000000],
      LOG: [6000000, 14000000],
      PL: [12000000, 30000000],
    };

    for (let i = 1; i <= 500; i++) {
      const isNam = Math.random() > 0.45;
      const gender: 'Nam' | 'Nữ' = isNam ? 'Nam' : 'Nữ';
      const ho = rand(hoList);
      const tenDem = isNam ? rand(tenDemNam) : rand(tenDemNu);
      const ten = isNam ? rand(tenNam) : rand(tenNu);
      const fullName = `${ho} ${tenDem} ${ten}`;

      // Chọn phòng ban ngẫu nhiên
      const dept = deptDocs[randomInt(0, deptDocs.length - 1)];
      const deptCode = departments.find(d => d.name === dept.name)?.code || 'KT';
      const posPool = posDocs.filter(p => String(p.deptId) === String(dept._id));
      const pos = rand(posPool);

      // Sinh CCCD unique
      let idCard = generateIdCard();
      while (usedIdCards.has(idCard)) idCard = generateIdCard();
      usedIdCards.add(idCard);

      // Sinh email unique
      const emailBase = `${ho.toLowerCase().replace(/\s/g, '')}.${ten.toLowerCase()}${i}`;
      const emailDomains = ['gmail.com', 'yahoo.com', 'company.vn', 'outlook.com'];
      let email = `${emailBase}@${rand(emailDomains)}`;
      while (usedEmails.has(email)) email = `${emailBase}${randomInt(1, 99)}@${rand(emailDomains)}`;
      usedEmails.add(email);

      // Sinh SĐT unique
      let phone = generatePhone();
      while (usedPhones.has(phone)) phone = generatePhone();
      usedPhones.add(phone);

      const city = rand(cities);
      const street = rand(streets);
      const houseNum = randomInt(1, 999);
      const address = `${houseNum} ${street}, ${city}`;
      const currentAddress = Math.random() > 0.3 ? address : `${randomInt(1, 200)} ${rand(streets)}, ${rand(cities)}`;

      const salaryRange = salaryMap[deptCode] || [8000000, 20000000];
      const baseSalary = Math.round(randomInt(salaryRange[0], salaryRange[1]) / 500000) * 500000;

      const joinYear = randomInt(2015, 2025);
      const joinDate = generateDate(joinYear, joinYear);
      const dob = generateDate(1975, 2000);

      const statusRoll = Math.random();
      const status: 'Đang làm việc' | 'Đã nghỉ' = statusRoll > 0.12 ? 'Đang làm việc' : 'Đã nghỉ';

      employees.push({
        employeeCode: `NV${String(i).padStart(4, '0')}`,
        fullName,
        dateOfBirth: dob,
        gender,
        idCard,
        email,
        phone,
        address,
        currentAddress,
        educationLevel: rand(educationLevels),
        departmentId: dept._id,
        positionId: pos._id,
        joinDate,
        contractType: rand(contractTypes),
        status,
        baseSalary,
        bankAccount: generateBankAccount(),
        taxId: generateTaxId(),
      });
    }

    // Insert theo batch để tránh timeout
    const BATCH_SIZE = 50;
    let inserted = 0;
    for (let b = 0; b < employees.length; b += BATCH_SIZE) {
      await Employee.insertMany(employees.slice(b, b + BATCH_SIZE));
      inserted += Math.min(BATCH_SIZE, employees.length - b);
    }

    return NextResponse.json({
      success: true,
      message: `✅ Đã tạo thành công ${inserted} nhân viên, ${deptDocs.length} phòng ban, và ${posDocs.length} chức vụ.`,
      stats: {
        employees: inserted,
        departments: deptDocs.length,
        positions: posDocs.length,
      },
    });
  } catch (error: any) {
    console.error('[SEED ERROR]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET – trả về trạng thái hiện tại
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
