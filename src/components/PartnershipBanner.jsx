import blackLogo from "../assets/black logo.jpeg";
import pumaLogo from "../assets/puma-cat.svg";
import { hyroxPhotos } from "../data/hyrox.js";
import "../styles/partnership-banner.css";

const leftPhoto = hyroxPhotos.find((photo) => photo.person?.name === "Monu Dagar");
const rightPhoto = hyroxPhotos.find((photo) => photo.person?.name.includes("Ria Kataria"));

export default function PartnershipBanner() {
  return (
    <section className="partnership-banner" aria-label="Official physiotherapy partner of HYROX">
      {leftPhoto && (
        <div className="partnership-banner__athlete partnership-banner__athlete--left" aria-hidden="true">
          <img src={leftPhoto.src} alt="" decoding="async" />
        </div>
      )}
      {rightPhoto && (
        <div className="partnership-banner__athlete partnership-banner__athlete--right" aria-hidden="true">
          <img src={rightPhoto.src} alt="" decoding="async" />
        </div>
      )}
      <div className="partnership-banner__content">
        <span className="partnership-banner__label">Official Physiotherapy Partner</span>
        <div className="partnership-banner__event">
          <img className="partnership-banner__puma" src={pumaLogo} alt="PUMA" />
          <span className="partnership-banner__hyrox">HYROX</span>
        </div>
        <span className="partnership-banner__divider" aria-hidden="true" />
        <div className="partnership-banner__brand">
          <span className="partnership-banner__logo" aria-hidden="true">
            <img src={blackLogo} alt="" decoding="async" />
          </span>
          <strong>GetYourPhysio.in</strong>
        </div>
      </div>
    </section>
  );
}
