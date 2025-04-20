import React, { useState } from "react";
import "./style/Register.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import axios from "axios";
import { mainUrlPrefix } from "../../main";

export default function Register() {
  const SendOTPLinkBackend = `${mainUrlPrefix}/user/sendOtp`;
  const VerificationLinkBackend = `${mainUrlPrefix}/user/verifyOtp`;
  const [, setRole] = useState("");
  const [next, setNext] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    batch: "",
    dept: "",
    password: "",
    retypePassword: "",
    phone: "",
    gender: "",
    role: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    setFormData((prevData) => ({
      ...prevData,
      role: selectedRole,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.retypePassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(SendOTPLinkBackend, { email: formData.email });
      setIsVerificationDialogOpen(true);
      setRegisteredEmail(formData.email);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Error sending OTP.");
      } else {
        alert("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Verify OTP and register user
      const response = await axios.post(VerificationLinkBackend, {
        ...formData,
        code: verificationCode,
      });

      if (response.data.status === "Success") {
        alert("Verification successful! Account created.");
        setIsVerificationDialogOpen(false); // Close OTP dialog

        // Reset form and state
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          batch: "",
          dept: "",
          password: "",
          retypePassword: "",
          phone: "",
          gender: "",
          role: "",
        });
        setRole("");
        setNext(false);

        // Redirect to login after successful registration
        window.location.href = "/login";
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setVerificationError(
          error.response?.data?.message || "Verification failed."
        );
      } else {
        setVerificationError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-body">
      <div className="register-container">
        <aside className="logo">
          <img src={logo} alt="college logo" />
        </aside>
        <aside className="register-form">
          <form onSubmit={handleSubmit}>
            {!next && (
              <>
                <h1>Create a new account</h1>
                <p className="descripton">
                  Join our platform and connect with opportunities
                </p>
                <button
                  className="student-role"
                  type="button"
                  onClick={() => {
                    handleRoleChange("user");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18px"
                    viewBox="0 -960 960 960"
                    width="18px"
                    fill="#1f1f1f"
                  >
                    <path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z" />
                  </svg>
                  <p>
                    <b>Sign up as a student</b>
                    <br />
                    Compete, learn, and apply for jobs and internships
                  </p>
                </button>
                <button
                  className="student-role"
                  type="button"
                  onClick={() => {
                    handleRoleChange("alumini");
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#1f1f1f"
                  >
                    <path d="M160-80v-240h120v240H160Zm200 0v-476q-50 17-65 62.5T280-400h-80q0-128 75-204t205-76q100 0 150-49.5T680-880h80q0 88-37.5 157.5T600-624v544h-80v-240h-80v240h-80Zm120-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z" />
                  </svg>
                  <p>
                    <b>Sign up as a alumini</b>
                    <br />
                    Compete, learn, and apply for jobs and internships
                  </p>
                </button>
                <button
                  className="next-btn"
                  type="button"
                  onClick={() => {
                    setNext(true);
                  }}
                >
                  Next
                </button>
                <p className="redirect">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </>
            )}
            {next && (
              <section className="register-form-portion">
                <div onClick={() => setNext(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#9e9e9e"
                  >
                    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                  </svg>
                </div>
                <label className="username">
                  <label>
                    First Name
                    <input
                      type="text"
                      placeholder="First name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Last Name
                    <input
                      type="text"
                      placeholder="Last name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </label>
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Batch
                  <input
                    type="text"
                    placeholder="Enter your batch year"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Department
                  <input
                    type="text"
                    placeholder="Enter your dept"
                    name="dept"
                    value={formData.dept}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    placeholder="Enter your password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Retype Password
                  <input
                    type="password"
                    placeholder="Retype your password"
                    name="retypePassword"
                    value={formData.retypePassword}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="gender">
                  Gender
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option disabled value="">
                      [not selected]
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Other</option>
                  </select>
                </label>
                <input
                  type="submit"
                  value={isLoading ? "Processing..." : "Register"}
                  disabled={isLoading}
                />
                <p className="redirect">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </section>
            )}
          </form>
        </aside>
      </div>

      <div
        className={`verification-dialog-overlay ${
          isVerificationDialogOpen ? "active" : ""
        }`}
      >
        <div className="verification-dialog">
          <h2>Email Verification</h2>
          <p>We've sent a 4-digit code to {registeredEmail}</p>
          <form onSubmit={handleVerificationSubmit}>
            <input
              type="number"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => {
                const val = e.target.value.slice(0, 4);
                setVerificationCode(val);
                setVerificationError("");
              }}
              required
            />
            {verificationError && <p className="error">{verificationError}</p>}
            <div className="action-btns">
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    await axios.post(SendOTPLinkBackend, {
                      email: registeredEmail,
                    });
                    alert("New OTP sent!");
                  } catch (error) {
                    setVerificationError("Failed to resend OTP.");
                    console.error(error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend Code"}
              </button>
            </div>
            <button
              className="cancel"
              onClick={() => setIsVerificationDialogOpen(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
