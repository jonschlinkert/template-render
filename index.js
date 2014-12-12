/*!
 * template-render <https://github.com/assemble/template-render>
 *
 * Copyright (c) 2014 Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies.
 */

var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');
var _ = require('lodash');

/**
 * Template renderer plugin used to render templates passed through the stream.
 *
 * ```js
 * var app = require('assemble');
 * var renderPlugin = require('template-render');
 * ```
 *
 * @name  renderPlugin
 * @api public
 */

module.exports = function renderPlugin (app) {

  /**
   * Create a stream that will render files with template.
   *
   * ```js
   * var render = renderPlugin(app);
   * app.task('build-posts', function () {
   *   app.src('*.hbs')
   *     .pipe(render());
   * });
   * ```
   *
   * @param  {Object} `options` Additional options to use.
   * @param  {Object} `locals` Additional locals to pass to the renderer.
   * @return {Stream} Stream compatible with Assemble, Vinyl, or Gulp pipelines
   * @name  render
   * @api public
   */

  return function render (options, locals) {

    var session = app.session;
    var opts = _.extend({}, app.options, options);
    locals = locals || {};
    locals.options = _.extend({}, locals.options, opts);

    // get the custom template type created for this task
    var taskName = session.get('task name');
    var templateType = 'page';
    var buildKey = app.option('renameKey') || function (fp) {
      return path.basename(fp, path.extname(fp));
    };

    // create a custom template type based on the task name to keep
    // source templates separate.
    if (taskName) {
      templateType = '__task__' + taskName;
      buildKey = function (fp) {
        return path.basename(fp, path.extname(fp));
      };
    }

    var plural = app.collection[templateType];
    var renderables = session.get('renderables') || [];
    renderables = renderables.concat([plural]).filter(Boolean);

    /**
     * Actual render stream used in a pipeline.
     *
     * @param  {Object} `file` Vinyl File Object from the current stream.
     * @param  {Object} `enc` `file.contents` encoding.
     * @param  {Function} `cb` Callback to indicate when the transform function is complete.
     */

    return through.obj(function(file, encoding, cb) {
      if (file.isNull()) {
        this.push(file);
        return cb();
      }

      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('template-plugin:render', 'Streaming is not supported.'));
        return cb();
      }

      try {
        // find the template associated with the vinyl file
        var stream = this;
        var key = buildKey(file.path);
        var template = renderables.map(function(type) {
          return app.views[type][key];
        }).filter(Boolean);

        template = template.length === 0 ? app.views.pages[key] : template[0];
        if (!template) {
          stream.push(file);
          return cb();
        }

        // update the template information with any changes that might not have
        // been updated by reference while running through the stream
        template.content = file.contents.toString();

        // render the template template with the given locals
        template.render(locals, function(err, content) {
          if (err) {
            stream.emit('error', new gutil.PluginError('template-render', err));
            cb(err);
            return;
          }

          // update the vinyl file with the rendered contents
          // and push back into the stream.
          file.contents = new Buffer(content);
          stream.push(file);
          cb();
        });

      } catch (err) {
        this.emit('error', new gutil.PluginError('template-render', err));
        return cb();
      }
    });
  };
};
