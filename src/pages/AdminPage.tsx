import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'

export function AdminPage({ isAdmin }: { isAdmin: boolean }) {
  const location = useLocation()
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return (
    <>
      {location.pathname === '/admin' && (
        <ol>
          <li>
            <Link to="/admin/criteria-annotation-verification">
              Criteria Annotation Verification
            </Link>
          </li>
          <li>
            <Link to="/admin/criteria-value-assignment">
              Criteria Value Assignment
            </Link>
          </li>
          <li>
            <Link to="/admin/input-form-builder">Input Form Builder</Link>
          </li>
          <li>
            <Link to="/admin/boolean-logic-builder">Boolean Logic Builder</Link>
          </li>
        </ol>
      )}
      <Outlet />
    </>
  )
}
