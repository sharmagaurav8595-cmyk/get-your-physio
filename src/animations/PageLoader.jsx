import { useEffect, useState } from "react";

const MINIMUM_DISPLAY_MS = 900;

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const startedAt = performance.now();

    const finish = () => {
      const remaining = Math.max(0, MINIMUM_DISPLAY_MS - (performance.now() - startedAt));
      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => setVisible(false), 520);
      }, remaining);
    };

    if (document.readyState === "complete") {
      finish();
      return undefined;
    }

    window.addEventListener("load", finish, { once: true });
    return () => window.removeEventListener("load", finish);
  }, []);

  if (!visible) return null;

  return (
    <div className={`gy-loader${leaving ? " gy-loader--leaving" : ""}`} role="status" aria-live="polite">
      <div className="gy-loader__mark" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="gy-loader__brand">GetYourPhysio.in</div>
      <div className="gy-loader__tagline">Healing at your doorstep</div>
      <div className="gy-loader__track" aria-hidden="true">
        <span />
      </div>
      <span className="gy-sr-only">Loading GetYourPhysio.in</span>
    </div>
  );
}
