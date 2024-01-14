import { Metadata } from "next";
import Link from "next/link";
import Title from "antd/lib/typography/Title";
import Paragraph from "antd/lib/typography/Paragraph";
// own modules
import { RegisterForm } from "@/modules/RegisterForm";
import { createTitle } from "@/utils/createTitle";
import { createRoute } from "@/router/createRoute";
import { ROUTES } from "@/router/routes";
import Paper from "@/components/Paper/Paper";

export const metadata: Metadata = {
    title: createTitle("Регистрация"),
};

const Registration = () => {
    return (
        <div>
            <div className="auth__top">
                <Title level={2}>Регистрация</Title>
                <Title level={5}>
                    Для входа в чат вам нужно зарегистрироваться
                </Title>
            </div>
            <Paper>
                <RegisterForm />
                <Paragraph className="auth__change-form">
                    <Link
                        className="auth__change-form"
                        href={createRoute({ path: ROUTES.AUTH })}
                    >
                        Войти в аккаунт
                    </Link>
                </Paragraph>
            </Paper>
        </div>
    );
};

export default Registration;
