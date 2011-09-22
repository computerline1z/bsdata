/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
//var Users_All_Grid=
var Contracts_Grid=(function() {
   var HeadOK=0; DocCol=(window.oGLOBAL.Action==="Contracts_Unsigned")?6:5;
   var fnDrawCallback=function(oSettings) {
      //--------------------------------------
      if(!HeadOK) {
         var trHead=$('#tblGrid').parent().prev().find("thead tr").css("line-height", "1em");
         var trClone=trHead.clone(true, true);
         var Row2, Col2;

         if(window.oGLOBAL.Action==="Contracts_Unsigned") {
            Row2="th:eq(0),th:eq(1),th:eq(2),th:eq(3),th:eq(6)"; Col2="th:eq(4)";
         } else {
            Row2="th:eq(0),th:eq(1),th:eq(2),th:eq(5)"; Col2="th:eq(3)";
         }
         trHead.find(Row2).attr("rowspan", 2).end().find(Col2).remove().end().find(Col2).css("text-align", "center").html("Galiojimas").attr("colspan", 2);
         var ResetClone=function() { trClone.find("th span").removeClass("ui-icon-triangle-1-n ui-icon-triangle-1-s ui-icon-carat-2-n-s").addClass("ui-icon-carat-2-n-s"); }  //Visus nuresetinam
         trClone.find(Row2).remove().end().find("th").click(function(e) {
            var t=$(e.target).find("span:first");
            if(t.hasClass("ui-icon-carat-2-n-s")) { addCls="ui-icon-triangle-1-n"; }
            else if(t.hasClass("ui-icon-triangle-1-n")) { addCls="ui-icon-triangle-1-s"; }
            else if(t.hasClass("ui-icon-triangle-1-s")) { addCls="ui-icon-triangle-1-n"; }
            ResetClone();
            t.addClass(addCls).removeClass("ui-icon-carat-2-n-s"); //Pakeiciam klases bei nuimam nuresetinima
         });
         trHead.click(ResetClone).after(trClone);
         HeadOK=1;
      }
      //--------------------------------------

      //if(oSettings.aiDisplay.length==0) {  return;  }
      var nTrs=$('#tblGrid tbody tr');
      var iColspan=nTrs[0].getElementsByTagName('td').length;
      var sLastGroup="", No= -1, LastCell;
      for(var i=0; i<nTrs.length; i++) {
         var iDisplayIndex=oSettings._iDisplayStart+i; No++;

         var sGroup=oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[1]; //_aData[5]-SubDepID
         if(sGroup!=sLastGroup) {
            var nGroup=document.createElement('tr');
            var nCell=document.createElement('td');
            nCell.colSpan=iColspan;
            nCell.className="group";
            nCell.innerHTML=GetNameByID(sGroup);
            nGroup.appendChild(nCell);
            nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
            if(sLastGroup) {
               LastCell.innerHTML+=" ("+(No)+"vnt.)";
               No=0;
            }
            sLastGroup=sGroup; LastCell=nCell;
         }
      }
      LastCell.innerHTML+=" ("+(No+1)+"vnt.)"; //Pridedamas suskaičiavimas paskutiniam
   }
   function fnHeaderCallback(nHead, aasData, iStart, iEnd, aiDisplay) {
      //$(nHead).append('<th class="ui-state-default">Kas atsitiko22</th>');
      //$(nHead).html("<th width='15%'><th width='20%'><th width='20%'><th width='30%'><th width='10%'>");
      //      if(!HeadOK) {
      //         //var trHTML="<tr>"+$(nHead).html()+"</tr>";
      //         var trClone=$(nHead).clone();
      //         //trClone.find("th:eq(0)").remove();
      //        // $(nHead).find("th:eq(0)").attr("rowspan", 2);
      //         $(nHead).before(trClone);
      //      }
      //      HeadOK=1;
      //      //$(nHead).html("<th width='15%'></th><th width='20%'></th><th width='20%'></th><th width='30%'></th><th width='10%'></th>");

      return nHead;
   }

   var fnRowCallback=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      //href='javascript:void(0)'
      if(aData[9]===0) { $('td:eq('+DocCol+')', nRow).html("<a style='color:red' href='#' data-ctrl='{\"ID\":"+aData[0]+"}'>"+aData[9]+"</a>"); }
      else { $('td:eq('+DocCol+')', nRow).html("<a  href='#' data-ctrl='{\"ID\":"+aData[0]+"}'>"+aData[9]+"</a>"); }
      return nRow;
   }
   //sDom: "rt", fnRowCallback: _fnRowCallback, fnHeaderCallback: _fnHeaderCallback,
   //   fnInitComplete: function() { t=this; setTimeout(function() { t.fnAdjustColumnSizing(); }, 5); }
   var tblSource=window.oGLOBAL.Action;
   var oTable=$('#tblGrid').clsGrid({ "aaSortingFixed": [[1, 'asc']],           //Del grupavimo
      fnDrawCallback: fnDrawCallback, fnHeaderCallback: fnHeaderCallback, //fnEditRowOnClick: window.oSCRIPT.Editable, 
      fnRowCallback: fnRowCallback
   }, tblSource);
   //turi eit po grido sukurimo
   $("#tblGrid tbody tr td").css("cursor", "pointer").click(function(e) {
      var t=e.target, tag=t.tagName.substring(), ID=0;
      if(tag==="A") { ID=$(t).data("ctrl").ID; }
      else { ID=($(t).find("a").length?$(t).find("a").data("ctrl").ID:0); }
      alert(ID);
   });
   function GetNameByID(ID) {
      ID=parseInt(ID, 10), tblContracts_Form=oDATA.Get("tblContracts_Form");
      return tblContracts_Form.Data.findColsByID(ID, [1, 2]);
      //      for(var i=0; i<tblContracts_Form.Data.length; i++) {
      //         if(tblContracts_Form.Data[i][0]===ID) { return tblContracts_Form.Data[i][1]; }
      //      }
   }
})//.call(this);