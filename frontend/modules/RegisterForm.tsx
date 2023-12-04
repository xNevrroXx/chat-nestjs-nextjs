"use client";

import {Button, Form, FormItemProps, Input, Select} from "antd";
import {useFormik} from "formik";
import {IUserAuth, Sex, TRegisterFormData} from "@/models/IStore/IAuthentication";
import {toFormikValidationSchema} from "zod-formik-adapter";
import {registerUserValidation} from "@/validation";
import {TValueOf} from "@/models/TUtils";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/store.hook";
import { registration } from "@/store/thunks/authentication";
import { createRoute } from "@/router/createRoute";
import { ROUTES } from "@/router/routes";

const {Option} = Select;


const RegisterForm = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const formik = useFormik<TRegisterFormData>({
        initialValues: {
            email: "",
            displayName: "",
            givenName: "",
            familyName: "",
            sex: Sex.MALE,
            age: 12,
            password: "",
            passwordConfirmation: ""
        },
        validationSchema: toFormikValidationSchema(registerUserValidation),
        onSubmit: (values, {setSubmitting, resetForm}) => {
            setSubmitting(false);

            void dispatch(registration(values))
                .then(() => {
                    router.push(
                        createRoute({
                            path: ROUTES.MAIN
                        })
                    );
                });

            resetForm({
                values: {...values, password: "", passwordConfirmation: ""},
                errors: {}
            });
        }
    });

    const checkValidationStatus = (field: keyof TRegisterFormData): TValueOf<Pick<FormItemProps<TRegisterFormData>, "validateStatus">> => {
        console.log("formik.errors: ", formik.errors);
        if (!formik.errors[field]) {
            return formik.values[field] ? "success" : undefined;
        }

        return formik.isSubmitting ? "error" : "warning";
    };

    const onSexChange = (value: TValueOf<Pick<IUserAuth, "sex">>) => {
        void formik.setFieldValue("sex", value);
    };

    return (
        <Form
            className="auth__form"
            name="basic"
            initialValues={{...formik.values, remember: true}}
            onFinish={formik.handleSubmit}
            autoComplete="off"
            onChange={formik.handleChange}
        >
            <Form.Item
                validateStatus={checkValidationStatus("email")}
                help={formik.errors.email}
                hasFeedback
            >
                <Input
                    name="email"
                    value={formik.values.email}
                    placeholder="E-mail"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                validateStatus={checkValidationStatus("displayName")}
                help={formik.errors.displayName}
                hasFeedback
            >
                <Input
                    name="displayName"
                    value={formik.values.displayName}
                    placeholder="Псевдоним"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                validateStatus={checkValidationStatus("givenName")}
                help={formik.errors.givenName}
                hasFeedback
            >
                <Input
                    name="givenName"
                    value={formik.values.givenName}
                    placeholder="Ваше имя"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                validateStatus={checkValidationStatus("familyName")}
                help={formik.errors.familyName}
                hasFeedback
            >
                <Input
                    name="familyName"
                    value={formik.values.familyName}
                    placeholder="Ваша фамилия"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="sex"
                validateStatus={checkValidationStatus("sex")}
                help={formik.errors.sex}
                hasFeedback
            >
                <Select
                    placeholder="Пол"
                    value={formik.values.sex}
                    onChange={onSexChange}
                >
                    <Option value={Sex.MALE}>муж</Option>
                    <Option value={Sex.FEMALE}>жен</Option>
                </Select>
            </Form.Item>

            <Form.Item
                validateStatus={checkValidationStatus("password")}
                help={formik.errors.password}
                hasFeedback
            >
                <Input.Password
                    name="password"
                    type="password"
                    value={formik.values.password}
                    placeholder="Пароль"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                validateStatus={checkValidationStatus("passwordConfirmation")}
                help={formik.errors.passwordConfirmation}
                hasFeedback
            >
                <Input.Password
                    name="passwordConfirmation"
                    type="password"
                    value={formik.values.passwordConfirmation}
                    placeholder="Повторите пароль"
                    size="large"
                />
            </Form.Item>

            <Form.Item>
                <Button size="large" className="auth__submit" type="primary"
                        htmlType="submit">
                    Зарегистрироваться
                </Button>
            </Form.Item>
        </Form>
    );
};

export {RegisterForm};
