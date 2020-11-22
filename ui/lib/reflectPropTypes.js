//Import this script to inject the reflective propTypes in react
//We need to ensure that we are using the same react module as the component we are using
//For this to happen our script can't depend on react, and we must import react from the target node_modules folder
//import React from 'react'
import * as PropTypes from 'prop-types'

var originalPropTypes = PropTypes;
var newPropTypes = {}

for(var propType in originalPropTypes){
  // Create a new reflective property each time the getter is called
  Object.defineProperty(newPropTypes, propType,
    {
       get: reflectiveGetter(propType)
     }
   );
}

//React.PropTypes = newPropTypes

//Enforce different scope for each property
function reflectiveGetter(propType){
  return function(){
    return createReflectivePropType(propType);
  }
}

function createReflectivePropType(type){
  var fakePropType = null;
  //Used for propTypes with arguments
  fakePropType = function fakePropType(propTypes){
    createInnerPropertyTypes(fakePropType, propTypes)
    return fakePropType;
  }

  fakePropType.type = type;
  fakePropType.isRequired = function(){}
  fakePropType.isRequired.type = type;
  fakePropType.isRequired.required = true;

  return fakePropType;
}

function createInnerPropertyTypes(outer, propTypes){
  outer.inner = propTypes;
  outer.isRequired.inner = propTypes
}

export default newPropTypes
