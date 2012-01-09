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
	SaveDataHandler = ->
		Alert("Pasirinkite tipą ir įveskite sutarties aprašymą") if (IsEmpty())
		TID=TypeID.data("newval")
		Code=oDATA.Get("tblContractTypes").Data.findColsByID(TID, [1])
		No.val(Code+No.val())
		Confirm("Jums bus rezervuotas numeris '"+No.val()+"/?' sutarties sudarymui. Sutarties tipas - '" + oDATA.Get("tblContractTypes").Data.findColsByID(TID, [2])+"'.", "Spauskite 'Gerai' jei sutinkate, 'Atšaukti' jei ne", (taip)->
			return if not taip 
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
	##id = Par.NewId No = Par.No
	fnSaveChanges = (form) ->
		DataToSave=oGLOBAL.ValidateForm(form)
		oGLOBAL.UpdateServer(Action: "Edit", DataToSave: DataToSave
		,CallBack:
			Success:(resp,updData) ->
				##$("#side-bar ul li a").data("opt","refresh")##Pasikeite duomenys, tai geriau viska refreshinam
				oGLOBAL.UpdatableForm_toSaved
			Error:(resp,updData) ->
				alert(resp)
		,Msg: "", BlockCtrl:form
		) if DataToSave
		fnDisable(form.find("button.Save"))

	fnDisable = (btn) -> btn.attr("disabled","disabled").addClass("ui-state-disabled")
	fnEnable = (btn) -> btn.removeAttr("disabled").removeClass("ui-state-disabled")

	fnAddHandler = (form) ->
		btn= $('<button class="Save" style="float:right;" title="Išsaugoti">Išsaugoti</button>').appendTo(form.find("fieldset.inputFieldset")).button().on("click", ->fnSaveChanges(form))
		fnDisable(btn)
		form.on("keyup", "input.UpdateField,textarea.UpdateField", ->fnEnable(btn))
		form.on("click", "div.ExtendIt button", ->fnEnable(btn))

	$("div.ExtendItHead").each( ->
		form=$(this)
		oCONTROLS.UpdatableForm(form)
		fnAddHandler(form)
	)

	##Jeigu ka nors pakeite refreshinam duomenis 
	$("#ContractFiles").next().on("click",()->ThisA.data("opt","refresh"))##cia dar ir save idus reiks dadet
	$("#side-bar ul li a").data("opt","refresh") if ThisA.data("opt")=="refresh"

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
		"aaSortingFixed": [[5, 'asc']]           ##Del grupavimo
		"Header": [{ col: 5, span: 2, Name: "Sutarties galiojimas" }, { col: 7, span: 2, Name: "Atsakingi darbuot."}]
		"Groups": { ColToGroup: 11, GroupCaption: { Tbl: "tblContractTypes", ShowCols: [1, 2]} }
		##"fnEditRowOnClick": window.oSCRIPT.Editable
		"fnRowCallback": fnRowCallback_Contracts_MyNotFinished
		, "tblContracts_MyNotFinished"
	)
