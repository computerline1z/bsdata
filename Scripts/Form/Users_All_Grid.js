/// <reference path="../JSMain/jquery-1.4.4-vsdoc.js" />
//var Users_All_Grid=
(function() {
   //            tblUsers = UsrRep.GetJSON_tblUsers(),
   //            tblUsers_Dep = UsrRep.GetJSON_tblUsers_Dep(),
   //            tblUsers_SubDep = UsrRep.GetJSON_tblUsers_SubDep(),
   var fnDrawCallback=function(oSettings) {
      //if(oSettings.aiDisplay.length==0) {  return;  }
      var nTrs=$('#tblGrid tbody tr');
      var iColspan=nTrs[0].getElementsByTagName('td').length;
      var sLastGroup="", iLastID=0;
      for(var i=0; i<nTrs.length; i++) {
         var iDisplayIndex=oSettings._iDisplayStart+i;

         var SubDepID=oSettings.aoData[oSettings.aiDisplay[iDisplayIndex]]._aData[5]; //_aData[5]-SubDepID
         if(SubDepID!=iLastID) {
            var sGroup=GetNameByID(SubDepID);
            iLastID=SubDepID;
            if(sGroup!=sLastGroup) {
               var nGroup=document.createElement('tr');
               var nCell=document.createElement('td');
               nCell.colSpan=iColspan;
               nCell.className="group";
               nCell.innerHTML=sGroup;
               nGroup.appendChild(nCell);
               nTrs[i].parentNode.insertBefore(nGroup, nTrs[i]);
               sLastGroup=sGroup;
            }
         }
      }
   }
   //sDom: "rt", fnRowCallback: _fnRowCallback, fnHeaderCallback: _fnHeaderCallback,
   //   fnInitComplete: function() { t=this; setTimeout(function() { t.fnAdjustColumnSizing(); }, 5); }
   var oTable=$('#tblGrid').clsGrid({ "aaSortingFixed": [[5, 'asc']]           //Del grupavimo
   , "fnDrawCallback": fnDrawCallback, "fnEditRowOnClick": window.oSCRIPT.Editable
   }, "tblUsers");

   function GetNameByID(ID) {
      var opa="";
      ID=parseInt(ID, 10), tblUsers_SubDep=oDATA.Get("tblUsers_SubDep"), tblUsers_Dep=oDATA.Get("tblUsers_Dep");
      for(var i=0; i<tblUsers_SubDep.Data.length; i++) {
         if(tblUsers_SubDep.Data[i][0]===ID) {
            var DepID=tblUsers_SubDep.Data[i][2]
            for(var ix=0; ix<tblUsers_Dep.Data.length; ix++) {
               if(tblUsers_Dep.Data[ix][0]===DepID) { return tblUsers_Dep.Data[ix][1]; }
            }
         }
      }
   }
}).call(this);