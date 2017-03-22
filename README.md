# jquery-rsLiteGrid [![Build Status](https://travis-ci.org/ruisoftware/jquery-rsLiteGrid.svg?branch=master)](https://travis-ci.org/ruisoftware/jquery-rsLiteGrid)
Easily input tabular data using only your keyboard.

# Key Features
 - Optional minimum and/or maximum number of rows;
 - Configurable markup and tabstop for each column;
 - Use cursor keys, Tab, Shift+Tab to navigate across all the columns and rows;
 - Data can be imported/exported from/to Json;
 - Strong event driven support;
 - Rows can be added or removed asynchronously after an ellapsed time. Ideal for CSS3 animations;
 - Small footprint.

# Installation

You can install from [npm](https://www.npmjs.com/):
````bash
npm install jquery.rsLiteGrid --save
````
or directly from git:
````javascript
<script src="http://rawgit.com/ruisoftware/jquery-rsLiteGrid/master/src/jquery.rsLiteGrid.js"></script>
````
or you can download the Zip archive from github, clone or fork this repository and include `jquery.rsLiteGrid.js` from your local machine.

You also need to download jQuery. In the example below, jQuery is downloaded from Google cdn.

# Usage
````javascript
<!doctype html>
<html>
<head>
  <title>jquery-rsLiteGrid plug-in</title>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
  <script src="http://rawgit.com/ruisoftware/jquery-rsLiteGrid/master/src/jquery.rsLiteGrid.js"></script>
  <script>
    $(document).ready(function () {
      $('table').rsLiteGrid();
    });
  </script>
</head>
<body>
	<table></table>
<body>
</html>
`````
This creates a very simple 1x1 table.<br>
You can see a more complete example [here](http://codepen.io/ruisoftware/pen/QNQjoB?editors=1010 "on CodePen") on CodePen or on the [test.html](http://rawgit.com/ruisoftware/jquery-rsLiteGrid/master/src/demo/test.html).<br>
By default, a new row is appended automatically when you modify the last row. Obviously, you can disable this and add rows programatically.<br>

# License
This project is licensed under the terms of the [MIT license](https://opensource.org/licenses/mit-license.php)

# Bug Reports & Feature Requests
Please use the [issue tracker](https://github.com/ruisoftware/jquery-rsLiteGrid/issues) to report any bugs or file feature requests.

# Contributing
Please refer to the [Contribution page](https://github.com/ruisoftware/jquery-rsLiteGrid/blob/master/CONTRIBUTING.md) from more information.


