using System.Web.Mvc;
using BSData.Models;

namespace BSData.Classes {

   public class FilesController : Controller {

      // [HttpPost]
      public JsonResult AsyncUpload() {
         UploadedFilePars Pars = new UploadedFilePars(Request);
         Repositories_Files FilesRep = new Repositories_Files();
         return Json(FilesRep.SaveUploadedFile(Pars));
      }

      public ActionResult Download(int id) {//FileId
         Repositories_Files FilesRep = new Repositories_Files();
         return FilesRep.GetUploadedFile(id);
      }

      [HttpPost]
      public JsonResult GetUploads(string FileName, int RecordID) {
         Repository_Uploads Rep = new Repository_Uploads();
         var obj = new { Files = Rep.GetJSON_UploadedFiles1(FileName, RecordID) };
         return Json(obj);
      }
   }
}