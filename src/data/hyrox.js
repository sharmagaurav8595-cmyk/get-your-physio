// Optional captions and dimensions enrich photos without importing individual files.
// The folder glob below determines which photos actually appear on the website.
const photoDetails = {
  "WhatsApp Image 2026-10-03 at 1.21.31 PM (2).jpeg": {
    alt: "Five members of the physiotherapy team in front of the HYROX medic zone sign",
    title: "Ready at the medic zone", category: "On-site team", width: 1600, height: 1066,
  },
  "WhatsApp Image 2026-10-03 at 1.21.31 PM.jpeg": {
    alt: "Physiotherapist assisting a seated HYROX athlete in the recovery area",
    title: "Care beyond the finish line", category: "Athlete recovery", width: 1066, height: 1600, heroOrder: 0,
  },
  "WhatsApp Image 2026-10-03 at 1.21.33 PM (1).jpeg": {
    alt: "The physiotherapy team gathered at the HYROX Mumbai medic zone",
    title: "Together on race day", category: "Our people", width: 1040, height: 907,
  },
  "WhatsApp Image 2026-10-03 at 1.21.33 PM (2).jpeg": {
    alt: "GetYourPhysio physiotherapy team together in the HYROX medic zone",
    title: "The team behind the care", category: "Our people", width: 1280, height: 916,
  },
  "WhatsApp Image 2026-10-03 at 1.21.34 PM (3).jpeg": {
    alt: "GetYourPhysio physiotherapist applying blue sports tape to an athlete's leg at HYROX",
    title: "Support, right where it matters", category: "Sports taping", width: 900, height: 1600, heroOrder: 1,
  },
  "Vinita ( CEO Sugar Cosmetics).jpeg": {
    alt: "Three event attendees standing together at HYROX Mumbai",
    title: "Connections beyond the race", category: "Event community", width: 896, height: 1171,
  },
  "Anmol Raina ( Athlete ).jpeg": {
    alt: "A HYROX athlete posing with a team member near the finish and recovery area",
    title: "Celebrating the finish", category: "Athlete community", width: 921, height: 1518,
  },
  "Prashant & Ria Kataria ( Athlete ).jpeg": {
    alt: "A physiotherapy team member standing with two athletes at HYROX Mumbai",
    title: "Built around the community", category: "Race-day connections", width: 896, height: 1111,
  },
  "Monu Dagar ( Athlete).jpeg": {
    alt: "A team member speaking with a HYROX athlete beside the medic zone",
    title: "Support beyond the finish line", category: "Athlete support", width: 915, height: 1527,
  },
  "Digvijay Singh( Influencer ).jpeg": {
    width: 885, height: 1280,
  },
};

export const hyroxPhotos = Object.entries(import.meta.glob("../assets/hyrox/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}", {
  eager: true,
  import: "default",
}))
  .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
  .map(([path, src]) => {
    const filename = path.split("/").pop();
    const details = photoDetails[filename] || {};
    // Named files such as "Digvijay ( Influencer ).jpeg" supply their own label.
    const namedPhoto = filename.replace(/\.[^.]+$/, "").match(/^(.+?)\s*\(\s*([^()]+?)\s*\)\s*$/);
    const person = namedPhoto && !/^WhatsApp Image\b/i.test(namedPhoto[1])
      ? { name: namedPhoto[1].trim(), role: namedPhoto[2].trim() }
      : null;
    return {
      path,
      src,
      alt: person ? `${person.name} (${person.role}) at HYROX Mumbai` : "GetYourPhysio team and athlete support at HYROX Mumbai",
      title: person?.name || "A moment from race day",
      category: person?.role || "HYROX Mumbai",
      ...details,
      person,
      landscape: details.width > details.height,
    };
  });
