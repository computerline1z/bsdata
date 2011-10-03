$ = jQuery
$.fn.ButtonStatuses = (opts) ->
	self = $.fn.ButtonStatuses
	opts=$.extend({}, self.default_options, opts);
	btn=$(@).find("button").qtip({ content: opts.tip[opts.StatusID], position: { at: 'top center', my: 'bottom center'} }).button({ icons: opts.iconOpt[opts.StatusID] })
	btn.click(
		{btn:btn}, fnSetNewStatus = (e) ->
			if opts.StatusID>3
				Alert("Sutartis jau sutvarkyta", "Jeigu yra klausim� kreipkit�s pas administracij�")
				return
			else
				Confirm(opts.question[opts.StatusID],"Spauskite 'Gerai' jei sutinkate, 'At�aukti' jei ne",(taip) ->
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
		tip: ["","Nauja sutartis.<br /> Patvirtiniti sutart�?"
			"Patvirtinta sutartis.<br /> �jungti paslaugas?"
			"Paslaugos �jungtos.<br /> Perkelti prie sutvarkyt�?"
			"Suartis sutvarkyta. Joki� kit� veiksm�<br /> su �ia sutartimi nereikia."
		]
		question: ["","Ar patvirtinate sutarties �sigaliojim�?","Ar �jungtos paslaugos pagal sutart�?","Ar gauti visi dokumentai ir sutartis sutvarkyta?"]
		enableEvents: false
		##taip pat reikia tblSource, tblUpdate, FieldName (jei updatinam)