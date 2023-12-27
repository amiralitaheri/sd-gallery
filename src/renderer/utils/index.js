/**
 * @param classNames
 * @returns {string}
 */
export const cn = (...classNames) => classNames.filter(Boolean).join(" ");
