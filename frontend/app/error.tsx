"use client";

import { Button, Typography } from "antd";
import { useEffect } from "react";

const { Title } = Typography;

const Error = ({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) => {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <section className="error-page">
            <Title>Something went wrong!</Title>
            <Button onClick={reset}>Try again</Button>
        </section>
    );
};

export default Error;
