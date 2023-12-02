import { File } from "@prisma/client";

type TFileToClient = Omit<File, "fileName"> & {
    url: string;
    size: { value: string; unit: string };
};

export { TFileToClient };
