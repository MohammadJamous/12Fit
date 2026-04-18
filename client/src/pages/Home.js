import { Link } from "react-router-dom";
import hero from "../assets/images/hero.png";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span className="hero-badge mb-3 d-inline-block">
                AI Powered Sports & Fitness
              </span>

              <h1 className="display-4 fw-bold text-white">
                Build Your Dream Body with{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #6C63FF, #00D4FF, #FF4ECD)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  12Fit
                </span>
              </h1>

              <p className="lead mt-3 text-muted">
                A modern platform that helps you generate personalized workout
                and diet plans with a powerful, elegant, and smart experience.
              </p>

              <div className="mt-4 d-flex flex-column flex-sm-row gap-3">
                {!user ? (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg px-4">
                      Start Now
                    </Link>

                    <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                      Login
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" className="btn btn-primary btn-lg px-4">
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="col-lg-6">
              <img
                src={hero}
                alt="12Fit Hero"
                className="img-fluid hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-3 text-white">Why Choose 12Fit?</h2>
          <p className="section-subtitle mb-5">
            Built for students, beginners, and fitness lovers who want a strong
            full-stack smart platform with beauty and performance.
          </p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card h-100 border-0">
                <div className="card-body p-4">
                  <div className="feature-icon">💪</div>
                  <h4 className="mt-3 text-white">Workout Generator</h4>
                  <p className="text-muted">
                    Generate customized workout plans based on your goals and
                    your level.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 border-0">
                <div className="card-body p-4">
                  <div className="feature-icon">🥗</div>
                  <h4 className="mt-3 text-white">Diet Generator</h4>
                  <p className="text-muted">
                    Get healthy meal suggestions and nutrition plans designed
                    for your fitness journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card feature-card h-100 border-0">
                <div className="card-body p-4">
                  <div className="feature-icon">📊</div>
                  <h4 className="mt-3 text-white">Track Progress</h4>
                  <p className="text-muted">
                    Follow your progress visually and stay motivated with a
                    clean dashboard experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 text-white rounded-4 mx-3 mx-md-5 mb-5">
        <div className="container text-center">
          <h2 className="fw-bold">Ready to transform your lifestyle?</h2>
          <p className="mt-3 text-light">
            Join 12Fit and start building a stronger, healthier version of
            yourself.
          </p>

          {!user ? (
            <Link to="/register" className="btn btn-light text-dark mt-3 px-4">
              Create Account
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-light text-dark mt-3 px-4">
              Open Dashboard
            </Link>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;