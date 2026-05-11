import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Manager' | 'Staff';
  employeeId?: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Staff'], default: 'Staff' },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
