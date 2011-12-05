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

      [HttpPost]
      public JsonResult ClientsList1(int RecID) {
         Repository_Clients Rep = new Repository_Clients();
         var obj = new { proc_Clients = Rep.GetJSON_proc_Clients(null, RecID) };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult ClientsList() {
         ViewBag.Title = "Klientų sąrašas";
         string View = RenderPartialViewToString("../Shared/Grid");
         Repository_Clients Rep = new Repository_Clients();
         var obj = new {
            Render = View,
            proc_Clients = Rep.GetJSON_proc_Clients(null, null),
            tblContracts_Form = Rep.GetJSON_tblContracts_Form(),
            //tblUsers = Rep.GetJSON_tblUsers(),
            Script = new {
               //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsUsersEdit ar pan
            }
         };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult NewEventHTML() {
         string View = RenderPartialViewToString("../Clients/NewEvent");
         var obj = new { Render = View };
         return Json(obj);
      }

      [HttpPost]
      public JsonResult Clients_NewClient() {
         ViewBag.Title = "Naujas klientas";
         string View = RenderPartialViewToString("../Clients/NewClient");
         Repository_Clients Rep = new Repository_Clients();
         var obj = new {
            Render = View,
            //Script = new {
            //   File = "../Scripts/Form/Users_All_Grid.js",
            //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }
            //},
            //tblDocs_UploadedFiles = Rep.GetJSON_UploadedFiles("tblClients_Objects"),
            tblTowns = Rep.GetJSON_tblTowns(),
            tblClient1 = Rep.GetJSON_tblClient1(),
            tblUsers = Rep.GetJSON_tblUsers()
         };
         return Json(obj);
      }

      //[HttpPost]
      //public JsonResult AddNewEvent(int ClientID, string Msg, DateTime EventDate) {
      //   dbDataContext dc = new dbDataContext();
      //   tblClients_Event ce = new tblClients_Event();
      //   ce.Msg = Msg;
      //   ce.ClientID = ClientID;
      //   ce.UserID = UserData.UserID;
      //   dc.tblClients_Events.InsertOnSubmit(ce);
      //   dc.SubmitChanges();
      //   int EventID = ce.ID;
      //   tblUsersActivities_Update ua = new tblUsersActivities_Update();
      //   ua.Action = 0;
      //   ua.Date = EventDate;
      //   ua.RecordID = EventID;
      //   ua.TableID = 22;//tblClientEvents
      //   dc.tblUsersActivities_Updates.InsertOnSubmit(ua);
      //   dc.SubmitChanges();
      //   //int uaID = ua.ID;
      //   jsonArrays JSON = new jsonArrays();
      //   JSON.Data = new object[] { EventID, EventDate, UserData.UserName, Msg, 0, UserData.UserID };
      //   return Json(JSON.Data);
      //}

      [HttpPost]
      public JsonResult ClientEvents(int ClientID, bool onlyData) {
         //ViewBag.Title = "Klientų sąrašas";
         Repository_Clients Rep = new Repository_Clients();
         tblClient c = Rep.GetModel_Client(ClientID);
         string View = RenderPartialViewToString("../Clients/ClientEvents", c);
         object obj = null;
         if (onlyData) {
            obj = new {//Nereikia Render
               Render = View,
               tblClientEvents = Rep.GetJSON_tblClientEvents(ClientID),
            };
         }
         else {
            obj = new {
               Render = View,
               tblClient_prop = Rep.GetJSON_tblClient_prop(),
               tblClientEvents = Rep.GetJSON_tblClientEvents(ClientID),
               tblContracts_Form = Rep.GetJSON_tblContracts_Form(),
               //tblUsers = Rep.GetJSON_tblUsers(),
               //tblTowns = Rep.GetJSON_tblTowns(),
               //Script = new {
               //   //File = "../Scripts/Form/Docs_Contracts_Grid.js",
               //   oSCRIPT = new { Editable = UserData.HasRole("UsersEdit") }//TODO:Pakeisti role i DocsUsersEdit ar pan
               //}
            };
         }
         return Json(obj);
      }
   }
}