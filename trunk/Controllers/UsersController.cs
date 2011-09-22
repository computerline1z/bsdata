using System.Web.Mvc;
using BSData.Classes;
using BSData.Models;

namespace BSData.Controllers {

   public class UsersController : ToStringController {

      [OutputCache(Duration = 80)]
      public ActionResult Start() {
         ViewBag.Title = "Darbuotojai";
         clsAction_MenuItems ViewModel = Repository_Actions.GetAllItems(ViewBag.Title);
         return View("../Shared/Start", ViewModel);
      }

      [HttpPost]
      public JsonResult All_Grid(int? Par) {
         ViewBag.Title = "Visų darbuotojų sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Users UsrRep = new Repository_Users();
         //return Json(new { Render = View, Script = "../Scripts/Final/Proba.js" });//dt_Users_grouping
         var obj = new {
            Render = View,
            Script = new {
               File = "../Scripts/Form/Users_All_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            },
            tblUsers = UsrRep.GetJSON_tblUsers(),
            tblUsers_Dep = UsrRep.GetJSON_tblUsers_Dep(),
            tblUsers_SubDep = UsrRep.GetJSON_tblUsers_SubDep(),
            tblUsers_Status = UsrRep.GetJSON_tblUsers_Status()
         };
         return Json(obj);
      }
   }
}