$ = jQuery
$.fn.ButtonStatuses = (opts) ->
	self = $.fn.ButtonStatuses
	opts=$.extend({}, self.default_options, opts);
	btn=$(@).find("button").qtip({ content: opts.tip[opts.StatusID], position: { at: 'top center', my: 'bottom center'} }).button({ icons: opts.iconOpt[opts.StatusID] })
	btn.click(
		{btn:btn}, fnSetNewStatus = (e) ->
			if opts.StatusID>3
				Alert("Sutartis jau sutvarkyta", "Jeigu yra klausimø kreipkitës pas administracijà")
				return
			else
				Confirm(opts.question[opts.StatusID],"Spauskite 'Gerai' jei sutinkate, 'Atðaukti' jei ne",(taip) ->
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
		tip: ["","Nauja sutartis.<br /> Patvirtiniti sutartá?"
			"Patvirtinta sutartis.<br /> Ájungti paslaugas?"
			"Paslaugos ájungtos.<br /> Perkelti prie sutvarkytø?"
			"Suartis sutvarkyta. Jokiø kitø veiksmø<br /> su ðia sutartimi nereikia."
		]
		question: ["","Ar patvirtinate sutarties ásigaliojimà?","Ar ájungtos paslaugos pagal sutartá?","Ar gauti visi dokumentai ir sutartis sutvarkyta?"]
		enableEvents: false
		##taip pat reikia tblSource, tblUpdate, FieldName (jei updatinam)