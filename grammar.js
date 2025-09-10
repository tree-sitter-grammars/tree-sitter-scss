/**
 * @file SCSS grammar for tree-sitter
 * @author Amaan Qureshi <amaanq12@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const CSS = require('tree-sitter-css/grammar');

module.exports = grammar(CSS, {
  name: 'scss',

  externals: ($, original) => original.concat([
    $._concat,
  ]),

  rules: {
    _top_level_item: ($, original) => choice(
      original,
      $.postcss_statement,
      $.use_statement,
      $.forward_statement,
      $.mixin_statement,
      $.include_statement,
      $.function_statement,
      $.return_statement,
      $.extend_statement,
      $.error_statement,
      $.warn_statement,
      $.debug_statement,
      $.at_root_statement,
      $.if_statement,
      $.each_statement,
      $.for_statement,
      $.while_statement,
    ),

    _block_item: ($, original) => choice(
      original,
      $.mixin_statement,
      $.include_statement,
      $.function_statement,
      $.return_statement,
      $.extend_statement,
      $.error_statement,
      $.warn_statement,
      $.debug_statement,
      $.at_root_statement,
      $.if_statement,
      $.each_statement,
      $.for_statement,
      $.while_statement,
    ),

    // Selectors

    _selector: ($, original) => choice(
      original,
      alias($._concatenated_identifier, $.tag_name),
      $.placeholder,
    ),

    class_selector: $ => prec(1, seq(
      optional($._selector),
      choice('.', $.nesting_selector),
      alias(choice($.identifier, $._concatenated_identifier), $.class_name),
    )),

    pseudo_class_selector: $ => seq(
      optional($._selector),
      alias($._pseudo_class_selector_colon, ':'),
      alias(choice($.identifier, $._concatenated_identifier), $.class_name),
      optional(alias($.pseudo_class_arguments, $.arguments)),
    ),

    pseudo_element_selector: $ => seq(
      optional($._selector),
      '::',
      alias(choice($.identifier, $._concatenated_identifier), $.tag_name),
      optional(alias($.pseudo_element_arguments, $.arguments)),
    ),

    id_selector: $ => seq(
      optional($._selector),
      '#',
      alias(choice($.identifier, $._concatenated_identifier), $.id_name),
    ),

    attribute_selector: $ => seq(
      optional($._selector),
      '[',
      alias(choice($.identifier, $._concatenated_identifier, $.namespace_selector), $.attribute_name),
      optional(seq(
        choice('=', '~=', '^=', '|=', '*=', '$='),
        $._value,
      )),
      ']',
    ),

    child_selector: $ => prec.left(seq(
      optional($._selector),
      '>',
      $._selector,
    )),

    sibling_selector: $ => prec.left(seq(
      optional($._selector),
      '~',
      $._selector,
    )),

    adjacent_sibling_selector: $ => prec.left(seq(
      optional($._selector),
      '+',
      $._selector,
    )),

    // Declarations

    declaration: $ => seq(
      alias(
        choice($.identifier, $.variable, $._concatenated_identifier),
        $.property_name,
      ),
      ':',
      $._value,
      repeat(seq(optional(','), $._value)),
      optional($.important),
      ';',
    ),

    default: _ => '!default',

    // Media queries

    _query: ($, original) => choice(
      original,
      prec(-1, $.interpolation),
    ),

    // Property Values

    _value: ($, original) => choice(
      original,
      prec(-1, choice(
        $.nesting_selector,
        $._concatenated_identifier,
        $.list_value,
        $.map_value,
        $.unary_expression,
        $.default,
      )),
      $.variable,
    ),

    string_value: $ => choice(
      seq(
        '\'',
        repeat(choice(
          alias(/([^#'\n]|\\(.|\n)|\#[^{])+/, $.string_content),
          $.interpolation,
        )),
        '\'',
      ),
      seq(
        '"',
        repeat(choice(
          alias(/([^#"\n]|\\(.|\n)|\#[^{])+/, $.string_content),
          $.interpolation,
        )),
        '"',
      ),
    ),

    use_statement: $ => seq(
      '@use',
      $._value,
      optional($.as_clause),
      optional($.with_clause),
      ';',
    ),

    as_clause: $ => seq('as', choice('*', $.identifier, $.plain_value)),

    with_clause: $ => seq('with', $.with_parameters),

    with_parameters: $ => seq(
      '(',
      sep1(
        ',',
        seq(
          $.variable,
          ':',
          $._value,
          optional($.default),
        ),
      ),
      optional(','),
      ')',
    ),

    visibility_clause: $ => seq(choice('hide', 'show'), $.visibility_parameters),

    visibility_parameters: $ => sep1(',', $.identifier),

    forward_statement: $ => seq(
      '@forward',
      $._value,
      optional($.as_clause),
      optional($.visibility_clause),
      optional($.with_clause),
      ';',
    ),

    mixin_statement: $ => seq(
      '@mixin',
      field('name', $.identifier),
      optional($.parameters),
      $.block,
    ),

    include_statement: $ => seq(
      '@include',
      $.identifier,
      optional(alias($._include_arguments, $.arguments)),
      choice($.block, ';'),
    ),

    _include_arguments: $ => seq(
      token.immediate('('),
      sep1(',', alias($._include_argument, $.argument)),
      token.immediate(')'),
    ),

    _include_argument: $ => seq(
      optional(seq(field('name', $.variable), ':')),
      field('value', $._value),
    ),

    function_statement: $ => seq(
      '@function',
      field('name', $.identifier),
      optional($.parameters),
      $.block,
    ),

    parameters: $ => seq('(', sep1(',', $.parameter), ')'),

    parameter: $ => choice(
      seq(
        $.variable,
        optional('...'),
        optional(seq(
          ':',
          field('default', $._value),
        )),
      ),
      '...',
    ),

    return_statement: $ => seq('@return', $._value, ';'),

    extend_statement: $ => seq('@extend', choice($._value, $.class_selector), ';'),

    error_statement: $ => seq('@error', $._value, ';'),

    warn_statement: $ => seq('@warn', $._value, ';'),

    debug_statement: $ => seq('@debug', $._value, ';'),

    at_root_statement: $ => seq('@at-root', $._value, $.block),

    if_statement: $ => seq(
      '@if',
      field('condition', $._value),
      $.block,
      repeat($.else_if_clause),
      optional($.else_clause),
    ),

    else_if_clause: $ => seq(
      '@else',
      'if',
      field('condition', $._value),
      $.block,
    ),

    else_clause: $ => seq('@else', $.block),

    each_statement: $ => seq(
      '@each',
      optional(seq(field('key', $.variable), ',')),
      field('value', $.variable),
      'in',
      $._value,
      $.block,
    ),

    for_statement: $ => seq(
      '@for',
      $.variable,
      'from',
      field('from', $._value),
      'through',
      field('through', $._value),
      $.block,
    ),

    while_statement: $ => seq('@while', $._value, $.block),

    call_expression: $ => seq(
      alias(choice($.identifier, $.plain_value), $.function_name),
      $.arguments,
    ),

    binary_expression: $ => prec.left(1, seq(
      $._value,
      choice('+', '-', '*', '/', '==', '<', '>', '!=', '<=', '>=', 'and', 'or'),
      $._value,
    )),

    unary_expression: $ => seq(
      choice('-', '+', '/', 'not'),
      $._value,
    ),

    list_value: $ => seq(
      '(',
      sep2(',', $._value),
      ')',
    ),

    map_value: $ => seq(
      '(',
      sep1(',', seq(
        field('key', $._value),
        ':',
        field('value', $._value),
      )),
      ')',
    ),

    interpolation: $ => seq('#{', $._value, '}'),

    placeholder: $ => seq('%', $.identifier),

    arguments: $ => seq(
      token.immediate('('),
      sep(
        choice(',', ';'),
        seq(repeat1($._value), optional('...')),
      ),
      ')',
    ),

    _concatenated_identifier: $ => choice(
      seq(
        $.identifier,
        repeat1(seq(
          $._concat,
          choice($.interpolation, $.identifier, alias(token.immediate('-'), $.identifier)),
        )),
      ),
      seq(
        $.interpolation,
        repeat(seq(
          $._concat,
          choice($.interpolation, $.identifier, alias(token.immediate('-'), $.identifier)),
        )),
      ),
    ),

    variable: _ => /([a-zA-Z_]+\.)?\$[a-zA-Z-_][a-zA-Z0-9-_]*/,

    plain_value: _ => token(seq(
      repeat(choice(
        /[-_]/,
        /\/[^\*\s,;!{}()\[\]]/, // Slash not followed by a '*' (which would be a comment)
      )),
      /[a-zA-Z]/,
      choice(
        /[^/\s,:;!{}()\[\]]/, // Not a slash, not a delimiter character (no colon)
        /\/[^\*\s,:;!{}()\[\]]/, // Slash not followed by a '*' (which would be a comment) (no colon)
        seq(
          repeat1(choice(
            /[^/\s,;!{}()\[\]]/, // Not a slash, not a delimiter character
            /\/[^\*\s,;!{}()\[\]]/, // Slash not followed by a '*' (which would be a comment)
          )),
          choice(
            /[^/\s,:;!{}()\[\]]/, // Not a slash, not a delimiter character (no colon)
            /\/[^\*\s,:;!{}()\[\]]/, // Slash not followed by a '*' (which would be a comment) (no colon)
          ),
        ),
      ),
    )),

  },
});

/**
 * Creates a rule to optionally match one or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} separator
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {ChoiceRule}
 *
 */
function sep(separator, rule) {
  return optional(sep1(separator, rule));
}

/**
 * Creates a rule to match one or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} separator
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {SeqRule}
 *
 */
function sep1(separator, rule) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule to match two or more of the rules separated by `separator`
 *
 * @param {RuleOrLiteral} separator
 *
 * @param {RuleOrLiteral} rules
 *
 * @return {SeqRule}
 */
function sep2(separator, rules) {
  return seq(rules, repeat1(seq(separator, rules)));
}
