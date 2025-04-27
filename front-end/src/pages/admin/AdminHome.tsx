import "./style/AdminHome.css";
import { Outlet } from "react-router-dom";
import AdminNav from "./AdminNav";
import { useState } from "react";

export default function AdminHome() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <div className="home-body">
      <button className="hambtn" onClick={() => setIsNavOpen(!isNavOpen)}>
        {!isNavOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#333"
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="red"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        )}
      </button>
      <div
        className={`common-navbar ${!isNavOpen ? "hidden" : ""}`}
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <AdminNav />
      </div>

      <div className="outlet">
        <Outlet />
      </div>
    </div>
  );
}
