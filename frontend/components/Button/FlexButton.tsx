import React, { FC } from "react";
import { ButtonProps } from "antd/lib";
import { Button } from "antd";

const FlexButton: FC<ButtonProps> = ({ children, ...props }) => {
    return (
        <Button
            type={"text"}
            block
            {...props}
            style={{
                display: "flex",
                alignItems: "center",
                minWidth: "min-content",
                justifyContent: "flex-start",
                wordBreak: "normal",
                ...props.style,
            }}
        >
            {children}
        </Button>
    );
};

export { FlexButton };
