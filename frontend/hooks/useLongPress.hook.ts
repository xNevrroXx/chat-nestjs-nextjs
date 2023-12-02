import {MouseEventHandler, TouchEventHandler, useCallback, useRef, useState} from "react";

interface IUseLongPressParams {
    onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
    onClick?: (event?: React.MouseEvent) => void;
    options?: {
        shouldPreventDefault: boolean;
        delay: number;
    }
}

interface IUseLongPressReturnValues {
    onMouseDown: MouseEventHandler<HTMLElement>;
    onMouseUp: MouseEventHandler<HTMLElement>;
    onMouseLeave: MouseEventHandler<HTMLElement>;

    onTouchStart: TouchEventHandler<HTMLElement>;
    onTouchEnd: TouchEventHandler<HTMLElement>;
}

const useLongPress = ({
                          onLongPress,
                          onClick,
                          options = {shouldPreventDefault: true, delay: 300}
                      }: IUseLongPressParams): IUseLongPressReturnValues => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<number | null>(null);
    const target = useRef<HTMLElement | null>();

    const start = useCallback((event: React.TouchEvent | React.MouseEvent) => {
        if (options.shouldPreventDefault && event.target && event.target instanceof HTMLElement) {
            event.target.addEventListener("touchend", preventDefault, {
                passive: false
            });
            target.current = event.target;
        }
        timeout.current = setTimeout(() => {
            onLongPress(event);
            setLongPressTriggered(true);
        }, options.delay);
    }, [onLongPress, options]);

    const clear = useCallback((_event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
        timeout.current && clearTimeout(timeout.current);
        onClick && shouldTriggerClick && !longPressTriggered && onClick();
        setLongPressTriggered(false);
        if (options.shouldPreventDefault && target.current) {
            target.current.removeEventListener("touchend", preventDefault);
        }
    }, [options, onClick, longPressTriggered]);

    return {
        onMouseDown: (e) => start(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        onMouseLeave: (e: React.MouseEvent) => clear(e, false),

        onTouchStart: (e: React.TouchEvent) => start(e),
        onTouchEnd: (e: React.TouchEvent) => clear(e)
    };
};

const preventDefault: EventListener = event => {
    if (!(event instanceof TouchEvent)) return;

    if (event.touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};

export {useLongPress};