import { useEffect, useState } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } =
        typeof window !== "undefined"
            ? window
            : {
                  innerWidth: 1920,
                  innerHeight: 1080,
              };

    return { width, height };
}

const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState<
        ReturnType<typeof getWindowDimensions>
    >(getWindowDimensions());

    useEffect(() => {
        function onResize() {
            setWindowDimensions(getWindowDimensions());
        }

        if (!window) {
            return;
        }
        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);

    return windowDimensions;
};

export { useWindowDimensions };
