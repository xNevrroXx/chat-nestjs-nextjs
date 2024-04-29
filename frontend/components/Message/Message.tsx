import React, {
    forwardRef,
    Fragment,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react";
import classNames from "classnames";
import { Button, Image, theme, Typography } from "antd";
import { FileTwoTone, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// own modules
import OriginalMessage from "@/components/OriginalMessage/OriginalMessage";
import { AudioElementWithWrapper } from "@/components/AudioElement/AudioElement";
import ReplyOutlined from "@/icons/ReplyOutlined";
import PinOutlined from "@/icons/PinOutlined";
import ForwardOutlined from "@/icons/ForwardOutlined";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import Time from "@/components/Time/Time";
import { truncateTheText } from "@/utils/truncateTheText";
// types
import {
    checkIsStandardMessage,
    IFile,
    IInnerForwardedMessage,
    IInnerStandardMessage,
} from "@/models/room/IRoom.store";
import { IKnownAndUnknownFiles } from "@/models/room/IRoom.general";
// styles
import "./message.scss";
import { TPaddings } from "@/HOC/Message";
import SubMessage from "@/components/SubMessage/SubMessage";

const { useToken } = theme;
const { Text } = Typography;

interface IMessageProps {
    message: IInnerStandardMessage | IInnerForwardedMessage;
    files: IKnownAndUnknownFiles;
    paddings: TPaddings;
    shouldSpecifyAuthor:
        | false
        | {
              color: string;
              displayName: string;
          };
    isMine: boolean;
    isVoice: boolean;
    onChooseMessageForPin: () => void;
    onChooseMessageForEdit: () => void;
    onChooseMessageForDelete: () => void;
    onChooseMessageForReply: () => void;
    onChooseMessageForForward: () => void;
}

const Message = forwardRef<HTMLDivElement, IMessageProps>(
    (
        {
            message,
            paddings,
            isMine,
            isVoice,
            shouldSpecifyAuthor,
            files,
            onChooseMessageForPin,
            onChooseMessageForEdit,
            onChooseMessageForDelete,
            onChooseMessageForReply,
            onChooseMessageForForward,
        },
        outerRef,
    ) => {
        const { token } = useToken();
        const innerRef = useRef<HTMLDivElement | null>(null);

        useImperativeHandle(outerRef, () => innerRef.current!, []);

        const handleDownload = useCallback((fileInfo: IFile) => {
            const anchor = document.createElement("a");
            anchor.href =
                process.env.NEXT_PUBLIC_BASE_URL +
                "/s3/file/" +
                fileInfo.originalName +
                "?path=" +
                fileInfo.url;
            anchor.title = fileInfo.originalName;
            anchor.download = fileInfo.originalName;
            anchor.click();
        }, []);

        const imageElem = useCallback((fileInfo: IFile): JSX.Element => {
            return (
                <Image
                    alt={`attachment ${fileInfo.id}`}
                    src={
                        process.env.NEXT_PUBLIC_BASE_URL +
                        "/s3/file/" +
                        fileInfo.originalName +
                        "?path=" +
                        fileInfo.url
                    }
                />
            );
        }, []);

        const otherElem = useCallback(
            (fileInfo: IFile): JSX.Element => {
                return (
                    <Fragment>
                        <FileTwoTone />
                        <p>
                            <Text className="message__attachment-file-name">
                                {/*{fileInfo.originalName}*/}
                                {truncateTheText({
                                    text: fileInfo.originalName,
                                    maxLength: 11,
                                    cutCloseToLastSpace: false,
                                    trim: true,
                                    isFile: true,
                                })}
                            </Text>
                            <br />
                            <Text style={{ color: token.colorTextSecondary }}>
                                {fileInfo.size.value} {fileInfo.size.unit}
                            </Text>
                        </p>
                    </Fragment>
                );
            },
            [token.colorTextSecondary],
        );

        const knownAttachments = useMemo(() => {
            if (files.known.length === 0) {
                return null;
            }

            return files.known.map((fileInfo) => {
                let fileElem: JSX.Element;
                if (fileInfo.attachmentType === "video") {
                    fileElem = <VideoPlayer {...fileInfo} />;
                }
                else if (fileInfo.attachmentType === "image") {
                    fileElem = imageElem(fileInfo);
                }
                else if (fileInfo.attachmentType === "audio") {
                    // fileElem = audioElem(fileInfo); // todo add an audio element
                }

                return (
                    <li key={fileInfo.id} className="message__attachment">
                        {fileElem!}
                    </li>
                );
            });
        }, [files, imageElem]);

        const unknownAttachments = useMemo(() => {
            if (files.unknown.length === 0) {
                return null;
            }

            return files.unknown.map((fileInfo: IFile, index) => {
                const fileElem = otherElem(fileInfo);

                return (
                    <li
                        key={fileInfo.id}
                        className="message__attachment-unknown"
                        onClick={() => handleDownload(fileInfo)}
                    >
                        {fileElem}
                        {!message.text &&
                            index === files.unknown.length - 1 && (
                                <Time
                                    createdAt={message.createdAt}
                                    hasRead={message.hasRead}
                                    hasEdited={!!message.updatedAt}
                                />
                            )}
                    </li>
                );
            });
        }, [
            files.unknown,
            handleDownload,
            message.createdAt,
            message.hasRead,
            message.text,
            message.updatedAt,
            otherElem,
        ]);

        const messageContent = useMemo(() => {
            if (checkIsStandardMessage(message)) {
                return (
                    <Fragment>
                        {message.replyToMessage && (
                            <SubMessage
                                messageBriefInfo={message.replyToMessage}
                                roomId={message.roomId}
                            />
                        )}

                        {isVoice && files.known.length === 1 ? (
                            <div className="message__audio-element-wrapper">
                                <AudioElementWithWrapper
                                    url={files.known[0].url}
                                    width={200}
                                    height={27}
                                    createdAt={message.createdAt}
                                    size={files.known[0].size}
                                >
                                    <Time
                                        isMessageEmpty={false}
                                        hasRead={message.hasRead}
                                        hasEdited={!!message.updatedAt}
                                        createdAt={message.createdAt}
                                    />
                                </AudioElementWithWrapper>
                            </div>
                        ) : (
                            <Fragment>
                                {knownAttachments && (
                                    <ul className="message__attachments-wrapper">
                                        {knownAttachments}
                                    </ul>
                                )}
                                {unknownAttachments && (
                                    <ul
                                        className={classNames(
                                            "message__attachments-unknown-wrapper",
                                            message.text &&
                                                "message__attachments-unknown-wrapper_with-line",
                                        )}
                                    >
                                        {unknownAttachments}
                                    </ul>
                                )}
                                <OriginalMessage {...message} />
                            </Fragment>
                        )}
                    </Fragment>
                );
            }

            return (
                <Fragment>
                    <SubMessage
                        messageBriefInfo={message.forwardedMessage}
                        roomId={message.roomId}
                    />
                    <Time
                        hasRead={message.hasRead}
                        hasEdited={!!message.updatedAt}
                        createdAt={message.createdAt}
                    />
                </Fragment>
            );
        }, [
            message,
            isVoice,
            files.known,
            knownAttachments,
            unknownAttachments,
        ]);

        return (
            <div
                ref={innerRef}
                tabIndex={-1}
                id={message.id}
                data-message-id={message.id}
                className={classNames(
                    "message",
                    isMine && "message_mine",
                    paddings.bottom === "large" &&
                        "message_padding-bottom-large",
                    message.text &&
                        message.text.includes('<code class="hljs') &&
                        "message_with-code",
                )}
            >
                <div className="message__content">
                    {shouldSpecifyAuthor && (
                        <div className={"message__header"}>
                            <Text
                                style={{
                                    color: shouldSpecifyAuthor.color,
                                    lineHeight: "normal",
                                }}
                            >
                                {shouldSpecifyAuthor.displayName}
                            </Text>
                        </div>
                    )}
                    {messageContent}
                </div>
                <div className="message__actions">
                    <Button
                        type="text"
                        size="small"
                        title="Ответить"
                        icon={<ReplyOutlined />}
                        onClick={onChooseMessageForReply}
                    />
                    {isMine && !isVoice && (
                        <Button
                            type="text"
                            size="small"
                            title="Изменить"
                            icon={<EditOutlined className="custom" />}
                            onClick={onChooseMessageForEdit}
                        />
                    )}
                    <Button
                        type="text"
                        size="small"
                        title="Переслать"
                        icon={<ForwardOutlined />}
                        onClick={onChooseMessageForForward}
                    />
                    <Button
                        type="text"
                        size="small"
                        title="Закрепить"
                        icon={<PinOutlined />}
                        onClick={onChooseMessageForPin}
                    />
                    <Button
                        type="text"
                        size="small"
                        title="Удалить"
                        icon={<DeleteOutlined className="custom" />}
                        onClick={onChooseMessageForDelete}
                    />
                </div>
            </div>
        );
    },
);
Message.displayName = "DumbMessage";

export default Message;
