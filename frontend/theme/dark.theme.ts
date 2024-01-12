import { theme, ThemeConfig } from "antd";

// todo change background of the Header.
const darkTheme: ThemeConfig = {
    token: {
        fontSize: 14,
        colorBgBase: "#0e1621",
        colorBgLayout: "#17212b",
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            footerPadding: "20px 20px",
        },
    },
};

export default darkTheme;
