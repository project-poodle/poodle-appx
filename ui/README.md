# Supported Types

    —————————————————————————

    - type: appx/route          # no attribute

    - type: react/element
      name:                     # element name
      props:                    # properties
      children:                 # children

    - type: react/html
      name:                     # html element name
      props:                    # properties
      children:                 # children

    - type: react/state
      name:                     # name of the state
      setter:                   # name of the setter
      init:                     # init value

    - type: react/context
      name:                     # name of the state
      setter:                   # name of the setter
      context:                  # context name

    - type: react/effect
      data:                     # code block

    - type: mui/style
      ...:                      # styles in json

                                    - type: mui/control         # TODO
                                      name:                     # element name
                                      props:                    # properties

    —————————————————————————

    - type: js/import
      name:                     # import name

    - type: js/expression
      data:                     # expression

    - type: js/function
      params:
        - p1
        - p2
      body:                     # code block

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


                                    - type: js/api              # TODO
                                      namespace:                # namespace
                                      app:                      # app_name
                                      method:                   # get/post/put/delete
                                      endpoint:                 # api endpoint
                                      data:                     # request data in json
                                      success:                  # code to do with success
                                      fail:                     # code to do with fail

                                    - type: js/promise          # TODO
                                      name:                     # variable or named import
                                      params:                   # params
                                        - p1
                                        - p2
                                      body:                     # code body
                                      success:                  # code success
                                      fail:                     # code failure


                                    - type: js/call/transform   # TODO
                                      data:                     # input data
                                      transform:                # transform syntax

                                    - type: js/call/trigger     # TODO deferred
                                      data:                     # input data
                                      trigger:                  # trigger syntax


                                                        - type: js/variable       # deferred
                                                          kind:                   # (var / let / const)
                                                          name:                   # variable name
                                                          expression:             # js/expression, js/call, js/function

                                                        - type: js/control        # deferred
                                                            - if/else
                                                            - for
                                                            - while
                                                            - map
                                                            - array

                                                        - type: js/return         # deferred

                                                        - type: js/call           # deferred
                                                          name:                   # variable or named import
                                                          params:
                                                            - primitive/json
                                                            - js/expression
                                                            - js/call

    —————————————————————————
