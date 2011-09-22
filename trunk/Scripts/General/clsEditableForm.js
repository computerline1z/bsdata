(function() {
  this.clsEditableForm = (function() {
    var Action, CallBackAfterSave, ClickedRow, Config, GenNameWhat, RenderHTML, Row, id, oData, oTable;
    id = 0;
    oData = {};
    Config = {};
    GenNameWhat = "";
    Row = {};
    oData = {};
    Action = {};
    RenderHTML = 0;
    ClickedRow = 0;
    oTable = oTable ? oTable : 0;
    CallBackAfterSave = 0;
    function clsEditableForm(opt) {
      var AddToTitle, Title, ix, rows, _i, _len, _ref;
      $("body").css("cursor", "wait");
      id = opt.aRowData != null ? opt.aRowData[0] : 0;
      oTable = opt.oTable != null ? opt.oTable : 0;
      oData = oDATA.Get(opt.objData);
      Action = opt.Action;
      CallBackAfterSave = opt.CallBackAfterSave ? opt.CallBackAfterSave : 0;
      if (oData == null) {
        alert("Neradau objekto " + opt.objData + " clsEditableForm klaseje");
      }
      Config = oData.Config;
      GenNameWhat = Config.Msg.GenNameWhat;
      Row = {
        Cols: oData.Cols,
        Grid: oData.Grid,
        Data: opt.aRowData
      };
      ClickedRow = opt.ClickedRow ? opt.ClickedRow : 0;
      if (id && !(Row.Data != null)) {
        _ref = oData.Data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          rows = _ref[_i];
          if (rows[0] === id) {
            Row.Data = rows;
            break;
          }
        }
      }
      Title = Action === "Add" ? Config.Msg.AddNew : Config.Msg.Edit;
      if (Config.Msg.AddToTitle) {
        AddToTitle = (function() {
          var _j, _len2, _ref2, _results;
          _ref2 = Config.Msg.AddToTitle;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            ix = _ref2[_j];
            _results.push(Row.Data[ix]);
          }
          return _results;
        })();
        Title += " " + AddToTitle.join(' ');
      }
      this.fnLoadEditableForm(Title);
      $("body").css("cursor", "default");
    }
    clsEditableForm.prototype.fnLoadEditableForm = function(Title) {
      var FormTitle, dlgEditableOpt, form, _html;
      FormTitle = id ? Config.Msg.Edit : Config.Msg.AddNew;
      dlgEditableOpt = {
        autoOpen: false,
        minWidth: '45em',
        minHeight: '40em',
        width: '60em',
        modal: true,
        title: Title,
        draggable: true,
        buttons: {
          "Išsaugoti pakeitimus": function() {
            var DataToSave;
            DataToSave = oGLOBAL.ValidateForm($('#divEditableForm'));
            if (DataToSave) {
              return oGLOBAL.UpdateServer({
                Action: Action,
                DataToSave: DataToSave,
                CallBack: {
                  Success: function(resp, updData) {
                    var Found, RowI, RowLength, TextId, ix, obj, updI, updLength;
                    RowLength = Row.Cols.length;
                    RowI = 0;
                    updLength = updData.DataToSave.Fields.length;
                    if (Action === "Add") {
                      Row.Data = new Array(RowLength);
                      Row.Data[0] = resp.ResponseMsg.ID;
                    }
                    while (RowI < RowLength - 1) {
                      updI = 0;
                      Found = 0;
                      RowI++;
                      while (updI < updLength) {
                        if (Row.Cols[RowI].FName === updData.DataToSave.Fields[updI]) {
                          Row.Data[RowI] = updData.DataToSave.Data[updI];
                          Found = 1;
                          break;
                        }
                        updI++;
                      }
                      if (!Found && Action === "Add") {
                        if (Row.Cols[RowI].Default != null) {
                          Row.Data[RowI] = Row.Cols[RowI].Default === "Today" ? fnGetTodayDateString() : Row.Cols[RowI].Default;
                        } else {
                          Row.Data[RowI] = "";
                        }
                      }
                      if (Row.Data[RowI] === null) {
                        Row.Data[RowI] = "";
                      }
                    }
                    RowI = 0;
                    while (RowI < RowLength - 1) {
                      RowI++;
                      if (Row.Cols[RowI].IdInMe) {
                        ix = Row.Cols[RowI].IdInMe;
                        id = Row.Data[ix];
                        obj = Row.Cols[ix].List.Source;
                        TextId = Row.Cols[ix].List.iText;
                        Row.Data[RowI] = oDATA.GetStringFromIndexes(id, obj, TextId);
                      }
                    }
                    oDATA.UpdateRow(Row.Data, oData, Action);
                    if (CallBackAfterSave) {
                      CallBackAfterSave(Row.Data);
                    }
                    return $("#divDialogForm").dialog("close");
                  }
                },
                Msg: "",
                BlockCtrl: $('#divEditableForm')
              });
            } else if (DataToSave === 0) {
              return $("#divDialogForm").dialog("close");
            }
          },
          "Ištrinti": function() {
            return $(this).dialog("close");
          },
          "Atšaukti": function() {
            return $(this).dialog("close");
          }
        },
        close: function() {
          return $(this).remove();
        },
        dragStart: function() {
          return $("div.validity-modal-msg").remove();
        }
      };
      _html = RenderHTML ? RenderHTML : this.fnGenerateHTML(Row, id);
      $("#dialog:ui-dialog").dialog("destroy");
      $("<div id='divDialogForm'></div>").html(_html).dialog(dlgEditableOpt).dialog('open');
      oCONTROLS.UpdatableForm($("#divEditableForm"));
      form = $("#divDialogForm").parent();
      form.find("button:contains('Išsaugoti')").attr("disabled", "disabled").addClass("ui-state-disabled");
      form.find("input").bind('click keyup', function() {
        return form.find("button:contains('Išsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled");
      });
      form.find("div.ExtendIt button").click(function() {
        return form.find("button:contains('Išsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled");
      });
      return form.find("button:contains('Ištrinti')").css("display", "none");
    };
    clsEditableForm.prototype.fnGenerateHTML = function(Row, id) {
      var Append, Head, Length, html, i, t, val;
      Length = Row.Cols.length;
      i = 0;
      html = "";
      Head = "";
      while (i < Length) {
        Append = "";
        if (Row.Grid.aoColumns[i].sTitle != null) {
          if ((Row.Data[i] != null) && Row.Data[i]) {
            t = (Row.Cols[i].Type ? Row.Cols[i].Type : "");
            val = (t === "String" || t === "Email") || t.substring(0, 4) === "Date" ? '"' + Row.Data[i].replace(/"/g, "\\u0027") + '"' : Row.Data[i];
          } else {
            val = "\"\"";
          }
          Append += "\"Value\":" + val + ",";
          html += "<div class='ExtendIt' data-ctrl='{" + Append + "\"Field\":\"" + Row.Cols[i].FName + "\",\"classes\":\"UpdateField\",\"labelType\":\"Left\"}'></div>";
        }
        i++;
      }
      if (id != null) {
        Head = '"NewRec":0,"id":' + id + ',';
      } else {
        Head = '"NewRec":1,';
      }
      Head += '"Source":"' + (Config.Source ? Config.Source : Config.tblUpdate) + '","tblUpdate":"' + Config.tblUpdate + '"';
      return "<div id='divEditableForm' class='inputform' style='margin:0 2em;' data-ctrl='{" + Head + "}'>" + html + "</div>";
    };
    return clsEditableForm;
  })();
}).call(this);
