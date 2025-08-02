export function convertUmbracoLocalizationString(input: string, pattern: string): string {
    if (!input.startsWith('#')) return input;
    const regex = new RegExp(`#${pattern}`);
    const match = input.match(regex);
    if (!match || !match[1]) {
        return input;
    }
    return match[1]
        .replace(/([A-Z])/g, ' $1')  // Add space before uppercase letters
        .trim();
}