import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';

import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';

import './App.css';

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      {/* <div style={{position: 'fixed', top: 0, left: 0, background: '#ff0', color: '#000', zIndex: 9999, padding: 4}}>
        RootRoute Rendered
      </div> */}
      <Outlet />
    </>
  ),
});

// Child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const createUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-user',
  component: UserPage,
});

const routeTree = rootRoute.addChildren([indexRoute, createUserRoute]);

const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
