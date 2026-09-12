import React, { useEffect, useRef, useState } from "react";
import "./Contact.css";
import axios from "axios";

const teamMembersSeed = [
  {
    name: "Abhijeet",
    role: "Director Operations",
    location: "Pune, India",
    image: "/Abhijeet.png",
    about: "Crafting high-impact digital experiences with a focus on quality, clarity, and execution.",
  },
  {
    name: "Ashwini",
    role: "Website Developer/Software Developer",
    location: "Pune, India",
    image: "/team/priya.jpg",
    about: "Focused on clean UI, scalable systems, and performance-first development.",
  },
  {
    name: "Himanshu",
    role: "Sales & Marketing Executive",
    location: "Pune, India",
    image: "/team/priya.jpg",
    about: "Building reliable web experiences with modern stacks and strong attention to detail.",
  },
  {
    name: "Sadashiv",
    role: "HR & Admin Executive",
    location: "Pune, India",
    image: "/team/priya.jpg",
    about: "Turning ideas into polished web products with smooth UX and solid engineering.",
  },
  {
    name: "Pravin",
    role: "PHD in Animation",
    location: "Pune, India",
    image: "/Pravin.png",
    about: "Dr. Pravin Yadav is a PhD-holding researcher, educator, and technologist based in Pune, Maharashtra. A passionate lifelong learner with honed technical skills, he combines academic rigor from Symbiosis International University with deep expertise in VR, XR, animation, and emerging technologies.",
  },
  {
    name: "Amod",
    role: "3D Animation Lead",
    location: "Bhopal, India",
    image: "/Amod-Bara.png",
    about: "Leading 3D animation workflows, storytelling, and high-quality visual production.",
  },
  {
    name: "Rutvik",
    role: "3D Modeling & Environment Artist",
    location: "Amravati, India",
    image: "/Rutvik.png",
    about: "Creating detailed 3D assets, environments, and production-ready models.",
  },
  {
    name: "Nageshwar",
    role: "Video Editing/Motion Graphics Animation",
    location: "Pune, India",
    image: "/Nagesh.png",
    about: "Editing and motion work with rhythm, clarity, and strong visual impact.",
  },
  {
    name: "Vishal",
    role: "Web Developer/Software Developer",
    location: "Pune, India",
    image: "/Vishal.png",
    about: "Delivering fast, responsive, and maintainable websites with modern UI standards.",
  },
  {
    name: "Trupti",
    role: "2D Animator",
    location: "Pune, India",
    image: "/Trupti.png",
    about: "Building AI-driven solutions and software systems that scale cleanly.",
  },
  {
    name: "Sushant",
    role: "Video Editor",
    location: "Pune, India",
    image: "/Sushant.png",
    about: "Building AI-driven solutions and software systems that scale cleanly.",
  },
];

const Contact = () => {
  const [data, setData] = useState({
    fname: "",
    lname: "",
    email: "",
    services: "",
    contact: "",
    msg: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({
    type: "",
    text: "",
  });

  const [visibleItems, setVisibleItems] = useState({});

  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  /* =====================================================
     NATIVE SEO & SCHEMA INJECTION
  ===================================================== */
  useEffect(() => {
    // document.title = "Contact Us - MotionPix | Animation & Web Development Studio";

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MotionPix",
      url: "https://motionpixindia.com",
      logo: "https://motionpixindia.com/logo.png",
      sameAs: [
        "https://www.linkedin.com/company/motionpix-cinematix/",
      ],
      employee: teamMembersSeed.map((member) => ({
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        description: member.about,
        workLocation: {
          "@type": "Place",
          name: member.location,
        },
        image: member.image.startsWith("http")
  ? member.image
  : `https://motionpixindia.com${member.image}`,
      })),
    };

    let scriptTag = document.getElementById("motionpix-schema");
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "motionpix-schema";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const existingScript = document.getElementById("motionpix-schema");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  /* =====================================================
     CLEAN BIDIRECTIONAL SCROLL REVEAL (Both Directions)
  ===================================================== */
  useEffect(() => {
    const elements = sectionRef.current?.querySelectorAll(".contact-reveal");
    if (!elements?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const revealId = entry.target.dataset.reveal;

          // Bidirectional toggle: sets true on enter, false on exit
          setVisibleItems((previous) => ({
            ...previous,
            [revealId]: entry.isIntersecting,
          }));
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  /* =====================================================
     CURSOR TRAIL EFFECT WITH DYNAMIC THEME SUPPORT
  ===================================================== */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;

    if (!canvas || !container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = canvas.getContext("2d");

    const RADIUS = 8;
    const TAIL_LENGTH = 10;

    let width = 0;
    let height = 0;
    let rafId = null;
    let currentFocus = null;
    let hasPosition = false;

    const head = { x: 0, y: 0, tx: 0, ty: 0, vx: 0 };
    const tail = [];

    const getThemeColors = () => {
      const styles = getComputedStyle(container);
      return {
        head: styles.getPropertyValue("--accent-color").trim() || "#ff3b3b",
        tail: styles.getPropertyValue("--accent-glow").trim() || "rgba(255, 59, 59, 0.3)",
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;

      width = container.clientWidth;
      height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const focusTarget = (element) => {
      const previousFocus = currentFocus;

      if (element) {
        currentFocus = element;
      }

      if (!currentFocus) return;

      head.tx = currentFocus.offsetLeft - 12 - RADIUS;
      head.ty = currentFocus.offsetTop + currentFocus.offsetHeight / 2;

      if (!hasPosition) {
        head.x = head.tx;
        head.y = head.ty;
        hasPosition = true;
      }

      if (currentFocus !== previousFocus) {
        head.vx = -8 - Math.abs(head.tx - head.x) / 5;
      }
    };

    const paint = () => {
      context.clearRect(0, 0, width, height);
      if (!currentFocus) return;

      tail.push({ ...head });
      if (tail.length > TAIL_LENGTH) {
        tail.shift();
      }

      const colors = getThemeColors();

      if (tail.length > 3) {
        context.beginPath();
        context.moveTo(tail[0].x, tail[0].y);

        let i = 2;
        for (; i < tail.length - 2; i++) {
          const p1 = tail[i];
          const p2 = tail[i + 1];

          context.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        }

        context.quadraticCurveTo(
          tail[i].x,
          tail[i].y,
          tail[i + 1].x,
          tail[i + 1].y
        );

        context.lineWidth = RADIUS;
        context.lineCap = "round";
        context.strokeStyle = colors.tail;
        context.stroke();
      }

      head.x += (head.tx - head.x) * 0.2;
      head.y += (head.ty - head.y) * 0.2;
      head.vx *= 0.8;
      head.x += head.vx;

      context.beginPath();
      context.arc(head.x, head.y, RADIUS, 0, Math.PI * 2);
      context.fillStyle = colors.head;
      context.fill();
    };

    const redraw = () => {
      paint();
      rafId = requestAnimationFrame(redraw);
    };

    const handleFocusIn = (event) => {
      if (event.target.matches("input, select, textarea")) {
        focusTarget(event.target);
      }
    };

    const handleResize = () => {
      resize();
      focusTarget(currentFocus);
      paint();
    };

    resize();
    redraw();

    container.addEventListener("focusin", handleFocusIn);
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  /* =====================================================
     FORM HANDLER & VALIDATIONS
  ===================================================== */
  const datahandler = (e) => {
    const { name, value } = e.target;

    setData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: false,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!data.fname.trim()) newErrors.fname = true;
    if (!data.lname.trim()) newErrors.lname = true;
    if (!data.email.trim()) newErrors.email = true;
    if (!data.services) newErrors.services = true;
    if (!data.contact.trim()) newErrors.contact = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveform = async (e) => {
    e.preventDefault();

    setStatusMsg({ type: "", text: "" });

    if (!validateForm()) {
      setStatusMsg({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/api/contact`,
  data,
  {
    withCredentials: true,
  }
);

      if (res.data.success) {
        setStatusMsg({
          type: "success",
          text: "Inquiry submitted successfully!",
        });

        setData({
          fname: "",
          lname: "",
          email: "",
          services: "",
          contact: "",
          msg: "",
        });

        setErrors({});
      }
    } catch (err) {
      console.error(err.response?.data || err.message);

      setStatusMsg({
        type: "error",
        text: "Submission failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-section" ref={sectionRef}>
      <div className="contact-bg-orb contact-bg-orb-one" aria-hidden="true"></div>

      <div className="container contact-form-shell">
        <div
          data-reveal="contact-form"
          className={`contact-form-card contact-reveal reveal-right ${
            visibleItems["contact-form"] ? "revealed" : ""
          }`}
        >
          <div className="contact-form-border" aria-hidden="true"></div>

          <form onSubmit={saveform} noValidate>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="contact-label">First Name*</label>
                <input
                  type="text"
                  name="fname"
                  className={`form-control contact-input ${
                    errors.fname ? "input-error" : ""
                  }`}
                  placeholder="First name"
                  value={data.fname}
                  onChange={datahandler}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="contact-label">Last Name*</label>
                <input
                  type="text"
                  name="lname"
                  className={`form-control contact-input ${
                    errors.lname ? "input-error" : ""
                  }`}
                  placeholder="Last name"
                  value={data.lname}
                  onChange={datahandler}
                  required
                />
              </div>

              <div className="col-12">
                <label className="contact-label">Services*</label>
                <select
                  className={`form-control contact-input contact-select ${
                    errors.services ? "input-error" : ""
                  }`}
                  name="services"
                  value={data.services}
                  onChange={datahandler}
                  required
                >
                  <option value="">Select a service</option>
                  <option value="2d-animation">2D Animations</option>
                  <option value="3d-animation">3D Animations</option>
                  <option value="ar-vr">AR/VR</option>
                  <option value="digitalmarketing">Digital Marketing</option>
                  <option value="web-design">Website Design</option>
                  <option value="e-learning">E-Learning</option>
                  <option value="graphicsdesign">Graphics Design</option>
                  <option value="motiongraphics">Motion Graphics</option>
                  <option value="sop">SOP Digitization</option>
                  <option value="print-media">Print Media</option>
                  <option value="product-branding">Branding</option>
                  <option value="live-shoots">Live Shoots</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="contact-label">Email*</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control contact-input ${
                    errors.email ? "input-error" : ""
                  }`}
                  placeholder="name@example.com"
                  value={data.email}
                  onChange={datahandler}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="contact-label">Contact Number*</label>
                <input
                  type="tel"
                  name="contact"
                  className={`form-control contact-input ${
                    errors.contact ? "input-error" : ""
                  }`}
                  placeholder="Phone number"
                  value={data.contact}
                  onChange={datahandler}
                  required
                />
              </div>

              <div className="col-12">
                <label className="contact-label">Message</label>
                <textarea
                  className="form-control contact-input contact-textarea"
                  rows="4"
                  name="msg"
                  placeholder="Your requirements..."
                  value={data.msg}
                  onChange={datahandler}
                ></textarea>
              </div>

              <div className="col-12 text-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn contact-submit-btn fw-bold px-5 py-3"
                >
                  {loading ? "Submitting..." : "Submit Inquiry"}
                </button>
              </div>

              {statusMsg.text && (
                <div
                  className={`col-12 text-center status-alert ${statusMsg.type}`}
                >
                  {statusMsg.text}
                </div>
              )}
            </div>
          </form>

          <canvas
            ref={canvasRef}
            className="contact-cursor-canvas"
            aria-hidden="true"
          ></canvas>
        </div>
      </div>
    </section>
  );
};

export default Contact;