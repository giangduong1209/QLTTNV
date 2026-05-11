"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

const EDUCATION_LEVELS = ["THPT", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ", "Khác"];

const fieldClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500";

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    employeeCode: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    idCard: "",
    email: "",
    phone: "",
    address: "",
    currentAddress: "",
    educationLevel: "",
    departmentId: "",
    positionId: "",
    joinDate: "",
    contractType: "",
    baseSalary: "",
    status: "",
  });

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data.departments || []);
        setPositions(data.positions || []);
      })
      .catch(console.error);

    fetch(`/api/employees/${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Không tìm thấy nhân viên");
          router.push("/employees");
          return;
        }
        const formatDate = (d: string) => (d ? new Date(d).toISOString().split("T")[0] : "");
        setFormData({
          employeeCode: data.employeeCode || "",
          fullName: data.fullName || "",
          dateOfBirth: formatDate(data.dateOfBirth),
          gender: data.gender || "",
          idCard: data.idCard || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          currentAddress: data.currentAddress || "",
          educationLevel: data.educationLevel || "",
          departmentId: data.departmentId?._id || data.departmentId || "",
          positionId: data.positionId?._id || data.positionId || "",
          joinDate: formatDate(data.joinDate),
          contractType: data.contractType || "",
          baseSalary: data.baseSalary || "",
          status: data.status || "Đang làm việc",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [employeeId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate age (must be 18+ at join date)
    if (formData.dateOfBirth && formData.joinDate) {
      const dob = new Date(formData.dateOfBirth);
      const join = new Date(formData.joinDate);
      const ageAtJoin = new Date(dob);
      ageAtJoin.setFullYear(ageAtJoin.getFullYear() + 18);
      
      if (join < ageAtJoin) {
        toast.error("Nhân viên phải từ 18 tuổi trở lên tính đến ngày vào làm.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
        router.push("/employees");
      } else {
        const err = await res.json();
        toast.error(`Lỗi: ${err.error || "Không thể cập nhật"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi hệ thống.");
    } finally {
      setSaving(false);
    }
  };

  const filteredPositions = positions.filter((p) => p.departmentId === formData.departmentId);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employees" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{formData.fullName}</h1>
            <p className="text-sm text-gray-500">{formData.employeeCode}</p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên *</label>
              <input disabled={!isEditing} type="text" name="employeeCode" value={formData.employeeCode} onChange={handleChange} className={fieldClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input disabled={!isEditing} type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={fieldClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
              <input disabled={!isEditing} type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={fieldClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính *</label>
              <select disabled={!isEditing} name="gender" value={formData.gender} onChange={handleChange} className={fieldClass} required>
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số CMND/CCCD *</label>
              <input disabled={!isEditing} type="text" name="idCard" value={formData.idCard} onChange={handleChange} className={fieldClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ học vấn</label>
              <select disabled={!isEditing} name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={fieldClass}>
                <option value="">Chọn trình độ</option>
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
            Thông tin liên hệ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email công việc *</label>
              <input disabled={!isEditing} type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input disabled={!isEditing} type="tel" name="phone" value={formData.phone} onChange={handleChange} className={fieldClass} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú *</label>
              <input disabled={!isEditing} type="text" name="address" value={formData.address} onChange={handleChange} className={fieldClass} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nơi ở hiện tại</label>
              <input disabled={!isEditing} type="text" name="currentAddress" value={formData.currentAddress} onChange={handleChange} className={fieldClass} placeholder="Để trống nếu giống địa chỉ thường trú" />
            </div>
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">
            Thông tin công việc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban *</label>
              <select disabled={!isEditing} name="departmentId" value={formData.departmentId} onChange={handleChange} className={fieldClass} required>
                <option value="">Chọn phòng ban</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ *</label>
              <select disabled={!isEditing || !formData.departmentId} name="positionId" value={formData.positionId} onChange={handleChange} className={fieldClass} required>
                <option value="">Chọn chức vụ</option>
                {filteredPositions.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vào làm *</label>
              <input 
                disabled={!isEditing} 
                type="date" 
                name="joinDate" 
                value={formData.joinDate} 
                onChange={handleChange} 
                min={formData.dateOfBirth ? (() => {
                  const d = new Date(formData.dateOfBirth);
                  d.setFullYear(d.getFullYear() + 18);
                  return d.toISOString().split("T")[0];
                })() : undefined}
                className={fieldClass} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại hợp đồng *</label>
              <select disabled={!isEditing} name="contractType" value={formData.contractType} onChange={handleChange} className={fieldClass} required>
                <option value="">Chọn loại hợp đồng</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương cơ bản (VNĐ) *</label>
              <input disabled={!isEditing} type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} className={fieldClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái làm việc</label>
              <select disabled={!isEditing} name="status" value={formData.status} onChange={handleChange} className={fieldClass} required>
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Đã nghỉ">Đã nghỉ</option>
              </select>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
