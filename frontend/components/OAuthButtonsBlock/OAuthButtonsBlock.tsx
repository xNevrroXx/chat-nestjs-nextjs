"use client";

import React from "react";
import { Button, Flex } from "antd";
import Yandex from "@/icons/Yandex";
import Google from "@/icons/Google";

function createPopupWin(
    pageURL: string,
    pageTitle: string,
    popupWinWidth: number,
    popupWinHeight: number,
) {
    const left = (screen.width - popupWinWidth) / 2;
    const top = (screen.height - popupWinHeight) / 4;
    const windowFeatures =
        "resizable=yes" +
        ", width=" +
        popupWinWidth +
        ", height=" +
        popupWinHeight +
        ", top=" +
        top +
        ", left=" +
        left;

    window.open(pageURL, pageTitle, windowFeatures);
}

const OAuthButtonsBlock = () => {
    return (
        <Flex gap="10px" justify="center">
            <Button
                target="_blank"
                onClick={() => {
                    createPopupWin(
                        process.env.NEXT_PUBLIC_BASE_URL + "/auth/yandex",
                        "Yandex ID OAuth",
                        500,
                        600,
                    );
                }}
                type="link"
                icon={<Yandex style={{ width: "35px", height: "35px" }} />}
                style={{ height: "max-content", width: "max-content" }}
                styles={{ icon: { verticalAlign: "middle" } }}
            />
            <Button
                target="_blank"
                onClick={() => {
                    createPopupWin(
                        process.env.NEXT_PUBLIC_BASE_URL + "/api/auth/google",
                        "Google OAuth",
                        500,
                        600,
                    );
                }}
                type="link"
                icon={<Google style={{ width: "35px", height: "35px" }} />}
                style={{ height: "max-content", width: "max-content" }}
                styles={{ icon: { verticalAlign: "middle" } }}
            />
        </Flex>
    );
};

export default OAuthButtonsBlock;
