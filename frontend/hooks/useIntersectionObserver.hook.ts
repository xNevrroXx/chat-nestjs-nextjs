import { RefObject, useEffect, useRef } from "react";
import { TValueOf } from "@/models/TUtils";

interface IProps {
    rootMargin: TValueOf<Pick<IntersectionObserverInit, "rootMargin">>;
    threshold: TValueOf<Pick<IntersectionObserverInit, "threshold">>;
    observedElementRefs: RefObject<Element[]>;
    onIntersection: (
        entry: IntersectionObserverEntry,
        observer: IntersectionObserver,
    ) => void;
}
const useIntersectionObserver = <T extends HTMLElement>({
    threshold,
    rootMargin,
    observedElementRefs,
    onIntersection,
}: IProps) => {
    const rootRef = useRef<T | null>(null);

    useEffect(() => {
        if (!rootRef) {
            return;
        }

        const options: IntersectionObserverInit = {
            root: rootRef.current,
            threshold,
            rootMargin,
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                onIntersection(entry, observer);
            });
        }, options);

        if (observedElementRefs.current) {
            observedElementRefs.current.forEach((elem) => {
                if (elem) {
                    observer.observe(elem);
                }
            });
        }

        return () => {
            observer.disconnect();
        };
    }, [observedElementRefs, onIntersection, rootMargin, threshold]);

    return { rootRef };
};

export { useIntersectionObserver };
