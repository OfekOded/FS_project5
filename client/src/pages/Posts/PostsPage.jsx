import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import InfoModal from '../Home/InfoModal';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import CommentSection from './CommentSection';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { postService } from '../../api/postService';


function PostsPage() {
  const { user } = useAuth();
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedId = Number(searchParams.get('post')) || null;
  const showComments = searchParams.get('comments') === '1';
  const searchField = searchParams.get('field') || 'title';
  const searchValue = searchParams.get('q') || '';


  const setParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setParam = useCallback(
    (key, value) => setParams({ [key]: value }),
    [setParams]
  );

  const {
    data: posts,
    loading,
    error,
    setData,
  } = useFetch(`posts:${user.id}`, () => postService.getByUser(user.id));

  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [editing, setEditing] = useState(null); // post id being edited
  const [editDraft, setEditDraft] = useState({ title: '', body: '' });

  // ----- Filtered list -----------------------------------------
  const visible = useMemo(() => {
    if (!posts) return [];
    if (!searchValue.trim()) return posts;
    const q = searchValue.trim().toLowerCase();
    return posts.filter((p) => {
      if (searchField === 'id') return String(p.id) === q;
      if (searchField === 'title') return p.title.toLowerCase().includes(q);
      return true;
    });
  }, [posts, searchField, searchValue]);

  const selectedPost = posts?.find((p) => p.id === selectedId) || null;

  // ----- Mutations --------------------------------------------
  const handleAdd = async (e) => {
    e.preventDefault();
    const t = draft.title.trim();
    const b = draft.body.trim();
    if (!t || !b) return;
    const created = await postService.create({
      userId: user.id,
      title: t,
      body: b,
    });
    setData((prev) => [...(prev || []), created]);
    setDraft({ title: '', body: '' });
    setShowAddForm(false);
  };

  const handleStartEdit = (p) => {
    setEditing(p.id);
    setEditDraft({ title: p.title, body: p.body });
  };

  const handleSaveEdit = async (post) => {
    const t = editDraft.title.trim();
    const b = editDraft.body.trim();
    if (!t || !b) return;
    const updated = await postService.update(post.id, {
      ...post,
      title: t,
      body: b,
    });
    setData((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    setEditing(null);
  };

  const handleDelete = async (id) => {
    await postService.remove(id);
    setData((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) {
      setParams({ post: '', comments: '' });
    }
  };

  return (
    <div className="page-shell">
      <Navbar onInfoClick={() => setInfoOpen(true)} />

      <main className="page-main posts-layout">
        <header className="page-header">
          <h1 className="page-title">Posts</h1>
          <p className="page-subtitle">
            {posts ? `${posts.length} posts` : 'Loading…'}
          </p>
        </header>

        <div className="posts-toolbar">
          <div className="toolbar-group">
            <label className="toolbar-label">Search by</label>
            <select
              className="toolbar-select"
              value={searchField}
              onChange={(e) => setParam('field', e.target.value)}
            >
              <option value="id">ID</option>
              <option value="title">Title</option>
            </select>
            <input
              className="toolbar-input"
              type="text"
              placeholder="Type to filter…"
              value={searchValue}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? '× Cancel' : '+ New post'}
          </Button>
        </div>

        {showAddForm && (
          <form className="post-add-form" onSubmit={handleAdd}>
            <Input
              name="title"
              label="Title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Give your post a title"
              required
            />
            <label className="input-label">Body</label>
            <textarea
              className="input-field input-textarea"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="What's on your mind?"
              rows={4}
            />
            <Button type="submit">Publish</Button>
          </form>
        )}

        {loading && <Loader text="Loading posts…" />}
        {error && <p className="page-error">Could not load posts.</p>}

        {!loading && !error && (
          <div className="posts-grid">
            <ul className="post-list">
              {visible.length === 0 && (
                <li className="empty-state">No matching posts.</li>
              )}
              {visible.map((p) => (
                <li
                  key={p.id}
                  className={`post-card ${
                    p.id === selectedId ? 'post-card-active' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="post-card-button"
                    onClick={() =>
                      setParams({ post: p.id, comments: '' })
                    }
                  >
                    <span className="post-card-id">#{p.id}</span>
                    <span className="post-card-title">{p.title}</span>
                  </button>
                  <div className="post-card-actions">
                    <Button
                      variant="ghost"
                      onClick={() => handleStartEdit(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Del
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="post-detail">
              {!selectedPost && (
                <div className="empty-state-detail">
                  <p>Pick a post on the left to see its content.</p>
                </div>
              )}
              {selectedPost && editing === selectedPost.id && (
                <div className="post-edit-card">
                  <Input
                    name="editTitle"
                    label="Title"
                    value={editDraft.title}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, title: e.target.value })
                    }
                  />
                  <label className="input-label">Body</label>
                  <textarea
                    className="input-field input-textarea"
                    value={editDraft.body}
                    onChange={(e) =>
                      setEditDraft({ ...editDraft, body: e.target.value })
                    }
                    rows={6}
                  />
                  <div className="post-edit-actions">
                    <Button onClick={() => handleSaveEdit(selectedPost)}>
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {selectedPost && editing !== selectedPost.id && (
                <article className="post-article">
                  <p className="post-article-id">Post #{selectedPost.id}</p>
                  <h2 className="post-article-title">{selectedPost.title}</h2>
                  <p className="post-article-body">{selectedPost.body}</p>

                  <div className="post-article-actions">
                    <Button
                      onClick={() =>
                        setParam('comments', showComments ? '' : '1')
                      }
                    >
                      {showComments ? 'Hide comments' : 'Show comments'}
                    </Button>
                  </div>

                  {showComments && <CommentSection post={selectedPost} />}
                </article>
              )}
            </aside>
          </div>
        )}
      </main>

      <InfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        user={user}
      />
    </div>
  );
}

export default PostsPage;
