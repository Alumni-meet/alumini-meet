import axios from "axios";
import { useEffect, useState } from "react";
import { mainUrlPrefix } from "../main";
import "./style/DefaultHome.css";
import RandomHexColor from "random-hex-color";
import { Link } from "react-router-dom";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  dept: string;
  gender: string;
  phoneNumber: number;
  skills: string[];
  bio: string;
  linkedIn: string;
  github: string;
  twitter: string;
  interests: string[];
  companyName: string;
  batch: number;
  role: string;
  userId: string;
}

interface Event {
  _id: string;
  eventTitle: string;
  eventDescription: string;
  date: string;
}

interface Project {
  _id: string;
  projectTitle: string;
  projectDescription: string;
}

export default function DefaultHome() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = sessionStorage.getItem("user");
        const response = await axios.get(
          `${mainUrlPrefix}/user/getUser/${userId}`
        );
        const updatedUser = response.data.userDetail;
        setUser(updatedUser);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${mainUrlPrefix}/event/getAllEvents`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${mainUrlPrefix}/project/getAllProjects`
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchUserProfile();
    fetchEvents();
    fetchProjects();
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="no-data">No user data found</div>;

  return (
    <div className="home-container">
      <div className="home-card user-details">
        <h2 className="home-title">{`${user.firstName} ${user.lastName}`}</h2>
        <p>
          <b>Email:</b> {user.email}
        </p>
        <p>
          <b>Education:</b> {user.dept}, {user.batch}
        </p>
        <div className="bio">
          <b>Bio:</b> {user.bio || "No bio available"}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="home-card event-details">
        <h2 className="home-title">Upcoming Events</h2>
        <div className="event-card-container">
          {events.length === 0 ? (
            <p>No upcoming events.</p>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="home-event-card"
                style={{ backgroundColor: RandomHexColor() + "22" }}
              >
                <h3>{event.eventTitle}</h3>
                <p>{event.eventDescription}</p>
              </div>
            ))
          )}
          <div className="knowMoreOverlay">
            <Link to="event"><button>Know More</button></Link>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="home-card project-details">
        <h2 className="home-title">Recent Projects</h2>
        <div className="project-card-container">
          {projects.length === 0 ? (
            <p>No featured projects.</p>
          ) : (
            projects.map((project) => (
              <div
                key={project._id}
                className="home-project-card"
                style={{ backgroundColor: RandomHexColor() + "22" }}
              >
                <h3>{project.projectTitle}</h3>
                <p>{project.projectDescription}</p>
              </div>
            ))
          )}
          <div className="knowMoreOverlay">
            <Link to="projects"><button>Know More</button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
