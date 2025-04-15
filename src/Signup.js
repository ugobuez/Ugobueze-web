import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", phone: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await axios.post("https://ugobueze-app.onrender.com/api/user", {
        name: "User",
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="d-flex my-5 py-5 justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
      <h1 className="text-center">  👑</h1>
      <small className="mx-5 fs-6 ">
        <i className='bx bx-check-shield fs-6 mx-1'></i>
Never resell your gift cards to third parties！
</small>
        <h4 className="text-center fs-2">SIGN UP</h4>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <Form onSubmit={handleSignup}>
        <div className="py-3">
        <small className=" text-muted">
          Create a new account
          </small>
        </div>
          <Form.Group className="mb-3">
            <Form.Label>Your Email*</Form.Label>
            <Form.Control type="email" name="email" placeholder="Enter your email" required value={formData.email} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password*</Form.Label>
            <Form.Control type="password" name="password" placeholder="Enter your password" required value={formData.password} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password*</Form.Label>
            <Form.Control type="password" name="confirmPassword" placeholder="Confirm password" required value={formData.confirmPassword} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Your Phone</Form.Label>
            <InputGroup>
              <InputGroup.Text>+234</InputGroup.Text>
              <Form.Control type="tel" name="phone" placeholder="Phone Number (Optional)" value={formData.phone} onChange={handleChange} />
            </InputGroup>
          </Form.Group>
          <button type="submit" className="btn btn-dark w-100">Create Account</button>
        </Form>
        <p className="text-center mt-3">
        Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
