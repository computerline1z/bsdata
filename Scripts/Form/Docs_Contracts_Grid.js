/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
//var Users_All_Grid=
var Contracts_Grid=(function() {
   var tblSource=window.oGLOBAL.Action;

   var fnRowCallback=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      $('td:eq(6)', nRow).html("<button "+((aData[8]===0)?"style='color:red'":"")+">"+aData[8]+"</button>").find("button")
         .button({ icons: { primary: "img16-attach"} }).click({ ID: aData[0] }, fnUploadsToButton)
         .parent().next()//islipam is buttono
         .editInPlace({ field_type: "textarea", default_text: "", show_buttons: false, params: "id="+aData[0]+"&tbl=tblContracts&field=Status_Description" });
      if(tblSource==="Contracts_Unsigned") {
         var td=$('td:eq(8)', nRow).html("<button style='height:30px;'></button>")
         .ButtonStatuses({ ID: aData[0], StatusID: aData[10], enableEvents: true, tblSource: tblSource, tblUpdate: "tblContracts", FieldName: "StatusID" });
      }
      return nRow;
   }
   var fnUploadsToButton=function(e) {
      oCONTROLS.UploadDialog({ RecId: e.data.ID, UserId: $("#tblGrid").data("ctrl").uid, tblUpdate: "tblContracts", AttachedFiles: "tblDocs_UploadedFiles",
         fnCallBack: function(files) {
            $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", ((files.length)?"":"red"));
            oDATA.UpdateCell(tblSource, false, e.data.ID, 9, files.length); //UpdateCell:(obj,tblToUpdate,id,field,NewVal)
         }
      })
   }
   //sDom: "rt", fnRowCallback: _fnRowCallback, fnHeaderCallback: _fnHeaderCallback,
   //   fnInitComplete: function() { t=this; setTimeout(function() { t.fnAdjustColumnSizing(); }, 5); }
   var oTable=$('#tblGrid').clsGrid({// "aaSortingFixed": [[1, 'asc']],           //Del grupavimo
      //fnDrawCallback: fnDrawCallback,
      //fnHeaderCallback: fnHeaderCallback, //fnEditRowOnClick: window.oSCRIPT.Editable,
      Header: [{ col: 4, span: 2, Name: "Įrašė" }, { col: 7, span: 2, Name: "Sutarties būklė"}],
      Groups: { ColToGroup: 1, GroupCaption: { Tbl: "tblContracts_Form", ShowCols: [1, 2]} },
      fnRowCallback: fnRowCallback
   }, tblSource);
})//.call(this);