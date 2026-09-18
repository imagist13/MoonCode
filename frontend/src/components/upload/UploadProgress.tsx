"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadTask {
  id: string;
  fileName: string;
  status: "uploading" | "processing" | "done" | "error";
  progress: number; // 0-100
  error?: string;
}

interface UploadProgressProps {
  tasks: UploadTask[];
  onDismiss?: (id: string) => void;
}

/** 上传进度面板（spec §6.5） */
export function UploadProgress({ tasks, onDismiss }: UploadProgressProps) {
  if (tasks.length === 0) return null;
  return (
    <div className="upload-progress-panel fixed bottom-4 right-4 z-50 w-80 max-h-[60vh] overflow-hidden rounded-xl bg-white/95 shadow-2xl backdrop-blur-md dark:bg-gray-800/95">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          上传列表 ({tasks.length})
        </h3>
      </div>
      <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
        {tasks.map((task) => (
          <UploadItem key={task.id} task={task} onDismiss={onDismiss} />
        ))}
      </ul>
    </div>
  );
}

function UploadItem({
  task,
  onDismiss,
}: {
  task: UploadTask;
  onDismiss?: (id: string) => void;
}) {
  const [leaving, setLeaving] = useState(false);

  // 自动移除
  useEffect(() => {
    if (task.status === "done") {
      const t = setTimeout(() => setLeaving(true), 1100);
      return () => clearTimeout(t);
    }
    if (task.status === "error") {
      const t = setTimeout(() => setLeaving(true), 3600);
      return () => clearTimeout(t);
    }
  }, [task.status]);

  return (
    <li
      className={cn(
        "upload-progress-item p-3",
        leaving && task.status === "done" && "upload-progress-item-leaving-done",
        leaving && task.status === "error" && "upload-progress-item-leaving-error",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
            {task.fileName}
          </p>
          <div className="upload-progress-track mt-2">
            {task.status === "uploading" && (
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${task.progress}%`,
                  background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                }}
              />
            )}
            {task.status === "processing" && (
              <div className="upload-progress-fill-shimmer h-full w-full" />
            )}
            {(task.status === "done" || task.status === "error") && (
              <div
                className={cn(
                  "h-full",
                  task.status === "done" ? "bg-green-500" : "bg-red-500",
                )}
                style={{ width: "100%" }}
              />
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
            {task.status === "uploading" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>上传中 {task.progress}%</span>
              </>
            )}
            {task.status === "processing" && (
              <>
                <span className="upload-progress-processing-text">处理中...</span>
              </>
            )}
            {task.status === "done" && (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-green-600">上传成功</span>
              </>
            )}
            {task.status === "error" && (
              <>
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-red-600">{task.error || "上传失败"}</span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDismiss?.(task.id)}
          className="shrink-0 text-gray-400 hover:text-gray-700"
          aria-label="关闭"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </li>
  );
}

/** 简易 hook：管理上传任务列表 */
export function useUploadTasks() {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  return {
    tasks,
    start: (id: string, fileName: string) => {
      setTasks((prev) => [...prev, { id, fileName, status: "uploading", progress: 0 }]);
    },
    progress: (id: string, percent: number) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, progress: percent } : t)),
      );
    },
    processing: (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "processing", progress: 100 } : t)),
      );
    },
    done: (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)),
      );
      setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }, 1500);
    },
    error: (id: string, msg: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "error", error: msg } : t)),
      );
      setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    dismiss: (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
  };
}