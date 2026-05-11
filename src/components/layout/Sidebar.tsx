"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Building2, BarChart3, Settings, Shield } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Tổng quan", icon: BarChart3 },
    { href: "/employees", label: "Nhân viên", icon: Users },
    { href: "/users", label: "Quản lý tài khoản", icon: Shield },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-bold text-blue-600 text-center">Hệ thống quản lý nhân viên</span>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard");
            const Icon = link.icon;
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
