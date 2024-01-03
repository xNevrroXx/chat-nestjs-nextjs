import LoginForm from "@/modules/LoginForm";
import Title from "antd/es/typography/Title";
import Link from "next/link";
import { createRoute } from "@/router/createRoute";
import { ROUTES } from "@/router/routes";
import Paper from "@/components/Paper/Paper";
import { createTitle } from "@/utils/createTitle";
import Paragraph from "antd/es/typography/Paragraph";
import { Space } from "antd";
import OAuthButtonsBlock from "@/components/OAuthButtonsBlock/OAuthButtonsBlock";

export const metadata = {
    title: createTitle("Добро пожаловать"),
};

const Authentication = () => {
    return (
        <div>
            <div className="auth__top">
                <Title level={2}>Войти в аккаунт</Title>
                <Title level={5}>Пожалуйста, войдите в свой аккаунт</Title>
            </div>
            <Paper>
                <LoginForm />
                <Space direction="vertical" />
                <OAuthButtonsBlock />
                <Space direction="vertical" />
                <Paragraph className="auth__change-form">
                    <Link href={createRoute({ path: ROUTES.REGISTER })}>
                        Создать аккаунт
                    </Link>
                </Paragraph>
            </Paper>
        </div>
    );
};

export default Authentication;
