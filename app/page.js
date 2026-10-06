"use client";

import { useEffect, useState } from "react";

const GARAGE_IMAGES = [
  "114945", "115302", "120538", "120831",
  "121006", "121031", "121527", "173217",
];

const SERVICES = {
  rescue: { title: "Roadside Rescue", short: "Breakdown, battery, tyre or fuel emergency.", icon: "SOS", tone: "rescue" },
  door: { title: "Door-to-Door", short: "A mechanic comes to your home or workplace.", icon: "MECH", tone: "door" },
  maintenance: { title: "Maintenance", short: "Oil changes, servicing and routine checks.", icon: "MAINT", tone: "service" },
  tyres: { title: "Tyres", short: "Punctures, tyre checks and replacement support.", icon: "TYRE", tone: "service" },
  battery: { title: "Battery", short: "Battery testing, jump-starts and replacement.", icon: "BAT", tone: "service" },
  diagnostics: { title: "Diagnostics", short: "Find out what that warning light really means.", icon: "DIAG", tone: "service" },
};

export default function Home() {
  const [step, setStep] = useState("choose");
  const [service, setService] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [makeSuggestions, setMakeSuggestions] = useState([]);
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [showMakeSuggestions, setShowMakeSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [problem, setProblem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remarkName, setRemarkName] = useState("");
  const [remark, setRemark] = useState("");
  const [remarkMessage, setRemarkMessage] = useState("");

  useEffect(() => {
    const handlePopState = () => {
      setStep("choose");
      setService(null);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function pickService(key) {
    setService(key);
    setStep("form");
    setError("");
    window.history.pushState({ garageStep: "form", service: key }, "", `#request-${key}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    if (window.history.state?.garageStep === "form") {
      window.history.back();
    } else {
      setStep("choose");
      setService(null);
      setError("");
    }
  }

  useEffect(() => {
    const query = vehicleMake.trim();
    if (query.length < 2) {
      setMakeSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setVehicleLoading(true);
        const res = await fetch(`/api/vehicles?type=makes&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setMakeSuggestions(data.results || []);
        setShowMakeSuggestions(true);
      } catch {
        setMakeSuggestions([]);
      } finally {
        setVehicleLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [vehicleMake]);

  useEffect(() => {
    const make = vehicleMake.trim();
    const query = vehicleModel.trim();
    if (!make || query.length < 1) {
      setModelSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setVehicleLoading(true);
        const res = await fetch(`/api/vehicles?type=models&make=${encodeURIComponent(make)}&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setModelSuggestions(data.results || []);
        setShowModelSuggestions(true);
      } catch {
        setModelSuggestions([]);
      } finally {
        setVehicleLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [vehicleMake, vehicleModel]);

  function chooseMake(make) {
    setVehicleMake(make);
    setVehicleModel("");
    setMakeSuggestions([]);
    setShowMakeSuggestions(false);
    setShowModelSuggestions(false);
  }

  function chooseModel(model) {
    setVehicleModel(model);
    setModelSuggestions([]);
    setShowModelSuggestions(false);
  }

  function buildWhatsAppLink() {
    const garageNumber = "254741767239";
    const serviceName = s?.title || service;
    const vehicle = `${vehicleMake.trim()} ${vehicleModel.trim()}`;
    const message = [
      "BEN AUTO GARAGE - SERVICE REQUEST",
      "",
      `Customer: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Vehicle: ${vehicle}`,
      `Service: ${serviceName}`,
      "",
      "PROBLEM ENCOUNTERED:",
      problem.trim(),
      "",
      "Please assist me with this request."
    ].join("\n");

    return `https://wa.me/${garageNumber}?text=${encodeURIComponent(message)}`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !vehicleMake.trim() || !vehicleModel.trim() || !problem.trim()) {
      setError("Please fill in your name, WhatsApp number, vehicle make/model and describe the problem.");
      return;
    }

    setSubmitting(true);
    setError("");

    const whatsappLink = buildWhatsAppLink();
    window.history.pushState({ garageStep: "confirm", service }, "", "#confirmation");
    setStep("confirm");

    // Give React a moment to render the confirmation before opening WhatsApp.
    setTimeout(() => {
      window.location.href = whatsappLink;
      setSubmitting(false);
    }, 150);
  }

  function handleRemarkSubmit(e) {
    e.preventDefault();
    if (!remark.trim()) {
      setRemarkMessage("Please type your remark before submitting.");
      return;
    }

    const savedRemarks = JSON.parse(localStorage.getItem("benAutoRemarks") || "[]");
    savedRemarks.push({
      name: remarkName.trim() || "Anonymous customer",
      text: remark.trim(),
      date: new Date().toISOString(),
    });
    localStorage.setItem("benAutoRemarks", JSON.stringify(savedRemarks));
    setRemarkName("");
    setRemark("");
    setRemarkMessage("Thank you. Your remark has been submitted.");
  }

  const s = service ? SERVICES[service] : null;

  return (
    <main>
      <div className="site-background" aria-hidden="true">
        {GARAGE_IMAGES.map((image, index) => (
          <img key={image} src={`/garage/20260901_${image}.jpg`} alt="" style={{ animationDelay: `${index * 4}s` }} />
        ))}
      </div>

      <nav className="nav wrap-wide">
        <a className="brand" href="#top" aria-label="Ben Auto Garage home">
          <span className="brand-mark">B</span>
          <span><strong>BEN AUTO</strong><small>GARAGE</small></span>
        </a>
        <div className="nav-links">
          <a href="#services">Services</a><a href="#how">How it works</a><a href="#reviews">Reviews</a>
        </div>
        <a className="nav-emergency" href="#request">Emergency</a>
      </nav>

      <section className="hero wrap-wide" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> NAIROBI & SURROUNDING AREAS</div>
          <h1>Your car.<br /><em>Our expertise.</em></h1>
          <p className="hero-text">Reliable automotive assistance when you need it most. Roadside rescue, mobile mechanics and everyday car care — all in one place.</p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => pickService("rescue")}>Get roadside rescue</button>
            <button className="secondary-btn" onClick={() => pickService("door")}>Book a mechanic</button>
          </div>
          <div className="trust-row"><span>Fast response</span><span>Location support</span><span>WhatsApp</span></div>
        </div>
      </section>

      <section className="request-section wrap-wide" id="request">
        {step === "choose" && (
          <>
            <div className="section-heading"><div><span className="kicker">START HERE</span><h2>What can we help you with?</h2></div><p>Choose a service and we'll guide you through the next step.</p></div>
            <div className="choices">
              <button className="choice-card rescue" onClick={() => pickService("rescue")}><span className="big-icon">SOS</span><span className="choice-title">Roadside Rescue</span><span className="choice-sub">Broken down right now? We'll help you get assistance and ask for your location on WhatsApp.</span><span className="arrow">→</span></button>
              <button className="choice-card door" onClick={() => pickService("door")}><span className="big-icon">MECH</span><span className="choice-title">Door-to-Door</span><span className="choice-sub">Need a mechanic at home or work? Tell us your details and we'll arrange the next step.</span><span className="arrow">→</span></button>
            </div>
          </>
        )}

        {step === "form" && s && (
          <div className="form-panel">
            <button className="back-link" onClick={goBack}>← Back to services</button>
            <div className="form-icon">{s.icon}</div>
            <span className="kicker">{s.title.toUpperCase()}</span>
            <h2>Let's get you moving.</h2>
            <p className="form-desc">Tell us who you are and how to reach you. We'll use WhatsApp to collect your location or address.</p>
            <form onSubmit={handleSubmit}>
              <div className="field"><label htmlFor="name">Your name</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Shawn Juma" /></div>
              <div className="field"><label htmlFor="phone">Phone number (WhatsApp)</label><input id="phone" type="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" /></div>
              <div className="field">
                <label htmlFor="problem">Problem encountered</label>
                <textarea id="problem" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Describe what is happening with your car..." rows="5" />
              </div>
              <div className="vehicle-fields">
                <div className="field autocomplete-field">
                  <label htmlFor="vehicleMake">Car make</label>
                  <input id="vehicleMake" type="text" value={vehicleMake} onChange={(e) => { setVehicleMake(e.target.value); setShowMakeSuggestions(true); }} onFocus={() => makeSuggestions.length && setShowMakeSuggestions(true)} onBlur={() => setTimeout(() => setShowMakeSuggestions(false), 150)} placeholder="e.g. Lexus" autoComplete="off" />
                  {showMakeSuggestions && makeSuggestions.length > 0 && <div className="suggestions" role="listbox">{makeSuggestions.map((make) => <button type="button" key={make} className="suggestion" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseMake(make)}>{make}</button>)}</div>}
                </div>
                <div className="field autocomplete-field">
                  <label htmlFor="vehicleModel">Car model</label>
                  <input id="vehicleModel" type="text" value={vehicleModel} onChange={(e) => { setVehicleModel(e.target.value); setShowModelSuggestions(true); }} onFocus={() => modelSuggestions.length && setShowModelSuggestions(true)} onBlur={() => setTimeout(() => setShowModelSuggestions(false), 150)} placeholder={vehicleMake ? "e.g. RX 350" : "Choose a make first"} autoComplete="off" disabled={!vehicleMake.trim()} />
                  {showModelSuggestions && modelSuggestions.length > 0 && <div className="suggestions" role="listbox">{modelSuggestions.map((model) => <button type="button" key={model} className="suggestion" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseModel(model)}>{model}</button>)}</div>}
                </div>
              </div>
              {vehicleLoading && <p className="vehicle-loading">Finding vehicle matches…</p>}
              {error && <p className="error-msg">{error}</p>}
              <button className="submit-btn" type="submit" disabled={submitting}>{submitting ? "Opening WhatsApp…" : "Continue to WhatsApp →"}</button>
            </form>
          </div>
        )}

        {step === "confirm" && s && (
          <div className="confirm"><div className="success-check">✓</div><span className="kicker">WHATSAPP REQUEST</span><h2>WhatsApp is ready.</h2><p className="confirm-body">Your request for <strong>{vehicleMake} {vehicleModel}</strong> has been prepared.</p><p className="confirm-body">WhatsApp will open with your name, phone number, service and problem already filled in. Tap <strong>Send</strong> to send it directly to Ben Auto Garage.</p><button className="primary-btn" onClick={() => { window.location.href = buildWhatsAppLink(); }}>Open WhatsApp →</button><button className="secondary-btn" onClick={() => { window.history.replaceState({}, "", "#request"); setStep("choose"); setService(null); setName(""); setPhone(""); setVehicleMake(""); setVehicleModel(""); setProblem(""); setMakeSuggestions([]); setModelSuggestions([]); }}>Make another request</button></div>
        )}
      </section>

      <section className="services wrap-wide" id="services">
        <div className="section-heading"><div><span className="kicker">OUR SERVICES</span><h2>Everything your car needs.</h2></div><p>From emergencies to regular maintenance, we've got you covered.</p></div>
        <div className="service-grid">{Object.entries(SERVICES).map(([key, item]) => <button key={key} className="service-tile" onClick={() => pickService(key)}><span className="tile-icon">{item.icon}</span><span className="tile-title">{item.title}</span><span className="tile-desc">{item.short}</span><span className="tile-arrow">↗</span></button>)}</div>
      </section>

      <section className="how wrap-wide" id="how">
        <div className="section-heading"><div><span className="kicker">HOW IT WORKS</span><h2>Help without the hassle.</h2></div></div>
        <div className="steps">{[["01","Request help","Tell us what you need."],["02","Share your location","We'll connect with you on WhatsApp."],["03","Meet your mechanic","We coordinate the right help."],["04","Get back on the road","Simple, clear and convenient."]].map(([n,t,d]) => <div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="why wrap-wide"><div className="why-panel"><div><span className="kicker">WHY BEN AUTO GARAGE?</span><h2>Built around the motorist.</h2></div><div className="why-grid"><div><b>Fast response</b><p>Less waiting when every minute matters.</p></div><div><b>Skilled support</b><p>Help matched to the problem you're facing.</p></div><div><b>Local knowledge</b><p>Designed for motorists around Nairobi.</p></div><div><b>Easy communication</b><p>Simple requests and WhatsApp follow-up.</p></div></div></div></section>

      <section className="reviews wrap-wide" id="reviews">
        <div className="section-heading"><div><span className="kicker">YOUR REMARKS</span><h2>Tell us what you think.</h2></div><p>Your feedback helps us improve the service for every motorist.</p></div>
        <form className="remarks-form" onSubmit={handleRemarkSubmit}>
          <div className="remarks-fields">
            <div className="field"><label htmlFor="remarkName">Your name (optional)</label><input id="remarkName" type="text" value={remarkName} onChange={(e) => setRemarkName(e.target.value)} placeholder="e.g. Shawn" /></div>
            <div className="field"><label htmlFor="remark">Your remarks</label><textarea id="remark" value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Tell us about your experience, suggestion or anything you'd like us to know." rows="6" /></div>
          </div>
          {remarkMessage && <p className="remark-message">{remarkMessage}</p>}
          <button className="primary-btn" type="submit">Submit your remarks →</button>
        </form>
      </section>

      <section className="coverage wrap-wide">
        <div>
          <span className="kicker">WHERE WE SERVE</span>
          <h2>Nairobi & surrounding areas.</h2>
          <p>Westlands • Kilimani • Kileleshwa • Lavington • Karen • Ruiru • Kiambu • Thika</p>
        </div>
      </section>

      <section className="final-cta"><div className="wrap-wide"><span className="kicker">NEED HELP NOW?</span><h2>Don't let a breakdown ruin your day.</h2><p>One request. One WhatsApp conversation. The right help.</p><button className="primary-btn" onClick={() => pickService("rescue")}>Request roadside rescue</button></div></section>

      <footer className="footer wrap-wide"><div className="brand"><span className="brand-mark">B</span><span><strong>BEN AUTO</strong><small>GARAGE</small></span></div><p>Reliable automotive assistance for Kenyan motorists.</p><span>© {new Date().getFullYear()} Ben Auto Garage</span></footer>
    </main>
  );
}
