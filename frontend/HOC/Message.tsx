import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
// own modules
import DumbMessage from "@/components/Message/Message";
// types
import {
    checkIsMessage,
    FileType,
    IForwardedMessage,
    IMessage,
    RoomType,
} from "@/models/room/IRoom.store";
import { IUserDto } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import {
    IKnownAndUnknownFiles,
    MessageAction,
    TAttachmentType,
    TMessageForAction,
} from "@/models/room/IRoom.general";

export type TPaddings = {
    bottom: "small" | "large";
};

type TMessageProps = {
    roomType: RoomType;
    userId: TValueOf<Pick<IUserDto, "id">>;
    message: IMessage | IForwardedMessage;
    onChooseMessageForForward: () => void;
    onChooseMessageForAction: (messageForAction: TMessageForAction) => void;
    paddings: TPaddings;
};

const Message = forwardRef<HTMLDivElement, TMessageProps>(
    (
        {
            userId,
            roomType,
            message,
            onChooseMessageForAction,
            onChooseMessageForForward,
            paddings,
        },
        outerRef,
    ) => {
        const innerRef = useRef<HTMLDivElement | null>(null);
        const [isVoice, setIsVoice] = useState<boolean>(false);
        const [filesWithBlobUrls, setFilesWithBlobUrls] =
            useState<IKnownAndUnknownFiles>({
                known: [],
                unknown: [],
            });

        useImperativeHandle(outerRef, () => innerRef.current!, []);

        useEffect(() => {
            if (
                !checkIsMessage(message) ||
                !message.files ||
                message.files.length === 0
            ) {
                return;
            }

            if (message.files[0].fileType === FileType[FileType.VOICE_RECORD]) {
                setFilesWithBlobUrls({
                    known: [
                        {
                            ...message.files[0],
                            attachmentType: "audio",
                        },
                    ],
                    unknown: [],
                });
                setIsVoice(true);
            }
            else {
                const filesWithBlobUrl =
                    message.files.reduce<IKnownAndUnknownFiles>(
                        (previousValue, file) => {
                            let attachmentType: TAttachmentType;
                            if (file.mimeType.includes("video")) {
                                attachmentType = "video";
                            }
                            else if (file.mimeType.includes("image")) {
                                attachmentType = "image";
                            }
                            else if (
                                file.mimeType.includes("audio") &&
                                file.fileType === FileType.VOICE_RECORD
                            ) {
                                attachmentType = "audio";
                            }
                            else {
                                attachmentType = "unknown";
                            }
                            // const blobUrl = URL.createObjectURL(file.blob);

                            attachmentType !== "unknown"
                                ? previousValue.known.push({
                                      ...file,
                                      attachmentType,
                                  })
                                : previousValue.unknown.push({
                                      ...file,
                                      attachmentType,
                                  });
                            return previousValue;
                        },
                        {
                            known: [],
                            unknown: [],
                        },
                    );

                setFilesWithBlobUrls(filesWithBlobUrl);
            }
        }, [message]);

        const onClickMessageForPin = useCallback(() => {
            onChooseMessageForAction({
                message,
                action: MessageAction.PIN,
            });
        }, [onChooseMessageForAction, message]);

        const onClickMessageForReply = useCallback(() => {
            onChooseMessageForAction({
                message,
                action: MessageAction.REPLY,
            });
        }, [onChooseMessageForAction, message]);

        const onClickMessageForEdit = useCallback(() => {
            if (!checkIsMessage(message)) return;

            onChooseMessageForAction({
                message,
                action: MessageAction.EDIT,
            });
        }, [onChooseMessageForAction, message]);

        const onClickMessageForDelete = useCallback(() => {
            if (roomType === RoomType.GROUP && message.senderId === userId) {
                onChooseMessageForAction({
                    message,
                    action: MessageAction.DELETE,
                    isForEveryone: true,
                });
                return;
            }

            onChooseMessageForAction({
                message,
                action: MessageAction.DELETE,
                isForEveryone: false,
            });
        }, [onChooseMessageForAction, message]);

        const isMine = useMemo((): boolean => {
            return userId === message.senderId;
        }, [message.senderId, userId]);

        return (
            <DumbMessage
                paddings={paddings}
                ref={innerRef}
                isMine={isMine}
                isVoice={isVoice}
                files={filesWithBlobUrls}
                onChooseMessageForPin={onClickMessageForPin}
                onChooseMessageForEdit={onClickMessageForEdit}
                onChooseMessageForDelete={onClickMessageForDelete}
                onChooseMessageForReply={onClickMessageForReply}
                onChooseMessageForForward={onChooseMessageForForward}
                message={message}
            />
        );
    },
);
Message.displayName = "MessageHOC";

export default Message;
