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
      public JsonResult Contracts_New_Other() {
         ViewBag.Title = "Naujos sutarties įvedimas kitoms paslaugoms - ne saugomas objektas";
         string View = RenderPartialViewToString("../Docs/NewContract_Other");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            //Script = new {
            //   File = "../Scripts/Form/Users_All_Grid.js",
            //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            //},
            tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts"),
            //tblTowns = Rep.GetJSON_tblTowns(), - pareina is Contracts_New_Object
            ////////tblClients = Rep.GetJSON_tblClients(),
            tblContracts1_Other = Rep.GetJSON_tblContracts1_Other(),
            //tblContracts_Form = Rep.GetJSON_tblContracts_Form(),
            //tblUsers = Rep.GetJSON_tblUsers(), - pareina is Contracts_New_Object
            tblUsers_SubDep = Rep.GetJSON_tblUsers_SubDep()
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_New_Object() {
         ViewBag.Title = "Naujos sutarties įvedimas saugomam objektui";
         string View = RenderPartialViewToString("../Docs/NewContract_Object");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            //Script = new {
            //   File = "../Scripts/Form/Users_All_Grid.js",
            //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            //},
            //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblClients_Objects"),
            tblTowns = Rep.GetJSON_tblTowns(),
            tblClients = Rep.GetJSON_tblClients(),
            tblContracts1_Object = Rep.GetJSON_tblContracts1_Object(),
            tblContracts_Form = Rep.GetJSON_tblContracts_Form(),//Reikalinga listu grupavimui
            tblUsers = Rep.GetJSON_tblUsers()
            //tblUsers_SubDep = Rep.GetJSON_tblUsers_SubDep()
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
            Contracts_Unsigned = Rep.GetJSON_tblContracts_Unsigned(),
            tblUsers_Status = Rep.GetJSON_tblUsers_Status(),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Other() {
         ViewBag.Title = "Galiojančių kt. paslaugų (ne apsaugos) sutarčių sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Other = Rep.GetJSON_tblContracts_Other(true),//Tik galiojancios ir pasirasytos
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Objects() {
         ViewBag.Title = "Galiojančių apsaugos sutarčių sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Objects = Rep.GetJSON_tblContracts_Objects(true),//Tik galiojancios ir pasirasytos
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Expired() {//Tik kitų sutarčių
         ViewBag.Title = "Negaliojančių kt. paslaugų sutarčių sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Expired = Rep.GetJSON_tblContracts_Other(false),//Negaliojancios bet pasirasytos
            //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts"),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Contracts_Objects_Expired() {//Objektų, bet nepabaigtas ir nenaudojamas
         ViewBag.Title = "Negaliojančių objektų sutarčių sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Docs Rep = new Repository_Docs();
         var obj = new {
            Render = View,
            Contracts_Expired = Rep.GetJSON_tblContracts_Other(false),//Negaliojancios bet pasirasytos
            //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblContracts"),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsEdit ar pan
            }
         };
         return Json(obj);
      }
   }
}