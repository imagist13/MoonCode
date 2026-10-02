"use client";

import type { AboutInfo } from "@/lib/about";
import { Card, CardContent } from "@/components/ui/card";

interface AboutMainProps {
  data: AboutInfo;
}

/**
 * 关于页右侧主体内容：
 *   - About Me 项目列表
 *   - Skills（Backend / Frontend / Other）
 *   - Bio 长文
 *
 * 注：banner 由 page.tsx 单独管理（要让它在 grid 上方，跟身份卡重叠）。
 */
export function AboutMain({ data }: AboutMainProps) {
  return (
    <div
      className="flex flex-col gap-6 reveal-up"
      style={{ animationDelay: "50ms" }}
    >
      {data.aboutPoints.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span aria-hidden>🌱</span>
              About Me
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/80">
              {data.aboutPoints.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">{p.emoji || "•"}</span>
                  <span className="whitespace-pre-line">{p.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(data.backendSkills || data.frontendSkills || data.otherSkills) && (
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span aria-hidden>💻</span>
              Skills
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/80">
              {data.backendSkills && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Backend
                  </div>
                  <div className="mt-1 whitespace-pre-line">
                    {data.backendSkills}
                  </div>
                </div>
              )}
              {data.frontendSkills && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Frontend
                  </div>
                  <div className="mt-1 whitespace-pre-line">
                    {data.frontendSkills}
                  </div>
                </div>
              )}
              {data.otherSkills && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Other
                  </div>
                  <div className="mt-1 whitespace-pre-line">
                    {data.otherSkills}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {data.bio && (
        <Card>
          <CardContent>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span aria-hidden>📝</span>
              Bio
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
              {data.bio}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}