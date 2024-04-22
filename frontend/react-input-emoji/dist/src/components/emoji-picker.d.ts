declare const _default: React.MemoExoticComponent<typeof EmojiPicker>;
export default _default;
export type Props = {
    theme: 'light' | 'dark' | 'auto';
    set: 'native' | 'apple' | 'facebook' | 'google' | 'twitter';
    onSelectEmoji: (arg0: import("../types/types").EmojiMartItem) => void;
    disableRecent: boolean;
    customEmojis?: any[] | undefined;
    language?: import('../types/types').Languages | undefined;
};
/**
 * @typedef {object} Props
 * @property {'light' | 'dark' | 'auto'} theme
 * @property {'native' | 'apple' | 'facebook' | 'google' | 'twitter'} set
 * @property {function(import("../types/types").EmojiMartItem): void} onSelectEmoji
 * @property {boolean} disableRecent
 * @property {any[]=} customEmojis
 * @property {import('../types/types').Languages=} language
 */
/**
 * Emoji Picker Component
 * @param {Props} props
 */
declare function EmojiPicker(props: Props): React.JSX.Element;
import React from "react";
