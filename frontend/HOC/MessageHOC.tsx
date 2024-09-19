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
} from "@/models/room/IRoom.store";
import { IUserDto } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import {
    IKnownAndUnknownFiles,
    MessageAction,
    TAttachmentType,
} from "@/models/room/IRoom.general";
import { useAppDispatch } from "@/hooks/store.hook";
import {
    openDeletingMessageModal,
    openModalWithMessageId,
} from "@/store/actions/modal-windows";
import { updateMessageForAction } from "@/store/thunks/recent-rooms";

export type TPaddings = {
    bottom: "small" | "large";
};

type TMessageProps = {
    userId: TValueOf<Pick<IUserDto, "id">>;
    message: IInnerStandardMessage | IInnerForwardedMessage;
    paddings: TPaddings;
    shouldSpecifyAuthor?:
        | false
        | {
              color: string;
              displayName: string;
          };
};

const MessageHOC = forwardRef<HTMLDivElement, TMessageProps>(
    ({ userId, message, paddings, shouldSpecifyAuthor = false }, outerRef) => {
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
                openModalWithMessageId({
                    modalName: "messageForwarding",
                    messageId: message.id,
                }),
            );
        }, [dispatch, message.id]);

        const onPinMessage = useCallback(() => {
            dispatch(
                openModalWithMessageId({
                    modalName: "pinningMessage",
                    messageId: message.id,
                }),
            );
        }, [dispatch, message.id]);

        const onClickMessageForReply = useCallback(() => {
            void dispatch(
                updateMessageForAction({
                    roomId: message.roomId,
                    messageForAction: {
                        message,
                        action: MessageAction.REPLY,
                    },
                }),
            );
        }, [dispatch, message]);

        const onEditingMessage = useCallback(() => {
            if (!checkIsStandardMessage(message)) return;

            void dispatch(
                updateMessageForAction({
                    roomId: message.roomId,
                    messageForAction: {
                        message,
                        action: MessageAction.EDIT,
                    },
                }),
            );
        }, [dispatch, message]);

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
                onChooseMessageForEdit={onEditingMessage}
                onChooseMessageForDelete={onClickMessageForDelete}
                onChooseMessageForReply={onClickMessageForReply}
                onChooseMessageForForward={onChooseMessageForForward}
                message={message}
                shouldSpecifyAuthor={shouldSpecifyAuthor}
            />
        );
    },
);
MessageHOC.displayName = "MessageHOC";

export default MessageHOC;
