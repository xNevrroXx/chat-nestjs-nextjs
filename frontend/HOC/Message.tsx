import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
// own modules
import DumbMessage from "../components/Message/Message.tsx";
// types
import {checkIsMessage, FileType, IForwardedMessage, IMessage} from "../models/IStore/IRoom.ts";
import {IUserDto} from "../models/IStore/IAuthentication.ts";
import {TValueOf} from "../models/TUtils.ts";
import {
    IKnownAndUnknownFiles,
    MessageAction,
    TAttachmentType,
    TMessageForAction
} from "../models/IRoom.ts";

type TMessageProps = {
    userId: TValueOf<Pick<IUserDto, "id">>;
    message: IMessage | IForwardedMessage;
    onChooseMessageForForward: () => void;
    onChooseMessageForAction: (messageForAction: TMessageForAction) => void;
};

const Message: FC<TMessageProps> = ({
                                        userId,
                                        message,
                                        onChooseMessageForAction,
                                        onChooseMessageForForward
                                    }) => {
    const [isVoice, setIsVoice] = useState<boolean>(false);
    const [filesWithBlobUrls, setFilesWithBlobUrls] = useState<IKnownAndUnknownFiles>({
        known: [],
        unknown: []
    });

    useEffect(() => {
        if (!checkIsMessage(message) || !message.files || message.files.length === 0) {
            return;
        }

        if (message.files[0].fileType === FileType[FileType.VOICE_RECORD]) {
            // const blob = message.files[0].blob;
            // const blobUrl = URL.createObjectURL(blob);
            // const voiceInfo = {
            //     ...message.files[0],
            //     blobUrl
            // };
            setFilesWithBlobUrls({
                known: [{
                    ...message.files[0],
                    attachmentType: "audio"
                }],
                unknown: []
            });
            setIsVoice(true);
        } else {
            const filesWithBlobUrl = message.files.reduce<IKnownAndUnknownFiles>((previousValue, file) => {
                let attachmentType: TAttachmentType;
                if (file.mimeType.includes("video")) {
                    attachmentType = "video";
                } else if (file.mimeType.includes("image")) {
                    attachmentType = "image";
                } else if (file.mimeType.includes("audio") && file.fileType === FileType.VOICE_RECORD) {
                    attachmentType = "audio";
                } else {
                    attachmentType = "unknown";
                }
                // const blobUrl = URL.createObjectURL(file.blob);

                attachmentType !== "unknown"
                    ? previousValue.known.push({
                        ...file,
                        attachmentType
                    })
                    : previousValue.unknown.push({
                        ...file,
                        attachmentType
                    });
                return previousValue;
            }, {
                known: [],
                unknown: []
            });

            setFilesWithBlobUrls(filesWithBlobUrl);
        }
    }, [message]);

    const onClickMessageForPin = useCallback(() => {
        onChooseMessageForAction({
            message,
            action: MessageAction.PIN
        });
    }, [onChooseMessageForAction, message]);

    const onClickMessageForReply = useCallback(() => {
        onChooseMessageForAction({
            message,
            action: MessageAction.REPLY
        });
    }, [onChooseMessageForAction, message]);

    const onClickMessageForEdit = useCallback(() => {
        if (!checkIsMessage(message)) return;

        onChooseMessageForAction({
            message,
            action: MessageAction.EDIT
        });
    }, [onChooseMessageForAction, message]);

    const onClickMessageForDelete = useCallback(() => {
        onChooseMessageForAction({
            message,
            action: MessageAction.DELETE,
            isForEveryone: false
        });
    }, [onChooseMessageForAction, message]);

    const isMine = useMemo((): boolean => {
        return userId === message.senderId;
    }, [message.senderId, userId]);

    return (
        <DumbMessage
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
};

export default Message;