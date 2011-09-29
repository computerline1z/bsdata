/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
//var Users_All_Grid=
var Contracts_Grid=(function() {
   var HeadOK=0, IsBindToGrid=0, oUserStatus=oDATA.Get("tblUsers_Status");
   var fnDrawCallback=function(oSettings) {
      //--------------------------------------
      if(!HeadOK) {
         var trHead=$('#tblGrid').parent().prev().find("thead tr").css("line-height", "1em");
         var trClone=trHead.clone(true, true);
         var Row2, Col2;
         Row2="th:eq(0),th:eq(1),th:eq(2),th:eq(3),th:eq(6)"; Col2="th:eq(4)";
         trHead.find(Row2).attr("rowspan", 2).end().find(Col2).remove().end().find(Col2).css("text-align", "center").html((window.oGLOBAL.Action==="Contracts_Unsigned")?"Įrašė":"Galiojimas").attr("colspan", 2);
         if(window.oGLOBAL.Action==="Contracts_Unsigned") {
            trHead.find('th:eq(6)').remove().end().find('th:eq(6)').css("text-align", "center").html("Sutarties būklė").attr("colspan", 2);
         }
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
      if(nTrs.length<2) return;
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
      if(IsBindToGrid) { BindToGrid(); }
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
   var tblSource=window.oGLOBAL.Action;
   var fnRowCallback=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      //href='javascript:void(0)'
      //      if(aData[9]===0) { $('td:eq('+DocCol+')', nRow).html("<button style='color:red' data-ctrl='{\"ID\":"+aData[0]+"}'>"+aData[9]+"</button>"); }
      //      else { $('td:eq('+DocCol+')', nRow).html("<button data-ctrl='{\"ID\":"+aData[0]+"}'>"+aData[9]+"</button>"); }
      if(aData[8]===0) { $('td:eq(6)', nRow).html("<button style='color:red' data-ctrl='{\"ID\":"+aData[0]+"}'>"+aData[8]+"</button>"); }
      else { $('td:eq(6)', nRow).html("<button data-ctrl='{\"ID\":"+aData[0]+"}'>"+aData[8]+"</button>"); }
      if(tblSource==="Contracts_Unsigned") {
         //$('td:eq(7)', nRow).html("<textarea rows='2' style='width:100%;'>"+aData[9]+"</textarea>");
         $('td:eq(8)', nRow).html("<button style='height:30px;' data-ctrl='{\"ID\":"+aData[0]+",\"StatusID\":"+aData[10]+"}'></button>");
      }
      return nRow;
   }
   //sDom: "rt", fnRowCallback: _fnRowCallback, fnHeaderCallback: _fnHeaderCallback,
   //   fnInitComplete: function() { t=this; setTimeout(function() { t.fnAdjustColumnSizing(); }, 5); }
   var oTable=$('#tblGrid').clsGrid({ "aaSortingFixed": [[1, 'asc']],           //Del grupavimo
      fnDrawCallback: fnDrawCallback, fnHeaderCallback: fnHeaderCallback, //fnEditRowOnClick: window.oSCRIPT.Editable,
      fnRowCallback: fnRowCallback
   }, tblSource);
   //turi eit po grido sukurimo
   var BindToGrid=function() {
      var tds=$("#tblGrid tbody tr");
      tds.find("td:eq(6)").each(function(i, item) {
         $(item).find("button").button({ icons: { primary: "img16-attach"} }).click(function(e) {
            var t=$(e.target).parent().closest("button"), ID=$(t).data("ctrl").ID;
            oCONTROLS.UploadDialog({ RecId: ID, UserId: $("#tblGrid").data("ctrl").uid, tblUpdate: "tblContracts", AttachedFiles: "tblDocs_UploadedFiles",
               fnCallBack: function(files) {
                  $(e.target).html(files.length).parent().closest("button").css("color", "");
                  oDATA.UpdateCell(tblSource, ID, 9, files.length); //UpdateCell:(obj,id,ColNo,NewVal)
               }
            })
         });
      });
      var fnSetProps=function(item, IsButton) {
         var btn=(IsButton)?item:$(item).find("button");
         //if(p.FirstTime) { btn=$(item).find("button"); }
         //else { btn=$(e.target).is("button")?$(e.target):$(e.target).parent().closest("button"); }
         var StatusID=$(btn).data("ctrl").StatusID;
         var P={ iconOpt: { primary: "img16-tag_red" }, tip: "Nauja sutartis.<br /> Patvirtiniti sutartį?" };
         if(StatusID===2) { P={ iconOpt: { primary: "img16-tag_yellow" }, tip: "Patvirtinta sutartis.<br /> Įjungti paslaugas?" }; }
         else if(StatusID===3) { P={ iconOpt: { primary: "img16-tag_green" }, tip: "Paslaugos įjungtos.<br /> Perkelti prie sutvarkytų?" }; }
         else if(StatusID===4) { P={ iconOpt: { primary: "img16-tag_green", secondary: "img16-check" }, tip: "Suartis sutvarkyta. Jokių kitų veiksmų<br /> su šia sutartimi nereikia." }; }
         btn.qtip({ content: P.tip, position: { at: 'top center', my: 'bottom center'} });
         return btn.button({ icons: P.iconOpt });
      }
      if(tblSource==="Contracts_Unsigned") {
         tds.find("td:eq(7)").each(function(i, item) {
            $(item).editInPlace({ //callback: function(unused, enteredText) { return enteredText; },
               field_type: "textarea",
               //success: function(val) { alert(val); },
               show_buttons: true,
               params: "id="+$(this).next().find("button").data("ctrl").ID+"&tbl=tblContracts&field=Status_Description"   //StatusID
            });
         });
         tds.find("td:eq(8)").each(function(i, item) {
            //var btn=$(item).find("button"), ID=$(btn).data("ctrl").ID, StatusID=$(btn).data("ctrl").ID;
            fnSetProps(item, false).click(function(e) {
               var btn=$(e.target).is("button")?$(e.target):$(e.target).parent().closest("button");
               var ID=$(btn).data("ctrl").ID;
               var StatusID=$(btn).data("ctrl").StatusID;
               var title="", question="'Gerai' - jei sutinkate, 'Atšaukti' - jei ne.";
               if(StatusID===1) { title="Ar patvirtinate sutarties įsigaliojimą?"; }
               else if(StatusID===2) { title="Ar įjungtos paslaugos pagal sutartį?"; }
               else if(StatusID===3) { title="Ar gauti visi dokumentai ir sutartis sutvarkyta?"; }
               else { Alert("Sutartis jau sutvarkyta", "Jeigu yra klausimų kreipkitės pas administraciją"); return; }
               Confirm(question, title, function(yes) {
                  if(yes) {//Patvirtino
                     StatusID++;
                     btn.data("ctrl", { "ID": ID, "StatusID": (StatusID) });
                     fnSetProps(btn, true);
                     oDATA.UpdateCell(tblSource,"tblContracts", ID, "StatusID", StatusID);
                  }
               });
            });
         });
      }
      IsBindToGrid=1;
   };
   setTimeout(BindToGrid, 200);
   //      $("#tblGrid tbody tr td").css("cursor", "pointer").click(function(e) {
   //         var t=e.target, tag=t.tagName.substring(), ID=0;
   //         if(tag==="A") { ID=$(t).data("ctrl").ID; }
   //         else { ID=($(t).find("a").length?$(t).find("a").data("ctrl").ID:0); }
   //         //oCONTROLS.UploadDialog({ RecId: ID, UserId: $("#tblGrid").data("ctrl").uid, tblUpdate: "tblContracts", AttachedFiles: "tblDocs_UploadedFiles" })
   //         alert(ID);
   //      });

   function GetNameByID(ID) {
      ID=parseInt(ID, 10), tblContracts_Form=oDATA.Get("tblContracts_Form");
      return tblContracts_Form.Data.findColsByID(ID, [1, 2]);
      //      for(var i=0; i<tblContracts_Form.Data.length; i++) {
      //         if(tblContracts_Form.Data[i][0]===ID) { return tblContracts_Form.Data[i][1]; }
      //      }
   }
})//.call(this);