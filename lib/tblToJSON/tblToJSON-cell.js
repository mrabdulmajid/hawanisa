(function ($) {
    'use strict';

    var TblToJSONCell = function (cell, index, options) {
        this.$element = $(cell);
        this.index = index;
        this.rowSpan = 1;
        this.colSpan = 1;
        this.value = null;
        this.valueType = null;
        this.options = $.extend({}, $.fn.tblToJSONCell.defaults, options);
        this.init();
    };

    TblToJSONCell.prototype = {
        constructor: TblToJSONCell,

        setCell: function (options) {
            var runOptions = $.extend({}, this.options, options);
            this.value = $.trim(this.$element.text());
            this.propName = this.$element.attr(this.options.dataPropName);
            this.valueType = this.$element.attr(this.options.dataValueType);
            if (!this.valueType)
                this.valueType = "string";
            if (this.propName) {
                this.value = this.propName;
            }
            this.colSpan = 1;
            if (this.$element.attr('colSpan')) {
                this.colSpan = parseInt(this.$element.attr('colSpan'), 10);
            }
            this.rowSpan = 1;
            if (this.$element.attr('rowSpan')) {
                this.rowSpan = parseInt(this.$element.attr('rowSpan'), 10);
            }
        },

        init: function () {
            this.setCell();
            $.proxy(function () {
                /**
                Fired when element was initialized by `$().tableToJSON()` method.
                Please note that you should setup `init` handler **before** applying `tableToJSON`.
        
                @event init
                @param {Object} event event object
                @param {Object} editable TblToJSONCell instance
                **/
                this.$element.triggerHandler('init', this);
            }, this);
        }
    };

    // Initialize cell
    $.fn.tblToJSONCell = function (index, options) {
        return new TblToJSONCell(this, index, options);
    };

    $.fn.tblToJSONCell.defaults = {
        /**
         * Boolean if HTML tags in table cells should be preserved.
         * @type boolean
         * @default false
         */
        allowHTML: false,

        /**
         * String of the data-* attribute name to use for the propName value.
         * @type String
         * @default 'propName'
         */
        dataPropName: 'data-propName',

        /**
         * String of the data-* attribute name to use for the valType value.
         * @type String
         * @default 'valType'
         */
        dataValueType: 'data-valType',
    };
})(jQuery);
