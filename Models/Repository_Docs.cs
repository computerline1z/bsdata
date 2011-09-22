using System.Linq;
using BSData.Classes;

namespace BSData.Models {

   public class Repository_Docs {
      private dbDataContext dc;

      public Repository_Docs() { dc = new dbDataContext(); }

      public Repository_Docs(string ConStr) { dc = new dbDataContext(ConStr); }

      public jsonArrays GetJSON_tblDocs_UploadedFiles() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblDocs_UploadedFiles
                     select new object[] {
d.ID,//0
d.FileName,//1
d.UserID,//2
d.SaveTime,//3
d.ObjectID,//4
d.RecordID,//5
d.Description//6
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "FileName"},//1
new { FName = "UserID"},//2
new { FName = "DateTime"},//3
new { FName = "ObjectID"},//4
new { FName = "RecordID"},//5
new { FName = "Description",Type="String",Validity="require().nonHtml().maxLength(50)"}//6
}; JSON.Cols = Cols;
         //JSON.Config = new {
         //   Controler = "Docs_UploadedFiles", tblUpdate = "tblDocs_UploadedFiles", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
         //};
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="FileName"},//1//FileName//
new {bVisible=false,bSearchable=false},//2//UserID////DefaultUpdate=0
new {sTitle="DateTime"},//3//DateTime//
new {bVisible=false,bSearchable=false},//4//ObjectID////DefaultUpdate=0
new {bVisible=false,bSearchable=false},//5//RecordID////DefaultUpdate=0
new {sTitle="Description",sClass="smallFont"}//6//Description//
}
         };
         return JSON;
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

      public jsonArrays GetJSON_tblClients() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblClients join t in dc.tblTowns on d.TownID equals t.ID
                     select new object[] {
d.ID,//0
d.Code,//1
d.Name,//2
d.Description,//3
d.Address,//4
d.TownID,//5
t.Name,
d.Contact,//6
d.ContactDetails,//7
d.Email,//8
d.Notes,//9
d.Rec_Bank,//10
d.Rec_BankAccount,//11
d.Rec_VATCode,//12
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "Code",Type="Integer", Validity="require().match(/\\d{9}/,\"Įmonės kodas turi būt sudarytas iš 9 skaičių.\")"},//1
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(60)"},//2
new { FName = "Description",Type="String", Validity="require().nonHtml().maxLength(250)"},//3
new { FName = "Address",Type="String", Validity="require().nonHtml().maxLength(200)"},//4
new { FName = "TownID",Tip="Pradėkite rinkti artimiausio miesto pavadinimą..",List=new{ListType="None",Source="tblTowns",iVal=0,iText=new object[]{1}}},//5
new { FName = "TownName", IdInMe=5},//5
new { FName = "Contact",Type="String", Validity="require().nonHtml().maxLength(125)"},//6
new { FName = "ContactDetails",Type="String", Validity="require().nonHtml().maxLength(125)"},//7
new { FName = "Email",Type="Email", Validity="require().match(\"email\").maxLength(25)"},//8match('email')
new { FName = "Notes",Type="String", Validity="require().nonHtml().maxLength(500)"},//9
new { FName = "Rec_Bank",Type="String", Validity="require().nonHtml().maxLength(50)"},//10
new { FName = "Rec_BankAccount",Type="String", Validity="require().nonHtml().maxLength(15)"},//11
new { FName = "Rec_VATCode",Type="String", Validity="require().nonHtml().maxLength(10)"},//12
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Docs", tblUpdate = "tblClients", Msg = new { AddNew = "Naujo kliento įvedimas", Edit = "Kliento duomenų redagavimas", Delete = "Ištrinti klientą", GenName = "Klientas" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Įmonės kodas"},//1//Code//
new {sTitle="Pavadinimas",sClass="smallFont"},//2//Name//
new {sTitle="Aprašymas",sClass="smallFont"},//3//Description//
new {bVisible=false,sTitle="Adresas",sClass="smallFont"},//4//Address//
new {bVisible=false,sTitle="Miestas",bSearchable=false},//5//TownID////DefaultUpdate=0
new {sTitle="Miestas",bSearchable=false},//5//TownName////DefaultUpdate=0
new {sTitle="Konataktinis asmuo(-ys)",sClass="smallFont"},//6//Contact//
new {bVisible=false,sTitle="Kontaktinė informacija",sClass="smallFont"},//7//ContactDetails//
new {sTitle="E.paštas"},//8//Email//
new {bVisible=false,sTitle="Pastabos",sClass="smallFont"},//9//Notes//
new {bVisible=false,sTitle="Bankas",sClass="smallFont"},//10//Rec_Bank//
new {bVisible=false,sTitle="Banko sąskaita"},//11//Rec_BankAccount//
new {bVisible=false,sTitle="PVM kodas"},//12//Rec_VATCode//
}, aaSorting = new object[] { new object[] { 2, "asc" } },//???
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblContracts1() {//Sutačių pildymui
         jsonArrays JSON = new jsonArrays();
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "FormID",Tip="Pasirinkite sutarties tipinę formą..", List=new{Source="tblContracts_Form", iVal=0,iText=new object[]{1,2}}},//1
new { FName = "Date",Type="DateLess", Default="Today",Validity="require().match('date').lessThanOrEqualTo(new Date())"},//2
new { FName = "DeliveryDate",Type="DateLess", Default="Today",Validity="require().match('date').lessThanOrEqualTo(new Date())"},//3
new { FName = "ClientID",Tip="Pradėkite rinkti įmonės pavadinimo arba miesto raides..",List=new{ListType="None",Source="tblClients",iVal=0,iText=new object[]{2,6}}},//4
new { FName = "ClientNo",Type="String", Validity="nonHtml().maxLength(20)"},//5
new { FName = "Description",LenMax=200, Type="String", Validity="require().nonHtml().maxLength(100)"},//6
new { FName = "ValidityDate",Type="Date", classes="ValidTill", Validity="match('date').greaterThan(new Date())"},//7
new { FName = "ValidityNote",Type="String", classes="ValidTill", Validity="nonHtml().maxLength(50)", AgrValidity=new{Selector=".ValidTill", Validity="require",Msg="Turi būti nurodyta arba galiojimo data arba paaiškinimas"}},//8
new { FName = "PriceAtOnce",Type="Decimal", classes="Price", Validity="match('number').greaterThanOrEqualTo(0)"},//9
new { FName = "PricePerMonth",Type="Decimal", classes="Price", Validity="match('number').greaterThanOrEqualTo(0)", AgrValidity=new{Selector=".Price", Validity="require",Msg="Turi būti nurodyta arba vienkartinė kaina arba abonentinis"}},//10
new { FName = "RespUserID",Tip="Pradėkite rinkti atsakingo asmens vardo ir pavardės raides..",List=new{ListType="None",Source="tblUsers",iVal=0,iText=new object[]{2,3,1}}},//11
new { FName = "Notes",Type="String",LenMax=200, Validity="nonHtml().maxLength(100)"},//12
new { FName = "PagesNo",Type="Integer", Validity="require().match('integer').maxLength(5).greaterThanOrEqualTo(0)"},//13
new { FName = "SubDepID",Tip="Pasirinkite skyrių atsakingą už sutarties vykdymą..", List=new{Source="tblUsers_SubDep",iVal=0,iText=new object[]{1}}},//14
new { FName = "IsOurCustomer",Type="Boolean"},//15
new { FName = "IsSigned",Type="Boolean"}//16
}; JSON.Cols = Cols;
         JSON.Config = new {
            Controler = "Contracts", tblUpdate = "tblContracts", Msg = new { AddNew = "Naujos sutarties įvedimas", Edit = "Sutarties redagavimas", Delete = "Ištrinti sutartį", GenName = "Sutartis" }
         };
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Tipinė forma", bVisible=false,bSearchable=false},//1//FormID////DefaultUpdate=0
new {sTitle="Sutarties"},//2//Date//
new {sTitle="Gavimo patvirtintos"},//3//DeliveryDate//
new {sTitle="Pavadinimas", bVisible=false,bSearchable=false},//4//ClientID////DefaultUpdate=0
new {sTitle="Kitos šalies Nr"},//5//ClientNo//
new {sTitle="Sutarties esmė",sClass="smallFont"},//6//Description//
new {sTitle="Data"},//7//ValidityDate//
new {sTitle="Paaiškinimai"},//8//ValidityNote//
new {sTitle="Vienkartinė"},//9//PriceAtOnce//
new {sTitle="Per mėn."},//10//PricePerMonth//
new {sTitle="Darbuotojas", bVisible=false,bSearchable=false},//11//RespUserID////DefaultUpdate=0
new {sTitle="Pastabos"},//12//Notes//
new {sTitle="Puslapių skaičius"},//13//PagesNo//
new {sTitle="Skyrius", bVisible=false,bSearchable=false},//14//SubDepID////DefaultUpdate=0
new {sTitle="Tai yra paslaugas ar prekes perkantis klientas"},//15//IsOurCustomer//
new {sTitle="Sutartis pasirašyta abiejų šalių"}//16//IsSigned//
}, aaSorting = new object[] { new object[] { 3, "asc" } },//???
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblContracts(bool IsValid, bool IsSigned) {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from c in dc.proc_GetContracts(IsValid, IsSigned) select new object[] {
            c.ID,//0
            c.FormID,//1
            c.Date,//2
            c.DeliveryDate,//3
            c.ClientID,//4
            c.ClientName,//5
            c.Description,//6
            c.ValidityDate,//7
            c.ValidityNote,//8
            c.DocsNo//9
         };
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "FormID"},//1
new { FName = "Date"},//2
new { FName = "DeliveryDate"},//3
new { FName = "ClientID"},//4
new { FName = "ClientName"},//5
new { FName = "Description"},//6
new { FName = "ValidityDate"},//7
new { FName = "ValidityNote"},//8
new { FName = "DocsNo"}//9
}; JSON.Cols = Cols;
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
new {sTitle="Tipinė forma", bVisible=false,bSearchable=false},//1//FormID////DefaultUpdate=0
new {sTitle="Data"},//2//Date//
new {sTitle="Gauta", bVisible=(IsSigned)?false:true,bSearchable=false},//3//DeliveryDate//rodom tik jei nepasirasyta
new {bVisible=false,bSearchable=false},//4//ClientID////DefaultUpdate=0
new {sTitle="Kita šalis"},//5
new {sTitle="Sutarties esmė",sClass="smallFont"},//6//Description//
new {sTitle="Data"},//7//ValidityDate//
new {sTitle="Paaiškinimai"},//8//ValidityNote//
new {sTitle="Dok.", bSearchable=false}//9//DocsNo//
}, aaSorting = new object[] { new object[] { 2, "asc" } }//Pagal data
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblContracts_Form() {
         jsonArrays JSON = new jsonArrays();
         //JSON.Data = from c in dc.proc_Clients(LoginData.LoginID, null)
         //join a in dc.tblAccidents on d.AccidentID equals a.ID
         //where d.IsDeleted == false && a.AccountID == UserData.AccountID
         JSON.Data = from d in dc.tblContracts_Forms where d.ID > (UserData.HasRole("EditContractForms") ? -1 : 0)//0-Netipine forma, kuria kurt leidziama tik juristui
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

      public jsonArrays GetJSON_tblUsers() {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from d in dc.tblUsers orderby d.SubDepID, d.OrderNo, d.LastName
                     select new object[] {
d.ID,//0
//d.Position,//1
d.LastName+' '+d.Name//2
//d.LastName,//3
//d.SubDepID,//4
//d.Email,//5
};
         object[] Cols ={
new { FName = "ID"},//0
//new { FName = "Position",Type="String", LenMax=50,Validity="require().nonHtml().maxLength(50)"},//2
new { FName = "User",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"}//3
//new { FName = "LastName",Type="String", LenMax=35,Validity="require().nonHtml().maxLength(35)"},//4
//new { FName = "SubDepID",Tip="Pasirinkite skyrių..",List=new{Source="tblUsers_SubDep",iVal=0,iText=new int[]{1}}},//5
//new { FName = "Email",Type="Email", LenMax=50,Validity="require().match(\"email\").maxLength(50)"},//8
}; JSON.Cols = Cols;
         JSON.Grid = new {
            aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
//new {sTitle="Pareigybė",sClass="smallFont"},//2//Position//
new {sTitle="Pavardė_Vardas"}//3//Name//
//new {sTitle="Pavardė"},//4//LastName//
//new {sTitle="Skyrius", bVisible=false, bSearchable=false},//5//SubDepID////DefaultUpdate=0
//new {sTitle="E-paštas",sClass="smallFont"}//8//Email//
}
         };
         return JSON;
      }

      public jsonArrays GetJSON_tblDocs(string FileName) {
         jsonArrays JSON = new jsonArrays();
         JSON.Data = from c in dc.proc_GetTblDocs(FileName)
                     select new object[] {
c.ID,//0
c.UserID,//1
c.Date,//2
c.SizeKB,//3
c.FileName,//4
c.Description//5
};
         object[] Cols ={
new { FName = "ID"},//0
new { FName = "UserID"},//1
new { FName = "Date"},//2
new { FName = "SizeKB"},//3
new { FName = "FileName"},//4
new { FName = "Description"}//5
}; JSON.Cols = Cols;
         return JSON;
      }
   }
}