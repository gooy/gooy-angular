import {EventAggregator} from 'gooy-angular/event-aggregator';

export class Component extends EventAggregator{

  constructor() {
    super();
    this._ready = false;
    
  }

  destroy(){
    this.unbind();
  }

  markReady(data) {
    this._ready = true;
    this.publish("ready",data);
  }

  /**
   * Copy properties from one object to another
   * does not overwrite existing properties by default.
   *
   * @param target Object       target object to assign properties to
   * @param source Object       source object to copy properties from
   * @param overwrite Boolean   overwrite existing properties (true|false)
   * @returns Object
   */
  copyProps(target,source,overwrite){
    for (var key in source) {
      if (!source.hasOwnProperty(key)) continue;
      //skip already existing if overwrite is not set to true
      if (!overwrite && target.hasOwnProperty(key)) continue;
      target[key] = source[key];
    }
    return target;
  }


}
