import React, { useState, forwardRef } from "react";
import { Upload, UploadFile, Image } from "antd";
// styles
import "./upload-files.scss";
import { useAppSelector } from "@/hooks/store.hook";
import { activeRoomSelector } from "@/store/selectors/activeRoom.selector";
import $api from "@/http";
import { FileType } from "@/models/room/IRoom.store";

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
    fileList: UploadFile[];
}

const UploadFiles = forwardRef<HTMLButtonElement, IUploadFilesProps>(
    ({ updateFileList, fileList }, ref) => {
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
            <div className="attachments">
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
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    onRemove={async (file) => {
                        await $api.delete(ENDPOINT_URL, {
                            data: {
                                roomId: room.id,
                                fileId: (file.response as { id: string }).id,
                            },
                        });
                    }}
                    withCredentials
                    multiple
                >
                    <button style={{ display: "none" }} ref={ref}></button>
                </Upload>
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
            </div>
        );
    },
);
UploadFiles.displayName = "UploadFiles";

export default UploadFiles;
