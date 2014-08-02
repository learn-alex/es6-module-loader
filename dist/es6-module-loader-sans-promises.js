/*
*********************************************************************************************

  Loader Polyfill

    - Implemented exactly to the 2014-07-18 Specification Draft.

    - Functions are commented with their spec numbers, with spec differences commented.

    - Spec bugs are commented in this code with links.

    - Abstract functions have been combined where possible, and their associated functions
      commented.

    - Realm implementation is entirely omitted.

    - Loader module table iteration currently not yet implemented.

*********************************************************************************************
*/

// Some Helpers

// logs a linkset snapshot for debugging
/* function snapshot(loader) {
  console.log('---Snapshot---');
  for (var i = 0; i < loader.loads.length; i++) {
    var load = loader.loads[i];
    var linkSetLog = '  ' + load.name + ' (' + load.status + '): ';

    for (var j = 0; j < load.linkSets.length; j++) {
      linkSetLog += '{' + logloads(load.linkSets[j].loads) + '} ';
    }
    console.log(linkSetLog);
  }
  console.log('');
}
function logloads(loads) {
  var log = '';
  for (var k = 0; k < loads.length; k++)
    log += loads[k].name + (k != loads.length - 1 ? ' ' : '');
  return log;
} */


/* function checkInvariants() {
  // see https://bugs.ecmascript.org/show_bug.cgi?id=2603#c1

  var loads = System._loader.loads;
  var linkSets = [];

  for (var i = 0; i < loads.length; i++) {
    var load = loads[i];
    console.assert(load.status == 'loading' || load.status == 'loaded', 'Each load is loading or loaded');

    for (var j = 0; j < load.linkSets.length; j++) {
      var linkSet = load.linkSets[j];

      for (var k = 0; k < linkSet.loads.length; k++)
        console.assert(loads.indexOf(linkSet.loads[k]) != -1, 'linkSet loads are a subset of loader loads');

      if (linkSets.indexOf(linkSet) == -1)
        linkSets.push(linkSet);
    }
  }

  for (var i = 0; i < loads.length; i++) {
    var load = loads[i];
    for (var j = 0; j < linkSets.length; j++) {
      var linkSet = linkSets[j];

      if (linkSet.loads.indexOf(load) != -1)
        console.assert(load.linkSets.indexOf(linkSet) != -1, 'linkSet contains load -> load contains linkSet');

      if (load.linkSets.indexOf(linkSet) != -1)
        console.assert(linkSet.loads.indexOf(load) != -1, 'load contains linkSet -> linkSet contains load');
    }
  }

  for (var i = 0; i < linkSets.length; i++) {
    var linkSet = linkSets[i];
    for (var j = 0; j < linkSet.loads.length; j++) {
      var load = linkSet.loads[j];

      for (var k = 0; k < load.dependencies.length; k++) {
        var depName = load.dependencies[k].value;
        var depLoad;
        for (var l = 0; l < loads.length; l++) {
          if (loads[l].name != depName)
            continue;
          depLoad = loads[l];
          break;
        }

        // loading records are allowed not to have their dependencies yet
        // if (load.status != 'loading')
        //  console.assert(depLoad, 'depLoad found');

        // console.assert(linkSet.loads.indexOf(depLoad) != -1, 'linkset contains all dependencies');
      }
    }
  }
} */


(function (__global) {
  (function() {
    var Promise = __global.Promise || require('when/es6-shim/Promise');

    var defineProperty;
    (function () {
      try {
        if (!!Object.defineProperty({}, 'a', {})) {
          defineProperty = Object.defineProperty;
        }
      } catch (e) {
        defineProperty = function (obj, prop, opt) {
          try {
            obj[prop] = opt.value || opt.get.call(obj);
          }
          catch(e) {}
        }
      }
    }());

    console.assert = console.assert || function() {};

    // IE8 support
    var indexOf = Array.prototype.indexOf || function(item) {
      for (var i = 0, thisLen = this.length; i < thisLen; i++) {
        if (this[i] === item) {
          return i;
        }
      }
      return -1;
    };

    // 15.2.3 - Runtime Semantics: Loader State

    // 15.2.3.11
    function createLoaderLoad(object) {
      return {
        // modules is an object for ES5 implementation
        modules: {},
        loads: [],
        loaderObj: object
      };
    }

    // 15.2.3.2 Load Records and LoadRequest Objects

    // 15.2.3.2.1
    function createLoad(name) {
      return {
        status: 'loading',
        name: name,
        linkSets: [],
        dependencies: [],
        metadata: {}
      };
    }

    // 15.2.3.2.2 createLoadRequestObject, absorbed into calling functions

    // 15.2.4

    // 15.2.4.1
    function loadModule(loader, name, options) {
      return new Promise(asyncStartLoadPartwayThrough({
        step: options.address ? 'fetch' : 'locate',
        loader: loader,
        moduleName: name,
        // allow metadata for import https://bugs.ecmascript.org/show_bug.cgi?id=3091
        moduleMetadata: options && options.metadata || {},
        moduleSource: options.source,
        moduleAddress: options.address
      }));
    }

    // 15.2.4.2
    function requestLoad(loader, request, refererName, refererAddress) {
      // 15.2.4.2.1 CallNormalize
      return new Promise(function(resolve, reject) {
        resolve(loader.loaderObj.normalize(request, refererName, refererAddress));
      })
      // 15.2.4.2.2 GetOrCreateLoad
      .then(function(name) {
        var load;
        if (loader.modules[name]) {
          load = createLoad(name);
          load.status = 'linked';
          // https://bugs.ecmascript.org/show_bug.cgi?id=2795
          // load.module = loader.modules[name];
          return load;
        }

        for (var i = 0, l = loader.loads.length; i < l; i++) {
          load = loader.loads[i];
          if (load.name != name)
            continue;
          console.assert(load.status == 'loading' || load.status == 'loaded', 'loading or loaded');
          return load;
        }

        load = createLoad(name);
        loader.loads.push(load);

        proceedToLocate(loader, load);

        return load;
      });
    }

    // 15.2.4.3
    function proceedToLocate(loader, load) {
      proceedToFetch(loader, load,
        Promise.resolve()
        // 15.2.4.3.1 CallLocate
        .then(function() {
          return loader.loaderObj.locate({ name: load.name, metadata: load.metadata });
        })
      );
    }

    // 15.2.4.4
    function proceedToFetch(loader, load, p) {
      proceedToTranslate(loader, load,
        p
        // 15.2.4.4.1 CallFetch
        .then(function(address) {
          // adjusted, see https://bugs.ecmascript.org/show_bug.cgi?id=2602
          if (load.status != 'loading')
            return;
          load.address = address;

          return loader.loaderObj.fetch({ name: load.name, metadata: load.metadata, address: address });
        })
      );
    }

    var anonCnt = 0;

    // 15.2.4.5
    function proceedToTranslate(loader, load, p) {
      p
      // 15.2.4.5.1 CallTranslate
      .then(function(source) {
        if (load.status != 'loading')
          return;
        return loader.loaderObj.translate({ name: load.name, metadata: load.metadata, address: load.address, source: source });
      })

      // 15.2.4.5.2 CallInstantiate
      .then(function(source) {
        if (load.status != 'loading')
          return;
        load.source = source;
        return loader.loaderObj.instantiate({ name: load.name, metadata: load.metadata, address: load.address, source: source });
      })

      // 15.2.4.5.3 InstantiateSucceeded
      .then(function(instantiateResult) {
        if (load.status != 'loading')
          return;

        if (instantiateResult === undefined) {
          load.address = load.address || 'anon' + ++anonCnt;

          // NB instead of load.kind, use load.isDeclarative
          load.isDeclarative = true;
          // parse sets load.declare, load.depsList
          loader.loaderObj.parse(load);
        }
        else if (typeof instantiateResult == 'object') {
          load.depsList = instantiateResult.deps || [];
          load.execute = instantiateResult.execute;
          load.isDeclarative = false;
        }
        else
          throw TypeError('Invalid instantiate return value');

        // 15.2.4.6 ProcessLoadDependencies
        load.dependencies = [];
        var depsList = load.depsList;

        var loadPromises = [];
        for (var i = 0, l = depsList.length; i < l; i++) (function(request, index) {
          loadPromises.push(
            requestLoad(loader, request, load.name, load.address)

            // 15.2.4.6.1 AddDependencyLoad (load is parentLoad)
            .then(function(depLoad) {

              console.assert(!load.dependencies.some(function(dep) {
                return dep.key == request;
              }), 'not already a dependency');

              // adjusted from spec to maintain dependency order
              // this is due to the System.register internal implementation needs
              load.dependencies[index] = {
                key: request,
                value: depLoad.name
              };

              if (depLoad.status != 'linked') {
                var linkSets = load.linkSets.concat([]);
                for (var i = 0, l = linkSets.length; i < l; i++)
                  addLoadToLinkSet(linkSets[i], depLoad);
              }

              // console.log('AddDependencyLoad ' + depLoad.name + ' for ' + load.name);
              // snapshot(loader);
            })
          );
        })(depsList[i], i);

        return Promise.all(loadPromises);
      })

      // 15.2.4.6.2 LoadSucceeded
      .then(function() {
        // console.log('LoadSucceeded ' + load.name);
        // snapshot(loader);

        console.assert(load.status == 'loading', 'is loading');

        load.status = 'loaded';

        var linkSets = load.linkSets.concat([]);
        for (var i = 0, l = linkSets.length; i < l; i++)
          updateLinkSetOnLoad(linkSets[i], load);
      })

      // 15.2.4.5.4 LoadFailed
      ['catch'](function(exc) {
        console.assert(load.status == 'loading', 'is loading on fail');
        load.status = 'failed';
        load.exception = exc;

        var linkSets = load.linkSets.concat([]);
        for (var i = 0, l = linkSets.length; i < l; i++)
          linkSetFailed(linkSets[i], exc);

        console.assert(load.linkSets.length == 0, 'linkSets not removed');
      });
    }

    // 15.2.4.7 PromiseOfStartLoadPartwayThrough absorbed into calling functions

    // 15.2.4.7.1
    function asyncStartLoadPartwayThrough(stepState) {
      return function(resolve, reject) {
        var loader = stepState.loader;
        var name = stepState.moduleName;
        var step = stepState.step;

        if (loader.modules[name])
          throw new TypeError('"' + name + '" already exists in the module table');

        // NB this still seems wrong for LoadModule as we may load a dependency
        // of another module directly before it has finished loading.
        // see https://bugs.ecmascript.org/show_bug.cgi?id=2994
        for (var i = 0, l = loader.loads.length; i < l; i++)
          if (loader.loads[i].name == name)
            throw new TypeError('"' + name + '" already loading');

        var load = createLoad(name);

        load.metadata = stepState.moduleMetadata;

        var linkSet = createLinkSet(loader, load);

        loader.loads.push(load);

        resolve(linkSet.done);

        if (step == 'locate')
          proceedToLocate(loader, load);

        else if (step == 'fetch')
          proceedToFetch(loader, load, Promise.resolve(stepState.moduleAddress));

        else {
          console.assert(step == 'translate', 'translate step');
          load.address = stepState.moduleAddress;
          proceedToTranslate(loader, load, Promise.resolve(stepState.moduleSource));
        }
      }
    }

    // Declarative linking functions run through alternative implementation:
    // 15.2.5.1.1 CreateModuleLinkageRecord not implemented
    // 15.2.5.1.2 LookupExport not implemented
    // 15.2.5.1.3 LookupModuleDependency not implemented

    // 15.2.5.2.1
    function createLinkSet(loader, startingLoad) {
      var linkSet = {
        loader: loader,
        loads: [],
        startingLoad: startingLoad, // added see spec bug https://bugs.ecmascript.org/show_bug.cgi?id=2995
        loadingCount: 0
      };
      linkSet.done = new Promise(function(resolve, reject) {
        linkSet.resolve = resolve;
        linkSet.reject = reject;
      });
      addLoadToLinkSet(linkSet, startingLoad);
      return linkSet;
    }
    // 15.2.5.2.2
    function addLoadToLinkSet(linkSet, load) {
      console.assert(load.status == 'loading' || load.status == 'loaded', 'loading or loaded on link set');

      for (var i = 0, l = linkSet.loads.length; i < l; i++)
        if (linkSet.loads[i] == load)
          return;

      linkSet.loads.push(load);
      load.linkSets.push(linkSet);

      // adjustment, see https://bugs.ecmascript.org/show_bug.cgi?id=2603
      if (load.status != 'loaded') {
        linkSet.loadingCount++;
      }

      var loader = linkSet.loader;

      for (var i = 0, l = load.dependencies.length; i < l; i++) {
        var name = load.dependencies[i].value;

        if (loader.modules[name])
          continue;

        for (var j = 0, d = loader.loads.length; j < d; j++) {
          if (loader.loads[j].name != name)
            continue;

          addLoadToLinkSet(linkSet, loader.loads[j]);
          break;
        }
      }
      // console.log('add to linkset ' + load.name);
      // snapshot(linkSet.loader);
    }

    function doLink(linkSet) {
      try {
        link(linkSet);
      }
      catch(exc) {
        linkSetFailed(linkSet, exc);
        return true;
      }
    }

    // 15.2.5.2.3
    function updateLinkSetOnLoad(linkSet, load) {
      // console.log('update linkset on load ' + load.name);
      // snapshot(linkSet.loader);

      console.assert(load.status == 'loaded' || load.status == 'linked', 'loaded or linked');

      linkSet.loadingCount--;

      if (linkSet.loadingCount > 0)
        return;

      // adjusted for spec bug https://bugs.ecmascript.org/show_bug.cgi?id=2995
      var startingLoad = linkSet.startingLoad;

      // non-executing link variation for loader tracing
      // on the server. Not in spec.
      /***/
      if (linkSet.loader.loaderObj.execute === false) {
        var loads = [].concat(linkSet.loads);
        for (var i = 0, l = loads.length; i < l; i++) {
          var load = loads[i];
          load.module = !load.isDeclarative ? {
            module: _newModule({})
          } : {
            name: load.name,
            module: _newModule({}),
            evaluated: true
          };
          load.status = 'linked';
          finishLoad(linkSet.loader, load);
        }
        return linkSet.resolve(startingLoad);
      }
      /***/

      var abrupt = doLink(linkSet);

      if (abrupt)
        return;

      console.assert(linkSet.loads.length == 0, 'loads cleared');

      linkSet.resolve(startingLoad);
    }

    // 15.2.5.2.4
    function linkSetFailed(linkSet, exc) {
      var loader = linkSet.loader;
      var loads = linkSet.loads.concat([]);
      for (var i = 0, l = loads.length; i < l; i++) {
        var load = loads[i];

        // store all failed load records
        loader.loaderObj.failed = loader.loaderObj.failed || [];
        if (indexOf.call(loader.loaderObj.failed, load) == -1)
          loader.loaderObj.failed.push(load);

        var linkIndex = indexOf.call(load.linkSets, linkSet);
        console.assert(linkIndex != -1, 'link not present');
        load.linkSets.splice(linkIndex, 1);
        if (load.linkSets.length == 0) {
          var globalLoadsIndex = indexOf.call(linkSet.loader.loads, load);
          if (globalLoadsIndex != -1)
            linkSet.loader.loads.splice(globalLoadsIndex, 1);
        }
      }
      linkSet.reject(exc);
    }

    // 15.2.5.2.5
    function finishLoad(loader, load) {
      // add to global trace if tracing
      if (loader.loaderObj.trace) {
        if (!loader.loaderObj.loads)
          loader.loaderObj.loads = {};
        var depMap = {};
        load.dependencies.forEach(function(dep) {
          depMap[dep.key] = dep.value;
        });
        loader.loaderObj.loads[load.name] = {
          name: load.name,
          deps: load.dependencies.map(function(dep){ return dep.key }),
          depMap: depMap,
          address: load.address,
          metadata: load.metadata,
          source: load.source,
          kind: load.isDeclarative ? 'declarative' : 'dynamic'
        };
      }
      // if not anonymous, add to the module table
      if (load.name) {
        console.assert(!loader.modules[load.name], 'load not in module table');
        loader.modules[load.name] = load.module;
      }
      var loadIndex = indexOf.call(loader.loads, load);
      if (loadIndex != -1)
        loader.loads.splice(loadIndex, 1);
      for (var i = 0, l = load.linkSets.length; i < l; i++) {
        loadIndex = indexOf.call(load.linkSets[i].loads, load);
        if (loadIndex != -1)
          load.linkSets[i].loads.splice(loadIndex, 1);
      }
      load.linkSets.splice(0, load.linkSets.length);
    }

    // 15.2.5.3 Module Linking Groups

    // 15.2.5.3.2 BuildLinkageGroups alternative implementation
    // Adjustments (also see https://bugs.ecmascript.org/show_bug.cgi?id=2755)
    // 1. groups is an already-interleaved array of group kinds
    // 2. load.groupIndex is set when this function runs
    // 3. load.groupIndex is the interleaved index ie 0 declarative, 1 dynamic, 2 declarative, ... (or starting with dynamic)
    function buildLinkageGroups(load, loads, groups, loader) {
      groups[load.groupIndex] = groups[load.groupIndex] || [];

      // if the load already has a group index and its in its group, its already been done
      // this logic naturally handles cycles
      if (indexOf.call(groups[load.groupIndex], load) != -1)
        return;

      // now add it to the group to indicate its been seen
      groups[load.groupIndex].push(load);

      for (var i = 0, l = loads.length; i < l; i++) {
        var loadDep = loads[i];

        // dependencies not found are already linked
        for (var j = 0; j < load.dependencies.length; j++) {
          if (loadDep.name == load.dependencies[j].value) {
            // by definition all loads in linkset are loaded, not linked
            console.assert(loadDep.status == 'loaded', 'Load in linkSet not loaded!');

            // if it is a group transition, the index of the dependency has gone up
            // otherwise it is the same as the parent
            var loadDepGroupIndex = load.groupIndex + (loadDep.isDeclarative != load.isDeclarative);

            // the group index of an entry is always the maximum
            if (loadDep.groupIndex === undefined || loadDep.groupIndex < loadDepGroupIndex) {

              // if already in a group, remove from the old group
              if (loadDep.groupIndex) {
                groups[loadDep.groupIndex].splice(indexOf.call(groups[loadDep.groupIndex], loadDep), 1);

                // if the old group is empty, then we have a mixed depndency cycle
                if (groups[loadDep.groupIndex].length == 0)
                  throw new TypeError("Mixed dependency cycle detected");
              }

              loadDep.groupIndex = loadDepGroupIndex;
            }

            buildLinkageGroups(loadDep, loads, groups, loader);
          }
        }
      }
    }

    // 15.2.5.4
    function link(linkSet) {

      var loader = linkSet.loader;

      if (!linkSet.loads.length)
        return;

      // console.log('linking {' + logloads(linkSet.loads) + '}');
      // snapshot(loader);

      // 15.2.5.3.1 LinkageGroups alternative implementation

      // build all the groups
      // because the first load represents the top of the tree
      // for a given linkset, we can work down from there
      var groups = [];
      var startingLoad = linkSet.loads[0];
      startingLoad.groupIndex = 0;
      buildLinkageGroups(startingLoad, linkSet.loads, groups, loader);

      // determine the kind of the bottom group
      var curGroupDeclarative = startingLoad.isDeclarative == groups.length % 2;

      // run through the groups from bottom to top
      for (var i = groups.length - 1; i >= 0; i--) {
        var group = groups[i];
        for (var j = 0; j < group.length; j++) {
          var load = group[j];

          // 15.2.5.5 LinkDeclarativeModules adjusted
          if (curGroupDeclarative) {
            linkDeclarativeModule(load, linkSet.loads, loader);
          }
          // 15.2.5.6 LinkDynamicModules adjusted
          else {
            var module = load.execute();
            if (!module || !(module instanceof Module))
              throw new TypeError('Execution must define a Module instance');
            load.module = {
              module: module
            };
            load.status = 'linked';
          }
          finishLoad(loader, load);
        }

        // alternative current kind for next loop
        curGroupDeclarative = !curGroupDeclarative;
      }
    }


    // custom module records for binding graph
    // store linking module records in a separate table
    var moduleRecords = {};
    function getOrCreateModuleRecord(name) {
      return moduleRecords[name] || (moduleRecords[name] = {
        name: name,
        dependencies: [],
        module: new Module(), // start from an empty module and extend
        importers: []
      });
    }

    // custom declarative linking function
    function linkDeclarativeModule(load, loads, loader) {
      if (load.module)
        return;

      var module = load.module = getOrCreateModuleRecord(load.name);
      var moduleObj = load.module.module;

      var registryEntry = load.declare.call(__global, function(name, value) {
        // NB This should be an Object.defineProperty, but that is very slow.
        //    By disaling this module write-protection we gain performance.
        //    It could be useful to allow an option to enable or disable this.
        module.locked = true;
        moduleObj[name] = value;

        for (var i = 0, l = module.importers.length; i < l; i++) {
          var importerModule = module.importers[i];
          if (!importerModule.locked) {
            var importerIndex = indexOf.call(importerModule.dependencies, module);
            importerModule.setters[importerIndex](moduleObj);
          }
        }

        module.locked = false;
        return value;
      });

      // setup our setters and execution function
      module.setters = registryEntry.setters;
      module.execute = registryEntry.execute;

      // now link all the module dependencies
      // amending the depMap as we go
      for (var i = 0, l = load.dependencies.length; i < l; i++) {
        var depName = load.dependencies[i].value;
        var depModule = loader.modules[depName];

        // if dependency not already in the module registry
        // then try and link it now
        if (!depModule) {
          // get the dependency load record
          for (var j = 0; j < loads.length; j++) {
            if (loads[j].name != depName)
              continue;

            // only link if already not already started linking (stops at circular / dynamic)
            if (!loads[j].module) {
              linkDeclarativeModule(loads[j], loads, loader);
              depModule = loads[j].module;
            }
            // if circular, create the module record
            else {
              depModule = getOrCreateModuleRecord(depName);
            }
          }
        }

        // only declarative modules have dynamic bindings
        if (depModule.importers) {
          depModule.importers.push(module);
          module.dependencies.push(depModule);
        }

        // run the setter for this dependency
        if (module.setters[i])
          module.setters[i](depModule.module);
      }

      load.status = 'linked';
    }



    // 15.2.5.5.1 LinkImports not implemented
    // 15.2.5.7 ResolveExportEntries not implemented
    // 15.2.5.8 ResolveExports not implemented
    // 15.2.5.9 ResolveExport not implemented
    // 15.2.5.10 ResolveImportEntries not implemented

    // 15.2.6.1
    function evaluateLoadedModule(loader, load) {
      console.assert(load.status == 'linked', 'is linked ' + load.name);

      doEnsureEvaluated(load.module, [], loader);
      return load.module.module;
    }

    /*
     * Module Object non-exotic for ES5:
     *
     * module.module        bound module object
     * module.execute       execution function for module
     * module.dependencies  list of module objects for dependencies
     * See getOrCreateModuleRecord for all properties
     *
     */
    function doExecute(module) {
      try {
        module.execute.call(__global);
      }
      catch(e) {
        return e;
      }
    }

    // propogate execution errors
    // see https://bugs.ecmascript.org/show_bug.cgi?id=2993
    function doEnsureEvaluated(module, seen, loader) {
      var err = ensureEvaluated(module, seen, loader);
      if (err)
        throw err;
    }
    // 15.2.6.2 EnsureEvaluated adjusted
    function ensureEvaluated(module, seen, loader) {
      if (module.evaluated || !module.dependencies)
        return;

      seen.push(module);

      var deps = module.dependencies;
      var err;

      for (var i = 0, l = deps.length; i < l; i++) {
        var dep = deps[i];
        if (indexOf.call(seen, dep) == -1) {
          err = ensureEvaluated(dep, seen, loader);
          // stop on error, see https://bugs.ecmascript.org/show_bug.cgi?id=2996
          if (err)
            return err + '\n  in module ' + dep.name;
        }
      }

      if (module.failed)
        return new Error('Module failed execution.');

      if (module.evaluated)
        return;

      module.evaluated = true;
      err = doExecute(module);
      if (err) {
        module.failed = true;
      } else if (Object.preventExtensions) {
        // spec variation
        // we don't create a new module here because it was created and ammended
        // we just disable further extensions instead
        Object.preventExtensions(module.module);
      }

      module.execute = undefined;
      return err;
    }

    // 26.3 Loader

    // 26.3.1.1
    function Loader(options) {
      if (typeof options != 'object')
        throw new TypeError('Options must be an object');

      if (options.normalize)
        this.normalize = options.normalize;
      if (options.locate)
        this.locate = options.locate;
      if (options.fetch)
        this.fetch = options.fetch;
      if (options.translate)
        this.translate = options.translate;
      if (options.instantiate)
        this.instantiate = options.instantiate;

      this._loader = {
        loaderObj: this,
        loads: [],
        modules: {}
      };

      // 26.3.3.6
      defineProperty(this, 'global', {
        get: function() {
          return __global;
        }
      });

      // 26.3.3.13 realm not implemented
    }

    function Module() {}

    // importPromises adds ability to import a module twice without error - https://bugs.ecmascript.org/show_bug.cgi?id=2601
    var importPromises = {};
    function createImportPromise(name, promise) {
      importPromises[name] = promise;
      promise.then(function() {
        importPromises[name] = undefined;
      });
      promise['catch'](function() {
        importPromises[name] = undefined;
      });
      return promise;
    }

    Loader.prototype = {
      // 26.3.3.1
      constructor: Loader,
      // 26.3.3.2
      define: function(name, source, options) {
        // check if already defined
        if (importPromises[name])
          throw new TypeError('Module is already loading.');
        return createImportPromise(name, new Promise(asyncStartLoadPartwayThrough({
          step: 'translate',
          loader: this._loader,
          moduleName: name,
          moduleMetadata: options && options.metadata || {},
          moduleSource: source,
          moduleAddress: options && options.address
        })));
      },
      // 26.3.3.3
      'delete': function(name) {
        return this._loader.modules[name] ? delete this._loader.modules[name] : false;
      },
      // 26.3.3.4 entries not implemented
      // 26.3.3.5
      get: function(key) {
        if (!this._loader.modules[key])
          return;
        doEnsureEvaluated(this._loader.modules[key], [], this);
        return this._loader.modules[key].module;
      },
      // 26.3.3.7
      has: function(name) {
        return !!this._loader.modules[name];
      },
      // 26.3.3.8
      'import': function(name, options) {
        // run normalize first
        var loaderObj = this;

        // added, see https://bugs.ecmascript.org/show_bug.cgi?id=2659
        return Promise.resolve(loaderObj.normalize(name, options && options.name, options && options.address))
        .then(function(name) {
          var loader = loaderObj._loader;

          if (loader.modules[name]) {
            doEnsureEvaluated(loader.modules[name], [], loader._loader);
            return loader.modules[name].module;
          }

          return importPromises[name] || createImportPromise(name,
            loadModule(loader, name, options || {})
            .then(function(load) {
              delete importPromises[name];
              return evaluateLoadedModule(loader, load);
            }));
        });
      },
      // 26.3.3.9 keys not implemented
      // 26.3.3.10
      load: function(name, options) {
        if (this._loader.modules[name]) {
          doEnsureEvaluated(this._loader.modules[name], [], this._loader);
          return Promise.resolve(this._loader.modules[name].module);
        }
        return importPromises[name] || createImportPromise(name, loadModule(this._loader, name, {}));
      },
      // 26.3.3.11
      module: function(source, options) {
        var load = createLoad();
        load.address = options && options.address;
        var linkSet = createLinkSet(this._loader, load);
        var sourcePromise = Promise.resolve(source);
        var loader = this._loader;
        var p = linkSet.done.then(function() {
          return evaluateLoadedModule(loader, load);
        });
        proceedToTranslate(loader, load, sourcePromise);
        return p;
      },
      // 26.3.3.12
      newModule: function (obj) {
        if (typeof obj != 'object')
          throw new TypeError('Expected object');

        // we do this to be able to tell if a module is a module privately in ES5
        // by doing m instanceof Module
        var m = new Module();

        for (var key in obj) {
          (function (key) {
            defineProperty(m, key, {
              configurable: false,
              enumerable: true,
              get: function () {
                return obj[key];
              }
            });
          })(key);
        }

        if (Object.preventExtensions)
          Object.preventExtensions(m);

        return m;
      },
      // 26.3.3.14
      set: function(name, module) {
        if (!(module instanceof Module))
          throw new TypeError('Loader.set(' + name + ', module) must be a module');
        this._loader.modules[name] = {
          module: module
        };
      },
      // 26.3.3.15 values not implemented
      // 26.3.3.16 @@iterator not implemented
      // 26.3.3.17 @@toStringTag not implemented

      // 26.3.3.18.1
      normalize: function(name, referrerName, referrerAddress) {
        return name;
      },
      // 26.3.3.18.2
      locate: function(load) {
        return load.name;
      },
      // 26.3.3.18.3
      fetch: function(load) {
        throw new TypeError('Fetch not implemented');
      },
      // 26.3.3.18.4
      translate: function(load) {
        return load.source;
      },
      parse: function(load) {
        throw new TypeError('Loader.parse is not implemented');
      },
      // 26.3.3.18.5
      instantiate: function(load) {
      }
    };

    var _newModule = Loader.prototype.newModule;


    /*
     * Traceur-specific Parsing Code for Loader
     */
    (function() {
      function checkForErrors(output, load) {
        if (output.errors.length) {
          for (var i = 0, l = output.errors.length; i < l; i++)
            console.error(output.errors[i]);
          throw new Error('Parse of ' + load.name + ', ' + load.address + ' failed, ' + output.errors.length);
        }
      }

      // parse function is used to parse a load record
      // Returns an array of ModuleSpecifiers
      var traceur;
      Loader.prototype.parse = function(load) {
        if (!traceur) {
          if (typeof window == 'undefined')
            traceur = require('traceur');
          else if (__global.traceur)
            traceur = __global.traceur;
          else
            throw new TypeError('Include Traceur for module syntax support');
        }

        console.assert(load.source, 'Non-empty source');

        var depsList;

        load.isDeclarative = true;

        var compiler = new traceur.Compiler();
        var options = System.traceurOptions || {};
        options.modules = 'instantiate';
        var output = compiler.stringToTree({content: load.source, options: options});
        checkForErrors(output);

        output = compiler.treeToTree(output);
        checkForErrors(output);

        output = compiler.treeToString(output);
        checkForErrors(output);
        var source = output.js;
        var sourceMap = output.generatedSourceMap;

        if (__global.btoa && sourceMap)
          source += '\n//# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(sourceMap))) + '\n';

        __eval(source, __global, load);
      }
    })();

    if (typeof exports === 'object')
      module.exports = Loader;

    __global.Reflect = __global.Reflect || {};
    __global.Reflect.Loader = __global.Reflect.Loader || Loader;
    __global.Reflect.global = __global.Reflect.global || __global;
    __global.LoaderPolyfill = Loader;

  })();

  // Define our eval outside of the scope of any other reference defined in this
  // file to avoid adding those references to the evaluation scope.
  var __curRegister;
  function __eval(__source, __global, load) {
    // Hijack System.register to set declare function
    __curRegister = System.register;
    System.register = function(name, deps, declare) {
      if (typeof name != 'string') {
        declare = deps;
        deps = name;
      }
      // store the registered declaration as load.declare
      // store the deps as load.deps
      load.declare = declare;
      load.depsList = deps;
    }
    try {
      eval('(function() { var __moduleName = "' + (load.name || '').replace('"', '\"') + '"; ' + __source + ' \n }).call(__global);');
    }
    catch(e) {
      if (e.name == 'SyntaxError' || e.name == 'TypeError')
        e.message = 'Evaluating ' + (load.name || load.address) + '\n\t' + e.message;
      throw e;
    }

    System.register = __curRegister;
  }

})(typeof global !== 'undefined' ? global : this);

/*
*********************************************************************************************

  System Loader Implementation

    - Implemented to https://github.com/jorendorff/js-loaders/blob/master/browser-loader.js

    - <script type="module"> supported

*********************************************************************************************
*/

(function (global) {

  var isBrowser = typeof window != 'undefined';
  var Loader = global.Reflect && global.Reflect.Loader || require('./loader');
  var Promise = global.Promise || require('when/es6-shim/Promise');

  // Helpers
  // Absolute URL parsing, from https://gist.github.com/Yaffle/1088850
  function parseURI(url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    return (m ? {
      href     : m[0] || '',
      protocol : m[1] || '',
      authority: m[2] || '',
      host     : m[3] || '',
      hostname : m[4] || '',
      port     : m[5] || '',
      pathname : m[6] || '',
      search   : m[7] || '',
      hash     : m[8] || ''
    } : null);
  }
  function removeDotSegments(input) {
    var output = [];
    input.replace(/^(\.\.?(\/|$))+/, '')
      .replace(/\/(\.(\/|$))+/g, '/')
      .replace(/\/\.\.$/, '/../')
      .replace(/\/?[^\/]*/g, function (p) {
        if (p === '/..')
          output.pop();
        else
          output.push(p);
    });
    return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
  }
  function toAbsoluteURL(base, href) {

    href = parseURI(href || '');
    base = parseURI(base || '');

    return !href || !base ? null : (href.protocol || base.protocol) +
      (href.protocol || href.authority ? href.authority : base.authority) +
      removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
      (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
      href.hash;
  }

  var fetchTextFromURL;
  if (isBrowser) {
    fetchTextFromURL = function(url, fulfill, reject) {
      var xhr = new XMLHttpRequest();
      var sameDomain = true;
      if (!('withCredentials' in xhr)) {
        // check if same domain
        var domainCheck = /^(\w+:)?\/\/([^\/]+)/.exec(url);
        if (domainCheck) {
          sameDomain = domainCheck[2] === window.location.host;
          if (domainCheck[1])
            sameDomain &= domainCheck[1] === window.location.protocol;
        }
      }
      if (!sameDomain) {
        xhr = new XDomainRequest();
        xhr.onload = load;
        xhr.onerror = error;
        xhr.ontimeout = error;
      }
      function load() {
        fulfill(xhr.responseText);
      }
      function error() {
        reject(xhr.statusText + ': ' + url || 'XHR error');
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || (xhr.status == 0 && xhr.responseText)) {
            load();
          } else {
            error();
          }
        }
      };
      xhr.open("GET", url, true);
      xhr.send(null);
    }
  }
  else {
    var fs;
    fetchTextFromURL = function(url, fulfill, reject) {
      fs = fs || require('fs');
      return fs.readFile(url, function(err, data) {
        if (err)
          return reject(err);
        else
          fulfill(data + '');
      });
    }
  }

  var System = new Loader({
    global: isBrowser ? window : global,
    strict: true,
    normalize: function(name, parentName, parentAddress) {
      if (typeof name != 'string')
        throw new TypeError('Module name must be a string');

      var segments = name.split('/');

      if (segments.length == 0)
        throw new TypeError('No module name provided');

      // current segment
      var i = 0;
      // is the module name relative
      var rel = false;
      // number of backtracking segments
      var dotdots = 0;
      if (segments[0] == '.') {
        i++;
        if (i == segments.length)
          throw new TypeError('Illegal module name "' + name + '"');
        rel = true;
      }
      else {
        while (segments[i] == '..') {
          i++;
          if (i == segments.length)
            throw new TypeError('Illegal module name "' + name + '"');
        }
        if (i)
          rel = true;
        dotdots = i;
      }

      for (var j = i; j < segments.length; j++) {
        var segment = segments[j];
        if (segment == '' || segment == '.' || segment == '..')
          throw new TypeError('Illegal module name "' + name + '"');
      }

      if (!rel)
        return name;

      // build the full module name
      var normalizedParts = [];
      var parentParts = (parentName || '').split('/');
      var normalizedLen = parentParts.length - 1 - dotdots;

      normalizedParts = normalizedParts.concat(parentParts.splice(0, parentParts.length - 1 - dotdots));
      normalizedParts = normalizedParts.concat(segments.splice(i, segments.length - i));

      return normalizedParts.join('/');
    },
    locate: function(load) {
      var name = load.name;

      // NB no specification provided for System.paths, used ideas discussed in https://github.com/jorendorff/js-loaders/issues/25

      // most specific (longest) match wins
      var pathMatch = '', wildcard;

      // check to see if we have a paths entry
      for (var p in this.paths) {
        var pathParts = p.split('*');
        if (pathParts.length > 2)
          throw new TypeError('Only one wildcard in a path is permitted');

        // exact path match
        if (pathParts.length == 1) {
          if (name == p && p.length > pathMatch.length) {
            pathMatch = p;
            break;
          }
        }

        // wildcard path match
        else {
          if (name.substr(0, pathParts[0].length) == pathParts[0] && name.substr(name.length - pathParts[1].length) == pathParts[1]) {
            pathMatch = p;
            wildcard = name.substr(pathParts[0].length, name.length - pathParts[1].length - pathParts[0].length);
          }
        }
      }

      var outPath = this.paths[pathMatch];
      if (wildcard)
        outPath = outPath.replace('*', wildcard);

      return toAbsoluteURL(this.baseURL, outPath);
    },
    fetch: function(load) {
      var self = this;
      return new Promise(function(resolve, reject) {
        fetchTextFromURL(toAbsoluteURL(self.baseURL, load.address), function(source) {
          resolve(source);
        }, reject);
      });
    },
  });

  if (isBrowser) {
    var href = window.location.href.split('#')[0].split('?')[0];
    System.baseURL = href.substring(0, href.lastIndexOf('/') + 1);
  }
  else {
    System.baseURL = process.cwd() + '/';
  }
  System.paths = { '*': '*.js' };

  // <script type="module"> support
  // allow a data-init function callback once loaded
  if (isBrowser) {
    var curScript = document.getElementsByTagName('script');
    curScript = curScript[curScript.length - 1];

    function completed() {
      document.removeEventListener( "DOMContentLoaded", completed, false );
      window.removeEventListener( "load", completed, false );
      ready();
    }

    function ready() {
      var scripts = document.getElementsByTagName('script');

      for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i];
        if (script.type == 'module') {
          var source = script.innerHTML;
          System.module(source)['catch'](function(err) { setTimeout(function() { throw err; }); });
        }
      }
    }

    // DOM ready, taken from https://github.com/jquery/jquery/blob/master/src/core/ready.js#L63
    if (document.readyState === 'complete') {
      setTimeout(ready);
    }
    else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', completed, false);
      window.addEventListener('load', completed, false);
    }

    // run the data-init function on the script tag
    if (curScript.getAttribute('data-init'))
      window[curScript.getAttribute('data-init')]();
  }

  if (typeof exports === 'object')
    module.exports = System;

  global.System = System;

})(typeof global !== 'undefined' ? global : this);
