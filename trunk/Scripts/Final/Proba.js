$.fn.editInPlace.defaults={
   url: "", // string: POST URL to send edited content
   bg_over: "#ffc", // string: background color of hover of unactivated editor
   bg_out: "transparent", // string: background color on restore from hover
   hover_class: "",  // string: class added to root element during hover. Will override bg_over and bg_out
   show_buttons: false, // boolean: will show the buttons: cancel or save; will automatically cancel out the onBlur functionality
   save_button: '<button class="inplace_save">Save</button>', // string: image button tag to use as “Save” button
   cancel_button: '<button class="inplace_cancel">Cancel</button>', // string: image button tag to use as “Cancel” button
   params: "", // string: example: first_name=dave&last_name=hauenstein extra paramters sent via the post request to the server
   field_type: "text", // string: "text", "textarea", or "select";  The type of form field that will appear on instantiation
   default_text: "(Click here to add text)", // string: text to show up if the element that has this functionality is empty
   use_html: false, // boolean, set to true if the editor should use jQuery.fn.html() to extract the value to show from the dom node
   textarea_rows: 10, // integer: set rows attribute of textarea, if field_type is set to textarea. Use CSS if possible though
   textarea_cols: 25, // integer: set cols attribute of textarea, if field_type is set to textarea. Use CSS if possible though
   select_text: "Choose new value", // string: default text to show up in select box
   select_options: "", // string or array: Used if field_type is set to 'select'. Can be comma delimited list of options 'textandValue,text:value', Array of options ['textAndValue', 'text:value'] or array of arrays ['textAndValue', ['text', 'value']]. The last form is especially usefull if your labels or values contain colons)
   text_size: null, // integer: set cols attribute of text input, if field_type is set to text. Use CSS if possible though

   // Specifying callback_skip_dom_reset will disable all saving_* options
   saving_text: undefined, // string: text to be used when server is saving information. Example "Saving..."
   saving_image: "", // string: uses saving text specify an image location instead of text while server is saving
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
   error: null, // function: this function gets called if server responds with an error. Prototype: function(request)
   error_sink: function(idOfEditor, errorString) { alert(errorString); }, // function: gets id of the editor and the error. Make sure the editor has an id, or it will just be undefined. If set to null, no error will be reported. /* DEPRECATED in 2.1.0 */ Parameter idOfEditor, use $(this).attr('id') instead
   preinit: null, // function: this function gets called after a click on an editable element but before the editor opens. If you return false, the inline editor will not open. Prototype: function(currentDomNode). DEPRECATED in 2.2.0 use delegate shouldOpenEditInPlace call instead
   postclose: null, // function: this function gets called after the inline editor has closed and all values are updated. Prototype: function(currentDomNode). DEPRECATED in 2.2.0 use delegate didCloseEditInPlace call instead
   delegate: null // object: if it has methods with the name of the callbacks documented below in delegateExample these will be called. This means that you just need to impelment the callbacks you are interested in.
};