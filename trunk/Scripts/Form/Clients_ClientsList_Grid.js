/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
//var Users_All_Grid=
var Clients_ClientsList_Grid=(function() {
   var tblSource="proc_Clients", oTable;
   var tblContracts_Form=oDATA.Get("tblContracts_Form").Data;
   var tblUsers=oDATA.Get("tblUsers").Data;
   var fnGetContracts=function(Contracts) {
      if(Contracts==='-') { return '-'; }
      var ret="", ctr=Contracts.split("||");
      for(var i=0; i<ctr.length; i++) {
         var c=ctr[i].split('##');
         ret+="<div><b>"+c[0]+"</b> - "+tblContracts_Form.findColsByID(parseInt(c[1], 10), 1)+"</div>";
      }
      return ret;
   }
   var fnGetEvents=function(Events) {
      var ret=""; e=(Events.split("##"));
      if(e[0]!=="0") {
         ret="<div><b>"+e[0]+"</b>, Paskutinis: "+e[1]+"</div>";
      } else {
         ret="<div style='color:\"red\"'>0</div>";
      }
      if(e[2]!=='-') {
         var days=parseInt(e[3], 10), style="", t=e[2];
         if(days<1) { style="style='color:red'"; }
         else if((days<7)) { style="style='color:green'"; t+=", liko "+days+"d"; }
         //else{}
         ret+="<div "+style+">Sekantis:"+t+"</div>";
      }
      return ret;
   }
   var fnUploadsToButton_Events=function(e) {
      oCONTROLS.UploadDialog({ RecId: e.data.ID, UserId: UserData.Id(), tblUpdate: "tblClients_Events", //AttachedFiles: "tblDocs_UploadedFiles_ofEvent",
         DialogTitle: e.data.Date+" įvykio dokumentai, darbuotojas - "+e.data.User,
         fnCallBack: function(files) {
            $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", ((files.length)?"":"red"));
            oDATA.UpdateCell("tblClientEvents", false, e.data.ID, "UplFilesNo", files.length); //UpdateCell:(obj,tblToUpdate,id,field,NewVal)
         }
      })
   }
   var fnUploadsToButton_Clients=function(e) {
      oCONTROLS.UploadDialog({ RecId: e.data.ID, UserId: UserData.Id(), tblUpdate: "tblClients", //AttachedFiles: "tblDocs_UploadedFiles_ofClient",
         DialogTitle: "Bylų prisegimas prie įmonės - "+e.data.Company,
         fnCallBack: function(files) {
            $(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", ((files.length)?"":"red"));
            oDATA.UpdateCell(tblSource, false, e.data.ID, "UplFilesNo", files.length); //UpdateCell:(obj,tblToUpdate,id,field,NewVal)
         }
      })
   }
   var fnRowCallBack_ClientEvents=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      $('td:eq(3)', nRow).html("<button "+((aData[4]===0)?"style='color:red'":"")+">"+aData[4]+"</button>").find("button")
            .button({ icons: { primary: "img16-attach"} }).click({ ID: aData[0], Date: aData[1], User: aData[2] }, fnUploadsToButton_Events);
      return nRow;
   }
   var fnAddNewEvent=function(p) {
      var fnLoadForm=function() {
         var NewEventHTML=oDATA.Get("NewEventHTML").replace('"ClientID_Value"', p.ClientID);
         opt={ objData: "tblClientEvents", DialogFormId: "divEventsDialog", Action: "Add", RenderHTML: NewEventHTML,
            Title: ("Naujo įvykio įvedimas klientui - "+p.ClientName), form: p.form, target: p.target,
            CallBackAfter: function(RowData) {
               var oTable=$("#tblEvents").dataTable();
               var oSettings=oTable.fnSettings();
               var aiNew=oTable.fnAddData(RowData);
               var tr=$(oSettings.aoData[aiNew[0]].nTr);

               //var ix=$("#tblEvents").dataTable().fnAddData(RowData);
               //var tr=$("#tblEvents tr:eq("+(ix[0]+1)+")"),
               var clr=tr.find("td").css("color");
               tr.css("color", "blue").animate({ color: clr }, 3000);
               fnRowCallBack_ClientEvents(tr[0], RowData);
               //               var aPos=oTable.fnGetPosition(opt.ClickedRow);
               //               oTable.fnUpdate(RowData, aPos, 0);
            }
         }
         new clsEditableForm(opt);
      }
      if(!oDATA.Get("NewEventHTML")) {
         $.post('/Clients/NewEventHTML', function(data) {
            oDATA.Set("NewEventHTML", data.Render)
            fnLoadForm();
         });
      } else { fnLoadForm(); }
   }
   var fnShowClient=function(e) {
      e.preventDefault();
      e.stopPropagation();
      var tr=$(e.target).closest('tr');
      new clsEditInPlaceForm({ url: '/Clients/ClientEvents', postPars: { ClientID: e.data.ID, onlyData: ((oDATA.Get("tblClient_prop"))?true:false) },
         formTitle: "Kliento - "+$(e.target).html()+" - įvykiai",
         //Buttons: { "Naujas įvykis": function() { fnAddNewEvent({ ClientID: e.data.ID, ClientName: $(e.target).html() }) } }, Dialogo apačioje
         EditableFormId: "divClientData",
         Grid: { DoomId: "tblEvents", Opt: { "bDestroy": true, fnRowCallback: fnRowCallBack_ClientEvents,
            GridButtons: { "Pridėti naują įvykį": { Action: function(opt) { fnAddNewEvent({ ClientID: e.data.ID, ClientName: $(e.target).html(), target: opt.target, form: opt.form }) },
               form: "Head", icon: "img16-add_new"
            }
            }
         }, Source: "tblClientEvents"
         }, fnUpdateSuccess: function(par) {
            if(par.eOpt.Field==="NextContactDate") {
               var Uid=UserData.Id();
               if(par.ctrl.next().data("ctrl").UserId!==Uid) {
                  par.ctrl.next().html(oDATA.Get("tblUsers").Data.findColsByID(Uid, [2, 3])); //Jeigu pakeite data, irašom nauja useri jei ne tas pats
                  $.post("/Update/editInPlace", { id: par.id, tbl: "tblClients", update_value: Uid, field: "NextContactUserID" });
               }
            }
         },         // ,  "bDestroy": true   "bRetrieve": true
         tblProp: "tblClient_prop", //nurodoma is kur imti editable propercius
         fnFieldsUpdatedCallBack: function(DataToSave) {//DataToSave: Data,Fields,id,DataTable
            $.post('/Clients/ClientsList1', { RecID: DataToSave.id }, function(jsonResp) {
               tr.children().unbind(); //Atkabinam visus eventus (nes jie pasilieka keiciant html);
               var RowData=jsonResp.proc_Clients.Data[0];
               tr.find("'td:eq(0)'").html(RowData[1]); //Pakeiciam ranka, nes fnRowCallback kisa i cia ta ka turi
               oDATA.UpdateRow(RowData, "proc_Clients", "Edit")
               fnRowCallback(tr[0], RowData);
            });
         }
      });
      return false;
   }
   var fnRowCallback=function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
      $('td:eq(1)', nRow).html("<a href='#'>"+aData[2]+"</a>").click({ ID: aData[0] }, fnShowClient); //Company Name
      $('td:eq(2)', nRow).html(fnGetContracts(aData[3])); //Contracts
      $('td:eq(3)', nRow).html(fnGetEvents(aData[4])); //Events
      $('td:eq(4)', nRow).html("<button "+((aData[5]===0)?"style='color:red'":"")+">"+aData[5]+"</button>").find("button")
         .button({ icons: { primary: "img16-attach"} }).click({ ID: aData[0], Company: aData[2] }, fnUploadsToButton_Clients);
      //.parent().next()//islipam is buttono
      //.editInPlace({ field_type: "textarea", default_text: "", show_buttons: false, params: "id="+aData[0]+"&tbl=tblContracts&field=Status_Description" });
      $(nRow).data("ID", aData[0]);
      //console.log("Init");
      return nRow;
   }
   //sDom: "rt", fnRowCallback: _fnRowCallback, fnHeaderCallback: _fnHeaderCallback,
   //   fnInitComplete: function() { t=this; setTimeout(function() { t.fnAdjustColumnSizing(); }, 5); }
   oTable=$('#tblGrid').clsGrid({// "aaSortingFixed": [[1, 'asc']],           //Del grupavimo
      //Header: [{ col: 4, span: 2, Name: "Įrašė" }, { col: 7, span: 2, Name: "Sutarties būklė"}],
      //Groups: { ColToGroup: 1, GroupCaption: { Tbl: "tblContracts_Form", ShowCols: [1, 2]} },
      fnRowCallback: fnRowCallback
   }, tblSource);
})//.call(this);