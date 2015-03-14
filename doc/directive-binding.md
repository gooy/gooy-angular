Directive Binding
===

solutions for bindings with directives.

## Solution 1: without scope

Don't use isolated scope (set scope to false) and watch the same value applied on the textbox on the parent scope.  
(beyond horrible)

ng-model="code"  
scope: false

    //  listen for model changes
    scope.$watch($attrs.ngModel, function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });
    
    
    // set model value
    var ngModel = $parse($attrs.ngModel); //get the model by parsing the attribute value
    ngModel.assign($scope, value);

## Solution 2: isolate scope

Isolate scope (set scope to {}) and watch the model on the $parent scope (also horrible)

ng-model="code"  
scope: {}

    // listen for model changes
    scope.$parent.$watch($attrs.ngModel, function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });
    
    // set model value
    var ngModel = $parse($attrs.ngModel); //get the model by parsing the attribute value
    ngModel.assign($scope, value);

## Solution 3: isolate scope with inheritance

Isolate scope that inherits from parent.

ng-model="code"  
scope: true

    // listen for model changes
    scope.$watch($attrs.ngModel, function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });
    
    // set model value
    var ngModel = $parse($attrs.ngModel); //get the model by parsing the attribute value
    ngModel.assign($scope, value);
    

## Solution 4: isolate scope and setup Bindings

Isolate scope that specifies which properties to bind properties from the parent scope (better)

### Attributes @ 

Evaluated value of the DOM attribute (can use {{someProperty}} in the attribute value )0

With @ you need to `use attr.$observe('someProperty',function(){...})` if you need to use the value 
in your link(ing) function. E.g., if(scope.someProperty == "...") won't work.

Note that this means you can only access this attribute asynchronously. 
You don't need to use $observe() if you are only using the value in a template. 
E.g., template: `<div>{{title}}</div>`

Note in previously solution we were watching $attrs.ngModel, which translates into `someProperty`
so it would have been the same as `scope.$watch('someProperty')`, which is the property on the parent scope
here we can watch the local scope for the "ngModel" property as the value is filled in by the binding

ng-model="{{code}}"  
scope: { ngModel: "@" }

Example: 

    // listen for model changes
    scope.$watch("ngModel", function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });
    
    // set model value
    var ngModel = $parse($attrs.ngModel); //get the model by parsing the attribute value
    ngModel.assign($scope, value);
    
### Bindings = 

Bind to a parent scope property (use the same property from the parent. 
no interpolation of variables, cannot use `{{someProperty}}`
in this case you can use `if(scope.someProperty == "...")`

ng-model="code"
scope: { ngModel: "=" }

Example: 

    // listen for model changes
    scope.$watch("ngModel", function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });
    
    // set model value
    var ngModel = $parse($attrs.ngModel); //get the model by parsing the attribute value
    ngModel.assign($scope, value);

### Expressions & 

Reference a function from the parent. 

use the markup `funcattribute="somefunc()"` and stick it our directive's scope in `$scope.controlfunc`

ng-model="funcattribute"
scope: { controlfunc: '&funcattribute', }


Example: 

    // listen for model changes
    scope.$watch("ngModel", function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });
    
    // set model value
    ?

## Solution 5: isolate scope and use ngModel

use the `require` metadata.
it will be passed as the third argument to the `link` function.

ng-model="code"

require: "ngModel"
scope: {ngModel: '='}

    // the model can be watches like a normal binding
    scope.$watch("ngModel", function(newValue,oldValue,scope){
        console.log("ng-model value changed to ",newValue);
    });

    // or listen for model changes using ngModel.$render
    ngModel.$render = ()=>{
        console.log("ng-model value changed to ",ngModel.$modelValue);
    }
    
    //set model value
    ngModel.$setModelValue(newValue);

NOTE:

If the parent scope property doesn't exist, 
it will throw a NON_ASSIGNABLE_MODEL_EXPRESSION exception. 
You can avoid this behavior using =? or =?attr in order to flag the property as optional.

    scope: {foo: '=?'}
    
or

    require: "?ngModel"
    

