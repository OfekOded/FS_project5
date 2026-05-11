import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import RegisterDetailsPage from './pages/Auth/RegisterDetailsPage';
import ProtectedRoute from './pages/Auth/ProtectedRoute';
import HomePage from './pages/Home/HomePage';
import TodosPage from './pages/Todos/TodosPage';
import PostsPage from './pages/Posts/PostsPage';
import AlbumsPage from './pages/Albums/AlbumsPage';
import AlbumPage from './pages/Albums/AlbumPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/details" element={<RegisterDetailsPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/users/:userId/todos" element={<TodosPage />} />
        <Route path="/users/:userId/posts" element={<PostsPage />} />
        <Route path="/users/:userId/albums" element={<AlbumsPage />} />
        <Route
          path="/users/:userId/albums/:albumId/photos"
          element={<AlbumPage />}
        />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
