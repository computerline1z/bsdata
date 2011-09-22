using System.Collections.Generic;
using System.Linq;
using BSData.Classes;

namespace BSData.Models {

   public class clsAction_MenuItems {

      public IQueryable<Action_Tab> Tabs { get; set; }

      public IQueryable<Action_MenuGroup> MenuGroups { get; set; }

      public IQueryable<Action_Menu> Menus { get; set; }
   }

   //public class clsAction_ItemsInTab {
   //   public IQueryable<Action_MenuGroup> MenuGroups { get; set; }

   //   public IQueryable<Action_Menu> Menus { get; set; }
   //}

   public class Action_Tab {

      public int ID { get; set; }

      public string Name { get; set; }

      public string Controller { get; set; }
   }

   public class Action_MenuGroup {

      public int ID { get; set; }

      public int TabID { get; set; }

      public string Name { get; set; }
   }

   public class Action_Menu {

      public int ID { get; set; }

      public int GroupID { get; set; }

      public string Name { get; set; }

      public string Action { get; set; }

      public int OrderNo { get; set; }
   }

   public static class Repository_Actions {

      public static clsAction_MenuItems GetAllItems(string SelectedTab) {
         dbDataContext dc = new dbDataContext();
         List<int> RoleIDs = UserData.RoleIDs;
         clsAction_MenuItems mi = new clsAction_MenuItems();
         mi.Tabs = (from t in dc.tblAction_Tabs where RoleIDs.Contains(t.RoleID) orderby t.OrderNo select new Action_Tab {
            ID = t.ID, Name = t.Name, Controller = t.Controller
         }).AsQueryable();
         int TabID = (from t in mi.Tabs where t.Name == SelectedTab select t.ID).SingleOrDefault();
         //MenuGroupes, kurios priskirtos Rolems ir yra tame Tabe
         mi.MenuGroups = (from t in dc.tblAction_MenuGroups where RoleIDs.Contains(t.RoleID) && t.TabID == TabID orderby t.OrderNo select new Action_MenuGroup {
            ID = t.ID, Name = t.Name, TabID = t.TabID
         }).AsQueryable();
         //Menu, kurie yra MenuGroups
         mi.Menus = (from t in dc.tblAction_Menus join g in dc.tblAction_MenuGroups on t.GroupID equals g.ID orderby t.OrderNo select new Action_Menu {
            ID = t.ID, Name = t.Name, GroupID = t.GroupID, Action = t.Action, OrderNo = t.OrderNo
         }).AsQueryable();
         return mi;
      }
   }
}