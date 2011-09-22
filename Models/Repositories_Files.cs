using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using CC.Models;

namespace BSData.Models {

   public class UploadedFilePars {

      public UploadedFilePars(System.Web.HttpRequestBase Request) {
         this.tblUpdate = Request.Params["tblUpdate"];
         this.RecId = Convert.ToInt32(Request.Params["RecId"]);
         this.UserId = Convert.ToInt32(Request.Params["UserId"]);
         this.fileBase = Request.Files[0];
         this.FileName = this.fileBase.FileName;
         this.SizeKB = this.fileBase.ContentLength / 1000;
      }

      public string tblUpdate { get; set; }

      public int RecId { get; set; }

      public int UserId { get; set; }

      public string FileName { get; set; }

      public HttpPostedFileBase fileBase { get; set; }

      public int SizeKB { get; set; }
   }

   public class UploadResult {

      public UploadResult() { _FileId = 0; _Msg = ""; }

      public void SetVal(int FileId, string User, string Date) { _FileId = FileId; _User = User; _Date = Date; }

      public object GetVal() { return new { FileId = _FileId, User = _User, Date = _Date }; }

      public int _FileId { get; set; }

      public string _User { get; set; }

      public string _Date { get; set; }

      public string _Msg { get; set; }
   }

   public class Repositories_Files {
      private string _uploadsFolder = HostingEnvironment.MapPath(ConfigurationManager.AppSettings["Uploads"]);

      private string GetDiskLocation(int FileId) {
         return Path.Combine(_uploadsFolder, FileId.ToString());
      }

      public object SaveUploadedFile(UploadedFilePars Pars) {
         //var identifier = Guid.NewGuid();
         Repositories_Update UpdateRep = new Repositories_Update();
         UploadResult ur = (UpdateRep.InsertFilePars(Pars));
         if (ur._FileId > 0) { Pars.fileBase.SaveAs(GetDiskLocation(ur._FileId)); }
         //fileBase.SaveAs(GetDiskLocation(identifier));
         return ur.GetVal();//kad padarytu normalu json
      }

      public ActionResult GetUploadedFile(int FileId) {
         return new DownloadResult(FileId);
      }

      //public ActionResult Download(int FileId) {
      //   return new DownloadResult(FileId) { VirtualPath = "~/content/site.css", FileDownloadName = "TheSiteCss.css" };
      //}
      public class DownloadResult : ActionResult {

         public DownloadResult(int FileId) {
            dbDataContext dc = new dbDataContext();
            tblDocs_UploadedFile df = (from f in dc.tblDocs_UploadedFiles where f.ID == FileId select f).SingleOrDefault() ?? null;
            this.VirtualPath = Path.Combine(ConfigurationManager.AppSettings["Uploads"], FileId.ToString());
            this.FileDownloadName = df.FileName;
         }

         //public DownloadResult(string virtualPath) {
         //   this.VirtualPath = virtualPath;
         //}
         public string VirtualPath { get; set; }

         public string FileDownloadName { get; set; }

         public override void ExecuteResult(ControllerContext context) {
            if (!String.IsNullOrEmpty(FileDownloadName)) {
               context.HttpContext.Response.AddHeader("content-disposition",
                 "attachment; filename=" + this.FileDownloadName);
            }
            string filePath = context.HttpContext.Server.MapPath(this.VirtualPath);
            context.HttpContext.Response.TransmitFile(filePath);
         }
      }
   }
}