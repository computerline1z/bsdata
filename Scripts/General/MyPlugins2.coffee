$ = jQuery
$.fn.ButtonStatuses = (opts) ->
	self = $.fn.ButtonStatuses
	opts=$.extend({}, self.default_options, opts);
	btn=$(@).find("button").qtip({ content: opts.tip[opts.StatusID], position: { at: 'top center', my: 'bottom center'} }).button({ icons: opts.iconOpt[opts.StatusID] })
	btn.click(
		{btn:btn}, fnSetNewStatus = (e) ->
			if opts.StatusID>3
				Alert("Sutartis jau sutvarkyta", "Jeigu yra klausimų kreipkitės pas administracijį")
				return
			else
				Confirm(opts.question[opts.StatusID],"Spauskite 'Gerai' jei sutinkate, 'Atšaukti' jei ne",(taip) ->
					if taip
						opts.StatusID++
						##btn= if e.target.tagName.toUpperCase()=="SPAN" then $(e.target).parent() else $(e.target)
						e.data.btn.qtip({ content: opts.tip[opts.StatusID], position: { at: 'top center', my: 'bottom center'} }).button({ icons: opts.iconOpt[opts.StatusID] })
						oDATA.UpdateCell(opts.tblSource, opts.tblUpdate, opts.ID, opts.FieldName, opts.StatusID);##localTblToUpdate, ServerTblToUpdate, IDofRecord,localTblFieldName,NewValue
				)		
	) if opts.enableEvents	

$.extend $.fn.ButtonStatuses,
	default_options:
		iconOpt: [{},{ primary: "img16-tag_red" },{ primary: "img16-tag_yellow" },{ primary: "img16-tag_green" },{primary: "img16-tag_green", secondary: "img16-check" }]
		tip: ["","Nauja sutartis.<br /> Patvirtiniti sutartį?"
			"Patvirtinta sutartis.<br /> Įjungti paslaugas?"
			"Paslaugos įjungtos.<br /> Perkelti prie sutvarkytų?"
			"Suartis sutvarkyta. Jokių kitų veiksmų<br /> su šia sutartimi nereikia."
		]
		question: ["","Ar patvirtinate sutarties įsigaliojimį?","Ar įjungtos paslaugos pagal sutartį?","Ar gauti visi dokumentai ir sutartis sutvarkyta?"]
		enableEvents: false
		##taip pat reikia tblSource, tblUpdate, FieldName (jei updatinam)
class @clsUserData
	u=""
	constructor: () ->
		u=$("#header").data("user")
		##$("#header").data("user","")
		$("#header").attr("data-user","")
		alert("No user object") if typeof(u)!="object"
	Id: () -> u.Id
	Name: () -> u.Name
	Email: () -> u.Email
$ ->
	window.UserData = new clsUserData
	