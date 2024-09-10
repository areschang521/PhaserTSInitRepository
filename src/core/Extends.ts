export const enum ClassConst {
    DebugIDPropertyKey = "_insid"
}
/**
     * 获取完整的 PropertyDescriptor
     * 
     * @param {Partial<PropertyDescriptor>} descriptor 
     * @param {boolean} [enumerable=false] 
     * @param {boolean} [writable]
     * @param {boolean} [configurable=true] 
     * @returns 
     */
export function getDescriptor(descriptor: PropertyDescriptor, enumerable = false, writable = true, configurable = true) {
    if (!descriptor.set && !descriptor.get) {
        descriptor.writable = writable;
    }
    descriptor.configurable = configurable;
    descriptor.enumerable = enumerable;
    return descriptor;
}

export function makeDefDescriptors(descriptors: object, enumerable = false, writable = true, configurable = true) {
    for (let key in descriptors) {
        let desc: PropertyDescriptor = descriptors[key];
        let enumer = desc.enumerable == undefined ? enumerable : desc.enumerable;
        let write = desc.writable == undefined ? writable : desc.writable;
        let config = desc.configurable == undefined ? configurable : desc.configurable;
        descriptors[key] = getDescriptor(desc, enumer, write, config);
    }
    return descriptors as PropertyDescriptorMap;
}

Object.defineProperties(Object.prototype, makeDefDescriptors({
    $clone: {
        value: function () {
            let o = {};
            for (let n in this) {
                o[n] = this[n];
            }
            return o;
        }
    },
    getPropertyDescriptor: {
        value: function (property: string): any {
            var data = Object.getOwnPropertyDescriptor(this, property);
            if (data) {
                return data;
            }
            var prototype = Object.getPrototypeOf(this);
            if (prototype) {
                return prototype.getPropertyDescriptor(property);
            }
        }
    },
    copyto: {
        value: function (to: Object) {
            for (let p in this) {
                var data: PropertyDescriptor = to.getPropertyDescriptor(p);
                if (!data || (data.set || data.writable)) {// 可进行赋值，防止将属性中的方法给重写
                    to[p] = this[p];
                }
            }
        }
    },
    equals: {
        value: function (checker: Object, ...args: string[]) {
            if (!args.length) {
                args = Object.getOwnPropertyNames(checker);
            }
            for (let i = 0; i < args.length; i++) {
                let key = args[i];
                if (key == ClassConst.DebugIDPropertyKey) {
                    continue
                }
                if (this[key] != checker[key]) {
                    return false;
                }
            }
            return true;
        }
    },
    copyWith: {
        value: function (to: object, ...proNames: string[]) {
            for (let p of proNames) {
                if (p in this) {
                    to[p] = this[p];
                }
            }
        }
    },
    getSpecObject: {
        value: function (...proNames: string[]) {
            let obj = {};
            for (let p of proNames) {
                if (p in this) {
                    if (this[p] != null) {
                        obj[p] = this[p];
                    }
                }
            }
            return obj;
        }
    }
}
));

Object.defineProperties(Phaser.Cameras.Scene2D.Camera.prototype, {
    rawZoom: {
        get: function () {
            return this._rawZoom || 1;
        },
        set: function (value) {
            this._rawZoom = value;
        }
    },
    displayZoom: {
        get: function () {
            return this._displayZoom || 1;
        },
        set: function (value) {
            this._displayZoom = value;
        }
    },
})

export function registerExtends() {

}