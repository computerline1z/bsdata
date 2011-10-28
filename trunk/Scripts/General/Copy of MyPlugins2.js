(function() {
  var $;
  $ = jQuery;
  $.fn.ButtonStatuses = function(data) {
    var matched, opts, self, _i, _len, _ref;
    self = $.fn.ButtonStatuses;
    opts = $.extend({}, self.default_options, options);
    _ref = $(this).find("*[data-Plugin]");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      matched = _ref[_i];
      setupPlugin(matched);
    }
    return {
      setupPlugin: function(el) {
        var PluginObjects, opt, plugin, _results;
        PluginObjects = el.data("Plugin");
        _results = [];
        for (plugin in PluginObjects) {
          opt = PluginObjects[plugin];
          alert(plugin);
          _results.push(alert(opt));
        }
        return _results;
      }
    };
  };
  $.extend($.fn.ButtonStatuses, {
    default_options: {
      iconOpt: [
        {}, {
          primary: "img16-tag_red"
        }, {
          primary: "img16-tag_yellow"
        }, {
          primary: "img16-tag_green"
        }, {
          primary: "img16-tag_green",
          secondary: "img16-check"
        }
      ],
      tip: ["", "Nauja sutartis.<br /> Patvirtiniti sutartį?", "Patvirtinta sutartis.<br /> Įjungti paslaugas?", "Paslaugos įjungtos.<br /> Perkelti prie sutvarkytų?", "Suartis sutvarkyta. Jokių kitų veiksmų<br /> su šia sutartimi nereikia."]
    }
  });
}).call(this);
