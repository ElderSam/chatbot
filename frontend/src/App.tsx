import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';

import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import CreateChatPage from './pages/CreateChatPage';
import ChatPage from './pages/ChatPage';

import './App.css';

// Not Found component
const NotFound = () => (
  <div style={{ textAlign: 'center', marginTop: '4rem' }}>
    <h2>Página não encontrada</h2>
    <p>Verifique o endereço ou volte para a Home.</p>
  </div>
);

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  notFoundComponent: NotFound,
});

// Child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const homeAliasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
});

const createUserRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-user',
  component: UserPage,
});

const createChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-chat',
  component: CreateChatPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$conversation_id',
  component: ChatPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  homeAliasRoute,
  createUserRoute,
  createChatRoute,
  chatRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
