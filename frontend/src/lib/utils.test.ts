import { describe, expect, it } from "vitest";
import { extractHeadings, slugifyHeading, stripMarkdown } from "./utils";

describe("slugifyHeading", () => {
  it("保留中英文与数字，把标点折叠为连字符", () => {
    expect(slugifyHeading("使用 `npm run dev` 启动")).toBe(
      "使用-npm-run-dev-启动",
    );
    expect(slugifyHeading("What's new?")).toBe("what-s-new");
  });

  it("空标题兜底为 section", () => {
    expect(slugifyHeading("!!!")).toBe("section");
  });
});

describe("stripMarkdown", () => {
  it("去掉表格、图片、任务列表等语法，不误删单词内连字符", () => {
    const text = stripMarkdown(
      [
        "## 标题",
        "",
        "| 层 | 选型 |",
        "| --- | --- |",
        "| 前端 | Next.js |",
        "",
        "![封面图](https://example.com/a.png)",
        "",
        "- [x] 已完成",
        "- [ ] 待办",
        "",
        "阅读 [文档](https://example.com)，发邮件到 e-mail@example.com",
      ].join("\n"),
    );

    expect(text).not.toContain("|");
    expect(text).not.toContain("![");
    expect(text).not.toContain("[x]");
    expect(text).toContain("封面图");
    expect(text).toContain("已完成");
    expect(text).toContain("文档");
    expect(text).toContain("e-mail@example.com");
  });
});

describe("extractHeadings", () => {
  it("忽略围栏代码块里的 # 注释", () => {
    const headings = extractHeadings(
      ["## 真标题", "", "```bash", "# 注释", "## 假标题", "```", "", "### 结尾"].join(
        "\n",
      ),
    );

    expect(headings.map((h) => h.text)).toEqual(["真标题", "结尾"]);
  });

  it("行内代码/链接按纯文本生成，与正文标题 id 一致", () => {
    const headings = extractHeadings("## 使用 `npm run dev` 启动\n\n### [文档](/docs)");

    expect(headings[0].id).toBe("使用-npm-run-dev-启动");
    expect(headings[1].text).toBe("文档");
    expect(headings[1].id).toBe("文档");
  });

  it("重复标题自动去重，h1 参与计数", () => {
    expect(extractHeadings("## 重复\n\n### 重复").map((h) => h.id)).toEqual([
      "重复",
      "重复-1",
    ]);
    expect(extractHeadings("# 重名\n\n## 重名").map((h) => h.id)).toEqual([
      "重名-1",
    ]);
  });

  it("只返回 h2/h3，忽略 h4 及更深层级", () => {
    const headings = extractHeadings(
      "## 二级\n\n### 三级\n\n#### 四级\n\n##### 五级",
    );
    expect(headings.map((h) => h.level)).toEqual([2, 3]);
  });
});
