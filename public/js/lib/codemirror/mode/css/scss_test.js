(function() {
  var mode = CodeMirror.getMode({tabSize: 4}, "text/x-scss");
  function MT(name) { test.mode(name, mode, Array.prototype.slice.call(arguments, 1), "scss"); }

  MT('url_with_quotation',
    "[tag foo] { [property background][operator :][string-2 url]([string test.jpg]) }");

  MT('url_with_double_quotes',
    "[tag foo] { [property background][operator :][string-2 url]([string \"test.jpg\"]) }");

  MT('url_with_single_quotes',
    "[tag foo] { [property background][operator :][string-2 url]([string \'test.jpg\']) }");

  MT('string',
    "[def @import] [string \"compass/css3\"]");

  MT('important_keyword',
    "[tag foo] { [property background][operator :][string-2 url]([string \'test.jpg\']) [keyword !important] }");

  MT('variable',
    "[variable-2 $blue][operator :][atom #333]");

  MT('variable_as_attribute',
    "[tag foo] { [property color][operator :][variable-2 $blue] }");

  MT('numbers',
    "[tag foo] { [property padding][operator :][number 10px] [number 10] [number 10em] [number 8in] }");

  MT('number_percentage',
    "[tag foo] { [property width][operator :][number 80%] }");

  MT('selector',
    "[builtin #hello][qualifier .world]{}");

  MT('singleline_comment',
    "[comment // this is a comment]");

  MT('multiline_comment',
    "[comment /*foobar*/]");

  MT('attribute_with_hyphen',
    "[tag foo] { [property font-size][operator :][number 10px] }");

  MT('string_after_attribute',
    "[tag foo] { [property content][operator :][string \"::\"] }");

  MT('directives',
    "[def @include] [qualifier .mixin]");

  MT('basic_structure',
    "[tag p] { [property background][operator :][keyword red]; }");

  MT('nested_structure',
    "[tag p] { [tag a] { [property color][operator :][keyword red]; } }");

  MT('mixin',
    "[def @mixin] [tag table-base] {}");

  MT('number_without_semicolon',
    "[tag p] {[property width][operator :][number 12]}",
    "[tag a] {[property color][operator :][keyword red];}");

  MT('atom_in_nested_block',
    "[tag p] { [tag a] { [property color][operator :][atom #000]; } }");

  MT('interpolation_in_property',
    "[tag foo] { [operator #{][variable-2 $hello][operator }:][atom #000]; }");

  MT('interpolation_in_selector',
    "[tag foo][operator #{][variable-2 $hello][operator }] { [property color][operator :][atom #000]; }");

  MT('interpolation_error',
    "[tag foo][operator #{][error foo][operator }] { [property color][operator :][atom #000]; }");

  MT("divide_operator",
    "[tag foo] { [property width][operator :][number 4] [operator /] [number 2] }");

  MT('nested_structure_with_id_selector',
    "[tag p] { [builtin #hello] { [property color][operator :][keyword red]; } }");
})();
