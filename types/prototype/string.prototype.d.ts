export {};
declare global {
    interface String {
        sanitize(placeHolder?: string): String;
        isUrl(): Boolean;
        htmlEncode(): String;
    }
}
//# sourceMappingURL=string.prototype.d.ts.map