# Classes

    _string_: _js/string_;

    _number_: _js/number_;

    _boolean_: _js/boolean_;

    _null_: _js/null_;

    _primitive_: _string_
               | _number_
               | _boolean_
               | _null_
               ;

    _array_: _js/array_;

    _object_: _js/object_;

    _expression_: _primitive_
                | _jsx_
                | _js/array_
                | _js/object_
                | _js/import_
                | _js/expression_
                | _js/function_
                | _js/call_
                | _js/switch_
                | _js/map_
                | _js/reduce_
                | _js/filter_
                | _mui/styles_
                | _appx/route_
                ;

    _statement_: _js/statement_
               | _js/variable_
               | _js/call_
               | _react/state_
               | _react/context_
               | _react/effect_
               | _js/switch_
               | _js/map_
               | _appx/api_
               ;

    _jsx_: _react/element_
         | _react/html_
         | _react/form_
         | _input/text_
         ;

    _any_: _primitive_
         | _array_
         | _object_
         | _expression_
         | _statement_
         ;

# JS Types

    _js/string_:
        _JS_STRING_LITERAL_
          |
        {
          _type: "js/string",
          data: _JS_STRING_LITERAL_
        }
        ;

    _js/number_:
        _JS_NUMBER_LITERAL_
          |
        {
          _type: "js/number",
          data: _JS_NUMBER_LITERAL_
        }
        ;

    _js/boolean_:
        _JS_BOOLEAN_LITERAL_
          |
        {
          _type: "js/boolean",
          data: _JS_BOOLEAN_LITERAL_
        }
        ;

    _js/boolean_:
        _JS_NULL_LITERAL_
          |
        {
          _type: "js/null"
        }
        ;

    _js/array_:
        [
          _any_,
          ...
        ]
          |
        {
          type: "js/array",
          children:
          [
            _any_,
            ...
          ]
        }
        ;

    _js/object_:
        {
          _JS_STRING_LITERAL_: _any_,
          ...
        }
          |
        {
          _type: "js/object",
          _JS_STRING_LITERAL_: _any_,
          ...
        }
        ;

    _js/import_:
        {
          _type: "js/import",
          name: _JS_STRING_LITERAL_
        }
        ;

    _js/expression_:
        {
          _type: "js/expression",
          data: _JS_STRING_LITERAL_
        }
        ;

    _js/function_:
        {
          _type: "js/function",
          params: [
            _JS_STRING_LITERAL_,
            ...
          ],
          body: {
            _JS_STRING_LITERAL_ |
            [
              _statement_,
              ...
            ]
          }
        }
        ;

    _js/statement_:
        {
          _type: "js/statement",
          body: {
            _JS_STRING_LITERAL_ |
            [
              _statement_,
              ...
            ]
          }
        }
        ;

    _js/switch_:
        {
          _type: "js/switch",
          children: [
            {
              condition: _JS_STRING_LITERAL_,
              result: _expression_ | _statement_
            },
            ...
          ]
          (default: _expression_ | _statement_)?
        }
        ;

    _js/map_:
        {
          _type: "js/map",
          data: _expression_,
          result: _expression_ | _statement_
        }
        ;

    _js/reduce_:
        {
          _type: "js/reduce",
          data: _expression_,
          reducer: _expression_,
          (init: _expression_)?
        }
        ;

    _js/filter_:
        {
          _type: "js/filter",
          data: _expression_,
          filter: _expression_,
        }
        ;

# React Types

    _react/element_:
        {
          _type: "react/element",
          name: _JS_STRING_LITERAL_,
          (props: {
            _JS_STRING_LITERAL_: _expression_,
            ...
          })?
          (children: [
            _jsx_ | _primitive_ | _expression_,
            ...
          ])?
        }
        ;

    _react/html_:
        {
          _type: "react/html",
          name: _JS_STRING_LITERAL_,
          (props: {
            _JS_STRING_LITERAL_: _expression_,
            ...
          })?
          (children: [
            _jsx_ | _primitive_ | _expression_,
            ...
          ])?
        }
        ;

    _react/state_:
        {
          _type: "react/state",
          name: _JS_STRING_LITERAL_,
          setter: _JS_STRING_LITERAL_,
          (init: _expression_)?
        }
        ;

    _react/context_:
        {
          _type: "react/context",
          name: _JS_STRING_LITERAL_,
        }
        ;

    _react/effect_:
        {
          _type: "react/effect",
          body:
              _JS_STRING_LITERAL_
                |
              [
                _statement_,
                ...
              ],
          states:
            [
              _JS_STRING_LITERAL_,
              ...
            ]
        }
        ;

    _react/form_:
        {
          _type: "react/form",
          name: _JS_STRING_LITERAL_,
          (props: {
            _JS_STRING_LITERAL_: _expression_,
            ...
          })?
          (formProps: {
            _JS_STRING_LITERAL_: _expression_,
            ...
          })?
          (children: [
            _jsx_ | _primitive_ | _expression_,
            ...
          ])?
        }
        ;

    _input/text_:
        {
          _type: "input/text",
          name: _JS_STRING_LITERAL_,
          (array: _JS_BOOLEAN_LITERAL_)?
          (props: {
            _JS_STRING_LITERAL_: _expression_,
            ...
          })?
          (rules: [
            {
              kind: _JS_STRING_LITERAL_,
              required: _JS_BOOLEAN_LITERAL_,
              pattern: _JS_STRING_LITERAL_,
              validate: _JS_STRING_LITERAL_,
              message: _JS_STRING_LITERAL_
            },
            ...
          ])?
        }
        ;

# MUI and AppX Types

    _mui/style_:
        {
          _type: "mui/style",
          _JS_STRING_LITERAL_: _expression_,
          ...
        }
        ;

    _appx/api_:
        {
          _type: "appx/api",
          namespace: _string_ | _expression_,
          app_name: _string_ | _expression_,
          method: _string_ | _expression_,
          endpoint: _string_ | _expression_,
          (data: _expression_)?
          (init: _expression_)?
          (result: _statement_)?
          (error: _statement_)?
        }
        ;

    _appx/route_:
        {
          _type: "appx/route",
          (name: _string_ | _expression_)?
        }
        ;
