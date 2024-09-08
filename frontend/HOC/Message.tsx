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
    checkIsStandardMessage,
    FileType,
    IInnerForwardedMessage,
    IInnerStandardMessage,
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
import { useAppDispatch } from "@/hooks/store.hook";
import {
    openDeletingMessageModal,
    openMessageForwardingModal,
    openPinningMessageModal,
} from "@/store/actions/modal-windows";

export type TPaddings = {
    bottom: "small" | "large";
};

type TMessageProps = {
    roomType: RoomType;
    userId: TValueOf<Pick<IUserDto, "id">>;
    message: IInnerStandardMessage | IInnerForwardedMessage;
    onChooseMessageForAction: (messageForAction: TMessageForAction) => void;
    paddings: TPaddings;
    shouldSpecifyAuthor?:
        | false
        | {
              color: string;
              displayName: string;
          };
};

const Message = forwardRef<HTMLDivElement, TMessageProps>(
    (
        {
            userId,
            roomType,
            message,
            onChooseMessageForAction,
            paddings,
            shouldSpecifyAuthor = false,
        },
        outerRef,
    ) => {
        const dispatch = useAppDispatch();
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
                !checkIsStandardMessage(message) ||
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

        const onChooseMessageForForward = useCallback(() => {
            dispatch(
                openMessageForwardingModal({
                    messageId: message.id,
                }),
            );
        }, [dispatch, message.id]);

        const onPinMessage = useCallback(() => {
            dispatch(
                openPinningMessageModal({
                    messageId: message.id,
                }),
            );
        }, [dispatch, message.id]);

        const onClickMessageForReply = useCallback(() => {
            onChooseMessageForAction({
                message,
                action: MessageAction.REPLY,
            });
        }, [onChooseMessageForAction, message]);

        const onClickMessageForEdit = useCallback(() => {
            if (!checkIsStandardMessage(message)) return;

            onChooseMessageForAction({
                message,
                action: MessageAction.EDIT,
            });
        }, [onChooseMessageForAction, message]);

        const onClickMessageForDelete = useCallback(() => {
            dispatch(
                openDeletingMessageModal({
                    messageId: message.id,
                    senderId: message.senderId,
                    roomId: message.roomId,
                }),
            );
        }, [dispatch, message.id, message.roomId, message.senderId]);

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
                onChooseMessageForPin={onPinMessage}
                onChooseMessageForEdit={onClickMessageForEdit}
                onChooseMessageForDelete={onClickMessageForDelete}
                onChooseMessageForReply={onClickMessageForReply}
                onChooseMessageForForward={onChooseMessageForForward}
                message={message}
                shouldSpecifyAuthor={shouldSpecifyAuthor}
            />
        );
    },
);
Message.displayName = "MessageHOC";

export default Message;
