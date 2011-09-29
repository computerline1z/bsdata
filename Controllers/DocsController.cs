using System.Web.Mvc;
using BSData.Classes;
using BSData.Models;

namespace BSData.Controllers {

   public class DocsController : ToStringController {

      [OutputCache(Duration = 80)]
      public ActionResult Start() {
         ViewBag.Title = "Dokumentai";
         clsAction_MenuItems ViewModel = Repository_Actions.GetAllItems(ViewBag.Title);
         return View("../Shared/Start", ViewModel);
      }

      [HttpPost]
      public JsonResult Contracts_New() {
         ViewBag.Title = "Naujos sutarties įvedimas";
         string View = RenderPartialViewToString("../Docs/NewContract");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            //Script = new {
            //   File = "../Scripts/Form/Users_All_Grid.js",
            //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            //},
            tblDocs_UploadedFiles = Rep.GetJSON_tblDocs_UploadedFiles("tblContracts"),
            tblTowns = Rep.GetJSON_tblTowns(),
            tblClients = Rep.GetJSON_tblClients(),
            tblContracts1 = Rep.GetJSON_tblContracts1(),
            tblContracts_Form = Rep.GetJSON_tblContracts_Form(),
            tblUsers = Rep.GetJSON_tblUsers(),
            tblUsers_SubDep = Rep.GetJSON_tblUsers_SubDep()
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Unsigned() {
         ViewBag.Title = "Nepasirašytos sutartys";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Unsigned = Rep.GetJSON_tblContracts_NotApproved(),//Galiojancios(arba be datos) ir nepasirasytos
            tblDocs_UploadedFiles = Rep.GetJSON_tblDocs_UploadedFiles("tblContracts"),
            tblUsers_Status = Rep.GetJSON_tblUsers_Status(),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Valid() {
         ViewBag.Title = "Galiojančių sutarčių sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Valid = Rep.GetJSON_tblContracts_Approved(true),//Tik galiojancios ir pasirasytos
            tblDocs_UploadedFiles = Rep.GetJSON_tblDocs_UploadedFiles("tblContracts"),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Expired() {
         ViewBag.Title = "Negaliojančių sutarčių sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Expired = Rep.GetJSON_tblContracts_Approved(false),//Negaliojancios bet pasirasytos
            tblDocs_UploadedFiles = Rep.GetJSON_tblDocs_UploadedFiles("tblContracts"),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }
   }
}