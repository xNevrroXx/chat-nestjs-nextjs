import { theme, ThemeConfig } from "antd";

// todo change background of the Header.
const lightTheme: ThemeConfig = {
    token: {
        fontSize: 14,
    },
    algorithm: theme.defaultAlgorithm,
    components: {
        Layout: {},
    },
};

export default lightTheme;
