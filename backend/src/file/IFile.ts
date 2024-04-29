import { File } from "@prisma/client";

type TFileToClient = Omit<File, "path" | "size"> & {
    url: string;
    size: { value: string; unit: string };
};

export { TFileToClient };
