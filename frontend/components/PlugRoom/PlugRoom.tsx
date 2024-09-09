import React from "react";
import { Flex, Layout, theme, Typography } from "antd";

const { useToken } = theme;
const { Title } = Typography;

const PlugRoom = () => {
    const { token } = useToken();

    return (
        <Layout>
            <Flex
                className="active-room__not-exist"
                justify="center"
                align="center"
            >
                <Title level={5} style={{ color: token.colorTextSecondary }}>
                    Выберите чат
                </Title>
            </Flex>
        </Layout>
    );
};

export default PlugRoom;
