import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


function ProtectedRoute() {
  const { user } = useAuth();
  const params = useParams();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (params.userId && Number(params.userId) !== user.id) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
