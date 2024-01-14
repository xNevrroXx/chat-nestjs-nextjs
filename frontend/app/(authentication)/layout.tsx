import React from "react";
import { Flex } from "antd";
import { Content } from "antd/lib/layout/layout";
// styles
import "./auth.scss";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Content className="auth">
            <Flex justify="center" align="center" style={{ height: "100%" }}>
                {children}
            </Flex>
        </Content>
    );
};

export default AuthenticationLayout;
