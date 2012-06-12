@My.Contracts_NewNo = ->
	form=$("#NewContractNo");
	oCONTROLS.UpdatableForm(form)
	No=$("#No");TypeID=$("#TypeID");Desc=$("#Description")
	IsEmpty = () ->
		return true if (TypeID.val()=="" or Desc.val()=="" or Desc.val()==Desc.data("ctrl").Tip or TypeID.val()==TypeID.data("ctrl").Tip) 
		return false

	form.find("input[title], label[title], textarea[title]").qtip(position:
		at: 'top center', my: 'bottom center'
	)

	fnSaveNewNo = (NewNo) ->
		No.val(NewNo) if NewNo
		DataToSave=oGLOBAL.ValidateForm(form)
		if DataToSave
			oGLOBAL.UpdateServer(Action: "Add", DataToSave: DataToSave
			,CallBack:
				Success:(resp, updData) ->
					NewId=if resp.ResponseMsg.ID then resp.ResponseMsg.ID else 0
					$("#side-bar ul li a").data("opt","refresh")##kad paskui uzklausinetu, o ne imtu is atminties
					##.filter("[data-action='Contracts_EditNew']").data("Par", NewId).data("No", (No.val()+"/"+ NewId)).trigger("click")##Ikisam No i menu ir paklikinam ji
					.filter("[data-action='Contracts_EditNew']").data("Par", {"NewId":NewId,"No":(No.val()+"/"+ NewId)}).trigger("click")##Ikisam No i menu ir paklikinam ji
			,Msg: 
				Success: 
					Add: "Naujas numeris išsaugotas.\n Dabar galite pridėti sutarties duomenis ir prisegti susijusias bylas."
				Error:
					Add: "Nepavyko sukurti naujo numerio. Bandykite dar kartą"
			,BlockCtrl:form
			)

	SaveDataHandler = ->
		optCompany = $("input[name='optCompany']:checked").val()
		Alert("Pasirinkite tipą ir įveskite sutarties aprašymą") if (IsEmpty())
		TID=TypeID.data("newval")
		Code=oDATA.Get("tblContractTypes").Data.findColsByID(TID, [1])
		year=parseInt(/(\d+)/.exec(No.val())[1],10);
		No.val(optCompany+"/"+Code+year)
		if TID==16 ##Numeris įvedamas ranka
			Prompt("Įveskite naujos sutarties nr.:", "Naujos sutarties Nr.", "", (NewNo) ->
				fnSaveNewNo(NewNo) if NewNo
			)
		else
			Confirm("Jums bus rezervuotas numeris '"+No.val()+"/?' sutarties sudarymui. Sutarties tipas - '" + oDATA.Get("tblContractTypes").Data.findColsByID(TID, [2])+"'.", "Spauskite 'Gerai' jei sutinkate, 'Atšaukti' jei ne", (taip)->
				fnSaveNewNo(null)	if taip 
			)

	EnableButon = (btn) -> 
		Empty=IsEmpty()
		if Empty
			btn.attr("disabled","disabled").addClass("ui-state-disabled") if not btn.hasClass("ui-state-disabled")
		else
			btn.removeAttr("disabled").removeClass("ui-state-disabled")
	btn=$("<div style='width:53.3em;position:relative;height:2.2em;'><button style='position:absolute;top:.5em;right:0;'>Įsiminti numerį</button></div>")
	.appendTo("#NewContractNo").find('button').click(SaveDataHandler).button(disabled: true, icons: {primary:'img16-edit'})
	TypeID.on('keypress blur',->EnableButon(btn))
	Desc.on('keypress blur',->EnableButon(btn))

	##formNewContract=$("#NewContract");oCONTROLS.UpdatableForm(formNewContract)
	##formNewClient=$("#NewClient");oCONTROLS.UpdatableForm(formNewClient)
	##formNewObject=$("#NewObject");oCONTROLS.UpdatableForm(formNewObject)
	##formAttachedFiles=$("#AttachedFiles");oCONTROLS.UpdatableForm(formAttachedFiles)
@My.Contracts_EditNew = ->
	ThisA = $("#side-bar ul li a").filter("[data-action='Contracts_EditNew']")
	Par = ThisA.data("Par")
	return if (!Par)
	DataToSaveClientID={id:$("#NewContract").data("ctrl").id,Fields:['ClientID'],DataTable:"tblContracts"}

	fnSaveChanges = (form) ->##Jei ta forma ir pakeistas ClientID updatinam
		DataToSave=oGLOBAL.ValidateForm(form)
		if DataToSave
			oGLOBAL.UpdateServer(Action: (if form.data("ctrl").NewRec then "Add" else "Edit"), DataToSave: DataToSave
			,CallBack:
				Success:(resp,updData) ->##$("#side-bar ul li a").data("opt","refresh")##Pasikeite duomenys, tai geriau viska refreshinam
					if ($(form).attr("id")=="NewClient" and resp.ResponseMsg.ID)
						DataToSaveClientID.Data=[resp.ResponseMsg.ID]
					oCONTROLS.UpdatableForm_toSaved(resp.ResponseMsg.ID,form,(if DataToSaveClientID.Data then DataToSaveClientID else null))
					##if $("div.ExtendItHead").map(function()
					##	{return ($(this).data("ctrl").NewRec===1)?1:null;}).length
					if $("input.UpdateField, input.UpdateField").map( -> if $(@).data("ctrl").Value then null else 1).length == 0 ##Jei nebeliko neuzbaigtu skyriu
						oGLOBAL.UpdateServer({ Action: "Edit", DataToSave: $.extend(DataToSaveClientID,{Fields:["StatusID"],Data:[3]}) })##Suvesti visi duomenys, pakeiciam statusa
					$("#side-bar ul li a").data("opt","refresh")
					fnDisable(form.find("button.Save"))
				Error:(resp,updData) ->
					alert(resp)
			,Msg: "", BlockCtrl:form
			) 
		else if DataToSaveClientID.Data
			oCONTROLS.UpdatableForm_toSaved(null,form,DataToSaveClientID)##issaugojam tik kito kliento ClientID
		DataToSaveClientID.Data=null

	fnDisable = (btn) -> btn.attr("disabled","disabled").addClass("ui-state-disabled")
	fnEnable = (btn) -> btn.removeAttr("disabled").removeClass("ui-state-disabled")

	fnAddHandler = (form) ->
		btn= $('<button class="Save" style="float:right;" title="Išsaugoti">Išsaugoti</button>').appendTo(form.find("fieldset.inputFieldset")).button().on("click", ->fnSaveChanges(form))
		fnDisable(btn)
		form.on("keyup", "input.UpdateField,textarea.UpdateField,input.time", ->fnEnable(btn))
		form.on("click", "div.ExtendIt button, input.date, input.time", ->fnEnable(btn))

	$("div.ExtendItHead").each( ->
		form=$(this)
		oCONTROLS.UpdatableForm(form)
		fnAddHandler(form)
	)
	@Contracts_EditNew.ItemChanged = (t,Item) ->##Item={id,value,label}
		NewId= if Item then Item.id else null
		if NewId
			##Užpildom laukus, ir irasom, kad tai ne naujas klientas - issaugant issaugosim tik ClientID sitam kontraktui
			main=$("#NewClient")
			ctrls=main.find("input.UpdateField, textarea.UpdateField")
			oDATA.SetValToControls("tblClients",NewId,ctrls)
			$.extend(main.data("ctrl"),"NewRec":0,"id":NewId)
			##main.data("ctrl").NewRec=0;main.data("ctrl").id=NewId
			DataToSaveClientID.Data=[NewId]
			btn = $('<button style="float:right;" title="Atšaukti kliento pasirinkimą">Atšaukti kliento pasirinkimą</button>').insertAfter("#NewClient fieldset.inputFieldset div:first label").button().on("click", ->
				oDATA.SetNewForm(main)
				DataToSaveClientID.Data
				btn.remove()
			)
		
		fnEnable($(t).closest("fieldset").find("button.Save"))

	fnIsPrivate=(Private)->
		$("#CompanyCode, #CompanyName").css("display",(if Private then "none" else "inline-block")).find("input").toggleClass("UpdateField", !Private)
		$("#PrivateName").css("display",(if Private then "inline-block" else "none")).find("input").toggleClass("UpdateField", Private)
	if $("#chkPrivate").length
		fnIsPrivate($("#chkPrivate").is(":checked"))

	$("#chkPrivate").button().on("click", ->
		t=$(@);t.parent().find("span.ui-button-text").text(if t.is(":checked") then "Privatus klientas" else "Klientas - įmonė")
		fnIsPrivate(t.is(":checked"))
		##if (t.is(":checked"))
		##	$("label[for=" + t.attr('id') + "]").text("Privatus klientas")
		##else
		##	$("label[for=" + t.attr('id') + "]").text("Klientas - įmonė")
	).parent().find("span.ui-button-text").qtip({content: "Norint pakeisti spragtelėti",position: {at: 'top center', my: 'bottom center'}})
	##Jeigu ka nors pakeite refreshinam duomenis 
	$("#ContractFiles").next().on("click",()->ThisA.data("opt","refresh"))##cia dar ir save idus reiks dadet
	$("#side-bar ul li a").data("opt","refresh") if ThisA.data("opt")=="refresh"
##############################################################################################################################################################

@My.Contracts_MyNotFinished = ->
	fnUploadsToButton = (e) ->
		oCONTROLS.UploadDialog(
			RecId: e.data.ID, UserId: UserData.Id(), tblUpdate: "tblContracts"
			,fnCallBack: (files) ->
				$(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", (if(files.length)then""else"red"))
				oDATA.UpdateCell("tblContracts_MyNotFinished", false, e.data.ID, 10, files.length); ##UpdateCell:(obj,tblToUpdate,id,field,NewVal)
		)

	fnShowContract=(e)->
		e.preventDefault()
		$("#side-bar ul li a").filter("[data-action='Contracts_EditNew']").data("Par", e.data).trigger("click")##Ikisam No i menu ir paklikinam ji
		##tr=$(e.target).closest('tr');

	fnRowCallback_Contracts_MyNotFinished = (nRow, aData, iDisplayIndex, iDisplayIndexFull) ->
		$('td:eq(0)', nRow).html("<a href='#'>"+aData[1]+"</a>").click({ NewId: aData[0], No:aData[1] }, fnShowContract);
		$('td:eq(9)', nRow).html("<button "+(if aData[10]==0 then "style='color:red'" else "")+">"+aData[10]+"</button>").find("button")
		.button(icons: { primary: "img16-attach"}).click({ ID: aData[0] }, fnUploadsToButton)
		.parent().prev()##islipam is buttono
		.MyEditInPlace(
			field_type: "textarea", default_text: "", id: aData[0], tblUpdate: "tblContracts", Field: "Status_Description", Title: "Pastaba apie sutarties bukle, spragtelkit noredami pakeisti.."
			,fnUpdateSuccess: (pars) -> ##$ctrl,eOpt[is opciju],id
				oDATA.UpdateCell("tblContracts_MyNotFinished", false, pars.id, "Status_Description", pars.ctrl.html())
		) ##UpdateCell:(obj,tblToUpdate,id,field,NewVal)
		nRow
			
	oTable=$('#tblGrid').clsGrid(
		"aaSortingFixed": [[11, 'asc']]           ##Del grupavimo
		"Header": [{ col: 5, span: 2, Name: "Sutarties galiojimas" }, { col: 7, span: 2, Name: "Atsakingi darbuot."}]
		"Groups": { ColToGroup: 11, GroupCaption: { Tbl: "tblContractTypes", ShowCols: [1, 2]} }
		##"fnEditRowOnClick": window.oSCRIPT.Editable
		"fnRowCallback": fnRowCallback_Contracts_MyNotFinished
		, "tblContracts_MyNotFinished"
	)
##############################################################################################################################################################
@My.Contracts_MyAll = ->
	fnUploadsToButton = (e) ->
		oCONTROLS.UploadDialog(
			RecId: e.data.ID, UserId: UserData.Id(), tblUpdate: "tblContracts"
			,fnCallBack: (files) ->
				$(e.target).parent().find("span.ui-button-text").html(files.length).parent().closest("button").css("color", (if(files.length)then""else"red"))
				oDATA.UpdateCell("tblContracts_Contracts_MyAll", false, e.data.ID, 10, files.length); ##UpdateCell:(obj,tblToUpdate,id,field,NewVal)
		)

	fnShowContract=(e)->
		e.preventDefault()
		$("#side-bar ul li a").filter("[data-action='Contracts_EditNew']").data("Par", e.data).trigger("click")##Ikisam No i menu ir paklikinam ji
		##tr=$(e.target).closest('tr');

	fnRowCallback_Contracts_MyNotFinished = (nRow, aData, iDisplayIndex, iDisplayIndexFull) ->
		$('td:eq(0)', nRow).html("<a href='#'>"+aData[1]+"</a>").click({ NewId: aData[0], No:aData[1] }, fnShowContract);
		$('td:eq(9)', nRow).html("<button "+(if aData[10]==0 then "style='color:red'" else "")+">"+aData[10]+"</button>").find("button")
		.button(icons: { primary: "img16-attach"}).click({ ID: aData[0] }, fnUploadsToButton)
		.parent().prev()##islipam is buttono
		.MyEditInPlace(
			field_type: "textarea", default_text: "", id: aData[0], tblUpdate: "tblContracts", Field: "Status_Description", Title: "Pastaba apie sutarties bukle, spragtelkit noredami pakeisti.."
			,fnUpdateSuccess: (pars) -> ##$ctrl,eOpt[is opciju],id
				oDATA.UpdateCell("tblContracts_Contracts_MyAll", false, pars.id, "Status_Description", pars.ctrl.html())
		) ##UpdateCell:(obj,tblToUpdate,id,field,NewVal)
		nRow
			
	oTable=$('#tblGrid').clsGrid(
		"aaSortingFixed": [[11, 'asc']]           ##Del grupavimo
		"Header": [{ col: 5, span: 2, Name: "Sutarties galiojimas" }, { col: 7, span: 2, Name: "Atsakingi darbuot."}]
		"Groups": { ColToGroup: 11, GroupCaption: { Tbl: "tblContractTypes", ShowCols: [1, 2]} }
		##"fnEditRowOnClick": window.oSCRIPT.Editable
		"fnRowCallback": fnRowCallback_Contracts_MyNotFinished
		, "tblContracts_Contracts_MyAll"
	)
