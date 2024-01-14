"use client";

import { theme, ThemeConfig } from "antd";

// todo change background of the Header.
const darkTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        fontSize: 14,
        colorBgBase: "#0e1621",
        colorBgLayout: "#17212b",
        // colorPrimary: "#2f6fa4",
    },
    components: {
        Layout: {
            footerPadding: "20px 20px",
        },
    },
};

export default darkTheme;
