# Supported Types

    —————————————————————————

    - type: react/element                               (~jsx|~expression)
      name:                     # element name          (:string|:expression) - autosuggest import
      props:                    # properties            (:object<:any>)
      children:                 # children              (:array<:jsx|:primitive|:expression>)

    - type: react/html                                  (~jsx|~expression)
      name:                     # html tag name         (:expression) - autosuggest non-restrictive
      props:                    # properties            (:object<:any>)
      children:                 # children              (:array<:jsx|:primitive|:expression>)

    - type: react/state                                 (~expression|~statement)
      name:                     # name of the state     (:string)
      setter:                   # name of the setter    (:string)
      init:                     # init value            (:expression)

    - type: react/context                               (~expression|~statement)
      name:                     # context name          (:expression) - autosuggest import

    - type: react/effect                                (~statement)
      body:                     # code body             (:string|:array<:statement>)
      states:                   # state expressions     (:array<:expression>)
        - s1
        - s2

    - type: react/form                                  (~jsx|~expression)
      name:                     # name of the form      (:string)             - unique in a file
      onSubmit:                 # function for submit   (:string|:array<:statement>)
      onError:                  # function for error    (:string|:array<:statement>)
      props:                    # props for 'form' tag  (:object<:any>)
      children:                 # children              (:array<:jsx|:primitive|:expression>)
      formProps:                # props for hook form   (:object<:any>)
        mode: 'onSubmit',
        reValidateMode: 'onChange',


    —————————————————————————

    - type: input/text                                  (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      array:                    # whether array         (:boolean)
      props:                    # properties            (:object<:any>)
        type:                   # text, number,         (:string|:expression)
                                # password, email,
                                # tel, url, search,
                                # date, time,
                                # datetime-local
        label:                  # input label           (:string|:expression)
        defaultValue:           # default value         (:object<:any>|:expression)
        multiline:              # allow multiline       (:boolean|:expression)
        autocomplete:           # true or false         (:boolean|:expression)
        options:                # options               (:object)
                                # { value: v, render: r }
        callback:               # callback function     (:function)
                                # TODO : allowNull
      rules:                    # input rules           (:object<:any>)
        required:               # whether required      (:boolean|:expression)
        pattern:                # pattern & message     (:object<pattern:string,message:string)
                                # { pattern: p, message: m}
        validate:               # validation            (:object<condition:expression,message:string>)
                                # { condition: c, message: message}


    - type: input/select                                (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      rules:                    # input rules           (:object<:any>)
      props:                    # properties            (:object<:any>)
        label:                  # input label
        defaultValue:           # default value
        options:                # options { value: v, render: r }
        callback:               # callback function

    - type: input/switch                                (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      rules:                    # input rules           (:object<:any>)
      props:                    # properties            (:object<:any>)
        label:                  # input label
        defaultValue:           # default value
        callback:               # callback function

    - type: input/datetime                              (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      variant:                  # date, time, datetime  (:string|:expression)
      keyboard:                 # allow keyboard input  (:boolean|:expression)
      rules:                    # input rules           (:object<:any>)
      props:                    # properties            (:object<:any>)
        label:                  # input label
        defaultValue:           # default value
        callback:               # callback function
      rules:                    # input rules

    - type: input/slider                                (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      rules:                    # input rules           (:object<:any>)
      props:                    # properties            (:object<:any>)
        label:                  # input label
        defaultValue:           # default value
        callback:               # callback function

    - type: input/custom                                (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      rules:                    # input rules           (:object<:any>)
      props:                    # properties            (:object<:any>)
        label:                  # input label
        defaultValue:           # default value
        callback:               # callback function

    - type: input/array                                 (~jsx|~expression)
      name:                     # name of input         (:string|:expression)
      rules:                    # input rules           (:object<:any>)
      props:                    # properties            (:object<:any>)
        label:                  # input label
        defaultValue:           # default value
        callback:               # callback function


    —————————————————————————

    - type: js/null             # null                  (~null|~primitive|~expression)

    - type: js/string                                   (~string|~primitive|~expression)
      data:                     # string data

    - type: js/number                                   (~number|~primitive|~expression)
      data:                     # number data

    - type: js/boolean                                  (~boolean|~primitive|~expression)
      data:                     # boolean data

    - type: js/object                                   (~object|~expression)

    - type: js/array                                    (~array|~expression)

    - type: js/import                                   (~expression)
      name:                     # import name           (:string|:expression) - autosuggest import

    - type: js/expression                               (~expression)
      data:                     # expression

    - type: js/statement                                (~statement)
      body:                     # code block            (:string|:array<:statement>)

    - type: js/function                                 (~expression)
      params:                                           (:array<:string>)
        - p1
        - p2
      body:                     # code body             (:string|:array<:statement>)

    - type: js/call             # TODO                  (~statement)
      func:                     #                       (:expression)
      params:                                           (:array<:expression>)
        - p1
        - p2

                                  - type: js/module           # TODO

                                  - type: js/export           # TODO
                                    name
                                    default: boolean

    - type: js/switch                                   (~expression|~statement)
      children:
        - condition:            # condition expression  (:expression)
          result:               # result data           (:expression|:statement)
      default:                  # default data          (:expression|:statement)

    - type: js/map                                      (~expression|~statement)
      data:                     # input data            (:expression)
      result:                   # map result            (:expression|:statement)

    - type: js/reduce                                   (~expression)
      data:                     # input data            (:expression)
      reducer:                  # return expression     (:expression)
      init:                     # init data             (:expression)

    - type: js/filter                                   (~expression)
      data:                     # input data            (:expression)
      filter:                   # filter expression     (:expression)

                                  - type: js/variable         # TODO    (~statement)
                                    kind:                     # (var / let / const)
                                    name:                     # variable name
                                    data:                     # js/expression, js/call, js/function

                                  - type: js/promise          # TODO    (~statement)
                                    name:                     #         (:expression)
                                    params:                   #         (:array<:expression>)
                                      - p1
                                      - p2
                                    body:                     # body    (:string|:array<:statement>)
                                    resolve:                  # resolve (:string|:array<:statement>)
                                    reject:                   # reject  (:string|:array<:statement>)

                                  - type: js/transform        # TODO
                                    data:                     # input data
                                    transform:                # transform syntax

                                  - type: js/trigger          # TODO
                                    data:                     # input data
                                    trigger:                  # trigger syntax


                                                        - type: js/control          # deferred
                                                            - if/else
                                                            - for
                                                            - while
                                                            - map
                                                            - array

                                                        - type: js/return           # deferred


    —————————————————————————

    - type: mui/style                                   (~expression)
      ...:                      # styles in json        (:object<:any>)


    —————————————————————————

    - type: appx/route                                  (~expression)
      name:                     # route folder name     (:string|:expression) - default to '/'

    - type: appx/api                                    (~statement)
      namespace:                # namespace             (:string|:expression)
      app_name:                 # app_name              (:string|:expression)
      method:                   # get, post, put, etc   (:string|:expression)
      endpoint:                 # endpoint              (:string|:expression) - autosuggest
      data:                     # api data              (:expression)         - for post, put, patch
      init:                     # init code             (:string|:array<:statement>)
      result:                   # result code           (:string|:array<:statement>)
      error:                    # error code            (:string|:array<:statement>)


    —————————————————————————
