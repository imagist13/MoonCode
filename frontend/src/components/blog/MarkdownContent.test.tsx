import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownContent } from "./MarkdownContent";
import { extractHeadings } from "@/lib/utils";

describe("MarkdownContent", () => {
  it("渲染 GFM 表格，并放进横向滚动容器", () => {
    const { container } = render(
      <MarkdownContent
        content={"| 层 | 选型 |\n| --- | --- |\n| 前端 | Next.js |"}
      />,
    );

    const wrapper = container.querySelector(".prose-table-wrap");
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector("table")).toBeTruthy();
    expect(wrapper?.textContent).toContain("Next.js");
  });

  it("把 - [x] / - [ ] 渲染成复选框", () => {
    const { container } = render(
      <MarkdownContent content={"- [x] 已完成\n- [ ] 待办"} />,
    );

    const boxes = container.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(boxes).toHaveLength(2);
    expect(boxes[0].checked).toBe(true);
    expect(boxes[1].checked).toBe(false);
    expect(boxes[0].disabled).toBe(true);
    expect(container.querySelectorAll("li.task-list-item")).toHaveLength(2);
  });

  it("站外链接新窗口打开，站内链接保持单页路由", () => {
    render(
      <MarkdownContent
        content={"[外链](https://example.com) [站内](/articles/1)"}
      />,
    );

    const external = screen.getByRole("link", { name: "外链" });
    expect(external).toHaveAttribute("href", "https://example.com");
    expect(external).toHaveAttribute("target", "_blank");
    expect(external).toHaveAttribute("rel", "noopener noreferrer");

    const internal = screen.getByRole("link", { name: "站内" });
    expect(internal).toHaveAttribute("href", "/articles/1");
    expect(internal).not.toHaveAttribute("target");
  });

  it("不把 react-markdown 的 node 对象透传到 DOM", () => {
    const { container } = render(
      <MarkdownContent
        content={"## 标题\n\n**加粗** [链接](https://example.com)\n\n![图](https://example.com/a.png)"}
      />,
    );

    expect(container.querySelector("[node]")).toBeNull();
  });

  it("标题 id 与目录一致：支持行内代码并自动去重", () => {
    const markdown =
      "## 使用 `npm run dev` 启动\n\n### 重复标题\n\n### 重复标题";
    const { container } = render(<MarkdownContent content={markdown} />);

    const renderedIds = Array.from(
      container.querySelectorAll("h2, h3"),
    ).map((el) => el.id);
    const tocIds = extractHeadings(markdown).map((h) => h.id);

    expect(renderedIds).toEqual(tocIds);
    expect(new Set(renderedIds).size).toBe(renderedIds.length);
    expect(renderedIds[0]).toBe("使用-npm-run-dev-启动");
  });

  it("独立图片段落渲染为 figure，不产生 p > figure 非法嵌套", () => {
    const { container } = render(
      <MarkdownContent content={"![封面图](https://example.com/a.png)"} />,
    );

    expect(container.querySelector("figure")).toBeTruthy();
    expect(container.querySelector("figure figcaption")?.textContent).toBe(
      "封面图",
    );
    expect(container.querySelector("p > figure")).toBeNull();
  });

  it("代码块带语言标签与复制按钮，并输出高亮类名", () => {
    const { container } = render(
      <MarkdownContent content={"```js\nconst a = 1;\n```"} />,
    );

    expect(container.querySelector(".prose-pre")).toBeTruthy();
    expect(container.querySelector(".prose-code-lang")?.textContent).toBe("js");
    expect(container.querySelector("code.hljs")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "复制代码" }),
    ).toBeInTheDocument();
  });

  it("过滤 javascript: 等危险链接", () => {
    const { container } = render(
      <MarkdownContent content={"[点我](javascript:alert(1))"} />,
    );

    expect(container.querySelector('a[href^="javascript"]')).toBeNull();
  });
});
