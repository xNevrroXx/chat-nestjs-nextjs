import {z as zod} from "zod";
import {Sex, TLoginFormData, TRegisterFormData} from "@/models/IStore/IAuthentication";

const passwordValidation =
    zod.string({required_error: "Обязательное поле"})
        .min(6, "Минимум 6 символов")
        .max(16, "Максимум 16 символов")
        .regex(/^.*(?=.*[a-z]).*$/, "Минимум 1 латинская строчная буква")
        .regex(/^.*(?=.*[A-Z]).*$/, "Минимум 1 латинская прописная буква")
        .regex(/^.*(?=.*[!@#$%^&*)(_+]).*$/, "Минимум 1 из сомволов: !@#$%^&*)(_+")
        .regex(/^.*(?=.*\d).*$/, "Минимум 1 цифра");

const loginUserValidation =
    zod
        .object({
            email: zod.string({required_error: "Обязательное поле"}).email("Неверный email-адрес"),
            password: passwordValidation
        });
    type TLoginInferType = Exclude<zod.infer<typeof loginUserValidation>, TLoginFormData>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _loginTypeExhaustiveCheck = 0 as TLoginInferType;

const registerUserValidation =
    loginUserValidation
        .extend({
            name: zod.string({required_error: "Обязательное поле"}),
            surname: zod.string({required_error: "Обязательное поле"}),
            sex: zod.nativeEnum(Sex, {required_error: "Обязательное поле"}),
            age: zod.number({required_error: "Обязательное поле"}).min(12, "Минимальное значение - 12 лет").max(120, "Максимальное значение - 120 лет\""),
            passwordConfirmation: passwordValidation
        })
        .superRefine(({password, passwordConfirmation}, ctx) => {
            if (password !== passwordConfirmation) {
                ctx.addIssue({
                    code: zod.ZodIssueCode.custom,
                    fatal: true,
                    message: "Пароли не совпадают"
                });
            }
        });

type TRegisterInferType = Exclude<zod.infer<typeof registerUserValidation>, TRegisterFormData>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _registerTypeExhaustiveCheck = 0 as TRegisterInferType;



export {loginUserValidation, registerUserValidation};