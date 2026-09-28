import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  api,
  type Board,
  type Issue,
  type IssueStatus,
  type Priority,
  type Project,
} from './api';
import './App.css';

const COLUMNS: { id: IssueStatus; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'IN_REVIEW', label: 'In Review' },
  { id: 'TESTING', label: 'Testing' },
  { id: 'DONE', label: 'Done' },
];

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [board, setBoard] = useState<Board | null>(null);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newAssignee, setNewAssignee] = useState('');

  const [commentAuthor, setCommentAuthor] = useState('You');
  const [commentBody, setCommentBody] = useState('');

  const refreshProjects = useCallback(async () => {
    const list = await api.listProjects();
    setProjects(list);
    if (!projectId && list[0]) setProjectId(list[0].id);
    return list;
  }, [projectId]);

  const refreshBoard = useCallback(async (id: string) => {
    const next = await api.getBoard(id);
    setBoard(next);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await api.health();
        const list = await refreshProjects();
        const id = projectId || list[0]?.id;
        if (id) await refreshBoard(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    refreshBoard(projectId).catch((e) =>
      setError(e instanceof Error ? e.message : String(e)),
    );
  }, [projectId, refreshBoard]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId],
  );

  async function handleCreateIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !newTitle.trim()) return;
    try {
      await api.createIssue(projectId, {
        title: newTitle.trim(),
        priority: newPriority,
        assignee: newAssignee.trim() || undefined,
      });
      setNewTitle('');
      setNewAssignee('');
      await refreshBoard(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function moveIssue(issue: Issue, status: IssueStatus) {
    if (issue.status === status) return;
    try {
      await api.updateIssueStatus(issue.id, status);
      await refreshBoard(projectId);
      if (selected?.id === issue.id) {
        setSelected(await api.getIssue(issue.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function openIssue(issue: Issue) {
    try {
      setSelected(await api.getIssue(issue.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !commentBody.trim()) return;
    try {
      await api.addComment(selected.id, {
        author: commentAuthor.trim() || 'You',
        body: commentBody.trim(),
      });
      setCommentBody('');
      setSelected(await api.getIssue(selected.id));
      await refreshBoard(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Rosetta sample</p>
          <h1>Task Board</h1>
        </div>
        <label className="project-picker">
          Project
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!projects.length}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.key} — {p.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error && (
        <div className="banner error" role="alert">
          <strong>API error</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {loading && <p className="muted">Loading…</p>}

      {!loading && activeProject && (
        <p className="muted">
          {activeProject.description ?? 'Kanban board backed by NestJS + Prisma'}
        </p>
      )}

      <form className="composer" onSubmit={handleCreateIssue}>
        <input
          placeholder="New issue title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as Priority)}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <input
          placeholder="Assignee (optional)"
          value={newAssignee}
          onChange={(e) => setNewAssignee(e.target.value)}
        />
        <button type="submit" disabled={!projectId}>
          Add issue
        </button>
      </form>

      <div className="board">
        {COLUMNS.map((col) => (
          <section key={col.id} className="column">
            <header>
              <h2>{col.label}</h2>
              <span>{board?.columns[col.id]?.length ?? 0}</span>
            </header>
            <div className="cards">
              {(board?.columns[col.id] ?? []).map((issue) => (
                <article key={issue.id} className="card">
                  <button
                    type="button"
                    className="card-main"
                    onClick={() => openIssue(issue)}
                  >
                    <span className={`priority ${issue.priority.toLowerCase()}`}>
                      {issue.priority}
                    </span>
                    <h3>{issue.title}</h3>
                    {issue.assignee && (
                      <p className="assignee">{issue.assignee}</p>
                    )}
                    {typeof issue._count?.comments === 'number' &&
                      issue._count.comments > 0 && (
                        <p className="meta">{issue._count.comments} comments</p>
                      )}
                  </button>
                  <label className="move">
                    Move to
                    <select
                      value={issue.status}
                      onChange={(e) =>
                        moveIssue(issue, e.target.value as IssueStatus)
                      }
                    >
                      {COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Issue detail"
          >
            <button
              type="button"
              className="close"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            <p className={`priority ${selected.priority.toLowerCase()}`}>
              {selected.priority} · {selected.status.replace('_', ' ')}
            </p>
            <h2>{selected.title}</h2>
            <p className="muted">
              {selected.description || 'No description'}
            </p>
            {selected.assignee && <p>Assignee: {selected.assignee}</p>}

            <h3>Comments</h3>
            <ul className="comments">
              {(selected.comments ?? []).map((c) => (
                <li key={c.id}>
                  <strong>{c.author}</strong>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                  <p>{c.body}</p>
                </li>
              ))}
              {(selected.comments ?? []).length === 0 && (
                <li className="muted">No comments yet</li>
              )}
            </ul>

            <form className="comment-form" onSubmit={submitComment}>
              <input
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Author"
                required
              />
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add a comment"
                required
                rows={3}
              />
              <button type="submit">Post comment</button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
