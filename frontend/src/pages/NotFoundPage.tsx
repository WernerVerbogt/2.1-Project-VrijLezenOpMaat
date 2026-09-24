// Page will be shown when a 404 error occurs.

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="main-content">
      <section>
        <h1>Pagina niet gevonden</h1>

        <p>
          De pagina die je probeert te openen bestaat niet.
        </p>

        <Link to="/student">
          Terug naar home
        </Link>
      </section>
    </main>
  );
}