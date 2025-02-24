import { NavLink, Navigate, Outlet } from 'react-router-dom'

export function AdminPage({ isAdmin }: { isAdmin: boolean }) {
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <nav className="bg-gray-100 p-4 mb-4">
        <ul className="flex list-none m-0 p-0 justify-evenly">
          <li>
            <NavLink
              to="/admin/criteria-annotation-verification"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-700 underline focus:ring-0 focus:ring-offset-0'
                  : 'text-blue-600 hover:underline focus:ring-0 focus:ring-offset-0'
              }
            >
              Criteria Annotation Verification
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/criteria-value-assignment"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-700 underline focus:ring-0 focus:ring-offset-0'
                  : 'text-blue-600 hover:underline focus:ring-0 focus:ring-offset-0'
              }
            >
              Criteria Value Assignment
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/input-form-builder"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-700 underline focus:ring-0 focus:ring-offset-0'
                  : 'text-blue-600 hover:underline focus:ring-0 focus:ring-offset-0'
              }
            >
              Input Form Builder
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/boolean-logic-builder"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-700 underline focus:ring-0 focus:ring-offset-0'
                  : 'text-blue-600 hover:underline focus:ring-0 focus:ring-offset-0'
              }
            >
              Boolean Logic Builder
            </NavLink>
          </li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  )
}
