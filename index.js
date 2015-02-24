'use strict';

var extend = require('extend-shallow');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

module.exports = function renderPlugin (app, config) {
  config = extend({prefix: '__task__', name: 'task name'});

  return function render (options, locals) {
    var session = app.session;
    var opts = extend({}, app.options, options);

    locals = locals || {};
    locals.options = extend({}, locals.options, opts);

    // get the custom template type created for this task
    var type = 'page';
    var taskName = session.get(config.name);
    var renameFn = function (fp) {
      return path.basename(fp, path.extname(fp));
    };

    var renameKey = app.option('renameKey') || renameFn;

    // create a custom template type based on the task name to keep
    // source templates separate.
    if (taskName) {
      type = config.prefix + taskName;
    }

    var plural = app.collection[type];
    var templates = plural ? [plural] : [];

    var pushed = session.get('renderables');
    if (pushed) {
      templates = templates.concat(pushed);
    }
    templates.reverse();

    return through.obj(function(file, encoding, cb) {
      if (file.isNull()) {
        this.push(file);
        return cb();
      }

      if (file.isStream()) {
        this.emit('error', new gutil.PluginError('template-render', 'Streaming is not supported.'));
        return cb();
      }

      try {
        var stream = this;
        var key = renameKey(file.path);
        var template = app.findRenderable(key, templates);
        template = template || app.views.pages[key];

        if (!template) {
          stream.push(file);
          return cb();
        }

        // update the template information with any changes that might not have
        // been updated by reference while running through the stream
        template.content = file.contents.toString();
        if (file.path !== template.path) {
          template.path = file.path;
        }

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
          if (file.path !== template.path) {
            file.path = template.path;
          }
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
