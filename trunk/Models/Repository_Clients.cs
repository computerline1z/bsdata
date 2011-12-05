using System.Linq;
using BSData.Classes;

namespace BSData.Models {

   public class Repository_Clients {
      private dbDataContext dc;

      public Repository_Clients() { dc = new dbDataContext(); }

      public Repository_Clients(string ConStr) { dc = new dbDataContext(ConStr); }

      public jsonArrays GetJSON_proc_Clients(int? UserID, int? RecID) {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from c in dc.proc_Clients(UserID, RecID)
                     select new object[] {
c.ID,//0
c.Town,//1
c.Name,//2
c.Contracts,//3 Total##FormID
c.Events,//4 Total##Last##LastUserID##Next##NextUserID##NextFormID
c.UplFilesNo,//5
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Town"},//1
new { FName = "Name"},//2
new { FName = "Contracts##"},//3
new { FName = "Events##"},//4
new { FName = "UplFilesNo"}//5
}; JSON.Cols = Cols;
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID
new {sTitle="Miestas"},//1//Town//
new {sTitle="Pavadinimas"},//2//Name//
new {sTitle="Sutartys, tipinė forma"},//3
new {sTitle="Įvykai"},//4
new {sTitle="Dok."}//5
}, aaSorting = new object[] { new object[] { 2, "asc" } },
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblContracts_Form() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblContracts_Forms
                     select new object[] {
d.ID,//0
d.Name,//1
d.Description//2
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="string", Validity="require().nonHtml().maxLength(50)"},//1
new { FName = "Description",Type="string", Validity="require().nonHtml().maxLength(300)"}//2
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Docs", tblUpdate = "tblContracts_Form", Msg = new { AddNew = "Naujos tipinės formos sukūrimas", Edit = "Tipinės formos redagavimas", Delete = "Ištrinti tipinę formą", GenName = "Tipinė forma" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Name"},//1//Name//
new {sTitle="Description"}//2//Description//
}, aaSorting = new object[] { new object[] { 1, "asc" } },//???
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblClient_prop() {
         jsonArrays JSON = new jsonArrays();
         object[] Cols ={
new { FName = "Name",field_type="text", Validity="require().nonHtml().maxLength(60)"},//1
new { FName = "Code",field_type="text", Validity="require().match(/^\\d{9}$/, \"Įmonės kodas turi būt sudarytas iš 9 skaičių.\")"},//2
new { FName = "Description", field_type="textarea", Validity="require().nonHtml().maxLength(250)"},//3
new { FName = "Address",field_type="textarea", Validity="require().nonHtml().maxLength(200)"},//4
new { FName = "TownID", List=new{ListType="None",Source="tblTowns",iVal=0,iText=new object[]{1}}},//5
new { FName = "Contact",field_type="textarea", Validity="require().nonHtml().maxLength(125)"},//6
new { FName = "ContactDetails",field_type="textarea", Validity="require().nonHtml().maxLength(125)"},//7
new { FName = "Email",Type="Email",field_type="text", Validity="require().match(\"email\").maxLength(25)"},//8match('email')
new { FName = "Notes",field_type="textarea", Validity="require().nonHtml().maxLength(500)"},//9

new { FName = "NextContactUserID", List=new{ListType="None",Source="tblUsers",iVal=0,iText=new object[]{2,3}}},//10
new { FName = "NextContactDate",field_type="text", Validity="match('date').greaterThan(new Date())"},//11
new { FName = "NextContactContractFormID",List=new{ListType="List",Source="tblContracts_Form",iVal=0,iText=new object[]{1}}}//12
}; JSON.Cols = Cols;
         //         JSON.Config = new {
         //            Controler = "Clients", tblUpdate = "tblClients", Msg = new { AddNew = "Naujo kliento įvedimas", Edit = "Kliento duomenų redagavimas", Delete = "Ištrinti klientą", GenName = "Klientas" }
         //         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {sTitle="Pavadinimas"},//1//Name//
new {sTitle="Įmonės kodas"},//2//Code//
new {sTitle="Aprašymas"},//3//Description//
new {sTitle="Adresas"},//4//Address//
new {sTitle="Miestas"},//5//TownID////DefaultUpdate=0
new {sTitle="Konataktinis asmuo(-ys)"},//6//Contact//
new {sTitle="Kontaktinė informacija"},//7//ContactDetails//
new {sTitle="E.paštas"},//8//Email//
new {sTitle="Kita informacija"},//9//Notes//
new {sTitle="Darbuotojas"},//10//NextContactUserID//
new {sTitle="Data"},//11//NextContactDate//
new {sTitle="Tema"}//12//NextContactContractFormID//
         }
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblClientEvents(int ClientID) {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from e in dc.proc_GetClientEvents(ClientID)
                     select new object[] {
e.ID,//0
e.Date,//1
e.UserName,//2
e.Msg,//3
e.UplFilesNo,//4
e.UserID//5
};
         object[] Cols ={
         // Plugin={"datepicker":{"minDate":"-5y","maxDate":"0"}}
         new { FName = "ID"},//0
         new { FName = "Date",UpdateField="Date"},//1
         new { FName = "UserName" , Default="UserName"},//2
         new { FName = "Msg"},//3
         new { FName = "UplFilesNo", Default=0},//4
         new { FName = "UserID", Default="UserId"}//5
         }; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Clients", tblUpdate = "tblClients_Events", Msg = new { AddNew = "Naujo įvykio įvedimas", Edit = "Įvykio redagavimas", Delete = "Ištrinti įvykį", GenName = "Įvykis" }
         };

         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Data"},//1//Date//
new {sTitle="Darbuotojas"},//2//UserName//
new {sTitle="Esmė"},//3//Msg//
new {sTitle="Dok."},//4//UplFilesNo//
new {bVisible=false,bSearchable=false},//5//UserID////
}, aaSorting = new object[] { new object[] { 1, "asc" } },//???
         };
         return JSON;
      }

      public tblClient GetModel_Client(int ClientID) {
         tblClient Client = (from c in dc.tblClients where c.ID == ClientID select c).SingleOrDefault();
         return Client;
      }

      public jsonArrays GetJSON_tblTowns() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblTowns
                     select new object[] {
d.ID,//0
d.Name//1
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="String",Validity="require().nonHtml().maxLength(50)"}//1
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Docs", tblUpdate = "tblTowns", Msg = new { AddNew = "Naujo miesto įvedimas", Edit = "Miesto redagavimas", Delete = "Ištrinti miestą", GenName = "Miestas" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Name"}//1//Name//
}, aaSorting = new object[] { new object[] { 1, "asc" } },
         };
         return JSON;
      }

      //----------- Gal nereikia----------start-------------

      //public jsonArrays GetJSON_tblClient1(int ClientID) {
      public jsonArrays GetJSON_tblClient1() {
         jsonArrays JSON = new jsonArrays();
         //         JSON.Data = from d in dc.tblClients join t in dc.tblTowns on d.TownID equals t.ID
         //                     where d.ID == ClientID
         //                     select new object[] {
         //d.ID,//0
         //d.Code,//1
         //d.Name,//2
         //d.Description,//3
         //d.Address,//4
         ////d.TownID,//5
         //t.Name,
         //d.Contact,//6
         //d.ContactDetails,//7
         //d.Email,//8
         //d.Notes,//9
         //d.NextContactUserID,
         //d.NextContactDate,
         //d.NextContactContractFormID
         //};
         // if (!onlyData) {
         object[] Cols ={
//new { FName = "ID"},//0
new { FName = "Code",Type="Integer", Validity="require().match(/^\\d{9}$/, \"Įmonės kodas turi būt sudarytas iš 9 skaičių.\")"},//1
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(60)"},//2
new { FName = "Description",Type="String", Validity="require().nonHtml().maxLength(250)"},//3
new { FName = "Address",Type="String", Validity="require().nonHtml().maxLength(200)"},//4
new { FName = "TownID",Tip="Pradėkite rinkti artimiausio miesto pavadinimą..",List=new{ListType="None",Source="tblTowns",iVal=0,iText=new object[]{1}}},//5
//new { FName = "TownName"},//5 , IdInMe=5
new { FName = "Contact",Type="String", Validity="require().nonHtml().maxLength(125)"},//6
new { FName = "ContactDetails",Type="textarea", Validity="require().nonHtml().maxLength(125)"},//7
new { FName = "Email",Type="Email", Validity="require().match(\"email\").maxLength(25)"},//8match('email')
new { FName = "Notes",Type="String", Validity="require().nonHtml().maxLength(500)"}//,//9

//new { FName = "NextContactUserID",List=new{ListType="None",Source="tblUsers",iVal=0,iText=new object[]{1,2}}},//10
//new { FName = "NextContactDate",Type="Date", Validity="match('date').greaterThan(new Date())"},//11
//new { FName = "NextContactContractFormID",List=new{ListType="None",Source="tblContracts_Form",iVal=0,iText=new object[]{1}}}//12
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Clients", tblUpdate = "tblClients", Msg = new { AddNew = "Naujo kliento įvedimas", Edit = "Kliento duomenų redagavimas", Delete = "Ištrinti klientą", GenName = "Klientas" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
//new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Kodas"},//1//Code//
new {sTitle="Pavadinimas"},//2//Name//
new {sTitle="Aprašymas"},//3//Description//
new {sTitle="Adresas"},//4//Address//
new {sTitle="Miestas",bSearchable=false},//5//TownID////DefaultUpdate=0
//new {sTitle="Miestas",bSearchable=false},//5//TownName////DefaultUpdate=0
new {sTitle="Konataktinis asmuo(-ys)"},//6//Contact//
new {sTitle="Kontaktinė informacija"},//7//ContactDetails//
new {sTitle="E.paštas"},//8//Email//
new {sTitle="Kas domina"}//,//9//Notes//

//new {sTitle="Darbuotojas"},//10//NextContactUserID//
//new {sTitle="Data"},//11//NextContactDate//
//new {sTitle="Sritis"}//12//NextContactContractFormID//
         }
         };
         //}
         return JSON;
      }//??

      //      public jsonArrays GetJSON_tblContracts1() {//Sutačių pildymui
      //         jsonArrays JSON = new jsonArrays();
      //         object[] Cols ={
      //new { FName = "ID"},//0
      //new { FName = "FormID",Tip="Pasirinkite sutarties tipinę formą..", List=new{Source="tblContracts_Form", iVal=0,iText=new object[]{1,2}}},//1
      //new { FName = "Date",Type="DateLess", Default="Today",Validity="require().match('date').lessThanOrEqualTo(new Date())"},//2
      //new { FName = "DeliveryDate",Type="DateLess", Default="Today",Validity="match('date').lessThanOrEqualTo(new Date())"},//3
      //new { FName = "ClientID",Tip="Pradėkite rinkti įmonės pavadinimo arba miesto raides..",List=new{ListType="None",Source="tblClients",iVal=0,iText=new object[]{2,6}}},//4
      //new { FName = "ClientNo",Type="String", Validity="nonHtml().maxLength(20)"},//5
      //new { FName = "Description",LenMax=200, Type="String", Validity="require().nonHtml().maxLength(100)"},//6
      //new { FName = "ValidityDate",Type="Date", classes="ValidTill", Validity="match('date').greaterThan(new Date())"},//7
      //new { FName = "ValidityNote",Type="String", classes="ValidTill", Validity="nonHtml().maxLength(50)", AgrValidity=new{Selector=".ValidTill", Validity="require",Msg="Turi būti nurodyta arba galiojimo data arba paaiškinimas"}},//8
      //new { FName = "PriceAtOnce",Type="Decimal", classes="Price", Validity="match('number').greaterThanOrEqualTo(0)"},//9
      //new { FName = "PricePerMonth",Type="Decimal", classes="Price", Validity="match('number').greaterThanOrEqualTo(0)", AgrValidity=new{Selector=".Price", Validity="require",Msg="Turi būti nurodyta arba vienkartinė kaina arba abonentinis"}},//10
      //new { FName = "RespUserID",Tip="Pradėkite rinkti atsakingo asmens vardo ir pavardės raides..",List=new{ListType="None",Source="tblUsers",iVal=0,iText=new object[]{2,3,1}}},//11
      //new { FName = "Notes",Type="String",LenMax=200, Validity="nonHtml().maxLength(100)"},//12
      //new { FName = "PagesNo",Type="Integer", Validity="require().match('integer').maxLength(5).greaterThanOrEqualTo(0)"},//13
      //new { FName = "SubDepID",Tip="Pasirinkite skyrių atsakingą už sutarties vykdymą..", List=new{Source="tblUsers_SubDep",iVal=0,iText=new object[]{1}}},//14
      //new { FName = "IsOurCustomer",Type="Boolean"}//,//15
      //new { FName = "IsSigned",Type="Boolean"}//16
      //}; JSON.Cols = Cols;
      //         JSON.Config = new {
      //            Controler = "Contracts", tblUpdate = "tblContracts", Msg = new { AddNew = "Naujos sutarties įvedimas", Edit = "Sutarties redagavimas", Delete = "Ištrinti sutartį", GenName = "Sutartis" }
      //         };
      //         JSON.Grid = new {
      //            aoColumns = new object[]{
      //new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
      //new {sTitle="Tipinė forma", bVisible=false,bSearchable=false},//1//FormID////DefaultUpdate=0
      //new {sTitle="Sutarties"},//2//Date//
      //new {sTitle="Gavimo patvirtintos"},//3//DeliveryDate//
      //new {sTitle="Pavadinimas", bVisible=false,bSearchable=false},//4//ClientID////DefaultUpdate=0
      //new {sTitle="Kitos šalies Nr"},//5//ClientNo//
      //new {sTitle="Sutarties esmė",sClass="smallFont"},//6//Description//
      //new {sTitle="Data"},//7//ValidityDate//
      //new {sTitle="Paaiškinimai"},//8//ValidityNote//
      //new {sTitle="Vienkartinė"},//9//PriceAtOnce//
      //new {sTitle="Per mėn."},//10//PricePerMonth//
      //new {sTitle="Darbuotojas", bVisible=false,bSearchable=false},//11//RespUserID////DefaultUpdate=0
      //new {sTitle="Pastabos"},//12//Notes//
      //new {sTitle="Puslapių skaičius"},//13//PagesNo//
      //new {sTitle="Skyrius", bVisible=false,bSearchable=false},//14//SubDepID////DefaultUpdate=0
      //new {sTitle="Tai yra paslaugas ar prekes perkantis klientas"}//,//15//IsOurCustomer//
      //new {sTitle="Sutartis pasirašyta abiejų šalių"}//16//IsSigned//
      //}, aaSorting = new object[] { new object[] { 3, "asc" } },//???
      //         };
      //         return JSON;
      //      }

      public jsonArrays GetJSON_tblUsers_Dep() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers_Deps
                     select new object[] { d.ID, d.Name };
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(50)"}//1
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
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(35)"},//1
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
                     select new object[] { d.ID, d.Name };
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="String"},//1
}; JSON.Cols = Cols;
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Name"}//1//Name//
}
         };
         return JSON;
      }

      //----------- Gal nereikia----------end-------------

      public jsonArrays GetJSON_tblUsers() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers orderby d.SubDepID, d.OrderNo, d.LastName
                     select new object[] {
d.ID,//0
d.Position,//1
d.Name,//2
d.LastName,//3
d.SubDepID,//4
d.Email//5
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Position",Type="String", LenMax=50,Validity="require().nonHtml().maxLength(50)"},//2
new { FName = "User",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"},//3
new { FName = "LastName",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"},//4
new { FName = "SubDepID",Tip="Pasirinkite skyrių..",List=new{Source="tblUsers_SubDep",iVal=0,iText=new int[]{1}}},//5
new { FName = "Email",Type="Email", LenMax=50,Validity="require().match(\"email\").maxLength(50)"}//8
}; JSON.Cols = Cols;
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Pareigybė",sClass="smallFont"},//2//Position//
new {sTitle="Pavardė_Vardas"},//3//Name//
new {sTitle="Pavardė"},//4//LastName//
new {sTitle="Skyrius", bVisible=false, bSearchable=false},//5//SubDepID////DefaultUpdate=0
new {sTitle="E-paštas",sClass="smallFont"}//8//Email//
}
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblDocs_UploadedFiles(string FileName) {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from c in dc.proc_GetUploadedFiles(FileName, null)
                     select new object[] {
c.ID,//0
c.UserID,//1
c.Date,//2
c.SizeKB,//3
c.FileName,//4
c.RecordID,//5
c.Description//6
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "UserID"},//1
new { FName = "Date"},//2
new { FName = "SizeKB"},//3
new { FName = "FileName"},//4
new { FName = "RecordId1"},//5
new { FName = "Description"}//6
}; JSON.Cols = Cols;
         return JSON;
      }
   }
}