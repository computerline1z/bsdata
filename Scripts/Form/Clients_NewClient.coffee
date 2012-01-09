@Clients_NewClient = ->
	form=$("#NewClient")
	oCONTROLS.UpdatableForm(form)

	form.find("input[title], label[title], textarea[title]").qtip(position:
		at: 'top center', my: 'bottom center'
	)
	SaveDataHandler = -> 
		DataToSave=oGLOBAL.ValidateForm(form)
		if DataToSave
			oGLOBAL.UpdateServer(Action: (if form.data("ctrl").NewRec then "Add" else "Edit"), DataToSave: DataToSave
			,CallBack:
				Success:(resp, updData) ->
					NewId=if resp.ResponseMsg.ID then resp.ResponseMsg.ID else 0
					oCONTROLS.UpdatableForm_toSaved(NewId,form)##Atnaujinam issaugota forma
					if(updData.Action=="Add") 
						$('#introduction').html("Klientas Nr.:"+NewId)
					##Kad atsisiustu naujas atrefresintas lenteles
					$("#side-bar ul li a").filter("[data-action='Clients_NewClient']").data("opt","refresh");
			,Msg: 
				Success: 
					Add: "Naujas klientas išsaugotas.\n Dabar galite prisegti susijusias bylas.", Edit: "Pakeitimai kliento duomenyse išsaugoti"
				Error:
					Add: "Nepavyko išsaugoti naujo kliento", Edit: "Nepavyko išsaugoti pakeitimų kliento duomenyse"
			,BlockCtrl:form
			)
	EnableButon = -> 
		form.find("button:contains('Išsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled")
	$("<div style='width:53.3em;position:relative;height:2.2em;'><button style='position:absolute;top:.5em;right:0;'>Išsaugoti pakeitimus</button></div>")
	.appendTo("#NewContractRightCol").find('button').click(SaveDataHandler).button(disabled: true, icons: {primary:'img16-edit'})
	form.find("input,#NewClient textarea").keypress(EnableButon)
	form.find("input.ui-autocomplete-input").focus(EnableButon)
