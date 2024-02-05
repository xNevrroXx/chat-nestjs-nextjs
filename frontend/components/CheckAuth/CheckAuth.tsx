"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/hooks/store.hook";
import { checkAuthentication } from "@/store/thunks/authentication";
import { useRouter } from "next/navigation";
import { createRoute } from "@/router/createRoute";
import { ROUTES } from "@/router/routes";

const CheckAuth = () => {
    const isFetchedRef = useRef<boolean>(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isFetchedRef.current) {
            return;
        }

        isFetchedRef.current = true;
        void dispatch(checkAuthentication()).then((data) => {
            if (data.meta.requestStatus === "fulfilled") {
                router.push(createRoute({ path: ROUTES.MAIN }));
            }
            else {
                router.push(createRoute({ path: ROUTES.AUTH }));
            }
        });
    }, [dispatch, router]);

    return null;
};

export { CheckAuth };
