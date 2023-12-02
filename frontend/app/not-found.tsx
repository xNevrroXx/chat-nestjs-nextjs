import Title from "antd/es/typography/Title";
import Link from "next/link";
import {createRoute} from "@/router/createRoute";
import {ROUTES} from "@/router/routes";
import { Content } from "antd/es/layout/layout";
import { Flex } from "antd";

const NotFound = () => {
    return (
        <Content className="error-page" style={{height: "100vh"}}>
            <Flex vertical={true} justify="center" align="center" gap={5} style={{height: "100%"}}>
                <Title>Не найдено</Title>
                <Title level={4}>Невозможно найти запрашиваемый ресурс</Title>
                <Link href={ createRoute({path: ROUTES.AUTH}) }>
                    Вернуться на главную страницу
                </Link>
            </Flex>
        </Content>
    );
};

export default NotFound;