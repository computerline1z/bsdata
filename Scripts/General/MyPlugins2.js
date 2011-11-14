(function() {
  var $;
  $ = jQuery;
  $.fn.ButtonStatuses = function(opts) {
    var btn, fnSetNewStatus, self;
    self = $.fn.ButtonStatuses;
    opts = $.extend({}, self.default_options, opts);
    btn = $(this).find("button").qtip({
      content: opts.tip[opts.StatusID],
      position: {
        at: 'top center',
        my: 'bottom center'
      }
    }).button({
      icons: opts.iconOpt[opts.StatusID]
    });
    if (opts.enableEvents) {
      return btn.click({
        btn: btn
      }, fnSetNewStatus = function(e) {
        if (opts.StatusID > 3) {
          Alert("Sutartis jau sutvarkyta", "Jeigu yra klausimų kreipkitės pas administracijį");
        } else {
          return Confirm(opts.question[opts.StatusID], "Spauskite 'Gerai' jei sutinkate, 'Atšaukti' jei ne", function(taip) {
            if (taip) {
              opts.StatusID++;
              e.data.btn.qtip({
                content: opts.tip[opts.StatusID],
                position: {
                  at: 'top center',
                  my: 'bottom center'
                }
              }).button({
                icons: opts.iconOpt[opts.StatusID]
              });
              return oDATA.UpdateCell(opts.tblSource, opts.tblUpdate, opts.ID, opts.FieldName, opts.StatusID);
            }
          });
        }
      });
    }
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
      tip: ["", "Nauja sutartis.<br /> Patvirtiniti sutartį?", "Patvirtinta sutartis.<br /> Įjungti paslaugas?", "Paslaugos įjungtos.<br /> Perkelti prie sutvarkytų?", "Suartis sutvarkyta. Jokių kitų veiksmų<br /> su šia sutartimi nereikia."],
      question: ["", "Ar patvirtinate sutarties įsigaliojimį?", "Ar įjungtos paslaugos pagal sutartį?", "Ar gauti visi dokumentai ir sutartis sutvarkyta?"],
      enableEvents: false
    }
  });
  this.clsUserData = (function() {
    var u;
    u = "";
    function clsUserData() {
      u = $("#header").data("user");
      $("#header").attr("data-user", "");
      if (typeof u !== "object") {
        alert("No user object");
      }
    }
    clsUserData.prototype.Id = function() {
      return u.Id;
    };
    clsUserData.prototype.Name = function() {
      return u.Name;
    };
    clsUserData.prototype.Email = function() {
      return u.Email;
    };
    return clsUserData;
  })();
  $(function() {
    return window.UserData = new clsUserData;
  });
}).call(this);
