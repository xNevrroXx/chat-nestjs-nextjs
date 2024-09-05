import { createSelector } from "@reduxjs/toolkit";
import { TRootState } from "@/store";
import { TModalWindowsStore } from "@/models/modal-windows/modal-windows.store";

const modalInfoSelector = createSelector(
    [
        (state: TRootState) => state.modalWindows,
        (_, modalName: keyof TModalWindowsStore) => modalName,
    ],
    (modalWindows, targetModalName) => {
        return modalWindows[targetModalName];
    },
);

export { modalInfoSelector };
