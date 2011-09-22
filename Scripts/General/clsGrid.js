(function() {
  var $;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $ = jQuery;
  $.fn.clsGrid = function(GridOpt, objData) {
    var JSON, NewData, fnRowClickEvent, oTable, opt, self;
    self = $.fn.clsGrid;
    JSON = oDATA.Get(objData);
    if ($(this).length > 1) {
      alert("Daugiau nei vienas objektas ant kurio dedamas gridas!");
    }
    NewData = $.extend(JSON.Grid, {
      aaData: JSON.Data
    });
    $.extend(true, NewData, self.GridOpt, GridOpt);
    oTable = $(this).dataTable(NewData);
    setTimeout(__bind(function() {
      $(oTable).css("width", "100%");
      return oTable.fnDraw();
    }, this), 100);
    opt = {
      objData: objData,
      Action: "",
      aRowData: 0,
      ClickedRow: 0
    };
    if (GridOpt.fnEditRowOnClick) {
      fnRowClickEvent = function(event) {
        var eForm;
        opt.ClickedRow = this;
        opt.aRowData = oTable.fnGetData(oTable.fnGetPosition(this));
        opt.Action = "Edit";
        opt.CallBackAfterSave = function(RowData) {
          var aPos;
          aPos = oTable.fnGetPosition(opt.ClickedRow);
          return oTable.fnUpdate(RowData, aPos, 0);
        };
        return eForm = new clsEditableForm(opt);
      };
      $(this).find('tbody tr').bind('click', fnRowClickEvent);
      $('<button class="AddNew" title="Pridėti naują">Pridėti naują</button>').button({
        icons: {
          primary: "img16-add_new"
        }
      }).click(function() {
        var eForm;
        opt.ClickedRow = 0;
        opt.aRowData = 0;
        opt.Action = "Add";
        opt.CallBackAfterSave = function(RowData) {
          return oTable.fnAddData(RowData);
        };
        return eForm = new clsEditableForm(opt);
      }).appendTo('div.dataTables_wrapper>div:first');
    }
    return oTable;
  };
  $.extend($.fn.clsGrid, {
    GridOpt: {
      oLanguage: {
        "sLengthMenu": "Rodyti _MENU_ įr. psl.",
        "sZeroRecords": "Nerasta įrašų..",
        "sInfo": "Viso: _TOTAL_",
        "sInfoEmpty": "Rodoma: 0 - 0 iš 0 įrašų",
        "sInfoFiltered": "(Filtruota iš _MAX_ įrašų)",
        "sSearch": "Ieškoti:"
      },
      "sProcessing": "Laukite..",
      "bJQueryUI": true,
      "bSortClasses": false,
      "bPaginate": false,
      "sScrollX": "100%",
      "bScrollCollapse": false,
      "clickEvtIsLive": 1,
      "colorAfterNewInsert": 1
    }
  });
}).call(this);
