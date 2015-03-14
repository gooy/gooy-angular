import {logger} from './logger';
import {Gooy} from './index';

/**
 * Gooy Angular Bootstrapper
 * @author Aaike Van Roekeghem <aaikevr@gmail.com>
 */
export class Bootstrapper {

  constructor() {
    this.run();
  }

  /**
   * Bootstrap the framework
   * @returns {*}
   */
  run() {
    if (this.runningLocally()) throw new Error("You should run this page through a webserver");

    return this.DOMReady(window)
    .then((doc)=> {
        this.mainHost = doc.querySelectorAll("[gooy-main]");
        this.appHost = doc.querySelectorAll("[gooy-app]");
        return this.preparePlatform();
      })
    .then(()=> {
        if (!this.appHost.length && !this.mainHost.length) throw new Error("no elements with 'gooy-app' or 'gooy-main' attributes found in the current document");
        var i, l;

        logger.debug("platform ready");

        for (i = 0, l = this.mainHost.length; i < l; ++i) {
          this.handleMain(this.mainHost[i]);
        }

        for (i = 0, l = this.appHost.length; i < l; ++i) {
          this.handleApp(this.appHost[i]);
        }

        this.isReady = true;
      })
      ;
  }

  /**
   * load framework internals
   * @param framework
   */
  configure(framework) { // jshint ignore:line
    return new Promise((resolve) => {resolve();});
  }

  /**
   * Use a custom configuration function to configure the framework and launch the app
   * @param mainHost
   * @returns {*}
   */
  handleMain(mainHost) {
    var mainModuleId = mainHost.getAttribute('gooy-main') || 'main';
    return System.import(mainModuleId).then(m => {
      var framework = new Gooy(mainHost,mainModuleId);
      return this.configure(framework).then(() => {
        if(m.configure===undefined) throw new Error(`Tried to use "${mainModuleId}" as a framework configurator module: no "configure" function found`);
        return m.configure(framework);
      });
    });
  }

  /**
   * Initialize an application on the specified appHost
   *
   * @param appHost HtmlElement   element to initialize
   * @returns Promise
   */
  handleApp(appHost) {
    var appModuleId = appHost.getAttribute('gooy-app') || './app',
      framework = new Gooy(appHost,appModuleId);

    return this.configure(framework).then(() => {
      return framework.start().then(a => { // jshint ignore:line

      });
    });
  }

  /**
   * Check if application is running through a webserver or not
   *
   * @returns {boolean}
   */
  runningLocally() {
    return window.location.protocol !== 'http' && window.location.protocol !== 'http:' &&
      window.location.protocol !== 'https' && window.location.protocol !== 'https:';
  }

  /**
   * DOMReady
   *
   * @param global
   * @returns {Promise}
   * @constructor
   */
  DOMReady(global) {
    return new Promise((resolve) => {
      if (global.document.readyState === "complete") {
        resolve(global.document);
      } else {
        global.document.addEventListener("DOMContentLoaded", completed, false);
        global.addEventListener("load", completed, false);
      }

      function completed() {
        global.document.removeEventListener("DOMContentLoaded", completed, false);
        global.removeEventListener("load", completed, false);
        resolve(global.document);
      }
    });
  }

  /**
   * Prepare the platform for the current device.
   * This will inspect the device and install polyfills as needed.
   */
  preparePlatform() {
    var packages = [];

    // core-js (71 KB, 36 kb mangled)
    //logger.debug('loading core-js');
    packages.push('core-js');

    // HTMLImports polyfill
    /*if(!('import' in document.createElement('link'))){
     logger.debug('loading the HTMLImports polyfill');
     packages.push('webcomponentsjs/HTMLImports.min');
     }*/

    // HTMLTemplateElement polyfill (3.6 kb, 2.5 kb mangled)
    if (!("content" in document.createElement("template"))) {
      //logger.debug('loading the HTMLTemplateElement polyfill');
      packages.push("aurelia-html-template-element");
    }

    //nothing needs to be loaded (evergreen)
    if (!packages.length) return new Promise((resolve) => {resolve(); });

    //load in polyfills
    return System.import.apply(System, packages);
  }

}

export var bootstrapper = new Bootstrapper();
