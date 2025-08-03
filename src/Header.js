import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const Header = () => {
  return (
    <Navbar bg="light" expand="lg" className="py-3 glass px-4 fixed-top">
      <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 position-relative">
        Ugobu<span className="crown">👑</span>eze
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Link to="/login">
            <Button variant="dark" className="rounded-pill my-3 pt-2 px-4">
              <i className="bx fs-3 bxs-user"></i> Login ➜
            </Button>
          </Link>

          <Link to="/admin/login">
            <Button variant="white" className="rounded-pill my-3 pt-2 px-4">
              <i className="bx fs-3"></i> Admin ➜
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button variant="white" className="rounded-pill my-3 pt-2 px-4">
              <i className="bx fs-3"></i> Dashboard ➜
            </Button>
          </Link>

          <Link to="/referrals">
            <Button variant="white" className="rounded-pill my-3 pt-2 px-4">
              <i className="bx fs-3 bx-gift"></i> Referrals ➜
            </Button>
          </Link>

          <Link to="/admin/dashboard">
            <Button variant="white" className="rounded-pill my-3 pt-2 px-4">
              <i className="bx fs-3"></i> Admin Dashboard ➜
            </Button>
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
