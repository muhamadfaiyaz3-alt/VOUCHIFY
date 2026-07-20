

import PropTypes from "prop-types";

// Section components (keep these imports)
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";
// import Footer           from "../components/Footer"; // add back when ready

/* ─────────────────────────
   Debug helper (banner box)
   ───────────────────────── */
function DebugBox({ label, error }) {
  return (
    <div
      className="m-4 rounded p-4 text-center text-sm font-semibold shadow"
      style={{
        background: error ? "#fecaca" : "#fef9c3",    // red if error, yellow if missing
        color: "#7f1d1d",
      }}
    >
      {label} &nbsp;{error ? "threw an error." : "is missing or failed to import."}
      <br />
      Open browser console for details.
    </div>
  );
}

DebugBox.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.bool,
};

/* ─────────────────────────
   Protective wrapper
   ───────────────────────── */
function SafeRender({ Component, label }) {
  try {
    if (!Component) return <DebugBox label={label} />;
    return <Component />;
  } catch (err) {
    console.error(`${label} crashed:`, err);
    return <DebugBox label={label} error />;
  }
}

SafeRender.propTypes = {
  Component: PropTypes.elementType,
  label: PropTypes.string.isRequired,
};

/* ─────────────────────────
   Home page
   ───────────────────────── */
export default function Home() {
  console.log("🏡 Home component mounted");

  return (
    <main className="bg-gradient-to-b from-light-bg via-white to-light-bg dark:from-dark-bg dark:via-dark-card dark:to-dark-bg transition-colors duration-500 min-h-screen overflow-x-hidden">
      <SafeRender Component={HeroSection} label="HeroSection" />
      <SafeRender Component={FeaturesSection} label="FeaturesSection" />
      <SafeRender Component={TestimonialsSection} label="TestimonialsSection" />
      {/* <SafeRender Component={Footer} label="Footer" /> */}
    </main>
  );
}
