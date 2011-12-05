/// <reference path="../JSMain/jquery-1.4.4-vsdoc.js" />
/// <reference path="../JSGeneral/objData.js" />
/// <reference path="Main_Render_MainDiv.js" />
/// <reference path="../JSMain/json2.js" />
/// <reference path="Server.js" />

//-----------------------Table Filling Functions------------------------------------------------------------------------------------------------
var oCONTROLS={ lbl: function(text) { return "<label class='dialog-form-label'>"+text+"</label>"; },
   AddToProperty: function(Object, Property, Value) { Object[Property]=(Object[Property])?Object[Property]+' '+Value:Value; return Object; },

   //{id:??,data-ctrl:??,classes:??,title:??, notabstop:??, style:??}
   basic: function(p) {
      //disabled - dadedam klase ui-state-disabled
      //green - dadedam klase ui-state-green
      //if(p.type!='undefined') { if(p.type=='green') { oCONTROLS.AddToProperty(p, 'classes', 'ui-state-green'); }   }
      return ((p.attr)?p.attr+" ":"")+((p.id)?"id='"+p.id+"' ":"")+((p.style)?'style="'+p.style+'" ':'')+((p.notabstop)?"tabindex='-1' ":"")+((p.title)?"title='"+p.title+"' ":"")+((p.data_ctrl)?"data-ctrl='"+p.data_ctrl+"' ":"")+((p.classes)?"class='"+p.classes+"' ":"");

      //return ((p.attr)?p.attr:'')+((p.id)?'id="'+p.id+'" ':'')+((p.style)?"style='"+p.style+"' ":"")+((p.notabstop)?'tabindex="-1" ':'')+((p.title)?'title="'+p.title+'" ':'')+((p.data_ctrl)?'data-ctrl="'+p.data_ctrl+'" ':'')+((p.classes)?'class="'+p.classes+'" ':'');
   },
   //prideda lbl prie txt, txtarea, chk. p.label={txt:"labelio tekstas", classes:"lblclass", type:"Top/Left"}
   appendLabel: function(p, t) {
      if(!p.label) return t; if(!p.label.txt||p.label.type==="None") return t;
      if(typeof p.label==='undefined'||p.label==='None') { return t; } else { return (p.label.type==="Top")?"<label class='toplabel'><span>"+p.label.txt+"</span>"+t+"</label>":"<label class='leftlabel'><span>"+p.label.txt+":</span>"+t+"</label>"; }
   },
   //appendLabel: function(p, t) { if(typeof p.label==='undefined') { return t; } else { return (p.label.type==="Top")?"<label><div"+((p.label.classes)?" class='"+p.label.classes+"'":"")+">"+p.label.txt+"</div>"+t+"</label>":"<label"+((p.label.classes)?" class='"+p.label.classes+"'":"")+">"+p.label.txt+t+"</label>"; } },
   //kaip basic + p.text
   txt: function(p) { return this.appendLabel(p, "<input type='text' "+this.basic(p)+((p.Value)?'value="'+p.Value+'" ':'')+"/>"); },
   hidden: function(p) { return this.appendLabel(p, "<input type='hidden' "+this.basic(p)+((p.Value)?'value="'+p.Value+'" ':'')+"/>"); },
   a: function(p) { return "<a "+this.basic(p)+" href='javascript:void(0);return false;'>"+p.Value+"</a>"; },
   txtarea: function(p) { return this.appendLabel(p, "<textarea cols='100' rows='4' "+this.basic(p)+">"+((p.Value)?p.Value:"")+"</textarea>"); },
   chk: function(p) {
      if(typeof p.Value==="string") { p.Value=((p.Value.search(/false/i)> -1)?0:1); } return "<label "+((p.label.classes)?" class='"+p.label.classes+"'":"")+((p.attr)?p.attr+" ":"")+"><input type='checkbox' "+this.basic(p)+((p.Value)?"checked='checked'":"")+"/>"+((p.label.txt)?p.label.txt:"")+"</label>";
   },
   //{src:??,alt:??,onclickfn:??}
   img: function(p) { return "<img src='"+p.src+"' alt='"+p.alt+"' onclick='"+p.onclickfn+"'/>"; },
   //{name:??,style:??,onclickfn:??,colorClass:??-not implemented}
   ui_img: function(p) { return "<span class='ui-icon "+p.name+"' style='"+p.style+";margin-top:.5em;' onclick=\""+p.onclickfn+"\"/>"; },
   //{pWraper.width:??,pWraper.style:??,pWraper.classes:??(default ui-widget-content),ptxt:(kaip basic),pimg:(kaip img)}

   txt_imgINtxt: function(pWraper, ptxt, pui_img) {
      ptxt.classes=(ptxt.classes)?ptxt.classes+' InputInWraper':'InputInWraper'; //panaikinami inputo borderiai
      var w='width:'+(pWraper.width-20)+'px;'; ptxt.style=(ptxt.style)?ptxt.style+w:w;
      return "<div "+this.basic(pWraper)+"width:"+pWraper.width+"px;"+"'>"+this.txt(ptxt)+this.ui_img(pui_img)+"</div>";
      //return "<div style='"+(pWraper.style?pWraper.style:"")+"width:"+pWraper.width+"px;' class='ui-widget-content "+((pWraper.classes)?" "+pWraper.classes:"")+"'>"+this.txt(ptxt)+this.ui_img(pui_img)+"</div>";
   },

   btnOKimg: function(title) { return "<button tabindex='-1' title='"+title+"' class='ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-all ui-button-icon' role='button'><span class='ui-button-icon-primary ui-icon ui-icon-circle-check'></span><span class='ui-button-text'>&nbsp;</span></button></div>"; },
   lbltxt_inline_btnConfirm: function(id, lblTitle, txtData, txtValue, btnTitle) { return "<div id="+id+"><label class='dialog-form-r'>"+lblTitle+"</label><input type='text' data-ctrl=\""+txtData+"\" value='"+txtValue+"' class='validate-dialog ui-widget-content ui-corner-left'/><button tabindex='-1' title='"+btnTitle+"' class='ui-button ui-widget ui-state-default ui-button-icon-only ui-corner-right ui-button-icon' role='button'><span class='ui-button-icon-primary ui-icon ui-icon-circle-check'></span><span class='ui-button-text'>&nbsp;</span></button></div>"; },
   lbla_inline: function(id, lblTitle, aValue, data_ctrl) { return "<div id="+id+"><label class='dialog-form-label'>"+lblTitle+"</label><a data-ctrl=\""+data_ctrl+"\" href='javascript:void(0);'>"+aValue+"</a></div>"; },
   //{id:??,text:??,icon:??(zaliam dadedama klase 'green'),title:??,disabled:??, notabstop:??, floatRight:??}

   btnTextOnly: function(p) {
      oCONTROLS.AddToProperty(p, 'classes', 'ui-button ui-corner-all ui-button-text-icon-primary');
      return '<button '+oCONTROLS.basic(p)+'" role="button"><span class="ui-button-text">'+p.text+'</span></button>';
   },
   btnImgOnly: function(p) {
      oCONTROLS.AddToProperty(p, 'classes', 'ui-button ui-corner-all ui-icon-only');
      return '<button '+oCONTROLS.basic(p)+'" role="button"><span class="ui-button-icon-primary ui-icon '+p.icon+'"></span></button>';
   },
   btnTextImg: function(p) {
      oCONTROLS.AddToProperty(p, 'classes', 'ui-button ui-corner-all ui-button-text-icon-primary');
      return '<button '+oCONTROLS.basic(p)+'" role="button"><span class="ui-button-icon-primary ui-icon '+p.icon+'"></span><span class="ui-button-text">'+p.text+'</span></button>';
   },
   OptionList: function(p) {
      ///<summary>Gets option list HTML</summary>
      ///<param name="p">{Arr:'Array to get options from',ListBoxid:'id of listbox to set', ValI:'index in array to get value for listbox',TextI:'arry of indexes to show in listbox text',
      ///SelectedID:'id to be selected',ReplaceArr:'[{Ix:??,txtIx:??,obj:??}] - pakeicia idus tekstais(Ix-kuri i pakeisti, txtIx-kur obj sedi tekstas, obj-duomenu objektas)'}</param>
      var HTML="<select id='"+p.id+"' name= id='"+p.id+"'>";
      for(var i=0; i<p.Arr.length; i++) {
         var Text=[];
         for(var I=0; I<p.TextI.length; I++) { Text.push(p.Arr[i][p.TextI[I]]); }
         //-----------------id lauku pakeitimas-----------pradzia---------------------------------
         if(typeof (p.ReplaceArr)!='undefined') {
            for(var iobj=0; iobj<p.ReplaceArr.length; iobj++) {//begam per objektus
               var obj=p.ReplaceArr[iobj].obj.Data, Ix=p.ReplaceArr[iobj].Ix, txtIx=p.ReplaceArr[iobj].txtIx;
               for(var ix=0; ix<obj.length; ix++) { if(Text[Ix]===obj[ix][0]) { Text[Ix]=obj[ix][txtIx]; break; } } //begam per obj ir kai surandam i pakeiciam i tekstu
            }
         }
         //-----------------id lauku pakeitimas------------pabaiga---------------------------------
         Text=Text.join(", ");
         if(p.SelectedID) { HTML+="<option value=\""+p.Arr[i][p.ValI]+((+p.Arr[i][0]==p.SelectedID)?"\" selected=\"selected\"":"\"")+">"+Text+"</option>"; }
         else { HTML+="<option value=\""+p.Arr[i][p.ValI]+"\">"+Text+"</option>"; }
      } return HTML+"</select>";
   },
   //AppendFuncToForm: { ComboBox: function(frm) {
   //   $(frm).find('input.data-list').ComboBox();
   //}},
   UpdatableForm_toSaved: function(RecId, frm) {//Darasom, value kiekvienam
      if(RecId) {//Darasom, kad tai ne naujas rec ir id, bei ijungiam controlsus, kurie nesimate kol nebuvo sukurtas irasas
         $.extend(frm.data("ctrl"), { NewRec: 0, id: RecId });
         frm.find("span.Control, div.Control").each(function() {//renderinam swfUpload jei nera
            var e=$(this), eOpt=e.data('ctrl');
            if(eOpt.Control==="swfUpload"&&e.children().length===0) {
               $.extend(e.data("ctrl"), { RecId: RecId }); //Darasom id
               e[eOpt.Control](e.data("ctrl"));
            }
         });
      }
      frm.find('.UpdateField').each(function() {//Darasom Value
         var e=$(this), eOpt=e.data('ctrl'), val;
         if(e.attr("type")==="checkbox") { val=(e.attr("checked"))?1:0; }
         else if(e.is("textarea")) { val=e.html(); }
         else if(e.is("input")&&e.data("ctrl").Type==="List") { val=e.data("newval"); }
         else { val=e.val(); }
         $.extend(e.data("ctrl"), { Value: val });
      });
   },
   UpdatableForm: function(frm) {
      //frm data-ctrl:: labelType:Top/Left/undefined,
      var sTitle, frmOpt=$(frm).data('ctrl');
      var data=(frmOpt.Source==='NoData')?"NoData":oDATA.Get(frmOpt.Source);
      //if(typeof data==='undefined') { alert('Source undefined in UpdatableForm(objFunc:79)!'); }
      //log('<div>==========UpdatableForm========</div>');
      var elements=$(frm).find('div.ExtendIt, span.ExtendIt');
      //      for(var i=0; i<elements.length; i++) {
      //      }
      $(frm).find('div.ExtendIt, span.ExtendIt').each(function() {
         var e=$(this), eOpt=e.data('ctrl'), eHTML='', ix=-1, data_ctrl={};
         //log("-------------------------------");
         //log("Elementas:"+e[0].tagName+"; id:"+e.attr("id")+"; klase:"+e.attr("class")+"; e.data('ctrl'):"+typeof e.data("ctrl"));
         if(typeof eOpt.Control!=="undefined") { if(eOpt.Control==="swfUpload"&&typeof frmOpt.id==="undefined") { return true; } else { e[eOpt.Control](eOpt); return true; } } //swfUpload nerenderinam jei naujas dokumentas
         if(data!=="NoData") {
            var eCols=data.Cols;
            //Surandam lauko indeksa
            for(var i=0; i<eCols.length; i++) {
               if(eCols[i].FName===eOpt.Field) { ix=i; sTitle=data.Grid.aoColumns[i].sTitle; break; } 
            }
            if(ix===-1) { alert('Wrong Field indicated '+eOpt.Field+' in UpdatableForm(objFunc:84)!'); }
            //log("Surastas laukas:'"+eOpt.Field+"'");
         } else { sTitle=(eOpt.sTitle)?eOpt.sTitle:""; }
         //#region duomenu is data.Cols[ix] ir eOpt(elemento data('ctrl')) surasymas i data_ctrl arba i propercius
         var col=(data==="NoData")?{}:data.Cols[ix], input;
         col=$.extend(col, eOpt); //overridinu data.Cols<----e.data('ctrl')
         var Type=(col.List)?"List":col.Type;
         if(!Type) { alert("Nesusiparsino ctrl elemento objFunc.js-UpdatableForm"); return true; }
         var AddToClasses="ui-widget-content ui-corner-all UpdateField";
         if(Type==='Integer'||Type==='Decimal') { AddToClasses+=" number"; }
         else if(Type==="List") { col.Type="List"; }
         else if(Type) { if(Type.search("Date")!== -1) { AddToClasses+=" date"; } }    //classes+' text', textarea,
         col.classes=(col.classes)?col.classes+" "+AddToClasses:AddToClasses;
         col.Value=(col.Value)?col.Value:"";
         for(var prop in col) {
            if(prop==='List') { $.extend(data_ctrl, col[prop]); data_ctrl.Type="List"; } //Listo propercius dedu vienam lygyje su kitais
            else if(prop==='Value'||prop==='Validity'||prop==='AgrValidity'||prop==='Tip'||prop==='Field'||prop==='Type'||prop==='Ext'||prop==='UpdateField') { data_ctrl[prop]=col[prop]; }
         }
         data_ctrl=JSON.stringify(data_ctrl);
         //log("data_ctrl stringas:"+data_ctrl);
         if(Type==='Integer'||Type==='Decimal') { data_ctrl=data_ctrl.replace("match('integer')", "match(integer)").replace("match('number')", "match(number)"); }
         else if(Type.search("Date")!== -1) { data_ctrl=data_ctrl.replace("match('date')", "match(date)"); }
         $.extend(col, { data_ctrl: data_ctrl }, { label: { "txt": sTitle, "type": col.labelType} });
         //#endregion

         //var CtrlOpt={ "Value": Value, "data_ctrl": data_ctrl, "title": sTitle, "classes": classes, "id": id, "attr": attr, "label": { "txt": sTitle, "type": col.labelType} }
         if(Type==='List') {
            eHTML+=oCONTROLS.txt(col);
            input=$(eHTML).prependTo(e).parent().find('input').ComboBox();
         }
         else if(Type==='Boolean'||Type==='checkbox') { eHTML=oCONTROLS.chk(col); $(eHTML).prependTo(e); } //.find('input:checkbox');
         else if(Type==='String'||Type==='Email'||Type==="text"||Type==="textarea"||Type==="hidden") {
            var len=(typeof col.LenMax==='undefined')?0:col.LenMax;
            if(Type==="hidden") {
               eHTML+=oCONTROLS.hidden(col);
               input=$(eHTML).prependTo(e).parent().find('input:first');
            } else if(len<101&&Type!=="textarea") {
               eHTML+=oCONTROLS.txt(col);
               input=$(eHTML).prependTo(e).parent().find('input:first');
            } else {
               eHTML+=oCONTROLS.txtarea(col);
               input=$(eHTML).prependTo(e).parent().find('textarea:first');
            }
         }
         else if(Type==='Integer'||Type==='Decimal') {
            eHTML+=oCONTROLS.txt(col);
            input=$(eHTML).prependTo(e).parent().find('input').ValidateOnBlur({ Allow: Type });
         }
         else if(Type.search("Date")!== -1) {// Date DateNotMore DateNotLess DateNotMoreCtrl DateNotLessCtrl
            var isTime=0;
            if(!col.Value&&col.Default==="Today") { col.Value=fnGetTodayDateString(); }  //Jei col.Default.Today
            if(Type.search("Time")!== -1) { var TimeValue=(col.Value.length>=16)?col.Value.substring(11, 16):"00:00"; isTime=1; }
            col.Value=col.Value.substring(0, 11);

            eHTML+=oCONTROLS.txt(col);
            if(isTime) {
               eHTML+=oCONTROLS.txt({ "text": TimeValue, "style": "margin-left:20px;", "title": "Laikas", "classes": "time ui-widget-content ui-corner-all" });
            } // UpdateField nereikia, nes..
            input=$(eHTML).prependTo(e).parent().find('input:first');
            input.ValidateOnBlur({ Allow: 'date' });
         }
         if(col.Plugin) {
            $.each(col.Plugin, function(name, value) { input[name](value); });
         }
         if(typeof input!=='undefined') {
            input.val($.trim(input.val()));
            if(typeof col.Tip!=='undefined') { input.labelify({ labelledClass: " inputTip ", text: function(input) { return $(input).data('ctrl').Tip; } }); }       //, labelledClass: "inputTip"
         }
      });
      //log('<div>==========UpdatableForm========</div>');
   },
   //------------------Funkcijos ne tik generuojancios html i kontrola, bet ir upsidatinancios------------------------------------------------------------------------------
   Set_Updatable_HTML: {
      mega_select_list: function(d) {
         //d={ctrl:??,oDATA:??, opt:{text:??,val:??,FieldName:??,SelectText:??},fnAfterOptClick:?? }
         //oDATA.obj atiduodamas visas SD (kad turet ir Data ir Cols
         //istatomas listas, kuris i data("ctrl")._FieldName_ pagal pasirinkima istato val, be to kolapsinasi
         var HTML="<p tabindex='0' class='rowHeight' style='background-color:#d3d1ba;margin-top:0px;font-weight:bold;'>"+d.opt.SelectText+"<span style='margin-left:10px;cursor:pointer;color: #3366CC;text-decoration: underline;'></span><a id='aCancelSelectOpt' class='floatright' href='#'>Atšaukti</a><div class='clearfix'></div></p>";
         HTML+="<div class='megaselectlistoptions'>";
         var listHTML="";
         for(var i=0; i<d.oDATA.Data.length; i+=3) {
            listHTML+="<div class='megaselectlistcolumn'><ul>";
            listHTML+="<li 'tabindex=-1' data-val="+d.oDATA.Data[i][d.opt.val]+">"+d.oDATA.Data[i][d.opt.text]+"</li>";
            listHTML+="<li 'tabindex=-1' data-val="+d.oDATA.Data[i+1][d.opt.val]+">"+d.oDATA.Data[i+1][d.opt.text]+"</li>";
            listHTML+="<li 'tabindex=-1' data-val="+d.oDATA.Data[i+2][d.opt.val]+">"+d.oDATA.Data[i+2][d.opt.text]+"</li></ul></div>";
         }
         HTML+=listHTML+"<div style='clear: both;'></div></div></hr>"; //&nbsp;
         $(d.ctrl).append(HTML);
         var Opt=d.ctrl.find('div.megaselectlistoptions'); Opt.data("height", Opt.height());
         //d.ctrl.delegate('a.floatright', 'click', function() { d.fnCancel(); return false; });
         d.ctrl.find('a.floatright').bind('click', function() { d.fnCancel(); return false; });
         d.ctrl.find('li').bind('click', function() {
            $('#aCancelSelectOpt').remove();
            li=$(this); d.ctrl.find('span:eq(0)').html(li.html());
            d.ctrl.data("ctrl")[d.opt.FieldName]=li.data("val");
            d.ctrl.attr("data-ctrl", JSON.stringify(d.ctrl.data("ctrl"))); //ikisu i "data-ctrl" atrributa

            if(typeof d.fnAfterOptClick=="function") d.fnAfterOptClick($(this));
            //d.ctrl.find('div.megaselectlistoptions').animate({ height: "0px" });
            d.ctrl.find('div.megaselectlistoptions').height("0px");
            //alert("2 "+d.ctrl.find('div.megaselectlistoptions').height());
            //d.ctrl.find('div.megaselectlistoptions').animate({ height: "0" }); //$(d).animate({ height: "0px" });
         });
         d.ctrl.find('span').bind('click', function() {
            var Opt=d.ctrl.find('.megaselectlistoptions');
            if(Opt.height()==0) { Opt.animate({ height: Opt.data("height")+'px' }); }
            else { Opt.animate({ height: "0px" }); }
         });
      }, lbltxt_inline_btnConfirm: function(d) {
         //d={ctrl:??,lblTitle:??,txt:{Title:??,Value:??}, btnTitle:??,Data:{tblToUpdate:??,UpdateField:??,id:??,Validity:??},fnCallBack:??,fnPostInit:?? }

         //d={ctrl:??,lblTitle:??,txt:{Title:??,Value:??}, btnTitle:??,Data:{tblToUpdate:??,Validity:??},DataToSave:{Data:[??],Fields:[?],id:??},fnCallBack:??,fnPostInit:?? }
         //var primaryHTML=ctrl.html();
         d.ctrl.html(oCONTROLS.lbl(d.lblTitle)+oCONTROLS.txt(d.txt.Title, d.txt.Value, "{\"Validity\":\""+d.Data.Validity+"\"}")+oCONTROLS.btnOKimg(d.btnTitle));
         if(typeof d.fnPostInit!='undefined') d.fnPostInit();
         d.ctrl.find("button").bind('click', function(e) {
            e.preventDefault();
            if(oGLOBAL.ValidateCtrlsArr([d.ctrl.find("input")])) {
               //var DataToSave={ Data: [d.ctrl.find("input").val()], Fields: [d.Data.UpdateField] }; DataToSave["id"]=d.Data.id;
               d.DataToSave.Data[0]=d.ctrl.find("input").val();
               oGLOBAL.UpdateServer("Edit", d.DataToSave, d.Data.tblToUpdate, d.fnCallBack, "");
            }
            d.ctrl.block("Siunčiami duomenys.."); return false;
         });
      }, lbla_inline: function(d) {
         //d={ctrl:??,lblTitle:??,a:Value:??, Data:{tblToUpdate:??},DataToSave:{Data:[??],Fields:[?],id:??},fnCallBack:??}
         d.ctrl.html(oCONTROLS.lbla_inline("divID"+d.DataToSave.id, d.lblTitle, d.Value, ""));
         d.ctrl.find("a").bind('click', function(e) {
            e.preventDefault();
            //var DataToSave={ Data: [null], Fields: ["DataEnd"] }; DataToSave["id"]=RowData[0];
            oGLOBAL.UpdateServer("Edit", d.DataToSave, d.Data.tblToUpdate, d.fnCallBack, "");
            d.ctrl.block("Siunčiami duomenys.."); return false;
         });
      }
   }
};
var oGLOBAL={
   /// <field name="None" type="Number" integer="true" static="true"/>
   /// <field name="One" type="Number" integer="true" static="true"/>
   /// <field name="Two" type="Number" integer="true" static="true"/>
   /// <field name="fieldName" type="FieldType"</field>
   temp: {},
   map: {},
   someProperty: 'some value here',
   GetURL: function(NewI) { //jei -1 grazina ankstesni, kitu atveju ta kur nurodytas
      NewI=oGLOBAL.GetNo(NewI);
      var p=location.pathname.split("/"); LastI=p[length-1]; LastI=oGLOBAL.GetNo(LastI); ; p.pop(); p=p.join("/");
      if(NewI<0) { location.replace(p+"/"+(LastI-1)); }
      else { location.replace(p+"/"+NewI); }
   },
   GetNo: function(i) {
      if(!oVALIDATE.IsNumeric(i)) return 0;
      i=/\d+/.exec(i); return (i[0])?i[0]:0;
   }, GetPar: function() {
      var p=location.pathname.split("/"), i=p[p.length-1];
      if(!oVALIDATE.IsNumeric(i)) return 0;
      return oGLOBAL.GetNo(i);
   }, UpdateServer: function(p) {
      //Action, DataToSave:{}, callBack:{Success:??,Error:??}, Msg:{Title:??,Success:??,Error:??,BlockCtrl:??}
      //DataToSave: Add - {Data[],Fields[],DataTable,Ext}
      //Edit - {id,Data,Fields,DataTable,Ext}
      //Delete - {id,DataTable,Ext}
      if(p.BlockCtrl) { p.BlockCtrl.block({ message: "Siunčiami duomenys.." }); }
      //UpdateServer: function(Action, DataToSave, tblToUpdate, callBack, Ext) {
      //Wait.Show(); //Action-Delete,Add,Edit
      ////////////if(typeof p.DataToSave.Ext=='undefined') { DataToSave["Ext"]=(Ext)?Ext:''; } //Ext pagal nutylejima ateina is DataToSave.Ext

      var url="/Update/"+p.Action, updData=p; //{ "Action": p.Action, "DataToSave": p.DataToSave, "CallBack": p.CallBack, "Msg": p.Msg };
      //url=(p.url)?p.url:("/Update/"+p.Action); //Add/Edit.Delete
      //log('<p style="color:green"><div>CallServer. Action:'+p.Action+'</div><div>DataToServer:'+JSON.stringify(p.DataToSave)+'</div> url:'+url+'</p>');
      CallServer(JSON.stringify(p.DataToSave), this.fnServerUpdated, updData, url, "json");
      ////CallServer(JSON.stringify({ id: id, DataObject: _SD.Config.tblUpdate }), obj.fnResponse_DeleteUser, anSelected, '/'+_SD.Config.Controler+'/Delete', 'json');
   }, fnServerUpdated: function(resp, updData) {  //updData["Action"]
      if(updData.BlockCtrl) { updData.BlockCtrl.unblock(); }
      var t=(updData.Msg.Title)?updData.Msg.Title:"Duomenų keitimas.", Msg;
      DefMsg={ Error: { Add: "Nepavyko išsaugot naujų duomenų.", Edit: "Nepavyko pakeisti duomenų.", Delete: "Nepavyko ištrinti duomenų." },
         Success: { Add: "Duomenys sėkmingai pridėti.", Edit: "Duomenys sėkmingai pakeisti.", Delete: "Duomenys ištrinti." }
      };
      var MsgObj=$.extend({}, DefMsg, updData.Msg);
      if(resp.ErrorMsg) {
         Msg=MsgObj.Error[updData.Action];
         Msg+=" Klaida:\n"+resp.ErrorMsg;
         if(typeof updData.CallBack.Error==='function') { updData.CallBack.Error(resp); };
         DIALOG.Alert(Msg, t); return false;
      } else {
         Msg=MsgObj.Success[updData.Action];
         if(typeof updData.CallBack.Success==='function') { updData.CallBack.Success(resp, updData); }
         $.growlUI(t, Msg); return false;
      }
   }, ValidateCtrlsArr: function(CtrlsArr) {
      $.validity.start();
      for(var i=0; i<CtrlsArr.length; i++) {
         var Validity=CtrlsArr[i].data("ctrl").Validity; //.replace("match(date)", "match('date')").replace("match(integer)", "match('integer')").replace("match(number)", "match('number')");
         eval("CtrlsArr[i]."+Validity);
      }
      var r=$.validity.end();
      return r;
   },
   ValidateForm: function(frm, DataToSaveAppend) { //Formos lauku validacija (pagal data-ctrl duomenis)
      $("div.validity-modal-msg").remove(); //panaikinam validacijos msg jei buvo
      var c=frm.data("ctrl"), id=c.id, NewRec=parseInt(c.NewRec, 10), DataTable=(c.tblUpdate)?(c.tblUpdate):(oDATA.Get(c.Source).Config.tblUpdate); //Updatinimui imam is markupo, jei nera is objekto
      if(!id&!NewRec) { alert("Nėra nurodyta id formos data(ctrl)!"); }
      $.validity.setup({ outputMode: "modal" });
      $.validity.start();
      var DataToSave={ Data: [], Fields: [], DataTable: DataTable };
      //log("<div>====ValidaeForm, id:"+(id)?id:"-"+", NewRec:"+NewRec+"====</div>");
      $.each(frm.find(".UpdateField"), function(i, v) {
         log("---------------------------");
         var e=$(v); var elDesc=e[0].tagName+", id-"+e.attr("id"), Value, UpdateField=(e.data("ctrl").UpdateField)?e.data("ctrl").UpdateField:false;

         if(e.data("ctrl")===undefined) { alert("Nerasta data(ctrl),el: "+elDesc); return true; }
         log("OK,el: "+elDesc);

         var Type, FName=e.data("ctrl").Field, OldVal=(NewRec)?'':e.data("ctrl").Value, val='';
         if(e.attr("type")==="checkbox") {
            val=(e.attr("checked"))?1:0; // Type="CheckBox";
         } else {
            if(typeof e.data("ctrl").Type==='undefined') {
               log("<div style='color:red'>Nerastas elemento Tipas!</div>");
            } else {
               Type=e.data("ctrl").Type;
               var Validity=(e.data("ctrl").Validity)?e.data("ctrl").Validity:"";
               if(Type==="hidden") {
                  val=e.val();
               } else if(Type.substring(0, 4)=="Date") {
                  Validity=(Validity.replace(/match\(date\)/g, "match('date')"));
                  val=e.val(); eval("e."+Validity);
                  if(Type.search(/time/i)> -1) {
                     var TimeCtrl=e.parent().next()
                     TimeCtrl.match(/^\d{2}[:]\d{2}$/, "Laikas turi būt sekančio formato - valandos:minutės");
                     val=val+" "+TimeCtrl.val()+":00"; //Prie laiko pridedam valandas
                  }
               } else if(Type==="List") {
                  if(e.data("newval")) { val=e.data("newval"); } //log("ui, val:"+(val)?"":val);
                  else { e.val(""); e.require("Reikalinga parinkti reikšmę iš sarašo.."); }
               } else {
                  var cTip=(e.data("ctrl").Tip)?e.data("ctrl").Tip:"", IsTip=false;
                  if(cTip&&cTip===e.val()) { e.val(""); IsTip=true; } //Isvalom tipus jei yra (isskyrus datos)

                  if(Type==="Decimal"||Type==="Integer") { e.val(e.val().replace(/,/g, ".")); Validity=Validity.replace(/match\(number\)/g, "match('number')").replace(/match\(integer\)/g, "match('integer')"); }
                  val=e.val();
                  var CheckIt=(id)?(OldVal!=val?true:false):true; //Jei naujas tikrinam, jei senas tikrinam tik jei pasikeite
                  var Require=Validity.search(/require/i)> -1;
                  var NotEmpty=(val==="")?false:true;

                  if(CheckIt&&(Require||NotEmpty)) {//Pasikeite reiksme && (Require arba Netuscias)
                     if(Validity) eval("e."+Validity); //Validuojam tik jei skirtingos reiksmes
                  }
                  if(IsTip) { e.val(cTip); } //Grazinam tipus
               }
            }
            if(typeof e.data("ctrl").AgrValidity!=='undefined') {//Jeigu reikia uzpildyti viena is privalomu lauku
               var aVal=e.data("ctrl").AgrValidity;
               if(aVal.Validity==="require") {
                  var Empty=$.map($(aVal.Selector), function(e, index) {
                     return ($(e).val())?null:1;
                  });
                  if(Empty.length===$(aVal.Selector).length) { e.require(aVal.Msg); }
               }
            }
         }
         if(OldVal!=val||(val===0&&OldVal==="")) {
            if(UpdateField) { DataToSave[UpdateField]=val; }
            else { DataToSave.Data.push(val); DataToSave.Fields.push(FName); } //Add to DataToSave
            log("Save element: val-"+val+", OldVal-"+OldVal+", Type-"+Type);
         }
      });
      //[{ Fields: "AccidentID", Data: $('#tblClaims').data('ctrl').AccidentID }]
      //Pridedam papildomus parametrus kuriuos siunciam servui

      if(typeof (DataToSaveAppend)!='undefined') { for(var i=0; i<DataToSaveAppend.length; i++) { DataToSave.Data.push(DataToSaveAppend[i].Data); DataToSave.Fields.push(DataToSaveAppend[i].Fields) } }

      //log("Data:"+DataToSave.Data.join(", "));
      //log("Fields:"+DataToSave.Fields.join(", "));

      var ValRes=$.validity.end();
      //log("<div>======Validation rezult: "+ValRes.valid+"===============</div>");
      if(ValRes.valid&&DataToSave.Data.length) { if(!NewRec) { DataToSave["id"]=id; }; return DataToSave; }
      else if(ValRes.valid) return 0//reiskia, kad niekas nepakeista
      else return false;
   }, Validate: {
      IsNumeric: function(val) {
         var re=/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/;
         if(re.test(val)) return true; return false;
      }
   }
};
var oVALIDATE={
   IsNumeric: function(val) {
      var re=/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/;
      if(re.test(val)) return true; return false;
   },
   IsYear: function(val) { },
   Element: function(Element, ValidationRule) {
      $.validity.start();
      if(!ValidationRule) return true;
      eval("$(Element)."+ValidationRule);
      return $.validity.end();
   }
};
var TIMEDIF={
   s: 0,
   Start: function() {
      this.s=(new Date()).getTime();
   },
   log: function(str) {
      dif=(new Date()).getTime()-this.s; console.log(((str)?str:"")+" - "+dif+" msek"); this.s=(new Date()).getTime();
   }
}
function exec_GetTableHTML(DataObject) {
   var Cols=getCols(DataObject.Head.length, DataObject.Config.NotVisibleCol);
   return "<table id='DataGrid'  class='display'>"+GetHead(DataObject.Head, Cols)+GetBody(DataObject.Data, Cols)+"</table>"
   function GetHead(HeadData, Cols) {
      var HeadHTML="";
      for(var i=0; i<Cols.length; i++) {
         HeadHTML+="<th>"+HeadData[Cols[i]]+"</th>";
      }
      return "<thead><tr>"+HeadHTML+"</tr></thead>";
   }
   function GetBody(BodyData, Cols) {
      var BodyHTML="";
      //for(var row=0; row<BodyData.length; row++) { BodyHTML+="<tr id='r"+row+"'>"+GetObjectRow(BodyData[row], Cols)+"</tr>"; }
      for(var row=0; row<BodyData.length; row++) { BodyHTML+="<tr>"+GetObjectRow(BodyData[row], Cols)+"</tr>"; }
      return "<tbody>"+BodyHTML+"</tbody>";
   }
   function GetObjectRow(RowData, Cols) {
      var RowHTML="";
      for(var i=0; i<Cols.length; i++) { RowHTML+="<td>"+RowData[Cols[i]]+"</td>"; }
      return RowHTML;
   }
   function getCols(MaxCol, NotVisibleCols) {
      var Cols=[];
      for(var col=0; col<MaxCol; col++) {
         if($.inArray(col, NotVisibleCols)=== -1) Cols[Cols.length]=col; //Grazina indeksa, jei neranda -1
      }
      return Cols;
   }
}
//------------------------UL List Filling Functions--------------------------------------------------------------------------------------------------
function exec_GetULListHTML(Arr) {
   var HTML="";
   for(var divisions=0; divisions<Arr.length; divisions++) {
      if(Arr[divisions][1].length==0) {//Nera itemsu(papunkciu)
         HTML+="<li class=\"lact\" id=\"limnu_"+divisions+"\"><a href=\"#\" onclick=\"MenuClick('"+Arr[divisions][0]+"',0,'limnu_"+divisions+"');return false;\">"+Arr[divisions][0]+"</a></li>";
      } else {
         HTML+="<li class=\"ltitle\"><a>"+Arr[divisions][0]+"</a>";
         HTML+="<ul>"+FillItems(Arr[divisions][0], Arr[divisions][1])+"</ul></li>";
      }
   }
   function FillItems(divname, items) {
      var RowHTML="";
      for(var row=0; row<items.length; row++) {
         //RowHTML+="<li class=\"lact\" id=\"limnu_"+divname+items[row][0]+"\"><a href=\"#\" onclick=\"MenuClick('"+divname+"',"+items[row][0]+",'limnu_"+divname+items[row][0]+"');return false;\">"+items[row][1]+"</a></li>";
         RowHTML+="<li class=\"lact\" id=\"limnu_"+divname+items[row][0]+"\"><a href=\"#\" onclick=\"MenuClick('"+divname+"',"+items[row][0]+",this.id);return false;\">"+items[row][1]+"</a></li>";
      }
      return RowHTML;
   }
   return "<ul>"+HTML+"</ul>";
}
//function exec_GetOptionListHTML(Arr, ListBoxid, ValI, ArrTextI, SelectedID, ReplaceArr) {
function exec_GetOptionListHTML(p) {
   ///<summary>Gets option list HTML</summary>
   ///<param name="p">{Arr:'Array to get options from',ListBoxid:'id of listbox to set', ValI:'index in array to get value for listbox',
   /// ArrTextI:'arry of indexes to show in listbox text', SelectedID:'id to be selected',
   /// ReplaceArr:'[{Ix:??,txtIx:??,obj:??}] - pakeicia idus tekstais(Ix-kuri i pakeisti, txtIx-kur obj sedi tekstas, obj-duomenu objektas)'}
   ///</param>
   var HTML="<select id='"+p.id+"'>";
   for(var i=0; i<p.Arr.length; i++) {
      var Text=[];
      for(var I=0; I<p.TextI.length; I++) { Text.push(p.Arr[i][p.TextI[I]]); }
      //-----------------id lauku pakeitimas-----------pradzia---------------------------------
      if(typeof (p.ReplaceArr)!='undefined') {
         for(var iobj=0; iobj<p.ReplaceArr.length; iobj++) {//begam per objektus
            var obj=p.ReplaceArr[iobj].obj.Data, Ix=p.ReplaceArr[iobj].Ix, txtIx=p.ReplaceArr[iobj].txtIx;
            for(var ix=0; ix<obj.length; ix++) {
               if(Text[Ix]===obj[ix][0]) {
                  Text[Ix]=obj[ix][txtIx]; break;
               }
            } //begam per obj ir kai surandam i pakeiciam i tekstu
         }
      }
      //-----------------id lauku pakeitimas------------pabaiga---------------------------------
      Text=Text.join(", ");
      if(p.SelectedID) { HTML+="<option value='"+p.Arr[i][p.ValI]+((+p.Arr[i][0]==p.SelectedID)?"' selected='selected'":"'")+">"+Text+"</option>"; }
      else { HTML+="<option value='"+p.Arr[i][p.ValI]+"'>"+Text+"</option>"; }
   }
   return HTML+"</select>";
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------------
//var data = [2, 4, 6, 8];
//alert($.inArray(4, data)) // output 1 as expected
//alert($.inArray("4", data)) // output -1 as expected

//var arr = [4, "Pete", 8, "John"];
//"John" found at 3
//4 found at 0
//"David" found at -1