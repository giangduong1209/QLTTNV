"use client";

import { LogOut, Menu, User, AlertCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 relative">
      <div className="flex items-center">
        <button className="md:hidden text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
            <User className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin User</span>
        </div>
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận đăng xuất</h3>
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống? Phiên làm việc của bạn sẽ kết thúc.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-2">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Đăng xuất ngay
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full sm:w-auto px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
