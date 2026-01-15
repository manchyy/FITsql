import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link } from "react-router-dom";

function AppNavbar() {
  return (
    <>
      <Navbar bg="secondary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Petal Pushers
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/customers">
              Customers
            </Nav.Link>
            <Nav.Link as={Link} to="/flowers">
              Flowers
            </Nav.Link>
            <Nav.Link as={Link} to="/arrangements">
              Arrangements
            </Nav.Link>
            <Nav.Link as={Link} to="/orders">
              Orders
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <br />
    </>
  );
}

export default AppNavbar;
