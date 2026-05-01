import { useEffect, useState } from "react";

const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
    };
  }, []);

  return {
    isFullscreen,
    toggleFullscreen,
  };
};

export default useFullscreen;