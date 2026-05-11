import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import InfoModal from '../Home/InfoModal';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import { albumService } from '../../api/albumService';
import { photoService } from '../../api/photoService';
import { CacheContext } from '../../context/CacheContext';

const PAGE_SIZE = 8;

function AlbumPage() {
  const { user } = useAuth();
  const { albumId } = useParams();
  const navigate = useNavigate();
  const cache = useContext(CacheContext);

  const [infoOpen, setInfoOpen] = useState(false);
  const [album, setAlbum] = useState(() =>
    cache.get(`album:${albumId}`)
  );
  const [photos, setPhotos] = useState(
    () => cache.get(`photos:album:${albumId}`) || []
  );
  const [total, setTotal] = useState(
    () => cache.get(`photos:album:${albumId}:total`) ?? null
  );
  const [loading, setLoading] = useState(!album);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [photoDraft, setPhotoDraft] = useState({ title: '', url: '' });

  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editPhotoDraft, setEditPhotoDraft] = useState({ title: '', url: '' });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        let albumData = cache.get(`album:${albumId}`);
        if (!albumData) {
          albumData = await albumService.getById(albumId);
          cache.set(`album:${albumId}`, albumData);
        }


        if (albumData.userId !== user.id) {
          navigate('/home', { replace: true });
          return;
        }
        if (cancelled) return;
        setAlbum(albumData);

        let firstPage = cache.get(`photos:album:${albumId}:page:0`);
        if (!firstPage) {
          firstPage = await photoService.getByAlbumPage(
            albumId,
            0,
            PAGE_SIZE
          );
          cache.set(`photos:album:${albumId}:page:0`, firstPage);
        }

        let totalCount = cache.get(`photos:album:${albumId}:total`);
        if (totalCount === undefined) {
          totalCount = await photoService.getByAlbumCount(albumId);
          cache.set(`photos:album:${albumId}:total`, totalCount);
        }

        if (cancelled) return;
        setPhotos(firstPage);
        cache.set(`photos:album:${albumId}`, firstPage);
        setTotal(totalCount);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [albumId, cache, user.id, navigate]);

  // ----- Load next page ---------------------------------------
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const start = photos.length;
      const cacheKey = `photos:album:${albumId}:page:${start}`;
      let next = cache.get(cacheKey);
      if (!next) {
        next = await photoService.getByAlbumPage(albumId, start, PAGE_SIZE);
        cache.set(cacheKey, next);
      }
      const merged = [...photos, ...next];
      setPhotos(merged);
      cache.set(`photos:album:${albumId}`, merged);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  }, [photos, albumId, cache, loadingMore]);

  // ----- Photo CRUD -------------------------------------------
  const invalidatePhotos = () => cache.invalidate(`photos:album:${albumId}`);

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    const title = photoDraft.title.trim();
    const url = photoDraft.url.trim() || 'https://picsum.photos/600';
    if (!title) return;
    const created = await photoService.create({
      albumId: Number(albumId),
      title,
      url,
      thumbnailUrl: url,
    });
    const updatedList = [...photos, created];
    setPhotos(updatedList);
    setTotal((t) => (t === null ? null : t + 1));
    invalidatePhotos();
    cache.set(`photos:album:${albumId}`, updatedList);
    cache.set(`photos:album:${albumId}:total`, (total ?? photos.length) + 1);
    setPhotoDraft({ title: '', url: '' });
    setShowPhotoForm(false);
  };

  const handleStartEditPhoto = (photo) => {
    setEditingPhoto(photo.id);
    setEditPhotoDraft({ title: photo.title, url: photo.url });
  };

  const handleSaveEditPhoto = async (photo) => {
    const title = editPhotoDraft.title.trim();
    const url = editPhotoDraft.url.trim();
    if (!title || !url) return;
    const updated = await photoService.update(photo.id, {
      ...photo,
      title,
      url,
      thumbnailUrl: url,
    });
    const updatedList = photos.map((p) => (p.id === photo.id ? updated : p));
    setPhotos(updatedList);
    cache.set(`photos:album:${albumId}`, updatedList);
    setEditingPhoto(null);
  };

  const handleDeletePhoto = async (id) => {
    await photoService.remove(id);
    const updatedList = photos.filter((p) => p.id !== id);
    setPhotos(updatedList);
    setTotal((t) => (t === null ? null : Math.max(0, t - 1)));
    invalidatePhotos();
    cache.set(`photos:album:${albumId}`, updatedList);
    cache.set(
      `photos:album:${albumId}:total`,
      Math.max(0, (total ?? photos.length) - 1)
    );
  };

  const canLoadMore = total !== null && photos.length < total;

  return (
    <div className="page-shell">
      <Navbar onInfoClick={() => setInfoOpen(true)} />

      <main className="page-main">
        <Link to={`/users/${user.id}/albums`} className="back-link">
          ← Back to albums
        </Link>

        {loading && <Loader text="Loading album…" />}
        {error && <p className="page-error">Could not load album.</p>}

        {album && (
          <>
            <header className="page-header">
              <p className="album-tag">Album #{album.id}</p>
              <h1 className="page-title">{album.title}</h1>
              <p className="page-subtitle">
                {total !== null
                  ? `${photos.length} of ${total} photos loaded`
                  : `${photos.length} photos`}
              </p>
            </header>

            <div className="posts-toolbar">
              <Button onClick={() => setShowPhotoForm((v) => !v)}>
                {showPhotoForm ? '× Cancel' : '+ Add photo'}
              </Button>
            </div>

            {showPhotoForm && (
              <form className="photo-add-form" onSubmit={handleAddPhoto}>
                <Input
                  name="photoTitle"
                  label="Title"
                  value={photoDraft.title}
                  onChange={(e) =>
                    setPhotoDraft({ ...photoDraft, title: e.target.value })
                  }
                  required
                />
                <Input
                  name="photoUrl"
                  label="Image URL (optional)"
                  value={photoDraft.url}
                  onChange={(e) =>
                    setPhotoDraft({ ...photoDraft, url: e.target.value })
                  }
                  placeholder="https://…"
                />
                <Button type="submit">Add to album</Button>
              </form>
            )}

            <ul className="photo-grid">
              {photos.map((photo) => (
                <li key={photo.id} className="photo-card">
                  {editingPhoto === photo.id ? (
                    <div className="photo-edit">
                      <Input
                        name="editPhotoTitle"
                        label="Title"
                        value={editPhotoDraft.title}
                        onChange={(e) =>
                          setEditPhotoDraft({
                            ...editPhotoDraft,
                            title: e.target.value,
                          })
                        }
                      />
                      <Input
                        name="editPhotoUrl"
                        label="URL"
                        value={editPhotoDraft.url}
                        onChange={(e) =>
                          setEditPhotoDraft({
                            ...editPhotoDraft,
                            url: e.target.value,
                          })
                        }
                      />
                      <div className="photo-actions">
                        <Button onClick={() => handleSaveEditPhoto(photo)}>
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setEditingPhoto(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.title}
                        className="photo-image"
                        loading="lazy"
                      />
                      <p className="photo-title" title={photo.title}>
                        {photo.title}
                      </p>
                      <div className="photo-actions">
                        <Button
                          variant="ghost"
                          onClick={() => handleStartEditPhoto(photo)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeletePhoto(photo.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {canLoadMore && (
              <div className="load-more-row">
                <Button onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load more photos'}
                </Button>
              </div>
            )}
          </>
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

export default AlbumPage;
