/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
//var Users_All_Grid=
var Title_MyEvents=(function() {
   //var tblSource=window.oGLOBAL.Action;     //MyEvents
   var h1=$("#introduction").clone(); //Kopijuojam pagal iš template ir panaikinam template
   var div=$("#introduction").next().clone();
   $("#main-copy").empty();

   if(oDATA.Get("Contracts_Unsigned").Data.length) {
      h1.clone().html("Tvarkomos sutartys").attr("id", "h1Contracts_Unsigned").appendTo("#main-copy");
      div.clone().appendTo("#main-copy").find("#tblGrid").attr("id", "grdContracts_Unsigned");
      var fnUploadsToButton=function(e) {
         oCONTROLS.UploadDialog({ RecId: e.data.ID, UserId: $("#grdContracts_Unsigned").data("ctrl").uid, tblUpdate: "tblContracts", AttachedFiles: "tblDocs_UploadedFiles",
            fnCallBack: function(files) {
               $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", ((files.length)?"":"red"));
               oDATA.UpdateCell("Contracts_Unsigned", false, e.data.ID, 9, files.length); //UpdateCell:(obj,tblToUpdate,id,field,NewVal)
            }
         })
      }
      var fnRowCallback_Contracts_Unsigned=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
         $('td:eq(6)', nRow).html("<button "+((aData[8]===0)?"style='color:red'":"")+">"+aData[8]+"</button>").find("button")
         .button({ icons: { primary: "img16-attach"} }).click({ ID: aData[0] }, fnUploadsToButton)
         .parent().next()//islipam is buttono
         .editInPlace({ field_type: "textarea", show_buttons: false, default_text: "", params: "id="+aData[0]+"&tbl=tblContracts&field=Status_Description" });
         var td=$('td:eq(8)', nRow).html("<button style='height:30px;'></button>")
         .ButtonStatuses({ ID: aData[0], StatusID: aData[10], enableEvents: true, tblSource: "Contracts_Unsigned", tblUpdate: "tblContracts", FieldName: "StatusID" });
         return nRow;
      }
      var oTable=$('#grdContracts_Unsigned').clsGrid({// "aaSortingFixed": [[1, 'asc']],           //Del grupavimo
         Header: [{ col: 4, span: 2, Name: "Įrašė" }, { col: 7, span: 2, Name: "Sutarties būklė"}],
         Groups: { ColToGroup: 1, GroupCaption: { Tbl: "tblContracts_Form", ShowCols: [1, 2]} },
         fnRowCallback: fnRowCallback_Contracts_Unsigned
      }, "Contracts_Unsigned");
   }
})//.call(this);