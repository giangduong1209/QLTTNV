"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Filter, Trash2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, X, Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZES = [10, 20, 50, 100];

const EDUCATION_LEVELS = [
  "THPT", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ", "Khác",
];

const EDUCATION_BADGE: Record<string, string> = {
  THPT: "bg-gray-100 text-gray-600",
  "Cao đẳng": "bg-purple-50 text-purple-700",
  "Đại học": "bg-blue-50 text-blue-700",
  "Thạc sĩ": "bg-indigo-50 text-indigo-700",
  "Tiến sĩ": "bg-pink-50 text-pink-700",
  Khác: "bg-yellow-50 text-yellow-700",
};

const STATUS_OPTIONS = ["Đang làm việc", "Đã nghỉ"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ─── Sort Button ─────────────────────────────────────────────────────────────

type SortOrder = "asc" | "desc";
interface SortBtnProps {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (field: string) => void;
}
function SortBtn({ label, field, sortBy, sortOrder, onSort }: SortBtnProps) {
  const active = sortBy === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 group select-none hover:text-indigo-600 transition-colors"
    >
      {label}
      {active ? (
        sortOrder === "asc"
          ? <ArrowUp className="w-3 h-3 text-indigo-600" />
          : <ArrowDown className="w-3 h-3 text-indigo-600" />
      ) : (
        <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors" />
      )}
    </button>
  );
}

// ─── Active Filter Badge ──────────────────────────────────────────────────────

function ActiveBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
      {label}
      <button onClick={onRemove} className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EmployeesPage() {
  // Search & filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [status, setStatus] = useState("");

  // Sort state
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Data state
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ── Fetch departments once ────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => {
        // API trả về { departments: [...], positions: [...] }
        if (Array.isArray(data?.departments)) setDepartments(data.departments);
        else if (Array.isArray(data)) setDepartments(data);
      })
      .catch(console.error);
  }, []);

  // ── Fetch employees ───────────────────────────────────────────────────────

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (departmentId) params.set("departmentId", departmentId);
    if (educationLevel) params.set("educationLevel", educationLevel);
    if (status) params.set("status", status);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", String(page));
    params.set("limit", String(limit));

    fetch(`/api/employees?${params.toString()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((result) => {
        setEmployees(Array.isArray(result.data) ? result.data : []);
        setTotal(result.total ?? 0);
        setTotalPages(result.totalPages ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [searchTerm, departmentId, educationLevel, status, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput);
  };

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setDepartmentId("");
    setEducationLevel("");
    setStatus("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/employees/${employeeToDelete}`, { method: "DELETE" });
      if (res.ok) {
        fetchEmployees();
        setEmployeeToDelete(null);
        toast.success("Xóa nhân viên thành công");
      } else {
        const errorData = await res.json();
        toast.error(`Xóa không thành công: ${errorData.error || "Lỗi không xác định"}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setIsDeleting(false);
    }
  };

  // Computed
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const activeFilterCount = [departmentId, educationLevel, status, searchTerm].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Xác nhận xóa</h3>
            <p className="text-slate-500 mb-8 leading-relaxed text-center">
              Bạn có chắc chắn muốn xóa nhân viên này? <br />
              <span className="font-semibold text-red-600">Hành động này không thể hoàn tác.</span>
            </p>
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setEmployeeToDelete(null)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-[1.5] px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-200 active:scale-[0.98]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  "Đồng ý xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Danh sách nhân viên</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              Tổng cộng <span className="font-medium text-gray-700">{total.toLocaleString("vi-VN")}</span> nhân viên
              {activeFilterCount > 0 && <span className="text-indigo-600 ml-1">({activeFilterCount} bộ lọc đang áp dụng)</span>}
            </p>
          )}
        </div>
        <Link
          href="/employees/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm nhân viên
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          {/* Row 1: search input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="employee-search"
                type="text"
                placeholder="Tìm theo tên, mã NV... (nhấn Enter)"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              id="btn-search"
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </button>
          </div>

          {/* Row 2: filter dropdowns */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Lọc phòng ban */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                id="filter-department"
                value={departmentId}
                onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700 min-w-[170px]"
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Lọc trình độ */}
            <select
              id="filter-education"
              value={educationLevel}
              onChange={(e) => { setEducationLevel(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700 min-w-[150px]"
            >
              <option value="">Tất cả trình độ</option>
              {EDUCATION_LEVELS.map((lv) => (
                <option key={lv} value={lv}>{lv}</option>
              ))}
            </select>

            {/* Lọc trạng thái */}
            <select
              id="filter-status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700 min-w-[160px]"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Số dòng / trang */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600 ml-auto">
              <span>Hiển thị:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>/ trang</span>
            </div>
          </div>

          {/* Row 3: active filter badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center pt-1">
              <span className="text-xs text-gray-400">Đang lọc:</span>
              {searchTerm && <ActiveBadge label={`Từ khóa: "${searchTerm}"`} onRemove={() => { setSearchTerm(""); setSearchInput(""); setPage(1); }} />}
              {departmentId && (
                <ActiveBadge
                  label={`Phòng ban: ${departments.find(d => d._id === departmentId)?.name ?? departmentId}`}
                  onRemove={() => { setDepartmentId(""); setPage(1); }}
                />
              )}
              {educationLevel && <ActiveBadge label={`Trình độ: ${educationLevel}`} onRemove={() => { setEducationLevel(""); setPage(1); }} />}
              {status && <ActiveBadge label={`Trạng thái: ${status}`} onRemove={() => { setStatus(""); setPage(1); }} />}
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-500 hover:text-red-700 font-medium ml-1 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3 font-medium">
                  <SortBtn label="Mã NV" field="employeeCode" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 font-medium">
                  <SortBtn label="Họ tên" field="fullName" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 font-medium">Ngày sinh</th>
                <th className="px-4 py-3 font-medium">
                  <SortBtn label="Ngày vào làm" field="joinDate" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 font-medium">Số điện thoại</th>
                <th className="px-4 py-3 font-medium">Trình độ</th>
                <th className="px-4 py-3 font-medium">Phòng ban</th>
                <th className="px-4 py-3 font-medium">Chức vụ</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="w-8 h-8 text-gray-300" />
                      <span className="text-sm">Không tìm thấy nhân viên nào phù hợp.</span>
                      {activeFilterCount > 0 && (
                        <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:underline mt-1">
                          Xóa bộ lọc để xem tất cả
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Mã NV */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
                        {emp.employeeCode}
                      </span>
                    </td>

                    {/* Họ tên */}
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: emp.gender === "Nam" ? "#6366f1" : "#ec4899" }}
                        >
                          {emp.fullName?.charAt(0)}
                        </div>
                        <span className="whitespace-nowrap font-medium">{emp.fullName}</span>
                      </div>
                    </td>

                    {/* Ngày sinh */}
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(emp.dateOfBirth)}</td>

                    {/* Ngày vào làm */}
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {formatDate(emp.joinDate)}
                      </span>
                    </td>

                    {/* SĐT */}
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{emp.phone || "—"}</td>

                    {/* Trình độ */}
                    <td className="px-4 py-3 text-sm">
                      {emp.educationLevel ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${EDUCATION_BADGE[emp.educationLevel] ?? "bg-gray-100 text-gray-600"}`}>
                          {emp.educationLevel}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Phòng ban */}
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{emp.departmentId?.name || "N/A"}</td>

                    {/* Chức vụ */}
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{emp.positionId?.name || "N/A"}</td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === "Đang làm việc" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === "Đang làm việc" ? "bg-emerald-500" : "bg-red-400"}`} />
                        {emp.status}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">
                      <Link
                        href={`/employees/${emp._id}`}
                        className="text-indigo-500 hover:text-indigo-700 mr-3 transition-colors font-medium text-xs"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => setEmployeeToDelete(emp._id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Xóa nhân viên"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ───────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 bg-gray-50/50">
          <div>
            {total > 0
              ? `Hiển thị ${startItem.toLocaleString("vi-VN")}–${endItem.toLocaleString("vi-VN")} trong tổng số ${total.toLocaleString("vi-VN")} nhân viên`
              : "Không có dữ liệu"}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1 || loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Trang đầu">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Trang trước">
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={item} onClick={() => setPage(item as number)} disabled={loading}
                    className={`min-w-[36px] h-9 px-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${item === page ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-gray-100 text-gray-700"}`}
                  >
                    {item}
                  </button>
                )
              )}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Trang sau">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages || loading}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Trang cuối">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
