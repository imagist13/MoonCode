"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Music2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface Music {
  id: number;
  musicName: string;
  musicAuthor: string;
  musicUrl: string;
  cover: string;
  sort: number;
  status: number;
  createTime: string;
}

interface MusicListResponse {
  records: Music[];
  count: number;
  current: number;
  size: number;
}

interface MusicForm {
  musicName: string;
  musicAuthor: string;
  musicUrl: string;
  cover: string;
  sort: number;
  status: number;
}

const EMPTY_FORM: MusicForm = {
  musicName: "",
  musicAuthor: "",
  musicUrl: "",
  cover: "",
  sort: 0,
  status: 1,
};

const STATUS_MAP: Record<number, { label: string; dot: string }> = {
  1: { label: "启用", dot: "bg-emerald-500" },
  0: { label: "停用", dot: "bg-muted-foreground/50" },
};

export default function MusicPage() {
  const [musics, setMusics] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MusicForm>(EMPTY_FORM);
  const [audioUploading, setAudioUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<MusicListResponse | Music[]>(
        "/admin/music?current=1&size=100",
      );
      if (res.flag) {
        setMusics(
          Array.isArray(res.data) ? res.data : (res.data?.records ?? []),
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = useCallback((music: Music) => {
    setEditingId(music.id);
    setForm({
      musicName: music.musicName ?? "",
      musicAuthor: music.musicAuthor ?? "",
      musicUrl: music.musicUrl ?? "",
      cover: music.cover ?? "",
      sort: music.sort ?? 0,
      status: music.status === 0 ? 0 : 1,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.musicName.trim()) {
      toast.error("请输入歌曲名称");
      return;
    }
    if (!form.musicUrl.trim()) {
      toast.error("请填写音频地址或上传音频");
      return;
    }
    try {
      const res = await api.post("/admin/music", {
        ...(editingId ? { id: editingId } : {}),
        musicName: form.musicName.trim(),
        musicAuthor: form.musicAuthor.trim(),
        musicUrl: form.musicUrl.trim(),
        cover: form.cover.trim(),
        sort: Number.isFinite(form.sort) ? form.sort : 0,
        status: form.status,
      });
      if (res.flag) {
        toast.success(editingId ? "修改成功" : "添加成功");
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    }
  };

  const handleUploadAudio = async (file?: File) => {
    if (!file) return;
    setAudioUploading(true);
    try {
      const res = await api.upload<string>("/admin/music/audio", file);
      if (res.flag && res.data) {
        setForm((prev) => ({ ...prev, musicUrl: res.data }));
        toast.success("音频上传成功");
      } else {
        toast.error(res.message || "音频上传失败");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "音频上传失败");
    } finally {
      setAudioUploading(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const handleUploadCover = async (file?: File) => {
    if (!file) return;
    setCoverUploading(true);
    try {
      const res = await api.upload<string>("/admin/articles/images", file);
      if (res.flag && res.data) {
        setForm((prev) => ({ ...prev, cover: res.data }));
        toast.success("封面上传成功");
      } else {
        toast.error(res.message || "封面上传失败");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "封面上传失败");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleDelete = useCallback((id: number) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      const res = await api.delete("/admin/music", [pendingDeleteId]);
      if (res.flag) {
        toast.success("删除成功");
        fetchData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const totalPages = Math.ceil(musics.length / pageSize) || 1;

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const columns: ColumnDef<Music>[] = useMemo(
    () => [
      {
        accessorKey: "cover",
        header: "封面",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
            {row.original.cover ? (
              <Image
                src={row.original.cover}
                alt={row.original.musicName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Music2 className="size-4 text-muted-foreground/40" />
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "musicName",
        header: "歌曲名称",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.musicName}</span>
        ),
      },
      {
        accessorKey: "musicAuthor",
        header: "歌手 / 来源",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.musicAuthor || "-"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "状态",
        enableSorting: false,
        cell: ({ row }) => {
          const status = STATUS_MAP[row.original.status];
          return (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground">
              <span
                className={`size-1.5 rounded-full ${status?.dot ?? "bg-muted-foreground/50"}`}
              />
              {status?.label || "未知"}
            </span>
          );
        },
      },
      {
        accessorKey: "sort",
        header: "排序",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.sort}</span>
        ),
      },
      {
        accessorKey: "createTime",
        header: "创建时间",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.createTime}
          </span>
        ),
      },
      {
        id: "actions",
        header: "操作",
        enableSorting: false,
        size: 120,
        cell: ({ row }) => {
          const music = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openEdit(music)}
                aria-label="编辑"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(music.id)}
                aria-label="删除"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [openEdit, handleDelete],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35rem] font-semibold tracking-[-0.025em]">音乐管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            启用的曲目会出现在博客左下角的「蜘蛛点唱机」中，按排序值从小到大播放。
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          新增曲目
        </Button>
      </div>

      {loading ? (
        <DataTableSkeleton columns={7} rows={5} />
      ) : musics.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="暂无曲目"
          description="添加第一首歌，让访客能听到点唱机"
          action={{ label: "新增曲目", onClick: openCreate }}
        />
      ) : (
        <DataTable
          data={musics}
          columns={columns}
          pageCount={totalPages}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          sortable={true}
          filterable={true}
          loading={false}
          emptyTitle="暂无曲目"
          emptyDescription="还没有添加任何音乐"
        />
      )}

      {/* 新增/编辑曲目 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑曲目" : "新增曲目"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>歌曲名称</Label>
                <Input
                  placeholder="例如：夜航西飞"
                  value={form.musicName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, musicName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>歌手 / 来源</Label>
                <Input
                  placeholder="例如：Moon · 电子"
                  value={form.musicAuthor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      musicAuthor: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>音频地址</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://… 或上传后自动填入"
                  value={form.musicUrl}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, musicUrl: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={audioUploading}
                  onClick={() => audioInputRef.current?.click()}
                >
                  <Upload className="mr-1 size-4" />
                  {audioUploading ? "上传中…" : "上传"}
                </Button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.m4a,.aac,.ogg,.oga,.opus,.wav,.flac,.webm,audio/*"
                  className="hidden"
                  onChange={(e) => handleUploadAudio(e.target.files?.[0])}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                支持 MP3 / M4A / AAC / OGG / WAV / FLAC / WebM，也可以直接填写外链。
              </p>
              {form.musicUrl && (
                <audio
                  key={form.musicUrl}
                  src={form.musicUrl}
                  controls
                  preload="none"
                  className="mt-1 w-full"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>封面地址</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://… 或上传后自动填入"
                  value={form.cover}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, cover: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={coverUploading}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="mr-1 size-4" />
                  {coverUploading ? "上传中…" : "上传"}
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => handleUploadCover(e.target.files?.[0])}
                />
              </div>
              {form.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.cover}
                  alt="封面预览"
                  className="mt-1 h-16 w-16 rounded object-cover"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>排序</Label>
                <Input
                  type="number"
                  value={form.sort}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      sort: Number(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">数值越小越靠前</p>
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: Number(e.target.value) === 0 ? 0 : 1,
                    }))
                  }
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value={1}>启用</option>
                  <option value={0}>停用</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              取消
            </DialogClose>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除这首曲目吗？此操作不可恢复。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
