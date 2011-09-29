(function() {
  var $;
  $ = jQuery;
  $.fn.PrepareForm = function(data) {
    var fnGetScript, matched, self, _i, _len, _ref;
    self = $.fn.PrepareForm;
    if ($(this).length > 1) {
      alert("Daugiau nei vienas objektas!");
    }
    _ref = $(this).find("*[data-Plugin]");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      matched = _ref[_i];
      setupPlugin(matched);
    }
    ({
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
    });
    return fnGetScript = function(Script, Data) {
      if (Data) {
        this.MyProxy.In = Data;
      }
      return $.ajax({
        url: Script.File,
        type: 'GET',
        dataType: 'text',
        success: function(d, textStatus, jqXHR) {
          return eval(d);
        }
      });
    };
  };
}).call(this);
