/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty;

    /**
     * @class
     * @ignore
     */
    troop.Surrogate = {
        /**
         * Adds surrogates buffer to class.
         * @this {troop.Base}
         */
        initSurrogates: function () {
            this.addConstants(/** @lends troop.Base */{
                /**
                 * Container for surrogate info. Added to class via .initSurrogates().
                 * @type {object}
                 */
                surrogateInfo: {
                    /**
                     * @type {function}
                     */
                    preparationHandler: undefined,

                    /**
                     * @type {object[]}
                     */
                    descriptors: []
                }
            });
        },

        /**
         * Retrieves first surrogate fitting constructor arguments.
         * @this {troop.Base}
         * @returns {troop.Base}
         */
        getSurrogate: function () {
            /**
             * Surrogate info property must be the class' own property
             * otherwise surrogates would be checked on instantiating
             * every descendant of the current class, too.
             * This would be wasteful, unnecessary, and confusing.
             */
            if (!hOP.call(this, 'surrogateInfo')) {
                // class has no surrogate
                return this;
            }

            var surrogateInfo = this.surrogateInfo,
                preparationHandler = surrogateInfo.preparationHandler,
                descriptorArguments = preparationHandler && preparationHandler.apply(this, arguments) ||
                                      arguments,
                descriptors = surrogateInfo.descriptors,
                i, descriptor;

            // going through descriptors and determining surrogate
            for (i = 0; i < descriptors.length; i++) {
                descriptor = descriptors[i];

                // determining whether arguments fit next filter
                if (descriptor.filter.apply(this, descriptorArguments)) {
                    return descriptor.namespace[descriptor.className];
                }
            }

            // returning caller as fallback
            return this;
        }
    };

    troop.Base.addMethods(/** @lends troop.Base */{
        /**
         * Adds a handler to be called before evaluating any of the surrogate filters.
         * The specified handler receives the original constructor arguments and is expected to
         * return a modified argument list (array) that will be passed to the surrogate filters.
         * @param {function} handler
         * @returns {troop.Base}
         * @see troop.Base.addSurrogate
         */
        prepareSurrogates: function (handler) {
            dessert.isFunction(handler, "Invalid handler");

            if (!hOP.call(this, 'surrogateInfo')) {
                troop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.preparationHandler = handler;

            return this;
        },

        /**
         * Adds a surrogate class to the current class. Instantiation is forwarded to the first surrogate where
         * the filter returns true.
         * @param {object} namespace Namespace in which the surrogate class resides.
         * @param {string} className Surrogate class name. The class the namespace / class name point to does not
         * have to exist (or be resolved when postponed) at the time of adding the filter.
         * @param {function} filter Function evaluating whether the surrogate class specified by the namespace
         * and class name fits the arguments.
         * @example
         * var ns = {}; // namespace
         * ns.Horse = troop.Base.extend()
         *     .prepareSurrogates(function (height) {
         *         return [height < 5]; // isPony
         *     })
         *     .addSurrogate(ns, 'Pony', function (isPony) {
         *         return isPony;
         *     })
         *     .addMethods({ init: function () {} });
         * ns.Pony = ns.Horse.extend()
         *     .addMethods({ init: function () {} });
         * var myHorse = ns.Horse.create(10), // instance of ns.Horse
         *     myPony = ns.Horse.create(3); // instance of ns.Pony
         * @returns {troop.Base}
         */
        addSurrogate: function (namespace, className, filter) {
            dessert
                .isObject(namespace, "Invalid namespace object")
                .isString(className, "Invalid class name")
                .isFunction(filter, "Invalid filter function");

            if (hOP.call(this, 'instanceRegistry')) {
                // clearing cached instances making sure the surrogate will not be bypassed
                this.clearInstanceRegistry();
            }

            if (!hOP.call(this, 'surrogateInfo')) {
                // initializing surrogate info container
                troop.Surrogate.initSurrogates.call(this);
            }

            this.surrogateInfo.descriptors.push({
                namespace: namespace,
                className: className,
                filter   : filter
            });

            return this;
        }
    });
}());
