"use client";

import Link from "next/link";

/** 404 页面（spec §4.13） */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-4 text-7xl font-extrabold text-blue-500">404</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          页面走丢了
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          你访问的页面不存在或已被移除
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}