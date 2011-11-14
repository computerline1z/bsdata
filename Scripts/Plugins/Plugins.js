/*
* jQuery UI Mask @VERSION
*
* Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* Based on the jquery.maskedinput.js plugin by Josh Bush (digitalbush.com)
*
* http://docs.jquery.com/UI/Mask
*
* Depends:
*   ui.core.js
*/
(function($) {

   var pasteEventName=($.browser.msie?'paste':'input')+".mask";

   $.widget("ui.mask", {

      _init: function() {

         var options=this.options, self=this;

         $.extend(this, { caret: function(begin, end) { return $.ui.mask.caret(self.element, begin, end); } });

         if(!options.mask||!options.mask.length) { return; } //no mask pattern defined. no point in continuing.
         if(!options.placeholder||!options.placeholder.length) {
            options.placeholder='_'; //in case the user decided to nix a placeholder. 
         }

         this._prepareBuffer();
         this._bindEvents();
         this._checkVal((this.element.val().length&&options.allowPartials)); //Perform initial check for existing values
      },

      destroy: function() {
         this.element
         .unbind('.mask')
         .removeData('mask');
      },

      value: function() {
         var input=this.element,
         self=this,
         res=$.map(self.buffer, function(c, i) { return self.tests[i]?c:null; }).join(''),
         r=new RegExp('\\'+this.options.placeholder, 'gi');
         return res.replace(r, '');
      },

      formatted: function() {
         var r=new RegExp('\\'+this.options.placeholder, 'gi'),
         res=this.element.val();
         return res.replace(r, '');
      },

      apply: function() {
         this.element.trigger('apply.mask');
      },

      _setData: function(key, value) {

         $.widget.prototype._setData.apply(this, arguments);
         var options=this.options;

         switch(key) {
            case 'mask':
               //no mask pattern defined. no point in continuing.
               if(!options.mask||!options.mask.length) {
                  this.element.unbind('.mask')
                  break;
               }
            case 'placeholder':
               if(!options.placeholder||!options.placeholder.length) {
                  options.placeholder='_'; //in case the user decided to nix a placeholder.
               }
               this.element.val('');
               this._prepareBuffer();
               !this.eventsBound&&this._bindEvents();
               break;
         }

      },

      _prepareBuffer: function() {

         this._escapeMask();

         var self=this,
         input=this.element,
         options=this.options,
         mask=options.mask,
         defs=$.ui.mask.definitions,
         tests=[],
         partialPosition=mask.length,
         firstNonMaskPos=null,
         len=mask.length;

         //if we're applying the mask to an element which is not an input, it won't have a val() method. fake one for our purposes.
         if(!input.is(':input')) input.val=input.html;

         $.each(mask.split(""), function(i, c) {
            if(c=='?') {
               len--;
               partialPosition=i;
            }
            else if(defs[c]) {
               tests.push(new RegExp(defs[c]));
               if(firstNonMaskPos==null)
                  firstNonMaskPos=tests.length-1;
            }
            else {
               tests.push(null);
            }
         });

         $.extend(this, {
            buffer: $.map(mask.split(""), function(c, i) {
               if(c!='?') {
                  return defs[c]?options.placeholder:c;
               }
            }),
            tests: tests,
            firstNonMaskPos: firstNonMaskPos,
            partialPosition: partialPosition
         });

         this.buffer=$.map(this.buffer, function(c, i) {
            if(c=="\t") {
               return self.maskEscaped[i];
            }
            return c;
         });

         this.options.mask=mask=this.maskEscaped;
      },

      _bindEvents: function() {

         var self=this,
         input=this.element,
         ignore=false,  			//Variable for ignoring control keys
         focusText=input.val();

         function keydownEvent(e) {
            e=e||window.event;
            var pos=self.caret(),
            k=e.keyCode,
            keyCode=$.ui.keyCode;

            ignore=(k<keyCode.SHIFT||(k>keyCode.SHIFT&&k<keyCode.SPACE)||(k>keyCode.SPACE&&k<41));

            //delete selection before proceeding
            if((pos.begin-pos.end)!=0&&(!ignore||k==keyCode.BACKSPACE||k==keyCode.DELETE))
               self._clearBuffer(pos.begin, pos.end);

            //backspace, delete, and escape get special treatment
            if(k==keyCode.BACKSPACE||k==keyCode.DELETE) {//backspace/delete
               self._shiftL(pos.begin+((k==keyCode.DELETE||(k==keyCode.BACKSPACE&&pos.begin!=pos.end))?0:-1), Math.abs(pos.begin-pos.end));
               return false;
            }
            else if(k==keyCode.ESCAPE) {//escape
               input.val(focusText);
               self.caret(0, self._checkVal());
               return false;
            }
         };

         function keypressEvent(e) {

            e=e||window.event;

            var k=e.charCode||e.keyCode||e.which,
            keyCode=$.ui.keyCode,
            len=self.options.mask.length;

            if(ignore) {
               ignore=false;
               //Fixes Mac FF bug on backspace
               return (e.keyCode==keyCode.BACKSPACE)?false:null;
            }

            var pos=self.caret();

            if(e.ctrlKey||e.altKey||e.metaKey) {//Ignore
               return true;
            }
            else if((k>=keyCode.SPACE&&k<=125)||k>186) {//typeable characters
               var p=self._seekNext(pos.begin-1);
               if(p<len) {
                  var c=String.fromCharCode(k);
                  if(self.tests[p]&&self.tests[p].test(c)) {
                     self._shiftR(p);
                     self.buffer[p]=c;
                     self._writeBuffer();
                     var next=self._seekNext(p);
                     self.caret(next);
                     self.options.completed&&next==len&&self.options.completed.call(input);
                  }
               }
            }
            return false;
         };

         if(!input.attr("readonly")) {
            input
            .bind("focus.mask", function() {
               focusText=input.val();
               var pos=self._checkVal();
               self._writeBuffer();
               setTimeout(function() {
                  if(pos==self.options.mask.length)
                     self.caret(0, pos);
                  else
                     self.caret(pos);
               }, 0);
            })
            .bind("blur.mask", function() {
               self._checkVal();
               if(input.val()!=focusText)
                  input.change();
            })
            .bind('apply.mask', function() { //changing the value of an input without keyboard input requires re-applying the mask.
               focusText=input.val();
               var pos=self._checkVal();
               self._writeBuffer();
            })
            .bind("keydown.mask", keydownEvent)
            .bind("keypress.mask", keypressEvent)
            .bind(pasteEventName, function() {
               setTimeout(function() { self.caret(self._checkVal(true)); }, 0);
            });
            this.eventsBound=true;
         }
      },

      _writeBuffer: function() {
         return this.element.val(this.buffer.join('')).val();
      },

      _clearBuffer: function(start, end) {
         var len=this.options.mask.length;
         for(var i=start; i<end&&i<len; i++) {
            if(this.tests[i])
               this.buffer[i]=this.options.placeholder;
         }
      },

      _seekNext: function(pos) {
         var len=this.options.mask.length;
         while(++pos<=len&&!this.tests[pos]);
         return pos;
      },

      _shiftR: function(pos) {
         var len=this.options.mask.length;
         for(var i=pos, c=this.options.placeholder; i<len; i++) {
            if(this.tests[i]) {
               var j=this._seekNext(i);
               var t=this.buffer[i];
               this.buffer[i]=c;
               if(j<len&&this.tests[j].test(t)) {
                  c=t;
               }
               else {
                  break;
               }
            }
         }
      },

      _shiftL: function(pos, length) {

         while(!this.tests[pos]&& --pos>=0);

         var originalPos=pos,
         len=this.options.mask.length,
         placeholder=this.options.placeholder;

         for(var i=pos; i<len&&(i>=0||length>1); i++) {
            if(this.tests[i]) {
               this.buffer[i]=placeholder;
               var j=this._seekNext(i);
               if(j<len&&this.tests[i].test(this.buffer[j])) {
                  this.buffer[pos]=this.buffer[j];
                  this.buffer[j]=placeholder;
                  pos++;
                  while(!this.tests[pos]) pos++;
               }
            }
         }
         this._writeBuffer();
         this.caret(Math.max(this.firstNonMaskPos, originalPos));
      },

      _checkVal: function(allow) {
         //try to place characters where they belong
         var input=this.element,
         test=input.val(),
         len=this.options.mask.length,
         lastMatch= -1;

         for(var i=0, pos=0; i<len; i++) {
            if(this.tests[i]) {
               this.buffer[i]=this.options.placeholder;
               while(pos++ <test.length) {
                  var c=test.charAt(pos-1);
                  if(this.tests[i].test(c)) {
                     this.buffer[i]=c;
                     lastMatch=i;
                     break;
                  }
               }
               if(pos>test.length)
                  break;
            }
            else if(this.buffer[i]==test[pos]&&i!=this.partialPosition) {
               pos++;
               lastMatch=i;
            }
         }
         if(!allow&&lastMatch+1<this.partialPosition) {
            if(!this.options.allowPartials||!this.value().length) {
               input.val("");
               this._clearBuffer(0, len);
            }
            else //if we're allowing partial input/inital values, and the element we're masking isnt an input, then we need to allow the mask to apply.
               if(!input.is(':input')) this._writeBuffer();

         }
         else if(allow||lastMatch+1>=this.partialPosition) {
            this._writeBuffer();
            if(!allow) input.val(input.val().substring(0, lastMatch+1));
         }
         return (this.partialPosition?i:this.firstNonMaskPos);
      },

      _escapeMask: function() {
         var mask=this.options.mask,
         literals=[],
         replacements=[];

         for(var i=0; i<mask.length; i++) {
            var c, temp=mask[i]||mask.charAt(i);
            if(temp!="\\"||mask[i-1]=="\\") {
               if(mask[i-1]=="\\") {
                  c="\t";
                  replacements[literals.length]=temp;
               }
               else {
                  c=temp;
               }
               literals[literals.length]=c;
            }
         }

         this.options.mask=literals.join('');

         for(var i=0; i<literals.length; i++) {
            if(replacements[i]!==undefined) {
               literals[i]=replacements[i];
            }
         }

         this.maskEscaped=literals.join('');
      }

   });

   $.extend($.ui.mask, {
      version: "@VERSION",
      getter: "value formatted",
      defaults: {
         mask: '',
         placeholder: '_',
         completed: null,
         allowPartials: true
      },
      definitions: { //Predefined character definitions
         '#': "[\\d]",
         'a': "[A-Za-z]",
         '*': "[A-Za-z0-9]"
      },
      caret: function(element, begin, end) {	//Helper Function for Caret positioning
         var input=element[0];
         if(typeof begin=='number') {
            end=(typeof end=='number')?end:begin;
            if(input.setSelectionRange) {
               input.focus();
               input.setSelectionRange(begin, end);
            } else if(input.createTextRange) {
               var range=input.createTextRange();
               range.collapse(true);
               range.moveEnd('character', end);
               range.moveStart('character', begin);
               range.select();
            }
            return element;
         } else {
            if(input.setSelectionRange) {
               begin=input.selectionStart;
               end=input.selectionEnd;
            }
            else if(document.selection&&document.selection.createRange) {
               var range=document.selection.createRange();
               begin=0-range.duplicate().moveStart('character', -100000);
               end=begin+range.text.length;
            }
            return { begin: begin, end: end };
         }
      }
   });

})(jQuery);

/*

A jQuery edit in place plugin

Version 2.3.0

Authors:
Dave Hauenstein
Martin Häcker <spamfaenger [at] gmx [dot] de>

Project home:
http://code.google.com/p/jquery-in-place-editor/

Patches with tests welcomed! For guidance see the tests  </spec/unit/>. To submit, attach them to the bug tracker.

License:
This source file is subject to the BSD license bundled with this package.
Available online: {@link http://www.opensource.org/licenses/bsd-license.php}
If you did not receive a copy of the license, and are unable to obtain it,
learn to use a search engine.

*/
(function($) {
   $.fn.editInPlace=function(options) {
      var settings=$.extend({}, $.fn.editInPlace.defaults, options);
      assertMandatorySettingsArePresent(settings);
      preloadImage(settings.saving_image);

      return this.each(function() {
         var dom=$(this);
         // This won't work with live queries as there is no specific element to attach this
         // one way to deal with this could be to store a reference to self and then compare that in click?
         if(dom.data('editInPlace'))
            return; // already an editor here
         dom.data('editInPlace', true);

         new InlineEditor(settings, dom).init();
      });
   };

   /// Switch these through the dictionary argument to $(aSelector).editInPlace(overideOptions)
   /// Required Options: Either url or callback, so the editor knows what to do with the edited values.
   $.fn.editInPlace.defaults={
      url: "/Update/EditInPlace", // string: POST URL to send edited content
      bg_over: "#ffc", // string: background color of hover of unactivated editor
      bg_out: "transparent", // string: background color on restore from hover
      hover_class: "editInPlace",  // string: class added to root element during hover. Will override bg_over and bg_out
      show_buttons: false, // boolean: will show the buttons: cancel or save; will automatically cancel out the onBlur functionality
      save_button: '<button class="inplace_save">Išsaugoti</button>', // string: image button tag to use as “Save” button
      cancel_button: '<button class="inplace_cancel">Atšaukti</button>', // string: image button tag to use as “Cancel” button
      params: "", // string: example: first_name=dave&last_name=hauenstein extra paramters sent via the post request to the server
      field_type: "text", // string: "text", "textarea", or "select";  The type of form field that will appear on instantiation
      default_text: "(spragtelti teksto įvedimui)", // string: text to show up if the element that has this functionality is empty
      use_html: false, // boolean, set to true if the editor should use jQuery.fn.html() to extract the value to show from the dom node
      textarea_rows: 4, // integer: set rows attribute of textarea, if field_type is set to textarea. Use CSS if possible though
      textarea_cols: 10, // integer: set cols attribute of textarea, if field_type is set to textarea. Use CSS if possible though
      select_text: "Pasirinkite..", // string: default text to show up in select box
      select_options: "", // string or array: Used if field_type is set to 'select'. Can be comma delimited list of options 'textandValue,text:value', Array of options ['textAndValue', 'text:value'] or array of arrays ['textAndValue', ['text', 'value']]. The last form is especially usefull if your labels or values contain colons)
      text_size: null, // integer: set cols attribute of text input, if field_type is set to text. Use CSS if possible though

      // Specifying callback_skip_dom_reset will disable all saving_* options
      saving_text: undefined, // string: text to be used when server is saving information. Example "Saving..."
      saving_image: "/Content/images/ajax-loader.gif", // string: uses saving text specify an image location instead of text while server is saving
      saving_animation_color: 'transparent', // hex color string, will be the color the pulsing animation during the save pulses to. Note: Only works if jquery-ui is loaded

      value_required: false, // boolean: if set to true, the element will not be saved unless a value is entered
      element_id: "element_id", // string: name of parameter holding the id or the editable
      update_value: "update_value", // string: name of parameter holding the updated/edited value
      original_value: 'original_value', // string: name of parameter holding the updated/edited value
      original_html: "original_html", // string: name of parameter holding original_html value of the editable /* DEPRECATED in 2.2.0 */ use original_value instead.
      save_if_nothing_changed: false,  // boolean: submit to function or server even if the user did not change anything
      on_blur: "save", // string: "save" or null; what to do on blur; will be overridden if show_buttons is true
      cancel: "", // string: if not empty, a jquery selector for elements that will not cause the editor to open even though they are clicked. E.g. if you have extra buttons inside editable fields

      // All callbacks will have this set to the DOM node of the editor that triggered the callback

      callback: null, // function: function to be called when editing is complete; cancels ajax submission to the url param. Prototype: function(idOfEditor, enteredText, orinalHTMLContent, settingsParams, callbacks). The function needs to return the value that should be shown in the dom. Returning undefined means cancel and will restore the dom and trigger an error. callbacks is a dictionary with two functions didStartSaving and didEndSaving() that you can use to tell the inline editor that it should start and stop any saving animations it has configured. /* DEPRECATED in 2.1.0 */ Parameter idOfEditor, use $(this).attr('id') instead
      callback_skip_dom_reset: false, // boolean: set this to true if the callback should handle replacing the editor with the new value to show
      success: null, // function: this function gets called if server responds with a success. Prototype: function(newEditorContentString)
      error: function() { Alert("Nepavyko išsaugoti", "Serverio klaida"); }, // function: this function gets called if server responds with an error. Prototype: function(request)
      error_sink: function(idOfEditor, errorString) { alert(errorString); }, // function: gets id of the editor and the error. Make sure the editor has an id, or it will just be undefined. If set to null, no error will be reported. /* DEPRECATED in 2.1.0 */ Parameter idOfEditor, use $(this).attr('id') instead
      preinit: null, // function: this function gets called after a click on an editable element but before the editor opens. If you return false, the inline editor will not open. Prototype: function(currentDomNode). DEPRECATED in 2.2.0 use delegate shouldOpenEditInPlace call instead
      postclose: null, // function: this function gets called after the inline editor has closed and all values are updated. Prototype: function(currentDomNode). DEPRECATED in 2.2.0 use delegate didCloseEditInPlace call instead
      delegate: null // object: if it has methods with the name of the callbacks documented below in delegateExample these will be called. This means that you just need to impelment the callbacks you are interested in.
   };

   // Lifecycle events that the delegate can implement
   // this will always be fixed to the delegate
   var delegateExample={
      // called while opening the editor.
      // return false to prevent editor from opening
      shouldOpenEditInPlace: function(aDOMNode, aSettingsDict, triggeringEvent) {
         alert("opa");
      },
      // return content to show in inplace editor
      willOpenEditInPlace: function(aDOMNode, aSettingsDict) { },
      didOpenEditInPlace: function(aDOMNode, aSettingsDict) { },

      // called while closing the editor
      // return false to prevent the editor from closing
      shouldCloseEditInPlace: function(aDOMNode, aSettingsDict, triggeringEvent) { },
      // return value will be shown during saving
      willCloseEditInPlace: function(aDOMNode, aSettingsDict) {
         alert("opa");
      },
      didCloseEditInPlace: function(aDOMNode, aSettingsDict) { },

      missingCommaErrorPreventer: ''
   };

   function InlineEditor(settings, dom) {
      this.settings=settings;
      this.dom=dom;
      this.originalValue=null;
      this.didInsertDefaultText=false;
      this.shouldDelayReinit=false;
   };

   $.extend(InlineEditor.prototype, {
      init: function() {
         this.setDefaultTextIfNeccessary();
         this.connectOpeningEvents();
      },

      reinit: function() {
         if(this.shouldDelayReinit)
            return;

         this.triggerCallback(this.settings.postclose, /* DEPRECATED in 2.1.0 */this.dom);
         this.triggerDelegateCall('didCloseEditInPlace');

         this.markEditorAsInactive();
         this.connectOpeningEvents();
      },

      setDefaultTextIfNeccessary: function() {
         if(''!==this.dom.html())
            return;

         this.dom.html(this.settings.default_text);
         this.didInsertDefaultText=true;
      },

      connectOpeningEvents: function() {
         var that=this;
         this.dom
         .bind('mouseenter.editInPlace', function() { that.addHoverEffect(); })
         .bind('mouseleave.editInPlace', function() { that.removeHoverEffect(); })
         .bind('click.editInPlace', function(anEvent) { that.openEditor(anEvent); });
      },

      disconnectOpeningEvents: function() {
         // prevent re-opening the editor when it is already open
         this.dom.unbind('.editInPlace');
      },

      addHoverEffect: function() {
         if(this.settings.hover_class)
            this.dom.addClass(this.settings.hover_class);
         else
            this.dom.css("background-color", this.settings.bg_over);
      },

      removeHoverEffect: function() {
         if(this.settings.hover_class)
            this.dom.removeClass(this.settings.hover_class);
         else
            this.dom.css("background-color", this.settings.bg_out);
      },

      openEditor: function(anEvent) {
         if(!this.shouldOpenEditor(anEvent))
            return;

         this.disconnectOpeningEvents();
         this.removeHoverEffect();
         this.removeInsertedDefaultTextIfNeccessary();
         this.saveOriginalValue();
         this.markEditorAsActive();
         this.replaceContentWithEditor();
         this.setInitialValue();
         this.workAroundMissingBlurBug();
         this.connectClosingEventsToEditor();
         this.triggerDelegateCall('didOpenEditInPlace');
      },

      shouldOpenEditor: function(anEvent) {
         if(this.isClickedObjectCancelled(anEvent.target))
            return false;

         if(false===this.triggerCallback(this.settings.preinit, /* DEPRECATED in 2.1.0 */this.dom))
            return false;

         if(false===this.triggerDelegateCall('shouldOpenEditInPlace', true, anEvent))
            return false;

         return true;
      },

      removeInsertedDefaultTextIfNeccessary: function() {
         if(!this.didInsertDefaultText
         ||this.dom.html()!==this.settings.default_text)
            return;

         this.dom.html('');
         this.didInsertDefaultText=false;
      },

      isClickedObjectCancelled: function(eventTarget) {
         if(!this.settings.cancel)
            return false;

         var eventTargetAndParents=$(eventTarget).parents().andSelf();
         var elementsMatchingCancelSelector=eventTargetAndParents.filter(this.settings.cancel);
         return 0!==elementsMatchingCancelSelector.length;
      },

      saveOriginalValue: function() {
         if(this.settings.use_html)
            this.originalValue=this.dom.html();
         else
            this.originalValue=trim(this.dom.text());
      },

      restoreOriginalValue: function() {
         this.setClosedEditorContent(this.originalValue);
      },

      setClosedEditorContent: function(aValue) {
         if(this.settings.use_html)
            this.dom.html(aValue);
         else
            this.dom.text(aValue);
      },

      workAroundMissingBlurBug: function() {
         // Strangely, all browser will forget to send a blur event to an input element
         // when another one is created and selected programmatically. (at least under some circumstances).
         // This means that if another inline editor is opened, existing inline editors will _not_ close
         // if they are configured to submit when blurred.

         // Using parents() instead document as base to workaround the fact that in the unittests
         // the editor is not a child of window.document but of a document fragment
         var ourInput=this.dom.find(':input');
         this.dom.parents(':last').find('.editInPlace-active :input').not(ourInput).blur();
      },

      replaceContentWithEditor: function() {
         var buttons_html=(this.settings.show_buttons)?this.settings.save_button+' '+this.settings.cancel_button:'';
         var editorElement=this.createEditorElement(); // needs to happen before anything is replaced
         /* insert the new in place form after the element they click, then empty out the original element */
         this.dom.html('<form class="inplace_form" style="display: inline; margin: 0; padding: 0;"></form>')
         .find('form')
            .append(editorElement)
            .append(buttons_html);
      },

      createEditorElement: function() {
         if(-1===$.inArray(this.settings.field_type, ['text', 'textarea', 'select']))
            throw "Unknown field_type <fnord>, supported are 'text', 'textarea' and 'select'";

         var editor=null;
         if("select"===this.settings.field_type)
            editor=this.createSelectEditor();
         else if("text"===this.settings.field_type)
            editor=$('<input type="text" '+this.inputNameAndClass()
            +' size="'+this.settings.text_size+'" />');
         else if("textarea"===this.settings.field_type)
            editor=$('<textarea '+this.inputNameAndClass()
            +' rows="'+this.settings.textarea_rows+'" '
            +' cols="'+this.settings.textarea_cols+'" />');

         return editor;
      },

      setInitialValue: function() {
         var initialValue=this.triggerDelegateCall('willOpenEditInPlace', this.originalValue);
         var editor=this.dom.find(':input');
         editor.val(initialValue);

         // Workaround for select fields which don't contain the original value.
         // Somehow the browsers don't like to select the instructional choice (disabled) in that case
         if(editor.val()!==initialValue)
            editor.val(''); // selects instructional choice
      },

      inputNameAndClass: function() {
         return ' name="inplace_value" class="inplace_field" ';
      },

      createSelectEditor: function() {
         var editor=$('<select'+this.inputNameAndClass()+'>'
         +'<option disabled="true" value="">'+this.settings.select_text+'</option>'
         +'</select>');

         var optionsArray=this.settings.select_options;
         if(!$.isArray(optionsArray))
            optionsArray=optionsArray.split(',');

         for(var i=0; i<optionsArray.length; i++) {
            var currentTextAndValue=optionsArray[i];
            if(!$.isArray(currentTextAndValue))
               currentTextAndValue=currentTextAndValue.split(':');

            var value=trim(currentTextAndValue[1]||currentTextAndValue[0]);
            var text=trim(currentTextAndValue[0]);

            var option=$('<option>').val(value).text(text);
            editor.append(option);
         }

         return editor;
      },

      connectClosingEventsToEditor: function() {
         var that=this;
         function cancelEditorAction(anEvent) {
            that.handleCancelEditor(anEvent);
            return false; // stop event bubbling
         }
         function saveEditorAction(anEvent) {
            that.handleSaveEditor(anEvent);
            return false; // stop event bubbling
         }

         var form=this.dom.find("form");

         form.find(".inplace_field").focus().select();
         form.find(".inplace_cancel").click(cancelEditorAction);
         form.find(".inplace_save").click(saveEditorAction);

         if(!this.settings.show_buttons) {
            // TODO: Firefox has a bug where blur is not reliably called when focus is lost
            //       (for example by another editor appearing)
            if("save"===this.settings.on_blur)
               form.find(".inplace_field").blur(saveEditorAction);
            else
               form.find(".inplace_field").blur(cancelEditorAction);

            // workaround for msie & firefox bug where it won't submit on enter if no button is shown
            if($.browser.mozilla||$.browser.msie)
               this.bindSubmitOnEnterInInput();
         }

         form.keyup(function(anEvent) {
            // allow canceling with escape
            var escape=27;
            if(escape===anEvent.which)
               return cancelEditorAction();
         });

         // workaround for webkit nightlies where they won't submit at all on enter
         // REFACT: find a way to just target the nightlies
         if($.browser.safari)
            this.bindSubmitOnEnterInInput();

         form.submit(saveEditorAction);
      },

      bindSubmitOnEnterInInput: function() {
         if('textarea'===this.settings.field_type)
            return; // can't enter newlines otherwise

         var that=this;
         this.dom.find(':input').keyup(function(event) {
            var enter=13;
            if(enter===event.which)
               return that.dom.find('form').submit();
         });
      },

      handleCancelEditor: function(anEvent) {
         // REFACT: remove duplication between save and cancel
         if(false===this.triggerDelegateCall('shouldCloseEditInPlace', true, anEvent))
            return;

         var enteredText=this.dom.find(':input').val();
         enteredText=this.triggerDelegateCall('willCloseEditInPlace', enteredText);

         this.restoreOriginalValue();
         if(hasContent(enteredText)
         &&!this.isDisabledDefaultSelectChoice())
            this.setClosedEditorContent(enteredText);
         this.reinit();
      },

      handleSaveEditor: function(anEvent) {
         if(false===this.triggerDelegateCall('shouldCloseEditInPlace', true, anEvent))
            return;

         var enteredText=this.dom.find(':input').val();
         enteredText=this.triggerDelegateCall('willCloseEditInPlace', enteredText);

         if(this.isDisabledDefaultSelectChoice()
         ||this.isUnchangedInput(enteredText)) {
            this.handleCancelEditor(anEvent);
            return;
         }

         if(this.didForgetRequiredText(enteredText)) {
            this.handleCancelEditor(anEvent);
            this.reportError("Error: You must enter a value to save this field");
            return;
         }

         this.showSaving(enteredText);

         if(this.settings.callback)
            this.handleSubmitToCallback(enteredText);
         else
            this.handleSubmitToServer(enteredText);
      },

      didForgetRequiredText: function(enteredText) {
         return this.settings.value_required
         &&(""===enteredText
            ||undefined===enteredText
            ||null===enteredText);
      },

      isDisabledDefaultSelectChoice: function() {
         return this.dom.find('option').eq(0).is(':selected:disabled');
      },

      isUnchangedInput: function(enteredText) {
         return !this.settings.save_if_nothing_changed
         &&this.originalValue===enteredText;
      },

      showSaving: function(enteredText) {
         if(this.settings.callback&&this.settings.callback_skip_dom_reset)
            return;

         var savingMessage=enteredText;
         if(hasContent(this.settings.saving_text))
            savingMessage=this.settings.saving_text;
         if(hasContent(this.settings.saving_image))
         // REFACT: alt should be the configured saving message
            savingMessage=$('<img />').attr('src', this.settings.saving_image).attr('alt', savingMessage);
         this.dom.html(savingMessage);
      },

      handleSubmitToCallback: function(enteredText) {
         // REFACT: consider to encode enteredText and originalHTML before giving it to the callback
         this.enableOrDisableAnimationCallbacks(true, false);
         var newHTML=this.triggerCallback(this.settings.callback, /* DEPRECATED in 2.1.0 */this.id(), enteredText, this.originalValue,
         this.settings.params, this.savingAnimationCallbacks());

         if(this.settings.callback_skip_dom_reset)
            ; // do nothing
         else if(undefined===newHTML) {
            // failure; put original back
            this.reportError("Error: Failed to save value: "+enteredText);
            this.restoreOriginalValue();
         }
         else
         // REFACT: use setClosedEditorContent
            this.dom.html(newHTML);

         if(this.didCallNoCallbacks()) {
            this.enableOrDisableAnimationCallbacks(false, false);
            this.reinit();
         }
      },

      handleSubmitToServer: function(enteredText) {
         var data=this.settings.update_value+'='+encodeURIComponent(enteredText)
         +'&'+this.settings.element_id+'='+this.dom.attr("id")
         +((this.settings.params)?'&'+this.settings.params:'')
         +'&'+this.settings.original_html+'='+encodeURIComponent(this.originalValue) /* DEPRECATED in 2.2.0 */
         +'&'+this.settings.original_value+'='+encodeURIComponent(this.originalValue);

         this.enableOrDisableAnimationCallbacks(true, false);
         this.didStartSaving();
         var that=this;
         $.ajax({
            url: that.settings.url,
            type: "POST",
            data: data,
            dataType: "html",
            complete: function(request) {
               that.didEndSaving();
            },
            success: function(html) {
               var new_text=html||that.settings.default_text;

               /* put the newly updated info into the original element */
               // FIXME: should be affected by the preferences switch
               that.dom.html(new_text);
               // REFACT: remove dom parameter, already in this, not documented, should be easy to remove
               // REFACT: callback should be able to override what gets put into the DOM
               that.triggerCallback(that.settings.success, html);
            },
            error: function(request) {
               that.dom.html(that.originalHTML); // REFACT: what about a restorePreEditingContent()
               if(that.settings.error)
               // REFACT: remove dom parameter, already in this, not documented, can remove without deprecation
               // REFACT: callback should be able to override what gets entered into the DOM
                  that.triggerCallback(that.settings.error, request);
               else
                  that.reportError("Failed to save value: "+request.responseText||'Unspecified Error');
            }
         });
      },

      // Utilities .........................................................

      triggerCallback: function(aCallback /*, arguments */) {
         if(!aCallback)
            return; // callback wasn't specified after all

         var callbackArguments=Array.prototype.slice.call(arguments, 1);
         return aCallback.apply(this.dom[0], callbackArguments);
      },

      /// defaultReturnValue is only used if the delegate returns undefined
      triggerDelegateCall: function(aDelegateMethodName, defaultReturnValue, optionalEvent) {
         // REFACT: consider to trigger equivalent callbacks automatically via a mapping table?
         if(!this.settings.delegate
         ||!$.isFunction(this.settings.delegate[aDelegateMethodName]))
            return defaultReturnValue;

         var delegateReturnValue=this.settings.delegate[aDelegateMethodName](this.dom, this.settings, optionalEvent);
         return (undefined===delegateReturnValue)
         ?defaultReturnValue
         :delegateReturnValue;
      },

      reportError: function(anErrorString) {
         this.triggerCallback(this.settings.error_sink, /* DEPRECATED in 2.1.0 */this.id(), anErrorString);
      },

      // REFACT: this method should go, callbacks should get the dom node itself as an argument
      id: function() {
         return this.dom.attr('id');
      },

      markEditorAsActive: function() {
         this.dom.addClass('editInPlace-active');
      },

      markEditorAsInactive: function() {
         this.dom.removeClass('editInPlace-active');
      },

      // REFACT: consider rename, doesn't deal with animation directly
      savingAnimationCallbacks: function() {
         var that=this;
         return {
            didStartSaving: function() { that.didStartSaving(); },
            didEndSaving: function() { that.didEndSaving(); }
         };
      },

      enableOrDisableAnimationCallbacks: function(shouldEnableStart, shouldEnableEnd) {
         this.didStartSaving.enabled=shouldEnableStart;
         this.didEndSaving.enabled=shouldEnableEnd;
      },

      didCallNoCallbacks: function() {
         return this.didStartSaving.enabled&&!this.didEndSaving.enabled;
      },

      assertCanCall: function(methodName) {
         if(!this[methodName].enabled)
            throw new Error('Cannot call '+methodName+' now. See documentation for details.');
      },

      didStartSaving: function() {
         this.assertCanCall('didStartSaving');
         this.shouldDelayReinit=true;
         this.enableOrDisableAnimationCallbacks(false, true);

         this.startSavingAnimation();
      },

      didEndSaving: function() {
         this.assertCanCall('didEndSaving');
         this.shouldDelayReinit=false;
         this.enableOrDisableAnimationCallbacks(false, false);
         this.reinit();

         this.stopSavingAnimation();
      },

      startSavingAnimation: function() {
         var that=this;
         this.dom
         .animate({ backgroundColor: this.settings.saving_animation_color }, 400)
         .animate({ backgroundColor: 'transparent' }, 400, 'swing', function() {
            // In the tests animations are turned off - i.e they happen instantaneously.
            // Hence we need to prevent this from becomming an unbounded recursion.
            setTimeout(function() { that.startSavingAnimation(); }, 10);
         });
      },

      stopSavingAnimation: function() {
         this.dom
         .stop(true)
         .css({ backgroundColor: '' });
      },

      missingCommaErrorPreventer: ''
   });

   // Private helpers .......................................................

   function assertMandatorySettingsArePresent(options) {
      // one of these needs to be non falsy
      if(options.url||options.callback)
         return;
      options.url="/Update/EditInPlace";
      //throw new Error("Need to set either url: or callback: option for the inline editor to work.");
   }

   /* preload the loading icon if it is configured */
   function preloadImage(anImageURL) {
      if(''===anImageURL)
         return;

      var loading_image=new Image();
      loading_image.src=anImageURL;
   }

   function trim(aString) {
      return aString
      .replace(/^\s+/, '')
      .replace(/\s+$/, '');
   }

   function hasContent(something) {
      if(undefined===something||null===something)
         return false;

      if(0===something.length)
         return false;

      return true;
   }
})(jQuery);

/*
jquery.layout 1.3.0 - Release Candidate 29.14
$Date: 2011-02-13 08:00:00 (Sun, 13 Feb 2011) $
$Rev: 302914 $

Copyright (c) 2010
Fabrizio Balliano (http://www.fabrizioballiano.net)
Kevin Dalman (http://allpro.net)

Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.

Changelog: http://layout.jquery-dev.net/changelog.cfm#1.3.0.rc29.13

Docs: http://layout.jquery-dev.net/documentation.html
Tips: http://layout.jquery-dev.net/tips.html
Help: http://groups.google.com/group/jquery-ui-layout
*/
//(function(i) {
//	var na=i.browser; i.layout={ browser: { mozilla: !!na.mozilla, webkit: !!na.webkit||!!na.safari, msie: !!na.msie, isIE6: !!na.msie&&na.version==6, boxModel: false }, scrollbarWidth: function() { return window.scrollbarWidth||i.layout.getScrollbarSize("width") }, scrollbarHeight: function() { return window.scrollbarHeight||i.layout.getScrollbarSize("height") }, getScrollbarSize: function(p) {
//		var v=i('<div style="position: absolute; top: -10000px; left: -10000px; width: 100px; height: 100px; overflow: scroll;"></div>').appendTo("body"),
//u={ width: v.width()-v[0].clientWidth, height: v.height()-v[0].clientHeight }; v.remove(); window.scrollbarWidth=u.width; window.scrollbarHeight=u.height; return p.match(/^(width|height)$/i)?u[p]:u
//	}, showInvisibly: function(p, v) { if(!p) return {}; p.jquery||(p=i(p)); var u={ display: p.css("display"), visibility: p.css("visibility") }; if(v||u.display=="none") { p.css({ display: "block", visibility: "hidden" }); return u } else return {} }, getElemDims: function(p) {
//		var v={}, u=v.css={}, z={}, L, T, N=p.offset(); v.offsetLeft=N.left; v.offsetTop=
//N.top; i.each("Left,Right,Top,Bottom".split(","), function(D, I) { L=u["border"+I]=i.layout.borderWidth(p, I); T=u["padding"+I]=i.layout.cssNum(p, "padding"+I); z[I]=L+T; v["inset"+I]=T }); v.offsetWidth=p.innerWidth(); v.offsetHeight=p.innerHeight(); v.outerWidth=p.outerWidth(); v.outerHeight=p.outerHeight(); v.innerWidth=v.outerWidth-z.Left-z.Right; v.innerHeight=v.outerHeight-z.Top-z.Bottom; u.width=p.width(); u.height=p.height(); return v
//	}, getElemCSS: function(p, v) {
//		var u={}, z=p[0].style, L=v.split(","), T="Top,Bottom,Left,Right".split(","),
//N="Color,Style,Width".split(","), D, I, oa, ba, ca, ga; for(ba=0; ba<L.length; ba++) { D=L[ba]; if(D.match(/(border|padding|margin)$/)) for(ca=0; ca<4; ca++) { I=T[ca]; if(D=="border") for(ga=0; ga<3; ga++) { oa=N[ga]; u[D+I+oa]=z[D+I+oa] } else u[D+I]=z[D+I] } else u[D]=z[D] } return u
//	}, cssWidth: function(p, v) { var u=i.layout.borderWidth, z=i.layout.cssNum; if(v<=0) return 0; if(!i.layout.browser.boxModel) return v; u=v-u(p, "Left")-u(p, "Right")-z(p, "paddingLeft")-z(p, "paddingRight"); return Math.max(0, u) }, cssHeight: function(p, v) {
//		var u=
//i.layout.borderWidth, z=i.layout.cssNum; if(v<=0) return 0; if(!i.layout.browser.boxModel) return v; u=v-u(p, "Top")-u(p, "Bottom")-z(p, "paddingTop")-z(p, "paddingBottom"); return Math.max(0, u)
//	}, cssNum: function(p, v) { p.jquery||(p=i(p)); var u=i.layout.showInvisibly(p), z=parseInt(i.curCSS(p[0], v, true), 10)||0; p.css(u); return z }, borderWidth: function(p, v) {
//		if(p.jquery) p=p[0]; var u="border"+v.substr(0, 1).toUpperCase()+v.substr(1); return i.curCSS(p, u+"Style", true)=="none"?0:parseInt(i.curCSS(p, u+"Width", true), 10)||
//0
//	}, isMouseOverElem: function(p, v) { var u=i(v||this), z=u.offset(), L=z.top; z=z.left; var T=z+u.outerWidth(); u=L+u.outerHeight(); var N=p.pageX, D=p.pageY; return i.layout.browser.msie&&N<0&&D<0||N>=z&&N<=T&&D>=L&&D<=u }
//	}; i.fn.layout=function(p) {
//		function v(a) {
//			if(!a) return true; var b=a.keyCode; if(b<33) return true; var c={ 38: "north", 40: "south", 37: "west", 39: "east" }, d=a.shiftKey, e=a.ctrlKey, h, f, g, j; if(e&&b>=37&&b<=40&&m[c[b]].enableCursorHotkey) j=c[b]; else if(e||d) i.each(k.borderPanes.split(","), function(o, n) {
//				h=
//m[n]; f=h.customHotkey; g=h.customHotkeyModifier; if(d&&g=="SHIFT"||e&&g=="CTRL"||e&&d) if(f&&b==(isNaN(f)||f<=9?f.toUpperCase().charCodeAt(0):f)) { j=n; return false }
//			}); if(!j||!q[j]||!m[j].closable||l[j].isHidden) return true; pa(j); a.stopPropagation(); return a.returnValue=false
//		} function u(a) {
//			if(this&&this.tagName) a=this; var b; if(O(a)) b=q[a]; else if(i(a).data("layoutRole")) b=i(a); else i(a).parents().each(function() { if(i(this).data("layoutRole")) { b=i(this); return false } }); if(b&&b.length) {
//				var c=b.data("layoutEdge");
//				a=l[c]; a.cssSaved&&z(c); if(a.isSliding||a.isResizing||a.isClosed) a.cssSaved=false; else { var d={ zIndex: k.zIndex.pane_normal+2 }, e={}, h=b.css("overflow"), f=b.css("overflowX"), g=b.css("overflowY"); if(h!="visible") { e.overflow=h; d.overflow="visible" } if(f&&!f.match(/visible|auto/)) { e.overflowX=f; d.overflowX="visible" } if(g&&!g.match(/visible|auto/)) { e.overflowY=f; d.overflowY="visible" } a.cssSaved=e; b.css(d); i.each(k.allPanes.split(","), function(j, o) { o!=c&&z(o) }) }
//			}
//		} function z(a) {
//			if(this&&this.tagName) a=this;
//			var b; if(O(a)) b=q[a]; else if(i(a).data("layoutRole")) b=i(a); else i(a).parents().each(function() { if(i(this).data("layoutRole")) { b=i(this); return false } }); if(b&&b.length) { a=b.data("layoutEdge"); a=l[a]; var c=a.cssSaved||{}; !a.isSliding&&!a.isResizing&&b.css("zIndex", k.zIndex.pane_normal); b.css(c); a.cssSaved=false }
//		} function L(a, b, c) {
//			var d=i(a); if(d.length) if(k.borderPanes.indexOf(b)=== -1) alert(F.errButton+F.Pane.toLowerCase()+": "+b); else {
//				a=m[b].buttonClass+"-"+c; d.addClass(a+" "+a+"-"+b).data("layoutName",
//m.name); return d
//			} else alert(F.errButton+F.selector+": "+a); return null
//		} function T(a, b, c) { switch(b.toLowerCase()) { case "toggle": N(a, c); break; case "open": D(a, c); break; case "close": I(a, c); break; case "pin": oa(a, c); break; case "toggle-slide": N(a, c, true); break; case "open-slide": D(a, c, true) } } function N(a, b, c) { (a=L(a, b, "toggle"))&&a.click(function(d) { pa(b, !!c); d.stopPropagation() }) } function D(a, b, c) { (a=L(a, b, "open"))&&a.attr("title", F.Open).click(function(d) { U(b, !!c); d.stopPropagation() }) } function I(a, b) {
//			var c=
//L(a, b, "close"); c&&c.attr("title", F.Close).click(function(d) { P(b); d.stopPropagation() })
//		} function oa(a, b) { var c=L(a, b, "pin"); if(c) { var d=l[b]; c.click(function(e) { ca(i(this), b, d.isSliding||d.isClosed); d.isSliding||d.isClosed?U(b):P(b); e.stopPropagation() }); ca(c, b, !d.isClosed&&!d.isSliding); k[b].pins.push(a) } } function ba(a, b) { i.each(k[a].pins, function(c, d) { ca(i(d), a, b) }) } function ca(a, b, c) {
//			var d=a.attr("pin"); if(!(d&&c==(d=="down"))) {
//				d=m[b].buttonClass+"-pin"; var e=d+"-"+b; b=d+"-up "+e+"-up"; d=d+"-down "+
//e+"-down"; a.attr("pin", c?"down":"up").attr("title", c?F.Unpin:F.Pin).removeClass(c?b:d).addClass(c?d:b)
//			}
//		} function ga(a) { a=i.extend({}, m.cookie, a||{}).name||m.name||"Layout"; var b=document.cookie; b=b?b.split(";"):[]; for(var c, d=0, e=b.length; d<e; d++) { c=i.trim(b[d]).split("="); if(c[0]==a) return Pa(decodeURIComponent(c[1])) } return "" } function Ca(a, b) {
//			var c=i.extend({}, m.cookie, b||{}), d=c.name||m.name||"Layout", e="", h="", f=false; if(c.expires.toUTCString) h=c.expires; else if(typeof c.expires=="number") {
//				h=
//new Date; if(c.expires>0) h.setDate(h.getDate()+c.expires); else { h.setYear(1970); f=true }
//			} if(h) e+=";expires="+h.toUTCString(); if(c.path) e+=";path="+c.path; if(c.domain) e+=";domain="+c.domain; if(c.secure) e+=";secure"; if(f) { l.cookie={}; document.cookie=d+"="+e } else { l.cookie=Da(a||c.keys); document.cookie=d+"="+encodeURIComponent(Qa(l.cookie))+e } return i.extend({}, l.cookie)
//		} function Ra(a) { if(a=ga(a)) { l.cookie=i.extend({}, a); Sa(a) } return a } function Sa(a, b) {
//			i.extend(true, m, a); if(l.initialized) {
//				var c, d, e=!b; i.each(k.allPanes.split(","),
//function(h, f) { c=a[f]; if(typeof c=="object") { d=c.initHidden; d===true&&ya(f, e); d===false&&ta(f, false, e); d=c.size; d>0&&ha(f, d); d=c.initClosed; d===true&&P(f, false, e); d===false&&U(f, false, e) } })
//			}
//		} function Da(a) {
//			var b={}, c={ isClosed: "initClosed", isHidden: "initHidden" }, d, e, h; if(!a) a=m.cookie.keys; if(i.isArray(a)) a=a.join(","); a=a.replace(/__/g, ".").split(","); for(var f=0, g=a.length; f<g; f++) {
//				d=a[f].split("."); e=d[0]; d=d[1]; if(!(k.allPanes.indexOf(e)<0)) {
//					h=l[e][d]; if(h!=undefined) {
//						if(d=="isClosed"&&l[e].isSliding) h=
//true; (b[e]||(b[e]={}))[c[d]?c[d]:d]=h
//					}
//				}
//			} return b
//		} function Qa(a) { function b(c) { var d=[], e=0, h, f, g; for(h in c) { f=c[h]; g=typeof f; if(g=="string") f='"'+f+'"'; else if(g=="object") f=b(f); d[e++]='"'+h+'":'+f } return "{"+d.join(",")+"}" } return b(a) } function Pa(a) { try { return window.eval("("+a+")")||{} } catch(b) { return {} } } var F={ Pane: "Pane", Open: "Open", Close: "Close", Resize: "Resize", Slide: "Slide Open", Pin: "Pin", Unpin: "Un-Pin", selector: "selector", msgNoRoom: "Not enough room to show this pane.", errContainerMissing: "UI Layout Initialization Error\n\nThe specified layout-container does not exist.",
//			errCenterPaneMissing: "UI Layout Initialization Error\n\nThe center-pane element does not exist.\n\nThe center-pane is a required element.", errContainerHeight: "UI Layout Initialization Warning\n\nThe layout-container \"CONTAINER\" has no height.\n\nTherefore the layout is 0-height and hence 'invisible'!", errButton: "Error Adding Button \n\nInvalid "
//		}, m={ name: "", containerClass: "ui-layout-container", scrollToBookmarkOnLoad: true, resizeWithWindow: true, resizeWithWindowDelay: 200, resizeWithWindowMaxDelay: 0,
//			onresizeall_start: null, onresizeall_end: null, onload_start: null, onload_end: null, onunload_start: null, onunload_end: null, autoBindCustomButtons: false, zIndex: null, defaults: { applyDemoStyles: false, closable: true, resizable: true, slidable: true, initClosed: false, initHidden: false, contentSelector: ".ui-layout-content", contentIgnoreSelector: ".ui-layout-ignore", findNestedContent: false, paneClass: "ui-layout-pane", resizerClass: "ui-layout-resizer", togglerClass: "ui-layout-toggler", buttonClass: "ui-layout-button", minSize: 0,
//				maxSize: 0, spacing_open: 6, spacing_closed: 6, togglerLength_open: 50, togglerLength_closed: 50, togglerAlign_open: "center", togglerAlign_closed: "center", togglerTip_open: F.Close, togglerTip_closed: F.Open, togglerContent_open: "", togglerContent_closed: "", resizerDblClickToggle: true, autoResize: true, autoReopen: true, resizerDragOpacity: 1, maskIframesOnResize: true, resizeNestedLayout: true, resizeWhileDragging: false, resizeContentWhileDragging: false, noRoomToOpenTip: F.msgNoRoom, resizerTip: F.Resize, sliderTip: F.Slide, sliderCursor: "pointer",
//				slideTrigger_open: "click", slideTrigger_close: "mouseleave", slideDelay_open: 300, slideDelay_close: 300, hideTogglerOnSlide: false, preventQuickSlideClose: !!(i.browser.webkit||i.browser.safari), preventPrematureSlideClose: false, showOverflowOnHover: false, enableCursorHotkey: true, customHotkeyModifier: "SHIFT", fxName: "slide", fxSpeed: null, fxSettings: {}, fxOpacityFix: true, triggerEventsOnLoad: false, triggerEventsWhileDragging: true, onshow_start: null, onshow_end: null, onhide_start: null, onhide_end: null, onopen_start: null,
//				onopen_end: null, onclose_start: null, onclose_end: null, onresize_start: null, onresize_end: null, onsizecontent_start: null, onsizecontent_end: null, onswap_start: null, onswap_end: null, ondrag_start: null, ondrag_end: null
//			}, north: { paneSelector: ".ui-layout-north", size: "auto", resizerCursor: "n-resize", customHotkey: "" }, south: { paneSelector: ".ui-layout-south", size: "auto", resizerCursor: "s-resize", customHotkey: "" }, east: { paneSelector: ".ui-layout-east", size: 200, resizerCursor: "e-resize", customHotkey: "" }, west: { paneSelector: ".ui-layout-west",
//				size: 200, resizerCursor: "w-resize", customHotkey: ""
//			}, center: { paneSelector: ".ui-layout-center", minWidth: 0, minHeight: 0 }, useStateCookie: false, cookie: { name: "", autoSave: true, autoLoad: true, domain: "", path: "", expires: "", secure: false, keys: "north.size,south.size,east.size,west.size,north.isClosed,south.isClosed,east.isClosed,west.isClosed,north.isHidden,south.isHidden,east.isHidden,west.isHidden" }
//		}, Ea={ slide: { all: { duration: "fast" }, north: { direction: "up" }, south: { direction: "down" }, east: { direction: "right" }, west: { direction: "left"} },
//			drop: { all: { duration: "slow" }, north: { direction: "up" }, south: { direction: "down" }, east: { direction: "right" }, west: { direction: "left"} }, scale: { all: { duration: "fast"} }
//		}, l={ id: "layout"+(new Date).getTime(), initialized: false, container: {}, north: {}, south: {}, east: {}, west: {}, center: {}, cookie: {} }, k={ allPanes: "north,south,west,east,center", borderPanes: "north,south,west,east", altSide: { north: "south", south: "north", east: "west", west: "east" }, hidden: { visibility: "hidden" }, visible: { visibility: "visible" }, zIndex: { pane_normal: 1,
//			resizer_normal: 2, iframe_mask: 2, pane_sliding: 100, pane_animate: 1E3, resizer_drag: 1E4
//		}, resizers: { cssReq: { position: "absolute", padding: 0, margin: 0, fontSize: "1px", textAlign: "left", overflow: "hidden" }, cssDemo: { background: "#DDD", border: "none"} }, togglers: { cssReq: { position: "absolute", display: "block", padding: 0, margin: 0, overflow: "hidden", textAlign: "center", fontSize: "1px", cursor: "pointer", zIndex: 1 }, cssDemo: { background: "#AAA"} }, content: { cssReq: { position: "relative" }, cssDemo: { overflow: "auto", padding: "10px" }, cssDemoPane: { overflow: "hidden",
//			padding: 0
//		}
//		}, panes: { cssReq: { position: "absolute", margin: 0 }, cssDemo: { padding: "10px", background: "#FFF", border: "1px solid #BBB", overflow: "auto"} }, north: { side: "Top", sizeType: "Height", dir: "horz", cssReq: { top: 0, bottom: "auto", left: 0, right: 0, width: "auto" }, pins: [] }, south: { side: "Bottom", sizeType: "Height", dir: "horz", cssReq: { top: "auto", bottom: 0, left: 0, right: 0, width: "auto" }, pins: [] }, east: { side: "Right", sizeType: "Width", dir: "vert", cssReq: { left: "auto", right: 0, top: "auto", bottom: "auto", height: "auto" }, pins: [] }, west: { side: "Left",
//			sizeType: "Width", dir: "vert", cssReq: { left: 0, right: "auto", top: "auto", bottom: "auto", height: "auto" }, pins: []
//		}, center: { dir: "center", cssReq: { left: "auto", right: "auto", top: "auto", bottom: "auto", height: "auto", width: "auto"} }
//		}, E={ data: {}, set: function(a, b, c) { E.clear(a); E.data[a]=setTimeout(b, c) }, clear: function(a) { var b=E.data; if(b[a]) { clearTimeout(b[a]); delete b[a] } } }, O=function(a) { try { return typeof a=="string"||typeof a=="object"&&a.constructor.toString().match(/string/i)!==null } catch(b) { return false } }, B=function(a,
//b) { return Math.max(a, b) }, gb=function(a) { var b, c={ cookie: {}, defaults: { fxSettings: {} }, north: { fxSettings: {} }, south: { fxSettings: {} }, east: { fxSettings: {} }, west: { fxSettings: {} }, center: { fxSettings: {}} }; a=a||{}; if(a.effects||a.cookie||a.defaults||a.north||a.south||a.west||a.east||a.center) c=i.extend(true, c, a); else i.each(a, function(d, e) { b=d.split("__"); if(!b[1]||c[b[0]]) c[b[1]?b[0]:"defaults"][b[1]?b[1]:b[0]]=e }); return c }, Ta=function(a, b, c) {
//	function d(h) {
//		var f=k[h]; if(f.doCallback) {
//			e.push(h); h=f.callback.split(",")[1];
//			h!=b&&!i.inArray(h, e)>=0&&d(h)
//		} else { f.doCallback=true; f.callback=a+","+b+","+(c?1:0) }
//	} var e=[]; i.each(k.borderPanes.split(","), function(h, f) { if(k[f].isMoving) { d(f); return false } })
//}, Ua=function(a) { a=k[a]; k.isLayoutBusy=false; delete a.isMoving; if(a.doCallback&&a.callback) { a.doCallback=false; var b=a.callback.split(","), c=b[2]>0?true:false; if(b[0]=="open") U(b[1], c); else b[0]=="close"&&P(b[1], c); if(!a.doCallback) a.callback=null } }, y=function(a, b) {
//	if(b) {
//		var c; try {
//			if(typeof b=="function") c=b; else if(O(b)) if(b.match(/,/)) {
//				var d=
//b.split(","); c=eval(d[0]); if(typeof c=="function"&&d.length>1) return c(d[1])
//			} else c=eval(b); else return; if(typeof c=="function") return a&&q[a]?c(a, q[a], i.extend({}, l[a]), m[a], m.name):c(qa, i.extend({}, l), m, m.name)
//		} catch(e) { }
//	}
//}, Va=function(a, b) { if(!a) return {}; a.jquery||(a=i(a)); var c={ display: a.css("display"), visibility: a.css("visibility") }; if(b||c.display=="none") { a.css({ display: "block", visibility: "hidden" }); return c } else return {} }, Wa=function(a) {
//	if(!l.browser.mozilla) {
//		var b=q[a]; l[a].tagName=="IFRAME"?
//b.css(k.hidden).css(k.visible):b.find("IFRAME").css(k.hidden).css(k.visible)
//	}
//}, ia=function(a, b) { a.jquery||(a=i(a)); var c=Va(a), d=parseInt(i.curCSS(a[0], b, true), 10)||0; a.css(c); return d }, ua=function(a, b) { if(a.jquery) a=a[0]; var c="border"+b.substr(0, 1).toUpperCase()+b.substr(1); return i.curCSS(a, c+"Style", true)=="none"?0:parseInt(i.curCSS(a, c+"Width", true), 10)||0 }, R=function(a, b) {
//	var c=O(a), d=c?q[a]:i(a); if(isNaN(b)) b=c?Z(a):d.outerWidth(); if(b<=0) return 0; if(!l.browser.boxModel) return b; c=b-ua(d, "Left")-
//ua(d, "Right")-ia(d, "paddingLeft")-ia(d, "paddingRight"); return B(0, c)
//}, S=function(a, b) { var c=O(a), d=c?q[a]:i(a); if(isNaN(b)) b=c?Z(a):d.outerHeight(); if(b<=0) return 0; if(!l.browser.boxModel) return b; c=b-ua(d, "Top")-ua(d, "Bottom")-ia(d, "paddingTop")-ia(d, "paddingBottom"); return B(0, c) }, za=function(a) { var b=k[a].dir; a={ minWidth: 1001-R(a, 1E3), minHeight: 1001-S(a, 1E3) }; if(b=="horz") a.minSize=a.minHeight; if(b=="vert") a.minSize=a.minWidth; return a }, hb=function(a, b, c) {
//	var d=a; if(O(a)) d=q[a]; else a.jquery||
//(d=i(a)); a=S(d, b); d.css({ height: a, visibility: "visible" }); if(a>0&&d.innerWidth()>0) { if(c&&d.data("autoHidden")) { d.show().data("autoHidden", false); l.browser.mozilla||d.css(k.hidden).css(k.visible) } } else c&&!d.data("autoHidden")&&d.hide().data("autoHidden", true)
//}, da=function(a, b, c) {
//	if(!c) c=k[a].dir; if(O(b)&&b.match(/%/)) b=parseInt(b, 10)/100; if(b===0) return 0; else if(b>=1) return parseInt(b, 10); else if(b>0) {
//		a=m; var d; if(c=="horz") d=r.innerHeight-(q.north?a.north.spacing_open:0)-(q.south?a.south.spacing_open:
//0); else if(c=="vert") d=r.innerWidth-(q.west?a.west.spacing_open:0)-(q.east?a.east.spacing_open:0); return Math.floor(d*b)
//	} else if(a=="center") return 0; else { d=q[a]; c=c=="horz"?"height":"width"; a=Va(d); var e=d.css(c); d.css(c, "auto"); b=c=="height"?d.outerHeight():d.outerWidth(); d.css(c, e).css(a); return b }
//}, Z=function(a, b) { var c=q[a], d=m[a], e=l[a], h=b?d.spacing_open:0; d=b?d.spacing_closed:0; return !c||e.isHidden?0:e.isClosed||e.isSliding&&b?d:k[a].dir=="horz"?c.outerHeight()+h:c.outerWidth()+h }, $=function(a,
//b) {
//	var c=m[a], d=l[a], e=k[a], h=e.dir; e.side.toLowerCase(); e.sizeType.toLowerCase(); e=b!=undefined?b:d.isSliding; var f=c.spacing_open, g=k.altSide[a], j=l[g], o=q[g], n=!o||j.isVisible===false||j.isSliding?0:h=="horz"?o.outerHeight():o.outerWidth(); g=(!o||j.isHidden?0:m[g][j.isClosed!==false?"spacing_closed":"spacing_open"])||0; j=h=="horz"?r.innerHeight:r.innerWidth; o=za("center"); o=h=="horz"?B(m.center.minHeight, o.minHeight):B(m.center.minWidth, o.minWidth); e=j-f-(e?0:da("center", o, h)+n+g); h=d.minSize=
//B(da(a, c.minSize), za(a).minSize); f=c.maxSize?da(a, c.maxSize):1E5; e=d.maxSize=Math.min(f, e); d=d.resizerPosition={}; f=r.insetTop; n=r.insetLeft; g=r.innerWidth; j=r.innerHeight; c=c.spacing_open; switch(a) { case "north": d.min=f+h; d.max=f+e; break; case "west": d.min=n+h; d.max=n+e; break; case "south": d.min=f+j-e-c; d.max=f+j-h-c; break; case "east": d.min=n+g-e-c; d.max=n+g-h-c }
//}, ja=function(a) {
//	var b={}, c=b.css={}, d={}, e, h, f=a.offset(); b.offsetLeft=f.left; b.offsetTop=f.top; i.each("Left,Right,Top,Bottom".split(","),
//function(g, j) { e=c["border"+j]=ua(a, j); h=c["padding"+j]=ia(a, "padding"+j); d[j]=e+h; b["inset"+j]=h }); b.offsetWidth=a.innerWidth(); b.offsetHeight=a.innerHeight(); b.outerWidth=a.outerWidth(); b.outerHeight=a.outerHeight(); b.innerWidth=b.outerWidth-d.Left-d.Right; b.innerHeight=b.outerHeight-d.Top-d.Bottom; c.width=a.width(); c.height=a.height(); return b
//}, Aa=function(a, b) {
//	var c={}, d=a[0].style, e=b.split(","), h="Top,Bottom,Left,Right".split(","), f="Color,Style,Width".split(","), g, j, o, n, w, t; for(n=0; n<e.length; n++) {
//		g=
//e[n]; if(g.match(/(border|padding|margin)$/)) for(w=0; w<4; w++) { j=h[w]; if(g=="border") for(t=0; t<3; t++) { o=f[t]; c[g+j+o]=d[g+j+o] } else c[g+j]=d[g+j] } else c[g]=d[g]
//	} return c
//}, Fa=function(a, b) {
//	var c=i(a), d=c.data("layoutRole"), e=c.data("layoutEdge"), h=m[e][d+"Class"]; e="-"+e; var f=c.hasClass(h+"-closed")?"-closed":"-open", g=f=="-closed"?"-open":"-closed"; f=h+"-hover "+(h+e+"-hover ")+(h+f+"-hover ")+(h+e+f+"-hover "); if(b) f+=h+g+"-hover "+(h+e+g+"-hover "); if(d=="resizer"&&c.hasClass(h+"-sliding")) f+=h+
//"-sliding-hover "+(h+e+"-sliding-hover "); return i.trim(f)
//}, Ga=function(a, b) { var c=i(b||this); a&&c.data("layoutRole")=="toggler"&&a.stopPropagation(); c.addClass(Fa(c)) }, aa=function(a, b) { var c=i(b||this); c.removeClass(Fa(c, true)) }, Xa=function(a) { i("body").disableSelection(); Ga(a, this) }, Ha=function(a, b) { var c=b||this, d=i(c).data("layoutEdge"), e=d+"ResizerLeave"; E.clear(d+"_openSlider"); E.clear(e); if(b) l[d].isResizing||i("body").enableSelection(); else { aa(a, this); E.set(e, function() { Ha(a, c) }, 200) } }, ib=
//function() { var a=Number(m.resizeWithWindowDelay)||100; if(a>0) { E.clear("winResize"); E.set("winResize", function() { E.clear("winResize"); E.clear("winResizeRepeater"); ra() }, a); E.data.winResizeRepeater||Ya() } }, Ya=function() { var a=Number(m.resizeWithWindowMaxDelay); a>0&&E.set("winResizeRepeater", function() { Ya(); ra() }, a) }, Za=function() { var a=m; l.cookie=Da(); y(null, a.onunload_start); a.useStateCookie&&a.cookie.autoSave&&Ca(); y(null, a.onunload_end||a.onunload) }, $a=function(a) {
//	if(!a||a=="all") a=k.borderPanes;
//	i.each(a.split(","), function(b, c) { var d=m[c]; if(d.enableCursorHotkey||d.customHotkey) { i(document).bind("keydown."+C, v); return false } })
//}, jb=function() {
//	function a(f) { for(var g in b) if(f[g]!=undefined) { f[b[g]]=f[g]; delete f[g] } } p=gb(p); var b={ applyDefaultStyles: "applyDemoStyles" }; a(p.defaults); i.each(k.allPanes.split(","), function(f, g) { a(p[g]) }); if(p.effects) { i.extend(Ea, p.effects); delete p.effects } i.extend(m.cookie, p.cookie); i.each("name,containerClass,zIndex,scrollToBookmarkOnLoad,resizeWithWindow,resizeWithWindowDelay,resizeWithWindowMaxDelay,onresizeall,onresizeall_start,onresizeall_end,onload,onload_start,onload_end,onunload,onunload_start,onunload_end,autoBindCustomButtons,useStateCookie".split(","),
//function(f, g) { if(p[g]!==undefined) m[g]=p[g]; else if(p.defaults[g]!==undefined) { m[g]=p.defaults[g]; delete p.defaults[g] } }); i.each("paneSelector,resizerCursor,customHotkey".split(","), function(f, g) { delete p.defaults[g] }); i.extend(true, m.defaults, p.defaults); k.center=i.extend(true, {}, k.panes, k.center); var c=m.zIndex; if(c===0||c>0) { k.zIndex.pane_normal=c; k.zIndex.resizer_normal=c+1; k.zIndex.iframe_mask=c+1 } i.extend(m.center, p.center); var d=i.extend(true, {}, m.defaults, p.defaults, m.center); c="paneClass,contentSelector,applyDemoStyles,triggerEventsOnLoad,showOverflowOnHover,onresize,onresize_start,onresize_end,resizeNestedLayout,resizeContentWhileDragging,onsizecontent,onsizecontent_start,onsizecontent_end".split(",");
//	i.each(c, function(f, g) { m.center[g]=d[g] }); var e, h=m.defaults; i.each(k.borderPanes.split(","), function(f, g) {
//		k[g]=i.extend(true, {}, k.panes, k[g]); e=m[g]=i.extend(true, {}, m.defaults, m[g], p.defaults, p[g]); if(!e.paneClass) e.paneClass="ui-layout-pane"; if(!e.resizerClass) e.resizerClass="ui-layout-resizer"; if(!e.togglerClass) e.togglerClass="ui-layout-toggler"; i.each(["_open", "_close", ""], function(j, o) {
//			var n="fxName"+o, w="fxSpeed"+o, t="fxSettings"+o; e[n]=p[g][n]||p[g].fxName||p.defaults[n]||p.defaults.fxName||
//e[n]||e.fxName||h[n]||h.fxName||"none"; var x=e[n]; if(x=="none"||!i.effects||!i.effects[x]||!Ea[x]&&!e[t]&&!e.fxSettings) x=e[n]="none"; x=Ea[x]||{}; n=x.all||{}; x=x[g]||{}; e[t]=i.extend({}, n, x, h.fxSettings||{}, h[t]||{}, e.fxSettings, e[t], p.defaults.fxSettings, p.defaults[t]||{}, p[g].fxSettings, p[g][t]||{}); e[w]=p[g][w]||p[g].fxSpeed||p.defaults[w]||p.defaults.fxSpeed||e[w]||e[t].duration||e.fxSpeed||e.fxSettings.duration||h.fxSpeed||h.fxSettings.duration||x.duration||n.duration||"normal"
//		})
//	})
//}, ab=function(a) {
//	a=
//m[a].paneSelector; if(a.substr(0, 1)==="#") return J.find(a).eq(0); else { var b=J.children(a).eq(0); return b.length?b:J.children("form:first").children(a).eq(0) }
//}, kb=function() {
//	i.each(k.allPanes.split(","), function(a, b) { bb(b) }); Ia(); i.each(k.borderPanes.split(","), function(a, b) { if(q[b]&&l[b].isVisible) { $(b); ea(b) } }); fa("center"); i.each(k.allPanes.split(","), function(a, b) { var c=m[b]; if(q[b]&&l[b].isVisible) { if(c.triggerEventsOnLoad) y(b, c.onresize_end||c.onresize); ka(b) } }); J.innerHeight()<2&&alert(F.errContainerHeight.replace(/CONTAINER/,
//r.ref))
//}, bb=function(a) {
//	var b=m[a], c=l[a], d=k[a], e=d.dir, h=a=="center", f={}, g=q[a], j; if(g) Ja(a); else V[a]=false; g=q[a]=ab(a); if(g.length) {
//		g.data("layoutCSS")||g.data("layoutCSS", Aa(g, "position,top,left,bottom,right,width,height,overflow,zIndex,display,backgroundColor,padding,margin,border")); g.data("parentLayout", qa).data("layoutRole", "pane").data("layoutEdge", a).css(d.cssReq).css("zIndex", k.zIndex.pane_normal).css(b.applyDemoStyles?d.cssDemo:{}).addClass(b.paneClass+" "+b.paneClass+"-"+a).bind("mouseenter."+
//C, Ga).bind("mouseleave."+C, aa); cb(a, false); if(!h) { j=c.size=da(a, b.size); d=da(a, b.minSize)||1; h=da(a, b.maxSize)||1E5; if(j>0) j=B(Math.min(j, h), d); c.isClosed=false; c.isSliding=false; c.isResizing=false; c.isHidden=false } c.tagName=g.attr("tagName"); c.edge=a; c.noRoom=false; c.isVisible=true; switch(a) {
//			case "north": f.top=r.insetTop; f.left=r.insetLeft; f.right=r.insetRight; break; case "south": f.bottom=r.insetBottom; f.left=r.insetLeft; f.right=r.insetRight; break; case "west": f.left=r.insetLeft; break; case "east": f.right=
//r.insetRight
//		} if(e=="horz") f.height=B(1, S(a, j)); else if(e=="vert") f.width=B(1, R(a, j)); g.css(f); e!="horz"&&fa(a, true); c.noRoom||g.css({ visibility: "visible", display: "block" }); if(b.initClosed&&b.closable) P(a, true, true); else if(b.initHidden||b.initClosed) ya(a); b.showOverflowOnHover&&g.hover(u, z); if(l.initialized) { Ia(a); $a(a); ra(); if(c.isVisible) { if(b.triggerEventsOnLoad) y(a, b.onresize_end||b.onresize); ka(a) } }
//	} else q[a]=false
//}, Ia=function(a) {
//	if(!a||a=="all") a=k.borderPanes; i.each(a.split(","), function(b,
//c) {
//		var d=q[c]; A[c]=false; G[c]=false; if(d) {
//			d=m[c]; var e=l[c], h=d.resizerClass, f=d.togglerClass; k[c].side.toLowerCase(); var g="-"+c, j=A[c]=i("<div></div>"), o=d.closable?G[c]=i("<div></div>"):false; !e.isVisible&&d.slidable&&j.attr("title", d.sliderTip).css("cursor", d.sliderCursor); j.attr("id", d.paneSelector.substr(0, 1)=="#"?d.paneSelector.substr(1)+"-resizer":"").data("parentLayout", qa).data("layoutRole", "resizer").data("layoutEdge", c).css(k.resizers.cssReq).css("zIndex", k.zIndex.resizer_normal).css(d.applyDemoStyles?
//k.resizers.cssDemo:{}).addClass(h+" "+h+g).appendTo(J); if(o) {
//				o.attr("id", d.paneSelector.substr(0, 1)=="#"?d.paneSelector.substr(1)+"-toggler":"").data("parentLayout", qa).data("layoutRole", "toggler").data("layoutEdge", c).css(k.togglers.cssReq).css(d.applyDemoStyles?k.togglers.cssDemo:{}).addClass(f+" "+f+g).appendTo(j); d.togglerContent_open&&i("<span>"+d.togglerContent_open+"</span>").data("layoutRole", "togglerContent").data("layoutEdge", c).addClass("content content-open").css("display", "none").appendTo(o);
//				d.togglerContent_closed&&i("<span>"+d.togglerContent_closed+"</span>").data("layoutRole", "togglerContent").data("layoutEdge", c).addClass("content content-closed").css("display", "none").appendTo(o); db(c)
//			} lb(c); if(e.isVisible) Ka(c); else { La(c); la(c, true) }
//		}
//	}); va("all")
//}, cb=function(a, b) {
//	var c=m[a], d=c.contentSelector, e=q[a], h; if(d) h=V[a]=c.findNestedContent?e.find(d).eq(0):e.children(d).eq(0); if(h&&h.length) {
//		h.data("layoutCSS")||h.data("layoutCSS", Aa(h, "height")); h.css(k.content.cssReq); if(c.applyDemoStyles) {
//			h.css(k.content.cssDemo);
//			e.css(k.content.cssDemoPane)
//		} l[a].content={}; b!==false&&sa(a)
//	} else V[a]=false
//}, mb=function() { var a; i.each("toggle,open,close,pin,toggle-slide,open-slide".split(","), function(b, c) { i.each(k.borderPanes.split(","), function(d, e) { i(".ui-layout-button-"+c+"-"+e).each(function() { a=i(this).data("layoutName")||i(this).attr("layoutName"); if(a==undefined||a==m.name) T(this, c, e) }) }) }) }, lb=function(a) {
//	var b=typeof i.fn.draggable=="function", c; if(!a||a=="all") a=k.borderPanes; i.each(a.split(","), function(d, e) {
//		var h=
//m[e], f=l[e], g=k[e], j=g.dir=="horz"?"top":"left", o, n; if(!b||!q[e]||!h.resizable) { h.resizable=false; return true } var w=A[e], t=h.resizerClass, x=t+"-drag", K=t+"-"+e+"-drag", W=t+"-dragging", Q=t+"-"+e+"-dragging", ma=t+"-dragging-limit", Ma=t+"-"+e+"-dragging-limit", X=false; f.isClosed||w.attr("title", h.resizerTip).css("cursor", h.resizerCursor); w.bind("mouseenter."+C, Xa).bind("mouseleave."+C, Ha); w.draggable({ containment: J[0], axis: g.dir=="horz"?"y":"x", delay: 0, distance: 1, helper: "clone", opacity: h.resizerDragOpacity,
//	addClasses: false, zIndex: k.zIndex.resizer_drag, start: function() {
//		h=m[e]; f=l[e]; n=h.resizeWhileDragging; if(false===y(e, h.ondrag_start)) return false; k.isLayoutBusy=true; f.isResizing=true; E.clear(e+"_closeSlider"); $(e); o=f.resizerPosition; w.addClass(x+" "+K); X=false; c=i(h.maskIframesOnResize===true?"iframe":h.maskIframesOnResize).filter(":visible"); var M, H=0; c.each(function() {
//			M="ui-layout-mask-"+(++H); i(this).data("layoutMaskID", M); i('<div id="'+M+'" class="ui-layout-mask ui-layout-mask-'+e+'"/>').css({ background: "#fff",
//				opacity: "0.001", zIndex: k.zIndex.iframe_mask, position: "absolute", width: this.offsetWidth+"px", height: this.offsetHeight+"px"
//			}).css(i(this).position()).appendTo(this.parentNode)
//		}); i("body").disableSelection()
//	}, drag: function(M, H) {
//		if(!X) { H.helper.addClass(W+" "+Q).css({ right: "auto", bottom: "auto" }).children().css("visibility", "hidden"); X=true; f.isSliding&&q[e].css("zIndex", k.zIndex.pane_sliding) } var Y=0; if(H.position[j]<o.min) { H.position[j]=o.min; Y= -1 } else if(H.position[j]>o.max) { H.position[j]=o.max; Y=1 } if(Y) {
//			H.helper.addClass(ma+
//" "+Ma); window.defaultStatus="Panel has reached its "+(Y>0&&e.match(/north|west/)||Y<0&&e.match(/south|east/)?"maximum":"minimum")+" size"
//		} else { H.helper.removeClass(ma+" "+Ma); window.defaultStatus="" } n&&eb(M, H, e)
//	}, stop: function(M, H) { i("body").enableSelection(); window.defaultStatus=""; w.removeClass(x+" "+K); f.isResizing=false; k.isLayoutBusy=false; eb(M, H, e, true) }
//}); var eb=function(M, H, Y, nb) {
//	M=H.position; H=k[Y]; var wa; switch(Y) {
//		case "north": wa=M.top; break; case "west": wa=M.left; break; case "south": wa=
//r.offsetHeight-M.top-h.spacing_open; break; case "east": wa=r.offsetWidth-M.left-h.spacing_open
//	} if(nb) { i("div.ui-layout-mask").each(function() { this.parentNode.removeChild(this) }); if(false===y(Y, h.ondrag_end||h.ondrag)) return false } else c.each(function() { i("#"+i(this).data("layoutMaskID")).css(i(this).position()).css({ width: this.offsetWidth+"px", height: this.offsetHeight+"px" }) }); Na(Y, wa-r["inset"+H.side])
//}
//	})
//}, Ja=function(a, b, c) {
//	if(q[a]) {
//		var d=q[a], e=V[a], h=A[a], f=G[a], g=m[a].paneClass, j=g+"-"+a; g=[g,
//g+"-open", g+"-closed", g+"-sliding", j, j+"-open", j+"-closed", j+"-sliding"]; i.merge(g, Fa(d, true)); if(d&&d.length) if(b&&!d.data("layoutContainer")&&(!e||!e.length||!e.data("layoutContainer"))) d.remove(); else { d.removeClass(g.join(" ")).removeData("layoutParent").removeData("layoutRole").removeData("layoutEdge").removeData("autoHidden").unbind("."+C); d.data("layoutContainer")||d.css(d.data("layoutCSS")).removeData("layoutCSS"); e&&e.length&&!e.data("layoutContainer")&&e.css(e.data("layoutCSS")).removeData("layoutCSS") } f&&
//f.length&&f.remove(); h&&h.length&&h.remove(); q[a]=V[a]=A[a]=G[a]=false; if(!c) { ra(); l[a]={} }
//	}
//}, ya=function(a, b) { var c=m[a], d=l[a], e=q[a], h=A[a]; if(!(!e||d.isHidden)) if(!(l.initialized&&false===y(a, c.onhide_start))) { d.isSliding=false; h&&h.hide(); if(!l.initialized||d.isClosed) { d.isClosed=true; d.isHidden=true; d.isVisible=false; e.hide(); fa(k[a].dir=="horz"?"all":"center"); if(l.initialized||c.triggerEventsOnLoad) y(a, c.onhide_end||c.onhide) } else { d.isHiding=true; P(a, false, b) } } }, ta=function(a, b, c, d) {
//	var e=
//l[a]; if(q[a]&&e.isHidden) if(false!==y(a, m[a].onshow_start)) { e.isSliding=false; e.isShowing=true; b===false?P(a, true):U(a, false, c, d) }
//}, pa=function(a, b) { if(!O(a)) { a.stopImmediatePropagation(); a=i(this).data("layoutEdge") } var c=l[O(a)?i.trim(a):a==undefined||a==null?"":a]; if(c.isHidden) ta(a); else c.isClosed?U(a, !!b):P(a) }, ob=function(a) { var b=l[a]; q[a].hide(); b.isClosed=true; b.isVisible=false }, P=function(a, b, c, d) {
//	function e() {
//		if(g.isClosed) {
//			la(a, true); var n=k.altSide[a]; if(l[n].noRoom) { $(n); ea(n) } if(!d&&
//(l.initialized||f.triggerEventsOnLoad)) { j||y(a, f.onclose_end||f.onclose); if(j) y(a, f.onshow_end||f.onshow); if(o) y(a, f.onhide_end||f.onhide) }
//		} Ua(a)
//	} if(l.initialized) {
//		var h=q[a], f=m[a], g=l[a]; c=!c&&!g.isClosed&&f.fxName_close!="none"; var j=g.isShowing, o=g.isHiding; delete g.isShowing; delete g.isHiding; if(!(!h||!f.closable&&!j&&!o)) if(!(!b&&g.isClosed&&!j)) if(k.isLayoutBusy) Ta("close", a, b); else if(!(!j&&false===y(a, f.onclose_start))) {
//			k[a].isMoving=true; k.isLayoutBusy=true; g.isClosed=true; g.isVisible=false;
//			if(o) g.isHidden=true; else if(j) g.isHidden=false; g.isSliding?xa(a, false):fa(k[a].dir=="horz"?"all":"center", false); La(a); if(c) { Ba(a, true); h.hide(f.fxName_close, f.fxSettings_close, f.fxSpeed_close, function() { Ba(a, false); e() }) } else { h.hide(); e() }
//		}
//	} else ob(a)
//}, La=function(a) {
//	var b=A[a], c=G[a], d=m[a], e=k[a].side.toLowerCase(), h=d.resizerClass, f=d.togglerClass, g="-"+a; b.css(e, r["inset"+k[a].side]).removeClass(h+"-open "+h+g+"-open").removeClass(h+"-sliding "+h+g+"-sliding").addClass(h+"-closed "+h+g+"-closed").unbind("dblclick."+
//C); d.resizable&&typeof i.fn.draggable=="function"&&b.draggable("disable").removeClass("ui-state-disabled").css("cursor", "default").attr("title", ""); if(c) { c.removeClass(f+"-open "+f+g+"-open").addClass(f+"-closed "+f+g+"-closed").attr("title", d.togglerTip_closed); c.children(".content-open").hide(); c.children(".content-closed").css("display", "block") } ba(a, false); l.initialized&&va("all")
//}, U=function(a, b, c, d) {
//	function e() { if(g.isVisible) { Wa(a); g.isSliding||fa(k[a].dir=="vert"?"center":"all", false); Ka(a) } Ua(a) }
//	var h=q[a], f=m[a], g=l[a]; c=!c&&g.isClosed&&f.fxName_open!="none"; var j=g.isShowing; delete g.isShowing; if(!(!h||!f.resizable&&!f.closable&&!j)) if(!(g.isVisible&&!g.isSliding)) if(g.isHidden&&!j) ta(a, true); else if(k.isLayoutBusy) Ta("open", a, b); else {
//		$(a, b); if(false!==y(a, f.onopen_start)) if(g.minSize>g.maxSize) { ba(a, false); !d&&f.noRoomToOpenTip&&alert(f.noRoomToOpenTip) } else {
//			k[a].isMoving=true; k.isLayoutBusy=true; if(b) xa(a, true); else if(g.isSliding) xa(a, false); else f.slidable&&la(a, false); g.noRoom=false;
//			ea(a); g.isVisible=true; g.isClosed=false; if(j) g.isHidden=false; if(c) { Ba(a, true); h.show(f.fxName_open, f.fxSettings_open, f.fxSpeed_open, function() { Ba(a, false); e() }) } else { h.show(); e() }
//		}
//	}
//}, Ka=function(a, b) {
//	var c=q[a], d=A[a], e=G[a], h=m[a], f=l[a], g=k[a].side.toLowerCase(), j=h.resizerClass, o=h.togglerClass, n="-"+a; d.css(g, r["inset"+k[a].side]+Z(a)).removeClass(j+"-closed "+j+n+"-closed").addClass(j+"-open "+j+n+"-open"); f.isSliding?d.addClass(j+"-sliding "+j+n+"-sliding"):d.removeClass(j+"-sliding "+j+n+
//"-sliding"); h.resizerDblClickToggle&&d.bind("dblclick", pa); aa(0, d); if(h.resizable&&typeof i.fn.draggable=="function") d.draggable("enable").css("cursor", h.resizerCursor).attr("title", h.resizerTip); else f.isSliding||d.css("cursor", "default"); if(e) { e.removeClass(o+"-closed "+o+n+"-closed").addClass(o+"-open "+o+n+"-open").attr("title", h.togglerTip_open); aa(0, e); e.children(".content-closed").hide(); e.children(".content-open").css("display", "block") } ba(a, !f.isSliding); i.extend(f, ja(c)); if(l.initialized) {
//		va("all");
//		sa(a, true)
//	} if(!b&&(l.initialized||h.triggerEventsOnLoad)&&c.is(":visible")) { y(a, h.onopen_end||h.onopen); if(f.isShowing) y(a, h.onshow_end||h.onshow); if(l.initialized) { y(a, h.onresize_end||h.onresize); ka(a) } }
//}, fb=function(a) { function b() { if(e.isClosed) k[d].isMoving||U(d, true); else xa(d, true) } var c=O(a)?null:a, d=c?i(this).data("layoutEdge"):a, e=l[d]; a=m[d].slideDelay_open; c&&c.stopImmediatePropagation(); e.isClosed&&c&&c.type=="mouseenter"&&a>0?E.set(d+"_openSlider", b, a):b() }, Oa=function(a) {
//	function b() {
//		if(e.isClosed) xa(d,
//false); else k[d].isMoving||P(d)
//	} var c=O(a)?null:a, d=c?i(this).data("layoutEdge"):a; a=m[d]; var e=l[d], h=k[d].isMoving?1E3:300; if(!(e.isClosed||e.isResizing)) if(a.slideTrigger_close=="click") b(); else a.preventQuickSlideClose&&k.isLayoutBusy||a.preventPrematureSlideClose&&c&&i.layout.isMouseOverElem(c, q[d])||(c?E.set(d+"_closeSlider", b, B(a.slideDelay_close, h)):b())
//}, Ba=function(a, b) {
//	var c=q[a]; if(b) {
//		c.css({ zIndex: k.zIndex.pane_animate }); if(a=="south") c.css({ top: r.insetTop+r.innerHeight-c.outerHeight() });
//		else a=="east"&&c.css({ left: r.insetLeft+r.innerWidth-c.outerWidth() })
//	} else { c.css({ zIndex: l[a].isSliding?k.zIndex.pane_sliding:k.zIndex.pane_normal }); if(a=="south") c.css({ top: "auto" }); else a=="east"&&c.css({ left: "auto" }); var d=m[a]; l.browser.msie&&d.fxOpacityFix&&d.fxName_open!="slide"&&c.css("filter")&&c.css("opacity")==1&&c[0].style.removeAttribute("filter") }
//}, la=function(a, b) {
//	var c=m[a], d=A[a], e=c.slideTrigger_open.toLowerCase(); if(!(!d||b&&!c.slidable)) {
//		if(e.match(/mouseover/)) e=c.slideTrigger_open=
//"mouseenter"; else if(!e.match(/click|dblclick|mouseenter/)) e=c.slideTrigger_open="click"; d[b?"bind":"unbind"](e+"."+C, fb).css("cursor", b?c.sliderCursor:"default").attr("title", b?c.sliderTip:"")
//	}
//}, xa=function(a, b) {
//	function c(n) { E.clear(a+"_closeSlider"); n.stopPropagation() } var d=m[a], e=l[a], h=k.zIndex, f=d.slideTrigger_close.toLowerCase(), g=b?"bind":"unbind", j=q[a], o=A[a]; e.isSliding=b; E.clear(a+"_closeSlider"); b&&la(a, false); j.css("zIndex", b?h.pane_sliding:h.pane_normal); o.css("zIndex", b?h.pane_sliding:
//h.resizer_normal); if(!f.match(/click|mouseleave/)) f=d.slideTrigger_close="mouseleave"; o[g](f, Oa); if(f=="mouseleave") { j[g]("mouseleave."+C, Oa); o[g]("mouseenter."+C, c); j[g]("mouseenter."+C, c) } if(b) { if(f=="click"&&!d.resizable) { o.css("cursor", b?d.sliderCursor:"default"); o.attr("title", b?d.togglerTip_open:"") } } else E.clear(a+"_closeSlider")
//}, ea=function(a, b, c, d) {
//	b=m[a]; var e=l[a], h=k[a], f=q[a], g=A[a], j=h.dir=="vert", o=false; if(a=="center"||j&&e.noVerticalRoom) if((o=e.maxHeight>0)&&e.noRoom) {
//		f.show();
//		g&&g.show(); e.isVisible=true; e.noRoom=false; if(j) e.noVerticalRoom=false; Wa(a)
//	} else if(!o&&!e.noRoom) { f.hide(); g&&g.hide(); e.isVisible=false; e.noRoom=true } if(a!="center") if(e.minSize<=e.maxSize) { if(e.size>e.maxSize) ha(a, e.maxSize, c, d); else if(e.size<e.minSize) ha(a, e.minSize, c, d); else if(g&&f.is(":visible")) { c=h.side.toLowerCase(); d=e.size+r["inset"+h.side]; ia(g, c)!=d&&g.css(c, d) } if(e.noRoom) if(e.wasOpen&&b.closable) if(b.autoReopen) U(a, false, true, true); else e.noRoom=false; else ta(a, e.wasOpen, true, true) } else if(!e.noRoom) {
//		e.noRoom=
//true; e.wasOpen=!e.isClosed&&!e.isSliding; e.isClosed||(b.closable?P(a, true, true):ya(a, true))
//	}
//}, Na=function(a, b, c) { var d=m[a], e=d.resizeWhileDragging&&!k.isLayoutBusy; d.autoResize=false; ha(a, b, c, e) }, ha=function(a, b, c, d) {
//	var e=m[a], h=l[a], f=q[a], g=A[a], j=k[a].side.toLowerCase(), o="inset"+k[a].side, n=k.isLayoutBusy&&!e.triggerEventsWhileDragging, w; $(a); w=h.size; b=da(a, b); b=B(b, da(a, e.minSize)); b=Math.min(b, h.maxSize); if(b<h.minSize) ea(a, false, c); else if(!(!d&&b==w)) {
//		!c&&l.initialized&&h.isVisible&&y(a,
//e.onresize_start); f.css(k[a].sizeType.toLowerCase(), B(1, k[a].dir=="horz"?S(a, b):R(a, b))); h.size=b; i.extend(h, ja(f)); g&&f.is(":visible")&&g.css(j, b+r[o]); sa(a); if(!c&&!n&&l.initialized&&h.isVisible) { y(a, e.onresize_end||e.onresize); ka(a) } if(!c) { h.isSliding||fa(k[a].dir=="horz"?"all":"center", n, d); va("all") } a=k.altSide[a]; if(b<w&&l[a].noRoom) { $(a); ea(a, false, c) }
//	}
//}, fa=function(a, b, c) {
//	if(!a||a=="all") a="east,west,center"; i.each(a.split(","), function(d, e) {
//		if(q[e]) {
//			var h=m[e], f=l[e], g=q[e], j=true, o={}; j=
//{ top: Z("north", true), bottom: Z("south", true), left: Z("west", true), right: Z("east", true), width: 0, height: 0 }; j.width=r.innerWidth-j.left-j.right; j.height=r.innerHeight-j.bottom-j.top; j.top+=r.insetTop; j.bottom+=r.insetBottom; j.left+=r.insetLeft; j.right+=r.insetRight; i.extend(f, ja(g)); if(e=="center") {
//				if(!c&&f.isVisible&&j.width==f.outerWidth&&j.height==f.outerHeight) return true; i.extend(f, za(e), { maxWidth: j.width, maxHeight: j.height }); o=j; o.width=R(e, j.width); o.height=S(e, j.height); j=o.width>0&&o.height>0;
//				if(!j&&!l.initialized&&h.minWidth>0) { var n=h.minWidth-f.outerWidth, w=m.east.minSize||0, t=m.west.minSize||0, x=l.east.size, K=l.west.size, W=x, Q=K; if(n>0&&l.east.isVisible&&x>w) { W=B(x-w, x-n); n-=x-W } if(n>0&&l.west.isVisible&&K>t) { Q=B(K-t, K-n); n-=K-Q } if(n==0) { x!=w&&ha("east", W, true); K!=t&&ha("west", Q, true); fa("center", b, c); return } }
//			} else {
//				f.isVisible&&!f.noVerticalRoom&&i.extend(f, ja(g), za(e)); if(!c&&!f.noVerticalRoom&&j.height==f.outerHeight) return true; o.top=j.top; o.bottom=j.bottom; o.height=S(e, j.height);
//				f.maxHeight=B(0, o.height); j=f.maxHeight>0; if(!j) f.noVerticalRoom=true
//			} if(j) { !b&&l.initialized&&y(e, h.onresize_start); g.css(o); f.noRoom&&!f.isClosed&&!f.isHidden&&ea(e); if(f.isVisible) { i.extend(f, ja(g)); l.initialized&&sa(e) } } else !f.noRoom&&f.isVisible&&ea(e); if(!f.isVisible) return true; if(e=="center") {
//				f=l.browser; f=f.isIE6||f.msie&&!f.boxModel; if(q.north&&(f||l.north.tagName=="IFRAME")) q.north.css("width", R(q.north, r.innerWidth)); if(q.south&&(f||l.south.tagName=="IFRAME")) q.south.css("width", R(q.south,
//r.innerWidth))
//			} if(!b&&l.initialized) { y(e, h.onresize_end||h.onresize); ka(e) }
//		}
//	})
//}, ra=function() {
//	i.extend(l.container, ja(J)); if(r.outerHeight) {
//		if(false===y(null, m.onresizeall_start)) return false; var a, b, c; i.each(["south", "north", "east", "west"], function(d, e) { if(q[e]) { c=l[e]; b=m[e]; if(b.autoResize&&c.size!=b.size) ha(e, b.size, true, true); else { $(e); ea(e, false, true, true) } } }); fa("all", true, true); va("all"); b=m; i.each(k.allPanes.split(","), function(d, e) {
//			if(a=q[e]) if(l[e].isVisible) {
//				y(e, b[e].onresize_end||b[e].onresize);
//				ka(e)
//			}
//		}); y(null, b.onresizeall_end||b.onresizeall)
//	}
//}, ka=function(a) { var b=q[a], c=V[a]; if(m[a].resizeNestedLayout) if(b.data("layoutContainer")) b.layout().resizeAll(); else c&&c.data("layoutContainer")&&c.layout().resizeAll() }, sa=function(a, b) {
//	if(!a||a=="all") a=k.allPanes; i.each(a.split(","), function(c, d) {
//		function e(w) { return B(o.css.paddingBottom, parseInt(w.css("marginBottom"), 10)||0) } function h() {
//			var w=m[d].contentIgnoreSelector; w=g.nextAll().not(w||":lt(0)"); var t=w.filter(":visible"), x=t.filter(":last");
//			n={ top: g[0].offsetTop, height: g.outerHeight(), numFooters: w.length, hiddenFooters: w.length-t.length, spaceBelow: 0 }; n.spaceAbove=n.top; n.bottom=n.top+n.height; n.spaceBelow=x.length?x[0].offsetTop+x.outerHeight()-n.bottom+e(x):e(g)
//		} var f=q[d], g=V[d], j=m[d], o=l[d], n=o.content; if(!f||!g||!f.is(":visible")) return true; if(false!==y(null, j.onsizecontent_start)) {
//			if(!k.isLayoutBusy||n.top==undefined||b||j.resizeContentWhileDragging) {
//				h(); if(n.hiddenFooters>0&&f.css("overflow")=="hidden") {
//					f.css("overflow", "visible");
//					h(); f.css("overflow", "hidden")
//				}
//			} f=o.innerHeight-(n.spaceAbove-o.css.paddingTop)-(n.spaceBelow-o.css.paddingBottom); if(!g.is(":visible")||n.height!=f) { hb(g, f, true); n.height=f } if(l.initialized) { y(d, j.onsizecontent_end||j.onsizecontent); ka(d) }
//		}
//	})
//}, va=function(a) {
//	if(!a||a=="all") a=k.borderPanes; i.each(a.split(","), function(b, c) {
//		var d=m[c], e=l[c], h=q[c], f=A[c], g=G[c], j; if(h&&f) {
//			var o=k[c].dir, n=e.isClosed?"_closed":"_open", w=d["spacing"+n], t=d["togglerAlign"+n]; n=d["togglerLength"+n]; var x; if(w==0) f.hide();
//			else {
//				!e.noRoom&&!e.isHidden&&f.show(); if(o=="horz") { x=h.outerWidth(); e.resizerLength=x; f.css({ width: B(1, R(f, x)), height: B(0, S(f, w)), left: ia(h, "left") }) } else { x=h.outerHeight(); e.resizerLength=x; f.css({ height: B(1, S(f, x)), width: B(0, R(f, w)), top: r.insetTop+Z("north", true) }) } aa(d, f); if(g) {
//					if(n==0||e.isSliding&&d.hideTogglerOnSlide) { g.hide(); return } else g.show(); if(!(n>0)||n=="100%"||n>x) { n=x; t=0 } else if(O(t)) switch(t) {
//						case "top": case "left": t=0; break; case "bottom": case "right": t=x-n; break; default: t=Math.floor((x-
//n)/2)
//					} else { h=parseInt(t, 10); t=t>=0?h:x-n+h } if(o=="horz") { var K=R(g, n); g.css({ width: B(0, K), height: B(1, S(g, w)), left: t, top: 0 }); g.children(".content").each(function() { j=i(this); j.css("marginLeft", Math.floor((K-j.outerWidth())/2)) }) } else { var W=S(g, n); g.css({ height: B(0, W), width: B(1, R(g, w)), top: t, left: 0 }); g.children(".content").each(function() { j=i(this); j.css("marginTop", Math.floor((W-j.outerHeight())/2)) }) } aa(0, g)
//				} if(!l.initialized&&(d.initHidden||e.noRoom)) { f.hide(); g&&g.hide() }
//			}
//		}
//	})
//}, db=function(a) {
//	var b=
//G[a], c=m[a]; if(b) { c.closable=true; b.bind("click."+C, function(d) { d.stopPropagation(); pa(a) }).bind("mouseenter."+C, Ga).bind("mouseleave."+C, aa).css("visibility", "visible").css("cursor", "pointer").attr("title", l[a].isClosed?c.togglerTip_closed:c.togglerTip_open).show() }
//}, J=i(this).eq(0); if(!J.length) return null; if(J.data("layoutContainer")&&J.data("layout")) return J.data("layout"); var q={}, V={}, A={}, G={}, r=l.container, C=l.id, qa={ options: m, state: l, container: J, panes: q, contents: V, resizers: A, togglers: G,
//	toggle: pa, hide: ya, show: ta, open: U, close: P, slideOpen: fb, slideClose: Oa, slideToggle: function(a) { pa(a, true) }, initContent: cb, sizeContent: sa, sizePane: Na, swapPanes: function(a, b) {
//		function c(g) { var j=q[g], o=V[g]; return !j?false:{ pane: g, P: j?j[0]:false, C: o?o[0]:false, state: i.extend({}, l[g]), options: i.extend({}, m[g])} } function d(g, j) {
//			if(g) {
//				var o=g.P, n=g.C, w=g.pane, t=k[j], x=t.side.toLowerCase(), K="inset"+t.side, W=i.extend({}, l[j]), Q=m[j], ma={ resizerCursor: Q.resizerCursor }; i.each("fxName,fxSpeed,fxSettings".split(","),
//function(Ma, X) { ma[X]=Q[X]; ma[X+"_open"]=Q[X+"_open"]; ma[X+"_close"]=Q[X+"_close"] }); q[j]=i(o).data("layoutEdge", j).css(k.hidden).css(t.cssReq); V[j]=n?i(n):false; m[j]=i.extend({}, g.options, ma); l[j]=i.extend({}, g.state); o.className=o.className.replace(RegExp(Q.paneClass+"-"+w, "g"), Q.paneClass+"-"+j); Ia(j); if(t.dir!=k[w].dir) { o=f[j]||0; $(j); o=B(o, l[j].minSize); Na(j, o, true) } else A[j].css(x, r[K]+(l[j].isVisible?Z(j):0)); if(g.state.isVisible&&!W.isVisible) Ka(j, true); else { La(j); la(j, true) } g=null
//			}
//		} l[a].edge=
//b; l[b].edge=a; var e=false; if(false===y(a, m[a].onswap_start)) e=true; if(!e&&false===y(b, m[b].onswap_start)) e=true; if(e) { l[a].edge=a; l[b].edge=b } else { e=c(a); var h=c(b), f={}; f[a]=e?e.state.size:0; f[b]=h?h.state.size:0; q[a]=false; q[b]=false; l[a]={}; l[b]={}; G[a]&&G[a].remove(); G[b]&&G[b].remove(); A[a]&&A[a].remove(); A[b]&&A[b].remove(); A[a]=A[b]=G[a]=G[b]=false; d(e, b); d(h, a); e=h=f=null; q[a]&&q[a].css(k.visible); q[b]&&q[b].css(k.visible); ra(); y(a, m[a].onswap_end||m[a].onswap); y(b, m[b].onswap_end||m[b].onswap) }
//	},
//	resizeAll: ra, destroy: function() { i(window).unbind("."+C); i(document).unbind("."+C); i.each(k.allPanes.split(","), function(b, c) { Ja(c, false, true) }); var a=J.removeData("layout").removeData("layoutContainer").removeClass(m.containerClass); !a.data("layoutEdge")&&a.data("layoutCSS")&&a.css(a.data("layoutCSS")).removeData("layoutCSS"); if(r.tagName=="BODY"&&(a=i("html")).data("layoutCSS")) a.css(a.data("layoutCSS")).removeData("layoutCSS"); Za() }, addPane: bb, removePane: Ja, setSizeLimits: $, bindButton: T, addToggleBtn: N,
//	addOpenBtn: D, addCloseBtn: I, addPinBtn: oa, allowOverflow: u, resetOverflow: z, encodeJSON: Qa, decodeJSON: Pa, getState: Da, getCookie: ga, saveCookie: Ca, deleteCookie: function() { Ca("", { expires: -1 }) }, loadCookie: Ra, loadState: Sa, cssWidth: R, cssHeight: S, enableClosable: db, disableClosable: function(a, b) { var c=G[a]; if(c) { m[a].closable=false; l[a].isClosed&&U(a, false, true); c.unbind("."+C).css("visibility", b?"hidden":"visible").css("cursor", "default").attr("title", "") } }, enableSlidable: function(a) {
//		var b=A[a]; if(b&&b.data("draggable")) {
//			m[a].slidable=
//true; s.isClosed&&la(a, true)
//		}
//	}, disableSlidable: function(a) { var b=A[a]; if(b) { m[a].slidable=false; if(l[a].isSliding) P(a, false, true); else { la(a, false); b.css("cursor", "default").attr("title", ""); aa(null, b[0]) } } }, enableResizable: function(a) { var b=A[a], c=m[a]; if(b&&b.data("draggable")) { c.resizable=true; b.draggable("enable").bind("mouseenter."+C, Xa).bind("mouseleave."+C, Ha); l[a].isClosed||b.css("cursor", c.resizerCursor).attr("title", c.resizerTip) } }, disableResizable: function(a) {
//		var b=A[a]; if(b&&b.data("draggable")) {
//			m[a].resizable=
//false; b.draggable("disable").unbind("."+C).css("cursor", "default").attr("title", ""); aa(null, b[0])
//		}
//	}
//}; (function() {
//	jb(); var a=m; if(false===y(null, a.onload_start)) return false; if(!ab("center").length) { alert(F.errCenterPaneMissing); return null } a.useStateCookie&&a.cookie.autoLoad&&Ra(); l.browser={ mozilla: i.browser.mozilla, webkit: i.browser.webkit||i.browser.safari, msie: i.browser.msie, isIE6: i.browser.msie&&i.browser.version==6, boxModel: i.support.boxModel }; var b=J, c=r.tagName=b.attr("tagName"), d=c=="BODY",
//e={}; r.selector=b.selector.split(".slice")[0]; r.ref=c+"/"+r.selector; b.data("layout", qa).data("layoutContainer", C).addClass(m.containerClass); if(!b.data("layoutCSS")) {
//		if(d) { e=i.extend(Aa(b, "position,margin,padding,border"), { height: b.css("height"), overflow: b.css("overflow"), overflowX: b.css("overflowX"), overflowY: b.css("overflowY") }); c=i("html"); c.data("layoutCSS", { height: "auto", overflow: c.css("overflow"), overflowX: c.css("overflowX"), overflowY: c.css("overflowY") }) } else e=Aa(b, "position,margin,padding,border,top,bottom,left,right,width,height,overflow,overflowX,overflowY");
//		b.data("layoutCSS", e)
//	} try {
//		if(d) { i("html").css({ height: "100%", overflow: "hidden", overflowX: "hidden", overflowY: "hidden" }); i("body").css({ position: "relative", height: "100%", overflow: "hidden", overflowX: "hidden", overflowY: "hidden", margin: 0, padding: 0, border: "none" }) } else {
//			e={ overflow: "hidden" }; var h=b.css("position"); b.css("height"); if(!b.data("layoutRole")) if(!h||!h.match(/fixed|absolute|relative/)) e.position="relative"; b.css(e); b.is(":visible")&&b.innerHeight()<2&&alert(F.errContainerHeight.replace(/CONTAINER/,
//r.ref))
//		}
//	} catch(f) { } i.extend(l.container, ja(b)); kb(); sa(); if(a.scrollToBookmarkOnLoad) { b=self.location; b.hash&&b.replace(b.hash) } $a(); a.autoBindCustomButtons&&mb(); a.resizeWithWindow&&!J.data("layoutRole")&&i(window).bind("resize."+C, ib); i(window).bind("unload."+C, Za); l.initialized=true; y(null, a.onload_end||a.onload)
//})(); return qa
//	}
//})(jQuery);
/*
* jQuery blockUI plugin
* Version 2.36 (16-NOV-2010)
* @requires jQuery v1.2.3 or later
*
* Examples at: http://malsup.com/jquery/block/
* Copyright (c) 2007-2008 M. Alsup
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
* Thanks to Amir-Hossein Sobhi for some excellent contributions!
*/

(function($) {
   if(/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery)||/^1.1/.test($.fn.jquery)) {
      alert('blockUI requires jQuery v1.2.3 or later!  You are using v'+$.fn.jquery);
      return;
   }

   $.fn._fadeIn=$.fn.fadeIn;

   var noOp=function() { };

   // this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
   // retarded userAgent strings on Vista)
   var mode=document.documentMode||0;
   var setExpr=$.browser.msie&&(($.browser.version<8&&!mode)||mode<8);
   var ie6=$.browser.msie&&/MSIE 6.0/.test(navigator.userAgent)&&!mode;

   // global $ methods for blocking/unblocking the entire page
   $.blockUI=function(opts) { install(window, opts); };
   $.unblockUI=function(opts) { remove(window, opts); };

   // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
   $.growlUI=function(title, message, timeout, onClose) {
      var $m=$('<div class="growlUI"></div>');
      if(title) $m.append('<h1>'+title+'</h1>');
      if(message) $m.append('<h2>'+message+'</h2>');
      if(timeout==undefined) timeout=4000;
      $.blockUI({
         message: $m, fadeIn: 700, fadeOut: 1000, centerY: false,
         timeout: timeout, showOverlay: false,
         onUnblock: onClose,
         css: $.blockUI.defaults.growlCSS
      });
   };

   // plugin method for blocking element content
   $.fn.block=function(opts) {
      return this.unblock({ fadeOut: 0 }).each(function() {
         if($.css(this, 'position')=='static')
            this.style.position='relative';
         if($.browser.msie)
            this.style.zoom=1; // force 'hasLayout'
         install(this, opts);
      });
   };

   // plugin method for unblocking element content
   $.fn.unblock=function(opts) {
      return this.each(function() {
         remove(this, opts);
      });
   };

   $.blockUI.version=2.35; // 2nd generation blocking at no extra cost!

   // override these in your code to change the default behavior and style
   $.blockUI.defaults={
      // message displayed when blocking (use null for no message)
      message: '<h4><img src="/Content/images/ajax-loader-circle-blue.gif"/>  Siunčiami duomenys. Minutėlę...</h4>',

      title: null,   // title string; only used when theme ===true
      draggable: true,  // only used when theme ===true (requires jquery-ui.js to be loaded)

      theme: false, // set to true to use with jQuery UI themes

      // styles for the message when blocking; if you wish to disable
      // these and use an external stylesheet then do this in your code:
      // $.blockUI.defaults.css = {};
      css: {
         padding: 0,
         margin: 0,
         width: '40%',
         top: '40%',
         left: '35%',
         textAlign: 'center',
         color: '#000',
         border: '3px solid #aaa',
         backgroundColor: '#fff',
         cursor: 'wait'
      },

      // minimal style set used when themes are used
      themedCSS: {
         width: '40%',
         top: '40%',
         left: '35%'
      },

      // styles for the overlay
      overlayCSS: {
         backgroundColor: '#000',
         opacity: 0.6,
         cursor: 'wait'
      },

      // styles applied when using $.growlUI
      growlCSS: {
         width: '350px',
         top: '10px',
         left: '',
         right: '10px',
         border: 'none',
         padding: '5px',
         opacity: 0.6,
         cursor: 'default',
         color: '#fff',
         backgroundColor: '#000',
         '-webkit-border-radius': '10px',
         '-moz-border-radius': '10px',
         'border-radius': '10px'
      },

      // IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
      // (hat tip to Jorge H. N. de Vasconcelos)
      iframeSrc: /^https/i.test(window.location.href||'')?'javascript:false':'about:blank',

      // force usage of iframe in non-IE browsers (handy for blocking applets)
      forceIframe: false,

      // z-index for the blocking overlay
      baseZ: 10000,

      // set these to true to have the message automatically centered
      centerX: true, // <-- only effects element blocking (page block controlled via css above)
      centerY: true,

      // allow body element to be stetched in ie6; this makes blocking look better
      // on "short" pages.  disable if you wish to prevent changes to the body height
      allowBodyStretch: true,

      // enable if you want key and mouse events to be disabled for content that is blocked
      bindEvents: true,

      // be default blockUI will supress tab navigation from leaving blocking content
      // (if bindEvents is true)
      constrainTabKey: true,

      // fadeIn time in millis; set to 0 to disable fadeIn on block
      fadeIn: 200,

      // fadeOut time in millis; set to 0 to disable fadeOut on unblock
      fadeOut: 400,

      // time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
      timeout: 0,

      // disable if you don't want to show the overlay
      showOverlay: true,

      // if true, focus will be placed in the first available input field when
      // page blocking
      focusInput: true,

      // suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
      applyPlatformOpacityRules: true,

      // callback method invoked when fadeIn has completed and blocking message is visible
      onBlock: null,

      // callback method invoked when unblocking has completed; the callback is
      // passed the element that has been unblocked (which is the window object for page
      // blocks) and the options that were passed to the unblock call:
      //	 onUnblock(element, options)
      onUnblock: null,

      // don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
      quirksmodeOffsetHack: 4,

      // class name of the message block
      blockMsgClass: 'blockMsg'
   };

   // private data and functions follow...

   var pageBlock=null;
   var pageBlockEls=[];

   function install(el, opts) {
      var full=(el==window);
      var msg=opts&&opts.message!==undefined?opts.message:undefined;
      opts=$.extend({}, $.blockUI.defaults, opts||{});
      opts.overlayCSS=$.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS||{});
      var css=$.extend({}, $.blockUI.defaults.css, opts.css||{});
      var themedCSS=$.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS||{});
      msg=msg===undefined?opts.message:msg;

      // remove the current block (if there is one)
      if(full&&pageBlock)
         remove(window, { fadeOut: 0 });

      // if an existing element is being used as the blocking content then we capture
      // its current place in the DOM (and current display style) so we can restore
      // it when we unblock
      if(msg&&typeof msg!='string'&&(msg.parentNode||msg.jquery)) {
         var node=msg.jquery?msg[0]:msg;
         var data={};
         $(el).data('blockUI.history', data);
         data.el=node;
         data.parent=node.parentNode;
         data.display=node.style.display;
         data.position=node.style.position;
         if(data.parent)
            data.parent.removeChild(node);
      }

      var z=opts.baseZ;

      // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
      // layer1 is the iframe layer which is used to supress bleed through of underlying content
      // layer2 is the overlay layer which has opacity and a wait cursor (by default)
      // layer3 is the message content that is displayed while blocking

      var lyr1=($.browser.msie||opts.forceIframe)
      ?$('<iframe class="blockUI" style="z-index:'+(z++)+';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>')
      :$('<div class="blockUI" style="display:none"></div>');
      var lyr2=$('<div class="blockUI blockOverlay" style="z-index:'+(z++)+';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

      var lyr3, s;
      if(opts.theme&&full) {
         s='<div class="blockUI '+opts.blockMsgClass+' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+z+';display:none;position:fixed">'+
            '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title||'&nbsp;')+'</div>'+
            '<div class="ui-widget-content ui-dialog-content"></div>'+
         '</div>';
      }
      else if(opts.theme) {
         s='<div class="blockUI '+opts.blockMsgClass+' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+z+';display:none;position:absolute">'+
            '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title||'&nbsp;')+'</div>'+
            '<div class="ui-widget-content ui-dialog-content"></div>'+
         '</div>';
      }
      else if(full) {
         s='<div class="blockUI '+opts.blockMsgClass+' blockPage" style="z-index:'+z+';display:none;position:fixed"></div>';
      }
      else {
         s='<div class="blockUI '+opts.blockMsgClass+' blockElement" style="z-index:'+z+';display:none;position:absolute"></div>';
      }
      lyr3=$(s);

      // if we have a message, style it
      if(msg) {
         if(opts.theme) {
            lyr3.css(themedCSS);
            lyr3.addClass('ui-widget-content');
         }
         else
            lyr3.css(css);
      }

      // style the overlay
      if(!opts.applyPlatformOpacityRules||!($.browser.mozilla&&/Linux/.test(navigator.platform)))
         lyr2.css(opts.overlayCSS);
      lyr2.css('position', full?'fixed':'absolute');

      // make iframe layer transparent in IE
      if($.browser.msie||opts.forceIframe)
         lyr1.css('opacity', 0.0);

      //$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
      var layers=[lyr1, lyr2, lyr3], $par=full?$('body'):$(el);
      $.each(layers, function() {
         this.appendTo($par);
      });

      if(opts.theme&&opts.draggable&&$.fn.draggable) {
         lyr3.draggable({
            handle: '.ui-dialog-titlebar',
            cancel: 'li'
         });
      }

      // ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
      var expr=setExpr&&(!$.boxModel||$('object,embed', full?null:el).length>0);
      if(ie6||expr) {
         // give body 100% height
         if(full&&opts.allowBodyStretch&&$.boxModel)
            $('html,body').css('height', '100%');

         // fix ie6 issue when blocked element has a border width
         if((ie6||!$.boxModel)&&!full) {
            var t=sz(el, 'borderTopWidth'), l=sz(el, 'borderLeftWidth');
            var fixT=t?'(0 - '+t+')':0;
            var fixL=l?'(0 - '+l+')':0;
         }

         // simulate fixed position
         $.each([lyr1, lyr2, lyr3], function(i, o) {
            var s=o[0].style;
            s.position='absolute';
            if(i<2) {
               full?s.setExpression('height', 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"')
                :s.setExpression('height', 'this.parentNode.offsetHeight + "px"');
               full?s.setExpression('width', 'jQuery.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"')
                :s.setExpression('width', 'this.parentNode.offsetWidth + "px"');
               if(fixL) s.setExpression('left', fixL);
               if(fixT) s.setExpression('top', fixT);
            }
            else if(opts.centerY) {
               if(full) s.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
               s.marginTop=0;
            }
            else if(!opts.centerY&&full) {
               var top=(opts.css&&opts.css.top)?parseInt(opts.css.top):0;
               var expression='((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
               s.setExpression('top', expression);
            }
         });
      }

      // show the message
      if(msg) {
         if(opts.theme)
            lyr3.find('.ui-widget-content').append(msg);
         else
            lyr3.append(msg);
         if(msg.jquery||msg.nodeType)
            $(msg).show();
      }

      if(($.browser.msie||opts.forceIframe)&&opts.showOverlay)
         lyr1.show(); // opacity is zero
      if(opts.fadeIn) {
         var cb=opts.onBlock?opts.onBlock:noOp;
         var cb1=(opts.showOverlay&&!msg)?cb:noOp;
         var cb2=msg?cb:noOp;
         if(opts.showOverlay)
            lyr2._fadeIn(opts.fadeIn, cb1);
         if(msg)
            lyr3._fadeIn(opts.fadeIn, cb2);
      }
      else {
         if(opts.showOverlay)
            lyr2.show();
         if(msg)
            lyr3.show();
         if(opts.onBlock)
            opts.onBlock();
      }

      // bind key and mouse events
      bind(1, el, opts);

      if(full) {
         pageBlock=lyr3[0];
         pageBlockEls=$(':input:enabled:visible', pageBlock);
         if(opts.focusInput)
            setTimeout(focus, 20);
      }
      else
         center(lyr3[0], opts.centerX, opts.centerY);

      if(opts.timeout) {
         // auto-unblock
         var to=setTimeout(function() {
            full?$.unblockUI(opts):$(el).unblock(opts);
         }, opts.timeout);
         $(el).data('blockUI.timeout', to);
      }
   };

   // remove the block
   function remove(el, opts) {
      var full=(el==window);
      var $el=$(el);
      var data=$el.data('blockUI.history');
      var to=$el.data('blockUI.timeout');
      if(to) {
         clearTimeout(to);
         $el.removeData('blockUI.timeout');
      }
      opts=$.extend({}, $.blockUI.defaults, opts||{});
      bind(0, el, opts); // unbind events

      var els;
      if(full) // crazy selector to handle odd field errors in ie6/7
         els=$('body').children().filter('.blockUI').add('body > .blockUI');
      else
         els=$('.blockUI', el);

      if(full)
         pageBlock=pageBlockEls=null;

      if(opts.fadeOut) {
         els.fadeOut(opts.fadeOut);
         setTimeout(function() { reset(els, data, opts, el); }, opts.fadeOut);
      }
      else
         reset(els, data, opts, el);
   };

   // move blocking element back into the DOM where it started
   function reset(els, data, opts, el) {
      els.each(function(i, o) {
         // remove via DOM calls so we don't lose event handlers
         if(this.parentNode)
            this.parentNode.removeChild(this);
      });

      if(data&&data.el) {
         data.el.style.display=data.display;
         data.el.style.position=data.position;
         if(data.parent)
            data.parent.appendChild(data.el);
         $(el).removeData('blockUI.history');
      }

      if(typeof opts.onUnblock=='function')
         opts.onUnblock(el, opts);
   };

   // bind/unbind the handler
   function bind(b, el, opts) {
      var full=el==window, $el=$(el);

      // don't bother unbinding if there is nothing to unbind
      if(!b&&(full&&!pageBlock||!full&&!$el.data('blockUI.isBlocked')))
         return;
      if(!full)
         $el.data('blockUI.isBlocked', b);

      // don't bind events when overlay is not in use or if bindEvents is false
      if(!opts.bindEvents||(b&&!opts.showOverlay))
         return;

      // bind anchors and inputs for mouse and key events
      var events='mousedown mouseup keydown keypress';
      b?$(document).bind(events, opts, handler):$(document).unbind(events, handler);

      // former impl...
      //	   var $e = $('a,:input');
      //	   b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
   };

   // event handler to suppress keyboard/mouse events when blocking
   function handler(e) {
      // allow tab navigation (conditionally)
      if(e.keyCode&&e.keyCode==9) {
         if(pageBlock&&e.data.constrainTabKey) {
            var els=pageBlockEls;
            var fwd=!e.shiftKey&&e.target===els[els.length-1];
            var back=e.shiftKey&&e.target===els[0];
            if(fwd||back) {
               setTimeout(function() { focus(back) }, 10);
               return false;
            }
         }
      }
      var opts=e.data;
      // allow events within the message content
      if($(e.target).parents('div.'+opts.blockMsgClass).length>0)
         return true;

      // allow events for content that is not being blocked
      return $(e.target).parents().children().filter('div.blockUI').length==0;
   };

   function focus(back) {
      if(!pageBlockEls)
         return;
      var e=pageBlockEls[back===true?pageBlockEls.length-1:0];
      if(e)
         e.focus();
   };

   function center(el, x, y) {
      var p=el.parentNode, s=el.style;
      var l=((p.offsetWidth-el.offsetWidth)/2)-sz(p, 'borderLeftWidth');
      var t=((p.offsetHeight-el.offsetHeight)/2)-sz(p, 'borderTopWidth');
      if(x) s.left=l>0?(l+'px'):'0';
      if(y) s.top=t>0?(t+'px'):'0';
   };

   function sz(el, p) {
      return parseInt($.css(el, p))||0;
   };
})(jQuery);
/*
* jQuery resize event - v1.1 - 3/14/2010
* http://benalman.com/projects/jquery-resize-plugin/
*
* Copyright (c) 2010 "Cowboy" Ben Alman
* Dual licensed under the MIT and GPL licenses.
* http://benalman.com/about/license/
*/
(function($, h, c) { var a=$([]), e=$.resize=$.extend($.resize, {}), i, k="setTimeout", j="resize", d=j+"-special-event", b="delay", f="throttleWindow"; e[b]=250; e[f]=true; $.event.special[j]={ setup: function() { if(!e[f]&&this[k]) { return false } var l=$(this); a=a.add(l); $.data(this, d, { w: l.width(), h: l.height() }); if(a.length===1) { g() } }, teardown: function() { if(!e[f]&&this[k]) { return false } var l=$(this); a=a.not(l); l.removeData(d); if(!a.length) { clearTimeout(i) } }, add: function(l) { if(!e[f]&&this[k]) { return false } var n; function m(s, o, p) { var q=$(this), r=$.data(this, d); r.w=o!==c?o:q.width(); r.h=p!==c?p:q.height(); n.apply(this, arguments) } if($.isFunction(l)) { n=l; return m } else { n=l.handler; l.handler=m } } }; function g() { i=h[k](function() { a.each(function() { var n=$(this), m=n.width(), l=n.height(), o=$.data(this, d); if(m!==o.w||l!==o.h) { n.trigger(j, [o.w=m, o.h=l]) } }); g() }, e[b]) } })(jQuery, this);

/**
* jQuery.labelify - Display in-textbox hints
* Stuart Langridge, http://www.kryogenix.org/
* Released into the public domain
* Date: 25th June 2008
* @author Stuart Langridge
* @version 1.3
*
*
* Basic calling syntax: $("input").labelify();
* Defaults to taking the in-field label from the field's title attribute
*
* You can also pass an options object with the following keys:
*   text
*     "title" to get the in-field label from the field's title attribute
*      (this is the default)
*     "label" to get the in-field label from the inner text of the field's label
*      (note that the label must be attached to the field with for="fieldid")
*     a function which takes one parameter, the input field, and returns
*      whatever text it likes
*
*   labelledClass
*     a class that will be applied to the input field when it contains the
*      label and removed when it contains user input. Defaults to blank.
*
*/
jQuery.fn.labelify=function(settings) {
   settings=jQuery.extend({
      text: "title",
      labelledClass: ""
   }, settings);
   var lookups={
      title: function(input) {
         return $(input).attr("title");
      },
      label: function(input) {
         return $("label[for="+input.id+"]").text();
      }
   };
   var lookup;
   var jQuery_labellified_elements=$(this);
   return $(this).each(function() {
      if(typeof settings.text==="string") {
         lookup=lookups[settings.text]; // what if not there?
      } else {
         lookup=settings.text; // what if not a fn?
      };
      // bail if lookup isn't a function or if it returns undefined
      if(typeof lookup!=="function") { return; }
      var lookupval=lookup(this);
      if(!lookupval) { return; }

      // need to strip newlines because the browser strips them
      // if you set textbox.value to a string containing them
      $(this).data("label", lookup(this).replace(/\n/g, ''));
      $(this).focus(function() {
         if(this.value===$(this).data("label")) {
            this.value=""; // this.defaultValue;
            $(this).removeClass(settings.labelledClass);
         }
      }).blur(function() {
         if(this.value==="") {//this.defaultValue) {
            this.value=$(this).data("label");
            $(this).addClass(settings.labelledClass);
         }
      });

      var removeValuesOnExit=function() {
         jQuery_labellified_elements.each(function() {
            if(this.value===$(this).data("label")) {
               this.value=""; // this.defaultValue;
               $(this).removeClass(settings.labelledClass);
            }
         })
      };

      $(this).parents("form").submit(removeValuesOnExit);
      $(window).unload(removeValuesOnExit);

      //if(this.value!==this.defaultValue) {
      if(this.value!=="") {
         // user already started typing; don't overwrite their work!
         return;
      }
      // actually set the value
      this.value=$(this).data("label");
      $(this).addClass(settings.labelledClass);
   });
};

/*
* qTip2 - Pretty powerful tooltips
* http://craigsworks.com/projects/qtip2/
*
* Version: nightly
* Copyright 2009-2010 Craig Michael Thompson - http://craigsworks.com
*
$('a[title]').qtip() - replace regular titles
$('.selector').qtip({content: {attr: 'alt'  }   }) - alternative attribute (instead of title)
$('.selector').qtip({ content: 'Short hand notation'});
* Date: Sun Aug 21 17:08:04.0000000000 2011
*/

(function($, window, undefined) {
   "use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/

   // Munge the primitives - Paul Irish tip
   var TRUE=true,
      FALSE=false,
      NULL=null,

   // Shortcut vars
      QTIP, PLUGINS, MOUSE,
      usedIDs={},
      uitooltip='ui-tooltip',
      widget='ui-widget',
      disabled='ui-state-disabled',
      selector='div.qtip.'+uitooltip,
      defaultClass=uitooltip+'-default',
      focusClass=uitooltip+'-focus',
      hoverClass=uitooltip+'-hover',
      fluidClass=uitooltip+'-fluid',
      hideOffset='-31000px',
      replaceSuffix='_replacedByqTip',
      oldtitle='oldtitle',
      trackingBound;

   /* Thanks to Paul Irish for this one: http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/ */
   function log() {
      log.history=log.history||[];
      log.history.push(arguments);

      // Make sure console is present
      if('object'===typeof console) {
         // Setup console and arguments
         var c=console[console.warn?'warn':'log'],
         args=Array.prototype.slice.call(arguments), a;

         // Add qTip2 marker to first argument if it's a string
         if(typeof arguments[0]==='string') { args[0]='qTip2: '+args[0]; }

         // Apply console.warn or .log if not supported
         a=c.apply?c.apply(console, args):c(args);
      }
   }

   // Option object sanitizer
   function sanitizeOptions(opts) {
      var content;

      if(!opts||'object'!==typeof opts) { return FALSE; }

      if('object'!==typeof opts.metadata) {
         opts.metadata={
            type: opts.metadata
         };
      }

      if('content' in opts) {
         if('object'!==typeof opts.content||opts.content.jquery) {
            opts.content={
               text: opts.content
            };
         }

         content=opts.content.text||FALSE;
         if(!$.isFunction(content)&&((!content&&!content.attr)||content.length<1||('object'===typeof content&&!content.jquery))) {
            opts.content.text=FALSE;
         }

         if('title' in opts.content) {
            if('object'!==typeof opts.content.title) {
               opts.content.title={
                  text: opts.content.title
               };
            }

            content=opts.content.title.text||FALSE;
            if(!$.isFunction(content)&&((!content&&!content.attr)||content.length<1||('object'===typeof content&&!content.jquery))) {
               opts.content.title.text=FALSE;
            }
         }
      }

      if('position' in opts) {
         if('object'!==typeof opts.position) {
            opts.position={
               my: opts.position,
               at: opts.position
            };
         }
      }

      if('show' in opts) {
         if('object'!==typeof opts.show) {
            if(opts.show.jquery) {
               opts.show={ target: opts.show };
            }
            else {
               opts.show={ event: opts.show };
            }
         }
      }

      if('hide' in opts) {
         if('object'!==typeof opts.hide) {
            if(opts.hide.jquery) {
               opts.hide={ target: opts.hide };
            }
            else {
               opts.hide={ event: opts.hide };
            }
         }
      }

      if('style' in opts) {
         if('object'!==typeof opts.style) {
            opts.style={
               classes: opts.style
            };
         }
      }

      // Sanitize plugin options
      $.each(PLUGINS, function() {
         if(this.sanitize) { this.sanitize(opts); }
      });

      return opts;
   }

   /*
   * Core plugin implementation
   */
   function QTip(target, options, id, attr) {
      // Declare this reference
      var self=this,
      docBody=document.body,
      tooltipID=uitooltip+'-'+id,
      isPositioning=0,
      isDrawing=0,
      tooltip=$(),
      namespace='.qtip-'+id,
      elements, cache;

      // Setup class attributes
      self.id=id;
      self.rendered=FALSE;
      self.elements=elements={ target: target };
      self.timers={ img: {} };
      self.options=options;
      self.checks={};
      self.plugins={};
      self.cache=cache={
         event: {},
         target: $(),
         disabled: FALSE,
         attr: attr
      };

      /*
      * Private core functions
      */
      function convertNotation(notation) {
         var i=0, obj, option=options,

         // Split notation into array
      levels=notation.split('.');

         // Loop through
         while(option=option[levels[i++]]) {
            if(i<levels.length) { obj=option; }
         }

         return [obj||options, levels.pop()];
      }

      function setWidget() {
         var on=options.style.widget;

         tooltip.toggleClass(widget, on).toggleClass(defaultClass, !on);
         elements.content.toggleClass(widget+'-content', on);

         if(elements.titlebar) {
            elements.titlebar.toggleClass(widget+'-header', on);
         }
         if(elements.button) {
            elements.button.toggleClass(uitooltip+'-icon', !on);
         }
      }

      function removeTitle(reposition) {
         if(elements.title) {
            elements.titlebar.remove();
            elements.titlebar=elements.title=elements.button=NULL;

            // Reposition if enabled
            if(reposition!==FALSE) { self.reposition(); }
         }
      }

      function createButton() {
         var button=options.content.title.button,
         isString=typeof button==='string',
         close=isString?button:'Close tooltip';

         if(elements.button) { elements.button.remove(); }

         // Use custom button if one was supplied by user, else use default
         if(button.jquery) {
            elements.button=button;
         }
         else {
            elements.button=$('<a />', {
               'class': 'ui-state-default '+(options.style.widget?'':uitooltip+'-icon'),
               'title': close,
               'aria-label': close
            })
         .prepend(
            $('<span />', {
               'class': 'ui-icon ui-icon-close',
               'html': '&times;'
            })
         );
         }

         // Create button and setup attributes
         elements.button.appendTo(elements.titlebar)
         .attr('role', 'button')
         .hover(function(event) { $(this).toggleClass('ui-state-hover', event.type==='mouseenter'); })
         .click(function(event) {
            if(!tooltip.hasClass(disabled)) { self.hide(event); }
            return FALSE;
         })
         .bind('mousedown keydown mouseup keyup mouseout', function(event) {
            $(this).toggleClass('ui-state-active ui-state-focus', event.type.substr(-4)==='down');
         });

         // Redraw the tooltip when we're done
         self.redraw();
      }

      function createTitle() {
         var id=tooltipID+'-title';

         // Destroy previous title element, if present
         if(elements.titlebar) { removeTitle(); }

         // Create title bar and title elements
         elements.titlebar=$('<div />', {
            'class': uitooltip+'-titlebar '+(options.style.widget?'ui-widget-header':'')
         })
      .append(
         elements.title=$('<div />', {
            'id': id,
            'class': uitooltip+'-title',
            'aria-atomic': TRUE
         })
      )
      .insertBefore(elements.content);

         // Create button if enabled
         if(options.content.title.button) { createButton(); }

         // Redraw the tooltip dimensions if it's rendered
         else if(self.rendered) { self.redraw(); }
      }

      function updateButton(button) {
         var elem=elements.button,
         title=elements.title;

         // Make sure tooltip is rendered and if not, return
         if(!self.rendered) { return FALSE; }

         if(!button) {
            elem.remove();
         }
         else {
            if(!title) {
               createTitle();
            }
            createButton();
         }
      }

      function updateTitle(content, reposition) {
         var elem=elements.title;

         // Make sure tooltip is rendered and if not, return
         if(!self.rendered||!content) { return FALSE; }

         // Use function to parse content
         if($.isFunction(content)) {
            content=content.call(target, cache.event, self);
         }

         // Remove title if callback returns false
         if(content===FALSE) { return removeTitle(FALSE); }

         // Append new content if its a DOM array and show it if hidden
         else if(content.jquery&&content.length>0) {
            elem.empty().append(content.css({ display: 'block' }));
         }

         // Content is a regular string, insert the new content
         else { elem.html(content); }

         // Redraw and reposition
         self.redraw();
         if(reposition!==FALSE&&self.rendered&&tooltip.is(':visible')) {
            self.reposition(cache.event);
         }
      }

      function updateContent(content, reposition) {
         var elem=elements.content;

         // Make sure tooltip is rendered and content is defined. If not return
         if(!self.rendered||!content) { return FALSE; }

         // Use function to parse content
         if($.isFunction(content)) {
            content=content.call(target, cache.event, self)||'';
         }

         // Append new content if its a DOM array and show it if hidden
         if(content.jquery&&content.length>0) {
            elem.empty().append(content.css({ display: 'block' }));
         }

         // Content is a regular string, insert the new content
         else { elem.html(content); }

         // Image detection
         function detectImages(next) {
            var images, srcs={};

            function imageLoad(image) {
               // Clear src from object and any timers and events associated with the image
               if(image) {
                  delete srcs[image.src];
                  clearTimeout(self.timers.img[image.src]);
                  $(image).unbind(namespace);
               }

               // If queue is empty after image removal, update tooltip and continue the queue
               if($.isEmptyObject(srcs)) {
                  self.redraw();
                  if(reposition!==FALSE) {
                     self.reposition(cache.event);
                  }

                  next();
               }
            }

            // Find all content images without dimensions, and if no images were found, continue
            if((images=elem.find('img:not([height]):not([width])')).length===0) { return imageLoad(); }

            // Apply timer to each image to poll for dimensions
            images.each(function(i, elem) {
               // Skip if the src is already present
               if(srcs[elem.src]!==undefined) { return; }

               (function timer() {
                  // When the dimensions are found, remove the image from the queue
                  if(elem.height||elem.width) { return imageLoad(elem); }

                  // Restart timer
                  self.timers.img[elem.src]=setTimeout(timer, 700);
               } ());

               // Also apply regular load/error event handlers
               $(elem).bind('error'+namespace+' load'+namespace, function() { imageLoad(this); });

               // Store the src and element in our object
               srcs[elem.src]=elem;
            });
         }

         /*
         * If we're still rendering... insert into 'fx' queue our image dimension
         * checker which will halt the showing of the tooltip until image dimensions
         * can be detected properly.
         */
         if(self.rendered<0) { tooltip.queue('fx', detectImages); }

         // We're fully rendered, so reset isDrawing flag and proceed without queue delay
         else { isDrawing=0; detectImages($.noop); }

         return self;
      }

      function assignEvents() {
         var posOptions=options.position,
         targets={
            show: options.show.target,
            hide: options.hide.target,
            viewport: $(posOptions.viewport),
            document: $(document),
            window: $(window)
         },
         events={
            show: $.trim(''+options.show.event).split(' '),
            hide: $.trim(''+options.hide.event).split(' ')
         },
         IE6=$.browser.msie&&parseInt($.browser.version, 10)===6;

         // Define show event method
         function showMethod(event) {
            if(tooltip.hasClass(disabled)) { return FALSE; }

            // If set, hide tooltip when inactive for delay period
            targets.show.trigger('qtip-'+id+'-inactive');

            // Clear hide timers
            clearTimeout(self.timers.show);
            clearTimeout(self.timers.hide);

            // Start show timer
            var callback=function() { self.toggle(TRUE, event); };
            if(options.show.delay>0) {
               self.timers.show=setTimeout(callback, options.show.delay);
            }
            else { callback(); }
         }

         // Define hide method
         function hideMethod(event) {
            if(tooltip.hasClass(disabled)||isPositioning||isDrawing) { return FALSE; }

            // Check if new target was actually the tooltip element
            var relatedTarget=$(event.relatedTarget||event.target),
            ontoTooltip=relatedTarget.closest(selector)[0]===tooltip[0],
            ontoTarget=relatedTarget[0]===targets.show[0];

            // Clear timers and stop animation queue
            clearTimeout(self.timers.show);
            clearTimeout(self.timers.hide);

            // Prevent hiding if tooltip is fixed and event target is the tooltip. Or if mouse positioning is enabled and cursor momentarily overlaps
            if((posOptions.target==='mouse'&&ontoTooltip)||(options.hide.fixed&&((/mouse(out|leave|move)/).test(event.type)&&(ontoTooltip||ontoTarget)))) {
               event.preventDefault(); event.stopImmediatePropagation(); return;
            }

            // If tooltip has displayed, start hide timer
            if(options.hide.delay>0) {
               self.timers.hide=setTimeout(function() { self.hide(event); }, options.hide.delay);
            }
            else { self.hide(event); }
         }

         // Define inactive method
         function inactiveMethod(event) {
            if(tooltip.hasClass(disabled)) { return FALSE; }

            // Clear timer
            clearTimeout(self.timers.inactive);
            self.timers.inactive=setTimeout(function() { self.hide(event); }, options.hide.inactive);
         }

         function repositionMethod(event) {
            if(tooltip.is(':visible')) { self.reposition(event); }
         }

         // On mouseenter/mouseleave...
         tooltip.bind('mouseenter'+namespace+' mouseleave'+namespace, function(event) {
            var state=event.type==='mouseenter';

            // Focus the tooltip on mouseenter (z-index stacking)
            if(state) { self.focus(event); }

            // Add hover class
            tooltip.toggleClass(hoverClass, state);
         });

         // Enable hide.fixed
         if(options.hide.fixed) {
            // Add tooltip as a hide target
            targets.hide=targets.hide.add(tooltip);

            // Clear hide timer on tooltip hover to prevent it from closing
            tooltip.bind('mouseover'+namespace, function() {
               if(!tooltip.hasClass(disabled)) { clearTimeout(self.timers.hide); }
            });
         }

         // If using mouseout/mouseleave as a hide event...
         if(/mouse(out|leave)/i.test(options.hide.event)) {
            // Hide tooltips when leaving current window/frame (but not select/option elements)
            if(options.hide.leave==='window') {
               targets.window.bind('mouseout'+namespace, function(event) {
                  if(/select|option/.test(event.target)&&!event.relatedTarget) { self.hide(event); }
               });
            }
         }

         /*
         * Make sure hoverIntent functions properly by using mouseleave to clear show timer if
         * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
         */
         else if(/mouse(over|enter)/i.test(options.show.event)) {
            targets.hide.bind('mouseleave'+namespace, function(event) {
               clearTimeout(self.timers.show);
            });
         }

         // Hide tooltip on document mousedown if unfocus events are enabled
         if((''+options.hide.event).indexOf('unfocus')> -1) {
            targets.document.bind('mousedown'+namespace, function(event) {
               var $target=$(event.target),
               enabled=!tooltip.hasClass(disabled)&&tooltip.is(':visible');

               if($target[0]!==tooltip[0]&&$target.parents(selector).length===0&&$target.add(target).length>1) {
                  self.hide(event);
               }
            });
         }

         // Check if the tooltip hides when inactive
         if('number'===typeof options.hide.inactive) {
            // Bind inactive method to target as a custom event
            targets.show.bind('qtip-'+id+'-inactive', inactiveMethod);

            // Define events which reset the 'inactive' event handler
            $.each(QTIP.inactiveEvents, function(index, type) {
               targets.hide.add(elements.tooltip).bind(type+namespace+'-inactive', inactiveMethod);
            });
         }

         // Apply hide events
         $.each(events.hide, function(index, type) {
            var showIndex=$.inArray(type, events.show),
               targetHide=$(targets.hide);

            // Both events and targets are identical, apply events using a toggle
            if((showIndex> -1&&targetHide.add(targets.show).length===targetHide.length)||type==='unfocus') {
               targets.show.bind(type+namespace, function(event) {
                  if(tooltip.is(':visible')) { hideMethod(event); }
                  else { showMethod(event); }
               });

               // Don't bind the event again
               delete events.show[showIndex];
            }

            // Events are not identical, bind normally
            else { targets.hide.bind(type+namespace, hideMethod); }
         });

         // Apply show events
         $.each(events.show, function(index, type) {
            targets.show.bind(type+namespace, showMethod);
         });

         // Check if the tooltip hides when mouse is moved a certain distance
         if('number'===typeof options.hide.distance) {
            // Bind mousemove to target to detect distance difference
            targets.show.add(tooltip).bind('mousemove'+namespace, function(event) {
               var origin=cache.origin||{},
               limit=options.hide.distance,
               abs=Math.abs;

               // Check if the movement has gone beyond the limit, and hide it if so
               if(abs(event.pageX-origin.pageX)>=limit||abs(event.pageY-origin.pageY)>=limit) {
                  self.hide(event);
               }
            });
         }

         // Mouse positioning events
         if(posOptions.target==='mouse') {
            // Cache mousemove coords on show targets
            targets.show.bind('mousemove'+namespace, function(event) {
               MOUSE={ pageX: event.pageX, pageY: event.pageY, type: 'mousemove' };
            });

            // If mouse adjustment is on...
            if(posOptions.adjust.mouse) {
               // Apply a mouseleave event so we don't get problems with overlapping
               if(options.hide.event) {
                  tooltip.bind('mouseleave'+namespace, function(event) {
                     if((event.relatedTarget||event.target)!==targets.show[0]) { self.hide(event); }
                  });
               }

               // Update tooltip position on mousemove
               targets.document.bind('mousemove'+namespace, function(event) {
                  // Update the tooltip position only if the tooltip is visible and adjustment is enabled
                  if(!tooltip.hasClass(disabled)&&tooltip.is(':visible')) {
                     self.reposition(event||MOUSE);
                  }
               });
            }
         }

         // Adjust positions of the tooltip on window resize if enabled
         if(posOptions.adjust.resize||targets.viewport.length) {
            ($.event.special.resize?targets.viewport:targets.window).bind('resize'+namespace, repositionMethod);
         }

         // Adjust tooltip position on scroll if screen adjustment is enabled
         if(targets.viewport.length||(IE6&&tooltip.css('position')==='fixed')) {
            targets.viewport.bind('scroll'+namespace, repositionMethod);
         }
      }

      function unassignEvents() {
         var targets=[
            options.show.target[0],
            options.hide.target[0],
            self.rendered&&elements.tooltip[0],
            options.position.container[0],
            options.position.viewport[0],
            window,
            document
         ];

         // Check if tooltip is rendered
         if(self.rendered) {
            $([]).pushStack($.grep(targets, function(i) { return typeof i==='object'; })).unbind(namespace);
         }

         // Tooltip isn't yet rendered, remove render event
         else { options.show.target.unbind(namespace+'-create'); }
      }

      // Setup builtin .set() option checks
      self.checks.builtin={
         // Core checks
         '^id$': function(obj, o, v) {
            var id=v===TRUE?QTIP.nextid:v,
            tooltipID=uitooltip+'-'+id;

            if(id!==FALSE&&id.length>0&&!$('#'+tooltipID).length) {
               tooltip[0].id=tooltipID;
               elements.content[0].id=tooltipID+'-content';
               elements.title[0].id=tooltipID+'-title';
            }
         },

         // Content checks
         '^content.text$': function(obj, o, v) { updateContent(v); },
         '^content.title.text$': function(obj, o, v) {
            // Remove title if content is null
            if(!v) { return removeTitle(); }

            // If title isn't already created, create it now and update
            if(!elements.title&&v) { createTitle(); }
            updateTitle(v);
         },
         '^content.title.button$': function(obj, o, v) { updateButton(v); },

         // Position checks
         '^position.(my|at)$': function(obj, o, v) {
            // Parse new corner value into Corner objecct
            if('string'===typeof v) {
               obj[o]=new PLUGINS.Corner(v);
            }
         },
         '^position.container$': function(obj, o, v) {
            if(self.rendered) { tooltip.appendTo(v); }
         },

         // Show checks
         '^show.ready$': function() {
            if(!self.rendered) { self.render(1); }
            else { self.toggle(TRUE); }
         },

         // Style checks
         '^style.classes$': function(obj, o, v) {
            tooltip.attr('class', uitooltip+' qtip ui-helper-reset '+v);
         },
         '^style.widget|content.title': setWidget,

         // Events check
         '^events.(render|show|move|hide|focus|blur)$': function(obj, o, v) {
            tooltip[($.isFunction(v)?'':'un')+'bind']('tooltip'+o, v);
         },

         // Properties which require event reassignment
         '^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)': function() {
            var posOptions=options.position;

            // Set tracking flag
            tooltip.attr('tracking', posOptions.target==='mouse'&&posOptions.adjust.mouse);

            // Reassign events
            unassignEvents(); assignEvents();
         }
      };

      /*
      * Public API methods
      */
      $.extend(self, {
         render: function(show) {
            if(self.rendered) { return self; } // If tooltip has already been rendered, exit

            var title=options.content.title.text,
            posOptions=options.position,
            callback=$.Event('tooltiprender');

            // Add ARIA attributes to target
            $.attr(target[0], 'aria-describedby', tooltipID);

            // Create tooltip element
            tooltip=elements.tooltip=$('<div/>', {
               'id': tooltipID,
               'class': uitooltip+' qtip ui-helper-reset '+defaultClass+' '+options.style.classes+' '+uitooltip+'-pos-'+options.position.my.abbreviation(),
               'width': options.style.width||'',
               'height': options.style.height||'',
               'tracking': posOptions.target==='mouse'&&posOptions.adjust.mouse,

               /* ARIA specific attributes */
               'role': 'alert',
               'aria-live': 'polite',
               'aria-atomic': FALSE,
               'aria-describedby': tooltipID+'-content',
               'aria-hidden': TRUE
            })
            .toggleClass(disabled, cache.disabled)
            .data('qtip', self)
            .appendTo(options.position.container)
            .append(
            // Create content element
               elements.content=$('<div />', {
                  'class': uitooltip+'-content',
                  'id': tooltipID+'-content',
                  'aria-atomic': TRUE
               })
            );

            // Set rendered flag and prevent redundant redraw/reposition calls for now
            self.rendered= -1;
            isDrawing=1; isPositioning=1;

            // Update title
            if(title) {
               createTitle();
               updateTitle(title, FALSE);
            }

            // Set proper rendered flag and update content
            updateContent(options.content.text, FALSE);
            self.rendered=TRUE;

            // Setup widget classes
            setWidget();

            // Assign passed event callbacks (before plugins!)
            $.each(options.events, function(name, callback) {
               if($.isFunction(callback)) {
                  tooltip.bind(name==='toggle'?'tooltipshow tooltiphide':'tooltip'+name, callback);
               }
            });

            // Initialize 'render' plugins
            $.each(PLUGINS, function() {
               if(this.initialize==='render') { this(self); }
            });

            // Assign events
            assignEvents();

            /* Queue this part of the render process in our fx queue so we can
            * load images before the tooltip renders fully.
            *
            * See: updateContent method
            */
            tooltip.queue('fx', function(next) {
               // Trigger tooltiprender event and pass original triggering event as original
               callback.originalEvent=cache.event;
               tooltip.trigger(callback, [self]);

               // Reset flags
               isDrawing=0; isPositioning=0;

               // Redraw the tooltip manually now we're fully rendered
               self.redraw();

               // Show tooltip if needed
               if(options.show.ready||show) {
                  self.toggle(TRUE, cache.event);
               }

               next(); // Move on to next method in queue
            });

            return self;
         },

         get: function(notation) {
            var result, o;

            switch(notation.toLowerCase()) {
               case 'dimensions':
                  result={
                     height: tooltip.outerHeight(), width: tooltip.outerWidth()
                  };
                  break;

               case 'offset':
                  result=PLUGINS.offset(tooltip, options.position.container);
                  break;

               default:
                  o=convertNotation(notation.toLowerCase());
                  result=o[0][o[1]];
                  result=result.precedance?result.string():result;
                  break;
            }

            return result;
         },

         set: function(option, value) {
            var rmove=/^position\.(my|at|adjust|target|container)|style|content|show\.ready/i,
            rdraw=/^content\.(title|attr)|style/i,
            reposition=FALSE,
            redraw=FALSE,
            checks=self.checks,
            name;

            function callback(notation, args) {
               var category, rule, match;

               for(category in checks) {
                  for(rule in checks[category]) {
                     if(match=(new RegExp(rule, 'i')).exec(notation)) {
                        args.push(match);
                        checks[category][rule].apply(self, args);
                     }
                  }
               }
            }

            // Convert singular option/value pair into object form
            if('string'===typeof option) {
               name=option; option={}; option[name]=value;
            }
            else { option=$.extend(TRUE, {}, option); }

            // Set all of the defined options to their new values
            $.each(option, function(notation, value) {
               var obj=convertNotation(notation.toLowerCase()), previous;

               // Set new obj value
               previous=obj[0][obj[1]];
               obj[0][obj[1]]='object'===typeof value&&value.nodeType?$(value):value;

               // Set the new params for the callback
               option[notation]=[obj[0], obj[1], value, previous];

               // Also check if we need to reposition / redraw
               reposition=rmove.test(notation)||reposition;
               redraw=rdraw.test(notation)||redraw;
            });

            // Re-sanitize options
            sanitizeOptions(options);

            /*
            * Execute any valid callbacks for the set options
            * Also set isPositioning/isDrawing so we don't get loads of redundant repositioning
            * and redraw calls.
            */
            isPositioning=isDrawing=1; $.each(option, callback); isPositioning=isDrawing=0;

            // Update position / redraw if needed
            if(tooltip.is(':visible')&&self.rendered) {
               if(reposition) {
                  self.reposition(options.position.target==='mouse'?NULL:cache.event);
               }
               if(redraw) { self.redraw(); }
            }

            return self;
         },

         toggle: function(state, event) {
            // Make sure tooltip is rendered
            if(!self.rendered) {
               if(state) { self.render(1); } // Render the tooltip if showing and it isn't already
               else { return self; }
            }

            var type=state?'show':'hide',
            opts=options[type],
            visible=tooltip.is(':visible'),
            sameTarget=!event||options[type].target.length<2||cache.target[0]===event.target,
            posOptions=options.position,
            contentOptions=options.content,
            delay,
            callback;

            // Detect state if valid one isn't provided
            if((typeof state).search('boolean|number')) { state=!visible; }

            // Return if element is already in correct state
            if(!tooltip.is(':animated')&&visible===state&&sameTarget) { return self; }

            // Try to prevent flickering when tooltip overlaps show element
            if(event) {
               if((/over|enter/).test(event.type)&&(/out|leave/).test(cache.event.type)&&
               event.target===options.show.target[0]&&tooltip.has(event.relatedTarget).length) {
                  return self;
               }

               // Cache event
               cache.event=$.extend({}, event);
            }

            // Call API methods
            callback=$.Event('tooltip'+type);
            callback.originalEvent=event?cache.event:NULL;
            tooltip.trigger(callback, [self, 90]);
            if(callback.isDefaultPrevented()) { return self; }

            // Set ARIA hidden status attribute
            $.attr(tooltip[0], 'aria-hidden', !!!state);

            // Execute state specific properties
            if(state) {
               // Store show origin coordinates
               cache.origin=$.extend({}, MOUSE);

               // Focus the tooltip
               self.focus(event);

               // Update tooltip content & title if it's a dynamic function
               if($.isFunction(contentOptions.text)) { updateContent(contentOptions.text, FALSE); }
               if($.isFunction(contentOptions.title.text)) { updateTitle(contentOptions.title.text, FALSE); }

               // Cache mousemove events for positioning purposes (if not already tracking)
               if(!trackingBound&&posOptions.target==='mouse'&&posOptions.adjust.mouse) {
                  $(document).bind('mousemove.qtip', function(event) {
                     MOUSE={ pageX: event.pageX, pageY: event.pageY, type: 'mousemove' };
                  });
                  trackingBound=TRUE;
               }

               // Update the tooltip position
               self.reposition(event);

               // Hide other tooltips if tooltip is solo, using it as the context
               if(opts.solo) { $(selector, opts.solo).not(tooltip).qtip('hide', callback); }
            }
            else {
               // Clear show timer if we're hiding
               clearTimeout(self.timers.show);

               // Remove cached origin on hide
               delete cache.origin;

               // Remove mouse tracking event if not needed (all tracking qTips are hidden)
               if(trackingBound&&!$(selector+'[tracking="true"]:visible', opts.solo).not(tooltip).length) {
                  $(document).unbind('mousemove.qtip');
                  trackingBound=FALSE;
               }

               // Blur the tooltip
               self.blur(event);
            }

            // Define post-animation, state specific properties
            function after() {
               if(state) {
                  // Prevent antialias from disappearing in IE by removing filter
                  if($.browser.msie) { tooltip[0].style.removeAttribute('filter'); }

                  // Remove overflow setting to prevent tip bugs
                  tooltip.css('overflow', '');

                  // Autofocus elements if enabled
                  if('string'===typeof opts.autofocus) {
                     $(opts.autofocus, tooltip).focus();
                  }

                  // Call API method
                  callback=$.Event('tooltipvisible');
                  callback.originalEvent=event?cache.event:NULL;
                  tooltip.trigger(callback, [self]);
               }
               else {
                  // Reset CSS states
                  tooltip.css({
                     display: '',
                     visibility: '',
                     opacity: '',
                     left: '',
                     top: ''
                  });
               }
            }

            // Clear animation queue if same target
            if(sameTarget) { tooltip.stop(0, 1); }

            // If no effect type is supplied, use a simple toggle
            if(opts.effect===FALSE) {
               tooltip[type]();
               after.call(tooltip);
            }

            // Use custom function if provided
            else if($.isFunction(opts.effect)) {
               opts.effect.call(tooltip, self);
               tooltip.queue('fx', function(n) { after(); n(); });
            }

            // Use basic fade function by default
            else { tooltip.fadeTo(90, state?1:0, after); }

            // If inactive hide method is set, active it
            if(state) { opts.target.trigger('qtip-'+id+'-inactive'); }

            return self;
         },

         show: function(event) { return self.toggle(TRUE, event); },

         hide: function(event) { return self.toggle(FALSE, event); },

         focus: function(event) {
            if(!self.rendered) { return self; }

            var qtips=$(selector),
            curIndex=parseInt(tooltip[0].style.zIndex, 10),
            newIndex=QTIP.zindex+qtips.length,
            cachedEvent=$.extend({}, event),
            focusedElem, callback;

            // Only update the z-index if it has changed and tooltip is not already focused
            if(!tooltip.hasClass(focusClass)) {
               // Call API method
               callback=$.Event('tooltipfocus');
               callback.originalEvent=cachedEvent;
               tooltip.trigger(callback, [self, newIndex]);

               // If default action wasn't prevented...
               if(!callback.isDefaultPrevented()) {
                  // Only update z-index's if they've changed
                  if(curIndex!==newIndex) {
                     // Reduce our z-index's and keep them properly ordered
                     qtips.each(function() {
                        if(this.style.zIndex>curIndex) {
                           this.style.zIndex=this.style.zIndex-1;
                        }
                     });

                     // Fire blur event for focused tooltip
                     qtips.filter('.'+focusClass).qtip('blur', cachedEvent);
                  }

                  // Set the new z-index
                  tooltip.addClass(focusClass)[0].style.zIndex=newIndex;
               }
            }

            return self;
         },

         blur: function(event) {
            var cachedEvent=$.extend({}, event),
            callback;

            // Set focused status to FALSE
            tooltip.removeClass(focusClass);

            // Trigger blur event
            callback=$.Event('tooltipblur');
            callback.originalEvent=cachedEvent;
            tooltip.trigger(callback, [self]);

            return self;
         },

         reposition: function(event, effect) {
            if(!self.rendered||isPositioning) { return self; }

            // Set positioning flag
            isPositioning=1;

            var target=options.position.target,
            posOptions=options.position,
            my=posOptions.my,
            at=posOptions.at,
            adjust=posOptions.adjust,
            method=adjust.method.split(' '),
            elemWidth=tooltip.outerWidth(),
            elemHeight=tooltip.outerHeight(),
            targetWidth=0,
            targetHeight=0,
            callback=$.Event('tooltipmove'),
            fixed=tooltip.css('position')==='fixed',
            viewport=posOptions.viewport,
            position={ left: 0, top: 0 },
            flipoffset=FALSE,
            tip=self.plugins.tip,
            readjust={
               // Axis detection and readjustment indicator
               horizontal: method[0],
               vertical: (method[1]=method[1]||method[0]),
               enabled: viewport.jquery&&target[0]!==window&&target[0]!==docBody&&adjust.method!=='none',

               // Reposition methods
               left: function(posLeft) {
                  var isShift=readjust.horizontal==='shift',
                     viewportScroll=viewport.offset.left+viewport.scrollLeft,
                     myWidth=my.x==='left'?elemWidth:my.x==='right'?-elemWidth:-elemWidth/2,
                     atWidth=at.x==='left'?targetWidth:at.x==='right'?-targetWidth:-targetWidth/2,
                     tipWidth=tip&&tip.size?tip.size.width||0:0,
                     tipAdjust=tip&&tip.corner&&tip.corner.precedance==='x'&&!isShift?tipWidth:0,
                     overflowLeft=viewportScroll-posLeft+tipAdjust,
                     overflowRight=posLeft+elemWidth-viewport.width-viewportScroll+tipAdjust,
                     offset=myWidth-(my.precedance==='x'||my.x===my.y?atWidth:0),
                     isCenter=my.x==='center';

                  // Optional 'shift' style repositioning
                  if(isShift) {
                     tipAdjust=tip&&tip.corner&&tip.corner.precedance==='y'?tipWidth:0;
                     offset=(my.x==='left'?1:-1)*myWidth-tipAdjust;

                     // Adjust position but keep it within viewport dimensions
                     position.left+=overflowLeft>0?overflowLeft:overflowRight>0?-overflowRight:0;
                     position.left=Math.max(
                        viewport.offset.left+(tipAdjust&&tip.corner.x==='center'?tip.offset:0),
                        posLeft-offset,
                        Math.min(
                           Math.max(viewport.offset.left+viewport.width, posLeft+offset),
                           position.left
                        )
                     );
                  }

                  // Default 'flip' repositioning
                  else {
                     if(overflowLeft>0&&(my.x!=='left'||overflowRight>0)) {
                        position.left-=offset+(isCenter?0:2*adjust.x);
                     }
                     else if(overflowRight>0&&(my.x!=='right'||overflowLeft>0)) {
                        position.left-=isCenter?-offset:offset+(2*adjust.x);
                     }
                     if(position.left!==posLeft&&isCenter) { position.left-=adjust.x; }

                     // Make sure we haven't made things worse with the adjustment and return the adjusted difference
                     if(position.left<viewportScroll&& -position.left>overflowRight) { position.left=posLeft; }
                  }

                  return position.left-posLeft;
               },
               top: function(posTop) {
                  var isShift=readjust.vertical==='shift',
                     viewportScroll=viewport.offset.top+viewport.scrollTop,
                     myHeight=my.y==='top'?elemHeight:my.y==='bottom'?-elemHeight:-elemHeight/2,
                     atHeight=at.y==='top'?targetHeight:at.y==='bottom'?-targetHeight:-targetHeight/2,
                     tipHeight=tip&&tip.size?tip.size.height||0:0,
                     tipAdjust=tip&&tip.corner&&tip.corner.precedance==='y'&&!isShift?tipHeight:0,
                     overflowTop=viewportScroll-posTop+tipAdjust,
                     overflowBottom=posTop+elemHeight-viewport.height-viewportScroll+tipAdjust,
                     offset=myHeight-(my.precedance==='y'||my.x===my.y?atHeight:0),
                     isCenter=my.y==='center';

                  // Optional 'shift' style repositioning
                  if(isShift) {
                     tipAdjust=tip&&tip.corner&&tip.corner.precedance==='x'?tipHeight:0;
                     offset=(my.y==='top'?1:-1)*myHeight-tipAdjust;

                     // Adjust position but keep it within viewport dimensions
                     position.top+=overflowTop>0?overflowTop:overflowBottom>0?-overflowBottom:0;
                     position.top=Math.max(
                        viewport.offset.top+(tipAdjust&&tip.corner.x==='center'?tip.offset:0),
                        posTop-offset,
                        Math.min(
                           Math.max(viewport.offset.top+viewport.height, posTop+offset),
                           position.top
                        )
                     );
                  }

                  // Default 'flip' repositioning
                  else {
                     if(overflowTop>0&&(my.y!=='top'||overflowBottom>0)) {
                        position.top-=offset+(isCenter?0:2*adjust.y);
                     }
                     else if(overflowBottom>0&&(my.y!=='bottom'||overflowTop>0)) {
                        position.top-=isCenter?-offset:offset+(2*adjust.y);
                     }
                     if(position.top!==posTop&&isCenter) { position.top-=adjust.y; }

                     // Make sure we haven't made things worse with the adjustment and return the adjusted difference
                     if(position.top<0&& -position.top>overflowBottom) { position.top=posTop; }
                  }

                  return position.top-posTop;
               }
            };

            // Check if absolute position was passed
            if($.isArray(target)&&target.length===2) {
               // Force left top and set position
               at={ x: 'left', y: 'top' };
               position={ left: target[0], top: target[1] };
            }

            // Check if mouse was the target
            else if(target==='mouse'&&((event&&event.pageX)||cache.event.pageX)) {
               // Force left top to allow flipping
               at={ x: 'left', y: 'top' };

               // Use cached event if one isn't available for positioning
               event=(event&&(event.type==='resize'||event.type==='scroll')?cache.event:
               event&&event.pageX&&event.type==='mousemove'?event:
               MOUSE&&MOUSE.pageX&&(adjust.mouse||!event||!event.pageX)?{ pageX: MOUSE.pageX, pageY: MOUSE.pageY}:
               !adjust.mouse&&cache.origin&&cache.origin.pageX?cache.origin:
               event)||event||cache.event||MOUSE||{};

               // Use event coordinates for position
               position={ top: event.pageY, left: event.pageX };
            }

            // Target wasn't mouse or absolute...
            else {
               // Check if event targetting is being used
               if(target==='event') {
                  if(event&&event.target&&event.type!=='scroll'&&event.type!=='resize') {
                     target=cache.target=$(event.target);
                  }
                  else {
                     target=cache.target;
                  }
               }
               else { cache.target=$(target); }

               // Parse the target into a jQuery object and make sure there's an element present
               target=$(target).eq(0);
               if(target.length===0) { return self; }

               // Check if window or document is the target
               else if(target[0]===document||target[0]===window) {
                  targetWidth=PLUGINS.iOS?window.innerWidth:target.width();
                  targetHeight=PLUGINS.iOS?window.innerHeight:target.height();

                  if(target[0]===window) {
                     position={
                        top: !fixed||PLUGINS.iOS?(viewport||target).scrollTop():0,
                        left: !fixed||PLUGINS.iOS?(viewport||target).scrollLeft():0
                     };
                  }
               }

               // Use Imagemap/SVG plugins if needed
               else if(target.is('area')&&PLUGINS.imagemap) {
                  position=PLUGINS.imagemap(target, at, readjust.enabled?method:FALSE);
               }
               else if(target[0].namespaceURI==='http://www.w3.org/2000/svg'&&PLUGINS.svg) {
                  position=PLUGINS.svg(target, at);
               }

               else {
                  targetWidth=target.outerWidth();
                  targetHeight=target.outerHeight();

                  position=PLUGINS.offset(target, posOptions.container, fixed);
               }

               // Parse returned plugin values into proper variables
               if(position.offset) {
                  targetWidth=position.width;
                  targetHeight=position.height;
                  flipoffset=position.flipoffset;
                  position=position.offset;
               }
               else {
                  // Adjust position relative to target
                  position.left+=at.x==='right'?targetWidth:at.x==='center'?targetWidth/2:0;
                  position.top+=at.y==='bottom'?targetHeight:at.y==='center'?targetHeight/2:0;
               }
            }

            // Adjust position relative to tooltip
            position.left+=adjust.x+(my.x==='right'?-elemWidth:my.x==='center'?-elemWidth/2:0);
            position.top+=adjust.y+(my.y==='bottom'?-elemHeight:my.y==='center'?-elemHeight/2:0);

            // Calculate collision offset values if viewport positioning is enabled
            if(readjust.enabled) {
               // Cache our viewport details
               viewport={
                  elem: viewport,
                  height: viewport[(viewport[0]===window?'h':'outerH')+'eight'](),
                  width: viewport[(viewport[0]===window?'w':'outerW')+'idth'](),
                  scrollLeft: fixed?0:viewport.scrollLeft(),
                  scrollTop: fixed?0:viewport.scrollTop(),
                  offset: viewport.offset()||{ left: 0, top: 0 }
               };

               // Adjust position based onviewport and adjustment options
               position.adjusted={
                  left: readjust.horizontal!=='none'?readjust.left(position.left):0,
                  top: readjust.vertical!=='none'?readjust.top(position.top):0
               };

               // Set tooltip position class
               if(position.adjusted.left+position.adjusted.top) {
                  tooltip.attr('class', function(i, val) {
                     return val.replace(/ui-tooltip-pos-\w+/i, uitooltip+'-pos-'+my.abbreviation());
                  });
               }

               // Apply flip offsets supplied by positioning plugins
               if(flipoffset&&position.adjusted.left) { position.left+=flipoffset.left; }
               if(flipoffset&&position.adjusted.top) { position.top+=flipoffset.top; }
            }

            //Viewport adjustment is disabled, set values to zero
            else { position.adjusted={ left: 0, top: 0 }; }

            // Call API method
            callback.originalEvent=$.extend({}, event);
            tooltip.trigger(callback, [self, position, viewport.elem||viewport]);
            if(callback.isDefaultPrevented()) { return self; }
            delete position.adjusted;

            // If effect is disabled, target it mouse, no animation is defined or positioning gives NaN out, set CSS directly
            if(effect===FALSE||isNaN(position.left)||isNaN(position.top)||target==='mouse'||!$.isFunction(posOptions.effect)) {
               tooltip.css(position);
            }

            // Use custom function if provided
            else if($.isFunction(posOptions.effect)) {
               posOptions.effect.call(tooltip, self, $.extend({}, position));
               tooltip.queue(function(next) {
                  // Reset attributes to avoid cross-browser rendering bugs
                  $(this).css({ opacity: '', height: '' });
                  if($.browser.msie) { this.style.removeAttribute('filter'); }

                  next();
               });
            }

            // Set positioning flag
            isPositioning=0;

            return self;
         },

         // Max/min width simulator function for all browsers.. yeaaah!
         redraw: function() {
            if(self.rendered<1||isDrawing) { return self; }

            var container=options.position.container,
            perc, width, max, min;

            // Set drawing flag
            isDrawing=1;

            // If tooltip has a set height, just set it... like a boss!
            if(options.style.height) { tooltip.css('height', options.style.height); }

            // If tooltip has a set width, just set it... like a boss!
            if(options.style.width) { tooltip.css('width', options.style.width); }

            // Otherwise simualte max/min width...
            else {
               // Reset width and add fluid class
               tooltip.css('width', '').addClass(fluidClass);

               // Grab our tooltip width (add 1 so we don't get wrapping problems.. huzzah!)
               width=tooltip.width()+1;

               // Grab our max/min properties
               max=tooltip.css('max-width')||'';
               min=tooltip.css('min-width')||'';

               // Parse into proper pixel values
               perc=(max+min).indexOf('%')> -1?container.width()/100:0;
               max=((max.indexOf('%')> -1?perc:1)*parseInt(max, 10))||width;
               min=((min.indexOf('%')> -1?perc:1)*parseInt(min, 10))||0;

               // Determine new dimension size based on max/min/current values
               width=max+min?Math.min(Math.max(width, min), max):width;

               // Set the newly calculated width and remvoe fluid class
               tooltip.css('width', Math.round(width)).removeClass(fluidClass);
            }

            // Set drawing flag
            isDrawing=0;

            return self;
         },

         disable: function(state) {
            if('boolean'!==typeof state) {
               state=!(tooltip.hasClass(disabled)||cache.disabled);
            }

            if(self.rendered) {
               tooltip.toggleClass(disabled, state);
               $.attr(tooltip[0], 'aria-disabled', state);
            }
            else {
               cache.disabled=!!state;
            }

            return self;
         },

         enable: function() { return self.disable(FALSE); },

         destroy: function() {
            var t=target[0],
            title=$.attr(t, oldtitle);

            // Destroy tooltip and  any associated plugins if rendered
            if(self.rendered) {
               tooltip.remove();

               $.each(self.plugins, function() {
                  if(this.destroy) { this.destroy(); }
               });
            }

            // Clear timers and remove bound events
            clearTimeout(self.timers.show);
            clearTimeout(self.timers.hide);
            unassignEvents();

            // Remove api object
            $.removeData(t, 'qtip');

            // Reset old title attribute if removed
            if(options.suppress&&title) {
               $.attr(t, 'title', title);
               target.removeAttr(oldtitle);
            }

            // Remove ARIA attributes and bound qtip events
            target.removeAttr('aria-describedby').unbind('.qtip');

            // Remove ID from sued id object
            delete usedIDs[self.id];

            return target;
         }
      });
   }

   // Initialization method
   function init(id, opts) {
      var obj, posOptions, attr, config, title,

      // Setup element references
   elem=$(this),
   docBody=$(document.body),

      // Use document body instead of document element if needed
   newTarget=this===document?docBody:elem,

      // Grab metadata from element if plugin is present
   metadata=(elem.metadata)?elem.metadata(opts.metadata):NULL,

      // If metadata type if HTML5, grab 'name' from the object instead, or use the regular data object otherwise
   metadata5=opts.metadata.type==='html5'&&metadata?metadata[opts.metadata.name]:NULL,

      // Grab data from metadata.name (or data-qtipopts as fallback) using .data() method,
   html5=elem.data(opts.metadata.name||'qtipopts');

      // If we don't get an object returned attempt to parse it manualyl without parseJSON
      try { html5=typeof html5==='string'?(new Function("return "+html5))():html5; }
      catch(e) { log('Unable to parse HTML5 attribute data: '+html5); }

      // Merge in and sanitize metadata
      config=$.extend(TRUE, {}, QTIP.defaults, opts,
      typeof html5==='object'?sanitizeOptions(html5):NULL,
      sanitizeOptions(metadata5||metadata));

      // Re-grab our positioning options now we've merged our metadata and set id to passed value
      posOptions=config.position;
      config.id=id;

      // Setup missing content if none is detected
      if('boolean'===typeof config.content.text) {
         attr=elem.attr(config.content.attr);

         // Grab from supplied attribute if available
         if(config.content.attr!==FALSE&&attr) { config.content.text=attr; }

         // No valid content was found, abort render
         else {
            log('Unable to locate content for tooltip! Aborting render of tooltip on element: ', elem);
            return FALSE;
         }
      }

      // Setup target options
      if(posOptions.container===FALSE) { posOptions.container=docBody; }
      if(posOptions.target===FALSE) { posOptions.target=newTarget; }
      if(config.show.target===FALSE) { config.show.target=newTarget; }
      if(config.show.solo===TRUE) { config.show.solo=docBody; }
      if(config.hide.target===FALSE) { config.hide.target=newTarget; }
      if(config.position.viewport===TRUE) { config.position.viewport=posOptions.container; }

      // Convert position corner values into x and y strings
      posOptions.at=new PLUGINS.Corner(posOptions.at);
      posOptions.my=new PLUGINS.Corner(posOptions.my);

      // Destroy previous tooltip if overwrite is enabled, or skip element if not
      if($.data(this, 'qtip')) {
         if(config.overwrite) {
            elem.qtip('destroy');
         }
         else if(config.overwrite===FALSE) {
            return FALSE;
         }
      }

      // Remove title attribute and store it if present
      if(config.suppress&&(title=$.attr(this, 'title'))) {
         $(this).removeAttr('title').attr(oldtitle, title);
      }

      // Initialize the tooltip and add API reference
      obj=new QTip(elem, config, id, !!attr);
      $.data(this, 'qtip', obj);

      // Catch remove events on target element to destroy redundant tooltip
      elem.bind('remove.qtip', function() { obj.destroy(); });

      return obj;
   }

   // jQuery $.fn extension method
   QTIP=$.fn.qtip=function(options, notation, newValue) {
      var command=(''+options).toLowerCase(), // Parse command
      returned=NULL,
      args=command==='disable'?[TRUE]:$.makeArray(arguments).slice(1),
      event=args[args.length-1],
      opts=this[0]?$.data(this[0], 'qtip'):NULL;

      // Check for API request
      if((!arguments.length&&opts)||command==='api') {
         return opts;
      }

      // Execute API command if present
      else if('string'===typeof options) {
         this.each(function() {
            var api=$.data(this, 'qtip');
            if(!api) { return TRUE; }

            // Cache the event if possible
            if(event&&event.timeStamp) { api.cache.event=event; }

            // Check for specific API commands
            if((command==='option'||command==='options')&&notation) {
               if($.isPlainObject(notation)||newValue!==undefined) {
                  api.set(notation, newValue);
               }
               else {
                  returned=api.get(notation);
                  return FALSE;
               }
            }

            // Execute API command
            else if(api[command]) {
               api[command].apply(api[command], args);
            }
         });

         return returned!==NULL?returned:this;
      }

      // No API commands. validate provided options and setup qTips
      else if('object'===typeof options||!arguments.length) {
         opts=sanitizeOptions($.extend(TRUE, {}, options));

         // Bind the qTips
         return QTIP.bind.call(this, opts, event);
      }
   };

   // $.fn.qtip Bind method
   QTIP.bind=function(opts, event) {
      return this.each(function(i) {
         var options, targets, events, namespace, api, id;

         // Find next available ID, or use custom ID if provided
         id=$.isArray(opts.id)?opts.id[i]:opts.id;
         id=!id||id===FALSE||id.length<1||usedIDs[id]?QTIP.nextid++:(usedIDs[id]=id);

         // Setup events namespace
         namespace='.qtip-'+id+'-create';

         // Initialize the qTip and re-grab newly sanitized options
         api=init.call(this, id, opts);
         if(api===FALSE) { return TRUE; }
         options=api.options;

         // Initialize plugins
         $.each(PLUGINS, function() {
            if(this.initialize==='initialize') { this(api); }
         });

         // Determine hide and show targets
         targets={ show: options.show.target, hide: options.hide.target };
         events={
            show: $.trim(''+options.show.event).replace(/ /g, namespace+' ')+namespace,
            hide: $.trim(''+options.hide.event).replace(/ /g, namespace+' ')+namespace
         };

         /*
         * Make sure hoverIntent functions properly by using mouseleave as a hide event if
         * mouseenter/mouseout is used for show.event, even if it isn't in the users options.
         */
         if(/mouse(over|enter)/i.test(events.show)&&!/mouse(out|leave)/i.test(events.hide)) {
            events.hide+=' mouseleave'+namespace;
         }

         /*
         * Also make sure initial mouse targetting works correctly by caching mousemove coords
         * on show targets before the tooltip has rendered.
         */
         targets.show.bind('mousemove'+namespace, function(event) {
            MOUSE={ pageX: event.pageX, pageY: event.pageY, type: 'mousemove' };
         });

         // Define hoverIntent function
         function hoverIntent(event) {
            function render() {
               // Cache mouse coords,render and render the tooltip
               api.render(typeof event==='object'||options.show.ready);

               // Unbind show and hide events
               targets.show.add(targets.hide).unbind(namespace);
            }

            // Only continue if tooltip isn't disabled
            if(api.cache.disabled) { return FALSE; }

            // Cache the event data
            api.cache.event=$.extend({}, event);
            api.cache.target=event?$(event.target):[undefined];

            // Start the event sequence
            if(options.show.delay>0) {
               clearTimeout(api.timers.show);
               api.timers.show=setTimeout(render, options.show.delay);
               if(events.show!==events.hide) {
                  targets.hide.bind(events.hide, function() { clearTimeout(api.timers.show); });
               }
            }
            else { render(); }
         }

         // Bind show events to target
         targets.show.bind(events.show, hoverIntent);

         // Prerendering is enabled, create tooltip now
         if(options.show.ready||options.prerender) { hoverIntent(event); }
      });
   };

   // Setup base plugins
   PLUGINS=QTIP.plugins={
      // Corner object parser
      Corner: function(corner) {
         corner=(''+corner).replace(/([A-Z])/, ' $1').replace(/middle/gi, 'center').toLowerCase();
         this.x=(corner.match(/left|right/i)||corner.match(/center/)||['inherit'])[0].toLowerCase();
         this.y=(corner.match(/top|bottom|center/i)||['inherit'])[0].toLowerCase();

         this.precedance=(corner.charAt(0).search(/^(t|b)/)> -1)?'y':'x';
         this.string=function() { return this.precedance==='y'?this.y+this.x:this.x+this.y; };
         this.abbreviation=function() {
            var x=this.x.substr(0, 1), y=this.y.substr(0, 1);
            return x===y?x:(x==='c'||(x!=='c'&&y!=='c'))?y+x:x+y;
         };
      },

      // Custom (more correct for qTip!) offset calculator
      offset: function(elem, container, fixed) {
         var pos=elem.offset(),
         parent=container,
         deep=0,
         docBody=document.body,
         coffset;

         function scroll(e, i) {
            pos.left+=i*e.scrollLeft();
            pos.top+=i*e.scrollTop();
         }

         if(parent) {
            // Compensate for non-static containers offset
            do {
               if(parent.css('position')!=='static') {
                  coffset=parent[0]===docBody?
                  { left: parseInt(parent.css('left'), 10)||0, top: parseInt(parent.css('top'), 10)||0}:
                  parent.position();

                  pos.left-=coffset.left+(parseInt(parent.css('borderLeftWidth'), 10)||0)+(parseInt(parent.css('marginLeft'), 10)||0);
                  pos.top-=coffset.top+(parseInt(parent.css('borderTopWidth'), 10)||0);

                  deep++;
               }
               if(parent[0]===docBody) { break; }
            }
            while(parent=parent.offsetParent());

            // Compensate for containers scroll if it also has an offsetParent
            if(container[0]!==docBody&&deep>1) { scroll(container, 1); }

            // Adjust for position.fixed tooltips (and also iOS scroll bug in v3.2 - v4.0)
            if((PLUGINS.iOS<4.1&&PLUGINS.iOS>3.1)||(!PLUGINS.iOS&&fixed)) { scroll($(window), -1); }
         }

         return pos;
      },

      /*
      * iOS 3.2 - 4.0 scroll fix detection used in offset() function.
      */
      iOS: parseFloat(
      (''+(/CPU.*OS ([0-9_]{1,3})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0, ''])[1])
         .replace('undefined', '3_2').replace('_', '.')
   )||FALSE,

      /*
      * jQuery-specific $.fn overrides
      */
      fn: {
         /* Allow other plugins to successfully retrieve the title of an element with a qTip applied */
         attr: function(attr, val) {
            if(this.length) {
               var self=this[0],
               title='title',
               api=$.data(self, 'qtip');

               if(attr===title&&'object'===typeof api&&api.options.suppress) {
                  if(arguments.length<2) {
                     return $.attr(self, oldtitle);
                  }
                  else {
                     // If qTip is rendered and title was originally used as content, update it
                     if(api&&api.options.content.attr===title&&api.cache.attr) {
                        api.set('content.text', val);
                     }

                     // Use the regular attr method to set, then cache the result
                     return this.attr(oldtitle, val);
                  }
               }
            }

            return $.fn['attr'+replaceSuffix].apply(this, arguments);
         },

         /* Allow clone to correctly retrieve cached title attributes */
         clone: function(keepData) {
            var titles=$([]), title='title',

            // Clone our element using the real clone method
         elems=$.fn['clone'+replaceSuffix].apply(this, arguments);

            // Grab all elements with an oldtitle set, and change it to regular title attribute, if keepData is false
            if(!keepData) {
               elems.filter('['+oldtitle+']').attr('title', function() {
                  return $.attr(this, oldtitle);
               })
            .removeAttr(oldtitle);
            }

            return elems;
         },

         /*
         * Taken directly from jQuery 1.8.2 widget source code
         * Trigger 'remove' event on all elements on removal if jQuery UI isn't present
         */
         remove: $.ui?NULL:function(selector, keepData) {
            $(this).each(function() {
               if(!keepData) {
                  if(!selector||$.filter(selector, [this]).length) {
                     $('*', this).add(this).each(function() {
                        $(this).triggerHandler('remove');
                     });
                  }
               }
            });
         }
      }
   };

   // Apply the fn overrides above
   $.each(PLUGINS.fn, function(name, func) {
      if(!func) { return TRUE; }

      var old=$.fn[name+replaceSuffix]=$.fn[name];
      $.fn[name]=function() {
         return func.apply(this, arguments)||old.apply(this, arguments);
      };
   });

   // Set global qTip properties
   QTIP.version='nightly';
   QTIP.nextid=0;
   QTIP.inactiveEvents='click dblclick mousedown mouseup mousemove mouseleave mouseenter'.split(' ');
   QTIP.zindex=15000;

   // Define configuration defaults
   QTIP.defaults={
      prerender: FALSE,
      id: FALSE,
      overwrite: TRUE,
      suppress: TRUE,
      content: {
         text: TRUE,
         attr: 'title',
         title: {
            text: FALSE,
            button: FALSE
         }
      },
      position: {
         my: 'top left',
         at: 'bottom right',
         target: FALSE,
         container: FALSE,
         viewport: FALSE,
         adjust: {
            x: 0, y: 0,
            mouse: TRUE,
            resize: TRUE,
            method: 'flip flip'
         },
         effect: function(api, pos, viewport) {
            $(this).animate(pos, {
               duration: 200,
               queue: FALSE
            });
         }
      },
      show: {
         target: FALSE,
         event: 'mouseenter',
         effect: TRUE,
         delay: 90,
         solo: FALSE,
         ready: FALSE,
         autofocus: FALSE
      },
      hide: {
         target: FALSE,
         event: 'mouseleave',
         effect: TRUE,
         delay: 0,
         fixed: FALSE,
         inactive: FALSE,
         leave: 'window',
         distance: FALSE
      },
      style: {
         classes: '',
         widget: FALSE,
         width: FALSE,
         height: FALSE
      },
      events: {
         render: NULL,
         move: NULL,
         show: NULL,
         hide: NULL,
         toggle: NULL,
         visible: NULL,
         focus: NULL,
         blur: NULL
      }
   };

   function Ajax(api) {
      var self=this,
      tooltip=api.elements.tooltip,
      opts=api.options.content.ajax,
      namespace='.qtip-ajax',
      rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      first=TRUE;

      api.checks.ajax={
         '^content.ajax': function(obj, name, v) {
            // If content.ajax object was reset, set our local var
            if(name==='ajax') { opts=v; }

            if(name==='once') {
               self.init();
            }
            else if(opts&&opts.url) {
               self.load();
            }
            else {
               tooltip.unbind(namespace);
            }
         }
      };

      $.extend(self, {
         init: function() {
            // Make sure ajax options are enabled and bind event
            if(opts&&opts.url) {
               tooltip.unbind(namespace)[opts.once?'one':'bind']('tooltipshow'+namespace, self.load);
            }

            return self;
         },

         load: function(event, first) {
            // Make sure default event hasn't been prevented
            if(event&&event.isDefaultPrevented()) { return self; }

            var hasSelector=opts.url.indexOf(' '),
            url=opts.url,
            selector,
            hideFirst=opts.once&&!opts.loading&&first;

            // If loading option is disabled, hide the tooltip until content is retrieved (first time only)
            if(hideFirst) { tooltip.css('visibility', 'hidden'); }

            // Check if user delcared a content selector like in .load()
            if(hasSelector> -1) {
               selector=url.substr(hasSelector);
               url=url.substr(0, hasSelector);
            }

            // Define common after callback for both success/error handlers
            function after() {
               // Re-display tip if loading and first time, and reset first flag
               if(hideFirst) { tooltip.css('visibility', ''); first=FALSE; }

               // Call users complete if it was defined
               if($.isFunction(opts.complete)) { opts.complete.apply(this, arguments); }
            }

            // Define success handler
            function successHandler(content) {
               if(selector) {
                  // Create a dummy div to hold the results and grab the selector element
                  content=$('<div/>')
                  // inject the contents of the document in, removing the scripts
                  // to avoid any 'Permission Denied' errors in IE
                  .append(content.replace(rscript, ""))

                  // Locate the specified elements
                  .find(selector);
               }

               // Set the content
               api.set('content.text', content);
            }

            // Error handler
            function errorHandler(xh, status, error) { api.set('content.text', status+': '+error); }

            // Setup $.ajax option object and process the request
            $.ajax($.extend({ success: successHandler, error: errorHandler, context: api }, opts, { url: url, complete: after }));

            return self;
         }
      });

      self.init();
   }

   PLUGINS.ajax=function(api) {
      var self=api.plugins.ajax;

      return 'object'===typeof self?self:(api.plugins.ajax=new Ajax(api));
   };

   PLUGINS.ajax.initialize='render';

   // Setup plugin sanitization
   PLUGINS.ajax.sanitize=function(options) {
      var content=options.content, opts;
      if(content&&'ajax' in content) {
         opts=content.ajax;
         if(typeof opts!=='object') { opts=options.content.ajax={ url: opts }; }
         if('boolean'!==typeof opts.once&&opts.once) { opts.once=!!opts.once; }
      }
   };

   // Extend original api defaults
   $.extend(TRUE, QTIP.defaults, {
      content: {
         ajax: {
            loading: TRUE,
            once: TRUE
         }
      }
   });

   PLUGINS.imagemap=function(area, corner, flip) {
      if(!area.jquery) { area=$(area); }

      var shape=area.attr('shape').toLowerCase(),
      baseCoords=area.attr('coords').split(','),
      coords=[],
      image=$('img[usemap="#'+area.parent('map').attr('name')+'"]'),
      imageOffset=image.offset(),
      result={
         width: 0, height: 0,
         offset: { top: 1e10, right: 0, bottom: 0, left: 1e10 }
      },
      i=0, next=0, dimensions;

      // POLY area coordinate calculator
      //	Special thanks to Ed Cradock for helping out with this.
      //	Uses a binary search algorithm to find suitable coordinates.
      function polyCoordinates(result, coords, corner) {
         var i=0,
         compareX=1, compareY=1,
         realX=0, realY=0,
         newWidth=result.width,
         newHeight=result.height;

         // Use a binary search algorithm to locate most suitable coordinate (hopefully)
         while(newWidth>0&&newHeight>0&&compareX>0&&compareY>0) {
            newWidth=Math.floor(newWidth/2);
            newHeight=Math.floor(newHeight/2);

            if(corner.x==='left') { compareX=newWidth; }
            else if(corner.x==='right') { compareX=result.width-newWidth; }
            else { compareX+=Math.floor(newWidth/2); }

            if(corner.y==='top') { compareY=newHeight; }
            else if(corner.y==='bottom') { compareY=result.height-newHeight; }
            else { compareY+=Math.floor(newHeight/2); }

            i=coords.length; while(i--) {
               if(coords.length<2) { break; }

               realX=coords[i][0]-result.offset.left;
               realY=coords[i][1]-result.offset.top;

               if((corner.x==='left'&&realX>=compareX)||
            (corner.x==='right'&&realX<=compareX)||
            (corner.x==='center'&&(realX<compareX||realX>(result.width-compareX)))||
            (corner.y==='top'&&realY>=compareY)||
            (corner.y==='bottom'&&realY<=compareY)||
            (corner.y==='center'&&(realY<compareY||realY>(result.height-compareY)))) {
                  coords.splice(i, 1);
               }
            }
         }

         return { left: coords[0][0], top: coords[0][1] };
      }

      // Make sure we account for padding and borders on the image
      imageOffset.left+=Math.ceil((image.outerWidth()-image.width())/2);
      imageOffset.top+=Math.ceil((image.outerHeight()-image.height())/2);

      // Parse coordinates into proper array
      if(shape==='poly') {
         i=baseCoords.length; while(i--) {
            next=[parseInt(baseCoords[--i], 10), parseInt(baseCoords[i+1], 10)];

            if(next[0]>result.offset.right) { result.offset.right=next[0]; }
            if(next[0]<result.offset.left) { result.offset.left=next[0]; }
            if(next[1]>result.offset.bottom) { result.offset.bottom=next[1]; }
            if(next[1]<result.offset.top) { result.offset.top=next[1]; }

            coords.push(next);
         }
      }
      else {
         coords=$.map(baseCoords, function(coord) { return parseInt(coord, 10); });
      }

      // Calculate details
      switch(shape) {
         case 'rect':
            result={
               width: Math.abs(coords[2]-coords[0]),
               height: Math.abs(coords[3]-coords[1]),
               offset: { left: coords[0], top: coords[1] }
            };
            break;

         case 'circle':
            result={
               width: coords[2]+2,
               height: coords[2]+2,
               offset: { left: coords[0], top: coords[1] }
            };
            break;

         case 'poly':
            $.extend(result, {
               width: Math.abs(result.offset.right-result.offset.left),
               height: Math.abs(result.offset.bottom-result.offset.top)
            });

            if(corner.string()==='centercenter') {
               result.offset={
                  left: result.offset.left+(result.width/2),
                  top: result.offset.top+(result.height/2)
               };
            }
            else {
               result.offset=polyCoordinates(result, coords.slice(), corner);

               // If flip adjustment is enabled, also calculate the closest opposite point
               if(flip&&(flip[0]==='flip'||flip[1]==='flip')) {
                  result.flipoffset=polyCoordinates(result, coords.slice(), {
                     x: corner.x==='left'?'right':corner.x==='right'?'left':'center',
                     y: corner.y==='top'?'bottom':corner.y==='bottom'?'top':'center'
                  });

                  result.flipoffset.left-=result.offset.left;
                  result.flipoffset.top-=result.offset.top;
               }
            }

            result.width=result.height=0;
            break;
      }

      // Add image position to offset coordinates
      result.offset.left+=imageOffset.left;
      result.offset.top+=imageOffset.top;

      return result;
   };

   // Tip coordinates calculator
   function calculateTip(corner, width, height) {
      var width2=Math.ceil(width/2), height2=Math.ceil(height/2),

      // Define tip coordinates in terms of height and width values
   tips={
      bottomright: [[0, 0], [width, height], [width, 0]],
      bottomleft: [[0, 0], [width, 0], [0, height]],
      topright: [[0, height], [width, 0], [width, height]],
      topleft: [[0, 0], [0, height], [width, height]],
      topcenter: [[0, height], [width2, 0], [width, height]],
      bottomcenter: [[0, 0], [width, 0], [width2, height]],
      rightcenter: [[0, 0], [width, height2], [0, height]],
      leftcenter: [[width, 0], [width, height], [0, height2]]
   };

      // Set common side shapes
      tips.lefttop=tips.bottomright; tips.righttop=tips.bottomleft;
      tips.leftbottom=tips.topright; tips.rightbottom=tips.topleft;

      return tips[corner.string()];
   }

   function Tip(qTip, command) {
      var self=this,
      opts=qTip.options.style.tip,
      elems=qTip.elements,
      tooltip=elems.tooltip,
      cache={
         top: 0,
         left: 0,
         corner: ''
      },
      size={
         width: opts.width,
         height: opts.height
      },
      color={},
      border=opts.border||0,
      namespace='.qtip-tip',
      hasCanvas=!!($('<canvas />')[0]||{}).getContext;

      self.corner=NULL;
      self.mimic=NULL;
      self.border=border;
      self.offset=opts.offset;
      self.size=size;

      // Add new option checks for the plugin
      qTip.checks.tip={
         '^position.my|style.tip.(corner|mimic|border)$': function() {
            // Make sure a tip can be drawn
            if(!self.init()) {
               self.destroy();
            }

            // Reposition the tooltip
            qTip.reposition();
         },
         '^style.tip.(height|width)$': function() {
            // Re-set dimensions and redraw the tip
            size={
               width: opts.width,
               height: opts.height
            };
            self.create();
            self.update();

            // Reposition the tooltip
            qTip.reposition();
         },
         '^content.title.text|style.(classes|widget)$': function() {
            if(elems.tip) {
               self.update();
            }
         }
      };

      function reposition(event, api, pos, viewport) {
         if(!elems.tip) { return; }

         var newCorner=$.extend({}, self.corner),
         adjust=pos.adjusted,
         method=qTip.options.position.adjust.method.split(' '),
         horizontal=method[0],
         vertical=method[1]||method[0],
         shift={ left: FALSE, top: FALSE, x: 0, y: 0 },
         offset, css={}, props;

         // Make sure our tip position isn't fixed e.g. doesn't adjust with viewport
         if(self.corner.fixed!==TRUE) {
            // Horizontal - Shift or flip method
            if(horizontal==='shift'&&newCorner.precedance==='x'&&adjust.left&&newCorner.y!=='center') {
               newCorner.precedance=newCorner.precedance==='x'?'y':'x';
            }
            else if(horizontal==='flip'&&adjust.left) {
               newCorner.x=newCorner.x==='center'?(adjust.left>0?'left':'right'):(newCorner.x==='left'?'right':'left');
            }

            // Vertical - Shift or flip method
            if(vertical==='shift'&&newCorner.precedance==='y'&&adjust.top&&newCorner.x!=='center') {
               newCorner.precedance=newCorner.precedance==='y'?'x':'y';
            }
            else if(vertical==='flip'&&adjust.top) {
               newCorner.y=newCorner.y==='center'?(adjust.top>0?'top':'bottom'):(newCorner.y==='top'?'bottom':'top');
            }

            // Update and redraw the tip if needed (check cached details of last drawn tip)
            if(newCorner.string()!==cache.corner&&(cache.top!==adjust.top||cache.left!==adjust.left)) {
               self.update(newCorner, FALSE);
            }
         }

         // Setup tip offset properties
         offset=self.position(newCorner, adjust);
         if(offset.right!==undefined) { offset.left= -offset.right; }
         if(offset.bottom!==undefined) { offset.top= -offset.bottom; }
         offset.user=Math.max(0, opts.offset);

         // Viewport "shift" specific adjustments
         if(shift.left=(horizontal==='shift'&&!!adjust.left)) {
            if(newCorner.x==='center') {
               css['margin-left']=shift.x=offset['margin-left']-adjust.left;
            }
            else {
               props=offset.right!==undefined?
               [adjust.left, -offset.left]:[-adjust.left, offset.left];

               if((shift.x=Math.max(props[0], props[1]))>props[0]) {
                  pos.left-=adjust.left;
                  shift.left=FALSE;
               }

               css[offset.right!==undefined?'right':'left']=shift.x;
            }
         }
         if(shift.top=(vertical==='shift'&&!!adjust.top)) {
            if(newCorner.y==='center') {
               css['margin-top']=shift.y=offset['margin-top']-adjust.top;
            }
            else {
               props=offset.bottom!==undefined?
               [adjust.top, -offset.top]:[-adjust.top, offset.top];

               if((shift.y=Math.max(props[0], props[1]))>props[0]) {
                  pos.top-=adjust.top;
                  shift.top=FALSE;
               }

               css[offset.bottom!==undefined?'bottom':'top']=shift.y;
            }
         }

         /*
         * If the tip is adjusted in both dimensions, or in a
         * direction that would cause it to be anywhere but the
         * outer border, hide it!
         */
         elems.tip.css(css).toggle(
         !((shift.x&&shift.y)||(newCorner.x==='center'&&shift.y)||(newCorner.y==='center'&&shift.x))
      );

         // Adjust position to accomodate tip dimensions
         pos.left-=offset.left.charAt?offset.user:horizontal!=='shift'||shift.top||!shift.left&&!shift.top?offset.left:0;
         pos.top-=offset.top.charAt?offset.user:vertical!=='shift'||shift.left||!shift.left&&!shift.top?offset.top:0;

         // Cache details
         cache.left=adjust.left; cache.top=adjust.top;
         cache.corner=newCorner.string();
      }

      /* border width calculator */
      function borderWidth(corner, side, backup) {
         side=!side?corner[corner.precedance]:side;

         var isFluid=tooltip.hasClass(fluidClass),
         isTitleTop=elems.titlebar&&corner.y==='top',
         elem=isTitleTop?elems.titlebar:elems.content,
         css='border-'+side+'-width',
         val;

         // Grab the border-width value (add fluid class if needed)
         tooltip.addClass(fluidClass);
         val=parseInt(elem.css(css), 10);
         val=(backup?val||parseInt(tooltip.css(css), 10):val)||0;
         tooltip.toggleClass(fluidClass, isFluid);

         return val;
      }

      function borderRadius(corner) {
         var isTitleTop=elems.titlebar&&corner.y==='top',
         elem=isTitleTop?elems.titlebar:elems.content,
         moz=$.browser.mozilla,
         prefix=moz?'-moz-':$.browser.webkit?'-webkit-':'',
         side=corner.y+(moz?'':'-')+corner.x,
         css=prefix+(moz?'border-radius-'+side:'border-'+side+'-radius');

         return parseInt(elem.css(css), 10)||parseInt(tooltip.css(css), 10)||0;
      }

      function calculateSize(corner) {
         var y=corner.precedance==='y',
         width=size[y?'width':'height'],
         height=size[y?'height':'width'],
         isCenter=corner.string().indexOf('center')> -1,
         base=width*(isCenter?0.5:1),
         pow=Math.pow,
         round=Math.round,
         bigHyp, ratio, result,

      smallHyp=Math.sqrt(pow(base, 2)+pow(height, 2)),

      hyp=[
         (border/base)*smallHyp, (border/height)*smallHyp
      ];
         hyp[2]=Math.sqrt(pow(hyp[0], 2)-pow(border, 2));
         hyp[3]=Math.sqrt(pow(hyp[1], 2)-pow(border, 2));

         bigHyp=smallHyp+hyp[2]+hyp[3]+(isCenter?0:hyp[0]);
         ratio=bigHyp/smallHyp;

         result=[round(ratio*height), round(ratio*width)];
         return { height: result[y?0:1], width: result[y?1:0] };
      }

      $.extend(self, {
         init: function() {
            var enabled=self.detectCorner()&&(hasCanvas||$.browser.msie);

            // Determine tip corner and type
            if(enabled) {
               // Create a new tip and draw it
               self.create();
               self.update();

               // Bind update events
               tooltip.unbind(namespace).bind('tooltipmove'+namespace, reposition);
            }

            return enabled;
         },

         detectCorner: function() {
            var corner=opts.corner,
            posOptions=qTip.options.position,
            at=posOptions.at,
            my=posOptions.my.string?posOptions.my.string():posOptions.my;

            // Detect corner and mimic properties
            if(corner===FALSE||(my===FALSE&&at===FALSE)) {
               return FALSE;
            }
            else {
               if(corner===TRUE) {
                  self.corner=new PLUGINS.Corner(my);
               }
               else if(!corner.string) {
                  self.corner=new PLUGINS.Corner(corner);
                  self.corner.fixed=TRUE;
               }
            }

            return self.corner.string()!=='centercenter';
         },

         detectColours: function() {
            var i, fill, border,
            tip=elems.tip.css({ backgroundColor: '', border: '' }),
            corner=self.corner,
            precedance=corner[corner.precedance],

            borderSide='border-'+precedance+'-color',
            borderSideCamel='border'+precedance.charAt(0)+precedance.substr(1)+'Color',

            invalid=/rgba?\(0, 0, 0(, 0)?\)|transparent/i,
            backgroundColor='background-color',
            transparent='transparent',

            bodyBorder=$(document.body).css('color'),
            contentColour=qTip.elements.content.css('color'),

            useTitle=elems.titlebar&&(corner.y==='top'||(corner.y==='center'&&tip.position().top+(size.height/2)+opts.offset<elems.titlebar.outerHeight(1))),
            colorElem=useTitle?elems.titlebar:elems.content;

            // Apply the fluid class so we can see our CSS values properly
            tooltip.addClass(fluidClass);

            // Detect tip colours from CSS styles
            color.fill=fill=tip.css(backgroundColor);
            color.border=border=tip[0].style[borderSideCamel]||tip.css(borderSide)||tooltip.css(borderSide);

            // Make sure colours are valid
            if(!fill||invalid.test(fill)) {
               color.fill=colorElem.css(backgroundColor)||transparent;
               if(invalid.test(color.fill)) {
                  color.fill=tooltip.css(backgroundColor)||fill;
               }
            }
            if(!border||invalid.test(border)||border===bodyBorder) {
               color.border=colorElem.css(borderSide)||transparent;
               if(invalid.test(color.border)||color.border===contentColour) {
                  color.border=border;
               }
            }

            // Reset background and border colours
            $('*', tip).add(tip).css(backgroundColor, transparent).css('border', '');

            // Remove fluid class
            tooltip.removeClass(fluidClass);
         },

         create: function() {
            var width=size.width,
            height=size.height,
            vml;

            // Remove previous tip element if present
            if(elems.tip) { elems.tip.remove(); }

            // Create tip element and prepend to the tooltip
            elems.tip=$('<div />', { 'class': 'ui-tooltip-tip' }).css({ width: width, height: height }).prependTo(tooltip);

            // Create tip drawing element(s)
            if(hasCanvas) {
               // save() as soon as we create the canvas element so FF2 doesn't bork on our first restore()!
               $('<canvas />').appendTo(elems.tip)[0].getContext('2d').save();
            }
            else {
               vml='<vml:shape coordorigin="0,0" style="display:inline-block; position:absolute; behavior:url(#default#VML);"></vml:shape>';
               elems.tip.html(vml+vml);
            }
         },

         update: function(corner, position) {
            var tip=elems.tip,
            inner=tip.children(),
            width=size.width,
            height=size.height,
            regular='px solid ',
            transparent='px dashed transparent', // Dashed IE6 border-transparency hack. Awesome!
            mimic=opts.mimic,
            round=Math.round,
            precedance, context, coords, translate, newSize;

            // Re-determine tip if not already set
            if(!corner) { corner=self.corner; }

            // Use corner property if we detect an invalid mimic value
            if(mimic===FALSE) { mimic=corner; }

            // Otherwise inherit mimic properties from the corner object as necessary
            else {
               mimic=new PLUGINS.Corner(mimic);
               mimic.precedance=corner.precedance;

               if(mimic.x==='inherit') { mimic.x=corner.x; }
               else if(mimic.y==='inherit') { mimic.y=corner.y; }
               else if(mimic.x===mimic.y) {
                  mimic[corner.precedance]=corner[corner.precedance];
               }
            }
            precedance=mimic.precedance;

            // Update our colours
            self.detectColours();

            // Detect border width, taking into account colours
            if(color.border!=='transparent'&&color.border!=='#123456') {
               // Grab border width
               border=borderWidth(corner, NULL, TRUE);

               // If border width isn't zero, use border color as fill (1.0 style tips)
               if(opts.border===0&&border>0) { color.fill=color.border; }

               // Set border width (use detected border width if opts.border is true)
               self.border=border=opts.border!==TRUE?opts.border:border;
            }

            // Border colour was invalid, set border to zero
            else { self.border=border=0; }

            // Calculate coordinates
            coords=calculateTip(mimic, width, height);

            // Determine tip size
            self.size=newSize=calculateSize(corner);
            tip.css(newSize);

            // Calculate tip translation
            if(corner.precedance==='y') {
               translate=[
               round(mimic.x==='left'?border:mimic.x==='right'?newSize.width-width-border:(newSize.width-width)/2),
               round(mimic.y==='top'?newSize.height-height:0)
            ];
            }
            else {
               translate=[
               round(mimic.x==='left'?newSize.width-width:0),
               round(mimic.y==='top'?border:mimic.y==='bottom'?newSize.height-height-border:(newSize.height-height)/2)
            ];
            }

            // Canvas drawing implementation
            if(hasCanvas) {
               // Set the canvas size using calculated size
               inner.attr(newSize);

               // Grab canvas context and clear/save it
               context=inner[0].getContext('2d');
               context.restore(); context.save();
               context.clearRect(0, 0, 3000, 3000);

               // Translate origin
               context.translate(translate[0], translate[1]);

               // Draw the tip
               context.beginPath();
               context.moveTo(coords[0][0], coords[0][1]);
               context.lineTo(coords[1][0], coords[1][1]);
               context.lineTo(coords[2][0], coords[2][1]);
               context.closePath();
               context.fillStyle=color.fill;
               context.strokeStyle=color.border;
               context.lineWidth=border*2;
               context.lineJoin='miter';
               context.miterLimit=100;
               if(border) { context.stroke(); }
               context.fill();
            }

            // VML (IE Proprietary implementation)
            else {
               // Setup coordinates string
               coords='m'+coords[0][0]+','+coords[0][1]+' l'+coords[1][0]+
               ','+coords[1][1]+' '+coords[2][0]+','+coords[2][1]+' xe';

               // Setup VML-specific offset for pixel-perfection
               translate[2]=border&&/^(r|b)/i.test(corner.string())?
               parseFloat($.browser.version, 10)===8?2:1:0;

               // Set initial CSS
               inner.css({
                  antialias: ''+(mimic.string().indexOf('center')> -1),
                  left: translate[0]-(translate[2]*Number(precedance==='x')),
                  top: translate[1]-(translate[2]*Number(precedance==='y')),
                  width: width+border,
                  height: height+border
               })
            .each(function(i) {
               var $this=$(this);

               // Set shape specific attributes
               $this[$this.prop?'prop':'attr']({
                  coordsize: (width+border)+' '+(height+border),
                  path: coords,
                  fillcolor: color.fill,
                  filled: !!i,
                  stroked: !!!i
               })
               .css({ display: border||i?'block':'none' });

               // Check if border is enabled and add stroke element
               if(!i&&$this.html()==='') {
                  $this.html(
                     '<vml:stroke weight="'+(border*2)+'px" color="'+color.border+'" miterlimit="1000" joinstyle="miter" '+
                     ' style="behavior:url(#default#VML); display:inline-block;" />'
                  );
               }
            });
            }

            // Position if needed
            if(position!==FALSE) { self.position(corner); }
         },

         // Tip positioning method
         position: function(corner) {
            var tip=elems.tip,
            position={},
            userOffset=Math.max(0, opts.offset),
            precedance, dimensions, corners;

            // Return if tips are disabled or tip is not yet rendered
            if(opts.corner===FALSE||!tip) { return FALSE; }

            // Inherit corner if not provided
            corner=corner||self.corner;
            precedance=corner.precedance;

            // Determine which tip dimension to use for adjustment
            dimensions=calculateSize(corner);

            // Setup corners and offset array
            corners=[corner.x, corner.y];
            if(precedance==='x') { corners.reverse(); }

            // Calculate tip position
            $.each(corners, function(i, side) {
               var b, br;

               if(side==='center') {
                  b=precedance==='y'?'left':'top';
                  position[b]='50%';
                  position['margin-'+b]= -Math.round(dimensions[precedance==='y'?'width':'height']/2)+userOffset;
               }
               else {
                  b=borderWidth(corner, side, TRUE);
                  br=borderRadius(corner);

                  position[side]=i?
                  border?borderWidth(corner, side):0:
                  userOffset+(br>b?br:0);
               }
            });

            // Adjust for tip dimensions
            position[corner[precedance]]-=dimensions[precedance==='x'?'width':'height'];

            // Set and return new position
            tip.css({ top: '', bottom: '', left: '', right: '', margin: '' }).css(position);
            return position;
         },

         destroy: function() {
            // Remov tip and bound events
            if(elems.tip) { elems.tip.remove(); }
            tooltip.unbind(namespace);
         }
      });

      self.init();
   }

   PLUGINS.tip=function(api) {
      var self=api.plugins.tip;

      return 'object'===typeof self?self:(api.plugins.tip=new Tip(api));
   };

   // Initialize tip on render
   PLUGINS.tip.initialize='render';

   // Setup plugin sanitization options
   PLUGINS.tip.sanitize=function(options) {
      var style=options.style, opts;
      if(style&&'tip' in style) {
         opts=options.style.tip;
         if(typeof opts!=='object') { options.style.tip={ corner: opts }; }
         if(!(/string|boolean/i).test(typeof opts.corner)) { opts.corner=TRUE; }
         if(typeof opts.width!=='number') { delete opts.width; }
         if(typeof opts.height!=='number') { delete opts.height; }
         if(typeof opts.border!=='number'&&opts.border!==TRUE) { delete opts.border; }
         if(typeof opts.offset!=='number') { delete opts.offset; }
      }
   };

   // Extend original qTip defaults
   $.extend(TRUE, QTIP.defaults, {
      style: {
         tip: {
            corner: TRUE,
            mimic: FALSE,
            width: 6,
            height: 6,
            border: TRUE,
            offset: 0
         }
      }
   });

   PLUGINS.svg=function(svg, corner) {
      var doc=$(document),
      elem=svg[0],
      result={
         width: 0, height: 0,
         offset: { top: 1e10, left: 1e10 }
      },
      box, mtx, root, point, tPoint;

      if(elem.getBBox&&elem.parentNode) {
         box=elem.getBBox();
         mtx=elem.getScreenCTM();
         root=elem.farthestViewportElement||elem;

         // Return if no method is found
         if(!root.createSVGPoint) { return result; }

         // Create our point var
         point=root.createSVGPoint();

         // Adjust top and left
         point.x=box.x;
         point.y=box.y;
         tPoint=point.matrixTransform(mtx);
         result.offset.left=tPoint.x;
         result.offset.top=tPoint.y;

         // Adjust width and height
         point.x+=box.width;
         point.y+=box.height;
         tPoint=point.matrixTransform(mtx);
         result.width=tPoint.x-result.offset.left;
         result.height=tPoint.y-result.offset.top;

         // Adjust by scroll offset
         result.offset.left+=doc.scrollLeft();
         result.offset.top+=doc.scrollTop();
      }

      return result;
   };

   function Modal(api) {
      var self=this,
      options=api.options.show.modal,
      elems=api.elements,
      tooltip=elems.tooltip,
      overlaySelector='#qtip-overlay',
      globalNamespace='.qtipmodal',
      namespace=globalNamespace+api.id,
      attr='is-modal-qtip',
      docBody=$(document.body),
      overlay;

      // Setup option set checks
      api.checks.modal={
         '^show.modal.(on|blur)$': function() {
            // Initialise
            self.init();

            // Show the modal if not visible already and tooltip is visible
            elems.overlay.toggle(tooltip.is(':visible'));
         }
      };

      $.extend(self, {
         init: function() {
            // If modal is disabled... return
            if(!options.on) { return self; }

            // Create the overlay if needed
            overlay=self.create();

            // Add unique attribute so we can grab modal tooltips easily via a selector
            tooltip.attr(attr, TRUE)

         .css('z-index', PLUGINS.modal.zindex+$(selector+'['+attr+']').length)

            // Remove previous bound events in globalNamespace
         .unbind(globalNamespace).unbind(namespace)

            // Apply our show/hide/focus modal events
         .bind('tooltipshow'+globalNamespace+' tooltiphide'+globalNamespace, function(event, api, duration) {
            var oEvent=event.originalEvent;

            // Make sure mouseout doesn't trigger a hide when showing the modal and mousing onto backdrop
            if(oEvent&&event.type==='tooltiphide'&&/mouse(leave|enter)/.test(oEvent.type)&&$(oEvent.relatedTarget).closest(overlay[0]).length) {
               event.preventDefault();
            }
            else {
               self[event.type.replace('tooltip', '')](event, duration);
            }
         })

            // Adjust modal z-index on tooltip focus
         .bind('tooltipfocus'+globalNamespace, function(event) {
            // If focus was cancelled before it reearch us, don't do anything
            if(event.isDefaultPrevented()) { return; }

            var qtips=$(selector).filter('['+attr+']'),

            // Keep the modal's lower than other, regular qtips
            newIndex=PLUGINS.modal.zindex+qtips.length,
            curIndex=parseInt(tooltip[0].style.zIndex, 10);

            // Set overlay z-index
            overlay[0].style.zIndex=newIndex;

            // Reduce modal z-index's and keep them properly ordered
            qtips.each(function() {
               if(this.style.zIndex>curIndex) {
                  this.style.zIndex-=1;
               }
            });

            // Fire blur event for focused tooltip
            qtips.end().filter('.'+focusClass).qtip('blur', event.originalEvent);

            // Set the new z-index
            tooltip.addClass(focusClass)[0].style.zIndex=newIndex;

            // Prevent default handling
            event.preventDefault();
         })

            // Focus any other visible modals when this one hides
         .bind('tooltiphide'+globalNamespace, function(event) {
            $('['+attr+']').filter(':visible').not(tooltip).last().qtip('focus', event);
         });

            // Apply keyboard "Escape key" close handler
            if(options.escape) {
               $(window).unbind(namespace).bind('keydown'+namespace, function(event) {
                  if(event.keyCode===27&&tooltip.hasClass(focusClass)) {
                     api.hide(event);
                  }
               });
            }

            // Apply click handler for blur option
            if(options.blur) {
               elems.overlay.unbind(namespace).bind('click'+namespace, function(event) {
                  if(tooltip.hasClass(focusClass)) { api.hide(event); }
               });
            }

            return self;
         },

         create: function() {
            var elem=$(overlaySelector);

            // Return if overlay is already rendered
            if(elem.length) { elems.overlay=elem; return elem; }

            // Create document overlay
            overlay=elems.overlay=$('<div />', {
               id: overlaySelector.substr(1),
               html: '<div></div>',
               mousedown: function() { return FALSE; }
            })
         .insertBefore($(selector).first());

            // Update position on window resize or scroll
            $(window).unbind(globalNamespace).bind('resize'+globalNamespace, function() {
               overlay.css({
                  height: $(window).height(),
                  width: $(window).width()
               });
            })
         .triggerHandler('resize');

            return overlay;
         },

         toggle: function(event, state, duration) {
            // Make sure default event hasn't been prevented
            if(event&&event.isDefaultPrevented()) { return self; }

            var effect=options.effect,
            type=state?'show':'hide',
            visible=overlay.is(':visible'),
            modals=$('['+attr+']').filter(':visible').not(tooltip),
            zindex;

            // Create our overlay if it isn't present already
            if(!overlay) { overlay=self.create(); }

            // Prevent modal from conflicting with show.solo, and don't hide backdrop is other modals are visible
            if((overlay.is(':animated')&&visible===state)||(!state&&modals.length)) { return self; }

            // State specific...
            if(state) {
               // Set position
               overlay.css({ left: 0, top: 0 });

               // Toggle backdrop cursor style on show
               overlay.toggleClass('blurs', options.blur);

               // Make sure we can't focus anything outside the tooltip
               docBody.delegate('*', 'focusin'+namespace, function(event) {
                  if($(event.target).closest(selector)[0]!==tooltip[0]) {
                     $('a, :input, img', tooltip).add(tooltip).focus();
                  }
               });
            }
            else {
               // Undelegate focus handler
               docBody.undelegate('*', 'focusin'+namespace);
            }

            // Stop all animations
            overlay.stop(TRUE, FALSE);

            // Use custom function if provided
            if($.isFunction(effect)) {
               effect.call(overlay, state);
            }

            // If no effect type is supplied, use a simple toggle
            else if(effect===FALSE) {
               overlay[type]();
            }

            // Use basic fade function
            else {
               overlay.fadeTo(parseInt(duration, 10)||90, state?1:0, function() {
                  if(!state) { $(this).hide(); }
               });
            }

            // Reset position on hide
            if(!state) {
               overlay.queue(function(next) {
                  overlay.css({ left: '', top: '' });
                  next();
               });
            }

            return self;
         },

         show: function(event, duration) { return self.toggle(event, TRUE, duration); },
         hide: function(event, duration) { return self.toggle(event, FALSE, duration); },

         destroy: function() {
            var delBlanket=overlay;

            if(delBlanket) {
               // Check if any other modal tooltips are present
               delBlanket=$('['+attr+']').not(tooltip).length<1;

               // Remove overlay if needed
               if(delBlanket) {
                  elems.overlay.remove();
                  $(window).unbind(globalNamespace);
               }
               else {
                  elems.overlay.unbind(globalNamespace+api.id);
               }

               // Undelegate focus handler
               docBody.undelegate('*', 'focusin'+namespace);
            }

            // Remove bound events
            return tooltip.removeAttr(attr).unbind(globalNamespace);
         }
      });

      self.init();
   }

   PLUGINS.modal=function(api) {
      var self=api.plugins.modal;

      return 'object'===typeof self?self:(api.plugins.modal=new Modal(api));
   };

   // Plugin needs to be initialized on render
   PLUGINS.modal.initialize='render';

   // Setup sanitiztion rules
   PLUGINS.modal.sanitize=function(opts) {
      if(opts.show) {
         if(typeof opts.show.modal!=='object') { opts.show.modal={ on: !!opts.show.modal }; }
         else if(typeof opts.show.modal.on==='undefined') { opts.show.modal.on=TRUE; }
      }
   };

   // Base z-index for all modal tooltips (use qTip core z-index as a base)
   PLUGINS.modal.zindex=QTIP.zindex-=200;

   // Extend original api defaults
   $.extend(TRUE, QTIP.defaults, {
      show: {
         modal: {
            on: FALSE,
            effect: TRUE,
            blur: TRUE,
            escape: TRUE
         }
      }
   });

   /*
   * BGIFrame adaption (http://plugins.jquery.com/project/bgiframe)
   * Special thanks to Brandon Aaron
   */
   function BGIFrame(api) {
      var self=this,
      elems=api.elements,
      tooltip=elems.tooltip,
      namespace='.bgiframe-'+api.id;

      $.extend(self, {
         init: function() {
            // Create the BGIFrame element
            elems.bgiframe=$('<iframe class="ui-tooltip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';" '+
            ' style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); '+
               '-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>');

            // Append the new element to the tooltip
            elems.bgiframe.appendTo(tooltip);

            // Update BGIFrame on tooltip move
            tooltip.bind('tooltipmove'+namespace, self.adjust);
         },

         adjust: function() {
            var dimensions=api.get('dimensions'), // Determine current tooltip dimensions
            plugin=api.plugins.tip,
            tip=elems.tip,
            tipAdjust, offset;

            // Adjust border offset
            offset=parseInt(tooltip.css('border-left-width'), 10)||0;
            offset={ left: -offset, top: -offset };

            // Adjust for tips plugin
            if(plugin&&tip) {
               tipAdjust=(plugin.corner.precedance==='x')?['width', 'left']:['height', 'top'];
               offset[tipAdjust[1]]-=tip[tipAdjust[0]]();
            }

            // Update bgiframe
            elems.bgiframe.css(offset).css(dimensions);
         },

         destroy: function() {
            // Remove iframe
            elems.bgiframe.remove();

            // Remove bound events
            tooltip.unbind(namespace);
         }
      });

      self.init();
   }

   PLUGINS.bgiframe=function(api) {
      var browser=$.browser,
      self=api.plugins.bgiframe;

      // Proceed only if the browser is IE6 and offending elements are present
      if($('select, object').length<1||!(browser.msie&&browser.version.charAt(0)==='6')) {
         return FALSE;
      }

      return 'object'===typeof self?self:(api.plugins.bgiframe=new BGIFrame(api));
   };

   // Plugin needs to be initialized on render
   PLUGINS.bgiframe.initialize='render';
} (jQuery, window));

// Setup the buttons to call our new Alert/Prompt/Confirm methods
//      Alert('Custom alert() functions are cool.');
//      Prompt('How would you describe qTip2?', 'Awesome!', function(response) {
//         // do something with response
//      });
//      Confirm('Click Ok if you love qTip2', function(yes) {
//      // do something with yes
//      });
function dialogue(content, title) {
   /*
   * Since the dialogue isn't really a tooltip as such, we'll use a dummy
   * out-of-DOM element as our target instead of an actual element like document.body
   */
   $('<div />').qtip(
      {
         content: {
            text: content,
            title: title
         },
         position: {
            my: 'center', at: 'center', // Center it...
            target: $(window) // ... in the window
         },
         show: {
            ready: true, // Show it straight away
            modal: {
               on: true, // Make it modal (darken the rest of the page)...
               blur: false // ... but don't close the tooltip when clicked
            }
         },
         hide: false, // We'll hide it maunally so disable hide events
         style: 'ui-tooltip-light ui-tooltip-rounded ui-tooltip-dialogue', // Add a few styles
         events: {
            // Hide the tooltip when any buttons in the dialogue are clicked
            render: function(event, api) {
               $('button', api.elements.content).click(api.hide);
            },
            // Destroy the tooltip once it's hidden as we no longer need it!
            hide: function(event, api) { api.destroy(); }
         }
      });
}
function Alert(message, title) {
   // Content will consist of the message and an ok button
   var message=$('<p />', { text: message }),
         ok=$('<button />', { text: 'Gerai', 'class': 'full' });

   dialogue(message.add(ok), ((title)?title:""));
}
function Prompt(question, title, initial, callback) {
   // Content will consist of a question elem and input, with ok/cancel buttons
   var message=$('<p />', { text: question }),
         input=$('<input />', { val: initial }),
         ok=$('<button />', {
            text: 'Gerai',
            click: function() { callback(input.val()); }
         }),
         cancel=$('<button />', {
            text: 'Atšaukti',
            click: function() { callback(null); }
         });

   dialogue(message.add(input).add(ok).add(cancel), ((title)?title:""));
}
function Confirm(question, title, callback) {
   // Content will consist of the question and ok/cancel buttons
   var message=$('<p />', { text: question }),
         ok=$('<button />', {
            text: 'Gerai',
            click: function() { callback(true); }
         }),
         cancel=$('<button />', {
            text: 'Atšaukti',
            click: function() { callback(false); }
         });

   dialogue(message.add(ok).add(cancel), ((title)?title:""));
}
/**
* jQuery Cookie plugin
*
* Copyright (c) 2010 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/
jQuery.cookie=function(key, value, options) {

   // key and at least value given, set cookie...
   if(arguments.length>1&&String(value)!=="[object Object]") {
      options=jQuery.extend({}, options);

      if(value===null||value===undefined) {
         options.expires= -1;
      }

      if(typeof options.expires==='number') {
         var days=options.expires, t=options.expires=new Date();
         t.setDate(t.getDate()+days);
      }

      value=String(value);

      return (document.cookie=[
            encodeURIComponent(key), '=',
            options.raw?value:encodeURIComponent(value),
            options.expires?'; expires='+options.expires.toUTCString():'', // use expires attribute, max-age is not supported by IE
            options.path?'; path='+options.path:'',
            options.domain?'; domain='+options.domain:'',
            options.secure?'; secure':''
        ].join(''));
   }

   // key and possibly options given, get cookie...
   options=value||{};
   var result, decode=options.raw?function(s) { return s; } :decodeURIComponent;
   return (result=new RegExp('(?:^|; )'+encodeURIComponent(key)+'=([^;]*)').exec(document.cookie))?decode(result[1]):null;
};
