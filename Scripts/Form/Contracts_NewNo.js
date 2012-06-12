(function() {

  this.My.Contracts_NewNo = function() {
    var Desc, EnableButon, IsEmpty, No, SaveDataHandler, TypeID, btn, fnSaveNewNo, form;
    form = $("#NewContractNo");
    oCONTROLS.UpdatableForm(form);
    No = $("#No");
    TypeID = $("#TypeID");
    Desc = $("#Description");
    IsEmpty = function() {
      if (TypeID.val() === "" || Desc.val() === "" || Desc.val() === Desc.data("ctrl").Tip || TypeID.val() === TypeID.data("ctrl").Tip) {
        return true;
      }
      return false;
    };
    form.find("input[title], label[title], textarea[title]").qtip({
      position: {
        at: 'top center',
        my: 'bottom center'
      }
    });
    fnSaveNewNo = function(NewNo) {
      var DataToSave;
      if (NewNo) No.val(NewNo);
      DataToSave = oGLOBAL.ValidateForm(form);
      if (DataToSave) {
        return oGLOBAL.UpdateServer({
          Action: "Add",
          DataToSave: DataToSave,
          CallBack: {
            Success: function(resp, updData) {
              var NewId;
              NewId = resp.ResponseMsg.ID ? resp.ResponseMsg.ID : 0;
              return $("#side-bar ul li a").data("opt", "refresh").filter("[data-action='Contracts_EditNew']").data("Par", {
                "NewId": NewId,
                "No": No.val() + "/" + NewId
              }).trigger("click");
            }
          },
          Msg: {
            Success: {
              Add: "Naujas numeris išsaugotas.\n Dabar galite pridėti sutarties duomenis ir prisegti susijusias bylas."
            },
            Error: {
              Add: "Nepavyko sukurti naujo numerio. Bandykite dar kartą"
            }
          },
          BlockCtrl: form
        });
      }
    };
    SaveDataHandler = function() {
      var Code, TID, optCompany, year;
      optCompany = $("input[name='optCompany']:checked").val();
      if (IsEmpty()) Alert("Pasirinkite tipą ir įveskite sutarties aprašymą");
      TID = TypeID.data("newval");
      Code = oDATA.Get("tblContractTypes").Data.findColsByID(TID, [1]);
      year = parseInt(/(\d+)/.exec(No.val())[1], 10);
      No.val(optCompany + "/" + Code + year);
      if (TID === 16) {
        return Prompt("Įveskite naujos sutarties nr.:", "Naujos sutarties Nr.", "", function(NewNo) {
          if (NewNo) return fnSaveNewNo(NewNo);
        });
      } else {
        return Confirm("Jums bus rezervuotas numeris '" + No.val() + "/?' sutarties sudarymui. Sutarties tipas - '" + oDATA.Get("tblContractTypes").Data.findColsByID(TID, [2]) + "'.", "Spauskite 'Gerai' jei sutinkate, 'Atšaukti' jei ne", function(taip) {
          if (taip) return fnSaveNewNo(null);
        });
      }
    };
    EnableButon = function(btn) {
      var Empty;
      Empty = IsEmpty();
      if (Empty) {
        if (!btn.hasClass("ui-state-disabled")) {
          return btn.attr("disabled", "disabled").addClass("ui-state-disabled");
        }
      } else {
        return btn.removeAttr("disabled").removeClass("ui-state-disabled");
      }
    };
    btn = $("<div style='width:53.3em;position:relative;height:2.2em;'><button style='position:absolute;top:.5em;right:0;'>Įsiminti numerį</button></div>").appendTo("#NewContractNo").find('button').click(SaveDataHandler).button({
      disabled: true,
      icons: {
        primary: 'img16-edit'
      }
    });
    TypeID.on('keypress blur', function() {
      return EnableButon(btn);
    });
    return Desc.on('keypress blur', function() {
      return EnableButon(btn);
    });
  };

  this.My.Contracts_EditNew = function() {
    var DataToSaveClientID, Par, ThisA, fnAddHandler, fnDisable, fnEnable, fnIsPrivate, fnSaveChanges;
    ThisA = $("#side-bar ul li a").filter("[data-action='Contracts_EditNew']");
    Par = ThisA.data("Par");
    if (!Par) return;
    DataToSaveClientID = {
      id: $("#NewContract").data("ctrl").id,
      Fields: ['ClientID'],
      DataTable: "tblContracts"
    };
    fnSaveChanges = function(form) {
      var DataToSave;
      DataToSave = oGLOBAL.ValidateForm(form);
      if (DataToSave) {
        oGLOBAL.UpdateServer({
          Action: (form.data("ctrl").NewRec ? "Add" : "Edit"),
          DataToSave: DataToSave,
          CallBack: {
            Success: function(resp, updData) {
              if ($(form).attr("id") === "NewClient" && resp.ResponseMsg.ID) {
                DataToSaveClientID.Data = [resp.ResponseMsg.ID];
              }
              oCONTROLS.UpdatableForm_toSaved(resp.ResponseMsg.ID, form, (DataToSaveClientID.Data ? DataToSaveClientID : null));
              if ($("input.UpdateField, input.UpdateField").map(function() {
                if ($(this).data("ctrl").Value) {
                  return null;
                } else {
                  return 1;
                }
              }).length === 0) {
                oGLOBAL.UpdateServer({
                  Action: "Edit",
                  DataToSave: $.extend(DataToSaveClientID, {
                    Fields: ["StatusID"],
                    Data: [3]
                  })
                });
              }
              $("#side-bar ul li a").data("opt", "refresh");
              return fnDisable(form.find("button.Save"));
            },
            Error: function(resp, updData) {
              return alert(resp);
            }
          },
          Msg: "",
          BlockCtrl: form
        });
      } else if (DataToSaveClientID.Data) {
        oCONTROLS.UpdatableForm_toSaved(null, form, DataToSaveClientID);
      }
      return DataToSaveClientID.Data = null;
    };
    fnDisable = function(btn) {
      return btn.attr("disabled", "disabled").addClass("ui-state-disabled");
    };
    fnEnable = function(btn) {
      return btn.removeAttr("disabled").removeClass("ui-state-disabled");
    };
    fnAddHandler = function(form) {
      var btn;
      btn = $('<button class="Save" style="float:right;" title="Išsaugoti">Išsaugoti</button>').appendTo(form.find("fieldset.inputFieldset")).button().on("click", function() {
        return fnSaveChanges(form);
      });
      fnDisable(btn);
      form.on("keyup", "input.UpdateField,textarea.UpdateField,input.time", function() {
        return fnEnable(btn);
      });
      return form.on("click", "div.ExtendIt button, input.date, input.time", function() {
        return fnEnable(btn);
      });
    };
    $("div.ExtendItHead").each(function() {
      var form;
      form = $(this);
      oCONTROLS.UpdatableForm(form);
      return fnAddHandler(form);
    });
    this.Contracts_EditNew.ItemChanged = function(t, Item) {
      var NewId, btn, ctrls, main;
      NewId = Item ? Item.id : null;
      if (NewId) {
        main = $("#NewClient");
        ctrls = main.find("input.UpdateField, textarea.UpdateField");
        oDATA.SetValToControls("tblClients", NewId, ctrls);
        $.extend(main.data("ctrl"), {
          "NewRec": 0,
          "id": NewId
        });
        DataToSaveClientID.Data = [NewId];
        btn = $('<button style="float:right;" title="Atšaukti kliento pasirinkimą">Atšaukti kliento pasirinkimą</button>').insertAfter("#NewClient fieldset.inputFieldset div:first label").button().on("click", function() {
          oDATA.SetNewForm(main);
          DataToSaveClientID.Data;
          return btn.remove();
        });
      }
      return fnEnable($(t).closest("fieldset").find("button.Save"));
    };
    fnIsPrivate = function(Private) {
      $("#CompanyCode, #CompanyName").css("display", (Private ? "none" : "inline-block")).find("input").toggleClass("UpdateField", !Private);
      return $("#PrivateName").css("display", (Private ? "inline-block" : "none")).find("input").toggleClass("UpdateField", Private);
    };
    if ($("#chkPrivate").length) fnIsPrivate($("#chkPrivate").is(":checked"));
    $("#chkPrivate").button().on("click", function() {
      var t;
      t = $(this);
      t.parent().find("span.ui-button-text").text(t.is(":checked") ? "Privatus klientas" : "Klientas - įmonė");
      return fnIsPrivate(t.is(":checked"));
    }).parent().find("span.ui-button-text").qtip({
      content: "Norint pakeisti spragtelėti",
      position: {
        at: 'top center',
        my: 'bottom center'
      }
    });
    $("#ContractFiles").next().on("click", function() {
      return ThisA.data("opt", "refresh");
    });
    if (ThisA.data("opt") === "refresh") {
      return $("#side-bar ul li a").data("opt", "refresh");
    }
  };

  this.My.Contracts_MyNotFinished = function() {
    var fnRowCallback_Contracts_MyNotFinished, fnShowContract, fnUploadsToButton, oTable;
    fnUploadsToButton = function(e) {
      return oCONTROLS.UploadDialog({
        RecId: e.data.ID,
        UserId: UserData.Id(),
        tblUpdate: "tblContracts",
        fnCallBack: function(files) {
          $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", (files.length ? "" : "red"));
          return oDATA.UpdateCell("tblContracts_MyNotFinished", false, e.data.ID, 10, files.length);
        }
      });
    };
    fnShowContract = function(e) {
      e.preventDefault();
      return $("#side-bar ul li a").filter("[data-action='Contracts_EditNew']").data("Par", e.data).trigger("click");
    };
    fnRowCallback_Contracts_MyNotFinished = function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      $('td:eq(0)', nRow).html("<a href='#'>" + aData[1] + "</a>").click({
        NewId: aData[0],
        No: aData[1]
      }, fnShowContract);
      $('td:eq(9)', nRow).html("<button " + (aData[10] === 0 ? "style='color:red'" : "") + ">" + aData[10] + "</button>").find("button").button({
        icons: {
          primary: "img16-attach"
        }
      }).click({
        ID: aData[0]
      }, fnUploadsToButton).parent().prev().MyEditInPlace({
        field_type: "textarea",
        default_text: "",
        id: aData[0],
        tblUpdate: "tblContracts",
        Field: "Status_Description",
        Title: "Pastaba apie sutarties bukle, spragtelkit noredami pakeisti..",
        fnUpdateSuccess: function(pars) {
          return oDATA.UpdateCell("tblContracts_MyNotFinished", false, pars.id, "Status_Description", pars.ctrl.html());
        }
      });
      return nRow;
    };
    return oTable = $('#tblGrid').clsGrid({
      "aaSortingFixed": [[11, 'asc']],
      "Header": [
        {
          col: 5,
          span: 2,
          Name: "Sutarties galiojimas"
        }, {
          col: 7,
          span: 2,
          Name: "Atsakingi darbuot."
        }
      ],
      "Groups": {
        ColToGroup: 11,
        GroupCaption: {
          Tbl: "tblContractTypes",
          ShowCols: [1, 2]
        }
      },
      "fnRowCallback": fnRowCallback_Contracts_MyNotFinished
    }, "tblContracts_MyNotFinished");
  };

  this.My.Contracts_MyAll = function() {
    var fnRowCallback_Contracts_MyNotFinished, fnShowContract, fnUploadsToButton, oTable;
    fnUploadsToButton = function(e) {
      return oCONTROLS.UploadDialog({
        RecId: e.data.ID,
        UserId: UserData.Id(),
        tblUpdate: "tblContracts",
        fnCallBack: function(files) {
          $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", (files.length ? "" : "red"));
          return oDATA.UpdateCell("tblContracts_Contracts_MyAll", false, e.data.ID, 10, files.length);
        }
      });
    };
    fnShowContract = function(e) {
      e.preventDefault();
      return $("#side-bar ul li a").filter("[data-action='Contracts_EditNew']").data("Par", e.data).trigger("click");
    };
    fnRowCallback_Contracts_MyNotFinished = function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      $('td:eq(0)', nRow).html("<a href='#'>" + aData[1] + "</a>").click({
        NewId: aData[0],
        No: aData[1]
      }, fnShowContract);
      $('td:eq(9)', nRow).html("<button " + (aData[10] === 0 ? "style='color:red'" : "") + ">" + aData[10] + "</button>").find("button").button({
        icons: {
          primary: "img16-attach"
        }
      }).click({
        ID: aData[0]
      }, fnUploadsToButton).parent().prev().MyEditInPlace({
        field_type: "textarea",
        default_text: "",
        id: aData[0],
        tblUpdate: "tblContracts",
        Field: "Status_Description",
        Title: "Pastaba apie sutarties bukle, spragtelkit noredami pakeisti..",
        fnUpdateSuccess: function(pars) {
          return oDATA.UpdateCell("tblContracts_Contracts_MyAll", false, pars.id, "Status_Description", pars.ctrl.html());
        }
      });
      return nRow;
    };
    return oTable = $('#tblGrid').clsGrid({
      "aaSortingFixed": [[11, 'asc']],
      "Header": [
        {
          col: 5,
          span: 2,
          Name: "Sutarties galiojimas"
        }, {
          col: 7,
          span: 2,
          Name: "Atsakingi darbuot."
        }
      ],
      "Groups": {
        ColToGroup: 11,
        GroupCaption: {
          Tbl: "tblContractTypes",
          ShowCols: [1, 2]
        }
      },
      "fnRowCallback": fnRowCallback_Contracts_MyNotFinished
    }, "tblContracts_Contracts_MyAll");
  };

}).call(this);
