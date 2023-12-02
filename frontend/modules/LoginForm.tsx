"use client";

import { Form, FormItemProps, Input } from "antd";
import FormItem from "antd/es/form/FormItem";
import InputPassword from "antd/es/input/Password";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
// own modules
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { loginUserValidation } from "@/validation";
import { TLoginFormData } from "@/models/IStore/IAuthentication";
import { TValueOf } from "@/models/TUtils";
import { useAppDispatch } from "@/hooks/store.hook";
import { login } from "@/store/thunks/authentication";
import { useRouter } from "next/navigation";
import { createRoute } from "@/router/createRoute";
import { ROUTES } from "@/router/routes";

const LoginForm = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const formik = useFormik<TLoginFormData>({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: toFormikValidationSchema(loginUserValidation),
        onSubmit: (values, {setSubmitting, resetForm}) => {
            setSubmitting(false);

            void dispatch(login(values))
                .then(() => {
                    router.push(
                        createRoute({
                            path: ROUTES.MAIN
                        })
                    );
                });

            resetForm({
                values: {...values, password: ""},
                errors: {}
            });
        }
    });

    const checkValidationStatus = (field: keyof TLoginFormData): TValueOf<Pick<FormItemProps<TLoginFormData>, "validateStatus">> => {
        if (!formik.errors[field]) {
            return formik.values[field] ? "success" : undefined;
        }

        return formik.isSubmitting ? "error" : "warning";
    };

    return (
        <Form
            className="auth__form"
            name="basic"
            initialValues={{remember: true}}
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
                    <InputPassword
                        name="password"
                        type="password"
                        value={formik.values.password}
                        placeholder="Пароль"
                        size="large"
                    />
                </FormItem>

                <FormItem>
                    <SubmitButton/>
                </FormItem>
            </Form>
    );
};

export default LoginForm;
