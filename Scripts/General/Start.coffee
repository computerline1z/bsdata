jsResData={}
Index=0 ##Cia jsResData indeksas jei tam paciam meniu reiks isimint ne viena langa langu
Controller=$('#header div.subHeader a.highlight').data('controller')
Action=""
##@MyProxy={In:{},Out:{},Active:false}

$ ->
	Start()
	$('#side-bar li>a').first().trigger('click');
Start = () ->
	$('#side-bar li>a').live 'click', (event) ->
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
CallServer=(url,Par,el=$('#main-copy')) -> ##ServerPath,Ar renderint i ta pati diva,Parametrai
	el.parent().block()
	$.ajax(url:url, type: 'POST', data:Par, dataType:'json', global:false, cache:false,
	error: (jqXHR, textStatus, errorThrown) ->	
		el.html("<center><h2>Ði dalis dar nebaigta(#{Action})</h2><img src='/Content/images/UnderConstruction.gif' alt=''/></center>")
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
	for Name, obj of jsRes when Name not in["Render","Script"]
		@oDATA.Set(Name, jsRes[Name])
	if  Action=="Contracts_New"
		NewContract()
	else if Action=="Contracts_Unsigned" or Action=="Contracts_Valid" or Action=="Contracts_Expired"
		@oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT
		Contracts_Grid()
	else if jsRes.Script
		$.getScript(jsRes.Script.File) if jsRes.Script.File
		@oSCRIPT=jsRes.Script.oSCRIPT if jsRes.Script.oSCRIPT

##-----------------------------------------------------------------------
Array::remove = (e) -> @[t..t] = [] if (t = @indexOf(e)) > -1
@oDATA=
	Obj: {}
	Set: (objData, oINST) ->
		if not @Obj[objData]
			@Obj[objData]=oINST
	Get: (objData) ->
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
	GetData:(obj) ->
		if typeof obj=="string"
			@Obj[obj].Data
		else
			obj.Data
	GetStringFromIndexes:(id,obj,Indexes) ->
		Row=@GetRow(id,obj)
		Row.MapArrToString(Indexes)
	UpdateCell:(obj,id,ColNo,NewVal) ->
		Row=@GetRow(id,obj)
		Row[ColNo]=NewVal