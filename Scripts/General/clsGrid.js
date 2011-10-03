(function() {
   var $;
   var __bind=function(fn, me) { return function() { return fn.apply(me, arguments); }; };
   $=jQuery;
   $.fn.clsGrid=function(GridOpt, objData) {
      var Gopts, HeadOk, JSON, NewData, fnRowClickEvent, oTable, opt, self;
      self=$.fn.clsGrid;
      HeadOk=0;
      JSON=oDATA.Get(objData);
      Gopts=GridOpt;
      if($(this).length>1) {
         alert("Daugiau nei vienas objektas ant kurio dedamas gridas!");
      }
      NewData=$.extend(JSON.Grid, {
         aaData: JSON.Data
      });
      if(GridOpt.Header) {
         $.extend(NewData, {
            fnHeaderCallback: function(nHead, aasData, iStart, iEnd, aiDisplay) {
               var Coli, ResetClone, i, thNo, trClone, trCloneRem, trHead, trHeadRem;
               if(HeadOk++ ===0) {
                  ResetClone=function() {
                     return trClone.find("th span").removeClass("ui-icon-triangle-1-n ui-icon-triangle-1-s ui-icon-carat-2-n-s").addClass("ui-icon-carat-2-n-s");
                  };
                  trHead=$(nHead).css("line-height", "0.9em");
                  trCloneRem=0;
                  trHeadRem=0;
                  i=0;
                  thNo=trHead.find("th").length;
                  trClone=trHead.clone(true, true);
                  while(i<thNo) {
                     Coli=Gopts.Header.findRowByColValue(i, "col");
                     if(Coli!=="") {
                        trHead.find("th:eq("+(i-trHeadRem)+")").attr("colspan", Gopts.Header[Coli].span).css("text-align", "center").html(Gopts.Header[Coli].Name).next().remove();
                        i+=Gopts.Header[Coli].span-1;
                        trHeadRem++;
                     } else {
                        trHead.find("th:eq("+(i-trHeadRem)+")").attr("rowspan", 2);
                        trClone.find("th:eq("+(i-trCloneRem)+")").remove().end().find("th").click(function(e) {
                           var addCls, t;
                           t=$(e.target).find("span:first");
                           if(t.hasClass("ui-icon-carat-2-n-s")) {
                              addCls="ui-icon-triangle-1-n";
                           } else if(t.hasClass("ui-icon-triangle-1-n")) {
                              addCls="ui-icon-triangle-1-s";
                           } else if(t.hasClass("ui-icon-triangle-1-s")) {
                              addCls="ui-icon-triangle-1-n";
                           }
                           ResetClone();
                           return t.addClass(addCls).removeClass("ui-icon-carat-2-n-s");
                        });
                        trCloneRem++;
                     }
                     i++;
                  }
                  return trHead.click(ResetClone).after(trClone);
               }
            }
         });
      }
      if(GridOpt.Groups) {
         $.extend(NewData, {
            fnDrawCallback: function(oSettings) {
               var GetNameByID, LastCell, No, i, iColspan, iDisplayIndex, nCell, nGroup, nTrs, sGroup, sLastGroup;
               nTrs=$(oSettings.nTBody).find("tr");
               if(nTrs.length<2) {
                  return;
               }
               iColspan=nTrs[0].getElementsByTagName('td').length;
               sLastGroup="";
               No= -1;
               LastCell;
               i=0;
               GetNameByID=function(ID) {
                  var tbl;
                  ID=parseInt(ID, 10);
                  tbl=oDATA.Get(GridOpt.Groups.GroupCaption.Tbl);
                  return tbl.Data.findColsByID(ID, GridOpt.Groups.GroupCaption.ShowCols);
               };
               while(i<nTrs.length) {
                  iDisplayIndex=oSettings._iDisplayStart+i;
                  No++;
                  sGroup=oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[GridOpt.Groups.ColToGroup];
                  if(sGroup!==sLastGroup) {
                     nGroup=document.createElement('tr');
                     nCell=document.createElement('td');
                     nCell.colSpan=iColspan;
                     nCell.className="group";
                     nCell.innerHTML=GetNameByID(sGroup);
                     nGroup.appendChild(nCell);
                     nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
                     if(sLastGroup) {
                        LastCell.innerHTML+=" ("+No+"vnt.)";
                        No=0;
                     }
                     sLastGroup=sGroup;
                     LastCell=nCell;
                  }
                  i++;
               }
               return LastCell.innerHTML+=" ("+(No+1)+"vnt.)";
            }, "aaSortingFixed": [[1, 'asc']]
         });
      }
      $.extend(true, NewData, self.GridOpt, GridOpt);
      oTable=$(this).dataTable(NewData);
      setTimeout(__bind(function() {
         $(oTable).css("width", "100%");
         return oTable.fnDraw();
      }, this), 100);
      opt={
         objData: objData,
         Action: "",
         aRowData: 0,
         ClickedRow: 0
      };
      if(GridOpt.fnEditRowOnClick) {
         fnRowClickEvent=function(event) {
            var eForm;
            opt.ClickedRow=this;
            opt.aRowData=oTable.fnGetData(oTable.fnGetPosition(this));
            opt.Action="Edit";
            opt.CallBackAfterSave=function(RowData) {
               var aPos;
               aPos=oTable.fnGetPosition(opt.ClickedRow);
               return oTable.fnUpdate(RowData, aPos, 0);
            };
            return eForm=new clsEditableForm(opt);
         };
         $(this).find('tbody tr').bind('click', fnRowClickEvent);
         $('<button class="AddNew" title="Pridėti naują">Pridėti naują</button>').button({
            icons: {
               primary: "img16-add_new"
            }
         }).click(function() {
            var eForm;
            opt.ClickedRow=0;
            opt.aRowData=0;
            opt.Action="Add";
            opt.CallBackAfterSave=function(RowData) {
               return oTable.fnAddData(RowData);
            };
            return eForm=new clsEditableForm(opt);
         }).appendTo('div.dataTables_wrapper>div:first');
      }
      return oTable;
   };
   $.extend($.fn.clsGrid, {
      GridOpt: {
         oLanguage: {
            "sLengthMenu": "Rodyti _MENU_ įr. psl.",
            "sZeroRecords": "Nerasta įrašų..",
            "sInfo": "Viso: _TOTAL_",
            "sInfoEmpty": "Rodoma: 0 - 0 iš 0 įrašų",
            "sInfoFiltered": "(Filtruota iš _MAX_ įrašų)",
            "sSearch": "Ieškoti:"
         },
         "sProcessing": "Laukite..",
         "bJQueryUI": true,
         "bSortClasses": false,
         "bPaginate": false,
         "sScrollX": "100%",
         "bScrollCollapse": false,
         "clickEvtIsLive": 1,
         "colorAfterNewInsert": 1
      }
   });
}).call(this);