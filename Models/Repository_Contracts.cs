using System.Linq;
using BSData.Classes;

namespace BSData.Models {
    //public class EditContract {
    //   public EditContract(int id) { _field1 = ""; property2 = ""; }
    //   private string No;
    //   private tblContracts_Form Contracts_Form;

    //   //public string field1 {
    //   //   get { return _field1; }
    //   //   set { _field1 = value; }
    //   //}
    //   public string property2 { get; set; }

    //   public void subName() {
    //      ;
    //   }
    //}

    public class ContractModel {

        public ContractModel(int id, dbDataContext dc) {
            Contract = (from d in dc.tblContracts where d.ID == id select d).SingleOrDefault();
            Object = (from d in dc.tblClients_Objects where d.ContractID == id select d).SingleOrDefault();
        }

        public tblContract Contract { get; set; }

        public tblClients_Object Object { get; set; }
    }

    public class Repository_Contracts {
        private dbDataContext dc;

        public Repository_Contracts() { dc = new dbDataContext(); }

        public Repository_Contracts(string ConStr) { dc = new dbDataContext(ConStr); }

        public jsonArrays GetJSON_tblClients() {
            jsonArrays JSON = new jsonArrays();
            JSON.Data = from d in dc.tblClients where d.Private == false //join t in dc.tblTowns on d.TownID equals t.ID
                        select new object[] {
d.ID,//0
d.Code,//1
d.Name,//2
d.Description,//3
d.Address,//4
d.TownID,//5
//t.Name,
d.Contact,//6
d.Email,
d.Private
//d.ContactDetails,//7
//d.Email,//8
//d.Notes,//9
//d.Rec_Bank,//10
//d.Rec_BankAccount,//11
//d.Rec_VATCode,//12
};
            object[] Cols ={
new { FName = "ID"},//0
new { FName = "Code",Type="Integer", Validity="require().match(/^\\d{9}$/, \"Įmonės kodas turi būt sudarytas iš 9 skaičių.\")"},//1
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(60)"},//2
new { FName = "Description",Type="textarea", style="height:5em;width:100%", Validity="require().nonHtml().maxLength(250)"},//3
new { FName = "Address",Type="textarea", style="height:3.5em;width:100%", Validity="require().nonHtml().maxLength(200)"},//4
new { FName = "TownID",Tip="Pradėkite rinkti artimiausio miesto pavadinimą..",List=new{ListType="Combo",Source="tblTowns",iVal=0,iText=new object[]{1}}},//5
//new { FName = "TownName", IdInMe=5},//5
new { FName = "Contact",Type="textarea", style="height:5em;width:100%", Validity="require().nonHtml().maxLength(125)"},//6
//new { FName = "ContactDetails",Type="String", Validity="require().nonHtml().maxLength(125)"},//7
new { FName = "Email",Type="Email", Validity="require().match(\"email\").maxLength(25)"},//8match('email')
new { FName = "Private",Type="Boolean"}
//new { FName = "Notes",Type="String", Validity="require().nonHtml().maxLength(500)"},//9
//new { FName = "Rec_Bank",Type="String", Validity="require().nonHtml().maxLength(50)"},//10
//new { FName = "Rec_BankAccount",Type="String", Validity="require().nonHtml().maxLength(15)"},//11
//new { FName = "Rec_VATCode",Type="String", Validity="require().nonHtml().maxLength(10)"},//12
}; JSON.Cols = Cols;
            //JSON.Config = new {
            //   Controler = "Docs", tblUpdate = "tblClients", Msg = new { AddNew = "Naujo kliento įvedimas", Edit = "Kliento duomenų redagavimas", Delete = "Ištrinti klientą", GenName = "Klientas" }
            //};
            JSON.Grid = new {
                aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Įmonės kodas"},//1//Code//
new {sTitle="Pavadinimas"},//2//Name//
new {sTitle="Aprašymas"},//3//Description//
new {bVisible=false,sTitle="Adresas"},//4//Address//
new {bVisible=false,sTitle="Miestas",bSearchable=false},//5//TownID////
//new {sTitle="Miestas",bSearchable=false},//5//TownName////
new {sTitle="Konataktai"},//6//Contact//
//new {bVisible=false,sTitle="Kontaktinė informacija"},//7//ContactDetails//
new {sTitle="E.paštas"},//8//Email//
new {sTitle="Ar klientas privatus asmuo?"},//8//Private
//new {bVisible=false,sTitle="Pastabos"},//9//Notes//
//new {bVisible=false,sTitle="Bankas"},//10//Rec_Bank//
//new {bVisible=false,sTitle="Banko sąskaita"},//11//Rec_BankAccount//
//new {bVisible=false,sTitle="PVM kodas"},//12//Rec_VATCode//
}, aaSorting = new object[] { new object[] { 2, "asc" } },//???
            };
            return JSON;
        }

        public jsonArrays GetJSON_proc_GetContracts(int StatusID, int? UserID, int? ExpireInDays) {
            jsonArrays JSON = new jsonArrays();

            if (UserID.HasValue) {
                JSON.Data = from d in dc.proc_GetContracts(StatusID, UserID.Value, null)
                            select new object[] { d.ID, d.No, d.Name, d.Address, d.Description, d.StartDate, d.EndDate, d.User, d.RespUser, d.Status_Description, d.docNo, d.TypeID };
            }
            else {
                if (ExpireInDays.HasValue) {
                    JSON.Data = from d in dc.proc_GetContracts(StatusID, null, ExpireInDays.Value)
                                select new object[] { d.ID, d.No, d.Name, d.Address, d.Description, d.StartDate, d.EndDate, d.User, d.RespUser, d.Status_Description, d.docNo, d.TypeID };
                }
                else {
                    JSON.Data = from d in dc.proc_GetContracts(StatusID, null, null)
                                select new object[] { d.ID, d.No, d.Name, d.Address, d.Description, d.StartDate, d.EndDate, d.User, d.RespUser, d.Status_Description, d.docNo, d.TypeID };
                }
            }

            object[] Cols ={
new { FName = "ID"},//0
new { FName = "No"},//1
new { FName = "Name"},//2
new { FName = "Address"},//3
new { FName = "Description"},//4
new { FName = "StartDate"},//5
new { FName = "EndDate"},//6
new { FName = "User"},//7
new { FName = "RespUser"},//8
new { FName = "Status_Description"},//9
new { FName = "docNo"},//10
new { FName = "TypeID"},//11
}; JSON.Cols = Cols;
            JSON.Config = new {
                Controler = "Contracts", tblUpdate = "tblContracts", Msg = new { AddNew = "", Edit = "", Delete = "", GenName = "" }
            };
            JSON.Grid = new {
                aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Nr"},//1//No////
new {sTitle="Klientas"},//2//Name////
new {sTitle="Adresas"},//3//Name////
new {sTitle="Esmė"},//4//Description//
new {sTitle="Pradžia"},//5//StartDate//
new {sTitle="Pabaiga"},//6//EndDate////
new {sTitle="Įrašė"},//7//User//
new {sTitle="Vykdo"},//8//RespUser//
new {sTitle="Būklė"},//9//Status_Description//
new {sTitle="Dok."},//10//Description//
new {bVisible=false,bSearchable=false},//11//TypeID////
}//???, aaSorting = new object[] { new object[] { 5, "asc" } },
            };
            return JSON;
        }

        public jsonArrays GetJSON_tblContracts_Types() {
            jsonArrays JSON = new jsonArrays();
            JSON.Data = from d in dc.tblContracts_Types
                        select new object[] { d.ID, d.Code, d.Name };
            object[] Cols ={
new { FName = "ID"},//0
new { FName = "Code",Type="String"},//1
new { FName = "Name",Type="String"}//2
}; JSON.Cols = Cols;
            //JSON.Config = new {
            //   Controler = "Users", tblUpdate = "tblUsers_Dep", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
            //};
            JSON.Grid = new {
                aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Kodas"},//1//Name//
new {sTitle="Pavadinimas"}
}
            };
            return JSON;
        }

        public ContractModel GetContract(int id) {
            return new ContractModel(id, dc);
        }

        public jsonArrays GetJSON_tblContract1() {
            jsonArrays JSON = new jsonArrays();
            object PluginSettings, StartDate, EndDate;
            if (UserData.UserID == 143 || UserData.UserID == 79)//Vitalikas
            {
                PluginSettings = new { datepicker = new { minDate = "-5y", maxDate = "+5y", changeYear = true } };
                StartDate = new { FName = "StartDate", Type = "DateLess", Validity = "require().match('date')", labelType = "Top", Plugin = PluginSettings };
                EndDate = new { FName = "EndDate", Type = "Date", Validity = "require().match('date')", labelType = "Top", Plugin = PluginSettings };
            }
            else {
                StartDate = new { FName = "StartDate", Type = "DateLess", Validity = "require().match('date').lessThanOrEqualTo(new Date())", labelType = "Top", Plugin = new { datepicker = new { minDate = "+0d", maxDate = "+2y", changeYear = true } } };
                EndDate = new { FName = "EndDate", Type = "Date", Validity = "require().match('date').greaterThanOrEqualTo(new Date())", labelType = "Top", Plugin = new { datepicker = new { minDate = "+1d", maxDate = "+5y", changeYear = true } } };
            }


            object[] Cols ={
new { FName = "ID"},//0
//new { FName = "FormID",List=new{Source="tblInsurers??",Val=0,Text=new object[]{1,2}}},//1
//new { FName = "TypeID",List=new{Source="tblInsurers??",Val=0,Text=new object[]{1,2}}},//2
//new { FName = "No",Type="String", LenMax=20,Validity="require().nonHtml().maxLength(20)"},//3
StartDate,//4
EndDate,//5
new { FName = "ClientID"},//5
new { FName = "Description",Type="textarea", style="height:5em;width:100%", Validity="require().nonHtml().maxLength(200)"},//7
//new { FName = "ValidityNote",Type="String", Validity="require().nonHtml().maxLength(100)"},//9
new { FName = "RespUserID",Tip="Pasirinkite darbuotoją..",List=new{ListType="Combo",Source="tblUsers",iVal=0,iText=new object[]{2,3,1}}},//10
new { FName = "SubDepID",Tip="Pasirinkite skyrių..",List=new{ListType="Combo",Source="tblUsers_SubDep",iVal=0,iText=new object[]{1}}},//11
new { FName = "StatusID"}//12
}; JSON.Cols = Cols;
            JSON.Config = new {
                Controler = "Contracts", tblUpdate = "tblContracts"//, Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
            };
            JSON.Grid = new {
                aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID//
//new {bVisible=false,bSearchable=false},//1//FormID//
//new {bVisible=false,bSearchable=false},//2//TypeID//
//new {sTitle="No"},//3//No//
new {sTitle="Pradžia"},//4//StartDate//
new {sTitle="Pabaiga"},//8//EndDate//
new {bVisible=false},//5//ClientID//
new {sTitle="Esmė,kontaktai"},//7//Description//
new {sTitle="Vykdytojas, asmuo",Tip="Pasirinkite darbuotoją..",List=new{ListType="Combo",Source="tblUsers",iVal=0,iText=new object[]{2,3,1}}},//10//RespUserID//
new {sTitle="Vykdytojas, skyrius",Tip="Pasirinkite skyrių..",List=new{ListType="Combo",Source="tblUsers_SubDep",iVal=0,iText=new object[]{1}}},//11//SubDepID//
new {bVisible=false},//12//StatusID//
}
            };
            return JSON;
        }

        //      public jsonArrays GetJSON_tblClient1() {
        //         jsonArrays JSON = new jsonArrays();
        //         object[] Cols ={
        //new { FName = "ID"},//0
        ////new { FName = "Private",Type="Boolean"},//1
        //new { FName = "Code",Type="String", Validity="require().nonHtml().maxLength(12)"},//2
        //new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(140)"},//3
        //new { FName = "SurName",Type="String", Validity="require().nonHtml().maxLength(140)"},//4
        //new { FName = "Description",Type="textarea", Validity="require().nonHtml().maxLength(510)"},//5
        //new { FName = "Address",Type="String", Validity="require().nonHtml().maxLength(510)"},//6
        //new { FName = "TownID",List=new{Source="tblTowns",Val=0,Text=new object[]{1}}},//7
        //new { FName = "Contact",Type="String", Validity="nonHtml().maxLength(250)"},//8
        //new { FName = "Email",Type="Email", LenMax=50,Validity="match('email').maxLength(50)"},//9
        //}; JSON.Cols = Cols;
        //         JSON.Config = new {
        //            Controler = "Contracts", tblUpdate = "tblClients"//, Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
        //         };
        //         JSON.Grid = new {
        //            aoColumns = new object[]{
        //new {bVisible=false,bSearchable=false},//0//ID//
        ////new {sTitle="Private"},//1//Private//
        //new {sTitle="Įmonės kodas"},//2//Code//
        //new {sTitle="Vardas/ pavadinimas"},//3//Name//
        //new {sTitle="Pavardė"},//4//SurName//
        //new {sTitle="Aprašymas"},//5//Description//
        //new {sTitle="Adresas"},//6//Address//
        //new {sTitle="Miestas(artimiausias)"},//7//TownID//
        //new {sTitle="Kontaktai"},//8//Contact//
        //new {sTitle="E.paštas"},//9//Email//
        //}
        //         };
        //         return JSON;
        //      }

        public jsonArrays GetJSON_tblClient_object1() {
            jsonArrays JSON = new jsonArrays();
            object[] Cols ={
new { FName = "ID"},//0
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(200)"},//1
new { FName = "ContractID"},//2
new { FName = "Device",Type="String", Validity="require().nonHtml().maxLength(100)"},//3
new { FName = "SimIMEI",Type="String", LenMax=50,Validity="require().nonHtml().maxLength(50)"},//4
new { FName = "Location",Type="textarea", style="height:5em;width:100%", Validity="require().nonHtml().maxLength(500)"},//5
new { FName = "Coords_AutoID",Tip="Automob. buvęs pas klientą..",labelType="Top",List=new{ListType="Combo",Source="tblVehicles",iVal=0,iText=new object[]{1,2,3}}},//6
new { FName = "Coords_Time",Type="DateTimeLess", Validity="require().match('date').lessThanOrEqualTo(new Date())",labelType="Top", Plugin=new{datepicker=new{minDate="-1y",maxDate="+0",changeYear=true}}},//4
}; JSON.Cols = Cols;
            JSON.Config = new {
                Controler = "Clients_Objects", tblUpdate = "tblClients_Objects", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
            };
            JSON.Grid = new {
                aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID//
new {sTitle="Pavadinimas"},//1//Name//
new {bVisible=false},//2//ContractID//
new {sTitle="Įranga/ blokas"},//3//Device//
new {sTitle="Sim kort. IMEI"},//4//SimIMEI//
new {sTitle="Atvykimo iki vietos aprašymas"},//5//Location//
new {sTitle="Automobilis"},//6//Coords//
new {sTitle="Data ir tikslus laikas (pvz. 12:30)"}//6//Coords//
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
new { FName = "Name",Type="String", Validity="require().nonHtml().maxLength(35)"}//1
//new { FName = "DepID",List=new{Source="tblUsers_Dep",iVal=0,iText=new object[]{1}}}//2
}; JSON.Cols = Cols;
            //JSON.Config = new {
            //   Controler = "Users", tblUpdate = "tblUsers_SubDep", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
            //};
            JSON.Grid = new {
                aoColumns = new object[]{
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Name"},//1//Name//
//new {bVisible=false,bSearchable=false}//2//DepID////
}//, aaSorting = new object[] { new object[] { 1, "asc" } },//???
            };
            return JSON;
        }

        public jsonArrays GetJSON_tblVehicles() {
            jsonArrays JSON = new jsonArrays();
            JSON.Data = from c in dc.tblVehicles
                        select new object[] { c.ID, c.AutoNo, c.Make, c.Model, c.Region };
            object[] Cols ={
new { FName = "ID"},//0
new { FName = "AutoNo"},//1
new { FName = "Make"},//1
new { FName = "Model"},//1
new { FName = "Region"}//1
}; JSON.Cols = Cols;
            //JSON.Config = new {
            //   Controler = "Towns", tblUpdate = "tblTowns", Msg = new { AddNew = "Naujo automobilio sukūrimas", Edit = "Autmobilio redagavimas", Delete = "Ištrinti automobilį", GenName = "Automobilis" }
            //};
            //         JSON.Grid = new {
            //            aoColumns = new object[]{
            //new {bVisible=false,bSearchable=false},//0//ID////DefaultUpdate=0
            //new {sTitle="Name",sClass="smallFont"}//1//Name//
            //}, aaSorting = new object[] { new object[] { 3, "asc" } },//???
            ////         };
            return JSON;
        }

        //-------------------------------------------------------------------------------------------------------
        //Duomenys reikalingi pildant įvairias forma
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
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Name"}//1//Name//
}, aaSorting = new object[] { new object[] { 1, "asc" } },
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
new {bVisible=false,bSearchable=false},//0//ID////
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
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Pavadinimas"}//1//Name//
}
            };
            return JSON;
        }

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
new {bVisible=false,bSearchable=false},//0//ID////
new {sTitle="Pareigybė"},//2//Position//
new {sTitle="Pavardė_Vardas"},//3//Name//
new {sTitle="Pavardė"},//4//LastName//
new {sTitle="Skyrius", bVisible=false, bSearchable=false},//5//SubDepID////
new {sTitle="E-paštas"}//8//Email//
}
            };
            return JSON;
        }

        //-------------------------------------------------------------------------------------------------------
        //????????????????????
        public jsonArrays GetJSON_UploadedFiles(string FileName) {
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