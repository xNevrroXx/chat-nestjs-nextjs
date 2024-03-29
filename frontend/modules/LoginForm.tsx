"use client";

import { Form, FormItemProps, Input } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
// own modules
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { loginUserValidation } from "@/validation";
import { TLoginFormData } from "@/models/auth/IAuth.store";
import { TValueOf } from "@/models/TUtils";
import { useAppDispatch } from "@/hooks/store.hook";
import { login } from "@/store/thunks/authentication";
import { useRouter } from "next/navigation";
import { createRoute } from "@/router/createRoute";
import { ROUTES } from "@/router/routes";
import { isRejected } from "@reduxjs/toolkit";

const LoginForm = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const formik = useFormik<TLoginFormData>({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: toFormikValidationSchema(loginUserValidation),
        onSubmit: (values, { setSubmitting, resetForm }) => {
            setSubmitting(false);

            void dispatch(login(values)).then((data) => {
                if (isRejected(data)) {
                    return;
                }

                router.push(
                    createRoute({
                        path: ROUTES.MAIN,
                    }),
                );
            });

            resetForm({
                values: { ...values, password: "" },
                errors: {},
            });
        },
    });

    const checkValidationStatus = (
        field: keyof TLoginFormData,
    ): TValueOf<Pick<FormItemProps<TLoginFormData>, "validateStatus">> => {
        if (!formik.errors[field]) {
            return formik.values[field] ? "success" : undefined;
        }

        return formik.isSubmitting ? "error" : "warning";
    };

    return (
        <Form
            className="auth__form"
            name="basic"
            initialValues={{ remember: true }}
            onFinish={formik.handleSubmit}
            autoComplete="on"
            onChange={formik.handleChange}
        >
            <FormItem
                hasFeedback
                help={formik.errors.email}
                validateStatus={checkValidationStatus("email")}
            >
                <Input
                    name="email"
                    value={formik.values.email}
                    placeholder="E-mail"
                    size="large"
                />
            </FormItem>

            <FormItem
                hasFeedback
                help={formik.errors.password}
                validateStatus={checkValidationStatus("password")}
            >
                <Input.Password
                    name="password"
                    type="password"
                    value={formik.values.password}
                    placeholder="Пароль"
                    size="large"
                />
            </FormItem>

            <FormItem>
                <SubmitButton />
            </FormItem>
        </Form>
    );
};

export default LoginForm;
