"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { uploadImage } from "@/lib/about";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BannerUploaderProps {
  value: string;
  onChange: (url: string) => void;
  editable?: boolean;
  className?: string;
}

/**
 * 关于页顶部 banner 图片上传组件：
 * - 默认显示图片；
 * - 管理员 hover 时叠加「更换 banner」按钮；
 * - 非管理员看到的是纯展示。
 */
export function BannerUploader({
  value,
  onChange,
  editable = false,
  className,
}: BannerUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    if (!editable || uploading) return;
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Banner 已更新，记得保存设置～");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "group/banner relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200",
        className,
      )}
      style={{ aspectRatio: "16 / 6" }}
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="banner"
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
          推荐尺寸 1200×450，hover 状态（管理员）可上传新图
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 bg-black/45 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover/banner:opacity-100",
              uploading && "opacity-100 cursor-wait",
            )}
            title="更换 banner"
          >
            <ImagePlus className="h-5 w-5" />
            <span>{uploading ? "上传中..." : "更换 Banner"}</span>
          </button>
          <input
            ref={inputRef}
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