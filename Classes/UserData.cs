using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using BSData.Models;

namespace BSData.Classes {

   public static class UserData {

      public static void CheckIt() {
         if (HttpContext.Current.Session["UserData_LoginName"] != null) return;
         else SetParameters();
      }

      public static void SetParameters() {
         //BSData.Providers.CCMemProvider CCP = new BSData.Providers.CCMemProvider();
         using (dbDataContext db = new dbDataContext(ConfigurationManager.ConnectionStrings["BSConStr"].ConnectionString)) {
            var u = (from l in db.tblUsers
                     where l.Email == HttpContext.Current.User.Identity.Name
                     select l).SingleOrDefault();
            if (u != null) {
               //IQueryable<tblUsers_Role> tblRoles = (from Ur in db.tblUsers_InRoles join
               //                     r in db.tblUsers_Roles on Ur.RoleID equals r.ID
               //                                   where Ur.UserID == u.ID select r).AsQueryable();
               //IQueryable<string> roles = (from Ur in db.tblUsers_InRoles join
               //                     r in db.tblUsers_Roles on Ur.RoleID equals r.ID
               //                            where Ur.UserID == u.ID select r.Name).Union(new string[] { "basic" }).AsQueryable();
               //IQueryable<int> roleIDs = (from Ur in db.tblUsers_InRoles join
               //                     r in db.tblUsers_Roles on Ur.RoleID equals r.ID
               //                           where Ur.UserID == u.ID select r.ID).Union(new int[] { 0 }).AsQueryable();
               List<string> roles = (from Ur in db.tblUsers_InRoles join
                                    r in db.tblUsers_Roles on Ur.RoleID equals r.ID
                                     where Ur.UserID == u.ID select r.Name).ToList();
               List<int> roleIDs = (from Ur in db.tblUsers_InRoles join
                                    r in db.tblUsers_Roles on Ur.RoleID equals r.ID
                                    where Ur.UserID == u.ID select r.ID).ToList();
               roles.Add("basic");
               roleIDs.Add(0);
               //IQueryable<string> roles1 = roles.Concat(new string[] { "basic" });
               //IQueryable<int> roleIDs1 = roleIDs.Concat(new int[] { 0 });
               SetParameters(u, roles, roleIDs);
            }
            else {
               throw new Exception("Nerastas toks useris - " + HttpContext.Current.User.Identity.Name);
            }
         }
      }

      public static void SetParameters(tblUser U, List<string> roles, List<int> roleIDs) {
         UserName = U.Name + " " + U.LastName;
         UserID = U.ID;
         Roles = roles;
         RoleIDs = roleIDs;
         Email = U.Email;
      }

      //public static void UpdateUser(string firstName, string surname, string email, int accountID, int languageID, string roleNames) {
      //   using (dbDataContext db = new dbDataContext(ConfigurationManager.ConnectionStrings["BSConStr"].ConnectionString)) {
      //      int? userId = null;
      //      int rzlt = db.proc_Update_Edit_tblUsers(ref userId, firstName, surname, email, accountID, languageID, roleNames);
      //   }
      //}

      public static string UserName {
         get { CheckIt(); return (string)HttpContext.Current.Session["UserData_UserName"]; }
         set { HttpContext.Current.Session["UserData_UserName"] = value; }
      }

      public static Int32 UserID {
         get { CheckIt(); return (Int32)HttpContext.Current.Session["UserData_UserID"]; }
         set { HttpContext.Current.Session["UserData_UserID"] = value; }
      }

      public static List<string> Roles {
         get { CheckIt(); return (List<string>)HttpContext.Current.Session["UserData_Roles"]; }
         set { HttpContext.Current.Session["UserData_Roles"] = value; }
      }

      public static Boolean HasRole(string RoleName) {
         return Roles.Any(r => r.Contains(RoleName));
      }

      public static List<int> RoleIDs {
         get { CheckIt(); return (List<int>)HttpContext.Current.Session["UserData_RoleIDs"]; }
         set { HttpContext.Current.Session["UserData_RoleIDs"] = value; }
      }

      public static string Email {
         get { CheckIt(); return (string)HttpContext.Current.Session["UserData_Email"]; }
         set { HttpContext.Current.Session["UserData_Email"] = value; }
      }
   }
}