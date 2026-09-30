"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  getAbout,
  updateAbout,
  uploadImage,
  type AboutInfo,
  type AboutBadge,
} from "@/lib/about";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">站点设置</h1>
      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">关于我</TabsTrigger>
          <TabsTrigger value="config">JSON 配置</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <AboutSettings />
        </TabsContent>
        <TabsContent value="config">
          <JsonConfigSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* JSON 配置（保留原功能）                                                      */
/* -------------------------------------------------------------------------- */

function JsonConfigSettings() {
  const [config, setConfig] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<string>("/website/config")
      .then((res) => {
        if (res.flag) {
          const value =
            typeof res.data === "string"
              ? res.data
              : JSON.stringify(res.data, null, 2);
          setConfig(value);
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "加载失败";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      JSON.parse(config);
    } catch {
      toast.error("JSON 格式不正确，请检查后重试");
      return;
    }

    setSaving(true);
    try {
      const parsed = JSON.parse(config);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        toast.error("配置必须是 JSON 对象");
        setSaving(false);
        return;
      }
      const dangerousKeys = Object.keys(parsed).filter(
        (k) => k === "__proto__" || k === "constructor" || k === "prototype",
      );
      if (dangerousKeys.length > 0) {
        toast.error(`包含不允许的键: ${dangerousKeys.join(", ")}`);
        setSaving(false);
        return;
      }
      const res = await api.put("/admin/website/config", { config: JSON.stringify(parsed) });
      if (res.flag) {
        toast.success("保存成功");
      } else {
        toast.error(res.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(config);
      setConfig(JSON.stringify(parsed, null, 2));
      toast.success("格式化完成");
    } catch {
      toast.error("JSON 格式不正确，无法格式化");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <p>加载失败: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          重试
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">JSON 配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>配置内容</Label>
          <Textarea
            className="font-mono text-sm min-h-[400px]"
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder='{"key": "value"}'
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存配置"}
          </Button>
          <Button variant="outline" onClick={handleFormat}>
            格式化 JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* 关于我 设置                                                                  */
/* -------------------------------------------------------------------------- */

const EMPTY_INFO: AboutInfo = {
  banner: "",
  avatar: "",
  nickname: "",
  pronouns: "",
  intro: "",
  subtitle: "",
  bio: "",
  aboutPoints: [],
  email: "",
  website: "",
  github: "",
  followers: 0,
  following: 0,
  techStack: [],
  backendSkills: "",
  frontendSkills: "",
  otherSkills: "",
  achievements: [],
};

function AboutSettings() {
  const [info, setInfo] = useState<AboutInfo>(EMPTY_INFO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"" | "avatar" | "banner">("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAbout()
      .then((data) => {
        if (!cancelled) setInfo({ ...EMPTY_INFO, ...data });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "加载失败");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = <K extends keyof AboutInfo>(key: K, value: AboutInfo[K]) => {
    setInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!info.nickname.trim()) {
      toast.error("昵称不能为空");
      return;
    }
    setSaving(true);
    try {
      await updateAbout(info);
      toast.success("关于我已保存");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImage = async (
    field: "avatar" | "banner",
    file: File,
  ): Promise<string> => {
    setUploadingField(field);
    try {
      const url = await uploadImage(file);
      update(field, url);
      toast.success(`${field === "avatar" ? "头像" : "Banner"} 已上传`);
      return url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
      throw err;
    } finally {
      setUploadingField("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基础信息</CardTitle>
          <CardDescription>
            关于页顶部展示的头像、Banner、昵称、简介等信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 头像 + Banner 上传 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>头像</Label>
              <div className="flex items-start gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5 bg-slate-100">
                  {info.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={info.avatar}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      无
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={info.avatar}
                    onChange={(e) => update("avatar", e.target.value)}
                    placeholder="可粘贴图片 URL，或点击右侧上传"
                  />
                  <ImageUploadButton
                    disabled={uploadingField === "avatar"}
                    onPick={(file) => handleUploadImage("avatar", file)}
                  >
                    {uploadingField === "avatar" ? "上传中..." : "上传新头像"}
                  </ImageUploadButton>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Banner 顶图</Label>
              <div className="flex items-start gap-3">
                <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md ring-1 ring-black/5 bg-slate-100">
                  {info.banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={info.banner}
                      alt="banner"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      无
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    value={info.banner}
                    onChange={(e) => update("banner", e.target.value)}
                    placeholder="可粘贴图片 URL，或点击右侧上传"
                  />
                  <ImageUploadButton
                    disabled={uploadingField === "banner"}
                    onPick={(file) => handleUploadImage("banner", file)}
                  >
                    {uploadingField === "banner" ? "上传中..." : "上传新 Banner"}
                  </ImageUploadButton>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>昵称 *</Label>
              <Input
                value={info.nickname}
                onChange={(e) => update("nickname", e.target.value)}
                placeholder="如：提子"
              />
            </div>
            <div className="space-y-2">
              <Label>代词 (pronouns)</Label>
              <Input
                value={info.pronouns}
                onChange={(e) => update("pronouns", e.target.value)}
                placeholder="如：he/him"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>一句话简介</Label>
            <Textarea
              value={info.intro}
              onChange={(e) => update("intro", e.target.value)}
              placeholder="如：🍊 Hi, I'm 提子. Learning full-stack development."
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>主标题副标题（红色字）</Label>
              <Input
                value={info.subtitle}
                onChange={(e) => update("subtitle", e.target.value)}
                placeholder="如：AI Agent / Hello World"
              />
            </div>
            <div className="space-y-2">
              <Label>详细 Bio（可选）</Label>
              <Textarea
                value={info.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="支持多行"
                rows={3}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input
                value={info.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="[email protected]"
              />
            </div>
            <div className="space-y-2">
              <Label>个人网站</Label>
              <Input
                value={info.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                value={info.github}
                onChange={(e) => update("github", e.target.value)}
                placeholder="https://github.com/xxx"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>followers 数</Label>
              <Input
                type="number"
                min={0}
                value={info.followers}
                onChange={(e) =>
                  update("followers", Math.max(0, Number(e.target.value) || 0))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>following 数</Label>
              <Input
                type="number"
                min={0}
                value={info.following}
                onChange={(e) =>
                  update("following", Math.max(0, Number(e.target.value) || 0))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Me 项目 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Me 项目</CardTitle>
          <CardDescription>左侧 About Me 区域内的要点（带 emoji）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {info.aboutPoints.map((p, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Input
                className="w-16 shrink-0 text-center"
                value={p.emoji}
                onChange={(e) => {
                  const next = [...info.aboutPoints];
                  next[idx] = { ...p, emoji: e.target.value };
                  update("aboutPoints", next);
                }}
                placeholder="🌱"
              />
              <Textarea
                className="flex-1"
                value={p.text}
                onChange={(e) => {
                  const next = [...info.aboutPoints];
                  next[idx] = { ...p, text: e.target.value };
                  update("aboutPoints", next);
                }}
                placeholder="Interested in AI Agent & Full-stack development, currently diving deep into both fields"
                rows={1}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() =>
                  update(
                    "aboutPoints",
                    info.aboutPoints.filter((_, i) => i !== idx),
                  )
                }
                aria-label="删除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              update("aboutPoints", [...info.aboutPoints, { emoji: "•", text: "" }])
            }
          >
            <Plus className="h-4 w-4" />
            添加一项
          </Button>
        </CardContent>
      </Card>

      {/* 技术栈 + 成就 */}
      <div className="grid gap-4 md:grid-cols-2">
        <BadgeListCard
          title="Tech Stack 技术栈"
          description="以彩色圆点呈现，每个含 emoji / 字母与底色"
          items={info.techStack}
          onChange={(next) => update("techStack", next)}
        />
        <BadgeListCard
          title="Achievements 成就"
          description="侧边栏下方的圆形徽章"
          items={info.achievements}
          onChange={(next) => update("achievements", next)}
        />
      </div>

      {/* 技能列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">技能分类</CardTitle>
          <CardDescription>每行一项，用于 Skills 区域</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>后端</Label>
            <Textarea
              value={info.backendSkills}
              onChange={(e) => update("backendSkills", e.target.value)}
              placeholder={"Go\nJava\nNode.js"}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>前端</Label>
            <Textarea
              value={info.frontendSkills}
              onChange={(e) => update("frontendSkills", e.target.value)}
              placeholder={"React\nNext.js\nVue"}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>其他</Label>
            <Textarea
              value={info.otherSkills}
              onChange={(e) => update("otherSkills", e.target.value)}
              placeholder={"Docker\nKubernetes\nCI/CD"}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存关于我"}
        </Button>
      </div>
    </div>
  );
}

interface BadgeListCardProps {
  title: string;
  description: string;
  items: AboutBadge[];
  onChange: (next: AboutBadge[]) => void;
}

/**
 * 通用徽章编辑卡片：名称 / icon（emoji 或文本）/ 背景色。
 * 用于 Tech Stack 与 Achievements 两个区。
 */
function BadgeListCard({ title, description, items, onChange }: BadgeListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((b, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input
              className="w-16 text-center"
              value={b.icon}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...b, icon: e.target.value };
                onChange(next);
              }}
              placeholder="🚀"
              maxLength={2}
            />
            <Input
              className="flex-1"
              value={b.name}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...b, name: e.target.value };
                onChange(next);
              }}
              placeholder="名称（如 Go）"
            />
            <input
              type="color"
              className="h-9 w-12 shrink-0 cursor-pointer rounded border border-slate-200 bg-white p-0"
              value={b.color || "#64748b"}
              onChange={(e) => {
                const next = [...items];
                next[idx] = { ...b, color: e.target.value };
                onChange(next);
              }}
              aria-label="背景色"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              aria-label="删除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() =>
            onChange([...items, { name: "", icon: "★", color: "#64748b" }])
          }
        >
          <Plus className="h-4 w-4" />
          添加一项
        </Button>
      </CardContent>
    </Card>
  );
}

interface ImageUploadButtonProps {
  onPick: (file: File) => Promise<string> | void;
  disabled?: boolean;
  children: React.ReactNode;
}

/** 文件选择按钮；用户选完文件后调用 onPick，由父组件负责上传与回填 URL。 */
function ImageUploadButton({ onPick, disabled, children }: ImageUploadButtonProps) {
  return (
    <label
      className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {children}
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void onPick(file);
        }}
        disabled={disabled}
      />
    </label>
  );
}