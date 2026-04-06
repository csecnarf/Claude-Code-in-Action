import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useAuth } from "../use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("useAuth - signIn", () => {
  // Test 1: success + anon work with messages
  test("success with anon work: creates project from anon data, clears it, and redirects", async () => {
    const anonWork = {
      messages: [{ role: "user", content: "make a button" }],
      fileSystemData: { "/Button.tsx": { type: "file", content: "" } },
    };
    (getAnonWorkData as any).mockReturnValue(anonWork);
    (signInAction as any).mockResolvedValue({ success: true });
    (createProject as any).mockResolvedValue({ id: "anon-proj-1" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      })
    );
    expect(clearAnonWork).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/anon-proj-1");
    expect(getProjects).not.toHaveBeenCalled();
  });

  // Test 2: success + anon work with empty messages (falls through to getProjects)
  test("success with anon work but empty messages: redirects to existing project", async () => {
    (getAnonWorkData as any).mockReturnValue({ messages: [], fileSystemData: {} });
    (signInAction as any).mockResolvedValue({ success: true });
    (getProjects as any).mockResolvedValue([{ id: "existing-proj" }]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(getProjects).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/existing-proj");
    expect(createProject).not.toHaveBeenCalled();
  });

  // Test 3: success + no anon work + existing projects
  test("success with no anon work and existing projects: redirects to most recent project", async () => {
    (getAnonWorkData as any).mockReturnValue(null);
    (signInAction as any).mockResolvedValue({ success: true });
    (getProjects as any).mockResolvedValue([{ id: "proj-recent" }, { id: "proj-older" }]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/proj-recent");
    expect(createProject).not.toHaveBeenCalled();
  });

  // Test 4: success + no anon work + no projects
  test("success with no anon work and no projects: creates new project and redirects", async () => {
    (getAnonWorkData as any).mockReturnValue(null);
    (signInAction as any).mockResolvedValue({ success: true });
    (getProjects as any).mockResolvedValue([]);
    (createProject as any).mockResolvedValue({ id: "new-proj" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [], data: {} })
    );
    expect(mockPush).toHaveBeenCalledWith("/new-proj");
  });

  // Test 5: failure
  test("failure: returns result without redirecting", async () => {
    (signInAction as any).mockResolvedValue({ success: false, error: "Invalid credentials" });

    const { result } = renderHook(() => useAuth());

    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "wrong");
    });

    expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
    expect(mockPush).not.toHaveBeenCalled();
    expect(getProjects).not.toHaveBeenCalled();
    expect(createProject).not.toHaveBeenCalled();
  });

  // Test 6: isLoading lifecycle
  test("isLoading is false initially, true while in-flight, false after", async () => {
    let resolve: (v: any) => void;
    (signInAction as any).mockReturnValue(new Promise((res) => { resolve = res; }));
    (getAnonWorkData as any).mockReturnValue(null);
    (getProjects as any).mockResolvedValue([{ id: "p1" }]);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);

    act(() => { result.current.signIn("u@e.com", "pw"); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => { resolve!({ success: true }); });
    expect(result.current.isLoading).toBe(false);
  });
});

describe("useAuth - signUp", () => {
  // Test 7: success + anon work with messages
  test("success with anon work: creates project from anon data, clears it, and redirects", async () => {
    const anonWork = {
      messages: [{ role: "user", content: "make a form" }],
      fileSystemData: { "/Form.tsx": { type: "file", content: "" } },
    };
    (getAnonWorkData as any).mockReturnValue(anonWork);
    (signUpAction as any).mockResolvedValue({ success: true });
    (createProject as any).mockResolvedValue({ id: "signup-proj" });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      })
    );
    expect(clearAnonWork).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/signup-proj");
  });

  // Test 8: success + no anon work + existing projects
  test("success with no anon work and existing projects: redirects to most recent project", async () => {
    (getAnonWorkData as any).mockReturnValue(null);
    (signUpAction as any).mockResolvedValue({ success: true });
    (getProjects as any).mockResolvedValue([{ id: "existing" }]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("new@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/existing");
    expect(createProject).not.toHaveBeenCalled();
  });

  // Test 9: failure
  test("failure: returns result without redirecting", async () => {
    (signUpAction as any).mockResolvedValue({ success: false, error: "Email already taken" });

    const { result } = renderHook(() => useAuth());

    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signUp("taken@example.com", "pw");
    });

    expect(returnValue).toEqual({ success: false, error: "Email already taken" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  // Test 10: isLoading lifecycle
  test("isLoading is false initially, true while in-flight, false after", async () => {
    let resolve: (v: any) => void;
    (signUpAction as any).mockReturnValue(new Promise((res) => { resolve = res; }));
    (getAnonWorkData as any).mockReturnValue(null);
    (getProjects as any).mockResolvedValue([{ id: "p1" }]);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(false);

    act(() => { result.current.signUp("u@e.com", "pw"); });
    expect(result.current.isLoading).toBe(true);

    await act(async () => { resolve!({ success: true }); });
    expect(result.current.isLoading).toBe(false);
  });
});
