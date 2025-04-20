import { Link, useNavigate, useLocation } from "react-router-dom";
import "./style/AdminNav.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    console.log("User logged out");
    navigate("/login"); // Redirect to the login page after logout
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="common-nav">
      <div className="common-nav-logo">Alumni meet
      <div className="roleTag">
          Admin
        </div>
      </div>
      <ul className="common-nav-list">
        <li className="common-nav-list-items">
          <Link
            to="/admin/user-management"
            className={
              isActive("/admin/user-management")
                ? "active"
                : "" + "common-nav-link"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
            </svg>
            <p>User Management</p>
          </Link>
        </li>
        <li className="common-nav-list-items">
          <Link
            to="/admin/edit-event"
            className={
              isActive("/admin/edit-event") ? "active" : "" + "common-nav-link"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M440-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T520-640q0-33-23.5-56.5T440-720q-33 0-56.5 23.5T360-640q0 33 23.5 56.5T440-560ZM884-20 756-148q-21 12-45 20t-51 8q-75 0-127.5-52.5T480-300q0-75 52.5-127.5T660-480q75 0 127.5 52.5T840-300q0 27-8 51t-20 45L940-76l-56 56ZM660-200q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-540 40v-111q0-34 17-63t47-44q51-26 115-44t142-18q-12 18-20.5 38.5T407-359q-60 5-107 20.5T221-306q-10 5-15.5 14.5T200-271v31h207q5 22 13.5 42t20.5 38H120Zm320-480Zm-33 400Z" />
            </svg>
            <p>Edit Event</p>
          </Link>
        </li>
        <li className="common-nav-list-items">
          <Link
            to="/admin/CMS"
            className={
              isActive("/admin/CMS") ? "active" : "" + "common-nav-link"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z" />
            </svg>
            <p>CMS</p>
          </Link>
        </li>
        <li className="common-nav-list-items">
          <Link
            to="/admin/placement-info"
            className={
              isActive("/admin/placement-info")
                ? "active"
                : "" + "common-nav-link"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M160-240v-480 520-40Zm0 80q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v200h-80v-200H447l-80-80H160v480h200v80H160ZM584-56 440-200l144-144 56 57-87 87 87 87-56 57Zm192 0-56-57 87-87-87-87 56-57 144 144L776-56Z" />
            </svg>
            <p>Placement Info</p>
          </Link>
        </li>
        <li className="common-nav-list-items">
          <Link
            to="/admin/edit-top-companies"
            className={
              isActive("/admin/edit-top-companies")
                ? "active"
                : "" + "common-nav-link"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="m136-240-56-56 212-212q35-35 85-35t85 35l46 46q12 12 28.5 12t28.5-12l178-178H640v-80h240v240h-80v-103L621-405q-35 35-85 35t-85-35l-47-47q-11-11-28-11t-28 11L136-240Z" />
            </svg>
            <p>Top Companies</p>
          </Link>
        </li>
      </ul>
      <div className="common-profile-and-logout">
        {/* <hr className="common-nav-ruler" /> */}
        <button className="common-logout" onClick={handleLogout} title="logout">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#e3e3e3"
          >
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
