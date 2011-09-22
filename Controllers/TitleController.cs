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

      //[HttpPost]
      //public JsonResult MyEvents(int? Par)//GetAccidentLists()//Naudoja AccidentsCard
      //{
      //   //Repository_Users AccRep = new Repository_Users();
      //   //string View = ""; int AccNo = (AccidentNo.HasValue) ? AccidentNo.Value : 0;
      //   //clsAccident a = new clsAccident(AccNo);
      //   //View = RenderPartialViewToString("Card", a);
      //   //return Json(new {
      //   //   //Render - pirmas, ExecFn - paskutinis
      //   //   Render = new { tabAccidents = View },
      //   //   tblAccidentsTypes = AccRep.GetJSON_tblAccidentTypes(),
      //   //   proc_Drivers = AccRep.GetJSON_proc_Drivers(false),
      //   //   ExecFn = new { tabAccidents = "tabs" }
      //   //});
      //   return Json("MyEvents");
      //}

      [HttpPost]
      public JsonResult Rekvizits(int? Par) {
         string View = RenderPartialViewToString("Rekvizits");
         return Json(new { Render = View, Script = new { File = "../Scripts/Final/Proba.js", Pars = "" } });//}
      }

      //[HttpPost]
      //public JsonResult AccidentsList() {
      //   Repositories_Accidents acc = new Repositories_Accidents();
      //   return Json(new {
      //      proc_Accidents = acc.GetJSON_proc_Accidents(),
      //   });
      //}
   }
}