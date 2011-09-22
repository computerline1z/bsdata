using System.Web.Mvc;
using BSData.Classes;
using BSData.Models;

namespace BSData.Controllers {

   public class ClientsController : ToStringController {

      [OutputCache(Duration = 80)]
      public ActionResult Start() {
         ViewBag.Title = "Klientai";
         clsAction_MenuItems ViewModel = Repository_Actions.GetAllItems(ViewBag.Title);
         return View("../Shared/Start", ViewModel);
      }

      //[HttpPost]
      //public JsonResult GetAccident(int? AccidentNo)//GetAccidentLists()//Naudoja AccidentsCard
      //{
      //   Repository_Users AccRep = new Repository_Users();
      //   string View = ""; int AccNo = (AccidentNo.HasValue) ? AccidentNo.Value : 0;
      //   clsAccident a = new clsAccident(AccNo);
      //   View = RenderPartialViewToString("Card", a);
      //   return Json(new {
      //      //Render - pirmas, ExecFn - paskutinis
      //      Render = new { tabAccidents = View },
      //      tblAccidentsTypes = AccRep.GetJSON_tblAccidentTypes(),
      //      proc_Drivers = AccRep.GetJSON_proc_Drivers(false),
      //      ExecFn = new { tabAccidents = "tabs" }
      //   });
      //}

      //[HttpPost]
      //public JsonResult AccidentsList() {
      //   Repositories_Accidents acc = new Repositories_Accidents();
      //   return Json(new {
      //      proc_Accidents = acc.GetJSON_proc_Accidents(),
      //   });
      //}
   }
}