"use client";

import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  args: Record<string, any>;
  state: string;
  result?: any;
}

// v5 tool part format: type="tool-{name}", input=args, output=result
interface ToolUIPart {
  type: string; // "tool-{name}"
  state: string;
  input?: Record<string, any>;
  output?: any;
}

export function getToolLabel(toolName: string, args: Record<string, any>): string {
  const filename = args?.path ? args.path.split("/").pop() : "";

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
      case "undo_edit":
        return `Editing ${filename}`;
      case "view":
        return `Reading ${filename}`;
      default:
        return `Editing ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "delete":
        return `Deleting ${filename}`;
      case "rename": {
        const newFile = args?.new_path ? args.new_path.split("/").pop() : "";
        return `Renaming ${filename} to ${newFile}`;
      }
      default:
        return `Managing ${filename}`;
    }
  }

  return toolName;
}

export function ToolCallDisplay({ tool }: { tool: ToolInvocation | ToolUIPart }) {
  const toolName = "toolName" in tool ? tool.toolName : tool.type.replace(/^tool-/, "");
  const args = "args" in tool ? tool.args : (tool.input ?? {});
  const isDone = tool.state === "output-available" || (tool.state === "result" && "result" in tool && tool.result);
  const label = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
