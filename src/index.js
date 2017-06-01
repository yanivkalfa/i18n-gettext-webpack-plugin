import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import NullFactory from 'webpack/lib/NullFactory';
import DefinePlugin from 'webpack/DefinePlugin';
import GetText from 'node-gettext';
import MissingLocalizationError from './MissingLocalizationError';
import getTextHandlers from './getTextHandlerFunctions';


/**
 *
 * @param {string} local e.g: sv-SE
 * @param {string} the domain you want to use
 * @param {object} object of all the translations
 * @options {object} an option object
 * @constructor
 */
class I18nGetTextPlugin {
  constructor(local, domain, translation, options) {

    if (!local) {
      throw new Error('Missing parameter: local');
    }

    if (!translation) {
      throw new Error('Missing parameter: local');
    }

    this.options = options || {};
    this.failOnMissing = !!this.options.failOnMissing;
    this.hideMessage = this.options.hideMessage || false;

    this.GetText = new GetText();
    this.GetText.addTranslations(local, domain, translation);
    this.GetText.setLocale(local);
  }

  apply(compiler) {
    const { GetText, failOnMissing, hideMessage } = this;


    compiler.plugin('make', function(compilation, callback) {
      var childCompiler = compilation.createChildCompiler('I18nGetTextPluginExpose');
      childCompiler.apply(new DefinePlugin({
        ngettext: function(singular , plural, quantity) {
          return quantity == 1 ? singular : plural;
        }
      }));
      childCompiler.runAsChild(callback);
    });

    compiler.plugin('compilation', (compilation, params) => {
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
    });

    compiler.plugin('compilation', (compilation, data) => {
      data.normalModuleFactory.plugin('parser', (parser, options) => {
        getTextHandlers.forEach((handler) => {
          parser.plugin(`call ${handler.name}`, function I18nGetTextPluginHandler(expr) {
            let params = expr.arguments.map((arg) => {
              return this.evaluateExpression(arg);
            });
            let result = handler.handle(params, GetText);
            let defaultValue;
            if (typeof result === 'undefined') {
              let error = this.state.module[__dirname];
              if (!error) {
                error = new MissingLocalizationError(this.state.module, undefined, defaultValue);
                this.state.module[__dirname] = error;

                if (failOnMissing) {
                  this.state.module.errors.push(error);
                } else if (!hideMessage) {
                  this.state.module.warnings.push(error);
                }
              }
              result = defaultValue;
            }

            const dep = new ConstDependency(JSON.stringify(result), expr.range);
            dep.loc = expr.loc;
            this.state.current.addDependency(dep);
            return true;
          });
        });
      });
    });
  }
}

export default I18nGetTextPlugin;
