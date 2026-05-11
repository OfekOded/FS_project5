import { useState } from 'react';
import Button from '../../components/common/Button';

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const save = () => {
    const t = draft.trim();
    if (t && t !== todo.title) {
      onUpdate(todo.id, { title: t });
    }
    setEditing(false);
  };

  return (
    <li className={`todo-item ${todo.completed ? 'todo-done' : ''}`}>
      <span className="todo-id">#{todo.id}</span>

      <input
        type="checkbox"
        className="todo-checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
      />

      {editing ? (
        <input
          type="text"
          className="todo-edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') {
              setDraft(todo.title);
              setEditing(false);
            }
          }}
          autoFocus
        />
      ) : (
        <span
          className="todo-title"
          onDoubleClick={() => setEditing(true)}
          title="Double-click to edit"
        >
          {todo.title}
        </span>
      )}

      <div className="todo-actions">
        <Button
          variant="ghost"
          onClick={() => setEditing(true)}
          aria-label="Edit"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete"
        >
          Delete
        </Button>
      </div>
    </li>
  );
}

export default TodoItem;
