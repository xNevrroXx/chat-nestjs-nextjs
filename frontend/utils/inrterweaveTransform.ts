import React from "react";

const transform = (
    node: HTMLElement,
    children: React.ReactNode[],
): React.ReactNode => {
    const namespaces = [
        "http://www.w3.org/1998/Math/MathML",
        "http://www.w3.org/2000/svg",
    ];

    if (node.namespaceURI && namespaces.includes(node.namespaceURI)) {
        const attributes: { [att: string]: string | null } = {};
        node.getAttributeNames().forEach((attName) => {
            attributes[attName] = node.getAttribute(attName);
        });
        return React.createElement(node.tagName, attributes, children);
    }
    return undefined;
};

export { transform };
