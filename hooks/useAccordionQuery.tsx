import { useEffect, useState } from "react";

export function useAccordionQuery(defaultSection: string | null = null) {
const [openSection, setOpenSection] = useState<string | null>(() => {
  if (typeof window === 'undefined') return defaultSection;
  const params = new URLSearchParams(window.location.search);
  return params.get("section") || defaultSection;
});


  const setSection = (section: string | null) => {
    setOpenSection(section);

    const params = new URLSearchParams(window.location.search);

    if (section) {
      params.set("section", section);
    } else {
      params.delete("section");
    }

    // update URL without reloading
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  return [openSection, setSection] as const;
}
