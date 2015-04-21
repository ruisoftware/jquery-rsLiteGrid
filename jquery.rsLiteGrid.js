(function($, undefined) {
    var GridClass = function($elem, opts) {
        var DOM = {
                init: function() {
                    this.$table = $elem.is("table") ? $elem : $("<table>").appendTo($elem),
                    this.addColHeaders();
                    this.tabstops = this.getTabStops();
                    this.$tbody = $('<tbody>').appendTo(this.$table);
                    this.$table.
                        bind('addRow.rsLiteGrid', DOM.addRow).
                        bind('delRow.rsLiteGrid', DOM.delRow).
                        bind('getData.rsLiteGrid', json.getData).
                        bind('setData.rsLiteGrid', json.setData).
                        bind('destroy.rsLiteGrid', DOM.destroy);
                },
                addColHeaders: function(event, values, notLastRow) {
                    if (opts.cols) {
                        $('<thead><tr>' + opts.cols.map(function (obj) { return '<th>' + obj.htmlTitle + '</th>'; }).join('') + '</tr></thead>').appendTo(DOM.$table);
                    }
                },
                getTabStops: function () {
                    return opts.cols ? $.map(opts.cols, function (obj, index) { return obj.tabStop !== false ? index : undefined; }) : [];
                },
                addRow: function(event, values, notLastRow) {
                    if (!opts.cols) return;

                    var $lastRow = $('<tr>' + opts.cols.map(function (obj) { return '<td>' + obj.htmlData + '</td>'; }).join('') + '</tr>'),
                        $userLastRow = null;

                    if (values) {
                        json.setRowValues($lastRow, values);
                    }
 
                    if (opts.onAddingRow) {
                        $userLastRow = opts.onAddingRow($lastRow);
                    }

                    if (opts.onAddingRow && $userLastRow !== false || !opts.onAddingRow) {
                        if (!($userLastRow instanceof jQuery)) {
                            $userLastRow = $lastRow;
                        }
                        $userLastRow.appendTo(DOM.$tbody);
                        if (!notLastRow) {
                            events.setLastRowEvents($userLastRow);
                        }
                        if (this.tabstops.length) {
                            $userLastRow.find('input').bind('keydown', events.keyboardCellNavigation);
                        }
                        opts.onAddRow && opts.onAddRow($userLastRow);
                        return $userLastRow;
                    }
                },
                delRow: function(event, $deleteRow) {
                    if ($deleteRow) {
                        var $deleteRow = $deleteRow.closest('tr');
                        if ($deleteRow.length) {
                            var $allrows = DOM.$tbody.children(),
                                deleteRowIndex = $allrows.index($deleteRow),
                                removeRowInfo = true,
                                doDelete = function () {
                                    $deleteRow.remove();
                                    opts.onRemoveRow && opts.onRemoveRow();
                                };

                            if (opts.onRemovingRow) {
                                removeRowInfo = opts.onRemovingRow($deleteRow);
                                if (removeRowInfo === false) return;
                            }

                            // deleting the last row on a grid with at least 2 rows?
                            if (deleteRowIndex > 0 && $allrows.size() - 1 === deleteRowIndex) {
                                events.setLastRowEvents($deleteRow.prev());
                            }

                            if (typeof removeRowInfo === "number" && removeRowInfo > 0) {
                                setTimeout(doDelete, removeRowInfo);
                            } else {
                                doDelete();
                            }
                        }
                    }
                },
                destroy: function () {
                    DOM.$table.empty().unbind('.rsLiteGrid');
                }
            },

            events = {
                setLastRowEvents: function ($lastRow) {
                    $lastRow.find('input').bind('keyup', events.onKeyUp);
                },
                unsetLastRowEvents: function () {
                    DOM.$tbody.children().last().find('input').unbind('keyup', events.onKeyUp);
                },
                onKeyUp: function() {
                    var $thisCol = $(this);
                    if (opts.onCheckFieldHasValue && opts.onCheckFieldHasValue($thisCol.index(), $thisCol.val()) ||
                        !opts.onCheckFieldHasValue && $thisCol.val() !== '') {

                        events.unsetLastRowEvents();
                        DOM.addRow();
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
                        currentColIndex = $currentCol.parent('td').index();
                    if (e.which === keys.tab && e.shiftKey) {
                        e.which = keys.shiftTab;
                    }
                    switch (e.which) {
                        // focus on previous cell (or if at the beginning of the row, focus on the previous row last cell)
                        case keys.left:
                        case keys.shiftTab:
                            if (e.which === keys.shiftTab || this.selectionStart === undefined || this.selectionStart === 0) {
                                var prevStops = DOM.tabstops.filter(function(elem) {
                                        return elem < currentColIndex;
                                    });
                                if (prevStops.length === 0) {
                                    // try to focus on the previous row last focusable col
                                    var $prevRow = $currentRow.prev();
                                    if ($prevRow.length === 1) {
                                        $prevRow.children().eq(DOM.tabstops[DOM.tabstops.length - 1]).children('input').focus();
                                    }
                                } else {
                                   $currentRow.children().eq(prevStops[prevStops.length - 1]).children('input').focus();
                                }
                                e.preventDefault();
                            }
                            break;

                        // focus on next cell (or if at the ending of the row, focus on the next row first cell)
                        case keys.right:
                        case keys.enter:
                        case keys.tab:
                            if (e.which !== keys.right || !this.value || this.selectionStart === this.value.length) {
                                var $nextControl = $currentCol.parent('td').next(),
                                    pastLastColThisRow = $nextControl.length === 0,
                                    nextStops = DOM.tabstops.filter(function(elem) {
                                        return elem > currentColIndex;
                                    });

                                if (nextStops.length === 0) {
                                    // try to focus on the next row first focusable col
                                    var $nextRow = $currentRow.next();
                                    if ($nextRow.length === 1) {
                                        $nextRow.children().eq(DOM.tabstops[0]).children('input').focus();
                                    }
                                } else {
                                     $currentRow.children().eq(nextStops[0]).children('input').focus();
                                }
                                e.preventDefault();
                            }
                            break;
                        case keys.up:
                        case keys.down:
                            switch (e.which) {
                                case keys.up:
                                    if (currentRowIndex > 0) {
                                        $currentRow.prev().children().eq($currentCol.parent('td').index()).children('input').focus();
                                        e.preventDefault();
                                    }
                                    break;
                                case keys.down:
                                    if (currentRowIndex < DOM.$tbody.children().length - 1) {
                                        $currentRow.next().children().eq($currentCol.parent('td').index()).children('input').focus();
                                        e.preventDefault();
                                    }
                            }
                    }
                }
            },

            json = {
                getData: function() {
                    var rows = [],
                        colCount = $('> .' + opts.rowClass + ':last-child', DOM.$table).children().length;

                    $('> .' + opts.rowClass + ':not(.' + opts.titleClass + '):not(:last-child)', DOM.$table).each(function (index, rowElem) {
                        var $cols = $(rowElem).children(),
                            row = {},
                            colName;
                        for (var colNumber = 0; colNumber < colCount; ++colNumber) {
                            colName = opts.cols[colNumber] ? opts.cols[colNumber].name : undefined;
                            row[colName ? colName : '_col' + (colNumber + 1)] = $cols.eq(colNumber).val();
                        }
                        rows.push(row);
                    });
                    return rows;
                },
                setData: function(e, values) {
                    if (values) {
                        var $lastRow = DOM.$tbody.children().last(),
                            $cols = $lastRow.find('input');

                        // if all inputs in last row are empty, then delete the last row
                        if ($cols.filter(function (index) {
                            var defaultVal = '';
                            if (opts.cols && opts.cols[index] && opts.cols[index].defaultVal !== undefined) {
                                defaultVal = opts.cols[index].defaultVal;
                            }
                            return this.value === defaultVal;
                        }).length === $cols.length) {
                            $lastRow.remove();
                        }

                        var currentOnAddingRow = opts.onAddingRow;
                        opts.onAddingRow = null;
                        try {
                            for(var idx = 0, qt = values.length; idx < qt; ++idx) {
                                DOM.addRow(null, values[idx], true);
                            }
                        } finally {
                            opts.onAddingRow = currentOnAddingRow;
                        }
                        DOM.addRow();
                    }
                },
                setRowValues: function($row, values) {
                    var $rowCols = $row.find('input'),
                        colCount = $rowCols.length,
                        colNumber,
                        $targetCol;

                    for(var key in values) {
                        $targetCol = opts.cols.filter(function (colInfo) {
                            return colInfo && colInfo.name === key;
                        });
                        if ($targetCol.length === 1) {
                            colNumber = opts.cols.indexOf($targetCol[0]);
                            if (colNumber > -1 && colNumber < colCount) {
                                $rowCols.eq(colNumber).val(values[key]);
                            }
                        }
                    }
                }
            }

        DOM.init();
        DOM.addRow(); // add an empty row
    };

    $.fn.rsLiteGrid = function(options) {
        var addRow = function(values) {
                return this.trigger('addRow.rsLiteGrid', [values]);
            },
            delRow = function(row) {
                return this.trigger('delRow.rsLiteGrid', row);
            },
            getData = function(values) {
                return this.triggerHandler('getData.rsLiteGrid', [values]);
            },
            setData = function(values) {
                return this.trigger('setData.rsLiteGrid', [values]);
            },
            destroy = function() {
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
        return this.each(function() {
            new GridClass($(this), opts);
        });
    };

    $.fn.rsLiteGrid.defaults = {
        caption: null,      // Table caption. If not null, adds a <caption> tag to the <table>. Type: string.
        cols: [{
            name: 'col1',                   // Identifier for Json data exchange
            htmlTitle: 'col1',              // Title placed inside the th tag
            htmlData: '<input type="text">' // Control placed inside the td tag (for each row)
        }],
        minRows: null,  // Minimum allowed number of rows. Use null or 0 if table can have no data rows. Type: positive integer.
        maxRows: null,  // Maximum allowed number of rows. Use null if there is no limit to the number of rows. Type: positive integer.
                        // Example: If table has only 3 rows, set minRows = maxRows = 3;
                        //          If table has between 1 and 5 rows, set minRows = 1 and maxRows = 5;
                        //          If table has more than 1 row, set minRows = 1 and maxRows = null.
        onAddingRow: null,      // Fired immediatelly before a new row is about to be added. If returns false, then the row is not added.
        onAddRow: null,         // Fired when a new row has just been added
        onRemovingRow: null,    // Fired immediatelly before a new row is about to be deleted.
                                //   If returns false, then the row is not deleted. The onRemoveRow is not called;
                                //   If returns a positive number, then the row is deleted after the given time in milliseconds (useful for CSS3 delete animations);
                                //   If returns any other data (or returns nothing - undefined), then row is deleted.
        onRemoveRow: null,      // Fired when a new row has just been deleted
        onCheckFieldHasValue: null
    };
})(jQuery);
