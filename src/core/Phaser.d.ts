declare module Phaser {
    namespace Cameras {
        namespace Scene2D {
            interface Camera {
                rawZoom?: number;
                displayZoom?: number;
            }
        }
    }
}

declare interface Object {
    /**
      * 返回一个浅副本的对象
      * 此对象会拷贝key value
      * 
      * @memberOf Object
      */
    $clone(): Object;
    /**
     * 将数据拷贝到 to
     * @param to 目标
     */
    copyto(to: Object);
    /**
     * 获取指定属性的描述，会查找当前数据和原型数据
     * @param property 指定的属性名字
     */
    getPropertyDescriptor(property: string): PropertyDescriptor;

    /**
     * 检查两个对象是否相等，只检查一层
     * 
     * @param {object} checker 
     * @param {...(keyof this)[]} args  如果不设置key列表，则使用checker可遍历的key进行检查
     * 
     * @memberOf Object
     */
    equals(checker: object, ...args: (keyof this)[]);

    /**
     * 
     * 拷贝指定的属性到目标对象
     * @param {object} to           目标对象
     * @param {...string[]} proNames   指定的属性
     */
    copyWith<T>(this: T, to: object, ...proNames: (keyof T)[]): void;
    /**
     * 
     * 获取指定的属性的Object
     * @param {...string[]} proNames 指定的属性
     * @returns {object}
     */
    getSpecObject<T>(this: T, ...proNames: (keyof T)[]): object;
}
