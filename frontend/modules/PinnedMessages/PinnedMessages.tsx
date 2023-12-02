import {FC, useState} from "react";
import {TValueOf} from "../../models/TUtils.ts";
import {IRoom} from "../../models/IStore/IRoom.ts";
// styles
import "./pinned-messages.scss";

interface IPinnedMessagesListProps {
    pinnedMessages: TValueOf<Pick<IRoom, "pinnedMessages">>
}

const PinnedMessages: FC<IPinnedMessagesListProps> = ({pinnedMessages}) => {
    const [currentIndex] = useState<number>(pinnedMessages.length - 1);

    return (
        <div className="pinned-messages">
            <div className="pinned-messages__border">
                <span>
                    <svg height="0" width="0">
                        <defs>
                            <clipPath id="clipPath4">
                                <path d="M0,1a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0ZM0,10.5a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0ZM0,20a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0ZM0,29.5a1,1,0,0,1,
                                      2,0v5.5a1,1,0,0,1,-2,0Z"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                </span>
                <div className="pinned-messages__mark"></div>
            </div>
            {currentIndex}
        </div>
    );
};

export default PinnedMessages;