import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeCode: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'Nam' | 'Nữ' | 'Khác';
  idCard: string;
  avatar?: string;
  email: string;
  phone: string;
  address: string;
  currentAddress?: string;
  educationLevel?: 'THPT' | 'Cao đẳng' | 'Đại học' | 'Thạc sĩ' | 'Tiến sĩ' | 'Khác';
  departmentId: mongoose.Types.ObjectId;
  positionId: mongoose.Types.ObjectId;
  joinDate: Date;
  contractType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  status: 'Đang làm việc' | 'Đã nghỉ';
  baseSalary: number;
  bankAccount?: string;
  taxId?: string;
}

const EmployeeSchema: Schema = new Schema(
  {
    employeeCode: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], required: true },
    idCard: { type: String, required: true, unique: true },
    avatar: { type: String },
    
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    currentAddress: { type: String },
    educationLevel: {
      type: String,
      enum: ['THPT', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ', 'Khác'],
    },
    
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    positionId: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
    joinDate: { type: Date, required: true },
    contractType: { 
      type: String, 
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Đang làm việc', 'Đã nghỉ'], 
      default: 'Đang làm việc' 
    },
    
    baseSalary: { type: Number, required: true },
    bankAccount: { type: String },
    taxId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
