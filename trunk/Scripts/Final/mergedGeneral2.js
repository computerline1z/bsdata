/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
(function($) {
   $.fn.extend({
      //pass the options variable to the function
      ValidateOnBlur: function(options) {
         //Set the default values, use comma to separate the settings, example:
         var defaults={
            ValidArray: [],
            Allow: 'Integer', //Decimal Date Time DateCtrl DateNotLessCtrl DateNotMoreCtrl  //Sutampa su nurodymais oDATA.SD.Cols[i].Type
            Trim: true
         }
         var opt=$.extend(defaults, options);
         //Jei turi but array, jo opcija ValidArray
         //ValidateOnBlur({ Allow: 'Integer' })
         //ValidateOnBlur({ Allow: 'Decimal' })
         return this.each(function() {
            var t=$(this);
            t.blur(function() {
               var inputVal=t.val();
               var re=/^(\s*)([\W\w]*)(\b\s*$)/;
               if(re.test(inputVal)) {
                  inputVal=inputVal.replace(re, '$2');
               } //remove leading and trailing whitespace characters
               if(opt.ValidArray.length) {
                  var idx=jQuery.inArray(inputVal, ValidArray); if(idx=== -1) { t.val(""); return; }
               }
               else if(opt.Allow==='Integer') {
                  re=/\D*(\d+)\D*/; if(re.test(inputVal)) inputVal=inputVal.replace(re, "$1"); else { t.val(""); return; }
               }
               else if(opt.Allow==='Decimal') {
                  inputVal=inputVal.replace(',', '.'); //re=/.*?(([0-9]?\.)?[0-9]+).*/g;
                  re=/\D*(\d\d*\.\d+|\d+)\D*/;
                  if(re.test(inputVal))
                     inputVal=inputVal.replace(re, "$1");
                  else { t.val(""); return; }
               }
               else if(opt.Allow==='Date'||opt.Allow==='DateCtrl'||opt.Allow==='DateNotLessCtrl'||opt.Allow==='DateNotMoreCtrl') {
                  inputVal=inputVal.replace('.', '-').replace('/', '-').replace('\\', '-');
                  re=/\.*((19|20\d{2})-([0]?[1-9]|[1][0-2])-([0-2][1-9]|3[0-1]|\d))+\.*/;
                  if(re.test(inputVal))
                     inputVal=inputVal.replace(re, "$1");
                  if(oVALIDATE.IsNumeric(inputVal)&&opt.Allow==='DateNotMoreCtrl') { if((parseInt(inputVal, 10))>=((new Date()).getFullYear())) { inputVal=((new Date()).getFullYear()); } }
                  if(oVALIDATE.IsNumeric(inputVal)&&opt.Allow==='DateNotLessCtrl') { if((parseInt(inputVal, 10))<=((new Date()).getFullYear())) { inputVal=((new Date()).getFullYear()); } }
                  else { t.val(""); return; }
               }
               else if(opt.Allow==='Year'||opt.Allow==='YearNotMore'||opt.Allow==='YearNotLess') {
                  inputVal=inputVal.replace('.', '-').replace('/', '-').replace('\\', '-');
                  re=/\.*(19|20\d{2})\.*/;
                  if(re.test(inputVal)) inputVal=inputVal.replace(re, "$1");
                  if(oVALIDATE.IsNumeric(inputVal)&&opt.Allow==='YearNotMore') { if((parseInt(inputVal, 10))>=((new Date()).getFullYear())) { inputVal=((new Date()).getFullYear()); } }
                  if(oVALIDATE.IsNumeric(inputVal)&&opt.Allow==='YearNotLess') { if((parseInt(inputVal, 10))<=((new Date()).getFullYear())) { inputVal=((new Date()).getFullYear()); } }
                  else { t.val(""); return; }
               }
               // \.*(19|20\d{2})\.*
               //\.*((19|20\d{2})[./-]([0]?[1-9]|[1][0-2])[./-]([0-2][1-9]|3[0-1]|\d))+\.*
               t.val(inputVal);
            });
         });
      }
   });
})(jQuery);
/* Lithuanian (UTF-8) initialisation for the jQuery UI date picker plugin. */
/* @author Arturas Paleicikas <arturas@avalon.lt> */
jQuery(function($) {
   $.datepicker.regional['lt']={
      closeText: 'Uždaryti',
      prevText: '&#x3c;Atgal',
      nextText: 'Pirmyn&#x3e;',
      currentText: 'Šiandien',
      monthNames: ['Sausis', 'Vasaris', 'Kovas', 'Balandis', 'Gegužė', 'Birželis',
                'Liepa', 'Rugpjūtis', 'Rugsėjis', 'Spalis', 'Lapkritis', 'Gruodis'],
      monthNamesShort: ['Sau', 'Vas', 'Kov', 'Bal', 'Geg', 'Bir',
                'Lie', 'Rugp', 'Rugs', 'Spa', 'Lap', 'Gru'],
      dayNames: ['sekmadienis', 'pirmadienis', 'antradienis', 'trečiadienis', 'ketvirtadienis', 'penktadienis', 'šeštadienis'],
      dayNamesShort: ['sek', 'pir', 'ant', 'tre', 'ket', 'pen', 'šeš'],
      dayNamesMin: ['Se', 'Pr', 'An', 'Tr', 'Ke', 'Pe', 'Še'],
      weekHeader: 'Sv',
      //dateFormat: 'yy-mm-dd',
      firstDay: 1,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: '',
      dateFormat: 'yy-mm-dd',
      changeMonth: true,
      showOtherMonths: true,
      selectOtherMonths: true
      //showWeek: true
   };
   $.datepicker.setDefaults($.datepicker.regional['lt'], { duration: 'fast' });
});
/**/
(function($) {
   $.fn.extend({
      swfUpload: function(options) {
         //privalomi duomenys: {RecId:??,UserId:??,tblUpdate:"tblContracts",url:??}
         var defaults={
            Title: "Pridėti bylas prie sutarties",
            Description: true,
            Legend: "Opa"
         }
         var opt=$.extend(defaults, options);
         return this.each(function() {
            var t=$(this);
            html=(opt.Legend)?"<fieldset><legend>"+opt.Legend+"</legend>":"";
            html+=(opt.CtrlToSetId)?"<div id='"+opt.CtrlToSetId+"'></div>":"";
            html+='<div title="'+opt.Title+'" style="cursor:pointer;margin-left:2em;position:relative;clear:both;"><span style="display:inline-block;" class="img24-attach ui-button-icon-primary"></span><span style="position:absolute;margin:.3em 1em;text-decoration:underline;color:#336699">Prisegti bylas</span></div>';
            html+=(opt.Legend)?"</fieldset>":"";
            $(html)
            .find("div:last")
            .bind("click", function() {
               var opt=$(this).closest("div.ExtendIt, span.ExtendIt").data("ctrl");
               $.extend(opt, { Control: t });
               oCONTROLS.UploadDialog(opt);
            })
            .qtip({ position: { at: 'top center', my: 'bottom center'} })
            .end()
            .appendTo(t);
         });
      }
   });
})(jQuery);
oCONTROLS.UploadDialog=function(options) {
   var FileData=[];
   var defaults={
      upload_url: "/Files/AsyncUpload",
      DialogTitle: 'Bylų prisegimas prie dokumento',
   }
   var opt=$.extend(defaults, options);
   if(!opt.UserId||!opt.tblUpdate||!opt.RecId) { alert("swfUploaderis neturi vieno iš būtinų parametrų-UserId,tblUpdate,RecId!"); return; }
   var fnSetAttachedFiles=function(fromFileData, CtrlToSetId) {
      var par={ RecordId: opt.RecId };
      if(fromFileData) { $.extend(par, { ctrl: CtrlToSetId, fromFileData: true, AttachedFiles: FileData, tblUpdate: opt.tblUpdate }); }
      else { $.extend(par, { ctrl: 'uplFiles', fromFileData: false, AttachedFiles: opt.AttachedFiles, FileData: FileData, tblUpdate: opt.tblUpdate }); }
      //if(oDATA.Get(par.AttachedFiles)) {  }
      oCONTROLS.UploadDialog.SetAttachedFiles(par);
   }
   dlgOpt={ autoOpen: false, minWidth: '400', minHeight: '700', width: '700', modal: true, title: opt.DialogTitle,
      buttons: {
         "Išeiti": function() {
            return $(this).dialog("close");
         }
      },
      close: function() {
         if(opt.fnCallBack) { opt.fnCallBack(FileData); }
         if(opt.CtrlToSetId) { fnSetAttachedFiles(true, opt.CtrlToSetId); }
         return $(this).remove();
      }
   };
   //{RecId:??,UserId:??,tblUpdate:"tblContracts",url:??}
   $("#dialog:ui-dialog").dialog("destroy");
   _html="<div id='uplFiles'></div><div id='swfupload-control' style='clear:both;'><p style='font-size:medium;margin:.5em 0 1em 0;'>Pasirinkite norimas prisegti bylas. Galite pasirinkti iš karto daugiau bylų naudodami mygtukus SHIFT/ CTRL. Vienu metu pasirinkite ne daugiau 10MB.";
   _html+="</p><div><span id='dialog_file_upload_btn' ></span></div>";
   _html+="<p id='queuestatus' ></p><ol id='log'></ol></div>"
   $("<div id='divDialogForm'></div>").html(_html).dialog(dlgOpt).dialog('open');
   //if(opt.AttachedFiles) { fnSetAttachedFiles(false); }
   fnSetAttachedFiles(false);//Sudedam failus kurie jau yra
   $('#swfupload-control').swfupload({
      upload_url: opt.upload_url,
      post_params: {
         RecId: opt.RecId,
         UserId: opt.UserId,
         tblUpdate: opt.tblUpdate
      },
      file_post_name: 'uploadfile',
      file_size_limit: "10 MB",
      //file_types: "*.jpg;*.png;*.gif",
      //file_types_description: "Image files",
      file_upload_limit: 0,
      flash_url: "/Scripts/Plugins/swfupload.swf",
      //button_image_url: '/Content/Images/wdp_buttons_upload_114x29.png',
      button_width: 400,
      button_height: 40,
      button_cursor: SWFUpload.CURSOR.HAND,
      button_placeholder: $('#dialog_file_upload_btn')[0],
      button_text: "<span class='theStyle'>Spragtelėkite pasirinkti bylas esančias jūsų kompiuteryje</span>",
      button_text_style: '.theStyle {text-decoration:underline;color:#336699;font-size:14;}',
      debug: false
   })
      .bind('fileQueued', function(event, file) {
         var listitem='<li id="'+file.id+'" >'+
         'Byla: <em>'+file.name+'</em> ('+Math.round(file.size/1024)+' KB) <span class="progressvalue" ></span>'+
         '<div class="progressbar" ><div class="progress" ></div></div>'+
         '<p class="status" >Pending</p>'+
         '<span class="cancel" >&nbsp;</span>'+
         '</li>';
         $('#log').append(listitem);
         $('li#'+file.id+' .cancel').bind('click', function() { //Remove from queue on cancel click
            var swfu=$.swfupload.getInstance('#swfupload-control');
            swfu.cancelUpload(file.id);
            $('li#'+file.id).slideUp('fast');
         });
         // start the upload since it's queued
         $(this).swfupload('startUpload');
      })
      .bind('fileQueueError', function(event, file, errorCode, message) {
         alert('Failo '+file.name+' dydis per didelis - '+Math.round(file.size/1024)+' KB');
      })
      .bind('fileDialogComplete', function(event, numFilesSelected, numFilesQueued) {
         //$('#queuestatus').text('Files Selected: '+numFilesSelected+' / Queued Files: '+numFilesQueued);
         $('#queuestatus').text('Pasirinkta failų siuntimui: '+numFilesQueued).css('display', 'block');
      })
      .bind('uploadStart', function(event, file) {
         $('#log li#'+file.id).find('p.status').text('Uploading...');
         $('#log li#'+file.id).find('span.progressvalue').text('0%');
         $('#log li#'+file.id).find('span.cancel').hide();
      })
      .bind('uploadProgress', function(event, file, bytesLoaded) {
         //Show Progress
         var percentage=Math.round((bytesLoaded/file.size)*100);
         $('#log li#'+file.id).find('div.progress').css('width', percentage+'%');
         $('#log li#'+file.id).find('span.progressvalue').text(percentage+'%');
      })
      .bind('uploadSuccess', function(event, file, serverData) {
         var s=JSON.parse(serverData);
         var item=$('#log li#'+file.id);
         var fData=(opt.AttachedFiles)?oDATA.Get(opt.AttachedFiles).Data:0;
         item.find('div.progress').css('width', '100%');
         item.find('span.progressvalue').text('100%');
         if(s.FileId>0) {
            var NewFile=[s.FileId, opt.UserId, s.Date, Math.round(file.size/1024), file.name, opt.RecId, ''];
            FileData[FileData.length]=NewFile;
            if(fData) { fData[fData.length]=NewFile; }
            var type=(file.name.substring(file.name.search("\\."))).toLowerCase()
            var pathtofile='<a href="/Uploads/'+s.FileId+type+'" alt="'+file.name+'" target="_blank">Atidaryti &raquo;</a>';
            item.attr("title", "Prisegė - "+s.User+", "+s.Date).addClass('success').find('p.status').html('Baigta - '+Math.round(file.size/1024)+' KB | '+pathtofile);
            if(file.name.IsImage()) { item.qtip({ content: '<IMG WIDTH=200 HEIGHT=200 SRC="'+'/Uploads/'+s.FileId+type+'" ALT="'+file.name+'">', position: { at: 'top right', my: 'bottom left'} }) }
            //else { item.qtip({ position: { corner: { target: "bottomLeft"}} }); }
            else { item.qtip({ style: { tip: "bottomLeft"} }) }
         } else {
            item.addClass('error').find('p.status').html('Nepavyko - '+s.Msg);
         }
      })
      .bind('uploadComplete', function(event, file) {
         // upload has completed, try the next one in the queue
         $(this).swfupload('startUpload');
         //setTimeout(function() {
         //   $('#'+file.id).fadeOut(1000, CallBackAfterNoteRemove($('#'+file.id)));
         //}, 3000); //ikisama callbacka kai baigia
      })
   //   var CallBackAfterNoteRemove=function(e) {
   //      e.remove();
   //      if(!$('.success').length) { $('#queuestatus').css('display', 'none'); }
   //   }
};
oCONTROLS.UploadDialog.SetAttachedFiles=function(par) {
   //{FileData:(jei reikia filtruot iš AttachedFiles), RecordId:??, ctrl:'uplFiles' arba i nurodyta,AttachedFiles: formatas kaip nurodyta zemiau}
   //0-FileId,User,Date-from server
   //3-SizeKB,FileName
   //5-RecordId,Description
   //ctrl turi but Recordo ID
   //var f=par.AttachedFiles,
   var u=oDATA.Get("tblUsers").Data;
   var LeftOuter="<div style='clear:left;'><div style='margin-top:10px;height:46px;width:37px;float:left;'>";
   var RightOuter="</div><div style='height:46px;width:305px;float:left;'>";
   var RightInner="<div style='height:15px;width:304px;float:left;'>";
   var ctrl=$("#"+par.ctrl).empty();
   $.post("/Files/GetUploads", { FileName: par.tblUpdate, RecordID: par.RecordId }, function(jsRes) {
      var f=jsRes.Files.Data;
      for(var i=0; i<f.length; i++) {
         if(!par.fromFileData) { par.FileData[par.FileData.length]=f[i]; }
         var html=LeftOuter+f[i][4].GetIcon(f[i][0])+RightOuter+RightInner;  //icon,
         html+="Byla: <a href='/Files/Download/"+f[i][0]+"'>"+f[i][4]+", "+f[i][3]+"KB</a></div>"; //FileName, size
         html+=RightInner+"Įkėlė: "+u.findColsByID(f[i][1], [2, 3])+", "+f[i][2]+"</div>"; //vartotojas,data
         html+=RightInner+'<div style="width:100%;" '+((f[i][6])?'>':'class="inputTip">')+((f[i][6])?f[i][6]:"")+'</div></div></div></div>'; //Pastaba
         $(html).appendTo(ctrl).find('div:last').MyEditInPlace({ id: f[i][0], tblUpdate: "tblDocs_UploadedFiles", Field: "Description", default_text: "Spragtelkit pridėti pastabą..", Title: "Pastaba apie failą",
            fnUpdateSuccess: function(pars) { pars.ctrl.removeClass("inputTip"); } //$ctrl,eOpt[is opciju],id
         });
      }
      $("#"+par.ctrl).find("span.img32-Img").each(function() {//rodom paveiksla ant imidzu
         var h=$(this).parent().attr("href");
         $(this).parent().qtip({
            content: '<IMG WIDTH=200 HEIGHT=200 SRC="'+h+'">', position: { at: 'top right', my: 'bottom left' }
         });
      });
   });
};
/// <reference path="../JSMain/jquery-1.6.2-vsdoc.js"
(function($) {
   $.widget("ui.ComboBox", {
      options: { ListType: "List", Editable: { Add: false, Edit: false }, iVal: 0, iText: [1], selectFirst: false, Value: "" },
      _create: function() {
         //surandam artimiausia inputa ant kurio desim listboxa
         //         if(this.element[0].nodeName==='INPUT') { var input=$(this.element[0]); }
         //         else {
         //            var t=this.element.parent().find('input')[0];
         //            if(t.nodeName==='INPUT') { var input=$(t); } else { alert('Error! Input not found for ComboBox! (MyPlugins_ComboBox:10)'); }
         //         }
         var input=$(this.element[0]); if(input===undefined) { alert('Error! Input not found for ComboBox! (MyPlugins_ComboBox:10)'); }
         var opt=$.extend(this.options, $(input).data("ctrl"));
         var fnEditItem=function(id) {
            new clsEditableForm({ objData: opt.Source, Action: (id)?"Edit":"Add", aRowData: (id)?oDATA.GetRow(id, opt.Source):0,
               CallBackAfter: function(RowData) {//Ikisam naujas val i newval, o teksta i inputa
                  $(input).data("newval", RowData[opt.iVal]); $(input).val(RowData.MapArrToString(opt.iText));
                  $(input).removeClass("inputTip");
                  var Action=(id)?"Edit":"Add";
                  if(Action==="Add") { data[data.length]=RowData.MapArrToString(opt.iText); }
                  else { data.UpdateArrToNew(RowData.MapArrToString(opt.iText)); }
               }
            })
         }
         //opt = $.extend({ ListType: "List", Editable: false, iVal: 0, iText: [1], selectFirst: false }, opt);     //ListType:{None(be nieko, galima spausdint), List(listas, spausdint negalima), Combo(Listas, spausdint galima)}
         var Editable=(opt.Editable.Add||opt.Editable.Edit)?true:false;
         var data=$.map(oDATA.Get(opt.Source).Data,
         function(a) {
            var ret=a.MapArrToString(opt.iText);
            //for(var i=0; i<opt.iText.length; i++) { { ret.push(a[opt.iText[i]]); } }
            if(a[0]===opt.Value) { input.val(ret); } //Idedam verte i textboxa
            return { id: a[0], value: ret };
         });

         //if(typeof data!='undefined') { if(input.val()==='') { log('<p style="color:red;">Listas "'+opt.Source+'" nerado value:'+opt.Value+'</p>'); } }

         if(typeof opt.Append!=='undefined') { data[data.length]=opt.Append; } //Pridedam prie listo pvz: {Value:0, Text:"Neapdrausta"}
         $(input).data("newval", opt.Value)
         //.val(value)
   .autocomplete({
      selectFirst: opt.selectFirst, delay: 0, minLength: ((this.options.ListType==="None")?2:0), autoFocus: true,

      //      source: function(request, response) {
      //         response($.ui.autocomplete.filter(data, request.term));
      //      },
      //            source: function(request, response) {
      //               var matcher=new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
      //               response(Ul.children("a").map(function() {
      //                  var text=$(this).text();
      //                  if(this.value&&(!request.term||matcher.test(text)))
      //                     return {
      //                        label: text.replace(
      //            											new RegExp("(?![^&;]+;)(?!<[^<>]*)("+$.ui.autocomplete.escapeRegex(request.term)+")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>"),
      //                        value: text,
      //                        option: this
      //                     };
      //               }));
      //            },
      //      source: function(request, response) {
      //         var matcher=new RegExp($.ui.autocomplete.escapeRegex(request.term), "i"), suggestions=[];
      //         input.removeClass('alink');
      //         $.each(data, function(i, a) {
      //            if(a.value&&(!request.term||matcher.test(a.value)))
      //            //suggestions.push({ label: text.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+$.ui.autocomplete.escapeRegex(request.term)+")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>"),
      //            suggestions.push({ label: a.value,
      //               value: a.value, // option: this,
      //               id: a.id
      //            });
      //         });
      //         response(suggestions);
      //      },
      source: function(request, response) {
         response($.ui.autocomplete.filter(data, request.term));
      },

      select: function(event, ui) {
         if(ui.item) { $(this).data("newval", ui.item.id); } //Kad pamatyt pasikeitima  $(this).trigger('keypress');

         //alert("select:"+ui.item.value);
         //ui.item.value  -  "Neapdrausta"  --	$(this).val()
         //ui.item.option.value  -  "0"	--	$(this).data("newval")
         //console.log("Select:"+$(this).data("newval"));
      }, change: function(event, ui) {
         //Isimenam naujas reiksmes
         if(ui.item) {
            $(this).data("newval", ui.item.id);
            //console.log("New change:"+$(this).data("newval"));
         }
         else {
            $(this).data("newval", "");
            var t=$(this); t.data("newval", "");
            //Jei yra default text ji paliekam
            if(opt.Tip) { if(opt.Tip===t.val()) return true; }
            // remove invalid value, as it didn't match anything
            t.val("");
            if(typeof input.data("autocomplete")!='undefined') input.data("autocomplete").term="";
            t.removeClass('alink'); return false;
         } //console.log("New:"+$(this).attr("data-newval"));
      }, close: function() {
         //$(input).rem
         if(opt.Editable.Edit) { //linko pridėjimas
            var t=input, newVal=t.data("newval"); // (t.data("newval"))?t.data("newval").replace("0", ""):"";
            if(!t.hasClass('alink')&&newVal) { t.addClass('alink').unbind('dblclick').bind('dblclick', function() { fnEditItem(newVal); }) }
            else if(newVal) { t.unbind('dblclick').bind('dblclick', function() { fnEditItem(newVal); }) }
            else if(t.hasClass('alink')&&!newVal) { t.removeClass('alink').unbind('dblclick'); }
         }
         if(opt.ListType!=="List") { input.removeClass("activeField"); }
         if(opt.fnValueChanged&&input.data("newval")) { opt.fnValueChanged(input.data("newval"), input.val()); } //NewVal,NewText
      }, open: function() {
         if(opt.ListType!=="List") { if(!input.hasClass("activeField")) { input.addClass("activeField"); } }
         if(opt.ListType=="None") {
            var acData=$(this).data('autocomplete');
            var termTemplate='<span style="color:red">%s</span>';
            acData.menu.element.find('a').each(function() {
               var me=$(this);
               var regex=new RegExp(acData.term, "gi");
               me.html(me.text().replace(regex, function(matched) {
                  return termTemplate.replace('%s', matched);
               }));
            });
         }
      }
   })
         //-----Inicializavimas pagal parametrus-------------------------------------------------------------------------------------
         if(opt.Editable.Edit) {
            var val=input.data("newval");
            if(val) { input.addClass('alink').bind('dblclick', function() { fnEditItem((val)?val:0); }); }
         }
         //---------------------------------------------------------------------------------------------------
         if(opt.ListType!=="None"||opt.Editable.Add) { input.removeClass("ui-corner-all").addClass("ui-corner-left"); } //ui-widget-content
         //pluginas AutoComplete Select first
         $(".ui-autocomplete-input").live("autocompleteopen", function() {
            var autocomplete=$(this).data("autocomplete"), menu=autocomplete.menu;
            if(!autocomplete.options.selectFirst) { return; }
            menu.activate($.Event({ type: "mouseenter" }), menu.element.children().first());
         });
         //---------------------------------------------------------------------------------------------------
         // This line added to set default value of the combobox
         $(input).data("autocomplete")._renderItem=function(ul, item) {
            return $("<li></li>").data("item.autocomplete", item).append("<a>"+item.value+"</a>").appendTo(ul);
         };
         if(opt.Editable.Add) {
            var id=$(this).data("newval"); id=(id)?id:0;
            this.addButton({ title: "Pridėti naują", icon: "img16-add_new",
               fn: function() {
                  fnEditItem(0);
               }, NoCorners: false
            }, input);
         };
         if(opt.ListType!="None") {
            this.addButton({ title: "Parodyti visus", icon: "ui-icon-triangle-1-s",
               fn: function() {
                  // close if already visible
                  if(input.autocomplete("widget").is(":visible")) { input.autocomplete("close"); return; }
                  // pass empty string as value to search for, displaying all results
                  input.autocomplete("search", ""); input.focus(); return false;
               }, NoCorners: ((opt.Editable.Add)?true:false)
            }, input);
            //input.focus(function() { input.autocomplete("search", ""); return false; }); //ant input focuso atidarom autocomplete
         };
         if(opt.ListType=="List") {
            input.attr("readonly", true);
            input.click(function() {
               if(input.autocomplete("widget").is(":visible")) { input.autocomplete("close"); return false; }
               input.autocomplete("search", ""); input.focus(); return false;
            }) //display all records
         } else {
            input.click(function() { this.select(); })
         }
      },
      addButton: function(p, input) {
         //title,icon,fn,NoCorners
         this.button=$("<button style='left:0;margin-left:.07em;'>&nbsp;</button>").attr("tabIndex", -1).attr("title", p.title).insertAfter(input)
                      .button({ icons: { primary: p.icon }, text: false }).css("vertical-align", "bottom").width(22).height(input.height()+3.8)
                      .click(function() { p.fn(); return false; })
                      .removeClass("ui-corner-all").addClass("ui-button-icon"+((p.NoCorners)?"":" ui-corner-right"))
                      .find('span.ui-icon').attr("style", "margin-left:0.1em;left:0;");
         input.width(input.width()-this.button.width());
      },
      destroy: function() {
         //input.remove();
         //if(typeof this.button!='undefined') this.button.remove(); //Reikia uncomentinti norint buttono
         //this.element.show();
         $.Widget.prototype.destroy.call(this);
      }
   });
})(jQuery);
