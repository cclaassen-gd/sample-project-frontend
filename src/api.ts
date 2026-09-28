const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type IssueStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'TESTING'
  | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Project = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  _count?: { issues: number };
};

export type Issue = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: Priority;
  assignee: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
  comments?: Comment[];
  project?: Pick<Project, 'id' | 'name' | 'key'>;
};

export type Comment = {
  id: string;
  issueId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Board = {
  projectId: string;
  columns: Record<IssueStatus, Issue[]>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),
  listProjects: () => request<Project[]>('/api/projects'),
  createProject: (body: { name: string; key: string; description?: string }) =>
    request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(body) }),
  getBoard: (projectId: string) => request<Board>(`/api/projects/${projectId}/board`),
  createIssue: (
    projectId: string,
    body: { title: string; description?: string; priority?: Priority; assignee?: string },
  ) =>
    request<Issue>(`/api/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateIssueStatus: (issueId: string, status: IssueStatus) =>
    request<Issue>(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getIssue: (issueId: string) => request<Issue>(`/api/issues/${issueId}`),
  addComment: (issueId: string, body: { author: string; body: string }) =>
    request<Comment>(`/api/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
