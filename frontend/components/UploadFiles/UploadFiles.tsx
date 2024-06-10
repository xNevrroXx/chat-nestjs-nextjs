import React, { useState, forwardRef } from "react";
import { Upload, Modal, UploadFile } from "antd";
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

interface IUploadFilesProps {
    updateFileList: (files: UploadFile[]) => void;
    fileList: UploadFile[];
}

const UploadFiles = forwardRef<HTMLButtonElement, IUploadFilesProps>(
    ({ updateFileList, fileList }, ref) => {
        const room = useAppSelector(activeRoomSelector);
        const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
        const [previewTitle, setPreviewTitle] = useState<string>("");
        const [previewImage, setPreviewImage] = useState<string>("");

        const handleCancel = () => setIsPreviewOpen(false);

        const handlePreview = async (file: UploadFile) => {
            if (!file.url && !file.preview) {
                file.preview =
                    (await getBase64(file.originFileObj as File)) || undefined;
            }

            setPreviewImage(file.url || file.preview || "");
            setPreviewTitle(
                file.name ||
                    file.url!.substring(file.url!.lastIndexOf("/") + 1),
            );
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
                    action={process.env.NEXT_PUBLIC_BASE_URL + "/file/upload"}
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
                    onRemove={(file) => {
                        void $api.delete(
                            process.env.NEXT_PUBLIC_BASE_URL + "/file/waited",
                            {
                                data: {
                                    roomId: room.id,
                                    fileId: (file.response as { id: string })
                                        .id,
                                },
                            },
                        );
                    }}
                    withCredentials
                    multiple
                >
                    <button style={{ display: "none" }} ref={ref}></button>
                </Upload>
                <Modal
                    className="file-input__preview-wrapper"
                    title={previewTitle}
                    open={isPreviewOpen}
                    footer={null}
                    onCancel={handleCancel}
                >
                    <img
                        className="file-input__preview"
                        alt="preview image"
                        style={{ width: "100%" }}
                        src={previewImage}
                    />
                </Modal>
            </div>
        );
    },
);
UploadFiles.displayName = "UploadFiles";

export default UploadFiles;
