import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolLabel } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

describe("getToolLabel", () => {
  test("str_replace_editor create → Creating <filename>", () => {
    expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/Button.tsx" })).toBe("Creating Button.tsx");
  });

  test("str_replace_editor str_replace → Editing <filename>", () => {
    expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/app/page.tsx" })).toBe("Editing page.tsx");
  });

  test("str_replace_editor insert → Editing <filename>", () => {
    expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" })).toBe("Editing App.tsx");
  });

  test("str_replace_editor undo_edit → Editing <filename>", () => {
    expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/index.tsx" })).toBe("Editing index.tsx");
  });

  test("str_replace_editor view → Reading <filename>", () => {
    expect(getToolLabel("str_replace_editor", { command: "view", path: "src/lib/utils.ts" })).toBe("Reading utils.ts");
  });

  test("file_manager delete → Deleting <filename>", () => {
    expect(getToolLabel("file_manager", { command: "delete", path: "src/components/OldComp.tsx" })).toBe("Deleting OldComp.tsx");
  });

  test("file_manager rename → Renaming <from> to <to>", () => {
    expect(getToolLabel("file_manager", { command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" })).toBe("Renaming Foo.tsx to Bar.tsx");
  });

  test("unknown tool → returns raw toolName", () => {
    expect(getToolLabel("some_other_tool", { command: "do_something" })).toBe("some_other_tool");
  });
});

// --- ToolCallDisplay component tests ---

describe("ToolCallDisplay", () => {
  test("shows label and spinner when in progress", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "src/Button.tsx" },
      state: "call",
      result: undefined,
    };
    render(<ToolCallDisplay tool={tool} />);
    expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    // Spinner should be present (animate-spin class)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeDefined();
  });

  test("shows green dot and no spinner when done", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "str_replace", path: "src/App.tsx" },
      state: "result",
      result: { success: true },
    };
    render(<ToolCallDisplay tool={tool} />);
    expect(screen.getByText("Editing App.tsx")).toBeDefined();
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeNull();
    const greenDot = document.querySelector(".bg-emerald-500");
    expect(greenDot).toBeDefined();
  });

  test("shows spinner when result is falsy even if state is result", () => {
    const tool = {
      toolName: "str_replace_editor",
      args: { command: "view", path: "src/index.tsx" },
      state: "result",
      result: null,
    };
    render(<ToolCallDisplay tool={tool} />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeDefined();
  });

  test("shows Deleting label for file_manager delete", () => {
    const tool = {
      toolName: "file_manager",
      args: { command: "delete", path: "src/OldComp.tsx" },
      state: "call",
    };
    render(<ToolCallDisplay tool={tool} />);
    expect(screen.getByText("Deleting OldComp.tsx")).toBeDefined();
  });

  test("shows Renaming label for file_manager rename", () => {
    const tool = {
      toolName: "file_manager",
      args: { command: "rename", path: "src/Foo.tsx", new_path: "src/Bar.tsx" },
      state: "call",
    };
    render(<ToolCallDisplay tool={tool} />);
    expect(screen.getByText("Renaming Foo.tsx to Bar.tsx")).toBeDefined();
  });

  test("falls back to raw toolName for unknown tools", () => {
    const tool = {
      toolName: "web_search",
      args: {},
      state: "call",
    };
    render(<ToolCallDisplay tool={tool} />);
    expect(screen.getByText("web_search")).toBeDefined();
  });
});
