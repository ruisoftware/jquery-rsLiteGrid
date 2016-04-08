(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#rsLiteGrid', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is available on the jQuery object as $.fn.rsLiteGrid', function () {
    ok($.fn.rsLiteGrid);
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.rsLiteGrid(), this.elems, 'should be chainable');
  });
  
  test('is awesome', function() {
    expect(1);
    strictEqual(this.elems.rsLiteGrid().text(), 'awesome0col1awesome1col1awesome2col1', 'should be awesome');
  });
}(jQuery));
