import { CSSProperties, FC, ReactNode } from "react";
import classNames from "classnames";
// styles
import "./paper.scss";

interface IPaper {
    children: ReactNode;
    style?: CSSProperties | undefined;
}
const Paper: FC<IPaper> = ({ children, style }) => {
    return (
        <section className={classNames("paper")} style={style}>
            {children}
        </section>
    );
};

export default Paper;
