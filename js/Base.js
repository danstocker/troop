/**
 * Base Class.
 *
 * Supports extension, instantiation, property addition.
 * All base methods are non-enumerable.
 */
/*global troop */
(function () {
    return troop.Base = Object.create(Object.prototype, {
        /**
         * Extends base class with methods.
         * Extended class will have methods as read-only own properties.
         * @function
         * @this {troop.Base} Troop class.
         * @return {object}
         */
        extend: {
            writable: false,
            enumerable: true,
            configurable: false,
            value: function () {
                var result = Object.create(this);

                /**
                 * Extending once more with no own properties
                 * so that methods may be mocked on a static level.
                 */
                if (troop.testing === true) {
                    result = Object.create(result);
                }

                return result;
            }
        }
    });
}());
