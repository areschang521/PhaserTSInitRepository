import { Events } from "phaser";
import { game } from "../main";
import { Key } from "../structure/Key";

/**
 * 绑定属性名，当属性值发生改变时，可自动对外抛eventType事件
 * 
 * @export
 * @param {Key} eventType     事件类型
 * @param {boolean} [selfDispatch]          默认false，使用Facade抛事件，event.data为实例本身  
 *                                          如果为true，需要为EventDispatcher的实现，会使用自身抛事件  
 * @returns                                 
 */
export function d_fire(eventType: Key, selfDispatch?: boolean) {
    return function (host: any, property: string) {
        let data = host.getPropertyDescriptor(property);
        if (data && !data.configurable) {
            return
        }
        const key = "$d_fire_e$" + property;
        let events: any[] = host[key];
        let needSet: boolean;
        if (!events) {
            host[key] = events = [];
            needSet = true;
        }
        events.push(eventType, selfDispatch);
        if (needSet) {
            if (data && data.set && data.get) {
                const orgSet = data.set;
                data.set = function (value) {
                    if (this[property] != value) {
                        orgSet.call(this, value);
                        fire(this, events);
                    }
                };
            }
            else if (!data || (!data.get && !data.set)) {
                let newProp = "$d_fire_p$" + property;
                host[newProp] = data && data.value;
                data = { enumerable: true, configurable: true };
                data.get = function () {
                    return this[newProp];
                };
                data.set = function (value) {
                    if (this[newProp] != value) {
                        this[newProp] = value;
                        fire(this, events);
                    }
                };
            }
            else {
                return
            }
            Object.defineProperty(host, property, data);
        }
    }

    function fire(host: Events.EventEmitter, events: any[]) {
        for (let i = 0; i < events.length; i += 2) {
            const eventType = events[i];
            if (events[i + 1]) {
                if (typeof host.emit === "function") {
                    host.emit(eventType);
                }
            } else {
                game.events.emit(eventType, host);
            }
        }
    }
}

/**
 * https://github.com/Microsoft/vscode/blob/master/src/vs/base/common/decorators.ts
 * 
 * @export
 * @param {*} target 
 * @param {string} key 
 * @param {*} descriptor 
 */
export function d_memoize(_target: any, key: string, descriptor: any) {
    let fnKey: string = null;
    let fn: Function = null;

    if (typeof descriptor.value === 'function') {
        fnKey = 'value';
        fn = descriptor.value;
    } else if (typeof descriptor.get === 'function') {
        fnKey = 'get';
        fn = descriptor.get;
    }

    if (!fn) {
        throw new Error('not supported');
    }

    const memoizeKey = `$memoize$${key}`;

    descriptor[fnKey] = function (...args: any[]) {
        if (!this.hasOwnProperty(memoizeKey)) {
            Object.defineProperty(this, memoizeKey, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: fn.apply(this, args)
            });
        }
        return this[memoizeKey];
    };
}