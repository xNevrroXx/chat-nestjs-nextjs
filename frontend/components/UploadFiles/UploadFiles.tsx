import React, {useState, useEffect, FC, RefObject} from "react";
import {Upload, Modal, UploadFile} from "antd";
import {RcFile} from "antd/es/upload";
// styles
import "./upload-files.scss";

function getBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

interface IUploadFilesProps {
    attachments: File[],
    removeAttachment: (fileId: string | number) => void,
    buttonRef: RefObject<HTMLButtonElement>
}

const UploadFiles: FC<IUploadFilesProps> = ({attachments, removeAttachment}) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [previewTitle, setPreviewTitle] = useState<string>("");
    const [previewImage, setPreviewImage] = useState<string>("");
    const [fileList, setFileList] = useState<UploadFile[]>();

    useEffect(() => {
        void addUrlToFiles();

        async function addUrlToFiles() {
            const filePromises = attachments.map<Promise<UploadFile>>(file => {
                return new Promise((resolve, reject) => {
                    getBase64(file)
                        .then(url => {
                            resolve({
                               ...file,
                               url: url || "fake"
                            } as never as UploadFile); // get an uid automatically
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
            });
            const files = await Promise.all(filePromises);

            setFileList(files);
        }
    }, [attachments]);

    const handleCancel = () => setIsPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file as RcFile) || undefined;
        }

        setPreviewImage(file.url || file.preview!);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1));
        setIsPreviewOpen(true);
    };

    const handleChange = ({fileList}: { fileList: UploadFile[] }) => {
        setFileList(fileList);
    };

    return (
        <div className="attachments">
            <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                onRemove={file => removeAttachment(file.name)}
            />
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
                    style={{width: "100%"}}
                    src={previewImage}
                />
            </Modal>
        </div>
    );
};

export default UploadFiles;