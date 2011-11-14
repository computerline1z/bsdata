/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
//var Users_All_Grid=
var ContractsUnsigned_Grid=(function() {
   var tblSource=window.oGLOBAL.Action;

   var fnRowCallback=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      var tblUpdate=(aData[1]==="Kt.pasl.")?"tblContracts":"tblClients_Objects";
      $('td:eq(7)', nRow).html("<button "+((aData[7]===0)?"style='color:red'":"")+">"+aData[7]+"</button>").find("button")
         .button({ icons: { primary: "img16-attach"} }).click({ ID: aData[0] }, fnUploadsToButton)
      .parent().next()//islipam is buttono
      //.editInPlace({ field_type: "textarea", default_text: "", show_buttons: false, params: "id="+aData[0]+"&tbl=tblContracts&field=Status_Description" });
      .MyEditInPlace({ field_type: "textarea", default_text: "", id: aData[0], tblUpdate: tblUpdate, Field: "Status_Description", Title: "Pastaba apie sutarties būklę, spragtelkit norėdami pakeisti..",
         fnUpdateSuccess: function(pars) {//$ctrl,eOpt[is opciju],id
            oDATA.UpdateCell(tblSource, false, pars.id, "Status_Description", pars.ctrl.html()); //UpdateCell:(obj,tblToUpdate,id,field,NewVal)
         }
      });
      var td=$('td:eq(9)', nRow).html("<button style='height:30px;'></button>")
         .ButtonStatuses({ ID: aData[0], StatusID: aData[9], enableEvents: true, tblSource: tblSource, tblUpdate: tblUpdate, FieldName: "StatusID" });
      return nRow;
   }
   var fnUploadsToButton=function(e) {
      oCONTROLS.UploadDialog({ RecId: e.data.ID, UserId: UserData.Id(), tblUpdate: "tblContracts", //AttachedFiles: "tblDocs_UploadedFilesUnsigned",
         fnCallBack: function(files) {
            $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", ((files.length)?"":"red"));
            oDATA.UpdateCell(tblSource, false, e.data.ID, 7, files.length); //UpdateCell:(obj,tblToUpdate,id,field,NewVal)
         }
      })
   }
   //sDom: "rt", fnRowCallback: _fnRowCallback, fnHeaderCallback: _fnHeaderCallback,
   //   fnInitComplete: function() { t=this; setTimeout(function() { t.fnAdjustColumnSizing(); }, 5); }
   var oTable=$('#tblGrid').clsGrid({// "aaSortingFixed": [[1, 'asc']],           //Del grupavimo
      //fnDrawCallback: fnDrawCallback,
      //fnHeaderCallback: fnHeaderCallback, //fnEditRowOnClick: window.oSCRIPT.Editable,
      Header: [{ col: 5, span: 2, Name: "Įrašė" }, { col: 8, span: 2, Name: "Sutarties būklė"}],
      //Groups: { ColToGroup: 1, GroupCaption: { Tbl: "tblUsers", ShowCols: [1, 2, 3]} },
      fnRowCallback: fnRowCallback
   }, tblSource);
})//.call(this);