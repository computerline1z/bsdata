$ = jQuery
$.fn.PrepareForm = (data) ->
  ##console.log('test fired')
  ##console.log(data)
	self = $.fn.PrepareForm
	##opts = $.extend {}, self.default_options, options
	alert("Daugiau nei vienas objektas!") if $(@).length>1
	setupPlugin(matched) for matched in $(@).find("*[data-Plugin]")

	setupPlugin: (el) ->
		PluginObjects=el.data("Plugin")
		for plugin, opt of PluginObjects
			alert(plugin)
			alert(opt)
			##eval(el.plugin(opt))

	fnGetScript = (Script, Data) ->
		@MyProxy.In=Data if Data
		##$.getScript(Script.File)
		$.ajax(url:Script.File, type: 'GET', dataType:'text'
		success: (d, textStatus, jqXHR) ->
			##alert(d)
			eval(d)
		)
##$.extend $.fn.PrepareForm: (options) ->

  ##default_options:
  ##  color: 'red'
  ##  log: true