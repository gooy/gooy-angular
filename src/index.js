/**
 * Gooy framework
 *
 * @module framework
 */
/* jshint ignore:start */
export {Gooy} from "./gooy";
/* jshint ignore:end */
import "./bootstrapper";

//these are here to make sure they are included in the bundling process (temporary solution)
import "core-js";
import "aurelia-html-template-element";
import "scoped-polyfill";
