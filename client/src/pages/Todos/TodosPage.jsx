import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import InfoModal from '../Home/InfoModal';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TodoItem from './TodoItem';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { todoService } from '../../api/todoService';


function TodosPage() {
  const { user } = useAuth();
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = searchParams.get('sort') || 'id';
  const searchField = searchParams.get('field') || 'title';
  const searchValue = searchParams.get('q') || '';

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const {
    data: todos,
    loading,
    error,
    setData,
  } = useFetch(`todos:${user.id}`, () => todoService.getByUser(user.id));

  const [newTitle, setNewTitle] = useState('');

  const visible = useMemo(() => {
    if (!todos) return [];
    let list = [...todos];

    if (searchValue.trim()) {
      const q = searchValue.trim().toLowerCase();
      list = list.filter((t) => {
        if (searchField === 'id') return String(t.id) === q;
        if (searchField === 'title') return t.title.toLowerCase().includes(q);
        if (searchField === 'completed') {
          const want = q === 'true' || q === '1' || q === 'yes' || q === 'done';
          return t.completed === want;
        }
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'id') return a.id - b.id;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'completed') {
        return Number(a.completed) - Number(b.completed);
      }
      return 0;
    });

    return list;
  }, [todos, searchField, searchValue, sortBy]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const created = await todoService.create({
      userId: user.id,
      title,
      completed: false,
    });
    setData((prev) => [...(prev || []), created]);
    setNewTitle('');
  };

  const handleToggle = async (todo) => {
    const updated = await todoService.patch(todo.id, {
      completed: !todo.completed,
    });
    setData((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, ...updated } : t))
    );
  };

  const handleUpdate = async (id, fields) => {
    const todo = todos.find((t) => t.id === id);
    const updated = await todoService.update(id, { ...todo, ...fields });
    setData((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id) => {
    await todoService.remove(id);
    setData((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="page-shell">
      <Navbar onInfoClick={() => setInfoOpen(true)} />

      <main className="page-main">
        <header className="page-header">
          <h1 className="page-title">Todos</h1>
          <p className="page-subtitle">
            {todos ? `${todos.length} tasks` : 'Loading…'} ·{' '}
            <span className="page-subtitle-strong">
              {todos ? todos.filter((t) => t.completed).length : 0} done
            </span>
          </p>
        </header>

        {/* --- Add form -------------------------------------------- */}
        <form className="todo-add-form" onSubmit={handleAdd}>
          <Input
            name="newTitle"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to get done?"
          />
          <Button type="submit">+ Add</Button>
        </form>

        {/* --- Search + Sort controls ----------------------------- */}
        <div className="todo-toolbar">
          <div className="toolbar-group">
            <label className="toolbar-label">Search by</label>
            <select
              className="toolbar-select"
              value={searchField}
              onChange={(e) => setParam('field', e.target.value)}
            >
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="completed">Completed (true/false)</option>
            </select>
            <input
              className="toolbar-input"
              type="text"
              placeholder="Type to filter…"
              value={searchValue}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>

          <div className="toolbar-group">
            <label className="toolbar-label">Sort by</label>
            <select
              className="toolbar-select"
              value={sortBy}
              onChange={(e) => setParam('sort', e.target.value)}
            >
              <option value="id">ID</option>
              <option value="title">Title</option>
              <option value="completed">Status</option>
            </select>
          </div>
        </div>

        {/* --- The list ------------------------------------------- */}
        {loading && <Loader text="Fetching todos…" />}
        {error && <p className="page-error">Could not load todos.</p>}
        {!loading && !error && (
          <ul className="todo-list">
            {visible.length === 0 && (
              <li className="empty-state">No matching todos.</li>
            )}
            {visible.map((t) => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </ul>
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

export default TodosPage;
