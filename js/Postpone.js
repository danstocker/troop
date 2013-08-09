/**
 * Postponed Property Definition.
 *
 * API to add properties to objects so that they won't get evaluated until
 * first access.
 */
/*global dessert, troop, console */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    troop.Base.addMethods.call(troop, /** @lends troop */{
        /**
         * Adds a postponed property definition (read-only).
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} generator Generates (and returns) property value.
         */
        postpone: function (host, propertyName, generator) {
            dessert
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(generator, "Invalid generator function");

            var sliceArguments = Array.prototype.slice.bind(arguments),
                generatorArguments;

            // checking whether property is already defined
            if (hOP.call(host, propertyName)) {
                return;
            }

            // rounding up rest of the arguments
            generatorArguments = sliceArguments(0, 2).concat(sliceArguments(3));

            // placing class placeholder on namespace as getter
            Object.defineProperty(host, propertyName, {
                get: function () {
                    // obtaining property value
                    var value = generator.apply(this, generatorArguments);

                    if (typeof value !== 'undefined') {
                        // generator returned a property value
                        // overwriting placeholder with actual property value
                        Object.defineProperty(host, propertyName, {
                            value       : value,
                            writable    : false,
                            enumerable  : true,
                            configurable: false
                        });
                    } else {
                        // no return value
                        // generator supposedly assigned value to property
                        value = host[propertyName];
                    }

                    return value;
                },

                set: function (value) {
                    // overwriting placeholder with property value
                    Object.defineProperty(host, propertyName, {
                        value       : value,
                        writable    : false,
                        enumerable  : true,
                        configurable: false
                    });
                },

                enumerable  : true,
                configurable: true  // must be configurable in order to be re-defined
            });
        }
    });
}());