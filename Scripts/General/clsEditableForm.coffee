class @clsEditableForm
	##opt={objData:??, Action:Edit/Add/Delete, aRowData:[??], oTable:[optcija ], ClickedRow[opcija kai klikinta is grido], RenderHTML:[opcija], CallBackAfterSave}
	id=0; oData={}; Config={}; GenNameWhat=""; Row={}; oData={}; Action={}; RenderHTML=0; ClickedRow=0;oTable=if oTable then oTable else 0
	CallBackAfterSave=0
	constructor: (opt) ->
		$("body").css("cursor","wait");
		id=if opt.aRowData? then opt.aRowData[0] else 0 ##jei 0 reiskia naujas irasas
		oTable=if opt.oTable? then opt.oTable else 0
		oData=oDATA.Get(opt.objData)
		Action=opt.Action
		CallBackAfterSave=if(opt.CallBackAfterSave) then opt.CallBackAfterSave else 0
		unless oData?
			alert("Neradau objekto #{opt.objData} clsEditableForm klaseje")
		Config=oData.Config
		GenNameWhat=Config.Msg.GenNameWhat
		Row = Cols:oData.Cols, Grid:oData.Grid, Data:opt.aRowData
		ClickedRow=if(opt.ClickedRow) then opt.ClickedRow else 0
		if id and not Row.Data? ##jei yra id ir nera Row.Data surasom duomenis is oData
			for rows in oData.Data
				if rows[0]==id 
					Row.Data = rows
					break
		Title=if Action=="Add" then Config.Msg.AddNew else Config.Msg.Edit
		if Config.Msg.AddToTitle
			AddToTitle = for ix in Config.Msg.AddToTitle
				Row.Data[ix]
			Title+=" "+AddToTitle.join(' ')
		@fnLoadEditableForm(Title)
		$("body").css("cursor","default");

	fnLoadEditableForm: (Title) ->
		FormTitle=if id then Config.Msg.Edit else Config.Msg.AddNew
		dlgEditableOpt =	
			autoOpen: false, minWidth: '45em', minHeight: '40em', width: '60em', modal: true, title: Title, draggable: true
			buttons:
				"Iðsaugoti pakeitimus": () ->

							DataToSave=oGLOBAL.ValidateForm($('#divEditableForm'))
							if DataToSave
								oGLOBAL.UpdateServer(Action: Action, DataToSave: DataToSave,
								CallBack:
									Success:(resp,updData) -> ##{ "Action": p.Action, "DataToSave": p.DataToSave, "CallBack": p.CallBack, "Msg": p.Msg };
										RowLength=Row.Cols.length; RowI=0
										updLength=updData.DataToSave.Fields.length
										if Action=="Add"
											Row.Data=new Array(RowLength) ##inicializuojam nauja Arr jei "Add"
											Row.Data[0]=resp.ResponseMsg.ID;
										##Prabegam ið eilës per visus  per visus Row.Cols[RowI].FName ir suraðom kà keitëm arba ástatom default values (Add keisis visi, Edit tik dalis)
										while RowI<RowLength-1 
											updI=0;Found=0;RowI++##Pradedam ne nuo 0, nes ten ID ir jis neupdatinamas
											while updI<updLength
												if Row.Cols[RowI].FName==updData.DataToSave.Fields[updI]
													Row.Data[RowI]=updData.DataToSave.Data[updI]
													Found=1; break
												updI++
											## jei nera tokio lauko ir pridedam nauja irasa idedam defaultine arba tuscia reiksme ir iskertam null, nes meta errorus kisant i grida
											if (not Found and Action=="Add") 
												if Row.Cols[RowI].Default?
													Row.Data[RowI]=if Row.Cols[RowI].Default=="Today" then fnGetTodayDateString() else Row.Cols[RowI].Default
												else
													Row.Data[RowI]=""
											if Row.Data[RowI]==null
												Row.Data[RowI]=""
										##Prabegam per visus jau suraðytus Row.Data ir jei ten stovi IdInMe, tada áraðom teksta is kitos lenteles (kad nepalikt tuscio lauko)
										RowI=0
										while RowI<RowLength-1
											RowI++
											if Row.Cols[RowI].IdInMe
												ix=Row.Cols[RowI].IdInMe
												id=Row.Data[ix]
												obj=Row.Cols[ix].List.Source
												TextId=Row.Cols[ix].List.iText
												Row.Data[RowI]=oDATA.GetStringFromIndexes(id,obj,TextId)
										oDATA.UpdateRow(Row.Data,oData,Action)##Updatinam duomenis masyve
										if CallBackAfterSave
											CallBackAfterSave(Row.Data)
										$("#divDialogForm").dialog("close")
								Msg: "", BlockCtrl:$('#divEditableForm')
								)
							else if DataToSave==0##reiskia, kad niekas nepakeista
								$("#divDialogForm").dialog("close")
				"Iðtrinti": () -> 
							$(this).dialog("close")
				"Atðaukti": () -> 
							$(this).dialog("close")
			close: () ->
				$(this).remove()
			dragStart: () ->
				$("div.validity-modal-msg").remove()
		_html=if (RenderHTML) then RenderHTML else @fnGenerateHTML(Row,id)
		$( "#dialog:ui-dialog" ).dialog("destroy")
		$("<div id='divDialogForm'></div>").html(_html).dialog(dlgEditableOpt).dialog('open')
		oCONTROLS.UpdatableForm($("#divEditableForm"))	##I pusiau sugeneruota forma (Extend) sudedam likusius dalykus 
		form=$("#divDialogForm").parent()
		form.find("button:contains('Iðsaugoti')").attr("disabled","disabled").addClass("ui-state-disabled")
		form.find("input").bind('click keyup', -> 
			form.find("button:contains('Iðsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled"))
		form.find("div.ExtendIt button").click -> 
			form.find("button:contains('Iðsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled")
		form.find("button:contains('Iðtrinti')").css("display","none");

	fnGenerateHTML: (Row, id) ->
		Length=Row.Cols.length; i=0;html="";Head=""
		while i<Length
			Append=""
			if Row.Grid.aoColumns[i].sTitle? ## laukus generuojam tik su sTitle
				if Row.Data[i]? and Row.Data[i]
					t=(if Row.Cols[i].Type then Row.Cols[i].Type else "")
					val=if t in ["String","Email"]||t.substring(0,4)=="Date" then ('"'+ Row.Data[i].replace(/"/g,"\\u0027")+'"') else Row.Data[i]
					##Row.Data[i].replace('"',"\'")
				else
					val="\"\"" 
				Append+="\"Value\":#{val},"
				html+="<div class='ExtendIt' data-ctrl='{#{Append}\"Field\":\"#{Row.Cols[i].FName}\",\"classes\":\"UpdateField\",\"labelType\":\"Left\"}'></div>"
			i++;
		if id?
			Head='"NewRec":0,"id":'+id+','
		else
			Head='"NewRec":1,'
		Head+='"Source":"'+(if Config.Source then Config.Source else Config.tblUpdate)+'","tblUpdate":"'+Config.tblUpdate+'"'
		"<div id='divEditableForm' class='inputform' style='margin:0 2em;' data-ctrl='{#{Head}}'>#{html}</div>"

		##Pakeitimu oTable ir oData issaugojimo funkcijos
	
						
	