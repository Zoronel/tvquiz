export {};
declare global {
    interface Array<T> {
        indexOfObjectWithProperty(propertyName: string, propertyValue: any): number;
        containsObjectWithProperty(propertyName: string, propertyValue: any): Boolean;
        getItemsWithProperty<T>(propertyName: string, propertyValue: any, returnFirst: false): Array<T>;
        getItemsWithProperty<T>(propertyName: string, propertyValue: any, returnFirst?: true): T | undefined;
        first(): T;
        last(): T;
    }
}
//# sourceMappingURL=array.prototype.d.ts.map