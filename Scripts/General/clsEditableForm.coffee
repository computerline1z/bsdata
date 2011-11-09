class @clsEditableForm
	##opt={objData:??, Action:Edit/Add/Delete, aRowData:[??], Title:??, DialogFormId(divDialogForm),RenderHTML:[opcija], CallBackAfter
	##GridButtons:{form:"Dialog"/"Head"/Container(doom el),Action:"Add"/function,icon}
	id=0; oData={}; Config={};Row={}; oData={}; Action={};
	opt={DialogFormId:"divDialogForm",fnAddNewForm:"Dialog",CallBackAfter:0,aRowData:0}
	constructor: (options) ->
		$("body").css("cursor","wait")
		opt.Title=0##Isimena ankstesni (nuresetinam)
		$.extend(opt,options)
		id=if opt.aRowData? then opt.aRowData[0] else 0 ##jei 0 reiskia naujas irasas
		oData=oDATA.Get(opt.objData)
		Action=opt.Action
		unless oData?
			alert("Neradau objekto #{opt.objData} clsEditableForm klaseje")
		Row = Cols:oData.Cols, Grid:oData.Grid, Data:opt.aRowData
		if id and not Row.Data? ##jei yra id ir nera Row.Data surasom duomenis is oData
			for rows in oData.Data
				if rows[0]==id 
					Row.Data = rows
					break
		if (!opt.Title)
			Config=oData.Config
			opt.Title=if Action=="Add" then Config.Msg.AddNew else Config.Msg.Edit
			if Config.Msg.AddToTitle and Action=="Edit"##Kuriant nauja neturim ka rodyti
				AddToTitle = for ix in Config.Msg.AddToTitle
					Row.Data[ix]
				opt.Title+=" - "+AddToTitle.join(' ')
		@fnLoadEditableForm()
			##tr=opt.fnAddNewForm.grid.find("tbody tr:first");colspan=tr.find('td').length
			##insertedRow=$("tr").attr("colspan",colspan).insertBefore(tr)
			##Cia viska sumetam, o ant fnSave ismetam ir pan
		$("body").css("cursor","default");

	fnLoadEditableForm: () ->
		if !opt.form or opt.form=="Dialog"
			dlgEditableOpt = 
				autoOpen: false, minWidth: '45em', minHeight: '40em', width: '60em', modal: true, title: opt.Title, draggable: true
				buttons:
					"Išsaugoti pakeitimus": () -> fnSaveChanges()
					"Ištrinti": () -> $(this).dialog("close")
					"Atšaukti": () -> $(this).dialog("close")
				close: () -> $(this).remove()
				dragStart: () -> $("div.validity-modal-msg").remove()
			_html=if (opt.RenderHTML) then opt.RenderHTML else @fnGenerateHTML(Row,id)
			$( "#dialog:ui-dialog" ).dialog("destroy")
			$("<div id='"+opt.DialogFormId+"'></div>").html(_html).dialog(dlgEditableOpt).dialog('open')
		else
			_html=if (opt.RenderHTML) then opt.RenderHTML else @fnGenerateHTML(Row,id)
			$(_html)
				.append('<button style="float:right;" title="Atšaukti">Atšaukti</button>').find('button:last').button().click( ->fnResetForm())
				.end().append('<button style="float:right;" title="Išsaugoti">Išsaugoti</button>').find('button:last').button().click( ->fnSaveChanges())
				.end().appendTo(opt.form)
				.append('<div style="clear:both;"></div>').prepend("<h3>"+opt.Title+"</h3>")
		oCONTROLS.UpdatableForm($("#divEditableForm"))	##I pusiau sugeneruota forma (Extend) sudedam likusius dalykus 
		form=$("#"+opt.DialogFormId).parent()
		form.find("button:contains('Išsaugoti')").attr("disabled","disabled").addClass("ui-state-disabled")
		form.find("input, textarea").bind('click keyup', -> 
			form.find("button:contains('Išsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled"))
		form.find("div.ExtendIt button").click -> 
			form.find("button:contains('Išsaugoti')").removeAttr("disabled").removeClass("ui-state-disabled")
		form.find("button:contains('Ištrinti')").css("display","none");
	fnResetForm=() ->
		opt.target.css("display","block") if opt.target
		opt.form.empty()
	fnSaveChanges=() ->
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
					##Prabegam iš eilės per visus  per visus Row.Cols[RowI].FName ir surašom ką keitėm arba įstatom default values (Add keisis visi, Edit tik dalis)
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
								if Row.Cols[RowI].Default=="Today"
									Row.Data[RowI]=fnGetTodayDateString()
								else if Row.Cols[RowI].Default=="UserName"
									Row.Data[RowI]=UserData.Name()
								else if Row.Cols[RowI].Default=="UserId"
									Row.Data[RowI]=UserData.Id()
								else	
									Row.Data[RowI]=Row.Cols[RowI].Default
							else if Row.Cols[RowI].UpdateField ##pvz Date
								f=Row.Cols[RowI].UpdateField
								Row.Data[RowI]=updData.DataToSave[f]
							else
								Row.Data[RowI]=""
						if Row.Data[RowI]==null
							Row.Data[RowI]=""
					##Prabegam per visus jau surašytus Row.Data ir jei ten stovi IdInMe, tada įrašom teksta is kitos lenteles (kad nepalikt tuscio lauko)
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
					if opt.CallBackAfter
						opt.CallBackAfter(Row.Data)
					if !opt.form or opt.form=="Dialog" 
						$("#"+opt.DialogFormId).dialog("close")
					else
						fnResetForm()
			Msg: "", BlockCtrl:$('#divEditableForm')
			)
		else if DataToSave==0##reiskia, kad niekas nepakeista
			$("#"+opt.DialogFormId).dialog("close")
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

class @clsEditInPlaceForm
	##{url:??,postPars:??, tblProp(kur yra Editable properciai),formTitle:??,EditableFormId:??(cia rasomi - id,Source,tblUpdate),Grid:{DoomId:??,Opt:??,Source:??}(nebutina)}
	##postPars:{ ClientID: e.data.ID, onlyData: false }
	opt={};DataToSave={Fields:[],Data:[],id:0,DataTable:""};oTablel=null##i ji kisim issaugotus duomenis
	constructor: (options) ->
		$("body").addClass("wait")
		opt=options
		$.post(opt.url,opt.postPars,(jsRes)->
			for Name, obj of jsRes when Name not in["Render","Script"]
				oDATA.Set(Name, jsRes[Name])
			if jsRes.Script
				$.getScript(jsRes.Script.File) if jsRes.Script.File
				oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT

			if jsRes.Render
				fnLoadForm(opt.formTitle,jsRes.Render,opt.tblProp,opt.EditableFormId,opt.Buttons)
				##opt.fnReturnRender(jsRes.Render)##grazinam saukianciam atsiusta html
			else
				alert("clsEditInPlaceForm nera Render objekto!")
			$("body").removeClass("wait")
		)

	fnLoadForm = (formTitle,htmlToRender,tblProp,EditableFormId,Buttons)->
		oTable=null
		Buttons=if Buttons? then Buttons else {}
		$.extend(Buttons, "Uždaryti": () ->
				opt.fnFieldsUpdatedCallBack(DataToSave) if opt.fnFieldsUpdatedCallBack and DataToSave.Data
				$(this).remove()
				)
		dlgFormOpt=autoOpen:false, position: ['center', 50]
		resize:'auto',
		##height:'auto',nifiga neveikia - uz keturiu eiluciu ikisu ranka
		minWidth:'45em',width:'65em'
		modal:true,title:formTitle,draggable:true##minHeight:'20em'
		buttons: Buttons
		close: () -> 
			opt.fnFieldsUpdatedCallBack(DataToSave) if opt.fnFieldsUpdatedCallBack and DataToSave.Data
			$(this).remove()
		dragStart: () -> $("div.validity-modal-msg").remove()
		$("<div id='divDialogForm' style='overflow:auto'></div>").html(htmlToRender).ModifyDoom({tblProp:tblProp,EditableFormId:EditableFormId},DataToSave,opt.fnUpdateSuccess).dialog(dlgFormOpt).dialog('open').css("height","auto")
		oTable=$('#'+opt.Grid.DoomId).clsGrid(opt.Grid.Opt, opt.Grid.Source) if opt.Grid
	
$.fn.ModifyDoom = (opt,DataToSave,fnUpdateSuccess) ->
	t=@.find("#"+opt.EditableFormId)##ieskom ne doome, o perduotam htmoriginalHTMLl
	frmOpt=eval("("+(t.attr("data-ctrl"))+")")## kadangi gali but stringas negalim naudot t.data('ctrl')//id,Source,tblUpdate
	DataToSave.id=frmOpt.id;DataToSave.DataTable=frmOpt.tblUpdate;
	t.find('div.EditInPlace, span.EditInPlace').each(()->
		##el=$(@); OldVal=el.html()
		##eOpt=eval("("+(el.attr("data-ctrl"))+")")
		##ix=objProp.Cols.FNameIndex(eOpt.Field)
		$(@).MyEditInPlace({id:frmOpt.id,tblUpdate:frmOpt.tblUpdate,tblProp:opt.tblProp},DataToSave,fnUpdateSuccess)
	)
	@##Grazinam objekto toliau procesint


$.fn.MyEditInPlace = (opt,DataToSave,fnUpdateSuccess) ->
	##opt - turi buti id, tblUpdate, Field(gali but ir data-ctrl)
	## Nebutini: fnUpdateSuccess(iskviecia po updato),DataToSave(issaugoja naujas vertes),Title
	##opt papildo eOpt, kuris ateina is:
		##data-ctrl,
		##objProp.Cols[ix], jei yra opt.objProp
	el=$(@); OldVal=el.html()
	eOpt=if (typeof el.data("ctrl")=="object") then el.data("ctrl") else eval("("+(el.attr("data-ctrl"))+")")
	if opt.tblProp ## jei yra objektas ikisam jo propercius
		objProp=oDATA.Get(opt.tblProp)
		ix=objProp.Cols.FNameIndex(eOpt.Field)
		eOpt=$.extend({},objProp.Cols[ix], eOpt)
		$.extend(eOpt,{Title:objProp.Grid.aoColumns[ix].sTitle})
	$.extend(eOpt, opt,{FName:eOpt.Field})
	fnFinishedEdit=(NewVal,NewText,UpdatePars)->
		el.html('<img src="/Content/images/ajax-loader.gif" alt='+NewVal+'>')
		$.post("/Update/editInPlace",{id:eOpt.id,tbl:eOpt.tblUpdate,update_value:NewVal,field:eOpt.Field,show_value:NewText}
		(resp,a,b)->
			if (resp.ErrorMsg)
				Alert(resp.ErrorMsg, "Klaida išsaugant duomenis")
				el.html(OldVal)
			else
				el.html(resp.ResponseMsg);OldVal=resp.ResponseMsg
				if DataToSave
					DataToSave.Data.push(resp.ResponseMsg)##Jei reiks updatinti lentele ir oDATA
					DataToSave.Fields.push(eOpt.Field)
				if fnUpdateSuccess then fnUpdateSuccess({ctrl:el,eOpt:eOpt,id:eOpt.id})
		)
	del=didOpenEditInPlace:($Node, aSettings) ->
		$Node.attr("width",$Node.width())
		w=if ($Node.width()<200) then 200 else $Node.width()
		$Node.find('textarea, input').width(w)
	if eOpt.List##List
		del.shouldOpenEditInPlace=($Node, aSettings, trigEvent) -> 
			return false if $Node.find("input").length>0
			eHTML=oCONTROLS.txt(
				"data_ctrl": JSON.stringify($.extend(eOpt.List, {FName:eOpt.FName,}))
				"classes": "ui-widget-content ui-corner-all", "text": $Node.html()
				"Value": $Node.html()
			)
			$Node.html(eHTML).find('input').ComboBox(fnValueChanged:(NewVal, NewText)->fnFinishedEdit(NewVal,NewText)).focus()
				.bind("blur",(e)->
					interval=setInterval( ()->
						atr=$("ul.ui-autocomplete").css("display")
						if (atr=="none" or atr==undefined)
							el.html(OldVal)
							clearInterval(interval)
					3000)
				)
			false
	else if eOpt.Plugin##setMask, datapicker
		del.shouldOpenEditInPlace=($Node, aSettings, trigEvent) -> 
			return false if $Node.find("input").length>0 
			$Node.html("<input type='text'></input>")
			input=$Node.find("input"); input.val(OldVal)
			for Name, Prop of eOpt.Plugin
				if (Name=="datepicker")
					$.extend(Prop, onClose: (dateText, inst) -> fnFinishedEdit(dateText,null))
					input.attr("readonly","readonly")[Name](Prop).focus()
				else if (Name=="mask")
					input[Name](Prop).focus().bind("blur", (e)->
						t=$(e.target);v=t.mask('value')
						if v and v!=OldVal then fnFinishedEdit(v,null)
						else $Node.empty().html(OldVal)
					)
			false
	editOpt=
		field_type: eOpt.field_type
		delegate:del
		callback:(idOfEditor, NewVal,OldVal,settingsPar,callbacks) -> 
			fnFinishedEdit(NewVal,null)
			'<img src="/Content/images/ajax-loader.gif" alt='+NewVal+'>'
	el.editInPlace(editOpt)
	if eOpt.Title
		el.qtip(position: {at: 'top center', my: 'bottom center'}, content: eOpt.Title)
	el