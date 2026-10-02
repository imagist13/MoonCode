"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/about";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BannerUploaderProps {
  /** 当前 banner 图像 URL（空字符串时显示默认 mesh 装饰背景） */
  value: string;
  /** 上传成功后的回调 */
  onChange: (url: string) => void;
  /** 仅管理员可见的「更换 banner」按钮 */
  editable?: boolean;
  className?: string;
}

/**
 * 关于页顶部 Hero banner：
 *   - 默认展示品牌色 mesh 渐变 + 网格 + 粒子 + 标签条装饰；
 *   - 管理员 hover 整张可触发图片上传，新图将覆盖 mesh；
 *   - 非管理员看到的是纯装饰背景，无任何上传交互。
 *
 * 注意：Mesh 上的 mesh/grid/particle 仅做背景装饰，不阻塞交互层。
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

  const hasImage = Boolean(value);

  return (
    <div
      className={cn(
        "group/banner relative h-[180px] overflow-hidden rounded-2xl border border-border/60 shadow-(--shadow-card-hover) md:h-[200px]",
        !hasImage && "banner-mesh",
        className,
      )}
    >
      {/* 用户上传的真实图片（覆盖 mesh） */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="banner"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}

      {/* 装饰层：网格 + 粒子 */}
      <div className="banner-grid" />
      <span className="particle absolute top-10 left-16 w-1.5 h-1.5 rounded-full bg-blue-200/80" />
      <span
        className="particle absolute top-20 right-1/3 w-1 h-1 rounded-full bg-white/80"
        style={{ animationDelay: "-1s" }}
      />
      <span
        className="particle absolute bottom-10 right-1/4 w-2 h-2 rounded-full bg-blue-300/60"
        style={{ animationDelay: "-3s" }}
      />
      <span
        className="particle absolute bottom-6 left-1/3 w-1 h-1 rounded-full bg-indigo-200/70"
        style={{ animationDelay: "-2s" }}
      />

      {/* 管理员 hover 更换按钮 */}
      {editable && (
        <>
          <button
            type="button"
            onClick={handlePick}
            disabled={uploading}
            aria-label={hasImage ? "更换 banner 图片" : "上传 banner 图片"}
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-2 bg-black/45 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover/banner:opacity-100",
              uploading && "opacity-100 cursor-wait",
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>上传中…</span>
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span>{hasImage ? "更换 Banner" : "上传 Banner 图片"}</span>
              </>
            )}
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