import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import InfoModal from './InfoModal';
import { useAuth } from '../../hooks/useAuth';

function HomePage() {
  const { user } = useAuth();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="page-shell">
      <Navbar onInfoClick={() => setInfoOpen(true)} />

      <main className="home-main">
        <section className="home-hero">
          <p className="home-eyebrow">Welcome back</p>
          <h1 className="home-greeting">{user.name}</h1>
          <p className="home-tagline">
            Manage your todos, posts and photo albums — all in one place.
          </p>
        </section>

        <section className="home-tiles">
          <Link to={`/users/${user.id}/todos`} className="home-tile tile-todos">
            <div className="tile-icon">✓</div>
            <h2 className="tile-title">Todos</h2>
            <p className="tile-desc">
              Track tasks, mark them done, search and sort.
            </p>
            <span className="tile-arrow">→</span>
          </Link>

          <Link to={`/users/${user.id}/posts`} className="home-tile tile-posts">
            <div className="tile-icon">✎</div>
            <h2 className="tile-title">Posts</h2>
            <p className="tile-desc">
              Write, edit, and discuss with comments.
            </p>
            <span className="tile-arrow">→</span>
          </Link>

          <Link to={`/users/${user.id}/albums`} className="home-tile tile-albums">
            <div className="tile-icon">▣</div>
            <h2 className="tile-title">Albums</h2>
            <p className="tile-desc">
              Organize your photos in beautiful albums.
            </p>
            <span className="tile-arrow">→</span>
          </Link>
        </section>
      </main>

      <InfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
        user={user}
      />
    </div>
  );
}

export default HomePage;
