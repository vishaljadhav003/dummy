import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import "./Maintenance.css";
import Contact from "./Contact";
import Logo from "/Logo.png";
import LogoAnimation from "/Logo_animation_1.mp4";
import { NavLink } from "react-router-dom";

const Maintenance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [dateTime, setDateTime] = useState(new Date());
  const [location, setLocation] = useState("Detecting location...");

  /* =========================================================
     LOADER
  ========================================================= */

  useEffect(() => {
    const savedTheme = localStorage.getItem("motionpix-theme");

    if (savedTheme === "light") {
      setIsDark(false);
    }

    const startTime = performance.now();
    const loadingDuration = 6100;

    let finishTimer;

    const animateLoader = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(
        Math.floor((elapsed / loadingDuration) * 100),
        100
      );

      setLoadingPercent(progress);

      if (progress < 100) {
        requestAnimationFrame(animateLoader);
      } else {
        finishTimer = setTimeout(() => {
          setIsLoading(false);
        }, 450);
      }
    };

    const animationFrame = requestAnimationFrame(animateLoader);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(finishTimer);
    };
  }, []);

  /* =========================================================
     THEME
  ========================================================= */

  useEffect(() => {
    const theme = isDark ? "dark" : "light";

    document.documentElement.setAttribute(
      "data-maintenance-theme",
      theme
    );

    localStorage.setItem("motionpix-theme", theme);
  }, [isDark]);

  /* =========================================================
     BODY LOADING STATE
  ========================================================= */

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("maintenance-loading");
    } else {
      document.body.classList.remove("maintenance-loading");
    }

    return () => {
      document.body.classList.remove("maintenance-loading");
    };
  }, [isLoading]);

  /* =========================================================
     DATE & TIME
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     LOCATION
  ========================================================= */

  useEffect(() => {
    const getUserLocation = async () => {
      if (!("geolocation" in navigator)) {
        setLocation("Location not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
              {
                headers: {
                  Accept: "application/json",
                },
              }
            );

            if (!res.ok) {
              throw new Error("Failed to fetch location");
            }

            const data = await res.json();
            const address = data?.address || {};

            const cityName =
              address.city ||
              address.town ||
              address.village ||
              address.hamlet ||
              address.suburb ||
              address.neighbourhood ||
              address.city_district ||
              address.state_district ||
              address.county ||
              address.municipality ||
              address.state ||
              "";

            const countryName = address.country || "";

            if (cityName && countryName) {
              setLocation(`${cityName}, ${countryName}`);
            } else if (cityName) {
              setLocation(cityName);
            } else if (countryName) {
              setLocation(countryName);
            } else {
              setLocation("Location unavailable");
            }
          } catch (error) {
            setLocation("Location unavailable");
          }
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocation("Location permission denied");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setLocation("Location unavailable");
          } else if (error.code === error.TIMEOUT) {
            setLocation("Location request timed out");
          } else {
            setLocation("Location unavailable");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    getUserLocation();
  }, []);

  /* =========================================================
     THEME TOGGLE
  ========================================================= */

  const toggleTheme = () => {
    setIsDark((previous) => !previous);
  };

  /* =========================================================
     DATE FORMATTING
  ========================================================= */

  const currentYear = dateTime.getFullYear();

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) {
      return "th";
    }

    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const day = dateTime.getDate();
  const daySuffix = getDaySuffix(day);

  const month = dateTime.toLocaleString("en-IN", {
    month: "long",
  });

  const year = dateTime.getFullYear();

  const formattedTime = dateTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <main className="maintenance-page">

      {/* =====================================================
          PREMIUM INITIAL LOADER
      ===================================================== */}

      {isLoading && (
        <div className="maintenance-loader">
          <div className="maintenance-loader-inner">

            {/* LOGO ANIMATION VIDEO */}
            <div className="maintenance-loader-logo">
              <video
                className="maintenance-loader-video"
                src={LogoAnimation}
                autoPlay
                muted
                playsInline
                aria-label="MotionPix Cinematix logo animation"
              />
            </div>

            {/* BRAND */}
            <div className="maintenance-loader-brand">
              MOTIONPIX <span>CINEMATIX</span>
            </div>

            {/* PERCENTAGE */}
            <div className="maintenance-loader-percent">
              {loadingPercent}%
            </div>

            {/* PROGRESS BAR */}
            <div className="maintenance-loader-line">
              <span
                style={{
                  width: `${loadingPercent}%`,
                }}
              ></span>
            </div>

            {/* STATUS */}
            <p>
              {loadingPercent < 100
                ? "PREPARING EXPERIENCE"
                : "EXPERIENCE READY"}
            </p>

          </div>
        </div>
      )}

      {/* =====================================================
          BACKGROUND EFFECTS
      ===================================================== */}

      <div
        className="maintenance-grid"
        aria-hidden="true"
      ></div>

      <div
        className="maintenance-noise"
        aria-hidden="true"
      ></div>

      <div
        className="maintenance-orb maintenance-orb-one"
        aria-hidden="true"
      ></div>

      <div
        className="maintenance-orb maintenance-orb-two"
        aria-hidden="true"
      ></div>

      <div
        className="maintenance-orb maintenance-orb-three"
        aria-hidden="true"
      ></div>

      {/* =====================================================
          THEME TOGGLE
      ===================================================== */}

      <button
        type="button"
        className="maintenance-theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${
          isDark ? "light" : "dark"
        } mode`}
        title={`Switch to ${
          isDark ? "light" : "dark"
        } mode`}
      >
        <i
          className={
            isDark
              ? "bi bi-sun-fill"
              : "bi bi-moon-stars-fill"
          }
        ></i>
      </button>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="maintenance-hero">
        <div className="maintenance-content">

          {/* MAINTENANCE ANIMATED VISUAL */}

          <div
            className="maintenance-visual"
            aria-hidden="true"
          >
            <div className="maintenance-visual-ring ring-one"></div>

            <div className="maintenance-visual-ring ring-two"></div>

            <div className="maintenance-visual-ring ring-three"></div>

            <div className="maintenance-visual-core">
              <i className="bi bi-gear-fill"></i>
            </div>

            <span className="maintenance-visual-dot dot-one"></span>

            <span className="maintenance-visual-dot dot-two"></span>

            <span className="maintenance-visual-dot dot-three"></span>
          </div>

          {/* BADGE */}

          <div className="maintenance-badge">
            <span className="maintenance-dot"></span>
            WEBSITE UNDER MAINTENANCE
          </div>

          {/* EYEBROW */}

          <p className="maintenance-eyebrow">
            MOTIONPIX INDIA
          </p>

          {/* TITLE */}

          <h1 className="maintenance-title">
            Something <span>new</span> is coming.
          </h1>

          {/* DESCRIPTION */}

          <p className="maintenance-description">
            We're currently upgrading our digital experience
            to bring you something faster, smarter and more
            immersive.
          </p>

          {/* DIVIDER */}

          <div
            className="maintenance-divider"
            aria-hidden="true"
          >
            <span></span>
          </div>

          {/* EMAIL */}

          <div className="maintenance-contact">
            <p className="maintenance-contact-label">
              For enquiries
            </p>

            <a
              href="mailto:info@motionpixindia.com"
              className="maintenance-email"
            >
              info@motionpixindia.com
            </a>

            <p className="maintenance-note">
              Our team is still available. Feel free to reach
              out.
            </p>
          </div>

          {/* SCROLL HINT */}

          <div className="maintenance-scroll-hint">
            <span className="scroll-line"></span>
            <span>SCROLL TO CONNECT</span>
          </div>

        </div>
      </section>

      {/* =====================================================
          CONTACT - DIRECT FORM ONLY
      ===================================================== */}

      <section className="maintenance-contact-wrapper">
        <Contact />
      </section>

      {/* =====================================================
          EXACT FOOTER WITH HIGHLIGHT & ANIMATED HEART
      ===================================================== */}

      <footer className="maintenance-footer">
        <div className="footer-bottom py-3">
          <div className="container">

            <div className="row align-items-center text-center text-md-start gy-2">

              <div className="col-md-6 d-flex align-items-center justify-content-center justify-content-md-start gap-2">

                <img
                  src={Logo}
                  alt="MotionPix Logo"
                  style={{ height: "50px" }}
                />

                <span className="fs-5 brand-text">
                  Motion
                  <span className="text-danger">
                    Pix
                  </span>{" "}
                  India
                </span>

              </div>

              <div className="col-md-6 d-flex flex-column align-items-center align-items-md-end mt-2 mt-md-0">

                <p className="fs-5 mb-1 copyright-text">
                  © {currentYear} MotionPix Cinematix India Pvt
                  Ltd.
                </p>

                <p className="footer-credit mb-1 footer-credit-premium">
                  Designed & Developed with{" "}

                  <NavLink
                    to="https://www.linkedin.com/in/vishal-jadhav-43390b260/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="designer-link premium-link nav-link"
                  >
                    <span className="heart-beat">
                      ❤
                    </span>{" "}
                    by Vishal Jadhav
                  </NavLink>
                </p>

                <span className="footer-datetime">
                  {day}
                  <sup>{daySuffix}</sup> {month} {year} |{" "}
                  {formattedTime}
                </span>

                <span className="footer-location">
                  📍 {location}
                </span>

              </div>

            </div>

          </div>
        </div>
      </footer>

    </main>
  );
};

export default Maintenance;