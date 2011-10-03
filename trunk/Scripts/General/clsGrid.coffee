$ = jQuery
$.fn.clsGrid = (GridOpt,objData) ->
		self = $.fn.clsGrid
		HeadOk=0; JSON=oDATA.Get(objData); Gopts=GridOpt
		alert("Daugiau nei vienas objektas ant kurio dedamas gridas!") if $(@).length>1
		NewData=$.extend(JSON.Grid, {aaData: JSON.Data})
		##------------------Headeriai su spanais----------------------------------------------
		if GridOpt.Header
			$.extend(NewData, fnHeaderCallback: (nHead, aasData, iStart, iEnd, aiDisplay) ->
				if HeadOk++==0
					ResetClone = () -> trClone.find("th span").removeClass("ui-icon-triangle-1-n ui-icon-triangle-1-s ui-icon-carat-2-n-s").addClass("ui-icon-carat-2-n-s")
					trHead=$(nHead).css("line-height", "0.9em")
					trCloneRem=0; trHeadRem=0; i=0; thNo=trHead.find("th").length
					trClone=trHead.clone(true, true)
					while i<thNo
						Coli=Gopts.Header.findRowByColValue(i, "col")
						if Coli!=""
							trHead.find("th:eq("+(i-trHeadRem)+")").attr("colspan", Gopts.Header[Coli].span).css("text-align", "center").html(Gopts.Header[Coli].Name).next().remove()##Jei colspan>2 reikia daugiau isremovint
							i+=Gopts.Header[Coli].span-1 ##Nes prisides i++
							trHeadRem++
						else
							trHead.find("th:eq("+(i-trHeadRem)+")").attr("rowspan", 2)
							trClone.find("th:eq("+(i-trCloneRem)+")").remove().end().find("th").click (e) ->
								t=$(e.target).find("span:first")
								if t.hasClass("ui-icon-carat-2-n-s") then addCls="ui-icon-triangle-1-n"
								else if t.hasClass("ui-icon-triangle-1-n") then addCls="ui-icon-triangle-1-s"
								else if t.hasClass("ui-icon-triangle-1-s") then addCls="ui-icon-triangle-1-n"
								ResetClone()
								t.addClass(addCls).removeClass("ui-icon-carat-2-n-s"); ##Pakeiciam klases bei nuimam nuresetinima
							trCloneRem++
						i++
					trHead.click(ResetClone).after(trClone);
			)
		##-------------------Grupavimas------------------------------------------------
		if GridOpt.Groups
			$.extend(NewData, fnDrawCallback: (oSettings) ->
				nTrs=$(oSettings.nTBody).find("tr")
				return if (nTrs.length<2)
				iColspan=nTrs[0].getElementsByTagName('td').length
				sLastGroup=""; No= -1; LastCell; i=0
				GetNameByID = (ID) ->
				   ID=parseInt(ID, 10);tbl=oDATA.Get(GridOpt.Groups.GroupCaption.Tbl);tbl.Data.findColsByID(ID, GridOpt.Groups.GroupCaption.ShowCols)
				while i<nTrs.length
					iDisplayIndex=oSettings._iDisplayStart+i; No++
					sGroup=oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[GridOpt.Groups.ColToGroup]
					if(sGroup!=sLastGroup)
						nGroup=document.createElement('tr');
						nCell=document.createElement('td');
						nCell.colSpan=iColspan;
						nCell.className="group";
						nCell.innerHTML=GetNameByID(sGroup);
						nGroup.appendChild(nCell);
						nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
						if(sLastGroup)
							LastCell.innerHTML+=" ("+(No)+"vnt.)";No=0;
						sLastGroup=sGroup; LastCell=nCell;
					i++
				LastCell.innerHTML+=" ("+(No+1)+"vnt.)"; ##Pridedamas suskaièiavimas paskutiniam

			)
		##--------------------------------------------------------------------------------
		$.extend(true, NewData, self.GridOpt, GridOpt)
		##$.extend(true, self.GridOpt, GridOpt, { aaData: JSON.Data }, JSON.Grid)
		oTable=$(@).dataTable(NewData)
		setTimeout( ()=>
			$(oTable).css("width","100%") ##Tam, kad islygint lentele(pasigaidina su jqueryUI dizainu)
			oTable.fnDraw()
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
