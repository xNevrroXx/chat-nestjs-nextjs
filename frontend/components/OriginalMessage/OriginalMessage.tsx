import React, { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { Interweave } from "interweave";
import classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import { UrlMatcher } from "interweave-autolink";
import { theme } from "antd";
// own modules
import Time from "@/components/Time/Time";
import LinkPreviewer from "@/components/LinkPreviewer/LinkPreviewer";
import {
    checkIsStandardMessage,
    FileType,
    IInnerForwardedMessage,
    IInnerStandardMessage,
} from "@/models/room/IRoom.store";
import { transform } from "@/utils/inrterweaveTransform";
// styles
import "./atelier-lakeside-light.scss";

const { useToken } = theme;

const OriginalMessage: FC<IInnerStandardMessage | IInnerForwardedMessage> = (
    message,
) => {
    const { token } = useToken();
    const messageElRef = useRef<HTMLDivElement | null>(null);

    const onClickMessage = useCallback((event: MouseEvent) => {
        const target = event.currentTarget;
        if (
            !target ||
            !(target instanceof Element) ||
            !target.classList.contains("code-block-header")
        ) {
            return;
        }
        const codeBlock = target.nextElementSibling;
        if (!(codeBlock instanceof Element) || codeBlock.tagName !== "CODE") {
            return;
        }
        const clipboard = navigator.clipboard;
        void clipboard
            .writeText(codeBlock.textContent || "")
            .then(() => alert("Текст скопирован в буфер обмена."));
    }, []);

    useEffect(() => {
        if (!messageElRef.current) {
            return;
        }
        const messageEl = messageElRef.current;
        const headerCodeBlockEl = messageEl.querySelector(
            ".code-block-header",
        ) as HTMLDivElement;
        if (!headerCodeBlockEl) {
            return;
        }

        headerCodeBlockEl.addEventListener("click", onClickMessage);
        return () =>
            headerCodeBlockEl.removeEventListener("click", onClickMessage);
    }, [onClickMessage]);

    return useMemo(() => {
        const { hasRead, updatedAt, createdAt } = message;
        if (!checkIsStandardMessage(message)) {
            return;
        }

        const { text, firstLinkInfo, files } = message;
        if (text && firstLinkInfo) {
            return (
                <div
                    ref={messageElRef}
                    style={{ color: token.colorText }}
                    className={classNames(
                        "message__wrapper-inner-content",
                        "message__wrapper-inner-content_with-links",
                    )}
                >
                    <Interweave
                        noWrap={true}
                        content={emojiParser.parse(text)}
                        transform={transform}
                        matchers={[
                            new UrlMatcher("url", { validateTLD: false }),
                        ]}
                    />
                    <LinkPreviewer
                        className="message__link-previewer"
                        data={firstLinkInfo}
                    />
                    <Time
                        hasRead={hasRead}
                        hasEdited={!!updatedAt}
                        createdAt={createdAt}
                    />
                </div>
            );
        }
        else if (text && !firstLinkInfo) {
            return (
                <div
                    ref={messageElRef}
                    style={{ color: token.colorText }}
                    className={"message__wrapper-inner-content"}
                >
                    <Interweave
                        noWrap={true}
                        transform={transform}
                        content={emojiParser.parse(text)}
                    />
                    <Time
                        hasRead={hasRead}
                        hasEdited={!!updatedAt}
                        createdAt={createdAt}
                    />
                </div>
            );
        }
        else if (
            !files.find(
                (f) =>
                    f.fileType === FileType.ATTACHMENT &&
                    !(
                        f.mimeType.includes("video") ||
                        f.mimeType.includes("image")
                    ),
            )
        ) {
            return (
                <div
                    style={{ color: token.colorText }}
                    className="message__wrapper-inner-content message__wrapper-inner-content_empty"
                >
                    <Time
                        isMessageEmpty={true}
                        hasRead={hasRead}
                        hasEdited={!!updatedAt}
                        createdAt={createdAt}
                    />
                </div>
            );
        }
    }, [message, token.colorText]);
};

export default OriginalMessage;
