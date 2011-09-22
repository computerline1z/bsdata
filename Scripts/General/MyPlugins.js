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
            //$('<div title="Pasirinkite bylas siuntimui (galima naudoti CTRL/SHIFT pasirinkti keletą bylų iš karto" style="position:relative;margin:.7em;cursor:pointer;"><span style="display:inline-block;" class="img24-attach ui-button-icon-primary"></span><span style="position:absolute;margin:.3em 1em;text-decoration:underline;color:#336699">Prisegti bylas</span><p id="questatus"><p><p id="attachedFiles"><p></div>')
            html=(opt.Legend)?"<fieldset><legend>"+opt.Legend+"</legend>":"";
            html+='<div title='+opt.Title+' style="cursor:pointer;margin-left:2em;position:relative;"><span style="display:inline-block;" class="img24-attach ui-button-icon-primary"></span><span style="position:absolute;margin:.3em 1em;text-decoration:underline;color:#336699">Prisegti bylas</span></div>';
            html+=(opt.Legend)?"</fieldset>":"";
            $(html)
            .find("div")
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
   var Files=[{}];
   var defaults={
      upload_url: "/Files/AsyncUpload",
      DialogTitle: 'Bylų prisegimas prie dokumento'
   }
   var opt=$.extend(defaults, options);
   if(!opt.UserId||!opt.tblUpdate||!opt.RecId) { alert("swfUploaderis neturi vieno iš būtinų parametrų-UserId,tblUpdate,RecId!"); return; }
   dlgOpt={ autoOpen: false, minWidth: '400', minHeight: '700', width: '700', modal: true, title: opt.DialogTitle,
      buttons: {
         "Išeiti": function() {
            oCONTROLS.UploadDialog.SetAttachedFiles(File);
            return $(this).dialog("close");
         }
      },
      close: function() { return $(this).remove(); }
   };
   //{RecId:??,UserId:??,tblUpdate:"tblContracts",url:??}
   $("#dialog:ui-dialog").dialog("destroy");
   _html="<div id='swfupload-control'><p style='font-size:medium;margin:.5em 0 1em 0;'>Pasirinkite norimas prisegti bylas. Galite pasirinkti iš karto daugiau bylų naudodami mygtukus SHIFT/ CTRL. Vienu metu pasirinkite ne daugiau 10MB.";
   _html+="</p><div'><span id='dialog_file_upload_btn' ></span></div>";
   _html+="<p id='queuestatus' ></p><ol id='log'></ol></div>"
   $("<div id='divDialogForm'></div>").html(_html).dialog(dlgOpt).dialog('open');
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
         'File: <em>'+file.name+'</em> ('+Math.round(file.size/1024)+' KB) <span class="progressvalue" ></span>'+
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
         item.find('div.progress').css('width', '100%');
         item.find('span.progressvalue').text('100%');
         if(s.FileID>0) {
            $.extend(s, { SizeKB: Math.round(file.size/1024), FileName: file.name });
            Files[Files.length]=s; //Isimenam duomenis
            var pathtofile='<a href="/Files/AsyncUpload/'+file.name+'">Atsisiųsti &raquo;</a>';
            pathtofile+='<a href="/Files/AsyncUpload/'+file.name+'" target="_blank">Atsisiųsti2 &raquo;</a>';
            //pathtofile+='<img href="/Files/'+file.name+'" alt="'+file.name+'">Atidaryti &raquo;</a>';
            item.attr("title", "Prisegė - "+s.User+", "+s.Date).qtip().addClass('success').find('p.status').html('Baigta - '+Math.round(file.size/1024)+' KB | '+pathtofile);
            if(file.name.IsImage) { item.qtip({ content: '<IMG SRC="'+'Uploads/'+s.FileId+'" ALT="'+file.name+'">' }) }
         } else {
            item.addClass('error').find('p.status').html('Nepavyko - '+s.Msg);
         }
      })
      .bind('uploadComplete', function(event, file) {
         // upload has completed, try the next one in the queue
         $(this).swfupload('startUpload');
         //         setTimeout(function() {
         //            $('#'+file.id).fadeOut(1000, CallBackAfterNoteRemove($('#'+file.id)));
         //         }, 3000); //ikisama callbacka kai baigia
      })
   var CallBackAfterNoteRemove=function(e) {
      e.remove();
      if(!$('.success').length) { $('#queuestatus').css('display', 'none'); }
   }
}
oCONTROLS.UploadDialog.SetAttachedFiles=function(files, ctrl) {
   //0-FileId,User,Date-from server
   //3-SizeKB,FileName
   //-Description
   for(var i=0; i<Files.length; i++) {
      html+="<tr><td><span style='display:inline-block;' class='img24-attach ui-button-icon-primary'></span></td>";
      html+="<td></td><td></td></tr>";
      function GetClass(ftype) {
      }
   }
   opt.Control.t.append((html+"</table>"));
}