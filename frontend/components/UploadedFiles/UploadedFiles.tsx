import React, { FC } from "react";
import { Button, Flex, Image, Space, Typography } from "antd";
import { EyeOutlined, DeleteOutlined, FileTwoTone } from "@ant-design/icons";
import { IFile } from "@/models/room/IRoom.store";
import "./uploaded-files.scss";
import { truncateTheText } from "@/utils/truncateTheText";
import classNames from "classnames";

const { Text } = Typography;

interface IProps {
    files: IFile[];
    onRemove: (file: IFile) => void;
}

const UploadedFiles: FC<IProps> = ({ files, onRemove }) => {
    return files.map((file) => (
        <Flex
            align={"center"}
            justify={"center"}
            className={"uploaded-file"}
            key={file.id}
        >
            {file.mimeType && file.mimeType.includes("image") ? (
                <Image
                    height={50}
                    src={file.url}
                    preview={{
                        mask: (
                            <Space direction="vertical" align="center">
                                <Flex gap={"small"}>
                                    <Button
                                        icon={<EyeOutlined />}
                                        type={"text"}
                                        size={"middle"}
                                    />
                                    <Button
                                        icon={<DeleteOutlined />}
                                        type={"text"}
                                        size={"middle"}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onRemove(file);
                                        }}
                                    />
                                </Flex>
                            </Space>
                        ),
                    }}
                    alt={"preview uploaded file " + file.originalName}
                />
            ) : (
                <div
                    className={classNames(
                        "uploaded-file",
                        "uploaded-file_with-thumbnail",
                    )}
                >
                    <Flex
                        vertical
                        align={"center"}
                        justify={"space-around"}
                        style={{ height: "100%" }}
                    >
                        <FileTwoTone />
                        <Text>
                            {truncateTheText({
                                text: file.originalName,
                                maxLength: 20,
                            })}
                        </Text>
                    </Flex>

                    <Space
                        className={"uploaded-file__mask"}
                        direction="vertical"
                        align="center"
                    >
                        <Flex justify={"center"} align={"center"}>
                            <Button
                                icon={<DeleteOutlined />}
                                type={"text"}
                                size={"middle"}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onRemove(file);
                                }}
                            />
                        </Flex>
                    </Space>
                </div>
            )}
        </Flex>
    ));
};

export default UploadedFiles;
