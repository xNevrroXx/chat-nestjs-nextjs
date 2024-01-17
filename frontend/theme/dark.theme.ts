"use client";

import { theme, ThemeConfig } from "antd";

// todo change background of the Header.
const darkTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        fontSize: 14,
        colorBgBase: "#0e1621",
        colorBgLayout: "#17212b",
    },
    components: {
        Layout: {
            headerBg: "#17212b",
            footerPadding: "20px 20px",
        },
        Drawer: {
            colorBgElevated: "#17212b",
        },
    },
};

export default darkTheme;
