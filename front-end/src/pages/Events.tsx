import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { mainUrlPrefix } from "../main";
import "./style/Events.css"; // Ensure you have a CSS file for styling

interface Event {
  _id: string;
  eventTitle: string;
  eventDescription: string;
  applyLink: string;
  postedBy: string;
  eventImg: {
    data: string;
    contentType: string;
  };
}

interface FormData {
  eventImg: File | null;
  eventTitle: string;
  eventDescription: string;
  applyLink: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<FormData>({
    eventImg: null,
    eventTitle: "",
    eventDescription: "",
    applyLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"All" | "Yours">("All");
  const role = sessionStorage.getItem("role");
  const currentUserName = sessionStorage.getItem("userName");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${mainUrlPrefix}/event/getAllEvents`);
      setEvents(response.data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddDialog = () => {
    setCurrentEvent(null);
    setFormData({
      eventImg: null,
      eventTitle: "",
      eventDescription: "",
      applyLink: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setCurrentEvent(event);
    setFormData({
      eventImg: null,
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription,
      applyLink: event.applyLink,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      if (formData.eventImg instanceof File) {
        formDataToSend.append("eventImg", formData.eventImg);
      }
      formDataToSend.append("eventTitle", formData.eventTitle);
      formDataToSend.append("eventDescription", formData.eventDescription);
      formDataToSend.append("applyLink", formData.applyLink);

      if (!currentEvent && !formData.eventImg) {
        setError("Event image is required.");
        return;
      }

      if (currentEvent) {
        await axios.put(
          `${mainUrlPrefix}/event/editEvent/${currentEvent._id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        alert("Event updated successfully!");
      } else {
      await axios.post(`${mainUrlPrefix}/event/addEvent/${currentUserName}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Event added successfully!");
      }

      setIsDialogOpen(false);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      setError("Failed to save event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setLoading(true);
      setError("");

      try {
        await axios.delete(`${mainUrlPrefix}/event/deleteEvent/${id}`);
        alert("Event deleted successfully!");
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        setError("Failed to delete event. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const getImageUrl = (event: Event) => {
    if (!event.eventImg) return "https://via.placeholder.com/150";

    let imageData = event.eventImg.data;

    if (typeof imageData !== "string") {
      try {
        const uint8Array = new Uint8Array(Object.values(imageData));
        imageData = btoa(
          String.fromCharCode.apply(null, Array.from(uint8Array))
        );
      } catch (error) {
        console.error("Error converting image data:", error);
        return "https://via.placeholder.com/150";
      }
    }

    return `data:${event.eventImg.contentType};base64,${imageData}`;
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  const filteredEvents = events.filter((event) => {
    if (tab === "All") return true;
    if (tab === "Yours" && event.postedBy === currentUserName) return true;
    return false;
  });

  return (
    <div className="events-container">
      <div className="tabs">
        <button
          className={`tab ${tab === "All" ? "active" : ""}`}
          onClick={() => setTab("All")}
        >
          Explore
        </button>
        {role === "alumini" && (
          <div>
            <button
              className={`tab ${tab === "Yours" ? "active" : ""}`}
              onClick={() => setTab("Yours")}
            >
              Yours
            </button>
          </div>
        )}
      </div>
      {role === "alumini" && tab === "Yours" && <button className="add-community" style={{margin: "1rem 0"}} onClick={openAddDialog}>
        Add Events
      </button>}
      <ul id="events-body">
        {filteredEvents.length === 0 ? (
          <p>No events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <li key={event._id}>
              <div className="event-item">
                <img src={getImageUrl(event)} alt="event image" />
                <div className="event-title">{event.eventTitle}</div>
                <div className="event-description"><p>by {(event.postedBy) ? event.postedBy : "College"}</p></div>
                <div className="event-description">
                  {event.eventDescription}
                </div>
                <a
                  href={event.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="register-btn-events"
                >
                  Register
                </a>
                {event.postedBy === currentUserName && (
                  <div className="event-actions">
                    <button onClick={() => openEditDialog(event)}>Edit</button>
                    <button onClick={() => handleDelete(event._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {isDialogOpen && (
        <div className="dialog-overlay" onClick={() => setIsDialogOpen(false)}>
          <dialog className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h2>{currentEvent ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Image</label>
                <input
                  type="file"
                  name="eventImg"
                  accept=".jpg,.png,.jpeg"
                  onChange={(e: any) =>
                    setFormData({ ...formData, eventImg: e.target.files[0] })
                  }
                />
                {currentEvent && (
                  <img
                    src={getImageUrl(currentEvent)}
                    alt="current event"
                    style={{ width: "100px", marginTop: "10px" }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Event Description</label>
                <textarea
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apply Link</label>
                <input
                  type="url"
                  name="applyLink"
                  value={formData.applyLink}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="btn-grp">
                <button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}
