"use client";

import { useFormStatus } from "react-dom";
import {Button} from "antd";

const SubmitButton = () => {
    const {pending} = useFormStatus();

    return (
        <Button
            disabled={pending}
            className="auth__submit"
            htmlType="submit"
            size="large"
            type="primary"
        >
            Войти
        </Button>
    );
};

export default SubmitButton;