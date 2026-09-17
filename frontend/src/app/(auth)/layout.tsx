import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900" style={{ paddingTop: 96 }}>
      <div className="w-full max-w-md">
        {/* 顶部返回链接 */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 transition-colors hover:text-blue-600"
          >
            ← 返回首页
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}