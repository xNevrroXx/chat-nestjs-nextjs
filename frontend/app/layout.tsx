import { Metadata } from "next";
import React, { FC } from "react";
import StyledComponentsRegistry from "../lib/AntdRegistry";
import { ConfigProvider, Layout } from "antd";
import ruRU from "antd/locale/ru_RU";
// own modules
import { CheckAuth } from "@/components/CheckAuth/CheckAuth";
import StoreProvider from "@/HOC/StoreProvider";
import darkTheme from "@/theme/dark.theme";
// styles
import "./globals.scss";

export const metadata: Metadata = {
    title: "Молва",
    description: "Мессенджер, созданный для вашего удобства.",
};

interface IProps {
    children: React.ReactNode;
}

const RootLayout: FC<IProps> = ({ children }) => {
    return (
        <html lang="ru">
            <body>
                <StoreProvider>
                    <CheckAuth />
                    <StyledComponentsRegistry>
                        <ConfigProvider locale={ruRU} theme={darkTheme}>
                            <Layout
                                style={{
                                    minHeight: "100vh",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {children}
                            </Layout>
                        </ConfigProvider>
                    </StyledComponentsRegistry>
                </StoreProvider>
            </body>
        </html>
    );
};

export default RootLayout;
