import fs from 'fs';
import ConstDependency from 'webpack/lib/dependencies/ConstDependency';
import NullFactory from 'webpack/lib/NullFactory';
import webpack from 'webpack';
import GetText from 'node-gettext';
import MissingLocalizationError from './MissingLocalizationError';
import getTextHandlers from './getTextHandlerFunctions';
import gettextParser from 'gettext-parser';


/**
 *
 * @param {string} local e.g: sv-SE
 * @param {string} the domain you want to use
 * @param {file|string} either a .po file or full path to the file
 * @options {object} an option object
 * @constructor
 */
class I18nGetTextPlugin {
  constructor(local, domain, translationFile, options) {

    if (!local) {
      throw new Error('Missing parameter: local');
    }

    if (!translationFile) {
      throw new Error('Missing parameter: local');
    }

    if (typeof translationFile === 'string') {
      if (!fs.existsSync(translationFile)){
        throw new Error('path supplied in translationFile is incorrect');
      }

      translationFile = fs.readFileSync(translationFile);
    }

    if (typeof translationFile !== 'object') {
      throw new Error('translationFile is not a file');
    }

    let translation = gettextParser.po.parse(translationFile);

    if (!translation) {
      throw new Error('Could not parse the file supplied.');
    }

    this.options = Object.assign(options || {
        failOnMissing: false,
        hideMessage: false
      }, options);

    domain = domain || 'messages';
    this.GetText = new GetText();
    this.GetText.addTranslations(local, domain, translation);
    this.GetText.setLocale(local);
  }

  apply(compiler) {
    const { GetText, options: { failOnMissing, hideMessage } } = this;

    compiler.plugin('make', function(compilation, callback) {
      var childCompiler = compilation.createChildCompiler('I18nGetTextPluginExpose');
      childCompiler.apply(new webpack.DefinePlugin({
        gtf: function ( format ) {
          for( var i=1; i < arguments.length; i++ ) {
            format = format.replace( /%s/, arguments[i] );
          }
          return format;
        }
      }));
      childCompiler.runAsChild(callback);
    });

    compiler.plugin('compilation', (compilation) => {
      compilation.dependencyFactories.set(ConstDependency, new NullFactory());
      compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());
    });

    getTextHandlers.forEach((handler) => {
      compiler.parser.plugin(`call ${handler.name}`, function I18nGetTextPluginHandler(expr) {
        let params = expr.arguments.map((arg) => {
          return arg.value;
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

        const dep = new ConstDependency(result, expr.range);
        dep.loc = expr.loc;
        this.state.current.addDependency(dep);
        return true;
      });
    });
  }
}

module.exports = I18nGetTextPlugin;


