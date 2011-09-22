using System.Linq;
using BSData.Classes;

namespace BSData.Models {
   //public interface IAccidents {
   //   jsonArrays GetJSON_tblUsers();
   //   jsonArrays GetJSON_tblUsers_Details(int id);
   //   jsonArrays GetJSON_tblUsers_Dep();
   //   jsonArrays GetJSON_tblUsers_Sub_Dep();
   //   jsonArrays GetJSON_tblUsers_Status(int id);
   //}

   public class Repository_Users {
      private dbDataContext dc;

      public Repository_Users() { dc = new dbDataContext(); }

      public Repository_Users(string ConStr) { dc = new dbDataContext(ConStr); }

      public jsonArrays GetJSON_tblUsers() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers orderby d.SubDepID, d.OrderNo, d.LastName
                     select new object[] {
d.ID,//0
d.StatusID,//1
d.Position,//2
d.Name,//3
d.LastName,//4
d.SubDepID,//5
d.Phone_mob,//6
d.Phone_work,//7
d.Email,//8
d.Work_from.ToShortDateString(),//9
d.OrderNo//10
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "StatusID",Tip="Pasirinkite iš sąrašo..",List=new{Source="tblUsers_Status",Default=0,iVal=0,iText=new int[]{12}}},//1
new { FName = "Position",Type="String", LenMax=50,Validity="require().nonHtml().maxLength(50)"},//2
new { FName = "Name",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"},//3
new { FName = "LastName",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"},//4
new { FName = "SubDepID",Tip="Pasirinkite skyrių..",List=new{Source="tblUsers_SubDep",iVal=0,iText=new int[]{1}}},//5
new { FName = "Phone_mob",Type="Integer", Validity="match('integer').maxLength(8).greaterThanOrEqualTo(0)"},//6
new { FName = "Phone_work",Type="Integer", Validity="match('integer').maxLength(8)"},//7
new { FName = "Email",Type="Email", LenMax=50,Validity="require().match(\"email\").maxLength(50)"},//8
new { FName = "Work_from",Type="Date", LenMax=10,Validity="require().match('date').maxLength(10)",Plugin=new{datepicker=new{minDate="-15y",maxDate="0",changeYear=true}} },//9
new { FName = "OrderNo",Type="Integer"}//10
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Users", tblUpdate = "tblUsers", Msg = new { AddNew = "Naujo vartotojo sukūrimas", Edit = "Vartotojo redagavimas", Delete = "Ištrinti vartotoją", GenName = "Vartotojas", AddToTitle = new int[] { 3, 4 } }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Esama būklė", bVisible=false,bSearchable=false},//1//StatusID////DefaultUpdate=0
new {sTitle="Pareigybė",sClass="smallFont"},//2//Position//
new {sTitle="Vardas"},//3//Name//
new {sTitle="Pavardė"},//4//LastName//
new {sTitle="Skyrius", bVisible=false, bSearchable=false},//5//SubDepID////DefaultUpdate=0
new {sTitle="Mob. telefonas"},//6//Phone_mob//
new {sTitle="Darbo telefonas"},//7//Phone_work//
new {sTitle="E-paštas",sClass="smallFont"},//8//Email//
new {sTitle="Dirba nuo",sClass="smallFont"},//9//Work_from//
new {bVisible=false,bSearchable=false}//10//OrderNo//
}//, aaSorting = new object[] { new object[] { 10, "asc" } },//???
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblUsers_Dep() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers_Deps
                     select new object[] { d.ID, d.Name };
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="String", LenMax=50,Validity="require().nonHtml().maxLength(50)"}//1
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Users", tblUpdate = "tblUsers_Dep", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Pavadinimas"}//1//Name//
}
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblUsers_SubDep() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers_SubDeps
                     select new object[] { d.ID, d.Name, d.DepID };
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"},//1
new { FName = "DepID",List=new{Source="tblUsers_Dep",iVal=0,iText=new object[]{1}}}//2
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Users", tblUpdate = "tblUsers_SubDep", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Name",sClass="smallFont"},//1//Name//
new {bVisible=false,bSearchable=false}//2//DepID////DefaultUpdate=0
}//, aaSorting = new object[] { new object[] { 1, "asc" } },//???
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblUsers_Status() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers_Status
                     select new object[] {
d.ID,//0
d.Name//1
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="string", LenMax=100,Validity="require().nonHtml().maxLength(100)"}//1
}; JSON.Cols = Cols;
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Name"}//1//Name//
}, aaSorting = new object[] { new object[] { 1, "asc" } },//???
         };
         return JSON;
      }

      //public jsonArrays GetJSON_tblUsers_Dep() {
      //   return JSON;
      //}
   }
}