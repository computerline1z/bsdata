using System.Web.Mvc;
using BSData.Classes;
using BSData.Models;

namespace BSData.Controllers {

   public class ContractsController : ToStringController {

      [OutputCache(Duration = 80)]
      public ActionResult Start() {
         ViewBag.Title = "Sutartys";
         clsAction_MenuItems ViewModel = Repository_Actions.GetAllItems(ViewBag.Title);
         return View("../Shared/Start", ViewModel);
      }

      [HttpPost]
      public JsonResult Contracts_NewNo() {
         ViewBag.Title = "Naujo sutarties numerio sukūrimas";
         string View = RenderPartialViewToString("../Contracts/NewNo");
         Repository_Contracts Rep = new Repository_Contracts();
         var obj = new {
            Render = View,
            //Script = new {
            //   File = "../Scripts/Form/Users_All_Grid.js",
            //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            //},
            tblContractTypes = Rep.GetJSON_tblContracts_Types(),
            tblUsers = Rep.GetJSON_tblUsers()
            //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts"),
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_EditNew(string No, int? NewId) {
         object obj = null;
         if (NewId.HasValue) {
            Repository_Contracts Rep = new Repository_Contracts();
            ViewBag.Title = "Sutarties Nr.: " + No + " duomenų pildymas";
            string View = RenderPartialViewToString("../Contracts/Edit", Rep.GetContract(NewId.Value));
            if ((string)TempData["Contracts_EditNew"] == Session.SessionID) {
               obj = new {
                  Render = View,
                  //Script = new {
                  //   File = "../Scripts/Form/Users_All_Grid.js",
                  //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
                  //},
                  //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts"),
               };
            }
            else {
               obj = new {
                  Render = View,
                  tblContractTypes = Rep.GetJSON_tblContracts_Types(),
                  tblContract1 = Rep.GetJSON_tblContract1(), //Userius jau padavem Contracts_NewNo
                  tblClients = Rep.GetJSON_tblClients(),
                  tblClient_object1 = Rep.GetJSON_tblClient_object1(),
                  tblUsers_SubDep = Rep.GetJSON_tblUsers_SubDep(),
                  tblVehicles = Rep.GetJSON_tblVehicles(),
                  tblTowns = Rep.GetJSON_tblTowns()
                  //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts"),
               };
               TempData["Contracts_EditNew"] = Session.SessionID;
            }
         }
         else {
            string View = "<h1 id='introduction'>Nėra pasirinkta sutartis kuriai reikia pridėti duomenis</h1>";
            View += "<div>Nėra arba nepasirinktas sutarties numeris kuriam reikia pridėti duomenis</div>";
            View += "<div>Sukurkite sutarties numerį pasirinkdami meniu dešinėje <h4>Sukurti numerį</h4> arba pasirinkite sutartį kuriai bus pridedami duomenys meniu <h4>Nebaigtos tvarkyti</h4></div>";
            obj = new { Render = View };
         }
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_MyNotFinished() {
         ViewBag.Title = "Sutartys kurioms nesuvesti visi duomenys";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Contracts Rep = new Repository_Contracts();
         var obj = new {
            Render = View,
            //Script = new {
            //   File = "../Scripts/Form/Users_All_Grid.js",
            //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            //},
            tblContracts_MyNotFinished = Rep.GetJSON_proc_GetContracts(1, UserData.UserID, null)
         };
         return Json(obj);
      }
   }
}