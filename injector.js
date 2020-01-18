const dotenv = require('dotenv')
const colors = require('colors')
const parseFunction = require('parse-function')()
dotenv.config()
const DEBUG_ENABLED = false
const scriptDir = `${process.env.ROOT_DIR}/services/`

const DEBUG = (msg) => {
  if (DEBUG_ENABLED) {
    console.log(msg)
  }
}

class Injector {

  constructor(mainClass) {
    if (!mainClass) {
      throw new Error('You must provide a class name!')
    }
    // THIS MUST BE A SINGLETON
    if (!!Injector.instance) {
      return Injector.instance.getInjected(mainClass)
    }
    this.services = [] // my controllers (classes)
    this.fulfilled = [] // modules with its dependencies

    Injector.instance = this
    DEBUG('Instantiating Injector =)'.bgGreen.black)
    return this.resolve(mainClass)
  }

  getInjected(mainClass) {
    if (!this.fulfilled[mainClass]) {
      return this.resolve(mainClass)
    } else {
      return this.fulfilled[mainClass]
    }
  }

  resolve(mainClass) {
    // Return if module (service) is already present and injected
    if (this.fulfilled.indexOf(mainClass) !== -1) {
      return this.fulfilled[mainClass]
    } else {
      const requiredInstances = this.loadRequired(mainClass)
      let service
      // LOAD MAIN MODULE
      const scriptFile = require(`${scriptDir}${mainClass}.js`)
      // INSTANTIATE
      if (this.isClass(scriptFile)) {
        service = new scriptFile(...requiredInstances)
      } else {
        service = scriptFile(...requiredInstances)
      }
      this.fulfilled[mainClass] = service
      return service
    }
  }

  isClass(func) {
    return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func))
  }

  loadRequired(mainClass) {
    let requiredInstances = []
    const required = this.extractRequired(mainClass)
    DEBUG('required:')
    DEBUG(required)
    required.forEach((className) => {
      this.load(className)
      requiredInstances.push(this.services[className])
    })
    return requiredInstances
  }

  extractRequired(mainClass) {
    // Load mainClass (require)
    DEBUG(`LOADING ${scriptDir}${mainClass}.js`)
    let scriptBody = require(`${scriptDir}${mainClass}.js`)
    // Check dependencies
    let requirements
    if (scriptBody.toString().indexOf('class') === 0) {
      const regex = /constructor\s*\(([^)]+)\)/m
      const captured = regex.exec(scriptBody.toString())
      if (captured === null) {
        requirements = []
      } else {
        requirements = captured[1].replace(/\s+/, '').split(',')
      }
    } else {
      requirements = parseFunction.parse(scriptBody).args
    }
    return requirements
  }

  load(className) {
    const scriptFile = `${scriptDir}${className}.js`
    // Load dependencies (if not cached)
    if (this.services[className] !== undefined) {
      // Already loaded.
      DEBUG(`Already cached: ${className}`.cyan)
    } else {
      DEBUG(`Loading: ${className}`.yellow)
      let m
      try {
        m = require(scriptFile)
        // Save dependencies and injected service in cache
        if (this.isClass(m)) {
          this.services[className] = new m()
        } else {
          const requiredInstances = this.loadRequired(className)
          this.services[className] = m(...requiredInstances)
        }
      } catch (err) {
        DEBUG(err)
        DEBUG(`Cannot load module ${scriptFile}`.bgRed.black)
      }
    }
  }
}

module.exports = Injector