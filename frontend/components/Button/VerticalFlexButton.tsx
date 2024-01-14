import React, { FC } from "react";
import { ButtonProps } from "antd/lib";
import { Button, Typography } from "antd";

const { Text } = Typography;

const VerticalFlexButton: FC<
    Omit<ButtonProps, "children"> & {
        icon: React.ReactNode;
        text?: string;
        isActive?: boolean;
    }
> = ({ icon, text, isActive, ...props }) => {
    return (
        <Button
            type={"text"}
            block
            {...props}
            style={{
                height: "64px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "4px 5px",
                color: isActive ? "#5eb5f7" : undefined,
                whiteSpace: "normal",
            }}
        >
            {icon}
            {text && (
                <Text
                    style={{
                        textAlign: "center",
                        margin: 0,
                        fontSize: "12px",
                        color: isActive ? "#5eb5f7" : undefined,
                    }}
                >
                    {text}
                </Text>
            )}
        </Button>
    );
};

export { VerticalFlexButton };
