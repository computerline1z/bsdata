$ = jQuery
$.fn.clsGrid = (GridOpt,objData) ->
		self = $.fn.clsGrid
		JSON=oDATA.Get(objData)
		alert("Daugiau nei vienas objektas ant kurio dedamas gridas!") if $(@).length>1
		NewData=$.extend(JSON.Grid, {aaData: JSON.Data})
		$.extend(true, NewData, self.GridOpt, GridOpt)
		##$.extend(true, self.GridOpt, GridOpt, { aaData: JSON.Data }, JSON.Grid)
		oTable=$(@).dataTable(NewData)
		setTimeout( ()=>
			$(oTable).css("width","100%") ##Tam, kad islygint lentele(pasigaidina su jqueryUI dizainu)
			oTable.fnDraw();
		100)
		opt=objData:objData, Action:"", aRowData:0, ClickedRow:0

		if (GridOpt.fnEditRowOnClick)
			fnRowClickEvent = (event) ->
				##$(@).find('tbody tr').removeClass('row_selected')
				##log('RowClicked, aRowData:['+aRowData+']')
				opt.ClickedRow=this
				opt.aRowData=oTable.fnGetData(oTable.fnGetPosition(this))
				opt.Action="Edit"
				opt.CallBackAfterSave = (RowData) ->
					aPos=oTable.fnGetPosition(opt.ClickedRow)
					oTable.fnUpdate(RowData, aPos, 0)
					##oDATA.UpdateRow(RowData,oData)##Updatinami clsEditableForm
				eForm = new clsEditableForm(opt)
			$(@).find('tbody tr').bind('click', fnRowClickEvent)
			$('<button class="AddNew" title="Pridëti naujà">Pridëti naujà</button>').button({icons:{primary:"img16-add_new"}}).click(->
				opt.ClickedRow=0
				opt.aRowData=0
				opt.Action="Add"
				opt.CallBackAfterSave = (RowData) ->
					oTable.fnAddData(RowData);
				eForm = new clsEditableForm(opt)
			).appendTo('div.dataTables_wrapper>div:first')
			##.bind('click', ->alert("opa1"))
			##$(@).find('tbody tr').live('click', fnRowClickEvent); live neveikia po grido perpiesimo
		oTable ##grazinam oTable
		

	## JSON = {Data:"", Cols:"", Grid:""} standartinis objektas
	$.extend $.fn.clsGrid,
	GridOpt :
		oLanguage: ##GridOpt.sScrollY=Height
			"sLengthMenu": "Rodyti _MENU_ ár. psl."
			"sZeroRecords": "Nerasta áraðø.."
			"sInfo": "Viso: _TOTAL_" ##"sInfo": "Rodomi _START_-_END_ áraðai ið _TOTAL_ "
			"sInfoEmpty": "Rodoma: 0 - 0 ið 0 áraðø"
			"sInfoFiltered": "(Filtruota ið _MAX_ áraðø)"
			"sSearch": "Ieðkoti:"
		"sProcessing": "Laukite.."
		"bJQueryUI": true
		"bSortClasses": false
		"bPaginate": false
		"sScrollX": "100%"
		"bScrollCollapse": false     ##???????
		"clickEvtIsLive": 1 ##Listams 1, accidentui 0
		"colorAfterNewInsert": 1
