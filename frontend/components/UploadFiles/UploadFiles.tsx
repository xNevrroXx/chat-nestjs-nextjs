import React, { useState, forwardRef } from "react";
import { Upload, UploadFile, Image, Divider, Flex } from "antd";
import { useAppSelector } from "@/hooks/store.hook";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import $api from "@/http";
import { FileType, IFile } from "@/models/room/IRoom.store";
import UploadedFiles from "@/components/UploadedFiles/UploadedFiles";
// styles
import "./upload-files.scss";

function getBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

const ENDPOINT_URL = process.env.NEXT_PUBLIC_BASE_URL + "/file-processed";

interface IUploadFilesProps {
    updateFileList: (files: UploadFile[]) => void;
    files: UploadFile[];
    uploadedFiles: IFile[];
    onRemove: (file: UploadFile | IFile) => void;
}

const UploadFiles = forwardRef<HTMLButtonElement, IUploadFilesProps>(
    ({ updateFileList, files, uploadedFiles, onRemove }, ref) => {
        const room = useAppSelector(activeRoomSelector);
        const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
        const [previewImage, setPreviewImage] = useState<string>("");

        const handlePreview = async (file: UploadFile) => {
            if (!file.url && !file.preview) {
                file.preview =
                    (await getBase64(file.originFileObj as File)) || undefined;
            }

            setPreviewImage(file.url || file.preview || "");
            setIsPreviewOpen(true);
        };

        const handleChange = ({ fileList }: { fileList: UploadFile[] }) => {
            const tempFileList = fileList.map((file) => {
                if (file.status === "error") {
                    return {
                        ...file,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
                        error: file.response.message,
                    };
                }

                return file;
            });

            updateFileList(tempFileList);
        };

        if (!room || !room.id) {
            return;
        }

        return (
            <Flex
                className="attachments"
                wrap={"wrap"}
                align={"center"}
                gap={"large"}
            >
                <Upload
                    listType="picture-card"
                    action={ENDPOINT_URL}
                    data={(file) => {
                        return {
                            ...file,
                            roomId: room.id,
                            fileType: FileType.ATTACHMENT,
                        };
                    }}
                    fileList={files}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    onRemove={onRemove}
                    withCredentials
                    multiple
                >
                    <button style={{ display: "none" }} ref={ref}></button>
                </Upload>

                {files.length > 0 && uploadedFiles.length > 0 && (
                    <>
                        <Divider type={"vertical"} />
                    </>
                )}

                <UploadedFiles onRemove={onRemove} files={uploadedFiles} />

                {isPreviewOpen && (
                    <Image
                        alt={"preview image"}
                        wrapperStyle={{ display: "none" }}
                        preview={{
                            visible: isPreviewOpen,
                            onVisibleChange: (visible) =>
                                setIsPreviewOpen(visible),
                            afterOpenChange: (visible) =>
                                !visible && setPreviewImage(""),
                        }}
                        src={previewImage}
                    />
                )}
            </Flex>
        );
    },
);
UploadFiles.displayName = "UploadFiles";

export default UploadFiles;
