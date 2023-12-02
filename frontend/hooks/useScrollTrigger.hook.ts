import {useCallback, useEffect, useRef} from "react";

type TTriggerFunction =
    {
        toTop: () => void,
        toBottom: () => void
    }
    |
    {
        toTop?: undefined,
        toBottom: () => void
    }
    |
    {
        toTop: () => void,
        toBottom?: undefined
    }

type onIntersectProps =
    {
        onIntersectionBreakpoint: TTriggerFunction
        /**
        * When there is **less** than this value left to the **bottom** of the container, the "onIntersectionBreakpoint" events is triggered<br/>
        * Default: 200(px)
        * */
        breakpointPx: number
    }


type TUseScrollTrigger = {
    /**
    * Default: 250(ms)
    */
    wait?: number,
} & onIntersectProps

const useScrollTrigger = ({
                              wait = 100,
                              breakpointPx = 250,
                              onIntersectionBreakpoint
                          }: TUseScrollTrigger) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const prevScrollTopValueRef = useRef<number>(0);
    const timeoutRef = useRef<number | null>(null);

    const onChangeScroll = useCallback(() => {
        if (!containerRef.current) return;
        const containerEl = containerRef.current;
        if (timeoutRef.current) return;

        timeoutRef.current = setTimeout(() => {

            if (
                onIntersectionBreakpoint.toTop
                && containerEl.offsetHeight + containerEl.scrollTop < containerEl.scrollHeight - breakpointPx
                && prevScrollTopValueRef.current > containerEl.scrollTop
            ) {
                onIntersectionBreakpoint.toTop();
            }
            else if (
                onIntersectionBreakpoint.toBottom
                && containerEl.offsetHeight + containerEl.scrollTop >= containerEl.scrollHeight - breakpointPx
            ) {
                onIntersectionBreakpoint.toBottom();
            }

            prevScrollTopValueRef.current = containerEl.scrollTop;
            timeoutRef.current = null;
        }, wait);
    }, [breakpointPx, onIntersectionBreakpoint, wait]);

    useEffect(() => {
        if (!containerRef.current) return;

        const containerEl = containerRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const containerEl = entry.target;
                prevScrollTopValueRef.current = containerEl.scrollTop;
                onChangeScroll();
                containerEl.addEventListener("scroll", onChangeScroll);
            }
        });
        resizeObserver.observe(containerEl);

        return () => resizeObserver.disconnect();
    }, [onChangeScroll]);

    useEffect(() => {
        if (!containerRef.current) return;
        const containerEl = containerRef.current;

        prevScrollTopValueRef.current = containerRef.current.scrollTop;
        onChangeScroll();
        containerEl.addEventListener("scroll", onChangeScroll);

        return () => containerEl.removeEventListener("scroll", onChangeScroll);
    }, [onChangeScroll]);

    return containerRef;
};

export {useScrollTrigger};