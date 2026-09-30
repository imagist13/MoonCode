"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { uploadImage } from "@/lib/about";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  /** 当前头像 URL */
  value: string;
  /** 上传成功后的回调（父组件拿到新 URL 自行保存到表单/接口） */
  onChange: (url: string) => void;
  /** 仅在管理员视角下启用，访客时隐藏换头像按钮 */
  editable?: boolean;
  /** 头像尺寸，默认 9rem（144px），对应侧边栏中的圆形大头像 */
  size?: number;
  className?: string;
}

/**
 * 圆形头像组件 + hover 时显示「换头像」按钮。
 *
 * 设计要点：
 * - 默认状态显示头像本身；hover 时浮一层遮罩 + 相机图标 + 文案。
 * - 仅在 editable=true 时启用文件选择器，避免给非管理员暴露隐藏交互。
 * - 上传走前端 `uploadImage()`（复用 admin 图片上传接口，含扩展名/MIME 校验）。
 */
export function AvatarUploader({
  value,
  onChange,
  editable = false,
  size = 144,
  className,
}: AvatarUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    if (!editable || uploading) return;
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选同一文件
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("头像已更新，记得保存设置哦～");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "group/avatar relative shrink-0 overflow-hidden rounded-full ring-1 ring-black/5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="avatar"
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-3xl font-semibold text-slate-500">
          🙂
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover/avatar:opacity-100",
              uploading && "opacity-100 cursor-wait",
            )}
            title="换头像"
          >
            <Camera className="h-5 w-5" />
            <span>{uploading ? "上传中..." : "Change your avatar"}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  );
}