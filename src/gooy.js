import {logger} from './logger';
import angular from 'angular';

/**
 * Gooy Angular bootstrapper
 *
 * @module framework
 * @author Aaike Van Roekeghem <aaikevr@gmail.com>
 */
export class Gooy {

  constructor(element, moduleId, deps) {
    this.moduleId = moduleId;
    this.deps = deps;
    this.element = element;
    this.mod = Gooy.createModule(moduleId, deps);
  }

  /**
   * This will load an es6 module and register it as the root angular module for this app
   *
   * @returns {Promise}
   */
  start() {
    return System.import(this.moduleId).then((Controller)=> {
      //register as an angular controller
      this.withComponent(Controller, {}, {id: "GooyMain"});
      return this;
    });
  }

  /**
   * Binds this framework host to a DOM element.
   * This will also cause the framework to bootstrap the element and start the application.
   *
   * @param moduleId {String}         module id that points to a gooy app
   * @param element {HTMLElement}     DOM element to link to this app
   * @returns {Gooy}
   */
  setRoot(moduleId, element) {
    if (!element) element = this.element;

    this.appModuleId = moduleId;

    //load the main application module
    return System.import(moduleId).then((m)=> {
      this.processAllNamedModules(m);
      //initialize the appHost element with angular
      logger.debug(`bootstrapping application "${moduleId}" for "${this.moduleId}" host`);
      angular.bootstrap(element, [this.moduleId]);
      return this;
    });
  }

  /**
   * Process all named modules from a module file
   *
   * @param _module {Module}  module file
   */
  processAllNamedModules(_module) {
    var mod;
    for (var key in _module) {
      if (!_module.hasOwnProperty(key)) continue;
      mod = _module[key];
    }
    // TODO: check what kind of component it actually is
    // register as an angular component
    return this.withComponent(mod);
  }

  /**
   * Register a component with the framework
   * The component should have a static metadata method that will return relavant information on how the element should be constructed.
   * it should also have a static inject method that specifies which properties to inject from the DI into the contstructor.
   *
   * @param moduleId {String}                 moduleId that points to the component
   * @param [options] {Object}                an object that will be passed to new instances (useful for setting default configurations)
   * @param [metadataOverwrite] {Object}      optionally pass metadata that will overwrite the component's metadata
   * @returns {Promise}
   */
  withComponent(moduleId, options, metadataOverwrite) {
    if (typeof moduleId === "string") {
      return System.import(moduleId).then(m=> {
        return this.processAllNamedModules(m);
      });
    } else {
      return new Promise(() => {
        return this.registerComponent(moduleId, options, metadataOverwrite);
      });
    }
  }

  /**
   * Register a component with the framework
   * The component should have a static metadata method that will return relavant information on how the element should be constructed.
   * it should also have a static inject method that specifies which properties to inject from the DI into the contstructor.
   *
   * @param Component {Class}                 Class that represents a component or inherits from ComponentInterface
   * @param [options] {Object}                an object that will be passed to new instances (useful for setting default configurations)
   * @param [metadataOverwrite] {Object}      optionally pass metadata that will overwrite the component's metadata
   * @returns {Gooy}
   *
   */
  registerComponent(Component, options, metadataOverwrite) {
    Gooy.registerComponent(this.mod,Component, options, metadataOverwrite);
    return this;
  }

  /**
   * Register a component with an angular module
   * @param mod {Object}                      angular module to register with (defaults to the module of this apphost)
   * @param Components {Array||Class}                 Class that represents a component or inherits from ComponentInterface
   * @param [options] {Object}                an object that will be passed to new instances (useful for setting default configurations)
   * @param [metadataOverwrite] {Object}      optionally pass metadata that will overwrite the component's metadata
   */
  static registerComponent(mod, Components, options, metadataOverwrite) {
    if (mod === undefined) throw new Error("module provided was undefined");
    if (Components === undefined) throw new Error("Component provided was undefined");

    if (typeof Components !== Array) Components = [Components];

    for (var i = 0, l = Components.length; i < l; i++) {
      Gooy._registerComponent(mod, Components[i], options, metadataOverwrite);
    }

    return Gooy;
  }

  static _registerComponent(mod, Component, options, metadataOverwrite) {

    var metadata = {type: "controller"};
    //DI properties that will be injected into the constructor
    var inject = [], rawInject = [];

    //get inject definitions from the component class
    if (Component.inject && typeof Component.inject === "function") inject = inject.concat(Component.inject());
    if (Component.rawInject && typeof Component.rawInject === "function") rawInject = rawInject.concat(Component.rawInject());

    //concat all injects that should be injected by angular and split them up again afterwards
    var allInjects = inject.concat(rawInject);

    //get component metadata
    if (Component.metadata) {
      var cmetadata = Component.metadata;
      if (typeof Component.metadata === "function") cmetadata = cmetadata();
      Object.assign(metadata, cmetadata);
    }

    //apply optional overwrite of metadata
    if (metadataOverwrite && typeof metadataOverwrite === "object") Object.assign(metadata, metadataOverwrite);

    // assemble angular component arguments
    // pass the user defined injects to angular and let it take care or the DI
    allInjects.push(function () {

      //split the angular injects back into their individual arrays;
      var injects = Array.prototype.slice.call(arguments, 0, inject.length);
      var rawInjects = Array.prototype.slice.call(arguments, inject.length);

      switch(metadata.type){
        case "directive":

          // --------- resolve metadata functions that kickstart a directive
          // Defined as strings that should be resolved to a method on te new instance
          // note: only if it is a string that starts with `this.`
          // A new instance of the component is created for every directive.
          var methods = ['compile', 'link', 'controller'];
          for (var i = 0, l = methods.length; i < l; i++) {
            var m = methods[i];
            if (metadata[m] && metadata[m].substr(0, 5) === "this.") {
              Gooy.setupMetaFunction(Component, metadata, {
                name: metadata[m].substr(5),
                injects: injects,
                rawInject: rawInject,
                rawInjects: rawInjects
              });
            }
          }
          break;
        default:
          let inst = Object.create(Component.prototype);
          inst.constructor.apply(inst,injects);
          break;

      }

      return metadata;
    });

    //register component with angular
    logger.debug(`registering ${metadata.type}: ${metadata.id}`);
    if (mod[metadata.type] === undefined) throw new Error(`failed to register '${metadata.type}' with:`, mod);
    var component = mod[metadata.type](metadata.id, allInjects);

    //run the attached and bind methods
    if (component.attached) component.attached();
    if (component.bind) component.bind();
  }

  static setupMetaFunction(Component, metadata, options) {

    metadata[options.name] = function (scope, element, attr, ctrl, $transclude) {
      //logger.verbose(`new ${metadata.type} instance "${metadata.id}"`);
      var l, i;

      //create new instance for every link
      let inst = Object.create(Component.prototype);
      inst.constructor.apply(inst,options.injects);
      inst.scope = scope;
      inst.element = element;
      inst.attr = attr;
      inst.ctrl = ctrl;
      inst.$transclude = $transclude;

      //store reference the the component with the element
      element[0].component = inst;

      // --------- Setup model watches from metadata

      let prop;
      if (metadata.scope && typeof metadata.scope === "object")

        for (prop in metadata.scope) {
          if (!metadata.scope.hasOwnProperty(prop)) continue;
          Gooy.setupBinding(inst, scope, prop, metadata.scope[prop]);
        }

      if (metadata.watch && typeof metadata.watch === "object")
        for (prop in metadata.watch) {
          if (!metadata.watch.hasOwnProperty(prop)) continue;
          Gooy.setupBinding(inst, scope, prop, metadata.watch[prop]);
        }

      //inject DI variables as instance properties
      for (i = 0, l = options.rawInject.length; i < l; i++) {
        inst[options.rawInject[i]] = options.rawInjects[i];
      }

      return inst[options.name].apply(inst, arguments);
    };
  }

  static setupBinding(inst, scope, prop, value) {
    var bindingType = value;
    var bindingName = prop;

    if (bindingType.length > 1) {
      bindingName = bindingType.substr(1);
      bindingType = bindingType.substr(0, 1);
    }

    if (inst[prop + 'Changed']) {
      logger.debug(`binding (${bindingType}): ${bindingName} as scope.${prop} -> ${prop}Changed() `);
      scope.$watch(prop, (value, oldValue, vscope)=> {
        if (inst[prop + 'Changed']) inst[prop + 'Changed'].call(inst, value, oldValue, vscope);
      });
    }
  }

  /**
   * Create the root module for this framework host
   *
   * @param id {String}         id for the module
   * @param [deps] {Object}     dependencies (as angular module ids)
   * @returns {Gooy}            an angular module
   */
  static createModule(id, deps) {
    var mod = angular.module(id, deps || []);
    //note: must manually provide the DI strings because the function parameters won't work when mangled
    mod.config(['$interpolateProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
      ($interpolateProvider, $controllerProvider, $compileProvider, $filterProvider, $provide)=> {
        //$interpolateProvider.startSymbol('{|');
        //$interpolateProvider.endSymbol('|}');
        mod.providers = {
          $controllerProvider: $controllerProvider,
          $compileProvider: $compileProvider,
          $filterProvider: $filterProvider,
          $provide: $provide
        };
      }]);
    return mod;
  }

}
