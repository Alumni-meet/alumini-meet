import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter as Bro, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Register from "./pages/auth/Register.tsx";
import Login from "./pages/auth/Login.tsx";
import Batches from "./pages/Batches.tsx";
import ProfileNew from "./pages/ProfileNew.tsx";
import Projects from "./pages/Projects.tsx";
import Placement from "./pages/Placement.tsx";
import Mentorship from "./pages/Mentorship.tsx";
import Events from "./pages/Events.tsx";
import UserManagement from "./pages/admin/UserManagement.tsx";
import AdminHome from "./pages/admin/AdminHome.tsx";
import PlacementInfo from "./pages/admin/PlacementInfo.tsx";
import Refferral from "./pages/Refferral.tsx";
import EditEvent from "./pages/admin/EditEvents.tsx";
import ProtectedRoute from "./pages/ProtectedRoute.tsx";
import { StrictMode } from "react";
import DefaultHome from "./pages/DefaultHome.tsx";
import ContentModeration from "./pages/admin/ContentModeration.tsx";
import TopCompanies from "./pages/TopCompanies.tsx";
import EditTopCompanies from "./pages/admin/EditTopCompanies.tsx";

const router = Bro([
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        path: "home",
        Component: Home,
        children: [
          {
            path: "",
            Component: DefaultHome,
          },
          {
            path: "batches",
            Component: Batches,
          },
          {
            path: "profile",
            Component: ProfileNew,
          },
          {
            path: "Refferral",
            Component: Refferral,
          },
          {
            path: "placements",
            Component: Placement,
          },
          {
            path: "mentorship",
            Component: Mentorship,
          },
          {
            path: "projects",
            Component: Projects,
          },
          {
            path: "event",
            Component: Events,
          },
          {
            path: "top-companies",
            Component: TopCompanies,
          },
        ],
      },
    ],
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminHome,
    children: [
      {
        path: "user-management",
        Component: UserManagement,
      },
      {
        path: "CMS",
        Component: ContentModeration,
      },
      {
        path: "placement-info",
        Component: PlacementInfo,
      },
      {
        path: "edit-event",
        Component: EditEvent,
      },
      {
        path: "edit-top-companies",
        Component: EditTopCompanies,
      },
    ],
  },
]);

export const mainUrlPrefix = "https://alumini-meet-backend-lo0r.onrender.com" //  "http://localhost:8000"; //  
export const mainPythonUrl = "https://alumini-meet.onrender.com"  //  "http://127.0.0.1:5000"; //  

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
