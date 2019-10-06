/**
 * jQuery Grid - Plain, simple table that adds rows as you type
 * ===============================================================
 * @author    Jose Rui Santos
 */
(function ($, undefined) {
    'use strict';
    var GridClass = function ($elem, opts) {
        var events,
            json,
            DOM = {
                elemsWithValAttr: 'button, select, option, input, li, meter, progress, param',
                init: function () {
                    this.$table = $elem.is('table') ? $elem : $('<table>').appendTo($elem);
                    if (opts.caption) {
                        $('<caption>').text(opts.caption).prependTo(this.$table);
                    }
                    this.addColHeaders();
                    this.tabstops = this.getTabStops();
                    this.$tbody = $('<tbody>').appendTo(this.$table);
                    $elem.
                        bind('addRow.rsLiteGrid', DOM.addLastRow).
                        bind('delRow.rsLiteGrid', DOM.delRow).
                        bind('getData.rsLiteGrid', json.getData).
                        bind('setData.rsLiteGrid', json.setData).
                        bind('create.rsLiteGrid', events.onCreate).
                        bind('destroy.rsLiteGrid', events.onDestroy).
                        bind('onAddingRow.rsLiteGrid', events.onAddingRow).
                        bind('onAddRow.rsLiteGrid', events.onAddRow).
                        bind('onRemovingRow.rsLiteGrid', events.onRemovingRow).
                        bind('onRemoveRow.rsLiteGrid', events.onRemoveRow);

                    var minRows = opts.minRows || 0;
                    this.qtRows = 0;
                    if (minRows > 1 ) {
                        for (; minRows > 1; minRows--) {
                            this.addRow();
                            this.qtRows++;
                        }
                    }
                    if (minRows > 0 ) {
                        this.addLastRow();
                    }
                    $elem.trigger('create.rsLiteGrid');
                },
                getSelectionStart: function (domElement, defaultVal) {
                    try {
                        return (domElement.selectionStart || defaultVal || 0);
                    } catch (DOMException) {
                        return defaultVal || 0; // some DOM elements do not support selectionStart. Not a problem, assume 0.
                    }
                },
                setQtRows: function () {
                    this.qtRows = this.$tbody.children().length;
                },
                addColHeaders: function () {
                    if (opts.cols && opts.cols.filter(function (col) { return col.header; }).length > 0) { // is there at least one colum with a header property?
                        $('<thead><tr>' + opts.cols.map(function (obj) { return '<th>' + (obj.header || '') + '</th>'; }).join('') + '</tr></thead>').appendTo(this.$table);
                    }
                },
                getTabStops: function () {
                    return opts.cols ? $.map(opts.cols, function (obj, index) { return obj.tabStop !== false ? index : undefined; }) : [];
                },
                addRow: function (values) {
                    if (!opts.cols || (opts.maxRows > 0 && this.qtRows >= opts.maxRows)) { return; }

                    var $lastRow = $('<tr>'),
                        $userLastRow = null;
                    opts.cols.forEach(function (col) {
                        var $cellCtrl = $(col.markup || '<input type=\'text\'>');
                        if (col.defaultValue !== undefined && col.defaultValue !== null) {
                            if ($cellCtrl.is(DOM.elemsWithValAttr)) {
                                $cellCtrl.val(col.defaultValue);
                            } else {
                                $cellCtrl.text(col.defaultValue);
                            }
                        }
                        $lastRow.append($('<td>').append($cellCtrl));
                    });

                    if (values) {
                        json.setRowValues($lastRow, values);
                    }
                    if (opts.onAddingRow) {
                        $userLastRow = $elem.triggerHandler('onAddingRow.rsLiteGrid', [$lastRow, this.qtRows]);
                    }
                    if ($userLastRow !== false) {
                        if ($userLastRow === null || !($userLastRow instanceof jQuery)) {
                            $userLastRow = $lastRow;
                        }
                        $userLastRow.appendTo(DOM.$tbody);
                        if (this.tabstops.length) {
                            $userLastRow.children().children().bind('keydown.rsLiteGrid', events.keyboardCellNavigation);
                        }
                        $elem.triggerHandler('onAddRow.rsLiteGrid', [$userLastRow, this.qtRows]);
                        return $userLastRow;
                    }
                },
                addLastRow: function (event, values) {
                    events.unsetLastRowEvents(); // unset events from currently last row
                    // and set the events for the new last row
                    DOM.setQtRows();
                    events.setLastRowEvents(DOM.addRow(values));
                    DOM.setQtRows();
                },
                delRow: function (event, $deleteRow) {
                    if ($deleteRow) {
                        $deleteRow = $deleteRow.closest('tr');
                        if ($deleteRow.length) {
                            var $allrows = DOM.$tbody.children(),
                                totalRows = $allrows.length,
                                deleteRowIndex = $allrows.index($deleteRow),
                                removeRowInfo = true,
                                doDelete = function () {
                                    $deleteRow.remove();
                                    $elem.triggerHandler('onRemoveRow.rsLiteGrid', [$deleteRow, deleteRowIndex]);
                                    DOM.setQtRows();
                                };

                            if (deleteRowIndex > -1 && totalRows > opts.minRows) {
                                removeRowInfo = $elem.triggerHandler('onRemovingRow.rsLiteGrid', [$deleteRow, deleteRowIndex]);
                                if (removeRowInfo !== false) {
                                    // deleting the last row ?
                                    if (totalRows - 1 === deleteRowIndex) {
                                        events.setLastRowEvents($deleteRow.prev());
                                    }

                                    if (typeof removeRowInfo === 'number' && removeRowInfo > 0) {
                                        setTimeout(doDelete, removeRowInfo);
                                    } else {
                                        doDelete();
                                    }
                                }
                            }
                        }
                    }
                }
            };

        events = {
            onCreate: function (event) {
                if (opts.onCreate) {
                    opts.onCreate(event);
                }
            },
            onDestroy: function (event) {
                $elem.empty().unbind('.rsLiteGrid');
                if (opts.onDestroy) {
                    opts.onDestroy(event);
                }
            },
            onAddingRow: function (event, $lastRow, index) {
                if (opts.onAddingRow) {
                    $lastRow = opts.onAddingRow(event, $lastRow, index);
                }
                return $lastRow;
            },
            onAddRow: function (event, $userLastRow, index) {
                if (opts.onAddRow) {
                    opts.onAddRow(event, $userLastRow, index);
                }
            },
            onRemovingRow: function (event, $deleteRow, index) {
                if (opts.onRemovingRow) {
                    return opts.onRemovingRow(event, $deleteRow, index);
                }
            },
            onRemoveRow: function (event, $deleteRow, index) {
                if (opts.onRemoveRow) {
                    opts.onRemoveRow(event, $deleteRow, index);
                }
            },
            setLastRowEvents: function ($lastRow) {
                if (opts.autoAddRows) {
                    if (!$lastRow) {
                        $lastRow = DOM.$tbody.children().last();
                    }
                    $lastRow.children().children().bind('change.rsLiteGrid', events.onChange);
                }
            },
            unsetLastRowEvents: function () {
                if (opts.autoAddRows) {
                    DOM.$tbody.children().last().children().children().unbind('change.rsLiteGrid', events.onChange);
                }
            },
            onChange: function () {
                var $thisCol = $(this),
                    colIndex = $thisCol.closest('td').index(),
                    defaultVal = '';
                if (opts.cols && opts.cols[colIndex]) {
                    if (opts.cols[colIndex].defaultValue !== undefined && opts.cols[colIndex].defaultValue !== null) {
                        defaultVal = opts.cols[colIndex].defaultValue;
                    }
                }
                if (($thisCol.is(DOM.elemsWithValAttr) ? $thisCol.val() : $thisCol.text()) !== defaultVal) {
                    DOM.addLastRow();
                }
            },
            keyboardCellNavigation: function (e) {
                var keys = {
                        up: 38,
                        down: 40,
                        left: 37,
                        right: 39,
                        enter: 13,
                        tab: 9,
                        shiftTab: -9
                    },
                    $currentCol = $(this),
                    $currentRow = $currentCol.closest('tr'),
                    currentRowIndex = $currentRow.index(),
                    currentColIndex = $currentCol.closest('td').index();
                if (e.which === keys.tab && e.shiftKey) {
                    e.which = keys.shiftTab;
                }
                switch (e.which) {
                    // focus on previous cell (or if at the beginning of the row, focus on the previous row last cell)
                    case keys.left:
                    case keys.shiftTab:
                        if (e.which === keys.shiftTab || DOM.getSelectionStart(this) === 0) {
                            var prevStops = DOM.tabstops.filter(function (elem) {
                                    return elem < currentColIndex;
                                });
                            if (prevStops.length === 0) {
                                // try to focus on the previous row last focusable col
                                var $prevRow = $currentRow.prev();
                                if ($prevRow.length === 1) {
                                    $prevRow.children().eq(DOM.tabstops[DOM.tabstops.length - 1]).children().focus();
                                }
                            } else {
                               $currentRow.children().eq(prevStops[prevStops.length - 1]).children().focus();
                            }
                            e.preventDefault();
                        }
                        break;

                    // focus on next cell (or if at the ending of the row, focus on the next row first cell)
                    case keys.right:
                    case keys.enter:
                    case keys.tab:
                        if (e.which !== keys.right || !this.value || DOM.getSelectionStart(this, this.value.length) === this.value.length) {
                            var nextStops = DOM.tabstops.filter(function (elem) {
                                    return elem > currentColIndex;
                                });

                            if (nextStops.length === 0) {
                                // try to focus on the next row first focusable col
                                var $nextRow = $currentRow.next();
                                if ($nextRow.length === 0) {
                                    $(this).triggerHandler('change.rsLiteGrid');
                                    $nextRow = $currentRow.next();
                                }
                                if ($nextRow.length === 1) {
                                    $nextRow.children().eq(DOM.tabstops[0]).children().focus();
                                }
                            } else {
                                 $currentRow.children().eq(nextStops[0]).children().focus();
                            }
                            e.preventDefault();
                        }
                        break;
                    case keys.up:
                    case keys.down:
                        switch (e.which) {
                            case keys.up:
                                if (currentRowIndex > 0) {
                                    $currentRow.prev().children().eq($currentCol.closest('td').index()).children().focus();
                                    e.preventDefault();
                                }
                                break;
                            case keys.down:
                                if (currentRowIndex < DOM.$tbody.children().length - 1) {
                                    $currentRow.next().children().eq($currentCol.closest('td').index()).children().focus();
                                    e.preventDefault();
                                }
                        }
                }
            }
        };

        json = {
            getData: function () {
                var rows = [];
                if (opts.cols) {
                    var $allrows = DOM.$tbody.children(),
                        colCount = $allrows.last().children().length;
                    $allrows.each(function (index) {
                        var $cols = $allrows.eq(index).children(),
                            $col,
                            row = {},
                            colName;
                        for (var colNumber = 0; colNumber < colCount; ++colNumber) {
                            colName = opts.cols[colNumber] ? opts.cols[colNumber].name : undefined;
                            if (colName) {
                                $col = $cols.eq(colNumber).children();
                                row[colName] = $col.is(DOM.elemsWithValAttr) ? $col.val() : $col.text();
                            }
                        }
                        rows.push(row);
                    });
                }
                return rows;
            },
            setData: function (event, values, append) {
                if (values) {
                    var $allRows = DOM.$tbody.children();
                    if (append && opts.autoAddRows) {
                        var $lastRow = $allRows.last(),
                            $cols = $lastRow.children(),
                            $col;

                        // if all inputs in last row are empty, then delete the last row
                        if ($cols.filter(function (index) {
                            $col = $cols.eq(index).children();
                            return $col.is(DOM.elemsWithValAttr) ? $col.val() === '' : true;
                        }).length === $cols.length) {
                            $lastRow.remove();
                        }
                    }
                    events.unsetLastRowEvents();
                    if (!append) {
                        $allRows.remove();
                    }
                    DOM.setQtRows();

                    for (var idx = 0, qt = values.length; idx < qt; ++idx) {
                        DOM.addRow(values[idx]);
                    }
                    if (opts.autoAddRows) {
                        DOM.addLastRow();
                    }
                }
            },
            setRowValues: function ($row, values) {
                var $rowCols = $row.children(),
                    colCount = $rowCols.length,
                    colNumber,
                    $targetCol,
                    $col,
                    key,
                    doFilter = function (colInfo) {
                        return colInfo && colInfo.name === key;
                    };

                for (key in values) {
                    if (values.hasOwnProperty(key)) {
                        $targetCol = opts.cols.filter(doFilter);
                        if ($targetCol.length === 1) {
                            colNumber = opts.cols.indexOf($targetCol[0]);
                            if (colNumber > -1 && colNumber < colCount) {
                                $col = $rowCols.eq(colNumber).children();
                                if ($col.length === 1) {
                                    /* jshint -W030 */
                                    $col.is(DOM.elemsWithValAttr) ? $col.val(values[key]) : $col.text(values[key]);
                                }
                            }
                        }
                    }
                }
            }
        };

        DOM.init();
    };

    $.fn.rsLiteGrid = function (options) {
        var addRow = function (values) {
                return this.trigger('addRow.rsLiteGrid', [values]);
            },
            delRow = function ($deleteRow) {
                return this.trigger('delRow.rsLiteGrid', [$deleteRow]);
            },
            getData = function () {
                return this.triggerHandler('getData.rsLiteGrid');
            },
            setData = function (values, append) {
                return this.trigger('setData.rsLiteGrid', [values, append]);
            },
            destroy = function () {
                return this.trigger('destroy.rsLiteGrid');
            };

        if (typeof options === 'string') {
            var otherArgs = Array.prototype.slice.call(arguments, 1);
            switch (options) {
                case 'addRow': return addRow.apply(this, otherArgs);
                case 'delRow': return delRow.apply(this, otherArgs);
                case 'setData': return setData.apply(this, otherArgs);
                case 'getData': return getData.apply(this, otherArgs);
                case 'destroy': return destroy.apply(this);
                default: return this;
            }
        }
        var opts = $.extend({}, $.fn.rsLiteGrid.defaults, options);
        return this.each(function () {
            new GridClass($(this), opts);
        });
    };

    $.fn.rsLiteGrid.defaults = {
        caption: null,      // Table caption. If not null, adds a <caption> tag to the <table>. Type: String.
        cols: [{
            name: 'col1',                    // Mandatory identifier for JSON data exchange. Type: String.
            header: 'col1',                  // Optional column header, that is placed inside the <th> tag. Type: String.
                                             // If ommited, then an empty <th></th> is created.
                                             // But if header is always ommited in every element of cols, then not a single <th> is ever created (and therefore <header> is not created as well).
            markup: '<input type="text">',   // Control placed on this column. If ommited, then '<input type="text">' is used. Type: String.
            defaultValue: null,              // Default value. It is used to determine whether the cell has been changed.
            tabStop: true                    // Whether this column's cells are focusable on keyboard (tab or arrow keys) navigation. If ommited, then true is used. Type: boolean.
        }],
        minRows: 1,     // Minimum allowed number of rows. Use null or 0 if it is ok for the table to be empty. Type: positive integer.
        maxRows: null,  // Maximum allowed number of rows. Use null if there is no limit to the number of rows. Type: positive integer.
                        // Example: If table should have only 3 rows, set minRows = maxRows = 3;
                        //          If table should have between 1 and 5 rows, set minRows = 1 and maxRows = 5;
                        //          If table should have at least one row, set minRows = 1 and maxRows = null.
        autoAddRows: true,      // Determines whether a new row is appended to the bottom of the table, when last row is changed. Type: boolean.
                                //   If true, then a new row is automatically appended when the user edits the last empty row.
                                //   If false, then no row is automatically appended. It can only be appended via the method 'addRow'.
        onAddingRow: null,      // Fired immediatelly before a new row is about to be appended to the bottom of the table. Type: function (event, $newRow, index).
                                //   The $newRow parameter is a jQuery object holding the markup to be added <tr><td>..</td><td>..</td>....</tr>
                                //   The index parameter is a zero-based number that indicates the index of the new row in the table.
                                //   If returns false, then the $newRow is not added. The onAddRow is not called.
                                //   If returns a jQuery object, then such object is added as the new row.
                                //   If returns any other data (or returns undefined) then the $newRow is added.

        onAddRow: null,         // Fired when a new row has just been appended to the bottom of the table. Type: function (event, $newRow, index).
        onRemovingRow: null,    // Fired immediatelly before a row is about to be deleted. Type: function (event, $deleteRow, index).
                                //   If it returns false, then the row is not deleted. The onRemoveRow is not called;
                                //   If it returns a positive number, then the row is deleted after the given time in milliseconds (useful for CSS3 delete animations);
                                //   If it returns any other data (or returns undefined), then the row is deleted.
        onRemoveRow: null,      // Fired immediatelly after a row has been deleted. Type: function (event, $deleteRow, index).
        onCreate: null,         // Fired when plug-in has been initialized. Type: function (event)
        onDestroy: null         // Fired when plug-in is destroyed, with a call to the 'destroy' method. Type: function (event)
    };
})(jQuery);
