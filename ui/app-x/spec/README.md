# Classes

    _string_: _JS_STRING_LITERAL_
            | _js/string_
            ;

    _number_: _JS_NUMBER_LITERAL_
            | _js/number_
            ;

    _boolean_: _JS_BOOLEAN_LITERAL_
             | _js_boolean_
             ;

    _null_: _JS_NULL_LITERAL_
          | _js/null_
          ;

    _primitive_: _string_
               | _number_
               | _boolean_
               | _null_
               ;

    _array_: _JS_ARRAY_LITERAL_
           | _js/array_
           ;

    _object_: _JS_OBJECT_LITERAL_
            | _js/object_
            ;

    _expression_: _primitive_
                | _array_
                | _object_
                | _js/string_
                | _js/number_
                | _js/boolean_
                | _js/null_
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
                | _jsx_
                | _react/state_
                | _react/context_
                | _mui/styles_
                | _appx/route_
                ;

    _statement_: _js/statement_;

    _jsx_: _primitive_
         | _react/element_
         | _react/html_
         | _react/form_
         | _input/text_
         | _js/expression_
         | _js/switch_
         | _js/map_
         | _js/reduce_
         | _js/filter_
         ;

    _any_: _primitive_
         | _array_
         | _object_
         | _expression_
         | _statement_
         ;

# JS Types

    _js/string_:
        _string_
          |
        {
          _type: "js/string",
          data: _string_
        }
        ;

    _js/number_:
        _number_
          |
        {
          _type: "js/number",
          data: _number_
        }
        ;

    _js/boolean_:
        _boolean_
          |
        {
          _type: "js/boolean",
          data: _boolean_
        }
        ;

    _js/boolean_:
        _null_
          |
        {
          _type: "js/null"
        }
        ;

    _js/array_:
        _array_
          |
        {
          type: "js/array",
          children: _array_
        }
        ;

    _js/object_:
        _object_
          |
        {
          _type: "js/object",
          children: _object_,
        }
        ;

    _js/import_:
        {
          _type: "js/import",
          name: _string_
        }
        ;

    _js/expression_:
        {
          _type: "js/expression",
          data: _string_
        }
        ;

    _js/function_:
        {
          _type: "js/function",
          (params: [
            _string_,
            ...
          ])?
          (body:
            [
              (_string_)?
              ...
            ]
              |
            [
              (_statement_)?
              ...
            ]
          )?
        }
        ;

    _js/statement_:
        {
          _type: "js/statement",
          (body:
            [
              (_string_)?
              ...
            ]
              |
            [
              (_statement_)?
              ...
            ]
          )?
        }
        ;

    _js/switch_:
        {
          _type: "js/switch",
          children: [
            {
              condition: _string_,
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
          name: _string_,
          (props: {
            (_string_: _expression_)?
            ...
          })?
          (children: [
            _jsx_ | _expression_,
            ...
          ])?
        }
        ;

    _react/html_:
        {
          _type: "react/html",
          name: _string_,
          (props: {
            (_string_: _expression_)?
            ...
          })?
          (children: [
            _jsx_ | _expression_,
            ...
          ])?
        }
        ;

    _react/state_:
        {
          _type: "react/state",
          name: _string_,
          setter: _string_,
          (init: _expression_)?
        }
        ;

    _react/context_:
        {
          _type: "react/context",
          name: _string_,
        }
        ;

    _react/effect_:
        {
          _type: "react/effect",
          (body:
            [
              (_string_)?
              ...
            ]
              |
            [
              (_statement_)?
              ...
            ]
          )?
          (states:
            [
              _string_,
              ...
            ]
          )?
        }
        ;

    _react/form_:
        {
          _type: "react/form",
          name: _string_,
          (props: {
            (_string_: _expression_)?
            ...
          })?
          (formProps: {
            (_string_: _expression_)?
            ...
          })?
          (children: [
            _jsx_ | _expression_,
            ...
          ])?
        }
        ;

    _input/text_:
        {
          _type: "input/text",
          name: _string_,
          (array: _boolean_)?
          (props: {
            (_string_: _expression_)?
            ...
          })?
          (rules: [
            {
              kind: _string_,
              (required: _boolean_)?
              (pattern: _string_)?
              (validate: _string_)?
              (message: _string_)?
            },
            ...
          ])?
        }
        ;

# MUI and AppX Types

    _mui/style_:
        {
          _type: "mui/style",
          (_string_: _expression_)?
          ...
        }
        ;

    _appx/api_:
        {
          _type: "appx/api",
          namespace: _string_,
          app_name: _string_,
          method: _string_,
          endpoint: _string_,
          (data: _expression_)?
          (
            init:
              _string_
                |
              _statement_
          )?
          (
            result:
              _string_
                |
              _statement_
          )?
          (
            error:
              _string_
                |
              _statement_
          )?
        }
        ;

    _appx/route_:
        {
          _type: "appx/route",
          name: _string_
        }
        ;
