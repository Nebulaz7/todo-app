import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/SignIn.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Component to handle /dashboard redirect
const DashboardRedirect = () => {
  // This will redirect users from /dashboard to /signin
  // The signin page will handle the proper redirection to /dashboard/:id
  return <Navigate to="/signin" replace />;
};

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signin", element: <SignIn /> },
  { path: "/dashboard", element: <DashboardRedirect /> }, // Handle /dashboard without ID
  { path: "/dashboard/:id", element: <Dashboard /> },
  { path: "*", element: <NotFoundPage /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
