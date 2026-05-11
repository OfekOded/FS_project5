import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { commentService } from '../../api/commentService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

function CommentSection({ post }) {
  const { user } = useAuth();
  const {
    data: comments,
    loading,
    error,
    setData,
  } = useFetch(`comments:post:${post.id}`, () =>
    commentService.getByPost(post.id)
  );

  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    const created = await commentService.create({
      postId: post.id,
      userId: user.id, 
      name: user.name,
      email: user.email,
      body,
    });
    setData((prev) => [...(prev || []), created]);
    setDraft('');
  };

  const handleDelete = async (comment) => {
    if (comment.userId !== user.id) return;
    await commentService.remove(comment.id);
    setData((prev) => prev.filter((c) => c.id !== comment.id));
  };

  const handleStartEdit = (comment) => {
    if (comment.userId !== user.id) return;
    setEditing(comment.id);
    setEditDraft(comment.body);
  };

  const handleSaveEdit = async (comment) => {
    const body = editDraft.trim();
    if (!body) return;
    const updated = await commentService.update(comment.id, {
      ...comment,
      body,
    });
    setData((prev) =>
      prev.map((c) => (c.id === comment.id ? updated : c))
    );
    setEditing(null);
  };

  if (loading) return <Loader text="Loading comments…" />;
  if (error) return <p className="page-error">Could not load comments.</p>;

  return (
    <div className="comment-section">
      <h4 className="comment-heading">Comments ({comments?.length || 0})</h4>

      <ul className="comment-list">
        {(comments || []).map((c) => {
          const isMine = c.userId === user.id;
          const isEditing = editing === c.id;
          return (
            <li
              key={c.id}
              className={`comment-item ${isMine ? 'comment-mine' : ''}`}
            >
              <div className="comment-meta">
                <span className="comment-author">{c.name}</span>
                <span className="comment-email">{c.email}</span>
                {isMine && <span className="comment-badge">you</span>}
              </div>

              {isEditing ? (
                <>
                  <textarea
                    className="comment-edit-input"
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                  />
                  <div className="comment-actions">
                    <Button onClick={() => handleSaveEdit(c)}>Save</Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="comment-body">{c.body}</p>
                  {isMine && (
                    <div className="comment-actions">
                      <Button
                        variant="ghost"
                        onClick={() => handleStartEdit(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(c)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      <form className="comment-add-form" onSubmit={handleAdd}>
        <textarea
          className="comment-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment…"
          rows={3}
        />
        <Button type="submit" disabled={!draft.trim()}>
          Post comment
        </Button>
      </form>
    </div>
  );
}

export default CommentSection;
