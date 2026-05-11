import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  managerId?: mongoose.Types.ObjectId;
}

const DepartmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

export const Department = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

export interface IPosition extends Document {
  name: string;
  code: string;
  departmentId: mongoose.Types.ObjectId;
}

const PositionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  },
  { timestamps: true }
);

export const Position = mongoose.models.Position || mongoose.model<IPosition>('Position', PositionSchema);
