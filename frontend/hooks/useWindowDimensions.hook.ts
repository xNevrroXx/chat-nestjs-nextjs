import { useEffect, useState } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;

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

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);

    return windowDimensions;
};

export { useWindowDimensions };
