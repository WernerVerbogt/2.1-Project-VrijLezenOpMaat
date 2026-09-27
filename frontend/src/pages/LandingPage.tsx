// Page will be shown when a 404 error occurs.

import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="main-content">
      <section>
        <h1>Homepagina</h1>
        <h2>Vrij lezen op maat</h2>
        <p>
          Tijdelijke homepage
        </p>

        <Link to="/login">
          Inloggen
        </Link>
        <br />
      </section>
    </main>
  );
}