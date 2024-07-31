// /**
//      * 绑定属性名，当属性值发生改变时，可自动对外抛eventType事件
//      * 
//      * @export
//      * @param {Key} eventType     事件类型
//      * @param {boolean} [selfDispatch]          默认false，使用Facade抛事件，event.data为实例本身  
//      *                                          如果为true，需要为EventDispatcher的实现，会使用自身抛事件  
//      * @returns                                 
//      */
// export function d_fire(eventType?: string, selfDispatch?: boolean) {
//     return function (host, property) {
//         let data = host.getPropertyDescriptor(property);
//         if (data && !data.configurable) {
//             return console.log(`无法绑定${host},${property},该属性不可设置`);
//         }
//         const key = "$d_fire_e$" + property;
//         let events = host[key];
//         let needSet;
//         if (!events) {
//             host[key] = events = [];
//             needSet = true;
//         }
//         events.push(eventType, selfDispatch);
//         if (needSet) {
//             if (data && data.set && data.get) {
//                 const orgSet = data.set;
//                 data.set = function (value) {
//                     if (this[property] != value) {
//                         orgSet.call(this, value);
//                         fire(this, events);
//                     }
//                 };
//             }
//             else if (!data || (!data.get && !data.set)) {
//                 let newProp = "$d_fire_p$" + property;
//                 host[newProp] = data && data.value;
//                 data = { enumerable: true, configurable: true };
//                 data.get = function () {
//                     return this[newProp];
//                 };
//                 data.set = function (value) {
//                     if (this[newProp] != value) {
//                         this[newProp] = value;
//                         fire(this, events);
//                     }
//                 };
//             }
//             else {
//                 return console.log(`无法绑定${host},${property}`);
//             }
//             Object.defineProperty(host, property, data);
//         }
//     }

//     function fire(host, events) {
//         for (let i = 0; i < events.length; i += 2) {
//             const eventType = events[i];
//             if (events[i + 1]) {
//                 if (typeof host.dispatch === "function") {
//                     host.dispatch(eventType);
//                 }
//             } else {
//                 dispatch(eventType, host);
//             }
//         }
//     }
// }