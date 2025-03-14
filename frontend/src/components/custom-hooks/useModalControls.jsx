import { useEffect } from "react";

const useModalControls = (isModalOpen, setIsModalOpen) => {
  // Disable scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "scroll";
    }

    return () => {
      document.documentElement.style.overflow = "scroll";
    };
  }, [isModalOpen]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [setIsModalOpen]);
};

export default useModalControls;
