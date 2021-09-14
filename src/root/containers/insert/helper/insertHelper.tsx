
export function getInputClassName(value: string, isValidating: boolean, isMandatory: boolean) {
    let className = "large" + (value ? " filled" : " empty") + (isValidating ? " isValidating" : "") + (isMandatory ? " isMandatory" : "");
    console.log('className', className)
    return className;
}