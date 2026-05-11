"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, UserCheck, UserMinus, TrendingUp, Building2,
  GraduationCap, Banknote, RefreshCw, ArrowUpRight,
  CalendarDays, Briefcase
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsData {
  kpi: { total: number; active: number; resigned: number; newThisMonth: number };
  byDepartment: Array<{ name: string; code: string; total: number; active: number }>;
  gender: { Nam: number; Nữ: number; Khác: number };
  contractTypes: Array<{ _id: string; count: number }>;
  educationLevels: Array<{ _id: string; count: number }>;
  growthData: Array<{ year: string; newHires: number; total: number }>;
  salaryDistribution: Array<{ label: string; count: number }>;
  recentHires: Array<{
    _id: string; employeeCode: string; fullName: string; gender: string;
    joinDate: string; baseSalary: number;
    departmentId: { name: string };
    positionId: { name: string };
  }>;
  avgSalaryByDept: Array<{ name: string; avgSalary: number; count: number }>;
}

// ─── Color Palettes ───────────────────────────────────────────────────────────

const COLORS_DEPT = [
  "#6366f1","#06b6d4","#10b981","#f59e0b","#ef4444",
  "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16",
];
const COLORS_GENDER = ["#6366f1","#ec4899","#94a3b8"];
const COLORS_CONTRACT = ["#10b981","#f59e0b","#6366f1","#ef4444"];
const COLORS_EDU = ["#84cc16","#06b6d4","#6366f1","#8b5cf6","#ef4444","#94a3b8"];

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtMoney = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString("vi-VN");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl px-3 py-2 border border-gray-700">
      {label && <p className="font-semibold mb-1 text-gray-200">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: <span className="font-bold">{typeof p.value === "number" && p.value > 1000
            ? p.value.toLocaleString("vi-VN")
            : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string; value: number | string; icon: React.ElementType;
  gradient: string; sub?: string; subColor?: string; href?: string; loading?: boolean;
}
const KpiCard = ({ label, value, icon: Icon, gradient, sub, subColor = "text-emerald-400", href, loading }: KpiCardProps) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${gradient} transition-transform hover:scale-[1.02] hover:shadow-2xl`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-white/70">{label}</p>
        {loading
          ? <Skeleton className="w-20 h-8 mt-2 bg-white/20" />
          : <p className="text-3xl font-extrabold mt-1 tracking-tight">{typeof value === "number" ? value.toLocaleString("vi-VN") : value}</p>
        }
        {sub && !loading && (
          <p className={`text-xs mt-1.5 font-medium ${subColor}`}>{sub}</p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {href && (
      <Link href={href} className="absolute bottom-4 right-4 text-white/60 hover:text-white transition-colors">
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    )}
    {/* Decorative circle */}
    <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────

const Card = ({ title, icon: Icon, children, className = "" }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; className?: string;
}) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
      {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
      <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Không thể tải dữ liệu thống kê");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // Computed
  const activeRate = data ? Math.round((data.kpi.active / data.kpi.total) * 100) : 0;
  const resignedRate = data ? Math.round((data.kpi.resigned / data.kpi.total) * 100) : 0;
  const genderData = data
    ? [
        { name: "Nam", value: data.gender.Nam },
        { name: "Nữ", value: data.gender.Nữ },
        ...(data.gender.Khác ? [{ name: "Khác", value: data.gender.Khác }] : []),
      ]
    : [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN")}`
              : "Đang tải dữ liệu..."}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          label="Tổng nhân viên" value={data?.kpi.total ?? 0}
          icon={Users} gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          sub="Toàn hệ thống" href="/employees" loading={loading}
        />
        <KpiCard
          label="Đang làm việc" value={data?.kpi.active ?? 0}
          icon={UserCheck} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          sub={`${activeRate}% trên tổng số`} loading={loading}
        />
        <KpiCard
          label="Đã nghỉ việc" value={data?.kpi.resigned ?? 0}
          icon={UserMinus} gradient="bg-gradient-to-br from-rose-500 to-rose-700"
          sub={`${resignedRate}% trên tổng số`} subColor="text-rose-200" loading={loading}
        />
        <KpiCard
          label="Số phòng ban" value={data?.byDepartment.length ?? 0}
          icon={Building2} gradient="bg-gradient-to-br from-amber-500 to-amber-700"
          sub={`${data?.avgSalaryByDept.length ?? 0} phòng có nhân viên`} href="/departments" loading={loading}
        />
      </div>

      {/* ── Row 2: Nhân viên theo phòng ban + Tăng trưởng ─────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Biểu đồ cột – nhân viên theo phòng ban */}
        <Card title="Nhân viên theo phòng ban" icon={Building2} className="xl:col-span-3">
          {loading
            ? <Skeleton className="h-64" />
            : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data?.byDepartment} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }}
                    angle={-35} textAnchor="end" interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, marginTop: 8 }} />
                  <Bar dataKey="total" name="Tổng NV" radius={[4, 4, 0, 0]} fill="#6366f1" />
                  <Bar dataKey="active" name="Đang làm" radius={[4, 4, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
        </Card>

        {/* Biểu đồ tròn – giới tính */}
        <Card title="Phân bổ giới tính" icon={Users} className="xl:col-span-2">
          {loading
            ? <Skeleton className="h-64" />
            : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderData} cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={4} dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {genderData.map((_, i) => (
                        <Cell key={i} fill={COLORS_GENDER[i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 flex-wrap justify-center">
                  {genderData.map((g, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-sm text-gray-600">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS_GENDER[i] }} />
                      <span className="font-medium">{g.name}</span>
                      <span className="text-gray-400">({g.value.toLocaleString("vi-VN")})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </Card>
      </div>

      {/* ── Row 3: Tăng trưởng + Lương theo phòng ban ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Area chart – tăng trưởng nhân sự theo năm */}
        <Card title="Tăng trưởng nhân sự theo năm" icon={TrendingUp}>
          {loading
            ? <Skeleton className="h-60" />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.growthData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="total" name="Tổng tích lũy" stroke="#6366f1" strokeWidth={2} fill="url(#gradTotal)" dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="newHires" name="Tuyển mới" stroke="#10b981" strokeWidth={2} fill="url(#gradNew)" dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </Card>

        {/* Bar chart ngang – lương trung bình theo phòng ban */}
        <Card title="Lương trung bình theo phòng ban (VND)" icon={Banknote}>
          {loading
            ? <Skeleton className="h-60" />
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data?.avgSalaryByDept}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number" tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v) => fmtMoney(v)}
                  />
                  <YAxis
                    type="category" dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }} width={70}
                    tickFormatter={(v: string) => v.replace("Phòng ", "")}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    formatter={(v: number) => v.toLocaleString("vi-VN") + " ₫"}
                  />
                  <Bar dataKey="avgSalary" name="Lương TB" radius={[0, 4, 4, 0]}>
                    {data?.avgSalaryByDept.map((_, i) => (
                      <Cell key={i} fill={COLORS_DEPT[i % COLORS_DEPT.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </Card>
      </div>

      {/* ── Row 4: Phân bổ lương + Hợp đồng + Học vấn ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Phân bổ mức lương */}
        <Card title="Phân bổ mức lương" icon={Banknote}>
          {loading
            ? <Skeleton className="h-52" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.salaryDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Nhân viên" radius={[4, 4, 0, 0]}>
                    {data?.salaryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS_DEPT[i * 2 % COLORS_DEPT.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </Card>

        {/* Loại hợp đồng */}
        <Card title="Loại hợp đồng" icon={Briefcase}>
          {loading
            ? <Skeleton className="h-52" />
            : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data?.contractTypes.map(c => ({ name: c._id, value: c.count }))}
                      cx="50%" cy="50%" outerRadius={65} paddingAngle={4} dataKey="value">
                      {data?.contractTypes.map((_, i) => (
                        <Cell key={i} fill={COLORS_CONTRACT[i % COLORS_CONTRACT.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  {data?.contractTypes.map((c, i) => {
                    const pct = data ? Math.round((c.count / data.kpi.total) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS_CONTRACT[i % COLORS_CONTRACT.length] }} />
                          <span className="text-gray-600">{c._id}</span>
                        </div>
                        <span className="font-medium text-gray-800">{c.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </Card>

        {/* Trình độ học vấn */}
        <Card title="Trình độ học vấn" icon={GraduationCap}>
          {loading
            ? <Skeleton className="h-52" />
            : (
              <div className="flex flex-col gap-2.5">
                {data?.educationLevels.map((e, i) => {
                  const pct = data ? Math.round((e.count / data.kpi.total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{e._id || "Chưa cập nhật"}</span>
                        <span className="font-semibold text-gray-800">{e.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: COLORS_EDU[i % COLORS_EDU.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </Card>
      </div>

      {/* ── Row 5: Nhân viên gia nhập gần đây ────────────────────────────── */}
      <Card title="Nhân viên gia nhập gần đây" icon={CalendarDays}>
        {loading
          ? <Skeleton className="h-48" />
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-3 pr-4 font-medium">Mã NV</th>
                    <th className="pb-3 pr-4 font-medium">Họ tên</th>
                    <th className="pb-3 pr-4 font-medium">Phòng ban</th>
                    <th className="pb-3 pr-4 font-medium">Chức vụ</th>
                    <th className="pb-3 pr-4 font-medium">Ngày vào</th>
                    <th className="pb-3 text-right font-medium">Lương cơ bản</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.recentHires.map((emp) => (
                    <tr key={emp._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">{emp.employeeCode}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ background: emp.gender === "Nam" ? "#6366f1" : "#ec4899" }}>
                            {emp.fullName.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{emp.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{emp.departmentId?.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{emp.positionId?.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{fmtDate(emp.joinDate)}</td>
                      <td className="py-3 text-right font-semibold text-gray-800">
                        {emp.baseSalary.toLocaleString("vi-VN")} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-center">
                <Link href="/employees" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  Xem tất cả nhân viên →
                </Link>
              </div>
            </div>
          )}
      </Card>
    </div>
  );
}
