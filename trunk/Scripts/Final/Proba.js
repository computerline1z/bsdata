/// <reference path="../Plugins/jquery-1.6.2-vsdoc.js" />
oCONTROLS.UploadDialog=function(options) {
   var defaults={
      //upload_url: ??,
      Title: 'Bylų prisegimas prie dokumento'
   }
   var opt=$.extend(defaults, options);
   dlgOpt={ autoOpen: false, minWidth: '400', minHeight: '400', width: '700', modal: true, title: opt.Title,
      buttons: {
         "Išeiti": function() {
            return $(this).dialog("close");
         }
      },
      close: function() { return $(this).remove(); }
   };
   $("#dialog:ui-dialog").dialog("destroy");
   _html="<div id='swfupload-control'><p style='font-size:medium;margin:.5em 0 1em 0;'>Pasirinkite norimas prisegti bylas. Galite pasirinkti iš karto daugiau bylų naudodami mygtukus SHIFT/ CTRL. Vienu metu pasirinkite ne daugiau 10MB.";
   _html+="</p><div'><span id='dialog_file_upload_btn' ></span></div>";
   _html+="<p id='queuestatus' ></p></div>"
   //<ol id="log"></ol>
   $("<div id='divDialogForm'></div>").html(_html).dialog(dlgOpt).dialog('open');
   $('#swfupload-control').swfupload({
      upload_url: "/Files/AsyncUpload",
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
         //$('#log').append(listitem);
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
         var item=$('#log li#'+file.id);
         item.find('div.progress').css('width', '100%');
         item.find('span.progressvalue').text('100%');
         var pathtofile='<a href="uploads/'+file.name+'" target="_blank" >Atidaryti &raquo;</a>';
         item.addClass('success').find('p.status').html('Baigta - '+Math.round(file.size/1024)+' KB | '+pathtofile);
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