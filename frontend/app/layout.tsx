import { Metadata } from "next";
import React, {FC} from "react";
import StyledComponentsRegistry from "../lib/AntdRegistry";
import {ConfigProvider, Layout} from "antd";
import ruRU from "antd/locale/ru_RU";
// own modules
import theme from "@/theme/light.theme";
// styles
import "./globals.scss";
import { CheckAuth } from "@/components/CheckAuth/CheckAuth";
import StoreProvider from "@/HOC/StoreProvider";

export const metadata: Metadata = {
    title: "Молва",
    description: "Мессенджер, созданный для вашего удобства."
};

interface IProps {
    children: React.ReactNode
}

const RootLayout: FC<IProps> = ({children}) => {
    return (
        <html lang="ru">
            <body>
                <StoreProvider>
                    <CheckAuth/>
                    <Layout style={{minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <StyledComponentsRegistry>
                            <ConfigProvider locale={ruRU} theme={theme}>
                                {children}
                            </ConfigProvider>
                        </StyledComponentsRegistry>
                    </Layout>
                </StoreProvider>
            </body>
        </html>
    );
};

export default RootLayout;
