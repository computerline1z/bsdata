using System.Web.Mvc;
using BSData.Classes;
using BSData.Models;

namespace BSData.Controllers {

   public class TitleController : ToStringController {

      // [HttpPost]
      [OutputCache(Duration = 80)]
      public ActionResult Start() {
         ViewBag.Title = "Titulinis";
         clsAction_MenuItems ViewModel = Repository_Actions.GetAllItems(ViewBag.Title);
         return View("../Shared/Start", ViewModel);
      }

      [HttpPost]
      public JsonResult MyEvents() {
         ViewBag.Title = "Įvykiai";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Title Rep = new Repository_Title();
         var obj = new {
            Render = View,
            Contracts_Unsigned = Rep.GetJSON_tblContracts_NotApproved(),
            tblContracts_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts", null),//tblDocs_UploadedFiles
            tblContracts_Form = Rep.GetJSON_tblContracts_Form(),
            tblUsers = Rep.GetJSON_tblUsers(),

            tblClientEventsNew = Rep.GetJSON_ClientEventsNew(14),
            tblNewClientEvents_UploadedFiles = Rep.GetJSON_UploadedFiles("tblClients_Events", 14),

            //GetJSON_UploadedFiles
            //tblUsers_Status = Rep.GetJSON_tblUsers_Status(),
            Script = new {
               //File = "../Scripts/Form/Title_MyEvents.js",
               //oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Rekvizits(int? Par) {
         string View = RenderPartialViewToString("Rekvizits");
         return Json(new { Render = View, Script = new { File = "../Scripts/Final/Proba.js", Pars = "" } });//}
      }
   }
}