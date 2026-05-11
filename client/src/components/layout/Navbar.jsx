import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext } from 'react';
import { CacheContext } from '../../context/CacheContext';

function Navbar({ onInfoClick }) {
  const { user, logout } = useAuth();
  const cache = useContext(CacheContext);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    cache.clear();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">◆</span>
        <span className="brand-text">{user.name}</span>
      </div>

      <nav className="navbar-links">
        <button
          type="button"
          className="nav-link nav-link-button"
          onClick={onInfoClick}
        >
          Info
        </button>
        <NavLink
          to={`/users/${user.id}/todos`}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          Todos
        </NavLink>
        <NavLink
          to={`/users/${user.id}/posts`}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          Posts
        </NavLink>
        <NavLink
          to={`/users/${user.id}/albums`}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link-active' : ''}`
          }
        >
          Albums
        </NavLink>
        <button
          type="button"
          className="nav-link nav-link-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
