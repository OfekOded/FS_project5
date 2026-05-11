import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import InfoModal from '../Home/InfoModal';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import { albumService } from '../../api/albumService';


function AlbumsPage() {
  const { user } = useAuth();
  const [infoOpen, setInfoOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchField = searchParams.get('field') || 'title';
  const searchValue = searchParams.get('q') || '';

  const setParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (!value) next.delete(key);
      else next.set(key, value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const {
    data: albums,
    loading,
    error,
    setData,
  } = useFetch(`albums:${user.id}`, () => albumService.getByUser(user.id));

  const [showAddForm, setShowAddForm] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');

  const visible = useMemo(() => {
    if (!albums) return [];
    if (!searchValue.trim()) return albums;
    const q = searchValue.trim().toLowerCase();
    return albums.filter((a) => {
      if (searchField === 'id') return String(a.id) === q;
      if (searchField === 'title') return a.title.toLowerCase().includes(q);
      return true;
    });
  }, [albums, searchField, searchValue]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const t = draftTitle.trim();
    if (!t) return;
    const created = await albumService.create({
      userId: user.id,
      title: t,
    });
    setData((prev) => [...(prev || []), created]);
    setDraftTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="page-shell">
      <Navbar onInfoClick={() => setInfoOpen(true)} />

      <main className="page-main">
        <header className="page-header">
          <h1 className="page-title">Albums</h1>
          <p className="page-subtitle">
            {albums ? `${albums.length} albums` : 'Loading…'}
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
            {showAddForm ? '× Cancel' : '+ New album'}
          </Button>
        </div>

        {showAddForm && (
          <form className="album-add-form" onSubmit={handleAdd}>
            <Input
              name="albumTitle"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Album title"
              required
            />
            <Button type="submit">Create</Button>
          </form>
        )}

        {loading && <Loader text="Loading albums…" />}
        {error && <p className="page-error">Could not load albums.</p>}

        {!loading && !error && (
          <ul className="album-grid">
            {visible.length === 0 && (
              <li className="empty-state">No matching albums.</li>
            )}
            {visible.map((a) => (
              <li key={a.id} className="album-card">
                <Link
                  to={`/users/${user.id}/albums/${a.id}/photos`}
                  className="album-link"
                >
                  <div className="album-cover">
                    <span className="album-cover-icon">▣</span>
                  </div>
                  <div className="album-meta">
                    <span className="album-id">#{a.id}</span>
                    <span className="album-title">{a.title}</span>
                  </div>
                </Link>
              </li>
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

export default AlbumsPage;
