﻿/// <reference path="../JSMain/jquery-1.4.4-vsdoc.js" />
//---------Pop Up--------------------------------------------------------------------------------
//-----$(element).center();----------------------------------------------------------------------------------------
//$('input:text, textarea').live('focus blur', function() {
//   $(this).toggleClass('activeField');
//});

var oTable1="opa";
//-----------------
$('input:text, textarea').live('focus', function() {
   if(!$(this).hasClass('activeField')) {
      $(this).addClass('activeField');
   }
}).live('blur', function() { $(this).removeClass('activeField'); });

jQuery.fn.center=function() {
   this.css("position", "absolute");
   this.css("top", ($(window).height()-this.height())/2+$(window).scrollTop()+"px");
   this.css("left", ($(window).width()-this.width())/2+$(window).scrollLeft()+"px");
   return this;
}
//function clsWait() {
//   this.Show=_Show;
//   this.Hide=_Hide;
//   function ShowAsync(RunCmd) {
//      _Show(3000);
//      setTimeout(RunCmd, 10);
//      _Hide();
//   }
//   function _Show(sek) {
//      if($("#popupDiv").length===0) {
//         var WaitTime=((sek==undefined)?500:(sek*1000));
//         //$("#main").append('<div class="messagepop pop"><form method="post" id="new_message" action="/messages"><p><label for="email">Your email or name</label><input type="text" size="30" name="email" id="email" /></p><p><label for="body">Message</label><textarea rows="6" name="body" id="body" cols="35"></textarea></p><p><input type="submit" value="Send Message" name="commit" id="message_submit"/> or <a class="close" href="/">Cancel</a></p></form></div>');

//         $("body").append('<div id="popupDiv""><img  border="1" src="/Content/images/ajax-loader-bar.gif" alt="Wait"/></div>');
//         $("#popupDiv").center();
//         $("#popupDiv").focus();
//         setTimeout("$('#popupDiv').remove()", WaitTime);
//      }
//      return false;
//   }
//   function _Hide() {
//      $('#popupDiv').remove();
//      return false;
//   }
//   _Show(5);
//}
//---------------START LOADING FORM---------------------------------------------------------------------------------
//window.setTimeout("var Wait=new clsWait();", 0);
//var Wait=new clsWait();
//-----------------------------------------------------------------------------------------------------------------
$.fn.slideFadeToggle=function(easing, callback) {
   return this.animate({ opacity: 'toggle', height: 'toggle' }, "fast", easing, callback);
};
//-----Date functions---------------------------------------------------------------------------------------
function fnGetTodayDateString() {
   var d=new Date();
   return d.getFullYear()+'-'+
    ((d.getMonth()<9)?'0'+(d.getMonth()+1):(d.getMonth()+1))+'-'+
    ((d.getDate()<9)?'0'+d.getDate():d.getDate());
}
function fnGetDateString(Desc) {//Pradžios data
   var d=new Date(), Y=d.getFullYear(), m=d.getMonth()+1, M=fn2No(d.getMonth()+1), D=fn2No(d.getDate()), retD;
   if(Desc==="ThisYear") { retD=Y+".01.01" }
   else if(Desc==="Last6M") { retD=((m<6)?Y-1:Y)+"."+((m<6)?fn2No(m+6):fn2No(m-6))+"."+D; }
   else if(Desc==="Last12M") { retD=Y-1+"."+M+"."+D; }
   else { retD=Y+'.'+M+'.'+D; }
   return retD;
}
function fnGetDateString_noDay(Desc) {//Pradžios data
   var d=new Date(), Y=d.getFullYear(), m=d.getMonth()+1, M=fn2No(d.getMonth()+1), retD;
   if(Desc==="ThisYear") { retD=Y+".01" }
   else if(Desc==="Last6M") { retD=((m<6)?Y-1:Y)+"."+((m<6)?fn2No(m+6):fn2No(m-6)); }
   else if(Desc==="Last12M") { retD=Y-1+"."+M; }
   else { retD=Y+"."+M; }
   return retD;
}
function fn2No(No) { return No<10?'0'+No:No; }
function fnGetStringFromjDate(jDate) {
   var d=new Date(parseInt(jsonDate.substr(6)));
   return [d.format("yy/mm/dd"), d.format("HH:MM")];
}
function fnGetDateTime(expr) {
   var re=/^(\d{4})[\-|\/|\.]?(\d{1,2})[\-|\/|\.]?(\d{1,2})[\s\S]*(\d{2}:\d{2})$/; //2011-02-31 / 06:47
   if(expr!='') {
      if(regs=expr.match(re)) {
         if(regs[3]<1||regs[3]>31) {
            alert("Invalid value for day: "+regs[1]);
            return false;
         }
         if(regs[2]<1||regs[2]>12) {
            alert("Invalid value for month: "+regs[2]);
            return false;
         }
         if(regs[1]<1902||regs[1]>(new Date()).getFullYear()) {
            alert("Invalid value for year: "+regs[3]+" - must be between 1902 and "+(new Date()).getFullYear());
            return false;
         }
      } else {
         alert("Invalid date format: "+expr);
         return false;
      }
      return regs[1]+"-"+regs[2]+"-"+regs[3]+" "+regs[4]+":00";
   }
}
//-----Prototypes---------------------------------------------------------------------------------------
//Object.prototype.GetValByKey=function (Key) { <--------IE pasigaidina naudojant
Array.prototype.FNameIndex=function(FNameVal) {
   var ctr="";
   for(var i=0; i<this.length; i++) {
      // use ===to check for Matches. ie., identical (===), ;
      if(this[i].FName==FNameVal) {
         return i;
      }
   }
   return ctr;
};
Array.prototype.findIndexByVal=function(value) {
   var ctr="";
   for(var i=0; i<this.length; i++) {
      // use ===to check for Matches. ie., identical (===), ;
      if(this[i]==value) {
         return i;
      }
   }
   return ctr;
};
Array.prototype.findColsByID=function(ID, ReturnColIndexes) {//Randa reiksme stulelpeliu ReturnColIndexes kurio id yra ID [tik dvieju dimensiju array'ems]
   var ctr="";
   for(var i=0; i<this.length; i++) {
      if(this[i][0]===ID) {
         if(typeof ReturnColIndexes==="object") { return this[i].MapArrToString(ReturnColIndexes); }
         else { return this[i][ReturnColIndexes]; }
      }
   }
   return ctr;
};
Array.prototype.findRowByColValue=function(value, Col) {
   for(var Row=0; Row<this.length; Row++) {
      if(this[Row][Col]==value) {
         return Row;
      }
   }
   return "";
};
Array.prototype.removeRowByID=function(ID) {//Istrina eilute kurios id yra ID
   var ctr="";
   for(var i=0; i<this.length; i++) {
      if(this[i][0]===ID) {
         this.splice(i, 1);
         return i;
      }
   }
   return ctr;
};
Array.prototype.AddArray=function(AnotherArray) {
   for(var i=0; i<AnotherArray.length; i++) { this[this.length]=AnotherArray[i]; }
};
Array.prototype.IndexOfFunc=function(fnc) {
   //if(!fnc||typeof (fnc)!='function') { return -1; }
   for(var i=0; i<this.length; i++) {
      if(fnc(this[i])) return i;
   }
   return -1;
};
function ArrayIndexOf(a, fnc) {
   if(!fnc||typeof (fnc)!='function') { return -1; }
   if(!a||!a.length||a.length<1) return -1;
   for(var i=0; i<a.length; i++) {
      if(fnc(a[i])) return i;
   }
   return -1;
}
Array.prototype.ValueInMe=function(value) {
   for(var i=0; i<this.length; i++) {
      if(this[i]===value) { return true; }
   }
   return false;
};
Array.prototype.findColValByColVal=function(value, Col1, Col2) {
   ///<summary>Sends data to server (JSONarg), and call function CallFunc(Response,ActionPar)</summary>
   ///<param name="JSONarg">Json. To parse from javascript - JSON.stringify(jsObject)</param>
   ///<param name="CallFunc">Function to call. Example SetnewMenuData</param>
   ///<param name="ActionPar">example 'Darbuotojai'</param>
   ///<param name="url">example '/[Controler]Tab/GetTab[Action]'</param>
   ///<param name="dataType">JSONarg datatype 'json'|'html'|'texc'</param>
   ///<returns type="calls_CallFunc(Response,ActionPar)"/>
   for(var Row=0; Row<this.length; Row++) {
      if(this[Row][Col1]==value) {
         return this[Row][Col2];
      }
   }
   return "";
};
Array.prototype.MapArrToString=function(arrIndexes) {
   var arrRet=[];
   for(var i=0; i<arrIndexes.length; i++) {
      arrRet[arrRet.length]=this[arrIndexes[i]];
   }
   return arrRet.join(", ");
}
Array.prototype.UpdateArrToNew=function(NewArr) {
   for(var i=0; i<this.length; i++) {
      if(this[i][0]===NewArr[0]) { this[i]=NewArr; return; }
   }
}
String.prototype.IsImage=function() {
   var type=(this.substring(this.search("\\.")+1)).toUpperCase();
   if(type==="PNG"||type==="JPG"||type==="GIF"||type==="JPEG"||type==="BMP")
   { return true; } return false;
}
String.prototype.format=function() {
   //'{0} {0} {1} {2}'.format(3.14, 'abc', 'foo'); // outputs: 3.14 3.14 abc foo
   //'Your balance is {0} USD'.format(77.7)
   var s=this, i=arguments.length;
   while(i--) { s=s.replace(new RegExp('\\{'+i+'\\}', 'gm'), arguments[i]); }
   return s;
};
String.prototype.GetIcon=function(FileId) {
   var pPosition=this.search("\\."), ret="<span style='display:inline-block;' class='{0} ui-button-icon-primary'>", img="img32-Help";
   if(pPosition>0) {
      var type=(this.substring(this.search("\\.")+1)).toLowerCase();
      ret="<a href='/Uploads/"+FileId+"."+type+"' target='_blank'>"+ret+"</a>";
      if(type==="png"||type==="jpg"||type==="gif"||type==="jpg"||type==="jpeg"||type==="bmp") { img="img32-Img"; }
      else if(type==="xls"||type==="xlsx") { img="img32-Excel"; }
      else if(type==="pdf") { img="img32-Pdf"; }
      else if(type==="ppt"||type==="pptx") { img="img32-ppt"; }
      else if(type==="doc"||type==="docx") { img="img32-Word"; }
   } else {
      if(this==="Add") { img="img32-"+this.toString(); }
   }
   return ret.format(img);
}
String.prototype.endsWith=function(suffix) {
   return (this.substr(this.length-suffix.length)===suffix);
}
String.prototype.startsWith=function(prefix) {
   return (this.substr(0, prefix.length)===prefix);
}
//var jscss_filesadded="" //list of files already added
//function loadjscssfile(filename, filetype) {
//   if(jscss_filesadded.indexOf("["+filename+"]")=== -1) {
//      if(filetype=="js") { //if filename is a external JavaScript file
//         var fileref=document.createElement('script')
//         fileref.setAttribute("type", "text/javascript")
//         fileref.setAttribute("src", filename)
//      }
//      else if(filetype=="css") { //if filename is an external CSS file
//         var fileref=document.createElement("link")
//         fileref.setAttribute("rel", "stylesheet")
//         fileref.setAttribute("type", "text/css")
//         fileref.setAttribute("href", filename)
//      }
//      if(typeof fileref!="undefined") {
//         document.getElementsByTagName("head")[0].appendChild(fileref)
//      }
//      jscss_filesadded+="["+filename+"]" //List of files added in the form "[filename1],[filename2],etc"
//   } else { alert("file"+filename+" already added!"); }
//}