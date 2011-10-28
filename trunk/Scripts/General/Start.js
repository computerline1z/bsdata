(function() {
  var Action, CallServer, Controller, Index, Start, fnSetNewData, jsResData;
  jsResData = {};
  Index = 0;
  Controller = $('#header div.subHeader a.highlight').data('controller');
  Action = "";
  $(function() {
    Start();
    return $('#side-bar li>a').first().trigger('click');
  });
  Start = function() {
    return $('#side-bar li>a').live('click', function(event) {
      var refresh, url;
      $('#side-bar a.highlight').removeClass('highlight');
      $(this).addClass('highlight');
      window.oGLOBAL.Action = $(this).data('action');
      if ($(this).data("opt") === "refresh") {
        refresh = true;
        $(this).data('opt', "ok");
      } else {
        refresh = false;
      }
      url = "/" + Controller + "/" + (Action = $(this).data('action'));
      if (jsResData[Action] && !refresh) {
        return fnSetNewData(jsResData[Action][Index]);
      } else {
        return CallServer(url, '');
      }
    });
  };
  CallServer = function(url, Par, el) {
    if (el == null) {
      el = $('#main-copy');
    }
    el.parent().block();
    return $.ajax({
      url: url,
      type: 'POST',
      data: Par,
      dataType: 'json',
      error: function(jqXHR, textStatus, errorThrown) {
        el.html("<center><h2>ši dalis dar nebaigta(" + Action + ")</h2><img src='/Content/images/UnderConstruction.gif' alt=''/></center>");
        return el.parent().unblock();
      },
      success: function(jsRes, textStatus, jqXHR) {
        fnSetNewData(jsRes, el);
        if (jsResData[Action]) {
          jsResData[Action].push(jsRes);
        } else {
          jsResData[Action] = [jsRes];
        }
        el.parent().unblock();
        return false;
      }
    });
  };
  fnSetNewData = function(jsRes, el) {
    var Name, obj;
    if (el == null) {
      el = $('#main-copy');
    }
    if (jsRes.Render) {
      el.empty().html(jsRes.Render);
    }
    for (Name in jsRes) {
      obj = jsRes[Name];
      if (Name !== "Render" && Name !== "Script") {
        this.oDATA.Set(Name, jsRes[Name]);
      }
    }
    if (Action === "Contracts_New") {
      return NewContract();
    } else if (Action === "Contracts_Unsigned" || Action === "Contracts_Valid" || Action === "Contracts_Expired") {
      if (jsRes.Script.oSCRIPT) {
        this.oSCRIPT = jsRes.Script.oSCRIPT;
      }
      return Contracts_Grid();
    } else if (Action === "MyEvents") {
      return Title_MyEvents();
    } else if (Action === "ClientsList") {
      return Clients_ClientsList_Grid();
    } else if (jsRes.Script) {
      if (jsRes.Script.File) {
        $.getScript(jsRes.Script.File);
      }
      if (jsRes.Script.oSCRIPT) {
        return this.oSCRIPT = jsRes.Script.oSCRIPT;
      }
    }
  };
  Array.prototype.remove = function(e) {
    var t, _ref;
    if ((t = this.indexOf(e)) > -1) {
      return ([].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref);
    }
  };
  this.oDATA = {
    Obj: {},
    Set: function(objData, oINST) {
      return this.Obj[objData] = oINST;
    },
    Get: function(objData) {
      return this.Obj[objData];
    },
    UpdateRow: function(Row, obj, Action) {
      var URow;
      if (Action === "Edit") {
        URow = this.GetRow(Row[0], obj);
        return URow = Row;
      } else if (Action === "Add") {
        return this.GetData(obj).push(Row);
      } else if (Action === "Delete") {
        return this.GetData(obj).remove(Row);
      }
    },
    GetRow: function(id, obj) {
      var Data, Length, i, _results;
      Data = this.GetData(obj);
      Length = Data.length - 1;
      i = -1;
      _results = [];
      while (i < Length) {
        i++;
        if (Data[i][0] === id) {
          return Data[i];
        }
      }
      return _results;
    },
    GetData: function(obj, Cols) {
      if (typeof obj === "string") {
        if (Cols) {
          return this.Obj[obj].Cols;
        } else {
          return this.Obj[obj].Data;
        }
      } else {
        if (Cols) {
          obj.Cols;
        } else {
          obj.Data;
        }
        return obj.Data;
      }
    },
    GetStringFromIndexes: function(id, obj, Indexes) {
      var Row;
      Row = this.GetRow(id, obj);
      return Row.MapArrToString(Indexes);
    },
    UpdateCell: function(obj, tblToUpdate, id, field, NewVal) {
      var ColNo, Row;
      ColNo = typeof field === "number" ? field : oDATA.Get(obj).Cols.FNameIndex(field);
      if (typeof field === "number" && tblToUpdate) {
        alert("Updatinimui reikalingas lauko pavadinimas");
      }
      Row = this.GetRow(id, obj);
      Row[ColNo] = NewVal;
      if (tblToUpdate) {
        return $.post("/Update/editInPlace", {
          id: id,
          tbl: tblToUpdate,
          update_value: NewVal,
          field: field
        });
      }
    },
    GetNewData: function(DataToSave, oTable, obj, ClickedRow) {
      var Cols, Row, RowI, aPos, i, len;
      Cols = this.GetData(obj, true);
      aPos = oTable.fnGetPosition(ClickedRow[0]);
      Row = oTable.fnGetData(aPos);
      i = 0;
      len = DataToSave.Fields.length;
      while (i < len) {
        RowI = Cols.FNameIndex(DataToSave.Fields[i]);
        if (RowI) {
          Row[RowI] = DataToSave.Data[i];
        }
        i++;
      }
      return Row;
    }
  };
}).call(this);
