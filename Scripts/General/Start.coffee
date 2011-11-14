jsResData={}
Index=0 ##Cia jsResData indeksas jei tam paciam meniu reiks isimint ne viena langa langu
Controller=$('#header div.subHeader a.highlight').data('controller')
Action=""
##@MyProxy={In:{},Out:{},Active:false}

$ ->
	Start()
	$('#side-bar li>a').first().trigger('click');
Start = () ->
	$('#side-bar').on('click', 'li>a', (event) ->
		$('body').addClass("wait")
		$('#side-bar a.highlight').removeClass 'highlight'
		$(@).addClass 'highlight'
		window.oGLOBAL.Action=$(@).data('action')
		if $(@).data("opt")=="refresh"
			refresh=true; $(@).data('opt',"ok")
		else 
			refresh=false
		url="/#{Controller}/#{Action=$(@).data('action')}"##Priskiriam url ir Action
		if jsResData[Action] and not refresh ##Jei turim tai kisam, jei neturim paimam is servo
			fnSetNewData(jsResData[Action][Index])
		else
			CallServer(url,'')##durnam ie turi but butinai stringas
		$('body').removeClass("wait")
	)
CallServer=(url,Par,el=$('#main-copy')) -> ##ServerPath,Ar renderint i ta pati diva,Parametrai
	el.parent().block()
	$.ajax(url:url, type: 'POST', data:Par, dataType:'json',## global:false, cache:false,
	error: (jqXHR, textStatus, errorThrown) ->	
		el.html("<center><h2>Ši dalis dar nebaigta(#{Action})</h2><img src='/Content/images/UnderConstruction.gif' alt=''/></center>")
		el.parent().unblock()
	success: (jsRes, textStatus, jqXHR) ->
		fnSetNewData(jsRes, el)
		if jsResData[Action]
			jsResData[Action].push(jsRes)
		else
			jsResData[Action]=[jsRes]
		el.parent().unblock()
		false
	)
fnSetNewData = (jsRes,el=$('#main-copy')) ->
	##obj = for objData, objVal of jsRes.Render
	el.empty().html(jsRes.Render) if jsRes.Render
	##el.PrepareForm(jsRes)
	for Name, obj of jsRes when Name not in["Render","Script"] and not oDATA.Get[Name]
		@oDATA.Set(Name, jsRes[Name])
	if  Action=="Contracts_New_Other"
		Contracts_New_Other()
	else if  Action=="Contracts_New_Object"
		Contracts_New_Object()
	else if Action=="Contracts_Unsigned"
		@oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT
		ContractsUnsigned_Grid()
	else if Action=="Contracts_Other" or Action=="Contracts_Expired"
		@oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT
		ContractsOther_Grid()
	else if Action=="Contracts_Objects"
		@oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT
		ContractsObjects_Grid()
	else if  Action=="MyEvents"
		Title_MyEvents()
	else if Action=="ClientsList"
		Clients_ClientsList_Grid()
	else if jsRes.Script
		$.getScript(jsRes.Script.File) if jsRes.Script.File
		@oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT
##-----------------------------------------------------------------------
Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1
@oDATA=
	Obj: {}
	Set: (objData, oINST) ->
		##if not @Obj[objData]
		@Obj[objData]=oINST
	Get: (objData) ->
		##alert("nėra tokio objekto - "+objData) if !@Obj[objData]
		@Obj[objData]
	UpdateRow:(Row,obj,Action) ->
		if Action=="Edit"
			URow=@GetRow(Row[0],obj)
			URow=Row
		else if Action=="Add"
			@GetData(obj).push(Row)
		else if Action=="Delete"
			@GetData(obj).remove(Row)
	GetRow:(id,obj) ->
		Data=@GetData(obj);
		Length=Data.length-1; i=-1
		while i<Length
			i++
			if Data[i][0]==id
				return Data[i]
	GetData:(obj,Cols) ->
		if typeof obj=="string"
			if Cols then @Obj[obj].Cols else @Obj[obj].Data
		else
			if Cols then obj.Cols else obj.Data
			obj.Data
	GetStringFromIndexes:(id,obj,Indexes) ->
		Row=@GetRow(id,obj)
		Row.MapArrToString(Indexes)
	UpdateCell:(obj,tblToUpdate,id,field,NewVal) ->
		ColNo=if (typeof(field)=="number") then field else oDATA.Get(obj).Cols.FNameIndex(field)
		alert("Updatinimui reikalingas lauko pavadinimas") if (typeof(field)=="number" and tblToUpdate)
		Row=@GetRow(id,obj)
		Row[ColNo]=NewVal
		$.post("/Update/editInPlace", {id:id,tbl:tblToUpdate,update_value:NewVal,field:field}) if tblToUpdate
	## Updatina eilute pagal DataToSave (suranda id ir t.t.)
	##GetNewData:(DataToSave,oTable,obj,ClickedRow) ->##DataToSave:{Data:[],Fields:[],id:0,DataTable:"dsf"}
	##	Cols=@GetData(obj,true)
	##	##Row=@GetRow(DataToSave.id,obj)
	##	aPos=oTable.fnGetPosition(ClickedRow[0])
	##	Row=oTable.fnGetData(aPos)
	##	i=0;len=DataToSave.Fields.length
	##	while (i<len)
	##		RowI=Cols.FNameIndex(DataToSave.Fields[i])
	##		Row[RowI]=DataToSave.Data[i] if RowI	
	##		i++
	##	Row
