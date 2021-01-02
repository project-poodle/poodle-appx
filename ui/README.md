# Supported Types

    —————————————————————————

    - type: react/element
      name:                     # element name          (autosuggest import)
      props:                    # properties
      children:                 # children

    - type: react/html
      name:                     # html tag name         (autosuggest - non-restrictive)
      props:                    # properties
      children:                 # children

    - type: react/state
      name:                     # name of the state
      setter:                   # name of the setter
      init:                     # init value

    - type: react/context
      name:                     # context name          (autosuggest import)

    - type: react/effect
      body:                     # code body
      states:                   # state expressions
        - s1
        - s2

    - type: react/form
      name:                     # name for the form     (unique for an element tree)
      onSubmit:                 # function for submit
      onError:                  # function for error
      props:                    # props for html tag
      formProps:                # props for hook form
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        defaultValues: {},
        resolver: undefined,
        context: undefined,
        criteriaMode: "firstError",
        shouldFocusError: true,
        shouldUnregister: true,


    —————————————————————————

    - type: mui/style
      ...:                      # styles in json        (js/object overlaps)


    —————————————————————————

    - type: input/text
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      multiline:                # allow multiline
      autocomplete:             # true or false
      options:                  # options { value: v, render: r }
      inputType:                # text, mnumber, password, email, tel, url, search, date, time, datetime-local
      rules:                    # input rules
      array:                    # whether this control is an array
                                # TODO : allowNull
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/select
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      options:                  # options { value: v, render: r }
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/switch
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/radio
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      options:                  # options { value: v, render: r }
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/datetime
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      inputType:                # date, time, datetime
      keyboard:                 # whehter to allow keyboard input
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/slider
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/custom
      name:                     # name of input
      label:                    # input label
      defaultValue:             # default value
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties

    - type: input/array
      name:                     # name of array input
      label:                    # input label
      defaultValue:             # default value
      rules:                    # input rules
      callback:                 # callback function when value change
      props:                    # properties


    —————————————————————————

    - type: js/null

    - type: js/string
      data:                     # string data

    - type: js/number
      data:                     # number data

    - type: js/boolean
      data:                     # boolean data

    - type: js/import
      name:                     # import name           (autosuggest import)

    - type: js/expression
      data:                     # expression

    - type: js/function
      params:
        - p1
        - p2
      body:                     # code body

    - type: js/block
      data:                     # code block

                                    - type: js/module           # TODO

                                    - type: js/export           # TODO
                                      name
                                      default: boolean

    - type: js/switch
      children:
        - condition:            # condition expression
          result:               # result data for condition
      default:                  # default data

    - type: js/map
      data:                     # input data
      result:                   # map result

    - type: js/reduce
      data:                     # input data
      reducer:                  # reducer expression
      init:                     # init data

    - type: js/filter
      data:                     # input data
      filter:                   # filter expression


                                    - type: js/promise          # TODO
                                      name:                     # variable or named import
                                      params:                   # params
                                        - p1
                                        - p2
                                      body:                     # code body
                                      resolve:                  # code success
                                      reject:                   # code failure

                                    - type: js/transform        # TODO
                                      data:                     # input data
                                      transform:                # transform syntax

                                    - type: js/trigger          # TODO
                                      data:                     # input data
                                      trigger:                  # trigger syntax

                                    - type: js/variable         # TODO
                                      kind:                     # (var / let / const)
                                      name:                     # variable name
                                      data:                     # js/expression, js/call, js/function


                                                        - type: js/control        # deferred
                                                            - if/else
                                                            - for
                                                            - while
                                                            - map
                                                            - array

                                                        - type: js/call           # deferred
                                                          name:                   # variable or named import
                                                          params:
                                                            - primitive/json
                                                            - js/expression
                                                            - js/call

                                                        - type: js/return         # deferred


    —————————————————————————

    - type: appx/route
      name:                     # route folder name     (default to '/')

    - type: appx/api
      namespace:                # namespace
      app_name:                 # app_name
      method:                   # get, post, put, etc
      endpoint:                 # endpoint              (autosuggest endpoint)
      data:                     # api data              (only for post, put, patch)
      prep:                     # prep code
      result:                   # result code
      error:                    # error code


    —————————————————————————
