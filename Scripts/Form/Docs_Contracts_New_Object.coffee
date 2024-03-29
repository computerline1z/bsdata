@Contracts_New_Object = ->
	form=$("#NewContract")
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
						$('#introduction').html("Sutartis Nr.:"+NewId)
					##Kad atsisiustu naujas atrefresintas lenteles
					$("#side-bar ul li a").filter("[data-action='Contracts_Other'],[data-action='Contracts_Unsigned'],[data-action='Contracts_Expired']").data("opt","refresh");
			,Msg: 
				Success: 
					Add: "Nauja sutartis i�saugota.\n Dabar galite prisegti prie sutarties susijusias bylas.", Edit: "Pakeitimai sutartyje i�saugoti"
				Error:
					Add: "Nepavyko i�saugoti naujos sutarties", Edit: "Nepavyko i�saugoti pakeitim� sutartyje"
			,BlockCtrl:form
			)
	EnableButon = -> 
		form.find("button:contains('I�saugoti')").removeAttr("disabled").removeClass("ui-state-disabled")
	$("<div style='width:53.3em;position:relative;height:2.2em;'><button style='position:absolute;top:.5em;right:0;'>I�saugoti pakeitimus</button></div>")
	.appendTo("#NewContractRightCol").find('button').click(SaveDataHandler).button(disabled: true, icons: {primary:'img16-edit'})
	form.find("input,#NewContract textarea").keypress(EnableButon)
	form.find("input.ui-autocomplete-input").focus(EnableButon)

