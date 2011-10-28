using System;
using System.Web.Mvc;
using BSData.Classes;
using CC.Models;

namespace CC.Controllers {

   //[Authorize]
   public class UpdateController : Controller {

      [HttpPost]
      public JsonResult Add(string[] Data, string[] Fields, string DataTable, string Ext, DateTime? Date) {
         Repositories_Update UpdateRep = new Repositories_Update();
         return Json(UpdateRep.AddNew(Data, Fields, DataTable, Ext, Date));
      }

      [HttpPost]
      public JsonResult Edit(Int32 id, string[] Data, string[] Fields, string DataTable, string Ext) {
         Repositories_Update UpdateRep = new Repositories_Update();
         return Json(UpdateRep.Edit(id, Data, Fields, DataTable, Ext));
      }

      [HttpPost]
      public JsonResult Delete(Int32 id, string DataTable, string Ext) {
         Repositories_Update UpdateRep = new Repositories_Update();
         return Json(UpdateRep.Delete(id, DataTable, Ext));
      }

      [HttpPost]
      public JsonResult EditInPlace(string id, string tbl, string update_value, string field, string show_value) {
         Repositories_Update UpdateRep = new Repositories_Update();
         jsonResponse resp = new jsonResponse();
         try {
            resp = UpdateRep.Edit(Convert.ToInt32(id), new string[] { update_value }, new string[] { field }, tbl, "");
         }
         catch (Exception e) {
            //MyEvents.log();
            resp.ErrorMsg = "Klaida:" + e.Message;
         }
         if (show_value != null && show_value != "null" && show_value.Trim() != "" && show_value != "undefined") resp.ResponseMsg = show_value;
         else resp.ResponseMsg = update_value;
         return Json(resp);
      }
   }
}