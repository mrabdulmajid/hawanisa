(function ($) {
    'use strict';
    var TblToJSON = function (table, options) {
        this.$element = $(table);
        this.rows = [];
        this.headRows = [];
        this.options = $.extend({}, $.fn.tblToJSON.defaults, options);
        this.init();
    };

    TblToJSON.prototype = {
        constructor: TblToJSON,

        headings: function () {
            var headers = [];
            var r = this.headRows[0];
            var maxRowSpan = 1;
            for (var i = 0; i < r.cells.length; i++) {
                var cell = r.cells[i];
                if (cell.rowSpan > maxRowSpan)
                    maxRowSpan = cell.rowSpan;
            }
            if (maxRowSpan > 1) {
                var primaryIndex = 0;
                var secondaryIndex = 0;
                for (var i = 0; i < r.cells.length; i++) {
                    var cell = r.cells[i];
                    var cell = r.cells[i];
                    if (cell.rowSpan > 1) {
                        if (cell.valueType.indexOf("collection") >= 0) {
                            var vals = cell.value.split(".");
                            var arr = null;
                            for (var arrIndex = 0; arrIndex < headers.length; arrIndex++) {
                                if ($.isArray(headers[arrIndex]) && headers[arrIndex][0, 0] === vals[0]) {
                                    arr = headers[arrIndex];
                                    break;
                                }
                            }
                            if (arr) {
                                arr[1]["colCount"] = parseInt(arr[1]["colCount"]) + 1;
                                var colArr = {};
                                colArr["Key"] = vals[1];
                                colArr["Type"] = cell.valueType.split(":")[1];
                                arr[2].push(colArr);
                            }
                            else {
                                arr = [];
                                arr.push(vals[0]);
                                var collection = {};
                                collection["colCount"] = 1;
                                collection["primaryIndex"] = primaryIndex++;
                                collection["secondaryIndex"] = secondaryIndex++;
                                arr.push(collection);
                                arr.push([]);
                                var colArr = {};
                                colArr["Key"] = vals[1];
                                colArr["Type"] = cell.valueType.split(":")[1];
                                arr[2].push(colArr);
                                headers.push(arr);
                            }
                        }
                        else {
                            var headings = {};
                            headings["Key"] = cell.value;
                            headings["Type"] = cell.valueType;
                            headers.push(headings);
                            primaryIndex++;
                        }
                    }
                    else if (cell.colSpan > 1) {
                        var collection = {};
                        var arr = [];
                        arr.push(cell.value);
                        collection["colCount"] = cell.colSpan;
                        collection["primaryIndex"] = primaryIndex;
                        collection["secondaryIndex"] = secondaryIndex;
                        arr.push(collection);
                        arr.push([]);
                        headers.push(arr);
                        primaryIndex += cell.colSpan;
                        secondaryIndex += cell.colSpan;
                    }
                }
            }
            else {
                var primaryIndex = 0;
                var secondaryIndex = 0;
                for (var i = 0; i < r.cells.length; i++) {
                    var cell = r.cells[i];
                    var cell = r.cells[i];
                    if (cell.valueType.indexOf("collection") >= 0) {
                        var vals = cell.value.split(".");
                        var arr = null;
                        for (var arrIndex = 0; arrIndex < headers.length; arrIndex++) {
                            if ($.isArray(headers[arrIndex]) && headers[arrIndex][0, 0] === vals[0]) {
                                arr = headers[arrIndex];
                                break;
                            }
                        }
                        if (arr) {
                            arr[1]["colCount"] = parseInt(arr[1]["colCount"]) + 1;
                            var colArr = {};
                            colArr["Key"] = vals[1];
                            colArr["Type"] = cell.valueType.split(":")[1];
                            arr[2].push(colArr);
                        }
                        else {
                            arr = [];
                            arr.push(vals[0]);
                            var collection = {};
                            collection["colCount"] = 1;
                            collection["primaryIndex"] = primaryIndex++;
                            collection["secondaryIndex"] = secondaryIndex++;
                            arr.push(collection);
                            arr.push([]);
                            var colArr = {};
                            colArr["Key"] = vals[1];
                            colArr["Type"] = cell.valueType.split(":")[1];
                            arr[2].push(colArr);
                            headers.push(arr);
                        }
                    }
                    else {
                        var headings = {};
                        headings["Key"] = cell.value;
                        headings["Type"] = cell.valueType;
                        headers.push(headings);
                        primaryIndex++;
                    }
                }
            }
            if (maxRowSpan > 1 && this.headRows.length > 1) {
                r = this.headRows[1];
                for (var i = 0; i < headers.length; i++) {
                    if ($.isArray(headers[i])) {
                        var secondaryIndex = parseInt(headers[i][1]["secondaryIndex"]);
                        var colCount = parseInt(headers[i][1]["colCount"]);
                        for (var j = secondaryIndex; j < colCount; j++) {
                            var cell = r.cells[j];
                            var vals = cell.value.split(".");
                            var valTypes = cell.valueType.split(":");
                            var colArr = {};
                            colArr["Key"] = vals.length > 1 ? vals[1] : vals[0];
                            colArr["Type"] = valTypes.length > 1 ? valTypes[1] : valTypes[0];
                            headers[i][2].push(colArr);
                        }
                    }
                }
            }
            return headers;
        },

        values: function () {
            var headings = this.headings();
            var values = [];
            for (var ri = 0; ri < this.rows.length; ri++)
                if (this.rows[ri].rowType == 'primary')
                    values.push({});
            for (var hi = 0; hi < headings.length; hi++) {
                var head = headings[hi];
                if ($.isArray(head)) {
                    var counter = 0;
                    for (var ri = 0; ri < this.rows.length; ri++) {
                        var row = this.rows[ri];
                        if (row.rowType == 'primary') {
                            var collection = [];
                            var vals = {};
                            for (var i = 0; i < head[1].colCount; i++) {
                                var c = row.cells[i + head[1].primaryIndex];
                                vals[head[2][i].Key] = this.formatValue(head[2][i].Type, c.value);
                            }
                            collection.push(vals);
                            for (var j = ri + 1; j < this.rows.length; j++) {
                                var row = this.rows[j];
                                if (row.rowType == 'secondary') {
                                    var vals = {};
                                    for (var i = 0; i < head[1].colCount; i++) {
                                        var c = row.cells[i + head[1].secondaryIndex];
                                        if (c)
                                            vals[head[2][i].Key] = this.formatValue(head[2][i].Type, c.value);
                                    }
                                    if (!$.isEmptyObject(vals))
                                        collection.push(vals);
                                }
                                else {
                                    break;
                                }
                            }
                            values[counter++][head[0]] = collection;

                        }
                        else {
                            // var vals = {};
                            // for (var i = 0; i < head[1].colCount; i++) {
                            //     var c = row.cells[i + head[1].secondaryIndex];
                            //     vals[head[2][i].Key] = this.formatValue(head[2][i].Type,c.value);
                            // }
                        }
                    }
                } else {
                    var counter = 0;
                    for (var ri = 0; ri < this.rows.length; ri++) {
                        var row = this.rows[ri];
                        if (row.rowType == 'primary') {
                            var c = row.cells[hi];
                            values[counter++][head.Key] = this.formatValue(head.Type, c.value);
                        }
                    }
                }
            }



            return values;
        },

        formatValue: function (valType, value) {
            switch (valType.toLowerCase()) {
                case "int":
                    return parseInt(value);
                    break;
                case "float":
                    return parseFloat(value);
                    break;
                default:
                    return value;
            }
        },

        init: function () {
            // Init Rows
            var self = this, rowSpans = [], newRow = null, colCount = 0;
            this.$element.children("thead").children("tr").each(function (rowIndex, row) {
                newRow = $(row).tblToJSONRow(self.options);
                self.headRows.push(newRow);
            });
            this.$element.children("tbody").children("tr").each(function (rowIndex, row) {
                newRow = $(row).tblToJSONRow(self.options);
                if (rowIndex == 0) {
                    newRow.rowType = 'primary';
                    colCount = newRow.cells.length;
                }
                else {
                    var maxRowSpan = 1;
                    for (var i = 0; i < newRow.cells.length; i++) {
                        var cell = newRow.cells[i];
                        if (cell.rowSpan > maxRowSpan)
                            maxRowSpan = cell.rowSpan;
                    }
                    if (maxRowSpan > 1)
                        newRow.rowType = 'primary';
                    else if (row.cells.length == colCount)
                        newRow.rowType = 'primary';
                    else if (row.cells.length < colCount)
                        newRow.rowType = 'secondary';
                }
                self.rows.push(newRow);
            });
            //this.headings();

            $.proxy(function () {
                /**
                Fired when element was initialized by `$().tblToJSON()` method.
                Please note that you should setup `init` handler **before** applying `tblToJSON`.
        
                @event init
                @param {Object} event event object
                @param {Object} editable TblToJSON instance
                **/
                this.$element.triggerHandler('init', this);
            }, this);
        }
    };

    // Initialize
    $.fn.tblToJSON = function (options) {
        var table = new TblToJSON(this, options);
        return table.values();
    };

    $.fn.tblToJSON.defaults = {
        /**
         * Array of row indexes to ignore.
         * @type Array
         * @default []
         */
        ignoreRows: [],

        /**
         * Boolean if hidden rows should be ignored or not.
         * @type Boolean
         * @default true
         */
        ignoreHiddenRows: true,

        /**
         * Boolean if hidden rows should be ignored or not.
         * @type Boolean
         * @default false
         */
        ignoreEmptyRows: false,

        /**
         * Array of column headings to use. When supplied, all table rows are treated as values (no headings row).
         * @type Array
         * @default null
         */
        headings: null,

        /**
         * Determines if the `id` attribute of each `<tr>` element is included in the JSON.
         * @type Boolean
         * @default false
         */
        includeRowId: false,
    };
})(jQuery);