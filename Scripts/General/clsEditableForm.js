(function() {
  this.clsEditableForm = (function() {
    var Action, CallBackAfterSave, ClickedRow, Config, GenNameWhat, RenderHTML, Row, id, oData, oTable, op;
    id = 0;
    oData = {};
    Config = {};
    GenNameWhat = "";
    Row = {};
    oData = {};
    Action = {};
    RenderHTML = 0;
    op = {};
    ClickedRow = 0;
    oTable = oTable ? oTable : 0;
    CallBackAfterSave = 0;
    function clsEditableForm(opt) {
      var AddToTitle, Title, ix, rows, _i, _len, _ref;
      $("body").css("cursor", "wait");
      id = opt.aRowData != null ? opt.aRowData[0] : 0;
      op = opt;
      if (!op.DialogFormId) {
        op.DialogFormId = "divDialogForm";
      }
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
      if (opt.Title) {
        Title = opt.Title;
      } else {
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
                    var Found, RowI, RowLength, TextId, f, ix, obj, updI, updLength;
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
                          if (Row.Cols[RowI].Default === "Today") {
                            Row.Data[RowI] = fnGetTodayDateString();
                          } else if (Row.Cols[RowI].Default === "UserName") {
                            Row.Data[RowI] = UserData.Name();
                          } else if (Row.Cols[RowI].Default === "UserId") {
                            Row.Data[RowI] = UserData.Id();
                          } else {
                            Row.Data[RowI] = Row.Cols[RowI].Default;
                          }
                        } else if (Row.Cols[RowI].UpdateField) {
                          f = Row.Cols[RowI].UpdateField;
                          Row.Data[RowI] = updData.DataToSave[f];
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
                    return $("#" + op.DialogFormId).dialog("close");
                  }
                },
                Msg: "",
                BlockCtrl: $('#divEditableForm')
              });
            } else if (DataToSave === 0) {
              return $("#" + op.DialogFormId).dialog("close");
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
      _html = op.RenderHTML ? op.RenderHTML : this.fnGenerateHTML(Row, id);
      $("#dialog:ui-dialog").dialog("destroy");
      $("<div id='" + op.DialogFormId + "'></div>").html(_html).dialog(dlgEditableOpt).dialog('open');
      oCONTROLS.UpdatableForm($("#divEditableForm"));
      form = $("#" + op.DialogFormId).parent();
      form.find("button:contains('Išsaugoti')").attr("disabled", "disabled").addClass("ui-state-disabled");
      form.find("input, textarea").bind('click keyup', function() {
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
  this.clsEditInPlaceForm = (function() {
    var DataToSave, fnLoadForm, oTablel, opt;
    opt = {};
    DataToSave = {
      Fields: [],
      Data: [],
      id: 0,
      DataTable: ""
    };
    oTablel = null;
    function clsEditInPlaceForm(options) {
      $("body").addClass("wait");
      opt = options;
      $.post(opt.url, opt.postPars, function(jsRes) {
        var Name, oSCRIPT, obj;
        for (Name in jsRes) {
          obj = jsRes[Name];
          if (Name !== "Render" && Name !== "Script") {
            oDATA.Set(Name, jsRes[Name]);
          }
        }
        if (jsRes.Script) {
          if (jsRes.Script.File) {
            $.getScript(jsRes.Script.File);
          }
          if (jsRes.Script.oSCRIPT) {
            oSCRIPT = jsRes.Script.oSCRIPT;
          }
        }
        if (jsRes.Render) {
          fnLoadForm(opt.formTitle, jsRes.Render, opt.tblProp, opt.EditableFormId, opt.Buttons);
        } else {
          alert("clsEditInPlaceForm nera Render objekto!");
        }
        return $("body").removeClass("wait");
      });
    }
    fnLoadForm = function(formTitle, htmlToRender, tblProp, EditableFormId, Buttons) {
      var dlgFormOpt, oTable;
      oTable = null;
      Buttons = Buttons != null ? Buttons : {};
      $.extend(Buttons, {
        "Uždaryti": function() {
          if (opt.fnFieldsUpdatedCallBack && DataToSave.Data) {
            opt.fnFieldsUpdatedCallBack(DataToSave);
          }
          return $(this).remove();
        }
      });
      dlgFormOpt = {
        autoOpen: false,
        position: ['center', 50],
        resize: 'auto',
        minWidth: '45em',
        width: '65em',
        modal: true,
        title: formTitle,
        draggable: true,
        buttons: Buttons,
        close: function() {
          if (opt.fnFieldsUpdatedCallBack && DataToSave.Data) {
            opt.fnFieldsUpdatedCallBack(DataToSave);
          }
          return $(this).remove();
        },
        dragStart: function() {
          return $("div.validity-modal-msg").remove();
        }
      };
      $("<div id='divDialogForm' style='overflow:auto'></div>").html(htmlToRender).ModifyDoom({
        tblProp: tblProp,
        EditableFormId: EditableFormId
      }, DataToSave).dialog(dlgFormOpt).dialog('open').css("height", "auto");
      if (opt.Grid) {
        return oTable = $('#' + opt.Grid.DoomId).clsGrid(opt.Grid.Opt, opt.Grid.Source);
      }
    };
    return clsEditInPlaceForm;
  })();
  $.fn.ModifyDoom = function(opt, DataToSave) {
    var frmOpt, objProp, t;
    t = this.find("#" + opt.EditableFormId);
    frmOpt = eval("(" + (t.attr("data-ctrl")) + ")");
    DataToSave.id = frmOpt.id;
    DataToSave.DataTable = frmOpt.tblUpdate;
    objProp = oDATA.Get(opt.tblProp);
    t.find('div.EditInPlace, span.EditInPlace').each(function() {
      var OldVal, del, eOpt, editOpt, el, fnFinishedEdit, ix;
      el = $(this);
      OldVal = el.html();
      eOpt = eval("(" + (el.attr("data-ctrl")) + ")");
      ix = objProp.Cols.FNameIndex(eOpt.Field);
      fnFinishedEdit = function(NewVal, NewText) {
        el.html('<img src="/Content/images/ajax-loader.gif" alt=' + NewVal + '>');
        return $.post("/Update/editInPlace", {
          id: frmOpt.id,
          tbl: frmOpt.tblUpdate,
          update_value: NewVal,
          field: eOpt.Field,
          show_value: NewText
        }, function(resp, a, b) {
          if (resp.ErrorMsg) {
            Alert(resp.ErrorMsg, "Klaida išsaugant duomenis");
            el.html(OldVal);
          } else {

          }
          el.html(resp.ResponseMsg);
          OldVal = resp.ResponseMsg;
          DataToSave.Data.push(resp.ResponseMsg);
          return DataToSave.Fields.push(eOpt.Field);
        });
      };
      del = {
        didOpenEditInPlace: function($Node, aSettings) {
          var w;
          $Node.attr("width", $Node.width());
          w = $Node.width() < 200 ? 200 : $Node.width();
          $Node.find('textarea').width(w);
          return $Node.find('input').width(w);
        }
      };
      if (objProp.Cols[ix].List) {
        del.shouldOpenEditInPlace = function($Node, aSettings, trigEvent) {
          var eHTML;
          if ($Node.find("input").length > 0) {
            return false;
          }
          eHTML = oCONTROLS.txt({
            "data_ctrl": JSON.stringify($.extend({}, objProp.Cols[ix].List, {
              FName: objProp.Cols[ix].FName
            })),
            "classes": "ui-widget-content ui-corner-all",
            "text": $Node.html()
          });
          $Node.html(eHTML).find('input').ComboBox({
            fnValueChanged: function(NewVal, NewText) {
              return fnFinishedEdit(NewVal, NewText);
            }
          }).focus().bind("blur", function(e) {
            var interval;
            return interval = setInterval(function() {
              var atr;
              atr = $("ul.ui-autocomplete").css("display");
              if (atr === "none" || atr === void 0) {
                el.html(OldVal);
                return clearInterval(interval);
              }
            }, 3000);
          });
          return false;
        };
      } else if (eOpt.Plugin) {
        del.shouldOpenEditInPlace = function($Node, aSettings, trigEvent) {
          var Name, Prop, input, _ref;
          if ($Node.find("input").length > 0) {
            return false;
          }
          $Node.html("<input type='text'></input>");
          input = $Node.find("input");
          input.val(OldVal);
          _ref = eOpt.Plugin;
          for (Name in _ref) {
            Prop = _ref[Name];
            if (Name === "datepicker") {
              $.extend(Prop, {
                onClose: function(dateText, inst) {
                  return fnFinishedEdit(dateText, null);
                }
              });
              input.attr("readonly", "readonly")[Name](Prop).focus();
            } else if (Name === "mask") {
              input[Name](Prop).focus().bind("blur", function(e) {
                var v;
                t = $(e.target);
                v = t.mask('value');
                if (v && v !== OldVal) {
                  return fnFinishedEdit(v, null);
                } else {
                  return $Node.empty().html(OldVal);
                }
              });
            }
          }
          return false;
        };
      }
      editOpt = {
        field_type: eOpt.field_type ? eOpt.field_type : objProp.Cols[ix].field_type,
        delegate: del,
        callback: function(idOfEditor, NewVal, OldVal, settingsPar, callbacks) {
          fnFinishedEdit(NewVal, null);
          return '<img src="/Content/images/ajax-loader.gif" alt=' + NewVal + '>';
        },
        delegate: del
      };
      return $(this).editInPlace(editOpt).qtip({
        position: {
          at: 'top center',
          my: 'bottom center'
        },
        content: objProp.Grid.aoColumns[ix].sTitle
      });
    });
    return this;
  };
}).call(this);
